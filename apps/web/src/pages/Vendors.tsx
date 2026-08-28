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
          className="h-40 sm:h-48 bg-cover bg-center bg-muted"
          style={imageUrl ? { backgroundImage: `url(${imageUrl})` } : undefined}
        />
      </div>
      <div className="p-3 sm:p-4">
        <div className="flex justify-between items-start gap-2 mb-1">
          <h3 className="font-medium text-base sm:text-lg truncate">{name}</h3>
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
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [selectedRegion, setSelectedRegion] = useState("All Regions");
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
  const [safetyAccepted, setSafetyAccepted] = useState(
    () => localStorage.getItem("chatSafetyAccepted") === "1"
  );
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
    setIsInquiryOpen(true);
  };

  const handleChat = (vendor: Omit<VendorCardProps, 'onViewDetails' | 'onChat'>) => {
    setSelectedVendor(vendor);
    setIsInquiryOpen(true);
  };

  const handleSubmitInquiry = async () => {
    if (!selectedVendor) return;
    const senderName = user?.name?.trim() || user?.email?.trim() || inquiryForm.name.trim();
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
    const categories = new Set(vendors.map(vendor => vendor.category).filter(Boolean));
    return ["All Categories", ...Array.from(categories)];
  }, [vendors]);

  const regionOptions = useMemo(() => {
    const regions = new Set(vendors.map(vendor => vendor.location).filter(Boolean));
    return ["All Regions", ...Array.from(regions)];
  }, [vendors]);

  const filteredVendors = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return vendors.filter(vendor => {
      const matchesCategory = selectedCategory === "All Categories" || vendor.category === selectedCategory;
      const matchesRegion = selectedRegion === "All Regions" || vendor.location === selectedRegion;
      const matchesQuery =
        !query ||
        vendor.name.toLowerCase().includes(query) ||
        vendor.category.toLowerCase().includes(query) ||
        vendor.location.toLowerCase().includes(query);
      return matchesCategory && matchesRegion && matchesQuery;
    });
  }, [vendors, searchQuery, selectedCategory, selectedRegion]);

  const activeFiltersCount = (selectedCategory !== "All Categories" ? 1 : 0) + (selectedRegion !== "All Regions" ? 1 : 0);

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
                className="shrink-0 relative"
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

            {/* Filter Dropdowns - Collapsible on mobile */}
            {showFilters && (
              <div className="flex flex-col sm:flex-row gap-2 p-3 bg-muted/50 rounded-lg">
                <select
                  className="flex-1 bg-background border border-input rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  {categoryOptions.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>

                <select
                  className="flex-1 bg-background border border-input rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  value={selectedRegion}
                  onChange={(e) => setSelectedRegion(e.target.value)}
                >
                  {regionOptions.map(region => (
                    <option key={region} value={region}>{region}</option>
                  ))}
                </select>

                {activeFiltersCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSelectedCategory("All Categories");
                      setSelectedRegion("All Regions");
                    }}
                    className="text-xs"
                  >
                    Clear filters
                  </Button>
                )}
              </div>
            )}

            {/* Results count */}
            <p className="text-xs text-muted-foreground">
              {filteredVendors.length.toLocaleString()} vendor{filteredVendors.length !== 1 ? "s" : ""} found
            </p>
          </div>

          {/* Vendor Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-8">
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
                localStorage.setItem("chatSafetyAccepted", "1");
                setSafetyAccepted(true);
              }}
            />
          ) : (
          <div className="space-y-4">
            {user ? (
              <p className="text-sm text-muted-foreground">
                Sending as <span className="font-medium text-foreground">{user.name || user.email}</span>
              </p>
            ) : (
              <>
                <div className="space-y-2">
                  <Label htmlFor="inquiry-name">Your Name</Label>
                  <Input
                    id="inquiry-name"
                    value={inquiryForm.name}
                    onChange={(e) => setInquiryForm(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Your full name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="inquiry-email">Email (optional)</Label>
                  <Input
                    id="inquiry-email"
                    value={inquiryForm.email}
                    onChange={(e) => setInquiryForm(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="you@example.com"
                  />
                </div>
              </>
            )}
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
                disabled={isSending || !inquiryForm.message.trim() || (!user && !inquiryForm.name.trim())}
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
