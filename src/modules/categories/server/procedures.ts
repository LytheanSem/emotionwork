import { Category } from "@/payload-types";
import { baseProcedure, createTRPCRouter } from "@/trpc/init";

export const categoriesRouter = createTRPCRouter({
  getMany: baseProcedure.query(async ({ ctx }) => {
    // Check if database connection failed
    if (ctx.hasError || !ctx.db) {
      throw new Error("Database connection failed");
    }

    try {
      const data = await ctx.db.find({
        collection: "categories",
        depth: 1, // Populate subcategories, subcategories.[0] will be a type of "Category"
        pagination: false,
        where: {
          parent: {
            exists: false,
          },
        },
        sort: "name",
      });

      const formattedData = data.docs.map((doc) => ({
        ...doc,
        subcategories: (doc.subcategories?.docs ?? []).map((doc) => ({
          // Because of "depth: 1" we are confident "doc" will be a type of "Category"
          ...(doc as Category),
          subcategories: undefined,
        })),
      }));

      return formattedData;
    } catch (error) {
      console.error("Error fetching categories:", error);
      throw new Error("Failed to fetch categories data");
    }
  }),
});
