
import { useState } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/home/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, MapPin, Star, Filter, ChevronLeft, ChevronRight, Check } from "lucide-react";
import VendorDetail from "@/components/vendors/VendorDetail";

const vendorCategories = [
  "All Categories",
  "Venues",
  "Photographers",
  "Caterers",
  "Decorators",
  "Music & DJs",
  "Makeup Artists",
  "Wedding Attire",
  "Cakes"
];

const regions = [
  "All Regions",
  "Lagos",
  "Abuja",
  "Port Harcourt",
  "Enugu",
  "Ibadan",
  "Kano",
  "Calabar",
  "Kaduna"
];

interface VendorImage {
  url: string;
  alt: string;
}

interface VendorCardProps {
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
          className="h-48 bg-cover bg-center" 
          style={{ backgroundImage: `url(${imageUrl})` }}
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

// Enhanced dummy data with more details
const dummyVendors: Omit<VendorCardProps, 'onViewDetails'>[] = [
  {
    name: "Royal Events Center",
    category: "Venues",
    location: "Lagos",
    rating: 4.8,
    reviewCount: 124,
    imageUrl: "https://images.unsplash.com/photo-1510076857177-7470076d4098?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1172&q=80",
    images: [
      { 
        url: "https://images.unsplash.com/photo-1510076857177-7470076d4098?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1172&q=80", 
        alt: "Main hall with elegant lighting" 
      },
      { 
        url: "https://images.unsplash.com/photo-1519225421980-715cb0215aed?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80", 
        alt: "Outdoor garden setup for wedding" 
      },
      { 
        url: "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80", 
        alt: "Table setting for banquet" 
      },
    ],
    description: "Royal Events Center is a premium venue located in the heart of Lagos. Our elegant spaces can accommodate weddings of all sizes, from intimate gatherings to grand celebrations. We offer comprehensive packages including catering, decoration, and event planning services to make your special day perfect.",
    services: ["Hall Rental", "Outdoor Garden", "Catering", "Decoration", "Sound System", "Lighting", "Parking"],
    contact: {
      email: "bookings@royalevents.com",
      phone: "+234 801 234 5678",
      website: "https://royalevents.example.com"
    }
  },
  {
    name: "Divine Catering",
    category: "Caterers",
    location: "Abuja",
    rating: 4.6,
    reviewCount: 89,
    imageUrl: "https://images.unsplash.com/photo-1555244162-803834f70033?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80",
    images: [
      { 
        url: "https://images.unsplash.com/photo-1555244162-803834f70033?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80", 
        alt: "Elegantly plated main course" 
      },
      { 
        url: "https://images.unsplash.com/photo-1467546706352-fa0391181b6c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80", 
        alt: "Wedding cake with floral decoration" 
      },
      { 
        url: "https://images.unsplash.com/photo-1622428051717-dcd9651f5cef?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80", 
        alt: "Buffet setup at wedding reception" 
      },
    ],
    description: "Divine Catering specializes in creating memorable culinary experiences for weddings. We offer a wide range of menu options from traditional Nigerian cuisine to international dishes. Our team of experienced chefs and servers ensure that your wedding feast is nothing short of extraordinary.",
    services: ["Menu Planning", "Buffet Service", "Plated Service", "Cake Design", "Dessert Table", "Bar Service", "Staff Provision"],
    contact: {
      email: "info@divinecatering.com",
      phone: "+234 802 345 6789"
    }
  },
  {
    name: "Capture Memories Photography",
    category: "Photographers",
    location: "Port Harcourt",
    rating: 4.9,
    reviewCount: 156,
    imageUrl: "https://images.unsplash.com/photo-1604017011523-b7b41a53f993?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80",
    images: [
      { 
        url: "https://images.unsplash.com/photo-1604017011523-b7b41a53f993?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80", 
        alt: "Couple portrait at sunset" 
      },
      { 
        url: "https://images.unsplash.com/photo-1537633552985-df8429e8048b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80", 
        alt: "Wedding ceremony candid moment" 
      },
      { 
        url: "https://images.unsplash.com/photo-1519741497674-611481863552?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80", 
        alt: "Detail shots of wedding rings and flowers" 
      },
    ],
    description: "Capture Memories Photography is dedicated to preserving the most beautiful moments of your wedding day. With over 10 years of experience in wedding photography, we combine photojournalistic techniques with artistic portrait photography to tell your unique love story through images that will last a lifetime.",
    services: ["Pre-wedding Shoot", "Wedding Day Coverage", "Drone Photography", "Videography", "Photo Album", "Digital Delivery", "Same-Day Edits"],
    contact: {
      email: "book@capturememories.com",
      phone: "+234 803 456 7890",
      website: "https://capturememories.example.com"
    }
  },
  {
    name: "Elegant Decor Solutions",
    category: "Decorators",
    location: "Lagos",
    rating: 4.7,
    reviewCount: 112,
    imageUrl: "https://images.unsplash.com/photo-1519225421980-715cb0215aed?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80",
    images: [
      { 
        url: "https://images.unsplash.com/photo-1519225421980-715cb0215aed?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80", 
        alt: "Elegantly decorated wedding altar" 
      },
      { 
        url: "https://images.unsplash.com/photo-1522673607200-164d1b6ce486?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80", 
        alt: "Reception table decorations with floral arrangements" 
      },
      { 
        url: "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80", 
        alt: "Lighting and draping design for wedding venue" 
      },
    ],
    description: "Elegant Decor Solutions transforms ordinary spaces into extraordinary wedding venues. Our team of creative designers works closely with each couple to bring their vision to life through stunning floral arrangements, sophisticated lighting, custom backdrops, and elegant table settings.",
    services: ["Floral Design", "Lighting", "Draping", "Backdrop Creation", "Table Setting", "Chair Covers", "Stage Design"],
    contact: {
      email: "design@elegantdecor.com",
      phone: "+234 804 567 8901"
    }
  },
  {
    name: "Rhythm Masters",
    category: "Music & DJs",
    location: "Abuja",
    rating: 4.5,
    reviewCount: 78,
    imageUrl: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80",
    images: [
      { 
        url: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80", 
        alt: "DJ performing at wedding reception" 
      },
      { 
        url: "https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80", 
        alt: "Live band performance at wedding" 
      },
      { 
        url: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80", 
        alt: "Dance floor with light show" 
      },
    ],
    description: "Rhythm Masters provides premium entertainment services for weddings. Our experienced DJs and live musicians create the perfect soundtrack for every moment of your celebration, from the ceremony to the last dance. We offer state-of-the-art sound and lighting equipment to keep your guests entertained all night long.",
    services: ["DJ Services", "Live Band", "MC Services", "Sound System Rental", "Lighting Effects", "Custom Playlists", "Dance Floor"],
    contact: {
      email: "book@rhythmmasters.com",
      phone: "+234 805 678 9012",
      website: "https://rhythmmasters.example.com"
    }
  },
  {
    name: "Beauty by Amara",
    category: "Makeup Artists",
    location: "Lagos",
    rating: 4.9,
    reviewCount: 203,
    imageUrl: "https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1171&q=80",
    images: [
      { 
        url: "https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1171&q=80", 
        alt: "Bride getting makeup applied" 
      },
      { 
        url: "https://images.unsplash.com/photo-1457972729786-0411a3b2b626?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80", 
        alt: "Bridal makeup close-up" 
      },
      { 
        url: "https://images.unsplash.com/photo-1560830839-5254915d8e69?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1074&q=80", 
        alt: "Bridal party hair and makeup session" 
      },
    ],
    description: "Beauty by Amara is a luxury bridal makeup and hair styling service. Led by renowned makeup artist Amara Johnson, our team specializes in creating flawless, long-lasting bridal looks that enhance your natural beauty. We use only premium, camera-ready products to ensure you look stunning both in person and in photographs.",
    services: ["Bridal Makeup", "Bridal Party Makeup", "Hair Styling", "Airbrush Makeup", "Lash Extensions", "Pre-wedding Trial", "Touch-up Service"],
    contact: {
      email: "appointments@beautybyamara.com",
      phone: "+234 806 789 0123",
      website: "https://beautybyamara.example.com"
    }
  }
];

const VendorsPage = () => {
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [selectedRegion, setSelectedRegion] = useState("All Regions");
  const [selectedVendor, setSelectedVendor] = useState<Omit<VendorCardProps, 'onViewDetails'> | null>(null);
  
  const handleViewVendorDetails = (vendor: Omit<VendorCardProps, 'onViewDetails'>) => {
    setSelectedVendor(vendor);
  };
  
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
                />
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <select 
                  className="bg-background border border-input rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ring h-10"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  {vendorCategories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
                
                <select 
                  className="bg-background border border-input rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-ring h-10"
                  value={selectedRegion}
                  onChange={(e) => setSelectedRegion(e.target.value)}
                >
                  {regions.map(region => (
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
            {dummyVendors
              .filter(vendor => 
                (selectedCategory === "All Categories" || vendor.category === selectedCategory) && 
                (selectedRegion === "All Regions" || vendor.location === selectedRegion)
              )
              .map((vendor, index) => (
                <VendorCard 
                  key={index}
                  {...vendor}
                  onViewDetails={() => handleViewVendorDetails(vendor)}
                />
              ))}
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
        />
      )}
      
      <Footer />
    </div>
  );
};

export default VendorsPage;
