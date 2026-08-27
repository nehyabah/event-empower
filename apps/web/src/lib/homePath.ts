import type { UserType } from "@/context/AuthContext";

/**
 * Where each role belongs after signing in.
 *
 * /home is client-only, so sending everyone there bounced planners and vendors
 * off a guard they were never meant to hit. One definition, used by both the
 * login page and the modal.
 */
export const homePathFor = (userType?: UserType | string | null): string => {
  switch (userType) {
    case "planner":
      return "/planner-home";
    case "vendor":
      return "/vendor-home";
    case "admin":
      return "/admin";
    default:
      return "/home";
  }
};

export default homePathFor;
