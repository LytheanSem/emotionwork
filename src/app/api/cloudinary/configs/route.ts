import { authOptions } from "@/lib/auth";
import { cloudinaryService } from "@/lib/cloudinary";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const configs = cloudinaryService.getAvailableConfigs();

    return NextResponse.json({
      success: true,
      configs: configs,
      count: configs.length,
    });
  } catch (error) {
    console.error("Get configs error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
