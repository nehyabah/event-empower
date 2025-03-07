
import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/home/Footer";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import WishlistItem from "@/components/wishlist/WishlistItem";
import BankDetailCard from "@/components/wishlist/BankDetailCard";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useWishlist } from "@/context/useWishlist";
import { Image, Link, Share2, Camera, MessageSquare, Send } from "lucide-react";
import { v4 as uuidv4 } from "uuid";

// Comment type
type Comment = {
  id: string;
  name: string;
  text: string;
  date: string;
};

// Image type
type StoryImage = {
  id: string;
  url: string;
  caption: string;
};

const bankDetailSchema = z.object({
  bankName: z.string().min(2, {
    message: "Bank name must be at least 2 characters.",
  }),
  accountName: z.string().min(2, {
    message: "Account name must be at least 2 characters.",
  }),
  accountNumber: z.string().min(8, {
    message: "Account number must be at least 8 characters.",
  }),
  sortCode: z.string().min(6, {
    message: "Sort code must be at least 6 characters.",
  }),
  description: z.string().optional(),
});

// Story schema for editing
const storySchema = z.object({
  title: z.string().min(2, {
    message: "Title must be at least 2 characters.",
  }),
  content: z.string().min(10, {
    message: "Story must be at least 10 characters.",
  }),
});

// Comment schema
const commentSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  text: z.string().min(1, { message: "Comment cannot be empty" }),
});

const CoupleStory = () => {
  const navigate = useNavigate();
  const isAuthenticated = localStorage.getItem("authenticated") === "true";
  const { wishlistItems, bankDetails, addWishlistItem, addBankDetail, markItemAsPurchased, removeItemPurchaser, removeBankDetail } = useWishlist();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // State for couple's story
  const [isEditingStory, setIsEditingStory] = useState(false);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [storyImages, setStoryImages] = useState<StoryImage[]>(() => {
    const savedImages = localStorage.getItem("storyImages");
    return savedImages ? JSON.parse(savedImages) : [];
  });
  const [comments, setComments] = useState<Comment[]>(() => {
    const savedComments = localStorage.getItem("storyComments");
    return savedComments ? JSON.parse(savedComments) : [];
  });
  const [newComment, setNewComment] = useState({ name: "", text: "" });
  const [imageCaption, setImageCaption] = useState("");
  const [coupleStory, setCoupleStory] = useState(() => {
    const savedStory = localStorage.getItem("coupleStory");
    return savedStory ? JSON.parse(savedStory) : {
      title: "Our Love Story",
      content: "Share your story here! How you met, your journey together, and your plans for the future."
    };
  });

  // Story form
  const storyForm = useForm<z.infer<typeof storySchema>>({
    resolver: zodResolver(storySchema),
    defaultValues: {
      title: coupleStory.title,
      content: coupleStory.content
    },
  });

  // Comment form
  const commentForm = useForm<z.infer<typeof commentSchema>>({
    resolver: zodResolver(commentSchema),
    defaultValues: {
      name: "",
      text: ""
    },
  });

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/');
      toast.error("Please log in to view the couple's story");
    }
  }, [isAuthenticated, navigate]);

  // Save images to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("storyImages", JSON.stringify(storyImages));
  }, [storyImages]);

  // Save comments to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("storyComments", JSON.stringify(comments));
  }, [comments]);

  // If not authenticated, don't render the page content
  if (!isAuthenticated) {
    return null;
  }

  const form = useForm<z.infer<typeof bankDetailSchema>>({
    resolver: zodResolver(bankDetailSchema),
    defaultValues: {
      bankName: "",
      accountName: "",
      accountNumber: "",
      sortCode: "",
      description: "",
    },
  });

  const onSubmit = (values: z.infer<typeof bankDetailSchema>) => {
    // Ensure all required fields are present for BankDetail type
    addBankDetail({
      bankName: values.bankName,
      accountName: values.accountName,
      accountNumber: values.accountNumber,
      sortCode: values.sortCode,
      description: values.description,
    });
    form.reset();
  };

  const onStorySubmit = (values: z.infer<typeof storySchema>) => {
    const newStory = {
      title: values.title,
      content: values.content
    };
    setCoupleStory(newStory);
    localStorage.setItem("coupleStory", JSON.stringify(newStory));
    setIsEditingStory(false);
    toast.success("Your story has been saved!");
  };

  const handleAddComment = () => {
    commentForm.handleSubmit((values) => {
      const newCommentObj: Comment = {
        id: uuidv4(),
        name: values.name,
        text: values.text,
        date: new Date().toISOString()
      };
      setComments(prev => [...prev, newCommentObj]);
      commentForm.reset();
      toast.success("Comment added!");
    })();
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Convert the file to a data URL
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        const newImage: StoryImage = {
          id: uuidv4(),
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

  const shareStory = () => {
    const url = `${window.location.origin}/couple-story?preview=true`;
    navigator.clipboard.writeText(url);
    toast.success("Story URL copied to clipboard! Share it with your friends and family.");
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="container pt-24 flex-grow">
        <Tabs defaultValue="story" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="story">Our Story</TabsTrigger>
            <TabsTrigger value="wishlist">Our Wishlist</TabsTrigger>
            <TabsTrigger value="bank-details">Bank Details</TabsTrigger>
          </TabsList>
          
          <TabsContent value="story" className="space-y-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex justify-between items-center mb-4">
                  <div className="flex gap-2">
                    {!isPreviewMode && (
                      <Button 
                        variant={isEditingStory ? "default" : "outline"} 
                        onClick={() => setIsEditingStory(!isEditingStory)}
                      >
                        {isEditingStory ? "Cancel Editing" : "Edit Story"}
                      </Button>
                    )}
                    <Button 
                      variant={isPreviewMode ? "default" : "outline"} 
                      onClick={() => setIsPreviewMode(!isPreviewMode)}
                    >
                      {isPreviewMode ? "Exit Preview" : "Preview Story"}
                    </Button>
                  </div>
                  <Button variant="outline" onClick={shareStory}>
                    <Share2 className="mr-2 h-4 w-4" />
                    Share Story
                  </Button>
                </div>
                
                {isEditingStory && !isPreviewMode ? (
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
                ) : (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-2xl font-bold text-center mb-6">{coupleStory.title}</h2>
                      <div className="prose max-w-none">
                        {coupleStory.content.split('\n').map((paragraph, index) => (
                          <p key={index} className="mb-4 text-gray-700">{paragraph}</p>
                        ))}
                      </div>
                    </div>
                    
                    {storyImages.length > 0 && (
                      <div className="my-8">
                        <h3 className="text-xl font-medium mb-4">Our Moments</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {storyImages.map((image) => (
                            <div key={image.id} className="border rounded-md overflow-hidden shadow-sm">
                              <img
                                src={image.url}
                                alt={image.caption || "Story image"}
                                className="w-full h-48 object-cover"
                              />
                              {image.caption && (
                                <p className="text-sm p-2 text-center bg-gray-50">{image.caption}</p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    <div className="mt-8 border-t pt-6">
                      <h3 className="text-xl font-medium mb-4 flex items-center">
                        <MessageSquare className="mr-2 h-5 w-5" />
                        Comments ({comments.length})
                      </h3>
                      
                      {comments.length > 0 ? (
                        <div className="space-y-4 mb-6">
                          {comments.map((comment) => (
                            <div key={comment.id} className="bg-gray-50 p-4 rounded-md">
                              <div className="flex justify-between">
                                <h4 className="font-medium">{comment.name}</h4>
                                <span className="text-xs text-gray-500">
                                  {new Date(comment.date).toLocaleDateString()}
                                </span>
                              </div>
                              <p className="mt-1 text-gray-700">{comment.text}</p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-500 mb-4">No comments yet. Be the first to leave a comment!</p>
                      )}
                      
                      {!isEditingStory && (
                        <div className="bg-gray-50 p-4 rounded-md">
                          <h4 className="text-sm font-medium mb-2">Leave a Comment</h4>
                          <Form {...commentForm}>
                            <form className="space-y-3">
                              <FormField
                                control={commentForm.control}
                                name="name"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormControl>
                                      <Input placeholder="Your Name" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={commentForm.control}
                                name="text"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormControl>
                                      <Textarea
                                        placeholder="Write your comment..."
                                        className="resize-none"
                                        {...field}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <Button 
                                type="button" 
                                onClick={handleAddComment}
                                className="w-full"
                              >
                                <Send className="mr-2 h-4 w-4" />
                                Submit Comment
                              </Button>
                            </form>
                          </Form>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="wishlist" className="space-y-4">
            <Card>
              <CardContent className="space-y-2">
                {wishlistItems.map((item) => (
                  <WishlistItem
                    key={item.id}
                    item={item}
                    isPreviewMode={false}
                    isPublicView={false}
                  />
                ))}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="bank-details">
            <Card>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="bankName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Bank Name</FormLabel>
                          <FormControl>
                            <Input placeholder="GTBank" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="accountName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Account Name</FormLabel>
                          <FormControl>
                            <Input placeholder="John Doe" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="accountNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Account Number</FormLabel>
                          <FormControl>
                            <Input placeholder="0123456789" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="sortCode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Sort Code</FormLabel>
                          <FormControl>
                            <Input placeholder="123456" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Wedding gift contributions"
                              className="resize-none"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit">Add Bank Detail</Button>
                  </form>
                </Form>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="space-y-2">
                {bankDetails.map((detail, index) => (
                  <BankDetailCard
                    key={index}
                    detail={detail}
                    onRemove={() => removeBankDetail(index)}
                    index={index}
                    isEditable={true}
                  />
                ))}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      <Footer />
    </div>
  );
};

export default CoupleStory;
