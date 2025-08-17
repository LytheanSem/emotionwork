"use client";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { Poppins } from "next/font/google";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";
import { loginSchema } from "../../schemas";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["700"],
});

interface LockoutInfo {
  isLocked: boolean;
  timeRemaining?: string;
  attemptsRemaining?: number;
}

export const SignInView = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [lockoutInfo, setLockoutInfo] = useState<LockoutInfo | null>(null);

  const form = useForm<z.infer<typeof loginSchema>>({
    mode: "all",
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof loginSchema>) => {
    try {
      setIsLoading(true);
      setLockoutInfo(null); // Clear previous lockout info

      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      const data = await response.json();

      if (!response.ok) {
        // Check if this is a lockout response
        if (response.status === 429 && data.lockoutInfo) {
          setLockoutInfo(data.lockoutInfo);

          if (data.lockoutInfo.isLocked) {
            toast.error(`Account locked: ${data.error}`);
          } else {
            toast.error(data.error);
          }
        } else {
          // Regular login error
          toast.error(data.error || "Login failed");
        }
        return;
      }

      if (data.success) {
        toast.success("Login successful!");
        console.log("🎉 Welcome back! You're now logged in.");

        // Trigger navbar auth refresh
        localStorage.setItem("auth-refresh", Date.now().toString());

        // Wait a moment for the cookie to be set, then force a complete page reload
        setTimeout(() => {
          window.location.href = "/";
        }, 1000);
      } else {
        throw new Error(data.error || "Login failed");
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error(error instanceof Error ? error.message : "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  const renderLockoutInfo = () => {
    if (!lockoutInfo) return null;

    if (lockoutInfo.isLocked) {
      return (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-red-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Account Temporarily Locked
              </h3>
              <div className="mt-2 text-sm text-red-700">
                <p>
                  Too many failed login attempts. Please try again in{" "}
                  {lockoutInfo.timeRemaining}.
                </p>
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (
      lockoutInfo.attemptsRemaining !== undefined &&
      lockoutInfo.attemptsRemaining <= 2
    ) {
      return (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-yellow-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">
                Warning: Multiple Failed Attempts
              </h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p>
                  You have {lockoutInfo.attemptsRemaining} login attempt
                  {lockoutInfo.attemptsRemaining !== 1 ? "s" : ""} remaining
                  before your account is locked.
                </p>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5">
      <div className="bg-[#F4F4F0] h-screen w-full lg:col-span-3 overflow-y-auto">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            method="POST"
            className="flex flex-col gap-8 p-4 lg:p-16"
          >
            <div className="flex items-center justify-between mb-8">
              <Link href="/">
                <span
                  className={cn("text-2xl font-semibold", poppins.className)}
                >
                  EmotionWork
                </span>
              </Link>
              <Button
                asChild
                variant="ghost"
                size="sm"
                className="text-base border-none underline"
              >
                <Link prefetch href="/sign-up">
                  Sign Up
                </Link>
              </Button>
            </div>
            <h1 className="text-4xl font-medium">Welcome back</h1>

            {/* Display lockout information */}
            {renderLockoutInfo()}

            <FormField
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base">Email</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      disabled={lockoutInfo?.isLocked}
                      className={
                        lockoutInfo?.isLocked
                          ? "opacity-50 cursor-not-allowed"
                          : ""
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base">Password</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="password"
                      disabled={lockoutInfo?.isLocked}
                      className={
                        lockoutInfo?.isLocked
                          ? "opacity-50 cursor-not-allowed"
                          : ""
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              disabled={isLoading || lockoutInfo?.isLocked}
              type="submit"
              size="lg"
              variant="elevated"
              className={cn(
                "bg-black text-white hover:bg-blue-400 hover:text-primary",
                lockoutInfo?.isLocked && "opacity-50 cursor-not-allowed"
              )}
            >
              {isLoading
                ? "Logging in..."
                : lockoutInfo?.isLocked
                  ? "Account Locked"
                  : "Log in"}
            </Button>

            {/* Security notice */}
            <div className="text-xs text-gray-500 text-center">
              <p>
                🔒 Your account will be temporarily locked after 5 failed login
                attempts
              </p>
            </div>
          </form>
        </Form>
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
