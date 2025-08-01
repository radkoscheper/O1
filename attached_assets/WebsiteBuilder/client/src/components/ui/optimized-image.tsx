/**
 * Optimized Image Component met Cloudinary AI Transformaties
 */

import React from 'react';
import { generateCloudinaryUrl, getSmartTransform, getOptimizedImageProps } from '@/lib/cloudinaryUtils';

interface OptimizedImageProps {
  src: string;
  alt: string;
  context?: 'header' | 'card' | 'thumbnail' | 'hero' | 'default';
  className?: string;
  filename?: string;
  onError?: (event: React.SyntheticEvent<HTMLImageElement, Event>) => void;
  style?: React.CSSProperties;
}

export function OptimizedImage({ 
  src, 
  alt, 
  context = 'default', 
  className = '', 
  filename = '',
  onError,
  style 
}: OptimizedImageProps) {
  // Skip optimization if not a Cloudinary URL
  if (!src.includes('res.cloudinary.com')) {
    return (
      <img 
        src={src} 
        alt={alt} 
        className={className}
        onError={onError}
        style={style}
      />
    );
  }

  const optimizedProps = getOptimizedImageProps(src, context, filename);

  return (
    <img
      {...optimizedProps}
      alt={alt}
      className={className}
      onError={onError}
      style={style}
    />
  );
}

export default OptimizedImage;