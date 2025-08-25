"use client";

import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { useRoutePrefetch } from "@/hooks/use-route-prefetch";
import { signOut, useSession } from "next-auth/react";
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
        isActive ? "bg-blue-400 text-white hover:bg-blue-500 hover:text-white" : ""
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
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { prefetchOnHover } = useRoutePrefetch();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = async () => {
    try {
      await signOut({ callbackUrl: "/" });
      toast.success("Logged out successfully");
      // console.log("👋 See you later! You've been logged out.");
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

        <NavbarSidebar items={navbarItems} open={isSidebarOpen} onOpenChange={setIsSidebarOpen} />

        <div className="items-center gap-4 hidden lg:flex">
          {navbarItems.map((item) => (
            <NavbarItem
              key={item.href}
              href={item.href}
              isActive={pathname === item.href}
              {...prefetchOnHover(item.href)}
            >
              {item.children}
            </NavbarItem>
          ))}
        </div>

        {isAuthenticated ? (
          <div className="flex items-center gap-4">
            <div className="flex flex-col items-end">
              <span className="text-sm text-gray-700">Welcome, {displayName}</span>
              {isAdmin && <span className="text-xs text-orange-600 font-medium">Admin User</span>}
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
            <Button onClick={() => router.push("/sign-in")} variant="outline" size="sm">
              Log in
            </Button>
            <Button onClick={() => router.push("/sign-up")} size="sm" className="bg-black text-white hover:bg-gray-800">
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
            <svg className="size-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </Button>
        </div>
      </div>
    </nav>
  );
}
