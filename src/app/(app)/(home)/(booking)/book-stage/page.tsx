"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCart } from "@/contexts/CartContext";
import { Calendar, CheckCircle, Lock, MapPin, Minus, Plus, ShoppingCart, Trash2, Upload, Users } from "lucide-react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { StageBookingConfirmation } from "./components/stage-booking-confirmation";
import { StageBookingForm } from "./components/stage-booking-form";
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
    eventDates: string[]; // Changed from eventDate to eventDates array
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
  const { cartItems, removeFromCart, updateQuantity, updateRentalType, getTotalPrice, getCartItemCount } = useCart();

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
          description:
            "Your stage booking request has been submitted. We&apos;ll review it and get back to you within 24 hours.",
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

  // Cart helper functions
  const handleQuantityChange = (item: any, newQuantity: number) => {
    updateQuantity(item.id, newQuantity);
  };

  const handleRentalTypeChange = (item: any, rentalType: "daily" | "weekly") => {
    const rentalDays = rentalType === "daily" ? 1 : 7;
    updateRentalType(item.id, rentalType, rentalDays);
  };

  const handleRentalDaysChange = (item: any, days: number) => {
    updateRentalType(item.id, item.rentalType, days);
  };

  const getItemPrice = (item: any) => {
    if (item.rentalType === "daily") {
      return item.dailyPrice * item.quantity * item.rentalDays;
    } else {
      const fullWeeks = Math.floor(item.rentalDays / 7);
      const remainingDays = item.rentalDays % 7;
      const weeklyPrice = item.weeklyPrice * item.quantity * fullWeeks;
      const dailyPrice = item.dailyPrice * item.quantity * remainingDays;
      return weeklyPrice + dailyPrice;
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
            Design and book your custom stage for events, concerts, and special occasions. Upload your design files and
            let us bring your vision to life.
          </p>
        </div>

        {/* Selected Equipment Section */}
        {cartItems.length > 0 && (
          <div className="max-w-6xl mx-auto mb-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5" />
                  Selected Equipment ({getCartItemCount()} items)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {cartItems.map((item) => (
                    <div key={item.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex gap-4">
                        {/* Equipment Image */}
                        <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                          {item.equipment.imageUrl ? (
                            <Image
                              src={item.equipment.imageUrl}
                              alt={item.equipment.name}
                              width={80}
                              height={80}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <span className="text-gray-400 text-2xl">×</span>
                            </div>
                          )}
                        </div>

                        {/* Equipment Details */}
                        <div className="flex-1">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h3 className="font-semibold text-gray-900">{item.equipment.name}</h3>
                              {item.equipment.brand && <p className="text-sm text-gray-500">{item.equipment.brand}</p>}
                            </div>
                            <Badge variant={item.equipment.status === "available" ? "default" : "secondary"}>
                              {item.equipment.status}
                            </Badge>
                          </div>

                          {/* Rental Options */}
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                            {/* Quantity */}
                            <div>
                              <label className="text-sm font-medium">Quantity</label>
                              <div className="flex items-center gap-2 mt-1">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleQuantityChange(item, item.quantity - 1)}
                                  disabled={item.quantity <= 1}
                                >
                                  <Minus className="h-3 w-3" />
                                </Button>
                                <span className="w-8 text-center">{item.quantity}</span>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleQuantityChange(item, item.quantity + 1)}
                                >
                                  <Plus className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>

                            {/* Rental Type */}
                            <div>
                              <label className="text-sm font-medium">Rental Type</label>
                              <select
                                value={item.rentalType}
                                onChange={(e) => handleRentalTypeChange(item, e.target.value as "daily" | "weekly")}
                                className="mt-1 w-full p-2 border border-gray-300 rounded-md"
                              >
                                <option value="daily">Daily</option>
                                <option value="weekly">Weekly</option>
                              </select>
                            </div>

                            {/* Rental Duration */}
                            <div>
                              <label className="text-sm font-medium">
                                {item.rentalType === "daily" ? "Days" : "Weeks"}
                              </label>
                              <input
                                type="number"
                                min="1"
                                value={item.rentalType === "daily" ? item.rentalDays : Math.ceil(item.rentalDays / 7)}
                                onChange={(e) => {
                                  const value = parseInt(e.target.value) || 1;
                                  const days = item.rentalType === "daily" ? value : value * 7;
                                  handleRentalDaysChange(item, days);
                                }}
                                className="mt-1 w-full p-2 border border-gray-300 rounded-md"
                              />
                            </div>
                          </div>

                          {/* Pricing */}
                          <div className="mt-4 flex justify-between items-center">
                            <div className="text-sm text-gray-600">
                              <span className="font-medium">
                                ${item.rentalType === "daily" ? item.dailyPrice : item.weeklyPrice}
                              </span>
                              <span className="text-gray-500"> per {item.rentalType === "daily" ? "day" : "week"}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-lg">${getItemPrice(item).toLocaleString()}</span>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => removeFromCart(item.id)}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Total Price */}
                <div className="mt-6 pt-4 border-t border-gray-200">
                  <div className="flex justify-between items-center text-lg font-semibold">
                    <span>Total Equipment Cost</span>
                    <span>${getTotalPrice().toLocaleString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

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
                <Button onClick={() => (window.location.href = "/sign-in")} className="w-full">
                  Sign In to Continue
                </Button>
              </CardContent>
            </Card>
          )}

          {currentStep === "form" && <StageBookingForm onSubmit={handleFormSubmit} />}

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
              <p className="text-sm text-gray-600">Upload your stage design files, blueprints, or inspiration images</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-0">
            <CardContent className="p-6 text-center">
              <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
                <MapPin className="h-5 w-5 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Location Planning</h3>
              <p className="text-sm text-gray-600">Specify your event location and we&apos;ll handle the logistics</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-0">
            <CardContent className="p-6 text-center">
              <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-purple-100">
                <Calendar className="h-5 w-5 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Flexible Scheduling</h3>
              <p className="text-sm text-gray-600">Choose your event date and time that works best for you</p>
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
                  <strong>1. Submit Request</strong>
                  <br />
                  Fill out the form with your event details and upload design files
                </div>
                <div>
                  <strong>2. Review Process</strong>
                  <br />
                  Our team reviews your request within 24 hours
                </div>
                <div>
                  <strong>3. Confirmation</strong>
                  <br />
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
