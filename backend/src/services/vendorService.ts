import {
  VendorProfileModel,
  VendorServiceModel,
  VendorImageModel,
  VendorBookingModel,
  VendorInquiryModel,
  VendorProfile,
  VendorService,
  VendorImage,
  VendorBooking,
  VendorInquiry,
} from '../models/VendorProfile.js';

export interface VendorProfileInput {
  business_name: string;
  category: string;
  description?: string | null;
  location?: string | null;
  email?: string | null;
  phone?: string | null;
  website?: string | null;
  profile_image_url?: string | null;
  cover_image_url?: string | null;
  social_links?: unknown;
  services?: Array<{
    name: string;
    description?: string | null;
    price?: number | null;
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
      await VendorServiceModel.replaceForVendor(profile.id, input.services);
    }

    if (input.images) {
      await VendorImageModel.replaceForVendor(profile.id, input.images);
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
};
