"use client";
import { useStore } from "@/app/Zustand/Store";
import DocumentViewPage from "./view";
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
        
          <DocumentViewPage />
            
          </div>
        </div>
      </div>
    </div>
  );
}
