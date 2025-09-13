import { emailService } from "@/lib/email-service";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Test email connection
    const connectionTest = await emailService.testConnection();

    return NextResponse.json({
      success: connectionTest,
      message: connectionTest ? "Email service is configured correctly" : "Email service configuration failed",
      environment: {
        hasEmailUser: !!process.env.EMAIL_USER,
        hasEmailPass: !!process.env.EMAIL_PASS,
      },
    });
  } catch (error: unknown) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      environment: {
        hasEmailUser: !!process.env.EMAIL_USER,
        hasEmailPass: !!process.env.EMAIL_PASS,
      },
    });
  }
}

export async function POST() {
  try {
    // Test sending a sample email
    const testBooking = {
      firstName: "Test",
      lastName: "User",
      phoneNumber: "1234567890",
      email: process.env.EMAIL_USER || "test@example.com", // Send to yourself for testing
      selectedDate: "2025-09-12",
      selectedTime: "10:00 AM",
      description: "This is a test email to verify the email service is working correctly.",
    };

    const emailSent = await emailService.sendBookingConfirmation(testBooking);

    return NextResponse.json({
      success: emailSent,
      message: emailSent ? "Test email sent successfully" : "Failed to send test email",
      testEmail: process.env.EMAIL_USER,
    });
  } catch (error: unknown) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
