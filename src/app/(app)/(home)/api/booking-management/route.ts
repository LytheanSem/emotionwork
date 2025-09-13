import { emailService } from "@/lib/email-service";
import { googleSheetsService } from "@/lib/google-sheets";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { validateRequestSize } from "@/lib/request-limiter";
import { NextRequest, NextResponse } from "next/server";

// Rate limiting is now handled by the shared utility

// GET - Look up booking by ID and email
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const bookingId = searchParams.get("bookingId");
    const email = searchParams.get("email");

    if (!bookingId || !email) {
      return NextResponse.json({ success: false, error: "Booking ID and email are required" }, { status: 400 });
    }

    // Basic input validation
    if (bookingId.length > 100 || email.length > 100) {
      return NextResponse.json({ success: false, error: "Invalid input" }, { status: 400 });
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ success: false, error: "Invalid email format" }, { status: 400 });
    }

    // Rate limiting
    const ip = getClientIp(request);
    if (!checkRateLimit(ip, { windowMs: 15 * 60 * 1000, max: 10 })) {
      return NextResponse.json(
        { success: false, error: "Too many requests. Please try again later." },
        { status: 429 }
      );
    }

    // Find the booking
    const result = await googleSheetsService.findBookingByIdAndEmail(bookingId, email);

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error || "Booking not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      booking: result.booking,
    });
  } catch (error: unknown) {
    console.error("Booking lookup error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

// POST - Cancel booking
export async function POST(request: NextRequest) {
  try {
    // Check request size
    const sizeValidation = validateRequestSize(request);
    if (!sizeValidation.valid) {
      return NextResponse.json({ success: false, error: sizeValidation.error }, { status: 413 });
    }

    const body = await request.json();
    const { bookingId, email, action } = body;

    if (!bookingId || !email || !action) {
      return NextResponse.json(
        { success: false, error: "Booking ID, email, and action are required" },
        { status: 400 }
      );
    }

    // Basic input validation
    if (bookingId.length > 100 || email.length > 100) {
      return NextResponse.json({ success: false, error: "Invalid input" }, { status: 400 });
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ success: false, error: "Invalid email format" }, { status: 400 });
    }

    // Rate limiting
    const ip = getClientIp(request);
    if (!checkRateLimit(ip, { windowMs: 15 * 60 * 1000, max: 10 })) {
      return NextResponse.json(
        { success: false, error: "Too many requests. Please try again later." },
        { status: 429 }
      );
    }

    if (action === "cancel") {
      // Cancel the booking
      const result = await googleSheetsService.cancelBooking(bookingId, email);

      if (!result.success) {
        return NextResponse.json(
          { success: false, error: result.error || "Failed to cancel booking" },
          { status: 400 }
        );
      }

      // Send cancellation confirmation email
      try {
        const booking = await googleSheetsService.findBookingByIdAndEmail(bookingId, email);
        if (booking.success && booking.booking) {
          // Note: We'll need to create a cancellation email template
          console.log(`Booking ${bookingId} cancelled by user`);
        }
      } catch (error) {
        console.error("Error sending cancellation email:", error);
        // Don't fail the cancellation if email fails
      }

      return NextResponse.json({
        success: true,
        message: "Booking cancelled successfully",
      });
    }

    if (action === "update") {
      // Update the booking
      const { updatedData } = body;

      if (!updatedData) {
        return NextResponse.json({ success: false, error: "Updated booking data is required" }, { status: 400 });
      }

      // Validate required fields
      const { firstName, lastName, phoneNumber, email: newEmail, selectedDate, selectedTime } = updatedData;
      if (!firstName || !lastName || !phoneNumber || !newEmail || !selectedDate || !selectedTime) {
        return NextResponse.json({ success: false, error: "All required fields must be provided" }, { status: 400 });
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(newEmail)) {
        return NextResponse.json({ success: false, error: "Invalid email format" }, { status: 400 });
      }

      // Validate phone
      const normalizedPhone = phoneNumber.replace(/[\s\-\(\)]/g, "");
      const phoneRegex = /^\+?[1-9]\d{0,15}$/;
      if (!phoneRegex.test(normalizedPhone)) {
        return NextResponse.json({ success: false, error: "Invalid phone number" }, { status: 400 });
      }

      // Enforce availability server-side (allow same slot)
      const normalizedTime = selectedTime.replace(/\s/g, "");
      const newSlotId = `${selectedDate}-${normalizedTime}`;

      try {
        const currentBooking = await googleSheetsService.findBookingByIdAndEmail(bookingId, email);
        if (currentBooking.success && currentBooking.booking) {
          // Extract current slot ID from the dateTime field
          const currentDateTime = currentBooking.booking.dateTime;
          const currentSlotId = currentDateTime.split(" ")[0] + "-" + currentDateTime.split(" ")[1].replace(/\s/g, "");

          // Only check availability if changing to a different slot
          if (newSlotId !== currentSlotId) {
            const bookedSlots = await googleSheetsService.getBookedSlots();
            if (bookedSlots.includes(newSlotId)) {
              return NextResponse.json(
                { success: false, error: "This time slot is no longer available" },
                { status: 409 }
              );
            }
          }
        }
      } catch (error) {
        console.warn("Could not verify slot availability:", error);
        // Continue with update - don't fail the request for this
      }

      // Update the booking
      const result = await googleSheetsService.updateBooking(bookingId, email, updatedData);

      if (!result.success) {
        return NextResponse.json(
          { success: false, error: result.error || "Failed to update booking" },
          { status: 400 }
        );
      }

      // Send updated confirmation email
      try {
        await emailService.sendBookingConfirmation({
          ...updatedData,
          bookingId: bookingId,
        });
        console.log(`Booking ${bookingId} updated and confirmation email sent`);
      } catch (error) {
        console.error("Error sending updated confirmation email:", error);
        // Don't fail the update if email fails
      }

      return NextResponse.json({
        success: true,
        message: "Booking updated successfully",
      });
    }

    return NextResponse.json({ success: false, error: "Invalid action" }, { status: 400 });
  } catch (error: unknown) {
    console.error("Booking management error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
