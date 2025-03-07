
import { useState } from "react";
import { toast } from "sonner";
import { WishlistItem, BankDetail } from "./types";
import { v4 as uuidv4 } from "uuid";

// Sample initial wishlist items
const initialWishlistItems: WishlistItem[] = [
  {
    id: "1",
    name: "Dinner Set",
    price: "₦45,000",
    link: "https://example.com/dinner-set",
    priority: "high"
  },
  {
    id: "2",
    name: "Blender",
    price: "₦25,000",
    link: "https://example.com/blender",
    priority: "medium"
  },
  {
    id: "3",
    name: "Bedding Set",
    price: "₦60,000",
    link: "https://example.com/bedding",
    priority: "medium"
  }
];

// Sample initial bank details
const initialBankDetails: BankDetail[] = [
  {
    bankName: "GTBank",
    accountName: "John & Jane Doe",
    accountNumber: "0123456789",
    sortCode: "123456",
    description: "Wedding gift contributions"
  }
];

export const useWishlist = () => {
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>(initialWishlistItems);
  const [bankDetails, setBankDetails] = useState<BankDetail[]>(initialBankDetails);

  const addWishlistItem = (item: Omit<WishlistItem, "id">) => {
    const newItem: WishlistItem = {
      id: uuidv4(),
      ...item
    };
    setWishlistItems([...wishlistItems, newItem]);
    toast.success("Item added to wishlist!");
  };

  const addBankDetail = (detail: BankDetail) => {
    setBankDetails([...bankDetails, detail]);
    toast.success("Bank details added successfully!");
  };

  const markItemAsPurchased = (itemId: string, purchaserName: string) => {
    setWishlistItems(
      wishlistItems.map(item => 
        item.id === itemId 
          ? { ...item, purchasedBy: purchaserName }
          : item
      )
    );
    toast.success("Item marked as purchased!");
  };

  const removeItemPurchaser = (itemId: string) => {
    setWishlistItems(
      wishlistItems.map(item => 
        item.id === itemId 
          ? { ...item, purchasedBy: undefined }
          : item
      )
    );
    toast.success("Item marked as available again!");
  };

  const removeBankDetail = (index: number) => {
    const newDetails = [...bankDetails];
    newDetails.splice(index, 1);
    setBankDetails(newDetails);
    toast.success("Bank details removed!");
  };

  return {
    wishlistItems,
    bankDetails,
    addWishlistItem,
    addBankDetail,
    markItemAsPurchased,
    removeItemPurchaser,
    removeBankDetail
  };
};

// Type for the useWishlist hook return value
export interface WishlistContextType {
  wishlistItems: WishlistItem[];
  bankDetails: BankDetail[];
  addWishlistItem: (item: Omit<WishlistItem, "id">) => void;
  addBankDetail: (detail: BankDetail) => void;
  markItemAsPurchased: (itemId: string, purchaserName: string) => void;
  removeItemPurchaser: (itemId: string) => void;
  removeBankDetail: (index: number) => void;
}
