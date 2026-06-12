import { query, queryOne } from '../config/database.js';

export type VisionBoardItemType = 'note' | 'image' | 'concept';
export type VisionBoardColor = 'cream' | 'blush' | 'sage' | 'lavender' | 'gold' | 'sky' | 'charcoal';

export interface VisionBoardItem {
  id: string;
  user_id: string;
  added_by: string | null;
  added_by_name: string | null;
  type: VisionBoardItemType;
  title: string | null;
  content: string | null;
  category: string | null;
  color: VisionBoardColor;
  position_x: number;
  position_y: number;
  width: number;
  height: number;
  pinned: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface CreateVisionBoardItemInput {
  user_id: string;
  added_by?: string;
  type: VisionBoardItemType;
  title?: string;
  content?: string;
  category?: string;
  color?: VisionBoardColor;
  position_x?: number;
  position_y?: number;
  width?: number;
  height?: number;
}

export interface UpdateVisionBoardItemInput {
  title?: string | null;
  content?: string | null;
  category?: string | null;
  color?: VisionBoardColor;
  position_x?: number;
  position_y?: number;
  width?: number;
  height?: number;
  pinned?: boolean;
}

const WITH_CREATOR = `
  SELECT v.*, u.name AS added_by_name
  FROM vision_board_items v
  LEFT JOIN users u ON u.id = v.added_by
`;

export const VisionBoardItemModel = {
  async findByUserId(userId: string): Promise<VisionBoardItem[]> {
    return query<VisionBoardItem>(
      `${WITH_CREATOR} WHERE v.user_id = $1 ORDER BY v.created_at ASC`,
      [userId]
    );
  },

  async findById(id: string): Promise<VisionBoardItem | null> {
    return queryOne<VisionBoardItem>(`${WITH_CREATOR} WHERE v.id = $1`, [id]);
  },

  async create(input: CreateVisionBoardItemInput): Promise<VisionBoardItem> {
    const result = await queryOne<VisionBoardItem>(
      `INSERT INTO vision_board_items
        (user_id, added_by, type, title, content, category, color, position_x, position_y, width, height)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
       RETURNING *`,
      [
        input.user_id,
        input.added_by ?? null,
        input.type,
        input.title ?? null,
        input.content ?? null,
        input.category ?? null,
        input.color ?? 'cream',
        input.position_x ?? 100,
        input.position_y ?? 100,
        input.width ?? 240,
        input.height ?? 180,
      ]
    );
    // Fetch with creator name
    return (await this.findById(result!.id))!;
  },

  async update(id: string, userId: string, input: UpdateVisionBoardItemInput): Promise<VisionBoardItem | null> {
    const fields: string[] = [];
    const values: unknown[] = [];
    let i = 1;

    if (input.title !== undefined)      { fields.push(`title = $${i++}`);      values.push(input.title); }
    if (input.content !== undefined)    { fields.push(`content = $${i++}`);    values.push(input.content); }
    if (input.category !== undefined)   { fields.push(`category = $${i++}`);   values.push(input.category); }
    if (input.color !== undefined)      { fields.push(`color = $${i++}`);      values.push(input.color); }
    if (input.position_x !== undefined) { fields.push(`position_x = $${i++}`); values.push(input.position_x); }
    if (input.position_y !== undefined) { fields.push(`position_y = $${i++}`); values.push(input.position_y); }
    if (input.width !== undefined)      { fields.push(`width = $${i++}`);      values.push(input.width); }
    if (input.height !== undefined)     { fields.push(`height = $${i++}`);     values.push(input.height); }
    if (input.pinned !== undefined)     { fields.push(`pinned = $${i++}`);     values.push(input.pinned); }

    if (fields.length === 0) return this.findById(id);

    fields.push(`updated_at = NOW()`);
    values.push(id, userId);

    await queryOne<VisionBoardItem>(
      `UPDATE vision_board_items SET ${fields.join(', ')} WHERE id = $${i++} AND user_id = $${i++} RETURNING id`,
      values
    );
    return this.findById(id);
  },

  async delete(id: string, userId: string): Promise<void> {
    await query('DELETE FROM vision_board_items WHERE id = $1 AND user_id = $2', [id, userId]);
  },
};
