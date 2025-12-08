declare module "next-auth" {
  interface Session {
    accessToken?: string;
    refreshToken?: string;
    idToken?: string;
    expiresAt?: number;
    realm_roles?: string[];
    resource_roles?: Record<string, unknown>;
    accountRoles?: string[];
    groups?: string[];
    customAttributes?: Record<string, unknown>;
    sessionState?: string;
    scope?: string;
    decodedToken?: unknown;
    user?: {
      id?: string;
      email?: string;
      name?: string;
      given_name?: string;
      family_name?: string;
      preferred_username?: string;
      image?: string;
    };
  }

  interface JWT {
    accessToken?: string;
    refreshToken?: string;
    idToken?: string;
    expiresAt?: number;
    sub?: string;
    email?: string;
    emailVerified?: boolean;
    name?: string;
    given_name?: string;
    family_name?: string;
    preferred_username?: string;
    sessionState?: string;
    scope?: string;
    sid?: string;
    realm_roles?: string[];
    resource_roles?: Record<string, unknown>;
    accountRoles?: string[];
    groups?: string[];
    customAttributes?: Record<string, unknown>;
    tokenMetadata?: Record<string, unknown>;
    decodedToken?: unknown;
  }
}
