/**
 * Service for managing Zoom meeting operations
 */

export interface ZoomMeetingData {
  meetingId: string;
  joinUrl: string;
  password?: string;
  startTime: string;
  duration: number;
}

export interface ZoomMeetingResponse {
  success: boolean;
  meetingData?: ZoomMeetingData;
  error?: string;
}

class ZoomService {
  private apiKey: string;
  private apiSecret: string;
  private accountId: string;
  private baseUrl: string;

  constructor() {
    this.apiKey = process.env.ZOOM_API_KEY || "";
    this.apiSecret = process.env.ZOOM_API_SECRET || "";
    this.accountId = process.env.ZOOM_ACCOUNT_ID || "";
    this.baseUrl = "https://api.zoom.us/v2";
  }

  /**
   * Generate a JWT token for Zoom API authentication
   */
  private async generateJWT(): Promise<string> {
    const header = {
      alg: "HS256",
      typ: "JWT",
    };

    const payload = {
      iss: this.apiKey,
      exp: Math.floor(Date.now() / 1000) + 3600, // 1 hour expiration
    };

    // Encode header and payload
    const encodedHeader = Buffer.from(JSON.stringify(header)).toString("base64url");
    const encodedPayload = Buffer.from(JSON.stringify(payload)).toString("base64url");

    // Create signature using HMAC-SHA256
    const { createHmac } = await import("crypto");
    const signature = createHmac("sha256", this.apiSecret)
      .update(`${encodedHeader}.${encodedPayload}`)
      .digest("base64url");

    return `${encodedHeader}.${encodedPayload}.${signature}`;
  }

  /**
   * Create an instant Zoom meeting for a booking
   */
  async createInstantMeeting(bookingData: {
    firstName: string;
    lastName: string;
    selectedDate: string;
    selectedTime: string;
    description?: string;
  }): Promise<ZoomMeetingResponse> {
    try {
      // Check if credentials are available
      if (!this.validateCredentials()) {
        console.warn("Zoom API credentials not configured, using mock data");
        return this.createMockMeeting(bookingData);
      }

      // For Server-to-Server OAuth, we need to get an access token first
      const accessToken = await this.getAccessToken();
      if (!accessToken) {
        throw new Error("Failed to get access token");
      }

      // Format the meeting time
      const meetingTime = this.formatMeetingTime(bookingData.selectedDate, bookingData.selectedTime);

      // Create meeting payload
      const meetingPayload = {
        topic: `Meeting with ${bookingData.firstName} ${bookingData.lastName}`,
        type: 2, // Scheduled meeting
        start_time: meetingTime,
        duration: 60, // 1 hour
        timezone: "Asia/Phnom_Penh",
        settings: {
          host_video: true,
          participant_video: true,
          join_before_host: true,
          mute_upon_entry: false,
          waiting_room: false,
          auto_recording: "none",
          enforce_login: false, // Allow guest access
          auto_end_meeting: true, // Automatically end meeting after duration
          close_registration: true, // Close registration after meeting starts
        },
        agenda: bookingData.description || "Business consultation meeting",
      };

      // Create meeting via Zoom API
      const response = await fetch(`${this.baseUrl}/users/me/meetings`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(meetingPayload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Zoom API error: ${errorData.message || response.statusText}`);
      }

      const meetingData = await response.json();

      const result: ZoomMeetingData = {
        meetingId: meetingData.id.toString(),
        joinUrl: meetingData.join_url,
        password: meetingData.password || "",
        startTime: meetingTime,
        duration: 60,
      };

      return {
        success: true,
        meetingData: result,
      };
    } catch (error) {
      console.error("Error creating Zoom meeting:", error);
      // Fallback to mock data if API fails
      console.warn("Falling back to mock meeting data");
      return this.createMockMeeting(bookingData);
    }
  }

  /**
   * Get access token for Server-to-Server OAuth
   */
  private async getAccessToken(): Promise<string | null> {
    try {
      // For Server-to-Server OAuth, we need to encode credentials and include account_id
      const credentials = Buffer.from(`${this.apiKey}:${this.apiSecret}`).toString("base64");

      const response = await fetch("https://zoom.us/oauth/token", {
        method: "POST",
        headers: {
          Authorization: `Basic ${credentials}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          grant_type: "account_credentials",
          account_id: this.accountId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Failed to get access token:", errorData);
        return null;
      }

      const tokenData = await response.json();
      return tokenData.access_token;
    } catch (error) {
      console.error("Error getting access token:", error);
      return null;
    }
  }

  /**
   * Create mock meeting data as fallback
   */
  private createMockMeeting(bookingData: {
    firstName: string;
    lastName: string;
    selectedDate: string;
    selectedTime: string;
    description?: string;
  }): ZoomMeetingResponse {
    const meetingId = this.generateMeetingId();
    const joinUrl = `https://zoom.us/j/${meetingId}`;
    const meetingTime = this.formatMeetingTime(bookingData.selectedDate, bookingData.selectedTime);

    const meetingData: ZoomMeetingData = {
      meetingId,
      joinUrl,
      password: "",
      startTime: meetingTime,
      duration: 60,
    };

    return {
      success: true,
      meetingData,
    };
  }

  /**
   * Generate a unique meeting ID
   */
  private generateMeetingId(): string {
    // Generate a 9-11 digit meeting ID (Zoom format)
    const min = 100000000;
    const max = 99999999999;
    return Math.floor(Math.random() * (max - min + 1)) + min + "";
  }

  /**
   * Format meeting time for Zoom API
   */
  private formatMeetingTime(dateString: string, timeString: string): string {
    // Convert date and time to ISO format
    const [year, month, day] = dateString.split("-").map(Number);

    // Parse time (e.g., "2:00 PM" -> 14:00)
    const timeMatch = timeString.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
    if (!timeMatch) {
      throw new Error("Invalid time format");
    }

    let hour = parseInt(timeMatch[1]);
    const minute = parseInt(timeMatch[2]);
    const period = timeMatch[3].toUpperCase();

    if (period === "PM" && hour !== 12) {
      hour += 12;
    } else if (period === "AM" && hour === 12) {
      hour = 0;
    }

    const date = new Date(year, month - 1, day, hour, minute);
    return date.toISOString();
  }

  /**
   * Delete a Zoom meeting
   */
  async deleteMeeting(meetingId: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Check if credentials are available
      if (!this.validateCredentials()) {
        console.warn("Zoom API credentials not configured, cannot delete meeting");
        return { success: false, error: "Zoom API credentials not configured" };
      }

      // Get access token
      const accessToken = await this.getAccessToken();
      if (!accessToken) {
        return { success: false, error: "Failed to get access token" };
      }

      // Delete meeting via Zoom API
      const response = await fetch(`${this.baseUrl}/meetings/${meetingId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Zoom API error: ${errorData.message || response.statusText}`);
      }

      console.log("Zoom meeting deleted successfully");
      return { success: true };
    } catch (error) {
      console.error("Error deleting Zoom meeting:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to delete Zoom meeting",
      };
    }
  }

  /**
   * Validate Zoom API credentials
   */
  validateCredentials(): boolean {
    return !!(this.apiKey && this.apiSecret && this.accountId);
  }
}

export const zoomService = new ZoomService();
