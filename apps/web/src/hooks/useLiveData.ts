import { useCallback, useEffect, useRef, useState } from 'react';

export interface UseLiveDataOptions {
  /** Poll interval in ms while the tab is visible. 0 disables polling. */
  intervalMs?: number;
  /** Refetch when the tab regains focus or becomes visible again. */
  refetchOnFocus?: boolean;
  /** Skip fetching entirely (e.g. while unauthenticated). */
  enabled?: boolean;
}

export interface UseLiveDataResult<T> {
  data: T | null;
  /** True only for the very first load — background refreshes stay false. */
  isLoading: boolean;
  /** True while a background refresh is in flight. */
  isRefreshing: boolean;
  error: string | null;
  lastUpdatedAt: Date | null;
  refresh: () => Promise<void>;
  /** Apply a local change without waiting for a round trip. */
  setData: (updater: T | ((prev: T | null) => T)) => void;
}

/**
 * Fetch-and-keep-fresh.
 *
 * Pages used to load once on mount, so a change made by a planner, vendor or
 * partner only appeared after a manual page reload. This polls while the tab is
 * visible and refetches the moment it regains focus, so shared data stays live
 * without the user reaching for refresh.
 *
 * Polling pauses while the tab is hidden — a backgrounded tab makes no requests
 * and catches up in one fetch when the user returns.
 */
export function useLiveData<T>(
  fetcher: () => Promise<T>,
  options: UseLiveDataOptions = {}
): UseLiveDataResult<T> {
  const { intervalMs = 30_000, refetchOnFocus = true, enabled = true } = options;

  const [data, setDataState] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(enabled);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdatedAt, setLastUpdatedAt] = useState<Date | null>(null);

  // Keep the latest fetcher in a ref so callers can pass an inline closure
  // without restarting the polling loop on every render.
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  const hasLoadedRef = useRef(false);
  const inFlightRef = useRef(false);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  const load = useCallback(async () => {
    if (!enabled) return;
    // Never stack requests: a slow response must not queue up behind a tick.
    if (inFlightRef.current) return;

    inFlightRef.current = true;
    if (hasLoadedRef.current) setIsRefreshing(true);

    try {
      const result = await fetcherRef.current();
      if (!mountedRef.current) return;
      setDataState(result);
      setError(null);
      setLastUpdatedAt(new Date());
    } catch (err) {
      if (!mountedRef.current) return;
      const message = err instanceof Error ? err.message : 'Something went wrong';
      // A failed background refresh keeps the last good data on screen; only a
      // failed first load surfaces as an error state.
      if (!hasLoadedRef.current) setError(message);
      else console.warn('[useLiveData] background refresh failed:', message);
    } finally {
      inFlightRef.current = false;
      if (mountedRef.current) {
        hasLoadedRef.current = true;
        setIsLoading(false);
        setIsRefreshing(false);
      }
    }
  }, [enabled]);

  // Initial load.
  useEffect(() => {
    if (!enabled) {
      setIsLoading(false);
      return;
    }
    void load();
  }, [enabled, load]);

  // Poll while visible.
  useEffect(() => {
    if (!enabled || intervalMs <= 0) return;

    const tick = () => {
      if (document.visibilityState === 'visible') void load();
    };

    const id = window.setInterval(tick, intervalMs);
    return () => window.clearInterval(id);
  }, [enabled, intervalMs, load]);

  // Catch up immediately when the user comes back to the tab.
  useEffect(() => {
    if (!enabled || !refetchOnFocus) return;

    const onFocus = () => void load();
    const onVisibility = () => {
      if (document.visibilityState === 'visible') void load();
    };

    window.addEventListener('focus', onFocus);
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      window.removeEventListener('focus', onFocus);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [enabled, refetchOnFocus, load]);

  const setData = useCallback((updater: T | ((prev: T | null) => T)) => {
    setDataState((prev) =>
      typeof updater === 'function' ? (updater as (p: T | null) => T)(prev) : updater
    );
  }, []);

  return { data, isLoading, isRefreshing, error, lastUpdatedAt, refresh: load, setData };
}

export default useLiveData;
