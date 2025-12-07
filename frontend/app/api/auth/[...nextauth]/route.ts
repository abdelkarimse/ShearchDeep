import NextAuth from "next-auth";
import Keycloak from "next-auth/providers/keycloak";
import { decode } from "jsonwebtoken";

// ⭐ MUST EXPORT THIS so server components can import it
export const authOptions = {
  providers: [
    Keycloak({
      clientId: process.env.AUTH_KEYCLOAK_ID!,
      clientSecret: process.env.AUTH_KEYCLOAK_SECRET!,
      issuer: process.env.AUTH_KEYCLOAK_ISSUER!,
    }),
  ],

  callbacks: {
    async jwt({ token, account }) {
      if (account) {
        const decodedToken = decode(account.access_token!) as any;

        console.log("Full decoded token:", decodedToken);

        // Tokens
        token.accessToken = account.access_token;
        token.refreshToken = account.refresh_token;
        token.idToken = account.id_token;
        token.expiresAt = account.expires_at;

        // Basic info
        token.sub = decodedToken.sub;
        token.email = decodedToken.email;
        token.emailVerified = decodedToken.email_verified;
        token.name = decodedToken.name || decodedToken.preferred_username;
        token.given_name = decodedToken.given_name;
        token.family_name = decodedToken.family_name;
        token.preferred_username = decodedToken.preferred_username;

        // Metadata
        token.sessionState = decodedToken.session_state;
        token.scope = decodedToken.scope;
        token.sid = decodedToken.sid;

        // Roles
        token.realm_roles = decodedToken.realm_access?.roles || [];
        token.resource_roles = decodedToken.resource_access || {};
        token.accountRoles = decodedToken.resource_access?.account?.roles || [];

        // Groups
        token.groups = decodedToken.groups || [];

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

        // Custom attributes
        token.customAttributes = {
          phone: decodedToken.phone,
          department: decodedToken.department,
          employee_id: decodedToken.employee_id,
        };

        // Full decoded token
        token.decodedToken = decodedToken;
      }

      return token;
    },

    async session({ session, token }) {
      // User
      session.user = {
        ...session.user,
        id: token.sub as string,
        email: token.email as string,
        name: token.name as string,
        given_name: token.given_name as string,
        family_name: token.family_name as string,
        preferred_username: token.preferred_username as string,
      };

      // Extra fields
      session.realm_roles = token.realm_roles as string[];
      session.resource_roles = token.resource_roles as Record<string, any>;
      session.accountRoles = token.accountRoles as string[];
      session.groups = token.groups as string[];
      session.customAttributes = token.customAttributes as Record<string, any>;
      session.accessToken = token.accessToken as string;
      session.sessionState = token.sessionState as string;
      session.scope = token.scope as string;

      session.decodedToken = token.decodedToken;

      return session;
    },
  },

  events: {
    async signOut({ token }) {
      if (token.idToken) {
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
};

// ⭐ NextAuth initialized AFTER exporting authOptions
const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
