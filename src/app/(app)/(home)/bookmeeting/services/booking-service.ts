/**
 * Service for managing booking operations
 */

import { generateCSRFToken } from "@/lib/csrf";
import { generateTimeSlots } from "../utils/time-slots";

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
   * Get CSRF token for requests
   */
  private async getCSRFToken(): Promise<string> {
    // Generate a session ID (simplified for client-side)
    const sessionId = `client-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    return generateCSRFToken(sessionId);
  }

  /**
   * Submit a booking request
   */
  async submitBooking(bookingData: BookingData): Promise<BookingResponse> {
    try {
      const csrfToken = await this.getCSRFToken();
      const response = await fetch(this.baseUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-Token": csrfToken,
        },
        credentials: "same-origin",
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
      const response = await fetch(this.baseUrl, {
        credentials: "same-origin",
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to fetch available slots");
      }

      // Generate available slots using shared utility (filters out booked slots)
      const availableSlots = generateTimeSlots(result.bookedSlots || []);

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
        `/api/booking-management?bookingId=${encodeURIComponent(bookingId)}&email=${encodeURIComponent(email)}`,
        {
          credentials: "same-origin",
        }
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
      const csrfToken = await this.getCSRFToken();
      const response = await fetch("/api/booking-management", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-Token": csrfToken,
        },
        credentials: "same-origin",
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
      const csrfToken = await this.getCSRFToken();
      const response = await fetch("/api/booking-management", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-Token": csrfToken,
        },
        credentials: "same-origin",
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
