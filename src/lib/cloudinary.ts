// Server-side only Cloudinary configuration
let cloudinary: typeof import('cloudinary').v2 | null = null;
let isCloudinaryConfigured = false;

// Multiple Cloudinary configurations
interface CloudinaryConfig {
  cloudName: string;
  apiKey: string;
  apiSecret: string;
  folder?: string;
}

const cloudinaryConfigs: Record<string, CloudinaryConfig> = {};

// Only import and configure Cloudinary on the server side
if (typeof window === 'undefined') {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { v2 } = require('cloudinary');
    cloudinary = v2;
    
    // Primary configuration
    const primaryConfig = {
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
      apiKey: process.env.CLOUDINARY_API_KEY,
      apiSecret: process.env.CLOUDINARY_API_SECRET,
      folder: process.env.CLOUDINARY_STAGE_FOLDER || 'stage-designs'
    };

    // Secondary configuration (if exists) - Used for stage bookings
    const secondaryConfig = {
      cloudName: process.env.CLOUDINARY_SECONDARY_CLOUD_NAME,
      apiKey: process.env.CLOUDINARY_SECONDARY_API_KEY,
      apiSecret: process.env.CLOUDINARY_SECONDARY_API_SECRET,
      folder: process.env.CLOUDINARY_STAGE_FOLDER || 'stage-designs'
    };

    // Development configuration (if exists)
    const devConfig = {
      cloudName: process.env.CLOUDINARY_DEV_CLOUD_NAME,
      apiKey: process.env.CLOUDINARY_DEV_API_KEY,
      apiSecret: process.env.CLOUDINARY_DEV_API_SECRET,
      folder: process.env.CLOUDINARY_DEV_FOLDER || 'dev-uploads'
    };

    // Store configurations
    if (primaryConfig.cloudName && primaryConfig.apiKey && primaryConfig.apiSecret) {
      cloudinaryConfigs.primary = primaryConfig;
      isCloudinaryConfigured = true;
    }

    if (secondaryConfig.cloudName && secondaryConfig.apiKey && secondaryConfig.apiSecret) {
      cloudinaryConfigs.secondary = secondaryConfig;
    }

    if (devConfig.cloudName && devConfig.apiKey && devConfig.apiSecret) {
      cloudinaryConfigs.dev = devConfig;
    }

    if (!isCloudinaryConfigured) {
      console.warn('No Cloudinary environment variables are set. Cloudinary features will be disabled.');
    } else {
      // Configure with primary account
      cloudinary.config({
        cloud_name: primaryConfig.cloudName,
        api_key: primaryConfig.apiKey,
        api_secret: primaryConfig.apiSecret,
      });
      console.log(`Cloudinary configured with primary account: ${primaryConfig.cloudName}`);
      
      // Log available configurations
      console.log('Available Cloudinary configurations:', Object.keys(cloudinaryConfigs));
    }
  } catch (error) {
    console.warn('Failed to initialize Cloudinary:', error);
  }
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
  private defaultConfig: string;

  constructor(defaultFolder: string = 'emotionwork', defaultConfig: string = 'primary') {
    this.defaultFolder = defaultFolder;
    this.defaultConfig = defaultConfig;
  }

  /**
   * Get available Cloudinary configurations
   */
  getAvailableConfigs(): string[] {
    return Object.keys(cloudinaryConfigs);
  }

  /**
   * Switch to a different Cloudinary configuration
   */
  switchConfig(configName: string): boolean {
    if (!cloudinaryConfigs[configName]) {
      console.warn(`Cloudinary configuration '${configName}' not found`);
      return false;
    }

    const config = cloudinaryConfigs[configName];
    cloudinary.config({
      cloud_name: config.cloudName,
      api_key: config.apiKey,
      api_secret: config.apiSecret,
    });
    
    console.log(`Switched to Cloudinary configuration: ${configName}`);
    return true;
  }

  /**
   * Upload file with specific configuration
   */
  async uploadFileWithConfig(
    file: File | Buffer | string,
    configName: string = this.defaultConfig,
    options: CloudinaryUploadOptions = {}
  ): Promise<CloudinaryUploadResult> {
    // Check if we're on the server side
    if (typeof window !== 'undefined') {
      throw new Error('Cloudinary upload can only be performed on the server side.');
    }

    // Check if configuration exists
    if (!cloudinaryConfigs[configName]) {
      throw new Error(`Cloudinary configuration '${configName}' not found`);
    }

    // Switch to the specified configuration
    this.switchConfig(configName);
    const config = cloudinaryConfigs[configName];

    // Use configuration-specific folder if not specified
    const uploadOptions = {
      folder: options.folder || config.folder || this.defaultFolder,
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

    try {
      // Validate file before upload
      if (file instanceof File) {
        const validation = this.validateFile(file, options);
        if (!validation.valid) {
          throw new Error(validation.error);
        }
      }

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
   * Upload a file to Cloudinary (server-side only)
   */
  async uploadFile(
    file: File | Buffer | string,
    options: CloudinaryUploadOptions = {}
  ): Promise<CloudinaryUploadResult> {
    // Check if we're on the server side
    if (typeof window !== 'undefined') {
      throw new Error('Cloudinary upload can only be performed on the server side.');
    }

    // Check if Cloudinary is configured
    if (!isCloudinaryConfigured || !cloudinary) {
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
    if (!isCloudinaryConfigured || !cloudinary) {
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
    if (!isCloudinaryConfigured || !cloudinary) {
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
    if (!isCloudinaryConfigured || !cloudinary) {
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
    if (!isCloudinaryConfigured || !cloudinary) {
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
      'video/flv', 'video/mkv', 'video/3gp', 'video/m4v',
      // Documents (for stage designs)
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/plain',
      'text/csv',
      // Archives
      'application/zip',
      'application/x-rar-compressed',
      'application/x-7z-compressed'
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
    if (!isCloudinaryConfigured || !cloudinary) {
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

// Export default instances
export const cloudinaryService = new CloudinaryService();
export const stageBookingCloudinaryService = new CloudinaryService('stage-designs', 'secondary');
