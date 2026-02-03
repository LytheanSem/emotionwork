/**
 * Zoom meeting service (Server-to-Server OAuth)
 * Safe timezone handling for GMT+07:00 (Asia/Bangkok)
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

const ZOOM_TIMEZONE = "Asia/Bangkok";
const ZOOM_TIME_OFFSET = "+07:00";

class ZoomService {
  private apiKey = process.env.ZOOM_API_KEY || "";
  private apiSecret = process.env.ZOOM_API_SECRET || "";
  private accountId = process.env.ZOOM_ACCOUNT_ID || "";
  private baseUrl = "https://api.zoom.us/v2";

  /**
   * =========================
   * Public API
   * =========================
   */

  async createInstantMeeting(data: {
    firstName: string;
    lastName: string;
    selectedDate: string; // YYYY-MM-DD
    selectedTime: string; // e.g. "2:00 PM"
    description?: string;
  }): Promise<ZoomMeetingResponse> {
    try {
      if (!this.validateCredentials()) {
        return this.devFallback(data, "Zoom credentials not configured");
      }

      const accessToken = await this.getAccessToken();
      if (!accessToken) {
        throw new Error("Failed to obtain Zoom access token");
      }

      const startTime = this.formatMeetingTime(data.selectedDate, data.selectedTime);

      const response = await fetch(`${this.baseUrl}/users/me/meetings`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          topic: `Meeting with ${data.firstName} ${data.lastName}`,
          type: 2, // Scheduled meeting
          start_time: startTime,
          duration: 60,
          timezone: ZOOM_TIMEZONE,
          agenda: data.description || "Consultation meeting",
          settings: {
            host_video: true,
            participant_video: true,
            join_before_host: false,
            waiting_room: true,
            mute_upon_entry: false,
            auto_recording: "none",
            enforce_login: false,
          },
        }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || "Zoom API error");
      }

      const meeting = await response.json();

      return {
        success: true,
        meetingData: {
          meetingId: String(meeting.id),
          joinUrl: meeting.join_url,
          password: meeting.password || "",
          startTime,
          duration: 60,
        },
      };
    } catch (error) {
      console.error("Zoom create meeting error:", error);
      return this.devFallback(data, error instanceof Error ? error.message : "Unknown error");
    }
  }

  async deleteMeeting(meetingId: string): Promise<{ success: boolean; error?: string }> {
    try {
      if (!this.validateCredentials()) {
        return { success: false, error: "Zoom credentials not configured" };
      }

      const accessToken = await this.getAccessToken();
      if (!accessToken) {
        return { success: false, error: "Failed to get access token" };
      }

      const res = await fetch(`${this.baseUrl}/meetings/${meetingId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Zoom delete failed");
      }

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to delete meeting",
      };
    }
  }

  /**
   * =========================
   * Internal helpers
   * =========================
   */

  private validateCredentials(): boolean {
    return Boolean(this.apiKey && this.apiSecret && this.accountId);
  }

  private async getAccessToken(): Promise<string | null> {
    try {
      const basicAuth = Buffer.from(`${this.apiKey}:${this.apiSecret}`).toString("base64");

      const res = await fetch("https://zoom.us/oauth/token", {
        method: "POST",
        headers: {
          Authorization: `Basic ${basicAuth}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          grant_type: "account_credentials",
          account_id: this.accountId,
        }),
      });

      if (!res.ok) return null;

      const data = await res.json();
      return data.access_token || null;
    } catch {
      return null;
    }
  }

  /**
   * Converts date + time to Zoom-safe ISO string
   * Example: 2026-02-03T23:00:00+07:00
   */
  private formatMeetingTime(date: string, time: string): string {
    const [year, month, day] = date.split("-").map(Number);

    const match = time.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
    if (!match) {
      throw new Error("Invalid time format");
    }

    let hour = Number(match[1]);
    const minute = Number(match[2]);
    const period = match[3].toUpperCase();

    if (period === "PM" && hour !== 12) hour += 12;
    if (period === "AM" && hour === 12) hour = 0;

    const pad = (n: number) => String(n).padStart(2, "0");

    return `${year}-${pad(month)}-${pad(day)}T${pad(hour)}:${pad(minute)}:00${ZOOM_TIME_OFFSET}`;
  }

  /**
   * Dev-only fallback (prevents app crashes)
   */
  private devFallback(
    data: {
      selectedDate: string;
      selectedTime: string;
    },
    reason: string
  ): ZoomMeetingResponse {
    if (process.env.NODE_ENV === "production") {
      return { success: false, error: reason };
    }

    const startTime = this.formatMeetingTime(data.selectedDate, data.selectedTime);

    return {
      success: true,
      meetingData: {
        meetingId: String(Math.floor(100000000 + Math.random() * 900000000)),
        joinUrl: "https://zoom.us/j/mock",
        password: "",
        startTime,
        duration: 60,
      },
    };
  }
}

export const zoomService = new ZoomService();
