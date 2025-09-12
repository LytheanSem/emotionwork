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
    if (!["user", "manager", "admin"].includes(role)) {
      return NextResponse.json(
        { error: "Role must be either 'user', 'manager', or 'admin'" },
        { status: 400 }
      );
    }

    // Check if user exists in adminUsers collection
    let user = await db
      .collection("adminUsers")
      .findOne({ _id: new ObjectId(id) });
    let collection = "adminUsers";

    if (!user) {
      // Check if user exists in managerUsers collection
      user = await db
        .collection("managerUsers")
        .findOne({ _id: new ObjectId(id) });
      collection = "managerUsers";
    }

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

    // Check if email already exists in any collection (excluding current user)
    const existingAdminUser = await db
      .collection("adminUsers")
      .findOne({ email, _id: { $ne: new ObjectId(id) } });
    const existingManagerUser = await db
      .collection("managerUsers")
      .findOne({ email, _id: { $ne: new ObjectId(id) } });
    const existingRegularUser = await db
      .collection("regularUsers")
      .findOne({ email, _id: { $ne: new ObjectId(id) } });

    if (existingAdminUser || existingManagerUser || existingRegularUser) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 400 }
      );
    }

    // Check if username already exists in any collection (excluding current user)
    const existingAdminUsername = await db
      .collection("adminUsers")
      .findOne({ username, _id: { $ne: new ObjectId(id) } });
    const existingManagerUsername = await db
      .collection("managerUsers")
      .findOne({ username, _id: { $ne: new ObjectId(id) } });
    const existingRegularUsername = await db
      .collection("regularUsers")
      .findOne({ username, _id: { $ne: new ObjectId(id) } });

    if (existingAdminUsername || existingManagerUsername || existingRegularUsername) {
      return NextResponse.json(
        { error: "Username already taken" },
        { status: 400 }
      );
    }

    // Check if role change requires moving user between collections
    const currentRole = user.role;
    const newRole = role;
    
    if (currentRole !== newRole) {
      // Role changed - need to move user between collections
      
      let targetCollection: string;
      if (newRole === "admin") {
        targetCollection = "adminUsers";
      } else if (newRole === "manager") {
        targetCollection = "managerUsers";
      } else {
        targetCollection = "regularUsers";
      }
      
      // Prepare user data for the new collection
      const userData: {
        username: string;
        email: string;
        role: string;
        image: string | null;
        provider: string;
        providerId: string;
        createdAt: Date;
        updatedAt: Date;
        permissions?: string[];
        lastLogin?: Date;
        profile?: {
          firstName: string;
          lastName: string;
        };
        preferences?: {
          notifications: boolean;
          theme: string;
        };
      } = {
        username,
        email,
        role: newRole,
        image: user.image || null,
        provider: user.provider || "google",
        providerId: user.providerId || `google_${Date.now()}`,
        createdAt: user.createdAt || new Date(),
        updatedAt: new Date(),
      };

      // Add collection-specific fields
      if (newRole === "admin") {
        userData.permissions = ["read", "write", "delete", "admin"];
        userData.lastLogin = user.lastLogin || new Date();
      } else if (newRole === "manager") {
        userData.permissions = ["read", "write", "upload"];
        userData.lastLogin = user.lastLogin || new Date();
      } else {
        userData.profile = user.profile || {
          firstName: username.split(" ")[0] || username,
          lastName: username.split(" ").slice(1).join(" ") || "",
        };
        userData.preferences = user.preferences || {
          notifications: true,
          theme: "light",
        };
      }

      try {
        // Check if the current user is already in the target collection
        const currentUserInTarget = await db.collection(targetCollection).findOne({ 
          _id: new ObjectId(id) 
        });
        
        if (currentUserInTarget) {
          // User is already in target collection, just update the role
          const updateResult = await db.collection(targetCollection).updateOne(
            { _id: new ObjectId(id) },
            { $set: { role: newRole, updatedAt: new Date() } }
          );
          
          if (updateResult.matchedCount > 0) {
            return NextResponse.json({
              success: true,
              message: "User role updated successfully",
            });
          } else {
            return NextResponse.json({ error: "Failed to update user role" }, { status: 500 });
          }
        }
        
        // Check if another user with same email exists in target collection
        const existingUserInTarget = await db.collection(targetCollection).findOne({ 
          email, 
          _id: { $ne: new ObjectId(id) } 
        });
        
        if (existingUserInTarget) {
          // Another user with the same email exists in target collection
          return NextResponse.json({ 
            error: `Cannot change role: Another user with email ${email} already exists in the ${newRole} role` 
          }, { status: 400 });
        }
        
        // No conflicts and user needs to be moved - proceed with insert
        const insertResult = await db.collection(targetCollection).insertOne(userData);
        
        if (insertResult.insertedId) {
          // Delete user from old collection
          await db.collection(collection).deleteOne({ _id: new ObjectId(id) });
          
          return NextResponse.json({
            success: true,
            message: "User updated successfully and moved to appropriate collection",
          });
        } else {
          console.error("Insert failed - no insertedId returned");
          return NextResponse.json({ error: "Failed to insert user into new collection" }, { status: 500 });
        }
      } catch (insertError) {
        console.error("Error during role change:", insertError);
        return NextResponse.json({ 
          error: `Failed to change role: ${insertError instanceof Error ? insertError.message : 'Unknown error'}` 
        }, { status: 500 });
      }
    } else {
      // No role change - just update in current collection
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
    }
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
