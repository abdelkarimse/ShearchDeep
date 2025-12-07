"use client";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { useStore } from "@/app/Zustand/Store";
import Tx from "./components/TX";
export default function Page() {
  const { setMouseColor } = useStore();

  return (
    <div className="h-screen w-full flex justify-center items-center">
      <div
        style={{ width: "95%", height: "95%" }}
        onMouseEnter={() => setMouseColor("black")}
        onMouseLeave={() => setMouseColor("white")} // optional reset
      >
        <div
          data-slot="card"
          className={
            "bg-card text-card-foreground flex flex-col gap-6 rounded-xl border py-6 shadow-sm w-full "
          }
          style={{ height: "100%" }}
        >
          <div style={{ height: "100%" }}>
            <Tx />
          </div>
        </div>
      </div>
    </div>
  );
}
