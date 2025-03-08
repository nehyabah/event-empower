
import { useState, useEffect } from "react";
import { StoryImage } from "./StoryEditor";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ImageGalleryProps {
  images: StoryImage[];
  storyType?: 'general' | 'bride' | 'groom';
  onRemove?: (id: string) => void;
  isEditMode?: boolean;
  displayMode?: 'grid' | 'sideBySide';
}

const ImageGallery = ({ 
  images, 
  storyType = 'general', 
  onRemove,
  isEditMode = false,
  displayMode = 'grid'
}: ImageGalleryProps) => {
  const [selectedImage, setSelectedImage] = useState<StoryImage | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Filter images based on story type if specified
  const filteredImages = storyType === 'general' 
    ? images 
    : images.filter(img => img.storyType === storyType);

  useEffect(() => {
    // Cleanup function to re-enable scrolling when component unmounts
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  if (filteredImages.length === 0) {
    return <div className="text-center text-sm text-gray-500 italic py-2">No images to display</div>;
  }

  const openLightbox = (image: StoryImage, index: number) => {
    setSelectedImage(image);
    setCurrentIndex(index);
    // Prevent scrolling when lightbox is open
    document.body.style.overflow = 'hidden';
  };

  const closeLightbox = () => {
    setSelectedImage(null);
    // Re-enable scrolling
    document.body.style.overflow = 'auto';
  };

  const goToPrevious = () => {
    const newIndex = (currentIndex - 1 + filteredImages.length) % filteredImages.length;
    setSelectedImage(filteredImages[newIndex]);
    setCurrentIndex(newIndex);
  };

  const goToNext = () => {
    const newIndex = (currentIndex + 1) % filteredImages.length;
    setSelectedImage(filteredImages[newIndex]);
    setCurrentIndex(newIndex);
  };

  // Handle keyboard navigation
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (!selectedImage) return;
    
    if (event.key === 'ArrowLeft') {
      goToPrevious();
    } else if (event.key === 'ArrowRight') {
      goToNext();
    } else if (event.key === 'Escape') {
      closeLightbox();
    }
  };

  // Side by side mode (used for bride/groom stories)
  if (displayMode === 'sideBySide') {
    // Show the first image or a small gallery if there are multiple
    if (filteredImages.length === 1) {
      return (
        <div 
          className="relative h-full aspect-square rounded-md overflow-hidden shadow-md border border-wedding-gold/20 cursor-pointer"
          onClick={() => openLightbox(filteredImages[0], 0)}
        >
          <img
            src={filteredImages[0].url}
            alt={filteredImages[0].caption || `${storyType} story image`}
            className="w-full h-full object-cover"
          />
          {isEditMode && onRemove && (
            <Button
              variant="destructive"
              size="icon"
              className="absolute top-2 right-2"
              onClick={(e) => {
                e.stopPropagation();
                onRemove(filteredImages[0].id);
              }}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      );
    }
    
    // Multiple images - show main image with thumbnails
    return (
      <div className="space-y-2">
        <div 
          className="relative h-48 rounded-md overflow-hidden shadow-md border border-wedding-gold/20 cursor-pointer"
          onClick={() => openLightbox(filteredImages[0], 0)}
        >
          <img
            src={filteredImages[0].url}
            alt={filteredImages[0].caption || `${storyType} story image`}
            className="w-full h-full object-cover"
          />
          {isEditMode && onRemove && (
            <Button
              variant="destructive"
              size="icon"
              className="absolute top-2 right-2"
              onClick={(e) => {
                e.stopPropagation();
                onRemove(filteredImages[0].id);
              }}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        
        {filteredImages.length > 1 && (
          <div className="flex gap-1 overflow-x-auto">
            {filteredImages.slice(1, 4).map((image, index) => (
              <div 
                key={image.id} 
                className="relative w-16 h-16 flex-shrink-0 rounded overflow-hidden cursor-pointer"
                onClick={() => openLightbox(image, index + 1)}
              >
                <img
                  src={image.url}
                  alt={image.caption || `${storyType} story image`}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
            {filteredImages.length > 4 && (
              <div 
                className="relative w-16 h-16 flex-shrink-0 rounded overflow-hidden cursor-pointer bg-black/50 flex items-center justify-center text-white"
                onClick={() => openLightbox(filteredImages[4], 4)}
              >
                +{filteredImages.length - 4}
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  // Default grid mode
  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {filteredImages.map((image, index) => (
          <div 
            key={image.id} 
            className="relative group rounded-md overflow-hidden shadow-md border border-wedding-gold/20 hover:shadow-lg transition-all duration-300"
          >
            <div 
              className="h-64 overflow-hidden cursor-pointer"
              onClick={() => openLightbox(image, index)}
            >
              <img
                src={image.url}
                alt={image.caption || `${storyType} story image`}
                className="w-full h-full object-cover transition-transform hover:scale-105 duration-500"
              />
            </div>
            {isEditMode && onRemove && (
              <Button
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => {
                  e.stopPropagation();
                  onRemove(image.id);
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
            {image.caption && (
              <p className="p-3 text-sm text-center bg-secondary/20 border-t border-wedding-gold/20">
                {image.caption}
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Lightbox */}
      {selectedImage && (
        <div 
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4 animate-fade-in"
          onKeyDown={handleKeyDown}
          tabIndex={0}
          onClick={closeLightbox}
        >
          <div 
            className="relative max-w-4xl max-h-[90vh] w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <Button 
              variant="ghost" 
              size="icon" 
              className="absolute top-2 right-2 bg-black/20 hover:bg-black/40 text-white rounded-full z-10"
              onClick={closeLightbox}
            >
              <X className="h-5 w-5" />
            </Button>
            
            <Button 
              variant="ghost" 
              size="icon" 
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/20 hover:bg-black/40 text-white rounded-full z-10"
              onClick={(e) => {
                e.stopPropagation();
                goToPrevious();
              }}
            >
              <ChevronLeft className="h-6 w-6" />
            </Button>
            
            <div className="h-full flex flex-col items-center">
              <img 
                src={selectedImage.url} 
                alt={selectedImage.caption || "Gallery image"} 
                className="max-h-[80vh] max-w-full object-contain rounded shadow-2xl" 
              />
              {selectedImage.caption && (
                <p className="text-white text-center mt-4 bg-black/30 p-2 rounded w-full backdrop-blur-sm">
                  {selectedImage.caption}
                </p>
              )}
              <div className="text-white text-sm mt-2">
                {currentIndex + 1} / {filteredImages.length}
              </div>
            </div>

            <Button 
              variant="ghost" 
              size="icon" 
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/20 hover:bg-black/40 text-white rounded-full z-10"
              onClick={(e) => {
                e.stopPropagation();
                goToNext();
              }}
            >
              <ChevronRight className="h-6 w-6" />
            </Button>
          </div>
        </div>
      )}
    </>
  );
};

export default ImageGallery;
