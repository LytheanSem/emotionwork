import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getDb, StageBooking } from "@/lib/db";
import { sanitizeInput } from "@/lib/utils";
import { validateRequestSize } from "@/lib/request-limiter";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Validate request size
    const sizeValidation = validateRequestSize(request);
    if (!sizeValidation.valid) {
      return NextResponse.json({ error: sizeValidation.error }, { status: 413 });
    }

    const body = await request.json();
    
    // Sanitize input data
    const sanitizedBody = sanitizeInput(body) as {
      userProfile: {
        firstName: string;
        lastName: string;
        phone: string;
        company?: string;
        address?: string;
      };
      stageDetails: {
        location: string;
        eventType: string;
        eventDate: string;
        eventTime: string;
        duration?: number;
        expectedGuests?: number;
        specialRequirements?: string;
      };
      designFiles: Array<{
        filename: string;
        originalName: string;
        url: string;
        publicId: string;
        mimeType: string;
        size: number;
      }>;
    };

    // Validate required fields
    const { userProfile, stageDetails, designFiles } = sanitizedBody;

    if (!userProfile?.firstName || !userProfile?.lastName || !userProfile?.phone) {
      return NextResponse.json(
        { error: "Missing required personal information" },
        { status: 400 }
      );
    }

    if (!stageDetails?.location || !stageDetails?.eventType || !stageDetails?.eventDate || !stageDetails?.eventTime) {
      return NextResponse.json(
        { error: "Missing required stage details" },
        { status: 400 }
      );
    }

    if (!designFiles || designFiles.length === 0) {
      return NextResponse.json(
        { error: "At least one design file is required" },
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

    // Validate date format and future date
    const eventDate = new Date(stageDetails.eventDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (isNaN(eventDate.getTime())) {
      return NextResponse.json(
        { error: "Invalid event date format" },
        { status: 400 }
      );
    }

    if (eventDate < today) {
      return NextResponse.json(
        { error: "Event date must be in the future" },
        { status: 400 }
      );
    }

    // Get database connection and user ID
    const database = await getDb();
    let dbUser = await database.collection("adminUsers").findOne({ email: session.user.email });
    if (!dbUser) {
      dbUser = await database.collection("managerUsers").findOne({ email: session.user.email });
    }
    if (!dbUser) {
      dbUser = await database.collection("regularUsers").findOne({ email: session.user.email });
    }

    // Create stage booking document
    const stageBooking: Omit<StageBooking, "_id"> = {
      userId: dbUser?._id?.toString() || session.user.id || "",
      userEmail: session.user.email,
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
        eventDate: stageDetails.eventDate,
        eventTime: stageDetails.eventTime,
        duration: stageDetails.duration || 4,
        expectedGuests: stageDetails.expectedGuests || 50,
        specialRequirements: stageDetails.specialRequirements || "",
      },
      designFiles: designFiles.map((file) => ({
        filename: file.filename,
        originalName: file.originalName,
        url: file.url,
        publicId: file.publicId,
        mimeType: file.mimeType,
        size: file.size,
      })),
      status: "pending",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Insert into database
    const result = await database.collection("stageBookings").insertOne(stageBooking);

    if (!result.insertedId) {
      return NextResponse.json(
        { error: "Failed to create stage booking" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      bookingId: result.insertedId.toString(),
      message: "Stage booking created successfully",
    });

  } catch (error) {
    console.error("Stage booking creation error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const database = await getDb();
    const url = new URL(request.url);
    const userId = url.searchParams.get("userId");

    // Check if user is admin
    const isAdmin = session.user.role === "admin" || session.user.isAdmin;

    let query = {};
    if (!isAdmin) {
      // Regular users can only see their own bookings
      query = { userEmail: session.user.email };
    } else if (userId) {
      // Admin can filter by specific user
      query = { userEmail: userId };
    }

    const bookings = await database
      .collection("stageBookings")
      .find(query)
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json({
      success: true,
      bookings: bookings,
      count: bookings.length
    });

  } catch (error) {
    console.error("Error fetching stage bookings:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}