"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar, Clock, Edit, Loader2, Mail, MessageSquare, Phone, User, X } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import EditBookingForm from "./components/edit-booking-form";

interface BookingRecord {
  bookingId: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  phoneNumber: string;
  email: string;
  dateTime: string;
  description?: string;
  confirmed?: boolean | string;
  completed?: boolean | string;
}

export default function ManageBookingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [bookingId, setBookingId] = useState("");
  const [email, setEmail] = useState("");
  const [booking, setBooking] = useState<BookingRecord | null>(null);
  const [loading, setLoading] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isRedirecting, setIsRedirecting] = useState(false);

  // Handle initial URL parameters - but immediately clear them for security
  useEffect(() => {
    const urlBookingId = searchParams.get("bookingId");
    const urlEmail = searchParams.get("email");

    if (urlBookingId && urlEmail) {
      // Set the form values
      setBookingId(urlBookingId);
      setEmail(urlEmail);

      // Immediately clear the URL for security
      router.replace("/manage-booking");

      // Auto-lookup the booking
      handleLookupFromURL(urlBookingId, urlEmail);
    }
  }, [searchParams, router]);

  // Auto-lookup function for URL parameters
  const handleLookupFromURL = async (id: string, email: string) => {
    setLoading(true);
    setError("");
    setSuccess("");
    setBooking(null);
    setEditing(false);

    try {
      const response = await fetch(
        `/api/booking-management?bookingId=${encodeURIComponent(id)}&email=${encodeURIComponent(email)}`
      );
      const data = await response.json();

      if (data.success) {
        setBooking(data.booking);
        toast.success("Booking Found!", {
          description: "Your booking details have been loaded.",
        });
      } else {
        setError(data.error || "Booking not found");
        toast.error("Booking Not Found", {
          description: data.error || "Please check your booking ID and email.",
        });
      }
    } catch {
      setError("Failed to fetch booking. Please try again.");
      toast.error("Lookup Failed", {
        description: "Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    setBooking(null);
    setEditing(false);

    try {
      const response = await fetch(
        `/api/booking-management?bookingId=${encodeURIComponent(bookingId)}&email=${encodeURIComponent(email)}`
      );
      const data = await response.json();

      if (data.success) {
        setBooking(data.booking);
        toast.success("Booking Found!", {
          description: "Your booking details have been loaded.",
        });
      } else {
        setError(data.error || "Booking not found");
        toast.error("Booking Not Found", {
          description: data.error || "Please check your booking ID and email.",
        });
      }
    } catch {
      setError("Failed to lookup booking. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!booking) return;

    setCancelling(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch("/api/booking-management", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          bookingId: booking.bookingId,
          email: booking.email,
          action: "cancel",
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Booking Cancelled!", {
          description: "Your booking has been successfully cancelled.",
        });
        setBooking(null);
        setBookingId("");
        setEmail("");
        setEditing(false);
      } else {
        setError(data.error || "Failed to cancel booking");
        toast.error("Cancellation Failed", {
          description: data.error || "Please try again.",
        });
      }
    } catch {
      setError("Failed to cancel booking. Please try again.");
    } finally {
      setCancelling(false);
    }
  };

  const handleEditSuccess = () => {
    // Set redirecting state to show loading
    setIsRedirecting(true);

    // Clear all state immediately
    setEditing(false);
    setBooking(null);
    setBookingId("");
    setEmail("");
    setError("");
    setSuccess("");
    setLoading(false);
    setCancelling(false);

    toast.success("Booking Updated!", {
      description: "Your booking has been successfully updated. Please look up your booking again to see the changes.",
    });

    // Use setTimeout to ensure state is cleared before redirect
    setTimeout(() => {
      router.replace("/manage-booking");
      router.refresh(); // Force refresh the page
      setIsRedirecting(false);
    }, 100);
  };

  // Show loading state when redirecting
  if (isRedirecting) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-lg text-gray-600">Redirecting...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Manage Your Booking</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Enter your booking ID and email to view, modify, or cancel your appointment.
          </p>
        </div>

        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-6 w-6" />
                Look Up Booking
              </CardTitle>
              <CardDescription>Enter the booking ID and email address from your confirmation email.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLookup} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="bookingId">Booking ID *</Label>
                  <Input
                    id="bookingId"
                    type="text"
                    placeholder="Enter your booking ID"
                    value={bookingId}
                    onChange={(e) => setBookingId(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Looking up booking...
                    </>
                  ) : (
                    "Look Up Booking"
                  )}
                </Button>
              </form>

              {error && (
                <Alert className="mt-4" variant="destructive">
                  <X className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {success && (
                <Alert className="mt-4" variant="default">
                  <AlertDescription className="text-green-600">{success}</AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {booking && !editing && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-6 w-6" />
                  Booking Details
                </CardTitle>
                <CardDescription>Review your booking information below.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-500">Name</Label>
                    <p className="text-lg">
                      {booking.firstName} {booking.middleName} {booking.lastName}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-500">Email</Label>
                    <p className="text-lg flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      {booking.email}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-500">Phone</Label>
                    <p className="text-lg flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      {booking.phoneNumber}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-500">Date & Time</Label>
                    <p className="text-lg flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      {booking.dateTime}
                    </p>
                  </div>
                </div>

                {booking.description && (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-500">Description</Label>
                    <p className="text-lg flex items-start gap-2">
                      <MessageSquare className="h-4 w-4 mt-1" />
                      {booking.description}
                    </p>
                  </div>
                )}

                <div className="pt-4 border-t">
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button onClick={() => setEditing(true)} className="flex-1">
                      <Edit className="mr-2 h-4 w-4" />
                      Edit Booking
                    </Button>
                    <Button onClick={handleCancel} variant="destructive" disabled={cancelling} className="flex-1">
                      {cancelling ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Cancelling...
                        </>
                      ) : (
                        <>
                          <X className="mr-2 h-4 w-4" />
                          Cancel Booking
                        </>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setBooking(null);
                        setBookingId("");
                        setEmail("");
                        setError("");
                        setSuccess("");
                        setEditing(false);
                      }}
                      className="flex-1"
                    >
                      Look Up Another Booking
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {booking && editing && (
            <div className="mt-6">
              <EditBookingForm booking={booking} onSuccess={handleEditSuccess} onCancel={() => setEditing(false)} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
