
import { useState } from "react";
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
import { toast } from "sonner";
import { Camera, X } from "lucide-react";

// Image type
export type StoryImage = {
  id: string;
  url: string;
  caption: string;
};

// Story schema for editing
const storySchema = z.object({
  title: z.string().min(2, {
    message: "Title must be at least 2 characters.",
  }),
  content: z.string().min(10, {
    message: "Story must be at least 10 characters.",
  }),
});

interface StoryEditorProps {
  coupleStory: {
    title: string;
    content: string;
  };
  storyImages: StoryImage[];
  setStoryImages: React.Dispatch<React.SetStateAction<StoryImage[]>>;
  setCoupleStory: (story: { title: string; content: string }) => void;
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
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Story form
  const storyForm = useForm<z.infer<typeof storySchema>>({
    resolver: zodResolver(storySchema),
    defaultValues: {
      title: coupleStory.title,
      content: coupleStory.content
    },
  });

  const onStorySubmit = (values: z.infer<typeof storySchema>) => {
    const newStory = {
      title: values.title,
      content: values.content
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
          caption: imageCaption
        };
        setStoryImages(prev => [...prev, newImage]);
        setImageCaption("");
        toast.success("Image added to your story!");
      }
    };
    reader.readAsDataURL(file);
    
    // Clear the file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removeImage = (id: string) => {
    setStoryImages(prev => prev.filter(img => img.id !== id));
    toast.success("Image removed");
  };

  return (
    <div className="space-y-6">
      <Form {...storyForm}>
        <form onSubmit={storyForm.handleSubmit(onStorySubmit)} className="space-y-4">
          <FormField
            control={storyForm.control}
            name="title"
            render={({ field }) => (
              <FormItem>
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
            name="content"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Your Story</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Share your journey together..."
                    className="min-h-[200px]"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="flex justify-end gap-2">
            <Button type="submit">Save Story</Button>
          </div>
        </form>
      </Form>

      <div className="border-t pt-4">
        <h3 className="text-lg font-medium mb-2">Add Images to Your Story</h3>
        <div className="flex gap-2 mb-2">
          <Input 
            type="text" 
            placeholder="Image caption (optional)"
            value={imageCaption}
            onChange={(e) => setImageCaption(e.target.value)}
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
              {image.caption && (
                <p className="text-sm text-center mt-2">{image.caption}</p>
              )}
              <Button
                variant="destructive"
                size="sm"
                className="absolute top-2 right-2"
                onClick={() => removeImage(image.id)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StoryEditor;

import { useRef } from "react";
