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

    // Get users from both collections
    const adminUsers = await db
      .collection("adminUsers")
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
        role: "admin" as const,
        image: user.image,
        provider: user.provider,
        createdAt: user.createdAt,
        collection: "adminUsers",
      })),
      ...regularUsers.map((user) => ({
        id: user._id?.toString(),
        username: user.username,
        email: user.email,
        role: "user" as const,
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
    if (!["user", "admin"].includes(role)) {
      return NextResponse.json(
        {
          error: "Role must be either 'user' or 'admin'",
        },
        { status: 400 }
      );
    }

    // Check if email already exists in either collection
    const existingAdminUser = await db
      .collection("adminUsers")
      .findOne({ email });
    const existingRegularUser = await db
      .collection("regularUsers")
      .findOne({ email });

    if (existingAdminUser || existingRegularUser) {
      return NextResponse.json(
        {
          error: "User with this email already exists",
        },
        { status: 400 }
      );
    }

    // Check if username already exists in either collection
    const existingAdminUsername = await db
      .collection("adminUsers")
      .findOne({ username });
    const existingRegularUsername = await db
      .collection("regularUsers")
      .findOne({ username });

    if (existingAdminUsername || existingRegularUsername) {
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
