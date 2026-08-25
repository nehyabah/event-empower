import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const envSchema = z.object({
  PORT: z.string().default('3001'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  DATABASE_URL: z.string().url(),
  ACCESS_TOKEN_SECRET: z.string().min(32),
  REFRESH_TOKEN_SECRET: z.string().min(32),
  GOOGLE_CLIENT_ID: z.string().default(''),
  TWILIO_ACCOUNT_SID: z.string().default(''),
  TWILIO_AUTH_TOKEN: z.string().default(''),
  TWILIO_SMS_FROM: z.string().default(''),
  TWILIO_WHATSAPP_FROM: z.string().default(''),
  ALLOWED_ORIGINS: z.string().default('http://localhost:5173'),
  STORAGE_ENDPOINT: z.string().optional(),
  STORAGE_BUCKET: z.string().optional(),
  STORAGE_ACCESS_KEY: z.string().optional(),
  STORAGE_SECRET_KEY: z.string().optional(),
  STORAGE_REGION: z.string().default('us-east-1'),
  STORAGE_PUBLIC_URL: z.string().optional(),
  RESEND_API_KEY: z.string().optional(),
  // Any SMTP provider (Amazon SES, Brevo, Mailgun, Postmark...). Set these and
  // they take precedence over Resend, so switching provider is config-only.
  // Brevo over HTTPS. Preferred over SMTP because Railway (like most hosts)
  // blocks outbound SMTP ports, so nodemailer just times out.
  BREVO_API_KEY: z.string().optional(),
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.string().default('587'),
  SMTP_USER: z.string().optional(),
  SMTP_PASSWORD: z.string().optional(),
  APP_URL: z.string().default('http://localhost:8083'),
  EMAIL_FROM: z.string().default('Planr <onboarding@resend.dev>'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('Invalid environment variables:', parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;
