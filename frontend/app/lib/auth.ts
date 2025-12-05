import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/config";

export async function getSession() {
  return await getServerSession(authOptions);
}

export async function requireAuth() {
  const session = await getSession();
  if (!session) {
    throw new Error("Unauthorized - Session not found");
  }
  return session;
}

export async function requireRole(requiredRole: string | string[]) {
  const session = await requireAuth();
  const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];

  const userRoles = session.realm_roles || [];
  const hasRole = roles.some((role) => userRoles.includes(role));

  if (!hasRole) {
    throw new Error(`Unauthorized - Required role: ${roles.join(", ")}`);
  }

  return session;
}
