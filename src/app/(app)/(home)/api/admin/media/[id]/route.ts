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

    const body = await request.json();
    const { filename, originalName, mimeType, size, url, alt } = body;

    if (!filename || !originalName || !mimeType || !size || !url) {
      return NextResponse.json(
        {
          error: "Filename, originalName, mimeType, size, and url are required",
        },
        { status: 400 }
      );
    }

    // Validate size
    if (size < 1) {
      return NextResponse.json(
        {
          error: "Size must be at least 1 byte",
        },
        { status: 400 }
      );
    }

    // Check if filename already exists for other media
    const existingMedia = await db.collection("media").findOne({
      filename,
      _id: { $ne: new ObjectId(id) },
    });
    if (existingMedia) {
      return NextResponse.json(
        {
          error: "File with this filename already exists",
        },
        { status: 400 }
      );
    }

    const result = await db.collection("media").updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          filename,
          originalName,
          mimeType,
          size: parseInt(size),
          url,
          alt: alt || "",
          updatedAt: new Date(),
        },
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Media not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: "Media updated successfully",
    });
  } catch (error) {
    console.error("Error updating media:", error);
    return NextResponse.json(
      { error: "Failed to update media" },
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

    // Check if media is being used by equipment
    const equipmentUsingMedia = await db.collection("equipment").findOne({
      image: id,
    });

    if (equipmentUsingMedia) {
      return NextResponse.json(
        {
          error: "Cannot delete media - it is being used by equipment",
        },
        { status: 400 }
      );
    }

    const result = await db
      .collection("media")
      .deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Media not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: "Media deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting media:", error);
    return NextResponse.json(
      { error: "Failed to delete media" },
      { status: 500 }
    );
  }
}
