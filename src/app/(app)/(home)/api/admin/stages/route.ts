import { authOptions } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.isAdmin && !session?.user?.isManager) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = await getDb();
    if (!db) {
      return NextResponse.json({ error: "Database connection failed" }, { status: 500 });
    }

    // Get all stages with category information
    const stages = await db.collection("stages").find({}).toArray();

    // Transform the data to match expected format
    const transformedStages = stages.map((stage) => ({
      id: stage._id?.toString(),
      name: stage.name,
      status: stage.status,
      imageUrl: stage.imageUrl || "",
      imagePublicId: stage.imagePublicId || "",
      imageResourceType: stage.imageResourceType || "image",
      description: stage.description || "",
    }));

    return NextResponse.json({ stages: transformedStages });
  } catch (error) {
    console.error("Error fetching stages:", error);
    return NextResponse.json({ error: "Failed to fetch stages" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.isAdmin && !session?.user?.isManager) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = await getDb();
    if (!db) {
      return NextResponse.json({ error: "Database connection failed" }, { status: 500 });
    }

    // Parse JSON request
    const jsonData = await request.json();
    const { name, status, description = "", imageUrl = "", imagePublicId = "", imageResourceType = "image" } = jsonData;

    if (!name || !status) {
      return NextResponse.json(
        {
          error: "Name and status are required",
        },
        { status: 400 }
      );
    }

    // Validate status
    if (!["indoor", "outdoor"].includes(status)) {
      return NextResponse.json(
        {
          error: "Status must be one of: indoor, outdoor",
        },
        { status: 400 }
      );
    }

    const newStage = {
      name,
      status,
      // Cloudinary fields
      imageUrl: imageUrl || null,
      imagePublicId: imagePublicId || null,
      imageResourceType: imageResourceType || "image",
      description,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection("stages").insertOne(newStage);

    return NextResponse.json({
      success: true,
      stage: {
        id: result.insertedId.toString(),
        ...newStage,
      },
    });
  } catch (error) {
    console.error("Error creating stage:", error);
    return NextResponse.json({ error: "Failed to create stage" }, { status: 500 });
  }
}
