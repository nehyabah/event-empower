/**
 * Where the API lives.
 *
 * Single-domain deploy: the API is served from /api on the same origin in
 * production, so no build-time variable is needed and changing the domain
 * needs no rebuild. Dev points at the separate backend on :3001.
 *
 * This exists because six files each carried their own copy of this
 * expression, and five of them omitted the production branch — so anything
 * not going through apiClient posted to http://localhost:3001 from the live
 * site and failed at the network layer with "fetch failed". Uploading a
 * photo was one of them.
 */
export const API_URL =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.PROD ? "/api" : "http://localhost:3001/api");

export default API_URL;
