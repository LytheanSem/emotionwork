/**
 * Client-side image compression utility
 * Reduces image file size before upload to GridFS
 */

export interface CompressionOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  format?: 'jpeg' | 'webp' | 'png';
}

export class ImageCompressor {
  /**
   * Compress an image file
   */
  static async compress(
    file: File,
    options: CompressionOptions = {}
  ): Promise<File> {
    const {
      maxWidth = 1920,
      maxHeight = 1080,
      quality = 0.8,
      format = 'jpeg'
    } = options;

    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        // Calculate new dimensions
        const { width, height } = this.calculateDimensions(
          img.width,
          img.height,
          maxWidth,
          maxHeight
        );

        // Set canvas dimensions
        canvas.width = width;
        canvas.height = height;

        // Draw and compress image
        ctx?.drawImage(img, 0, 0, width, height);

        // Convert to blob
        canvas.toBlob(
          (blob) => {
            if (blob) {
              // Create new file with compressed data
              const compressedFile = new File([blob], file.name, {
                type: `image/${format}`,
                lastModified: Date.now(),
              });
              resolve(compressedFile);
            } else {
              reject(new Error('Failed to compress image'));
            }
          },
          `image/${format}`,
          quality
        );
      };

      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = URL.createObjectURL(file);
    });
  }

  /**
   * Calculate new dimensions while maintaining aspect ratio
   */
  private static calculateDimensions(
    originalWidth: number,
    originalHeight: number,
    maxWidth: number,
    maxHeight: number
  ): { width: number; height: number } {
    let { width, height } = { width: originalWidth, height: originalHeight };

    // Scale down if image is too large
    if (width > maxWidth || height > maxHeight) {
      const ratio = Math.min(maxWidth / width, maxHeight / height);
      width = Math.round(width * ratio);
      height = Math.round(height * ratio);
    }

    return { width, height };
  }

  /**
   * Get estimated file size after compression
   */
  static async estimateCompressedSize(
    file: File,
    options: CompressionOptions = {}
  ): Promise<number> {
    const compressed = await this.compress(file, options);
    return compressed.size;
  }

  /**
   * Check if compression would be beneficial
   */
  static async shouldCompress(
    file: File,
    targetSize: number = 2 * 1024 * 1024, // 2MB
    options: CompressionOptions = {}
  ): Promise<boolean> {
    if (file.size <= targetSize) return false;
    
    const compressedSize = await this.estimateCompressedSize(file, options);
    return compressedSize < file.size;
  }
}

/**
 * Predefined compression presets
 */
export const CompressionPresets = {
  // High quality, suitable for equipment photos
  equipment: {
    maxWidth: 1920,
    maxHeight: 1080,
    quality: 0.85,
    format: 'jpeg' as const,
  },
  
  // Medium quality, good balance
  medium: {
    maxWidth: 1280,
    maxHeight: 720,
    quality: 0.75,
    format: 'jpeg' as const,
  },
  
  // Low quality, smallest file size
  thumbnail: {
    maxWidth: 640,
    maxHeight: 480,
    quality: 0.6,
    format: 'jpeg' as const,
  },
  
  // WebP format for better compression
  webp: {
    maxWidth: 1920,
    maxHeight: 1080,
    quality: 0.8,
    format: 'webp' as const,
  },
};
