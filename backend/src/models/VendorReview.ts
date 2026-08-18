import { query, queryOne } from '../config/database.js';

export interface VendorReview {
  id: string;
  vendor_profile_id: string;
  reviewer_user_id: string;
  event_id: string | null;
  rating: number;
  title: string | null;
  comment: string | null;
  created_at: Date;
  updated_at: Date;
  // Joined
  reviewer_name?: string | null;
}

export interface UpsertVendorReviewInput {
  vendor_profile_id: string;
  reviewer_user_id: string;
  event_id?: string | null;
  rating: number;
  title?: string | null;
  comment?: string | null;
}

const WITH_REVIEWER = `
  SELECT r.*, u.name AS reviewer_name
  FROM vendor_reviews r
  JOIN users u ON r.reviewer_user_id = u.id
`;

export const VendorReviewModel = {
  async findByVendorProfileId(vendorProfileId: string): Promise<VendorReview[]> {
    return query<VendorReview>(
      `${WITH_REVIEWER} WHERE r.vendor_profile_id = $1 ORDER BY r.created_at DESC`,
      [vendorProfileId]
    );
  },

  async findByReviewerAndVendor(reviewerUserId: string, vendorProfileId: string): Promise<VendorReview | null> {
    return queryOne<VendorReview>(
      `${WITH_REVIEWER} WHERE r.reviewer_user_id = $1 AND r.vendor_profile_id = $2`,
      [reviewerUserId, vendorProfileId]
    );
  },

  // Insert or update the couple's single review for this vendor
  async upsert(input: UpsertVendorReviewInput): Promise<VendorReview> {
    const row = await queryOne<{ id: string }>(
      `INSERT INTO vendor_reviews (vendor_profile_id, reviewer_user_id, event_id, rating, title, comment)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (vendor_profile_id, reviewer_user_id)
       DO UPDATE SET rating = EXCLUDED.rating,
                     title = EXCLUDED.title,
                     comment = EXCLUDED.comment,
                     event_id = COALESCE(EXCLUDED.event_id, vendor_reviews.event_id),
                     updated_at = NOW()
       RETURNING id`,
      [
        input.vendor_profile_id,
        input.reviewer_user_id,
        input.event_id ?? null,
        input.rating,
        input.title ?? null,
        input.comment ?? null,
      ]
    );
    if (!row) throw new Error('Failed to save review');
    const full = await queryOne<VendorReview>(`${WITH_REVIEWER} WHERE r.id = $1`, [row.id]);
    return full!;
  },

  async deleteByReviewerAndVendor(reviewerUserId: string, vendorProfileId: string): Promise<boolean> {
    const result = await query(
      'DELETE FROM vendor_reviews WHERE reviewer_user_id = $1 AND vendor_profile_id = $2 RETURNING id',
      [reviewerUserId, vendorProfileId]
    );
    return result.length > 0;
  },
};
