// CSRF protection removed for simplicity - not needed for contact info collection
import { emailService } from "@/lib/email-service";
import { googleSheetsService } from "@/lib/google-sheets";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { validateRequestSize } from "@/lib/request-limiter";
import { zoomService } from "@/lib/zoom-service";
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
  meetingType: "in-person" | "online";
  meetingLink?: string;
}

export async function POST(request: NextRequest) {
  try {
    // Check request size
    const sizeValidation = validateRequestSize(request);
    if (!sizeValidation.valid) {
      return NextResponse.json({ error: sizeValidation.error }, { status: 413 });
    }

    // CSRF protection removed - not needed for contact info collection

    // Basic rate limiting (10 requests per 15 minutes per IP)
    const ip = getClientIp(request);
    if (!checkRateLimit(ip, { windowMs: 15 * 60 * 1000, max: 10 })) {
      return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 });
    }

    let bookingData: BookingData;
    try {
      bookingData = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 });
    }

    // Validate required fields
    if (
      !bookingData.firstName ||
      !bookingData.lastName ||
      !bookingData.email ||
      !bookingData.phoneNumber ||
      !bookingData.selectedDate ||
      !bookingData.selectedTime ||
      !bookingData.meetingType
    ) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Enforce allowed meeting types and ignore any client-supplied meetingLink
    const allowedMeetingTypes = new Set<BookingData["meetingType"]>(["in-person", "online"]);
    if (!allowedMeetingTypes.has(bookingData.meetingType)) {
      return NextResponse.json({ error: "Invalid meetingType" }, { status: 400 });
    }

    // Only the server sets meetingLink for online meetings
    if (bookingData.meetingType !== "online" && "meetingLink" in bookingData) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (bookingData as any).meetingLink;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(bookingData.email)) {
      return NextResponse.json({ error: "Invalid email format" }, { status: 400 });
    }

    // Validate phone format
    const phone = bookingData.phoneNumber?.replace(/[^\d+]/g, "");
    if (!/^\+?[1-9]\d{1,14}$/.test(phone)) {
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
      const blockedDates = await googleSheetsService.getBlockedDates();
      if (blockedDates.includes(bookingData.selectedDate)) {
        return NextResponse.json({ error: "Selected date is blocked" }, { status: 400 });
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

    // Create Zoom meeting for online bookings
    if (bookingData.meetingType === "online") {
      try {
        // Add timeout to prevent hanging requests
        const zoomPromise = zoomService.createInstantMeeting(bookingData);
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Zoom API timeout")), 10000)
        );

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const zoomResult = (await Promise.race([zoomPromise, timeoutPromise])) as any;

        if (zoomResult.success && zoomResult.meetingData && /^https:\/\/.*/.test(zoomResult.meetingData.joinUrl)) {
          bookingData.meetingLink = zoomResult.meetingData.joinUrl;
        } else {
          console.error("Failed to create Zoom meeting or invalid URL");
          // Continue with booking but without meeting link
          bookingData.meetingLink = "";
        }
      } catch (error) {
        console.error("Error creating Zoom meeting:", error);
        // Continue with booking but without meeting link
        bookingData.meetingLink = "";
      }
    }

    // Add booking to Google Sheets
    const result = await googleSheetsService.addBooking(bookingData);

    if (!result.success) {
      if (result.conflict) {
        return NextResponse.json({ error: "This time slot is no longer available" }, { status: 409 });
      }
      return NextResponse.json({ error: "Failed to save booking" }, { status: 500 });
    }

    console.log("New booking saved successfully");

    // Send confirmation email
    try {
      const emailData = { ...bookingData, bookingId: result.bookingId };
      const emailSent = await emailService.sendBookingConfirmation(emailData);
      if (emailSent) {
        console.log("Confirmation email sent successfully");
      } else {
        console.log("Failed to send confirmation email");
        // Don't fail the booking if email fails
      }
    } catch {
      console.error("Error sending confirmation email");
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
