import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (session?.user) {
      return NextResponse.json({
        success: true,
        authenticated: true,
        user: {
          id: session.user.id,
          username:
            session.user.name || session.user.email?.split("@")[0] || "user",
          email: session.user.email,
          role: session.user.role,
          isAdmin: session.user.isAdmin,
        },
      });
    } else {
      return NextResponse.json(
        {
          success: true,
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
