"use client";
import { useState } from "react";
import { useProtectedRoute, useAuth } from "@/hooks/useAuth";

import { Sidebar } from "../components/Sidebar";
import Navbar from "../components/Navbar";
import { Documents } from "./Documents";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const Dashboard = () => {
  const { isAuthorized, isLoading } = useProtectedRoute(["admin"]);
  const { user } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!isAuthorized) {
    return null;
  }

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleSidebarItemClick = () => {
    // Route navigation handled by sidebar
  };

  const renderContent = () => {
    return <Documents />;
  };

  return (
    <div className="min-h-screen bg-background">
      {isSidebarOpen && <Sidebar onItemClick={handleSidebarItemClick} />}
      <div
        className={cn(
          "flex flex-col transition-all duration-300",
          isSidebarOpen ? "ml-64" : "ml-0"
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
                <h1 className="text-2xl font-bold">
                  Welcome back, {user?.name || user?.email || "Admin"}!
                </h1>
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
