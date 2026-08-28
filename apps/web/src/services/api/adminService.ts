import { apiClient } from "@/services/api/client";
import type { UserType } from "@/context/AuthContext";

export interface AdminStats {
  totalUsers: number;
  clients: number;
  vendors: number;
  planners: number;
  admins: number;
}

export interface AdminUserSummary {
  id: string;
  email: string | null;
  phone: string | null;
  name: string | null;
  userType: UserType;
  avatarUrl: string | null;
  isActive: boolean;
  suspendedAt: string | null;
  deletedAt: string | null;
  createdAt: string;
}

export interface AdminUserListResponse {
  total: number;
  limit: number;
  offset: number;
  users: AdminUserSummary[];
}

export interface AdminUserDetail extends AdminUserSummary {
  updatedAt: string;
  adminNotes: string | null;
}

export interface AdminVendorSummary {
  id: string;
  userId: string;
  businessName: string;
  category: string;
  location: string | null;
  isVerified: boolean;
  isActive: boolean;
  createdAt: string;
  email: string | null;
}

export interface AdminVendorListResponse {
  total: number;
  limit: number;
  offset: number;
  vendors: AdminVendorSummary[];
}

export interface AdminVendorDetail {
  profile: {
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
    is_featured: boolean;
    profile_image_url: string | null;
    cover_image_url: string | null;
    social_links: unknown;
    created_at: string;
    updated_at: string;
  };
  services: Array<{
    id: string;
    name: string;
    description: string | null;
    price: number | null;
  }>;
  images: Array<{
    id: string;
    url: string;
    alt_text: string | null;
    is_primary: boolean;
    display_order: number;
  }>;
  email: string | null;
  approvalStatus: string | null;
  authProvider: string | null;
  createdAt: string | null;
  onboardingSubmittedAt: string | null;
}

export interface AdminPlannerDetail {
  profile: {
    id: string;
    user_id: string;
    bio: string | null;
    tagline: string | null;
    location: string | null;
    website: string | null;
    years_of_experience: number | null;
    specializations: string[];
    profile_image_url: string | null;
    cover_image_url: string | null;
    phone: string | null;
    instagram: string | null;
    facebook: string | null;
    twitter: string | null;
    created_at: string;
    updated_at: string;
  } | null;
  user: {
    id: string;
    name: string | null;
    email: string | null;
    phone: string | null;
    approval_status: string;
    auth_provider: string | null;
    created_at: string;
    onboarding_submitted_at: string | null;
    business_name: string | null;
    instagram_handle: string | null;
    whatsapp_phone: string | null;
    city: string | null;
  };
}

export const getAdminPlanner = async (userId: string): Promise<AdminPlannerDetail> => {
  const response = await apiClient.get<AdminPlannerDetail>(`/admin/planners/${userId}`);
  if (response.error || !response.data) {
    throw new Error(response.error || "Failed to load planner");
  }
  return response.data;
};

export interface AdminInquirySummary {
  id: string;
  vendorId: string;
  vendorName: string;
  senderName: string;
  senderEmail: string | null;
  status: string;
  eventDate: string | null;
  createdAt: string;
}

export interface AdminInquiryListResponse {
  total: number;
  limit: number;
  offset: number;
  inquiries: AdminInquirySummary[];
}

export interface AdminInquiryDetail {
  inquiry: {
    id: string;
    vendor_id: string;
    sender_id: string | null;
    sender_name: string;
    sender_email: string | null;
    event_date: string | null;
    message: string;
    status: string;
    notes: string | null;
    created_at: string;
    updated_at: string;
  };
  messages: Array<{
    id: string;
    inquiry_id: string;
    sender_id: string | null;
    sender_type: "vendor" | "client";
    message: string;
    read_at: string | null;
    created_at: string;
  }>;
  vendor: {
    id: string;
    business_name: string;
    category: string;
    location: string | null;
    is_verified: boolean;
    is_active: boolean;
  } | null;
}

export interface AdminAnalyticsOverview {
  totals: {
    users: number;
    vendors: number;
    inquiries: number;
  };
  userGrowth: Array<{ day: string; count: number }>;
  inquiriesByStatus: Array<{ status: string; count: number }>;
  inquiryVolume: Array<{ day: string; count: number }>;
}

export interface AdminAnalyticsUsers {
  usersByType: Array<{ user_type: UserType; count: number }>;
  userGrowth: Array<{ day: string; count: number }>;
}

export interface AdminAnalyticsVendors {
  vendorsByCategory: Array<{ category: string; count: number }>;
  vendorGrowth: Array<{ day: string; count: number }>;
}

export interface AdminAnalyticsInquiries {
  inquiriesByStatus: Array<{ status: string; count: number }>;
  inquiryVolume: Array<{ day: string; count: number }>;
}

export interface AdminTicketSummary {
  id: string;
  ticketNumber: number;
  subject: string;
  status: string;
  priority: string;
  category: string | null;
  createdAt: string;
}

export interface AdminTicketListResponse {
  total: number;
  limit: number;
  offset: number;
  tickets: AdminTicketSummary[];
}

export interface AdminTicketDetail {
  ticket: {
    id: string;
    ticket_number: number;
    user_id: string | null;
    assigned_to: string | null;
    subject: string;
    description: string | null;
    status: string;
    priority: string;
    category: string | null;
    created_at: string;
    updated_at: string;
  };
  messages: Array<{
    id: string;
    sender_id: string | null;
    message: string;
    is_internal: boolean;
    created_at: string;
  }>;
}

export interface AdminModerationComment {
  id: string;
  user_id: string;
  name: string;
  text: string;
  created_at: string;
}

export interface AdminModerationCommentList {
  total: number;
  limit: number;
  offset: number;
  comments: AdminModerationComment[];
}

export interface AdminModerationImage {
  id: string;
  user_id: string;
  url: string;
  caption: string | null;
  story_type: string;
  created_at: string;
}

export interface AdminModerationImageList {
  total: number;
  limit: number;
  offset: number;
  images: AdminModerationImage[];
}

export interface AdminBroadcast {
  id: string;
  title: string;
  body: string;
  audience: string;
  status: string;
  template_id: string | null;
  scheduled_at: string | null;
  sent_at: string | null;
  cancelled_at: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface AdminBroadcastListResponse {
  total: number;
  limit: number;
  offset: number;
  broadcasts: AdminBroadcast[];
}

export interface AdminTemplate {
  id: string;
  name: string;
  subject: string | null;
  body: string;
  channel: string;
  created_at: string;
  updated_at: string;
}

export interface AdminSubscriber {
  id: string;
  email: string;
  name: string | null;
  source: string | null;
  is_active: boolean;
  subscribed_at: string;
  updated_at: string;
}

export interface AdminSubscriberListResponse {
  total: number;
  limit: number;
  offset: number;
  subscribers: AdminSubscriber[];
}

export interface AdminAuditLog {
  id: string;
  user_id: string | null;
  action: string;
  resource_type: string | null;
  resource_id: string | null;
  old_values: unknown;
  new_values: unknown;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
}

export interface AdminAuditLogListResponse {
  total: number;
  limit: number;
  offset: number;
  logs: AdminAuditLog[];
}

export interface AdminUserListParams {
  search?: string;
  type?: UserType | "all";
  limit?: number;
  offset?: number;
}

const buildQuery = (params: AdminUserListParams): string => {
  const searchParams = new URLSearchParams();
  if (params.search) searchParams.set("search", params.search);
  if (params.type && params.type !== "all") searchParams.set("type", params.type);
  if (typeof params.limit === "number") searchParams.set("limit", String(params.limit));
  if (typeof params.offset === "number") searchParams.set("offset", String(params.offset));
  const query = searchParams.toString();
  return query ? `?${query}` : "";
};

export const getAdminStats = async (): Promise<AdminStats> => {
  const response = await apiClient.get<AdminStats>("/admin/dashboard/stats");
  if (response.error || !response.data) {
    throw new Error(response.error || "Failed to load admin stats");
  }
  return response.data;
};

export const getAdminUsers = async (params: AdminUserListParams): Promise<AdminUserListResponse> => {
  const response = await apiClient.get<AdminUserListResponse>(`/admin/users${buildQuery(params)}`);
  if (response.error || !response.data) {
    throw new Error(response.error || "Failed to load users");
  }
  return response.data;
};

export const getAdminUser = async (userId: string): Promise<AdminUserDetail> => {
  const response = await apiClient.get<AdminUserDetail>(`/admin/users/${userId}`);
  if (response.error || !response.data) {
    throw new Error(response.error || "Failed to load user");
  }
  return response.data;
};

export const approveAdminUser = async (userId: string): Promise<void> => {
  const response = await apiClient.post(`/admin/users/${userId}/approve`);
  if (response.error) {
    throw new Error(response.error || "Failed to approve user");
  }
};

export const rejectAdminUser = async (userId: string, reason: string): Promise<void> => {
  const response = await apiClient.post(`/admin/users/${userId}/reject`, { reason });
  if (response.error) {
    throw new Error(response.error || "Failed to reject user");
  }
};

export const suspendAdminUser = async (userId: string): Promise<void> => {
  const response = await apiClient.post(`/admin/users/${userId}/suspend`);
  if (response.error) {
    throw new Error(response.error || "Failed to suspend user");
  }
};

export const activateAdminUser = async (userId: string): Promise<void> => {
  const response = await apiClient.post(`/admin/users/${userId}/activate`);
  if (response.error) {
    throw new Error(response.error || "Failed to activate user");
  }
};

export const softDeleteAdminUser = async (userId: string): Promise<void> => {
  const response = await apiClient.delete(`/admin/users/${userId}`);
  if (response.error) {
    throw new Error(response.error || "Failed to delete user");
  }
};

export const getAdminVendors = async (params: {
  search?: string;
  limit?: number;
  offset?: number;
}): Promise<AdminVendorListResponse> => {
  const query = buildQuery(params);
  const response = await apiClient.get<AdminVendorListResponse>(`/admin/vendors${query}`);
  if (response.error || !response.data) {
    throw new Error(response.error || "Failed to load vendors");
  }
  return response.data;
};

export const getAdminVendor = async (vendorId: string): Promise<AdminVendorDetail> => {
  const response = await apiClient.get<AdminVendorDetail>(`/admin/vendors/${vendorId}`);
  if (response.error || !response.data) {
    throw new Error(response.error || "Failed to load vendor");
  }
  return response.data;
};

export const getAdminInquiries = async (params: {
  search?: string;
  status?: string;
  limit?: number;
  offset?: number;
}): Promise<AdminInquiryListResponse> => {
  const query = buildQuery(params);
  const response = await apiClient.get<AdminInquiryListResponse>(`/admin/inquiries${query}`);
  if (response.error || !response.data) {
    throw new Error(response.error || "Failed to load inquiries");
  }
  return response.data;
};

export const getAdminInquiry = async (inquiryId: string): Promise<AdminInquiryDetail> => {
  const response = await apiClient.get<AdminInquiryDetail>(`/admin/inquiries/${inquiryId}`);
  if (response.error || !response.data) {
    throw new Error(response.error || "Failed to load inquiry");
  }
  return response.data;
};

export const updateAdminInquiry = async (
  inquiryId: string,
  updates: { status?: string; notes?: string }
): Promise<void> => {
  const response = await apiClient.patch(`/admin/inquiries/${inquiryId}`, updates);
  if (response.error) {
    throw new Error(response.error || "Failed to update inquiry");
  }
};

export const getAdminAnalyticsOverview = async (): Promise<AdminAnalyticsOverview> => {
  const response = await apiClient.get<AdminAnalyticsOverview>("/admin/analytics/overview");
  if (response.error || !response.data) {
    throw new Error(response.error || "Failed to load analytics overview");
  }
  return response.data;
};

export const getAdminAnalyticsUsers = async (): Promise<AdminAnalyticsUsers> => {
  const response = await apiClient.get<AdminAnalyticsUsers>("/admin/analytics/users");
  if (response.error || !response.data) {
    throw new Error(response.error || "Failed to load user analytics");
  }
  return response.data;
};

export const getAdminAnalyticsVendors = async (): Promise<AdminAnalyticsVendors> => {
  const response = await apiClient.get<AdminAnalyticsVendors>("/admin/analytics/vendors");
  if (response.error || !response.data) {
    throw new Error(response.error || "Failed to load vendor analytics");
  }
  return response.data;
};

export const getAdminAnalyticsInquiries = async (): Promise<AdminAnalyticsInquiries> => {
  const response = await apiClient.get<AdminAnalyticsInquiries>("/admin/analytics/inquiries");
  if (response.error || !response.data) {
    throw new Error(response.error || "Failed to load inquiry analytics");
  }
  return response.data;
};

export const getAdminTickets = async (params: {
  status?: string;
  search?: string;
  limit?: number;
  offset?: number;
}): Promise<AdminTicketListResponse> => {
  const query = buildQuery(params);
  const response = await apiClient.get<AdminTicketListResponse>(`/admin/support/tickets${query}`);
  if (response.error || !response.data) {
    throw new Error(response.error || "Failed to load tickets");
  }
  return response.data;
};

export const getAdminTicket = async (ticketId: string): Promise<AdminTicketDetail> => {
  const response = await apiClient.get<AdminTicketDetail>(`/admin/support/tickets/${ticketId}`);
  if (response.error || !response.data) {
    throw new Error(response.error || "Failed to load ticket");
  }
  return response.data;
};

export const updateAdminTicket = async (ticketId: string, updates: {
  status?: string;
  priority?: string;
  category?: string;
  resolved?: boolean;
}): Promise<void> => {
  const response = await apiClient.patch(`/admin/support/tickets/${ticketId}`, updates);
  if (response.error) {
    throw new Error(response.error || "Failed to update ticket");
  }
};

export const addAdminTicketMessage = async (
  ticketId: string,
  payload: { message: string; isInternal?: boolean }
): Promise<void> => {
  const response = await apiClient.post(`/admin/support/tickets/${ticketId}/messages`, payload);
  if (response.error) {
    throw new Error(response.error || "Failed to add message");
  }
};

export const createAdminTicket = async (payload: {
  subject: string;
  description?: string;
  priority?: string;
  category?: string;
}): Promise<void> => {
  const response = await apiClient.post(`/admin/support/tickets`, payload);
  if (response.error) {
    throw new Error(response.error || "Failed to create ticket");
  }
};

export const getAdminModerationComments = async (params: {
  search?: string;
  limit?: number;
  offset?: number;
}): Promise<AdminModerationCommentList> => {
  const query = buildQuery(params);
  const response = await apiClient.get<AdminModerationCommentList>(`/admin/moderation/comments${query}`);
  if (response.error || !response.data) {
    throw new Error(response.error || "Failed to load comments");
  }
  return response.data;
};

export const deleteAdminModerationComment = async (commentId: string): Promise<void> => {
  const response = await apiClient.delete(`/admin/moderation/comments/${commentId}`);
  if (response.error) {
    throw new Error(response.error || "Failed to delete comment");
  }
};

export const getAdminModerationImages = async (params: {
  limit?: number;
  offset?: number;
}): Promise<AdminModerationImageList> => {
  const query = buildQuery(params);
  const response = await apiClient.get<AdminModerationImageList>(`/admin/moderation/images${query}`);
  if (response.error || !response.data) {
    throw new Error(response.error || "Failed to load images");
  }
  return response.data;
};

export const deleteAdminModerationImage = async (imageId: string): Promise<void> => {
  const response = await apiClient.delete(`/admin/moderation/images/${imageId}`);
  if (response.error) {
    throw new Error(response.error || "Failed to delete image");
  }
};

// ── Broadcasts ──────────────────────────────────────────────────────────

export const getAdminBroadcasts = async (params: {
  search?: string;
  status?: string;
  audience?: string;
  limit?: number;
  offset?: number;
}): Promise<AdminBroadcastListResponse> => {
  const q = buildQuery(params);
  const response = await apiClient.get<AdminBroadcastListResponse>(`/admin/broadcasts${q}`);
  if (response.error || !response.data) {
    throw new Error(response.error || "Failed to load broadcasts");
  }
  return response.data;
};

export const getAdminBroadcast = async (id: string): Promise<AdminBroadcast> => {
  const response = await apiClient.get<AdminBroadcast>(`/admin/broadcasts/${id}`);
  if (response.error || !response.data) {
    throw new Error(response.error || "Failed to load broadcast");
  }
  return response.data;
};

export const createAdminBroadcast = async (payload: {
  title: string;
  body: string;
  audience?: string;
  status?: string;
  scheduledAt?: string;
  confirmSend?: boolean;
  templateId?: string;
}): Promise<AdminBroadcast> => {
  const response = await apiClient.post<AdminBroadcast>(`/admin/broadcasts`, payload);
  if (response.error || !response.data) {
    throw new Error(response.error || "Failed to create broadcast");
  }
  return response.data;
};

export const updateAdminBroadcast = async (
  id: string,
  payload: {
    title?: string;
    body?: string;
    audience?: string;
    status?: string;
    scheduledAt?: string;
    confirmSend?: boolean;
    templateId?: string | null;
  }
): Promise<AdminBroadcast> => {
  const response = await apiClient.patch<AdminBroadcast>(`/admin/broadcasts/${id}`, payload);
  if (response.error || !response.data) {
    throw new Error(response.error || "Failed to update broadcast");
  }
  return response.data;
};

export const deleteAdminBroadcast = async (id: string): Promise<void> => {
  const response = await apiClient.delete(`/admin/broadcasts/${id}`);
  if (response.error) {
    throw new Error(response.error || "Failed to delete broadcast");
  }
};

export const cancelAdminBroadcast = async (id: string): Promise<AdminBroadcast> => {
  const response = await apiClient.post<AdminBroadcast>(`/admin/broadcasts/${id}/cancel`);
  if (response.error || !response.data) {
    throw new Error(response.error || "Failed to cancel broadcast");
  }
  return response.data;
};

// ── Templates ───────────────────────────────────────────────────────────

export const getAdminTemplates = async (): Promise<AdminTemplate[]> => {
  const response = await apiClient.get<AdminTemplate[]>(`/admin/templates`);
  if (response.error || !response.data) {
    throw new Error(response.error || "Failed to load templates");
  }
  return response.data;
};

export const getAdminTemplate = async (id: string): Promise<AdminTemplate> => {
  const response = await apiClient.get<AdminTemplate>(`/admin/templates/${id}`);
  if (response.error || !response.data) {
    throw new Error(response.error || "Failed to load template");
  }
  return response.data;
};

export const createAdminTemplate = async (payload: {
  name: string;
  subject?: string;
  body: string;
  channel?: string;
}): Promise<AdminTemplate> => {
  const response = await apiClient.post<AdminTemplate>(`/admin/templates`, payload);
  if (response.error || !response.data) {
    throw new Error(response.error || "Failed to create template");
  }
  return response.data;
};

export const updateAdminTemplate = async (
  id: string,
  payload: { name?: string; subject?: string; body?: string; channel?: string }
): Promise<AdminTemplate> => {
  const response = await apiClient.patch<AdminTemplate>(`/admin/templates/${id}`, payload);
  if (response.error || !response.data) {
    throw new Error(response.error || "Failed to update template");
  }
  return response.data;
};

export const deleteAdminTemplate = async (id: string): Promise<void> => {
  const response = await apiClient.delete(`/admin/templates/${id}`);
  if (response.error) {
    throw new Error(response.error || "Failed to delete template");
  }
};

// ── Subscribers ─────────────────────────────────────────────────────────

export const getAdminSubscribers = async (params: {
  search?: string;
  limit?: number;
  offset?: number;
}): Promise<AdminSubscriberListResponse> => {
  const q = buildQuery(params);
  const response = await apiClient.get<AdminSubscriberListResponse>(`/admin/subscribers${q}`);
  if (response.error || !response.data) {
    throw new Error(response.error || "Failed to load subscribers");
  }
  return response.data;
};

export const activateAdminSubscriber = async (id: string): Promise<void> => {
  const response = await apiClient.post(`/admin/subscribers/${id}/activate`);
  if (response.error) {
    throw new Error(response.error || "Failed to activate subscriber");
  }
};

export const deactivateAdminSubscriber = async (id: string): Promise<void> => {
  const response = await apiClient.post(`/admin/subscribers/${id}/deactivate`);
  if (response.error) {
    throw new Error(response.error || "Failed to deactivate subscriber");
  }
};

// ── Audit ───────────────────────────────────────────────────────────────

export const getAdminAuditLogs = async (params: {
  action?: string;
  limit?: number;
  offset?: number;
}): Promise<AdminAuditLogListResponse> => {
  const q = buildQuery(params);
  const response = await apiClient.get<AdminAuditLogListResponse>(`/admin/audit-logs${q}`);
  if (response.error || !response.data) {
    throw new Error(response.error || "Failed to load audit logs");
  }
  return response.data;
};

// Vendor actions
export const verifyAdminVendor = async (vendorId: string): Promise<void> => {
  const response = await apiClient.post(`/admin/vendors/${vendorId}/verify`);
  if (response.error) throw new Error(response.error || "Failed to verify vendor");
};

export const unverifyAdminVendor = async (vendorId: string): Promise<void> => {
  const response = await apiClient.post(`/admin/vendors/${vendorId}/unverify`);
  if (response.error) throw new Error(response.error || "Failed to unverify vendor");
};

export const featureAdminVendor = async (vendorId: string): Promise<void> => {
  const response = await apiClient.post(`/admin/vendors/${vendorId}/feature`);
  if (response.error) throw new Error(response.error || "Failed to feature vendor");
};

export const unfeatureAdminVendor = async (vendorId: string): Promise<void> => {
  const response = await apiClient.post(`/admin/vendors/${vendorId}/unfeature`);
  if (response.error) throw new Error(response.error || "Failed to unfeature vendor");
};

export const suspendAdminVendor = async (vendorId: string): Promise<void> => {
  const response = await apiClient.post(`/admin/vendors/${vendorId}/suspend`);
  if (response.error) throw new Error(response.error || "Failed to suspend vendor");
};

export const activateAdminVendor = async (vendorId: string): Promise<void> => {
  const response = await apiClient.post(`/admin/vendors/${vendorId}/activate`);
  if (response.error) throw new Error(response.error || "Failed to activate vendor");
};

export const updateAdminVendor = async (
  vendorId: string,
  updates: {
    business_name?: string;
    category?: string;
    description?: string;
    location?: string;
    email?: string;
    phone?: string;
    website?: string;
  }
): Promise<void> => {
  const response = await apiClient.patch(`/admin/vendors/${vendorId}`, updates);
  if (response.error) throw new Error(response.error || "Failed to update vendor");
};

// User edit & advanced actions
export const updateAdminUser = async (
  userId: string,
  updates: {
    name?: string;
    email?: string;
    phone?: string;
    user_type?: string;
  }
): Promise<void> => {
  const response = await apiClient.patch(`/admin/users/${userId}`, updates);
  if (response.error) throw new Error(response.error || "Failed to update user");
};

export const updateAdminUserNotes = async (
  userId: string,
  adminNotes: string
): Promise<void> => {
  const response = await apiClient.patch(`/admin/users/${userId}/notes`, { adminNotes });
  if (response.error) throw new Error(response.error || "Failed to update notes");
};

export const resetAdminUserPassword = async (
  userId: string
): Promise<{ temporaryPassword: string }> => {
  const response = await apiClient.post<{ temporaryPassword: string }>(
    `/admin/users/${userId}/reset-password`
  );
  if (response.error || !response.data) {
    throw new Error(response.error || "Failed to reset password");
  }
  return response.data;
};

// Dashboard activity feed
export interface AdminDashboardActivity {
  activeUsers: {
    last24h: number;
    last7d: number;
    last30d: number;
  };
  recentRegistrations: Array<{
    id: string;
    name: string | null;
    email: string | null;
    userType: string;
    createdAt: string;
  }>;
  recentInquiries: Array<{
    id: string;
    senderName: string;
    vendorName: string;
    status: string;
    createdAt: string;
  }>;
  recentAuditLogs: Array<{
    id: string;
    action: string;
    resourceType: string | null;
    actorName: string | null;
    createdAt: string;
  }>;
}

export const getAdminDashboardActivity = async (): Promise<AdminDashboardActivity> => {
  const response = await apiClient.get<AdminDashboardActivity>("/admin/dashboard/activity");
  if (response.error || !response.data) {
    throw new Error(response.error || "Failed to load dashboard activity");
  }
  return response.data;
};
