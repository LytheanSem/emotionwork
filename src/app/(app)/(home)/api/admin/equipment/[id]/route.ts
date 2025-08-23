import { authOptions } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { mkdir, writeFile } from "fs/promises";
import { ObjectId } from "mongodb";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { join } from "path";

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

    const formData = await request.formData();
    const name = formData.get("name") as string;
    const brand = formData.get("brand") as string;
    const status = formData.get("status") as string;
    const quantity = parseInt(formData.get("quantity") as string);
    const categoryId = formData.get("categoryId") as string;
    const description = formData.get("description") as string;
    const imageFile = formData.get("image") as File | null;

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

    let imagePath = null;

    // Handle image upload if provided
    if (imageFile && imageFile.size > 0) {
      try {
        // Validate file type
        const allowedTypes = [
          "image/jpeg",
          "image/jpg",
          "image/png",
          "image/gif",
          "image/webp",
        ];
        if (!allowedTypes.includes(imageFile.type)) {
          return NextResponse.json(
            {
              error:
                "Invalid file type. Only JPG, PNG, GIF, and WebP images are allowed.",
            },
            { status: 400 }
          );
        }

        // Validate file size (5MB limit)
        const maxSize = 5 * 1024 * 1024; // 5MB
        if (imageFile.size > maxSize) {
          return NextResponse.json(
            { error: "File too large. Maximum size is 5MB." },
            { status: 400 }
          );
        }

        // Create uploads directory if it doesn't exist
        const uploadsDir = join(process.cwd(), "public", "uploads");
        await mkdir(uploadsDir, { recursive: true });

        // Generate unique filename
        const timestamp = Date.now();
        const fileExtension = imageFile.name.split(".").pop();
        const filename = `equipment_${timestamp}.${fileExtension}`;
        const filePath = join(uploadsDir, filename);

        // Convert File to Buffer and save
        const bytes = await imageFile.arrayBuffer();
        const buffer = Buffer.from(bytes);
        await writeFile(filePath, buffer);

        imagePath = `/uploads/${filename}`;
      } catch (error) {
        console.error("Error saving image:", error);
        return NextResponse.json(
          { error: "Failed to save image" },
          { status: 500 }
        );
      }
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

    // Use new image if uploaded, otherwise keep existing image
    const finalImagePath = imagePath || currentEquipment.image;

    const result = await db.collection("equipment").updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          name,
          brand: brand || "",
          status,
          quantity,
          categoryId: categoryId || null,
          image: finalImagePath,
          description: description || "",
          updatedAt: new Date(),
        },
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: "Equipment not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Equipment updated successfully",
    });
  } catch (error) {
    console.error("Error updating equipment:", error);
    return NextResponse.json(
      { error: "Failed to update equipment" },
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
