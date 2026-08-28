/**
 * The canonical vendor categories and locations.
 *
 * Both lists previously existed only as free text or as a const buried in
 * VendorProfile.tsx, so the directory's filters were built from whatever
 * values vendors happened to type. That gave "Lagos", "lagos" and
 * "Lekki, Lagos" three separate entries in the dropdown, and a category list
 * that changed shape every time a vendor was added.
 *
 * Defining them here means the profile form and the directory filter cannot
 * disagree.
 */

export const VENDOR_CATEGORIES = [
  'Venues',
  'Photographers',
  'Videographers',
  'Caterers',
  'Decorators',
  'Music & DJs',
  'Live Bands',
  'Makeup Artists',
  'Hair Stylists',
  'Wedding Attire',
  'Cakes',
  'Event Planners',
  'MCs & Hosts',
  'Transport',
  'Rentals',
  'Stationery',
  'Other',
] as const;

/** All 36 states plus the FCT. */
export const NIGERIAN_STATES = [
  'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa', 'Benue',
  'Borno', 'Cross River', 'Delta', 'Ebonyi', 'Edo', 'Ekiti', 'Enugu',
  'FCT - Abuja', 'Gombe', 'Imo', 'Jigawa', 'Kaduna', 'Kano', 'Katsina',
  'Kebbi', 'Kogi', 'Kwara', 'Lagos', 'Nasarawa', 'Niger', 'Ogun', 'Ondo',
  'Osun', 'Oyo', 'Plateau', 'Rivers', 'Sokoto', 'Taraba', 'Yobe', 'Zamfara',
] as const;

export const ALL_CATEGORIES = 'All Categories';
export const ALL_LOCATIONS = 'All Locations';

/**
 * Whether a vendor's location satisfies a chosen state.
 *
 * Matches on substring rather than equality because `location` is a single
 * free-text column that has always held things like "Lekki, Lagos". A vendor
 * who picks the state from the dropdown stores it cleanly; one who typed it
 * years ago still turns up under the right state.
 */
export function locationMatchesState(location: string | null | undefined, state: string): boolean {
  if (state === ALL_LOCATIONS) return true;
  if (!location) return false;

  const haystack = location.toLowerCase();
  // "FCT - Abuja" should match a stored "Abuja" as readily as a stored "FCT".
  const needles = state.toLowerCase().split(/\s*-\s*/).filter(Boolean);
  return needles.some((n) => haystack.includes(n));
}
