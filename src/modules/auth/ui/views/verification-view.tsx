"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Poppins } from "next/font/google";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["700"],
});

interface VerificationViewProps {
  email: string;
  username: string;
  password: string;
}

export const VerificationView = ({
  email,
  username,
  password,
}: VerificationViewProps) => {
  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (code.length !== 6) {
      toast.error("Please enter a 6-digit verification code");
      return;
    }

    try {
      setIsLoading(true);

      const response = await fetch("/api/auth/verify-code", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          username,
          password,
          code,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Verification failed");
      }

      if (data.success) {
        toast.success("Account verified successfully! You are now logged in.");
        console.log(
          "🎉 Welcome to EmotionWork! Your account has been verified."
        );

        // Trigger navbar auth refresh
        localStorage.setItem("auth-refresh", Date.now().toString());

        // Wait a moment for the cookie to be set, then redirect
        setTimeout(() => {
          // Force a complete page reload to ensure auth state is updated
          window.location.href = "/";
        }, 1000);
      } else {
        throw new Error(data.error || "Verification failed");
      }
    } catch (error) {
      console.error("Verification error:", error);
      toast.error(
        error instanceof Error ? error.message : "Verification failed"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    try {
      setIsLoading(true);

      const response = await fetch("/api/auth/send-verification", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          username,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to resend code");
      }

      if (data.success) {
        toast.success("Verification code resent successfully!");
      } else {
        throw new Error(data.error || "Failed to resend code");
      }
    } catch (error) {
      console.error("Resend code error:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to resend code"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5">
      <div className="bg-[#F4F4F0] h-screen w-full lg:col-span-3 overflow-y-auto">
        <div className="flex flex-col gap-8 p-4 lg:p-16">
          <div className="flex items-center justify-between mb-8">
            <Link href="/">
              <span className={cn("text-2xl font-semibold", poppins.className)}>
                EmotionWork
              </span>
            </Link>
            <Button
              asChild
              variant="ghost"
              size="sm"
              className="text-base border-none underline"
            >
              <Link prefetch href="/sign-in">
                Sign in
              </Link>
            </Button>
          </div>

          <div className="text-center">
            <h1 className="text-4xl font-medium mb-4">Verify your email</h1>
            <p className="text-lg text-gray-600 mb-8">
              We&apos;ve sent a 6-digit verification code to{" "}
              <strong>{email}</strong>
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <div className="text-center">
              <label
                htmlFor="code"
                className="block text-base font-medium mb-3"
              >
                Enter verification code
              </label>
              <Input
                id="code"
                type="text"
                value={code}
                onChange={(e) =>
                  setCode(e.target.value.replace(/\D/g, "").slice(0, 6))
                }
                placeholder="000000"
                className="text-center text-2xl font-mono tracking-widest w-48 mx-auto"
                maxLength={6}
                autoComplete="one-time-code"
              />
            </div>

            <Button
              disabled={isLoading || code.length !== 6}
              type="submit"
              size="lg"
              variant="elevated"
              className="bg-black text-white hover:bg-blue-400 hover:text-primary"
            >
              {isLoading ? "Verifying..." : "Verify & Create Account"}
            </Button>

            <div className="text-center">
              <p className="text-sm text-gray-600 mb-2">
                Didn&apos;t receive the code?
              </p>
              <Button
                type="button"
                variant="ghost"
                onClick={handleResendCode}
                disabled={isLoading}
                className="text-blue-600 hover:text-blue-800 underline"
              >
                Resend code
              </Button>
            </div>
          </form>
        </div>
      </div>

      <div
        className="h-screen w-full lg:col-span-2 hidden lg:block"
        style={{
          backgroundImage: "url('/auth-bg.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      ></div>
    </div>
  );
};
