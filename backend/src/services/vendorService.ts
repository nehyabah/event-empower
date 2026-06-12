import {
  VendorProfileModel,
  VendorServiceModel,
  VendorImageModel,
  VendorBookingModel,
  VendorInquiryModel,
  InquiryMessageModel,
  VendorProfile,
  VendorService,
  VendorImage,
  VendorBooking,
  VendorInquiry,
  InquiryMessage,
} from '../models/VendorProfile.js';
import { ProjectVendorModel, ProjectVendor } from '../models/ProjectVendor.js';
import { UserEventModel } from '../models/UserEvent.js';
import { queryOne } from '../config/database.js';

export interface VendorProfileInput {
  business_name: string;
  category: string;
  description?: string | null;
  location?: string | null;
  email?: string | null;
  phone?: string | null;
  website?: string | null;
  open_to_travel?: boolean;
  profile_image_url?: string | null;
  cover_image_url?: string | null;
  social_links?: unknown;
  services?: Array<{
    name: string;
    description?: string | null;
    price?: number | null;
    price_min?: number | null;
    price_max?: number | null;
  }>;
  images?: Array<{
    url: string;
    alt_text?: string | null;
    is_primary?: boolean;
    display_order?: number;
  }>;
}

export interface VendorProfileDetails {
  profile: VendorProfile;
  services: VendorService[];
  images: VendorImage[];
}

export interface VendorDashboardData {
  profile: VendorProfile;
  stats: {
    upcoming_events: number;
    confirmed_events: number;
    inquiries_new: number;
    inquiries_total: number;
  };
  upcoming_events: VendorBooking[];
  inquiries: VendorInquiry[];
}

const buildDetails = async (profile: VendorProfile): Promise<VendorProfileDetails> => {
  const [services, images] = await Promise.all([
    VendorServiceModel.findByVendorId(profile.id),
    VendorImageModel.findByVendorId(profile.id),
  ]);

  return { profile, services, images };
};

export const vendorService = {
  async listVendors(): Promise<VendorProfileDetails[]> {
    const profiles = await VendorProfileModel.listActive();
    return Promise.all(profiles.map(buildDetails));
  },

  async getVendorById(id: string): Promise<VendorProfileDetails | null> {
    const profile = await VendorProfileModel.findById(id);
    if (!profile || !profile.is_active) {
      return null;
    }
    return buildDetails(profile);
  },

  async getVendorByUserId(userId: string): Promise<VendorProfileDetails | null> {
    const profile = await VendorProfileModel.findByUserId(userId);
    if (!profile) {
      return null;
    }
    return buildDetails(profile);
  },

  async upsertVendorProfile(userId: string, input: VendorProfileInput): Promise<VendorProfileDetails> {
    const existing = await VendorProfileModel.findByUserId(userId);
    const profile = existing
      ? await VendorProfileModel.update(existing.id, {
          business_name: input.business_name,
          category: input.category,
          description: input.description,
          location: input.location,
          email: input.email,
          phone: input.phone,
          website: input.website,
          open_to_travel: input.open_to_travel,
          profile_image_url: input.profile_image_url,
          cover_image_url: input.cover_image_url,
          social_links: input.social_links,
        })
      : await VendorProfileModel.create({
          user_id: userId,
          business_name: input.business_name,
          category: input.category,
          description: input.description,
          location: input.location,
          email: input.email,
          phone: input.phone,
          website: input.website,
          profile_image_url: input.profile_image_url,
          cover_image_url: input.cover_image_url,
          social_links: input.social_links,
        });

    if (!profile) {
      throw new Error('Failed to save vendor profile');
    }

    if (input.services) {
      await VendorServiceModel.replaceForVendor(profile.id, input.services.map(s => ({
        name: s.name,
        description: s.description ?? null,
        price: s.price_min ?? s.price ?? null,
        price_min: s.price_min ?? null,
        price_max: s.price_max ?? null,
      })));
    }

    if (input.images) {
      await VendorImageModel.replaceForVendor(profile.id, input.images.map(img => ({
        url: img.url,
        alt_text: img.alt_text ?? null,
        is_primary: img.is_primary ?? false,
        display_order: img.display_order ?? 0,
      })));
    }

    return buildDetails(profile);
  },

  async getVendorDashboard(userId: string): Promise<VendorDashboardData> {
    const profile = await VendorProfileModel.findByUserId(userId);
    if (!profile) {
      throw new Error('Vendor profile not found');
    }

    const [bookingStats, inquiryStats, upcomingEvents, inquiries] = await Promise.all([
      VendorBookingModel.countByVendorId(profile.id),
      VendorInquiryModel.countByVendorId(profile.id),
      VendorBookingModel.findUpcomingByVendorId(profile.id, 5),
      VendorInquiryModel.findRecentByVendorId(profile.id, 5),
    ]);

    return {
      profile,
      stats: {
        upcoming_events: bookingStats.upcoming,
        confirmed_events: bookingStats.confirmed,
        inquiries_new: inquiryStats.new,
        inquiries_total: inquiryStats.total,
      },
      upcoming_events: upcomingEvents,
      inquiries,
    };
  },

  async createVendorBooking(userId: string, input: {
    client_name: string;
    event_date: string;
    event_type?: string;
    status?: 'pending' | 'confirmed' | 'completed' | 'cancelled';
    notes?: string | null;
    total_amount?: number | null;
  }): Promise<VendorBooking> {
    const profile = await VendorProfileModel.findByUserId(userId);
    if (!profile) {
      throw new Error('Vendor profile not found');
    }

    return VendorBookingModel.create({
      vendor_id: profile.id,
      client_name: input.client_name,
      event_date: input.event_date,
      event_type: input.event_type,
      status: input.status,
      notes: input.notes,
      total_amount: input.total_amount,
    });
  },

  async updateVendorBooking(userId: string, bookingId: string, input: {
    client_name?: string;
    event_date?: string;
    event_type?: string;
    status?: 'pending' | 'confirmed' | 'completed' | 'cancelled';
    notes?: string | null;
    total_amount?: number | null;
  }): Promise<VendorBooking | null> {
    const profile = await VendorProfileModel.findByUserId(userId);
    if (!profile) {
      throw new Error('Vendor profile not found');
    }

    const booking = await VendorBookingModel.findById(bookingId);
    if (!booking || booking.vendor_id !== profile.id) {
      return null;
    }

    return VendorBookingModel.update(bookingId, input);
  },

  async listVendorInquiries(userId: string): Promise<VendorInquiry[]> {
    const profile = await VendorProfileModel.findByUserId(userId);
    if (!profile) {
      throw new Error('Vendor profile not found');
    }
    return VendorInquiryModel.listByVendorId(profile.id);
  },

  async createVendorInquiry(input: {
    vendor_id: string;
    sender_id?: string | null;
    sender_name: string;
    sender_email?: string | null;
    event_date?: string | null;
    message: string;
  }): Promise<VendorInquiry> {
    return VendorInquiryModel.create(input);
  },

  async updateVendorInquiry(userId: string, inquiryId: string, input: {
    status?: 'new' | 'replied' | 'archived';
    notes?: string | null;
  }): Promise<VendorInquiry | null> {
    const profile = await VendorProfileModel.findByUserId(userId);
    if (!profile) {
      throw new Error('Vendor profile not found');
    }

    const inquiry = await VendorInquiryModel.findById(inquiryId);
    if (!inquiry || inquiry.vendor_id !== profile.id) {
      return null;
    }

    return VendorInquiryModel.update(inquiryId, input);
  },

  async deleteVendorInquiry(userId: string, inquiryId: string): Promise<boolean> {
    const profile = await VendorProfileModel.findByUserId(userId);
    if (!profile) {
      throw new Error('Vendor profile not found');
    }

    const inquiry = await VendorInquiryModel.findById(inquiryId);
    if (!inquiry || inquiry.vendor_id !== profile.id) {
      return false;
    }

    return VendorInquiryModel.delete(inquiryId);
  },

  // ========== INQUIRY MESSAGES (VENDOR) ==========

  async getInquiryWithMessages(userId: string, inquiryId: string): Promise<{
    inquiry: VendorInquiry;
    messages: InquiryMessage[];
    unreadCount: number;
  } | null> {
    const profile = await VendorProfileModel.findByUserId(userId);
    if (!profile) {
      throw new Error('Vendor profile not found');
    }

    const inquiry = await VendorInquiryModel.findById(inquiryId);
    if (!inquiry || inquiry.vendor_id !== profile.id) {
      return null;
    }

    const [messages, unreadCount] = await Promise.all([
      InquiryMessageModel.listByInquiryId(inquiryId),
      InquiryMessageModel.countUnreadByInquiryId(inquiryId, 'vendor'),
    ]);

    // Mark messages from client as read
    await InquiryMessageModel.markAllAsReadByInquiryId(inquiryId, 'vendor');

    return { inquiry, messages, unreadCount };
  },

  async sendInquiryMessageAsVendor(userId: string, inquiryId: string, message: string): Promise<InquiryMessage> {
    const profile = await VendorProfileModel.findByUserId(userId);
    if (!profile) {
      throw new Error('Vendor profile not found');
    }

    const inquiry = await VendorInquiryModel.findById(inquiryId);
    if (!inquiry || inquiry.vendor_id !== profile.id) {
      throw new Error('Inquiry not found');
    }

    const newMessage = await InquiryMessageModel.create({
      inquiry_id: inquiryId,
      sender_id: userId,
      sender_type: 'vendor',
      message,
    });

    // Update inquiry status to replied if it was new
    if (inquiry.status === 'new') {
      await VendorInquiryModel.update(inquiryId, { status: 'replied' });
    }

    return newMessage;
  },

  async getInquiryMessages(userId: string, inquiryId: string): Promise<InquiryMessage[]> {
    const profile = await VendorProfileModel.findByUserId(userId);
    if (!profile) {
      throw new Error('Vendor profile not found');
    }

    const inquiry = await VendorInquiryModel.findById(inquiryId);
    if (!inquiry || inquiry.vendor_id !== profile.id) {
      throw new Error('Inquiry not found');
    }

    return InquiryMessageModel.listByInquiryId(inquiryId);
  },

  // ========== CLIENT INQUIRIES ==========

  async listClientInquiries(userId: string): Promise<Array<VendorInquiry & { vendor_name: string; unread_count: number }>> {
    const inquiries = await VendorInquiryModel.listBySenderId(userId);

    const enrichedInquiries = await Promise.all(
      inquiries.map(async (inquiry) => {
        const [vendor, unreadCount] = await Promise.all([
          VendorProfileModel.findById(inquiry.vendor_id),
          InquiryMessageModel.countUnreadByInquiryId(inquiry.id, 'client'),
        ]);
        return {
          ...inquiry,
          vendor_name: vendor?.business_name || 'Unknown Vendor',
          unread_count: unreadCount,
        };
      })
    );

    return enrichedInquiries;
  },

  async getClientInquiryWithMessages(userId: string, inquiryId: string): Promise<{
    inquiry: VendorInquiry & { vendor_name: string };
    messages: InquiryMessage[];
    unreadCount: number;
  } | null> {
    const inquiry = await VendorInquiryModel.findByIdAndSenderId(inquiryId, userId);
    if (!inquiry) {
      return null;
    }

    const [vendor, messages, unreadCount] = await Promise.all([
      VendorProfileModel.findById(inquiry.vendor_id),
      InquiryMessageModel.listByInquiryId(inquiryId),
      InquiryMessageModel.countUnreadByInquiryId(inquiryId, 'client'),
    ]);

    // Mark messages from vendor as read
    await InquiryMessageModel.markAllAsReadByInquiryId(inquiryId, 'client');

    return {
      inquiry: {
        ...inquiry,
        vendor_name: vendor?.business_name || 'Unknown Vendor',
      },
      messages,
      unreadCount,
    };
  },

  async sendInquiryMessageAsClient(userId: string, inquiryId: string, message: string): Promise<InquiryMessage> {
    const inquiry = await VendorInquiryModel.findByIdAndSenderId(inquiryId, userId);
    if (!inquiry) {
      throw new Error('Inquiry not found');
    }

    return InquiryMessageModel.create({
      inquiry_id: inquiryId,
      sender_id: userId,
      sender_type: 'client',
      message,
    });
  },

  // ========== VENDOR PROJECTS ==========

  async getVendorProjects(userId: string): Promise<Array<ProjectVendor & { couple_names: string | null; event_date: Date | null }>> {
    const profile = await VendorProfileModel.findByUserId(userId);
    if (!profile) return [];

    const projectVendors = await ProjectVendorModel.findByVendorProfileId(profile.id);

    const enriched = await Promise.all(
      projectVendors.map(async (pv) => {
        const event = await UserEventModel.findById(pv.event_id);
        const couple_names = event
          ? [event.partner1_name, event.partner2_name].filter(Boolean).join(' & ') || null
          : null;
        return {
          ...pv,
          couple_names,
          event_date: event?.event_date ?? null,
        };
      })
    );

    return enriched;
  },

  async getVendorWorkspace(userId: string): Promise<Array<ProjectVendor & {
    couple_names: string | null;
    event_date: Date | null;
    venue: string | null;
    planner_name: string | null;
    planner_email: string | null;
  }>> {
    const profile = await VendorProfileModel.findByUserId(userId);
    if (!profile) return [];

    const projectVendors = await ProjectVendorModel.findByVendorProfileId(profile.id);

    const enriched = await Promise.all(
      projectVendors.map(async (pv) => {
        const event = await UserEventModel.findById(pv.event_id);
        const couple_names = event
          ? [event.partner1_name, event.partner2_name].filter(Boolean).join(' & ') || null
          : null;

        let planner_name: string | null = null;
        let planner_email: string | null = null;
        if (event?.planner_id) {
          const plannerRow = await queryOne<{ planner_name: string; planner_email: string }>(
            'SELECT u.name as planner_name, u.email as planner_email FROM users u WHERE u.id = $1',
            [event.planner_id]
          );
          if (plannerRow) {
            planner_name = plannerRow.planner_name;
            planner_email = plannerRow.planner_email;
          }
        }

        return {
          ...pv,
          couple_names,
          event_date: event?.event_date ?? null,
          venue: event?.venue ?? null,
          planner_name,
          planner_email,
        };
      })
    );

    return enriched;
  },
};
