import { useState } from "react";
import {
  X,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Mail,
  Phone,
  Heart,
  Globe
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface VendorImage {
  url: string;
  alt: string;
}

interface VendorDetailProps {
  id: string;
  name: string;
  category: string;
  location: string;
  rating: number;
  reviewCount: number;
  description: string;
  images: VendorImage[];
  services: string[];
  contact: {
    email: string;
    phone: string;
    website?: string;
  };
  onClose: () => void;
  onContact: () => void;
}

const VendorDetail = ({
  id,
  name,
  category,
  location,
  rating,
  reviewCount,
  description,
  images,
  services,
  contact,
  onClose,
  onContact
}: VendorDetailProps) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const handleBooking = () => {
    toast.success("Booking request sent!", {
      description: `Your booking request for ${name} has been sent.`
    });
  };

  const toggleFavorite = () => {
    setIsFavorite(!isFavorite);
    if (!isFavorite) {
      toast.success("Added to favorites");
    } else {
      toast("Removed from favorites");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center">
      <div className="bg-background w-full sm:rounded-xl sm:max-w-2xl sm:mx-4 max-h-[95vh] sm:max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="sticky top-0 bg-background px-4 py-3 border-b flex justify-between items-center z-10 shrink-0">
          <h2 className="text-lg sm:text-xl font-serif truncate pr-2">{name}</h2>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className={`h-8 w-8 ${isFavorite ? "text-red-500" : ""}`}
              onClick={toggleFavorite}
            >
              <Heart className={`h-4 w-4 ${isFavorite ? "fill-red-500" : ""}`} />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {/* Image Gallery */}
          <div className="relative h-56 sm:h-72 bg-muted">
            <img
              src={images[currentImageIndex].url}
              alt={images[currentImageIndex].alt}
              className="w-full h-full object-cover"
            />
            {images.length > 1 && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/30 text-white hover:bg-black/50 h-8 w-8"
                  onClick={prevImage}
                >
                  <ChevronLeft className="h-5 w-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/30 text-white hover:bg-black/50 h-8 w-8"
                  onClick={nextImage}
                >
                  <ChevronRight className="h-5 w-5" />
                </Button>
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                  {images.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`w-2 h-2 rounded-full transition-colors ${
                        index === currentImageIndex ? "bg-white" : "bg-white/50"
                      }`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>

          <div className="p-4 space-y-5">
            {/* Badges */}
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary">{category}</Badge>
              <Badge variant="outline">{location}</Badge>
              <div className="flex items-center text-yellow-500 text-sm">
                <span className="font-medium">{rating.toFixed(1)}</span>
                <span className="text-muted-foreground ml-1">({reviewCount})</span>
              </div>
            </div>

            {/* About */}
            <div>
              <h3 className="text-sm font-medium mb-2">About</h3>
              <p className="text-sm text-muted-foreground">{description}</p>
            </div>

            {/* Services */}
            {services.length > 0 && (
              <div>
                <h3 className="text-sm font-medium mb-2">Services</h3>
                <div className="flex flex-wrap gap-1.5">
                  {services.map((service, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {service}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Contact */}
            <div>
              <h3 className="text-sm font-medium mb-2">Contact</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="h-4 w-4 shrink-0" />
                  <span className="truncate">{contact.email}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Phone className="h-4 w-4 shrink-0" />
                  <span>{contact.phone}</span>
                </div>
                {contact.website && (
                  <a
                    href={contact.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-primary hover:underline"
                  >
                    <Globe className="h-4 w-4 shrink-0" />
                    <span>Visit Website</span>
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="sticky bottom-0 bg-background border-t p-4 shrink-0">
          <div className="flex gap-3">
            <Button className="flex-1" onClick={handleBooking}>
              <Calendar className="mr-2 h-4 w-4" />
              Book Now
            </Button>
            <Button variant="outline" className="flex-1" onClick={onContact}>
              Send Inquiry
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VendorDetail;
