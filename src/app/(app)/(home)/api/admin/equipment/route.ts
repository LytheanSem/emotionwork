import { authOptions } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { mkdir, writeFile } from "fs/promises";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { join } from "path";

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

    const equipment = await db
      .collection("equipment")
      .find({})
      .sort({ name: 1 })
      .toArray();

    // Populate category information
    const equipmentWithCategories = await Promise.all(
      equipment.map(async (item) => {
        let category = null;
        if (item.categoryId) {
          category = await db
            .collection("categories")
            .findOne({ _id: item.categoryId });
        }

        return {
          id: item._id?.toString(),
          name: item.name,
          brand: item.brand,
          status: item.status,
          quantity: item.quantity,
          categoryId: item.categoryId,
          image: item.image,
          description: item.description,
          category: category
            ? {
                id: category._id?.toString(),
                name: category.name,
                slug: category.slug,
                description: category.description,
              }
            : null,
        };
      })
    );

    return NextResponse.json({
      success: true,
      equipment: equipmentWithCategories,
    });
  } catch (error) {
    console.error("Error fetching equipment:", error);
    return NextResponse.json(
      { error: "Failed to fetch equipment" },
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
    if (imageFile) {
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

    const newEquipment = {
      name,
      brand: brand || "",
      status,
      quantity,
      categoryId: categoryId || null,
      image: imagePath,
      description: description || "",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection("equipment").insertOne(newEquipment);

    return NextResponse.json({
      success: true,
      equipment: {
        id: result.insertedId.toString(),
        ...newEquipment,
      },
    });
  } catch (error) {
    console.error("Error creating equipment:", error);
    return NextResponse.json(
      { error: "Failed to create equipment" },
      { status: 500 }
    );
  }
}
