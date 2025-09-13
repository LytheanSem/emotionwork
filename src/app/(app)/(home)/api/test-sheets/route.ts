import { googleSheetsService } from "@/lib/google-sheets";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const result = await googleSheetsService.testConnection();

    return NextResponse.json({
      success: result.success,
      error: result.error,
      sheetNames: result.sheetNames,
      environment: {
        hasSheetId: !!process.env.GOOGLE_SHEET_ID,
        hasServiceAccountEmail: !!process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        hasPrivateKey: !!process.env.GOOGLE_PRIVATE_KEY,
      },
    });
  } catch (error: unknown) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      environment: {
        hasSheetId: !!process.env.GOOGLE_SHEET_ID,
        hasServiceAccountEmail: !!process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        hasPrivateKey: !!process.env.GOOGLE_PRIVATE_KEY,
      },
    });
  }
}
