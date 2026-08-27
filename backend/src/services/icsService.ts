import { CalendarEntry } from './calendarService.js';

/**
 * Minimal RFC 5545 writer.
 *
 * Enough to produce a feed Google, Apple and Outlook Calendar all accept:
 * CRLF line endings, 75-octet folding, escaped text values, and a VALARM so the
 * subscriber's own calendar app delivers the reminder.
 */

const PRODID = '-//ajoyo//Wedding Planner//EN';

/**
 * Every stored time is a wall-clock time in Nigeria.
 *
 * Emitting them as floating values (no TZID, no Z) means "whatever local time
 * the viewer is in", so an 8pm ceremony showed at 8pm in the subscriber's own
 * zone — off by however far apart the two are. Google ignores X-WR-TIMEZONE
 * for individual events, so that header alone never fixed it.
 */
const TZID = 'Africa/Lagos';

/**
 * WAT is UTC+1 all year and Nigeria observes no DST, so one STANDARD rule with
 * matching offsets is the whole definition. Google, Apple and Outlook all
 * require the VTIMEZONE to be present before a TZID may be referenced.
 */
const VTIMEZONE = [
  'BEGIN:VTIMEZONE',
  `TZID:${TZID}`,
  'BEGIN:STANDARD',
  'DTSTART:19700101T000000',
  'TZOFFSETFROM:+0100',
  'TZOFFSETTO:+0100',
  'TZNAME:WAT',
  'END:STANDARD',
  'END:VTIMEZONE',
];

/** Escape a TEXT value per RFC 5545 §3.3.11. */
const escapeText = (value: string): string =>
  value
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\r?\n/g, '\\n');

/**
 * Fold to 75 octets per line. Counting is on UTF-8 bytes, not characters, so
 * names like "àjọyọ" don't produce over-length lines.
 */
const fold = (line: string): string => {
  const bytes = Buffer.from(line, 'utf8');
  if (bytes.length <= 75) return line;

  const out: string[] = [];
  let start = 0;
  let limit = 75;

  while (start < bytes.length) {
    let end = Math.min(start + limit, bytes.length);
    // Never split a multi-byte character: back off to a lead byte.
    while (end > start && end < bytes.length && (bytes[end] & 0xc0) === 0x80) end--;
    out.push(bytes.subarray(start, end).toString('utf8'));
    start = end;
    limit = 74; // continuation lines carry a leading space
  }

  return out.join('\r\n ');
};

const stampUtc = (date: Date): string =>
  date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');

/** YYYY-MM-DD -> YYYYMMDD */
const dateValue = (date: string): string => date.replace(/-/g, '');

/** YYYY-MM-DD + HH:MM[:SS] -> DATE-TIME, to be qualified by TZID at the call site. */
const dateTimeValue = (date: string, time: string): string => {
  const [h = '00', m = '00', s = '00'] = time.split(':');
  return `${dateValue(date)}T${h.padStart(2, '0')}${m.padStart(2, '0')}${s.padStart(2, '0')}`;
};

/** Add whole days to a YYYY-MM-DD string without tripping over month ends. */
const addDays = (date: string, days: number): string => {
  const d = new Date(`${date}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().split('T')[0];
};

const buildEvent = (entry: CalendarEntry, domain: string, now: Date): string[] => {
  const lines: string[] = ['BEGIN:VEVENT'];

  lines.push(`UID:${entry.id}@${domain}`);
  lines.push(`DTSTAMP:${stampUtc(now)}`);

  if (entry.start_time) {
    lines.push(`DTSTART;TZID=${TZID}:${dateTimeValue(entry.date, entry.start_time)}`);
    // Default a timed entry to an hour when no end is recorded.
    if (entry.end_time) {
      lines.push(`DTEND;TZID=${TZID}:${dateTimeValue(entry.date, entry.end_time)}`);
    } else {
      const [h = '00', m = '00'] = entry.start_time.split(':');
      const endHour = String((parseInt(h, 10) + 1) % 24).padStart(2, '0');
      lines.push(`DTEND;TZID=${TZID}:${dateTimeValue(entry.date, `${endHour}:${m}`)}`);
    }
  } else {
    // All-day: DTEND is exclusive, so it lands on the following day.
    lines.push(`DTSTART;VALUE=DATE:${dateValue(entry.date)}`);
    lines.push(`DTEND;VALUE=DATE:${dateValue(addDays(entry.date, 1))}`);
  }

  lines.push(`SUMMARY:${escapeText(entry.title)}`);
  if (entry.description) lines.push(`DESCRIPTION:${escapeText(entry.description)}`);
  if (entry.location) lines.push(`LOCATION:${escapeText(entry.location)}`);
  if (entry.category) lines.push(`CATEGORIES:${escapeText(entry.category)}`);
  lines.push('TRANSP:TRANSPARENT');

  // A day-ahead alarm: this is what makes a subscribed calendar actually remind you.
  lines.push('BEGIN:VALARM');
  lines.push('ACTION:DISPLAY');
  lines.push('TRIGGER:-P1D');
  lines.push(`DESCRIPTION:${escapeText(entry.title)}`);
  lines.push('END:VALARM');

  lines.push('END:VEVENT');
  return lines;
};

export const icsService = {
  /** Render entries as a complete VCALENDAR document. */
  build(entries: CalendarEntry[], options: { calendarName: string; domain?: string; now?: Date } ): string {
    const now = options.now ?? new Date();
    const domain = options.domain || 'ajoyo.app';

    const lines: string[] = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      `PRODID:${PRODID}`,
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      `X-WR-CALNAME:${escapeText(options.calendarName)}`,
      `X-WR-TIMEZONE:${TZID}`,
      // Hint to Google/Apple on how often to re-poll the feed.
      'REFRESH-INTERVAL;VALUE=DURATION:PT1H',
      'X-PUBLISHED-TTL:PT1H',
      ...VTIMEZONE,
    ];

    for (const entry of entries) {
      lines.push(...buildEvent(entry, domain, now));
    }

    lines.push('END:VCALENDAR');

    return lines.map(fold).join('\r\n') + '\r\n';
  },

  /** A single entry as a downloadable .ics ("Add to calendar"). */
  buildSingle(entry: CalendarEntry, options: { calendarName?: string; domain?: string } = {}): string {
    return this.build([entry], {
      calendarName: options.calendarName || entry.title,
      domain: options.domain,
    });
  },

  /** Safe filename for a Content-Disposition header. */
  filename(name: string): string {
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'calendar';
    return `${slug}.ics`;
  },
};
