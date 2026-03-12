export function formatRoleLabel(role?: string): string {
  if (!role) {
    return "Resident";
  }

  return role.charAt(0).toUpperCase() + role.slice(1).toLowerCase();
}
