import { getSafePayload } from "@/lib/db-wrapper";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const verifyCodeSchema = z.object({
  email: z.string().email(),
  username: z.string().min(3),
  password: z.string().min(3),
  code: z.string().length(6),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, username, password, code } = verifyCodeSchema.parse(body);

    const payload = await getSafePayload();

    if (!payload) {
      return NextResponse.json(
        { success: false, error: "Database connection failed" },
        { status: 500 }
      );
    }

    // Find the verification code
    const verificationCode = await payload.find({
      collection: "verification-codes",
      limit: 1,
      where: {
        and: [
          { email: { equals: email } },
          { code: { equals: code } },
          { used: { equals: false } },
          { expiresAt: { greater_than: new Date().toISOString() } },
        ],
      },
    });

    if (verificationCode.docs.length === 0) {
      return NextResponse.json(
        { success: false, error: "Invalid or expired verification code" },
        { status: 400 }
      );
    }

    const codeDoc = verificationCode.docs[0];

    // Mark the code as used
    await payload.update({
      collection: "verification-codes",
      id: codeDoc.id,
      data: {
        used: true,
      },
    });

    // Create the user with verified email
    const user = await payload.create({
      collection: "users",
      data: {
        email,
        username,
        password, // PayloadCMS will hash this automatically
        emailVerified: true,
        emailVerifiedAt: new Date().toISOString(),
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

    console.log("🔐 Login result:", {
      hasToken: !!loginResult.token,
      tokenLength: loginResult.token?.length,
      user: loginResult.user?.username,
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
        message: "Account verified and created successfully",
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
        },
      },
      { status: 201 }
    );

    // Set the auth cookie with proper configuration
    const cookieName = "payload-token";
    response.cookies.set({
      name: cookieName,
      value: loginResult.token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    console.log("🍪 Cookie set:", {
      name: cookieName,
      valueLength: loginResult.token.length,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    });

    return response;
  } catch (error) {
    console.error("Verification error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: "Invalid input data" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Verification failed",
      },
      { status: 500 }
    );
  }
}
