"use client";

import { signIn, signOut } from "next-auth/react";
import { useAuth, useIsAdmin, useHasRole } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { LogOut, LogIn } from "lucide-react";

/**
 * Example authentication component showing all auth patterns
 * This demonstrates the proper way to use the auth system
 */
export function AuthExample() {
  const { user, roles, isAuthenticated, isLoading, accessToken } = useAuth();
  const isAdmin = useIsAdmin();
  const hasDocumentRole = !useHasRole("document-manager");

  if (isLoading) {
    return <div className="p-4">Loading auth status...</div>;
  }

  if (!isAuthenticated) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Not Authenticated</CardTitle>
          <CardDescription>Sign in to access the application</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={() => signIn("keycloak")}>
            <LogIn className="w-4 h-4 mr-2" />
            Sign In with Keycloak
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* User Info */}
      <Card>
        <CardHeader>
          <CardTitle>Authenticated User</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <p className="text-sm text-muted-foreground">Name</p>
            <p className="text-sm font-medium">{user?.name}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Email</p>
            <p className="text-sm font-medium">{user?.email}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Roles</p>
            <div className="flex flex-wrap gap-2 mt-1">
              {roles.map((role: string) => (
                <span
                  key={role}
                  className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700"
                >
                  {role}
                </span>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Role-based features */}
      <Card>
        <CardHeader>
          <CardTitle>Feature Access</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">Admin Panel</p>
            <p className={isAdmin ? "text-green-600" : "text-red-600"}>
              {isAdmin ? "✓ Accessible" : "✗ Restricted"}
            </p>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">Document Management</p>
            <p className={hasDocumentRole ? "text-green-600" : "text-red-600"}>
              {hasDocumentRole ? "✓ Accessible" : "✗ Restricted"}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Token Info */}
      <Card>
        <CardHeader>
          <CardTitle>Access Token</CardTitle>
          <CardDescription>Current JWT token (truncated)</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-xs font-mono text-muted-foreground">
            {accessToken?.substring(0, 50)}...
          </p>
        </CardContent>
      </Card>

      {/* Sign Out */}
      <div className="flex gap-2">
        <Button onClick={() => signOut()}>
          <LogOut className="w-4 h-4 mr-2" />
          Sign Out
        </Button>
        <Button variant="outline" onClick={() => signIn("keycloak")}>
          Switch Account
        </Button>
      </div>
    </div>
  );
}
