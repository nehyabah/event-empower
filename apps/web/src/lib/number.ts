/**
 * Plain number formatting — counts, totals, guest numbers.
 *
 * Separate from formatCurrency in lib/currency.ts, which adds the naira
 * symbol. Use this wherever a figure is a count rather than money: a guest
 * list of 1500 should read "1,500", but "₦1,500" would be nonsense.
 *
 * Pinned to en-NG rather than the browser's locale so the same figure reads
 * the same for everyone — several places were calling bare toLocaleString(),
 * which formats to whatever the visitor's device is set to.
 */

const NUMBER = new Intl.NumberFormat('en-NG');

/** e.g. 1,500 */
export const formatNumber = (value: number | string | null | undefined): string => {
  const n = typeof value === 'string' ? Number(value) : value;
  if (n === null || n === undefined || !Number.isFinite(n)) return '0';
  return NUMBER.format(n);
};
