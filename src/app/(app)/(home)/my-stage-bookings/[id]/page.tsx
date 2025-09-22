"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
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
  Mail,
  Building,
  Home,
  DollarSign,
  MessageSquare,
  User
} from "lucide-react";

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
    eventDate: string;
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
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const [booking, setBooking] = useState<StageBooking | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/sign-in");
      return;
    }

    if (status === "authenticated" && params.id) {
      fetchBooking();
    }
  }, [status, router, params.id]);

  const fetchBooking = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/stage-bookings/${params.id}`);
      
      if (!response.ok) {
        throw new Error("Failed to fetch booking details");
      }

      const data = await response.json();
      setBooking(data.booking);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

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
    window.open(file.url, "_blank");
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
            {getStatusBadge(booking.status)}
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
                      <p className="text-sm font-medium text-gray-900">Event Date</p>
                      <p className="text-sm text-gray-600">{formatDate(booking.stageDetails.eventDate)}</p>
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

            {/* Estimated Cost */}
            {booking.estimatedCost && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <DollarSign className="h-5 w-5 mr-2" />
                    Estimated Cost
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <p className="text-3xl font-bold text-green-600">
                      ${booking.estimatedCost.toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">Final pricing may vary</p>
                  </div>
                </CardContent>
              </Card>
            )}

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
      </div>
    </div>
  );
}

