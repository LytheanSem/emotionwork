import { authOptions } from "@/lib/auth";
import { getDb, StageBooking } from "@/lib/db";
import { calculateEquipmentPricing } from "@/lib/pricing-service";
import { validateRequestSize } from "@/lib/request-limiter";
import { parseLocalDate, sanitizeInput } from "@/lib/utils";
import { ObjectId } from "mongodb";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
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
        eventDates: string[]; // Changed from eventDate to eventDates array
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
      equipmentItems?: Array<{
        id: string;
        equipment: {
          _id?: string; // Only equipment ID is trusted from client
          id?: string; // Handle both _id and id fields
          name?: string; // For error messages
        };
        quantity: number;
        rentalType: "daily" | "weekly";
        rentalDays: number;
        // NO PRICING DATA ACCEPTED FROM CLIENT - server computes all prices
      }>;
    };

    // Validate required fields
    const { userProfile, stageDetails, designFiles, equipmentItems } = sanitizedBody;

    // Calculate server-side pricing for equipment items (ignore client prices)
    let processedEquipmentItems: any[] = [];
    if (equipmentItems && equipmentItems.length > 0) {
      try {
        // Validate that all equipment items have valid IDs
        for (const item of equipmentItems) {
          if (!item.equipment._id && !item.equipment.id) {
            throw new Error(`Equipment ID is missing for item: ${item.equipment.name || "Unknown"}`);
          }
        }

        const pricingCalculations = await calculateEquipmentPricing(
          equipmentItems.map((item) => ({
            equipmentId: item.equipment._id || item.equipment.id!,
            quantity: item.quantity,
            rentalType: item.rentalType,
            rentalDays: item.rentalDays,
          }))
        );

        // Fetch equipment details from database for each item
        const db = await getDb();
        if (!db) {
          throw new Error("Database connection failed");
        }

        processedEquipmentItems = await Promise.all(
          equipmentItems.map(async (item, index) => {
            // Get the equipment ID (handle both _id and id fields)
            const equipmentId = item.equipment._id || item.equipment.id;

            // Fetch equipment details from database (never trust client data)
            const equipment = await db.collection("equipment").findOne({
              _id: new ObjectId(equipmentId),
            });

            if (!equipment) {
              throw new Error(`Equipment not found: ${equipmentId}`);
            }

            const calculation = pricingCalculations[index];

            return {
              id: item.id,
              equipment: {
                _id: equipment._id.toString(),
                name: equipment.name,
                category: equipment.categoryId || "Uncategorized",
                imageUrl: equipment.imageUrl,
              },
              quantity: item.quantity,
              rentalType: item.rentalType,
              rentalDays: item.rentalDays,
              // Server-computed pricing (never trust client prices)
              dailyPrice: calculation.dailyPrice,
              weeklyPrice: calculation.weeklyPrice,
              totalPrice: calculation.totalPrice,
              // Audit trail
              priceAtBooking: calculation.priceAtBooking,
            };
          })
        );
      } catch (error) {
        console.error("Error calculating equipment pricing:", error);
        return NextResponse.json({ error: "Failed to calculate equipment pricing" }, { status: 400 });
      }
    }

    if (!userProfile?.firstName || !userProfile?.lastName || !userProfile?.phone) {
      return NextResponse.json({ error: "Missing required personal information" }, { status: 400 });
    }

    if (
      !stageDetails?.location ||
      !stageDetails?.eventType ||
      !stageDetails?.eventDates ||
      stageDetails?.eventDates.length === 0 ||
      !stageDetails?.eventTime
    ) {
      return NextResponse.json({ error: "Missing required stage details" }, { status: 400 });
    }

    // Design files are now optional - no validation needed

    // Additional validation for stage details
    if (stageDetails.expectedGuests && (stageDetails.expectedGuests < 1 || stageDetails.expectedGuests > 10000)) {
      return NextResponse.json({ error: "Expected guests must be between 1 and 10,000" }, { status: 400 });
    }

    if (stageDetails.duration && (stageDetails.duration < 1 || stageDetails.duration > 24)) {
      return NextResponse.json({ error: "Duration must be between 1 and 24 hours" }, { status: 400 });
    }

    // Validate date format and future date using local date parsing for all dates
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (const dateStr of stageDetails.eventDates) {
      let eventDate: Date;
      try {
        eventDate = parseLocalDate(dateStr);
      } catch (error) {
        return NextResponse.json(
          { error: `Invalid event date format: ${error instanceof Error ? error.message : "Unknown error"}` },
          { status: 400 }
        );
      }

      if (eventDate < today) {
        return NextResponse.json({ error: "All event dates must be in the future" }, { status: 400 });
      }
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
        eventDates: stageDetails.eventDates, // Changed from eventDate to eventDates array
        eventTime: stageDetails.eventTime,
        duration: stageDetails.duration || 4,
        expectedGuests: stageDetails.expectedGuests || 50,
        specialRequirements: stageDetails.specialRequirements || "",
      },
      designFiles: (designFiles || []).map((file) => ({
        filename: file.filename,
        originalName: file.originalName,
        url: file.url,
        publicId: file.publicId,
        mimeType: file.mimeType,
        size: file.size,
      })),
      equipmentItems: processedEquipmentItems,
      status: "pending",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Insert into database
    const result = await database.collection("stageBookings").insertOne(stageBooking);

    if (!result.insertedId) {
      return NextResponse.json({ error: "Failed to create stage booking" }, { status: 500 });
    }

    const bookingId = result.insertedId.toString();

    return NextResponse.json({
      success: true,
      bookingId: bookingId,
      message: "Stage booking created successfully",
    });
  } catch (error) {
    console.error("Stage booking creation error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
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

    const bookings = await database.collection("stageBookings").find(query).sort({ createdAt: -1 }).toArray();

    return NextResponse.json({
      success: true,
      bookings: bookings,
      count: bookings.length,
    });
  } catch (error) {
    console.error("Error fetching stage bookings:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
