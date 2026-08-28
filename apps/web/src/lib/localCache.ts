/**
 * Browser-local copies of a user's own data.
 *
 * These keys exist so the dashboard can paint the couple's names and date
 * before the event request comes back. They are a cache of the signed-in
 * user's data — but localStorage is scoped to the browser, not the account,
 * so nothing removed them when that user signed out. The next person to sign
 * in on the same browser inherited the previous couple's names, venue and
 * wedding date.
 *
 * The owner marker below ties the cache to one account id and empties it the
 * moment a different one appears. Signing out is not enough on its own: a
 * session can lapse without anyone pressing Log out.
 */

const CACHED_KEYS = [
  "partner1Name",
  "partner2Name",
  "venue",
  "weddingDate",
  "saveTheDateTemplate",
  "saveTheDateAlign",
  "hidePlannerLink",
  "plannerTaskComments",
  "planr:clients-view",
  "userEmail",
  // Retired: the chat safety notice used to be dismissed once per browser.
  // It is now shown before each new conversation, so this key is dead and
  // is cleared so an old acceptance cannot keep suppressing it.
  "chatSafetyAccepted",
] as const;

const OWNER_KEY = "cacheOwnerId";

export function clearLocalCache(): void {
  for (const key of CACHED_KEYS) localStorage.removeItem(key);
  localStorage.removeItem(OWNER_KEY);
}

/**
 * Bind the cache to `userId`, wiping it first if it belonged to anyone else.
 * Safe to call on every render — it only does work when the owner changes.
 */
export function scopeLocalCacheTo(userId: string | null): void {
  const owner = localStorage.getItem(OWNER_KEY);
  if (owner === (userId ?? null)) return;

  clearLocalCache();
  if (userId) localStorage.setItem(OWNER_KEY, userId);
}
