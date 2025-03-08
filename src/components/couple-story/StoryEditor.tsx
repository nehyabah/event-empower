import { useState, useRef } from "react";
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
import { Camera, X, Heart, Wine, Gift, Sparkles, ImageIcon } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ImageGallery from "./ImageGallery";

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
  brideStory: z.string().optional(),
  groomStory: z.string().optional(),
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
    brideStory?: string;
    groomStory?: string;
  };
  storyImages: StoryImage[];
  setStoryImages: React.Dispatch<React.SetStateAction<StoryImage[]>>;
  setCoupleStory: (story: any) => void;
  onStoryUpdated: () => void;
}

const StoryEditor = ({
  coupleStory,
  storyImages,
  setStoryImages,
  setCoupleStory,
  onStoryUpdated,
}: StoryEditorProps) => {
  const [imageCaption, setImageCaption] = useState("");
  const [currentStoryType, setCurrentStoryType] = useState<'general' | 'bride' | 'groom'>('general');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

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
      brideStory: coupleStory.brideStory || "",
      groomStory: coupleStory.groomStory || "",
    },
  });

  const onStorySubmit = (values: z.infer<typeof storySchema>) => {
    const newStory = {
      ...coupleStory,
      title: values.title,
      content: values.content,
      hashtag: values.hashtag,
      weddingDate: values.weddingDate,
      weddingTime: values.weddingTime,
      venue: values.venue,
      loveQuote: values.loveQuote,
      selectedIcon: values.selectedIcon,
      brideStory: values.brideStory,
      groomStory: values.groomStory,
    };
    setCoupleStory(newStory);
    localStorage.setItem("coupleStory", JSON.stringify(newStory));
    onStoryUpdated();
    toast.success("Your story has been saved!");
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Convert the file to a data URL
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        const newImage: StoryImage = {
          id: crypto.randomUUID(),
          url: event.target.result as string,
          caption: imageCaption,
          storyType: currentStoryType
        };
        setStoryImages(prev => [...prev, newImage]);
        setImageCaption("");
        toast.success(`Image added to ${currentStoryType === 'general' ? 'your story' : 
                      currentStoryType === 'bride' ? 'bride\'s story' : 'groom\'s story'}!`);
      }
    };
    reader.readAsDataURL(file);
    
    // Clear the file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleBannerUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Convert the file to a data URL
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        const updatedStory = {
          ...coupleStory,
          bannerImage: event.target.result as string
        };
        setCoupleStory(updatedStory);
        toast.success("Banner image updated!");
      }
    };
    reader.readAsDataURL(file);
    
    // Clear the file input
    if (bannerInputRef.current) {
      bannerInputRef.current.value = "";
    }
  };

  const removeImage = (id: string) => {
    setStoryImages(prev => prev.filter(img => img.id !== id));
    toast.success("Image removed");
  };

  const removeBanner = () => {
    const updatedStory = {
      ...coupleStory,
      bannerImage: undefined
    };
    setCoupleStory(updatedStory);
    toast.success("Banner image removed");
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-4">
          <TabsTrigger value="basic">Basic Information</TabsTrigger>
          <TabsTrigger value="stories">Bride & Groom Stories</TabsTrigger>
          <TabsTrigger value="images">Images</TabsTrigger>
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
                      {coupleStory.bannerImage ? (
                        <div className="relative w-full h-48 mb-2">
                          <img 
                            src={coupleStory.bannerImage} 
                            alt="Banner" 
                            className="w-full h-full object-cover rounded-md"
                          />
                          <Button 
                            variant="destructive"
                            size="sm"
                            className="absolute top-2 right-2"
                            onClick={removeBanner}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <div className="border-2 border-dashed rounded-md p-8 text-center">
                          <Button 
                            type="button" 
                            variant="outline" 
                            onClick={() => bannerInputRef.current?.click()}
                          >
                            <Camera className="mr-2 h-4 w-4" />
                            Upload Banner Image
                          </Button>
                          <input
                            type="file"
                            ref={bannerInputRef}
                            className="hidden"
                            accept="image/*"
                            onChange={handleBannerUpload}
                          />
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
                  <FormField
                    control={storyForm.control}
                    name="brideStory"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Bride's Story</FormLabel>
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
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          setCurrentStoryType('bride');
                          fileInputRef.current?.click();
                        }}
                      >
                        <ImageIcon className="mr-2 h-4 w-4" />
                        Add Photo
                      </Button>
                    </div>
                    <div className="bg-muted/30 rounded-md p-3">
                      <ImageGallery 
                        images={storyImages} 
                        storyType="bride" 
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
                  <FormField
                    control={storyForm.control}
                    name="groomStory"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Groom's Story</FormLabel>
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
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          setCurrentStoryType('groom');
                          fileInputRef.current?.click();
                        }}
                      >
                        <ImageIcon className="mr-2 h-4 w-4" />
                        Add Photo
                      </Button>
                    </div>
                    <div className="bg-muted/30 rounded-md p-3">
                      <ImageGallery 
                        images={storyImages} 
                        storyType="groom" 
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
                <Button type="submit">Save Stories</Button>
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
              >
                <Camera className="mr-2 h-4 w-4" />
                Upload Image
              </Button>
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleImageUpload}
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
      </Tabs>
      
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="image/*"
        onChange={handleImageUpload}
      />
    </div>
  );
};

export default StoryEditor;
