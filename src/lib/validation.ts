import { ObjectId } from "mongodb";

/**
 * Validates if a string is a valid MongoDB ObjectId
 * @param id - The string to validate
 * @returns true if valid, false otherwise
 */
export function isValidObjectId(id: string): boolean {
  if (!id || typeof id !== "string") {
    return false;
  }
  return ObjectId.isValid(id) && new ObjectId(id).toString() === id;
}

/**
 * Safely creates an ObjectId from a string, throwing a descriptive error if invalid
 * @param id - The string to convert to ObjectId
 * @returns ObjectId instance
 * @throws Error if the id is invalid
 */
export function createObjectId(id: string): ObjectId {
  if (!isValidObjectId(id)) {
    throw new Error(`Invalid ObjectId format: ${id}`);
  }
  return new ObjectId(id);
}

