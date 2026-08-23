/**
 * Money formatting.
 *
 * One helper so the same figure cannot appear as ₦ on one screen and $ on
 * another — which is what happened when the couple's budget screens used naira
 * while the planner-facing views formatted the identical value as US dollars.
 */

const NGN = new Intl.NumberFormat('en-NG', {
  style: 'currency',
  currency: 'NGN',
  maximumFractionDigits: 0,
});

/** e.g. ₦1,000,000 */
export const formatCurrency = (value: number | string | null | undefined): string => {
  const n = typeof value === 'string' ? Number(value) : value;
  if (n === null || n === undefined || !Number.isFinite(n)) return '—';
  return NGN.format(n);
};

/** Same, but with a caller-chosen placeholder when there is no figure yet. */
export const formatCurrencyOr = (
  value: number | string | null | undefined,
  fallback: string,
): string => {
  const n = typeof value === 'string' ? Number(value) : value;
  if (n === null || n === undefined || !Number.isFinite(n) || n === 0) return fallback;
  return NGN.format(n);
};
