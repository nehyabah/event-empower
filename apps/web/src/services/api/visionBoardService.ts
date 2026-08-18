import { apiClient } from './client';

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
  created_at: string;
  updated_at: string;
}

export interface CreateItemInput {
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

export interface UpdateItemInput {
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

export const visionBoardService = {
  async list(): Promise<VisionBoardItem[]> {
    const r = await apiClient.get<VisionBoardItem[]>('/vision-board');
    if (r.error) throw new Error(r.error);
    return r.data ?? [];
  },

  async create(input: CreateItemInput): Promise<VisionBoardItem> {
    const r = await apiClient.post<VisionBoardItem>('/vision-board', input);
    if (r.error) throw new Error(r.error);
    return r.data!;
  },

  async update(id: string, input: UpdateItemInput): Promise<VisionBoardItem> {
    const r = await apiClient.patch<VisionBoardItem>(`/vision-board/${id}`, input);
    if (r.error) throw new Error(r.error);
    return r.data!;
  },

  async remove(id: string): Promise<void> {
    await apiClient.delete(`/vision-board/${id}`);
  },

  async uploadImage(file: File): Promise<string> {
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
    const token = apiClient.getAccessToken();
    const form = new FormData();
    form.append('file', file);
    const res = await fetch(`${API_URL}/vision-board/upload`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      credentials: 'include',
      body: form,
    });
    if (!res.ok) throw new Error('Upload failed');
    const { url } = await res.json();
    return url as string;
  },
};
