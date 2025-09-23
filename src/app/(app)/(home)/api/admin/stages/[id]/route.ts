import { authOptions } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { ObjectId } from "mongodb";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.isAdmin && !session?.user?.isManager) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const db = await getDb();
    if (!db) {
      return NextResponse.json({ error: "Database connection failed" }, { status: 500 });
    }

    const stage = await db.collection("stages").findOne({ _id: new ObjectId(id) });
    if (!stage) {
      return NextResponse.json({ error: "Stage not found" }, { status: 404 });
    }

    const transformedStage = {
      id: stage._id?.toString(),
      name: stage.name,
      status: stage.status,
      imageUrl: stage.imageUrl || "",
      imagePublicId: stage.imagePublicId || "",
      imageResourceType: stage.imageResourceType || "image",
      description: stage.description || "",
    };

    return NextResponse.json({ stage: transformedStage });
  } catch (error) {
    console.error("Error fetching stage:", error);
    return NextResponse.json({ error: "Failed to fetch stage" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.isAdmin && !session?.user?.isManager) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
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

    const updateData = {
      name,
      status,
      // Cloudinary fields
      imageUrl: imageUrl || null,
      imagePublicId: imagePublicId || null,
      imageResourceType: imageResourceType || "image",
      description,
      updatedAt: new Date(),
    };

    const result = await db.collection("stages").updateOne({ _id: new ObjectId(id) }, { $set: updateData });

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Stage not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      stage: {
        id,
        ...updateData,
      },
    });
  } catch (error) {
    console.error("Error updating stage:", error);
    return NextResponse.json({ error: "Failed to update stage" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.isAdmin && !session?.user?.isManager) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const db = await getDb();
    if (!db) {
      return NextResponse.json({ error: "Database connection failed" }, { status: 500 });
    }

    const result = await db.collection("stages").deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Stage not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting stage:", error);
    return NextResponse.json({ error: "Failed to delete stage" }, { status: 500 });
  }
}
