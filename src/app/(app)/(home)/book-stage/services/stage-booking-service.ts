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
    eventDate: string;
    eventTime: string;
    duration: number;
    expectedGuests: number;
    specialRequirements?: string;
  };
  designFiles: File[];
}

interface StageBookingResponse {
  success: boolean;
  bookingId?: string;
  error?: string;
}

class StageBookingService {
  private baseUrl = "/api/stage-bookings";

  async submitBooking(data: StageBookingFormData): Promise<StageBookingResponse> {
    try {
      // Upload design files to Cloudinary via API
      const uploadedFiles = await this.uploadDesignFiles(data.designFiles);

      // Prepare booking data
      const bookingData = {
        userProfile: data.userProfile,
        stageDetails: data.stageDetails,
        designFiles: uploadedFiles,
        status: "pending",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Submit to API
      const response = await fetch(this.baseUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(bookingData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to submit booking");
      }

      const result = await response.json();
      return {
        success: true,
        bookingId: result.bookingId,
      };
    } catch (error) {
      console.error("Stage booking submission error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred",
      };
    }
  }

  private async uploadDesignFiles(files: File[]): Promise<
    Array<{
      filename: string;
      originalName: string;
      url: string;
      publicId: string;
      mimeType: string;
      size: number;
      config: string;
    }>
  > {
    try {
      const formData = new FormData();
      files.forEach((file) => {
        formData.append("files", file);
      });
      formData.append("folder", "stage-designs");
      formData.append("config", "primary"); // Use primary Cloudinary configuration
      formData.append("tags", "stage-booking,design");

      const response = await fetch("/api/cloudinary/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to upload files");
      }

      const result = await response.json();
      return result.files;
    } catch (error) {
      console.error("Failed to upload design files:", error);
      throw new Error(`Failed to upload files: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  }

  async getBookingStatus(bookingId: string): Promise<{
    status: string;
    message?: string;
    booking?: {
      _id: string;
      userId: string;
      userEmail: string;
      userName: string;
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
        eventDate: string;
        eventTime: string;
        duration?: number;
        expectedGuests?: number;
        specialRequirements?: string;
      };
      designFiles: Array<{
        filename: string;
        originalName: string;
        url: string;
        publicId: string;
        mimeType: string;
        size: number;
      }>;
      status: string;
      adminNotes?: string;
      estimatedCost?: number;
      createdAt: string;
      updatedAt: string;
    };
  }> {
    try {
      const response = await fetch(`${this.baseUrl}/${bookingId}`);

      if (!response.ok) {
        throw new Error("Failed to fetch booking status");
      }

      return (await response.json()) as {
        status: string;
        message?: string;
        booking?: {
          _id: string;
          userId: string;
          userEmail: string;
          userName: string;
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
            eventDate: string;
            eventTime: string;
            duration?: number;
            expectedGuests?: number;
            specialRequirements?: string;
          };
          designFiles: Array<{
            filename: string;
            originalName: string;
            url: string;
            publicId: string;
            mimeType: string;
            size: number;
          }>;
          status: string;
          adminNotes?: string;
          estimatedCost?: number;
          createdAt: string;
          updatedAt: string;
        };
      };
    } catch (error) {
      console.error("Error fetching booking status:", error);
      throw error;
    }
  }

  async getUserBookings(): Promise<
    Array<{
      _id: string;
      userId: string;
      userEmail: string;
      userName: string;
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
        eventDate: string;
        eventTime: string;
        duration?: number;
        expectedGuests?: number;
        specialRequirements?: string;
      };
      designFiles: Array<{
        filename: string;
        originalName: string;
        url: string;
        publicId: string;
        mimeType: string;
        size: number;
      }>;
      status: string;
      adminNotes?: string;
      estimatedCost?: number;
      createdAt: string;
      updatedAt: string;
    }>
  > {
    try {
      const response = await fetch(`${this.baseUrl}/user`);

      if (!response.ok) {
        throw new Error("Failed to fetch user bookings");
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching user bookings:", error);
      throw error;
    }
  }
}

export const stageBookingService = new StageBookingService();
