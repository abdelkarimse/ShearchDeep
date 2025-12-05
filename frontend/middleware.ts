import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import type { NextRequestWithAuth } from "next-auth/middleware";

// Routes that require specific roles
const protectedRoutes: Record<string, string[]> = {
  "/admin": ["admin"],
};

export default withAuth(
  function middleware(request: NextRequestWithAuth) {
    const pathname = request.nextUrl.pathname;
    const token = request.nextauth.token;

    // Check if route requires specific roles
    for (const [route, roles] of Object.entries(protectedRoutes)) {
      if (pathname.startsWith(route)) {
        const userRoles = ((token as any)?.realm_roles as string[]) || [];
        const hasRole = roles.some((role) => userRoles.includes(role));

        if (!hasRole) {
          return NextResponse.redirect(
            new URL("/auth/error?error=Unauthorized", request.url)
          );
        }
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
    pages: {
      signIn: "/auth/signin",
      error: "/auth/error",
    },
  }
);

// Apply middleware to all routes except static files and API routes
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|public).*)"],
};
