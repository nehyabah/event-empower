// ========== AUTH TYPES ==========

export type UserType = "client" | "vendor" | "planner" | "admin";

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  name: string;
  email: string;
  password: string;
  role: "couple" | "planner" | "vendor";
}

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  userType: UserType;
}

export interface AuthResponse {
  user: {
    id: string;
    email: string | null;
    name: string | null;
    userType: UserType;
    avatarUrl: string | null;
  };
  accessToken: string;
}

// ========== API CLIENT TYPES ==========

export interface ApiResponse<T> {
  data?: T;
  error?: string;
}

export interface TokenStorage {
  getRefreshToken(): Promise<string | null>;
  setRefreshToken(token: string | null): Promise<void>;
  clearAll(): Promise<void>;
}

// ========== VENDOR TYPES ==========

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

// ========== STORY TYPES ==========

export type StoryImageType = "general" | "bride" | "groom";
export type WishlistPriority = "high" | "medium" | "low";

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

// ========== USER / PLANNER TYPES ==========

export type GuestStatus = 'pending' | 'confirmed' | 'declined' | 'maybe';

export type ExpenseCategory =
  | 'venue'
  | 'catering'
  | 'attire'
  | 'decoration'
  | 'photography'
  | 'music'
  | 'transportation'
  | 'accommodation'
  | 'invitations'
  | 'rings'
  | 'gifts'
  | 'beauty'
  | 'other';

export interface UserEvent {
  id: string;
  user_id: string;
  partner1_name: string | null;
  partner2_name: string | null;
  event_date: string | null;
  venue: string | null;
  total_budget: number;
  guest_count_estimate: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Guest {
  id: string;
  user_id: string;
  name: string;
  email: string | null;
  phone: string | null;
  status: GuestStatus;
  guest_group: string | null;
  plus_one: boolean;
  dietary_restrictions: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Expense {
  id: string;
  user_id: string;
  name: string;
  amount: number;
  amount_paid: number;
  category: ExpenseCategory;
  expense_date: string | null;
  paid: boolean;
  notes: string | null;
  vendor_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface ExpenseSummary {
  total_spent: number;
  total_paid: number;
  total_unpaid: number;
  total_budget: number;
  remaining_budget: number;
  by_category: Record<string, number>;
}

export interface TodoItem {
  id: string;
  list_id: string;
  text: string;
  completed: boolean;
  status: 'todo' | 'in_progress' | 'done';
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface TodoList {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  is_completed: boolean;
  created_at: string;
  updated_at: string;
  items: TodoItem[];
}

export interface DashboardData {
  event: UserEvent | null;
  guests: {
    total: number;
    pending: number;
    confirmed: number;
    declined: number;
    maybe: number;
  };
  expenses: ExpenseSummary;
  todos: {
    total_lists: number;
    total_items: number;
    completed_items: number;
    progress: number;
  };
}

// ========== RSVP TYPES ==========

export interface EventInfo {
  partner1Name: string | null;
  partner2Name: string | null;
  eventDate: string | null;
  venue: string | null;
}

export interface RsvpSubmission {
  rsvpCode: string;
  name: string;
  email?: string;
  status: 'confirmed' | 'declined';
  guestCount?: number;
  dietaryNotes?: string;
}

export interface RsvpResponse {
  success: boolean;
  message: string;
  guest: {
    id: string;
    name: string;
    status: string;
  };
}
