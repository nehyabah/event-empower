import { useCallback, useState } from 'react';
import { calendarService, CalendarPayload } from '@/services/api/calendarService';
import { useLiveData } from './useLiveData';

/**
 * The signed-in user's calendar, kept live.
 *
 * Works for every role — the backend decides what belongs on a client's,
 * planner's or vendor's calendar and returns one common entry shape.
 */
export function useCalendar(options: { enabled?: boolean } = {}) {
  const { enabled = true } = options;

  const fetcher = useCallback(() => calendarService.getCalendar(), []);
  const { data, isLoading, isRefreshing, error, refresh, setData } =
    useLiveData<CalendarPayload>(fetcher, { enabled, intervalMs: 60_000 });

  // Which month the grid is showing; independent of the fetched data.
  const [month, setMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });

  /** Swap in new feed URLs after the token is rotated, without a refetch. */
  const applyFeedUrls = useCallback(
    (urls: { feedUrl: string; webcalUrl: string }) => {
      setData((prev) => ({
        entries: prev?.entries ?? [],
        upcoming: prev?.upcoming ?? [],
        nextEvent: prev?.nextEvent ?? null,
        ...urls,
      }));
    },
    [setData],
  );

  return {
    entries: data?.entries ?? [],
    upcoming: data?.upcoming ?? [],
    nextEvent: data?.nextEvent ?? null,
    feedUrl: data?.feedUrl ?? null,
    webcalUrl: data?.webcalUrl ?? null,
    isLoading,
    isRefreshing,
    error,
    refresh,
    month,
    setMonth,
    applyFeedUrls,
  };
}

export default useCalendar;
