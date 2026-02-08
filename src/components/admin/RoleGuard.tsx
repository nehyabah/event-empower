import { useAuth } from "@/context/AuthContext";

export type AdminRole = "super_admin" | "admin" | "support" | "analyst";

const ROLE_HIERARCHY: Record<AdminRole, number> = {
  super_admin: 4,
  admin: 3,
  support: 2,
  analyst: 1,
};

export function useAdminRole(): AdminRole | null {
  const { user } = useAuth();
  if (!user || user.userType !== "admin") return null;
  return (user.adminRole as AdminRole) || null;
}

export function hasRole(currentRole: AdminRole | null, requiredRoles: AdminRole[]): boolean {
  if (!currentRole) return false;
  return requiredRoles.includes(currentRole);
}

export function hasMinRole(currentRole: AdminRole | null, minRole: AdminRole): boolean {
  if (!currentRole) return false;
  return ROLE_HIERARCHY[currentRole] >= ROLE_HIERARCHY[minRole];
}

interface RoleGuardProps {
  allowedRoles: AdminRole[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

const RoleGuard = ({ allowedRoles, children, fallback = null }: RoleGuardProps) => {
  const role = useAdminRole();

  if (!hasRole(role, allowedRoles)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

export default RoleGuard;
