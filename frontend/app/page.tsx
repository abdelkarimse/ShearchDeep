"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

export default function Home() {
  const router = useRouter();
  const { data: session, status } = useSession();

  useEffect(() => {
    console.log("osk", session?.user);
    if (status === "loading") return;

    if (session?.user) {
      // Redirect authenticated users based on role
      const role = session.realm_roles || ["user"];
      console.log(role);
      if (role.includes("admin")) {
        router.push("/admin");
      } else {
        router.push("/dashboard");
      }
    } else {
      // Redirect unauthenticated users to login
      router.push("/api/auth/signin");
    }
  }, [session, status, router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <p className="text-lg text-muted-foreground">Redirecting...</p>
    </div>
  );
}
