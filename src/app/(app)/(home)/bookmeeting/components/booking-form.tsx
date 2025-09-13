"use client";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar as CalendarIcon, Clock, Mail, MessageSquare, Phone, User } from "lucide-react";
import { useEffect, useState } from "react";
import { bookingService } from "../services/booking-service";

// Helper function to generate time slots for a specific date (including booked ones)
// Since we don't allow same-day booking, all slots are always available (unless booked)
function generateTimeSlotsForSelectedDate(
  dateString: string,
  bookedSlots: string[]
): { time: string; isBooked: boolean }[] {
  const timeSlots: { time: string; isBooked: boolean }[] = [];

  // Morning slots: 7am to 12pm
  for (let hour = 7; hour < 12; hour++) {
    const timeString = formatTime(hour);
    const slotId = `${dateString}-${timeString}`;
    const isBooked = bookedSlots.includes(slotId);

    timeSlots.push({
      time: timeString,
      isBooked: isBooked,
    });
  }

  // Afternoon slots: 1pm to 7pm (lunch break 12pm-1pm)
  for (let hour = 13; hour < 19; hour++) {
    const timeString = formatTime(hour);
    const slotId = `${dateString}-${timeString}`;
    const isBooked = bookedSlots.includes(slotId);

    timeSlots.push({
      time: timeString,
      isBooked: isBooked,
    });
  }

  return timeSlots;
}

// Helper function to format time
function formatTime(hour: number): string {
  const period = hour >= 12 ? "PM" : "AM";
  const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  return `${displayHour}:00 ${period}`;
}

// Helper function to check if a date should be disabled
function isDateDisabled(date: Date, blockedDates: string[] = []): boolean {
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
}

interface BookingFormData {
  firstName: string;
  middleName: string;
  lastName: string;
  phoneNumber: string;
  email: string;
  description: string;
  selectedDate: string;
  selectedTime: string;
}

interface BookingFormProps {
  onSubmit: (data: BookingFormData) => void;
}

export function BookingForm({ onSubmit }: BookingFormProps) {
  const [formData, setFormData] = useState<BookingFormData>({
    firstName: "",
    middleName: "",
    lastName: "",
    phoneNumber: "",
    email: "",
    description: "",
    selectedDate: "",
    selectedTime: "",
  });

  const [errors, setErrors] = useState<Partial<BookingFormData>>({});
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);
  const [blockedDates, setBlockedDates] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);

  // Load booked slots and blocked dates on component mount
  useEffect(() => {
    loadBookedSlots();
    loadBlockedDates();
  }, []);

  const loadBookedSlots = async () => {
    try {
      const response = await bookingService.getAvailableSlots();
      setBookedSlots(response.bookedSlots);
    } catch (error) {
      console.error("Error loading booked slots:", error);
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

  const validateForm = (): boolean => {
    const newErrors: Partial<BookingFormData> = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = "First name is required";
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = "Last name is required";
    }

    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = "Phone number is required";
    } else if (!/^[\+]?[1-9][\d]{0,15}$/.test(formData.phoneNumber.replace(/[\s\-\(\)]/g, ""))) {
      newErrors.phoneNumber = "Please enter a valid phone number";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!bookingService.validateEmail(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.selectedDate) {
      newErrors.selectedDate = "Please select a date";
    }

    if (!formData.selectedTime) {
      newErrors.selectedTime = "Please select a time slot";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }

    // Just pass data to parent for confirmation step - don't submit to API yet
    onSubmit(formData);
  };

  const handleInputChange = (field: keyof BookingFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
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
      handleInputChange("selectedDate", dateString);
      handleInputChange("selectedTime", ""); // Reset time when date changes
    }
  };

  // Generate time slots for the selected date
  const selectedDateSlots = formData.selectedDate
    ? generateTimeSlotsForSelectedDate(formData.selectedDate, bookedSlots)
    : [];

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-3xl font-bold text-primary flex items-center justify-center gap-2">
          <CalendarIcon className="h-8 w-8" />
          Book a Meeting
        </CardTitle>
        <CardDescription className="text-lg">Schedule a consultation with our team</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Information Section */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold flex items-center gap-2 text-primary">
              <User className="h-5 w-5" />
              Personal Information
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName" className="text-sm font-medium">
                  First Name *
                </Label>
                <Input
                  id="firstName"
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange("firstName", e.target.value)}
                  className={errors.firstName ? "border-destructive" : ""}
                  placeholder="Enter your first name"
                />
                {errors.firstName && <p className="text-sm text-destructive">{errors.firstName}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastName" className="text-sm font-medium">
                  Last Name *
                </Label>
                <Input
                  id="lastName"
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange("lastName", e.target.value)}
                  className={errors.lastName ? "border-destructive" : ""}
                  placeholder="Enter your last name"
                />
                {errors.lastName && <p className="text-sm text-destructive">{errors.lastName}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="middleName" className="text-sm font-medium">
                Middle Name (Optional)
              </Label>
              <Input
                id="middleName"
                type="text"
                value={formData.middleName}
                onChange={(e) => handleInputChange("middleName", e.target.value)}
                placeholder="Enter your middle name"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phoneNumber" className="text-sm font-medium flex items-center gap-1">
                  <Phone className="h-4 w-4" />
                  Phone Number *
                </Label>
                <Input
                  id="phoneNumber"
                  type="tel"
                  value={formData.phoneNumber}
                  onChange={(e) => handleInputChange("phoneNumber", e.target.value)}
                  className={errors.phoneNumber ? "border-destructive" : ""}
                  placeholder="+1 (555) 123-4567"
                />
                {errors.phoneNumber && <p className="text-sm text-destructive">{errors.phoneNumber}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium flex items-center gap-1">
                  <Mail className="h-4 w-4" />
                  Email Address *
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  className={errors.email ? "border-destructive" : ""}
                  placeholder="your.email@example.com"
                />
                {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
              </div>
            </div>
          </div>

          {/* Description Section */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold flex items-center gap-2 text-primary">
              <MessageSquare className="h-5 w-5" />
              Meeting Details
            </h3>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm font-medium">
                Briefly describe what would you like to discuss
              </Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                placeholder="Tell us about your project, questions, or what you'd like to discuss during the meeting..."
                className="min-h-24"
              />
            </div>
          </div>

          {/* Date and Time Selection */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold flex items-center gap-2 text-primary">
              <Clock className="h-5 w-5" />
              Select Date & Time
            </h3>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Select Date *</Label>
                <div className="flex justify-center">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={handleDateSelect}
                    disabled={(date) => isDateDisabled(date, blockedDates)}
                    showOutsideDays={false}
                    className="rounded-md border"
                  />
                </div>
                {errors.selectedDate && <p className="text-sm text-destructive">{errors.selectedDate}</p>}
              </div>

              {formData.selectedDate && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Select Time *</Label>
                  <p className="text-xs text-muted-foreground">Grayed out slots are already booked</p>
                  {selectedDateSlots.length > 0 ? (
                    <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-2">
                      {selectedDateSlots.map((slot) => {
                        const isSelected = formData.selectedTime === slot.time;

                        return (
                          <Button
                            key={slot.time}
                            type="button"
                            variant={isSelected ? "default" : "outline"}
                            onClick={() => !slot.isBooked && handleInputChange("selectedTime", slot.time)}
                            className={`h-10 text-sm ${
                              slot.isBooked
                                ? "opacity-50 cursor-not-allowed bg-gray-100 text-gray-400 border-gray-200"
                                : ""
                            }`}
                            disabled={slot.isBooked}
                          >
                            {slot.time}
                          </Button>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground py-4 text-center">
                      No time slots available for this date
                    </p>
                  )}
                  {errors.selectedTime && <p className="text-sm text-destructive">{errors.selectedTime}</p>}
                </div>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-6">
            <Button
              type="submit"
              className="w-full h-12 text-lg font-semibold"
              disabled={!formData.selectedDate || !formData.selectedTime}
            >
              Book Meeting
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
