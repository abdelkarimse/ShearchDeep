"use client";
import {
  Cursor,
  CursorFollow,
  CursorProvider,
  type CursorFollowProps,
} from "@/components/animate-ui/components/animate/cursor";
import { BubbleBackground } from "@/components/animate-ui/components/backgrounds/bubble";

import { Lock } from "lucide-react";
import {
  RippleButton,
  RippleButtonRipples,
  type RippleButtonProps,
} from "@/components/animate-ui/components/buttons/ripple";
import { useStore } from "../Zustand/Store";
import { signIn } from "next-auth/react";
import { useEffect } from "react";

export default function Page() {
  const { cursor, setcursor } = useStore();
  useEffect(() => {
    console.log("authii");
  });

  return (
    <div className="h-screen w-screen z-10">
      <div className="w-full h-screen flex justify-center items-center ">
        <div>
          <RippleButton
            onMouseEnter={() =>
              setcursor({
                textcursor: "Click to Authentificate",
                enableCursorFollow: true,
              })
            }
            onMouseLeave={() =>
              setcursor({
                textcursor: "",
                enableCursorFollow: false,
              })
            }
            className="scale-125"
            size={"lg"}
            variant={"secondary"}
            onClick={() => signIn("keycloak")}
          >
            <Lock />
            Auth
            <RippleButtonRipples />
          </RippleButton>
        </div>
      </div>

      {false ? (
        <div>
          <p>
            Signed in as {session.user.email}
            {session.realm_roles.includes("admin") ? " (Admin)" : "(user)"}{" "}
            {process.env.AUTH_KEYCLOAK_ID}+s
          </p>
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            onClick={() => signOut()}
          >
            Sign out
          </button>
        </div>
      ) : null}

      {false ? (
        <div
          style={{ width: "50%", height: "500px" }}
          className={
            "bg-gray-900/25 rounded-md bg-clip-padding backdrop-filter backdrop-blur-3xl  border border-gray-100/0"
          }
        ></div>
      ) : null}
    </div>
  );
}
