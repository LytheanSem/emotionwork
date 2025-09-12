import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary with graceful fallback
const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;

const isCloudinaryConfigured = cloudName && apiKey && apiSecret;

if (!isCloudinaryConfigured) {
  console.warn('Cloudinary environment variables are not set. Cloudinary features will be disabled.');
}

// Only configure Cloudinary if credentials are available
if (isCloudinaryConfigured) {
  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
  });
}

export interface CloudinaryUploadResult {
  public_id: string;
  secure_url: string;
  format: string;
  width?: number;
  height?: number;
  duration?: number; // for videos
  bytes: number;
  resource_type: 'image' | 'video' | 'raw' | 'auto';
  created_at: string;
}

export interface CloudinaryUploadOptions {
  folder?: string;
  transformation?: Array<Record<string, unknown>>;
  resource_type?: 'image' | 'video' | 'raw' | 'auto';
  allowed_formats?: string[];
  max_size?: number;
  eager?: Array<Record<string, unknown>>; // for eager transformations
  eager_async?: boolean;
  eager_notification_url?: string;
  use_filename?: boolean;
  unique_filename?: boolean;
  overwrite?: boolean;
  invalidate?: boolean;
  tags?: string[];
  context?: Record<string, string>;
}

export class CloudinaryService {
  private defaultFolder: string;

  constructor(defaultFolder: string = 'emotionwork') {
    this.defaultFolder = defaultFolder;
  }

  /**
   * Upload a file to Cloudinary
   */
  async uploadFile(
    file: File | Buffer | string,
    options: CloudinaryUploadOptions = {}
  ): Promise<CloudinaryUploadResult> {
    // Check if Cloudinary is configured
    if (!isCloudinaryConfigured) {
      throw new Error('Cloudinary is not configured. Please set up your environment variables.');
    }

    try {
      // Validate file before upload
      if (file instanceof File) {
        const validation = this.validateFile(file, options);
        if (!validation.valid) {
          throw new Error(validation.error);
        }
      }

      const uploadOptions = {
        folder: options.folder || this.defaultFolder,
        resource_type: options.resource_type || 'auto',
        transformation: options.transformation,
        eager: options.eager,
        eager_async: options.eager_async,
        eager_notification_url: options.eager_notification_url,
        use_filename: options.use_filename ?? true,
        unique_filename: options.unique_filename ?? true,
        overwrite: options.overwrite ?? false,
        invalidate: options.invalidate ?? true,
        tags: options.tags,
        context: options.context,
      };

      let uploadResult;

      if (file instanceof File) {
        // Convert File to base64 for upload
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const base64 = buffer.toString('base64');
        const dataURI = `data:${file.type};base64,${base64}`;
        
        uploadResult = await cloudinary.uploader.upload(dataURI, uploadOptions);
      } else if (typeof file === 'string') {
        // Upload from URL
        uploadResult = await cloudinary.uploader.upload(file, uploadOptions);
      } else {
        // Upload from Buffer
        const base64 = file.toString('base64');
        const dataURI = `data:application/octet-stream;base64,${base64}`;
        uploadResult = await cloudinary.uploader.upload(dataURI, uploadOptions);
      }

      return {
        public_id: uploadResult.public_id,
        secure_url: uploadResult.secure_url,
        format: uploadResult.format,
        width: uploadResult.width,
        height: uploadResult.height,
        duration: uploadResult.duration,
        bytes: uploadResult.bytes,
        resource_type: uploadResult.resource_type,
        created_at: uploadResult.created_at,
      };
    } catch (error) {
      console.error('Cloudinary upload error:', error);
      throw new Error(`Failed to upload file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Upload image with automatic optimization
   */
  async uploadImage(
    file: File | Buffer | string,
    options: CloudinaryUploadOptions = {}
  ): Promise<CloudinaryUploadResult> {
    const imageOptions: CloudinaryUploadOptions = {
      ...options,
      resource_type: 'image',
      transformation: [
        { quality: 'auto', fetch_format: 'auto' },
        ...(options.transformation || []),
      ],
    };

    return this.uploadFile(file, imageOptions);
  }

  /**
   * Upload video with optimization
   */
  async uploadVideo(
    file: File | Buffer | string,
    options: CloudinaryUploadOptions = {}
  ): Promise<CloudinaryUploadResult> {
    const videoOptions: CloudinaryUploadOptions = {
      ...options,
      resource_type: 'video',
      transformation: [
        { quality: 'auto', fetch_format: 'auto' },
        ...(options.transformation || []),
      ],
    };

    return this.uploadFile(file, videoOptions);
  }

  /**
   * Generate optimized image URL with transformations
   */
  getOptimizedImageUrl(
    publicId: string,
    options: {
      width?: number;
      height?: number;
      quality?: string | number;
      format?: string;
      crop?: string;
      gravity?: string;
      radius?: number;
      effect?: string;
    } = {}
  ): string {
    if (!isCloudinaryConfigured) {
      return publicId; // Return original URL if Cloudinary is not configured
    }

    const transformation = {
      quality: 'auto',
      fetch_format: 'auto',
      ...options,
    };

    return cloudinary.url(publicId, {
      secure: true,
      transformation: [transformation],
    });
  }

  /**
   * Generate optimized video URL with transformations
   */
  getOptimizedVideoUrl(
    publicId: string,
    options: {
      width?: number;
      height?: number;
      quality?: string | number;
      format?: string;
      crop?: string;
      duration?: number;
      start_offset?: number;
    } = {}
  ): string {
    if (!isCloudinaryConfigured) {
      return publicId; // Return original URL if Cloudinary is not configured
    }

    const transformation = {
      quality: 'auto',
      fetch_format: 'auto',
      ...options,
    };

    return cloudinary.url(publicId, {
      secure: true,
      resource_type: 'video',
      transformation: [transformation],
    });
  }

  /**
   * Generate responsive image URLs
   */
  getResponsiveImageUrls(
    publicId: string,
    breakpoints: number[] = [640, 768, 1024, 1280, 1536]
  ): Record<string, string> {
    const urls: Record<string, string> = {};
    
    breakpoints.forEach(width => {
      urls[`${width}w`] = this.getOptimizedImageUrl(publicId, { width });
    });

    return urls;
  }

  /**
   * Delete a file from Cloudinary
   */
  async deleteFile(publicId: string, resourceType: 'image' | 'video' | 'raw' = 'image'): Promise<void> {
    if (!isCloudinaryConfigured) {
      console.warn('Cloudinary is not configured. Delete operation skipped.');
      return;
    }

    try {
      await cloudinary.uploader.destroy(publicId, {
        resource_type: resourceType,
      });
    } catch (error) {
      console.error('Cloudinary delete error:', error);
      throw new Error(`Failed to delete file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get file information
   */
  async getFileInfo(publicId: string, resourceType: 'image' | 'video' | 'raw' = 'image'): Promise<Record<string, unknown>> {
    if (!isCloudinaryConfigured) {
      throw new Error('Cloudinary is not configured. Please set up your environment variables.');
    }

    try {
      return await cloudinary.api.resource(publicId, {
        resource_type: resourceType,
      });
    } catch (error) {
      console.error('Cloudinary get info error:', error);
      throw new Error(`Failed to get file info: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Validate file before upload
   */
  validateFile(file: File, options: CloudinaryUploadOptions = {}): { valid: boolean; error?: string } {
    const maxSize = options.max_size || 100 * 1024 * 1024; // 100MB default for Cloudinary
    const allowedFormats = options.allowed_formats || [
      // Images
      'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml',
      // Videos
      'video/mp4', 'video/webm', 'video/ogg', 'video/avi', 'video/mov', 'video/wmv',
      'video/flv', 'video/mkv', 'video/3gp', 'video/m4v'
    ];

    if (file.size > maxSize) {
      return {
        valid: false,
        error: `File too large. Maximum size is ${Math.round(maxSize / 1024 / 1024)}MB.`
      };
    }

    if (!allowedFormats.includes(file.type)) {
      return {
        valid: false,
        error: `Invalid file type. Allowed types: ${allowedFormats.join(', ')}`
      };
    }

    return { valid: true };
  }

  /**
   * Get file size recommendations
   */
  getFileSizeRecommendations(): {
    images: { small: string; medium: string; large: string };
    videos: { small: string; medium: string; large: string };
  } {
    return {
      images: {
        small: "Under 500KB - Fast loading, good for thumbnails",
        medium: "500KB-2MB - Good balance of quality and size",
        large: "2-10MB - High quality, suitable for detailed photos"
      },
      videos: {
        small: "Under 5MB - Short clips, good for previews",
        medium: "5-50MB - Standard quality videos",
        large: "50-100MB - High quality videos (Cloudinary limit)"
      }
    };
  }

  /**
   * Generate a signed upload preset for client-side uploads
   */
  generateUploadSignature(params: Record<string, unknown> = {}): Record<string, unknown> {
    if (!isCloudinaryConfigured) {
      throw new Error('Cloudinary is not configured. Please set up your environment variables.');
    }

    const timestamp = Math.round(new Date().getTime() / 1000);
    const signature = cloudinary.utils.api_sign_request(
      {
        timestamp,
        ...params,
      },
      process.env.CLOUDINARY_API_SECRET!
    );

    return {
      timestamp,
      signature,
      api_key: process.env.CLOUDINARY_API_KEY,
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    };
  }
}

// Export a default instance
export const cloudinaryService = new CloudinaryService();
