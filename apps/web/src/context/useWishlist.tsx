import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { WishlistItem, BankDetail } from "./types";
import storyService from "@/services/api/storyService";
import { useAuth } from "@/context/AuthContext";

// Type for the useWishlist hook return value
export interface WishlistHook {
  wishlistItems: WishlistItem[];
  bankDetails: BankDetail[];
  addWishlistItem: (item: Omit<WishlistItem, "id">) => void;
  addBankDetail: (detail: BankDetail) => void;
  markItemAsPurchased: (itemId: string, purchaserName: string, isAnonymous?: boolean) => void;
  removeItemPurchaser: (itemId: string) => void;
  removeBankDetail: (id: string) => void;
  updateBankDetail?: (id: string, detail: BankDetail) => void;
}

export const useWishlist = (): WishlistHook => {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [bankDetails, setBankDetails] = useState<BankDetail[]>([]);

  const fetchWishlistData = useCallback(async () => {
    try {
      const [items, banks] = await Promise.all([
        storyService.listWishlist(),
        storyService.listBankDetails(),
      ]);

      setWishlistItems(
        items.map((item) => ({
          id: item.id,
          name: item.name,
          price: item.price || undefined,
          link: item.link || undefined,
          imageUrl: item.image_url || undefined,
          priority: item.priority,
          purchasedBy: item.purchased_by || undefined,
          isAnonymous: item.is_anonymous || undefined,
        }))
      );

      setBankDetails(
        banks.map((detail) => ({
          id: detail.id,
          bankName: detail.bank_name,
          accountName: detail.account_name,
          accountNumber: detail.account_number,
          sortCode: detail.sort_code || undefined,
          iban: detail.iban || undefined,
          swift: detail.swift || undefined,
          description: detail.description || undefined,
        }))
      );
    } catch (error) {
      console.error("Failed to load registry data:", error);
    }
  }, []);

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) {
      setWishlistItems([]);
      setBankDetails([]);
      return;
    }

    fetchWishlistData();
  }, [fetchWishlistData, authLoading, isAuthenticated]);

  const addWishlistItem = (item: Omit<WishlistItem, "id">) => {
    const saveItem = async () => {
      try {
        const created = await storyService.addWishlistItem({
          name: item.name,
          price: item.price,
          link: item.link,
          image_url: item.imageUrl,
          priority: item.priority,
        });
        setWishlistItems((prev) => [
          ...prev,
          {
            id: created.id,
            name: created.name,
            price: created.price || undefined,
            link: created.link || undefined,
            imageUrl: created.image_url || undefined,
            priority: created.priority,
            purchasedBy: created.purchased_by || undefined,
            isAnonymous: created.is_anonymous || undefined,
          },
        ]);
        toast.success("Item added to wishlist!");
      } catch (error) {
        toast.error("Failed to add wishlist item");
        console.error("Failed to add wishlist item:", error);
      }
    };

    void saveItem();
  };

  const addBankDetail = (detail: BankDetail) => {
    const saveDetail = async () => {
      try {
        const created = await storyService.addBankDetail({
          bank_name: detail.bankName,
          account_name: detail.accountName,
          account_number: detail.accountNumber,
          sort_code: detail.sortCode,
          iban: detail.iban,
          swift: detail.swift,
          description: detail.description,
        });
        setBankDetails((prev) => [
          ...prev,
          {
            id: created.id,
            bankName: created.bank_name,
            accountName: created.account_name,
            accountNumber: created.account_number,
            sortCode: created.sort_code || undefined,
            iban: created.iban || undefined,
            swift: created.swift || undefined,
            description: created.description || undefined,
          },
        ]);
        toast.success("Bank details added successfully!");
      } catch (error) {
        toast.error("Failed to add bank details");
        console.error("Failed to add bank details:", error);
      }
    };

    void saveDetail();
  };

  const markItemAsPurchased = (itemId: string, purchaserName: string, isAnonymous: boolean = false) => {
    const updateItem = async () => {
      try {
        const updated = await storyService.updateWishlistItem(itemId, {
          purchased_by: purchaserName,
          is_anonymous: isAnonymous,
        });
        setWishlistItems((prev) =>
          prev.map((item) =>
            item.id === itemId
              ? {
                  ...item,
                  purchasedBy: updated.purchased_by || undefined,
                  isAnonymous: updated.is_anonymous || undefined,
                }
              : item
          )
        );
        toast.success("Item marked as purchased!");
      } catch (error) {
        toast.error("Failed to update wishlist item");
        console.error("Failed to update wishlist item:", error);
      }
    };

    void updateItem();
  };

  const removeItemPurchaser = (itemId: string) => {
    const updateItem = async () => {
      try {
        const updated = await storyService.updateWishlistItem(itemId, {
          purchased_by: null,
          is_anonymous: false,
        });
        setWishlistItems((prev) =>
          prev.map((item) =>
            item.id === itemId
              ? {
                  ...item,
                  purchasedBy: updated.purchased_by || undefined,
                  isAnonymous: updated.is_anonymous || undefined,
                }
              : item
          )
        );
        toast.success("Item marked as available again!");
      } catch (error) {
        toast.error("Failed to update wishlist item");
        console.error("Failed to update wishlist item:", error);
      }
    };

    void updateItem();
  };

  const removeBankDetail = (id: string) => {
    const deleteDetail = async () => {
      try {
        await storyService.deleteBankDetail(id);
        setBankDetails((prev) => prev.filter((detail) => detail.id !== id));
        toast.success("Bank details removed!");
      } catch (error) {
        toast.error("Failed to remove bank details");
        console.error("Failed to remove bank details:", error);
      }
    };

    void deleteDetail();
  };

  const updateBankDetail = (id: string, detail: BankDetail) => {
    const saveDetail = async () => {
      try {
        const updated = await storyService.updateBankDetail(id, {
          bank_name: detail.bankName,
          account_name: detail.accountName,
          account_number: detail.accountNumber,
          sort_code: detail.sortCode,
          iban: detail.iban,
          swift: detail.swift,
          description: detail.description,
        });
        setBankDetails((prev) =>
          prev.map((item) =>
            item.id === id
              ? {
                  id: updated.id,
                  bankName: updated.bank_name,
                  accountName: updated.account_name,
                  accountNumber: updated.account_number,
                  sortCode: updated.sort_code || undefined,
                  iban: updated.iban || undefined,
                  swift: updated.swift || undefined,
                  description: updated.description || undefined,
                }
              : item
          )
        );
        toast.success("Bank details updated!");
      } catch (error) {
        toast.error("Failed to update bank details");
        console.error("Failed to update bank details:", error);
      }
    };

    void saveDetail();
  };

  return {
    wishlistItems,
    bankDetails,
    addWishlistItem,
    addBankDetail,
    markItemAsPurchased,
    removeItemPurchaser,
    removeBankDetail,
    updateBankDetail,
  };
};
