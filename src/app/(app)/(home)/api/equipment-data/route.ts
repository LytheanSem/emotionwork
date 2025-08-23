import { getDb } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const db = await getDb();

    if (!db) {
      return NextResponse.json(
        {
          success: false,
          error: "Database connection failed",
        },
        { status: 500 }
      );
    }

    // Fetch equipment using MongoDB
    const equipment = await db
      .collection("equipment")
      .find({})
      .sort({ name: 1 })
      .toArray();

    // Fetch categories
    const categories = await db
      .collection("categories")
      .find({})
      .sort({ name: 1 })
      .toArray();

    // Populate category information for equipment
    const equipmentWithCategories = equipment.map((item) => {
      const category = categories.find(
        (cat) => cat._id?.toString() === item.categoryId?.toString()
      );
      return {
        id: item._id?.toString(),
        name: item.name,
        brand: item.brand,
        status: item.status,
        quantity: item.quantity,
        categoryId: item.categoryId,
        image: item.image,
        description: item.description,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
        category: category
          ? {
              id: category._id?.toString(),
              name: category.name,
              slug: category.slug,
              description: category.description,
            }
          : null,
      };
    });

    return NextResponse.json({
      success: true,
      equipment: equipmentWithCategories,
      categories: categories.map((cat) => ({
        id: cat._id?.toString(),
        name: cat.name,
        slug: cat.slug,
        description: cat.description,
      })),
      equipmentCount: equipment.length,
      categoriesCount: categories.length,
    });
  } catch (error) {
    console.error("Error fetching equipment:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
