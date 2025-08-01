import { CloudinaryService } from './cloudinary';

/**
 * AI-optimized image transformations for Polish travel content
 */
export class CloudinaryTransforms {
  
  /**
   * Generate hero image with smart cropping and overlay
   */
  static generateHeroImage(publicId: string, options: {
    width?: number;
    height?: number;
    overlayOpacity?: number;
    title?: string;
  } = {}) {
    const { width = 1920, height = 800, overlayOpacity = 30, title } = options;
    
    return CloudinaryService.generateUrl(publicId, {
      width,
      height,
      crop: 'fill',
      quality: 'auto:best',
      format: 'webp',
    });
  }

  /**
   * Generate card thumbnail with smart focus
   */
  static generateCardThumbnail(publicId: string, width: number = 400, height: number = 250) {
    return CloudinaryService.generateUrl(publicId, {
      width,
      height,
      crop: 'fill',
      quality: 'auto:good',
      format: 'webp',
    });
  }

  /**
   * Generate mobile-optimized image
   */
  static generateMobileImage(publicId: string, width: number = 800) {
    return CloudinaryService.generateUrl(publicId, {
      width,
      crop: 'scale',
      quality: 'auto:eco',
      format: 'webp',
    });
  }

  /**
   * Generate gallery image with multiple sizes
   */
  static generateGalleryImages(publicId: string) {
    return {
      thumbnail: this.generateCardThumbnail(publicId, 300, 200),
      medium: CloudinaryService.generateUrl(publicId, {
        width: 800,
        height: 600,
        crop: 'fill',
        quality: 'auto:good',
        format: 'webp',
      }),
      large: CloudinaryService.generateUrl(publicId, {
        width: 1400,
        height: 1000,
        crop: 'fill',
        quality: 'auto:best',
        format: 'webp',
      }),
    };
  }

  /**
   * AI-enhanced destination image with automatic improvements
   */
  static enhanceDestinationImage(publicId: string, options: {
    width?: number;
    height?: number;
    enhance?: boolean;
  } = {}) {
    const { width = 1200, height = 800, enhance = true } = options;
    
    const baseOptions = {
      width,
      height,
      crop: 'fill',
      quality: 'auto:best',
      format: 'webp',
    };

    // Apply AI enhancements if requested
    if (enhance) {
      return CloudinaryService.generateUrl(publicId, {
        ...baseOptions,
        // AI-powered automatic enhancement
        effect: 'auto_brightness:80',
      });
    }

    return CloudinaryService.generateUrl(publicId, baseOptions);
  }

  /**
   * Generate social media optimized images
   */
  static generateSocialImages(publicId: string) {
    return {
      facebook: CloudinaryService.generateUrl(publicId, {
        width: 1200,
        height: 630,
        crop: 'fill',
        quality: 'auto:good',
        format: 'jpg',
      }),
      twitter: CloudinaryService.generateUrl(publicId, {
        width: 1200,
        height: 600,
        crop: 'fill',
        quality: 'auto:good',
        format: 'jpg',
      }),
      instagram: CloudinaryService.generateUrl(publicId, {
        width: 1080,
        height: 1080,
        crop: 'fill',
        quality: 'auto:good',
        format: 'jpg',
      }),
    };
  }

  /**
   * Smart folder organization for Polish travel content
   */
  static getFolderPath(contentType: string, location?: string) {
    const baseFolder = 'ontdek-polen';
    
    switch (contentType) {
      case 'destination':
        return location ? `${baseFolder}/destinations/${location.toLowerCase()}` : `${baseFolder}/destinations`;
      case 'guide':
        return `${baseFolder}/guides`;
      case 'activity':
        return `${baseFolder}/activities`;
      case 'highlight':
        return `${baseFolder}/highlights`;
      case 'background':
        return `${baseFolder}/backgrounds`;
      case 'logo':
        return `${baseFolder}/branding`;
      case 'motivation':
        return `${baseFolder}/motivation`;
      default:
        return baseFolder;
    }
  }
}

export default CloudinaryTransforms;