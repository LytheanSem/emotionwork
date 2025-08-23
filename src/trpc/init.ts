import { initTRPC } from "@trpc/server";
import { cache } from "react";
import superjson from "superjson";

// Define the context type
interface TRPCContext {
  userId: string;
  hasError: boolean;
  error?: string;
}

export const createTRPCContext = cache(async (): Promise<TRPCContext> => {
  /**
   * @see https://trpc.io/docs/server/context
   */
  try {
    return {
      userId: "user_123",
      hasError: false,
    };
  } catch (error) {
    console.warn("Database connection error in tRPC context:", error);
    return {
      userId: "user_123",
      hasError: true,
      error: "Database connection failed",
    };
  }
});

// Avoid exporting the entire t-object
// since it's not very descriptive.
// For instance, the use of a t variable
// is common in i18n libraries.
const t = initTRPC.context<TRPCContext>().create({
  /**
   * @see https://trpc.io/docs/server/data-transformers
   */
  transformer: superjson,
});

// Base router and procedure helpers
export const createTRPCRouter = t.router;
export const createCallerFactory = t.createCallerFactory;

export const baseProcedure = t.procedure.use(async ({ next, ctx }) => {
  // Check if there was an error in context creation
  if (ctx.hasError) {
    throw new Error(ctx.error || "Database connection failed");
  }

  return next({
    ctx,
  });
});

export const publicProcedure = t.procedure;
