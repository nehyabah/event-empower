import { apiClient } from './client';

export type WorkspaceEventType =
  | 'meeting' | 'visit' | 'fitting' | 'tasting' | 'rehearsal' | 'delivery' | 'other';

export interface WorkspaceEventPerson {
  user_id: string;
  name: string | null;
  email: string | null;
  user_type: string;
}

export interface WorkspaceEvent {
  id: string;
  event_id: string;
  created_by: string;
  created_by_name: string | null;
  couple_names: string | null;
  title: string;
  description: string | null;
  event_date: string;
  start_time: string | null;
  end_time: string | null;
  location: string | null;
  event_type: WorkspaceEventType;
  participants: WorkspaceEventPerson[];
}

/** A wedding the user can schedule against, plus who can be tagged on it. */
export interface WorkspaceContext {
  event_id: string;
  couple_names: string;
  event_date: string | null;
  people: WorkspaceEventPerson[];
}

export interface WorkspaceEventInput {
  eventId: string;
  title: string;
  description?: string | null;
  eventDate: string;
  startTime?: string | null;
  endTime?: string | null;
  location?: string | null;
  eventType?: WorkspaceEventType;
  participantIds?: string[];
}

export const WORKSPACE_EVENT_TYPES: Array<{ value: WorkspaceEventType; label: string }> = [
  { value: 'meeting',   label: 'Meeting' },
  { value: 'visit',     label: 'Venue visit' },
  { value: 'fitting',   label: 'Fitting' },
  { value: 'tasting',   label: 'Tasting' },
  { value: 'rehearsal', label: 'Rehearsal' },
  { value: 'delivery',  label: 'Delivery' },
  { value: 'other',     label: 'Other' },
];

export const workspaceEventService = {
  async getContexts(): Promise<WorkspaceContext[]> {
    const r = await apiClient.get<WorkspaceContext[]>('/workspace-events/contexts');
    if (r.error) throw new Error(r.error);
    return r.data || [];
  },

  async create(input: WorkspaceEventInput): Promise<WorkspaceEvent> {
    const r = await apiClient.post<WorkspaceEvent>('/workspace-events', input);
    if (r.error || !r.data) throw new Error(r.error || 'Failed to create event');
    return r.data;
  },

  async update(id: string, input: Partial<Omit<WorkspaceEventInput, 'eventId'>>): Promise<WorkspaceEvent> {
    const r = await apiClient.patch<WorkspaceEvent>(`/workspace-events/${id}`, input);
    if (r.error || !r.data) throw new Error(r.error || 'Failed to update event');
    return r.data;
  },

  async remove(id: string): Promise<void> {
    const r = await apiClient.delete(`/workspace-events/${id}`);
    if (r.error) throw new Error(r.error);
  },
};

export default workspaceEventService;
