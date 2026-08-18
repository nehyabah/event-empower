import { useState, useRef, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Camera, X, Heart, Wine, Gift, Sparkles, ImageIcon, Plus, Trash2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ImageGallery from "./ImageGallery";
import storyService, {
  type TimelineEvent,
  type WeddingPartyMember,
  type TravelInfoItem,
  type FaqItem,
} from "@/services/api/storyService";

// Image type
export type StoryImage = {
  id: string;
  url: string;
  caption: string;
  storyType?: 'general' | 'bride' | 'groom';
};

// Story schema for editing
const storySchema = z.object({
  title: z.string().min(2, {
    message: "Title must be at least 2 characters.",
  }),
  content: z.string().min(10, {
    message: "Story must be at least 10 characters.",
  }),
  hashtag: z.string().optional(),
  weddingDate: z.string().optional(),
  weddingTime: z.string().optional(),
  venue: z.string().optional(),
  loveQuote: z.string().optional(),
  selectedIcon: z.string().optional(),
  brideName: z.string().optional(),
  groomName: z.string().optional(),
  brideBio: z.string().optional(),
  groomBio: z.string().optional(),
});

interface StoryEditorProps {
  coupleStory: {
    title: string;
    content: string;
    bannerImage?: string;
    hashtag?: string;
    weddingDate?: string;
    weddingTime?: string;
    venue?: string;
    loveQuote?: string;
    selectedIcon?: string;
    brideName?: string;
    groomName?: string;
    brideBio?: string;
    groomBio?: string;
    brideImage?: string;
    groomImage?: string;
  };
  storyImages: StoryImage[];
  setStoryImages: React.Dispatch<React.SetStateAction<StoryImage[]>>;
  setCoupleStory: (story: any) => void;
  onStoryUpdated: () => void;
}

// Helper function to compress image.
// Downscales in halving steps (a single large drawImage jump produces
// visible aliasing/blockiness) and re-encodes at high quality.
const compressImage = (file: File, maxWidth = 800, maxHeight = 600, quality = 0.7): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (readerEvent) => {
      const img = new Image();
      img.onload = () => {
        // Target dimensions — never upscale
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        if (height > maxHeight) {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }

        // Step-down: halve repeatedly until within 2x of target,
        // then do the final resize. Keeps fine detail crisp.
        let source: HTMLImageElement | HTMLCanvasElement = img;
        let sw = img.width;
        let sh = img.height;
        while (sw / 2 >= width && sh / 2 >= height) {
          sw = Math.round(sw / 2);
          sh = Math.round(sh / 2);
          const step = document.createElement('canvas');
          step.width = sw;
          step.height = sh;
          const stepCtx = step.getContext('2d');
          if (!stepCtx) break;
          stepCtx.imageSmoothingEnabled = true;
          stepCtx.imageSmoothingQuality = 'high';
          stepCtx.drawImage(source, 0, 0, sw, sh);
          source = step;
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Could not get canvas context'));
          return;
        }

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(source, 0, 0, width, height);

        const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(compressedDataUrl);
      };

      img.onerror = () => {
        reject(new Error('Failed to load image'));
      };

      if (typeof readerEvent.target?.result === 'string') {
        img.src = readerEvent.target.result;
      } else {
        reject(new Error('Failed to read file'));
      }
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    
    reader.readAsDataURL(file);
  });
};

const StoryEditor = ({
  coupleStory,
  storyImages,
  setStoryImages,
  setCoupleStory,
  onStoryUpdated,
}: StoryEditorProps) => {
  const [imageCaption, setImageCaption] = useState("");
  const [currentStoryType, setCurrentStoryType] = useState<'general' | 'bride' | 'groom'>('general');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);
  const brideProfileInputRef = useRef<HTMLInputElement>(null);
  const groomProfileInputRef = useRef<HTMLInputElement>(null);
  const brideFileInputRef = useRef<HTMLInputElement>(null);
  const groomFileInputRef = useRef<HTMLInputElement>(null);

  // New entity states
  const [timelineItems, setTimelineItems] = useState<TimelineEvent[]>([]);
  const [partyMembers, setPartyMembers] = useState<WeddingPartyMember[]>([]);
  const [travelItems, setTravelItems] = useState<TravelInfoItem[]>([]);
  const [faqItems, setFaqItems] = useState<FaqItem[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const [tl, wp, tr, fq] = await Promise.all([
          storyService.listTimeline(),
          storyService.listWeddingParty(),
          storyService.listTravel(),
          storyService.listFaq(),
        ]);
        setTimelineItems(tl);
        setPartyMembers(wp);
        setTravelItems(tr);
        setFaqItems(fq);
      } catch (e) {
        console.error("Failed to load editor data:", e);
      }
    };
    void load();
  }, []);

  // Story form
  const storyForm = useForm<z.infer<typeof storySchema>>({
    resolver: zodResolver(storySchema),
    defaultValues: {
      title: coupleStory.title,
      content: coupleStory.content,
      hashtag: coupleStory.hashtag || "",
      weddingDate: coupleStory.weddingDate || "",
      weddingTime: coupleStory.weddingTime || "",
      venue: coupleStory.venue || "",
      loveQuote: coupleStory.loveQuote || "",
      selectedIcon: coupleStory.selectedIcon || "heart",
      brideName: coupleStory.brideName || "",
      groomName: coupleStory.groomName || "",
      brideBio: coupleStory.brideBio || "",
      groomBio: coupleStory.groomBio || "",
    },
  });

  const onStorySubmit = async (values: z.infer<typeof storySchema>) => {
    try {
      const updatedStory = await storyService.updateMyStory({
        title: values.title,
        content: values.content,
        hashtag: values.hashtag || null,
        wedding_date: values.weddingDate || null,
        wedding_time: values.weddingTime || null,
        venue: values.venue || null,
        love_quote: values.loveQuote || null,
        selected_icon: values.selectedIcon || null,
        bride_name: values.brideName || null,
        groom_name: values.groomName || null,
        bride_bio: values.brideBio || null,
        groom_bio: values.groomBio || null,
      });

      setCoupleStory({
        ...coupleStory,
        title: updatedStory.title || values.title,
        content: updatedStory.content || values.content,
        hashtag: updatedStory.hashtag || "",
        weddingDate: updatedStory.wedding_date || "",
        weddingTime: updatedStory.wedding_time || "",
        venue: updatedStory.venue || "",
        loveQuote: updatedStory.love_quote || "",
        selectedIcon: updatedStory.selected_icon || values.selectedIcon || "",
        brideName: updatedStory.bride_name || values.brideName || "",
        groomName: updatedStory.groom_name || values.groomName || "",
        brideBio: updatedStory.bride_bio || values.brideBio || "",
        groomBio: updatedStory.groom_bio || values.groomBio || "",
      });

      onStoryUpdated();
      toast.success("Your story has been saved!");
    } catch (error) {
      toast.error("Failed to save story. Try again.");
      console.error("Error saving story:", error);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, storyType: 'general' | 'bride' | 'groom' = 'general') => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setIsUploading(true);

    try {
      // Gallery images render up to ~430 CSS px wide (860 on retina)
      const compressedDataUrl = await compressImage(file, 1600, 1600, 0.82);
      
      const createdImage = await storyService.addStoryImage({
        url: compressedDataUrl,
        caption: imageCaption || undefined,
        story_type: storyType,
      });

      const newImage: StoryImage = {
        id: createdImage.id,
        url: createdImage.url,
        caption: createdImage.caption || "",
        storyType: createdImage.story_type,
      };

      setStoryImages((prev) => {
        const newImages = [...prev, newImage];
        if (newImages.length > 20) {
          return newImages.slice(-20);
        }
        return newImages;
      });

      setImageCaption("");
      toast.success(
        `Image added to ${
          storyType === "general"
            ? "your story"
            : storyType === "bride"
              ? "bride's story"
              : "groom's story"
        }!`
      );
    } catch (error) {
      console.error("Error processing image:", error);
      toast.error("Failed to process image");
    } finally {
      setIsUploading(false);
      // Clear the file input
      e.target.value = "";
    }
  };

  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setIsUploading(true);

    try {
      // Hero renders full-screen on retina displays — keep the banner large
      const compressedDataUrl = await compressImage(file, 2560, 1600, 0.9);
      
      const updatedStory = await storyService.updateMyStory({
        banner_image_url: compressedDataUrl,
      });

      setCoupleStory({
        ...coupleStory,
        bannerImage: updatedStory.banner_image_url || compressedDataUrl,
      });
      toast.success("Banner image updated!");
    } catch (error) {
      console.error("Error processing banner:", error);
      toast.error("Failed to process banner image");
    } finally {
      setIsUploading(false);
      // Clear the file input
      if (bannerInputRef.current) {
        bannerInputRef.current.value = "";
      }
    }
  };

  const handlePartnerImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    partner: "bride" | "groom"
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const compressedDataUrl = await compressImage(file, 1400, 1870, 0.85);
      const updatedStory = await storyService.updateMyStory(
        partner === "bride"
          ? { bride_image_url: compressedDataUrl }
          : { groom_image_url: compressedDataUrl }
      );

      setCoupleStory({
        ...coupleStory,
        brideImage: updatedStory.bride_image_url || coupleStory.brideImage,
        groomImage: updatedStory.groom_image_url || coupleStory.groomImage,
      });

      toast.success(`${partner === "bride" ? "Bride" : "Groom"} image updated!`);
    } catch (error) {
      console.error(`Error processing ${partner} image:`, error);
      toast.error(`Failed to process ${partner} image`);
    } finally {
      setIsUploading(false);
      e.target.value = "";
    }
  };

  const removePartnerImage = (partner: "bride" | "groom") => {
    const remove = async () => {
      try {
        const updatedStory = await storyService.updateMyStory(
          partner === "bride" ? { bride_image_url: null } : { groom_image_url: null }
        );
        setCoupleStory({
          ...coupleStory,
          brideImage: updatedStory.bride_image_url || undefined,
          groomImage: updatedStory.groom_image_url || undefined,
        });
        toast.success(`${partner === "bride" ? "Bride" : "Groom"} image removed`);
      } catch (error) {
        toast.error("Failed to update story settings");
        console.error(`Error removing ${partner} image:`, error);
      }
    };

    void remove();
  };

  const removeImage = (id: string) => {
    const remove = async () => {
      try {
        await storyService.deleteStoryImage(id);
        setStoryImages((prev) => prev.filter((img) => img.id !== id));
        toast.success("Image removed");
      } catch (error) {
        toast.error("Failed to remove image");
        console.error("Error removing image:", error);
      }
    };

    void remove();
  };

  const removeBanner = () => {
    const remove = async () => {
      try {
        await storyService.updateMyStory({ banner_image_url: null });
        setCoupleStory({
          ...coupleStory,
          bannerImage: undefined,
        });
        toast.success("Banner image removed");
      } catch (error) {
        toast.error("Failed to update story settings");
        console.error("Error removing banner:", error);
      }
    };

    void remove();
  };

  const managedStoryImageCount = storyImages.length > 20 
    ? ` (${storyImages.length}/20 - Consider removing some images to save space)`
    : ` (${storyImages.length}/20)`;

  return (
    <div className="space-y-6">
      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="flex w-full mb-4 overflow-x-auto">
          <TabsTrigger value="basic" className="flex-1 min-w-[100px]">Basic Info</TabsTrigger>
          <TabsTrigger value="stories" className="flex-1 min-w-[100px]">Partners</TabsTrigger>
          <TabsTrigger value="images" className="flex-1 min-w-[80px]">Photos</TabsTrigger>
          <TabsTrigger value="timeline" className="flex-1 min-w-[80px]">Timeline</TabsTrigger>
          <TabsTrigger value="party" className="flex-1 min-w-[80px]">Party</TabsTrigger>
          <TabsTrigger value="travel" className="flex-1 min-w-[80px]">Travel</TabsTrigger>
          <TabsTrigger value="faq" className="flex-1 min-w-[60px]">FAQ</TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="space-y-4">
          <Form {...storyForm}>
            <form onSubmit={storyForm.handleSubmit(onStorySubmit)} className="space-y-4">
              <div className="space-y-4">
                <div className="border-b pb-4">
                  <h3 className="text-lg font-medium mb-4">Banner & Headline</h3>
                  <div className="mb-4">
                    <FormLabel>Banner Image</FormLabel>
                    <div className="mt-2">
                      <input
                        type="file"
                        ref={bannerInputRef}
                        className="hidden"
                        accept="image/*"
                        onChange={handleBannerUpload}
                      />
                      {coupleStory.bannerImage ? (
                        <div className="relative w-full h-48 mb-2">
                          <img
                            src={coupleStory.bannerImage}
                            alt="Banner"
                            className="w-full h-full object-cover rounded-md"
                          />
                          <div className="absolute top-2 right-2 flex gap-2">
                            <Button
                              type="button"
                              variant="secondary"
                              size="sm"
                              onClick={() => bannerInputRef.current?.click()}
                              disabled={isUploading}
                            >
                              {isUploading ? "Processing..." : <><Camera className="h-4 w-4 mr-1" />Change</>}
                            </Button>
                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              onClick={removeBanner}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="border-2 border-dashed rounded-md p-8 text-center">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => bannerInputRef.current?.click()}
                            disabled={isUploading}
                          >
                            {isUploading ? (
                              "Processing..."
                            ) : (
                              <>
                                <Camera className="mr-2 h-4 w-4" />
                                Upload Banner Image
                              </>
                            )}
                          </Button>
                          <p className="text-sm text-muted-foreground mt-2">
                            Recommended size: 1200×400 pixels
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  <FormField
                    control={storyForm.control}
                    name="hashtag"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Wedding Hashtag</FormLabel>
                        <FormControl>
                          <Input placeholder="OurWeddingHashtag" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="border-b pb-4">
                  <h3 className="text-lg font-medium mb-4">Wedding Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={storyForm.control}
                      name="weddingDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Wedding Date</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={storyForm.control}
                      name="weddingTime"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Wedding Time</FormLabel>
                          <FormControl>
                            <Input type="time" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={storyForm.control}
                    name="venue"
                    render={({ field }) => (
                      <FormItem className="mt-4">
                        <FormLabel>Venue</FormLabel>
                        <FormControl>
                          <Input placeholder="Wedding Venue" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="border-b pb-4">
                  <h3 className="text-lg font-medium mb-4">Story & Icon</h3>
                  <FormField
                    control={storyForm.control}
                    name="selectedIcon"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Select Icon</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select an icon" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="heart">
                              <div className="flex items-center">
                                <Heart className="mr-2 h-4 w-4" /> Heart
                              </div>
                            </SelectItem>
                            <SelectItem value="wine">
                              <div className="flex items-center">
                                <Wine className="mr-2 h-4 w-4" /> Toast
                              </div>
                            </SelectItem>
                            <SelectItem value="gift">
                              <div className="flex items-center">
                                <Gift className="mr-2 h-4 w-4" /> Gift
                              </div>
                            </SelectItem>
                            <SelectItem value="sparkles">
                              <div className="flex items-center">
                                <Sparkles className="mr-2 h-4 w-4" /> Sparkles
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={storyForm.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem className="mt-4">
                        <FormLabel>Story Title</FormLabel>
                        <FormControl>
                          <Input placeholder="Our Love Story" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={storyForm.control}
                    name="loveQuote"
                    render={({ field }) => (
                      <FormItem className="mt-4">
                        <FormLabel>Love Quote</FormLabel>
                        <FormControl>
                          <Input placeholder="My heart is yours to hold and cherish for the rest of my days" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={storyForm.control}
                    name="content"
                    render={({ field }) => (
                      <FormItem className="mt-4">
                        <FormLabel>Your Story</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Share your journey together..."
                            className="min-h-[150px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button type="submit">Save Story</Button>
              </div>
            </form>
          </Form>
        </TabsContent>

        <TabsContent value="stories" className="space-y-4">
          <Form {...storyForm}>
            <form onSubmit={storyForm.handleSubmit(onStorySubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="border rounded-md p-3">
                    <h4 className="text-sm font-medium mb-3">Bride Profile Image</h4>
                    <div className="flex gap-3 items-start">
                      <div className="w-24 h-24 rounded-md overflow-hidden bg-muted/40 shrink-0">
                        <img
                          src={coupleStory.brideImage || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=800&auto=format&fit=crop"}
                          alt="Bride profile"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => brideProfileInputRef.current?.click()}
                          disabled={isUploading}
                        >
                          {isUploading ? "Processing..." : <><Camera className="h-4 w-4 mr-1" />Change</>}
                        </Button>
                        {coupleStory.brideImage && (
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            onClick={() => removePartnerImage("bride")}
                            disabled={isUploading}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                        <input
                          type="file"
                          ref={brideProfileInputRef}
                          className="hidden"
                          accept="image/*"
                          onChange={(e) => void handlePartnerImageUpload(e, "bride")}
                        />
                      </div>
                    </div>
                  </div>

                  <FormField
                    control={storyForm.control}
                    name="brideName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Bride Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Bride name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={storyForm.control}
                    name="brideBio"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Bride Bio</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Share the bride's story..."
                            className="min-h-[250px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="border-t pt-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-sm font-medium">Bride's Photos</h4>
                      <div className="space-x-2">
                        <Input 
                          type="text" 
                          placeholder="Caption (optional)"
                          value={currentStoryType === 'bride' ? imageCaption : ''}
                          onChange={(e) => {
                            setCurrentStoryType('bride');
                            setImageCaption(e.target.value);
                          }}
                          className="w-40 text-xs inline-block"
                        />
                        <Button 
                          type="button" 
                          variant="outline" 
                          size="sm"
                          onClick={() => brideFileInputRef.current?.click()}
                          disabled={isUploading}
                        >
                          {isUploading ? "Processing..." : (
                            <>
                              <ImageIcon className="mr-2 h-4 w-4" />
                              Add Photo
                            </>
                          )}
                        </Button>
                        <input
                          type="file"
                          ref={brideFileInputRef}
                          className="hidden"
                          accept="image/*"
                          onChange={(e) => handleImageUpload(e, 'bride')}
                        />
                      </div>
                    </div>
                    <div className="bg-muted/30 rounded-md p-3">
                      <ImageGallery 
                        images={storyImages} 
                        storyType="bride"
                        onRemove={removeImage}
                        isEditMode={true}
                      />
                      {!storyImages.some(img => img.storyType === 'bride') && (
                        <p className="text-center text-sm text-muted-foreground py-4">
                          No photos added to bride's story yet
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="border rounded-md p-3">
                    <h4 className="text-sm font-medium mb-3">Groom Profile Image</h4>
                    <div className="flex gap-3 items-start">
                      <div className="w-24 h-24 rounded-md overflow-hidden bg-muted/40 shrink-0">
                        <img
                          src={coupleStory.groomImage || "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=800&auto=format&fit=crop"}
                          alt="Groom profile"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => groomProfileInputRef.current?.click()}
                          disabled={isUploading}
                        >
                          {isUploading ? "Processing..." : <><Camera className="h-4 w-4 mr-1" />Change</>}
                        </Button>
                        {coupleStory.groomImage && (
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            onClick={() => removePartnerImage("groom")}
                            disabled={isUploading}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                        <input
                          type="file"
                          ref={groomProfileInputRef}
                          className="hidden"
                          accept="image/*"
                          onChange={(e) => void handlePartnerImageUpload(e, "groom")}
                        />
                      </div>
                    </div>
                  </div>

                  <FormField
                    control={storyForm.control}
                    name="groomName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Groom Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Groom name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={storyForm.control}
                    name="groomBio"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Groom Bio</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Share the groom's story..."
                            className="min-h-[250px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="border-t pt-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-sm font-medium">Groom's Photos</h4>
                      <div className="space-x-2">
                        <Input 
                          type="text" 
                          placeholder="Caption (optional)"
                          value={currentStoryType === 'groom' ? imageCaption : ''}
                          onChange={(e) => {
                            setCurrentStoryType('groom');
                            setImageCaption(e.target.value);
                          }}
                          className="w-40 text-xs inline-block"
                        />
                        <Button 
                          type="button" 
                          variant="outline" 
                          size="sm"
                          onClick={() => groomFileInputRef.current?.click()}
                          disabled={isUploading}
                        >
                          {isUploading ? "Processing..." : (
                            <>
                              <ImageIcon className="mr-2 h-4 w-4" />
                              Add Photo
                            </>
                          )}
                        </Button>
                        <input
                          type="file"
                          ref={groomFileInputRef}
                          className="hidden"
                          accept="image/*"
                          onChange={(e) => handleImageUpload(e, 'groom')}
                        />
                      </div>
                    </div>
                    <div className="bg-muted/30 rounded-md p-3">
                      <ImageGallery 
                        images={storyImages} 
                        storyType="groom" 
                        onRemove={removeImage}
                        isEditMode={true}
                      />
                      {!storyImages.some(img => img.storyType === 'groom') && (
                        <p className="text-center text-sm text-muted-foreground py-4">
                          No photos added to groom's story yet
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button type="submit" className="bg-wedding-gold hover:bg-wedding-gold/90">Save Stories</Button>
              </div>
            </form>
          </Form>
        </TabsContent>

        <TabsContent value="images" className="space-y-4">
          <div className="border-t pt-4">
            <h3 className="text-lg font-medium mb-2">Add Images to Your Story</h3>
            <div className="flex gap-2 mb-2">
              <Select
                value={currentStoryType}
                onValueChange={(value: 'general' | 'bride' | 'groom') => setCurrentStoryType(value)}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Image for" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">General Story</SelectItem>
                  <SelectItem value="bride">Bride's Story</SelectItem>
                  <SelectItem value="groom">Groom's Story</SelectItem>
                </SelectContent>
              </Select>
              <Input
                type="text"
                placeholder="Image caption (optional)"
                value={imageCaption}
                onChange={(e) => setImageCaption(e.target.value)}
                className="flex-grow"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
              >
                {isUploading ? "Processing..." : (
                  <>
                    <Camera className="mr-2 h-4 w-4" />
                    Upload Image
                  </>
                )}
              </Button>
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={(e) => handleImageUpload(e, currentStoryType)}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              {storyImages.map((image) => (
                <div key={image.id} className="relative border rounded-md p-2">
                  <img
                    src={image.url}
                    alt={image.caption || "Story image"}
                    className="w-full h-48 object-cover rounded"
                  />
                  <div className="flex items-center justify-between mt-2">
                    {image.caption && (
                      <p className="text-sm">{image.caption}</p>
                    )}
                    <div className="flex items-center ml-auto">
                      {image.storyType && image.storyType !== 'general' && (
                        <span className="bg-secondary text-xs px-2 py-1 rounded mr-2">
                          {image.storyType === 'bride' ? 'Bride' : 'Groom'}
                        </span>
                      )}
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => removeImage(image.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>

        {/* Timeline Tab */}
        <TabsContent value="timeline" className="space-y-4">
          <TimelineEditor items={timelineItems} setItems={setTimelineItems} />
        </TabsContent>

        {/* Wedding Party Tab */}
        <TabsContent value="party" className="space-y-4">
          <WeddingPartyEditor items={partyMembers} setItems={setPartyMembers} />
        </TabsContent>

        {/* Travel Tab */}
        <TabsContent value="travel" className="space-y-4">
          <TravelEditor items={travelItems} setItems={setTravelItems} />
        </TabsContent>

        {/* FAQ Tab */}
        <TabsContent value="faq" className="space-y-4">
          <FaqEditor items={faqItems} setItems={setFaqItems} />
        </TabsContent>
      </Tabs>
      
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="image/*"
        onChange={(e) => handleImageUpload(e, currentStoryType)}
      />
    </div>
  );
};

// --- Inline Sub-Editors ---

function TimelineEditor({ items, setItems }: { items: TimelineEvent[]; setItems: React.Dispatch<React.SetStateAction<TimelineEvent[]>> }) {
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [description, setDescription] = useState("");

  const handleAdd = async () => {
    if (!title.trim()) { toast.error("Title is required"); return; }
    try {
      const item = await storyService.addTimeline({ title, date: date || undefined, description: description || undefined });
      setItems((prev) => [...prev, item]);
      setTitle(""); setDate(""); setDescription("");
      toast.success("Timeline event added!");
    } catch { toast.error("Failed to add"); }
  };

  const handleDelete = async (id: string) => {
    try {
      await storyService.deleteTimeline(id);
      setItems((prev) => prev.filter((i) => i.id !== id));
      toast.success("Removed");
    } catch { toast.error("Failed to remove"); }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Timeline Events</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
        <Input placeholder="Event title *" value={title} onChange={(e) => setTitle(e.target.value)} />
        <Input placeholder="Date (e.g. June 2020)" value={date} onChange={(e) => setDate(e.target.value)} />
        <Input placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
      </div>
      <Button type="button" size="sm" onClick={handleAdd}><Plus className="w-4 h-4 mr-1" /> Add Event</Button>

      <div className="space-y-2 mt-4">
        {items.map((item) => (
          <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg">
            <div>
              <p className="font-medium">{item.title}</p>
              {item.date && <p className="text-xs text-muted-foreground">{item.date}</p>}
              {item.description && <p className="text-sm text-muted-foreground">{item.description}</p>}
            </div>
            <Button variant="ghost" size="icon" onClick={() => handleDelete(item.id)}>
              <Trash2 className="w-4 h-4 text-red-500" />
            </Button>
          </div>
        ))}
        {items.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">No timeline events yet</p>}
      </div>
    </div>
  );
}

function WeddingPartyEditor({ items, setItems }: { items: WeddingPartyMember[]; setItems: React.Dispatch<React.SetStateAction<WeddingPartyMember[]>> }) {
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [side, setSide] = useState<string>("both");
  const [bio, setBio] = useState("");

  const handleAdd = async () => {
    if (!name.trim() || !role.trim()) { toast.error("Name and role are required"); return; }
    try {
      const item = await storyService.addWeddingParty({ name, role, side, bio: bio || undefined });
      setItems((prev) => [...prev, item]);
      setName(""); setRole(""); setBio("");
      toast.success("Party member added!");
    } catch { toast.error("Failed to add"); }
  };

  const handleDelete = async (id: string) => {
    try {
      await storyService.deleteWeddingParty(id);
      setItems((prev) => prev.filter((i) => i.id !== id));
      toast.success("Removed");
    } catch { toast.error("Failed to remove"); }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Wedding Party</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        <Input placeholder="Name *" value={name} onChange={(e) => setName(e.target.value)} />
        <Input placeholder="Role * (e.g. Best Man)" value={role} onChange={(e) => setRole(e.target.value)} />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        <Select value={side} onValueChange={setSide}>
          <SelectTrigger><SelectValue placeholder="Side" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="bride">Bride's Side</SelectItem>
            <SelectItem value="groom">Groom's Side</SelectItem>
            <SelectItem value="both">Both</SelectItem>
          </SelectContent>
        </Select>
        <Input placeholder="Short bio (optional)" value={bio} onChange={(e) => setBio(e.target.value)} />
      </div>
      <Button type="button" size="sm" onClick={handleAdd}><Plus className="w-4 h-4 mr-1" /> Add Member</Button>

      <div className="space-y-2 mt-4">
        {items.map((item) => (
          <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg">
            <div>
              <p className="font-medium">{item.name} <span className="text-muted-foreground text-sm">- {item.role}</span></p>
              <p className="text-xs text-muted-foreground capitalize">{item.side}'s side</p>
            </div>
            <Button variant="ghost" size="icon" onClick={() => handleDelete(item.id)}>
              <Trash2 className="w-4 h-4 text-red-500" />
            </Button>
          </div>
        ))}
        {items.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">No wedding party members yet</p>}
      </div>
    </div>
  );
}

function TravelEditor({ items, setItems }: { items: TravelInfoItem[]; setItems: React.Dispatch<React.SetStateAction<TravelInfoItem[]>> }) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("hotel");
  const [description, setDescription] = useState("");
  const [address, setAddress] = useState("");
  const [link, setLink] = useState("");

  const handleAdd = async () => {
    if (!title.trim()) { toast.error("Title is required"); return; }
    try {
      const item = await storyService.addTravel({
        title, category, description: description || undefined, address: address || undefined, link: link || undefined,
      });
      setItems((prev) => [...prev, item]);
      setTitle(""); setDescription(""); setAddress(""); setLink("");
      toast.success("Travel info added!");
    } catch { toast.error("Failed to add"); }
  };

  const handleDelete = async (id: string) => {
    try {
      await storyService.deleteTravel(id);
      setItems((prev) => prev.filter((i) => i.id !== id));
      toast.success("Removed");
    } catch { toast.error("Failed to remove"); }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Travel & Stay</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        <Input placeholder="Title * (e.g. Hilton Downtown)" value={title} onChange={(e) => setTitle(e.target.value)} />
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="hotel">Hotel</SelectItem>
            <SelectItem value="transport">Transport</SelectItem>
            <SelectItem value="parking">Parking</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Textarea placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} className="min-h-[60px]" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        <Input placeholder="Address" value={address} onChange={(e) => setAddress(e.target.value)} />
        <Input placeholder="Website link" value={link} onChange={(e) => setLink(e.target.value)} />
      </div>
      <Button type="button" size="sm" onClick={handleAdd}><Plus className="w-4 h-4 mr-1" /> Add Info</Button>

      <div className="space-y-2 mt-4">
        {items.map((item) => (
          <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg">
            <div>
              <p className="font-medium">{item.title}</p>
              <p className="text-xs text-muted-foreground capitalize">{item.category}</p>
              {item.description && <p className="text-sm text-muted-foreground">{item.description}</p>}
            </div>
            <Button variant="ghost" size="icon" onClick={() => handleDelete(item.id)}>
              <Trash2 className="w-4 h-4 text-red-500" />
            </Button>
          </div>
        ))}
        {items.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">No travel info yet</p>}
      </div>
    </div>
  );
}

function FaqEditor({ items, setItems }: { items: FaqItem[]; setItems: React.Dispatch<React.SetStateAction<FaqItem[]>> }) {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");

  const handleAdd = async () => {
    if (!question.trim() || !answer.trim()) { toast.error("Both question and answer are required"); return; }
    try {
      const item = await storyService.addFaq({ question, answer });
      setItems((prev) => [...prev, item]);
      setQuestion(""); setAnswer("");
      toast.success("FAQ added!");
    } catch { toast.error("Failed to add"); }
  };

  const handleDelete = async (id: string) => {
    try {
      await storyService.deleteFaq(id);
      setItems((prev) => prev.filter((i) => i.id !== id));
      toast.success("Removed");
    } catch { toast.error("Failed to remove"); }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Frequently Asked Questions</h3>
      <Input placeholder="Question *" value={question} onChange={(e) => setQuestion(e.target.value)} />
      <Textarea placeholder="Answer *" value={answer} onChange={(e) => setAnswer(e.target.value)} className="min-h-[60px]" />
      <Button type="button" size="sm" onClick={handleAdd}><Plus className="w-4 h-4 mr-1" /> Add FAQ</Button>

      <div className="space-y-2 mt-4">
        {items.map((item) => (
          <div key={item.id} className="flex items-start justify-between p-3 border rounded-lg">
            <div>
              <p className="font-medium">{item.question}</p>
              <p className="text-sm text-muted-foreground mt-1">{item.answer}</p>
            </div>
            <Button variant="ghost" size="icon" className="shrink-0" onClick={() => handleDelete(item.id)}>
              <Trash2 className="w-4 h-4 text-red-500" />
            </Button>
          </div>
        ))}
        {items.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">No FAQ items yet</p>}
      </div>
    </div>
  );
}

export default StoryEditor;
