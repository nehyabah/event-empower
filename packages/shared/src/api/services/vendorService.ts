import type { ApiClient } from '../client';
import type {
  VendorDetails,
  VendorDashboard,
  VendorInquiry,
  InquiryMessage,
  InquiryWithMessages,
  ClientInquiry,
  ClientInquiryWithMessages,
  CreateInquiryInput,
  UpdateInquiryInput,
  CreateVendorBookingInput,
  UpdateVendorBookingInput,
  VendorProfileInput,
} from '../../types';

export function createVendorService(apiClient: ApiClient) {
  return {
    async getVendors(): Promise<VendorDetails[]> {
      const response = await apiClient.get<VendorDetails[]>("/vendors");
      if (response.error) throw new Error(response.error);
      return response.data || [];
    },

    async getVendor(id: string): Promise<VendorDetails> {
      const response = await apiClient.get<VendorDetails>(`/vendors/${id}`);
      if (response.error) throw new Error(response.error);
      if (!response.data) throw new Error("Vendor not found");
      return response.data;
    },

    async getMyVendorProfile(): Promise<VendorDetails | null> {
      const response = await apiClient.get<VendorDetails | null>("/vendors/me");
      if (response.error) throw new Error(response.error);
      return response.data ?? null;
    },

    async updateMyVendorProfile(input: VendorProfileInput): Promise<VendorDetails> {
      const response = await apiClient.patch<VendorDetails>("/vendors/me", input);
      if (response.error) throw new Error(response.error);
      if (!response.data) throw new Error("Failed to update vendor profile");
      return response.data;
    },

    async getVendorDashboard(): Promise<VendorDashboard> {
      const response = await apiClient.get<VendorDashboard>("/vendors/dashboard");
      if (response.error) throw new Error(response.error);
      if (!response.data) throw new Error("Failed to load vendor dashboard");
      return response.data;
    },

    async createVendorBooking(input: CreateVendorBookingInput) {
      const response = await apiClient.post("/vendors/bookings", input);
      if (response.error) throw new Error(response.error);
      return response.data;
    },

    async updateVendorBooking(id: string, input: UpdateVendorBookingInput) {
      const response = await apiClient.patch(`/vendors/bookings/${id}`, input);
      if (response.error) throw new Error(response.error);
      return response.data;
    },

    async listVendorInquiries(): Promise<VendorInquiry[]> {
      const response = await apiClient.get<VendorInquiry[]>("/vendors/inquiries");
      if (response.error) throw new Error(response.error);
      return response.data || [];
    },

    async updateVendorInquiry(id: string, input: UpdateInquiryInput): Promise<VendorInquiry> {
      const response = await apiClient.patch<VendorInquiry>(`/vendors/inquiries/${id}`, input);
      if (response.error) throw new Error(response.error);
      if (!response.data) throw new Error("Failed to update inquiry");
      return response.data;
    },

    async deleteVendorInquiry(id: string): Promise<void> {
      const response = await apiClient.delete(`/vendors/inquiries/${id}`);
      if (response.error) throw new Error(response.error);
    },

    async createInquiry(input: CreateInquiryInput): Promise<VendorInquiry> {
      const response = await apiClient.post<VendorInquiry>("/inquiries", input);
      if (response.error) throw new Error(response.error);
      if (!response.data) throw new Error("Failed to send inquiry");
      return response.data;
    },

    async getInquiryWithMessages(inquiryId: string): Promise<InquiryWithMessages> {
      const response = await apiClient.get<InquiryWithMessages>(`/vendors/inquiries/${inquiryId}`);
      if (response.error) throw new Error(response.error);
      if (!response.data) throw new Error("Inquiry not found");
      return response.data;
    },

    async getInquiryMessages(inquiryId: string): Promise<InquiryMessage[]> {
      const response = await apiClient.get<InquiryMessage[]>(`/vendors/inquiries/${inquiryId}/messages`);
      if (response.error) throw new Error(response.error);
      return response.data || [];
    },

    async sendInquiryMessage(inquiryId: string, message: string): Promise<InquiryMessage> {
      const response = await apiClient.post<InquiryMessage>(`/vendors/inquiries/${inquiryId}/messages`, { message });
      if (response.error) throw new Error(response.error);
      if (!response.data) throw new Error("Failed to send message");
      return response.data;
    },

    async listMyInquiries(): Promise<ClientInquiry[]> {
      const response = await apiClient.get<ClientInquiry[]>("/users/me/inquiries");
      if (response.error) throw new Error(response.error);
      return response.data || [];
    },

    async getMyInquiry(inquiryId: string): Promise<ClientInquiryWithMessages> {
      const response = await apiClient.get<ClientInquiryWithMessages>(`/users/me/inquiries/${inquiryId}`);
      if (response.error) throw new Error(response.error);
      if (!response.data) throw new Error("Inquiry not found");
      return response.data;
    },

    async sendMyInquiryMessage(inquiryId: string, message: string): Promise<InquiryMessage> {
      const response = await apiClient.post<InquiryMessage>(`/users/me/inquiries/${inquiryId}/messages`, { message });
      if (response.error) throw new Error(response.error);
      if (!response.data) throw new Error("Failed to send message");
      return response.data;
    },
  };
}
