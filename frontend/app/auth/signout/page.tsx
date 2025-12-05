"use client";

import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { LogOut } from "lucide-react";
import { useEffect } from "react";

export default function SignOutPage() {
  useEffect(() => {
    // Auto sign out after 2 seconds
    const timer = setTimeout(() => {
      signOut({ redirect: true, callbackUrl: "/" });
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-background to-muted p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-2">
          <div className="flex justify-center">
            <div className="p-2 bg-destructive/10 rounded-lg">
              <LogOut className="w-6 h-6 text-destructive" />
            </div>
          </div>
          <CardTitle className="text-2xl text-center">Signing Out</CardTitle>
          <CardDescription className="text-center">
            You are being signed out. Redirecting shortly...
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            onClick={() => signOut({ redirect: true, callbackUrl: "/" })}
            size="lg"
            className="w-full"
            variant="destructive"
          >
            Sign Out Now
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
