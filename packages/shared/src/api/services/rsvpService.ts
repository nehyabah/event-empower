import type { ApiClient } from '../client';
import type { EventInfo, RsvpSubmission, RsvpResponse } from '../../types';

export function createRsvpService(apiClient: ApiClient) {
  return {
    async getEventInfo(rsvpCode: string): Promise<EventInfo | null> {
      const response = await apiClient.get<EventInfo>(`/rsvp/${rsvpCode}`);
      if (response.error) {
        console.error('Failed to get event info:', response.error);
        return null;
      }
      return response.data || null;
    },

    async submitRsvp(data: RsvpSubmission): Promise<RsvpResponse> {
      const response = await apiClient.post<RsvpResponse>('/rsvp', data);
      if (response.error) throw new Error(response.error);
      if (!response.data) throw new Error('Failed to submit RSVP');
      return response.data;
    },

    async getRsvpCode(): Promise<string | null> {
      const response = await apiClient.get<{ rsvpCode: string | null }>('/users/rsvp-code');
      if (response.error) {
        console.error('Failed to get RSVP code:', response.error);
        return null;
      }
      return response.data?.rsvpCode || null;
    },
  };
}
