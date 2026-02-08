import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { query, queryOne } from '../config/database.js';

const contactSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Valid email is required'),
  subject: z.string().min(1, 'Subject is required'),
  message: z.string().min(1, 'Message is required'),
});

const subscribeSchema = z.object({
  email: z.string().email('Valid email is required'),
  name: z.string().optional(),
  source: z.string().optional(),
});

function formatTicketCode(ticketNumber: number): string {
  return `SUP-${String(ticketNumber).padStart(6, '0')}`;
}

export const publicController = {
  async createContactTicket(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validation = contactSchema.safeParse(req.body);
      if (!validation.success) {
        res.status(400).json({ error: validation.error.errors[0].message });
        return;
      }

      const data = validation.data;
      const description = `From: ${data.name} <${data.email}>\n\n${data.message}`;

      const ticket = await queryOne<{ id: string; ticket_number: number }>(
        `INSERT INTO support_tickets (subject, description, priority, category, status)
         VALUES ($1, $2, 'medium', 'contact', 'open')
         RETURNING id, ticket_number`,
        [data.subject, description]
      );

      if (!ticket) {
        res.status(500).json({ error: 'Failed to create support ticket' });
        return;
      }

      const ticketCode = formatTicketCode(ticket.ticket_number);

      res.status(201).json({
        message: `Message has been sent to support with ticket number ${ticketCode} and will be worked on. Subsequent messages will be sent to your email.`,
        ticketId: ticket.id,
        ticketNumber: ticket.ticket_number,
        ticketCode,
      });
    } catch (error) {
      next(error);
    }
  },

  async subscribeNewsletter(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validation = subscribeSchema.safeParse(req.body);
      if (!validation.success) {
        res.status(400).json({ error: validation.error.errors[0].message });
        return;
      }

      const data = validation.data;
      const email = data.email.toLowerCase();

      const subscriber = await queryOne<{ id: string }>(
        `INSERT INTO newsletter_subscribers (email, name, source, is_active, subscribed_at, updated_at)
         VALUES ($1, $2, $3, TRUE, NOW(), NOW())
         ON CONFLICT (email)
         DO UPDATE SET
            name = COALESCE(EXCLUDED.name, newsletter_subscribers.name),
            source = EXCLUDED.source,
            is_active = TRUE,
            updated_at = NOW()
         RETURNING id`,
        [email, data.name || null, data.source || 'footer']
      );

      res.status(201).json({
        message: 'Subscribed successfully',
        subscriberId: subscriber?.id || null,
      });
    } catch (error) {
      next(error);
    }
  },
};
