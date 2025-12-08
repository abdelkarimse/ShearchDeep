"use client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
export default function Dashboardrooting() {
  const { data: session } = useSession();
  const router = useRouter();
  if (!session) {
    return null;
  }
  if (
    session.realm_roles.includes("ADMIN")) {
    router.replace("/dashboard/Admin");
  } else {
    router.replace("/dashboard/User");
  }

  return <h1></h1>;
}
