import { NextResponse } from "next/server";

export async function POST() {
  try {
    // This route is now handled by NextAuth
    // The frontend should use signOut() from next-auth/react
    return NextResponse.json(
      {
        success: false,
        error: "Please use the signOut() function from next-auth/react instead",
      },
      { status: 400 }
    );
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Logout failed",
      },
      { status: 500 }
    );
  }
}
