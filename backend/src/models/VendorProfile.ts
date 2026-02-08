import { query, queryOne } from '../config/database.js';

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
  social_links: unknown;
  created_at: Date;
  updated_at: Date;
}

export interface VendorService {
  id: string;
  vendor_id: string;
  name: string;
  description: string | null;
  price: number | null;
  created_at: Date;
}

export interface VendorImage {
  id: string;
  vendor_id: string;
  url: string;
  alt_text: string | null;
  is_primary: boolean;
  display_order: number;
  created_at: Date;
}

export interface CreateVendorProfileInput {
  user_id: string;
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
}

export interface UpdateVendorProfileInput {
  business_name?: string;
  category?: string;
  description?: string | null;
  location?: string | null;
  email?: string | null;
  phone?: string | null;
  website?: string | null;
  profile_image_url?: string | null;
  cover_image_url?: string | null;
  social_links?: unknown;
  is_active?: boolean;
}

export const VendorProfileModel = {
  async normalizeSocialLinks(value: unknown) {
    if (value === undefined) return undefined;
    return JSON.stringify(value);
  },

  async findById(id: string): Promise<VendorProfile | null> {
    return queryOne<VendorProfile>(
      'SELECT * FROM vendor_profiles WHERE id = $1',
      [id]
    );
  },

  async findByUserId(userId: string): Promise<VendorProfile | null> {
    return queryOne<VendorProfile>(
      'SELECT * FROM vendor_profiles WHERE user_id = $1',
      [userId]
    );
  },

  async listActive(): Promise<VendorProfile[]> {
    return query<VendorProfile>(
      'SELECT * FROM vendor_profiles WHERE is_active = true ORDER BY created_at DESC'
    );
  },

  async create(input: CreateVendorProfileInput): Promise<VendorProfile> {
    const socialLinks = await this.normalizeSocialLinks(input.social_links);
    const result = await queryOne<VendorProfile>(
      `INSERT INTO vendor_profiles (
        user_id,
        business_name,
        category,
        description,
        location,
        email,
        phone,
        website,
        profile_image_url,
        cover_image_url,
        social_links
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11::jsonb)
      RETURNING *`,
      [
        input.user_id,
        input.business_name,
        input.category,
        input.description || null,
        input.location || null,
        input.email || null,
        input.phone || null,
        input.website || null,
        input.profile_image_url || null,
        input.cover_image_url || null,
        socialLinks ?? '[]',
      ]
    );

    if (!result) {
      throw new Error('Failed to create vendor profile');
    }

    return result;
  },

  async update(id: string, input: UpdateVendorProfileInput): Promise<VendorProfile | null> {
    const fields: string[] = [];
    const values: unknown[] = [];
    let paramIndex = 1;

    if (input.business_name !== undefined) {
      fields.push(`business_name = $${paramIndex++}`);
      values.push(input.business_name);
    }
    if (input.category !== undefined) {
      fields.push(`category = $${paramIndex++}`);
      values.push(input.category);
    }
    if (input.description !== undefined) {
      fields.push(`description = $${paramIndex++}`);
      values.push(input.description || null);
    }
    if (input.location !== undefined) {
      fields.push(`location = $${paramIndex++}`);
      values.push(input.location || null);
    }
    if (input.email !== undefined) {
      fields.push(`email = $${paramIndex++}`);
      values.push(input.email || null);
    }
    if (input.phone !== undefined) {
      fields.push(`phone = $${paramIndex++}`);
      values.push(input.phone || null);
    }
    if (input.website !== undefined) {
      fields.push(`website = $${paramIndex++}`);
      values.push(input.website || null);
    }
    if (input.profile_image_url !== undefined) {
      fields.push(`profile_image_url = $${paramIndex++}`);
      values.push(input.profile_image_url || null);
    }
    if (input.cover_image_url !== undefined) {
      fields.push(`cover_image_url = $${paramIndex++}`);
      values.push(input.cover_image_url || null);
    }
    if (input.social_links !== undefined) {
      const socialLinks = await this.normalizeSocialLinks(input.social_links);
      fields.push(`social_links = $${paramIndex++}::jsonb`);
      values.push(socialLinks ?? '[]');
    }
    if (input.is_active !== undefined) {
      fields.push(`is_active = $${paramIndex++}`);
      values.push(input.is_active);
    }

    if (fields.length === 0) {
      return this.findById(id);
    }

    fields.push(`updated_at = NOW()`);
    values.push(id);

    return queryOne<VendorProfile>(
      `UPDATE vendor_profiles SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
      values
    );
  },
};

export const VendorServiceModel = {
  async findByVendorId(vendorId: string): Promise<VendorService[]> {
    return query<VendorService>(
      'SELECT * FROM vendor_services WHERE vendor_id = $1 ORDER BY created_at ASC',
      [vendorId]
    );
  },

  async replaceForVendor(vendorId: string, services: Array<Omit<VendorService, 'id' | 'vendor_id' | 'created_at'>>): Promise<void> {
    await query('DELETE FROM vendor_services WHERE vendor_id = $1', [vendorId]);
    if (services.length === 0) return;

    await Promise.all(
      services.map(service =>
        query(
          `INSERT INTO vendor_services (vendor_id, name, description, price)
           VALUES ($1, $2, $3, $4)`,
          [
            vendorId,
            service.name,
            service.description || null,
            service.price ?? null,
          ]
        )
      )
    );
  },
};

export const VendorImageModel = {
  async findByVendorId(vendorId: string): Promise<VendorImage[]> {
    return query<VendorImage>(
      'SELECT * FROM vendor_images WHERE vendor_id = $1 ORDER BY display_order ASC, created_at ASC',
      [vendorId]
    );
  },

  async replaceForVendor(vendorId: string, images: Array<Omit<VendorImage, 'id' | 'vendor_id' | 'created_at'>>): Promise<void> {
    await query('DELETE FROM vendor_images WHERE vendor_id = $1', [vendorId]);
    if (images.length === 0) return;

    await Promise.all(
      images.map(image =>
        query(
          `INSERT INTO vendor_images (vendor_id, url, alt_text, is_primary, display_order)
           VALUES ($1, $2, $3, $4, $5)`,
          [
            vendorId,
            image.url,
            image.alt_text || null,
            image.is_primary || false,
            image.display_order ?? 0,
          ]
        )
      )
    );
  },
};

export interface VendorBooking {
  id: string;
  vendor_id: string;
  client_id: string | null;
  client_name: string;
  event_date: Date;
  event_type: string | null;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  notes: string | null;
  total_amount: number | null;
  created_at: Date;
  updated_at: Date;
}

export interface VendorInquiry {
  id: string;
  vendor_id: string;
  sender_id: string | null;
  sender_name: string;
  sender_email: string | null;
  event_date: Date | null;
  message: string;
  status: 'new' | 'replied' | 'archived';
  notes: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface InquiryMessage {
  id: string;
  inquiry_id: string;
  sender_id: string | null;
  sender_type: 'vendor' | 'client';
  message: string;
  read_at: Date | null;
  created_at: Date;
}

export const VendorBookingModel = {
  async findById(id: string): Promise<VendorBooking | null> {
    return queryOne<VendorBooking>(
      'SELECT * FROM vendor_bookings WHERE id = $1',
      [id]
    );
  },

  async update(id: string, input: {
    client_name?: string;
    event_date?: string;
    event_type?: string;
    status?: 'pending' | 'confirmed' | 'completed' | 'cancelled';
    notes?: string | null;
    total_amount?: number | null;
  }): Promise<VendorBooking | null> {
    const fields: string[] = [];
    const values: unknown[] = [];
    let paramIndex = 1;

    if (input.client_name !== undefined) {
      fields.push(`client_name = $${paramIndex++}`);
      values.push(input.client_name);
    }
    if (input.event_date !== undefined) {
      fields.push(`event_date = $${paramIndex++}`);
      values.push(input.event_date);
    }
    if (input.event_type !== undefined) {
      fields.push(`event_type = $${paramIndex++}`);
      values.push(input.event_type || 'Wedding');
    }
    if (input.status !== undefined) {
      fields.push(`status = $${paramIndex++}`);
      values.push(input.status);
    }
    if (input.notes !== undefined) {
      fields.push(`notes = $${paramIndex++}`);
      values.push(input.notes || null);
    }
    if (input.total_amount !== undefined) {
      fields.push(`total_amount = $${paramIndex++}`);
      values.push(input.total_amount);
    }

    if (fields.length === 0) {
      return this.findById(id);
    }

    fields.push(`updated_at = NOW()`);
    values.push(id);

    return queryOne<VendorBooking>(
      `UPDATE vendor_bookings SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
      values
    );
  },

  async create(input: {
    vendor_id: string;
    client_name: string;
    event_date: string;
    event_type?: string;
    status?: 'pending' | 'confirmed' | 'completed' | 'cancelled';
    notes?: string | null;
    total_amount?: number | null;
  }): Promise<VendorBooking> {
    const result = await queryOne<VendorBooking>(
      `INSERT INTO vendor_bookings (
        vendor_id,
        client_name,
        event_date,
        event_type,
        status,
        notes,
        total_amount
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *`,
      [
        input.vendor_id,
        input.client_name,
        input.event_date,
        input.event_type || 'Wedding',
        input.status || 'pending',
        input.notes || null,
        input.total_amount ?? null,
      ]
    );

    if (!result) {
      throw new Error('Failed to create booking');
    }

    return result;
  },

  async findUpcomingByVendorId(vendorId: string, limit = 5): Promise<VendorBooking[]> {
    return query<VendorBooking>(
      `SELECT * FROM vendor_bookings
       WHERE vendor_id = $1 AND status IN ('pending', 'confirmed')
       ORDER BY event_date ASC
       LIMIT $2`,
      [vendorId, limit]
    );
  },

  async countByVendorId(vendorId: string): Promise<{ total: number; upcoming: number; confirmed: number }> {
    const result = await queryOne<{ total: string; upcoming: string; confirmed: string }>(
      `SELECT
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE status IN ('pending', 'confirmed')) as upcoming,
        COUNT(*) FILTER (WHERE status = 'confirmed') as confirmed
       FROM vendor_bookings WHERE vendor_id = $1`,
      [vendorId]
    );

    return {
      total: parseInt(result?.total || '0', 10),
      upcoming: parseInt(result?.upcoming || '0', 10),
      confirmed: parseInt(result?.confirmed || '0', 10),
    };
  },
};

export const VendorInquiryModel = {
  async create(input: {
    vendor_id: string;
    sender_id?: string | null;
    sender_name: string;
    sender_email?: string | null;
    event_date?: string | null;
    message: string;
  }): Promise<VendorInquiry> {
    const result = await queryOne<VendorInquiry>(
      `INSERT INTO vendor_inquiries (
        vendor_id,
        sender_id,
        sender_name,
        sender_email,
        event_date,
        message
      )
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *`,
      [
        input.vendor_id,
        input.sender_id || null,
        input.sender_name,
        input.sender_email || null,
        input.event_date || null,
        input.message,
      ]
    );

    if (!result) {
      throw new Error('Failed to create inquiry');
    }

    return result;
  },

  async findById(id: string): Promise<VendorInquiry | null> {
    return queryOne<VendorInquiry>(
      'SELECT * FROM vendor_inquiries WHERE id = $1',
      [id]
    );
  },

  async update(id: string, input: {
    status?: 'new' | 'replied' | 'archived';
    notes?: string | null;
  }): Promise<VendorInquiry | null> {
    const fields: string[] = [];
    const values: unknown[] = [];
    let paramIndex = 1;

    if (input.status !== undefined) {
      fields.push(`status = $${paramIndex++}`);
      values.push(input.status);
    }
    if (input.notes !== undefined) {
      fields.push(`notes = $${paramIndex++}`);
      values.push(input.notes || null);
    }

    if (fields.length === 0) {
      return this.findById(id);
    }

    fields.push(`updated_at = NOW()`);
    values.push(id);

    return queryOne<VendorInquiry>(
      `UPDATE vendor_inquiries SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
      values
    );
  },

  async delete(id: string): Promise<boolean> {
    const result = await query(
      'DELETE FROM vendor_inquiries WHERE id = $1 RETURNING id',
      [id]
    );
    return result.length > 0;
  },

  async listByVendorId(vendorId: string): Promise<VendorInquiry[]> {
    return query<VendorInquiry>(
      `SELECT * FROM vendor_inquiries WHERE vendor_id = $1 ORDER BY created_at DESC`,
      [vendorId]
    );
  },

  async findRecentByVendorId(vendorId: string, limit = 5): Promise<VendorInquiry[]> {
    return query<VendorInquiry>(
      `SELECT * FROM vendor_inquiries
       WHERE vendor_id = $1 AND status IN ('new', 'replied')
       ORDER BY created_at DESC
       LIMIT $2`,
      [vendorId, limit]
    );
  },

  async countByVendorId(vendorId: string): Promise<{ total: number; new: number }> {
    const result = await queryOne<{ total: string; new: string }>(
      `SELECT
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE status = 'new') as new
       FROM vendor_inquiries WHERE vendor_id = $1`,
      [vendorId]
    );

    return {
      total: parseInt(result?.total || '0', 10),
      new: parseInt(result?.new || '0', 10),
    };
  },

  async listBySenderId(senderId: string): Promise<VendorInquiry[]> {
    return query<VendorInquiry>(
      `SELECT * FROM vendor_inquiries WHERE sender_id = $1 ORDER BY created_at DESC`,
      [senderId]
    );
  },

  async findByIdAndSenderId(id: string, senderId: string): Promise<VendorInquiry | null> {
    return queryOne<VendorInquiry>(
      'SELECT * FROM vendor_inquiries WHERE id = $1 AND sender_id = $2',
      [id, senderId]
    );
  },
};

export const InquiryMessageModel = {
  async create(input: {
    inquiry_id: string;
    sender_id: string | null;
    sender_type: 'vendor' | 'client';
    message: string;
  }): Promise<InquiryMessage> {
    const result = await queryOne<InquiryMessage>(
      `INSERT INTO inquiry_messages (inquiry_id, sender_id, sender_type, message)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [input.inquiry_id, input.sender_id, input.sender_type, input.message]
    );

    if (!result) {
      throw new Error('Failed to create inquiry message');
    }

    return result;
  },

  async listByInquiryId(inquiryId: string): Promise<InquiryMessage[]> {
    return query<InquiryMessage>(
      `SELECT * FROM inquiry_messages WHERE inquiry_id = $1 ORDER BY created_at ASC`,
      [inquiryId]
    );
  },

  async markAsRead(messageId: string): Promise<InquiryMessage | null> {
    return queryOne<InquiryMessage>(
      `UPDATE inquiry_messages SET read_at = NOW() WHERE id = $1 RETURNING *`,
      [messageId]
    );
  },

  async markAllAsReadByInquiryId(inquiryId: string, senderType: 'vendor' | 'client'): Promise<void> {
    const oppositeType = senderType === 'vendor' ? 'client' : 'vendor';
    await query(
      `UPDATE inquiry_messages SET read_at = NOW()
       WHERE inquiry_id = $1 AND sender_type = $2 AND read_at IS NULL`,
      [inquiryId, oppositeType]
    );
  },

  async countUnreadByInquiryId(inquiryId: string, forSenderType: 'vendor' | 'client'): Promise<number> {
    const oppositeType = forSenderType === 'vendor' ? 'client' : 'vendor';
    const result = await queryOne<{ count: string }>(
      `SELECT COUNT(*) as count FROM inquiry_messages
       WHERE inquiry_id = $1 AND sender_type = $2 AND read_at IS NULL`,
      [inquiryId, oppositeType]
    );
    return parseInt(result?.count || '0', 10);
  },
};
