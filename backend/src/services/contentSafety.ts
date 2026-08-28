/**
 * Detects attempts to pass contact details through chat.
 *
 * Couples and vendors are asked to keep the conversation on the platform
 * until a booking exists, both so the safety record stays intact and so a
 * dispute has something to refer back to. This is what enforces that on
 * message text.
 *
 * Deliberately covers the obfuscations people actually reach for - spelled
 * out digits, "at gmail dot com", letter-for-number swaps - because a plain
 * regex for `\d{11}` is trivially stepped around and would give a false
 * sense that the rule is enforced.
 *
 * It cannot read text inside an image. That gap is real and is covered by
 * warning the user, keeping the images, and letting a human report a chat -
 * not by pretending detection is complete.
 */

export type ContactViolation =
  | 'phone'
  | 'email'
  | 'url'
  | 'social_handle'
  | 'spelled_digits';

export interface SafetyResult {
  ok: boolean;
  violations: ContactViolation[];
}

/** Words people substitute for digits when trying to slip a number through. */
const DIGIT_WORDS =
  '(?:zero|one|two|three|four|five|six|seven|eight|nine|oh|nought|null)';

/**
 * Normalises the tricks that break a naive digit match:
 * letter-for-number swaps, and separators sprinkled between digits.
 */
function normaliseForPhone(input: string): string {
  return input
    .toLowerCase()
    // o -> 0 and l/i -> 1 only when adjacent to a digit, so ordinary words
    // are left alone.
    .replace(/(?<=\d)[ol](?=\d)/g, '0')
    .replace(/(?<=\d)[li](?=\d)/g, '1')
    // Strip the separators used to break up a number.
    .replace(/[\s.\-_()+*·•]/g, '');
}

const PATTERNS: Array<{ kind: ContactViolation; test: (raw: string, phoneish: string) => boolean }> = [
  {
    kind: 'email',
    test: (raw) =>
      // Standard address, plus the "name at gmail dot com" spellings.
      /[\w.+-]+@[\w-]+\.[a-z]{2,}/i.test(raw) ||
      /[\w.+-]+\s*(?:\(|\[)?\s*(?:at|@)\s*(?:\)|\])?\s*[\w-]+\s*(?:\(|\[)?\s*(?:dot|\.)\s*(?:\)|\])?\s*[a-z]{2,}/i.test(raw),
  },
  {
    kind: 'url',
    test: (raw) =>
      /\b(?:https?:\/\/|www\.)\S+/i.test(raw) ||
      // Bare domains for the hosts people actually share.
      /\b[\w-]+\.(?:com|net|org|ng|co|io|me|link|site|shop)\b/i.test(raw),
  },
  {
    kind: 'social_handle',
    test: (raw) =>
      /(?:^|\s)@[\w.]{3,}/.test(raw) ||
      /\b(?:whatsapp|whats\s?app|wa\.me|telegram|t\.me|snapchat|instagram|insta|ig|facebook|fb|tiktok|dm\s+me|call\s+me|text\s+me)\b/i.test(raw),
  },
  {
    kind: 'phone',
    test: (_raw, phoneish) =>
      // Nigerian mobile: 11 digits from 0, or +234 / 234 followed by 10.
      /(?:^|\D)0[789]\d{9}(?:\D|$)/.test(phoneish) ||
      /(?:^|\D)(?:\+?234)[789]\d{9}(?:\D|$)/.test(phoneish) ||
      // Any other run long enough to be a phone number rather than a price,
      // a date or a guest count.
      /(?:^|\D)\d{10,15}(?:\D|$)/.test(phoneish),
  },
  {
    kind: 'spelled_digits',
    test: (raw) => {
      // Six or more digit-words in a row is someone reading out a number.
      const re = new RegExp(`(?:${DIGIT_WORDS}[\\s,.-]*){6,}`, 'i');
      return re.test(raw);
    },
  },
];

export function checkMessage(text: string): SafetyResult {
  const raw = text || '';
  const phoneish = normaliseForPhone(raw);

  const violations = PATTERNS.filter(({ test }) => test(raw, phoneish)).map(({ kind }) => kind);

  return { ok: violations.length === 0, violations };
}

/**
 * Records a blocked attempt so a pattern is visible to an admin later.
 * Never throws: failing to log must not also fail the block.
 */
export async function recordFlag(params: {
  userId: string;
  surface: 'inquiry' | 'workspace_chat';
  contextId: string | null;
  violations: ContactViolation[];
  text: string;
}): Promise<void> {
  try {
    const { query } = await import('../config/database.js');
    await query(
      `INSERT INTO message_flags (user_id, surface, context_id, violations, attempted_text)
       VALUES ($1, $2, $3, $4, $5)`,
      [params.userId, params.surface, params.contextId, params.violations, params.text.slice(0, 4000)]
    );
  } catch (err) {
    console.error('[safety] could not record flag:', err);
  }
}

/** What the sender is told. Names the category without coaching evasion. */
export function violationMessage(violations: ContactViolation[]): string {
  const what = violations.includes('phone') || violations.includes('spelled_digits')
    ? 'a phone number'
    : violations.includes('email')
      ? 'an email address'
      : violations.includes('url')
        ? 'a link'
        : 'contact details';

  return `This message looks like it contains ${what}. Please keep the conversation here until a booking is confirmed — it protects both of you if anything goes wrong.`;
}
