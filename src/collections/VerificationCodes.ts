import type { CollectionConfig } from "payload";

export const VerificationCodes: CollectionConfig = {
  slug: "verification-codes",
  admin: {
    useAsTitle: "email",
  },
  fields: [
    {
      name: "email",
      type: "email",
      required: true,
    },
    {
      name: "code",
      type: "text",
      required: true,
    },
    {
      name: "expiresAt",
      type: "date",
      required: true,
    },
    {
      name: "used",
      type: "checkbox",
      defaultValue: false,
    },
  ],
  timestamps: true,
};
