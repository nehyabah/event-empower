
import { useState } from "react";
import { StoryImage } from "./StoryEditor";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ImageGalleryProps {
  images: StoryImage[];
}

const ImageGallery = ({ images }: ImageGalleryProps) => {
  const [selectedImage, setSelectedImage] = useState<StoryImage | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  if (images.length === 0) {
    return null;
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
    const newIndex = (currentIndex - 1 + images.length) % images.length;
    setSelectedImage(images[newIndex]);
    setCurrentIndex(newIndex);
  };

  const goToNext = () => {
    const newIndex = (currentIndex + 1) % images.length;
    setSelectedImage(images[newIndex]);
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

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {images.map((image, index) => (
          <div 
            key={image.id} 
            className="border rounded-md overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => openLightbox(image, index)}
          >
            <div className="h-64 overflow-hidden">
              <img
                src={image.url}
                alt={image.caption || "Our story"}
                className="w-full h-full object-cover transition-transform hover:scale-105 duration-300"
              />
            </div>
            {image.caption && (
              <p className="p-3 text-sm text-center bg-gray-50 border-t">{image.caption}</p>
            )}
          </div>
        ))}
      </div>

      {/* Lightbox */}
      {selectedImage && (
        <div 
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
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
                className="max-h-[80vh] max-w-full object-contain rounded" 
              />
              {selectedImage.caption && (
                <p className="text-white text-center mt-4 bg-black/20 p-2 rounded w-full">
                  {selectedImage.caption}
                </p>
              )}
              <div className="text-white text-sm mt-2">
                {currentIndex + 1} / {images.length}
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
