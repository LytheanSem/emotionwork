import { getDb } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const db = await getDb();
    if (!db) {
      return NextResponse.json(
        { error: "Database connection failed" },
        { status: 500 }
      );
    }

    // Get all stages with category information (only stage-related categories)
    const stages = await db
      .collection("stages")
      .aggregate([
        {
          $lookup: {
            from: "categories",
            localField: "categoryId",
            foreignField: "_id",
            as: "category",
          },
        },
        {
          $unwind: {
            path: "$category",
            preserveNullAndEmptyArrays: true,
          },
        },
        // Show all stages - removed category filter for now
        // You can re-enable this filter once you have proper stage categories
        // {
        //   $match: {
        //     $or: [
        //       { categoryId: null },
        //       { "category.name": { $regex: /^stage/i } }
        //     ]
        //   }
        // },
        {
          $addFields: {
            id: { $toString: "$_id" },
            categoryId: {
              $cond: {
                if: { $ne: ["$categoryId", null] },
                then: { $toString: "$categoryId" },
                else: null,
              },
            },
            "category.id": { $toString: "$category._id" },
          },
        },
        {
          $project: {
            _id: 0,
            category: {
              _id: 0,
            },
          },
        },
      ])
      .toArray();

    return NextResponse.json({ stages });
  } catch (error) {
    console.error("Error fetching stages:", error);
    return NextResponse.json(
      { error: "Failed to fetch stages" },
      { status: 500 }
    );
  }
}
