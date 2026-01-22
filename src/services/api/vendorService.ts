import { apiClient } from "./client";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export interface VendorSocialLink {
  platform: string;
  url?: string;
}

export interface VendorService {
  id: string;
  name: string;
  description: string | null;
  price: number | null;
}

export interface VendorImage {
  id: string;
  url: string;
  alt_text: string | null;
  is_primary: boolean;
  display_order: number;
  key?: string | null;
}

export interface VendorProfile {
  id: string;
  user_id: string;
  business_name: string;
  category: string;
  description: string | null;
  location: string | null;
  email: string | null;
  phone: string | null;
  website: string | null;
  rating: number;
  review_count: number;
  is_verified: boolean;
  is_active: boolean;
  profile_image_url: string | null;
  cover_image_url: string | null;
  profile_image_key?: string | null;
  cover_image_key?: string | null;
  social_links: VendorSocialLink[];
  created_at: string;
  updated_at: string;
}

export interface VendorDetails {
  profile: VendorProfile;
  services: VendorService[];
  images: VendorImage[];
}

export interface VendorDashboard {
  profile: VendorProfile;
  stats: {
    upcoming_events: number;
    confirmed_events: number;
    inquiries_new: number;
    inquiries_total: number;
  };
  upcoming_events: Array<{
    id: string;
    client_name: string;
    event_date: string;
    event_type: string | null;
    status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  }>;
  inquiries: Array<{
    id: string;
    sender_name: string;
    message: string;
    status: 'new' | 'replied' | 'archived';
    created_at: string;
    notes: string | null;
  }>;
}

export interface VendorInquiry {
  id: string;
  sender_name: string;
  sender_email: string | null;
  event_date: string | null;
  message: string;
  status: 'new' | 'replied' | 'archived';
  notes: string | null;
  created_at: string;
}

export interface CreateInquiryInput {
  vendorId: string;
  senderName: string;
  senderEmail?: string;
  eventDate?: string;
  message: string;
}

export interface UpdateInquiryInput {
  status?: 'new' | 'replied' | 'archived';
  notes?: string;
}

export interface CreateVendorBookingInput {
  clientName: string;
  eventDate: string;
  eventType?: string;
  status?: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  notes?: string;
  totalAmount?: string;
}

export interface UpdateVendorBookingInput {
  clientName?: string;
  eventDate?: string;
  eventType?: string;
  status?: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  notes?: string;
  totalAmount?: string;
}

export interface VendorProfileInput {
  businessName: string;
  category: string;
  description?: string;
  location?: string;
  email?: string;
  phone?: string;
  website?: string;
  profileImageUrl?: string | null;
  coverImageUrl?: string | null;
  socialLinks?: VendorSocialLink[];
  services?: Array<{
    name: string;
    description?: string;
    price?: string;
  }>;
  images?: Array<{
    url: string;
    altText?: string;
    isPrimary?: boolean;
    displayOrder?: number;
  }>;
}

export const vendorService = {
  async getVendors(): Promise<VendorDetails[]> {
    const response = await apiClient.get<VendorDetails[]>("/vendors");
    if (response.error) {
      throw new Error(response.error);
    }
    return response.data || [];
  },

  async getVendor(id: string): Promise<VendorDetails> {
    const response = await apiClient.get<VendorDetails>(`/vendors/${id}`);
    if (response.error) {
      throw new Error(response.error);
    }
    if (!response.data) {
      throw new Error("Vendor not found");
    }
    return response.data;
  },

  async getMyVendorProfile(): Promise<VendorDetails | null> {
    const response = await apiClient.get<VendorDetails | null>("/vendors/me");
    if (response.error) {
      throw new Error(response.error);
    }
    return response.data ?? null;
  },

  async updateMyVendorProfile(input: VendorProfileInput): Promise<VendorDetails> {
    const response = await apiClient.patch<VendorDetails>("/vendors/me", input);
    if (response.error) {
      throw new Error(response.error);
    }
    if (!response.data) {
      throw new Error("Failed to update vendor profile");
    }
    return response.data;
  },

  async getVendorDashboard(): Promise<VendorDashboard> {
    const response = await apiClient.get<VendorDashboard>("/vendors/dashboard");
    if (response.error) {
      throw new Error(response.error);
    }
    if (!response.data) {
      throw new Error("Failed to load vendor dashboard");
    }
    return response.data;
  },

  async createVendorBooking(input: CreateVendorBookingInput) {
    const response = await apiClient.post("/vendors/bookings", input);
    if (response.error) {
      throw new Error(response.error);
    }
    return response.data;
  },

  async updateVendorBooking(id: string, input: UpdateVendorBookingInput) {
    const response = await apiClient.patch(`/vendors/bookings/${id}`, input);
    if (response.error) {
      throw new Error(response.error);
    }
    return response.data;
  },

  async listVendorInquiries(): Promise<VendorInquiry[]> {
    const response = await apiClient.get<VendorInquiry[]>("/vendors/inquiries");
    if (response.error) {
      throw new Error(response.error);
    }
    return response.data || [];
  },

  async updateVendorInquiry(id: string, input: UpdateInquiryInput): Promise<VendorInquiry> {
    const response = await apiClient.patch<VendorInquiry>(`/vendors/inquiries/${id}`, input);
    if (response.error) {
      throw new Error(response.error);
    }
    if (!response.data) {
      throw new Error("Failed to update inquiry");
    }
    return response.data;
  },

  async deleteVendorInquiry(id: string): Promise<void> {
    const response = await apiClient.delete(`/vendors/inquiries/${id}`);
    if (response.error) {
      throw new Error(response.error);
    }
  },

  async createInquiry(input: CreateInquiryInput): Promise<VendorInquiry> {
    const response = await apiClient.post<VendorInquiry>("/inquiries", input);
    if (response.error) {
      throw new Error(response.error);
    }
    if (!response.data) {
      throw new Error("Failed to send inquiry");
    }
    return response.data;
  },

  async uploadVendorImage(file: File): Promise<{ key: string; url: string }> {
    const token = apiClient.getAccessToken();
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_URL}/vendors/uploads`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      body: formData,
      credentials: 'include',
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Failed to upload image');
    }
    if (!data.url || !data.key) {
      throw new Error('Upload failed');
    }
    return { key: data.key as string, url: data.url as string };
  },
};

export default vendorService;
