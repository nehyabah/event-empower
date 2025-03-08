
import { Heart, Calendar, MapPin, Clock, Wine, Gift, Sparkles, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import ImageGallery from "./ImageGallery";
import CommentsSection from "./CommentsSection";
import { StoryImage } from "./StoryEditor";
import { Comment } from "./CommentsSection";
import { useState } from "react";
import StoryCarousel from "./StoryCarousel";

interface StoryDisplayProps {
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
  comments: Comment[];
  setComments: React.Dispatch<React.SetStateAction<Comment[]>>;
  isEditingStory: boolean;
}

const StoryDisplay = ({
  coupleStory,
  storyImages,
  comments,
  setComments,
  isEditingStory,
}: StoryDisplayProps) => {
  const [selectedIcon, setSelectedIcon] = useState(coupleStory.selectedIcon || "heart");
  
  const shareStory = () => {
    const url = `${window.location.origin}/couple-story?preview=true`;
    navigator.clipboard.writeText(url);
    toast.success("Story URL copied to clipboard! Share it with your friends and family.");
  };

  const renderIcon = () => {
    switch (coupleStory.selectedIcon || "heart") {
      case "heart":
        return <Heart className="text-wedding-gold h-10 w-10" />;
      case "wine":
        return <Wine className="text-wedding-gold h-10 w-10" />;
      case "gift":
        return <Gift className="text-wedding-gold h-10 w-10" />;
      case "sparkles":
        return <Sparkles className="text-wedding-gold h-10 w-10" />;
      default:
        return <Heart className="text-wedding-gold h-10 w-10" />;
    }
  };

  return (
    <div className="space-y-8 relative">
      {/* Banner Section */}
      {coupleStory.bannerImage && (
        <div className="relative w-full h-80 md:h-96 rounded-lg overflow-hidden mb-8 shadow-xl">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/60"></div>
          <img 
            src={coupleStory.bannerImage} 
            alt="Wedding Banner" 
            className="w-full h-full object-cover"
          />
          {coupleStory.hashtag && (
            <div className="absolute bottom-8 left-0 right-0 text-center">
              <h2 className="text-3xl md:text-4xl font-serif text-white font-light tracking-wide backdrop-blur-sm bg-black/30 py-3 px-6 inline-block rounded">
                #{coupleStory.hashtag}
              </h2>
            </div>
          )}
        </div>
      )}

      <div className="text-center max-w-3xl mx-auto relative before:content-[''] before:absolute before:top-0 before:left-1/2 before:-translate-x-1/2 before:w-px before:h-16 before:bg-wedding-gold/30">
        {/* Selected Icon */}
        <div className="flex justify-center mb-4 relative">
          <div className="bg-white rounded-full p-4 shadow-md border border-wedding-gold/20">
            {renderIcon()}
          </div>
        </div>

        <h1 className="text-4xl md:text-5xl font-serif mb-8 text-wedding-gold font-light tracking-wide">
          {coupleStory.title}
        </h1>
        
        {/* Share button */}
        <div className="absolute top-0 right-0">
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-wedding-gold hover:text-wedding-gold/70 hover:bg-secondary/50"
            onClick={shareStory}
          >
            <Share2 className="mr-2 h-4 w-4" />
            Share
          </Button>
        </div>
        
        {/* Wedding Details */}
        <div className="flex flex-wrap items-center justify-center gap-8 mb-10 bg-secondary/10 py-6 px-4 rounded-lg shadow-inner border border-wedding-gold/10">
          {coupleStory.weddingDate && (
            <div className="flex flex-col items-center space-y-2">
              <Calendar className="text-wedding-gold h-6 w-6" />
              <span className="text-gray-700">{coupleStory.weddingDate}</span>
            </div>
          )}
          {coupleStory.weddingTime && (
            <div className="flex flex-col items-center space-y-2">
              <Clock className="text-wedding-gold h-6 w-6" />
              <span className="text-gray-700">{coupleStory.weddingTime}</span>
            </div>
          )}
          {coupleStory.venue && (
            <div className="flex flex-col items-center space-y-2">
              <MapPin className="text-wedding-gold h-6 w-6" />
              <span className="text-gray-700">{coupleStory.venue}</span>
            </div>
          )}
        </div>
        
        {/* Love Quote */}
        {coupleStory.loveQuote && (
          <div className="my-12 italic text-xl relative px-8 py-4 before:content-['\201C'] before:absolute before:-top-4 before:left-0 before:text-6xl before:text-wedding-gold/30 before:font-serif after:content-['\201D'] after:absolute after:-bottom-10 after:right-0 after:text-6xl after:text-wedding-gold/30 after:font-serif">
            <p className="text-gray-700 leading-relaxed">{coupleStory.loveQuote}</p>
          </div>
        )}
        
        {/* Main Story Content */}
        <div className="prose max-w-none">
          {coupleStory.content.split('\n').map((paragraph, index) => (
            <p key={index} className="mb-6 text-gray-700 text-lg leading-relaxed">{paragraph}</p>
          ))}
        </div>
      </div>
      
      {/* Bride and Groom Stories as Carousels */}
      {(coupleStory.brideStory || coupleStory.groomStory) && (
        <div className="space-y-10 my-16 max-w-5xl mx-auto">
          {coupleStory.brideStory && (
            <div className="transform transition-all duration-300 hover:translate-y-[-5px]">
              <StoryCarousel
                title="Bride's Story"
                content={coupleStory.brideStory}
                images={storyImages}
                storyType="bride"
                styleVariant="left"
              />
            </div>
          )}
          
          {coupleStory.groomStory && (
            <div className="transform transition-all duration-300 hover:translate-y-[-5px]">
              <StoryCarousel
                title="Groom's Story"
                content={coupleStory.groomStory}
                images={storyImages}
                storyType="groom"
                styleVariant="right"
              />
            </div>
          )}
        </div>
      )}
      
      <div className="my-16 relative before:content-[''] before:absolute before:top-0 before:left-1/2 before:-translate-x-1/2 before:w-px before:h-16 before:bg-wedding-gold/30">
        <h2 className="text-3xl font-serif text-center mb-10 text-wedding-gold font-light tracking-wide">Our Journey in Pictures</h2>
        <div className="bg-secondary/5 p-8 rounded-lg shadow-sm border border-wedding-gold/10">
          <ImageGallery images={storyImages} />
        </div>
      </div>
      
      {!isEditingStory && (
        <div className="mt-16 border-t border-wedding-gold/20 pt-8">
          <CommentsSection comments={comments} setComments={setComments} />
        </div>
      )}
    </div>
  );
};

export default StoryDisplay;
