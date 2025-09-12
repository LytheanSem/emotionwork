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

    // Fetch equipment using MongoDB (excluding stage-related equipment)
    const equipment = await db
      .collection("equipment")
      .aggregate([
        {
          $lookup: {
            from: "categories",
            localField: "categoryId",
            foreignField: "_id",
            as: "category"
          }
        },
        {
          $unwind: {
            path: "$category",
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $match: {
            $or: [
              { categoryId: null },
              { "category.name": { $not: { $regex: /^stage/i } } }
            ]
          }
        },
        {
          $sort: { name: 1 }
        }
      ])
      .toArray();

    // Fetch categories (excluding stage-related categories)
    const categories = await db
      .collection("categories")
      .find({
        name: { 
          $not: { 
            $regex: /^stage/i 
          } 
        }
      })
      .sort({ name: 1 })
      .toArray();

    // Process equipment data (category info already included from aggregation)
    const equipmentWithCategories = equipment.map((item) => {
      return {
        id: item._id?.toString(),
        name: item.name,
        brand: item.brand,
        status: item.status,
        quantity: item.quantity,
        categoryId: item.categoryId,
        // Cloudinary fields
        imageUrl: item.imageUrl || null,
        imagePublicId: item.imagePublicId || null,
        imageResourceType: item.imageResourceType || null,
        description: item.description,
        // New fields
        length: item.length || null,
        price: item.price || null,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
        category: item.category
          ? {
              id: item.category._id?.toString(),
              name: item.category.name,
              slug: item.category.slug,
              description: item.category.description,
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
