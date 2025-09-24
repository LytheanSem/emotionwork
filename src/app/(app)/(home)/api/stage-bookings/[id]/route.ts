import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getDb } from "@/lib/db";
import type { StageBooking } from "@/lib/db";
import { ObjectId } from "mongodb";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const db = await getDb();
    const { id: bookingId } = await params;

    if (!ObjectId.isValid(bookingId)) {
      return NextResponse.json(
        { error: "Invalid booking ID" },
        { status: 400 }
      );
    }

    const booking = await db
      .collection("stageBookings")
      .findOne({ _id: new ObjectId(bookingId) });


    if (!booking) {
      return NextResponse.json(
        { error: "Booking not found" },
        { status: 404 }
      );
    }

    // Check if user can access this booking
    const isAdmin = session.user.role === "admin" || session.user.isAdmin;
    const isOwner = booking.userEmail === session.user.email;

    if (!isAdmin && !isOwner) {
      return NextResponse.json(
        { error: "Access denied" },
        { status: 403 }
      );
    }

    // Ensure equipmentItems is a proper array
    if (booking.equipmentItems && !Array.isArray(booking.equipmentItems)) {
      booking.equipmentItems = [];
    }
    
    return NextResponse.json(booking);

  } catch (error) {
    console.error("Error fetching stage booking:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const db = await getDb();
    const { id: bookingId } = await params;

    if (!ObjectId.isValid(bookingId)) {
      return NextResponse.json(
        { error: "Invalid booking ID" },
        { status: 400 }
      );
    }

    // Check if user is admin
    const isAdmin = session.user.role === "admin" || session.user.isAdmin;
    
    if (!isAdmin) {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { status, adminNotes, estimatedCost } = body;

    // Validate status
    const validStatuses = ["pending", "approved", "rejected", "in_progress", "completed"];
    if (status && !validStatuses.includes(status)) {
      return NextResponse.json(
        { error: "Invalid status" },
        { status: 400 }
      );
    }

    const updateData: Partial<StageBooking> = {
      updatedAt: new Date(),
    };

    if (status) updateData.status = status;
    if (adminNotes !== undefined) updateData.adminNotes = adminNotes;
    if (estimatedCost !== undefined) updateData.estimatedCost = estimatedCost;

    const result = await db
      .collection("stageBookings")
      .updateOne(
        { _id: new ObjectId(bookingId) },
        { $set: updateData }
      );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: "Booking not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Booking updated successfully",
    });

  } catch (error) {
    console.error("Error updating stage booking:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const db = await getDb();
    const { id: bookingId } = await params;

    if (!ObjectId.isValid(bookingId)) {
      return NextResponse.json(
        { error: "Invalid booking ID" },
        { status: 400 }
      );
    }

    // Get the existing booking to check ownership and status
    const existingBooking = await db
      .collection("stageBookings")
      .findOne({ _id: new ObjectId(bookingId) });

    if (!existingBooking) {
      return NextResponse.json(
        { error: "Booking not found" },
        { status: 404 }
      );
    }

    // Check if user owns this booking
    if (existingBooking.userEmail !== session.user.email) {
      return NextResponse.json(
        { error: "Access denied" },
        { status: 403 }
      );
    }

    // Only allow editing if booking is still pending
    if (existingBooking.status !== "pending") {
      return NextResponse.json(
        { error: "Only pending bookings can be edited" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { userProfile, stageDetails, designFiles, equipmentItems } = body;

    // Validate required fields
    if (!userProfile?.firstName || !userProfile?.lastName || !userProfile?.phone) {
      return NextResponse.json(
        { error: "Missing required personal information" },
        { status: 400 }
      );
    }

    if (!stageDetails?.location || !stageDetails?.eventType || !stageDetails?.eventDates || stageDetails?.eventDates.length === 0 || !stageDetails?.eventTime) {
      return NextResponse.json(
        { error: "Missing required stage details" },
        { status: 400 }
      );
    }

    // Additional validation for stage details
    if (stageDetails.expectedGuests && (stageDetails.expectedGuests < 1 || stageDetails.expectedGuests > 10000)) {
      return NextResponse.json(
        { error: "Expected guests must be between 1 and 10,000" },
        { status: 400 }
      );
    }

    if (stageDetails.duration && (stageDetails.duration < 1 || stageDetails.duration > 24)) {
      return NextResponse.json(
        { error: "Duration must be between 1 and 24 hours" },
        { status: 400 }
      );
    }

    // Validate date format and future date for all dates
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (const dateStr of stageDetails.eventDates) {
      let eventDate: Date;
      try {
        eventDate = new Date(dateStr);
        if (isNaN(eventDate.getTime())) {
          throw new Error("Invalid date format");
        }
      } catch (error) {
        return NextResponse.json(
          { error: "Invalid event date format" },
          { status: 400 }
        );
      }

      if (eventDate < today) {
        return NextResponse.json(
          { error: "All event dates must be in the future" },
          { status: 400 }
        );
      }
    }

    // Prepare update data
    const updateData: Partial<StageBooking> = {
      userName: `${userProfile.firstName} ${userProfile.lastName}`,
      userProfile: {
        firstName: userProfile.firstName,
        lastName: userProfile.lastName,
        phone: userProfile.phone,
        company: userProfile.company || "",
        address: userProfile.address || "",
      },
      stageDetails: {
        location: stageDetails.location,
        eventType: stageDetails.eventType,
        eventDates: stageDetails.eventDates, // Changed from eventDate to eventDates array
        eventTime: stageDetails.eventTime,
        duration: stageDetails.duration || 4,
        expectedGuests: stageDetails.expectedGuests || 50,
        specialRequirements: stageDetails.specialRequirements || "",
      },
      designFiles: (designFiles || []).map((file: any) => ({
        filename: file.filename,
        originalName: file.originalName,
        url: file.url,
        publicId: file.publicId,
        mimeType: file.mimeType,
        size: file.size,
      })),
      equipmentItems: equipmentItems || [], // Include equipment items in update
      updatedAt: new Date(),
    };

    const result = await db
      .collection("stageBookings")
      .updateOne(
        { _id: new ObjectId(bookingId) },
        { $set: updateData }
      );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: "Booking not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Booking updated successfully",
    });

  } catch (error) {
    console.error("Error updating stage booking:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const db = await getDb();
    const { id: bookingId } = await params;

    if (!ObjectId.isValid(bookingId)) {
      return NextResponse.json(
        { error: "Invalid booking ID" },
        { status: 400 }
      );
    }

    // Check if user is admin
    const isAdmin = session.user.role === "admin" || session.user.isAdmin;
    
    if (!isAdmin) {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      );
    }

    const result = await db
      .collection("stageBookings")
      .deleteOne({ _id: new ObjectId(bookingId) });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: "Booking not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Booking deleted successfully",
    });

  } catch (error) {
    console.error("Error deleting stage booking:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
