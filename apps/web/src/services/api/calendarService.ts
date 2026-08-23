import { apiClient } from './client';

export type CalendarSource =
  | 'planner_event'
  | 'wedding'
  | 'todo_due'
  | 'vendor_booking'
  | 'expense_due'
  | 'rsvp_deadline'
  | 'workspace_event';

export interface CalendarEntry {
  id: string;
  source: CalendarSource;
  title: string;
  description: string | null;
  /** YYYY-MM-DD */
  date: string;
  start_time: string | null;
  end_time: string | null;
  location: string | null;
  category: string | null;
  counterparty: string | null;
  editable: boolean;
}

export interface CalendarPayload {
  entries: CalendarEntry[];
  upcoming: CalendarEntry[];
  nextEvent: CalendarEntry | null;
  /** https:// feed URL for Google Calendar's "from URL" flow. */
  feedUrl: string | null;
  /** webcal:// variant, which desktop calendar apps open directly. */
  webcalUrl: string | null;
}

export const calendarService = {
  async getCalendar(): Promise<CalendarPayload> {
    const response = await apiClient.get<CalendarPayload>('/calendar');
    if (response.error || !response.data) {
      throw new Error(response.error || 'Failed to load calendar');
    }
    return response.data;
  },

  /** Invalidate the current feed URL and mint a new one. */
  async rotateFeed(): Promise<{ feedUrl: string; webcalUrl: string }> {
    const response = await apiClient.post<{ feedUrl: string; webcalUrl: string }>(
      '/calendar/feed/rotate',
      {}
    );
    if (response.error || !response.data) {
      throw new Error(response.error || 'Failed to reset calendar feed');
    }
    return response.data;
  },
};

export default calendarService;
