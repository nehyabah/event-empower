import { useEffect, useMemo, useState } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/home/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, MapPin, Star, SlidersHorizontal, MessageSquare, Eye } from "lucide-react";
import VendorDetail from "@/components/vendors/VendorDetail";
import { vendorService, VendorDetails } from "@/services/api/vendorService";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { ChatSafetyIntro } from "@/components/safety/ChatSafetyNotice";
import VendorChatModal from "@/components/vendors/VendorChatModal";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  VENDOR_CATEGORIES, NIGERIAN_STATES, ALL_CATEGORIES, ALL_LOCATIONS,
  locationMatchesState,
} from "@/lib/vendorTaxonomy";

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

interface VendorCardProps {
  id: string;
  name: string;
  category: string;
  location: string;
  rating: number;
  reviewCount: number;
  imageUrl: string;
  images: VendorImage[];
  description: string;
  services: ServiceSummary[];
  reviews: ReviewSummary[];
  openToTravel: boolean;
  contact: {
    email: string;
    phone: string;
    website?: string;
  };
  onViewDetails: () => void;
  onChat: () => void;
}

interface ReviewSummary {
  id: string;
  rating: number;
  title: string | null;
  comment: string | null;
  created_at: string;
  reviewer_name?: string | null;
}

const formatPrice = (n: number) =>
  new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(n);

const getStartingPrice = (services: ServiceSummary[]): string | null => {
  const prices = services.map(s => s.price_min).filter((p): p is number => p !== null);
  if (prices.length === 0) return null;
  return `From ${formatPrice(Math.min(...prices))}`;
};

const VendorCard = ({
  name,
  category,
  location,
  rating,
  reviewCount,
  imageUrl,
  services,
  onViewDetails,
  onChat,
}: VendorCardProps) => {
  const startingPrice = getStartingPrice(services);
  return (
    <div className="bg-card border rounded-xl overflow-hidden transition-all hover:shadow-lg flex flex-col">
      <div className="relative cursor-pointer" onClick={onViewDetails}>
        <div
          className="h-56 sm:h-60 bg-cover bg-center bg-muted"
          style={imageUrl ? { backgroundImage: `url(${imageUrl})` } : undefined}
        />
      </div>
      <div className="p-4 sm:p-5">
        <div className="flex justify-between items-start gap-2 mb-1">
          <h3 className="font-medium text-lg truncate">{name}</h3>
          <div className="flex items-center shrink-0">
            <Star className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-yellow-400 text-yellow-400 mr-0.5" />
            <span className="text-sm font-medium">{rating.toFixed(1)}</span>
            <span className="text-muted-foreground text-xs ml-1">({reviewCount.toLocaleString()})</span>
          </div>
        </div>
        <p className="text-muted-foreground text-xs sm:text-sm mb-2">{category}</p>
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center text-xs sm:text-sm text-muted-foreground min-w-0">
            <MapPin className="w-3.5 h-3.5 mr-1 shrink-0" />
            <span className="truncate">{location}</span>
          </div>
          {startingPrice && (
            <span className="text-xs font-medium text-primary shrink-0">{startingPrice}</span>
          )}
        </div>

        <div className="mt-3 flex gap-2">
          <Button size="sm" variant="outline" className="flex-1" onClick={onViewDetails}>
            <Eye className="h-3.5 w-3.5 sm:mr-1.5" />
            <span className="hidden sm:inline">View</span>
          </Button>
          <Button size="sm" className="flex-1" onClick={onChat}>
            <MessageSquare className="h-3.5 w-3.5 sm:mr-1.5" />
            <span className="hidden sm:inline">Chat</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

const VendorsPage = () => {
  const { user } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState(ALL_CATEGORIES);
  const [selectedRegion, setSelectedRegion] = useState(ALL_LOCATIONS);
  const [selectedVendor, setSelectedVendor] = useState<Omit<VendorCardProps, 'onViewDetails' | 'onChat'> | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [vendors, setVendors] = useState<Omit<VendorCardProps, 'onViewDetails' | 'onChat'>[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const PAGE_SIZE = 12;
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [searchQuery, selectedCategory, selectedRegion]);
  const [isInquiryOpen, setIsInquiryOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [safetyAccepted, setSafetyAccepted] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [inquiryForm, setInquiryForm] = useState({
    name: "",
    email: "",
    eventDate: "",
    message: "",
  });

  const handleViewVendorDetails = (vendor: Omit<VendorCardProps, 'onViewDetails' | 'onChat'>) => {
    setSelectedVendor(vendor);
  };

  const handleOpenInquiry = () => {
    if (!selectedVendor) return;
    if (!user) {
      toast.error("Please sign in to message a vendor");
      return;
    }
    setSafetyAccepted(false);
    setIsInquiryOpen(true);
  };

  // Chat opens the running conversation, not a fresh enquiry form.
  const handleChat = (vendor: Omit<VendorCardProps, 'onViewDetails' | 'onChat'>) => {
    if (!user) {
      toast.error("Please sign in to message a vendor");
      return;
    }
    setSelectedVendor(vendor);
    setIsChatOpen(true);
  };

  const handleSubmitInquiry = async () => {
    if (!selectedVendor) return;
    const senderName = user?.name?.trim() || user?.email?.trim() || "";
    if (!senderName || !inquiryForm.message.trim()) return;

    try {
      setIsSending(true);
      await vendorService.createInquiry({
        vendorId: selectedVendor.id,
        senderName,
        senderEmail: user?.email || inquiryForm.email.trim() || undefined,
        eventDate: inquiryForm.eventDate || undefined,
        message: inquiryForm.message.trim(),
      });
      setInquiryForm({ name: "", email: "", eventDate: "", message: "" });
      setIsInquiryOpen(false);
      toast.success("Inquiry sent!", {
        description: `Your message has been sent to ${selectedVendor.name}.`,
      });
    } catch (error) {
      toast.error("Failed to send inquiry. Please try again.");
      console.error("Failed to send inquiry:", error);
    } finally {
      setIsSending(false);
    }
  };

  useEffect(() => {
    const fetchVendors = async () => {
      try {
        setIsLoading(true);
        const data = await vendorService.getVendors();
        setVendors(mapVendorDetailsToCards(data));
      } catch (error) {
        console.error("Failed to fetch vendors:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchVendors();
  }, []);

  const categoryOptions = useMemo(() => {
    const inUse = vendors.map(v => v.category).filter(Boolean);
    // Canonical list first, plus any legacy value still on a live profile so
    // those vendors stay reachable.
    const extras = inUse.filter(c => !VENDOR_CATEGORIES.includes(c as never));
    return [ALL_CATEGORIES, ...VENDOR_CATEGORIES, ...Array.from(new Set(extras))];
  }, [vendors]);

  const regionOptions = useMemo(() => [ALL_LOCATIONS, ...NIGERIAN_STATES], []);

  const filteredVendors = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return vendors.filter(vendor => {
      const matchesCategory = selectedCategory === ALL_CATEGORIES || vendor.category === selectedCategory;
      const matchesRegion = locationMatchesState(vendor.location, selectedRegion);
      const matchesQuery =
        !query ||
        vendor.name.toLowerCase().includes(query) ||
        vendor.category.toLowerCase().includes(query) ||
        vendor.location.toLowerCase().includes(query);
      return matchesCategory && matchesRegion && matchesQuery;
    });
  }, [vendors, searchQuery, selectedCategory, selectedRegion]);

  const activeFiltersCount = (selectedCategory !== ALL_CATEGORIES ? 1 : 0) + (selectedRegion !== ALL_LOCATIONS ? 1 : 0);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <div className="pt-20 flex-grow">
        <div className="container mx-auto px-4 py-6">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl md:text-3xl font-serif mb-1">Find Vendors</h1>
            <p className="text-sm md:text-base text-muted-foreground">
              Browse top Nigerian wedding vendors
            </p>
          </div>

          {/* Search and Filter Bar */}
          <div className="mb-6 space-y-3">
            {/* Search Row */}
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search vendors..."
                  className="pl-9"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button
                variant="outline"
                size="icon"
                className="shrink-0 relative sm:hidden"
                onClick={() => setShowFilters(!showFilters)}
              >
                <SlidersHorizontal className="h-4 w-4" />
                {activeFiltersCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary text-primary-foreground text-xs rounded-full flex items-center justify-center">
                    {activeFiltersCount}
                  </span>
                )}
              </Button>
            </div>

            {/* Filters. Always on from sm: up - hiding two dropdowns behind a
                toggle on a wide screen only makes them harder to find. */}
            <div className={`${showFilters ? "flex" : "hidden"} sm:flex flex-col sm:flex-row gap-2`}>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="sm:w-56">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  {categoryOptions.map((category) => (
                    <SelectItem key={category} value={category}>{category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedRegion} onValueChange={setSelectedRegion}>
                <SelectTrigger className="sm:w-56">
                  <SelectValue placeholder="Location" />
                </SelectTrigger>
                <SelectContent>
                  {regionOptions.map((region) => (
                    <SelectItem key={region} value={region}>{region}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {activeFiltersCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSelectedCategory(ALL_CATEGORIES);
                    setSelectedRegion(ALL_LOCATIONS);
                  }}
                  className="text-xs shrink-0"
                >
                  Clear filters
                </Button>
              )}
            </div>

            {/* Results count */}
            <p className="text-xs text-muted-foreground">
              {filteredVendors.length.toLocaleString()} vendor{filteredVendors.length !== 1 ? "s" : ""} found
            </p>
          </div>

          {/* Vendor Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 mb-8">
            {isLoading ? (
              <div className="col-span-full text-center text-muted-foreground py-12">
                Loading vendors...
              </div>
            ) : filteredVendors.length === 0 ? (
              <div className="col-span-full text-center text-muted-foreground py-12">
                No vendors found.
              </div>
            ) : (
              filteredVendors.slice(0, visibleCount).map((vendor, index) => (
                <VendorCard
                  key={`${vendor.name}-${index}`}
                  {...vendor}
                  onViewDetails={() => handleViewVendorDetails(vendor)}
                  onChat={() => handleChat(vendor)}
                />
              ))
            )}
          </div>

          {/* Load More */}
          {filteredVendors.length > visibleCount && (
            <div className="flex justify-center">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setVisibleCount(count => count + PAGE_SIZE)}
              >
                Load More ({filteredVendors.length - visibleCount} more)
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Vendor Detail Modal */}
      {selectedVendor && (
        <VendorDetail
          {...selectedVendor}
          onClose={() => setSelectedVendor(null)}
          onContact={handleOpenInquiry}
        />
      )}

      {/* Inquiry Dialog */}
      <Dialog open={isInquiryOpen} onOpenChange={setIsInquiryOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Send Inquiry to {selectedVendor?.name}</DialogTitle>
          </DialogHeader>
          {!safetyAccepted ? (
            <ChatSafetyIntro
              onAccept={() => {
                setSafetyAccepted(true);
              }}
            />
          ) : (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Sending as <span className="font-medium text-foreground">{user?.name || user?.email}</span>
            </p>
            <div className="space-y-2">
              <Label htmlFor="inquiry-date">Event Date (optional)</Label>
              <Input
                id="inquiry-date"
                type="date"
                value={inquiryForm.eventDate}
                onChange={(e) => setInquiryForm(prev => ({ ...prev, eventDate: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="inquiry-message">Message</Label>
              <Textarea
                id="inquiry-message"
                value={inquiryForm.message}
                onChange={(e) => setInquiryForm(prev => ({ ...prev, message: e.target.value }))}
                placeholder="Tell the vendor what you need..."
                rows={4}
              />
            </div>
            <div className="flex flex-col-reverse sm:flex-row justify-end gap-2">
              <Button variant="outline" onClick={() => setIsInquiryOpen(false)} disabled={isSending}>
                Cancel
              </Button>
              <Button
                onClick={handleSubmitInquiry}
                disabled={isSending || !inquiryForm.message.trim()}
              >
                {isSending ? "Sending..." : "Send Inquiry"}
              </Button>
            </div>
            <p className="text-[11px] text-muted-foreground border-t pt-3">
              Don't share phone numbers, emails or links — messages that contain them
              are blocked. Chats are monitored for safety.
            </p>
          </div>
          )}
        </DialogContent>
      </Dialog>

      <VendorChatModal
        open={isChatOpen}
        onOpenChange={setIsChatOpen}
        vendorProfileId={selectedVendor?.id ?? null}
        vendorName={selectedVendor?.name ?? "Vendor"}
      />

      <Footer />
    </div>
  );
};

export default VendorsPage;

const mapVendorDetailsToCards = (vendors: VendorDetails[]): Omit<VendorCardProps, 'onViewDetails' | 'onChat'>[] => {
  const placeholderImage =
    "data:image/svg+xml;utf8," +
    encodeURIComponent(
      `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="500" viewBox="0 0 800 500">
        <rect width="800" height="500" fill="#e5e7eb"/>
        <rect x="40" y="40" width="720" height="420" rx="32" fill="#f3f4f6"/>
        <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#9ca3af" font-family="Arial" font-size="28">Vendor image</text>
      </svg>`
    );

  return vendors.map(({ profile, services, images, reviews }) => {
    const primaryImage = images.find(image => image.is_primary)?.url;
    const imageUrl = profile.profile_image_url || primaryImage || profile.cover_image_url || placeholderImage;
    const gallery = images.length > 0
      ? images.map(image => ({
        url: image.url,
        alt: image.alt_text || `${profile.business_name} image`,
      }))
      : [{ url: imageUrl, alt: `${profile.business_name} image` }];

    return {
      id: profile.id,
      name: profile.business_name,
      category: profile.category,
      location: profile.location || "Unknown",
      rating: Number(profile.rating || 0),
      reviewCount: Number(profile.review_count || 0),
      imageUrl,
      images: gallery,
      description: profile.description || "No description provided yet.",
      openToTravel: profile.open_to_travel ?? false,
      services: services.map(service => ({
        name: service.name,
        description: service.description,
        price_min: service.price_min,
        price_max: service.price_max,
      })),
      reviews: (reviews || []).map(r => ({
        id: r.id,
        rating: r.rating,
        title: r.title,
        comment: r.comment,
        created_at: r.created_at,
        reviewer_name: r.reviewer_name,
      })),
      contact: {
        email: profile.email || "Not provided",
        phone: profile.phone || "Not provided",
        website: profile.website || undefined,
      },
    };
  });
};
