import { query, queryOne } from '../config/database.js';

export interface PlannerProfile {
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
}

export interface UpsertPlannerProfileInput {
  bio?: string | null;
  tagline?: string | null;
  location?: string | null;
  website?: string | null;
  years_of_experience?: number | null;
  specializations?: string[];
  profile_image_url?: string | null;
  cover_image_url?: string | null;
  phone?: string | null;
  instagram?: string | null;
  facebook?: string | null;
  twitter?: string | null;
}

export const PlannerProfileModel = {
  async getByUserId(userId: string): Promise<PlannerProfile | null> {
    return queryOne<PlannerProfile>(
      'SELECT * FROM planner_profiles WHERE user_id = $1',
      [userId]
    );
  },

  async upsert(userId: string, input: UpsertPlannerProfileInput): Promise<PlannerProfile> {
    const result = await queryOne<PlannerProfile>(
      `INSERT INTO planner_profiles (user_id, bio, tagline, location, website, years_of_experience,
        specializations, profile_image_url, cover_image_url, phone, instagram, facebook, twitter)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
       ON CONFLICT (user_id) DO UPDATE SET
         bio = EXCLUDED.bio,
         tagline = EXCLUDED.tagline,
         location = EXCLUDED.location,
         website = EXCLUDED.website,
         years_of_experience = EXCLUDED.years_of_experience,
         specializations = EXCLUDED.specializations,
         profile_image_url = EXCLUDED.profile_image_url,
         cover_image_url = EXCLUDED.cover_image_url,
         phone = EXCLUDED.phone,
         instagram = EXCLUDED.instagram,
         facebook = EXCLUDED.facebook,
         twitter = EXCLUDED.twitter,
         updated_at = NOW()
       RETURNING *`,
      [
        userId,
        input.bio ?? null,
        input.tagline ?? null,
        input.location ?? null,
        input.website ?? null,
        input.years_of_experience ?? null,
        input.specializations ?? [],
        input.profile_image_url ?? null,
        input.cover_image_url ?? null,
        input.phone ?? null,
        input.instagram ?? null,
        input.facebook ?? null,
        input.twitter ?? null,
      ]
    );
    if (!result) throw new Error('Failed to save planner profile');
    return result;
  },
};
