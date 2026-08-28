import { useState } from "react";
import {
  X,
  ChevronLeft,
  ChevronRight,
  Mail,
  Phone,
  Heart,
  Globe,
  Plane,
  Star,
  Lock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface VendorImage {
  url: string;
  alt: string;
}

interface ServiceSummary {
  name: string;
  description: string | null;
  price_min: number | null;
  price_max: number | null;
}

interface ReviewSummary {
  id: string;
  rating: number;
  title: string | null;
  comment: string | null;
  created_at: string;
  reviewer_name?: string | null;
}

const Stars = ({ value, className = "h-3.5 w-3.5" }: { value: number; className?: string }) => (
  <div className="flex items-center gap-0.5">
    {[1, 2, 3, 4, 5].map((n) => (
      <Star key={n} className={`${className} ${n <= Math.round(value) ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30"}`} />
    ))}
  </div>
);

interface VendorDetailProps {
  id: string;
  name: string;
  category: string;
  location: string;
  rating: number;
  reviewCount: number;
  description: string;
  images: VendorImage[];
  services: ServiceSummary[];
  reviews?: ReviewSummary[];
  openToTravel?: boolean;
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
  reviews = [],
  openToTravel,
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
              {openToTravel && (
                <Badge variant="outline" className="gap-1 border-blue-400 text-blue-600">
                  <Plane className="h-3 w-3" />
                  Open to travel
                </Badge>
              )}
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
                <h3 className="text-sm font-medium mb-3">Packages & Pricing</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {services.map((service, index) => {
                    const hasMin = service.price_min != null;
                    const hasMax = service.price_max != null;
                    const hasPrice = hasMin || hasMax;

                    const priceDisplay = hasMin && hasMax
                      ? (
                        <span>
                          ₦{service.price_min!.toLocaleString()}
                          <span className="text-muted-foreground font-normal text-sm"> – ₦{service.price_max!.toLocaleString()}</span>
                        </span>
                      )
                      : hasMin
                      ? <span>₦{service.price_min!.toLocaleString()}</span>
                      : hasMax
                      ? <span>₦{service.price_max!.toLocaleString()}</span>
                      : null;

                    const priceLabel = hasMin && hasMax
                      ? "Price range"
                      : hasMin
                      ? "Starting from"
                      : "Up to";

                    return (
                      <div
                        key={index}
                        className="rounded-xl border bg-card p-4 flex flex-col gap-2 hover:shadow-sm transition-shadow"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-sm font-semibold leading-tight">{service.name}</p>
                        </div>

                        {hasPrice && (
                          <div>
                            <p className="text-[11px] uppercase tracking-wide text-muted-foreground mb-0.5">{priceLabel}</p>
                            <p className="text-lg font-bold text-primary leading-tight">{priceDisplay}</p>
                          </div>
                        )}

                        {service.description && (
                          <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">{service.description}</p>
                        )}

                        {!hasPrice && !service.description && (
                          <p className="text-xs text-muted-foreground italic">Contact for pricing</p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Reviews */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium">
                  Reviews {reviewCount > 0 && <span className="text-muted-foreground font-normal">({reviewCount})</span>}
                </h3>
                {reviewCount > 0 && (
                  <div className="flex items-center gap-1.5">
                    <Stars value={rating} />
                    <span className="text-sm font-medium">{rating.toFixed(1)}</span>
                  </div>
                )}
              </div>
              {reviews.length === 0 ? (
                <p className="text-sm text-muted-foreground italic">No reviews yet — be the first couple to work with them.</p>
              ) : (
                <div className="space-y-3">
                  {reviews.map((r) => (
                    <div key={r.id} className="rounded-xl border bg-card p-4">
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="h-7 w-7 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-semibold shrink-0">
                            {(r.reviewer_name || "G")[0].toUpperCase()}
                          </div>
                          <span className="text-sm font-medium truncate">{r.reviewer_name || "A couple"}</span>
                        </div>
                        <Stars value={r.rating} />
                      </div>
                      {r.title && <p className="text-sm font-medium mb-0.5">{r.title}</p>}
                      {r.comment && <p className="text-sm text-muted-foreground leading-relaxed">{r.comment}</p>}
                      <p className="text-[11px] text-muted-foreground/70 mt-1.5">
                        {new Date(r.created_at).toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Contact */}
            <div>
              <h3 className="text-sm font-medium mb-2">Contact</h3>
              {contact.email || contact.phone || contact.website ? (
                <div className="space-y-2 text-sm">
                  {contact.email && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Mail className="h-4 w-4 shrink-0" />
                      <span className="truncate">{contact.email}</span>
                    </div>
                  )}
                  {contact.phone && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Phone className="h-4 w-4 shrink-0" />
                      <span>{contact.phone}</span>
                    </div>
                  )}
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
              ) : (
                <div className="rounded-lg border bg-muted/40 p-3 space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Lock className="h-4 w-4 shrink-0" />
                    <span className="tracking-widest">••• ••• ••••</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Contact details unlock once this vendor is booked. Until then, message
                    them here — it keeps a record of what you agreed.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="sticky bottom-0 bg-background border-t p-4 shrink-0">
          <Button className="w-full" onClick={onContact}>
            Send Inquiry
          </Button>
        </div>
      </div>
    </div>
  );
};

export default VendorDetail;
