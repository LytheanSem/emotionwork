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
    const { searchParams } = new URL(request.url);
    const targetRole = searchParams.get('role') || 'admin'; // Default to admin if no role specified
    
    // Validate target role
    if (!['manager', 'admin'].includes(targetRole)) {
      return NextResponse.json(
        { error: "Invalid target role. Must be 'manager' or 'admin'" },
        { status: 400 }
      );
    }

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
        { error: "User not found or already has elevated privileges" },
        { status: 404 }
      );
    }

    // Create elevated user object based on target role
    const elevatedUser = {
      email: user.email,
      username: user.username,
      role: targetRole,
      image: user.image,
      provider: user.provider,
      providerId: user.providerId,
      permissions: targetRole === "admin" 
        ? ["read", "write", "delete", "admin"]
        : ["read", "write", "upload"],
      lastLogin: new Date(),
      createdAt: user.createdAt,
      updatedAt: new Date(),
    };

    // Insert into appropriate collection
    const targetCollection = targetRole === "admin" ? "adminUsers" : "managerUsers";
    const result = await db.collection(targetCollection).insertOne(elevatedUser);

    if (!result.insertedId) {
      return NextResponse.json(
        { error: `Failed to promote user to ${targetRole}` },
        { status: 500 }
      );
    }

    // Remove from regularUsers collection
    await db.collection("regularUsers").deleteOne({ _id: new ObjectId(id) });

    return NextResponse.json({
      success: true,
      message: `User promoted to ${targetRole} successfully`,
      user: {
        id: result.insertedId.toString(),
        ...elevatedUser,
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
