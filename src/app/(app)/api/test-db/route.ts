import { getSafePayload } from "@/lib/db-wrapper";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    console.log("Testing database connection...");

    const payload = await getSafePayload();

    if (!payload) {
      return NextResponse.json(
        {
          success: false,
          error: "Database connection failed",
        },
        { status: 500 }
      );
    }

    console.log("Payload instance:", typeof payload);
    console.log("Payload methods:", Object.getOwnPropertyNames(payload));

    // Try to use PayloadCMS API to find equipment
    try {
      const equipment = await payload.find({
        collection: "equipment",
        limit: 1,
      });

      return NextResponse.json({
        success: true,
        message: "Database connected successfully via PayloadCMS",
        equipmentCount: equipment.totalDocs,
        payloadType: typeof payload,
      });
    } catch (payloadError) {
      console.error("PayloadCMS query error:", payloadError);
      return NextResponse.json(
        {
          success: false,
          error: "PayloadCMS query failed",
          payloadError:
            payloadError instanceof Error
              ? payloadError.message
              : "Unknown error",
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Database test error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}
