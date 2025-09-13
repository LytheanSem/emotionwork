import { emailService } from "@/lib/email-service";
import { googleSheetsService } from "@/lib/google-sheets";
import { validateRequestSize } from "@/lib/request-limiter";
import { NextRequest, NextResponse } from "next/server";

interface BookingData {
  firstName: string;
  middleName?: string;
  lastName: string;
  phoneNumber: string;
  email: string;
  description?: string;
  selectedDate: string;
  selectedTime: string;
}

export async function POST(request: NextRequest) {
  try {
    // Check request size
    const sizeValidation = validateRequestSize(request);
    if (!sizeValidation.valid) {
      return NextResponse.json({ error: sizeValidation.error }, { status: 413 });
    }

    const bookingData: BookingData = await request.json();

    // Validate required fields
    if (
      !bookingData.firstName ||
      !bookingData.lastName ||
      !bookingData.email ||
      !bookingData.phoneNumber ||
      !bookingData.selectedDate ||
      !bookingData.selectedTime
    ) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(bookingData.email)) {
      return NextResponse.json({ error: "Invalid email format" }, { status: 400 });
    }

    // Create unique slot identifier
    const slotId = `${bookingData.selectedDate}-${bookingData.selectedTime}`;

    // Get current booked slots from Google Sheets
    const bookedSlots = await googleSheetsService.getBookedSlots();

    // Check if slot is already booked
    if (bookedSlots.includes(slotId)) {
      return NextResponse.json({ error: "This time slot is no longer available" }, { status: 409 });
    }

    // Add booking to Google Sheets
    const result = await googleSheetsService.addBooking(bookingData);

    if (!result.success) {
      return NextResponse.json({ error: "Failed to save booking" }, { status: 500 });
    }

    console.log("New booking saved to Google Sheets:", bookingData);
    console.log("Booking ID:", result.bookingId);

    // Send confirmation email
    try {
      const emailData = { ...bookingData, bookingId: result.bookingId };
      const emailSent = await emailService.sendBookingConfirmation(emailData);
      if (emailSent) {
        console.log("Confirmation email sent to:", bookingData.email);
      } else {
        console.log("Failed to send confirmation email to:", bookingData.email);
        // Don't fail the booking if email fails
      }
    } catch (error) {
      console.error("Error sending confirmation email:", error);
      // Don't fail the booking if email fails
    }

    return NextResponse.json(
      {
        success: true,
        message: "Booking confirmed successfully",
        bookingId: result.bookingId,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Booking error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET() {
  try {
    // Get bookings and booked slots from Google Sheets
    const bookings = await googleSheetsService.getBookings();
    const bookedSlots = await googleSheetsService.getBookedSlots();

    return NextResponse.json({
      bookings: bookings,
      bookedSlots: bookedSlots,
    });
  } catch (error) {
    console.error("Error fetching bookings:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
