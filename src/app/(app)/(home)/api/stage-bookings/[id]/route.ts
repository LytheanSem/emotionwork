import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getDb } from "@/lib/db";
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
