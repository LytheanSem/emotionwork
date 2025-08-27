import { authOptions } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { ObjectId } from "mongodb";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const session = await getServerSession(authOptions);
    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = await getDb();
    if (!db) {
      return NextResponse.json(
        { error: "Database connection failed" },
        { status: 500 }
      );
    }

    // Parse JSON request
    const jsonData = await request.json();
    const {
      name,
      brand = "",
      status,
      quantity,
      categoryId = "",
      description = "",
      imageUrl = "",
      imagePublicId = "",
      imageResourceType = "image",
    } = jsonData;

    if (!name || !status || !quantity) {
      return NextResponse.json(
        {
          error: "Name, status, and quantity are required",
        },
        { status: 400 }
      );
    }

    // Validate status
    if (!["available", "in_use", "maintenance"].includes(status)) {
      return NextResponse.json(
        {
          error: "Status must be one of: available, in_use, maintenance",
        },
        { status: 400 }
      );
    }

    // Validate quantity
    if (quantity < 1) {
      return NextResponse.json(
        {
          error: "Quantity must be at least 1",
        },
        { status: 400 }
      );
    }

    // Get current equipment to check if we should keep existing image
    const currentEquipment = await db.collection("equipment").findOne({
      _id: new ObjectId(id),
    });

    if (!currentEquipment) {
      return NextResponse.json(
        { error: "Equipment not found" },
        { status: 404 }
      );
    }

    // Prepare update data
    const updateData: {
      name: string;
      brand: string;
      status: string;
      quantity: number;
      categoryId: string;
      description: string;
      updatedAt: Date;
      imageUrl?: string;
      imagePublicId?: string;
      imageResourceType?: string;
      imageId?: null;
    } = {
      name,
      brand,
      status,
      quantity,
      categoryId,
      description,
      updatedAt: new Date(),
    };

    // Handle image data
    if (imageUrl && imagePublicId) {
      // New Cloudinary image provided
      updateData.imageUrl = imageUrl;
      updateData.imagePublicId = imagePublicId;
      updateData.imageResourceType = imageResourceType;
      // Remove legacy GridFS fields if they exist
      updateData.imageId = null;
    } else {
      // If no new image data provided, keep existing Cloudinary image data
      if (currentEquipment.imageUrl) {
        updateData.imageUrl = currentEquipment.imageUrl;
        updateData.imagePublicId = currentEquipment.imagePublicId;
        updateData.imageResourceType = currentEquipment.imageResourceType;
      }
    }

    // Update equipment
    const result = await db.collection("equipment").updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: "Equipment not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Equipment updated successfully",
      id,
    });
  } catch (error) {
    console.error("Error updating equipment:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const session = await getServerSession(authOptions);
    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = await getDb();
    if (!db) {
      return NextResponse.json(
        { error: "Database connection failed" },
        { status: 500 }
      );
    }

    const result = await db
      .collection("equipment")
      .deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: "Equipment not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Equipment deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting equipment:", error);
    return NextResponse.json(
      { error: "Failed to delete equipment" },
      { status: 500 }
    );
  }
}
