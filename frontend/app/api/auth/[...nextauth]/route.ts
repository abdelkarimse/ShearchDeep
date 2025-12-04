import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import Keycloak from "next-auth/providers/keycloak";
const handler = NextAuth({
  // Configure one or more authentication providers
  providers: [
    Keycloak({
      clientId: process.env.AUTH_KEYCLOAK_ID!,
      clientSecret: process.env.AUTH_KEYCLOAK_SECRET!,
      issuer: process.env.AUTH_KEYCLOAK_ISSUER!,
    }),
  ],
  // Optional: Add callbacks, database adapter, etc.
});

export { handler as GET, handler as POST };
