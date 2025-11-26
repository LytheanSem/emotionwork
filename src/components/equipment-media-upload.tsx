"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Play, Upload, X } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

interface CloudinaryUploadResult {
  secure_url: string;
  public_id: string;
  resource_type: "image" | "video";
}

interface CurrentMedia {
  url: string;
  public_id: string;
  resource_type: "image" | "video";
}

interface EquipmentMediaUploadProps {
  onUploadComplete: (result: CloudinaryUploadResult) => void;
  onUploadError: (error: string) => void;
  onRemove: () => void;
  currentMedia?: CurrentMedia;
}

export default function EquipmentMediaUpload({
  onUploadComplete,
  onUploadError,
  onRemove,
  currentMedia,
}: EquipmentMediaUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Cleanup blob URLs to prevent memory leaks
  useEffect(() => {
    return () => {
      if (previewUrl?.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const isImage = file.type.startsWith("image/");
    const isVideo = file.type.startsWith("video/");

    if (!isImage && !isVideo) {
      onUploadError("Please select an image or video file");
      return;
    }

    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      onUploadError("File size must be less than 10MB");
      return;
    }

    setSelectedFile(file);

    // Create preview
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append("files", selectedFile);
      formData.append("folder", "equipment");
      formData.append("config", "primary");
      formData.append("tags", "equipment");

      const response = await fetch("/api/cloudinary/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Upload failed");
      }

      const result = await response.json();
      if (result.success && result.files && result.files.length > 0) {
        const uploadedFile = result.files[0];
        const mime = uploadedFile?.mimeType || selectedFile.type || "";
        onUploadComplete({
          secure_url: uploadedFile.url,
          public_id: uploadedFile.publicId,
          resource_type: mime.startsWith("video/") ? "video" : "image",
        });
      } else {
        throw new Error("No files uploaded");
      }

      // Reset state
      setSelectedFile(null);
      setPreviewUrl(null);
      setUploadProgress(0);

      // Clear file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      console.error("Upload error details:", error);
      if (error instanceof Error) {
        onUploadError(`Upload failed: ${error.message}`);
      } else {
        onUploadError("Upload failed: Unknown error");
      }
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemove = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setUploadProgress(0);
    onRemove();

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-4">
      <Label htmlFor="equipment-media">Equipment Media</Label>

      {/* Current Media Display */}
      {currentMedia && (
        <div className="border rounded-lg p-4 bg-gray-50">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Current Media:</span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleRemove}
              className="text-red-600 hover:text-red-700"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          <div className="border rounded-lg overflow-hidden">
            {currentMedia.resource_type === "image" ? (
              <Image
                src={currentMedia.url}
                alt="Current equipment media"
                width={400}
                height={128}
                className="w-full h-32 object-cover"
                loading="lazy"
              />
            ) : (
              <div className="relative">
                <video src={currentMedia.url} className="w-full h-32 object-cover" muted />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Play className="w-8 h-8 text-white bg-black bg-opacity-50 rounded-full p-1" />
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* File Selection */}
      <div className="space-y-2">
        <Input
          ref={fileInputRef}
          id="equipment-media"
          type="file"
          accept="image/*,video/*"
          onChange={handleFileSelect}
          disabled={isUploading}
          className="cursor-pointer"
        />
        <p className="text-xs text-gray-500">Supported formats: JPG, PNG, GIF, MP4, MOV (max 10MB)</p>
      </div>

      {/* Preview */}
      {previewUrl && (
        <div className="border rounded-lg overflow-hidden">
          {selectedFile?.type.startsWith("image/") ? (
            <Image
              src={previewUrl}
              alt="File preview"
              width={400}
              height={128}
              className="w-full h-32 object-cover"
              loading="lazy"
            />
          ) : selectedFile?.type.startsWith("video/") ? (
            <div className="relative">
              <video src={previewUrl} className="w-full h-32 object-cover" muted />
              <div className="absolute inset-0 flex items-center justify-center">
                <Play className="w-8 h-8 text-white bg-black bg-opacity-50 rounded-full p-1" />
              </div>
            </div>
          ) : null}
        </div>
      )}

      {/* Upload Button */}
      {selectedFile && (
        <Button type="button" onClick={handleUpload} disabled={isUploading} className="w-full">
          {isUploading ? (
            <div className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Uploading... {uploadProgress}%
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Upload className="w-4 h-4" />
              Upload to Cloudinary
            </div>
          )}
        </Button>
      )}
    </div>
  );
}
