
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/home/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { 
  Facebook, 
  Instagram, 
  Twitter, 
  Linkedin, 
  Youtube, 
  Globe, 
  MapPin, 
  Phone, 
  Mail, 
  Image, 
  Upload, 
  Plus,
  Save,
  Trash
} from "lucide-react";
import { toast } from "sonner";

interface SocialLink {
  platform: string;
  url: string;
  icon: React.ReactNode;
}

interface ServiceItem {
  id: string;
  name: string;
  description: string;
  price: string;
}

const VendorProfile = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const [vendorEmail, setVendorEmail] = useState<string>("");
  
  const [formData, setFormData] = useState({
    companyName: "",
    category: "Venues",
    description: "",
    location: "",
    phone: "",
    website: ""
  });
  
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([
    { platform: "Facebook", url: "", icon: <Facebook className="h-5 w-5" /> },
    { platform: "Instagram", url: "", icon: <Instagram className="h-5 w-5" /> },
    { platform: "Twitter", url: "", icon: <Twitter className="h-5 w-5" /> },
    { platform: "LinkedIn", url: "", icon: <Linkedin className="h-5 w-5" /> },
    { platform: "YouTube", url: "", icon: <Youtube className="h-5 w-5" /> }
  ]);
  
  const [services, setServices] = useState<ServiceItem[]>([
    { id: crypto.randomUUID(), name: "", description: "", price: "" }
  ]);

  // Basic auth check
  useEffect(() => {
    const isAuthenticated = localStorage.getItem("authenticated");
    const userType = localStorage.getItem("userType");
    const email = localStorage.getItem("userEmail");
    
    if (!isAuthenticated || userType !== "vendor") {
      navigate("/");
      toast.error("You need to be logged in as a vendor to access this page");
    }
    
    if (email) {
      setVendorEmail(email);
    }
  }, [navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSocialLinkChange = (index: number, value: string) => {
    const updatedLinks = [...socialLinks];
    updatedLinks[index].url = value;
    setSocialLinks(updatedLinks);
  };
  
  const handleServiceChange = (id: string, field: keyof ServiceItem, value: string) => {
    setServices(prevServices => 
      prevServices.map(service => 
        service.id === id ? { ...service, [field]: value } : service
      )
    );
  };
  
  const addService = () => {
    setServices([...services, { id: crypto.randomUUID(), name: "", description: "", price: "" }]);
  };
  
  const removeService = (id: string) => {
    if (services.length > 1) {
      setServices(services.filter(service => service.id !== id));
    }
  };
  
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'cover' | 'profile' | 'gallery') => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        const imageUrl = event.target.result as string;
        
        if (type === 'cover') {
          setCoverImage(imageUrl);
        } else if (type === 'profile') {
          setProfileImage(imageUrl);
        } else if (type === 'gallery') {
          setGalleryImages(prev => [...prev, imageUrl]);
        }
      }
    };
    reader.readAsDataURL(file);
  };
  
  const removeGalleryImage = (index: number) => {
    setGalleryImages(galleryImages.filter((_, i) => i !== index));
  };
  
  const handleSaveProfile = () => {
    setIsLoading(true);
    
    // Simulate saving profile
    setTimeout(() => {
      setIsLoading(false);
      toast.success("Profile saved successfully!", {
        description: "Your vendor profile has been updated.",
      });
    }, 1500);
  };

  const vendorCategories = [
    "Venues", "Photographers", "Caterers", "Decorators", 
    "Music & DJs", "Makeup Artists", "Wedding Attire", "Cakes", "Other"
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="pt-24 flex-grow">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-serif mb-2">Vendor Profile</h1>
          <p className="text-muted-foreground mb-8">
            Manage your vendor profile, services, and gallery
          </p>
          
          <Tabs defaultValue="profile" className="w-full">
            <TabsList className="w-full mb-8">
              <TabsTrigger value="profile" className="flex-1">Profile Information</TabsTrigger>
              <TabsTrigger value="services" className="flex-1">Services & Pricing</TabsTrigger>
              <TabsTrigger value="gallery" className="flex-1">Photo Gallery</TabsTrigger>
              <TabsTrigger value="preview" className="flex-1">Preview Profile</TabsTrigger>
            </TabsList>
            
            <TabsContent value="profile" className="space-y-6">
              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-8">
                    <div className="space-y-2">
                      <h3 className="text-lg font-medium">Cover Image</h3>
                      <div 
                        className="relative w-full h-48 bg-muted rounded-md overflow-hidden flex items-center justify-center border-2 border-dashed border-border"
                        style={coverImage ? { backgroundImage: `url(${coverImage})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}
                      >
                        {!coverImage && (
                          <div className="text-center">
                            <Image className="mx-auto h-12 w-12 text-muted-foreground" />
                            <h3 className="mt-2 text-sm font-semibold">Upload cover image</h3>
                            <p className="mt-1 text-xs text-muted-foreground">1400 x 400 recommended</p>
                          </div>
                        )}
                        <div className="absolute bottom-2 right-2">
                          <Label htmlFor="cover-upload" className="cursor-pointer">
                            <div className="flex items-center justify-center h-10 w-10 rounded-full bg-primary text-primary-foreground shadow-sm">
                              <Upload className="h-5 w-5" />
                            </div>
                            <input
                              id="cover-upload"
                              type="file"
                              accept="image/*"
                              className="sr-only"
                              onChange={(e) => handleImageUpload(e, 'cover')}
                            />
                          </Label>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-8 flex-col md:flex-row">
                      <div className="w-full md:w-1/3">
                        <div className="space-y-2">
                          <h3 className="text-lg font-medium">Profile Image</h3>
                          <div 
                            className="relative w-32 h-32 bg-muted rounded-full overflow-hidden flex items-center justify-center border-2 border-dashed border-border"
                            style={profileImage ? { backgroundImage: `url(${profileImage})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}
                          >
                            {!profileImage && <Upload className="h-8 w-8 text-muted-foreground" />}
                            <div className="absolute bottom-1 right-1">
                              <Label htmlFor="profile-upload" className="cursor-pointer">
                                <div className="flex items-center justify-center h-8 w-8 rounded-full bg-primary text-primary-foreground shadow-sm">
                                  <Plus className="h-4 w-4" />
                                </div>
                                <input
                                  id="profile-upload"
                                  type="file"
                                  accept="image/*"
                                  className="sr-only"
                                  onChange={(e) => handleImageUpload(e, 'profile')}
                                />
                              </Label>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="w-full md:w-2/3 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="companyName">Company/Business Name *</Label>
                            <Input 
                              id="companyName" 
                              name="companyName" 
                              value={formData.companyName} 
                              onChange={handleInputChange} 
                              placeholder="Your Business Name"
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="category">Category *</Label>
                            <select 
                              id="category" 
                              name="category" 
                              value={formData.category} 
                              onChange={handleInputChange as any} 
                              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                            >
                              {vendorCategories.map(category => (
                                <option key={category} value={category}>{category}</option>
                              ))}
                            </select>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="description">Business Description *</Label>
                          <Textarea 
                            id="description" 
                            name="description" 
                            value={formData.description} 
                            onChange={handleInputChange} 
                            placeholder="Tell couples about your business, services, and what makes you unique..."
                            className="min-h-[120px]"
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="location">
                          <div className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            <span>Location *</span>
                          </div>
                        </Label>
                        <Input 
                          id="location" 
                          name="location" 
                          value={formData.location} 
                          onChange={handleInputChange} 
                          placeholder="City, State"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="phone">
                          <div className="flex items-center gap-1">
                            <Phone className="h-4 w-4" />
                            <span>Phone Number *</span>
                          </div>
                        </Label>
                        <Input 
                          id="phone" 
                          name="phone" 
                          value={formData.phone} 
                          onChange={handleInputChange} 
                          placeholder="+234 800 123 4567"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="email">
                          <div className="flex items-center gap-1">
                            <Mail className="h-4 w-4" />
                            <span>Email Address *</span>
                          </div>
                        </Label>
                        <Input 
                          id="email" 
                          value={vendorEmail} 
                          disabled
                          className="bg-muted"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="website">
                          <div className="flex items-center gap-1">
                            <Globe className="h-4 w-4" />
                            <span>Website (Optional)</span>
                          </div>
                        </Label>
                        <Input 
                          id="website" 
                          name="website" 
                          value={formData.website} 
                          onChange={handleInputChange} 
                          placeholder="https://www.yourwebsite.com"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <h3 className="text-lg font-medium">Social Media Links</h3>
                      <p className="text-sm text-muted-foreground">Add your social media profiles to help couples connect with you</p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {socialLinks.map((link, index) => (
                          <div key={link.platform} className="flex items-center gap-2">
                            {link.icon}
                            <Input
                              placeholder={`${link.platform} URL`}
                              value={link.url}
                              onChange={(e) => handleSocialLinkChange(index, e.target.value)}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="services" className="space-y-6">
              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium mb-2">Your Services & Packages</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Add the services or packages you offer with descriptions and pricing
                      </p>
                      
                      {services.map((service, index) => (
                        <div key={service.id} className="bg-muted/30 p-4 rounded-md mb-4">
                          <div className="flex justify-between items-start mb-4">
                            <h4 className="font-medium">Service {index + 1}</h4>
                            {services.length > 1 && (
                              <Button 
                                size="sm" 
                                variant="ghost" 
                                onClick={() => removeService(service.id)}
                              >
                                <Trash className="h-4 w-4 text-destructive" />
                              </Button>
                            )}
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div className="space-y-2">
                              <Label htmlFor={`service-name-${service.id}`}>Service Name</Label>
                              <Input
                                id={`service-name-${service.id}`}
                                value={service.name}
                                onChange={(e) => handleServiceChange(service.id, 'name', e.target.value)}
                                placeholder="e.g., Basic Photography Package"
                              />
                            </div>
                            
                            <div className="space-y-2">
                              <Label htmlFor={`service-price-${service.id}`}>Price</Label>
                              <Input
                                id={`service-price-${service.id}`}
                                value={service.price}
                                onChange={(e) => handleServiceChange(service.id, 'price', e.target.value)}
                                placeholder="e.g., ₦50,000 or 'Starting at ₦50,000'"
                              />
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor={`service-desc-${service.id}`}>Description</Label>
                            <Textarea
                              id={`service-desc-${service.id}`}
                              value={service.description}
                              onChange={(e) => handleServiceChange(service.id, 'description', e.target.value)}
                              placeholder="Describe what's included in this service or package..."
                              className="min-h-[80px]"
                            />
                          </div>
                        </div>
                      ))}
                      
                      <Button 
                        variant="outline" 
                        className="mt-2 w-full" 
                        onClick={addService}
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Add Another Service
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="gallery" className="space-y-6">
              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-medium mb-2">Photo Gallery</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Upload photos of your work to showcase your services
                      </p>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {/* Gallery Images */}
                        {galleryImages.map((image, index) => (
                          <div key={index} className="relative group aspect-square rounded-md overflow-hidden">
                            <img 
                              src={image} 
                              alt={`Gallery image ${index + 1}`} 
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <Button
                                variant="destructive"
                                size="sm"
                                className="h-8 w-8 p-0"
                                onClick={() => removeGalleryImage(index)}
                              >
                                <Trash className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                        
                        {/* Upload Box */}
                        <Label 
                          htmlFor="gallery-upload" 
                          className="aspect-square bg-muted rounded-md border-2 border-dashed border-border flex flex-col items-center justify-center cursor-pointer hover:bg-muted/70 transition-colors"
                        >
                          <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                          <span className="text-sm font-medium">Add Photos</span>
                          <span className="text-xs text-muted-foreground">Up to 10MB</span>
                          <input
                            id="gallery-upload"
                            type="file"
                            accept="image/*"
                            className="sr-only"
                            onChange={(e) => handleImageUpload(e, 'gallery')}
                          />
                        </Label>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="preview" className="space-y-6">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center py-12">
                    <h3 className="text-xl font-medium mb-4">Profile Preview Coming Soon</h3>
                    <p className="text-muted-foreground mb-6">
                      This feature is currently under development. You'll soon be able to preview
                      how your profile will appear to potential clients.
                    </p>
                    <Button variant="outline" onClick={() => toast.success("Profile preview feature will be available soon!")}>
                      Notify Me When Ready
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
          
          <div className="flex justify-end mt-8">
            <Button 
              className="px-8 font-medium"
              onClick={handleSaveProfile}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Profile
                </>
              )}
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default VendorProfile;
