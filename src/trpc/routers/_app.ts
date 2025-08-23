import { categoriesRouter } from "@/modules/categories/server/procedures";
import { equipmentRouter } from "@/modules/equipment/server/procedures";
import { createTRPCRouter } from "../init";

export const appRouter = createTRPCRouter({
  categories: categoriesRouter,
  equipment: equipmentRouter,
});
// export type definition of API
export type AppRouter = typeof appRouter;
