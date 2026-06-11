import { useState, useEffect, useCallback } from 'react';
import { plannerService, PlannerEvent, CreateEventInput, UpdateEventInput } from '@/services/api/plannerService';
import { toast } from 'sonner';

export function usePlannerEvents(startDate?: string, endDate?: string) {
  const [events, setEvents] = useState<PlannerEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEvents = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await plannerService.getEvents(startDate, endDate);
      setEvents(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch events';
      setError(message);
      console.error('Error fetching events:', err);
    } finally {
      setIsLoading(false);
    }
  }, [startDate, endDate]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const createEvent = useCallback(async (input: CreateEventInput): Promise<PlannerEvent | null> => {
    try {
      const newEvent = await plannerService.createEvent(input);
      setEvents(prev => [...prev, newEvent].sort((a, b) =>
        new Date(a.event_date).getTime() - new Date(b.event_date).getTime()
      ));
      toast.success('Event created successfully');
      return newEvent;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create event';
      toast.error(message);
      console.error('Error creating event:', err);
      return null;
    }
  }, []);

  const updateEvent = useCallback(async (id: string, input: UpdateEventInput): Promise<PlannerEvent | null> => {
    try {
      const updatedEvent = await plannerService.updateEvent(id, input);
      setEvents(prev => prev.map(e => e.id === id ? updatedEvent : e).sort((a, b) =>
        new Date(a.event_date).getTime() - new Date(b.event_date).getTime()
      ));
      toast.success('Event updated successfully');
      return updatedEvent;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update event';
      toast.error(message);
      console.error('Error updating event:', err);
      return null;
    }
  }, []);

  const deleteEvent = useCallback(async (id: string): Promise<boolean> => {
    try {
      await plannerService.deleteEvent(id);
      setEvents(prev => prev.filter(e => e.id !== id));
      toast.success('Event deleted successfully');
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete event';
      toast.error(message);
      console.error('Error deleting event:', err);
      return false;
    }
  }, []);

  // Filter helpers
  const eventsByType = useCallback((type: string) => {
    return events.filter(e => e.event_type === type);
  }, [events]);

  const eventsOnDate = useCallback((date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return events.filter(e => e.event_date.split('T')[0] === dateStr);
  }, [events]);

  // Get upcoming events (from today onwards)
  const upcomingEvents = events.filter(e => {
    const eventDate = new Date(e.event_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return eventDate >= today;
  });

  // Get events for this week
  const thisWeekEvents = events.filter(e => {
    const eventDate = new Date(e.event_date);
    const today = new Date();
    const weekFromNow = new Date();
    weekFromNow.setDate(today.getDate() + 7);
    return eventDate >= today && eventDate <= weekFromNow;
  });

  return {
    events,
    isLoading,
    error,
    fetchEvents,
    createEvent,
    updateEvent,
    deleteEvent,
    eventsByType,
    eventsOnDate,
    upcomingEvents,
    thisWeekEvents,
    meetings: events.filter(e => e.event_type === 'meeting'),
    weddings: events.filter(e => e.event_type === 'wedding'),
  };
}

export default usePlannerEvents;
