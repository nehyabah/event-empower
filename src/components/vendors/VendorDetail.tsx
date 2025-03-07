
import { useState } from "react";
import { 
  X, 
  ChevronLeft, 
  ChevronRight, 
  Calendar, 
  Mail, 
  Phone, 
  Heart 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";

interface VendorImage {
  url: string;
  alt: string;
}

interface VendorDetailProps {
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
}

const VendorDetail = ({
  name,
  category,
  location,
  rating,
  reviewCount,
  description,
  images,
  services,
  contact,
  onClose
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
      description: `Your booking request for ${name} has been sent. They will contact you shortly.`
    });
  };

  const toggleFavorite = () => {
    setIsFavorite(!isFavorite);
    if (!isFavorite) {
      toast.success("Added to favorites", {
        description: `${name} has been added to your favorites.`
      });
    } else {
      toast("Removed from favorites");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-background rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-background p-4 border-b flex justify-between items-center z-10">
          <h2 className="text-2xl font-serif">{name}</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Image Gallery */}
        <div className="relative h-80 md:h-96 bg-gray-100">
          <img
            src={images[currentImageIndex].url}
            alt={images[currentImageIndex].alt}
            className="w-full h-full object-cover"
          />
          <Button 
            variant="ghost" 
            size="icon" 
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/30 text-white hover:bg-black/50"
            onClick={prevImage}
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/30 text-white hover:bg-black/50"
            onClick={nextImage}
          >
            <ChevronRight className="h-6 w-6" />
          </Button>
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
            {images.map((_, index) => (
              <span 
                key={index} 
                className={`w-2 h-2 rounded-full ${
                  index === currentImageIndex ? "bg-white" : "bg-white/50"
                }`}
              />
            ))}
          </div>
        </div>

        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <div className="flex items-center gap-2">
                <Badge variant="outline">{category}</Badge>
                <Badge variant="outline">{location}</Badge>
                <div className="flex items-center text-wedding-gold">
                  <span className="text-lg font-medium">{rating.toFixed(1)}</span>
                  <span className="text-sm text-muted-foreground ml-1">({reviewCount} reviews)</span>
                </div>
              </div>
            </div>
            <Button 
              variant="outline" 
              size="icon" 
              className={isFavorite ? "text-red-500" : ""}
              onClick={toggleFavorite}
            >
              <Heart className={isFavorite ? "fill-red-500" : ""} />
            </Button>
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-medium mb-2">About</h3>
            <p className="text-muted-foreground">{description}</p>
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-medium mb-2">Services</h3>
            <div className="flex flex-wrap gap-2">
              {services.map((service, index) => (
                <Badge key={index} variant="secondary">{service}</Badge>
              ))}
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-medium mb-2">Contact Information</h3>
            <Card>
              <CardContent className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>{contact.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{contact.phone}</span>
                  </div>
                  {contact.website && (
                    <div className="flex items-center gap-2 md:col-span-2">
                      <a 
                        href={contact.website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        Visit Website
                      </a>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="flex gap-4 mt-6">
            <Button className="flex-1" onClick={handleBooking}>
              <Calendar className="mr-2 h-4 w-4" />
              Book Now
            </Button>
            <Button variant="outline" className="flex-1" onClick={onClose}>
              Back to Search
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VendorDetail;
