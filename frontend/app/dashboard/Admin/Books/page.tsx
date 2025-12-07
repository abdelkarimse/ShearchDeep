"use client";
import Navbar from "../components/Navbar";
import { useStore } from "@/app/Zustand/Store";
export default function DashboardLayout() {
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
            <div className="flex h-full bg-gray-50">
              {/* Left Navbar */}
              <Navbar />
              {/* Right Content */}
              <main className="flex-1 p-8 overflow-auto">
                <h2 className="text-3xl font-bold mb-4">Books</h2>
                <p className="text-gray-700">.</p>
              </main>
            </div>{" "}
          </div>
        </div>
      </div>
    </div>
  );
}
