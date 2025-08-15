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
};
