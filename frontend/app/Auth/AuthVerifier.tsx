"use client";

import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import path from "path";
import { useEffect } from "react";
import { setTokenHeader } from "../dashboard/apiService";
export default function AuthVerifier({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();

  const router = useRouter();
  const pathname = usePathname();
  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/Auth");
    }
  }, [status, router]);

  if (status === "loading") {
    return <div></div>;
  }

  if (status === "authenticated") {
    setTokenHeader(session.accessToken);
    if (pathname == "/Auth") {
      router.replace("/dashboard");
      return <></>;
    }
    if (
      pathname.indexOf("/dashboard/Admin") != -1 &&
      !session.realm_roles.includes("ADMIN")
    ) {
      return router.replace("/dashboard");
    }
    if (
      pathname.indexOf("/dashboard/User") != -1 &&
      !session.realm_roles.includes("ADMIN")
    ) {
      return router.replace("/dashboard");
    }
    return <>{children}</>;
  }

  if (status == "unauthenticated" && pathname == "/Auth") {
    return <>{children}</>;
  }
  return <h1>{pathname}</h1>; // while redirecting
}
