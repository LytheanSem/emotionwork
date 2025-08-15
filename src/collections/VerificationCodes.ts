import type { CollectionConfig } from "payload";

export const VerificationCodes: CollectionConfig = {
  slug: "verification-codes",
  access: {
    read: () => true,
    create: () => false,
    update: () => false,
    delete: () => true,
  },
  admin: {
    useAsTitle: "email",
  },
  fields: [
    {
      name: "email",
      type: "email",
      required: true,
      index: true,
    },
    {
      name: "code",
      type: "text",
      required: true,
      validate: (val: unknown) =>
        /^\d{6}$/.test(String(val)) ||
        "Verification code must be exactly 6 digits",
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
