import { getSafePayload } from "@/lib/db-wrapper";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const payload = await getSafePayload();

    if (!payload) {
      return NextResponse.json(
        {
          success: false,
          error: "Database connection failed",
        },
        { status: 500 }
      );
    }

    // Fetch equipment using PayloadCMS
    const equipment = await payload.find({
      collection: "equipment",
      depth: 2, // Populate category and image
      pagination: false,
      sort: "name",
    });

    // Fetch categories
    const categories = await payload.find({
      collection: "categories",
      depth: 1,
      pagination: false,
      sort: "name",
    });

    return NextResponse.json({
      success: true,
      equipment: equipment.docs,
      categories: categories.docs,
      equipmentCount: equipment.totalDocs,
      categoriesCount: categories.totalDocs,
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
