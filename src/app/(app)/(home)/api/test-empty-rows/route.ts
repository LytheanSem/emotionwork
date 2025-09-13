import { googleSheetsService } from "@/lib/google-sheets";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Test the empty row detection
    const response = await googleSheetsService.testConnection();

    if (!response.success) {
      return NextResponse.json({
        success: false,
        error: "Google Sheets connection failed",
        details: response.error,
      });
    }

    // Get all bookings to see current data
    const bookings = await googleSheetsService.getBookings();

    // Test the empty row detection
    const firstEmptyRow = await googleSheetsService.findFirstEmptyRow();

    return NextResponse.json({
      success: true,
      message: "Empty row detection test completed",
      firstEmptyRow: firstEmptyRow,
      currentBookings: bookings.length,
      bookings: bookings.map((booking, index) => ({
        row: index + 2, // +2 because we start from row 2 (after header)
        firstName: booking.firstName,
        lastName: booking.lastName,
        email: booking.email,
        dateTime: booking.selectedDate + " " + booking.selectedTime,
      })),
    });
  } catch (error: unknown) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
