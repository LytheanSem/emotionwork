import { getDb } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    console.log("Testing database connection...");

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

    console.log("MongoDB connection:", typeof db);
    console.log("Database name:", db.databaseName);

    // Try to use MongoDB API to find equipment
    try {
      const equipment = await db
        .collection("equipment")
        .find({})
        .limit(1)
        .toArray();
      const users = await db.collection("users").find({}).limit(1).toArray();
      const categories = await db
        .collection("categories")
        .find({})
        .limit(1)
        .toArray();

      return NextResponse.json({
        success: true,
        message: "Database connected successfully via MongoDB",
        collections: {
          equipment: equipment.length,
          users: users.length,
          categories: categories.length,
        },
        databaseName: db.databaseName,
        connectionType: "MongoDB Native Driver",
      });
    } catch (mongoError) {
      console.error("MongoDB query error:", mongoError);
      return NextResponse.json(
        {
          success: false,
          error: "MongoDB query failed",
          mongoError:
            mongoError instanceof Error ? mongoError.message : "Unknown error",
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Database test error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}
