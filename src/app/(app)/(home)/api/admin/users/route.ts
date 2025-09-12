import { authOptions } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { adminRateLimiter } from "@/lib/rate-limiter";
import { isValidEmail, isValidUsername, sanitizeInput } from "@/lib/utils";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Rate limiting for admin endpoints
    const clientIP = "admin"; // Using "admin" as identifier for admin endpoints
    if (!adminRateLimiter.isAllowed(clientIP)) {
      return NextResponse.json(
        { error: "Rate limit exceeded. Please try again later." },
        { status: 429 }
      );
    }

    const db = await getDb();
    if (!db) {
      return NextResponse.json(
        { error: "Database connection failed" },
        { status: 500 }
      );
    }

    // Get users from all collections
    const adminUsers = await db
      .collection("adminUsers")
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    const managerUsers = await db
      .collection("managerUsers")
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    const regularUsers = await db
      .collection("regularUsers")
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    // Combine and format users
    const allUsers = [
      ...adminUsers.map((user) => ({
        id: user._id?.toString(),
        username: user.username,
        email: user.email,
        role: user.role || "admin", // Use actual role from database
        image: user.image,
        provider: user.provider,
        createdAt: user.createdAt,
        collection: "adminUsers",
      })),
      ...managerUsers.map((user) => ({
        id: user._id?.toString(),
        username: user.username,
        email: user.email,
        role: user.role || "manager", // Use actual role from database
        image: user.image,
        provider: user.provider,
        createdAt: user.createdAt,
        collection: "managerUsers",
      })),
      ...regularUsers.map((user) => ({
        id: user._id?.toString(),
        username: user.username,
        email: user.email,
        role: user.role || "user", // Use actual role from database
        image: user.image,
        provider: user.provider,
        createdAt: user.createdAt,
        collection: "regularUsers",
      })),
    ];

    return NextResponse.json({
      success: true,
      users: allUsers,
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { error: "Failed to fetch users" },
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

    // Rate limiting for admin endpoints
    const clientIP = "admin";
    if (!adminRateLimiter.isAllowed(clientIP)) {
      return NextResponse.json(
        { error: "Rate limit exceeded. Please try again later." },
        { status: 429 }
      );
    }

    const db = await getDb();
    if (!db) {
      return NextResponse.json(
        { error: "Database connection failed" },
        { status: 500 }
      );
    }

    const body = await request.json();

    // Sanitize and validate inputs
    const sanitizedBody = sanitizeInput(body) as {
      username: string;
      email: string;
      role: string;
    };
    const { username, email, role } = sanitizedBody;

    if (!username || !email || !role) {
      return NextResponse.json(
        {
          error: "Username, email, and role are required",
        },
        { status: 400 }
      );
    }

    // Validate email format
    if (!isValidEmail(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    // Validate username format
    if (!isValidUsername(username)) {
      return NextResponse.json(
        {
          error:
            "Username must be 3-20 characters, alphanumeric with underscores and hyphens only",
        },
        { status: 400 }
      );
    }

    // Validate role
    if (!["user", "manager", "admin"].includes(role)) {
      return NextResponse.json(
        {
          error: "Role must be either 'user', 'manager', or 'admin'",
        },
        { status: 400 }
      );
    }

    // Check if email already exists in any collection
    const existingAdminUser = await db
      .collection("adminUsers")
      .findOne({ email });
    const existingManagerUser = await db
      .collection("managerUsers")
      .findOne({ email });
    const existingRegularUser = await db
      .collection("regularUsers")
      .findOne({ email });

    if (existingAdminUser || existingManagerUser || existingRegularUser) {
      return NextResponse.json(
        {
          error: "User with this email already exists",
        },
        { status: 400 }
      );
    }

    // Check if username already exists in any collection
    const existingAdminUsername = await db
      .collection("adminUsers")
      .findOne({ username });
    const existingManagerUsername = await db
      .collection("managerUsers")
      .findOne({ username });
    const existingRegularUsername = await db
      .collection("regularUsers")
      .findOne({ username });

    if (existingAdminUsername || existingManagerUsername || existingRegularUsername) {
      return NextResponse.json(
        {
          error: "Username already taken",
        },
        { status: 400 }
      );
    }

    const now = new Date();

    if (role === "admin") {
      // Create admin user
      const newAdminUser = {
        username,
        email,
        role: "admin",
        image: null,
        provider: "local",
        providerId: `local_${Date.now()}`,
        permissions: ["read", "write", "delete", "admin"],
        lastLogin: now,
        createdAt: now,
        updatedAt: now,
      };

      const result = await db.collection("adminUsers").insertOne(newAdminUser);

      return NextResponse.json({
        success: true,
        user: {
          id: result.insertedId.toString(),
          ...newAdminUser,
        },
      });
    } else if (role === "manager") {
      // Create manager user
      const newManagerUser = {
        username,
        email,
        role: "manager",
        image: null,
        provider: "local",
        providerId: `local_${Date.now()}`,
        permissions: ["read", "write", "upload"],
        lastLogin: now,
        createdAt: now,
        updatedAt: now,
      };

      const result = await db.collection("managerUsers").insertOne(newManagerUser);

      return NextResponse.json({
        success: true,
        user: {
          id: result.insertedId.toString(),
          ...newManagerUser,
        },
      });
    } else {
      // Create regular user
      const newRegularUser = {
        username,
        email,
        role: "user",
        image: null,
        provider: "local",
        providerId: `local_${Date.now()}`,
        profile: {
          firstName: username.split(" ")[0],
          lastName: username.split(" ").slice(1).join(" "),
        },
        preferences: {
          notifications: true,
          theme: "light",
        },
        createdAt: now,
        updatedAt: now,
      };

      const result = await db
        .collection("regularUsers")
        .insertOne(newRegularUser);

      return NextResponse.json({
        success: true,
        user: {
          id: result.insertedId.toString(),
          ...newRegularUser,
        },
      });
    }
  } catch (error) {
    console.error("Error creating user:", error);
    return NextResponse.json(
      { error: "Failed to create user" },
      { status: 500 }
    );
  }
}
