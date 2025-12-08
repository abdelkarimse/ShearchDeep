"use client";
import Navbar from "../components/Navbar";
import { useStore } from "@/app/Zustand/Store";
import { getMayanDocuments, MayanDocument, setTokenHeader } from "@/app/dashboard/apiService";
import { useSession } from "next-auth/react";
import type { Session } from "next-auth";
import { useEffect, useState } from "react";

export default function DashboardLayout() {
  const { setMouseColor } = useStore();
  const { data: session } = useSession() as { data: Session | null };
  const [documents, setDocuments] = useState<MayanDocument[]>([]);

  useEffect(() => {
    if (session?.accessToken) {
      setTokenHeader(session.accessToken);
      getMayanDocuments()
        .then((response) => {
          console.log("documents", response.data);
          // Extract results array from paginated response
          setDocuments(response.data.results || []);
        })
        .catch((error) => {
          console.error("error fetching documents", error);
        });
    }
  }, [session]);

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
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-4xl font-bold tracking-tight">Books</h2>
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Search..."
                        className="pl-10 pr-4 py-2.5 border-2 rounded-md focus:outline-none focus:ring-0 w-64"
                      />
                      <svg
                        className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-black"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                        />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Documents Table */}
                <div className="overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-white text-black">
                      <tr>
                        <th className="text-left py-4 px-6 font-semibold">ID</th>
                        <th className="text-left py-4 px-6 font-semibold">Label</th>
                        <th className="text-left py-4 px-6 font-semibold">Description</th>
                        <th className="text-left py-4 px-6 font-semibold">Type</th>
                        <th className="text-left py-4 px-6 font-semibold">Language</th>
                        <th className="text-left py-4 px-6 font-semibold">Created</th>
                        <th className="text-right py-4 px-6 font-semibold">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white">
                      {documents.map((doc, index) => (
                        <tr
                          key={doc.id}
                          className={`hover:bg-gray-50 transition-colors ${
                            index !== documents.length - 1
                              ? "border-b border-gray-200"
                              : ""
                          }`}
                        >
                          <td className="py-4 px-6 text-gray-600 font-mono text-xs">
                            {doc.id}
                          </td>
                          <td className="py-4 px-6 font-semibold">{doc.label}</td>
                          <td className="py-4 px-6 text-gray-600 text-sm max-w-xs truncate">
                            {doc.description}
                          </td>
                          <td className="py-4 px-6">{doc.document_type.label}</td>
                          <td className="py-4 px-6">{doc.language}</td>
                          <td className="py-4 px-6 text-sm text-gray-600">
                            {new Date(doc.datetime_created).toLocaleDateString()}
                          </td>
                          <td className="py-4 px-6">
                            <div className="flex items-center justify-end gap-2">
                              <button className="px-4 py-1.5 bg-white text-black font-medium rounded border-2 border-black hover:bg-black hover:text-white transition-all text-sm">
                                View
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </main>
            </div>{" "}
          </div>
        </div>
      </div>
    </div>
  );
}
