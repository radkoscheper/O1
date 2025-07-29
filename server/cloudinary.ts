import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: 'df3i1avwb',
  api_key: '676472295591778',
  api_secret: 'FRXuPdduU8TR0Q7md8UWL9c0uUE',
  secure: true,
});

export interface CloudinaryUploadOptions {
  folder?: string;
  public_id?: string;
  transformation?: {
    width?: number;
    height?: number;
    crop?: string;
    quality?: string | number;
    format?: string;
  };
}

export interface CloudinaryUploadResult {
  public_id: string;
  secure_url: string;
  width: number;
  height: number;
  format: string;
  bytes: number;
  created_at: string;
}

export class CloudinaryService {
  /**
   * Upload image with automatic optimization
   */
  static async uploadImage(
    fileBuffer: Buffer,
    options: CloudinaryUploadOptions = {}
  ): Promise<CloudinaryUploadResult> {
    try {
      const result = await new Promise<any>((resolve, reject) => {
        cloudinary.uploader.upload_stream(
          {
            folder: options.folder || 'ontdek-polen',
            public_id: options.public_id,
            transformation: {
              quality: 'auto:good',
              fetch_format: 'auto',
              ...options.transformation,
            },
            overwrite: true,
            invalidate: true,
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        ).end(fileBuffer);
      });

      return {
        public_id: result.public_id,
        secure_url: result.secure_url,
        width: result.width,
        height: result.height,
        format: result.format,
        bytes: result.bytes,
        created_at: result.created_at,
      };
    } catch (error) {
      console.error('Cloudinary upload error:', error);
      throw new Error('Failed to upload image to Cloudinary');
    }
  }

  /**
   * Delete image from Cloudinary
   */
  static async deleteImage(publicId: string): Promise<boolean> {
    try {
      const result = await cloudinary.uploader.destroy(publicId);
      return result.result === 'ok';
    } catch (error) {
      console.error('Cloudinary delete error:', error);
      return false;
    }
  }

  /**
   * Generate optimized URL with transformations
   */
  static getOptimizedUrl(
    publicId: string,
    options: {
      width?: number;
      height?: number;
      crop?: 'fill' | 'fit' | 'scale' | 'crop';
      quality?: string | number;
      format?: 'auto' | 'webp' | 'jpg' | 'png';
    } = {}
  ): string {
    return cloudinary.url(publicId, {
      transformation: {
        quality: options.quality || 'auto:good',
        fetch_format: options.format || 'auto',
        width: options.width,
        height: options.height,
        crop: options.crop || 'fill',
      },
    });
  }

  /**
   * List images in folder
   */
  static async listImages(folder: string = 'ontdek-polen'): Promise<any[]> {
    try {
      const result = await cloudinary.search
        .expression(`folder:${folder}/*`)
        .sort_by('created_at', 'desc')
        .max_results(100)
        .execute();
      
      return result.resources;
    } catch (error) {
      console.error('Cloudinary list error:', error);
      return [];
    }
  }
}

export default CloudinaryService;