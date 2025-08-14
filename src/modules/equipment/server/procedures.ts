import { baseProcedure, createTRPCRouter } from "@/trpc/init";
import { z } from "zod";

export const equipmentRouter = createTRPCRouter({
  getMany: baseProcedure.query(async ({ ctx }) => {
    // Check if database connection failed
    if (ctx.hasError || !ctx.db) {
      throw new Error("Database connection failed");
    }

    try {
      // Use the PayloadCMS instance directly
      const data = await ctx.db.find({
        collection: "equipment",
        depth: 2, // Populate category and image
        pagination: false,
        sort: "name",
      });

      return data.docs;
    } catch (error) {
      console.error("Error fetching equipment:", error);
      throw new Error("Failed to fetch equipment data");
    }
  }),

  getByCategory: baseProcedure
    .input(
      z.object({
        categoryId: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      // Check if database connection failed
      if (ctx.hasError || !ctx.db) {
        throw new Error("Database connection failed");
      }

      try {
        // Use the PayloadCMS instance directly
        const data = await ctx.db.find({
          collection: "equipment",
          depth: 2, // Populate category and image
          pagination: false,
          where: input.categoryId
            ? {
                category: {
                  equals: input.categoryId,
                },
              }
            : {},
          sort: "name",
        });

        return data.docs;
      } catch (error) {
        console.error("Error fetching equipment by category:", error);
        throw new Error("Failed to fetch equipment data");
      }
    }),
});
