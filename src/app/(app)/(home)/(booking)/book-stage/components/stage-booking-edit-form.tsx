"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Upload, FileText, Image, Trash2, X, Package, ShoppingCart } from "lucide-react";
import { toast } from "sonner";
import { useCart } from "@/contexts/CartContext";
import { useRouter } from "next/navigation";
import { DateRangePicker } from "@/components/ui/date-range-picker";

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

interface StageBookingEditFormProps {
  bookingData: {
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
      eventDates: string[]; // Changed from eventDate to eventDates array
      eventTime: string;
      duration: number;
      expectedGuests: number;
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
    equipmentItems?: Array<{
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
    }>;
  };
  onSubmit: (data: StageBookingFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function StageBookingEditForm({ 
  bookingData, 
  onSubmit, 
  onCancel, 
  isLoading = false 
}: StageBookingEditFormProps) {
  
  const router = useRouter();
  const { cartItems, getCartItemCount, getTotalPrice, addToCart, removeFromCart } = useCart();
  
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
  
  // Load existing equipment items into cart when component mounts (only if cart is empty)
  useEffect(() => {
    if (cartItems.length === 0 && bookingData.equipmentItems && bookingData.equipmentItems.length > 0) {
      // Only load booking equipment if cart is empty (preserves new equipment from equipment page)
      bookingData.equipmentItems.forEach(item => {
        // Convert booking equipment to cart equipment format
        const cartEquipment = {
          ...item.equipment,
          status: "available" as const,
          quantity: 1, // Default quantity for cart
          createdAt: new Date(),
          updatedAt: new Date()
        };
        addToCart(cartEquipment, item.quantity, item.rentalType, item.rentalDays);
      });
    }
  }, [bookingData.equipmentItems, cartItems.length, addToCart]); // Only run when cart is empty
  
  const [formData, setFormData] = useState<StageBookingFormData>({
    userProfile: {
      firstName: bookingData.userProfile.firstName,
      lastName: bookingData.userProfile.lastName,
      phone: bookingData.userProfile.phone,
      company: bookingData.userProfile.company || "",
      address: bookingData.userProfile.address || "",
    },
    stageDetails: {
      location: bookingData.stageDetails.location,
      eventType: bookingData.stageDetails.eventType,
      eventDates: bookingData.stageDetails.eventDates,
      eventTime: bookingData.stageDetails.eventTime,
      duration: bookingData.stageDetails.duration,
      expectedGuests: bookingData.stageDetails.expectedGuests,
      specialRequirements: bookingData.stageDetails.specialRequirements || "",
    },
    designFiles: [],
  });

  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (field: string, value: string | number | string[]) => {
    const keys = field.split('.');
    setFormData(prev => {
      const newData = { ...prev };
      let current: any = newData;
      
      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]];
      }
      
      current[keys[keys.length - 1]] = value;
      return newData;
    });
  };

  const handleFileUpload = (files: FileList | null) => {
    if (!files) return;

    const validFiles: File[] = [];
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = [
      'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp',
      'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/plain', 'application/zip', 'application/x-rar-compressed'
    ];

    Array.from(files).forEach(file => {
      if (file.size > maxSize) {
        toast.error(`File ${file.name} is too large. Maximum size is 10MB.`);
        return;
      }
      if (!allowedTypes.includes(file.type)) {
        toast.error(`File type ${file.type} is not supported.`);
        return;
      }
      validFiles.push(file);
    });

    if (validFiles.length > 0) {
      setUploadedFiles(prev => [...prev, ...validFiles]);
      setFormData(prev => ({
        ...prev,
        designFiles: [...prev.designFiles, ...validFiles],
      }));
      toast.success(`${validFiles.length} file(s) uploaded successfully.`);
    }
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
    setFormData(prev => ({
      ...prev,
      designFiles: prev.designFiles.filter((_, i) => i !== index),
    }));
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    handleFileUpload(e.dataTransfer.files);
  };

  const getFileIcon = (file: File) => {
    if (file.type.startsWith("image/")) {
      return <Image className="h-4 w-4" />;
    }
    return <FileText className="h-4 w-4" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.userProfile.firstName || !formData.userProfile.lastName || !formData.userProfile.phone) {
      toast.error("Please fill in all required personal information fields.");
      return;
    }

    if (!formData.stageDetails.location || !formData.stageDetails.eventType || formData.stageDetails.eventDates.length === 0 || !formData.stageDetails.eventTime) {
      toast.error("Please fill in all required stage details.");
      return;
    }

    setIsSubmitting(true);
    const formDataToSubmit = {
      ...formData,
      designFiles: uploadedFiles,
      equipmentItems: cartItems, // Use current cart items (which may have been modified)
    };
    onSubmit(formDataToSubmit);
    setIsSubmitting(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Edit Stage Booking</h2>
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting || isLoading}
        >
          <X className="h-4 w-4 mr-2" />
          Cancel
        </Button>
      </div>

      {/* User Profile Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="h-2 w-2 bg-blue-600 rounded-full"></span>
            Personal Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="firstName">First Name *</Label>
              <Input
                id="firstName"
                value={formData.userProfile.firstName}
                onChange={(e) => handleInputChange("userProfile.firstName", e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="lastName">Last Name *</Label>
              <Input
                id="lastName"
                value={formData.userProfile.lastName}
                onChange={(e) => handleInputChange("userProfile.lastName", e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="phone">Phone Number *</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.userProfile.phone}
                onChange={(e) => handleInputChange("userProfile.phone", e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="company">Company (Optional)</Label>
              <Input
                id="company"
                value={formData.userProfile.company}
                onChange={(e) => handleInputChange("userProfile.company", e.target.value)}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="address">Address (Optional)</Label>
            <Textarea
              id="address"
              value={formData.userProfile.address}
              onChange={(e) => handleInputChange("userProfile.address", e.target.value)}
              rows={2}
            />
          </div>
        </CardContent>
      </Card>

      {/* Stage Details Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="h-2 w-2 bg-green-600 rounded-full"></span>
            Stage Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="location">Event Location *</Label>
              <Input
                id="location"
                value={formData.stageDetails.location}
                onChange={(e) => handleInputChange("stageDetails.location", e.target.value)}
                placeholder="e.g., Convention Center, Hotel Ballroom"
                required
              />
            </div>
            <div>
              <Label htmlFor="eventType">Event Type *</Label>
              <Select
                value={formData.stageDetails.eventType}
                onValueChange={(value) => handleInputChange("stageDetails.eventType", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select event type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Corporate Event">Corporate Event</SelectItem>
                  <SelectItem value="Wedding">Wedding</SelectItem>
                  <SelectItem value="Concert">Concert</SelectItem>
                  <SelectItem value="Conference">Conference</SelectItem>
                  <SelectItem value="Exhibition">Exhibition</SelectItem>
                  <SelectItem value="Party">Party</SelectItem>
                  <SelectItem value="Award Ceremony">Award Ceremony</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <DateRangePicker
                value={formData.stageDetails.eventDates}
                onChange={(dates) => handleInputChange("stageDetails.eventDates", dates)}
                minDate={new Date().toISOString().split('T')[0]}
                label="Event Dates"
                required={true}
                placeholder="Select date ranges for your event"
              />
            </div>
            <div>
              <Label htmlFor="eventTime">Event Time *</Label>
              <Input
                id="eventTime"
                type="time"
                value={formData.stageDetails.eventTime}
                onChange={(e) => handleInputChange("stageDetails.eventTime", e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="duration">Duration (hours)</Label>
              <Select
                value={formData.stageDetails.duration.toString()}
                onValueChange={(value) => handleInputChange("stageDetails.duration", parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2">2 hours</SelectItem>
                  <SelectItem value="4">4 hours</SelectItem>
                  <SelectItem value="6">6 hours</SelectItem>
                  <SelectItem value="8">8 hours</SelectItem>
                  <SelectItem value="12">12 hours</SelectItem>
                  <SelectItem value="24">24 hours</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="expectedGuests">Expected Guests</Label>
              <Input
                id="expectedGuests"
                type="number"
                min="1"
                value={formData.stageDetails.expectedGuests}
                onChange={(e) => handleInputChange("stageDetails.expectedGuests", parseInt(e.target.value))}
                placeholder="50"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="specialRequirements">Special Requirements</Label>
            <Textarea
              id="specialRequirements"
              value={formData.stageDetails.specialRequirements}
              onChange={(e) => handleInputChange("stageDetails.specialRequirements", e.target.value)}
              placeholder="Any special requirements, accessibility needs, or additional information..."
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* File Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="h-2 w-2 bg-purple-600 rounded-full"></span>
            Design Files (Optional)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <Upload className="h-4 w-4" />
            <AlertDescription>
              Upload your stage design files, blueprints, sketches, or inspiration images (optional). 
              Supported formats: Images (JPG, PNG, GIF, WebP), Documents (PDF, DOC, DOCX, PPT, PPTX, XLS, XLSX, TXT), Archives (ZIP, RAR). Maximum file size: 10MB per file.
            </AlertDescription>
          </Alert>

          {/* File Upload Area */}
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragActive
                ? "border-blue-500 bg-blue-50"
                : "border-gray-300 hover:border-gray-400"
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-lg font-medium text-gray-900 mb-2">
              Drop files here or click to upload
            </p>
            <p className="text-sm text-gray-500 mb-4">
              Upload your stage design files and documents
            </p>
            <input
              type="file"
              multiple
              onChange={(e) => handleFileUpload(e.target.files)}
              className="hidden"
              id="file-upload"
              accept="image/*,.pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.zip,.rar"
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => document.getElementById("file-upload")?.click()}
            >
              Choose Files
            </Button>
          </div>

          {/* Uploaded Files List */}
          {uploadedFiles.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium text-gray-900">Uploaded Files ({uploadedFiles.length})</h4>
              <div className="space-y-2">
                {uploadedFiles.map((file, index) => (
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
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(index)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Equipment Items */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="h-2 w-2 bg-orange-600 rounded-full"></span>
            Equipment Rental (Optional)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {cartItems.length > 0 ? (
            <div className="space-y-4">
              <Alert>
                <Package className="h-4 w-4" />
                <AlertDescription>
                  You have {getCartItemCount()} equipment item(s) selected for your event.
                </AlertDescription>
              </Alert>
              
              <div className="space-y-3">
                {cartItems.map((item) => {
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
                            <p className="text-sm text-gray-600 mb-2">{item.equipment.categoryId || 'Uncategorized'}</p>
                            
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
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          onClick={() => removeFromCart(item.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
              
              <div className="bg-orange-100 border border-orange-300 rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-semibold text-orange-800">Equipment Rental Summary</h4>
                    <p className="text-sm text-orange-600">
                      {getCartItemCount()} item(s) • {cartItems.reduce((sum, item) => sum + item.quantity, 0)} total units
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-orange-800">${getTotalPrice()}</p>
                    <p className="text-sm text-orange-600">Total Equipment Cost</p>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-orange-200">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => router.push(`/equipment?edit=true&bookingId=${bookingData._id}`)}
                    className="w-full border-orange-300 text-orange-700 hover:bg-orange-50"
                  >
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Manage Equipment Selection
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <Alert>
                <ShoppingCart className="h-4 w-4" />
                <AlertDescription>
                  No equipment selected. You can add equipment for your event.
                </AlertDescription>
              </Alert>
              
              <div className="flex justify-center">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push("/equipment")}
                  className="flex items-center gap-2"
                >
                  <ShoppingCart className="h-4 w-4" />
                  Browse Equipment
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Submit Button */}
      <div className="flex justify-end gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting || isLoading}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting || isLoading}
          className="px-8 py-3"
        >
          {isSubmitting || isLoading ? "Updating..." : "Update Booking"}
        </Button>
      </div>
    </form>
  );
}
