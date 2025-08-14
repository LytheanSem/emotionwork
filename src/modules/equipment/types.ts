import { AppRouter } from "@/trpc/routers/_app";
import { inferRouterOutputs } from "@trpc/server";

export type EquipmentGetManyOutput =
  inferRouterOutputs<AppRouter>["equipment"]["getMany"];

export type EquipmentGetByCategoryOutput =
  inferRouterOutputs<AppRouter>["equipment"]["getByCategory"];
