import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import Navbar from "@/components/layout/Navbar";
import WishlistItem from "@/components/wishlist/WishlistItem";
import BankDetailCard from "@/components/wishlist/BankDetailCard";
import { useTodo } from "@/context/TodoContext";
import { 
  Heart, Gift, ShoppingBag, Image, Edit, 
  DollarSign, Plus, Calendar, MapPin, 
  Share2, Eye, EyeOff, Copy, Check, UploadCloud,
  Building
} from "lucide-react";
import { toast } from "sonner";
import { useLocation } from "react-router-dom";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

interface StorySection {
  title: string;
  content: string;
  image?: string;
}

interface Vendor {
  name: string;
  category: string;
  website?: string;
  contact?: string;
}

interface GiftOption {
  title: string;
  description: string;
  paymentDetails: string;
}

interface WellWish {
  name: string;
  message: string;
  date: string;
}

const CoupleStory = () => {
  const location = useLocation();
  const [isPreviewMode, setIsPreviewMode] = useState(true);
  const [isPublicView, setIsPublicView] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showWellWishForm, setShowWellWishForm] = useState(false);
  const { wishlistItems, addWishlistItem, bankDetails, addBankDetail, removeBankDetail } = useTodo();
  
  const [coupleNames, setCoupleNames] = useState("Sarah & Michael");
  const [weddingDate, setWeddingDate] = useState("August 15, 2024");
  const [weddingLocation, setWeddingLocation] = useState("Rosewood Garden, New York");
  const [storyEditing, setStoryEditing] = useState(false);
  const [storySections, setStorySections] = useState<StorySection[]>([
    { 
      title: "How We Met", 
      content: "We first met at a friend's birthday party in 2018. Sarah was there with her college roommate, and Michael came with his work colleagues. We spent the whole night talking about our shared love for travel and photography.",
      image: "https://images.unsplash.com/photo-1519741497674-611481863552?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80"
    },
    { 
      title: "The Proposal", 
      content: "Michael proposed during our trip to Bali in December 2022. He planned a private sunset dinner on the beach, and as the sun was setting, he got down on one knee. It was the perfect moment.",
      image: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1169&q=80"
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
  
  const [wellWishes, setWellWishes] = useState<WellWish[]>([
    {
      name: "Jessica & Tom",
      message: "So happy for you both! Wishing you a lifetime of happiness together.",
      date: "June 10, 2023"
    },
    {
      name: "The Anderson Family",
      message: "Congratulations on your upcoming wedding! We can't wait to celebrate with you both.",
      date: "June 8, 2023"
    }
  ]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('view') === 'public') {
      setIsPublicView(true);
    } else {
      setIsPublicView(false);
    }
  }, [location]);

  const handleAddStorySection = (newSection: StorySection) => {
    setStorySections([...storySections, newSection]);
    toast.success("New story section added!");
  };

  const handleAddVendor = (newVendor: Vendor) => {
    setVendors([...vendors, newVendor]);
    toast.success("Vendor added to your list!");
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
  
  const handleSectionImageUpload = (e: React.ChangeEvent<HTMLInputElement>, formElement: HTMLFormElement) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target && typeof event.target.result === 'string') {
          const hiddenInput = formElement.querySelector('#sectionImageUrl') as HTMLInputElement;
          if (hiddenInput) {
            hiddenInput.value = event.target.result as string;
          }
          
          const previewElement = document.getElementById('sectionImagePreview');
          if (previewElement) {
            previewElement.style.backgroundImage = `url(${event.target.result})`;
            previewElement.classList.remove('hidden');
          }
          
          toast.success("Image uploaded for section!");
        }
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };
  
  const handleAddWellWish = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newWellWish: WellWish = {
      name: formData.get('name') as string,
      message: formData.get('message') as string,
      date: new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    };
    
    setWellWishes([...wellWishes, newWellWish]);
    toast.success("Thank you for your well wishes!");
    setShowWellWishForm(false);
    (e.target as HTMLFormElement).reset();
  };
  
  const copyToClipboard = () => {
    const publicUrl = `${window.location.origin}${window.location.pathname}?view=public`;
    navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    toast.success("URL copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAddWishlistItem = (formData: FormData) => {
    addWishlistItem({
      name: formData.get('name') as string,
      price: (formData.get('price') as string) || undefined,
      link: (formData.get('link') as string) || undefined,
      priority: (formData.get('priority') as "high" | "medium" | "low") || "medium"
    });
  };

  const bankDetailsSchema = z.object({
    bankName: z.string().min(2, "Bank name is required"),
    accountName: z.string().min(2, "Account name is required"),
    accountNumber: z.string().min(4, "Account number is required"),
    sortCode: z.string().optional(),
    iban: z.string().optional(),
    swift: z.string().optional(),
    description: z.string().optional(),
  });

  const bankDetailsForm = useForm<z.infer<typeof bankDetailsSchema>>({
    resolver: zodResolver(bankDetailsSchema),
    defaultValues: {
      bankName: "",
      accountName: "",
      accountNumber: "",
      sortCode: "",
      iban: "",
      swift: "",
      description: "",
    },
  });

  const onBankDetailsSubmit = (values: z.infer<typeof bankDetailsSchema>) => {
    addBankDetail(values);
    bankDetailsForm.reset();
  };

  const wishlistItemSchema = z.object({
    name: z.string().min(2, "Item name is required"),
    price: z.string().optional(),
    link: z.string().url().optional().or(z.literal("")),
    priority: z.enum(["high", "medium", "low"]).default("medium"),
  });

  const wishlistItemForm = useForm<z.infer<typeof wishlistItemSchema>>({
    resolver: zodResolver(wishlistItemSchema),
    defaultValues: {
      name: "",
      price: "",
      link: "",
      priority: "medium",
    },
  });

  const onWishlistItemSubmit = (values: z.infer<typeof wishlistItemSchema>) => {
    addWishlistItem({
      name: values.name,
      price: values.price || undefined,
      link: values.link || undefined,
      priority: values.priority,
    });
    wishlistItemForm.reset();
  };

  if (isPublicView && !isPreviewMode) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container max-w-4xl mx-auto p-8 text-center mt-20">
          <h1 className="text-3xl font-serif mb-4">This page is being edited</h1>
          <p className="text-muted-foreground">The couple is currently customizing their story. Please check back later!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {!isPublicView && (
        <div className="fixed right-6 top-20 z-40 bg-card shadow-md rounded-md p-2 flex flex-col space-y-2 border">
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={() => setIsPreviewMode(!isPreviewMode)}
          >
            {isPreviewMode ? <EyeOff size={16} /> : <Eye size={16} />}
            {isPreviewMode ? "Edit Mode" : "Preview"}
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={copyToClipboard}
          >
            {copied ? <Check size={16} /> : <Copy size={16} />}
            Share URL
          </Button>
        </div>
      )}
      
      <div className="relative h-[70vh] overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 to-black/30 z-10" />
        <img 
          src={photos[0]} 
          alt="Couple" 
          className="absolute inset-0 w-full h-full object-cover object-center transition-transform duration-30000 hover:scale-105"
        />
        <div className="relative z-20 flex flex-col items-center justify-center h-full text-white text-center px-4 animate-fade-in-down">
          <h1 className="text-5xl md:text-7xl font-serif mb-4 tracking-tight text-white drop-shadow-lg">
            {coupleNames}
          </h1>
          <div className="flex items-center space-x-4 mb-6 text-lg md:text-xl">
            <div className="flex items-center backdrop-blur-sm bg-white/10 px-4 py-2 rounded-full">
              <Calendar className="w-5 h-5 mr-2" />
              <span>{weddingDate}</span>
            </div>
            <div className="h-2 w-2 rounded-full bg-primary" />
            <div className="flex items-center backdrop-blur-sm bg-white/10 px-4 py-2 rounded-full">
              <MapPin className="w-5 h-5 mr-2" />
              <span>{weddingLocation}</span>
            </div>
          </div>
          <p className="max-w-2xl text-lg md:text-xl leading-relaxed bg-gradient-to-r from-white to-white bg-clip-text drop-shadow">
            Thank you for being part of our special day. We're excited to share our journey with you.
          </p>
        </div>
      </div>
      
      <main className="container mx-auto px-4 py-16">
        <div className="space-y-16 max-w-5xl mx-auto">
          {!isPreviewMode ? (
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
              
              <TabsContent value="story" className="space-y-10 pt-4">
                {storySections.map((section, index) => (
                  <div key={index} className={`flex flex-col md:flex-row ${index % 2 === 0 ? '' : 'md:flex-row-reverse'} gap-8 items-center`}>
                    <div className="w-full md:w-1/2 aspect-video rounded-lg overflow-hidden shadow-xl transition-all hover:shadow-2xl duration-300">
                      <img 
                        src={section.image || photos[index % photos.length]} 
                        alt={section.title} 
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
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
                    <Button className="w-full mt-8 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary">
                      <Plus className="h-4 w-4 mr-2" /> Add New Section
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>Add New Story Section</DialogTitle>
                    </DialogHeader>
                    <form className="space-y-4" onSubmit={(e) => {
                      e.preventDefault();
                      const formData = new FormData(e.currentTarget);
                      const imageUrl = formData.get('sectionImageUrl') as string;
                      
                      handleAddStorySection({
                        title: formData.get('title') as string,
                        content: formData.get('content') as string,
                        image: imageUrl || undefined
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
                      
                      <div className="space-y-2">
                        <label htmlFor="sectionImage" className="block text-sm font-medium">Section Image</label>
                        <div id="sectionImagePreview" className="hidden h-32 bg-cover bg-center rounded-md mb-2"></div>
                        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-primary/30 cursor-pointer bg-muted/20 hover:bg-muted/30 transition-colors">
                          <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <UploadCloud className="w-8 h-8 mb-2 text-muted-foreground" />
                            <p className="mb-1 text-sm text-muted-foreground"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                            <p className="text-xs text-muted-foreground/70">PNG, JPG or JPEG (MAX. 5MB)</p>
                          </div>
                          <input 
                            id="sectionImage" 
                            type="file" 
                            className="hidden" 
                            accept="image/*"
                            onChange={(e) => handleSectionImageUpload(e, e.currentTarget.form as HTMLFormElement)} 
                          />
                        </label>
                        <input type="hidden" id="sectionImageUrl" name="sectionImageUrl" />
                      </div>
                      
                      <Button type="submit" className="w-full">Save Section</Button>
                    </form>
                  </DialogContent>
                </Dialog>
              </TabsContent>
              
              <TabsContent value="photos" className="pt-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {photos.map((photo, index) => (
                    <div key={index} className="aspect-square overflow-hidden rounded-xl shadow-md hover:shadow-xl transition-all duration-300">
                      <img 
                        src={photo} 
                        alt={`Couple photo ${index + 1}`}
                        className="w-full h-full object-cover transition-all hover:scale-105 duration-500"
                      />
                    </div>
                  ))}
                  <label className="aspect-square flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-primary/40 cursor-pointer hover:bg-muted/30 transition-colors h-full">
                    <div className="text-center">
                      <Image className="h-12 w-12 text-primary/60 mx-auto mb-3" />
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
              
              <TabsContent value="vendors" className="pt-4 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
              
              <TabsContent value="wishlist" className="pt-4 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {wishlistItems.map((item) => (
                    <WishlistItem 
                      key={item.id} 
                      item={item} 
                      isPreviewMode={false}
                      isPublicView={true}
                    />
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
                      <Form {...wishlistItemForm}>
                        <form onSubmit={wishlistItemForm.handleSubmit(onWishlistItemSubmit)} className="space-y-4">
                          <FormField
                            control={wishlistItemForm.control}
                            name="name"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Item Name</FormLabel>
                                <FormControl>
                                  <Input placeholder="e.g., KitchenAid Mixer" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={wishlistItemForm.control}
                            name="price"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Price (optional)</FormLabel>
                                <FormControl>
                                  <Input placeholder="e.g., $150" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={wishlistItemForm.control}
                            name="link"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Link (optional)</FormLabel>
                                <FormControl>
                                  <Input placeholder="e.g., https://example.com/product" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={wishlistItemForm.control}
                            name="priority"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Priority</FormLabel>
                                <FormControl>
                                  <select 
                                    className="w-full rounded-md border border-input bg-background px-3 py-2"
                                    {...field}
                                  >
                                    <option value="high">High</option>
                                    <option value="medium">Medium</option>
                                    <option value="low">Low</option>
                                  </select>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <Button type="submit" className="w-full">Add Item</Button>
                        </form>
                      </Form>
                    </DialogContent>
                  </Dialog>
                </div>
              </TabsContent>
              
              <TabsContent value="gifts" className="pt-4 space-y-6">
                <h3 className="text-xl font-medium mb-4">Bank Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  {bankDetails.map((detail, index) => (
                    <BankDetailCard 
                      key={index} 
                      detail={detail} 
                      index={index}
                      onRemove={removeBankDetail}
                      isEditable={true}
                    />
                  ))}
                  
                  <Dialog>
                    <DialogTrigger asChild>
                      <div className="flex items-center justify-center p-6 rounded-lg border-2 border-dashed border-primary/40 cursor-pointer hover:bg-muted/30 transition-colors h-full">
                        <div className="text-center">
                          <Building className="h-12 w-12 text-primary/60 mx-auto mb-3" />
                          <span className="text-sm font-medium">Add Bank Details</span>
                        </div>
                      </div>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add Bank Details</DialogTitle>
                      </DialogHeader>
                      <Form {...bankDetailsForm}>
                        <form onSubmit={bankDetailsForm.handleSubmit(onBankDetailsSubmit)} className="space-y-4">
                          <FormField
                            control={bankDetailsForm.control}
                            name="bankName"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Bank Name</FormLabel>
                                <FormControl>
                                  <Input placeholder="e.g., Chase Bank" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={bankDetailsForm.control}
                            name="accountName"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Account Holder Name</FormLabel>
                                <FormControl>
                                  <Input placeholder="e.g., John & Jane Smith" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={bankDetailsForm.control}
                            name="accountNumber"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Account Number</FormLabel>
                                <FormControl>
                                  <Input placeholder="e.g., 12345678" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={bankDetailsForm.control}
                            name="sortCode"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Sort Code (optional)</FormLabel>
                                <FormControl>
                                  <Input placeholder="e.g., 12-34-56" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={bankDetailsForm.control}
                            name="iban"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>IBAN (optional)</FormLabel>
                                <FormControl>
                                  <Input placeholder="e.g., GB29NWBK60161331926819" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={bankDetailsForm.control}
                            name="swift"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>SWIFT/BIC (optional)</FormLabel>
                                <FormControl>
                                  <Input placeholder="e.g., NWBKGB2L" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={bankDetailsForm.control}
                            name="description"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Description (optional)</FormLabel>
                                <FormControl>
                                  <Textarea placeholder="e.g., For honeymoon fund" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <Button type="submit" className="w-full">Add Bank Details</Button>
                        </form>
                      </Form>
                    </DialogContent>
                  </Dialog>
                </div>
                
                <h3 className="text-xl font-medium mb-4">Gift Options</h3>
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
          ) : (
            <div className="space-y-16 animate-fade-in">
              <div className="text-center mb-12">
                <div className="inline-block relative mb-8 border-b-0">
                  <h2 className="text-3xl font-serif pb-2">Our Story</h2>
                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-24 h-0.5 bg-gradient-to-r from-primary/20 via-primary to-primary/20"></div>
                </div>
                
                <div className="space-y-24 mt-16">
                  {storySections.map((section, index) => (
                    <div key={index} className={`flex flex-col md:flex-row ${index % 2 === 0 ? '' : 'md:flex-row-reverse'} gap-12 items-center relative`}>
                      <div className="w-full md:w-1/2 aspect-video rounded-xl overflow-hidden shadow-2xl relative transform hover:-translate-y-1 transition-all duration-300">
                        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent z-10"></div>
                        <img 
                          src={section.image || photos[index % photos.length]} 
                          alt={section.title} 
                          className="w-full h-full object-cover transition-transform hover:scale-105 duration-1000"
                        />
                      </div>
                      <div className="w-full md:w-1/2 space-y-6 text-left">
                        <h3 className="text-3xl font-serif font-medium bg-gradient-to-r from-primary/90 to-primary bg-clip-text text-transparent">{section.title}</h3>
                        <p className="text-muted-foreground leading-relaxed text-lg">{section.content}</p>
                      </div>
                      {index % 2 === 0 && (
                        <div className="hidden md:block absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-24 h-24 rounded-full bg-primary/5 z-0"></div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="text-center mb-16 mt-24">
                <div className="inline-block relative mb-12 border-b-0">
                  <h2 className="text-3xl font-serif pb-2">Our Photo Gallery</h2>
                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-24 h-0.5 bg-gradient-to-r from-primary/20 via-primary to-primary/20"></div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
                  {photos.map((photo, index) => (
                    <div key={index} className="group aspect-square overflow-hidden rounded-xl shadow-lg relative">
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10"></div>
                      <img 
                        src={photo} 
                        alt={`Couple photo ${index + 1}`}
                        className="w-full h-full object-cover transition-all group-hover:scale-110 duration-700"
                      />
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="text-center mb-16 mt-24 bg-gradient-to-b from-transparent via-primary/5 to-transparent py-16 rounded-3xl">
                <div className="inline-block relative mb-12 border-b-0">
                  <h2 className="text-3xl font-serif pb-2">Registry & Gifts</h2>
                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-24 h-0.5 bg-gradient-to-r from-primary/20 via-primary to-primary/20"></div>
                </div>
                
                {bankDetails.length > 0 && (
                  <div className="mb-12">
                    <h3 className="text-2xl font-serif mb-6">Bank Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                      {bankDetails.map((detail, index) => (
                        <BankDetailCard 
                          key={index} 
                          detail={detail} 
                          index={index}
                          isEditable={false}
                        />
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
                  {giftOptions.map((option, index) => (
                    <Card key={index} className="overflow-hidden border-none shadow-xl hover:shadow-2xl transition-all duration-300">
                      <div className="bg-gradient-to-r from-primary/80 to-primary p-6 text-white">
                        <h3 className="text-xl font-serif">{option.title}</h3>
                      </div>
                      <CardContent className="p-8 bg-white">
                        <p className="text-muted-foreground mb-6">{option.description}</p>
                        <div className="bg-secondary/50 backdrop-blur-sm p-5 rounded-lg">
                          <h4 className="text-sm font-medium mb-2">Payment Details:</h4>
                          <p className="text-sm">{option.paymentDetails}</p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                
                <div className="mt-16">
                  <h3 className="text-2xl font-serif mb-8">Our Wishlist</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {wishlistItems.map((item) => (
                      <WishlistItem 
                        key={item.id} 
                        item={item} 
                        isPreviewMode={false}
                        isPublicView={true}
                      />
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="text-center mb-16 mt-24">
                <div className="inline-block relative mb-12 border-b-0">
                  <h2 className="text-3xl font-serif pb-2">Well Wishes</h2>
                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-24 h-0.5 bg-gradient-to-r from-primary/20 via-primary to-primary/20"></div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
                  {wellWishes.map((wish, index) => (
                    <Card key={index} className="text-left p-8 hover:shadow-xl transition-shadow bg-gradient-to-b from-white to-primary/5 border-none">
                      <blockquote className="italic text-muted-foreground text-lg">{wish.message}</blockquote>
                      <div className="mt-6 flex justify-between items-center">
                        <span className="font-medium text-primary/90">— {wish.name}</span>
                        <span className="text-sm text-muted-foreground">{wish.date}</span>
                      </div>
                    </Card>
                  ))}
                </div>
                
                {isPublicView && (
                  <div className="mt-12">
                    {!showWellWishForm ? (
                      <Button 
                        onClick={() => setShowWellWishForm(true)}
                        className="mx-auto bg-gradient-to-r from-primary/90 to-primary hover:from-primary hover:to-primary/90"
                      >
                        <Heart className="mr-2 h-4 w-4" /> Add Your Well Wishes
                      </Button>
                    ) : (
                      <Card className="max-w-lg mx-auto p-8 border-none shadow-xl bg-gradient-to-b from-white to-primary/5">
                        <h3 className="text-xl font-serif mb-6">Share Your Well Wishes</h3>
                        <form onSubmit={handleAddWellWish} className="space-y-5">
                          <div className="space-y-2">
                            <label htmlFor="well-name" className="block text-sm font-medium">Your Name</label>
                            <Input id="well-name" name="name" placeholder="e.g., The Smith Family" required className="bg-white/70" />
                          </div>
                          <div className="space-y-2">
                            <label htmlFor="well-message" className="block text-sm font-medium">Your Message</label>
                            <Textarea 
                              id="well-message" 
                              name="message" 
                              rows={4}
                              placeholder="Share your congratulations and well wishes..."
                              required 
                              className="bg-white/70"
                            />
                          </div>
                          <div className="flex gap-3">
                            <Button type="submit" className="flex-1 bg-gradient-to-r from-primary/90 to-primary hover:from-primary hover:to-primary/90">Submit</Button>
                            <Button 
                              type="button" 
                              variant="outline" 
                              onClick={() => setShowWellWishForm(false)}
                            >
                              Cancel
                            </Button>
                          </div>
                        </form>
                      </Card>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default CoupleStory;

