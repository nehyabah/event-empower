import twilio from 'twilio';
import crypto from 'crypto';
import bcrypt from 'bcrypt';
import { env } from '../config/env.js';
import { OtpCodeModel, OtpChannel } from '../models/OtpCode.js';
import { UserModel, UserType } from '../models/User.js';
import { tokenService, TokenPair } from './tokenService.js';

// Lazy-load Twilio client to avoid startup errors with invalid credentials
let twilioClient: ReturnType<typeof twilio> | null = null;

function getTwilioClient() {
  if (!twilioClient) {
    if (!env.TWILIO_ACCOUNT_SID.startsWith('AC')) {
      // Twilio is optional: without it the app runs fine, minus phone sign-in and
      // SMS reminders. Tagged 503 so callers get that message rather than an
      // opaque 500 (errorHandler hides the text of untagged errors).
      const err: Error & { statusCode?: number } = new Error(
        'Phone sign-in is unavailable because SMS is not configured.'
      );
      err.statusCode = 503;
      throw err;
    }
    twilioClient = twilio(env.TWILIO_ACCOUNT_SID, env.TWILIO_AUTH_TOKEN);
  }
  return twilioClient;
}

const OTP_LENGTH = 6;
const OTP_EXPIRY_MINUTES = 10;
const SALT_ROUNDS = 10;

function generateOtp(): string {
  // Generate a random 6-digit code
  const buffer = crypto.randomBytes(4);
  const num = buffer.readUInt32BE(0);
  const otp = (num % 1000000).toString().padStart(OTP_LENGTH, '0');
  return otp;
}

export interface PhoneAuthResult {
  user: {
    id: string;
    email: string | null;
    name: string | null;
    userType: UserType;
    avatarUrl: string | null;
  };
  tokens: TokenPair;
  isNewUser: boolean;
}

export const twilioService = {
  async sendOtp(phone: string, channel: OtpChannel): Promise<void> {
    // Generate OTP
    const otp = generateOtp();

    // Hash the OTP for storage
    const codeHash = await bcrypt.hash(otp, SALT_ROUNDS);

    // Calculate expiration
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + OTP_EXPIRY_MINUTES);

    // Store the OTP
    await OtpCodeModel.create(phone, codeHash, channel, expiresAt);

    // Send the OTP via Twilio
    const from = channel === 'whatsapp'
      ? `whatsapp:${env.TWILIO_WHATSAPP_FROM}`
      : env.TWILIO_SMS_FROM;

    const to = channel === 'whatsapp'
      ? `whatsapp:${phone}`
      : phone;

    await getTwilioClient().messages.create({
      body: `Your Planr verification code is: ${otp}. This code expires in ${OTP_EXPIRY_MINUTES} minutes.`,
      from,
      to,
    });
  },

  /** Send an arbitrary SMS. Used for guest RSVP reminders. */
  async sendSms(phone: string, body: string): Promise<void> {
    await getTwilioClient().messages.create({
      body,
      from: env.TWILIO_SMS_FROM,
      to: phone,
    });
  },

  /** True when Twilio credentials look usable, so callers can skip cleanly. */
  get isConfigured(): boolean {
    return env.TWILIO_ACCOUNT_SID.startsWith('AC') && Boolean(env.TWILIO_SMS_FROM);
  },

  async verifyOtp(phone: string, code: string, userType?: UserType): Promise<PhoneAuthResult> {
    // Find the valid OTP code
    const otpRecord = await OtpCodeModel.findValidCode(phone);

    if (!otpRecord) {
      throw new Error('No valid verification code found. Please request a new one.');
    }

    // Increment attempts
    await OtpCodeModel.incrementAttempts(otpRecord.id);

    // Verify the code
    const isValid = await bcrypt.compare(code, otpRecord.code_hash);

    if (!isValid) {
      throw new Error('Invalid verification code');
    }

    // Mark as used
    await OtpCodeModel.markAsUsed(otpRecord.id);

    // Find or create user
    let user = await UserModel.findByPhone(phone);
    let isNewUser = false;

    if (!user) {
      // Create new user
      user = await UserModel.create({
        phone,
        auth_provider: 'phone',
        user_type: userType || 'client',
      });
      isNewUser = true;
    } else if (user.deleted_at || !user.is_active) {
      throw new Error('Account is inactive. Please contact support.');
    } else if (userType && userType !== user.user_type) {
      // Update user type if provided and different
      const updatedUser = await UserModel.update(user.id, { user_type: userType });
      if (updatedUser) {
        user = updatedUser;
      }
    }

    // Generate tokens
    const tokens = await tokenService.generateTokenPair(user);

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        userType: user.user_type,
        avatarUrl: user.avatar_url,
      },
      tokens,
      isNewUser,
    };
  },
};
