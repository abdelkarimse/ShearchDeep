"use client";
import { useState } from "react";

import { Sidebar } from "../components/Sidebar";
import Navbar from "../components/Navbar";
import { Documents } from "./Documents";
import { Users } from "./Users";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const Dashboard = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleSidebarItemClick = (route: string) => {
    // navigate(route);
  };

  const renderContent = () => {
    switch ("/admin/") {
      case "/admin/dashboard/documents":
        return <Documents />;
      case "/admin/dashboard/users":
        return <Users />;
      default:
        return <Documents />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {isSidebarOpen && <Sidebar onItemClick={handleSidebarItemClick} />}
      <div
        className={cn(
          "flex flex-col transition-all duration-300",
          isSidebarOpen ? "ml-64" : "ml-0",
        )}
      >
        <Navbar
          onToggleSidebar={toggleSidebar}
          isOpen={isSidebarOpen}
          isAdmin={true}
        />
        <main className="flex-1 p-8">
          <div className="max-w-7xl mx-auto">
            {/* Welcome message */}
            <Card className="mb-6">
              <CardContent className="p-6">
                <h1 className="text-2xl font-bold">Welcome back, {"Admin"}!</h1>
                <p className="text-sm text-muted-foreground mt-1">
                  You have full administrative access to manage documents and
                  users.
                </p>
              </CardContent>
            </Card>
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
};
export default Dashboard;
