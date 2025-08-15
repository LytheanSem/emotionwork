import { getSafePayload } from "@/lib/db-wrapper";
import { generateVerificationCode, sendVerificationEmail } from "@/lib/email";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const sendVerificationSchema = z.object({
  email: z.string().email(),
  username: z.string().min(3),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, username } = sendVerificationSchema.parse(body);

    const payload = await getSafePayload();

    if (!payload) {
      return NextResponse.json(
        { success: false, error: "Database connection failed" },
        { status: 500 }
      );
    }

    // Check if user already exists
    const existingUser = await payload.find({
      collection: "users",
      limit: 1,
      where: {
        or: [{ email: { equals: email } }, { username: { equals: username } }],
      },
    });

    if (existingUser.docs.length > 0) {
      return NextResponse.json(
        { success: false, error: "User already exists" },
        { status: 400 }
      );
    }

    // Generate verification code
    const code = generateVerificationCode();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

    // Delete any existing verification codes for this email
    await payload.delete({
      collection: "verification-codes",
      where: {
        email: { equals: email },
      },
    });

    // Create new verification code
    await payload.create({
      collection: "verification-codes",
      data: {
        email,
        code,
        expiresAt: expiresAt.toISOString(),
        used: false,
      },
    });

    // Send verification email
    const emailResult = await sendVerificationEmail(email, code, username);

    if (!emailResult.success) {
      // Clean up the verification code if email fails
      await payload.delete({
        collection: "verification-codes",
        where: {
          email: { equals: email },
        },
      });

      return NextResponse.json(
        { success: false, error: "Failed to send verification email" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Verification code sent successfully",
    });
  } catch (error) {
    console.error("Send verification error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: "Invalid input data" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to send verification code",
      },
      { status: 500 }
    );
  }
}
