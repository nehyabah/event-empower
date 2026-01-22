import { apiClient } from "./client";

export type StoryImageType = "general" | "bride" | "groom";

export interface CoupleStory {
  id: string;
  user_id: string;
  title: string | null;
  content: string | null;
  hashtag: string | null;
  wedding_date: string | null;
  wedding_time: string | null;
  venue: string | null;
  love_quote: string | null;
  selected_icon: string | null;
  banner_image_url: string | null;
  template_id: string | null;
  bride_name: string | null;
  bride_bio: string | null;
  bride_image_url: string | null;
  groom_name: string | null;
  groom_bio: string | null;
  groom_image_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface StoryImage {
  id: string;
  user_id: string;
  url: string;
  caption: string | null;
  story_type: StoryImageType;
  created_at: string;
}

export interface StoryComment {
  id: string;
  user_id: string;
  name: string;
  text: string;
  created_at: string;
}

export type WishlistPriority = "high" | "medium" | "low";

export interface WishlistItem {
  id: string;
  user_id: string;
  name: string;
  price: string | null;
  link: string | null;
  priority: WishlistPriority;
  purchased_by: string | null;
  is_anonymous: boolean;
  created_at: string;
  updated_at: string;
}

export interface BankDetail {
  id: string;
  user_id: string;
  bank_name: string;
  account_name: string;
  account_number: string;
  sort_code: string | null;
  iban: string | null;
  swift: string | null;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface StoryBundle {
  story: CoupleStory | null;
  images: StoryImage[];
  comments: StoryComment[];
  wishlist: WishlistItem[];
  bankDetails: BankDetail[];
}

export interface UpdateStoryInput {
  title?: string | null;
  content?: string | null;
  hashtag?: string | null;
  wedding_date?: string | null;
  wedding_time?: string | null;
  venue?: string | null;
  love_quote?: string | null;
  selected_icon?: string | null;
  banner_image_url?: string | null;
  template_id?: string | null;
  bride_name?: string | null;
  bride_bio?: string | null;
  bride_image_url?: string | null;
  groom_name?: string | null;
  groom_bio?: string | null;
  groom_image_url?: string | null;
}

export interface CreateStoryImageInput {
  url: string;
  caption?: string | null;
  story_type?: StoryImageType;
}

export interface CreateStoryCommentInput {
  name: string;
  text: string;
}

export interface CreateWishlistItemInput {
  name: string;
  price?: string | null;
  link?: string | null;
  priority?: WishlistPriority;
}

export interface UpdateWishlistItemInput {
  name?: string;
  price?: string | null;
  link?: string | null;
  priority?: WishlistPriority;
  purchased_by?: string | null;
  is_anonymous?: boolean | null;
}

export interface CreateBankDetailInput {
  bank_name: string;
  account_name: string;
  account_number: string;
  sort_code?: string | null;
  iban?: string | null;
  swift?: string | null;
  description?: string | null;
}

export interface UpdateBankDetailInput {
  bank_name?: string;
  account_name?: string;
  account_number?: string;
  sort_code?: string | null;
  iban?: string | null;
  swift?: string | null;
  description?: string | null;
}

export const storyService = {
  async getMyStory(): Promise<StoryBundle> {
    const response = await apiClient.get<StoryBundle>("/users/story");
    if (response.error) {
      throw new Error(response.error);
    }
    return (
      response.data || {
        story: null,
        images: [],
        comments: [],
        wishlist: [],
        bankDetails: [],
      }
    );
  },

  async updateMyStory(input: UpdateStoryInput): Promise<CoupleStory> {
    const response = await apiClient.patch<CoupleStory>("/users/story", input);
    if (response.error) {
      throw new Error(response.error);
    }
    if (!response.data) {
      throw new Error("Failed to update story");
    }
    return response.data;
  },

  async addStoryImage(input: CreateStoryImageInput): Promise<StoryImage> {
    const response = await apiClient.post<StoryImage>("/users/story/images", input);
    if (response.error) {
      throw new Error(response.error);
    }
    if (!response.data) {
      throw new Error("Failed to add image");
    }
    return response.data;
  },

  async deleteStoryImage(id: string): Promise<void> {
    const response = await apiClient.delete(`/users/story/images/${id}`);
    if (response.error) {
      throw new Error(response.error);
    }
  },

  async addMyComment(input: CreateStoryCommentInput): Promise<StoryComment> {
    const response = await apiClient.post<StoryComment>("/users/story/comments", input);
    if (response.error) {
      throw new Error(response.error);
    }
    if (!response.data) {
      throw new Error("Failed to add comment");
    }
    return response.data;
  },

  async listWishlist(): Promise<WishlistItem[]> {
    const response = await apiClient.get<WishlistItem[]>("/users/wishlist");
    if (response.error) {
      throw new Error(response.error);
    }
    return response.data || [];
  },

  async addWishlistItem(input: CreateWishlistItemInput): Promise<WishlistItem> {
    const response = await apiClient.post<WishlistItem>("/users/wishlist", input);
    if (response.error) {
      throw new Error(response.error);
    }
    if (!response.data) {
      throw new Error("Failed to add wishlist item");
    }
    return response.data;
  },

  async updateWishlistItem(id: string, input: UpdateWishlistItemInput): Promise<WishlistItem> {
    const response = await apiClient.patch<WishlistItem>(`/users/wishlist/${id}`, input);
    if (response.error) {
      throw new Error(response.error);
    }
    if (!response.data) {
      throw new Error("Failed to update wishlist item");
    }
    return response.data;
  },

  async deleteWishlistItem(id: string): Promise<void> {
    const response = await apiClient.delete(`/users/wishlist/${id}`);
    if (response.error) {
      throw new Error(response.error);
    }
  },

  async listBankDetails(): Promise<BankDetail[]> {
    const response = await apiClient.get<BankDetail[]>("/users/bank-details");
    if (response.error) {
      throw new Error(response.error);
    }
    return response.data || [];
  },

  async addBankDetail(input: CreateBankDetailInput): Promise<BankDetail> {
    const response = await apiClient.post<BankDetail>("/users/bank-details", input);
    if (response.error) {
      throw new Error(response.error);
    }
    if (!response.data) {
      throw new Error("Failed to add bank detail");
    }
    return response.data;
  },

  async updateBankDetail(id: string, input: UpdateBankDetailInput): Promise<BankDetail> {
    const response = await apiClient.patch<BankDetail>(`/users/bank-details/${id}`, input);
    if (response.error) {
      throw new Error(response.error);
    }
    if (!response.data) {
      throw new Error("Failed to update bank detail");
    }
    return response.data;
  },

  async deleteBankDetail(id: string): Promise<void> {
    const response = await apiClient.delete(`/users/bank-details/${id}`);
    if (response.error) {
      throw new Error(response.error);
    }
  },

  async getSharedStory(userId: string): Promise<StoryBundle> {
    const response = await apiClient.get<StoryBundle>(`/shared-story/${userId}`);
    if (response.error) {
      throw new Error(response.error);
    }
    return (
      response.data || {
        story: null,
        images: [],
        comments: [],
        wishlist: [],
        bankDetails: [],
      }
    );
  },

  async addSharedComment(userId: string, input: CreateStoryCommentInput): Promise<StoryComment> {
    const response = await apiClient.post<StoryComment>(`/shared-story/${userId}/comments`, input);
    if (response.error) {
      throw new Error(response.error);
    }
    if (!response.data) {
      throw new Error("Failed to add comment");
    }
    return response.data;
  },

  async markSharedWishlistPurchased(
    userId: string,
    itemId: string,
    purchaserName: string,
    isAnonymous: boolean
  ): Promise<WishlistItem> {
    const response = await apiClient.post<WishlistItem>(
      `/shared-story/${userId}/wishlist/${itemId}/purchase`,
      { purchaserName, isAnonymous }
    );
    if (response.error) {
      throw new Error(response.error);
    }
    if (!response.data) {
      throw new Error("Failed to mark item as purchased");
    }
    return response.data;
  },
};

export default storyService;
