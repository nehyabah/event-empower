import { useState, useEffect, useCallback, useRef } from 'react';
import { useAutoRefresh } from './useAutoRefresh';
import {
  plannerService,
  PlannerEvent,
  CreateEventInput,
  UpdateEventInput,
  CalendarWeddingDate,
  CalendarTodoDueDate,
} from '@/services/api/plannerService';
import { toast } from 'sonner';

export function usePlannerEvents(startDate?: string, endDate?: string) {
  const [events, setEvents] = useState<PlannerEvent[]>([]);
  const [weddingDates, setWeddingDates] = useState<CalendarWeddingDate[]>([]);
  const [todoDueDates, setTodoDueDates] = useState<CalendarTodoDueDate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const hasLoadedRef = useRef(false);

  const fetchEvents = useCallback(async () => {
    try {
      // Background refreshes keep the current view on screen.
      if (!hasLoadedRef.current) setIsLoading(true);
      const data = await plannerService.getCalendarData();
      setEvents(data.events);
      setWeddingDates(data.weddingDates);
      setTodoDueDates(data.todoDueDates);
      setError(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch calendar data';
      if (!hasLoadedRef.current) setError(message);
    } finally {
      hasLoadedRef.current = true;
      setIsLoading(false);
    }
  }, [startDate, endDate]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  // Client weddings and shared task deadlines change outside this tab.
  useAutoRefresh(fetchEvents, { intervalMs: 60_000 });

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
      return false;
    }
  }, []);

  const eventsByType = useCallback((type: string) => {
    return events.filter(e => e.event_type === type);
  }, [events]);

  const eventsOnDate = useCallback((date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return events.filter(e => e.event_date.split('T')[0] === dateStr);
  }, [events]);

  const weddingOnDate = useCallback((date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return weddingDates.filter(w => w.event_date === dateStr);
  }, [weddingDates]);

  const todosOnDate = useCallback((date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return todoDueDates.filter(t => t.due_date === dateStr);
  }, [todoDueDates]);

  const upcomingEvents = events.filter(e => {
    const eventDate = new Date(e.event_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return eventDate >= today;
  });

  const thisWeekEvents = events.filter(e => {
    const eventDate = new Date(e.event_date);
    const today = new Date();
    const weekFromNow = new Date();
    weekFromNow.setDate(today.getDate() + 7);
    return eventDate >= today && eventDate <= weekFromNow;
  });

  return {
    events,
    weddingDates,
    todoDueDates,
    isLoading,
    error,
    fetchEvents,
    createEvent,
    updateEvent,
    deleteEvent,
    eventsByType,
    eventsOnDate,
    weddingOnDate,
    todosOnDate,
    upcomingEvents,
    thisWeekEvents,
    meetings: events.filter(e => e.event_type === 'meeting'),
    weddings: events.filter(e => e.event_type === 'wedding'),
  };
}

export default usePlannerEvents;
