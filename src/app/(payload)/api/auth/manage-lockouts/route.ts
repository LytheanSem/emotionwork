import { authContext } from "@/lib/auth-context";
import { loginSecurityService } from "@/lib/login-security";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    // Check if user is admin
    const authResult = await authContext.checkAdminAuth();

    if (!authResult.success || !authResult.authenticated) {
      return NextResponse.json(
        { success: false, error: "Admin access required" },
        { status: 401 }
      );
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");
    const ipAddress = searchParams.get("ip");

    if (!email || !ipAddress) {
      return NextResponse.json(
        { success: false, error: "Email and IP address are required" },
        { status: 400 }
      );
    }

    // Get lockout information
    const lockoutInfo = await loginSecurityService.getLockoutInfo(
      email,
      ipAddress
    );

    return NextResponse.json({
      success: true,
      lockoutInfo,
    });
  } catch (error) {
    console.error("Error getting lockout info:", error);
    return NextResponse.json(
      { success: false, error: "Failed to get lockout information" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check if user is admin
    const authResult = await authContext.checkAdminAuth();

    if (!authResult.success || !authResult.authenticated) {
      return NextResponse.json(
        { success: false, error: "Admin access required" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { action, email, ipAddress } = body;

    if (!action || !email || !ipAddress) {
      return NextResponse.json(
        { success: false, error: "Action, email, and IP address are required" },
        { status: 400 }
      );
    }

    if (action === "clear") {
      // Clear the lockout
      await loginSecurityService.clearLockout(email, ipAddress);

      return NextResponse.json({
        success: true,
        message: `Lockout cleared for ${email} from ${ipAddress}`,
      });
    } else {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid action. Use 'clear' to clear lockout.",
        },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Error managing lockout:", error);
    return NextResponse.json(
      { success: false, error: "Failed to manage lockout" },
      { status: 500 }
    );
  }
}
