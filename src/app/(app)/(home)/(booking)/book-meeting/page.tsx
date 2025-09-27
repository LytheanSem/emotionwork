"use client";

import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { BookingConfirmation } from "./components/booking-confirmation";
import { BookingForm } from "./components/booking-form";
import { bookingService } from "./services/booking-service";

interface BookingFormData {
  firstName: string;
  middleName: string;
  lastName: string;
  phoneNumber: string;
  email: string;
  description: string;
  selectedDate: string;
  selectedTime: string;
  meetingType: "in-person" | "online";
  meetingLink?: string;
}

type BookingStep = "form" | "confirmation";

export default function BookMeetingPage() {
  const [currentStep, setCurrentStep] = useState<BookingStep>("form");
  const [bookingData, setBookingData] = useState<BookingFormData | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFormSubmit = (data: BookingFormData) => {
    setBookingData(data);
    setCurrentStep("confirmation");
  };

  const handleBookingSuccess = () => {
    // Booking successful - no need to log sensitive data
    // You can add additional success handling here
  };

  const handleEditBooking = () => {
    setCurrentStep("form");
  };

  const handleConfirmBooking = async () => {
    if (!bookingData) return;

    setIsSubmitting(true);

    try {
      // Submit booking to API
      const result = await bookingService.submitBooking(bookingData);

      if (result.success) {
        // Show success toast
        toast.success("Booking Confirmed!", {
          description: "You will receive a confirmation email shortly.",
          duration: 5000,
        });

        // Call success callback if provided
        if (result.bookingId) {
          handleBookingSuccess();
        }

        // Reset to form
        setCurrentStep("form");
        setBookingData(null);
      } else {
        // Show error toast
        toast.error("Booking Failed", {
          description: result.error || "Please try again.",
          duration: 5000,
        });
      }
    } catch (error) {
      console.error("Booking failed:", error);
      toast.error("Booking Failed", {
        description: "Please try again.",
        duration: 5000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Book a Meeting</h1>
          <p className="text-lg text-cyan-100/80 max-w-2xl mx-auto">
            Schedule a consultation with our team. We&apos;re here to help you with your project needs.
          </p>
        </div>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto">
          {currentStep === "form" && <BookingForm onSubmit={handleFormSubmit} />}

          {currentStep === "confirmation" && bookingData && (
            <BookingConfirmation
              bookingData={bookingData}
              onEdit={handleEditBooking}
              onConfirm={handleConfirmBooking}
              isLoading={isSubmitting}
            />
          )}
        </div>

        {/* Footer Information */}
        <div className="mt-12 text-center">
          <Card className="max-w-2xl mx-auto bg-gradient-to-r from-blue-50 to-purple-50 border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-center gap-2 mb-3">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <h3 className="text-lg font-semibold text-gray-900">Simple & Reliable</h3>
              </div>
              <p className="text-sm text-gray-600">
                Our booking system automatically manages availability and provides instant confirmation. Available 7 AM
                to 7 PM with 1-hour appointment slots.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
