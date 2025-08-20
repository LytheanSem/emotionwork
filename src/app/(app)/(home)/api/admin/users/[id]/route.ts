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

    const body = await request.json();
    const { username, email, role } = body;

    if (!username || !email || !role) {
      return NextResponse.json(
        { error: "Username, email, and role are required" },
        { status: 400 }
      );
    }

    // Validate role
    if (!["user", "admin"].includes(role)) {
      return NextResponse.json(
        { error: "Role must be either 'user' or 'admin'" },
        { status: 400 }
      );
    }

    // Check if user exists in adminUsers collection
    let user = await db
      .collection("adminUsers")
      .findOne({ _id: new ObjectId(id) });
    let collection = "adminUsers";

    if (!user) {
      // Check if user exists in regularUsers collection
      user = await db
        .collection("regularUsers")
        .findOne({ _id: new ObjectId(id) });
      collection = "regularUsers";
    }

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if email already exists in either collection (excluding current user)
    const existingAdminUser = await db
      .collection("adminUsers")
      .findOne({ email, _id: { $ne: new ObjectId(id) } });
    const existingRegularUser = await db
      .collection("regularUsers")
      .findOne({ email, _id: { $ne: new ObjectId(id) } });

    if (existingAdminUser || existingRegularUser) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 400 }
      );
    }

    // Check if username already exists in either collection (excluding current user)
    const existingAdminUsername = await db
      .collection("adminUsers")
      .findOne({ username, _id: { $ne: new ObjectId(id) } });
    const existingRegularUsername = await db
      .collection("regularUsers")
      .findOne({ username, _id: { $ne: new ObjectId(id) } });

    if (existingAdminUsername || existingRegularUsername) {
      return NextResponse.json(
        { error: "Username already taken" },
        { status: 400 }
      );
    }

    // Update user in the appropriate collection
    const result = await db.collection(collection).updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          username,
          email,
          role,
          updatedAt: new Date(),
        },
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: "User updated successfully",
    });
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json(
      { error: "Failed to update user" },
      { status: 500 }
    );
  }
}

export async function DELETE(
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

    // Check if user exists in adminUsers collection
    let user = await db
      .collection("adminUsers")
      .findOne({ _id: new ObjectId(id) });
    let collection = "adminUsers";

    if (!user) {
      // Check if user exists in regularUsers collection
      user = await db
        .collection("regularUsers")
        .findOne({ _id: new ObjectId(id) });
      collection = "regularUsers";
    }

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Prevent self-deletion
    if (user.email === session.user.email) {
      return NextResponse.json(
        { error: "Cannot delete your own account" },
        { status: 400 }
      );
    }

    // Delete user from the appropriate collection
    const result = await db
      .collection(collection)
      .deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: "Failed to delete user" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json(
      { error: "Failed to delete user" },
      { status: 500 }
    );
  }
}
