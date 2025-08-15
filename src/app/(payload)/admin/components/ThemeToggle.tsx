"use client";

import { Moon, Sun } from "lucide-react";
import React, { useEffect, useState } from "react";

export const ThemeToggle: React.FC = () => {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Check for saved theme preference or default to light mode
    try {
      const savedTheme = localStorage.getItem("payload-admin-theme") as
        | "light"
        | "dark"
        | null;
      if (savedTheme) {
        setTheme(savedTheme);
        document.documentElement.setAttribute("data-theme", savedTheme);
      } else {
        // Check system preference
        const prefersDark = window.matchMedia(
          "(prefers-color-scheme: dark)"
        ).matches;
        const defaultTheme = prefersDark ? "dark" : "light";
        setTheme(defaultTheme);
        document.documentElement.setAttribute("data-theme", defaultTheme);
      }
    } catch (error) {
      // Fallback to light theme if localStorage is not available
      console.warn("Theme preference not available:", error);
      setTheme("light");
      document.documentElement.setAttribute("data-theme", "light");
    }
  }, []);

  const toggleTheme = () => {
    try {
      const newTheme = theme === "light" ? "dark" : "light";
      setTheme(newTheme);
      document.documentElement.setAttribute("data-theme", newTheme);
      localStorage.setItem("payload-admin-theme", newTheme);
    } catch (error) {
      console.warn("Failed to save theme preference:", error);
    }
  };

  // Don't render until mounted to avoid hydration mismatch
  if (!mounted) {
    return null;
  }

  return (
    <button
      onClick={toggleTheme}
      className="payload-admin-theme-toggle"
      aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
      title={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
    >
      {theme === "light" ? <Moon size={20} /> : <Sun size={20} />}
    </button>
  );
};

export default ThemeToggle;
