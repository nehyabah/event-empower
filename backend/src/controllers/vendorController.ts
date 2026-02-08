import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { vendorService } from '../services/vendorService.js';
import { storageService } from '../services/storageService.js';
import { env } from '../config/env.js';

const vendorProfileSchema = z.object({
  businessName: z.string().min(1, 'Business name is required'),
  category: z.string().min(1, 'Category is required'),
  description: z.string().optional(),
  location: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().optional(),
  website: z.string().optional(),
  profileImageUrl: z.string().optional(),
  coverImageUrl: z.string().optional(),
  socialLinks: z.array(
    z.object({
      platform: z.string().min(1),
      url: z.string().optional(),
    })
  ).optional(),
  services: z.array(
    z.object({
      name: z.string().min(1),
      description: z.string().optional(),
      price: z.union([z.number(), z.string()]).optional(),
    })
  ).optional(),
  images: z.array(
    z.object({
      url: z.string().min(1),
      altText: z.string().optional(),
      isPrimary: z.boolean().optional(),
      displayOrder: z.number().optional(),
    })
  ).optional(),
});

const vendorBookingSchema = z.object({
  clientName: z.string().min(1, 'Client name is required'),
  eventDate: z.string().min(1, 'Event date is required'),
  eventType: z.string().optional(),
  status: z.enum(['pending', 'confirmed', 'completed', 'cancelled']).optional(),
  notes: z.string().optional(),
  totalAmount: z.union([z.number(), z.string()]).optional(),
});

const updateVendorBookingSchema = z.object({
  clientName: z.string().min(1).optional(),
  eventDate: z.string().min(1).optional(),
  eventType: z.string().optional(),
  status: z.enum(['pending', 'confirmed', 'completed', 'cancelled']).optional(),
  notes: z.string().optional(),
  totalAmount: z.union([z.number(), z.string()]).optional(),
});

const createInquirySchema = z.object({
  vendorId: z.string().uuid(),
  senderName: z.string().min(1),
  senderEmail: z.string().email().optional().or(z.literal('')),
  eventDate: z.string().optional(),
  message: z.string().min(1),
});

const updateInquirySchema = z.object({
  status: z.enum(['new', 'replied', 'archived']).optional(),
  notes: z.string().optional(),
});

const sendMessageSchema = z.object({
  message: z.string().min(1, 'Message is required'),
});

const toNumber = (value: number | string | undefined) => {
  if (value === undefined) return undefined;
  if (typeof value === 'number') return Number.isFinite(value) ? value : undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
};

type UploadRequest = Request & { file?: { buffer: Buffer; mimetype: string; originalname: string } };

const parseStorageKey = (value: string | null | undefined) => {
  if (!value) return null;
  if (value.startsWith('data:')) return null;
  if (!value.startsWith('http')) return value;

  if (env.STORAGE_BUCKET) {
    const marker = `/${env.STORAGE_BUCKET}/`;
    const index = value.indexOf(marker);
    if (index >= 0) {
      return value.slice(index + marker.length);
    }
  }

  return null;
};

const mapVendorDetails = async (vendor: Awaited<ReturnType<typeof vendorService.getVendorById>>) => {
  if (!vendor) return null;

  const profileImageKey = parseStorageKey(vendor.profile.profile_image_url);
  const coverImageKey = parseStorageKey(vendor.profile.cover_image_url);
  const profileImageUrl = profileImageKey
    ? await storageService.getSignedUrl(profileImageKey)
    : vendor.profile.profile_image_url;
  const coverImageUrl = coverImageKey
    ? await storageService.getSignedUrl(coverImageKey)
    : vendor.profile.cover_image_url;

  const images = await Promise.all(
    vendor.images.map(async (image) => {
      const imageKey = parseStorageKey(image.url);
      if (!imageKey) {
        return { ...image, key: null };
      }
      const url = await storageService.getSignedUrl(imageKey);
      return { ...image, url, key: imageKey };
    })
  );

  return {
    profile: {
      ...vendor.profile,
      profile_image_url: profileImageUrl,
      cover_image_url: coverImageUrl,
      profile_image_key: profileImageKey,
      cover_image_key: coverImageKey,
    },
    services: vendor.services,
    images,
  };
};

export const vendorController = {
  async getVendors(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const vendors = await vendorService.listVendors();
      const mapped = await Promise.all(vendors.map((vendor) => mapVendorDetails(vendor)));
      res.json(mapped.filter(Boolean));
    } catch (error) {
      next(error);
    }
  },

  async getVendor(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const vendor = await vendorService.getVendorById(req.params.id);
      if (!vendor) {
        res.status(404).json({ error: 'Vendor not found' });
        return;
      }
      const mapped = await mapVendorDetails(vendor);
      res.json(mapped);
    } catch (error) {
      next(error);
    }
  },

  async getMyVendorProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const vendor = await vendorService.getVendorByUserId(req.user!.userId);
      const mapped = await mapVendorDetails(vendor);
      res.json(mapped);
    } catch (error) {
      next(error);
    }
  },

  async getVendorDashboard(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await vendorService.getVendorDashboard(req.user!.userId);
      res.json(data);
    } catch (error) {
      next(error);
    }
  },

  async createVendorBooking(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validation = vendorBookingSchema.safeParse(req.body);
      if (!validation.success) {
        res.status(400).json({ error: validation.error.errors[0].message });
        return;
      }

      const data = validation.data;
      const totalAmount =
        data.totalAmount === undefined ? undefined : Number(data.totalAmount);

      const booking = await vendorService.createVendorBooking(req.user!.userId, {
        client_name: data.clientName,
        event_date: data.eventDate,
        event_type: data.eventType,
        status: data.status,
        notes: data.notes,
        total_amount: Number.isFinite(totalAmount) ? totalAmount : undefined,
      });

      res.status(201).json(booking);
    } catch (error) {
      next(error);
    }
  },

  async updateVendorBooking(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validation = updateVendorBookingSchema.safeParse(req.body);
      if (!validation.success) {
        res.status(400).json({ error: validation.error.errors[0].message });
        return;
      }

      const data = validation.data;
      const totalAmount =
        data.totalAmount === undefined ? undefined : Number(data.totalAmount);

      const booking = await vendorService.updateVendorBooking(req.user!.userId, req.params.id, {
        client_name: data.clientName,
        event_date: data.eventDate,
        event_type: data.eventType,
        status: data.status,
        notes: data.notes,
        total_amount: Number.isFinite(totalAmount) ? totalAmount : undefined,
      });

      if (!booking) {
        res.status(404).json({ error: 'Booking not found' });
        return;
      }

      res.json(booking);
    } catch (error) {
      next(error);
    }
  },

  async listVendorInquiries(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const inquiries = await vendorService.listVendorInquiries(req.user!.userId);
      res.json(inquiries);
    } catch (error) {
      next(error);
    }
  },

  async createInquiry(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validation = createInquirySchema.safeParse(req.body);
      if (!validation.success) {
        res.status(400).json({ error: validation.error.errors[0].message });
        return;
      }

      const data = validation.data;
      const inquiry = await vendorService.createVendorInquiry({
        vendor_id: data.vendorId,
        sender_id: req.user?.userId || null,
        sender_name: data.senderName,
        sender_email: data.senderEmail || null,
        event_date: data.eventDate || null,
        message: data.message,
      });

      res.status(201).json(inquiry);
    } catch (error) {
      next(error);
    }
  },

  async updateVendorInquiry(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validation = updateInquirySchema.safeParse(req.body);
      if (!validation.success) {
        res.status(400).json({ error: validation.error.errors[0].message });
        return;
      }

      const inquiry = await vendorService.updateVendorInquiry(req.user!.userId, req.params.id, {
        status: validation.data.status,
        notes: validation.data.notes,
      });

      if (!inquiry) {
        res.status(404).json({ error: 'Inquiry not found' });
        return;
      }

      res.json(inquiry);
    } catch (error) {
      next(error);
    }
  },

  async deleteVendorInquiry(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const deleted = await vendorService.deleteVendorInquiry(req.user!.userId, req.params.id);
      if (!deleted) {
        res.status(404).json({ error: 'Inquiry not found' });
        return;
      }

      res.status(204).send();
    } catch (error) {
      next(error);
    }
  },

  async upsertMyVendorProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validation = vendorProfileSchema.safeParse(req.body);
      if (!validation.success) {
        res.status(400).json({ error: validation.error.errors[0].message });
        return;
      }

      const data = validation.data;
      const mappedImages = (data.images || []).map((image, index) => ({
        url: image.url,
        alt_text: image.altText,
        is_primary: image.isPrimary || false,
        display_order: image.displayOrder ?? index,
      }));

      if (mappedImages.length > 0 && !mappedImages.some(image => image.is_primary)) {
        mappedImages[0].is_primary = true;
      }

      const vendor = await vendorService.upsertVendorProfile(req.user!.userId, {
        business_name: data.businessName,
        category: data.category,
        description: data.description,
        location: data.location,
        email: data.email || undefined,
        phone: data.phone,
        website: data.website,
        profile_image_url: data.profileImageUrl,
        cover_image_url: data.coverImageUrl,
        social_links: data.socialLinks,
        services: (data.services || []).map(service => ({
          name: service.name,
          description: service.description,
          price: toNumber(service.price),
        })),
        images: mappedImages,
      });

      res.json(vendor);
    } catch (error) {
      next(error);
    }
  },

  async uploadVendorImage(req: UploadRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.file) {
        res.status(400).json({ error: 'File is required' });
        return;
      }

      const upload = await storageService.uploadVendorImage(req.user!.userId, req.file);
      res.json(upload);
    } catch (error) {
      next(error);
    }
  },

  // ========== INQUIRY MESSAGES (VENDOR) ==========

  async getInquiryWithMessages(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await vendorService.getInquiryWithMessages(req.user!.userId, req.params.id);
      if (!result) {
        res.status(404).json({ error: 'Inquiry not found' });
        return;
      }
      res.json(result);
    } catch (error) {
      next(error);
    }
  },

  async sendInquiryMessage(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validation = sendMessageSchema.safeParse(req.body);
      if (!validation.success) {
        res.status(400).json({ error: validation.error.errors[0].message });
        return;
      }

      const message = await vendorService.sendInquiryMessageAsVendor(
        req.user!.userId,
        req.params.id,
        validation.data.message
      );
      res.status(201).json(message);
    } catch (error) {
      if (error instanceof Error && error.message === 'Inquiry not found') {
        res.status(404).json({ error: 'Inquiry not found' });
        return;
      }
      next(error);
    }
  },

  async getInquiryMessages(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const messages = await vendorService.getInquiryMessages(req.user!.userId, req.params.id);
      res.json(messages);
    } catch (error) {
      if (error instanceof Error && error.message === 'Inquiry not found') {
        res.status(404).json({ error: 'Inquiry not found' });
        return;
      }
      next(error);
    }
  },
};
