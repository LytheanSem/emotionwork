import { verificationRateLimiter } from "@/lib/rate-limiter";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const verificationStatusSchema = z.object({
  email: z.string().email(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = verificationStatusSchema.parse(body);

    const remainingAttempts =
      verificationRateLimiter.getRemainingAttempts(email);
    const timeUntilReset = verificationRateLimiter.getTimeUntilReset(email);
    const isAllowed = remainingAttempts > 0;

    return NextResponse.json({
      success: true,
      data: {
        email,
        remainingAttempts,
        timeUntilReset,
        isAllowed,
        minutesUntilReset: Math.ceil(timeUntilReset / (60 * 1000)),
      },
    });
  } catch (error) {
    console.error("Verification status error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: "Invalid email format" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: "Failed to get verification status",
      },
      { status: 500 }
    );
  }
}
