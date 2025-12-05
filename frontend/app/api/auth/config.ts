import type { NextAuthOptions, Session } from "next-auth";
import Keycloak from "next-auth/providers/keycloak";
import { decode } from "jsonwebtoken";
import type { JWT } from "next-auth/jwt";
import type { Account } from "next-auth";

export const authOptions: NextAuthOptions = {
  providers: [
    Keycloak({
      clientId: process.env.AUTH_KEYCLOAK_ID!,
      clientSecret: process.env.AUTH_KEYCLOAK_SECRET!,
      issuer: process.env.AUTH_KEYCLOAK_ISSUER!,
    }),
  ],
  callbacks: {
    async jwt({ token, account }: { token: JWT; account: Account | null }) {
      // Initial sign in
      if (account) {
        // Decode the access token to get all user attributes
        const decodedToken = decode(account.access_token as string) as Record<
          string,
          unknown
        >;
        console.log("token", account.access_token);

        // Store tokens
        token.accessToken = account.access_token as string;
        token.refreshToken = account.refresh_token as string;
        token.idToken = account.id_token as string;
        token.expiresAt = account.expires_at as number;

        // Basic user info
        token.sub = (decodedToken.sub as string) || "";
        token.email = (decodedToken.email as string) || "";
        token.emailVerified = (decodedToken.email_verified as boolean) || false;
        token.name =
          ((decodedToken.name || decodedToken.preferred_username) as string) ||
          "";
        token.given_name = (decodedToken.given_name as string) || "";
        token.family_name = (decodedToken.family_name as string) || "";
        token.preferred_username =
          (decodedToken.preferred_username as string) || "";

        // Session state and other metadata
        token.sessionState = (decodedToken.session_state as string) || "";
        token.scope = (decodedToken.scope as string) || "";
        token.sid = (decodedToken.sid as string) || "";

        // Roles - Keycloak specific structure
        const realmAccess = decodedToken.realm_access as Record<
          string,
          unknown
        >;
        const resourceAccess = decodedToken.resource_access as Record<
          string,
          unknown
        >;

        token.realm_roles = (realmAccess?.roles as string[]) || [];
        token.resource_roles = (resourceAccess || {}) as Record<
          string,
          unknown
        >;

        // Extract account roles specifically (common in Keycloak)
        const accountAccess = resourceAccess?.account as Record<
          string,
          unknown
        >;
        token.accountRoles = (accountAccess?.roles as string[]) || [];

        // Groups (if configured in Keycloak)
        token.groups = (decodedToken.groups as string[]) || [];

        // Token metadata
        token.tokenMetadata = {
          azp: decodedToken.azp,
          scope: decodedToken.scope,
          iat: decodedToken.iat,
          exp: decodedToken.exp,
          jti: decodedToken.jti,
          iss: decodedToken.iss,
          aud: decodedToken.aud,
          typ: decodedToken.typ,
        };

        // Custom attributes - add any custom attributes you've configured
        token.customAttributes = {
          phone: decodedToken.phone,
          department: decodedToken.department,
          employee_id: decodedToken.employee_id,
        };

        // Store entire decoded token for full access
        token.decodedToken = decodedToken;
      }
      console.log("JWT Token:", token);
      return token;
    },

    async session({ session, token }: { session: Session; token: JWT }) {
      // Pass data from JWT to session
      const sessionWithRoles = session as Session & {
        realm_roles?: string[];
        resource_roles?: Record<string, unknown>;
        accountRoles?: string[];
        groups?: string[];
        customAttributes?: Record<string, unknown>;
        accessToken?: string;
        sessionState?: string;
        scope?: string;
        decodedToken?: Record<string, unknown>;
      };

      sessionWithRoles.user = {
        ...sessionWithRoles.user,
        id: token.sub as string,
        email: token.email as string,
        name: token.name as string,
        given_name: token.given_name as string,
        family_name: token.family_name as string,
        preferred_username: token.preferred_username as string,
      };

      // Add additional properties
      sessionWithRoles.realm_roles = token.realm_roles as string[];
      sessionWithRoles.resource_roles = token.resource_roles as Record<
        string,
        unknown
      >;
      sessionWithRoles.accountRoles = token.accountRoles as string[];
      sessionWithRoles.groups = token.groups as string[];
      sessionWithRoles.customAttributes = token.customAttributes as Record<
        string,
        unknown
      >;
      sessionWithRoles.accessToken = token.accessToken as string;
      sessionWithRoles.sessionState = token.sessionState as string;
      sessionWithRoles.scope = token.scope as string;
      sessionWithRoles.decodedToken = token.decodedToken as Record<
        string,
        unknown
      >;

      return sessionWithRoles;
    },
  },
  events: {
    async signOut({ token }: { token: JWT | null }) {
      // Keycloak logout
      if (token?.idToken) {
        const logoutUrl = `${process.env.AUTH_KEYCLOAK_ISSUER}/protocol/openid-connect/logout`;
        const params = new URLSearchParams({
          id_token_hint: token.idToken as string,
          post_logout_redirect_uri:
            process.env.NEXTAUTH_URL || "http://localhost:3000",
        });

        try {
          await fetch(`${logoutUrl}?${params.toString()}`);
        } catch (error) {
          console.error("Keycloak logout error:", error);
        }
      }
    },
  },
  pages: {
    signIn: "/auth/signin",
    signOut: "/auth/signout",
    error: "/dashboard",
  },
};
