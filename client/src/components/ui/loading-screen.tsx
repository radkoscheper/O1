import { useEffect, useState } from 'react';

interface LoadingScreenProps {
  isLoading: boolean;
  title: string;
  subtitle: string;
  onComplete?: () => void;
}

export function LoadingScreen({ isLoading, title, subtitle, onComplete }: LoadingScreenProps) {
  const [show, setShow] = useState(isLoading);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    if (isLoading) {
      setShow(true);
      setFadeOut(false);
    } else if (show) {
      // Start fade out immediately when loading is done
      setFadeOut(true);
      const fadeTimer = setTimeout(() => {
        setShow(false);
        onComplete?.();
      }, 500); // Smooth fade out
      
      return () => clearTimeout(fadeTimer);
    }
  }, [isLoading, show, onComplete]);

  if (!show) return null;

  return (
    <div 
      className={`fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-blue-900 via-slate-800 to-slate-900 transition-opacity duration-500 ${
        fadeOut ? 'opacity-0' : 'opacity-100'
      }`}
    >
      {/* Elegant loading container */}
      <div className="text-center max-w-lg mx-auto px-8">
        {/* Luxury logo area */}
        <div className="mb-12">
          <div className="relative">
            {/* Main logo circle */}
            <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-amber-400 via-yellow-500 to-amber-600 rounded-full flex items-center justify-center shadow-2xl border-4 border-white/20">
              <span className="text-4xl font-bold text-white font-croatia-body tracking-wide">P</span>
            </div>
            
            {/* Animated rings */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-32 h-32 rounded-full border-2 border-amber-400/30 animate-ping"></div>
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-28 h-28 rounded-full border border-white/20 animate-pulse"></div>
            </div>
          </div>
        </div>

        {/* Loading content */}
        <div className="space-y-6">
          <h1 className="text-3xl md:text-4xl font-luxury-serif font-bold text-white tracking-wide">
            {title}
          </h1>
          <p className="text-lg md:text-xl text-amber-100 font-croatia-body font-light leading-relaxed">
            {subtitle}
          </p>
        </div>

        {/* Elegant loading animation */}
        <div className="mt-10 flex justify-center space-x-3">
          <div className="w-3 h-3 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-3 h-3 bg-yellow-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="w-3 h-3 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>

        {/* Decorative line */}
        <div className="mt-12 w-32 h-px bg-gradient-to-r from-transparent via-amber-400 to-transparent mx-auto opacity-60"></div>
      </div>
    </div>
  );
}

export default LoadingScreen;