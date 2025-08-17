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
    create: () => true, // Allow creation during login attempts
    update: () => true, // Allow updates during login attempts
    delete: ({ req: { user } }) => {
      return user?.role === "admin";
    },
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
      ({ data }) => {
        // Set lastAttemptAt to current time if not provided
        if (!data.lastAttemptAt) {
          data.lastAttemptAt = new Date();
        }
        return data;
      },
    ],
  },
};
