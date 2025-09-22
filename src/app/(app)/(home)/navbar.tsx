"use client";

import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { useRoutePrefetch } from "@/hooks/use-route-prefetch";
import { signOut, useSession } from "next-auth/react";
import { Inter } from "next/font/google";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { NavbarSidebar } from "./navbar-sidebar";

const inter = Inter({ subsets: ["latin"] });

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
      className={`bg-transparent hover:bg-transparent rounded-full hover:border-primary border-transparent px-3.5 text-lg font-inter ${
        isActive ? "bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground" : ""
      }`}
    >
      <Link href={href}>{children}</Link>
    </Button>
  );
};

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const { prefetchOnHover } = useRoutePrefetch();

  // Prevent hydration mismatch by only rendering after client-side hydration
  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return;

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };

    // Set initial scroll state
    handleScroll();

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isClient]);

  const handleLogout = async () => {
    try {
      await signOut({ callbackUrl: "/" });
      toast.success("Logged out successfully");
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Logout failed");
    }
  };

  // Determine authentication status
  const isAuthenticated = status === "authenticated" && session?.user;

  // Get user display information
  const getUserDisplay = () => {
    if (!session?.user) return { displayName: "User", isAdmin: false };

    const { name, email, role } = session.user;
    const isAdmin = role === "admin";

    return {
      displayName: name || email?.split("@")[0] || "User",
      role: role || "user",
      isAdmin: isAdmin,
    };
  };

  const { displayName, isAdmin } = getUserDisplay();

  // Create navigation items with conditional admin page
  const navigationItems = useMemo(() => {
    const baseItems = [
      { href: "/", children: "Home" },
      { href: "/about", children: "About" },
      { href: "/service", children: "Services" },
      { href: "/equipment", children: "Equipment" },
      { href: "/portfolio", children: "Portfolio" },
      { href: "/contact", children: "Contact" },
      { href: "/bookmeeting", children: "Book meeting" },
      { href: "/book-stage", children: "Book a Stage" },
      { href: "/my-stage-bookings", children: "My Stage Bookings" },
      { href: "/manage-booking", children: "Manage Booking" },
      { href: "/design", children: "Design" },
    ];

    return baseItems;
  }, []);

  // Always render the same base structure to prevent hydration mismatch
  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 h-24 transition-all duration-300 ${inter.className} ${
        isClient && isScrolled
          ? "bg-background/95 backdrop-blur-md shadow-lg border-b border-border"
          : "bg-background border-b border-border"
      }`.trim()}
    >
      <div className="h-full flex items-center justify-between px-6">
        <Link href="/" className="flex items-center">
          <Logo width={150} height={90} />
        </Link>

        <NavbarSidebar items={navigationItems} open={isSidebarOpen} onOpenChange={setIsSidebarOpen} />

        <div className="items-center gap-4 hidden lg:flex">
          {navigationItems.map((item) => (
            <NavbarItem
              key={item.href}
              href={item.href}
              isActive={isClient && pathname === item.href}
              {...(isClient ? prefetchOnHover(item.href) : {})}
            >
              {item.children}
            </NavbarItem>
          ))}
        </div>

        {isClient && status !== "loading" && isAuthenticated ? (
          <div className="flex items-center gap-4">
            <div className="flex flex-col items-end">
              <span className="text-sm text-muted-foreground font-inter">Welcome, {displayName}</span>
              {isAdmin && <span className="text-xs text-orange-600 font-medium font-inter">Admin User</span>}
              {session?.user?.isManager && !isAdmin && (
                <span className="text-xs text-blue-600 font-medium font-inter">Manager</span>
              )}
            </div>
            {(isAdmin || session?.user?.isManager) && (
              <Button
                onClick={() => isClient && router.push("/admin")}
                variant="outline"
                size="sm"
                className={`font-inter ${
                  isAdmin
                    ? "bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100"
                    : "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100"
                }`}
              >
                {isAdmin ? "Admin Panel" : "Manager Panel"}
              </Button>
            )}
            <Button
              onClick={handleLogout}
              variant="outline"
              size="sm"
              className="bg-black text-white hover:bg-gray-800 font-inter"
            >
              Log out
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Button
              onClick={() => isClient && router.push("/sign-in")}
              variant="outline"
              size="sm"
              className="font-inter"
            >
              Log in
            </Button>
            <Button
              onClick={() => isClient && router.push("/sign-up")}
              size="sm"
              className="bg-black text-white hover:bg-gray-800 font-inter"
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
            onClick={() => isClient && setIsSidebarOpen(true)}
          >
            <svg className="size-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </Button>
        </div>
      </div>
    </nav>
  );
}
