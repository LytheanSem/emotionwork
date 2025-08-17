import { getSafePayload } from "@/lib/db-wrapper";
import { loginSecurityService } from "@/lib/login-security";
import { getClientIP, getUserAgent } from "@/lib/utils";
import { loginSchema } from "@/modules/auth/schemas";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = loginSchema.parse(body);

    // Get client information for security tracking
    const headersList = await request.headers;
    const clientIP = getClientIP(headersList);
    const userAgent = getUserAgent(headersList);

    console.log(`🔐 Login attempt from ${clientIP} for ${email}`);

    // Check if account is currently locked out
    const lockoutStatus = await loginSecurityService.checkLockoutStatus(
      email,
      clientIP
    );

    if (lockoutStatus.isLocked) {
      const timeRemaining = Math.ceil(
        (lockoutStatus.lockoutUntil!.getTime() - Date.now()) / (60 * 1000)
      );

      console.log(
        `🚫 Account locked for ${email} from ${clientIP} - ${timeRemaining} minutes remaining`
      );

      return NextResponse.json(
        {
          success: false,
          error: `Account temporarily locked due to too many failed attempts. Please try again in ${timeRemaining} minute${timeRemaining !== 1 ? "s" : ""}.`,
          lockoutInfo: {
            isLocked: true,
            timeRemaining: `${timeRemaining} minute${timeRemaining !== 1 ? "s" : ""}`,
          },
        },
        { status: 429 } // Too Many Requests
      );
    }

    // Check remaining attempts
    if (lockoutStatus.remainingAttempts <= 0) {
      console.log(
        `⚠️ No login attempts remaining for ${email} from ${clientIP}`
      );

      return NextResponse.json(
        {
          success: false,
          error: `Too many failed attempts. Please wait before trying again.`,
          lockoutInfo: {
            isLocked: false,
            attemptsRemaining: 0,
          },
        },
        { status: 429 }
      );
    }

    const payload = await getSafePayload();

    if (!payload) {
      return NextResponse.json(
        { success: false, error: "Database connection failed" },
        { status: 500 }
      );
    }

    // Attempt to login
    let loginResult;
    let loginSuccess = false;

    try {
      console.log(`🔍 Attempting PayloadCMS login for ${email}...`);
      loginResult = await payload.login({
        collection: "users",
        data: {
          email,
          password,
        },
      });

      if (loginResult.token) {
        loginSuccess = true;
        console.log(`✅ PayloadCMS login successful for ${email}`);
      } else {
        console.log(`⚠️ PayloadCMS login returned no token for ${email}`);
      }
    } catch (error) {
      // Login failed - this is expected for invalid credentials
      loginSuccess = false;
      console.log(
        `❌ PayloadCMS login failed for ${email}:`,
        error instanceof Error ? error.message : "Unknown error"
      );
    }

    // Record the login attempt
    await loginSecurityService.recordLoginAttempt({
      email,
      ipAddress: clientIP,
      userAgent,
      success: loginSuccess,
    });

    if (!loginSuccess || !loginResult?.token) {
      // Login failed
      const remainingAttempts = lockoutStatus.remainingAttempts - 1;
      const attemptsText =
        remainingAttempts === 1 ? "1 attempt" : `${remainingAttempts} attempts`;

      console.log(
        `❌ Login failed for ${email} from ${clientIP} - ${attemptsText} remaining`
      );

      return NextResponse.json(
        {
          success: false,
          error: `Invalid email or password. ${attemptsText} remaining before account lockout.`,
          lockoutInfo: {
            isLocked: false,
            attemptsRemaining: remainingAttempts,
          },
        },
        { status: 401 }
      );
    }

    // Login successful - get user details with role information
    const user = await payload.findByID({
      collection: "users",
      id: loginResult.user.id,
    });

    // Check if user has a role, if not set default
    if (!user.role) {
      console.warn(
        `User ${user.username} has no role set, defaulting to 'user'`
      );
    }

    const userRole = user.role || "user";
    const isAdmin = userRole === "admin";

    // Set the auth cookie
    const response = NextResponse.json(
      {
        success: true,
        message: "Login successful",
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          role: userRole,
          isAdmin: isAdmin,
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

    console.log(
      `🔐 User ${user.username} logged in successfully with role: ${userRole} from ${clientIP}`
    );

    return response;
  } catch (error) {
    console.error("Login error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: "Invalid input data", details: error.issues },
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
