"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { StageBooking } from "@/lib/db";
import { Calendar, Clock, DollarSign, ExternalLink, Eye, FileText, Image, MapPin, Package, Search, Trash2, Users } from "lucide-react";
import { useSession } from "next-auth/react";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";

export default function AdminStageBookingsPage() {
  const { data: session } = useSession();
  const [bookings, setBookings] = useState<StageBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedBooking, setSelectedBooking] = useState<StageBooking | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (session?.user?.role === "admin" || session?.user?.isAdmin) {
      fetchBookings();
    }
  }, [session]);

  // Ensure bookings is always an array
  useEffect(() => {
    if (!Array.isArray(bookings)) {
      setBookings([]);
    }
  }, [bookings]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/stage-bookings");
      if (response.ok) {
        const data = await response.json();

        if (data && Array.isArray(data.bookings)) {
          setBookings(data.bookings);
        } else if (Array.isArray(data)) {
          // Fallback for direct array response
          setBookings(data);
        } else {
          console.warn("Unexpected data format");
          setBookings([]);
        }
      } else {
        console.error("Failed to fetch bookings");
        toast.error("Failed to fetch bookings");
        setBookings([]);
      }
    } catch (error) {
      console.error("Error fetching bookings:", error);
      toast.error("Error fetching bookings");
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  const updateBooking = async (bookingId: string, updates: Partial<StageBooking>) => {
    setIsUpdating(true);
    try {
      const response = await fetch(`/api/stage-bookings/${bookingId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updates),
      });

      if (response.ok) {
        toast.success("Booking updated successfully");
        await fetchBookings(); // Refresh the list
        setSelectedBooking(null);
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to update booking");
      }
    } catch (error) {
      console.error("Error updating booking:", error);
      toast.error("Error updating booking");
    } finally {
      setIsUpdating(false);
    }
  };

  const deleteBooking = async (bookingId: string) => {
    if (!confirm("Are you sure you want to delete this booking?")) {
      return;
    }

    try {
      const response = await fetch(`/api/stage-bookings/${bookingId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("Booking deleted successfully");
        setSelectedBooking(null); // Clear the selected booking
        await fetchBookings(); // Refresh the list
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to delete booking");
      }
    } catch (error) {
      console.error("Error deleting booking:", error);
      toast.error("Error deleting booking");
    }
  };

  // Safe filtering with multiple fallbacks
  const filteredBookings = (() => {
    try {
      // Ensure bookings is always an array
      const safeBookings = Array.isArray(bookings) ? bookings : [];

      if (safeBookings.length === 0) {
        return [];
      }

      return safeBookings.filter((booking) => {
        try {
          if (!booking || typeof booking !== "object") {
            return false;
          }

          const matchesSearch =
            (booking.userName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
            (booking.userEmail || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
            (booking.stageDetails?.location || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
            (booking.stageDetails?.eventType || "").toLowerCase().includes(searchTerm.toLowerCase());

          const matchesStatus = statusFilter === "all" || booking.status === statusFilter;

          return matchesSearch && matchesStatus;
        } catch (error) {
          console.warn("Error filtering booking:", error, booking);
          return false;
        }
      });
    } catch (error) {
      console.error("Error in filteredBookings:", error);
      return [];
    }
  })();

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "pending":
        return "secondary";
      case "approved":
        return "default";
      case "rejected":
        return "destructive";
      case "in_progress":
        return "outline";
      case "completed":
        return "default";
      default:
        return "secondary";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Show loading while session is being fetched
  if (!session) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardContent className="p-6 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Check access only after session is loaded
  if (!session?.user?.role || (session.user.role !== "admin" && !session.user.isAdmin)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardContent className="p-6 text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
            <p className="text-gray-600">You need admin privileges to access this page.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-lg text-gray-600">Loading stage bookings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Stage Bookings Management</h1>
          <p className="text-gray-600">Manage and review stage booking requests from customers.</p>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <Label htmlFor="search">Search Bookings</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="search"
                    placeholder="Search by name, email, location, or event type..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="md:w-48">
                <Label htmlFor="status-filter">Filter by Status</Label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bookings List */}
        <div className="space-y-4">
          {filteredBookings.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-gray-500">No stage bookings found.</p>
              </CardContent>
            </Card>
          ) : (
            filteredBookings.map((booking, index) => (
              <Card key={booking._id || `booking-${index}`} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{booking.userName}</h3>
                        <Badge variant={getStatusBadgeVariant(booking.status)}>
                          {booking.status.replace("_", " ").toUpperCase()}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          <span>{booking.stageDetails.location}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          <span>
                            {booking.stageDetails.eventDates && booking.stageDetails.eventDates.length > 0 ? (
                              booking.stageDetails.eventDates.map((date, index) => (
                                <span key={index}>
                                  {new Date(date).toLocaleDateString()}
                                  {index < (booking.stageDetails.eventDates?.length || 0) - 1 && ', '}
                                </span>
                              ))
                            ) : (
                              <span className="text-gray-500 italic">No dates specified</span>
                            )}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          <span>{booking.stageDetails.eventTime}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4" />
                          <span>{booking.stageDetails.expectedGuests} guests</span>
                        </div>
                      </div>

                      <div className="mt-2 text-sm text-gray-500">
                        <p>Email: {booking.userEmail}</p>
                        <p>Phone: {booking.userProfile.phone}</p>
                        <p>Event Type: {booking.stageDetails.eventType}</p>
                        <p>Files: {booking.designFiles.length} uploaded</p>
                        {booking.equipmentItems && booking.equipmentItems.length > 0 && (
                          <p className="text-orange-600 font-medium">
                            Equipment: {booking.equipmentItems.length} item(s) • {booking.equipmentItems.reduce((sum, item) => sum + item.quantity, 0)} units
                          </p>
                        )}
                        <p>Submitted: {formatDate(booking.createdAt.toString())}</p>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-2">
                      <Dialog
                        onOpenChange={(open) => {
                          if (!open) {
                            setSelectedBooking(null);
                          }
                        }}
                      >
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm" onClick={() => setSelectedBooking(booking)}>
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>Stage Booking Details</DialogTitle>
                          </DialogHeader>
                          {selectedBooking && (
                            <BookingDetailsModal
                              booking={selectedBooking}
                              onUpdate={updateBooking}
                              onDelete={deleteBooking}
                              isUpdating={isUpdating}
                            />
                          )}
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

// Booking Details Modal Component
function BookingDetailsModal({
  booking,
  onUpdate,
  onDelete,
  isUpdating,
}: {
  booking: StageBooking;
  onUpdate: (id: string, updates: Partial<StageBooking>) => void;
  onDelete: (id: string) => void;
  isUpdating: boolean;
}) {
  const [status, setStatus] = useState<"pending" | "approved" | "rejected" | "in_progress" | "completed">(
    booking.status
  );
  const [adminNotes, setAdminNotes] = useState(booking.adminNotes || "");
  const [estimatedCost, setEstimatedCost] = useState(booking.estimatedCost?.toString() || "");

  const handleStatusChange = (value: string) => {
    setStatus(value as "pending" | "approved" | "rejected" | "in_progress" | "completed");
  };

  const handleUpdate = () => {
    if (!booking._id) {
      console.error("Cannot update booking: missing _id");
      return;
    }
    onUpdate(booking._id, {
      status,
      adminNotes,
      estimatedCost: estimatedCost ? parseFloat(estimatedCost) : undefined,
    });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div className="space-y-6">
      {/* Personal Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Personal Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium text-gray-500">Full Name</Label>
              <p className="text-gray-900">{booking.userName}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-500">Email</Label>
              <p className="text-gray-900">{booking.userEmail}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-500">Phone</Label>
              <p className="text-gray-900">{booking.userProfile.phone}</p>
            </div>
            {booking.userProfile.company && (
              <div>
                <Label className="text-sm font-medium text-gray-500">Company</Label>
                <p className="text-gray-900">{booking.userProfile.company}</p>
              </div>
            )}
          </div>
          {booking.userProfile.address && (
            <div>
              <Label className="text-sm font-medium text-gray-500">Address</Label>
              <p className="text-gray-900">{booking.userProfile.address}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Stage Details */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Stage Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium text-gray-500">Location</Label>
              <p className="text-gray-900">{booking.stageDetails.location}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-500">Event Type</Label>
              <p className="text-gray-900">{booking.stageDetails.eventType}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-500">Event Date</Label>
              <div className="text-gray-900">
                {booking.stageDetails.eventDates && booking.stageDetails.eventDates.length > 0 ? (
                  booking.stageDetails.eventDates.map((date, index) => (
                    <p key={index}>{new Date(date).toLocaleDateString()}</p>
                  ))
                ) : (
                  <p className="text-gray-500 italic">No dates specified</p>
                )}
              </div>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-500">Event Time</Label>
              <p className="text-gray-900">{booking.stageDetails.eventTime}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-500">Duration</Label>
              <p className="text-gray-900">{booking.stageDetails.duration} hours</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-500">Expected Guests</Label>
              <p className="text-gray-900">{booking.stageDetails.expectedGuests} people</p>
            </div>
          </div>
          {booking.stageDetails.specialRequirements && (
            <div>
              <Label className="text-sm font-medium text-gray-500">Special Requirements</Label>
              <p className="text-gray-900">{booking.stageDetails.specialRequirements}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Design Files */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Design Files ({booking.designFiles.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {booking.designFiles.map((file, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  {file.mimeType.startsWith("image/") ? (
                    // eslint-disable-next-line jsx-a11y/alt-text
                    <Image className="h-4 w-4" />
                  ) : (
                    <FileText className="h-4 w-4" />
                  )}
                  <div>
                    <p className="text-sm font-medium text-gray-900">{file.originalName}</p>
                    <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(file.url, "_blank", "noopener,noreferrer")}
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Equipment Items */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Package className="h-5 w-5 mr-2" />
            Equipment Rental ({booking.equipmentItems?.length || 0} items)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {booking.equipmentItems && booking.equipmentItems.length > 0 ? (
            <div className="space-y-4">
              {booking.equipmentItems.map((item) => {
                const unitPrice = item.rentalType === 'daily' ? item.dailyPrice : item.weeklyPrice;
                const duration = item.rentalType === 'daily' ? item.rentalDays : Math.ceil(item.rentalDays / 7);
                const totalPrice = unitPrice * item.quantity * duration;
                
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
                                {item.rentalType === 'daily' ? `${item.rentalDays} day(s)` : `${duration} week(s)`}
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-500">Rate:</span>
                              <span className="ml-1 font-medium">
                                ${unitPrice}/{item.rentalType === 'daily' ? 'day' : 'week'}
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
                <span className="font-bold text-xl text-orange-800">
                  ${booking.equipmentItems.reduce((total, item) => {
                    const price = item.rentalType === 'daily' ? item.dailyPrice : item.weeklyPrice;
                    const days = item.rentalType === 'daily' ? item.rentalDays : Math.ceil(item.rentalDays / 7);
                    return total + (price * item.quantity * days);
                  }, 0)}
                </span>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Package className="h-8 w-8 text-gray-400" />
              </div>
              <p className="text-gray-500 text-lg font-medium">No Equipment Selected</p>
              <p className="text-gray-400 text-sm mt-1">Customer did not select any equipment for this booking</p>
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
            {/* Equipment Rental Cost */}
            {booking.equipmentItems && booking.equipmentItems.length > 0 && (
              <div className="bg-green-50 rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-semibold text-green-900">Equipment Rental:</p>
                    <p className="text-sm text-green-700">
                      {booking.equipmentItems.length} item(s) • {booking.equipmentItems.reduce((sum, item) => sum + item.quantity, 0)} units
                    </p>
                  </div>
                  <p className="text-xl font-bold text-green-900">
                    ${booking.equipmentItems.reduce((total, item) => {
                      const price = item.rentalType === 'daily' ? item.dailyPrice : item.weeklyPrice;
                      const days = item.rentalType === 'daily' ? item.rentalDays : Math.ceil(item.rentalDays / 7);
                      return total + (price * item.quantity * days);
                    }, 0).toLocaleString()}
                  </p>
                </div>
              </div>
            )}
            
            {/* Stage Setup Cost */}
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
            
            {/* Total Cost */}
            {((booking.equipmentItems && booking.equipmentItems.length > 0) || booking.estimatedCost) && (
              <div className="bg-gray-50 rounded-lg p-4 border-2 border-gray-200">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-bold text-lg text-gray-900">Total Estimated:</p>
                    <p className="text-sm text-gray-600">Final pricing may vary</p>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">
                    ${((booking.equipmentItems && booking.equipmentItems.length > 0 ? 
                      booking.equipmentItems.reduce((total, item) => {
                        const price = item.rentalType === 'daily' ? item.dailyPrice : item.weeklyPrice;
                        const days = item.rentalType === 'daily' ? item.rentalDays : Math.ceil(item.rentalDays / 7);
                        return total + (price * item.quantity * days);
                      }, 0) : 0) + (booking.estimatedCost || 0)).toLocaleString()}
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

      {/* Admin Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Admin Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="status">Status</Label>
              <Select value={status} onValueChange={handleStatusChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="estimatedCost">Estimated Cost ($)</Label>
              <Input
                id="estimatedCost"
                type="number"
                value={estimatedCost}
                onChange={(e) => setEstimatedCost(e.target.value)}
                placeholder="0.00"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="adminNotes">Admin Notes</Label>
            <Textarea
              id="adminNotes"
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              placeholder="Add notes for the customer..."
              rows={3}
            />
          </div>

          <div className="flex gap-2">
            <Button onClick={handleUpdate} disabled={isUpdating} className="flex-1">
              {isUpdating ? "Updating..." : "Update Booking"}
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (!booking._id) {
                  console.error("Cannot delete booking: missing _id");
                  return;
                }
                onDelete(booking._id);
              }}
              disabled={isUpdating}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
