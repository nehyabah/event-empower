
import { useEffect, useState } from 'react';
import { useSearchParams, useLocation } from 'react-router-dom';
import { Card, CardContent } from "@/components/ui/card";
import { Heart, Gift, Banknote, MessageSquare } from "lucide-react";
import StoryDisplay from "@/components/couple-story/StoryDisplay";
import CommentsSection, { Comment } from "@/components/couple-story/CommentsSection";
import { StoryImage } from "@/components/couple-story/StoryEditor";
import { useWishlist } from "@/context/useWishlist";
import WishlistItem from "@/components/wishlist/WishlistItem";
import BankDetailCard from "@/components/wishlist/BankDetailCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const SharedStoryPage = () => {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const { wishlistItems, bankDetails } = useWishlist();
  
  // Extract the couple ID from the URL if present
  const coupleId = searchParams.get('id') || 'default';

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
      
      if (savedStory) {
        setCoupleStory(JSON.parse(savedStory));
      } else {
        setCoupleStory({
          title: "Our Love Story",
          content: "Share your story here! How you met, your journey together, and your plans for the future.",
          hashtag: "OurWedding",
          weddingDate: "",
          weddingTime: "",
          venue: "Beautiful Wedding Venue",
          loveQuote: "My heart is yours to hold and cherish for the rest of my days.",
          selectedIcon: "heart",
          bannerImage: "https://images.unsplash.com/photo-1519741497674-611481863552?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80"
        });
      }
      
      if (savedImages) {
        setStoryImages(JSON.parse(savedImages));
      } else {
        // Sample images for demonstration
        setStoryImages([
          {
            id: "1",
            url: "https://images.unsplash.com/photo-1522673607200-164d1b6ce486?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
            caption: "Our first date",
            storyType: "general"
          },
          {
            id: "2",
            url: "https://images.unsplash.com/photo-1537633552985-df8429e8048b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
            caption: "The proposal",
            storyType: "general"
          },
          {
            id: "3",
            url: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2069&q=80",
            caption: "Our engagement",
            storyType: "general"
          }
        ]);
      }
      
      // If there are no comments, add some sample well wishes
      const parsedComments = savedComments ? JSON.parse(savedComments) : [];
      if (parsedComments.length === 0) {
        setComments([
          {
            id: "1",
            name: "Sarah & David",
            text: "Congratulations on your upcoming wedding! Wishing you a lifetime of love and happiness together. May your special day be everything you've dreamed of!",
            date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() // 5 days ago
          },
          {
            id: "2",
            name: "Michael & Jennifer",
            text: "So happy for you both! Your love story is truly inspiring. Wishing you a beautiful wedding day and a marriage filled with joy, laughter and endless adventures.",
            date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() // 3 days ago
          },
          {
            id: "3",
            name: "Aunt Mary",
            text: "My dearest niece and her wonderful partner, may God bless your union with love and prosperity. Looking forward to celebrating with you on your big day!",
            date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() // 1 day ago
          },
          {
            id: "4",
            name: "John & Emma",
            text: "We are so excited to celebrate this special day with you! Your love is an inspiration to us all. Wishing you all the happiness in the world.",
            date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() // 2 days ago
          },
          {
            id: "5",
            name: "Uncle Robert",
            text: "May your journey together be filled with love and laughter, and your hearts grow fonder with each passing day. Congratulations!",
            date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days ago
          }
        ]);
      } else {
        setComments(parsedComments);
      }
    } catch (error) {
      console.error("Error loading story data:", error);
      // Set default values if there's an error
      setCoupleStory({
        title: "Our Love Story",
        content: "Share your story here! How you met, your journey together, and your plans for the future.",
        hashtag: "OurWedding",
        weddingDate: "10/15/2023",
        weddingTime: "4:00 PM",
        venue: "Beautiful Wedding Venue",
        loveQuote: "My heart is yours to hold and cherish for the rest of my days.",
        selectedIcon: "heart",
        bannerImage: "https://images.unsplash.com/photo-1519741497674-611481863552?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80"
      });
      setStoryImages([
        {
          id: "1",
          url: "https://images.unsplash.com/photo-1522673607200-164d1b6ce486?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
          caption: "Our first date",
          storyType: "general"
        },
        {
          id: "2",
          url: "https://images.unsplash.com/photo-1537633552985-df8429e8048b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
          caption: "The proposal",
          storyType: "general"
        },
        {
          id: "3",
          url: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2069&q=80",
          caption: "Our engagement",
          storyType: "general"
        }
      ]);
      setComments([
        {
          id: "1",
          name: "Sarah & David",
          text: "Congratulations on your upcoming wedding! Wishing you a lifetime of love and happiness together. May your special day be everything you've dreamed of!",
          date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: "2",
          name: "Michael & Jennifer",
          text: "So happy for you both! Your love story is truly inspiring. Wishing you a beautiful wedding day and a marriage filled with joy, laughter and endless adventures.",
          date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: "3",
          name: "Aunt Mary",
          text: "My dearest niece and her wonderful partner, may God bless your union with love and prosperity. Looking forward to celebrating with you on your big day!",
          date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
        }
      ]);
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
                
                <div className="mt-4 max-w-2xl mx-auto">
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
