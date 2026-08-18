import { CoupleStoryModel, UpsertCoupleStoryInput } from '../models/CoupleStory.js';
import { StoryImageModel, CreateStoryImageInput } from '../models/StoryImage.js';
import { StoryCommentModel, CreateStoryCommentInput } from '../models/StoryComment.js';
import { WishlistItemModel, CreateWishlistItemInput, UpdateWishlistItemInput } from '../models/WishlistItem.js';
import { BankDetailModel, CreateBankDetailInput, UpdateBankDetailInput } from '../models/BankDetail.js';
import { UserEventModel } from '../models/UserEvent.js';
import { query, queryOne } from '../config/database.js';

// --- New entity types ---

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
  side: 'bride' | 'groom' | 'both';
  bio: string | null;
  image_url: string | null;
  sort_order: number;
  created_at: string;
}

export interface TravelInfoItem {
  id: string;
  user_id: string;
  title: string;
  category: 'hotel' | 'transport' | 'parking' | 'other';
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

export const storyService = {
  async getStoryBundle(userId: string) {
    const [story, images, comments, wishlist, bankDetails, timeline, weddingParty, travelInfo, faqItems, event] = await Promise.all([
      CoupleStoryModel.findByUserId(userId),
      StoryImageModel.listByUserId(userId),
      StoryCommentModel.listByUserId(userId),
      WishlistItemModel.listByUserId(userId),
      BankDetailModel.listByUserId(userId),
      this.listTimeline(userId),
      this.listWeddingParty(userId),
      this.listTravel(userId),
      this.listFaq(userId),
      UserEventModel.findByUserId(userId),
    ]);

    // Enough for the wedding site to show an RSVP call to action. The code is
    // already public (it is the RSVP link), but nothing else from the event is
    // exposed here.
    const rsvp = event
      ? {
          code: event.rsvp_code,
          deadline: event.rsvp_deadline,
          closed:
            Boolean(event.rsvp_closed) ||
            Boolean(event.rsvp_deadline && new Date(event.rsvp_deadline) < new Date(new Date().toDateString())),
        }
      : null;

    return {
      story,
      images,
      comments,
      wishlist,
      bankDetails,
      timeline,
      weddingParty,
      travelInfo,
      faqItems,
      rsvp,
    };
  },

  async upsertStory(userId: string, input: UpsertCoupleStoryInput) {
    return CoupleStoryModel.upsert(userId, input);
  },

  // --- Images ---
  async listImages(userId: string) {
    return StoryImageModel.listByUserId(userId);
  },
  async addImage(userId: string, input: CreateStoryImageInput) {
    return StoryImageModel.create(userId, input);
  },
  async deleteImage(userId: string, id: string) {
    return StoryImageModel.delete(userId, id);
  },

  // --- Comments ---
  async listComments(userId: string) {
    return StoryCommentModel.listByUserId(userId);
  },
  async addComment(userId: string, input: CreateStoryCommentInput) {
    return StoryCommentModel.create(userId, input);
  },

  // --- Wishlist ---
  async listWishlist(userId: string) {
    return WishlistItemModel.listByUserId(userId);
  },
  async addWishlistItem(userId: string, input: CreateWishlistItemInput) {
    return WishlistItemModel.create(userId, input);
  },
  async updateWishlistItem(userId: string, id: string, input: UpdateWishlistItemInput) {
    return WishlistItemModel.update(userId, id, input);
  },
  async deleteWishlistItem(userId: string, id: string) {
    return WishlistItemModel.delete(userId, id);
  },

  // --- Bank Details ---
  async listBankDetails(userId: string) {
    return BankDetailModel.listByUserId(userId);
  },
  async addBankDetail(userId: string, input: CreateBankDetailInput) {
    return BankDetailModel.create(userId, input);
  },
  async updateBankDetail(userId: string, id: string, input: UpdateBankDetailInput) {
    return BankDetailModel.update(userId, id, input);
  },
  async deleteBankDetail(userId: string, id: string) {
    return BankDetailModel.delete(userId, id);
  },

  // --- Slug ---
  async checkSlugAvailability(slug: string, excludeUserId?: string) {
    return CoupleStoryModel.isSlugAvailable(slug, excludeUserId);
  },

  async getStoryBySlug(slug: string) {
    const story = await CoupleStoryModel.findBySlug(slug);
    if (!story || !story.site_published) return null;
    return this.getStoryBundle(story.user_id);
  },

  // --- Timeline ---
  async listTimeline(userId: string): Promise<TimelineEvent[]> {
    return query<TimelineEvent>(
      'SELECT * FROM story_timeline_events WHERE user_id = $1 ORDER BY sort_order ASC, created_at ASC',
      [userId]
    );
  },
  async addTimeline(userId: string, input: { title: string; date?: string; description?: string; image_url?: string }) {
    const maxOrder = await queryOne<{ max: number }>(
      'SELECT COALESCE(MAX(sort_order), -1) as max FROM story_timeline_events WHERE user_id = $1',
      [userId]
    );
    return queryOne<TimelineEvent>(
      `INSERT INTO story_timeline_events (user_id, title, date, description, image_url, sort_order)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [userId, input.title, input.date || null, input.description || null, input.image_url || null, (maxOrder?.max ?? -1) + 1]
    );
  },
  async updateTimeline(userId: string, id: string, input: { title?: string; date?: string; description?: string; image_url?: string }) {
    const fields: string[] = [];
    const values: unknown[] = [];
    let idx = 1;
    const add = (col: string, val: unknown) => { fields.push(`${col} = $${idx++}`); values.push(val); };

    if (input.title !== undefined) add('title', input.title);
    if (input.date !== undefined) add('date', input.date);
    if (input.description !== undefined) add('description', input.description);
    if (input.image_url !== undefined) add('image_url', input.image_url);

    if (fields.length === 0) return null;
    values.push(id, userId);
    return queryOne<TimelineEvent>(
      `UPDATE story_timeline_events SET ${fields.join(', ')} WHERE id = $${idx++} AND user_id = $${idx} RETURNING *`,
      values
    );
  },
  async deleteTimeline(userId: string, id: string) {
    const result = await queryOne<{ id: string }>(
      'DELETE FROM story_timeline_events WHERE id = $1 AND user_id = $2 RETURNING id',
      [id, userId]
    );
    return !!result;
  },
  async reorderTimeline(userId: string, ids: string[]) {
    for (let i = 0; i < ids.length; i++) {
      await query(
        'UPDATE story_timeline_events SET sort_order = $1 WHERE id = $2 AND user_id = $3',
        [i, ids[i], userId]
      );
    }
    return true;
  },

  // --- Wedding Party ---
  async listWeddingParty(userId: string): Promise<WeddingPartyMember[]> {
    return query<WeddingPartyMember>(
      'SELECT * FROM story_wedding_party WHERE user_id = $1 ORDER BY sort_order ASC, created_at ASC',
      [userId]
    );
  },
  async addWeddingParty(userId: string, input: { name: string; role: string; side?: string; bio?: string; image_url?: string }) {
    const maxOrder = await queryOne<{ max: number }>(
      'SELECT COALESCE(MAX(sort_order), -1) as max FROM story_wedding_party WHERE user_id = $1',
      [userId]
    );
    return queryOne<WeddingPartyMember>(
      `INSERT INTO story_wedding_party (user_id, name, role, side, bio, image_url, sort_order)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [userId, input.name, input.role, input.side || 'both', input.bio || null, input.image_url || null, (maxOrder?.max ?? -1) + 1]
    );
  },
  async updateWeddingParty(userId: string, id: string, input: { name?: string; role?: string; side?: string; bio?: string; image_url?: string }) {
    const fields: string[] = [];
    const values: unknown[] = [];
    let idx = 1;
    const add = (col: string, val: unknown) => { fields.push(`${col} = $${idx++}`); values.push(val); };

    if (input.name !== undefined) add('name', input.name);
    if (input.role !== undefined) add('role', input.role);
    if (input.side !== undefined) add('side', input.side);
    if (input.bio !== undefined) add('bio', input.bio);
    if (input.image_url !== undefined) add('image_url', input.image_url);

    if (fields.length === 0) return null;
    values.push(id, userId);
    return queryOne<WeddingPartyMember>(
      `UPDATE story_wedding_party SET ${fields.join(', ')} WHERE id = $${idx++} AND user_id = $${idx} RETURNING *`,
      values
    );
  },
  async deleteWeddingParty(userId: string, id: string) {
    const result = await queryOne<{ id: string }>(
      'DELETE FROM story_wedding_party WHERE id = $1 AND user_id = $2 RETURNING id',
      [id, userId]
    );
    return !!result;
  },
  async reorderWeddingParty(userId: string, ids: string[]) {
    for (let i = 0; i < ids.length; i++) {
      await query(
        'UPDATE story_wedding_party SET sort_order = $1 WHERE id = $2 AND user_id = $3',
        [i, ids[i], userId]
      );
    }
    return true;
  },

  // --- Travel Info ---
  async listTravel(userId: string): Promise<TravelInfoItem[]> {
    return query<TravelInfoItem>(
      'SELECT * FROM story_travel_info WHERE user_id = $1 ORDER BY sort_order ASC, created_at ASC',
      [userId]
    );
  },
  async addTravel(userId: string, input: { title: string; category?: string; description?: string; address?: string; link?: string; image_url?: string }) {
    const maxOrder = await queryOne<{ max: number }>(
      'SELECT COALESCE(MAX(sort_order), -1) as max FROM story_travel_info WHERE user_id = $1',
      [userId]
    );
    return queryOne<TravelInfoItem>(
      `INSERT INTO story_travel_info (user_id, title, category, description, address, link, image_url, sort_order)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [userId, input.title, input.category || 'hotel', input.description || null, input.address || null, input.link || null, input.image_url || null, (maxOrder?.max ?? -1) + 1]
    );
  },
  async updateTravel(userId: string, id: string, input: { title?: string; category?: string; description?: string; address?: string; link?: string; image_url?: string }) {
    const fields: string[] = [];
    const values: unknown[] = [];
    let idx = 1;
    const add = (col: string, val: unknown) => { fields.push(`${col} = $${idx++}`); values.push(val); };

    if (input.title !== undefined) add('title', input.title);
    if (input.category !== undefined) add('category', input.category);
    if (input.description !== undefined) add('description', input.description);
    if (input.address !== undefined) add('address', input.address);
    if (input.link !== undefined) add('link', input.link);
    if (input.image_url !== undefined) add('image_url', input.image_url);

    if (fields.length === 0) return null;
    values.push(id, userId);
    return queryOne<TravelInfoItem>(
      `UPDATE story_travel_info SET ${fields.join(', ')} WHERE id = $${idx++} AND user_id = $${idx} RETURNING *`,
      values
    );
  },
  async deleteTravel(userId: string, id: string) {
    const result = await queryOne<{ id: string }>(
      'DELETE FROM story_travel_info WHERE id = $1 AND user_id = $2 RETURNING id',
      [id, userId]
    );
    return !!result;
  },
  async reorderTravel(userId: string, ids: string[]) {
    for (let i = 0; i < ids.length; i++) {
      await query(
        'UPDATE story_travel_info SET sort_order = $1 WHERE id = $2 AND user_id = $3',
        [i, ids[i], userId]
      );
    }
    return true;
  },

  // --- FAQ ---
  async listFaq(userId: string): Promise<FaqItem[]> {
    return query<FaqItem>(
      'SELECT * FROM story_faq_items WHERE user_id = $1 ORDER BY sort_order ASC, created_at ASC',
      [userId]
    );
  },
  async addFaq(userId: string, input: { question: string; answer: string }) {
    const maxOrder = await queryOne<{ max: number }>(
      'SELECT COALESCE(MAX(sort_order), -1) as max FROM story_faq_items WHERE user_id = $1',
      [userId]
    );
    return queryOne<FaqItem>(
      `INSERT INTO story_faq_items (user_id, question, answer, sort_order)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [userId, input.question, input.answer, (maxOrder?.max ?? -1) + 1]
    );
  },
  async updateFaq(userId: string, id: string, input: { question?: string; answer?: string }) {
    const fields: string[] = [];
    const values: unknown[] = [];
    let idx = 1;
    const add = (col: string, val: unknown) => { fields.push(`${col} = $${idx++}`); values.push(val); };

    if (input.question !== undefined) add('question', input.question);
    if (input.answer !== undefined) add('answer', input.answer);

    if (fields.length === 0) return null;
    values.push(id, userId);
    return queryOne<FaqItem>(
      `UPDATE story_faq_items SET ${fields.join(', ')} WHERE id = $${idx++} AND user_id = $${idx} RETURNING *`,
      values
    );
  },
  async deleteFaq(userId: string, id: string) {
    const result = await queryOne<{ id: string }>(
      'DELETE FROM story_faq_items WHERE id = $1 AND user_id = $2 RETURNING id',
      [id, userId]
    );
    return !!result;
  },
  async reorderFaq(userId: string, ids: string[]) {
    for (let i = 0; i < ids.length; i++) {
      await query(
        'UPDATE story_faq_items SET sort_order = $1 WHERE id = $2 AND user_id = $3',
        [i, ids[i], userId]
      );
    }
    return true;
  },
};
