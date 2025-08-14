import type { CollectionConfig } from "payload";

export const Equipment: CollectionConfig = {
  slug: "equipment",
  admin: {
    useAsTitle: "name",
    defaultColumns: ["name", "brand", "quantity", "category", "status"],
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: "name",
      type: "text",
      required: true,
    },
    {
      name: "brand",
      type: "text",
      required: false,
    },
    {
      name: "quantity",
      type: "number",
      required: true,
      min: 0,
    },
    {
      name: "category",
      type: "relationship",
      relationTo: "categories",
      required: true,
      hasMany: false,
    },
    {
      name: "image",
      type: "upload",
      relationTo: "media",
      required: false,
    },
    {
      name: "description",
      type: "textarea",
      required: false,
    },
    {
      name: "specifications",
      type: "group",
      fields: [
        {
          name: "power",
          type: "text",
          required: false,
        },
        {
          name: "dimensions",
          type: "text",
          required: false,
        },
        {
          name: "weight",
          type: "text",
          required: false,
        },
      ],
    },
    {
      name: "status",
      type: "select",
      options: [
        { label: "Available", value: "available" },
        { label: "In Use", value: "in_use" },
        { label: "Maintenance", value: "maintenance" },
        { label: "Out of Service", value: "out_of_service" },
      ],
      defaultValue: "available",
      required: true,
    },
  ],
};
