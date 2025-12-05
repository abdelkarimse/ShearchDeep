"use client";

import { useProtectedRoute, useHasRole } from "@/hooks/useAuth";
import { ReactNode } from "react";

/**
 * Protected Route Component for Client-Side Route Protection
 * Use in layouts or page wrappers that need to check authentication
 */
export function ProtectedRoute({
  children,
  requiredRoles,
}: {
  children: ReactNode;
  requiredRoles?: string[];
}) {
  const { isAuthorized, isLoading } = useProtectedRoute(requiredRoles);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return null;
  }

  return <>{children}</>;
}

/**
 * Admin-Only Route Wrapper
 */
export function AdminRoute({ children }: { children: ReactNode }) {
  return <ProtectedRoute requiredRoles={["admin"]}>{children}</ProtectedRoute>;
}

/**
 * User-Only Route Wrapper
 */
export function UserRoute({ children }: { children: ReactNode }) {
  return (
    <ProtectedRoute requiredRoles={["default-roles-master"]}>
      {children}
    </ProtectedRoute>
  );
}

/**
 * Conditional Content Based on Role
 */
export function RoleBasedContent({
  role,
  children,
  fallback,
}: {
  role: string | string[];
  children: ReactNode;
  fallback?: ReactNode;
}) {
  const hasRole = useHasRole(role);

  if (!hasRole) {
    return fallback || null;
  }

  return <>{children}</>;
}
