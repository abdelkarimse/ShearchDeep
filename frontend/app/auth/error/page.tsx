"use client";

import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import Link from "next/link";

const errors: Record<string, { title: string; description: string }> = {
  Callback: {
    title: "Callback Error",
    description: "There was an error during the authentication callback.",
  },
  OAuthSignin: {
    title: "OAuth Sign In Error",
    description: "Error constructing the authorization URL.",
  },
  OAuthCallback: {
    title: "OAuth Callback Error",
    description: "Error handling the OAuth callback.",
  },
  OAuthCreateAccount: {
    title: "Account Creation Error",
    description: "Could not create user account.",
  },
  EmailCreateAccount: {
    title: "Email Account Creation Error",
    description: "Could not create user account.",
  },
  EmailSignInError: {
    title: "Email Sign In Error",
    description: "Could not send the e-mail. Try again later.",
  },
  CredentialsSignin: {
    title: "Sign In Error",
    description: "Sign in failed. Check the details you provided are correct.",
  },
  Default: {
    title: "Authentication Error",
    description: "An unexpected error occurred during authentication.",
  },
};

export default function ErrorPage() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error") || "Default";
  const errorInfo = errors[error as keyof typeof errors] || errors.Default;

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-background to-muted p-4">
      <Card className="w-full max-w-md border-destructive/50">
        <CardHeader className="space-y-2">
          <div className="flex justify-center">
            <div className="p-2 bg-destructive/10 rounded-lg">
              <AlertCircle className="w-6 h-6 text-destructive" />
            </div>
          </div>
          <CardTitle className="text-2xl text-center">
            {errorInfo.title}
          </CardTitle>
          <CardDescription className="text-center">
            {errorInfo.description}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-muted p-3 rounded-lg text-sm text-muted-foreground">
            Error code: <code className="font-mono">{error}</code>
          </div>

          <div className="flex gap-3">
            <Button asChild className="flex-1">
              <Link href="/auth/signin">Try Again</Link>
            </Button>
            <Button variant="outline" asChild className="flex-1">
              <Link href="/">Go Home</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
