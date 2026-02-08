import { apiClient } from './client';

export interface EventInfo {
  partner1Name: string | null;
  partner2Name: string | null;
  eventDate: string | null;
  venue: string | null;
}

export interface RsvpSubmission {
  rsvpCode: string;
  name: string;
  email?: string;
  status: 'confirmed' | 'declined';
  guestCount?: number;
  dietaryNotes?: string;
}

export interface RsvpResponse {
  success: boolean;
  message: string;
  guest: {
    id: string;
    name: string;
    status: string;
  };
}

export const rsvpService = {
  /**
   * Get event info by RSVP code (public, no auth required)
   */
  async getEventInfo(rsvpCode: string): Promise<EventInfo | null> {
    const response = await apiClient.get<EventInfo>(`/rsvp/${rsvpCode}`);
    if (response.error) {
      console.error('Failed to get event info:', response.error);
      return null;
    }
    return response.data || null;
  },

  /**
   * Submit an RSVP (public, no auth required)
   */
  async submitRsvp(data: RsvpSubmission): Promise<RsvpResponse> {
    const response = await apiClient.post<RsvpResponse>('/rsvp', data);
    if (response.error) {
      throw new Error(response.error);
    }
    if (!response.data) {
      throw new Error('Failed to submit RSVP');
    }
    return response.data;
  },

  /**
   * Get the current user's RSVP code (requires auth)
   */
  async getRsvpCode(): Promise<string | null> {
    const response = await apiClient.get<{ rsvpCode: string | null }>('/users/rsvp-code');
    if (response.error) {
      console.error('Failed to get RSVP code:', response.error);
      return null;
    }
    return response.data?.rsvpCode || null;
  },
};

export default rsvpService;
