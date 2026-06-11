import { query, queryOne } from '../config/database.js';

export type WishlistPriority = 'high' | 'medium' | 'low';

export interface WishlistItem {
  id: string;
  user_id: string;
  name: string;
  price: string | null;
  link: string | null;
  image_url: string | null;
  priority: WishlistPriority;
  purchased_by: string | null;
  is_anonymous: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateWishlistItemInput {
  name: string;
  price?: string | null;
  link?: string | null;
  image_url?: string | null;
  priority?: WishlistPriority;
}

export interface UpdateWishlistItemInput {
  name?: string;
  price?: string | null;
  link?: string | null;
  image_url?: string | null;
  priority?: WishlistPriority;
  purchased_by?: string | null;
  is_anonymous?: boolean | null;
}

export const WishlistItemModel = {
  async listByUserId(userId: string): Promise<WishlistItem[]> {
    return query<WishlistItem>(
      'SELECT * FROM wishlist_items WHERE user_id = $1 ORDER BY created_at ASC',
      [userId]
    );
  },

  async create(userId: string, input: CreateWishlistItemInput): Promise<WishlistItem> {
    const result = await queryOne<WishlistItem>(
      `INSERT INTO wishlist_items (user_id, name, price, link, image_url, priority)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [userId, input.name, input.price || null, input.link || null, input.image_url || null, input.priority || 'medium']
    );

    if (!result) {
      throw new Error('Failed to create wishlist item');
    }

    return result;
  },

  async update(userId: string, id: string, input: UpdateWishlistItemInput): Promise<WishlistItem | null> {
    const fields: string[] = [];
    const values: unknown[] = [];
    let paramIndex = 1;

    const addField = (column: string, value: unknown) => {
      fields.push(`${column} = $${paramIndex++}`);
      values.push(value);
    };

    if (input.name !== undefined) addField('name', input.name);
    if (input.price !== undefined) addField('price', input.price);
    if (input.link !== undefined) addField('link', input.link);
    if (input.image_url !== undefined) addField('image_url', input.image_url);
    if (input.priority !== undefined) addField('priority', input.priority);
    if (input.purchased_by !== undefined) addField('purchased_by', input.purchased_by);
    if (input.is_anonymous !== undefined) addField('is_anonymous', input.is_anonymous);

    if (fields.length === 0) {
      return queryOne<WishlistItem>(
        'SELECT * FROM wishlist_items WHERE id = $1 AND user_id = $2',
        [id, userId]
      );
    }

    fields.push('updated_at = NOW()');
    values.push(id, userId);

    return queryOne<WishlistItem>(
      `UPDATE wishlist_items SET ${fields.join(', ')} WHERE id = $${paramIndex++} AND user_id = $${paramIndex} RETURNING *`,
      values
    );
  },

  async delete(userId: string, id: string): Promise<boolean> {
    const result = await query(
      'DELETE FROM wishlist_items WHERE id = $1 AND user_id = $2',
      [id, userId]
    );
    return result.length > 0;
  },
};
