"use client";

import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRoutePrefetch } from "@/hooks/use-route-prefetch";
import { ChevronDown } from "lucide-react";
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
      className={`group relative bg-transparent hover:bg-transparent rounded-full border-transparent px-2 xl:px-3.5 text-sm xl:text-lg font-inter transition-all duration-300 ${
        isActive
          ? "text-cyan-300 bg-cyan-500/20 border-cyan-500/30 hover:bg-cyan-500/30 hover:text-cyan-200"
          : "text-white/80 hover:text-white hover:bg-white/10 border-white/20 hover:border-white/40"
      }`}
    >
      <Link href={href}>
        <span className="relative z-10">{children}</span>
        {isActive && (
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-full blur-sm"></div>
        )}
      </Link>
    </Button>
  );
};

const BookingDropdown = () => {
  const pathname = usePathname();
  const isBookingActive =
    pathname.startsWith("/book-meeting") || pathname.startsWith("/manage-booking");

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className={`group relative bg-transparent hover:bg-transparent rounded-full border-transparent px-2 xl:px-3.5 text-sm xl:text-lg font-inter transition-all duration-300 ${
            isBookingActive
              ? "text-cyan-300 bg-cyan-500/20 border-cyan-500/30 hover:bg-cyan-500/30 hover:text-cyan-200"
              : "text-white/80 hover:text-white hover:bg-white/10 border-white/20 hover:border-white/40"
          }`}
        >
          <span className="relative z-10 flex items-center">
            <span className="hidden lg:inline">Bookings</span>
            <span className="lg:hidden">Book</span>
            <ChevronDown className="ml-2 h-3 w-3 xl:h-4 xl:w-4 group-hover:translate-y-0.5 transition-transform duration-200" />
          </span>
          {isBookingActive && (
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-full blur-sm"></div>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="center"
        className="w-48 xl:w-56 bg-slate-900/95 backdrop-blur-xl border border-cyan-500/20 shadow-2xl"
      >
        <DropdownMenuItem asChild>
          <Link
            href="/book-meeting"
            className="flex items-center text-sm text-white/80 hover:text-cyan-300 hover:bg-cyan-500/10 transition-colors duration-200"
          >
            <span>Book Meeting</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link
            href="/manage-booking"
            className="flex items-center text-sm text-white/80 hover:text-cyan-300 hover:bg-cyan-500/10 transition-colors duration-200"
          >
            <span>Manage Booking</span>
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
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
      { href: "/design", children: "Playground" },
    ];

    return baseItems;
  }, []);

  // Always render the same base structure to prevent hydration mismatch
  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 h-20 transition-all duration-500 ${inter.className} ${
        isClient && isScrolled
          ? "bg-gradient-to-r from-slate-900/95 via-blue-900/95 to-slate-900/95 backdrop-blur-xl shadow-2xl border-b border-cyan-500/20"
          : "bg-gradient-to-r from-slate-900/90 via-blue-900/90 to-slate-900/90 backdrop-blur-lg border-b border-cyan-500/10"
      }`.trim()}
    >
      <div className="h-full flex items-center justify-between px-4 sm:px-6">
        {/* Logo - Responsive sizing */}
        <Link href="/" className="flex items-center flex-shrink-0">
          <Logo width={120} height={72} className="sm:w-[140px] sm:h-[84px] lg:w-[150px] lg:h-[90px]" />
        </Link>

        {/* Desktop Navigation - Show on xl screens and up */}
        <div className="items-center gap-2 hidden xl:flex">
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
          <BookingDropdown />
        </div>

        {/* User Section - Responsive layout */}
        {isClient && status !== "loading" && isAuthenticated ? (
          <div className="flex items-center gap-2 sm:gap-3 lg:gap-4">
            {/* User info - Hide on very small screens, show on sm+ */}
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-xs sm:text-sm text-cyan-200/80 font-inter truncate max-w-[120px] lg:max-w-none">
                Welcome, {displayName}
              </span>
              {isAdmin && <span className="text-xs text-orange-600 font-medium font-inter">Admin User</span>}
              {session?.user?.isManager && !isAdmin && (
                <span className="text-xs text-blue-600 font-medium font-inter">Manager</span>
              )}
            </div>

            {/* Admin Panel Button - Hide on small screens */}
            {(isAdmin || session?.user?.isManager) && (
              <Button
                onClick={() => isClient && router.push("/admin")}
                variant="outline"
                size="sm"
                className={`hidden md:flex font-inter text-xs group relative transition-all duration-300 ${
                  isAdmin
                    ? "bg-gradient-to-r from-orange-500/20 to-red-500/20 text-orange-300 border-orange-500/30 hover:bg-orange-500/30 hover:text-orange-200 hover:border-orange-400/50"
                    : "bg-gradient-to-r from-blue-500/20 to-cyan-500/20 text-blue-300 border-blue-500/30 hover:bg-blue-500/30 hover:text-blue-200 hover:border-blue-400/50"
                }`}
              >
                <span className="relative z-10">{isAdmin ? "Admin" : "Manager"}</span>
                <div
                  className={`absolute inset-0 rounded-md blur-sm opacity-30 group-hover:opacity-50 transition-opacity duration-300 ${
                    isAdmin
                      ? "bg-gradient-to-r from-orange-500 to-red-500"
                      : "bg-gradient-to-r from-blue-500 to-cyan-500"
                  }`}
                ></div>
              </Button>
            )}

            {/* Logout Button - Always visible but responsive sizing */}
            <Button
              onClick={handleLogout}
              variant="outline"
              size="sm"
              className="group relative bg-gradient-to-r from-red-500/20 to-pink-500/20 text-red-300 border-red-500/30 hover:bg-red-500/30 hover:text-red-200 hover:border-red-400/50 font-inter text-xs px-2 sm:px-3 transition-all duration-300"
            >
              <span className="relative z-10">
                <span className="hidden sm:inline">Log out</span>
                <span className="sm:hidden">Out</span>
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-pink-500 rounded-md blur-sm opacity-30 group-hover:opacity-50 transition-opacity duration-300"></div>
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-1 sm:gap-2">
            <Button
              onClick={() => isClient && router.push("/sign-in")}
              size="sm"
              className="group relative bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-inter text-xs px-2 sm:px-3 transition-all duration-300 hover:scale-105 shadow-lg overflow-hidden"
            >
              <span className="relative z-10">
                <span className="hidden sm:inline">Sign in</span>
                <span className="sm:hidden">In</span>
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="absolute inset-0 bg-white/20 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
            </Button>
          </div>
        )}

        {/* Mobile menu button - Show on screens smaller than xl */}
        <div className="flex xl:hidden items-center justify-center ml-2">
          <Button
            variant="ghost"
            className="group size-10 sm:size-12 border border-white/20 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white hover:text-cyan-300 transition-all duration-300"
            onClick={() => isClient && setIsSidebarOpen(true)}
          >
            <svg
              className="size-5 sm:size-6 group-hover:scale-110 transition-transform duration-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </Button>
        </div>

        {/* Mobile Sidebar */}
        <NavbarSidebar items={navigationItems} open={isSidebarOpen} onOpenChange={setIsSidebarOpen} />
      </div>
    </nav>
  );
}
