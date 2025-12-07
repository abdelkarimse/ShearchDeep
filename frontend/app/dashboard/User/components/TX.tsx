"use client";
import Navbar from "./Navbar";
export default function DashboardLayout() {
  return (
    <div className="flex h-full bg-gray-50">
      {/* Left Navbar */}
      <Navbar />
      {/* Right Content */}
      <main className="flex-1 p-8 overflow-auto">
        <h2 className="text-3xl font-bold mb-4">Dashboard</h2>
        <p className="text-gray-700">
          Welcome to your dashboard! Here you can manage your data, view
          reports, and customize settings.
        </p>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow">
            <h3 className="font-semibold mb-2">Card 1</h3>
            <p className="text-gray-600">Some description for card 1.</p>
          </div>
          <div className="p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow">
            <h3 className="font-semibold mb-2">Card 2</h3>
            <p className="text-gray-600">Some description for card 2.</p>
          </div>
          <div className="p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow">
            <h3 className="font-semibold mb-2">Card 3</h3>
            <p className="text-gray-600">Some description for card 3.</p>
          </div>
        </div>
      </main>
    </div>
  );
}
