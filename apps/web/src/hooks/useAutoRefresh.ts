import { useEffect, useRef } from 'react';

export interface UseAutoRefreshOptions {
  /** Poll interval in ms while the tab is visible. 0 disables polling. */
  intervalMs?: number;
  /** Refetch when the tab regains focus or becomes visible. */
  refetchOnFocus?: boolean;
  enabled?: boolean;
}

/**
 * Keep an existing fetch function firing so shared data stays current.
 *
 * For contexts and hooks that already own their loading state, this adds the
 * "live" behaviour without restructuring them: poll while the tab is visible,
 * and catch up the instant the user returns to it.
 *
 * Skips the very first run, since callers already fetch on mount.
 */
export function useAutoRefresh(
  refetch: () => void | Promise<unknown>,
  options: UseAutoRefreshOptions = {}
): void {
  const { intervalMs = 30_000, refetchOnFocus = true, enabled = true } = options;

  // Held in a ref so an inline arrow function doesn't restart the timers on
  // every render.
  const refetchRef = useRef(refetch);
  refetchRef.current = refetch;

  const inFlightRef = useRef(false);

  useEffect(() => {
    if (!enabled) return;

    // Never stack refreshes: a slow response must not queue up behind a tick.
    const run = async () => {
      if (inFlightRef.current) return;
      inFlightRef.current = true;
      try {
        await refetchRef.current();
      } catch {
        // The caller owns error reporting; a failed refresh keeps prior data.
      } finally {
        inFlightRef.current = false;
      }
    };

    const cleanups: Array<() => void> = [];

    if (intervalMs > 0) {
      const id = window.setInterval(() => {
        if (document.visibilityState === 'visible') void run();
      }, intervalMs);
      cleanups.push(() => window.clearInterval(id));
    }

    if (refetchOnFocus) {
      const onFocus = () => void run();
      const onVisibility = () => {
        if (document.visibilityState === 'visible') void run();
      };
      window.addEventListener('focus', onFocus);
      document.addEventListener('visibilitychange', onVisibility);
      cleanups.push(() => {
        window.removeEventListener('focus', onFocus);
        document.removeEventListener('visibilitychange', onVisibility);
      });
    }

    return () => cleanups.forEach((fn) => fn());
  }, [enabled, intervalMs, refetchOnFocus]);
}

export default useAutoRefresh;
