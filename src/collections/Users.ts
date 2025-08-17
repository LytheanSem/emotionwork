import type { CollectionConfig } from "payload";

export const Users: CollectionConfig = {
  slug: "users",
  admin: {
    useAsTitle: "username",
  },
  auth: true,
  fields: [
    {
      name: "username",
      required: true,
      unique: true,
      type: "text",
    },
    {
      name: "email",
      required: true,
      unique: true,
      type: "email",
    },
    {
      name: "role",
      type: "select",
      required: true,
      defaultValue: "user",
      options: [
        {
          label: "User",
          value: "user",
        },
        {
          label: "Admin",
          value: "admin",
        },
      ],
      admin: {
        description: "User role - determines access privileges",
      },
      access: {
        // Allow anyone to read the role (needed for UI display)
        read: () => true,
        // Allow create if role is "user" or if the requester is admin
        create: ({ req, data }) => {
          const desired = (data as { role?: string })?.role;
          if (!desired || desired === "user") return true;
          return req?.user?.role === "admin";
        },
        // Only admins can update role post-creation
        update: ({ req }) => req?.user?.role === "admin",
      },
    },
    {
      name: "emailVerified",
      type: "checkbox",
      defaultValue: false,
      admin: {
        description: "Whether the user's email has been verified",
      },
    },
    {
      name: "emailVerifiedAt",
      type: "date",
      admin: {
        description: "When the email was verified",
      },
    },
  ],
  hooks: {
    beforeChange: [
      ({ data, req, operation }) => {
        // CRITICAL: Prevent privilege escalation attacks
        if (operation === "create") {
          // Force new users to have "user" role during registration
          if (data.role && data.role !== "user") {
            // Only allow non-"user" roles if the requester is an admin
            if (!req?.user || req.user.role !== "admin") {
              console.warn(
                `🚨 Privilege escalation attempt blocked: ${data.email} tried to set role=${data.role}`
              );
              data.role = "user"; // Force to user role
            }
          } else {
            // Ensure new users always get "user" role
            data.role = "user";
          }
        } else if (operation === "update") {
          // Prevent non-admins from upgrading their own role
          if (data.role && data.role !== "user") {
            if (!req?.user || req.user.role !== "admin") {
              console.warn(
                `🚨 Unauthorized role update blocked: ${req?.user?.email} tried to set role=${data.role}`
              );
              throw new Error("Only administrators can assign admin roles");
            }
          }
        }

        return data;
      },
    ],
  },
};
