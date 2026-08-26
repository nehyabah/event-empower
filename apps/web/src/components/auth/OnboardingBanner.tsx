import { useLocation } from "react-router-dom";
import { Sparkles } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

/**
 * Shown to a professional who has just signed up and been sent here to fill in
 * their own details.
 *
 * Approval is the admin's job; onboarding is not — nobody but the vendor or
 * planner knows their business name, city or socials. A Google signup arrives
 * with nothing but an email address, so without this the page looks like an
 * ordinary settings screen and gets ignored.
 */
const OnboardingBanner = () => {
  const location = useLocation();
  const { user } = useAuth();

  const justSignedUp = (location.state as { onboarding?: boolean } | null)?.onboarding === true;
  const awaitingApproval = user?.approvalStatus === "pending";
  // 'pending' is set at signup, so it alone does not mean anything was sent in.
  const submitted = Boolean(user?.onboardingSubmittedAt);

  // Once approved this is just their profile page again.
  if (!justSignedUp && !awaitingApproval) return null;

  return (
    <div className="border border-amber-200 bg-amber-50 rounded-lg p-4 mb-6">
      <div className="flex items-start gap-3">
        <Sparkles className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="text-sm font-medium text-amber-900">
            {submitted ? "Your application is being reviewed" : "Finish setting up your profile"}
          </p>
          <p className="text-xs text-amber-800">
            {submitted
              ? "We're checking the details you submitted. You'll get an email once approved, usually within 1 working day."
              : "Add your business name, location and contact details below, then save. We'll email you once it's been reviewed."}
          </p>
        </div>
      </div>
    </div>
  );
};

export default OnboardingBanner;
