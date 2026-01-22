import { query, queryOne } from '../config/database.js';

export type StoryImageType = 'general' | 'bride' | 'groom';

export interface StoryImage {
  id: string;
  user_id: string;
  url: string;
  caption: string | null;
  story_type: StoryImageType;
  created_at: string;
}

export interface CreateStoryImageInput {
  url: string;
  caption?: string | null;
  story_type?: StoryImageType;
}

export const StoryImageModel = {
  async listByUserId(userId: string): Promise<StoryImage[]> {
    return query<StoryImage>(
      'SELECT * FROM story_images WHERE user_id = $1 ORDER BY created_at ASC',
      [userId]
    );
  },

  async create(userId: string, input: CreateStoryImageInput): Promise<StoryImage> {
    const result = await queryOne<StoryImage>(
      `INSERT INTO story_images (user_id, url, caption, story_type)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [
        userId,
        input.url,
        input.caption || null,
        input.story_type || 'general',
      ]
    );

    if (!result) {
      throw new Error('Failed to create story image');
    }

    return result;
  },

  async delete(userId: string, id: string): Promise<boolean> {
    const result = await query(
      'DELETE FROM story_images WHERE id = $1 AND user_id = $2',
      [id, userId]
    );
    return result.length > 0;
  },
};
