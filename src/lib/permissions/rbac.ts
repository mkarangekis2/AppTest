export type AppRole = "Owner" | "Admin" | "Manager" | "Employee" | "Viewer";

export function getUserRole(user: { app_metadata?: Record<string, unknown> | null }): AppRole {
  const role = String(user.app_metadata?.role || "Owner");
  if (role === "Owner" || role === "Admin" || role === "Manager" || role === "Employee" || role === "Viewer") {
    return role;
  }
  return "Owner";
}

export function canManageSettings(role: AppRole) {
  return role === "Owner" || role === "Admin";
}

export function canManageIntegrations(role: AppRole) {
  return role === "Owner" || role === "Admin" || role === "Manager";
}

export function canInstallSystems(role: AppRole) {
  return role === "Owner" || role === "Admin" || role === "Manager";
}
