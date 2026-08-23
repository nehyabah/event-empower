import { apiClient } from './client';

export type NotificationType =
  | 'vendor_added_to_roster'
  | 'vendor_removed_from_roster'
  | 'tagged_on_event';

export interface UserNotification {
  id: string;
  type: NotificationType;
  title: string;
  body: string | null;
  link: string | null;
  read_at: string | null;
  created_at: string;
}

export const notificationService = {
  async list(): Promise<{ notifications: UserNotification[]; unread: number }> {
    const r = await apiClient.get<{ notifications: UserNotification[]; unread: number }>('/notifications');
    if (r.error || !r.data) throw new Error(r.error || 'Failed to load notifications');
    return r.data;
  },

  async markRead(id: string): Promise<void> {
    const r = await apiClient.post(`/notifications/${id}/read`, {});
    if (r.error) throw new Error(r.error);
  },

  async markAllRead(): Promise<void> {
    const r = await apiClient.post('/notifications/read-all', {});
    if (r.error) throw new Error(r.error);
  },
};

export default notificationService;
