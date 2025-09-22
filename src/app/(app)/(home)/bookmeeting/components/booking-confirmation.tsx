"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ArrowLeft,
  Calendar,
  CheckCircle,
  Clock,
  ExternalLink,
  Mail,
  MapPin,
  MessageSquare,
  Phone,
  User,
  Video,
} from "lucide-react";
import { formatDateForDisplay } from "../utils/time-slots";

interface BookingData {
  firstName: string;
  middleName: string;
  lastName: string;
  phoneNumber: string;
  email: string;
  description: string;
  selectedDate: string;
  selectedTime: string;
  meetingType: "in-person" | "online";
  meetingLink?: string;
}

interface BookingConfirmationProps {
  bookingData: BookingData;
  onEdit: () => void;
  onConfirm: () => void;
  isLoading?: boolean;
}

export function BookingConfirmation({ bookingData, onEdit, onConfirm, isLoading = false }: BookingConfirmationProps) {
  const fullName = `${bookingData.firstName}${bookingData.middleName ? ` ${bookingData.middleName}` : ""} ${bookingData.lastName}`;

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      {/* Success Header */}
      <Card className="border-green-200 bg-green-50">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="rounded-full bg-green-100 p-3">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </div>
          <CardTitle className="text-2xl text-green-800">Booking Summary</CardTitle>
          <CardDescription className="text-green-700">
            Please review your booking details before confirming
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Booking Details */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Meeting Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Date</span>
              </div>
              <p className="text-lg font-semibold">{formatDateForDisplay(bookingData.selectedDate)}</p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Time</span>
              </div>
              <Badge variant="outline" className="text-lg px-3 py-1">
                {bookingData.selectedTime}
              </Badge>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              {bookingData.meetingType === "online" ? (
                <Video className="h-4 w-4 text-green-600" />
              ) : (
                <MapPin className="h-4 w-4 text-blue-600" />
              )}
              <span className="text-sm font-medium">Meeting Type</span>
            </div>
            <Badge
              variant={bookingData.meetingType === "online" ? "default" : "secondary"}
              className={`text-sm px-3 py-1 ${
                bookingData.meetingType === "online"
                  ? "bg-green-100 text-green-800 hover:bg-green-200"
                  : "bg-blue-100 text-blue-800 hover:bg-blue-200"
              }`}
            >
              {bookingData.meetingType === "online" ? "Online (Zoom)" : "In-Person"}
            </Badge>
          </div>

          {bookingData.description && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Discussion Topic</span>
              </div>
              <p className="text-sm bg-muted p-3 rounded-md">{bookingData.description}</p>
            </div>
          )}

          {bookingData.meetingType === "online" && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Video className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium">Zoom Meeting</span>
              </div>
              {bookingData.meetingLink ? (
                <div className="bg-green-50 border border-green-200 rounded-md p-4">
                  <p className="text-sm text-green-800 mb-3">
                    <strong>Join your meeting using the link below:</strong>
                  </p>
                  {/^https:\/\/[\w.-]*zoom\.us\/j\/\d+/.test(bookingData.meetingLink || "") ? (
                    <Button asChild className="w-full bg-green-600 hover:bg-green-700 text-white">
                      <a
                        href={bookingData.meetingLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2"
                      >
                        <Video className="h-4 w-4" />
                        Join Zoom Meeting
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </Button>
                  ) : (
                    <div className="w-full bg-gray-100 text-gray-600 px-4 py-2 rounded-md text-center">
                      <Video className="h-4 w-4 inline mr-2" />
                      Meeting link is not available or invalid
                    </div>
                  )}
                  <p className="text-xs text-green-600 mt-2">No Zoom account required - you can join as a guest</p>
                </div>
              ) : (
                <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                  <p className="text-sm text-yellow-800">
                    <strong>Meeting link will be provided closer to the meeting time.</strong>
                  </p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Contact Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <User className="h-5 w-5 text-primary" />
            Contact Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Full Name</span>
            </div>
            <p className="text-lg">{fullName}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Phone Number</span>
              </div>
              <p className="text-sm">{bookingData.phoneNumber}</p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Email Address</span>
              </div>
              <p className="text-sm">{bookingData.email}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Important Notes */}
      <Card className={`border-amber-200 ${bookingData.meetingType === "online" ? "bg-green-50" : "bg-amber-50"}`}>
        <CardContent className="pt-6">
          <h4
            className={`font-semibold mb-3 ${bookingData.meetingType === "online" ? "text-green-800" : "text-amber-800"}`}
          >
            Important Notes
          </h4>
          <ul
            className={`text-sm space-y-2 ${bookingData.meetingType === "online" ? "text-green-700" : "text-amber-700"}`}
          >
            <li className="flex items-start gap-2">
              <span className={`mt-1 ${bookingData.meetingType === "online" ? "text-green-600" : "text-amber-600"}`}>
                •
              </span>
              <span>You will receive a confirmation email shortly with meeting details.</span>
            </li>
            {bookingData.meetingType === "online" ? (
              <>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-1">•</span>
                  <span>Please join 2-3 minutes before your scheduled time.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-1">•</span>
                  <span>Test your camera and microphone before the meeting.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-1">•</span>
                  <span>Choose a quiet, well-lit location for the meeting.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-1">•</span>
                  <span>No Zoom account required - you can join as a guest.</span>
                </li>
              </>
            ) : (
              <>
                <li className="flex items-start gap-2">
                  <span className="text-amber-600 mt-1">•</span>
                  <span>Please arrive 5 minutes before your scheduled time.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-600 mt-1">•</span>
                  <span>Bring any relevant documents or materials you&apos;d like to discuss.</span>
                </li>
              </>
            )}
            <li className="flex items-start gap-2">
              <span className={`mt-1 ${bookingData.meetingType === "online" ? "text-green-600" : "text-amber-600"}`}>
                •
              </span>
              <span>If you need to reschedule, please contact us at least 24 hours in advance.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className={`mt-1 ${bookingData.meetingType === "online" ? "text-green-600" : "text-amber-600"}`}>
                •
              </span>
              <span>Meeting duration is 1 hour. Additional time may be subject to availability.</span>
            </li>
          </ul>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Button variant="outline" onClick={onEdit} className="flex items-center gap-2" disabled={isLoading}>
          <ArrowLeft className="h-4 w-4" />
          Edit Booking
        </Button>
        <Button onClick={onConfirm} className="flex-1 flex items-center gap-2" disabled={isLoading}>
          {isLoading ? (
            <>
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              Confirming...
            </>
          ) : (
            <>
              <CheckCircle className="h-4 w-4" />
              Confirm Booking
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
