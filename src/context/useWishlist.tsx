
import { useState } from "react";
import { WishlistItem } from "./types";
import { toast } from "sonner";

// Initial data
const initialWishlistItems: WishlistItem[] = [
  {
    id: "wish-1",
    name: "KitchenAid Stand Mixer",
    price: "$350",
    priority: "high",
    link: "https://www.kitchenaid.com"
  },
  {
    id: "wish-2",
    name: "Honeymoon Fund Contribution",
    priority: "high"
  },
  {
    id: "wish-3",
    name: "Dyson Vacuum Cleaner",
    price: "$400",
    priority: "medium"
  }
];

export interface WishlistHook {
  wishlistItems: WishlistItem[];
  addWishlistItem: (item: Omit<WishlistItem, "id">) => void;
  markItemAsPurchased: (itemId: string, purchaserName: string) => void;
  removeItemPurchaser: (itemId: string) => void;
}

export const useWishlist = (): WishlistHook => {
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>(initialWishlistItems);

  const addWishlistItem = (item: Omit<WishlistItem, "id">) => {
    const newItem: WishlistItem = {
      ...item,
      id: `wish-${Date.now()}`
    };
    setWishlistItems([...wishlistItems, newItem]);
    toast.success("Item added to wishlist!");
  };

  const markItemAsPurchased = (itemId: string, purchaserName: string) => {
    setWishlistItems(
      wishlistItems.map(item =>
        item.id === itemId
          ? { ...item, purchasedBy: purchaserName }
          : item
      )
    );
    
    const itemName = wishlistItems.find(item => item.id === itemId)?.name;
    toast.success(`Thank you for getting the ${itemName}!`, {
      description: "Your selection has been saved"
    });
  };

  const removeItemPurchaser = (itemId: string) => {
    setWishlistItems(
      wishlistItems.map(item =>
        item.id === itemId
          ? { ...item, purchasedBy: undefined }
          : item
      )
    );
    
    const itemName = wishlistItems.find(item => item.id === itemId)?.name;
    toast.success(`Selection removed`, {
      description: `${itemName} is now available again`
    });
  };

  return {
    wishlistItems,
    addWishlistItem,
    markItemAsPurchased,
    removeItemPurchaser
  };
};
