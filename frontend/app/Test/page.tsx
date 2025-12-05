// Example client component (Use 'use client' at the top)
"use client";
import { useSession, signIn, signOut } from "next-auth/react";

export default function UserStatus() {
  const { data: session } = useSession();

  if (session) {
    console.log("User session:", session);
    return (
      <div>
        <p>
          Signed in as {session.user.email}
          {session.realm_roles.includes("admin") ? " (Admin)" : "(user)"}
        </p>
        <button
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          onClick={() => signOut()}
        >
          Sign out
        </button>
      </div>
    );
  }

  return (
    <div>
      <p>Not signed in</p>
      {/* CRITICAL CHANGE: Use the Provider ID for Keycloak,
        which is typically 'keycloak' but depends on your setup. 
      */}
      <button
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        onClick={() => signIn("keycloak")}
      >
        Sign in with Keycloak
      </button>
    </div>
  );
}
