import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    turbo: {
      rules: {
        "*.svg": {
          loaders: ["@svgr/webpack"],
          as: "*.js",
        },
      },
    },
    // Enable modern optimizations
    optimizePackageImports: [
      "@radix-ui/react-icons",
      "lucide-react",
      "@radix-ui/react-dialog",
      "@radix-ui/react-dropdown-menu",
      "@radix-ui/react-tabs",
      "@radix-ui/react-button",
      "@radix-ui/react-input",
      "@radix-ui/react-label",
      "@radix-ui/react-textarea",
      "@radix-ui/react-select",
      "@radix-ui/react-checkbox",
      "@radix-ui/react-radio-group",
      "@radix-ui/react-switch",
      "@radix-ui/react-slider",
      "@radix-ui/react-progress",
      "@radix-ui/react-avatar",
      "@radix-ui/react-badge",
      "@radix-ui/react-card",
      "@radix-ui/react-separator",
      "@radix-ui/react-scroll-area",
      "@radix-ui/react-tooltip",
      "@radix-ui/react-popover",
      "@radix-ui/react-hover-card",
      "@radix-ui/react-navigation-menu",
      "@radix-ui/react-menubar",
      "@radix-ui/react-context-menu",
      "@radix-ui/react-accordion",
      "@radix-ui/react-collapsible",
      "@radix-ui/react-aspect-ratio",
      "@radix-ui/react-resizable",
      "@radix-ui/react-toggle",
      "@radix-ui/react-toggle-group",
      "@radix-ui/react-slot",
      "@radix-ui/react-drawer",
      "@radix-ui/react-sheet",
      "@radix-ui/react-modal",
      "@radix-ui/react-command",
      "@radix-ui/react-calendar",
      "@radix-ui/react-date-picker",
      "@radix-ui/react-time-picker",
      "@radix-ui/react-color-picker",
      "class-variance-authority",
      "clsx",
      "tailwind-merge",
      "cmdk",
      "date-fns",
      "embla-carousel-react",
      "input-otp",
      "react-day-picker",
      "react-hook-form",
      "react-resizable-panels",
      "recharts",
      "sonner",
      "superjson",
      "vaul",
      "zod",
      "@hookform/resolvers",
      "next-themes",
      "next-auth",
      "@auth/core",
      "@tanstack/react-query",
      "@trpc/client",
      "@trpc/server",
      "@trpc/tanstack-react-query",
      "nodemailer",
      "@types/nodemailer",
      "dotenv",
      "client-only",
      "server-only",
      "tw-animate-css",
    ],
  },
  // Server external packages (moved from experimental)
  serverExternalPackages: ["mongodb"],
  webpack: (config) => {
    // SVG handling
    config.module.rules.push({
      test: /\.svg$/,
      use: ["@svgr/webpack"],
    });

    // Tree shaking optimization (simplified to avoid conflicts)
    config.optimization = {
      ...config.optimization,
      sideEffects: false,
    };

    return config;
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
    // Enable modern image formats
    formats: ["image/webp", "image/avif"],
    // Device sizes for responsive images
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    // Image sizes for responsive images
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    // Minimum cache TTL
    minimumCacheTTL: 60,
    // Enable placeholder blur
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  // Compression and caching
  compress: true,
  poweredByHeader: false,
  generateEtags: false,
  // Enable static optimization
  trailingSlash: false,
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          // Performance headers
          {
            key: "X-DNS-Prefetch-Control",
            value: "on",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
        ],
      },
      {
        source: "/admin/(.*)",
        headers: [
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Cache-Control",
            value: "no-store, no-cache, must-revalidate, proxy-revalidate",
          },
        ],
      },
      // Static assets caching
      {
        source: "/_next/static/(.*)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/images/(.*)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/uploads/(.*)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
