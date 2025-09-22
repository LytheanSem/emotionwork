import nodemailer from "nodemailer";

interface BookingData {
  firstName: string;
  middleName?: string;
  lastName: string;
  phoneNumber: string;
  email: string;
  description?: string;
  selectedDate: string;
  selectedTime: string;
  meetingType: "in-person" | "online";
  meetingLink?: string;
  bookingId?: string;
}

class EmailService {
  private transporter: nodemailer.Transporter | null = null;

  constructor() {
    // Don't initialize transporter in constructor to avoid build-time errors
    // It will be initialized lazily when first needed
  }

  private getTransporter(): nodemailer.Transporter {
    if (!this.transporter) {
      const user = process.env.EMAIL_USER;
      const pass = process.env.EMAIL_PASS;

      if (!user || !pass) {
        const msg = "EMAIL_USER/EMAIL_PASS not configured";
        if (process.env.NODE_ENV === "production") throw new Error(msg);
        console.warn(msg);
        // Create a dummy transporter for development
        this.transporter = nodemailer.createTransport({
          service: "gmail",
          auth: {
            user: "dummy@example.com",
            pass: "dummy",
          },
        });
        return this.transporter;
      }

      // Create transporter using environment variables
      this.transporter = nodemailer.createTransport({
        service: "gmail", // You can change this to other services
        auth: {
          user,
          pass, // App password (not regular password)
        },
      });
    }
    return this.transporter;
  }

  /**
   * Escape HTML special characters to prevent injection
   */
  private escape(value: string): string {
    return String(value).replace(/[&<>"']/g, (c) => {
      switch (c) {
        case "&":
          return "&amp;";
        case "<":
          return "&lt;";
        case ">":
          return "&gt;";
        case '"':
          return "&quot;";
        case "'":
          return "&#39;";
        default:
          return c;
      }
    });
  }

  /**
   * Sanitize header values to prevent header injection
   */
  private sanitizeHeader(value: string): string {
    return String(value)
      .replace(/[\r\n]+/g, " ")
      .trim();
  }

  /**
   * Send booking confirmation email
   */
  async sendBookingConfirmation(bookingData: BookingData): Promise<boolean> {
    try {
      const fullName = `${bookingData.firstName}${bookingData.middleName ? ` ${bookingData.middleName}` : ""} ${bookingData.lastName}`;
      const formattedDate = this.formatDateForEmail(bookingData.selectedDate);
      const isOnlineMeeting = bookingData.meetingType === "online";

      const subject = this.sanitizeHeader(
        isOnlineMeeting
          ? `Online Meeting Confirmed - ${formattedDate} at ${bookingData.selectedTime}`
          : `In-Person Meeting Confirmed - ${formattedDate} at ${bookingData.selectedTime}`
      );

      const mailOptions = {
        from: `"Emotionwork Bookings" <${process.env.EMAIL_USER}>`,
        to: bookingData.email,
        subject,
        html: isOnlineMeeting
          ? this.generateOnlineMeetingEmailHTML(bookingData, fullName, formattedDate)
          : this.generateInPersonMeetingEmailHTML(bookingData, fullName, formattedDate),
        text: isOnlineMeeting
          ? this.generateOnlineMeetingEmailText(bookingData, fullName, formattedDate)
          : this.generateInPersonMeetingEmailText(bookingData, fullName, formattedDate),
      };

      await this.getTransporter().sendMail(mailOptions);
      console.log("Booking confirmation email sent");
      return true;
    } catch (error) {
      console.error("Error sending booking confirmation email:", error);
      return false;
    }
  }

  /**
   * Format date for email display
   */
  private formatDateForEmail(dateString: string): string {
    const [y, m, d] = dateString.split("-").map(Number);
    const date = new Date(y, (m || 1) - 1, d || 1);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }

  /**
   * Generate HTML email content
   */
  private generateConfirmationEmailHTML(bookingData: BookingData, fullName: string, formattedDate: string): string {
    return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Booking Confirmation</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .booking-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .detail-row { display: flex; justify-content: space-between; margin: 10px 0; padding: 8px 0; border-bottom: 1px solid #eee; }
        .detail-label { font-weight: bold; color: #555; }
        .detail-value { color: #333; }
        .highlight { background: #e8f4fd; padding: 15px; border-left: 4px solid #2196F3; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        .button { display: inline-block; background: #4CAF50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 10px 0; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>🎉 Booking Confirmed!</h1>
        <p>Your meeting has been successfully scheduled</p>
      </div>

      <div class="content">
        <h2>Hello ${this.escape(fullName)},</h2>
        <p>Thank you for booking a meeting with us! We're excited to discuss your project needs.</p>

        <div class="booking-details">
          <h3>📅 Meeting Details</h3>
          <div class="detail-row">
            <span class="detail-label">Date:</span>
            <span class="detail-value">${formattedDate}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Time:</span>
            <span class="detail-value">${this.escape(bookingData.selectedTime)}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Duration:</span>
            <span class="detail-value">1 hour</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Phone:</span>
            <span class="detail-value">${this.escape(bookingData.phoneNumber)}</span>
          </div>
          ${
            bookingData.description
              ? `
          <div class="detail-row">
            <span class="detail-label">Discussion Topic:</span>
            <span class="detail-value">${this.escape(bookingData.description || "")}</span>
          </div>
          `
              : ""
          }
        </div>

        <div class="highlight">
          <h3>📋 Important Information</h3>
          <ul>
            <li><strong>Meeting Duration:</strong> 1 hour</li>
            <li><strong>Preparation:</strong> Please arrive 5 minutes before your scheduled time</li>
            <li><strong>Rescheduling:</strong> Contact us at least 24 hours in advance if you need to reschedule</li>
            <li><strong>Questions:</strong> Feel free to reach out if you have any questions before the meeting</li>
          </ul>
        </div>

        <div style="text-align: center; margin: 30px 0;">
          <a href="mailto:${process.env.EMAIL_USER}" class="button">Contact Us</a>
        </div>

        ${
          bookingData.bookingId
            ? `
        <div class="highlight" style="background: #f0f9ff; padding: 20px; border-left: 4px solid #0ea5e9; margin: 20px 0;">
          <h3>🔧 Manage Your Booking</h3>
          <p>Need to cancel or modify your booking? Follow these steps:</p>
          <ol style="margin: 15px 0; padding-left: 20px;">
            <li>Visit our website: <strong>${process.env.NEXT_PUBLIC_BASE_URL || "https://emotionwork.vercel.app"}</strong></li>
            <li>Click on <strong>"Manage Booking"</strong> in the navigation menu</li>
            <li>Enter your Booking ID and email address</li>
          </ol>
          <div style="background: #fff3cd; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 4px solid #ffc107;">
            <p style="margin: 0; font-size: 14px; color: #856404;">
              <strong>You'll need these details:</strong><br>
              • Booking ID: <strong>${this.escape(bookingData.bookingId || "")}</strong><br>
              • Email: <strong>${this.escape(bookingData.email)}</strong>
            </p>
          </div>
          <p style="font-size: 12px; color: #666; margin-top: 10px;">
            Keep your Booking ID safe for future reference.
          </p>
        </div>
        `
            : ""
        }
      </div>

      <div class="footer">
        <p>This is an automated confirmation email. Please do not reply to this email.</p>
        <p>If you need to make changes to your booking, please contact us directly.</p>
        <p><strong>Emotionwork Team</strong></p>
      </div>
    </body>
    </html>
    `;
  }

  /**
   * Generate plain text email content
   */
  private generateConfirmationEmailText(bookingData: BookingData, fullName: string, formattedDate: string): string {
    return `
BOOKING CONFIRMATION

Hello ${fullName},

Thank you for booking a meeting with us! We're excited to discuss your project needs.

MEETING DETAILS:
- Date: ${formattedDate}
- Time: ${bookingData.selectedTime}
- Duration: 1 hour
- Phone: ${bookingData.phoneNumber}
${bookingData.description ? `- Discussion Topic: ${bookingData.description}` : ""}

IMPORTANT INFORMATION:
- Meeting Duration: 1 hour
- Preparation: Please arrive 5 minutes before your scheduled time
- Rescheduling: Contact us at least 24 hours in advance if you need to reschedule
- Questions: Feel free to reach out if you have any questions before the meeting

${
  bookingData.bookingId
    ? `
MANAGE YOUR BOOKING:
1. Visit our website: ${process.env.NEXT_PUBLIC_BASE_URL || "https://emotionwork.vercel.app"}
2. Click on "Manage Booking" in the navigation menu
3. Enter your Booking ID and email address below:

- Booking ID: ${bookingData.bookingId}
- Email: ${bookingData.email}

`
    : ""
}

If you need to make changes to your booking, please contact us directly.

Best regards,
Emotionwork Team

---
This is an automated confirmation email. Please do not reply to this email.
    `;
  }

  /**
   * Generate HTML email content for in-person meetings
   */
  private generateInPersonMeetingEmailHTML(bookingData: BookingData, fullName: string, formattedDate: string): string {
    return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>In-Person Meeting Confirmation</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .booking-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .detail-row { display: flex; justify-content: space-between; margin: 10px 0; padding: 8px 0; border-bottom: 1px solid #eee; }
        .detail-label { font-weight: bold; color: #555; }
        .detail-value { color: #333; }
        .highlight { background: #e8f4fd; padding: 15px; border-left: 4px solid #2196F3; margin: 20px 0; }
        .location { background: #f0f9ff; padding: 15px; border-left: 4px solid #0ea5e9; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        .button { display: inline-block; background: #4CAF50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 10px 0; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>🏢 In-Person Meeting Confirmed!</h1>
        <p>We look forward to meeting you in person</p>
      </div>

      <div class="content">
        <h2>Hello ${this.escape(fullName)},</h2>
        <p>Thank you for booking an in-person meeting with us! We're excited to discuss your project needs face-to-face.</p>

        <div class="booking-details">
          <h3>📅 Meeting Details</h3>
          <div class="detail-row">
            <span class="detail-label">Date:</span>
            <span class="detail-value">${formattedDate}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Time:</span>
            <span class="detail-value">${this.escape(bookingData.selectedTime)}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Duration:</span>
            <span class="detail-value">1 hour</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Meeting Type:</span>
            <span class="detail-value">In-Person</span>
          </div>
          ${
            bookingData.description
              ? `
          <div class="detail-row">
            <span class="detail-label">Discussion Topic:</span>
            <span class="detail-value">${this.escape(bookingData.description || "")}</span>
          </div>
          `
              : ""
          }
        </div>

        <div class="location">
          <h3>📍 Location Information</h3>
          <p><strong>Please arrive 5 minutes before your scheduled time.</strong></p>
          <p>Our office is located at:</p>
          <p style="font-weight: bold; margin: 10px 0;">
            #633, ST 75K, S/K KAKAP, KHAN POSENCHEY<br>
            PHNOM PENH CITY<br>
            POSTAL CODE: 120912
          </p>
          <p>Parking is available on-site. If you have any trouble finding us, please call us at the number provided below.</p>
        </div>

        <div class="highlight">
          <h3>📋 Important Information</h3>
          <ul>
            <li><strong>Meeting Duration:</strong> 1 hour</li>
            <li><strong>Arrival Time:</strong> Please arrive 5 minutes before your scheduled time</li>
            <li><strong>What to Bring:</strong> Any relevant documents or materials you'd like to discuss</li>
            <li><strong>Rescheduling:</strong> Contact us at least 24 hours in advance if you need to reschedule</li>
            <li><strong>Questions:</strong> Feel free to reach out if you have any questions before the meeting</li>
          </ul>
        </div>

        <div style="text-align: center; margin: 30px 0;">
          <a href="mailto:${process.env.EMAIL_USER}" class="button">Contact Us</a>
        </div>

        ${
          bookingData.bookingId
            ? `
        <div class="highlight" style="background: #f0f9ff; padding: 20px; border-left: 4px solid #0ea5e9; margin: 20px 0;">
          <h3>🔧 Manage Your Booking</h3>
          <p>Need to cancel or modify your booking? Follow these steps:</p>
          <ol style="margin: 15px 0; padding-left: 20px;">
            <li>Visit our website: <strong>${process.env.NEXT_PUBLIC_BASE_URL || "https://emotionwork.vercel.app"}</strong></li>
            <li>Click on <strong>"Manage Booking"</strong> in the navigation menu</li>
            <li>Enter your Booking ID and email address</li>
          </ol>
          <div style="background: #fff3cd; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 4px solid #ffc107;">
            <p style="margin: 0; font-size: 14px; color: #856404;">
              <strong>You'll need these details:</strong><br>
              • Booking ID: <strong>${this.escape(bookingData.bookingId || "")}</strong><br>
              • Email: <strong>${this.escape(bookingData.email)}</strong>
            </p>
          </div>
        </div>
        `
            : ""
        }
      </div>

      <div class="footer">
        <p>Best regards,<br>Emotionwork Team</p>
        <p style="font-size: 12px; color: #999; margin-top: 20px;">
          This is an automated confirmation email. Please do not reply to this email.
        </p>
      </div>
    </body>
    </html>
    `;
  }

  /**
   * Generate HTML email content for online meetings
   */
  private generateOnlineMeetingEmailHTML(bookingData: BookingData, fullName: string, formattedDate: string): string {
    return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Online Meeting Confirmation</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .booking-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .detail-row { display: flex; justify-content: space-between; margin: 10px 0; padding: 8px 0; border-bottom: 1px solid #eee; }
        .detail-label { font-weight: bold; color: #555; }
        .detail-value { color: #333; }
        .highlight { background: #ecfdf5; padding: 15px; border-left: 4px solid #10b981; margin: 20px 0; }
        .zoom-info { background: #f0f9ff; padding: 20px; border-left: 4px solid #0ea5e9; margin: 20px 0; text-align: center; }
        .join-button { display: inline-block; background: #0ea5e9; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; margin: 15px 0; font-weight: bold; font-size: 16px; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        .button { display: inline-block; background: #4CAF50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 10px 0; }
        .tech-requirements { background: #fef3c7; padding: 15px; border-left: 4px solid #f59e0b; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>💻 Online Meeting Confirmed!</h1>
        <p>Join us via Zoom for your virtual consultation</p>
      </div>

      <div class="content">
        <h2>Hello ${this.escape(fullName)},</h2>
        <p>Thank you for booking an online meeting with us! We're excited to discuss your project needs virtually.</p>

        <div class="booking-details">
          <h3>📅 Meeting Details</h3>
          <div class="detail-row">
            <span class="detail-label">Date:</span>
            <span class="detail-value">${formattedDate}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Time:</span>
            <span class="detail-value">${this.escape(bookingData.selectedTime)}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Duration:</span>
            <span class="detail-value">1 hour</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Meeting Type:</span>
            <span class="detail-value">Online (Zoom)</span>
          </div>
          ${
            bookingData.description
              ? `
          <div class="detail-row">
            <span class="detail-label">Discussion Topic:</span>
            <span class="detail-value">${this.escape(bookingData.description || "")}</span>
          </div>
          `
              : ""
          }
        </div>

        <div class="zoom-info">
          <h3>🔗 Join Your Meeting</h3>
          <p><strong>Click the button below to join your Zoom meeting:</strong></p>
          ${
            bookingData.meetingLink && /^https:\/\/[\w.-]*zoom\.us\/j\/\d+/.test(bookingData.meetingLink)
              ? `
          <a href="${this.escape(bookingData.meetingLink)}" class="join-button">🎯 Join Meeting Now</a>
          <p style="margin: 10px 0; font-size: 14px; color: #666;">
            Meeting Link: <a href="${this.escape(bookingData.meetingLink)}" style="color: #0ea5e9;">${this.escape(bookingData.meetingLink)}</a>
          </p>
          `
              : `
          <p style="color: #dc2626; font-weight: bold;">Meeting link will be provided closer to the meeting time.</p>
          `
          }
          <p style="font-size: 14px; color: #666; margin-top: 15px;">
            <strong>No Zoom account required!</strong> You can join as a guest.
          </p>
        </div>

        <div class="tech-requirements">
          <h3>💻 Technical Requirements</h3>
          <ul style="margin: 10px 0; padding-left: 20px;">
            <li><strong>Internet Connection:</strong> Stable broadband connection recommended</li>
            <li><strong>Device:</strong> Computer, tablet, or smartphone with camera and microphone</li>
            <li><strong>Browser:</strong> Latest version of Chrome, Firefox, Safari, or Edge</li>
            <li><strong>Audio:</strong> Headphones or speakers for clear audio</li>
            <li><strong>Backup:</strong> Have your phone ready as a backup device</li>
          </ul>
        </div>

        <div class="highlight">
          <h3>📋 Important Information</h3>
          <ul>
            <li><strong>Meeting Duration:</strong> 1 hour</li>
            <li><strong>Join Time:</strong> Please join 2-3 minutes before your scheduled time</li>
            <li><strong>Preparation:</strong> Test your camera and microphone before the meeting</li>
            <li><strong>Environment:</strong> Choose a quiet, well-lit location for the meeting</li>
            <li><strong>Rescheduling:</strong> Contact us at least 24 hours in advance if you need to reschedule</li>
            <li><strong>Technical Issues:</strong> If you have trouble joining, contact us immediately</li>
          </ul>
        </div>

        <div style="text-align: center; margin: 30px 0;">
          <a href="mailto:${process.env.EMAIL_USER}" class="button">Contact Us</a>
        </div>

        ${
          bookingData.bookingId
            ? `
        <div class="highlight" style="background: #f0f9ff; padding: 20px; border-left: 4px solid #0ea5e9; margin: 20px 0;">
          <h3>🔧 Manage Your Booking</h3>
          <p>Need to cancel or modify your booking? Follow these steps:</p>
          <ol style="margin: 15px 0; padding-left: 20px;">
            <li>Visit our website: <strong>${process.env.NEXT_PUBLIC_BASE_URL || "https://emotionwork.vercel.app"}</strong></li>
            <li>Click on <strong>"Manage Booking"</strong> in the navigation menu</li>
            <li>Enter your Booking ID and email address</li>
          </ol>
          <div style="background: #fff3cd; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 4px solid #ffc107;">
            <p style="margin: 0; font-size: 14px; color: #856404;">
              <strong>You'll need these details:</strong><br>
              • Booking ID: <strong>${this.escape(bookingData.bookingId || "")}</strong><br>
              • Email: <strong>${this.escape(bookingData.email)}</strong>
            </p>
          </div>
        </div>
        `
            : ""
        }
      </div>

      <div class="footer">
        <p>Best regards,<br>Emotionwork Team</p>
        <p style="font-size: 12px; color: #999; margin-top: 20px;">
          This is an automated confirmation email. Please do not reply to this email.
        </p>
      </div>
    </body>
    </html>
    `;
  }

  /**
   * Generate text email content for in-person meetings
   */
  private generateInPersonMeetingEmailText(bookingData: BookingData, fullName: string, formattedDate: string): string {
    return `
Hello ${fullName},

Thank you for booking an in-person meeting with us! We're excited to discuss your project needs face-to-face.

MEETING DETAILS:
- Date: ${formattedDate}
- Time: ${bookingData.selectedTime}
- Duration: 1 hour
- Meeting Type: In-Person
${bookingData.description ? `- Discussion Topic: ${bookingData.description}` : ""}

LOCATION INFORMATION:
Please arrive 5 minutes before your scheduled time.

Our office is located at:
#633, ST 75K, S/K KAKAP, KHAN POSENCHEY
PHNOM PENH CITY
POSTAL CODE: 120912

Parking is available on-site. If you have any trouble finding us, please call us.

IMPORTANT INFORMATION:
- Meeting Duration: 1 hour
- Arrival Time: Please arrive 5 minutes before your scheduled time
- What to Bring: Any relevant documents or materials you'd like to discuss
- Rescheduling: Contact us at least 24 hours in advance if you need to reschedule
- Questions: Feel free to reach out if you have any questions before the meeting

${
  bookingData.bookingId
    ? `
MANAGE YOUR BOOKING:
Need to cancel or modify your booking? Follow these steps:
1. Visit our website: ${process.env.NEXT_PUBLIC_BASE_URL || "https://emotionwork.vercel.app"}
2. Click on "Manage Booking" in the navigation menu
3. Enter your Booking ID and email address

You'll need these details:
- Booking ID: ${bookingData.bookingId}
- Email: ${bookingData.email}
`
    : ""
}

Best regards,
Emotionwork Team

---
This is an automated confirmation email. Please do not reply to this email.
    `;
  }

  /**
   * Generate text email content for online meetings
   */
  private generateOnlineMeetingEmailText(bookingData: BookingData, fullName: string, formattedDate: string): string {
    return `
Hello ${fullName},

Thank you for booking an online meeting with us! We're excited to discuss your project needs virtually.

MEETING DETAILS:
- Date: ${formattedDate}
- Time: ${bookingData.selectedTime}
- Duration: 1 hour
- Meeting Type: Online (Zoom)
${bookingData.description ? `- Discussion Topic: ${bookingData.description}` : ""}

JOIN YOUR MEETING:
${
  bookingData.meetingLink
    ? `
Click here to join your Zoom meeting: ${bookingData.meetingLink}

Meeting Link: ${bookingData.meetingLink}
`
    : "Meeting link will be provided closer to the meeting time."
}

No Zoom account required! You can join as a guest.

TECHNICAL REQUIREMENTS:
- Internet Connection: Stable broadband connection recommended
- Device: Computer, tablet, or smartphone with camera and microphone
- Browser: Latest version of Chrome, Firefox, Safari, or Edge
- Audio: Headphones or speakers for clear audio
- Backup: Have your phone ready as a backup device

IMPORTANT INFORMATION:
- Meeting Duration: 1 hour
- Join Time: Please join 2-3 minutes before your scheduled time
- Preparation: Test your camera and microphone before the meeting
- Environment: Choose a quiet, well-lit location for the meeting
- Rescheduling: Contact us at least 24 hours in advance if you need to reschedule
- Technical Issues: If you have trouble joining, contact us immediately

${
  bookingData.bookingId
    ? `
MANAGE YOUR BOOKING:
Need to cancel or modify your booking? Follow these steps:
1. Visit our website: ${process.env.NEXT_PUBLIC_BASE_URL || "https://emotionwork.vercel.app"}
2. Click on "Manage Booking" in the navigation menu
3. Enter your Booking ID and email address

You'll need these details:
- Booking ID: ${bookingData.bookingId}
- Email: ${bookingData.email}
`
    : ""
}

Best regards,
Emotionwork Team

---
This is an automated confirmation email. Please do not reply to this email.
    `;
  }

  /**
   * Test email configuration
   */
  async testConnection(): Promise<boolean> {
    try {
      await this.getTransporter().verify();
      console.log("Email service connection successful");
      return true;
    } catch (error) {
      console.error("Email service connection failed:", error);
      return false;
    }
  }
}

export const emailService = new EmailService();
