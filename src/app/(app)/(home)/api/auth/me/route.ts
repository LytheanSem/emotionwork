import { getSafePayload } from "@/lib/db-wrapper";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const payload = await getSafePayload();

    if (!payload) {
      return NextResponse.json(
        {
          success: false,
          error: "Database connection failed",
        },
        { status: 500 }
      );
    }

    // Get cookies from the request
    const headersList = await headers();
    const cookieHeader = headersList.get("cookie") || "";

    console.log("🍪 Received cookies:", cookieHeader);

    // Create a proper Headers object for PayloadCMS
    const headersObj = new Headers();
    headersObj.set("cookie", cookieHeader);

    // Check authentication status
    const { user } = await payload.auth({ headers: headersObj });

    console.log("👤 Auth result:", {
      hasUser: !!user,
      userId: user?.id,
      username: user?.username,
    });

    if (user) {
      return NextResponse.json({
        success: true,
        authenticated: true,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
        },
      });
    } else {
      return NextResponse.json(
        {
          success: false,
          authenticated: false,
          user: null,
        },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error("Auth check error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Authentication check failed",
      },
      { status: 500 }
    );
  }
}
