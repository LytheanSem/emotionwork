import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Request size limits
  experimental: {
    // Request body size limit (1MB)
    serverActions: {
      bodySizeLimit: "1mb",
    },

    // Only optimize the most critical packages
    optimizePackageImports: [
      "lucide-react",
      "@radix-ui/react-dialog",
      "@radix-ui/react-dropdown-menu",
      "@radix-ui/react-tabs",
      "@radix-ui/react-button",
      "@radix-ui/react-input",
      "@radix-ui/react-label",
      "@radix-ui/react-select",
      "@radix-ui/react-checkbox",
      "@radix-ui/react-switch",
      "@radix-ui/react-progress",
      "@radix-ui/react-avatar",
      "@radix-ui/react-card",
      "@radix-ui/react-separator",
      "@radix-ui/react-tooltip",
      "@radix-ui/react-popover",
      "@radix-ui/react-accordion",
      "@radix-ui/react-slot",
      "class-variance-authority",
      "clsx",
      "tailwind-merge",
      "react-hook-form",
      "sonner",
      "superjson",
      "zod",
      "@hookform/resolvers",
      "next-themes",
      "@tanstack/react-query",
      "@trpc/client",
      "@trpc/server",
      "@trpc/tanstack-react-query",
    ],

    // Enable faster builds
    webpackBuildWorker: true,

    // Optimize for development
    optimizeCss: false,
  },

  // Server external packages
  serverExternalPackages: ["mongodb"],

  webpack: (config, { dev }) => {
    // SVG handling
    config.module.rules.push({
      test: /\.svg$/,
      use: ["@svgr/webpack"],
    });

    // Optimize for faster builds
    if (dev) {
      // Faster development builds
      config.optimization = {
        ...config.optimization,
        removeAvailableModules: false,
        removeEmptyChunks: false,
        splitChunks: false,
      };
    } else {
      // Production optimizations
      config.optimization = {
        ...config.optimization,
        sideEffects: false,
        usedExports: true,
      };
    }

    return config;
  },

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
    // Optimized for performance
    formats: ["image/webp", "image/avif"],
    // Optimized device sizes
    deviceSizes: [640, 750, 1080, 1200, 1920],
    // Optimized image sizes
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
    // Image quality options
    qualities: [25, 50, 75, 85, 100],
    // Longer cache for better performance
    minimumCacheTTL: 60,
    // Enable placeholder blur
    dangerouslyAllowSVG: true,
    contentSecurityPolicy:
      "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; connect-src 'self' https://sheets.googleapis.com https://gmail.googleapis.com https://n8n.srv986339.hstgr.cloud; sandbox; frame-src 'self' https://www.google.com https://maps.google.com;",
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
          {
            key: "Content-Security-Policy",
            value:
              "default-src 'self'; object-src 'none'; base-uri 'none'; frame-ancestors 'none'; " +
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://maps.googleapis.com https://www.gstatic.com; " +
              "style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data: https://fonts.gstatic.com; " +
              "connect-src 'self' https://sheets.googleapis.com https://gmail.googleapis.com https://n8n.srv986339.hstgr.cloud; " +
              "frame-src 'self' https://www.google.com https://maps.google.com;",
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

  turbopack: {
    rules: {
      "*.svg": {
        loaders: ["@svgr/webpack"],
        as: "*.js",
      },
    },
  },
};

export default nextConfig;
