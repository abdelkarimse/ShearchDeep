"use client";
import { useSession, signIn, signOut } from "next-auth/react";

export default function UserStatus() {
  const { data: session } = useSession();

  if (session) {
    console.log("okie", session.user);
    return (
      <div>
        <p>
          Signed in as {session.user?.email} {session.user?.firstName}
        </p>
        <button onClick={() => signOut()}>Sign out</button>
      </div>
    );
  }

  return (
    <div>
      <p>Not signed in </p>
      <button onClick={() => signIn("google")}>Sign in with Google</button>
    </div>
  );
}
