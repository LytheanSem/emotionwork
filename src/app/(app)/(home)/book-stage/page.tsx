"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Lock, Upload, MapPin, Calendar, Users } from "lucide-react";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { StageBookingForm } from "./components/stage-booking-form";
import { StageBookingConfirmation } from "./components/stage-booking-confirmation";
import { stageBookingService } from "./services/stage-booking-service";

interface StageBookingFormData {
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
    duration: number;
    expectedGuests: number;
    specialRequirements?: string;
  };
  designFiles: File[];
}

type BookingStep = "auth" | "form" | "confirmation";

export default function BookStagePage() {
  const { status } = useSession();
  const [currentStep, setCurrentStep] = useState<BookingStep>("auth");
  const [bookingData, setBookingData] = useState<StageBookingFormData | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (status === "authenticated") {
      setCurrentStep("form");
    } else if (status === "unauthenticated") {
      setCurrentStep("auth");
    }
  }, [status]);

  const handleFormSubmit = (data: StageBookingFormData) => {
    setBookingData(data);
    setCurrentStep("confirmation");
  };

  const handleEditBooking = () => {
    setCurrentStep("form");
  };

  const handleConfirmBooking = async () => {
    if (!bookingData) return;

    setIsSubmitting(true);

    try {
      const result = await stageBookingService.submitBooking(bookingData);

      if (result.success) {
        toast.success("Stage Booking Submitted!", {
          description: "Your stage booking request has been submitted. We&apos;ll review it and get back to you within 24 hours.",
          duration: 5000,
        });

        // Reset to form
        setCurrentStep("form");
        setBookingData(null);
      } else {
        toast.error("Booking Failed", {
          description: result.error || "Please try again.",
          duration: 5000,
        });
      }
    } catch (error) {
      console.error("Stage booking failed:", error);
      toast.error("Booking Failed", {
        description: "Please try again.",
        duration: 5000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-lg text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Book a Stage</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Design and book your custom stage for events, concerts, and special occasions. 
            Upload your design files and let us bring your vision to life.
          </p>
        </div>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto">
          {currentStep === "auth" && (
            <Card className="max-w-md mx-auto">
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                  <Lock className="h-6 w-6 text-blue-600" />
                </div>
                <CardTitle className="text-xl">Authentication Required</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-gray-600 text-center">
                  Please sign in to book a stage. This helps us keep track of your bookings and provide better service.
                </p>
                <Button 
                  onClick={() => window.location.href = "/sign-in"} 
                  className="w-full"
                >
                  Sign In to Continue
                </Button>
              </CardContent>
            </Card>
          )}

          {currentStep === "form" && (
            <StageBookingForm onSubmit={handleFormSubmit} />
          )}

          {currentStep === "confirmation" && bookingData && (
            <StageBookingConfirmation
              bookingData={bookingData}
              onEdit={handleEditBooking}
              onConfirm={handleConfirmBooking}
              isLoading={isSubmitting}
            />
          )}
        </div>

        {/* Features Section */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-0">
            <CardContent className="p-6 text-center">
              <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                <Upload className="h-5 w-5 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Design Upload</h3>
              <p className="text-sm text-gray-600">
                Upload your stage design files, blueprints, or inspiration images
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-0">
            <CardContent className="p-6 text-center">
              <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
                <MapPin className="h-5 w-5 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Location Planning</h3>
              <p className="text-sm text-gray-600">
                Specify your event location and we&apos;ll handle the logistics
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-0">
            <CardContent className="p-6 text-center">
              <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-purple-100">
                <Calendar className="h-5 w-5 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Flexible Scheduling</h3>
              <p className="text-sm text-gray-600">
                Choose your event date and time that works best for you
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-0">
            <CardContent className="p-6 text-center">
              <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-orange-100">
                <Users className="h-5 w-5 text-orange-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Expert Support</h3>
              <p className="text-sm text-gray-600">
                Our team will review your request and provide professional guidance
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Process Information */}
        <div className="mt-12 text-center">
          <Card className="max-w-3xl mx-auto bg-gradient-to-r from-blue-50 to-purple-50 border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-center gap-2 mb-3">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <h3 className="text-lg font-semibold text-gray-900">How It Works</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                <div>
                  <strong>1. Submit Request</strong><br />
                  Fill out the form with your event details and upload design files
                </div>
                <div>
                  <strong>2. Review Process</strong><br />
                  Our team reviews your request within 24 hours
                </div>
                <div>
                  <strong>3. Confirmation</strong><br />
                  We&apos;ll contact you with pricing and next steps
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

