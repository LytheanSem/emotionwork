import { authContext } from "@/lib/auth-context";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Use the admin authentication context for admin routes
    const authResult = await authContext.checkAdminAuth();

    console.log("👑 Admin Auth result:", {
      hasUser: !!authResult.user,
      userId: authResult.user?.id,
      username: authResult.user?.username,
      role: authResult.user?.role,
      isAdmin: authResult.user?.isAdmin,
    });

    if (authResult.success && authResult.authenticated && authResult.user) {
      return NextResponse.json({
        success: true,
        authenticated: true,
        user: {
          id: authResult.user.id,
          username: authResult.user.username,
          email: authResult.user.email,
          role: authResult.user.role,
          isAdmin: authResult.user.isAdmin,
        },
      });
    } else {
      return NextResponse.json(
        {
          success: false,
          authenticated: false,
          user: null,
          error: authResult.error || "Admin access required",
        },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error("Admin auth check error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Authentication check failed",
      },
      { status: 500 }
    );
  }
}
