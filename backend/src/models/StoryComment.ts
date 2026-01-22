import { query, queryOne } from '../config/database.js';

export interface StoryComment {
  id: string;
  user_id: string;
  name: string;
  text: string;
  created_at: string;
}

export interface CreateStoryCommentInput {
  name: string;
  text: string;
}

export const StoryCommentModel = {
  async listByUserId(userId: string): Promise<StoryComment[]> {
    return query<StoryComment>(
      'SELECT * FROM story_comments WHERE user_id = $1 ORDER BY created_at ASC',
      [userId]
    );
  },

  async create(userId: string, input: CreateStoryCommentInput): Promise<StoryComment> {
    const result = await queryOne<StoryComment>(
      `INSERT INTO story_comments (user_id, name, text)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [userId, input.name, input.text]
    );

    if (!result) {
      throw new Error('Failed to create story comment');
    }

    return result;
  },
};
