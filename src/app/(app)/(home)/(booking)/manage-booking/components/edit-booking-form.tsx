"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { Edit, Loader2, MapPin, Video, X } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { BookingData, bookingService } from "../../book-meeting/services/booking-service";

interface EditBookingFormProps {
  booking: {
    bookingId: string;
    firstName: string;
    middleName?: string;
    lastName: string;
    phoneNumber: string;
    email: string;
    dateTime: string;
    description?: string;
    meetingType?: string;
    meetingLink?: string;
  };
  onSuccess: () => void;
  onCancel: () => void;
}

interface AvailableSlot {
  date: string;
  timeSlots: string[];
}

export default function EditBookingForm({ booking, onSuccess, onCancel }: EditBookingFormProps) {
  const [formData, setFormData] = useState({
    firstName: booking.firstName,
    middleName: booking.middleName || "",
    lastName: booking.lastName,
    phoneNumber: booking.phoneNumber,
    email: booking.email,
    description: booking.description || "",
    selectedDate: "",
    selectedTime: "",
    meetingType: (booking.meetingType as "in-person" | "online") || "in-person",
    meetingLink: booking.meetingLink || "",
  });

  const [availableSlots, setAvailableSlots] = useState<AvailableSlot[]>([]);
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);
  const [blockedDates, setBlockedDates] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);

  // Parse current booking date and time
  useEffect(() => {
    const parseCurrentDateTime = () => {
      try {
        // Parse the dateTime string to extract date and time
        // Format: "Monday, September 15, 2025 at 8:00 AM"
        const timeMatch = booking.dateTime.match(/(\d{1,2}:\d{2} [AP]M)$/);
        const time = timeMatch ? timeMatch[1] : "";

        // Extract date part and convert to YYYY-MM-DD format
        const dateMatch = booking.dateTime.match(/(\w+), (\w+) (\d+), (\d+)/);
        if (dateMatch) {
          const [, , month, day, year] = dateMatch;
          const monthMap: { [key: string]: string } = {
            January: "01",
            February: "02",
            March: "03",
            April: "04",
            May: "05",
            June: "06",
            July: "07",
            August: "08",
            September: "09",
            October: "10",
            November: "11",
            December: "12",
          };
          const monthNum = monthMap[month] || "01";
          const dayNum = day.padStart(2, "0");
          const date = `${year}-${monthNum}-${dayNum}`;

          setFormData((prev) => ({
            ...prev,
            selectedDate: date,
            selectedTime: time,
          }));

          // Also set the calendar selected date
          setSelectedDate(new Date(`${year}-${monthNum}-${dayNum}`));
        } else {
          console.warn("Could not parse booking date:", booking.dateTime);
        }
      } catch (error) {
        console.error("Error parsing booking date:", error);
      }
    };

    parseCurrentDateTime();
  }, [booking.dateTime]);

  // Load available slots
  useEffect(() => {
    const loadAvailableSlots = async () => {
      setLoading(true);
      try {
        console.log("Loading available slots...");
        const response = await bookingService.getAvailableSlots();
        setAvailableSlots(response.availableSlots || []);
        setBookedSlots(response.bookedSlots || []);
      } catch (error) {
        console.error("Error loading available slots:", error);
        setError("Failed to load available time slots");
      } finally {
        setLoading(false);
      }
    };

    const loadBlockedDates = async () => {
      try {
        const response = await fetch(`/api/blocked-dates?t=${Date.now()}`);
        const data = await response.json();
        if (data.success) {
          setBlockedDates(data.blockedDates);
        }
      } catch (error) {
        console.error("Failed to load blocked dates:", error);
      }
    };

    loadAvailableSlots();
    loadBlockedDates();
  }, []);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Helper function to check if a date should be disabled
  const isDateDisabled = (date: Date): boolean => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time to start of day

    const checkDate = new Date(date);
    checkDate.setHours(0, 0, 0, 0); // Reset time to start of day

    // Disable past dates and today (no same-day booking)
    if (checkDate <= today) {
      return true;
    }

    // Disable weekends (Saturday = 6, Sunday = 0)
    const dayOfWeek = checkDate.getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      return true;
    }

    // Disable blocked dates (holidays)
    const year = checkDate.getFullYear();
    const month = String(checkDate.getMonth() + 1).padStart(2, "0");
    const day = String(checkDate.getDate()).padStart(2, "0");
    const dateString = `${year}-${month}-${day}`; // YYYY-MM-DD format
    if (blockedDates.includes(dateString)) {
      return true;
    }

    return false;
  };

  // Handle date selection from calendar
  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      // Use local date methods to avoid timezone issues
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      const dateString = `${year}-${month}-${day}`;

      setSelectedDate(date);
      setFormData((prev) => ({
        ...prev,
        selectedDate: dateString,
        selectedTime: "", // Reset time when date changes
      }));
    }
  };

  const handleTimeSelect = (time: string) => {
    setFormData((prev) => ({
      ...prev,
      selectedTime: time,
    }));
  };

  const isSlotAvailable = (date: string, time: string): boolean => {
    const slotId = `${date}-${time}`;
    return !bookedSlots.includes(slotId);
  };

  const isCurrentBookingSlot = (date: string, time: string): boolean => {
    return date === formData.selectedDate && time === formData.selectedTime;
  };

  const formatTime = (time: string): string => {
    return time;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    // Validation
    if (!formData.firstName || !formData.lastName || !formData.phoneNumber || !formData.email) {
      setError("Please fill in all required fields");
      setSaving(false);
      return;
    }

    if (!formData.selectedDate || !formData.selectedTime) {
      setError("Please select a date and time");
      setSaving(false);
      return;
    }

    if (!bookingService.validateEmail(formData.email)) {
      setError("Please enter a valid email address");
      setSaving(false);
      return;
    }

    // Check if the selected slot is available (excluding current booking)
    const isCurrentSlot = isCurrentBookingSlot(formData.selectedDate, formData.selectedTime);

    if (!isCurrentSlot && !isSlotAvailable(formData.selectedDate, formData.selectedTime)) {
      setError("The selected time slot is no longer available");
      setSaving(false);
      return;
    }

    try {
      const updatedData: BookingData = {
        firstName: formData.firstName,
        middleName: formData.middleName,
        lastName: formData.lastName,
        phoneNumber: formData.phoneNumber,
        email: formData.email,
        description: formData.description,
        selectedDate: formData.selectedDate,
        selectedTime: formData.selectedTime,
        meetingType: formData.meetingType,
        meetingLink: formData.meetingLink,
      };

      const result = await bookingService.updateBooking(booking.bookingId, booking.email, updatedData);

      if (result.success) {
        // Call onSuccess immediately - parent will handle the toast and data refresh
        onSuccess();
      } else {
        setError(result.error || "Failed to update booking");
        toast.error("Update Failed", {
          description: result.error || "Please try again.",
        });
      }
    } catch {
      setError("Failed to update booking. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  // Simple error fallback
  if (error && !loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Edit className="h-6 w-6" />
            Edit Booking
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <X className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <Button onClick={onCancel} className="mt-4">
            Cancel Edit
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Edit className="h-6 w-6" />
          Edit Booking
        </CardTitle>
        <CardDescription>Update your booking details below.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name *</Label>
              <Input
                id="firstName"
                value={formData.firstName}
                onChange={(e) => handleInputChange("firstName", e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name *</Label>
              <Input
                id="lastName"
                value={formData.lastName}
                onChange={(e) => handleInputChange("lastName", e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="middleName">Middle Name</Label>
              <Input
                id="middleName"
                value={formData.middleName}
                onChange={(e) => handleInputChange("middleName", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phoneNumber">Phone Number *</Label>
              <Input
                id="phoneNumber"
                value={formData.phoneNumber}
                onChange={(e) => handleInputChange("phoneNumber", e.target.value)}
                required
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="email">Email Address *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                required
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="description">Briefly describe what you would like to discuss</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                rows={3}
              />
            </div>
          </div>

          {/* Meeting Type Selection */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold flex items-center gap-2 text-primary">
              <Video className="h-5 w-5" />
              Select Meeting Type
            </h3>
            <RadioGroup
              value={formData.meetingType}
              onValueChange={(value: "in-person" | "online") => handleInputChange("meetingType", value)}
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
            >
              <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <RadioGroupItem value="in-person" id="in-person" />
                <Label htmlFor="in-person" className="flex-1 cursor-pointer">
                  <div className="flex items-center gap-3">
                    <MapPin className="h-5 w-5 text-blue-600" />
                    <div>
                      <div className="font-medium">In-Person Meeting</div>
                      <div className="text-sm text-muted-foreground">Meet at our physical location</div>
                    </div>
                  </div>
                </Label>
              </div>
              <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <RadioGroupItem value="online" id="online" />
                <Label htmlFor="online" className="flex-1 cursor-pointer">
                  <div className="flex items-center gap-3">
                    <Video className="h-5 w-5 text-green-600" />
                    <div>
                      <div className="font-medium">Online Meeting</div>
                      <div className="text-sm text-muted-foreground">Join via Zoom (no account required)</div>
                    </div>
                  </div>
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Date Selection */}
          <div className="space-y-4">
            <Label className="text-base font-medium">Select Date *</Label>
            <div className="flex justify-center">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={handleDateSelect}
                disabled={isDateDisabled}
                showOutsideDays={false}
                className="rounded-md border"
              />
            </div>
          </div>

          {/* Time Selection */}
          {formData.selectedDate && (
            <div className="space-y-4">
              <Label className="text-base font-medium">Select Time *</Label>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin" />
                  <span className="ml-2">Loading available times...</span>
                </div>
              ) : (
                <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
                  {availableSlots
                    ?.find((slot) => slot.date === formData.selectedDate)
                    ?.timeSlots.map((time) => {
                      const isAvailable = isSlotAvailable(formData.selectedDate, time);
                      const isCurrent = isCurrentBookingSlot(formData.selectedDate, time);
                      const isSelected = formData.selectedTime === time;

                      return (
                        <Button
                          key={time}
                          type="button"
                          variant={isSelected ? "default" : "outline"}
                          onClick={() => handleTimeSelect(time)}
                          disabled={!isAvailable && !isCurrent}
                          className={`h-12 ${
                            !isAvailable && !isCurrent
                              ? "opacity-50 cursor-not-allowed"
                              : isCurrent
                                ? "bg-blue-100 border-blue-300 text-blue-800"
                                : ""
                          }`}
                        >
                          {formatTime(time)}
                        </Button>
                      );
                    })}
                </div>
              )}
            </div>
          )}

          {/* Error and Success Messages */}
          {error && (
            <Alert variant="destructive">
              <X className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert variant="default">
              <AlertDescription className="text-green-600">{success}</AlertDescription>
            </Alert>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button type="submit" disabled={saving} className="flex-1">
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating Booking...
                </>
              ) : (
                <>
                  <Edit className="mr-2 h-4 w-4" />
                  {formData.meetingType === "online" ? "Update Online Meeting" : "Update In-Person Meeting"}
                </>
              )}
            </Button>
            <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
              Cancel Edit
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
