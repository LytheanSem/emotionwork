import configPromise from "@payload-config";
import { getPayload } from "payload";
import { cache } from "react";

let payloadInstance: Awaited<ReturnType<typeof getPayload>> | null = null;
let hasError = false;

export const getSafePayload = cache(async () => {
  // If we already have a working instance, return it
  if (payloadInstance) {
    return payloadInstance;
  }

  // If we had a connection error before, return null
  if (hasError) {
    return null;
  }

  try {
    payloadInstance = await getPayload({ config: configPromise });
    return payloadInstance;
  } catch (error) {
    hasError = true;
    console.warn("Failed to connect to database:", error);
    return null;
  }
});

export function resetConnection() {
  payloadInstance = null;
  hasError = false;
}
