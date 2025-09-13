import { randomBytes } from "crypto";
import { google } from "googleapis";

interface BookingData {
  firstName: string;
  middleName?: string;
  lastName: string;
  phoneNumber: string;
  email: string;
  description?: string;
  selectedDate: string;
  selectedTime: string;
  bookingId?: string; // Unique identifier for the booking
}

class GoogleSheetsService {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private sheets: any; // Google Sheets API client - complex typing from googleapis
  private spreadsheetId: string;

  constructor() {
    // Initialize Google Sheets API
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      },
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });

    this.sheets = google.sheets({ version: "v4", auth });
    this.spreadsheetId = process.env.GOOGLE_SHEET_ID || "";

    // Debug logging
    console.log("Google Sheets Service initialized:");
    console.log("- Spreadsheet ID:", this.spreadsheetId ? "Set" : "NOT SET");
    console.log("- Service Account Email:", process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL ? "Set" : "NOT SET");
    console.log("- Private Key:", process.env.GOOGLE_PRIVATE_KEY ? "Set" : "NOT SET");
  }

  /**
   * Generate a secure, unique booking ID
   */
  private generateBookingId(): string {
    // Generate 16 random bytes and convert to base64url (URL-safe)
    const randomData = randomBytes(16);
    return randomData.toString("base64url");
  }

  /**
   * Get blocked dates (holidays) from the Holidays sheet
   */
  async getBlockedDates(): Promise<string[]> {
    try {
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: this.spreadsheetId,
        range: "Holidays!A:B", // Get Date and Reason columns
      });

      const values = response.data.values;
      if (!values || values.length <= 1) {
        return []; // No holidays or only headers
      }

      // Skip header row and extract dates
      const blockedDates: string[] = [];
      for (let i = 1; i < values.length; i++) {
        const row = values[i] as string[];
        if (row[0]) {
          // If date exists
          const dateString = row[0].trim();
          // Validate and normalize date format
          if (this.isValidDateFormat(dateString)) {
            const normalizedDate = this.normalizeDateString(dateString);
            blockedDates.push(normalizedDate);
          }
        }
      }

      return blockedDates;
    } catch (error) {
      console.error("Error fetching blocked dates:", error);
      return []; // Return empty array on error to not break booking system
    }
  }

  /**
   * Validate and normalize date format (accepts YYYY-M-D, YYYY-MM-D, YYYY-M-DD, YYYY-MM-DD)
   */
  private isValidDateFormat(dateString: string): boolean {
    // More flexible regex that accepts single or double digit months/days
    const dateRegex = /^\d{4}-\d{1,2}-\d{1,2}$/;
    if (!dateRegex.test(dateString)) {
      return false;
    }

    const date = new Date(dateString);
    return !isNaN(date.getTime());
  }

  /**
   * Normalize date string to YYYY-MM-DD format
   */
  private normalizeDateString(dateString: string): string {
    // Parse the date components to avoid timezone issues
    const parts = dateString.split("-");
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10);
    const day = parseInt(parts[2], 10);

    // Format directly without creating a Date object to avoid timezone issues
    const yearStr = year.toString();
    const monthStr = month.toString().padStart(2, "0");
    const dayStr = day.toString().padStart(2, "0");

    return `${yearStr}-${monthStr}-${dayStr}`;
  }

  /**
   * Test the connection and get sheet information
   */
  async testConnection(): Promise<{ success: boolean; error?: string; sheetNames?: string[] }> {
    try {
      if (!this.spreadsheetId) {
        return { success: false, error: "GOOGLE_SHEET_ID not set" };
      }

      // Get spreadsheet metadata
      const response = await this.sheets.spreadsheets.get({
        spreadsheetId: this.spreadsheetId,
      });

      const sheetNames =
        (response.data.sheets
          ?.map((sheet: { properties?: { title?: string } }) => sheet.properties?.title)
          .filter(Boolean) as string[]) || [];

      console.log("Google Sheets connection successful!");
      console.log("Sheet names:", sheetNames);

      return { success: true, sheetNames };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      console.error("Google Sheets connection failed:", errorMessage);
      return { success: false, error: errorMessage };
    }
  }

  /**
   * Sanitize user input to prevent formula injection in Google Sheets
   */
  private sanitizeForSheet(value: string): string {
    const v = String(value ?? "");
    return /^[=+\-@]/.test(v) ? `'${v}` : v;
  }

  /**
   * Add a new booking to the Google Sheet
   */
  async addBooking(bookingData: BookingData): Promise<{ success: boolean; bookingId?: string; conflict?: boolean }> {
    try {
      // Generate unique booking ID
      const bookingId = this.generateBookingId();

      // Create slot ID for conflict checking
      const normalizedTime = bookingData.selectedTime.trim().replace(/\s+/g, " ").toUpperCase();
      const timeWithMinutes = /:\d{2}/.test(normalizedTime)
        ? normalizedTime
        : normalizedTime.replace(/(AM|PM)$/, ":00 $1");
      const slotId = `${bookingData.selectedDate}-${timeWithMinutes}`;

      // Check for conflicts one more time before adding (atomic check)
      const bookedSlots = await this.getBookedSlots();
      if (bookedSlots.includes(slotId)) {
        return { success: false, conflict: true };
      }

      // Format the date and time for display
      const dateTime = this.formatDateTime(bookingData.selectedDate, bookingData.selectedTime);

      // Prepare the row data according to your sheet structure
      const values = [
        [
          bookingId, // A: Booking ID (new first column)
          this.sanitizeForSheet(bookingData.firstName), // B: First name
          this.sanitizeForSheet(bookingData.middleName || ""), // C: Middle name
          this.sanitizeForSheet(bookingData.lastName), // D: Last name
          this.sanitizeForSheet(bookingData.phoneNumber), // E: Phone number
          this.sanitizeForSheet(bookingData.email), // F: Email
          dateTime, // G: Date & Time
          this.sanitizeForSheet(bookingData.description || ""), // H: description
          "no", // I: Confirm (yes or no) - default to 'no'
          "no", // J: Meeting complete (yes or no) - default to 'no'
        ],
      ];

      // First, find the first empty row
      const firstEmptyRow = await this.findFirstEmptyRow();

      if (firstEmptyRow === -1) {
        // If no empty row found, append to the end
        const response = await this.sheets.spreadsheets.values.append({
          spreadsheetId: this.spreadsheetId,
          range: "booking list!A:J", // Append to columns A through J (added booking ID column)
          valueInputOption: "RAW",
          insertDataOption: "INSERT_ROWS",
          requestBody: {
            values: values,
          },
        });
        console.log("Booking appended to Google Sheets:", response.data);
      } else {
        // Insert at the first empty row
        const range = `booking list!A${firstEmptyRow}:J${firstEmptyRow}`;
        const response = await this.sheets.spreadsheets.values.update({
          spreadsheetId: this.spreadsheetId,
          range: range,
          valueInputOption: "RAW",
          requestBody: {
            values: values,
          },
        });
        console.log(`Booking inserted at row ${firstEmptyRow}:`, response.data);
      }

      return { success: true, bookingId };
    } catch (error) {
      console.error("Error adding booking to Google Sheets:", error);
      return { success: false };
    }
  }

  /**
   * Find the first empty row in the sheet
   */
  async findFirstEmptyRow(): Promise<number> {
    try {
      // Get all data from the sheet
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: this.spreadsheetId,
        range: "booking list!A:A", // Only check column A for efficiency
      });

      const rows = response.data.values || [];

      // Start from row 2 (after header)
      for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        // Check if the row is empty or only contains empty strings
        if (
          !row ||
          row.length === 0 ||
          row.every((cell: unknown) => !cell || (typeof cell === "string" && cell.trim() === ""))
        ) {
          return i + 1; // Return 1-based row number
        }
      }

      // If no empty row found, return the next row after the last data
      return rows.length + 1;
    } catch (error: unknown) {
      console.error("Error finding first empty row:", error);
      return -1; // Return -1 to indicate error, will fallback to append
    }
  }

  /**
   * Find a booking by ID and email (for security verification)
   */
  async findBookingByIdAndEmail(
    bookingId: string,
    email: string
  ): Promise<{
    success: boolean;
    booking?: {
      bookingId: string;
      firstName: string;
      middleName: string;
      lastName: string;
      phoneNumber: string;
      email: string;
      dateTime: string;
      description: string;
      confirmed: string;
      completed: string;
    };
    error?: string;
  }> {
    try {
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: this.spreadsheetId,
        range: "booking list!A2:J", // Get all data from row 2 onwards
      });

      const rows = response.data.values || [];

      for (const row of rows) {
        if (row.length >= 10 && row[0] === bookingId && row[5] === email) {
          // Found the booking - return it
          const rowData = row as string[];
          return {
            success: true,
            booking: {
              bookingId: rowData[0],
              firstName: rowData[1],
              middleName: rowData[2],
              lastName: rowData[3],
              phoneNumber: rowData[4],
              email: rowData[5],
              dateTime: rowData[6],
              description: rowData[7],
              confirmed: rowData[8],
              completed: rowData[9],
            },
          };
        }
      }

      return { success: false, error: "Booking not found or email doesn't match" };
    } catch (error: unknown) {
      console.error("Error finding booking:", error);
      return { success: false, error: "Database error" };
    }
  }

  /**
   * Cancel a booking by ID and email
   */
  async cancelBooking(bookingId: string, email: string): Promise<{ success: boolean; error?: string }> {
    try {
      // First verify the booking exists and email matches
      const verification = await this.findBookingByIdAndEmail(bookingId, email);
      if (!verification.success) {
        return { success: false, error: verification.error };
      }

      // Get all data to find the row number
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: this.spreadsheetId,
        range: "booking list!A2:J",
      });

      const rows = response.data.values || [];

      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        if (row.length >= 10 && row[0] === bookingId && row[5] === email) {
          // Found the row - delete it by clearing all cells
          const rowNumber = i + 2; // +2 because we start from row 2
          const range = `booking list!A${rowNumber}:J${rowNumber}`;

          await this.sheets.spreadsheets.values.clear({
            spreadsheetId: this.spreadsheetId,
            range: range,
          });

          console.log(`Booking ${bookingId} cancelled successfully`);
          return { success: true };
        }
      }

      return { success: false, error: "Booking not found" };
    } catch (error: unknown) {
      console.error("Error cancelling booking:", error);
      return { success: false, error: "Database error" };
    }
  }

  /**
   * Update an existing booking by ID and email
   */
  async updateBooking(
    bookingId: string,
    email: string,
    updatedData: BookingData
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // First verify the booking exists and email matches
      const verification = await this.findBookingByIdAndEmail(bookingId, email);
      if (!verification.success) {
        return { success: false, error: verification.error };
      }

      // Get all data to find the row number
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: this.spreadsheetId,
        range: "booking list!A2:J",
      });

      const rows = response.data.values || [];

      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        if (row.length >= 10 && row[0] === bookingId && row[5] === email) {
          // Found the row - update it
          const rowNumber = i + 2; // +2 because we start from row 2
          const range = `booking list!A${rowNumber}:J${rowNumber}`;

          // Format the date and time for display
          const dateTime = this.formatDateTime(updatedData.selectedDate, updatedData.selectedTime);

          // Prepare the updated row data
          const values = [
            [
              bookingId, // A: Booking ID (keep original)
              this.sanitizeForSheet(updatedData.firstName), // B: First name
              this.sanitizeForSheet(updatedData.middleName || ""), // C: Middle name
              this.sanitizeForSheet(updatedData.lastName), // D: Last name
              this.sanitizeForSheet(updatedData.phoneNumber), // E: Phone number
              this.sanitizeForSheet(updatedData.email), // F: Email
              dateTime, // G: Date & Time
              this.sanitizeForSheet(updatedData.description || ""), // H: description
              "no", // I: Confirm (yes or no) - reset to 'no' for updated booking
              "no", // J: Meeting complete (yes or no) - reset to 'no' for updated booking
            ],
          ];

          await this.sheets.spreadsheets.values.update({
            spreadsheetId: this.spreadsheetId,
            range: range,
            valueInputOption: "RAW",
            requestBody: {
              values: values,
            },
          });

          console.log(`Booking ${bookingId} updated successfully`);
          return { success: true };
        }
      }

      return { success: false, error: "Booking not found" };
    } catch (error: unknown) {
      console.error("Error updating booking:", error);
      return { success: false, error: "Database error" };
    }
  }

  /**
   * Get all bookings from the Google Sheet
   */
  async getBookings(): Promise<BookingData[]> {
    try {
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: this.spreadsheetId,
        range: "booking list!A2:J", // Get data from row 2 onwards (skip header) - now includes booking ID
      });

      const rows = response.data.values || [];
      const bookings: BookingData[] = [];

      for (const row of rows) {
        if (row.length >= 7) {
          // Ensure we have at least the required fields (including booking ID)
          const [bookingId, firstName, middleName, lastName, phoneNumber, email, dateTime, description] =
            row as string[];

          // Parse the date and time back
          const { date, time } = this.parseDateTime(dateTime);

          bookings.push({
            firstName: firstName || "",
            middleName: middleName || "",
            lastName: lastName || "",
            phoneNumber: phoneNumber || "",
            email: email || "",
            description: description || "",
            selectedDate: date,
            selectedTime: time,
            bookingId: bookingId || "",
          });
        }
      }

      return bookings;
    } catch (error) {
      console.error("Error getting bookings from Google Sheets:", error);
      return [];
    }
  }

  /**
   * Get booked time slots from the Google Sheet
   */
  async getBookedSlots(): Promise<string[]> {
    try {
      const bookings = await this.getBookings();
      return bookings.map((booking) => `${booking.selectedDate}-${booking.selectedTime}`);
    } catch (error) {
      console.error("Error getting booked slots from Google Sheets:", error);
      return [];
    }
  }

  /**
   * Format date and time for display in the sheet
   */
  private formatDateTime(dateString: string, timeString: string): string {
    // Parse the date string to avoid timezone issues
    const [year, month, day] = dateString.split("-").map(Number);
    const date = new Date(year, month - 1, day); // month is 0-indexed

    const formattedDate = date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    return `${formattedDate} at ${timeString}`;
  }

  /**
   * Parse date and time from the sheet format back to separate values
   */
  private parseDateTime(dateTimeString: string): { date: string; time: string } {
    // This is a simple parser - you might need to adjust based on your exact format
    const timeMatch = dateTimeString.match(/(\d{1,2}:\d{2} [AP]M)$/);
    const time = timeMatch ? timeMatch[1] : "";

    // Extract date part and convert back to YYYY-MM-DD format
    const dateMatch = dateTimeString.match(/(\w+), (\w+) (\d+), (\d+)/);
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

      const dateString = `${year}-${monthNum}-${dayNum}`;
      return { date: dateString, time };
    }

    console.warn(`Could not parse date from: "${dateTimeString}"`);
    return { date: "", time };
  }
}

export const googleSheetsService = new GoogleSheetsService();
