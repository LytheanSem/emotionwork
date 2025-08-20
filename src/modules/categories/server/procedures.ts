import { createTRPCRouter, publicProcedure } from "@/trpc/init";
import { z } from "zod";

// Category schema for validation
const categorySchema = z.object({
  name: z.string().min(1, "Name is required"),
  slug: z.string().min(1, "Slug is required"),
  description: z.string().optional(),
});

export const categoriesRouter = createTRPCRouter({
  // Get all categories
  getAll: publicProcedure.query(async () => {
    // This will be implemented with our custom MongoDB models
    // For now, return empty array
    return [];
  }),

  // Get category by ID
  getById: publicProcedure.input(z.string()).query(async () => {
    // This will be implemented with our custom MongoDB models
    return null;
  }),

  // Create new category
  create: publicProcedure.input(categorySchema).mutation(async () => {
    // This will be implemented with our custom MongoDB models
    return { success: true };
  }),

  // Update category
  update: publicProcedure
    .input(
      z.object({
        id: z.string(),
        data: categorySchema.partial(),
      })
    )
    .mutation(async () => {
      // This will be implemented with our custom MongoDB models
      return { success: true };
    }),

  // Delete category
  delete: publicProcedure.input(z.string()).mutation(async () => {
    // This will be implemented with our custom MongoDB models
    return { success: true };
  }),
});
