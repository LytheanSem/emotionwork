import { getDb } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const db = await getDb();
    if (!db) {
      return NextResponse.json({ error: "Database connection failed" }, { status: 500 });
    }

    // Get all stages
    const stages = await db.collection("stages").find({}).toArray();

    // Transform the data to match expected format
    const transformedStages = stages.map((stage) => ({
      id: stage._id?.toString(),
      name: stage.name,
      status: stage.status,
      imageUrl: stage.imageUrl || "",
      description: stage.description || "",
    }));

    return NextResponse.json({ stages: transformedStages });
  } catch (error) {
    console.error("Error fetching stages:", error);
    return NextResponse.json({ error: "Failed to fetch stages" }, { status: 500 });
  }
}
