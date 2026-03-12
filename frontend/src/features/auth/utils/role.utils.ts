export function isAdminRole(role?: string | null): boolean {
  const normalizedRole = role?.trim().toUpperCase();

  return normalizedRole === "ADMIN" || normalizedRole === "ROLE_ADMIN";
}
