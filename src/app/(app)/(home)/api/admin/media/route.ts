import { authOptions } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function GET() {
  try {
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

    const media = await db
      .collection("media")
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json({
      success: true,
      media: media.map((item) => ({
        id: item._id?.toString(),
        filename: item.filename,
        originalName: item.originalName,
        mimeType: item.mimeType,
        size: item.size,
        url: item.url,
        alt: item.alt,
        createdAt: item.createdAt,
      })),
    });
  } catch (error) {
    console.error("Error fetching media:", error);
    return NextResponse.json(
      { error: "Failed to fetch media" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
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

    // Check if filename already exists
    const existingMedia = await db.collection("media").findOne({ filename });
    if (existingMedia) {
      return NextResponse.json(
        {
          error: "File with this filename already exists",
        },
        { status: 400 }
      );
    }

    const newMedia = {
      filename,
      originalName,
      mimeType,
      size: parseInt(size),
      url,
      alt: alt || "",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection("media").insertOne(newMedia);

    return NextResponse.json({
      success: true,
      media: {
        id: result.insertedId.toString(),
        ...newMedia,
      },
    });
  } catch (error) {
    console.error("Error creating media:", error);
    return NextResponse.json(
      { error: "Failed to create media" },
      { status: 500 }
    );
  }
}
