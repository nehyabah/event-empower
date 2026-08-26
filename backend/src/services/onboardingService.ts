import { queryOne } from '../config/database.js';
import { emailService } from './emailService.js';

/**
 * Confirm to a vendor or planner that their profile has gone for review.
 *
 * Fires once. Professionals edit their profile repeatedly while setting it up,
 * and an email on every save would be noise — so the first completion stamps
 * onboarding_submitted_at and later saves are silent.
 *
 * Never throws: a mail failure must not roll back a profile the user just saved.
 */
export async function notifyOnboardingSubmitted(userId: string): Promise<void> {
  try {
    // The UPDATE only matches while the stamp is still null, so concurrent
    // saves cannot both claim the send.
    const claimed = await queryOne<{ email: string | null; name: string | null }>(
      `UPDATE users
          SET onboarding_submitted_at = NOW()
        WHERE id = $1
          AND onboarding_submitted_at IS NULL
          AND user_type IN ('vendor', 'planner')
          AND approval_status = 'pending'
        RETURNING email, name`,
      [userId]
    );

    if (!claimed?.email) return;

    await emailService.sendOnboardingSubmitted({
      toEmail: claimed.email,
      toName: claimed.name || '',
    });
  } catch (err) {
    console.error('[onboarding] submitted notice failed:', err);
  }
}
