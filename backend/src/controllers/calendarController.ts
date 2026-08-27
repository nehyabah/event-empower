import { Request, Response, NextFunction } from 'express';
import { calendarService } from '../services/calendarService.js';
import { icsService } from '../services/icsService.js';
import { env } from '../config/env.js';

/** Public base URL of the API, used to build subscribe links. */
const apiBaseUrl = (req: Request): string => {
  const configured = process.env.API_PUBLIC_URL;
  if (configured) return configured.replace(/\/+$/, '');
  return `${req.protocol}://${req.get('host')}`;
};

const feedDomain = (): string => {
  try {
    return new URL(env.APP_URL).hostname || 'ajoyo.app';
  } catch {
    return 'ajoyo.app';
  }
};

export const calendarController = {
  /** Everything on the signed-in user's calendar, plus their feed URLs. */
  async getMyCalendar(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { userId, userType } = req.user!;
      // Independent reads; overlapping them removes a whole round trip.
      const [entries, token] = await Promise.all([
        calendarService.getEntries(userId, userType),
        calendarService.getCalendarToken(userId),
      ]);

      const base = apiBaseUrl(req);
      const feedUrl = token ? `${base}/api/calendar/feed/${token}.ics` : null;

      res.json({
        entries,
        upcoming: calendarService.upcoming(entries),
        nextEvent: calendarService.nextEvent(entries),
        feedUrl,
        // webcal:// makes desktop calendar apps subscribe instead of download.
        webcalUrl: feedUrl ? feedUrl.replace(/^https?:\/\//, 'webcal://') : null,
      });
    } catch (error) {
      next(error);
    }
  },

  /** Invalidate the old feed URL and issue a new one. */
  async rotateFeedToken(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const token = await calendarService.rotateCalendarToken(req.user!.userId);
      if (!token) {
        res.status(404).json({ error: 'User not found' });
        return;
      }
      const feedUrl = `${apiBaseUrl(req)}/api/calendar/feed/${token}.ics`;
      res.json({ feedUrl, webcalUrl: feedUrl.replace(/^https?:\/\//, 'webcal://') });
    } catch (error) {
      next(error);
    }
  },

  /**
   * The subscribable ICS feed. Authenticated by the unguessable token in the
   * URL, because calendar clients cannot present a bearer token.
   */
  async getFeed(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const raw = (req.params as unknown as string[])[0] ?? req.params.token;
      const token = String(raw || '').replace(/\.ics$/i, '');

      if (!/^[0-9a-f-]{36}$/i.test(token)) {
        res.status(404).type('text/plain').send('Calendar not found');
        return;
      }

      const user = await calendarService.findUserByCalendarToken(token);
      if (!user) {
        res.status(404).type('text/plain').send('Calendar not found');
        return;
      }

      const entries = await calendarService.getEntries(user.id, user.user_type);
      const calendarName = user.name ? `àjọyọ — ${user.name}` : 'àjọyọ';
      const body = icsService.build(entries, { calendarName, domain: feedDomain() });

      res.setHeader('Content-Type', 'text/calendar; charset=utf-8');
      res.setHeader('Content-Disposition', `inline; filename="${icsService.filename('ajoyo')}"`);
      // Feeds are polled; let clients revalidate rather than serve stale data.
      res.setHeader('Cache-Control', 'no-cache, must-revalidate');
      res.send(body);
    } catch (error) {
      next(error);
    }
  },

  /** Download the whole calendar as a one-off .ics file. */
  async exportAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { userId, userType } = req.user!;
      const entries = await calendarService.getEntries(userId, userType);
      const body = icsService.build(entries, { calendarName: 'àjọyọ', domain: feedDomain() });

      res.setHeader('Content-Type', 'text/calendar; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="${icsService.filename('ajoyo-calendar')}"`);
      res.send(body);
    } catch (error) {
      next(error);
    }
  },

  /** "Add to calendar" for one entry. */
  async exportEntry(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { userId, userType } = req.user!;
      const rawId = (req.params as unknown as string[])[0] ?? req.params.entryId;
      const entryId = decodeURIComponent(String(rawId || '')).replace(/\.ics$/i, '');

      const entries = await calendarService.getEntries(userId, userType);
      const entry = entries.find((e) => e.id === entryId);

      if (!entry) {
        res.status(404).json({ error: 'Calendar entry not found' });
        return;
      }

      const body = icsService.buildSingle(entry, { domain: feedDomain() });
      res.setHeader('Content-Type', 'text/calendar; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="${icsService.filename(entry.title)}"`);
      res.send(body);
    } catch (error) {
      next(error);
    }
  },
};
