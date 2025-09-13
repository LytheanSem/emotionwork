"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, Calendar, CheckCircle, Clock } from "lucide-react";
import { useEffect, useState } from "react";
import { formatDateForDisplay, generateTimeSlots, getOperationalStatus, TimeSlot } from "../utils/time-slots";

interface BookingScheduleProps {
  onSlotSelect?: (date: string, time: string) => void;
  selectedDate?: string;
  selectedTime?: string;
}

export function BookingSchedule({ onSlotSelect, selectedDate, selectedTime }: BookingScheduleProps) {
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [operationalStatus, setOperationalStatus] = useState(getOperationalStatus());

  useEffect(() => {
    // Generate time slots
    const slots = generateTimeSlots();
    setAvailableSlots(slots);

    // Update operational status
    setOperationalStatus(getOperationalStatus());

    // Refresh every minute to update availability
    const interval = setInterval(() => {
      const newSlots = generateTimeSlots();
      setAvailableSlots(newSlots);
      setOperationalStatus(getOperationalStatus());
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  const handleSlotClick = (date: string, time: string) => {
    if (onSlotSelect) {
      onSlotSelect(date, time);
    }
  };

  const getStatusColor = (isOpen: boolean) => {
    return isOpen ? "bg-green-100 text-green-800 border-green-200" : "bg-red-100 text-red-800 border-red-200";
  };

  const getStatusIcon = (isOpen: boolean) => {
    return isOpen ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />;
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      {/* Operational Status */}
      <Card className="border-l-4 border-l-primary">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Current Status</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3">
            <Badge variant="outline" className={`${getStatusColor(operationalStatus.isOpen)} flex items-center gap-1`}>
              {getStatusIcon(operationalStatus.isOpen)}
              {operationalStatus.isOpen ? "Open" : "Closed"}
            </Badge>
            <p className="text-sm text-muted-foreground">{operationalStatus.message}</p>
          </div>
          {operationalStatus.nextOpenTime && (
            <p className="text-sm text-muted-foreground mt-2">Next available: {operationalStatus.nextOpenTime}</p>
          )}
        </CardContent>
      </Card>

      {/* Available Slots */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            <CardTitle className="text-xl">Available Time Slots</CardTitle>
          </div>
          <CardDescription>Select from available appointments in the next 7 days</CardDescription>
        </CardHeader>
        <CardContent>
          {availableSlots.length === 0 ? (
            <div className="text-center py-8">
              <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-muted-foreground mb-2">No Available Slots</h3>
              <p className="text-sm text-muted-foreground">
                All time slots for the next 7 days are currently unavailable. Please check back later or contact us
                directly.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {availableSlots.map((slot) => (
                <Card
                  key={slot.date}
                  className={`transition-all duration-200 hover:shadow-md ${
                    selectedDate === slot.date ? "ring-2 ring-primary bg-primary/5" : "hover:border-primary/50"
                  }`}
                >
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base font-semibold">
                      {new Date(slot.date).toLocaleDateString("en-US", {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                      })}
                    </CardTitle>
                    <CardDescription className="text-xs">{formatDateForDisplay(slot.date)}</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-2">
                      <p className="text-xs font-medium text-muted-foreground">
                        Available Times ({slot.timeSlots.length} slots)
                      </p>
                      <div className="grid grid-cols-2 gap-1">
                        {slot.timeSlots.slice(0, 6).map((time) => (
                          <button
                            key={time}
                            onClick={() => handleSlotClick(slot.date, time)}
                            className={`text-xs px-2 py-1 rounded transition-colors ${
                              selectedDate === slot.date && selectedTime === time
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground"
                            }`}
                          >
                            {time}
                          </button>
                        ))}
                        {slot.timeSlots.length > 6 && (
                          <div className="text-xs text-muted-foreground col-span-2 text-center py-1">
                            +{slot.timeSlots.length - 6} more
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Booking Information */}
      <Card className="bg-muted/30">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="flex items-start gap-2">
              <Clock className="h-4 w-4 text-primary mt-0.5" />
              <div>
                <p className="font-medium">Operating Hours</p>
                <p className="text-muted-foreground">
                  7:00 AM - 7:00 PM
                  <br />
                  (Lunch: 12:00 PM - 1:00 PM)
                </p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Calendar className="h-4 w-4 text-primary mt-0.5" />
              <div>
                <p className="font-medium">Booking Window</p>
                <p className="text-muted-foreground">
                  Next 7 days
                  <br />
                  (Automatically updated)
                </p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-primary mt-0.5" />
              <div>
                <p className="font-medium">Session Duration</p>
                <p className="text-muted-foreground">
                  1 hour per slot
                  <br />
                  (60 minutes)
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
