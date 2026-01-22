import { query, queryOne } from '../config/database.js';

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
  created_at: string;
  updated_at: string;
}

export interface UpsertCoupleStoryInput {
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
}

export const CoupleStoryModel = {
  async findByUserId(userId: string): Promise<CoupleStory | null> {
    return queryOne<CoupleStory>(
      'SELECT * FROM couple_stories WHERE user_id = $1',
      [userId]
    );
  },

  async upsert(userId: string, input: UpsertCoupleStoryInput): Promise<CoupleStory> {
    const existing = await this.findByUserId(userId);

    if (!existing) {
      const result = await queryOne<CoupleStory>(
        `INSERT INTO couple_stories (
          user_id, title, content, hashtag, wedding_date, wedding_time, venue, love_quote,
          selected_icon, banner_image_url, template_id, bride_name, bride_bio, bride_image_url, groom_name,
          groom_bio, groom_image_url
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8,
          $9, $10, $11, $12, $13, $14,
          $15, $16, $17
        ) RETURNING *`,
        [
          userId,
          input.title || null,
          input.content || null,
          input.hashtag || null,
          input.wedding_date || null,
          input.wedding_time || null,
          input.venue || null,
          input.love_quote || null,
          input.selected_icon || null,
          input.banner_image_url || null,
          input.template_id || null,
          input.bride_name || null,
          input.bride_bio || null,
          input.bride_image_url || null,
          input.groom_name || null,
          input.groom_bio || null,
          input.groom_image_url || null,
        ]
      );

      if (!result) {
        throw new Error('Failed to create couple story');
      }

      return result;
    }

    const fields: string[] = [];
    const values: unknown[] = [];
    let paramIndex = 1;

    const addField = (column: string, value: unknown) => {
      fields.push(`${column} = $${paramIndex++}`);
      values.push(value);
    };

    if (input.title !== undefined) addField('title', input.title);
    if (input.content !== undefined) addField('content', input.content);
    if (input.hashtag !== undefined) addField('hashtag', input.hashtag);
    if (input.wedding_date !== undefined) addField('wedding_date', input.wedding_date);
    if (input.wedding_time !== undefined) addField('wedding_time', input.wedding_time);
    if (input.venue !== undefined) addField('venue', input.venue);
    if (input.love_quote !== undefined) addField('love_quote', input.love_quote);
    if (input.selected_icon !== undefined) addField('selected_icon', input.selected_icon);
    if (input.banner_image_url !== undefined) addField('banner_image_url', input.banner_image_url);
    if (input.template_id !== undefined) addField('template_id', input.template_id);
    if (input.bride_name !== undefined) addField('bride_name', input.bride_name);
    if (input.bride_bio !== undefined) addField('bride_bio', input.bride_bio);
    if (input.bride_image_url !== undefined) addField('bride_image_url', input.bride_image_url);
    if (input.groom_name !== undefined) addField('groom_name', input.groom_name);
    if (input.groom_bio !== undefined) addField('groom_bio', input.groom_bio);
    if (input.groom_image_url !== undefined) addField('groom_image_url', input.groom_image_url);

    if (fields.length === 0) {
      return existing;
    }

    fields.push('updated_at = NOW()');
    values.push(userId);

    const result = await queryOne<CoupleStory>(
      `UPDATE couple_stories SET ${fields.join(', ')} WHERE user_id = $${paramIndex} RETURNING *`,
      values
    );

    if (!result) {
      throw new Error('Failed to update couple story');
    }

    return result;
  },
};
