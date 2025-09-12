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

    const categories = await db
      .collection("categories")
      .find({
        name: { 
          $regex: /^stage/i 
        }
      })
      .project({
        _id: 0,
        id: { $toString: "$_id" },
        name: 1,
        slug: 1,
        description: 1,
      })
      .toArray();

    return NextResponse.json({ categories });
  } catch (error) {
    console.error("Error fetching stage categories:", error);
    return NextResponse.json(
      { error: "Failed to fetch stage categories" },
      { status: 500 }
    );
  }
}



