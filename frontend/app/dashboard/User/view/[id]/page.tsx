"use client";
import { useStore } from "@/app/Zustand/Store";
import DocumentViewPage from "./view";
import { useState } from "react";
import SumrrizeAI from "./Summrize";
export default function Page() {
  const { setMouseColor } = useStore();
  const [visible, setvisible] = useState(false);
  return (
    // 1. Changed to flex-row and items-start (or items-center)
    <div className="h-screen w-full flex justify-center items-start pt-4">
      {/* Container for the existing content (now 90% wide) */}
      <div
        style={{ width: visible ? "70%" : "90%", height: "95%" }} // 2. Reduced width to 90%
        onMouseEnter={() => setMouseColor("black")}
        onMouseLeave={() => setMouseColor("white")}
      >
        <div
          data-slot="card"
          className={
            "bg-card text-card-foreground flex flex-col gap-6 rounded-xl border py-6 shadow-sm w-full"
          }
          style={{ height: "100%" }}
        >
          <div style={{ height: "100%" }}>
            <DocumentViewPage visible={visible} setvisible={setvisible} />
          </div>
        </div>
      </div>

      {/* ---------------------------------------------------- */}

      {/* 3. New small section with small distance (mx-2 or gap-2 in the parent) */}
      {/* This new div is next to the main content and uses a small margin/gap. */}
      {/* I'll use a margin-left (ml-2) to create the small distance. */}
      {visible ? (
        <SumrrizeAI
          text=""
          setMouseColor={setMouseColor}
          closeSumrize={() => setvisible(false)}
        />
      ) : null}
    </div>
  );
}
