"use client";

import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { NavbarSidebar } from "./navbar-sidebar";

interface NavbarItemProps {
  href: string;
  children: React.ReactNode;
  isActive?: boolean;
}

const NavbarItem = ({ href, children, isActive }: NavbarItemProps) => {
  return (
    <Button
      asChild
      variant="outline"
      className={`bg-transparent hover:bg-transparent rounded-full hover:border-primary border-transparent px-3.5 text-lg ${
        isActive
          ? "bg-blue-400 text-white hover:bg-blue-500 hover:text-white"
          : ""
      }`}
    >
      <Link href={href}>{children}</Link>
    </Button>
  );
};

const navbarItems = [
  { href: "/", children: "Home" },
  { href: "/about", children: "About" },
  { href: "/service", children: "Services" },
  { href: "/equipment", children: "Equipment" },
  { href: "/contact", children: "Contact" },
  { href: "/bookmeeting", children: "Book meeting" },
  { href: "/design", children: "Design" },
];

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const pathname = usePathname();
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Check authentication status with better error handling
  const {
    data: authData,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["auth", "me"],
    queryFn: async () => {
      try {
        const response = await fetch("/api/auth/me");
        if (!response.ok) {
          if (response.status === 401) {
            // User is not authenticated - this is normal, not an error
            // Only log this once to reduce console noise
            if (!authData) {
              console.log("👋 You're logged out - this is normal!");
            }
            return { success: false, authenticated: false, user: null };
          }
          throw new Error("Authentication check failed");
        }
        const data = await response.json();
        if (data.success && data.authenticated) {
          const isAdmin = data.user?.isAdmin || false;

          if (isAdmin) {
            console.log(
              `🎉 Welcome back, ${data.user?.username || "Admin"}! (Admin user on frontend)`
            );
          } else {
            console.log(`🎉 Welcome back, ${data.user?.username || "User"}!`);
          }
        }
        return data;
      } catch (error) {
        // Only log actual errors, not 401 responses
        if (error instanceof Error && !error.message.includes("401")) {
          console.error("🚨 Auth error:", error);
        }
        throw error;
      }
    },
    retry: false,
    refetchOnWindowFocus: false,
    // Only check auth when needed, not continuously
    staleTime: 60000, // Consider data fresh for 1 minute
    gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
  });

  // Listen for storage events to refresh auth when needed
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      // Refresh auth state when auth-refresh changes (indicates login/logout)
      if (e.key === "auth-refresh") {
        refetch();
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [refetch]);

  const handleLogout = async () => {
    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
      });

      if (response.ok) {
        toast.success("Logged out successfully");
        console.log("👋 See you later! You've been logged out.");

        // Force a complete page reload to ensure clean state
        setTimeout(() => {
          window.location.href = "/";
        }, 500);
      } else {
        throw new Error("Logout failed");
      }
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Logout failed");
    }
  };

  // Determine authentication status - treat 401 as not authenticated (not an error)
  const isAuthenticated =
    authData?.success && authData?.authenticated && !isError;

  // Get user display information
  const getUserDisplay = () => {
    if (!authData?.user) return { displayName: "User", isAdmin: false };

    const { username, role, isAdmin } = authData.user;
    return {
      displayName: username || "User",
      role: role || "user",
      isAdmin: isAdmin || false,
    };
  };

  const { displayName, isAdmin } = getUserDisplay();

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 h-20 transition-all duration-300 ${
        isScrolled
          ? "bg-white/95 backdrop-blur-md shadow-lg border-b border-gray-200"
          : "bg-white border-b border-gray-200"
      }`}
    >
      <div className="h-full flex items-center justify-between px-6">
        <Link href="/" className="flex items-center">
          <Logo width={80} height={48} />
        </Link>

        <NavbarSidebar
          items={navbarItems}
          open={isSidebarOpen}
          onOpenChange={setIsSidebarOpen}
        />

        <div className="items-center gap-4 hidden lg:flex">
          {navbarItems.map((item) => (
            <NavbarItem
              key={item.href}
              href={item.href}
              isActive={pathname === item.href}
            >
              {item.children}
            </NavbarItem>
          ))}
        </div>

        {isAuthenticated ? (
          <div className="flex items-center gap-4">
            <div className="flex flex-col items-end">
              <span className="text-sm text-gray-700">
                Welcome, {displayName}
              </span>
              {isAdmin && (
                <span className="text-xs text-orange-600 font-medium">
                  Admin User (Frontend Mode)
                </span>
              )}
            </div>
            <Button
              onClick={handleLogout}
              variant="outline"
              size="sm"
              className="bg-black text-white hover:bg-gray-800"
            >
              Log out
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Button
              onClick={() => router.push("/sign-in")}
              variant="outline"
              size="sm"
            >
              Log in
            </Button>
            <Button
              onClick={() => router.push("/sign-up")}
              size="sm"
              className="bg-black text-white hover:bg-gray-800"
            >
              Sign up
            </Button>
          </div>
        )}

        {/* Mobile menu button */}
        <div className="flex lg:hidden items-center justify-center">
          <Button
            variant="ghost"
            className="size-12 border-transparent bg-white"
            onClick={() => setIsSidebarOpen(true)}
          >
            <svg
              className="size-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </Button>
        </div>
      </div>
    </nav>
  );
}
