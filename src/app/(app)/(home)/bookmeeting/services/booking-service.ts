/**
 * Service for managing booking operations
 */

export interface BookingData {
  firstName: string;
  middleName?: string;
  lastName: string;
  phoneNumber: string;
  email: string;
  description?: string;
  selectedDate: string;
  selectedTime: string;
}

export interface BookingResponse {
  success: boolean;
  message: string;
  bookingId?: string;
  error?: string;
}

export interface AvailableSlotsResponse {
  availableSlots: { date: string; timeSlots: string[] }[];
  bookedSlots: string[];
}

class BookingService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = "/api/bookings";
  }

  /**
   * Submit a booking request
   */
  async submitBooking(bookingData: BookingData): Promise<BookingResponse> {
    try {
      const response = await fetch(this.baseUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(bookingData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to submit booking");
      }

      return result;
    } catch (error) {
      console.error("Booking submission error:", error);
      return {
        success: false,
        message: "Failed to submit booking. Please try again.",
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Get available slots and booked slots
   */
  async getAvailableSlots(): Promise<AvailableSlotsResponse> {
    try {
      const response = await fetch(this.baseUrl);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to fetch available slots");
      }

      // Generate available slots from the bookings data
      const availableSlots = this.generateAvailableSlots();

      return {
        availableSlots,
        bookedSlots: result.bookedSlots || [],
      };
    } catch (error) {
      console.error("Error fetching available slots:", error);
      return {
        availableSlots: [],
        bookedSlots: [],
      };
    }
  }

  /**
   * Generate available time slots for the next 7 weekdays
   */
  private generateAvailableSlots(): { date: string; timeSlots: string[] }[] {
    const availableSlots: { date: string; timeSlots: string[] }[] = [];
    const today = new Date();

    // Start from tomorrow
    const startDate = new Date(today);
    startDate.setDate(today.getDate() + 1);

    // Generate next 7 weekdays
    const currentDate = new Date(startDate);
    let daysAdded = 0;

    while (daysAdded < 7) {
      const dayOfWeek = currentDate.getDay();

      // Skip weekends (0 = Sunday, 6 = Saturday)
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        const dateString = currentDate.toISOString().split("T")[0];

        // Generate time slots for this date (7 AM to 7 PM, excluding 12 PM - 1 PM)
        const timeSlots: string[] = [];
        for (let hour = 7; hour < 19; hour++) {
          // Skip lunch break (12 PM - 1 PM)
          if (hour === 12) continue;

          const timeString =
            hour === 0 ? "12:00 AM" : hour < 12 ? `${hour}:00 AM` : hour === 12 ? "12:00 PM" : `${hour - 12}:00 PM`;

          timeSlots.push(timeString);
        }

        availableSlots.push({
          date: dateString,
          timeSlots,
        });

        daysAdded++;
      }

      currentDate.setDate(currentDate.getDate() + 1);
    }

    return availableSlots;
  }

  /**
   * Validate email format
   */
  validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Check if a specific slot is available
   */
  isSlotAvailable(date: string, time: string, bookedSlots: string[]): boolean {
    const slotId = `${date}-${time}`;
    return !bookedSlots.includes(slotId);
  }

  /**
   * Look up a booking by ID and email
   */
  async lookupBooking(
    bookingId: string,
    email: string
  ): Promise<{ success: boolean; booking?: BookingData; error?: string }> {
    try {
      const response = await fetch(
        `/api/booking-management?bookingId=${encodeURIComponent(bookingId)}&email=${encodeURIComponent(email)}`
      );
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to lookup booking");
      }

      return result;
    } catch (error) {
      console.error("Booking lookup error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Cancel a booking
   */
  async cancelBooking(
    bookingId: string,
    email: string
  ): Promise<{ success: boolean; message?: string; error?: string }> {
    try {
      const response = await fetch("/api/booking-management", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          bookingId,
          email,
          action: "cancel",
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to cancel booking");
      }

      return result;
    } catch (error) {
      console.error("Booking cancellation error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Update a booking
   */
  async updateBooking(
    bookingId: string,
    email: string,
    updatedData: BookingData
  ): Promise<{ success: boolean; message?: string; error?: string }> {
    try {
      const response = await fetch("/api/booking-management", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          bookingId,
          email,
          action: "update",
          updatedData,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to update booking");
      }

      return result;
    } catch (error) {
      console.error("Booking update error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }
}

export const bookingService = new BookingService();
