import { baseProcedure, createTRPCRouter } from "@/trpc/init";

export const categoriesRouter = createTRPCRouter({
  getMany: baseProcedure.query(async ({ ctx }) => {
    try {
      const data = await ctx.db.find({
        collection: "categories",
        pagination: false,
        sort: "name",
      });

      return data.docs;
    } catch (error) {
      console.error("Error fetching categories:", error);
      throw new Error("Failed to fetch categories data");
    }
  }),
});
