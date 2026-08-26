import { useAuth } from "@/context/AuthContext";

/**
 * Whether the signed-in professional may act yet.
 *
 * Vendors and planners are reviewed before they go live, so anything that
 * puts them in front of couples — taking bookings, replying to enquiries,
 * appearing in the marketplace — stays disabled until an admin approves.
 *
 * Couples and admins are never gated.
 */
export const useApproval = () => {
  const { user } = useAuth();

  const isProfessional = user?.userType === "vendor" || user?.userType === "planner";
  const status = user?.approvalStatus;

  const isApproved = !isProfessional || status === "approved";
  const isPending = isProfessional && status === "pending";
  const isRejected = isProfessional && status === "rejected";
  const hasSubmitted = Boolean(user?.onboardingSubmittedAt);

  return {
    isApproved,
    isPending,
    isRejected,
    hasSubmitted,
    /** Pass to `disabled` on anything a pending professional must not do. */
    blocked: !isApproved,
    /** Ready-made tooltip/message explaining why something is disabled. */
    blockedReason: isRejected
      ? "Your application was not approved. Please contact support."
      : isPending && !hasSubmitted
      ? "Complete your profile so we can review your account."
      : isPending
      ? "Available once your account is approved."
      : undefined,
  };
};

export default useApproval;
