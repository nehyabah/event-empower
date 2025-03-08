
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import StoryDisplay from "@/components/couple-story/StoryDisplay";
import CommentsSection, { Comment } from "@/components/couple-story/CommentsSection";
import { StoryImage } from "@/components/couple-story/StoryEditor";
import { useWishlist } from "@/context/useWishlist";
import WishlistItem from "@/components/wishlist/WishlistItem";
import BankDetailCard from "@/components/wishlist/BankDetailCard";
import { useLocation } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Heart, Gift, Banknote, MessageSquare } from "lucide-react";

const SharedStoryPage = () => {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const { wishlistItems, bankDetails } = useWishlist();
  
  // Extract the couple ID from the URL if present
  const coupleId = searchParams.get('id') || 'default';

  // Parse story data from URL parameters or use default values
  const [coupleStory, setCoupleStory] = useState<any>(null);
  const [storyImages, setStoryImages] = useState<StoryImage[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // In a real app, we would load this data from a server based on the coupleId
    // For now, we'll load from localStorage as it's a demo
    try {
      const savedStory = localStorage.getItem("coupleStory");
      const savedImages = localStorage.getItem("storyImages");
      const savedComments = localStorage.getItem("storyComments");
      
      setCoupleStory(savedStory ? JSON.parse(savedStory) : {
        title: "Our Love Story",
        content: "Share your story here! How you met, your journey together, and your plans for the future.",
        hashtag: "OurWedding",
        weddingDate: "",
        weddingTime: "",
        venue: "Beautiful Wedding Venue",
        loveQuote: "My heart is yours to hold and cherish for the rest of my days.",
        selectedIcon: "heart"
      });
      
      setStoryImages(savedImages ? JSON.parse(savedImages) : []);
      setComments(savedComments ? JSON.parse(savedComments) : []);
    } catch (error) {
      console.error("Error loading story data:", error);
    } finally {
      setIsLoading(false);
    }
  }, [coupleId]);
  
  if (isLoading || !coupleStory) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <Heart className="h-12 w-12 text-wedding-gold animate-pulse-soft" />
          <p className="mt-4 text-muted-foreground">Loading story...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Simple header with couple's hashtag or name */}
      <header className="py-4 border-b border-wedding-gold/10">
        <div className="container">
          <div className="flex items-center justify-center">
            <Heart className="h-5 w-5 text-wedding-gold mr-2" />
            <h2 className="font-serif text-xl">
              {coupleStory.hashtag ? `#${coupleStory.hashtag}` : "Our Wedding Story"}
            </h2>
          </div>
        </div>
      </header>
      
      <div className="container py-10">
        <Tabs defaultValue="story" className="w-full max-w-4xl mx-auto">
          <TabsList className="grid w-full grid-cols-4 mb-8">
            <TabsTrigger value="story" className="text-base">
              <Heart className="h-4 w-4 mr-2" />
              Our Story
            </TabsTrigger>
            <TabsTrigger value="wishlist" className="text-base">
              <Gift className="h-4 w-4 mr-2" />
              Wishlist
            </TabsTrigger>
            <TabsTrigger value="cash-gift" className="text-base">
              <Banknote className="h-4 w-4 mr-2" />
              Cash Gift
            </TabsTrigger>
            <TabsTrigger value="well-wishes" className="text-base">
              <MessageSquare className="h-4 w-4 mr-2" />
              Well Wishes
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="story">
            <Card className="border-wedding-gold/20 shadow-md">
              <CardContent className="pt-6">
                <StoryDisplay 
                  coupleStory={coupleStory}
                  storyImages={storyImages}
                  comments={comments}
                  setComments={setComments}
                  isEditingStory={false}
                  isSharedView={true}
                />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="wishlist">
            <Card className="border-wedding-gold/20 shadow-md">
              <CardContent className="pt-6">
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-serif text-wedding-gold mb-2">Our Wishlist</h2>
                  <p className="text-muted-foreground">Items we'd love to receive for our new journey together</p>
                </div>
                
                <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                  {wishlistItems.map((item) => (
                    <WishlistItem
                      key={item.id}
                      item={item}
                      isPreviewMode={false}
                      isPublicView={true}
                    />
                  ))}
                </div>
                
                {wishlistItems.length === 0 && (
                  <div className="py-10 text-center">
                    <p className="text-muted-foreground">No wishlist items added yet.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="cash-gift">
            <Card className="border-wedding-gold/20 shadow-md">
              <CardContent className="pt-6">
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-serif text-wedding-gold mb-2">Cash Gift</h2>
                  <p className="text-muted-foreground">Your contribution helps us build our future together</p>
                </div>
                
                {bankDetails.length > 0 ? (
                  <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2">
                    {bankDetails.map((detail, index) => (
                      <BankDetailCard
                        key={index}
                        detail={detail}
                        index={index}
                        isEditable={false}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="py-10 text-center">
                    <p className="text-muted-foreground">No bank details available yet.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="well-wishes">
            <Card className="border-wedding-gold/20 shadow-md">
              <CardContent className="pt-6">
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-serif text-wedding-gold mb-2">Leave Your Well Wishes</h2>
                  <p className="text-muted-foreground">Share your thoughts and blessings with us</p>
                </div>
                
                {/* Using the existing CommentsSection component but in standalone mode */}
                <div className="mt-4 max-w-2xl mx-auto">
                  <div id="comments-section" className="scroll-mt-20">
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
                  </div>
                  
                  {/* Using the existing CommentsSection but imported directly */}
                  <CommentsSection
                    comments={comments}
                    setComments={setComments}
                    isSharedView={true}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      
      <footer className="py-4 text-center text-sm text-muted-foreground border-t border-wedding-gold/10">
        <p>Created with ❤️ on Planr</p>
      </footer>
    </div>
  );
};

export default SharedStoryPage;
