import { authOptions } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { ObjectId } from "mongodb";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const db = await getDb();

    if (!db) {
      return NextResponse.json(
        { error: "Database connection failed" },
        { status: 500 }
      );
    }

    // Find user in regularUsers collection
    const user = await db
      .collection("regularUsers")
      .findOne({ _id: new ObjectId(id) });

    if (!user) {
      return NextResponse.json(
        { error: "User not found or already an admin" },
        { status: 404 }
      );
    }

    // Create admin user object
    const adminUser = {
      email: user.email,
      username: user.username,
      role: "admin",
      image: user.image,
      provider: user.provider,
      providerId: user.providerId,
      permissions: ["read", "write", "delete", "admin"],
      lastLogin: new Date(),
      createdAt: user.createdAt,
      updatedAt: new Date(),
    };

    // Insert into adminUsers collection
    const result = await db.collection("adminUsers").insertOne(adminUser);

    if (!result.insertedId) {
      return NextResponse.json(
        { error: "Failed to promote user" },
        { status: 500 }
      );
    }

    // Remove from regularUsers collection
    await db.collection("regularUsers").deleteOne({ _id: new ObjectId(id) });

    return NextResponse.json({
      success: true,
      message: "User promoted to admin successfully",
      user: {
        id: result.insertedId.toString(),
        ...adminUser,
      },
    });
  } catch (error) {
    console.error("Error promoting user:", error);
    return NextResponse.json(
      { error: "Failed to promote user" },
      { status: 500 }
    );
  }
}
