/**
 * Resolving stored media URLs for display.
 *
 * The API persists uploaded images as a host-free path (`/api/media/<key>`)
 * pointing at its re-signing proxy. Storing a relative path keeps the database
 * portable across domains, but the browser would resolve it against the *web
 * app's* origin — which in dev (and on split deployments) is not the API. So
 * the API origin has to be reattached at render time.
 *
 * Anything else — data: URLs, images pasted from elsewhere on the web — is
 * returned untouched.
 */

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

/** Origin of the API, derived from VITE_API_URL (which includes the /api path). */
const apiOrigin = (): string => {
  try {
    return new URL(API_URL, window.location.origin).origin;
  } catch {
    return window.location.origin;
  }
};

export const resolveMediaUrl = (value: string | null | undefined): string => {
  if (!value) return '';
  // Absolute URL or inline data — already displayable.
  if (/^(https?:|data:|blob:)/i.test(value)) return value;
  // The API's own proxy path: attach the API origin.
  if (value.startsWith('/api/')) return `${apiOrigin()}${value}`;
  return value;
};

export default resolveMediaUrl;
