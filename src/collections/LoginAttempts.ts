import type { CollectionConfig } from "payload";

export const LoginAttempts: CollectionConfig = {
  slug: "login-attempts",
  admin: {
    useAsTitle: "email",
    description:
      "Track failed login attempts and account lockouts - This collection monitors security events and appears when there are failed login attempts to investigate.",
    // Make this collection more prominent in admin
    group: "Security",
  },
  access: {
    // Only admins can view this collection
    read: ({ req: { user } }) => {
      return user?.role === "admin";
    },
    // Restrict external writes; use `overrideAccess: true` in server code to write
    create: ({ req: { user } }) => Boolean(user && user.role === "admin"),
    update: ({ req: { user } }) => Boolean(user && user.role === "admin"),
    delete: ({ req: { user } }) => Boolean(user && user.role === "admin"),
  },
  fields: [
    {
      name: "email",
      type: "email",
      required: true,
      unique: true, // Only one row per email
      admin: {
        description: "Email address with failed login attempts",
      },
    },
    {
      name: "ipAddress",
      type: "text",
      admin: {
        description: "IP address of the most recent failed attempt",
      },
    },
    {
      name: "userAgent",
      type: "text",
      admin: {
        description: "User agent of the most recent failed attempt",
        readOnly: true, // Prevent manual editing
      },
    },
    {
      name: "failedAttempts",
      type: "number",
      required: true,
      defaultValue: 1,
      min: 1,
      max: 5,
      admin: {
        description: "Number of consecutive failed attempts (1-5)",
        readOnly: true, // Prevent manual editing
      },
    },
    {
      name: "lockoutUntil",
      type: "date",
      admin: {
        description: "Account is locked until this time (if applicable)",
        readOnly: true, // Prevent manual editing
      },
    },
    {
      name: "lastAttemptAt",
      type: "date",
      admin: {
        description: "When the last failed attempt was made",
        readOnly: true, // Prevent manual editing
      },
    },
  ],
  hooks: {
    beforeChange: [
      ({ data, req }) => {
        // CRITICAL: Always normalize and validate data from client
        // Normalize email to lowercase and trim whitespace
        if (data.email) {
          data.email = String(data.email).toLowerCase().trim();
        }

        // ALWAYS set timestamp to server time - never trust client timestamps
        data.lastAttemptAt = new Date();

        // Derive network metadata from request headers if available
        if (req) {
          // Get real IP address from headers (handles proxies)
          const forwardedFor = req.headers.get("x-forwarded-for");
          if (forwardedFor) {
            // Handle comma-separated IPs (first one is the real client IP)
            const ip = forwardedFor.split(",")[0];
            if (ip) data.ipAddress = ip.trim();
          }

          // Get real user agent from headers
          const userAgent = req.headers.get("user-agent");
          if (userAgent) {
            data.userAgent = userAgent;
          }
        }

        return data;
      },
    ],
  },
};
