
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/home/Footer";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import WishlistItem from "@/components/wishlist/WishlistItem";
import BankDetailCard from "@/components/wishlist/BankDetailCard";
import { toast } from "sonner";
import { useWishlist } from "@/context/useWishlist";
import { Share2, Plus, X, Gift, ExternalLink } from "lucide-react";

// Import the new components
import StoryEditor, { StoryImage } from "@/components/couple-story/StoryEditor";
import StoryDisplay from "@/components/couple-story/StoryDisplay";
import BankDetailsForm from "@/components/couple-story/BankDetailsForm";
import { Comment } from "@/components/couple-story/CommentsSection";

const CoupleStory = () => {
  const navigate = useNavigate();
  const isAuthenticated = localStorage.getItem("authenticated") === "true";
  const { wishlistItems, bankDetails, removeBankDetail, addWishlistItem } = useWishlist();
  
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
  const [coupleStory, setCoupleStory] = useState(() => {
    const savedStory = localStorage.getItem("coupleStory");
    return savedStory ? JSON.parse(savedStory) : {
      title: "Our Love Story",
      content: "Share your story here! How you met, your journey together, and your plans for the future."
    };
  });
  
  // State for bank details form visibility
  const [showBankForm, setShowBankForm] = useState(false);
  
  // State for wishlist visibility
  const [showWishlistForm, setShowWishlistForm] = useState(false);

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
                  <StoryEditor 
                    coupleStory={coupleStory}
                    storyImages={storyImages}
                    setStoryImages={setStoryImages}
                    setCoupleStory={setCoupleStory}
                    onStoryUpdated={() => setIsEditingStory(false)}
                  />
                ) : (
                  <StoryDisplay 
                    coupleStory={coupleStory}
                    storyImages={storyImages}
                    comments={comments}
                    setComments={setComments}
                    isEditingStory={isEditingStory}
                  />
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="wishlist" className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-medium">Gift Registry</h2>
                <p className="text-muted-foreground">Items we'd love to receive for our new journey together</p>
              </div>
              <Button className="bg-wedding-gold hover:bg-wedding-gold/90 text-white">
                <Gift className="mr-2 h-4 w-4" />
                View Public Registry
              </Button>
            </div>

            <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {wishlistItems.map((item) => (
                <WishlistItem
                  key={item.id}
                  item={item}
                  isPreviewMode={false}
                  isPublicView={false}
                />
              ))}
            </div>

            {wishlistItems.length === 0 && (
              <Card className="border-dashed border-2">
                <CardContent className="py-10 text-center">
                  <Gift className="mx-auto h-10 w-10 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No wishlist items added yet.</p>
                  <p className="text-sm text-muted-foreground mt-1">Add your first item to start building your gift registry.</p>
                </CardContent>
              </Card>
            )}

            <Card className="bg-secondary/40">
              <CardHeader>
                <CardTitle className="text-lg">Need Gift Ideas?</CardTitle>
                <CardDescription>
                  Consider adding some of these popular items to your registry
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-2 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                <div className="p-2 border bg-background rounded-md hover:bg-accent/30 transition-colors">
                  <p className="font-medium">Kitchen Equipment</p>
                  <p className="text-sm text-muted-foreground">Blender, Mixer, Coffee Machine</p>
                </div>
                <div className="p-2 border bg-background rounded-md hover:bg-accent/30 transition-colors">
                  <p className="font-medium">Home Decor</p>
                  <p className="text-sm text-muted-foreground">Picture Frames, Cushions, Lamps</p>
                </div>
                <div className="p-2 border bg-background rounded-md hover:bg-accent/30 transition-colors">
                  <p className="font-medium">Home Essentials</p>
                  <p className="text-sm text-muted-foreground">Bedding, Towels, Dinner Set</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="bank-details" className="space-y-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-medium">Your Bank Details</h2>
              <Button
                onClick={() => setShowBankForm(!showBankForm)}
                variant="outline"
                size="sm"
              >
                {showBankForm ? (
                  <>
                    <X className="mr-2 h-4 w-4" />
                    Cancel
                  </>
                ) : (
                  <>
                    <Plus className="mr-2 h-4 w-4" />
                    Add New Bank Detail
                  </>
                )}
              </Button>
            </div>
            
            {showBankForm && (
              <Card className="mb-6">
                <CardContent className="pt-6">
                  <BankDetailsForm onSuccess={() => setShowBankForm(false)} />
                </CardContent>
              </Card>
            )}
            
            {bankDetails.length > 0 ? (
              <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2">
                {bankDetails.map((detail, index) => (
                  <BankDetailCard
                    key={index}
                    detail={detail}
                    onRemove={() => removeBankDetail(index)}
                    index={index}
                    isEditable={true}
                  />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="py-8 text-center">
                  <p className="text-muted-foreground">
                    No bank details added yet. Add your first bank detail to receive gifts.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
      <Footer />
    </div>
  );
};

export default CoupleStory;
