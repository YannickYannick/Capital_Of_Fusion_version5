import type { AuthUser } from "@/contexts/AuthContext";

/**
 * Même logique que le backend `IsStaffOrSuperUser` (is_staff ou is_superuser).
 * Repli sur user_type si les flags Django ne sont pas encore dans la réponse /me.
 */
export function isStaffOrSuperuser(user: AuthUser | null | undefined): boolean {
  if (!user) return false;
  if (user.is_staff || user.is_superuser) return true;
  return user.user_type === "STAFF" || user.user_type === "ADMIN";
}
