"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { useCart } from "@/contexts/CartContext";
import { 
  Calendar, 
  MapPin, 
  Users, 
  Clock, 
  FileText, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Loader2,
  ArrowLeft,
  Download,
  Phone,
  Building,
  Home,
  DollarSign,
  MessageSquare,
  User,
  Edit,
  Package
} from "lucide-react";
import { StageBookingEditForm } from "../../book-stage/components/stage-booking-edit-form";
import { stageBookingService } from "../../book-stage/services/stage-booking-service";
import { toast } from "sonner";

interface StageBooking {
  _id: string;
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
    eventDates?: string[]; // Made optional to handle legacy data
    eventTime: string;
    duration: number;
    expectedGuests: number;
    specialRequirements?: string;
  };
  designFiles: {
    filename: string;
    originalName: string;
    url: string;
    publicId: string;
    mimeType: string;
    size: number;
  }[];
  equipmentItems?: {
    id: string;
    equipment: {
      _id: string;
      name: string;
      category: string;
      imageUrl?: string;
    };
    quantity: number;
    rentalType: 'daily' | 'weekly';
    rentalDays: number;
    dailyPrice: number;
    weeklyPrice: number;
  }[];
  status: "pending" | "approved" | "rejected" | "in_progress" | "completed";
  adminNotes?: string;
  estimatedCost?: number;
  createdAt: string;
  updatedAt: string;
}

const statusConfig = {
  pending: { 
    label: "Pending Review", 
    color: "bg-yellow-100 text-yellow-800", 
    icon: Clock,
    description: "Your booking is being reviewed by our team"
  },
  approved: { 
    label: "Approved", 
    color: "bg-green-100 text-green-800", 
    icon: CheckCircle,
    description: "Your booking has been approved! We'll contact you soon."
  },
  rejected: { 
    label: "Rejected", 
    color: "bg-red-100 text-red-800", 
    icon: XCircle,
    description: "Unfortunately, your booking could not be approved at this time."
  },
  in_progress: { 
    label: "In Progress", 
    color: "bg-blue-100 text-blue-800", 
    icon: Loader2,
    description: "We're working on your stage setup!"
  },
  completed: { 
    label: "Completed", 
    color: "bg-purple-100 text-purple-800", 
    icon: CheckCircle,
    description: "Your stage has been completed successfully!"
  },
};

export default function StageBookingDetailsPage() {
  const { status } = useSession();
  const router = useRouter();
  const params = useParams();
  const { clearCart } = useCart();
  const [booking, setBooking] = useState<StageBooking | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchBooking = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/stage-bookings/${params.id}`);
      
      if (!response.ok) {
        throw new Error("Failed to fetch booking details");
      }

      const data = await response.json();
      // Ensure equipmentItems is a proper array
      if (data.equipmentItems && !Array.isArray(data.equipmentItems)) {
        data.equipmentItems = [];
      }
      
      setBooking(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  }, [params.id]);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/sign-in");
      return;
    }

    if (status === "authenticated" && params.id) {
      fetchBooking();
    }
  }, [status, router, params.id, fetchBooking]);

  // Check for edit query parameter
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('edit') === 'true') {
      setIsEditing(true);
    }
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (timeString: string) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const getStatusBadge = (status: StageBooking["status"]) => {
    const config = statusConfig[status];
    const Icon = config.icon;
    
    return (
      <Badge className={`${config.color} border-0`}>
        <Icon className="w-3 h-3 mr-1" />
        {config.label}
      </Badge>
    );
  };

  const handleDownloadFile = (file: StageBooking["designFiles"][0]) => {
    window.open(file.url, "_blank", "noopener,noreferrer");
  };

  const getEquipmentTotal = (equipmentItems: StageBooking["equipmentItems"]) => {
    if (!equipmentItems || !Array.isArray(equipmentItems) || equipmentItems.length === 0) return 0;
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

  const handleEditBooking = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    // Clear the cart when cancelling edit to prevent stale data
    clearCart();
  };

  const handleUpdateBooking = async (formData: any) => {
    if (!booking) return;

    setIsUpdating(true);
    try {
      const result = await stageBookingService.updateBooking(booking._id, formData);

      if (result.success) {
        toast.success("Booking Updated!", {
          description: "Your stage booking has been updated successfully.",
          duration: 5000,
        });
        setIsEditing(false);
        // Clear the cart to prevent stale data
        clearCart();
        // Refresh the booking data
        await fetchBooking();
      } else {
        toast.error("Update Failed", {
          description: result.error || "Please try again.",
          duration: 5000,
        });
      }
    } catch (error) {
      console.error("Booking update failed:", error);
      toast.error("Update Failed", {
        description: "Please try again.",
        duration: 5000,
      });
    } finally {
      setIsUpdating(false);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <Skeleton className="h-8 w-64 mb-2" />
            <Skeleton className="h-4 w-96" />
          </div>
          
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-48" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Alert className="mb-8">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Alert className="mb-8">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>Booking not found</AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  const statusInfo = statusConfig[booking.status];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => router.push("/my-stage-bookings")}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to My Bookings
          </Button>
          
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Booking Details
              </h1>
              <p className="text-gray-600">
                {booking.stageDetails.eventType} - {booking.stageDetails.location}
              </p>
            </div>
            <div className="flex items-center gap-3">
              {booking.status === "pending" && (
                <Button
                  onClick={handleEditBooking}
                  variant="outline"
                  disabled={isUpdating}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Booking
                </Button>
              )}
              {getStatusBadge(booking.status)}
            </div>
          </div>
        </div>

        {/* Status Alert */}
        <Alert className={`mb-8 ${
          booking.status === "approved" ? "bg-green-50 border-green-200" :
          booking.status === "rejected" ? "bg-red-50 border-red-200" :
          booking.status === "in_progress" ? "bg-blue-50 border-blue-200" :
          booking.status === "completed" ? "bg-purple-50 border-purple-200" :
          "bg-yellow-50 border-yellow-200"
        }`}>
          <statusInfo.icon className={`h-4 w-4 ${
            booking.status === "approved" ? "text-green-600" :
            booking.status === "rejected" ? "text-red-600" :
            booking.status === "in_progress" ? "text-blue-600" :
            booking.status === "completed" ? "text-purple-600" :
            "text-yellow-600"
          }`} />
          <AlertDescription className={`${
            booking.status === "approved" ? "text-green-800" :
            booking.status === "rejected" ? "text-red-800" :
            booking.status === "in_progress" ? "text-blue-800" :
            booking.status === "completed" ? "text-purple-800" :
            "text-yellow-800"
          }`}>
            {statusInfo.description}
          </AlertDescription>
        </Alert>

        {/* Edit Form */}
        {isEditing && (
          <div className="mb-8">
            <StageBookingEditForm
              bookingData={{
                ...booking,
                stageDetails: {
                  ...booking.stageDetails,
                  eventDates: booking.stageDetails.eventDates || []
                }
              }}
              onSubmit={handleUpdateBooking}
              onCancel={handleCancelEdit}
              isLoading={isUpdating}
            />
          </div>
        )}

        {/* Main Content - only show when not editing */}
        {!isEditing && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Event Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="h-5 w-5 mr-2" />
                  Event Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-3 text-gray-500" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Event Dates</p>
                      <div className="space-y-1">
                        {booking.stageDetails.eventDates && booking.stageDetails.eventDates.length > 0 ? (
                          booking.stageDetails.eventDates.map((date, index) => (
                            <p key={index} className="text-sm text-gray-600">{formatDate(date)}</p>
                          ))
                        ) : (
                          <p className="text-sm text-gray-500 italic">No dates specified</p>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-3 text-gray-500" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Event Time</p>
                      <p className="text-sm text-gray-600">
                        {formatTime(booking.stageDetails.eventTime)} ({booking.stageDetails.duration} hours)
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-3 text-gray-500" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Location</p>
                      <p className="text-sm text-gray-600">{booking.stageDetails.location}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <Users className="h-4 w-4 mr-3 text-gray-500" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Expected Guests</p>
                      <p className="text-sm text-gray-600">{booking.stageDetails.expectedGuests}</p>
                    </div>
                  </div>
                </div>
                
                {booking.stageDetails.specialRequirements && (
                  <>
                    <Separator />
                    <div>
                      <p className="text-sm font-medium text-gray-900 mb-2">Special Requirements</p>
                      <p className="text-sm text-gray-600">{booking.stageDetails.specialRequirements}</p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Design Files */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="h-5 w-5 mr-2" />
                  Design Files ({booking.designFiles.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {booking.designFiles.map((file, index) => (
                    <div key={index} className="flex items-center justify-between bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-center">
                        <FileText className="h-5 w-5 mr-3 text-gray-500" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">{file.originalName}</p>
                          <p className="text-xs text-gray-500">{formatFileSize(file.size)} • {file.mimeType}</p>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDownloadFile(file)}
                      >
                        <Download className="h-3 w-3 mr-1" />
                        Download
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Equipment Items */}
            
            {booking.equipmentItems && booking.equipmentItems.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Package className="h-5 w-5 mr-2" />
                    Equipment Rental ({booking.equipmentItems.length} items)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {booking.equipmentItems.map((item) => {
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
                            <div className="flex items-start gap-4">
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
                    <div className="flex justify-between items-center pt-4 border-t border-orange-200">
                      <span className="font-semibold text-lg text-orange-800">Equipment Total:</span>
                      <span className="font-bold text-xl text-orange-800">${getEquipmentTotal(booking.equipmentItems)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Admin Notes */}
            {booking.adminNotes && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <MessageSquare className="h-5 w-5 mr-2" />
                    Admin Notes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-blue-800">{booking.adminNotes}</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="h-5 w-5 mr-2" />
                  Contact Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center">
                  <User className="h-4 w-4 mr-3 text-gray-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {booking.userProfile.firstName} {booking.userProfile.lastName}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <Phone className="h-4 w-4 mr-3 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-600">{booking.userProfile.phone}</p>
                  </div>
                </div>
                
                {booking.userProfile.company && (
                  <div className="flex items-center">
                    <Building className="h-4 w-4 mr-3 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-600">{booking.userProfile.company}</p>
                    </div>
                  </div>
                )}
                
                {booking.userProfile.address && (
                  <div className="flex items-center">
                    <Home className="h-4 w-4 mr-3 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-600">{booking.userProfile.address}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Cost Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <DollarSign className="h-5 w-5 mr-2" />
                  Cost Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Equipment Rental Cost - Always show if equipment is selected */}
                  {booking.equipmentItems && booking.equipmentItems.length > 0 ? (
                    <div className="bg-green-50 rounded-lg p-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-semibold text-green-900">Equipment Rental:</p>
                          <p className="text-sm text-green-700">
                            {booking.equipmentItems.length} item(s) • {booking.equipmentItems.reduce((sum, item) => sum + item.quantity, 0)} units
                          </p>
                        </div>
                        <p className="text-xl font-bold text-green-900">
                          ${getEquipmentTotal(booking.equipmentItems).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-gray-500 text-center">No equipment selected</p>
                    </div>
                  )}
                  
                  
                  {/* Stage Setup Cost - Only show if admin has provided it */}
                  {booking.estimatedCost && (
                    <div className="bg-blue-50 rounded-lg p-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-semibold text-blue-900">Stage Setup & Services:</p>
                          <p className="text-sm text-blue-700">Custom stage design and setup</p>
                        </div>
                        <p className="text-xl font-bold text-blue-900">
                          ${booking.estimatedCost.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  )}
                  
                  {/* Total Cost - Show if there are any costs */}
                  {((booking.equipmentItems && booking.equipmentItems.length > 0) || booking.estimatedCost) && (
                    <div className="bg-gray-50 rounded-lg p-4 border-2 border-gray-200">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-bold text-lg text-gray-900">Total Estimated:</p>
                          <p className="text-sm text-gray-600">Final pricing may vary</p>
                        </div>
                        <p className="text-2xl font-bold text-gray-900">
                          ${((booking.equipmentItems && booking.equipmentItems.length > 0 ? getEquipmentTotal(booking.equipmentItems) : 0) + (booking.estimatedCost || 0)).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  )}
                  
                  {/* Show message if no costs available */}
                  {(!booking.equipmentItems || booking.equipmentItems.length === 0) && !booking.estimatedCost && (
                    <div className="text-center py-8">
                      <p className="text-gray-500">No cost information available yet</p>
                      <p className="text-sm text-gray-400 mt-1">Cost will be provided after review</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Booking Timeline */}
            <Card>
              <CardHeader>
                <CardTitle>Booking Timeline</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Booking Submitted</p>
                    <p className="text-xs text-gray-500">{formatDate(booking.createdAt)}</p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <div className={`w-2 h-2 rounded-full mr-3 ${
                    booking.status === "pending" ? "bg-yellow-500" :
                    booking.status === "approved" || booking.status === "in_progress" || booking.status === "completed" ? "bg-green-500" :
                    "bg-red-500"
                  }`}></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Status Updated</p>
                    <p className="text-xs text-gray-500">{formatDate(booking.updatedAt)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        )}
      </div>
    </div>
  );
}

