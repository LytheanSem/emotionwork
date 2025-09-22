"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Upload, X, FileText, Image, Trash2 } from "lucide-react";
import { toast } from "sonner";

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

interface StageBookingFormProps {
  onSubmit: (data: StageBookingFormData) => void;
}

export function StageBookingForm({ onSubmit }: StageBookingFormProps) {
  const { data: session } = useSession();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [dragActive, setDragActive] = useState(false);

  const [formData, setFormData] = useState<StageBookingFormData>({
    userProfile: {
      firstName: session?.user?.name?.split(" ")[0] || "",
      lastName: session?.user?.name?.split(" ").slice(1).join(" ") || "",
      phone: "",
      company: "",
      address: "",
    },
    stageDetails: {
      location: "",
      eventType: "",
      eventDate: "",
      eventTime: "",
      duration: 4,
      expectedGuests: 50,
      specialRequirements: "",
    },
    designFiles: [],
  });

  const handleInputChange = (field: string, value: string | number) => {
    if (field.includes(".")) {
      const [parent, child] = field.split(".");
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent as keyof typeof prev],
          [child]: value,
        },
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value,
      }));
    }
  };

  const handleFileUpload = (files: FileList | null) => {
    if (!files) return;

    const validFiles: File[] = [];
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = [
      "image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp",
      "application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.ms-powerpoint", "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      "application/vnd.ms-excel", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "text/plain", "application/zip", "application/x-rar-compressed"
    ];

    Array.from(files).forEach(file => {
      if (file.size > maxSize) {
        toast.error(`File ${file.name} is too large. Maximum size is 10MB.`);
        return;
      }

      if (!allowedTypes.includes(file.type)) {
        toast.error(`File ${file.name} has an unsupported format.`);
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

    if (!formData.stageDetails.location || !formData.stageDetails.eventType || !formData.stageDetails.eventDate || !formData.stageDetails.eventTime) {
      toast.error("Please fill in all required stage details.");
      return;
    }

    if (uploadedFiles.length === 0) {
      toast.error("Please upload at least one design file.");
      return;
    }

    setIsSubmitting(true);
    onSubmit(formData);
    setIsSubmitting(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
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
                placeholder="+1 (555) 123-4567"
                required
              />
            </div>
            <div>
              <Label htmlFor="company">Company (Optional)</Label>
              <Input
                id="company"
                value={formData.userProfile.company || ""}
                onChange={(e) => handleInputChange("userProfile.company", e.target.value)}
                placeholder="Your company name"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="address">Address (Optional)</Label>
            <Textarea
              id="address"
              value={formData.userProfile.address || ""}
              onChange={(e) => handleInputChange("userProfile.address", e.target.value)}
              placeholder="Your full address"
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
                placeholder="Venue name and address"
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
                  <SelectItem value="concert">Concert</SelectItem>
                  <SelectItem value="wedding">Wedding</SelectItem>
                  <SelectItem value="corporate">Corporate Event</SelectItem>
                  <SelectItem value="festival">Festival</SelectItem>
                  <SelectItem value="conference">Conference</SelectItem>
                  <SelectItem value="exhibition">Exhibition</SelectItem>
                  <SelectItem value="party">Private Party</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="eventDate">Event Date *</Label>
              <Input
                id="eventDate"
                type="date"
                value={formData.stageDetails.eventDate}
                onChange={(e) => handleInputChange("stageDetails.eventDate", e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                required
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
              value={formData.stageDetails.specialRequirements || ""}
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
            Design Files *
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <Upload className="h-4 w-4" />
            <AlertDescription>
              Upload your stage design files, blueprints, sketches, or inspiration images. 
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

      {/* Submit Button */}
      <div className="flex justify-end">
        <Button
          type="submit"
          disabled={isSubmitting}
          className="px-8 py-3"
        >
          {isSubmitting ? "Submitting..." : "Review Booking"}
        </Button>
      </div>
    </form>
  );
}

