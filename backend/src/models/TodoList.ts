import { query, queryOne } from '../config/database.js';

export interface TodoItem {
  id: string;
  list_id: string;
  text: string;
  completed: boolean;
  status: 'todo' | 'in_progress' | 'done';
  sort_order: number;
  created_at: Date;
  updated_at: Date;
}

export interface TodoList {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  is_completed: boolean;
  is_shared: boolean;
  created_at: Date;
  updated_at: Date;
  items?: TodoItem[];
}

export interface CreateTodoListInput {
  user_id: string;
  title: string;
  description?: string;
  is_shared?: boolean;
}

export interface UpdateTodoListInput {
  title?: string;
  description?: string | null;
  is_completed?: boolean;
  is_shared?: boolean;
}

export interface CreateTodoItemInput {
  list_id: string;
  text: string;
  completed?: boolean;
  status?: 'todo' | 'in_progress' | 'done';
  sort_order?: number;
}

export interface UpdateTodoItemInput {
  text?: string;
  completed?: boolean;
  status?: 'todo' | 'in_progress' | 'done';
  sort_order?: number;
}

export const TodoListModel = {
  async findById(id: string): Promise<TodoList | null> {
    return queryOne<TodoList>(
      'SELECT * FROM todo_lists WHERE id = $1',
      [id]
    );
  },

  async findByIdWithItems(id: string): Promise<TodoList | null> {
    const list = await queryOne<TodoList>(
      'SELECT * FROM todo_lists WHERE id = $1',
      [id]
    );

    if (!list) return null;

    const items = await query<TodoItem>(
      'SELECT * FROM todo_items WHERE list_id = $1 ORDER BY sort_order ASC, created_at ASC',
      [id]
    );

    return { ...list, items };
  },

  async findByUserId(userId: string): Promise<TodoList[]> {
    return query<TodoList>(
      'SELECT * FROM todo_lists WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );
  },

  async findByUserIdWithItems(userId: string): Promise<TodoList[]> {
    const lists = await query<TodoList>(
      'SELECT * FROM todo_lists WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );

    // Fetch all items for all lists in one query
    if (lists.length === 0) return lists;

    const listIds = lists.map(l => l.id);
    const items = await query<TodoItem>(
      `SELECT * FROM todo_items WHERE list_id = ANY($1) ORDER BY sort_order ASC, created_at ASC`,
      [listIds]
    );

    // Group items by list_id
    const itemsByListId = new Map<string, TodoItem[]>();
    items.forEach(item => {
      if (!itemsByListId.has(item.list_id)) {
        itemsByListId.set(item.list_id, []);
      }
      itemsByListId.get(item.list_id)!.push(item);
    });

    // Attach items to lists
    return lists.map(list => ({
      ...list,
      items: itemsByListId.get(list.id) || [],
    }));
  },

  async findSharedByUserId(userId: string): Promise<TodoList[]> {
    const lists = await query<TodoList>(
      'SELECT * FROM todo_lists WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );

    if (lists.length === 0) return lists;

    const listIds = lists.map(l => l.id);
    const items = await query<TodoItem>(
      'SELECT * FROM todo_items WHERE list_id = ANY($1) ORDER BY sort_order ASC, created_at ASC',
      [listIds]
    );

    const itemsByListId = new Map<string, TodoItem[]>();
    items.forEach(item => {
      if (!itemsByListId.has(item.list_id)) {
        itemsByListId.set(item.list_id, []);
      }
      itemsByListId.get(item.list_id)!.push(item);
    });

    return lists.map(list => ({
      ...list,
      items: itemsByListId.get(list.id) || [],
    }));
  },

  async create(input: CreateTodoListInput): Promise<TodoList> {
    const result = await queryOne<TodoList>(
      `INSERT INTO todo_lists (user_id, title, description, is_shared)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [
        input.user_id,
        input.title,
        input.description || null,
        input.is_shared ?? false,
      ]
    );

    if (!result) {
      throw new Error('Failed to create todo list');
    }

    return { ...result, items: [] };
  },

  async update(id: string, input: UpdateTodoListInput): Promise<TodoList | null> {
    const fields: string[] = [];
    const values: unknown[] = [];
    let paramIndex = 1;

    if (input.title !== undefined) {
      fields.push(`title = $${paramIndex++}`);
      values.push(input.title);
    }
    if (input.description !== undefined) {
      fields.push(`description = $${paramIndex++}`);
      values.push(input.description || null);
    }
    if (input.is_completed !== undefined) {
      fields.push(`is_completed = $${paramIndex++}`);
      values.push(input.is_completed);
    }
    if (input.is_shared !== undefined) {
      fields.push(`is_shared = $${paramIndex++}`);
      values.push(input.is_shared);
    }

    if (fields.length === 0) {
      return this.findByIdWithItems(id);
    }

    fields.push(`updated_at = NOW()`);
    values.push(id);

    const list = await queryOne<TodoList>(
      `UPDATE todo_lists SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
      values
    );

    if (!list) return null;

    const items = await query<TodoItem>(
      'SELECT * FROM todo_items WHERE list_id = $1 ORDER BY sort_order ASC, created_at ASC',
      [id]
    );

    return { ...list, items };
  },

  async delete(id: string): Promise<boolean> {
    const result = await query(
      'DELETE FROM todo_lists WHERE id = $1 RETURNING id',
      [id]
    );
    return result.length > 0;
  },
};

export const TodoItemModel = {
  async findById(id: string): Promise<TodoItem | null> {
    return queryOne<TodoItem>(
      'SELECT * FROM todo_items WHERE id = $1',
      [id]
    );
  },

  async findByListId(listId: string): Promise<TodoItem[]> {
    return query<TodoItem>(
      'SELECT * FROM todo_items WHERE list_id = $1 ORDER BY sort_order ASC, created_at ASC',
      [listId]
    );
  },

  async create(input: CreateTodoItemInput): Promise<TodoItem> {
    // Get the max sort_order for this list
    const maxOrder = await queryOne<{ max_order: number }>(
      'SELECT COALESCE(MAX(sort_order), -1) as max_order FROM todo_items WHERE list_id = $1',
      [input.list_id]
    );
    const status = input.status ?? (input.completed ? 'done' : 'todo');
    const completed = input.completed ?? status === 'done';

    const result = await queryOne<TodoItem>(
      `INSERT INTO todo_items (list_id, text, completed, status, sort_order)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [
        input.list_id,
        input.text,
        completed,
        status,
        input.sort_order ?? (maxOrder?.max_order ?? -1) + 1,
      ]
    );

    if (!result) {
      throw new Error('Failed to create todo item');
    }

    return result;
  },

  async update(id: string, input: UpdateTodoItemInput): Promise<TodoItem | null> {
    const fields: string[] = [];
    const values: unknown[] = [];
    let paramIndex = 1;

    if (input.text !== undefined) {
      fields.push(`text = $${paramIndex++}`);
      values.push(input.text);
    }
    if (input.completed !== undefined) {
      fields.push(`completed = $${paramIndex++}`);
      values.push(input.completed);
    }
    if (input.status !== undefined) {
      fields.push(`status = $${paramIndex++}`);
      values.push(input.status);
    }
    if (input.sort_order !== undefined) {
      fields.push(`sort_order = $${paramIndex++}`);
      values.push(input.sort_order);
    }

    if (fields.length === 0) {
      return this.findById(id);
    }

    fields.push(`updated_at = NOW()`);
    values.push(id);

    return queryOne<TodoItem>(
      `UPDATE todo_items SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
      values
    );
  },

  async delete(id: string): Promise<boolean> {
    const result = await query(
      'DELETE FROM todo_items WHERE id = $1 RETURNING id',
      [id]
    );
    return result.length > 0;
  },

  async toggleCompleted(id: string): Promise<TodoItem | null> {
    return queryOne<TodoItem>(
      `UPDATE todo_items
       SET completed = NOT completed,
           status = CASE WHEN completed = true THEN 'todo' ELSE 'done' END,
           updated_at = NOW()
       WHERE id = $1
       RETURNING *`,
      [id]
    );
  },
};
