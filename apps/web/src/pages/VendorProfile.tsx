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
import { Loader } from "lucide-react";
import { vendorService } from "@/services/api/vendorService";
import { useAuth } from "@/context/AuthContext";

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
  const { user, isAuthenticated, isLoading } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [coverImage, setCoverImage] = useState<{ key: string; url: string } | null>(null);
  const [profileImage, setProfileImage] = useState<{ key: string; url: string } | null>(null);
  const [galleryImages, setGalleryImages] = useState<Array<{ key: string; url: string }>>([]);
  const [isUploading, setIsUploading] = useState(false);
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
    if (isLoading) return;
    if (!isAuthenticated || user?.userType !== "vendor") {
      navigate("/");
      toast.error("You need to be logged in as a vendor to access this page");
      return;
    }

    if (user?.email) {
      setVendorEmail(user.email);
    }
  }, [isAuthenticated, isLoading, navigate, user]);

  useEffect(() => {
    const fetchProfile = async () => {
      if (isLoading || !isAuthenticated || user?.userType !== "vendor") return;
      try {
        setIsFetching(true);
        const vendor = await vendorService.getMyVendorProfile();
        if (!vendor) return;

        setFormData({
          companyName: vendor.profile.business_name,
          category: vendor.profile.category,
          description: vendor.profile.description || "",
          location: vendor.profile.location || "",
          phone: vendor.profile.phone || "",
          website: vendor.profile.website || "",
        });
        if (vendor.profile.cover_image_url) {
          setCoverImage({
            key: vendor.profile.cover_image_key || vendor.profile.cover_image_url,
            url: vendor.profile.cover_image_url,
          });
        }
        if (vendor.profile.profile_image_url) {
          setProfileImage({
            key: vendor.profile.profile_image_key || vendor.profile.profile_image_url,
            url: vendor.profile.profile_image_url,
          });
        }

        const images = vendor.images.sort((a, b) => a.display_order - b.display_order);
        setGalleryImages(
          images
            .filter((image) => image.url)
            .map((image) => ({
              key: image.key || image.url,
              url: image.url,
            }))
        );

        if (vendor.profile.email) {
          setVendorEmail(vendor.profile.email);
        }

        if (Array.isArray(vendor.profile.social_links)) {
          const updatedLinks = socialLinks.map((link) => {
            const match = vendor.profile.social_links.find((entry) => {
              const typedEntry = entry as { platform?: string; url?: string };
              return typedEntry.platform === link.platform;
            }) as { platform?: string; url?: string } | undefined;
            return match ? { ...link, url: match.url || "" } : link;
          });
          setSocialLinks(updatedLinks);
        }

        if (vendor.services.length > 0) {
          setServices(
            vendor.services.map((service) => ({
              id: service.id,
              name: service.name,
              description: service.description || "",
              price: service.price !== null ? String(service.price) : "",
            }))
          );
        }
      } catch (error) {
        console.error("Failed to load vendor profile:", error);
      } finally {
        setIsFetching(false);
      }
    };

    fetchProfile();
  }, [isAuthenticated, isLoading, user]);

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
  
  const handleImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    type: 'cover' | 'profile' | 'gallery'
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const upload = await vendorService.uploadVendorImage(file);
      if (type === 'cover') {
        setCoverImage(upload);
      } else if (type === 'profile') {
        setProfileImage(upload);
      } else if (type === 'gallery') {
        setGalleryImages(prev => [...prev, upload]);
      }
    } catch (error) {
      console.error("Failed to upload image:", error);
      toast.error("Image upload failed");
    } finally {
      setIsUploading(false);
      e.target.value = "";
    }
  };
  
  const removeGalleryImage = (index: number) => {
    setGalleryImages(galleryImages.filter((_, i) => i !== index));
  };
  
  const handleSaveProfile = () => {
    const normalizePrice = (value: string) => {
      const cleaned = value.replace(/[^\d.]/g, "");
      return cleaned.length > 0 ? cleaned : undefined;
    };

    const payload = {
      businessName: formData.companyName,
      category: formData.category,
      description: formData.description,
      location: formData.location,
      email: vendorEmail,
      phone: formData.phone,
      website: formData.website,
      profileImageUrl: profileImage?.key,
      coverImageUrl: coverImage?.key,
      socialLinks: socialLinks
        .filter((link) => (link.url || "").trim().length > 0)
        .map((link) => ({
          platform: link.platform,
          url: link.url,
        })),
      services: services
        .filter((service) => service.name.trim().length > 0)
        .map((service) => ({
          name: service.name,
          description: service.description,
          price: normalizePrice(service.price),
        })),
      images: galleryImages.map((image, index) => ({
        url: image.key,
        altText: `Gallery image ${index + 1}`,
        displayOrder: index,
      })),
    };

    setIsSaving(true);
    vendorService
      .updateMyVendorProfile(payload)
      .then(() => {
        toast.success("Profile saved successfully!", {
          description: "Your vendor profile has been updated.",
        });
      })
      .catch((error) => {
        console.error("Failed to save vendor profile:", error);
        toast.error("Failed to save profile");
      })
      .finally(() => setIsSaving(false));
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
                        style={coverImage ? { backgroundImage: `url(${coverImage.url})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}
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
                              disabled={isUploading}
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
                            style={profileImage ? { backgroundImage: `url(${profileImage.url})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}
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
                                  disabled={isUploading}
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
                              src={image.url} 
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
                            disabled={isUploading}
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
                  <div className="space-y-8">
                    <div className="relative overflow-hidden rounded-xl border bg-muted/20">
                      <div
                        className="h-56 w-full bg-cover bg-center"
                        style={coverImage ? { backgroundImage: `url(${coverImage.url})` } : undefined}
                      />
                      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/50" />
                      <div className="absolute bottom-4 left-6 right-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                        <div className="flex items-center gap-4">
                          <div
                            className="h-20 w-20 rounded-full border-4 border-background bg-muted bg-cover bg-center"
                            style={profileImage ? { backgroundImage: `url(${profileImage.url})` } : undefined}
                          />
                          <div>
                            <div className="text-2xl font-semibold text-white">
                              {formData.companyName || "Your Business Name"}
                            </div>
                            <div className="text-sm text-white/80">
                              {formData.location || "Location"} · {formData.category || "Category"}
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm">Book Now</Button>
                          <Button size="sm" variant="outline">
                            Message
                          </Button>
                        </div>
                      </div>
                    </div>

                    <div className="grid gap-6 lg:grid-cols-3">
                      <div className="space-y-6 lg:col-span-2">
                        <div>
                          <h3 className="text-lg font-medium mb-2">About</h3>
                          <p className="text-muted-foreground">
                            {formData.description || "Share details about your business and what makes you unique."}
                          </p>
                        </div>

                        <div>
                          <h3 className="text-lg font-medium mb-2">Services</h3>
                          <div className="flex flex-wrap gap-2">
                            {services.filter((service) => service.name.trim()).length === 0 ? (
                              <span className="text-sm text-muted-foreground">Add services to highlight your offerings.</span>
                            ) : (
                              services
                                .filter((service) => service.name.trim())
                                .map((service) => (
                                  <span key={service.id} className="rounded-full bg-muted px-3 py-1 text-xs font-medium">
                                    {service.name}
                                  </span>
                                ))
                            )}
                          </div>
                        </div>

                        <div>
                          <h3 className="text-lg font-medium mb-2">Gallery</h3>
                          {galleryImages.length === 0 ? (
                            <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
                              Upload photos to showcase your work.
                            </div>
                          ) : (
                            <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                              {galleryImages.map((image) => (
                                <div key={image.key} className="aspect-square overflow-hidden rounded-lg">
                                  <img src={image.url} alt="Gallery preview" className="h-full w-full object-cover" />
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="space-y-6">
                        <div className="rounded-lg border p-4">
                          <h3 className="text-base font-medium mb-3">Contact</h3>
                          <div className="space-y-2 text-sm text-muted-foreground">
                            <div>{vendorEmail || "email@example.com"}</div>
                            <div>{formData.phone || "Phone number"}</div>
                            <div>{formData.website || "Website"}</div>
                          </div>
                        </div>

                        <div className="rounded-lg border p-4">
                          <h3 className="text-base font-medium mb-3">Social Links</h3>
                          <div className="space-y-2 text-sm text-muted-foreground">
                            {socialLinks.some((link) => link.url?.trim()) ? (
                              socialLinks
                                .filter((link) => link.url?.trim())
                                .map((link) => (
                                  <div key={link.platform}>
                                    {link.platform}: {link.url}
                                  </div>
                                ))
                            ) : (
                              <div>Add your social links to show up here.</div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
          
          <div className="flex justify-end mt-8">
            <Button 
              className="px-8 font-medium"
              onClick={handleSaveProfile}
              disabled={isSaving || isFetching || isUploading}
            >
              {isSaving ? (
                <>
                  <Loader className="mr-2 h-4 w-4 animate-spin text-primary" />
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
