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
   * Get images from a specific Cloudinary folder
   */
  static async getFolderImages(folderPath: string): Promise<any[]> {
    try {
      // Use simpler API call - get resources by prefix
      const result = await cloudinary.api.resources({
        type: 'upload',
        prefix: folderPath,
        max_results: 500
      });

      return result.resources.map((resource: any) => ({
        name: resource.public_id.split('/').pop() || resource.public_id,
        path: resource.secure_url,
        type: resource.format,
        url: resource.secure_url,
        public_id: resource.public_id,
        source: 'cloudinary',
        size: resource.bytes,
        width: resource.width,
        height: resource.height,
        created_at: resource.created_at
      }));
    } catch (error) {
      console.error('Error fetching Cloudinary folder images:', error);
      throw error;
    }
  }

  /**
   * Get images by prefix pattern
   */
  async getImagesByPrefix(prefix: string): Promise<any[]> {
    try {
      const result = await cloudinary.api.resources({
        type: 'upload',
        prefix: prefix,
        max_results: 500
      });

      return result.resources || [];
    } catch (error) {
      console.error('Error fetching images by prefix:', error);
      return [];
    }
  }

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
      throw new Error(`Failed to upload image to Cloudinary: ${error}`);
    }
  }

  /**
   * Delete image from Cloudinary
   */
  static async deleteImage(publicId: string): Promise<void> {
    try {
      await cloudinary.uploader.destroy(publicId);
    } catch (error) {
      console.error('Cloudinary delete error:', error);
      throw new Error(`Failed to delete image from Cloudinary: ${error}`);
    }
  }

  /**
   * Generate optimized URL for existing image
   */
  static generateUrl(
    publicId: string,
    options: {
      width?: number;
      height?: number;
      crop?: string;
      quality?: string | number;
      format?: string;
    } = {}
  ): string {
    return cloudinary.url(publicId, {
      quality: 'auto:good',
      fetch_format: 'auto',
      ...options,
    });
  }

  /**
   * Get image details
   */
  static async getImageDetails(publicId: string): Promise<any> {
    try {
      const result = await cloudinary.api.resource(publicId);
      return result;
    } catch (error) {
      console.error('Cloudinary get details error:', error);
      throw new Error(`Failed to get image details from Cloudinary: ${error}`);
    }
  }

  /**
   * List images in folder
   */
  static async listImages(folder: string = 'ontdek-polen'): Promise<any[]> {
    try {
      const result = await cloudinary.api.resources({
        type: 'upload',
        prefix: folder,
        max_results: 100,
      });
      return result.resources;
    } catch (error) {
      console.error('Cloudinary list images error:', error);
      throw new Error(`Failed to list images from Cloudinary: ${error}`);
    }
  }
}

export default CloudinaryService;