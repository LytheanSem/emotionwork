import { getSafePayload } from "@/lib/db-wrapper";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = loginSchema.parse(body);

    const payload = await getSafePayload();

    if (!payload) {
      return NextResponse.json(
        { success: false, error: "Database connection failed" },
        { status: 500 }
      );
    }

    // Attempt to login
    const loginResult = await payload.login({
      collection: "users",
      data: {
        email,
        password,
      },
    });

    if (!loginResult.token) {
      return NextResponse.json(
        { success: false, error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Get user details
    const user = await payload.findByID({
      collection: "users",
      id: loginResult.user.id,
    });

    // Set the auth cookie
    const response = NextResponse.json(
      {
        success: true,
        message: "Login successful",
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
        },
      },
      { status: 200 }
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
    console.error("Login error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: "Invalid input data", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Login failed",
      },
      { status: 500 }
    );
  }
}
