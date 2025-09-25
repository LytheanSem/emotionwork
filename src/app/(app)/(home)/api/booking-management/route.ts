// CSRF protection removed for simplicity - not needed for contact info collection
import { emailService } from "@/lib/email-service";
import { googleSheetsService } from "@/lib/google-sheets";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { validateRequestSize } from "@/lib/request-limiter";
import { zoomService } from "@/lib/zoom-service";
import { NextRequest, NextResponse } from "next/server";

interface BookingManagementRequest {
  bookingId: string;
  email: string;
  action: string;
  updatedData?: {
    firstName: string;
    lastName: string;
    phoneNumber: string;
    email: string;
    selectedDate: string;
    selectedTime: string;
    middleName?: string;
    description?: string;
    meetingType: "in-person" | "online";
    meetingLink?: string;
  };
}

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

    // CSRF protection removed - not needed for contact info collection

    let body: BookingManagementRequest;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ success: false, error: "Invalid JSON payload" }, { status: 400 });
    }

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
          console.log("Booking cancelled by user");
          // Note: We'll need to create a cancellation email template
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
      const {
        firstName,
        lastName,
        phoneNumber,
        email: newEmail,
        selectedDate,
        selectedTime,
        meetingType,
      } = updatedData;
      if (!firstName || !lastName || !phoneNumber || !newEmail || !selectedDate || !selectedTime || !meetingType) {
        return NextResponse.json({ success: false, error: "All required fields must be provided" }, { status: 400 });
      }

      // Enforce allowed meeting types and ignore any client-supplied meetingLink
      const allowedMeetingTypes = new Set<"in-person" | "online">(["in-person", "online"]);
      if (!allowedMeetingTypes.has(meetingType)) {
        return NextResponse.json({ success: false, error: "Invalid meetingType" }, { status: 400 });
      }

      // Only the server sets meetingLink for online meetings
      if (meetingType !== "online" && "meetingLink" in updatedData) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        delete (updatedData as any).meetingLink;
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(newEmail)) {
        return NextResponse.json({ success: false, error: "Invalid email format" }, { status: 400 });
      }

      // Validate phone
      const normalizedPhone = phoneNumber.replace(/[^\d+]/g, "");
      const phoneRegex = /^\+?[1-9]\d{1,14}$/;
      if (!phoneRegex.test(normalizedPhone)) {
        return NextResponse.json({ success: false, error: "Invalid phone number" }, { status: 400 });
      }

      // Apply creation-time business rules on update (past-day/weekend/blocked dates)
      const dayDate = new Date(updatedData.selectedDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      dayDate.setHours(0, 0, 0, 0);

      // Past-day/same-day booking check
      if (dayDate <= today) {
        return NextResponse.json(
          { success: false, error: "Same-day or past-date bookings are not allowed" },
          { status: 400 }
        );
      }

      // Weekend booking check
      const dow = dayDate.getDay();
      if (dow === 0 || dow === 6) {
        return NextResponse.json({ success: false, error: "Weekend bookings are not allowed" }, { status: 400 });
      }

      // Blocked dates check
      try {
        const blockedDates = await googleSheetsService.getBlockedDates();
        if (blockedDates.includes(updatedData.selectedDate)) {
          return NextResponse.json({ success: false, error: "Selected date is blocked" }, { status: 400 });
        }
      } catch (error) {
        console.warn("Could not check blocked dates:", error);
        // Continue with update - don't fail for this
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

      // Handle Zoom meeting updates for online meetings
      if (updatedData.meetingType === "online") {
        try {
          // Get current booking to check if it was an online meeting
          const currentBooking = await googleSheetsService.findBookingByIdAndEmail(bookingId, email);

          if (currentBooking.success && currentBooking.booking) {
            // Check if the current booking was also an online meeting
            const currentMeetingType = currentBooking.booking.meetingType;
            const currentMeetingLink = currentBooking.booking.meetingLink;

            if (currentMeetingType === "online" && currentMeetingLink) {
              // Extract meeting ID from the current meeting link
              const meetingIdMatch = currentMeetingLink.match(/\/j\/(\d+)/);
              if (meetingIdMatch) {
                const oldMeetingId = meetingIdMatch[1];

                // Delete the old Zoom meeting
                console.log("Deleting old Zoom meeting");
                const deleteResult = await zoomService.deleteMeeting(oldMeetingId);

                if (!deleteResult.success) {
                  console.warn("Failed to delete old Zoom meeting");
                  // Continue with update - don't fail the entire process
                }
              }
            }

            // Create new Zoom meeting for the updated time
            console.log("Creating new Zoom meeting for updated booking");

            try {
              // Add timeout to prevent hanging requests
              const zoomPromise = zoomService.createInstantMeeting(updatedData);
              const timeoutPromise = new Promise((_, reject) =>
                setTimeout(() => reject(new Error("Zoom API timeout")), 10000)
              );

              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              const zoomResult = (await Promise.race([zoomPromise, timeoutPromise])) as any;

              if (
                zoomResult.success &&
                zoomResult.meetingData &&
                /^https:\/\/.*/.test(zoomResult.meetingData.joinUrl)
              ) {
                updatedData.meetingLink = zoomResult.meetingData.joinUrl;
                console.log("New Zoom meeting created successfully");
              } else {
                console.error("Failed to create new Zoom meeting or invalid URL");
                // Continue with update but without meeting link
                updatedData.meetingLink = "";
              }
            } catch (error) {
              console.error("Error creating new Zoom meeting:", error);
              // Continue with update but without meeting link
              updatedData.meetingLink = "";
            }
          }
        } catch (error) {
          console.error("Error handling Zoom meeting update:", error);
          // Continue with update - don't fail the entire process
          updatedData.meetingLink = "";
        }
      } else if (updatedData.meetingType === "in-person") {
        // If changing from online to in-person, delete the old Zoom meeting
        try {
          const currentBooking = await googleSheetsService.findBookingByIdAndEmail(bookingId, email);

          if (currentBooking.success && currentBooking.booking) {
            const currentMeetingType = currentBooking.booking.meetingType;
            const currentMeetingLink = currentBooking.booking.meetingLink;

            if (currentMeetingType === "online" && currentMeetingLink) {
              // Extract meeting ID from the current meeting link
              const meetingIdMatch = currentMeetingLink.match(/\/j\/(\d+)/);
              if (meetingIdMatch) {
                const oldMeetingId = meetingIdMatch[1];

                // Delete the old Zoom meeting
                console.log("Deleting old Zoom meeting");
                const deleteResult = await zoomService.deleteMeeting(oldMeetingId);

                if (!deleteResult.success) {
                  console.warn("Failed to delete old Zoom meeting");
                  // Continue with update - don't fail the entire process
                }
              }
            }
          }
        } catch (error) {
          console.error("Error deleting Zoom meeting when changing to in-person:", error);
          // Continue with update - don't fail the entire process
        }

        // Clear the meeting link
        updatedData.meetingLink = "";
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
      } catch (error) {
        console.error("Error sending updated confirmation email:", error);
        // Don't fail the update if email fails
      }

      console.log("Booking updated and confirmation email sent successfully");
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
