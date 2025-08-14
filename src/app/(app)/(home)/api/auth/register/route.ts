import { getSafePayload } from "@/lib/db-wrapper";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(3),
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(63, "Username must be less than 63 characters")
    .regex(
      /^[a-z0-9][a-z0-9-]*[a-z0-9]$/,
      "Username can only contain lowercase letters, numbers and hyphens. It must start and end with a letter or number"
    )
    .refine(
      (val) => !val.includes("--"),
      "Username cannot contain consecutive hyphens"
    )
    .transform((val) => val.toLowerCase()),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, username } = registerSchema.parse(body);

    const payload = await getSafePayload();

    if (!payload) {
      return NextResponse.json(
        { success: false, error: "Database connection failed" },
        { status: 500 }
      );
    }

    // Check if username already exists
    const existingUser = await payload.find({
      collection: "users",
      limit: 1,
      where: {
        username: {
          equals: username,
        },
      },
    });

    if (existingUser.docs.length > 0) {
      return NextResponse.json(
        { success: false, error: "Username already taken" },
        { status: 400 }
      );
    }

    // Check if email already exists
    const existingEmail = await payload.find({
      collection: "users",
      limit: 1,
      where: {
        email: {
          equals: email,
        },
      },
    });

    if (existingEmail.docs.length > 0) {
      return NextResponse.json(
        { success: false, error: "Email already registered" },
        { status: 400 }
      );
    }

    // Create the user
    const user = await payload.create({
      collection: "users",
      data: {
        email,
        username,
        password, // PayloadCMS will hash this automatically
      },
    });

    // Login the user after registration
    const loginResult = await payload.login({
      collection: "users",
      data: {
        email,
        password,
      },
    });

    if (!loginResult.token) {
      return NextResponse.json(
        { success: false, error: "Failed to login after registration" },
        { status: 500 }
      );
    }

    // Set the auth cookie
    const response = NextResponse.json(
      {
        success: true,
        message: "User registered and logged in successfully",
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
        },
      },
      { status: 201 }
    );

    // Set the auth cookie with proper configuration
    response.cookies.set({
      name: "payload-token",
      value: loginResult.token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (error) {
    console.error("Registration error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: "Invalid input data", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Registration failed",
      },
      { status: 500 }
    );
  }
}
