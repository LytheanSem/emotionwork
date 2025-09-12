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
          // Cloudinary fields
          imageUrl: item.imageUrl || null,
          imagePublicId: item.imagePublicId || null,
          imageResourceType: item.imageResourceType || null,
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
    if (!session?.user?.isAdmin && !session?.user?.isManager) {
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
      length,
      price,
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

    const newEquipment = {
      name,
      brand,
      status,
      quantity,
      categoryId,
      // Cloudinary fields
      imageUrl: imageUrl || null,
      imagePublicId: imagePublicId || null,
      imageResourceType: imageResourceType || "image",
      description,
      // New fields
      length: length || null,
      price: price || null,
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
