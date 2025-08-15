"use client";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
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
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";
import { registerSchema } from "../../schemas";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["700"],
});

export const SignUpView = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof registerSchema>>({
    mode: "all",
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: "",
      password: "",
      username: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof registerSchema>) => {
    try {
      setIsLoading(true);

      // First, send verification code
      const verificationResponse = await fetch("/api/auth/send-verification", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: values.email,
          username: values.username,
        }),
      });

      const verificationData = await verificationResponse.json();

      if (!verificationResponse.ok) {
        throw new Error(
          verificationData.error || "Failed to send verification code"
        );
      }

      if (verificationData.success) {
        toast.success("Verification code sent! Check your email.");

        // Store sensitive data temporarily in session storage
        sessionStorage.setItem(
          "pendingRegistration",
          JSON.stringify({
            email: values.email,
            username: values.username,
            password: values.password,
          })
        );

        // Only pass email in URL for user experience
        router.push(`/verify-email?email=${encodeURIComponent(values.email)}`);
      } else {
        throw new Error(
          verificationData.error || "Failed to send verification code"
        );
      }
    } catch (error) {
      console.error("Sign-up error:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to send verification code"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const username = form.watch("username");
  const usernameErrors = form.formState.errors.username;

  const showPreview = username && !usernameErrors;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5">
      <div className="bg-[#F4F4F0] h-screen w-full lg:col-span-3 overflow-y-auto">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
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
                <Link prefetch href="/sign-in">
                  Sign in
                </Link>
              </Button>
            </div>
            <h1 className="text-4xl font-medium">
              Create an account to use our design feature
            </h1>
            <FormField
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base">Username</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormDescription
                    className={cn("hidden", showPreview && "block")}
                  >
                    Your username will be&nbsp;
                    {/* TODO: Use proper method to generate preview url*/}
                    <strong>{username}</strong>
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base">Email</FormLabel>
                  <FormControl>
                    <Input {...field} />
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
                    <Input {...field} type="password" />
                  </FormControl>
                  <FormDescription>
                    Password must be at least 8 characters and contain an
                    uppercase letter, lowercase letter, and number
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              disabled={isLoading}
              type="submit"
              size="lg"
              variant="elevated"
              className="bg-black text-white hover:bg-blue-400 hover:text-primary"
            >
              {isLoading
                ? "Sending verification code..."
                : "Send verification code"}
            </Button>
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
