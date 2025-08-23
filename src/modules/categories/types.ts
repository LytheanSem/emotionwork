import { Category } from "@/lib/db";

// Export the Category type from our custom database models
export type { Category };

// Additional category-specific types can be added here if needed
export interface CategoryFilters {
  search?: string;
}

export interface CategorySortOptions {
  field: "name" | "slug" | "createdAt";
  direction: "asc" | "desc";
}
