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
      className={`bg-transparent hover:bg-transparent rounded-full hover:border-primary border-transparent px-2 xl:px-3.5 text-sm xl:text-lg font-inter ${
        isActive ? "bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground" : ""
      }`}
    >
      <Link href={href}>{children}</Link>
    </Button>
  );
};

const BookingDropdown = () => {
  const pathname = usePathname();
  const isBookingActive =
    pathname.startsWith("/book-meeting") ||
    pathname.startsWith("/book-stage") ||
    pathname.startsWith("/my-stage-bookings") ||
    pathname.startsWith("/manage-booking");

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className={`bg-transparent hover:bg-transparent rounded-full hover:border-primary border-transparent px-2 xl:px-3.5 text-sm xl:text-lg font-inter ${
            isBookingActive
              ? "bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground"
              : ""
          }`}
        >
          <span className="hidden lg:inline">Bookings</span>
          <span className="lg:hidden">Book</span>
          <ChevronDown className="ml-1 h-3 w-3 xl:h-4 xl:w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="center" className="w-48 xl:w-56">
        <DropdownMenuItem asChild>
          <Link href="/book-meeting" className="flex items-center text-sm">
            <span>Book Meeting</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/book-stage" className="flex items-center text-sm">
            <span>Book a Stage</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/my-stage-bookings" className="flex items-center text-sm">
            <span>My Stage Bookings</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/manage-booking" className="flex items-center text-sm">
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
      { href: "/design", children: "Design" },
    ];

    return baseItems;
  }, []);

  // Always render the same base structure to prevent hydration mismatch
  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 h-20 transition-all duration-300 ${inter.className} ${
        isClient && isScrolled
          ? "bg-background/95 backdrop-blur-md shadow-lg border-b border-border"
          : "bg-background border-b border-border"
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
              <span className="text-xs sm:text-sm text-muted-foreground font-inter truncate max-w-[120px] lg:max-w-none">
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
                className={`hidden md:flex font-inter text-xs ${
                  isAdmin
                    ? "bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100"
                    : "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100"
                }`}
              >
                {isAdmin ? "Admin" : "Manager"}
              </Button>
            )}

            {/* Logout Button - Always visible but responsive sizing */}
            <Button
              onClick={handleLogout}
              variant="outline"
              size="sm"
              className="bg-black text-white hover:bg-gray-800 font-inter text-xs px-2 sm:px-3"
            >
              <span className="hidden sm:inline">Log out</span>
              <span className="sm:hidden">Out</span>
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-1 sm:gap-2">
            <Button
              onClick={() => isClient && router.push("/sign-in")}
              variant="outline"
              size="sm"
              className="font-inter text-xs px-2 sm:px-3"
            >
              <span className="hidden sm:inline">Log in</span>
              <span className="sm:hidden">In</span>
            </Button>
            <Button
              onClick={() => isClient && router.push("/sign-up")}
              size="sm"
              className="bg-black text-white hover:bg-gray-800 font-inter text-xs px-2 sm:px-3"
            >
              <span className="hidden sm:inline">Sign up</span>
              <span className="sm:hidden">Up</span>
            </Button>
          </div>
        )}

        {/* Mobile menu button - Show on screens smaller than xl */}
        <div className="flex xl:hidden items-center justify-center ml-2">
          <Button
            variant="ghost"
            className="size-10 sm:size-12 border-transparent bg-white"
            onClick={() => isClient && setIsSidebarOpen(true)}
          >
            <svg className="size-5 sm:size-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
