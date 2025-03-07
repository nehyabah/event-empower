
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Navbar from "@/components/layout/Navbar";
import { Heart, Gift, ShoppingBag, Image, Edit, DollarSign, Plus, Calendar, MapPin } from "lucide-react";
import { toast } from "sonner";

interface StorySection {
  title: string;
  content: string;
}

interface Vendor {
  name: string;
  category: string;
  website?: string;
  contact?: string;
}

interface WishlistItem {
  name: string;
  price?: string;
  link?: string;
  priority: "high" | "medium" | "low";
}

interface GiftOption {
  title: string;
  description: string;
  paymentDetails: string;
}

const CoupleStory = () => {
  const [coupleNames, setCoupleNames] = useState("Sarah & Michael");
  const [weddingDate, setWeddingDate] = useState("August 15, 2024");
  const [weddingLocation, setWeddingLocation] = useState("Rosewood Garden, New York");
  const [storyEditing, setStoryEditing] = useState(false);
  const [storySections, setStorySections] = useState<StorySection[]>([
    { 
      title: "How We Met", 
      content: "We first met at a friend's birthday party in 2018. Sarah was there with her college roommate, and Michael came with his work colleagues. We spent the whole night talking about our shared love for travel and photography."
    },
    { 
      title: "The Proposal", 
      content: "Michael proposed during our trip to Bali in December 2022. He planned a private sunset dinner on the beach, and as the sun was setting, he got down on one knee. It was the perfect moment."
    }
  ]);
  
  const [photos, setPhotos] = useState<string[]>([
    "https://images.unsplash.com/photo-1519741497674-611481863552?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80",
    "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1169&q=80",
    "https://images.unsplash.com/photo-1523438885200-e635ba2c371e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80"
  ]);
  
  const [vendors, setVendors] = useState<Vendor[]>([
    { name: "Elegant Venues", category: "Venue", website: "www.elegantvenues.com" },
    { name: "Floral Fantasy", category: "Florist", contact: "floralfantasy@example.com" },
    { name: "Delicious Bites Catering", category: "Catering", website: "www.deliciousbites.com" }
  ]);
  
  const [wishlist, setWishlist] = useState<WishlistItem[]>([
    { name: "KitchenAid Stand Mixer", price: "$350", priority: "high", link: "https://www.kitchenaid.com" },
    { name: "Honeymoon Fund Contribution", priority: "high" },
    { name: "Dyson Vacuum Cleaner", price: "$400", priority: "medium" }
  ]);
  
  const [giftOptions, setGiftOptions] = useState<GiftOption[]>([
    { 
      title: "Honeymoon Fund", 
      description: "Help us make our dream honeymoon to Bali come true!", 
      paymentDetails: "Venmo: @sarah-michael" 
    },
    { 
      title: "Home Down Payment", 
      description: "We're saving for our first home together.", 
      paymentDetails: "PayPal: sarah.michael@example.com" 
    }
  ]);

  const handleAddStorySection = (newSection: StorySection) => {
    setStorySections([...storySections, newSection]);
    toast.success("New story section added!");
  };

  const handleAddVendor = (newVendor: Vendor) => {
    setVendors([...vendors, newVendor]);
    toast.success("Vendor added to your list!");
  };

  const handleAddWishlistItem = (newItem: WishlistItem) => {
    setWishlist([...wishlist, newItem]);
    toast.success("Item added to your wishlist!");
  };

  const handleAddGiftOption = (newOption: GiftOption) => {
    setGiftOptions([...giftOptions, newOption]);
    toast.success("Gift option added!");
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target && typeof event.target.result === 'string') {
          setPhotos([event.target.result, ...photos]);
          toast.success("Photo uploaded successfully!");
        }
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section - Similar to inawo.com */}
      <div className="relative h-[70vh] overflow-hidden">
        <div className="absolute inset-0 bg-black/40 z-10" />
        <img 
          src={photos[0]} 
          alt="Couple" 
          className="absolute inset-0 w-full h-full object-cover object-center"
        />
        <div className="relative z-20 flex flex-col items-center justify-center h-full text-white text-center px-4">
          <h1 className="text-5xl md:text-7xl font-serif mb-4 tracking-tight">
            {coupleNames}
          </h1>
          <div className="flex items-center space-x-4 mb-6 text-lg md:text-xl">
            <div className="flex items-center">
              <Calendar className="w-5 h-5 mr-2" />
              <span>{weddingDate}</span>
            </div>
            <div className="h-2 w-2 rounded-full bg-primary" />
            <div className="flex items-center">
              <MapPin className="w-5 h-5 mr-2" />
              <span>{weddingLocation}</span>
            </div>
          </div>
          <p className="max-w-2xl text-lg md:text-xl leading-relaxed">
            Thank you for being part of our special day. We're excited to share our journey with you.
          </p>
        </div>
      </div>
      
      <main className="container mx-auto px-4 py-16">
        <div className="space-y-16 max-w-5xl mx-auto">
          {/* Tabs Section */}
          <Tabs defaultValue="story" className="w-full">
            <TabsList className="grid grid-cols-5 w-full mb-8">
              <TabsTrigger value="story" className="flex items-center gap-2">
                <Heart className="h-4 w-4" /> 
                <span className="hidden sm:inline">Our Story</span>
              </TabsTrigger>
              <TabsTrigger value="photos" className="flex items-center gap-2">
                <Image className="h-4 w-4" /> 
                <span className="hidden sm:inline">Photos</span>
              </TabsTrigger>
              <TabsTrigger value="vendors" className="flex items-center gap-2">
                <ShoppingBag className="h-4 w-4" /> 
                <span className="hidden sm:inline">Vendors</span>
              </TabsTrigger>
              <TabsTrigger value="wishlist" className="flex items-center gap-2">
                <Gift className="h-4 w-4" /> 
                <span className="hidden sm:inline">Wishlist</span>
              </TabsTrigger>
              <TabsTrigger value="gifts" className="flex items-center gap-2">
                <DollarSign className="h-4 w-4" /> 
                <span className="hidden sm:inline">Cash Gifts</span>
              </TabsTrigger>
            </TabsList>
            
            {/* Story Tab Content */}
            <TabsContent value="story" className="space-y-10 pt-4">
              {storySections.map((section, index) => (
                <div key={index} className={`flex flex-col md:flex-row ${index % 2 === 0 ? '' : 'md:flex-row-reverse'} gap-8 items-center`}>
                  <div className="w-full md:w-1/2 aspect-video rounded-lg overflow-hidden">
                    <img 
                      src={photos[index % photos.length]} 
                      alt={section.title} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="w-full md:w-1/2 space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="text-2xl font-serif font-medium">{section.title}</h3>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => setStoryEditing(true)}>
                        <Edit className="h-4 w-4" />
                        <span className="sr-only">Edit</span>
                      </Button>
                    </div>
                    <p className="text-muted-foreground leading-relaxed">{section.content}</p>
                  </div>
                </div>
              ))}
              
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="w-full mt-8">
                    <Plus className="h-4 w-4 mr-2" /> Add New Section
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Story Section</DialogTitle>
                  </DialogHeader>
                  <form className="space-y-4" onSubmit={(e) => {
                    e.preventDefault();
                    const formData = new FormData(e.currentTarget);
                    handleAddStorySection({
                      title: formData.get('title') as string,
                      content: formData.get('content') as string
                    });
                    (e.target as HTMLFormElement).reset();
                  }}>
                    <div className="space-y-2">
                      <label htmlFor="title" className="block text-sm font-medium">Section Title</label>
                      <Input id="title" name="title" placeholder="e.g., Our First Date" required />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="content" className="block text-sm font-medium">Content</label>
                      <textarea 
                        id="content" 
                        name="content" 
                        rows={4} 
                        className="w-full rounded-md border border-input bg-background px-3 py-2" 
                        placeholder="Share your story..."
                        required
                      ></textarea>
                    </div>
                    <Button type="submit" className="w-full">Save Section</Button>
                  </form>
                </DialogContent>
              </Dialog>
            </TabsContent>
            
            {/* Photos Tab Content */}
            <TabsContent value="photos" className="pt-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {photos.map((photo, index) => (
                  <div key={index} className="aspect-square overflow-hidden rounded-xl shadow-md">
                    <img 
                      src={photo} 
                      alt={`Couple photo ${index + 1}`}
                      className="w-full h-full object-cover transition-all hover:scale-105 duration-500"
                    />
                  </div>
                ))}
                <label className="aspect-square flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-primary/40 cursor-pointer hover:bg-muted/30 transition-colors shadow-sm">
                  <div className="flex flex-col items-center justify-center p-6 text-center">
                    <Image className="h-12 w-12 text-primary/60 mb-3" />
                    <span className="text-sm font-medium">Upload Photo</span>
                    <span className="text-xs text-muted-foreground mt-1">Click to browse</span>
                  </div>
                  <input 
                    type="file" 
                    className="hidden" 
                    accept="image/*" 
                    onChange={handlePhotoUpload}
                  />
                </label>
              </div>
            </TabsContent>
            
            {/* Vendors Tab Content */}
            <TabsContent value="vendors" className="pt-4 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {vendors.map((vendor, index) => (
                  <Card key={index} className="overflow-hidden hover:shadow-md transition-shadow">
                    <div className="h-3 bg-gradient-to-r from-primary to-primary/60"></div>
                    <CardContent className="p-6 mt-3">
                      <h3 className="text-xl font-serif mb-3">{vendor.name}</h3>
                      <div className="text-sm text-muted-foreground space-y-2">
                        <p className="flex items-center gap-2">
                          <span className="inline-block w-2 h-2 rounded-full bg-primary"></span>
                          <span><strong>Category:</strong> {vendor.category}</span>
                        </p>
                        {vendor.website && (
                          <p className="flex items-center gap-2">
                            <span className="inline-block w-2 h-2 rounded-full bg-primary"></span>
                            <span><strong>Website:</strong> {vendor.website}</span>
                          </p>
                        )}
                        {vendor.contact && (
                          <p className="flex items-center gap-2">
                            <span className="inline-block w-2 h-2 rounded-full bg-primary"></span>
                            <span><strong>Contact:</strong> {vendor.contact}</span>
                          </p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
                
                <Dialog>
                  <DialogTrigger asChild>
                    <div className="flex items-center justify-center p-8 rounded-lg border-2 border-dashed border-primary/40 cursor-pointer hover:bg-muted/30 transition-colors h-full">
                      <div className="text-center">
                        <Plus className="h-12 w-12 text-primary/60 mx-auto mb-3" />
                        <span className="text-sm font-medium">Add Vendor</span>
                      </div>
                    </div>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add New Vendor</DialogTitle>
                    </DialogHeader>
                    <form className="space-y-4" onSubmit={(e) => {
                      e.preventDefault();
                      const formData = new FormData(e.currentTarget);
                      handleAddVendor({
                        name: formData.get('name') as string,
                        category: formData.get('category') as string,
                        website: (formData.get('website') as string) || undefined,
                        contact: (formData.get('contact') as string) || undefined
                      });
                      (e.target as HTMLFormElement).reset();
                    }}>
                      <div className="space-y-2">
                        <label htmlFor="name" className="block text-sm font-medium">Vendor Name</label>
                        <Input id="name" name="name" placeholder="e.g., Elegant Venues" required />
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="category" className="block text-sm font-medium">Category</label>
                        <Input id="category" name="category" placeholder="e.g., Venue, Florist, Catering" required />
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="website" className="block text-sm font-medium">Website (optional)</label>
                        <Input id="website" name="website" placeholder="e.g., www.example.com" />
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="contact" className="block text-sm font-medium">Contact (optional)</label>
                        <Input id="contact" name="contact" placeholder="e.g., info@example.com" />
                      </div>
                      <Button type="submit" className="w-full">Add Vendor</Button>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </TabsContent>
            
            {/* Wishlist Tab Content */}
            <TabsContent value="wishlist" className="pt-4 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {wishlist.map((item, index) => (
                  <Card key={index} className={`overflow-hidden hover:shadow-md transition-shadow`}>
                    <div className={`h-2 ${
                      item.priority === 'high' 
                        ? 'bg-red-400' 
                        : item.priority === 'medium' 
                        ? 'bg-amber-400' 
                        : 'bg-blue-400'
                    }`}></div>
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start">
                        <h3 className="text-lg font-medium">{item.name}</h3>
                        {item.price && (
                          <span className="text-sm font-medium px-2 py-1 bg-secondary rounded-full">
                            {item.price}
                          </span>
                        )}
                      </div>
                      {item.link && (
                        <a 
                          href={item.link} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-sm text-primary hover:underline mt-2 inline-block"
                        >
                          View Item
                        </a>
                      )}
                      <div className="mt-3">
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          item.priority === 'high' 
                            ? 'bg-red-100 text-red-800' 
                            : item.priority === 'medium' 
                            ? 'bg-amber-100 text-amber-800' 
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {item.priority.charAt(0).toUpperCase() + item.priority.slice(1)} Priority
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                
                <Dialog>
                  <DialogTrigger asChild>
                    <div className="flex items-center justify-center p-6 rounded-lg border-2 border-dashed border-primary/40 cursor-pointer hover:bg-muted/30 transition-colors h-full">
                      <div className="text-center">
                        <Plus className="h-12 w-12 text-primary/60 mx-auto mb-3" />
                        <span className="text-sm font-medium">Add Wishlist Item</span>
                      </div>
                    </div>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add Wishlist Item</DialogTitle>
                    </DialogHeader>
                    <form className="space-y-4" onSubmit={(e) => {
                      e.preventDefault();
                      const formData = new FormData(e.currentTarget);
                      handleAddWishlistItem({
                        name: formData.get('name') as string,
                        price: (formData.get('price') as string) || undefined,
                        link: (formData.get('link') as string) || undefined,
                        priority: (formData.get('priority') as "high" | "medium" | "low") || "medium"
                      });
                      (e.target as HTMLFormElement).reset();
                    }}>
                      <div className="space-y-2">
                        <label htmlFor="name" className="block text-sm font-medium">Item Name</label>
                        <Input id="name" name="name" placeholder="e.g., KitchenAid Mixer" required />
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="price" className="block text-sm font-medium">Price (optional)</label>
                        <Input id="price" name="price" placeholder="e.g., $150" />
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="link" className="block text-sm font-medium">Link (optional)</label>
                        <Input id="link" name="link" placeholder="e.g., https://example.com/product" />
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="priority" className="block text-sm font-medium">Priority</label>
                        <select 
                          id="priority" 
                          name="priority" 
                          className="w-full rounded-md border border-input bg-background px-3 py-2"
                          defaultValue="medium"
                        >
                          <option value="high">High</option>
                          <option value="medium">Medium</option>
                          <option value="low">Low</option>
                        </select>
                      </div>
                      <Button type="submit" className="w-full">Add Item</Button>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </TabsContent>
            
            {/* Cash Gifts Tab Content */}
            <TabsContent value="gifts" className="pt-4 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {giftOptions.map((option, index) => (
                  <Card key={index} className="overflow-hidden border-none shadow-lg">
                    <div className="bg-gradient-to-r from-primary/80 to-primary p-6 text-white">
                      <h3 className="text-xl font-serif">{option.title}</h3>
                    </div>
                    <CardContent className="p-6 bg-white">
                      <p className="text-muted-foreground mb-4">{option.description}</p>
                      <div className="bg-secondary p-4 rounded-md">
                        <h4 className="text-sm font-medium mb-1">Payment Details:</h4>
                        <p className="text-sm">{option.paymentDetails}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                
                <Dialog>
                  <DialogTrigger asChild>
                    <div className="flex items-center justify-center p-6 rounded-lg border-2 border-dashed border-primary/40 cursor-pointer hover:bg-muted/30 transition-colors h-full">
                      <div className="text-center">
                        <Plus className="h-12 w-12 text-primary/60 mx-auto mb-3" />
                        <span className="text-sm font-medium">Add Gift Option</span>
                      </div>
                    </div>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add Gift Option</DialogTitle>
                    </DialogHeader>
                    <form className="space-y-4" onSubmit={(e) => {
                      e.preventDefault();
                      const formData = new FormData(e.currentTarget);
                      handleAddGiftOption({
                        title: formData.get('title') as string,
                        description: formData.get('description') as string,
                        paymentDetails: formData.get('paymentDetails') as string
                      });
                      (e.target as HTMLFormElement).reset();
                    }}>
                      <div className="space-y-2">
                        <label htmlFor="title" className="block text-sm font-medium">Title</label>
                        <Input id="title" name="title" placeholder="e.g., Honeymoon Fund" required />
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="description" className="block text-sm font-medium">Description</label>
                        <textarea 
                          id="description" 
                          name="description" 
                          rows={3} 
                          className="w-full rounded-md border border-input bg-background px-3 py-2" 
                          placeholder="Describe what this fund is for..."
                          required
                        ></textarea>
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="paymentDetails" className="block text-sm font-medium">Payment Details</label>
                        <Input 
                          id="paymentDetails" 
                          name="paymentDetails" 
                          placeholder="e.g., Venmo: @our-names" 
                          required 
                        />
                      </div>
                      <Button type="submit" className="w-full">Add Gift Option</Button>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default CoupleStory;
