import { apiClient } from "./client";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

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
  slug: string | null;
  accent_color: string | null;
  font_pair: string | null;
  section_order: string[] | null;
  hidden_sections: string[] | null;
  site_published: boolean;
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
  image_url: string | null;
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

// New entity types
export interface TimelineEvent {
  id: string;
  user_id: string;
  title: string;
  date: string | null;
  description: string | null;
  image_url: string | null;
  sort_order: number;
  created_at: string;
}

export interface WeddingPartyMember {
  id: string;
  user_id: string;
  name: string;
  role: string;
  side: "bride" | "groom" | "both";
  bio: string | null;
  image_url: string | null;
  sort_order: number;
  created_at: string;
}

export interface TravelInfoItem {
  id: string;
  user_id: string;
  title: string;
  category: "hotel" | "transport" | "parking" | "other";
  description: string | null;
  address: string | null;
  link: string | null;
  image_url: string | null;
  sort_order: number;
  created_at: string;
}

export interface FaqItem {
  id: string;
  user_id: string;
  question: string;
  answer: string;
  sort_order: number;
  created_at: string;
}

export interface StoryBundle {
  story: CoupleStory | null;
  images: StoryImage[];
  comments: StoryComment[];
  wishlist: WishlistItem[];
  bankDetails: BankDetail[];
  timeline: TimelineEvent[];
  weddingParty: WeddingPartyMember[];
  travelInfo: TravelInfoItem[];
  faqItems: FaqItem[];
  /** Lets the public wedding site link straight to the RSVP form. */
  rsvp: {
    code: string;
    deadline: string | null;
    closed: boolean;
  } | null;
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
  slug?: string | null;
  accent_color?: string | null;
  font_pair?: string | null;
  section_order?: string[] | null;
  hidden_sections?: string[] | null;
  site_published?: boolean;
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
  image_url?: string | null;
  priority?: WishlistPriority;
}

export interface UpdateWishlistItemInput {
  name?: string;
  price?: string | null;
  link?: string | null;
  image_url?: string | null;
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

const emptyBundle: StoryBundle = {
  story: null,
  images: [],
  comments: [],
  wishlist: [],
  bankDetails: [],
  timeline: [],
  weddingParty: [],
  travelInfo: [],
  faqItems: [],
  rsvp: null,
};

export const storyService = {
  async getMyStory(): Promise<StoryBundle> {
    const response = await apiClient.get<StoryBundle>("/users/story");
    if (response.error) {
      throw new Error(response.error);
    }
    return response.data || { ...emptyBundle };
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

  // --- Wishlist ---
  async uploadWishlistImage(file: File): Promise<{ key: string; url: string }> {
    const token = apiClient.getAccessToken();
    const formData = new FormData();
    formData.append('file', file);
    const response = await fetch(`${API_URL}/users/wishlist/upload`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      body: formData,
      credentials: 'include',
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Failed to upload image');
    return { key: data.key as string, url: data.url as string };
  },

  async listWishlist(): Promise<WishlistItem[]> {
    const response = await apiClient.get<WishlistItem[]>("/users/wishlist");
    if (response.error) throw new Error(response.error);
    return response.data || [];
  },
  async addWishlistItem(input: CreateWishlistItemInput): Promise<WishlistItem> {
    const response = await apiClient.post<WishlistItem>("/users/wishlist", input);
    if (response.error) throw new Error(response.error);
    if (!response.data) throw new Error("Failed to add wishlist item");
    return response.data;
  },
  async updateWishlistItem(id: string, input: UpdateWishlistItemInput): Promise<WishlistItem> {
    const response = await apiClient.patch<WishlistItem>(`/users/wishlist/${id}`, input);
    if (response.error) throw new Error(response.error);
    if (!response.data) throw new Error("Failed to update wishlist item");
    return response.data;
  },
  async deleteWishlistItem(id: string): Promise<void> {
    const response = await apiClient.delete(`/users/wishlist/${id}`);
    if (response.error) throw new Error(response.error);
  },

  // --- Bank Details ---
  async listBankDetails(): Promise<BankDetail[]> {
    const response = await apiClient.get<BankDetail[]>("/users/bank-details");
    if (response.error) throw new Error(response.error);
    return response.data || [];
  },
  async addBankDetail(input: CreateBankDetailInput): Promise<BankDetail> {
    const response = await apiClient.post<BankDetail>("/users/bank-details", input);
    if (response.error) throw new Error(response.error);
    if (!response.data) throw new Error("Failed to add bank detail");
    return response.data;
  },
  async updateBankDetail(id: string, input: UpdateBankDetailInput): Promise<BankDetail> {
    const response = await apiClient.patch<BankDetail>(`/users/bank-details/${id}`, input);
    if (response.error) throw new Error(response.error);
    if (!response.data) throw new Error("Failed to update bank detail");
    return response.data;
  },
  async deleteBankDetail(id: string): Promise<void> {
    const response = await apiClient.delete(`/users/bank-details/${id}`);
    if (response.error) throw new Error(response.error);
  },

  // --- Slug ---
  async checkSlugAvailability(slug: string): Promise<{ available: boolean }> {
    const response = await apiClient.get<{ available: boolean }>(`/users/story/check-slug?slug=${encodeURIComponent(slug)}`);
    if (response.error) throw new Error(response.error);
    return response.data || { available: false };
  },

  // --- Timeline ---
  async listTimeline(): Promise<TimelineEvent[]> {
    const response = await apiClient.get<TimelineEvent[]>("/users/story/timeline");
    if (response.error) throw new Error(response.error);
    return response.data || [];
  },
  async addTimeline(input: { title: string; date?: string; description?: string; image_url?: string }): Promise<TimelineEvent> {
    const response = await apiClient.post<TimelineEvent>("/users/story/timeline", input);
    if (response.error) throw new Error(response.error);
    if (!response.data) throw new Error("Failed to add timeline event");
    return response.data;
  },
  async updateTimeline(id: string, input: { title?: string; date?: string; description?: string; image_url?: string }): Promise<TimelineEvent> {
    const response = await apiClient.patch<TimelineEvent>(`/users/story/timeline/${id}`, input);
    if (response.error) throw new Error(response.error);
    if (!response.data) throw new Error("Failed to update timeline event");
    return response.data;
  },
  async deleteTimeline(id: string): Promise<void> {
    const response = await apiClient.delete(`/users/story/timeline/${id}`);
    if (response.error) throw new Error(response.error);
  },
  async reorderTimeline(ids: string[]): Promise<void> {
    const response = await apiClient.patch("/users/story/timeline/reorder", { ids });
    if (response.error) throw new Error(response.error);
  },

  // --- Wedding Party ---
  async listWeddingParty(): Promise<WeddingPartyMember[]> {
    const response = await apiClient.get<WeddingPartyMember[]>("/users/story/wedding-party");
    if (response.error) throw new Error(response.error);
    return response.data || [];
  },
  async addWeddingParty(input: { name: string; role: string; side?: string; bio?: string; image_url?: string }): Promise<WeddingPartyMember> {
    const response = await apiClient.post<WeddingPartyMember>("/users/story/wedding-party", input);
    if (response.error) throw new Error(response.error);
    if (!response.data) throw new Error("Failed to add wedding party member");
    return response.data;
  },
  async updateWeddingParty(id: string, input: { name?: string; role?: string; side?: string; bio?: string; image_url?: string }): Promise<WeddingPartyMember> {
    const response = await apiClient.patch<WeddingPartyMember>(`/users/story/wedding-party/${id}`, input);
    if (response.error) throw new Error(response.error);
    if (!response.data) throw new Error("Failed to update wedding party member");
    return response.data;
  },
  async deleteWeddingParty(id: string): Promise<void> {
    const response = await apiClient.delete(`/users/story/wedding-party/${id}`);
    if (response.error) throw new Error(response.error);
  },
  async reorderWeddingParty(ids: string[]): Promise<void> {
    const response = await apiClient.patch("/users/story/wedding-party/reorder", { ids });
    if (response.error) throw new Error(response.error);
  },

  // --- Travel ---
  async listTravel(): Promise<TravelInfoItem[]> {
    const response = await apiClient.get<TravelInfoItem[]>("/users/story/travel");
    if (response.error) throw new Error(response.error);
    return response.data || [];
  },
  async addTravel(input: { title: string; category?: string; description?: string; address?: string; link?: string; image_url?: string }): Promise<TravelInfoItem> {
    const response = await apiClient.post<TravelInfoItem>("/users/story/travel", input);
    if (response.error) throw new Error(response.error);
    if (!response.data) throw new Error("Failed to add travel info");
    return response.data;
  },
  async updateTravel(id: string, input: { title?: string; category?: string; description?: string; address?: string; link?: string; image_url?: string }): Promise<TravelInfoItem> {
    const response = await apiClient.patch<TravelInfoItem>(`/users/story/travel/${id}`, input);
    if (response.error) throw new Error(response.error);
    if (!response.data) throw new Error("Failed to update travel info");
    return response.data;
  },
  async deleteTravel(id: string): Promise<void> {
    const response = await apiClient.delete(`/users/story/travel/${id}`);
    if (response.error) throw new Error(response.error);
  },
  async reorderTravel(ids: string[]): Promise<void> {
    const response = await apiClient.patch("/users/story/travel/reorder", { ids });
    if (response.error) throw new Error(response.error);
  },

  // --- FAQ ---
  async listFaq(): Promise<FaqItem[]> {
    const response = await apiClient.get<FaqItem[]>("/users/story/faq");
    if (response.error) throw new Error(response.error);
    return response.data || [];
  },
  async addFaq(input: { question: string; answer: string }): Promise<FaqItem> {
    const response = await apiClient.post<FaqItem>("/users/story/faq", input);
    if (response.error) throw new Error(response.error);
    if (!response.data) throw new Error("Failed to add FAQ");
    return response.data;
  },
  async updateFaq(id: string, input: { question?: string; answer?: string }): Promise<FaqItem> {
    const response = await apiClient.patch<FaqItem>(`/users/story/faq/${id}`, input);
    if (response.error) throw new Error(response.error);
    if (!response.data) throw new Error("Failed to update FAQ");
    return response.data;
  },
  async deleteFaq(id: string): Promise<void> {
    const response = await apiClient.delete(`/users/story/faq/${id}`);
    if (response.error) throw new Error(response.error);
  },
  async reorderFaq(ids: string[]): Promise<void> {
    const response = await apiClient.patch("/users/story/faq/reorder", { ids });
    if (response.error) throw new Error(response.error);
  },

  // --- Shared (public) ---
  async getSharedStory(userId: string): Promise<StoryBundle> {
    const response = await apiClient.get<StoryBundle>(`/shared-story/${userId}`);
    if (response.error) throw new Error(response.error);
    return response.data || { ...emptyBundle };
  },

  async getStoryBySlug(slug: string): Promise<StoryBundle> {
    const response = await apiClient.get<StoryBundle>(`/shared-story/by-slug/${slug}`);
    if (response.error) throw new Error(response.error);
    return response.data || { ...emptyBundle };
  },

  async addSharedComment(userId: string, input: CreateStoryCommentInput): Promise<StoryComment> {
    const response = await apiClient.post<StoryComment>(`/shared-story/${userId}/comments`, input);
    if (response.error) throw new Error(response.error);
    if (!response.data) throw new Error("Failed to add comment");
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
    if (response.error) throw new Error(response.error);
    if (!response.data) throw new Error("Failed to mark item as purchased");
    return response.data;
  },
};

export default storyService;
