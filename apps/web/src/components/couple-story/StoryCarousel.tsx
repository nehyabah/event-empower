
import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { StoryImage } from './StoryEditor';
import { cn } from '@/lib/utils';

interface StoryCarouselProps {
  title: string;
  content?: string;
  images: StoryImage[];
  storyType: 'bride' | 'groom';
  styleVariant?: 'left' | 'right';
}

const StoryCarousel = ({ 
  title, 
  content, 
  images, 
  storyType,
  styleVariant = 'left' 
}: StoryCarouselProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const filteredImages = images.filter(img => img.storyType === storyType);
  
  // If no images, don't show navigation
  const hasMultipleImages = filteredImages.length > 1;
  
  const goToPrevious = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentIndex(prev => 
      prev === 0 ? filteredImages.length - 1 : prev - 1
    );
  };
  
  const goToNext = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentIndex(prev => 
      prev === filteredImages.length - 1 ? 0 : prev + 1
    );
  };

  // Auto-play functionality
  useEffect(() => {
    if (!hasMultipleImages) return;
    
    const interval = setInterval(() => {
      goToNext();
    }, 5000); // Change image every 5 seconds
    
    return () => clearInterval(interval);
  }, [currentIndex, hasMultipleImages]);

  // Reset transition state
  useEffect(() => {
    if (isTransitioning) {
      const timer = setTimeout(() => {
        setIsTransitioning(false);
      }, 500); // Match this with the CSS transition duration
      return () => clearTimeout(timer);
    }
  }, [isTransitioning, currentIndex]);

  return (
    <div className={cn(
      "bg-secondary/10 p-6 rounded-lg shadow-md border border-wedding-gold/10",
      "transform transition-all duration-500 hover:shadow-lg",
      "backdrop-blur-sm overflow-hidden"
    )}>
      <h3 className="text-2xl font-serif text-wedding-gold mb-6 text-center font-light tracking-wide">
        {title}
      </h3>
      
      <div className={cn(
        "flex flex-col gap-6",
        "md:flex-row md:items-center",
        styleVariant === 'right' && "md:flex-row-reverse"
      )}>
        {/* Image carousel */}
        <div className={cn(
          "relative overflow-hidden rounded-md group",
          "w-full md:w-2/5",
          "aspect-[4/3]",
          "flex items-center justify-center"
        )}>
          {filteredImages.length > 0 ? (
            <>
              <div className="relative w-full h-full">
                {filteredImages.map((image, index) => (
                  <div
                    key={image.id}
                    className={cn(
                      "absolute inset-0 transition-opacity duration-500 ease-in-out",
                      index === currentIndex ? "opacity-100 z-10" : "opacity-0 z-0"
                    )}
                  >
                    <div className="relative w-full h-full overflow-hidden rounded-md border border-wedding-gold/20 shadow-md">
                      <img 
                        src={image.url} 
                        alt={image.caption || `${storyType} story image`}
                        className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
                      />
                      
                      {image.caption && (
                        <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white p-2 text-sm backdrop-blur-sm">
                          {image.caption}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Navigation controls - only show for multiple images */}
              {hasMultipleImages && (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={cn(
                      "absolute left-2 top-1/2 -translate-y-1/2 z-20 bg-black/20 hover:bg-black/40 text-white rounded-full",
                      "transition-opacity duration-300 sm:opacity-0 sm:group-hover:opacity-100"
                    )}
                    onClick={goToPrevious}
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="icon"
                    className={cn(
                      "absolute right-2 top-1/2 -translate-y-1/2 z-20 bg-black/20 hover:bg-black/40 text-white rounded-full",
                      "transition-opacity duration-300 sm:opacity-0 sm:group-hover:opacity-100"
                    )}
                    onClick={goToNext}
                  >
                    <ChevronRight className="h-5 w-5" />
                  </Button>
                  
                  <div className="absolute bottom-2 left-0 right-0 z-20 flex justify-center gap-1.5">
                    {filteredImages.map((_, index) => (
                      <button
                        key={index}
                        className={cn(
                          "w-2 h-2 rounded-full transition-all duration-300",
                          index === currentIndex ? "bg-wedding-gold scale-110" : "bg-white/50 hover:bg-white/70"
                        )}
                        onClick={() => setCurrentIndex(index)}
                        aria-label={`Go to slide ${index + 1}`}
                      />
                    ))}
                  </div>
                </>
              )}
            </>
          ) : (
            <div className="w-full h-full bg-muted/30 rounded-md flex items-center justify-center">
              <p className="text-sm text-muted-foreground">No photos available</p>
            </div>
          )}
        </div>
        
        {/* Story text */}
        <div className={cn(
          "w-full md:w-3/5 prose prose-sm max-w-none",
          styleVariant === 'left' ? "md:pl-6" : "md:pr-6"
        )}>
          {content ? (
            content.split('\n').map((paragraph, index) => (
              <p key={index} className="mb-4 text-gray-700 leading-relaxed">
                {paragraph}
              </p>
            ))
          ) : (
            <p className="text-muted-foreground italic">No story available.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default StoryCarousel;
