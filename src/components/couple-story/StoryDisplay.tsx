
import { Heart, Calendar, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import ImageGallery from "./ImageGallery";
import CommentsSection from "./CommentsSection";
import { StoryImage } from "./StoryEditor";
import { Comment } from "./CommentsSection";

interface StoryDisplayProps {
  coupleStory: {
    title: string;
    content: string;
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
  const shareStory = () => {
    const url = `${window.location.origin}/couple-story?preview=true`;
    navigator.clipboard.writeText(url);
    toast.success("Story URL copied to clipboard! Share it with your friends and family.");
  };

  return (
    <div className="space-y-8">
      <div className="text-center max-w-3xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-serif mb-6 text-wedding-gold">{coupleStory.title}</h1>
        
        <div className="flex items-center justify-center space-x-6 mb-8">
          <div className="flex items-center space-x-2">
            <Heart className="text-wedding-gold h-5 w-5" />
            <span className="text-gray-700">Love Journey</span>
          </div>
          <div className="flex items-center space-x-2">
            <Calendar className="text-wedding-gold h-5 w-5" />
            <span className="text-gray-700">Our Date</span>
          </div>
          <div className="flex items-center space-x-2">
            <MapPin className="text-wedding-gold h-5 w-5" />
            <span className="text-gray-700">Our Venue</span>
          </div>
        </div>
        
        <div className="prose max-w-none">
          {coupleStory.content.split('\n').map((paragraph, index) => (
            <p key={index} className="mb-6 text-gray-700 text-lg leading-relaxed">{paragraph}</p>
          ))}
        </div>
      </div>
      
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
