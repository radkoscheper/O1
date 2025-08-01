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

export function TravelSlider({ 
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
  const showNavigationButtons = showNavigation && children.length > visibleItems.desktop

  return (
    <div className={cn("relative", className)} data-testid="travel-slider">
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex">
          {children.map((child, index) => (
            <div
              key={index}
              className={cn(
                "flex-none px-2",
                // Mobile: full width (1 item)
                "w-full",
                // Tablet: half width (2 items)
                "md:w-1/2",
                // Desktop: quarter width (4 items)
                "lg:w-1/4"
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
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 z-10 bg-white/90 hover:bg-white shadow-lg"
            onClick={scrollPrev}
            aria-label="Vorige items"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 z-10 bg-white/90 hover:bg-white shadow-lg"
            onClick={scrollNext}
            aria-label="Volgende items"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </>
      )}

      {/* Scroll Indicator Dots (only show if more than visible items) */}
      {children.length > visibleItems.desktop && (
        <div className="flex justify-center mt-4 space-x-2">
          {Array.from({ length: Math.ceil(children.length / visibleItems.desktop) }).map((_, index) => (
            <div
              key={index}
              className="w-2 h-2 rounded-full bg-gray-300 opacity-50"
              aria-hidden="true"
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default TravelSlider