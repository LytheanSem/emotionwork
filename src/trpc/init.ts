import { getSafePayload } from "@/lib/db-wrapper";
import { initTRPC } from "@trpc/server";
import type { Payload } from "payload";
import { cache } from "react";
import superjson from "superjson";

// Define the context type
interface TRPCContext {
  userId: string;
  db: Payload | null;
  hasError: boolean;
  error?: string;
}

// Define a context type where db is guaranteed to be available
interface TRPCContextWithDB {
  userId: string;
  db: Payload;
  hasError: false;
  error?: never;
}

export const createTRPCContext = cache(async (): Promise<TRPCContext> => {
  /**
   * @see https://trpc.io/docs/server/context
   */
  try {
    const payload = await getSafePayload();

    if (!payload) {
      return {
        userId: "user_123",
        db: null,
        hasError: true,
        error: "Database connection failed",
      };
    }

    return {
      userId: "user_123",
      db: payload, // Pass the PayloadCMS instance directly
      hasError: false,
    };
  } catch (error) {
    console.warn("Database connection error in tRPC context:", error);
    return {
      userId: "user_123",
      db: null,
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
  // The database context is now provided by createTRPCContext
  if (ctx.hasError || !ctx.db) {
    throw new Error(ctx.error || "Database connection failed");
  }

  // Create a new context with guaranteed db availability
  const ctxWithDB: TRPCContextWithDB = {
    userId: ctx.userId,
    db: ctx.db,
    hasError: false,
  };

  return next({
    ctx: ctxWithDB,
  });
});
