import { useEffect, useRef } from "react";
import confetti from "canvas-confetti";
import { useAuth } from "@/context/AuthContext";

/**
 * Fires confetti the first time a professional loads a page after approval.
 *
 * The moment is worth marking: they signed up, filled in a profile and then
 * waited on someone else. But it should happen once — celebrating on every
 * page load would be irritating — so the user's id is recorded in
 * localStorage once it has run.
 */

const seenKey = (userId: string) => `approval-celebrated:${userId}`;

const ApprovalCelebration = () => {
  const { user } = useAuth();
  const fired = useRef(false);

  useEffect(() => {
    if (fired.current) return;
    if (!user?.id || user.approvalStatus !== "approved") return;
    // Only professionals go through approval; couples are approved on signup
    // and would otherwise get confetti for simply existing.
    if (user.userType !== "vendor" && user.userType !== "planner") return;

    let alreadySeen = false;
    try {
      alreadySeen = localStorage.getItem(seenKey(user.id)) !== null;
    } catch {
      // Private browsing can throw on access; better to skip than to crash.
      return;
    }
    if (alreadySeen) return;

    fired.current = true;
    try {
      localStorage.setItem(seenKey(user.id), String(Date.now()));
    } catch {
      /* non-fatal */
    }

    // Respect a user who has asked for reduced motion.
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;

    const end = Date.now() + 1200;
    const colours = ["#b2834c", "#2e3240", "#e8d5b7", "#ffffff"];

    const frame = () => {
      confetti({ particleCount: 3, angle: 60, spread: 70, origin: { x: 0, y: 0.7 }, colors: colours });
      confetti({ particleCount: 3, angle: 120, spread: 70, origin: { x: 1, y: 0.7 }, colors: colours });
      if (Date.now() < end) requestAnimationFrame(frame);
    };
    frame();
  }, [user?.id, user?.approvalStatus, user?.userType]);

  return null;
};

export default ApprovalCelebration;
