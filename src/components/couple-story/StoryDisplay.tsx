
import { Heart, Calendar, MapPin, Clock, Wine, Gift, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import ImageGallery from "./ImageGallery";
import CommentsSection from "./CommentsSection";
import { StoryImage } from "./StoryEditor";
import { Comment } from "./CommentsSection";
import { useState } from "react";

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
    <div className="space-y-8">
      {/* Banner Section */}
      {coupleStory.bannerImage && (
        <div className="relative w-full h-80 md:h-96 rounded-lg overflow-hidden mb-8">
          <img 
            src={coupleStory.bannerImage} 
            alt="Wedding Banner" 
            className="w-full h-full object-cover"
          />
          {coupleStory.hashtag && (
            <div className="absolute bottom-8 left-0 right-0 text-center">
              <h2 className="text-3xl md:text-4xl font-serif text-white bg-black/30 py-2 px-4 inline-block rounded">
                #{coupleStory.hashtag}
              </h2>
            </div>
          )}
        </div>
      )}

      <div className="text-center max-w-3xl mx-auto">
        {/* Selected Icon */}
        <div className="flex justify-center mb-4">
          {renderIcon()}
        </div>

        <h1 className="text-4xl md:text-5xl font-serif mb-6 text-wedding-gold">{coupleStory.title}</h1>
        
        {/* Wedding Details */}
        <div className="flex flex-wrap items-center justify-center gap-6 mb-8">
          {coupleStory.weddingDate && (
            <div className="flex items-center space-x-2">
              <Calendar className="text-wedding-gold h-5 w-5" />
              <span className="text-gray-700">{coupleStory.weddingDate}</span>
            </div>
          )}
          {coupleStory.weddingTime && (
            <div className="flex items-center space-x-2">
              <Clock className="text-wedding-gold h-5 w-5" />
              <span className="text-gray-700">{coupleStory.weddingTime}</span>
            </div>
          )}
          {coupleStory.venue && (
            <div className="flex items-center space-x-2">
              <MapPin className="text-wedding-gold h-5 w-5" />
              <span className="text-gray-700">{coupleStory.venue}</span>
            </div>
          )}
        </div>
        
        {/* Love Quote */}
        {coupleStory.loveQuote && (
          <div className="my-8 italic text-xl border-l-4 border-wedding-gold pl-4 py-2">
            "{coupleStory.loveQuote}"
          </div>
        )}
        
        {/* Main Story Content */}
        <div className="prose max-w-none">
          {coupleStory.content.split('\n').map((paragraph, index) => (
            <p key={index} className="mb-6 text-gray-700 text-lg leading-relaxed">{paragraph}</p>
          ))}
        </div>
      </div>
      
      {/* Bride and Groom Stories */}
      {(coupleStory.brideStory || coupleStory.groomStory) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 my-12">
          {coupleStory.brideStory && (
            <div className="bg-secondary/30 p-6 rounded-lg">
              <h3 className="text-2xl font-serif text-wedding-gold mb-4 text-center">Bride's Story</h3>
              <div className="prose max-w-none">
                {coupleStory.brideStory.split('\n').map((paragraph, index) => (
                  <p key={index} className="mb-4 text-gray-700">{paragraph}</p>
                ))}
              </div>
            </div>
          )}
          {coupleStory.groomStory && (
            <div className="bg-secondary/30 p-6 rounded-lg">
              <h3 className="text-2xl font-serif text-wedding-gold mb-4 text-center">Groom's Story</h3>
              <div className="prose max-w-none">
                {coupleStory.groomStory.split('\n').map((paragraph, index) => (
                  <p key={index} className="mb-4 text-gray-700">{paragraph}</p>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
      
      <div className="my-12">
        <h2 className="text-2xl font-serif text-center mb-8 text-wedding-gold">Our Journey in Pictures</h2>
        <ImageGallery images={storyImages} />
      </div>
      
      {!isEditingStory && (
        <div className="mt-16 border-t pt-8">
          <CommentsSection comments={comments} setComments={setComments} />
        </div>
      )}
    </div>
  );
};

export default StoryDisplay;
