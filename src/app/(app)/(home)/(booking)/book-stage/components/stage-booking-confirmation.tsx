"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  FileText, 
  Image, 
  Edit, 
  CheckCircle,
  AlertCircle,
  Package
} from "lucide-react";

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
    eventDates: string[]; // Changed from eventDate to eventDates array
    eventTime: string;
    duration: number;
    expectedGuests: number;
    specialRequirements?: string;
  };
  designFiles: File[];
  equipmentItems?: any[];
}

interface StageBookingConfirmationProps {
  bookingData: StageBookingFormData;
  onEdit: () => void;
  onConfirm: () => void;
  isLoading: boolean;
}

export function StageBookingConfirmation({
  bookingData,
  onEdit,
  onConfirm,
  isLoading,
}: StageBookingConfirmationProps) {
  
  const getEquipmentTotal = (equipmentItems: any[]) => {
    if (!equipmentItems || equipmentItems.length === 0) return 0;
    return equipmentItems.reduce((total, item) => {
      if (item.rentalType === 'daily') {
        return total + (item.dailyPrice * item.quantity * item.rentalDays);
      }
      const fullWeeks = Math.floor(item.rentalDays / 7);
      const remainingDays = item.rentalDays % 7;
      const weekly = item.weeklyPrice * item.quantity * fullWeeks;
      const daily = item.dailyPrice * item.quantity * remainingDays;
      return total + weekly + daily;
    }, 0);
  };
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const getFileIcon = (file: File) => {
    if (file.type.startsWith("image/")) {
      // eslint-disable-next-line jsx-a11y/alt-text
      return <Image className="h-4 w-4" />;
    }
    return <FileText className="h-4 w-4" />;
  };

  const formatEventType = (type: string) => {
    const types: Record<string, string> = {
      concert: "Concert",
      wedding: "Wedding",
      corporate: "Corporate Event",
      festival: "Festival",
      conference: "Conference",
      exhibition: "Exhibition",
      party: "Private Party",
      other: "Other",
    };
    return types[type] || type;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
          <CheckCircle className="h-8 w-8 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Review Your Stage Booking</h2>
        <p className="text-gray-600">
          Please review your booking details before submitting. You can edit any information if needed.
        </p>
      </div>

      {/* Personal Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="h-2 w-2 bg-blue-600 rounded-full"></span>
            Personal Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-500">Full Name</p>
              <p className="text-gray-900">
                {bookingData.userProfile.firstName} {bookingData.userProfile.lastName}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Phone Number</p>
              <p className="text-gray-900">{bookingData.userProfile.phone}</p>
            </div>
          </div>
          
          {bookingData.userProfile.company && (
            <div>
              <p className="text-sm font-medium text-gray-500">Company</p>
              <p className="text-gray-900">{bookingData.userProfile.company}</p>
            </div>
          )}
          
          {bookingData.userProfile.address && (
            <div>
              <p className="text-sm font-medium text-gray-500">Address</p>
              <p className="text-gray-900">{bookingData.userProfile.address}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Stage Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="h-2 w-2 bg-green-600 rounded-full"></span>
            Stage Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-500">Event Location</p>
                <p className="text-gray-900">{bookingData.stageDetails.location}</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <Users className="h-5 w-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-500">Event Type</p>
                <Badge variant="secondary" className="mt-1">
                  {formatEventType(bookingData.stageDetails.eventType)}
                </Badge>
              </div>
            </div>
          </div>

          <Separator />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-start gap-3">
              <Calendar className="h-5 w-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-500">Event Dates</p>
                <div className="space-y-1">
                  {bookingData.stageDetails.eventDates && bookingData.stageDetails.eventDates.length > 0 ? (
                    bookingData.stageDetails.eventDates.map((date, index) => (
                      <p key={index} className="text-gray-900">{formatDate(date)}</p>
                    ))
                  ) : (
                    <p className="text-gray-500 italic">No dates specified</p>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <Clock className="h-5 w-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-500">Event Time</p>
                <p className="text-gray-900">{formatTime(bookingData.stageDetails.eventTime)}</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <Clock className="h-5 w-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-500">Duration</p>
                <p className="text-gray-900">{bookingData.stageDetails.duration} hours</p>
              </div>
            </div>
          </div>

          <Separator />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-500">Expected Guests</p>
              <p className="text-gray-900">{bookingData.stageDetails.expectedGuests} people</p>
            </div>
          </div>

          {bookingData.stageDetails.specialRequirements && (
            <>
              <Separator />
              <div>
                <p className="text-sm font-medium text-gray-500">Special Requirements</p>
                <p className="text-gray-900 mt-1">{bookingData.stageDetails.specialRequirements}</p>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Design Files */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="h-2 w-2 bg-purple-600 rounded-full"></span>
            Design Files ({bookingData.designFiles.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {bookingData.designFiles.map((file, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  {getFileIcon(file)}
                  <div>
                    <p className="text-sm font-medium text-gray-900">{file.name}</p>
                    <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                  </div>
                </div>
                <Badge variant="outline" className="text-xs">
                  {file.type.split('/')[0]}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Important Notice */}
      <Card className="border-orange-200 bg-orange-50">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-orange-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-orange-900 mb-1">Important Notice</h4>
              <p className="text-sm text-orange-800">
                Your stage booking request will be reviewed by our team within 24 hours. 
                We&apos;ll contact you with pricing information and next steps. Please ensure all 
                information is accurate before submitting.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Equipment Items */}
      {bookingData.equipmentItems && bookingData.equipmentItems.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="h-2 w-2 bg-orange-600 rounded-full"></span>
              Equipment Rental ({bookingData.equipmentItems.length} items)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {bookingData.equipmentItems.map((item) => {
                const totalPrice = (() => {
                  if (item.rentalType === 'daily') {
                    return item.dailyPrice * item.quantity * item.rentalDays;
                  }
                  const fullWeeks = Math.floor(item.rentalDays / 7);
                  const remainingDays = item.rentalDays % 7;
                  const weekly = item.weeklyPrice * item.quantity * fullWeeks;
                  const daily = item.dailyPrice * item.quantity * remainingDays;
                  return weekly + daily;
                })();
                
                return (
                  <div key={item.id} className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Package className="h-6 w-6 text-orange-600" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900">{item.equipment.name}</h4>
                          <p className="text-sm text-gray-600 mb-2">{item.equipment.category}</p>
                          
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-gray-500">Quantity:</span>
                              <span className="ml-1 font-medium">{item.quantity}</span>
                            </div>
                            <div>
                              <span className="text-gray-500">Duration:</span>
                              <span className="ml-1 font-medium">
                                {item.rentalDays} day(s)
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-500">Rate:</span>
                              <span className="ml-1 font-medium">
                                ${item.rentalType === 'daily' ? item.dailyPrice : item.weeklyPrice}/{item.rentalType === 'daily' ? 'day' : 'week'}
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-500">Subtotal:</span>
                              <span className="ml-1 font-semibold text-orange-600">${totalPrice}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
              
              <div className="bg-orange-100 border border-orange-300 rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-semibold text-orange-800">Equipment Rental Summary</h4>
                    <p className="text-sm text-orange-600">
                      {bookingData.equipmentItems.length} item(s) • {bookingData.equipmentItems.reduce((sum, item) => sum + item.quantity, 0)} total units
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-orange-800">${getEquipmentTotal(bookingData.equipmentItems)}</p>
                    <p className="text-sm text-orange-600">Total Equipment Cost</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 justify-end">
        <Button
          variant="outline"
          onClick={onEdit}
          disabled={isLoading}
          className="flex items-center gap-2"
        >
          <Edit className="h-4 w-4" />
          Edit Details
        </Button>
        <Button
          onClick={onConfirm}
          disabled={isLoading}
          className="flex items-center gap-2 px-8"
        >
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Submitting...
            </>
          ) : (
            <>
              <CheckCircle className="h-4 w-4" />
              Submit Booking Request
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

