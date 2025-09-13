import { googleSheetsService } from "@/lib/google-sheets";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const blockedDates = await googleSheetsService.getBlockedDates();

    return NextResponse.json({
      success: true,
      blockedDates: blockedDates,
    });
  } catch (error) {
    console.error("Error fetching blocked dates:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch blocked dates",
        blockedDates: [], // Return empty array to not break booking system
      },
      { status: 500 }
    );
  }
}
