"use client";

import React, { useEffect } from "react";

export const ThemeInjector: React.FC = () => {
  useEffect(() => {
    // Wait for the admin panel to load
    const injectThemeToggle = () => {
      // Check if we're in the admin panel
      if (
        typeof window !== "undefined" &&
        window.location.pathname.startsWith("/admin")
      ) {
        // Create theme toggle button
        const themeToggle = document.createElement("button");
        themeToggle.className = "payload-admin-theme-toggle";
        themeToggle.innerHTML = `
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="5"/>
            <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
          </svg>
        `;

        // Add click handler
        themeToggle.addEventListener("click", () => {
          const currentTheme =
            document.documentElement.getAttribute("data-theme") || "light";
          const newTheme = currentTheme === "light" ? "dark" : "light";
          document.documentElement.setAttribute("data-theme", newTheme);
          localStorage.setItem("payload-admin-theme", newTheme);

          // Update icon
          if (newTheme === "light") {
            themeToggle.innerHTML = `
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
              </svg>
            `;
          } else {
            themeToggle.innerHTML = `
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="5"/>
                <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
              </svg>
            `;
          }
        });

        // Set initial theme and icon
        const savedTheme =
          localStorage.getItem("payload-admin-theme") || "light";
        document.documentElement.setAttribute("data-theme", savedTheme);
        if (savedTheme === "dark") {
          themeToggle.innerHTML = `
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
            </svg>
          `;
        }

        // Add to page
        document.body.appendChild(themeToggle);
      }
    };

    // Try to inject immediately
    injectThemeToggle();

    // Also try after a delay to ensure admin panel is loaded
    const timer = setTimeout(injectThemeToggle, 1000);

    return () => clearTimeout(timer);
  }, []);

  return null; // This component doesn't render anything visible
};

export default ThemeInjector;
