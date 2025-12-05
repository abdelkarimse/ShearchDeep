"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import type { Session } from "next-auth";

/**
 * Hook to access the current session and auth state
 * Use in client components only
 */
export function useAuth() {
  const { data: session, status } = useSession();

  const sessionData = session as
    | (Session & {
        realm_roles?: string[];
        accessToken?: string;
      })
    | null;

  return {
    session,
    isAuthenticated: status === "authenticated",
    isLoading: status === "loading",
    user: session?.user,
    roles: sessionData?.realm_roles || [],
    accessToken: sessionData?.accessToken,
  };
}

/**
 * Hook for client-side route protection
 * Redirects to login if not authenticated
 * Only rejects if user doesn't have all required roles (if specified)
 */
export function useProtectedRoute(requiredRoles?: string[]) {
  const router = useRouter();
  const { isAuthenticated, isLoading, roles } = useAuth();

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated) {
      router.push("/auth/signin");
      return;
    }

    // Only check roles if specific roles are required
    if (requiredRoles && requiredRoles.length > 0) {
      const hasRole = requiredRoles.some((role) => roles.includes(role));
      if (!hasRole) {
        router.push("/auth/error?error=Unauthorized");
        return;
      }
    }
  }, [isAuthenticated, isLoading, requiredRoles, roles, router]);

  const isAuthorized = requiredRoles
    ? isAuthenticated && requiredRoles.some((role) => roles.includes(role))
    : isAuthenticated;

  return { isAuthorized, isLoading };
}

/**
 * Hook to check if user has a specific role
 */
export function useHasRole(role: string | string[]) {
  const { roles } = useAuth();
  const requiredRoles = Array.isArray(role) ? role : [role];
  return requiredRoles.some((r) => roles.includes(r));
}

/**
 * Hook to check if user is admin
 */
export function useIsAdmin() {
  return useHasRole("admin");
}
