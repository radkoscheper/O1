import React, { useCallback } from 'react'
import useEmblaCarousel from 'embla-carousel-react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface TravelSliderProps {
  children: React.ReactNode[]
  visibleItems?: {
    mobile: number
    tablet: number
    desktop: number
  }
  showNavigation?: boolean
  className?: string
}

export default function TravelSlider({ 
  children, 
  visibleItems = { mobile: 1, tablet: 2, desktop: 4 },
  showNavigation = true,
  className 
}: TravelSliderProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: 'start',
    slidesToScroll: 1,
    breakpoints: {
      '(min-width: 768px)': { 
        slidesToScroll: visibleItems.tablet 
      },
      '(min-width: 1024px)': { 
        slidesToScroll: visibleItems.desktop 
      }
    }
  })

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev()
  }, [emblaApi])

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext()
  }, [emblaApi])

  // Don't show navigation if we have 4 or fewer items
  const showNavigationButtons = showNavigation && children && children.length > visibleItems.desktop

  if (!children || children.length === 0) {
    return null;
  }

  return (
    <div className={cn("relative", className)} data-testid="travel-slider">
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex">
          {children.map((child, index) => (
            <div
              key={index}
              className={cn(
                "flex-none",
                // Mobile: full width (1 item)
                "w-full",
                // Tablet: half width (2 items) 
                visibleItems.tablet === 2 ? "md:w-1/2" : visibleItems.tablet === 1 ? "md:w-full" : "md:w-1/3",
                // Desktop: based on visibleItems.desktop
                visibleItems.desktop === 4 ? "lg:w-1/4" : visibleItems.desktop === 2 ? "lg:w-1/2" : visibleItems.desktop === 3 ? "lg:w-1/3" : "lg:w-full"
              )}
            >
              {child}
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Buttons */}
      {showNavigationButtons && (
        <>
          <Button
            variant="outline"
            size="sm"
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 z-10 bg-white/95 hover:bg-white shadow-xl border-gold-accent/30 rounded-full"
            onClick={scrollPrev}
            aria-label="Vorige items"
          >
            <ChevronLeft className="h-4 w-4 text-navy-dark" />
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 z-10 bg-white/95 hover:bg-white shadow-xl border-gold-accent/30 rounded-full"
            onClick={scrollNext}
            aria-label="Volgende items"
          >
            <ChevronRight className="h-4 w-4 text-navy-dark" />
          </Button>
        </>
      )}

      {/* Scroll Indicator Dots (only show if more than visible items) */}
      {children.length > visibleItems.desktop && (
        <div className="flex justify-center mt-6 space-x-2">
          {Array.from({ length: Math.ceil(children.length / visibleItems.desktop) }).map((_, index) => (
            <div
              key={index}
              className="w-3 h-3 rounded-full bg-gold-accent/60 hover:bg-gold-accent transition-all duration-300 cursor-pointer"
              aria-hidden="true"
            />
          ))}
        </div>
      )}
    </div>
  )
}