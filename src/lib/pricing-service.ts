import { ObjectId } from "mongodb";
import { getDb } from "./db";

export interface EquipmentPricing {
  _id: string;
  name: string;
  categoryId?: string;
  dailyPrice: number;
  weeklyPrice: number;
}

export interface PricingCalculation {
  equipmentId: string;
  quantity: number;
  rentalType: "daily" | "weekly";
  rentalDays: number;
  dailyPrice: number;
  weeklyPrice: number;
  totalPrice: number;
  priceAtBooking: {
    dailyPrice: number;
    weeklyPrice: number;
    totalPrice: number;
    computedAt: Date;
  };
}

/**
 * Get pricing for equipment by ID
 * This is the canonical source of truth for equipment pricing
 */
export async function getEquipmentPricing(equipmentId: string): Promise<EquipmentPricing | null> {
  try {
    const db = await getDb();
    if (!db) {
      throw new Error("Database connection failed");
    }

    // Validate ObjectId format
    if (!ObjectId.isValid(equipmentId)) {
      throw new Error(`Invalid equipment ID format: ${equipmentId}`);
    }

    const equipment = await db.collection("equipment").findOne({ _id: new ObjectId(equipmentId) });

    if (!equipment) {
      return null;
    }

    // Calculate pricing based on equipment properties
    // This is deterministic and server-side only
    const basePrice = calculateBasePrice(equipment);

    return {
      _id: equipment._id.toString(),
      name: equipment.name,
      categoryId: equipment.categoryId,
      dailyPrice: basePrice,
      weeklyPrice: Math.floor(basePrice * 5.5), // Weekly is ~5.5x daily
    };
  } catch (error) {
    console.error("Error getting equipment pricing:", error);
    return null;
  }
}

/**
 * Calculate base price for equipment based on its properties
 * This is deterministic and cannot be manipulated by clients
 */
function calculateBasePrice(equipment: any): number {
  // Base pricing logic - can be customized based on business rules
  let basePrice = 50; // Minimum price

  // Adjust based on equipment name (deterministic)
  const nameHash = hashString(equipment.name);
  basePrice += (nameHash % 150) + 50; // $50-$200 range

  // Adjust based on category if available
  if (equipment.categoryId) {
    const categoryHash = hashString(equipment.categoryId);
    basePrice += categoryHash % 50; // Additional $0-$50
  }

  // Adjust based on brand if available
  if (equipment.brand) {
    const brandHash = hashString(equipment.brand);
    basePrice += brandHash % 30; // Additional $0-$30
  }

  // Ensure price is within reasonable bounds
  return Math.max(50, Math.min(300, basePrice));
}

/**
 * Simple hash function for deterministic pricing
 */
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash);
}

/**
 * Calculate total pricing for multiple equipment items
 */
export async function calculateEquipmentPricing(
  equipmentItems: Array<{
    equipmentId: string;
    quantity: number;
    rentalType: "daily" | "weekly";
    rentalDays: number;
  }>
): Promise<PricingCalculation[]> {
  const calculations: PricingCalculation[] = [];

  for (const item of equipmentItems) {
    const pricing = await getEquipmentPricing(item.equipmentId);

    if (!pricing) {
      throw new Error(`Equipment not found: ${item.equipmentId}`);
    }

    let totalPrice: number;

    if (item.rentalType === "daily") {
      // Daily pricing: price per day
      totalPrice = pricing.dailyPrice * item.quantity * item.rentalDays;
    } else {
      // Weekly pricing: use hybrid model for partial weeks
      const fullWeeks = Math.floor(item.rentalDays / 7);
      const remainingDays = item.rentalDays % 7;

      // Calculate price for full weeks
      const weeklyPrice = pricing.weeklyPrice * item.quantity * fullWeeks;

      // Calculate price for remaining days (use daily rate for partial week)
      const dailyPrice = pricing.dailyPrice * item.quantity * remainingDays;

      totalPrice = weeklyPrice + dailyPrice;
    }

    const computedAt = new Date();

    calculations.push({
      equipmentId: item.equipmentId,
      quantity: item.quantity,
      rentalType: item.rentalType,
      rentalDays: item.rentalDays,
      dailyPrice: pricing.dailyPrice,
      weeklyPrice: pricing.weeklyPrice,
      totalPrice,
      priceAtBooking: {
        dailyPrice: pricing.dailyPrice,
        weeklyPrice: pricing.weeklyPrice,
        totalPrice,
        computedAt,
      },
    });
  }

  return calculations;
}

/**
 * Get total price for equipment items
 */
export async function getTotalEquipmentPrice(
  equipmentItems: Array<{
    equipmentId: string;
    quantity: number;
    rentalType: "daily" | "weekly";
    rentalDays: number;
  }>
): Promise<number> {
  const calculations = await calculateEquipmentPricing(equipmentItems);
  return calculations.reduce((total, calc) => total + calc.totalPrice, 0);
}
