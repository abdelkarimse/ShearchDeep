// Example client component (Use 'use client' at the top)
"use client";
import { useSession, signIn, signOut } from "next-auth/react";

export default function UserStatus() {
  const { data: session } = useSession();

  if (session) {
    return (
      <div>
        {/* The session object structure might be slightly different based on your Keycloak setup */}
        <p>Signed in as {session.user.email}</p>
        <button onClick={() => signOut()}>Sign out</button>
      </div>
    );
  }

  return (
    <div>
      <p>Not signed in</p>
      {/* CRITICAL CHANGE: Use the Provider ID for Keycloak,
        which is typically 'keycloak' but depends on your setup. 
      */}
      <button onClick={() => signIn("keycloak")}>Sign in with Keycloak</button>
    </div>
  );
}
