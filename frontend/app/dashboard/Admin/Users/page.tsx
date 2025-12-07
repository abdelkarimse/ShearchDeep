"use client";
import Navbar from "../components/Navbar";
import { useStore } from "@/app/Zustand/Store";
import {
  updateUser,
  deleteUser,
  getAllUsers,
  createUser,
} from "@/app/dashboard/apiService";
import { useEffect } from "react";
export default function DashboardLayout() {
  const { setMouseColor } = useStore();
  useEffect(() => {
    getAllUsers()
      .then((e) => {
        console.log("users");
      })
      .catch((e) => {
        console.error("error users", e);
      });
  }, []);

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
              {/* Right Content */}
              {/* Right Content */}
              <main className="flex-1 p-8 overflow-auto">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-4xl font-bold tracking-tight">Users</h2>
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Search..."
                        className="pl-10 pr-4 py-2.5 border-2  rounded-md focus:outline-none focus:ring-0 w-64"
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
                    <button className="px-5 py-2.5 bg-black text-white font-medium rounded-md hover:bg-gray-900 transition-all">
                      + Add User
                    </button>
                  </div>
                </div>

                {/* Users Table */}
                <div className=" overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-white text-black">
                      <tr>
                        <th className="text-left py-4 px-6 font-semibold">
                          ID
                        </th>
                        <th className="text-left py-4 px-6 font-semibold">
                          Username
                        </th>
                        <th className="text-left py-4 px-6 font-semibold">
                          Name
                        </th>
                        <th className="text-left py-4 px-6 font-semibold">
                          Email
                        </th>
                        <th className="text-left py-4 px-6 font-semibold">
                          Verified
                        </th>
                        <th className="text-right py-4 px-6 font-semibold">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white">
                      {[
                        {
                          id: "usr_001",
                          username: "johndoe",
                          firstName: "John",
                          lastName: "Doe",
                          email: "john@example.com",
                          emailVerified: true,
                        },
                        {
                          id: "usr_002",
                          username: "janesmith",
                          firstName: "Jane",
                          lastName: "Smith",
                          email: "jane@example.com",
                          emailVerified: true,
                        },
                        {
                          id: "usr_003",
                          username: "mikej",
                          firstName: "Mike",
                          lastName: "Johnson",
                          email: "mike@example.com",
                          emailVerified: false,
                        },
                        {
                          id: "usr_004",
                          username: "sarahw",
                          firstName: "Sarah",
                          lastName: "Williams",
                          email: "sarah@example.com",
                          emailVerified: true,
                        },
                        {
                          id: "usr_005",
                          username: "davidb",
                          firstName: "David",
                          lastName: "Brown",
                          email: "david@example.com",
                          emailVerified: true,
                        },
                      ].map((user, index, array) => (
                        <tr
                          key={user.id}
                          className={`hover:bg-gray-50 transition-colors ${
                            index !== array.length - 1
                              ? "border-b border-gray-200"
                              : ""
                          }`}
                        >
                          <td className="py-4 px-6 text-gray-600 font-mono text-xs">
                            {user.id}
                          </td>
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-black text-white rounded-full flex items-center justify-center font-bold text-xs">
                                {user.username.charAt(0).toUpperCase()}
                              </div>
                              <span className="font-semibold">
                                {user.username}
                              </span>
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            {user.firstName} {user.lastName}
                          </td>
                          <td className="py-4 px-6 text-gray-600">
                            {user.email}
                          </td>
                          <td className="py-4 px-6">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-medium border ${
                                user.emailVerified
                                  ? "bg-white text-black border-black"
                                  : "bg-gray-100 text-gray-600 border-gray-300"
                              }`}
                            >
                              {user.emailVerified
                                ? "✓ Verified"
                                : "✗ Not Verified"}
                            </span>
                          </td>
                          <td className="py-4 px-6">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                className="px-4 py-1.5 bg-white text-black font-medium rounded border-2 border-black hover:bg-black hover:text-white transition-all text-sm"
                                title={`PUT /api/v1/users/${user.id}`}
                              >
                                Edit
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
