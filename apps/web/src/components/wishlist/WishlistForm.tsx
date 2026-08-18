import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useWishlist } from "@/context/useWishlist";
import storyService from "@/services/api/storyService";
import { ImagePlus, Link as LinkIcon, Loader2, X } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

const formSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  price: z.string().optional(),
  link: z.string().url({ message: "Please enter a valid URL" }).optional().or(z.literal("")),
  imageUrl: z.string().url({ message: "Please enter a valid image URL" }).optional().or(z.literal("")),
  priority: z.enum(["high", "medium", "low"]),
});

type WishlistFormValues = z.infer<typeof formSchema>;

interface WishlistFormProps {
  onSuccess: () => void;
}

const WishlistForm = ({ onSuccess }: WishlistFormProps) => {
  const { addWishlistItem } = useWishlist();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imageMode, setImageMode] = useState<"upload" | "url">("upload");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<WishlistFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      price: "",
      link: "",
      imageUrl: "",
      priority: "medium",
    },
  });

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setUploadError("Please select an image file");
      return;
    }

    // Local preview
    const reader = new FileReader();
    reader.onload = (ev) => setImagePreview(ev.target?.result as string);
    reader.readAsDataURL(file);

    // Upload
    setIsUploading(true);
    setUploadError(null);
    try {
      const result = await storyService.uploadWishlistImage(file);
      setUploadedImageUrl(result.url);
    } catch {
      setUploadError("Failed to upload image. Try pasting a URL instead.");
      setImagePreview(null);
    } finally {
      setIsUploading(false);
    }
  };

  const clearImage = () => {
    setImagePreview(null);
    setUploadedImageUrl(null);
    setUploadError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    form.setValue("imageUrl", "");
  };

  const onSubmit = async (values: WishlistFormValues) => {
    setIsSubmitting(true);
    const finalImageUrl =
      imageMode === "upload" ? uploadedImageUrl || undefined : values.imageUrl || undefined;

    addWishlistItem({
      name: values.name,
      price: values.price,
      link: values.link,
      imageUrl: finalImageUrl,
      priority: values.priority,
    });

    form.reset();
    clearImage();
    setIsSubmitting(false);
    onSuccess();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Add Registry Item</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Name */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Item Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Coffee Machine" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Price */}
            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Price (optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. ₦35,000" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Buy Link */}
            <FormField
              control={form.control}
              name="link"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-1.5">
                    <LinkIcon className="h-3.5 w-3.5" />
                    Store link (optional)
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="https://jumia.com/product..." {...field} />
                  </FormControl>
                  <p className="text-xs text-muted-foreground">
                    Guests will be taken to this link when they click the item
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Image — upload or URL */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Item Image (optional)</span>
                <Tabs
                  value={imageMode}
                  onValueChange={(v) => {
                    setImageMode(v as "upload" | "url");
                    clearImage();
                  }}
                >
                  <TabsList className="h-7 text-xs">
                    <TabsTrigger value="upload" className="h-6 px-2 text-xs">Upload</TabsTrigger>
                    <TabsTrigger value="url" className="h-6 px-2 text-xs">Paste URL</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>

              {imageMode === "upload" ? (
                <div className="space-y-2">
                  {imagePreview ? (
                    <div className="relative rounded-lg overflow-hidden border bg-muted h-40">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                      {isUploading && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                          <Loader2 className="h-6 w-6 text-white animate-spin" />
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={clearImage}
                        className="absolute top-2 right-2 bg-black/60 text-white rounded-full p-1 hover:bg-black/80"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                      {uploadedImageUrl && !isUploading && (
                        <div className="absolute bottom-2 left-2 bg-black/60 text-white text-xs rounded px-2 py-0.5">
                          Uploaded
                        </div>
                      )}
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full h-32 border-2 border-dashed border-muted-foreground/30 rounded-lg flex flex-col items-center justify-center gap-2 text-muted-foreground hover:border-primary/50 hover:text-primary transition-colors"
                    >
                      <ImagePlus className="h-6 w-6" />
                      <span className="text-sm">Click to upload image</span>
                      <span className="text-xs">PNG, JPG up to 5MB</span>
                    </button>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                  {uploadError && (
                    <p className="text-xs text-destructive">{uploadError}</p>
                  )}
                </div>
              ) : (
                <FormField
                  control={form.control}
                  name="imageUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input placeholder="https://example.com/image.jpg" {...field} />
                      </FormControl>
                      <FormMessage />
                      {field.value && (
                        <div className="mt-2 rounded-lg overflow-hidden border bg-muted h-32">
                          <img
                            src={field.value}
                            alt="Preview"
                            className="w-full h-full object-cover"
                            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                          />
                        </div>
                      )}
                    </FormItem>
                  )}
                />
              )}
            </div>

            {/* Priority */}
            <FormField
              control={form.control}
              name="priority"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Priority</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="high">High Priority</SelectItem>
                      <SelectItem value="medium">Medium Priority</SelectItem>
                      <SelectItem value="low">Nice to Have</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-2 pt-2">
              <Button type="button" variant="outline" onClick={onSuccess}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting || isUploading}>
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Add to Registry
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default WishlistForm;
