import { Equipment } from "@/lib/db";

// Export the Equipment type from our custom database models
export type { Equipment };

// Additional equipment-specific types can be added here if needed
export interface EquipmentFilters {
  status?: Equipment["status"];
  categoryId?: string;
  brand?: string;
  search?: string;
}

export interface EquipmentSortOptions {
  field: "name" | "brand" | "status" | "quantity" | "createdAt";
  direction: "asc" | "desc";
}
