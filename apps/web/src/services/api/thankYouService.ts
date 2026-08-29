import { apiClient } from "./client";

export type ThankYouAudience = "attended" | "all";

export interface ThankYouNote {
  id: string;
  subject: string;
  body: string;
  photo_url: string | null;
  audience: ThankYouAudience;
  sent_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface AudienceBreakdown {
  reachable: number;
  noEmail: number;
  alreadySent: number;
}

export interface ThankYouRecipient {
  id: string;
  guest_name: string | null;
  email: string | null;
  status: "sent" | "failed" | "skipped";
  error: string | null;
  created_at: string;
}

export interface SentThankYouNote extends ThankYouNote {
  recipients: ThankYouRecipient[];
}

export const thankYouService = {
  async getDraft() {
    return apiClient.get<{ draft: ThankYouNote | null; breakdown: AudienceBreakdown; eventDate: string | null }>("/thank-you");
  },

  async saveDraft(input: {
    subject: string;
    body: string;
    photoUrl?: string | null;
    audience?: ThankYouAudience;
  }) {
    return apiClient.put<{ draft: ThankYouNote }>("/thank-you", input);
  },

  async preview(audience: ThankYouAudience) {
    return apiClient.get<AudienceBreakdown>(`/thank-you/preview?audience=${audience}`);
  },

  async send() {
    return apiClient.post<{ sent: number; failed: number; skipped: number }>("/thank-you/send");
  },

  async history() {
    return apiClient.get<{ notes: SentThankYouNote[] }>("/thank-you/history");
  },
};
