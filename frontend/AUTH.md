# Authentication System Documentation

## Overview

This application uses **NextAuth.js** with **Keycloak** as the identity provider. The auth system provides:

- 🔐 Secure OAuth2/OpenID Connect authentication
- 👤 User session management
- 🔑 Role-based access control (RBAC)
- 🛡️ Protected routes
- 📦 Client and server-side auth utilities

## Structure

```
app/
├── api/
│   └── auth/
│       ├── config.ts          # Auth configuration
│       └── [...nextauth]/
│           └── route.ts       # NextAuth handler
├── auth/
│   ├── signin/
│   │   └── page.tsx          # Sign in page
│   ├── signout/
│   │   └── page.tsx          # Sign out page
│   └── error/
│       └── page.tsx           # Auth error page
├── components/
│   └── auth/
│       ├── ProtectedRoute.tsx # Protected route wrapper
│       └── AuthExample.tsx    # Example auth component
├── hooks/
│   └── useAuth.ts            # Auth hooks
├── lib/
│   └── auth.ts               # Server-side auth utilities
├── types/
│   └── auth.ts               # TypeScript types
├── dashboard/
│   └── page.tsx              # User dashboard
├── Admin/
│   └── page.tsx              # Admin dashboard
└── middleware.ts             # Route protection middleware
```

## Authentication Hooks

### `useAuth()`

Access current user session and auth state in client components.

```tsx
"use client";

import { useAuth } from "@/app/hooks/useAuth";

export function MyComponent() {
  const { session, user, roles, isAuthenticated, isLoading, accessToken } =
    useAuth();

  return <div>{isAuthenticated && <p>Hello, {user?.name}!</p>}</div>;
}
```

### `useProtectedRoute(requiredRoles?)`

Protect a component or page route. Automatically redirects if not authenticated or lacks required role.

```tsx
"use client";

import { useProtectedRoute } from "@/app/hooks/useAuth";

export default function AdminPage() {
  const { isAuthorized, isLoading } = useProtectedRoute(["admin"]);

  if (isLoading) return <div>Loading...</div>;
  if (!isAuthorized) return null;

  return <div>Admin content</div>;
}
```

### `useHasRole(role | roles[])`

Check if user has a specific role.

```tsx
const hasAdminRole = useHasRole("admin");
const hasAnyRole = useHasRole(["admin", "moderator"]);
```

### `useIsAdmin()`

Shorthand to check if user is admin.

```tsx
const isAdmin = useIsAdmin();
```

## Protected Components

### `ProtectedRoute`

Wrap components that require authentication.

```tsx
<ProtectedRoute requiredRoles={["admin"]}>
  <AdminDashboard />
</ProtectedRoute>
```

### `AdminRoute`

Shorthand for admin-only content.

```tsx
<AdminRoute>
  <AdminPanel />
</AdminRoute>
```

### `UserRoute`

Shorthand for user-only content.

```tsx
<UserRoute>
  <UserContent />
</UserRoute>
```

### `RoleBasedContent`

Conditionally render based on role with fallback.

```tsx
<RoleBasedContent
  role={["admin", "moderator"]}
  fallback={<p>You don't have access</p>}
>
  <AdminContent />
</RoleBasedContent>
```

## Server-Side Authentication

### `getSession()`

Get the current session on the server.

```tsx
// app/admin/page.tsx
import { getSession } from "@/app/lib/auth";

export default async function AdminPage() {
  const session = await getSession();

  if (!session) {
    redirect("/auth/signin");
  }

  return <div>Admin content</div>;
}
```

### `requireAuth()`

Require authentication on the server. Throws error if not authenticated.

```tsx
import { requireAuth } from "@/app/lib/auth";

export default async function ProtectedPage() {
  const session = await requireAuth();

  return <div>User: {session.user.email}</div>;
}
```

### `requireRole(role | roles[])`

Require specific role on the server.

```tsx
import { requireRole } from "@/app/lib/auth";

export default async function AdminPage() {
  const session = await requireRole("admin");

  return <div>Admin content</div>;
}
```

## Session Data Structure

```typescript
{
  user: {
    id: string;
    email: string;
    name: string;
    given_name: string;
    family_name: string;
    preferred_username: string;
  };
  realm_roles: string[];           // User roles (e.g., ["admin"])
  resource_roles: Record<...>;     // Resource-specific roles
  accountRoles: string[];          // Keycloak account roles
  groups: string[];                // User groups
  customAttributes: Record<...>;   // Custom user attributes
  accessToken: string;             // OAuth access token
  sessionState: string;            // Keycloak session state
  scope: string;                   // OAuth scopes
  decodedToken: Record<...>;       // Full decoded JWT
}
```

## Route Protection

### Client-Side Protection

Use the `useProtectedRoute()` hook in components:

```tsx
"use client";

import { useProtectedRoute } from "@/app/hooks/useAuth";

export default function Page() {
  const { isAuthorized } = useProtectedRoute(["admin"]);

  if (!isAuthorized) return null;

  return <div>Protected content</div>;
}
```

### Server-Side Protection

Use middleware and server-side functions:

```tsx
// middleware.ts handles route protection automatically
// Routes matching /admin require admin role
// Routes matching /dashboard require any authenticated user
```

### Middleware Configuration

Edit `middleware.ts` to add custom route protection:

```typescript
const protectedRoutes: Record<string, string[]> = {
  "/admin": ["admin"],
  "/dashboard": ["user", "admin"],
  "/moderator": ["moderator"],
};
```

## Sign In / Sign Out

### Sign In

```tsx
import { signIn } from "next-auth/react";

<button onClick={() => signIn("keycloak")}>Sign In</button>;
```

### Sign Out

```tsx
import { signOut } from "next-auth/react";

<button onClick={() => signOut()}>Sign Out</button>;
```

## Environment Variables

```env
# Required
AUTH_URL=http://localhost:3000
AUTH_SECRET="your-secret-here"

# Keycloak Configuration
AUTH_KEYCLOAK_ID=webapp
AUTH_KEYCLOAK_SECRET=your-keycloak-secret
AUTH_KEYCLOAK_ISSUER=http://localhost:8080/realms/master
```

## Common Patterns

### Protected Admin Page

```tsx
"use client";

import { useProtectedRoute, useAuth } from "@/app/hooks/useAuth";

export default function AdminPage() {
  const { isAuthorized, isLoading } = useProtectedRoute(["admin"]);
  const { user } = useAuth();

  if (isLoading) return <div>Loading...</div>;
  if (!isAuthorized) return null;

  return (
    <div>
      <h1>Admin Dashboard</h1>
      <p>Welcome, {user?.email}</p>
    </div>
  );
}
```

### Conditional UI Based on Role

```tsx
"use client";

import { useHasRole } from "@/app/hooks/useAuth";
import { Button } from "@/components/ui/button";

export function Navbar() {
  const isAdmin = useHasRole("admin");

  return <nav>{isAdmin && <Button>Admin Panel</Button>}</nav>;
}
```

### Protected API Route

```typescript
// app/api/admin/users/route.ts
import { requireRole } from "@/app/lib/auth";

export async function GET() {
  const session = await requireRole("admin");

  return Response.json({
    users: [],
    admin: session.user.email,
  });
}
```

## Troubleshooting

### "Session not found" error

- Check that user is logged in
- Verify `SessionProvider` is in root layout
- Check NextAuth environment variables

### Role-based routes not working

- Verify user has role in Keycloak
- Check role name matches exactly (case-sensitive)
- Verify middleware configuration

### Token expired

- NextAuth handles token refresh automatically
- Check `AUTH_SECRET` is set correctly
- Verify Keycloak token expiration settings

## Security Notes

1. **Never expose tokens in client code** - Use server-side functions for sensitive operations
2. **Validate roles on server** - Use `requireRole()` for API routes
3. **Keep secrets in environment variables** - Never commit `.env.local`
4. **Use HTTPS in production** - NextAuth requires secure cookies
5. **Rotate AUTH_SECRET regularly** - Generate new secret with `openssl rand -base64 33`

## Examples

See `/app/components/auth/AuthExample.tsx` for a complete working example of auth patterns.

See `/app/Test/page.tsx` for basic auth usage.
