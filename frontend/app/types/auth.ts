import { type DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      given_name: string;
      family_name: string;
      preferred_username: string;
    } & DefaultSession["user"];
    realm_roles: string[];
    resource_roles: Record<string, unknown>;
    accountRoles: string[];
    groups: string[];
    customAttributes: Record<string, unknown>;
    accessToken: string;
    sessionState: string;
    scope: string;
    decodedToken: Record<string, unknown>;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken: string;
    refreshToken: string;
    idToken: string;
    expiresAt: number;
    sub: string;
    email: string;
    emailVerified: boolean;
    name: string;
    given_name: string;
    family_name: string;
    preferred_username: string;
    sessionState: string;
    scope: string;
    sid: string;
    realm_roles: string[];
    resource_roles: Record<string, unknown>;
    accountRoles: string[];
    groups: string[];
    tokenMetadata: Record<string, unknown>;
    customAttributes: Record<string, unknown>;
    decodedToken: Record<string, unknown>;
  }
}

export type UserRole = "admin" | "user" | "moderator";

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  roles: UserRole[];
}

export interface AuthContext {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}
