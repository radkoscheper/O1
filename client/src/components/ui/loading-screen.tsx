import { useEffect, useState } from 'react';

interface LoadingScreenProps {
  isLoading: boolean;
  title: string;
  subtitle: string;
  onComplete?: () => void;
  minDuration?: number; // Minimum time to show loading screen in ms
}

export function LoadingScreen({ isLoading, title, subtitle, onComplete, minDuration = 1200 }: LoadingScreenProps) {
  const [show, setShow] = useState(true); // Always start showing
  const [fadeOut, setFadeOut] = useState(false);
  const [startTime, setStartTime] = useState<number>(Date.now()); // Always start timing

  // Force show loading screen on navigation
  useEffect(() => {
    if (isLoading) {
      setShow(true);
      setFadeOut(false);
      setStartTime(Date.now());
    }
  }, [isLoading]);

  useEffect(() => {
    if (!isLoading && show) {
      const elapsed = Date.now() - startTime;
      const remainingTime = Math.max(0, minDuration - elapsed);
      
      // Wait for minimum duration before starting fade out
      const hideTimer = setTimeout(() => {
        setFadeOut(true);
        const fadeTimer = setTimeout(() => {
          setShow(false);
          onComplete?.();
        }, 600); // Match the transition duration
        
        return () => clearTimeout(fadeTimer);
      }, remainingTime);
      
      return () => clearTimeout(hideTimer);
    }
  }, [isLoading, show, startTime, minDuration, onComplete]);

  if (!show) return null;

  return (
    <div 
      className={`fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-blue-50 transition-opacity duration-600 ${
        fadeOut ? 'opacity-0' : 'opacity-100'
      }`}
    >
      {/* Central loading card */}
      <div className="text-center max-w-md mx-auto px-8">
        {/* Logo/Brand area */}
        <div className="mb-8">
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-navy-dark to-navy-medium rounded-full flex items-center justify-center shadow-xl">
            <span className="text-2xl font-luxury-serif font-bold text-white">P</span>
          </div>
        </div>

        {/* Loading content */}
        <div className="space-y-4">
          <h1 className="text-3xl md:text-4xl font-luxury-serif font-bold text-navy-dark tracking-wide">
            {title}
          </h1>
          <p className="text-lg md:text-xl text-navy-medium font-elegant-serif leading-relaxed">
            {subtitle}
          </p>
        </div>

        {/* Elegant loading animation */}
        <div className="mt-8 flex justify-center space-x-2">
          <div className="w-2 h-2 bg-gold rounded-full animate-pulse" style={{ animationDelay: '0ms' }}></div>
          <div className="w-2 h-2 bg-gold rounded-full animate-pulse" style={{ animationDelay: '150ms' }}></div>
          <div className="w-2 h-2 bg-gold rounded-full animate-pulse" style={{ animationDelay: '300ms' }}></div>
        </div>

        {/* Decorative line */}
        <div className="mt-8 w-24 h-px bg-gradient-to-r from-transparent via-gold to-transparent mx-auto"></div>
      </div>
    </div>
  );
}

// Hook to get contextual loading content based on current page
export function useLoadingContent(location: string, siteSettings?: any, destinationData?: any) {
  const getLoadingContent = (path: string) => {
    // Homepage - use site settings from CMS
    if (path === '/' || path === '') {
      return {
        title: siteSettings?.siteName || "Ontdek Polen",
        subtitle: siteSettings?.siteDescription || "Van historische steden tot adembenemende natuurparken"
      };
    }

    // Ontdek Meer page - use site settings
    if (path.includes('/ontdek-meer')) {
      return {
        title: "Ontdek Meer",
        subtitle: siteSettings?.siteDescription || "Alle bestemmingen en reisgidsen op één plek"
      };
    }

    // Destination pages - use destination data from CMS
    if (destinationData) {
      return {
        title: destinationData.name || destinationData.title,
        subtitle: destinationData.description || destinationData.subtitle || "Ontdek de schatten van Polen"
      };
    }

    // Generic fallback for unknown pages
    if (path.startsWith('/') && path.length > 1) {
      const destination = path.substring(1).replace('-', ' ');
      return {
        title: destination.charAt(0).toUpperCase() + destination.slice(1),
        subtitle: "Ontdek de schatten van Polen"
      };
    }

    // Default fallback
    return {
      title: siteSettings?.siteName || "Ontdek Polen",
      subtitle: siteSettings?.siteDescription || "Jouw reis naar Polen begint hier"
    };
  };

  return getLoadingContent(location);
}