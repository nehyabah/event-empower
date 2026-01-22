
import { useEffect, useMemo, useState } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/home/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, MapPin, Star, Filter } from "lucide-react";
import VendorDetail from "@/components/vendors/VendorDetail";
import { vendorService, VendorDetails } from "@/services/api/vendorService";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface VendorImage {
  url: string;
  alt: string;
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
  services: string[];
  contact: {
    email: string;
    phone: string;
    website?: string;
  };
  onViewDetails: () => void;
}

const VendorCard = ({ 
  name, 
  category, 
  location, 
  rating, 
  reviewCount, 
  imageUrl,
  onViewDetails
}: VendorCardProps) => {
  const [currentImage, setCurrentImage] = useState(0);
  const [showControls, setShowControls] = useState(false);
  
  return (
    <div 
      className="glass rounded-xl overflow-hidden transition-all hover:shadow-elegant hover:translate-y-[-2px] cursor-pointer"
      onClick={onViewDetails}
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
    >
      <div className="relative">
        <div 
          className="h-48 bg-cover bg-center bg-gradient-to-br from-muted/80 to-muted/40" 
          style={imageUrl ? { backgroundImage: `url(${imageUrl})` } : undefined}
        />
        {showControls && (
          <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-white hover:bg-black/40"
              onClick={(e) => {
                e.stopPropagation();
                onViewDetails();
              }}
            >
              View Details
            </Button>
          </div>
        )}
      </div>
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-medium text-lg">{name}</h3>
          <div className="flex items-center">
            <Star className="w-4 h-4 fill-wedding-gold text-wedding-gold mr-1" />
            <span>{rating.toFixed(1)}</span>
            <span className="text-muted-foreground text-sm ml-1">({reviewCount})</span>
          </div>
        </div>
        <p className="text-muted-foreground text-sm mb-3">{category}</p>
        <div className="flex items-center text-sm text-muted-foreground">
          <MapPin className="w-4 h-4 mr-1" />
          <span>{location}</span>
        </div>
      </div>
    </div>
  );
};

const VendorsPage = () => {
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [selectedRegion, setSelectedRegion] = useState("All Regions");
  const [selectedVendor, setSelectedVendor] = useState<Omit<VendorCardProps, 'onViewDetails'> | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [vendors, setVendors] = useState<Omit<VendorCardProps, 'onViewDetails'>[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isInquiryOpen, setIsInquiryOpen] = useState(false);
  const [inquiryForm, setInquiryForm] = useState({
    name: "",
    email: "",
    eventDate: "",
    message: "",
  });
  
  const handleViewVendorDetails = (vendor: Omit<VendorCardProps, 'onViewDetails'>) => {
    setSelectedVendor(vendor);
  };

  const handleOpenInquiry = () => {
    if (!selectedVendor) return;
    setIsInquiryOpen(true);
  };

  const handleSubmitInquiry = async () => {
    if (!selectedVendor) return;
    if (!inquiryForm.name.trim() || !inquiryForm.message.trim()) return;

    try {
      await vendorService.createInquiry({
        vendorId: selectedVendor.id,
        senderName: inquiryForm.name.trim(),
        senderEmail: inquiryForm.email.trim() || undefined,
        eventDate: inquiryForm.eventDate || undefined,
        message: inquiryForm.message.trim(),
      });
      setInquiryForm({ name: "", email: "", eventDate: "", message: "" });
      setIsInquiryOpen(false);
    } catch (error) {
      console.error("Failed to send inquiry:", error);
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
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="pt-24 flex-grow">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-12">
            <h1 className="text-3xl md:text-4xl font-serif mb-4">Find the Perfect Vendors</h1>
            <p className="text-muted-foreground">
              Browse our curated selection of top Nigerian wedding vendors
            </p>
          </div>
          
          {/* Search and Filters */}
          <div className="mb-8 glass rounded-xl p-6">
            <div className="flex flex-col md:flex-row gap-4 mb-4">
              <div className="relative flex-grow">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                <Input 
                  placeholder="Search vendors..." 
                  className="pl-10"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                />
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <select 
                  className="bg-background border border-input rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ring h-10"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  {categoryOptions.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
                
                <select 
                  className="bg-background border border-input rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ring h-10"
                  value={selectedRegion}
                  onChange={(e) => setSelectedRegion(e.target.value)}
                >
                  {regionOptions.map(region => (
                    <option key={region} value={region}>{region}</option>
                  ))}
                </select>
                
                <Button variant="outline" className="flex items-center gap-2">
                  <Filter className="w-4 h-4" />
                  <span>More Filters</span>
                </Button>
              </div>
            </div>
          </div>
          
          {/* Vendor Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {isLoading ? (
              <div className="col-span-full text-center text-muted-foreground py-12">
                Loading vendors...
              </div>
            ) : filteredVendors.length === 0 ? (
              <div className="col-span-full text-center text-muted-foreground py-12">
                No vendors found yet.
              </div>
            ) : (
              filteredVendors.map((vendor, index) => (
                <VendorCard 
                  key={`${vendor.name}-${index}`}
                  {...vendor}
                  onViewDetails={() => handleViewVendorDetails(vendor)}
                />
              ))
            )}
          </div>
          
          {/* Load More */}
          <div className="flex justify-center mt-8">
            <Button variant="outline" className="px-8">Load More</Button>
          </div>
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

      <Dialog open={isInquiryOpen} onOpenChange={setIsInquiryOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Contact Vendor</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="inquiry-name">Your Name</Label>
              <Input
                id="inquiry-name"
                value={inquiryForm.name}
                onChange={(event) => setInquiryForm((prev) => ({ ...prev, name: event.target.value }))}
                placeholder="Your full name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="inquiry-email">Email (optional)</Label>
              <Input
                id="inquiry-email"
                value={inquiryForm.email}
                onChange={(event) => setInquiryForm((prev) => ({ ...prev, email: event.target.value }))}
                placeholder="you@example.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="inquiry-date">Event Date (optional)</Label>
              <Input
                id="inquiry-date"
                type="date"
                value={inquiryForm.eventDate}
                onChange={(event) => setInquiryForm((prev) => ({ ...prev, eventDate: event.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="inquiry-message">Message</Label>
              <Textarea
                id="inquiry-message"
                value={inquiryForm.message}
                onChange={(event) => setInquiryForm((prev) => ({ ...prev, message: event.target.value }))}
                placeholder="Tell the vendor what you need..."
                rows={4}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsInquiryOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSubmitInquiry} disabled={!inquiryForm.name.trim() || !inquiryForm.message.trim()}>
                Send Inquiry
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
      <Footer />
    </div>
  );
};

export default VendorsPage;

const mapVendorDetailsToCards = (vendors: VendorDetails[]): Omit<VendorCardProps, 'onViewDetails'>[] => {
  const placeholderImage =
    "data:image/svg+xml;utf8," +
    encodeURIComponent(
      `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="500" viewBox="0 0 800 500">
        <rect width="800" height="500" fill="#e5e7eb"/>
        <rect x="40" y="40" width="720" height="420" rx="32" fill="#f3f4f6"/>
        <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#9ca3af" font-family="Arial" font-size="28">Vendor image</text>
      </svg>`
    );

    return vendors.map(({ profile, services, images }) => {
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
      services: services.map(service => service.name),
      contact: {
        email: profile.email || "Not provided",
        phone: profile.phone || "Not provided",
        website: profile.website || undefined,
      },
    };
  });
};
