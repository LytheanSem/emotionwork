import { emailService } from "@/lib/email-service";
import { googleSheetsService } from "@/lib/google-sheets";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
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

    // Basic rate limiting (10 requests per 15 minutes per IP)
    const ip = getClientIp(request);
    if (!checkRateLimit(ip, { windowMs: 15 * 60 * 1000, max: 10 })) {
      return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 });
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

    // Validate phone format
    const phone = bookingData.phoneNumber?.replace(/[\s\-\(\)]/g, "");
    if (!/^\+?[1-9]\d{0,15}$/.test(phone)) {
      return NextResponse.json({ error: "Invalid phone number" }, { status: 400 });
    }

    // Server-side business rule validation
    const dayDate = new Date(bookingData.selectedDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    dayDate.setHours(0, 0, 0, 0);

    // Check for same-day or past-date bookings
    if (dayDate <= today) {
      return NextResponse.json({ error: "Same-day or past-date bookings are not allowed" }, { status: 400 });
    }

    // Check for weekend bookings
    const dow = dayDate.getDay();
    if (dow === 0 || dow === 6) {
      return NextResponse.json({ error: "Weekend bookings are not allowed" }, { status: 400 });
    }

    // Check for blocked dates (holidays)
    try {
      const blockedResponse = await fetch(`${process.env.NEXTAUTH_URL}/api/blocked-dates`);
      if (blockedResponse.ok) {
        const blockedDates = await blockedResponse.json();
        if (blockedDates.includes(bookingData.selectedDate)) {
          return NextResponse.json({ error: "Selected date is blocked" }, { status: 400 });
        }
      }
    } catch (error) {
      console.warn("Could not check blocked dates:", error);
      // Continue with booking - don't fail for this
    }

    // Create unique slot identifier (normalize time)
    const normalizedTime = bookingData.selectedTime.trim().replace(/\s+/g, " ").toUpperCase();
    const timeWithMinutes = /:\d{2}/.test(normalizedTime)
      ? normalizedTime
      : normalizedTime.replace(/(AM|PM)$/, ":00 $1");
    const slotId = `${bookingData.selectedDate}-${timeWithMinutes}`;

    // Get current booked slots from Google Sheets
    const bookedSlots = await googleSheetsService.getBookedSlots();

    // Check if slot is already booked
    if (bookedSlots.includes(slotId)) {
      return NextResponse.json({ error: "This time slot is no longer available" }, { status: 409 });
    }

    // Add booking to Google Sheets
    const result = await googleSheetsService.addBooking(bookingData);

    if (!result.success) {
      if (result.conflict) {
        return NextResponse.json({ error: "This time slot is no longer available" }, { status: 409 });
      }
      return NextResponse.json({ error: "Failed to save booking" }, { status: 500 });
    }

    console.log("New booking saved.", { bookingId: result.bookingId });

    // Send confirmation email
    try {
      const emailData = { ...bookingData, bookingId: result.bookingId };
      const emailSent = await emailService.sendBookingConfirmation(emailData);
      if (emailSent) {
        console.log("Confirmation email sent.", { bookingId: result.bookingId });
      } else {
        console.log("Failed to send confirmation email.", { bookingId: result.bookingId });
        // Don't fail the booking if email fails
      }
    } catch (error) {
      console.error("Error sending confirmation email:", error, { bookingId: result.bookingId });
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
    // Return only booked slot identifiers to avoid exposing PII
    const bookedSlots = await googleSheetsService.getBookedSlots();

    return NextResponse.json({ bookedSlots }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("Error fetching booked slots:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
