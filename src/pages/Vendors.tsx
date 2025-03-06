
import { useState } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/home/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, MapPin, Star, Filter } from "lucide-react";

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

interface VendorCardProps {
  name: string;
  category: string;
  location: string;
  rating: number;
  reviewCount: number;
  imageUrl: string;
}

const VendorCard = ({ name, category, location, rating, reviewCount, imageUrl }: VendorCardProps) => {
  return (
    <div className="glass rounded-xl overflow-hidden transition-all hover:shadow-elegant hover:translate-y-[-2px]">
      <div 
        className="h-48 bg-cover bg-center" 
        style={{ backgroundImage: `url(${imageUrl})` }}
      />
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

const dummyVendors: VendorCardProps[] = [
  {
    name: "Royal Events Center",
    category: "Venues",
    location: "Lagos",
    rating: 4.8,
    reviewCount: 124,
    imageUrl: "https://images.unsplash.com/photo-1510076857177-7470076d4098?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1172&q=80"
  },
  {
    name: "Divine Catering",
    category: "Caterers",
    location: "Abuja",
    rating: 4.6,
    reviewCount: 89,
    imageUrl: "https://images.unsplash.com/photo-1555244162-803834f70033?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80"
  },
  {
    name: "Capture Memories Photography",
    category: "Photographers",
    location: "Port Harcourt",
    rating: 4.9,
    reviewCount: 156,
    imageUrl: "https://images.unsplash.com/photo-1604017011523-b7b41a53f993?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80"
  },
  {
    name: "Elegant Decor Solutions",
    category: "Decorators",
    location: "Lagos",
    rating: 4.7,
    reviewCount: 112,
    imageUrl: "https://images.unsplash.com/photo-1519225421980-715cb0215aed?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80"
  },
  {
    name: "Rhythm Masters",
    category: "Music & DJs",
    location: "Abuja",
    rating: 4.5,
    reviewCount: 78,
    imageUrl: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80"
  },
  {
    name: "Beauty by Amara",
    category: "Makeup Artists",
    location: "Lagos",
    rating: 4.9,
    reviewCount: 203,
    imageUrl: "https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1171&q=80"
  }
];

const VendorsPage = () => {
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [selectedRegion, setSelectedRegion] = useState("All Regions");
  
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
            {dummyVendors.map((vendor, index) => (
              <VendorCard 
                key={index}
                name={vendor.name}
                category={vendor.category}
                location={vendor.location}
                rating={vendor.rating}
                reviewCount={vendor.reviewCount}
                imageUrl={vendor.imageUrl}
              />
            ))}
          </div>
          
          {/* Load More */}
          <div className="flex justify-center mt-8">
            <Button variant="outline" className="px-8">Load More</Button>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default VendorsPage;
