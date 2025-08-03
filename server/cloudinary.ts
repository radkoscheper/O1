// Cloudinary integration for image management
// This module provides utilities for interacting with Cloudinary API

interface CloudinaryImage {
  public_id: string;
  secure_url: string;
  width: number;
  height: number;
  format: string;
  bytes: number;
  created_at: string;
}

interface CloudinaryListResponse {
  resources: CloudinaryImage[];
  next_cursor?: string;
}

// Mock Cloudinary functionality for development
// In production, this would connect to actual Cloudinary API
export class CloudinaryService {
  private mockImages: CloudinaryImage[] = [
    {
      public_id: 'ontdek-polen/headers/krakow-castle',
      secure_url: '/images/destinations/krakow/header.jpg',
      width: 1920,
      height: 1080,
      format: 'jpg',
      bytes: 245760,
      created_at: '2024-01-15T10:30:00Z'
    },
    {
      public_id: 'ontdek-polen/headers/warsaw-oldtown',
      secure_url: '/images/destinations/warsaw/header.jpg',
      width: 1920,
      height: 1080,
      format: 'jpg',
      bytes: 298000,
      created_at: '2024-01-16T14:20:00Z'
    },
    {
      public_id: 'ontdek-polen/activities/mountain-hiking',
      secure_url: '/images/activities/hiking.jpg',
      width: 800,
      height: 600,
      format: 'jpg',
      bytes: 156000,
      created_at: '2024-01-17T09:15:00Z'
    }
  ];

  async listImages(folder: string, maxResults: number = 20): Promise<CloudinaryListResponse> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Filter mock images by folder
    const filteredImages = this.mockImages.filter(img => 
      img.public_id.includes(folder) || folder === 'ontdek-polen'
    );
    
    return {
      resources: filteredImages.slice(0, maxResults)
    };
  }

  async deleteImage(publicId: string): Promise<{ result: string }> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 200));
    
    // Remove from mock data
    const index = this.mockImages.findIndex(img => img.public_id === publicId);
    if (index > -1) {
      this.mockImages.splice(index, 1);
      return { result: 'ok' };
    }
    
    throw new Error('Image not found');
  }

  async uploadImage(file: Buffer, publicId: string): Promise<CloudinaryImage> {
    // Simulate upload
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const newImage: CloudinaryImage = {
      public_id: publicId,
      secure_url: `/uploads/${publicId}`,
      width: 800,
      height: 600,
      format: 'jpg',
      bytes: file.length,
      created_at: new Date().toISOString()
    };
    
    this.mockImages.push(newImage);
    return newImage;
  }

  generateOptimizedUrl(publicId: string, options: {
    width?: number;
    height?: number;
    quality?: number;
    format?: string;
  } = {}): string {
    // Generate Cloudinary-style transform URL
    const baseUrl = `https://res.cloudinary.com/ontdek-polen/image/upload`;
    
    const transforms: string[] = [];
    if (options.width) transforms.push(`w_${options.width}`);
    if (options.height) transforms.push(`h_${options.height}`);
    if (options.quality) transforms.push(`q_${options.quality}`);
    if (options.format) transforms.push(`f_${options.format}`);
    
    const transformString = transforms.length > 0 ? transforms.join(',') + '/' : '';
    return `${baseUrl}/${transformString}${publicId}`;
  }
}

export const cloudinaryService = new CloudinaryService();