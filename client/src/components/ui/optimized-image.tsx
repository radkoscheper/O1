import React, { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

interface OptimizedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  fallback?: string;
  placeholder?: string;
  lazy?: boolean;
  quality?: number;
  formats?: string[];
  sizes?: string;
  priority?: boolean;
  onLoad?: () => void;
  onError?: () => void;
  className?: string;
}

export function OptimizedImage({
  src,
  alt,
  fallback = '/images/placeholder.jpg',
  placeholder = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxOCIgZmlsbD0iIzllYTNhOCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkxhZGVuLi4uPC90ZXh0Pjwvc3ZnPg==',
  lazy = true,
  quality = 80,
  formats = ['webp', 'jpg'],
  sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
  priority = false,
  onLoad,
  onError,
  className,
  ...props
}: OptimizedImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isError, setIsError] = useState(false);
  const [isInView, setIsInView] = useState(!lazy || priority);
  const [currentSrc, setCurrentSrc] = useState(placeholder);
  const imgRef = useRef<HTMLImageElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (!lazy || priority || isInView) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.disconnect();
          }
        });
      },
      { 
        threshold: 0.1,
        rootMargin: '50px'
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    observerRef.current = observer;

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [lazy, priority, isInView]);

  // Generate optimized src based on available formats
  const getOptimizedSrc = (originalSrc: string, format?: string) => {
    if (!originalSrc || originalSrc.startsWith('data:')) return originalSrc;
    
    // If it's a Cloudinary URL, add optimization parameters
    if (originalSrc.includes('cloudinary.com')) {
      const params = [
        `q_${quality}`,
        'f_auto',
        'dpr_auto',
        'c_limit',
        'w_auto'
      ];
      
      if (format) params.push(`f_${format}`);
      
      // Insert parameters after /upload/
      return originalSrc.replace('/upload/', `/upload/${params.join(',')}/`);
    }
    
    // For other URLs, return as-is (could add other CDN optimizations here)
    return originalSrc;
  };

  // Load image when in view
  useEffect(() => {
    if (!isInView || isLoaded || isError) return;

    const img = new Image();
    
    img.onload = () => {
      setCurrentSrc(getOptimizedSrc(src));
      setIsLoaded(true);
      onLoad?.();
    };
    
    img.onerror = () => {
      setCurrentSrc(fallback);
      setIsError(true);
      onError?.();
    };

    // Try to load WebP first if supported
    if (formats.includes('webp') && supportsWebP()) {
      img.src = getOptimizedSrc(src, 'webp');
    } else {
      img.src = getOptimizedSrc(src);
    }
  }, [isInView, src, fallback, quality, formats, isLoaded, isError, onLoad, onError]);

  // Check WebP support
  const supportsWebP = () => {
    if (typeof window === 'undefined') return false;
    
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    
    return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
  };

  // Generate srcSet for responsive images
  const generateSrcSet = () => {
    if (!src || src.startsWith('data:')) return undefined;
    
    if (src.includes('cloudinary.com')) {
      const widths = [320, 640, 768, 1024, 1280, 1600];
      return widths
        .map(width => {
          const optimizedSrc = src.replace('/upload/', `/upload/w_${width},q_${quality},f_auto,dpr_auto/`);
          return `${optimizedSrc} ${width}w`;
        })
        .join(', ');
    }
    
    return undefined;
  };

  return (
    <img
      ref={imgRef}
      src={currentSrc}
      srcSet={isLoaded ? generateSrcSet() : undefined}
      sizes={sizes}
      alt={alt}
      loading={priority ? 'eager' : 'lazy'}
      decoding="async"
      className={cn(
        'transition-opacity duration-300',
        isLoaded ? 'opacity-100' : 'opacity-0',
        isError && 'opacity-60',
        className
      )}
      {...props}
    />
  );
}

// Wrapper component with common use cases
export function HeroImage({ src, alt, className, ...props }: OptimizedImageProps) {
  return (
    <OptimizedImage
      src={src}
      alt={alt}
      priority={true}
      quality={90}
      className={cn('w-full h-auto object-cover', className)}
      sizes="100vw"
      {...props}
    />
  );
}

export function ThumbnailImage({ src, alt, className, ...props }: OptimizedImageProps) {
  return (
    <OptimizedImage
      src={src}
      alt={alt}
      lazy={true}
      quality={75}
      className={cn('w-full h-auto object-cover rounded-lg', className)}
      sizes="(max-width: 768px) 50vw, 25vw"
      {...props}
    />
  );
}

export function DestinationImage({ src, alt, className, ...props }: OptimizedImageProps) {
  return (
    <OptimizedImage
      src={src}
      alt={alt}
      lazy={true}
      quality={85}
      className={cn('w-full h-64 object-cover rounded-xl shadow-lg', className)}
      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
      {...props}
    />
  );
}

export default OptimizedImage;