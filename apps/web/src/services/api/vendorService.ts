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
  price_min: number | null;
  price_max: number | null;
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
  open_to_travel: boolean;
  profile_image_url: string | null;
  cover_image_url: string | null;
  profile_image_key?: string | null;
  cover_image_key?: string | null;
  social_links: VendorSocialLink[];
  created_at: string;
  updated_at: string;
}

export interface VendorReview {
  id: string;
  rating: number;
  title: string | null;
  comment: string | null;
  created_at: string;
  reviewer_name?: string | null;
}

export interface VendorDetails {
  profile: VendorProfile;
  services: VendorService[];
  images: VendorImage[];
  reviews?: VendorReview[];
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
    title: string | null;
    event_date: string;
    start_time: string | null;
    end_time: string | null;
    location: string | null;
    event_type: string | null;
    booking_kind: VendorBookingKind;
    status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  }>;
  inquiries: Array<{
    id: string;
    sender_name: string;
    sender_email: string | null;
    event_date: string | null;
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

export interface InquiryMessage {
  id: string;
  inquiry_id: string;
  sender_id: string | null;
  sender_type: 'vendor' | 'client';
  message: string;
  read_at: string | null;
  created_at: string;
}

export interface InquiryWithMessages {
  inquiry: VendorInquiry;
  messages: InquiryMessage[];
  unreadCount: number;
}

export interface ClientInquiry extends VendorInquiry {
  vendor_name: string;
  unread_count: number;
}

export interface ClientInquiryWithMessages {
  inquiry: VendorInquiry & { vendor_name: string };
  messages: InquiryMessage[];
  unreadCount: number;
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

export type VendorBookingKind = 'booking' | 'meeting' | 'consultation' | 'site_visit' | 'setup' | 'other';
export type VendorBookingStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled';

export interface VendorBooking {
  id: string;
  vendor_id: string;
  client_id: string | null;
  client_name: string;
  title: string | null;
  event_date: string;
  start_time: string | null;
  end_time: string | null;
  location: string | null;
  event_type: string | null;
  booking_kind: VendorBookingKind;
  status: VendorBookingStatus;
  notes: string | null;
  total_amount: number | string | null;
  created_at: string;
  updated_at: string;
}

/** A couple on the vendor's roster that a booking can be attached to. */
export interface BookableClient {
  event_id: string;
  /** The couple's user id — what a linked booking stores as client_id. */
  client_user_id: string;
  client_name: string;
  event_date: string | null;
  status: string;
}

export interface CreateVendorBookingInput {
  /** Optional when eventId is supplied — the couple's names are used. */
  clientName?: string;
  /** Links the booking to a roster couple so it syncs to them and their planner. */
  eventId?: string;
  title?: string | null;
  eventDate: string;
  startTime?: string | null;
  endTime?: string | null;
  location?: string | null;
  eventType?: string;
  bookingKind?: VendorBookingKind;
  status?: VendorBookingStatus;
  notes?: string;
  totalAmount?: string;
}

export interface UpdateVendorBookingInput {
  clientName?: string;
  /** null unlinks the booking from the couple. */
  eventId?: string | null;
  title?: string | null;
  eventDate?: string;
  startTime?: string | null;
  endTime?: string | null;
  location?: string | null;
  eventType?: string;
  bookingKind?: VendorBookingKind;
  status?: VendorBookingStatus;
  notes?: string;
  totalAmount?: string;
}

/** Human labels for the booking kinds a vendor can schedule. */
export const VENDOR_BOOKING_KINDS: Array<{ value: VendorBookingKind; label: string }> = [
  { value: 'booking', label: 'Booking' },
  { value: 'meeting', label: 'Meeting' },
  { value: 'consultation', label: 'Consultation' },
  { value: 'site_visit', label: 'Site visit' },
  { value: 'setup', label: 'Setup' },
  { value: 'other', label: 'Other' },
];

export interface VendorProfileInput {
  businessName: string;
  category: string;
  description?: string;
  location?: string;
  email?: string;
  phone?: string;
  website?: string;
  openToTravel?: boolean;
  profileImageUrl?: string | null;
  coverImageUrl?: string | null;
  socialLinks?: VendorSocialLink[];
  services?: Array<{
    name: string;
    description?: string;
    priceMin?: string;
    priceMax?: string;
  }>;
  images?: Array<{
    url: string;
    altText?: string;
    isPrimary?: boolean;
    displayOrder?: number;
  }>;
}

export interface VendorWorkspaceProject {
  id: string;
  event_id: string;
  category: string | null;
  status: 'inquired' | 'quoted' | 'booked' | 'confirmed' | 'cancelled';
  amount: number | null;
  notes: string | null;
  couple_names: string | null;
  event_date: string | null;
  venue: string | null;
  planner_name: string | null;
  planner_email: string | null;
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

  /** Couples this vendor can attach a booking to (their roster). */
  async getBookableClients(): Promise<BookableClient[]> {
    const response = await apiClient.get<BookableClient[]>("/vendors/bookable-clients");
    if (response.error) {
      throw new Error(response.error);
    }
    return response.data || [];
  },

  /** Every booking and meeting, for the vendor calendar. */
  async listVendorBookings(): Promise<VendorBooking[]> {
    const response = await apiClient.get<VendorBooking[]>("/vendors/bookings");
    if (response.error) {
      throw new Error(response.error);
    }
    return response.data || [];
  },

  async createVendorBooking(input: CreateVendorBookingInput): Promise<VendorBooking> {
    const response = await apiClient.post<VendorBooking>("/vendors/bookings", input);
    if (response.error || !response.data) {
      throw new Error(response.error || "Failed to create booking");
    }
    return response.data;
  },

  async updateVendorBooking(id: string, input: UpdateVendorBookingInput): Promise<VendorBooking> {
    const response = await apiClient.patch<VendorBooking>(`/vendors/bookings/${id}`, input);
    if (response.error || !response.data) {
      throw new Error(response.error || "Failed to update booking");
    }
    return response.data;
  },

  async deleteVendorBooking(id: string): Promise<void> {
    const response = await apiClient.delete(`/vendors/bookings/${id}`);
    if (response.error) {
      throw new Error(response.error);
    }
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

  // ========== INQUIRY MESSAGES (VENDOR) ==========

  async getInquiryWithMessages(inquiryId: string): Promise<InquiryWithMessages> {
    const response = await apiClient.get<InquiryWithMessages>(`/vendors/inquiries/${inquiryId}`);
    if (response.error) {
      throw new Error(response.error);
    }
    if (!response.data) {
      throw new Error("Inquiry not found");
    }
    return response.data;
  },

  async getInquiryMessages(inquiryId: string): Promise<InquiryMessage[]> {
    const response = await apiClient.get<InquiryMessage[]>(`/vendors/inquiries/${inquiryId}/messages`);
    if (response.error) {
      throw new Error(response.error);
    }
    return response.data || [];
  },

  async sendInquiryMessage(inquiryId: string, message: string): Promise<InquiryMessage> {
    const response = await apiClient.post<InquiryMessage>(`/vendors/inquiries/${inquiryId}/messages`, { message });
    if (response.error) {
      throw new Error(response.error);
    }
    if (!response.data) {
      throw new Error("Failed to send message");
    }
    return response.data;
  },

  // ========== VENDOR WORKSPACE ==========

  async getVendorWorkspace(): Promise<VendorWorkspaceProject[]> {
    const response = await apiClient.get<VendorWorkspaceProject[]>('/vendors/workspace');
    if (response.error) throw new Error(response.error);
    return response.data || [];
  },

  // ========== CLIENT INQUIRIES ==========

  async listMyInquiries(): Promise<ClientInquiry[]> {
    const response = await apiClient.get<ClientInquiry[]>("/users/inquiries");
    if (response.error) {
      throw new Error(response.error);
    }
    return response.data || [];
  },

  async getMyInquiry(inquiryId: string): Promise<ClientInquiryWithMessages> {
    const response = await apiClient.get<ClientInquiryWithMessages>(`/users/inquiries/${inquiryId}`);
    if (response.error) {
      throw new Error(response.error);
    }
    if (!response.data) {
      throw new Error("Inquiry not found");
    }
    return response.data;
  },

  async sendMyInquiryMessage(inquiryId: string, message: string): Promise<InquiryMessage> {
    const response = await apiClient.post<InquiryMessage>(`/users/inquiries/${inquiryId}/messages`, { message });
    if (response.error) {
      throw new Error(response.error);
    }
    if (!response.data) {
      throw new Error("Failed to send message");
    }
    return response.data;
  },  /** The couple's running thread with one vendor, or null if none yet. */
  async getVendorConversation(vendorProfileId: string): Promise<{
    inquiry: (ClientInquiry & { vendor_name: string }) | null;
    messages: InquiryMessage[];
  }> {
    const response = await apiClient.get<{
      inquiry: (ClientInquiry & { vendor_name: string }) | null;
      messages: InquiryMessage[];
    }>(`/users/vendors/${vendorProfileId}/conversation`);
    if (response.error) throw new Error(response.error);
    return response.data || { inquiry: null, messages: [] };
  },

  /** Send to a vendor; opens the thread on the first message. */
  async messageVendor(vendorProfileId: string, message: string): Promise<{
    inquiryId: string;
    message: InquiryMessage;
  }> {
    const response = await apiClient.post<{ inquiryId: string; message: InquiryMessage }>(
      `/users/vendors/${vendorProfileId}/messages`,
      { message }
    );
    if (response.error || !response.data) {
      throw new Error(response.error || "Failed to send message");
    }
    return response.data;
  },


};

export default vendorService;
