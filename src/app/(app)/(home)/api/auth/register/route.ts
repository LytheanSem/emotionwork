import { NextResponse } from "next/server";

export async function POST() {
  // This route is deprecated - redirect to the new verification flow
  return NextResponse.json(
    {
      success: false,
      error:
        "This registration endpoint is deprecated. Please use the new verification flow.",
    },
    { status: 410 }
  );
}
