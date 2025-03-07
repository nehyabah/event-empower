
import { Share2 } from "lucide-react";
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
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-center mb-6">{coupleStory.title}</h2>
        <div className="prose max-w-none">
          {coupleStory.content.split('\n').map((paragraph, index) => (
            <p key={index} className="mb-4 text-gray-700">{paragraph}</p>
          ))}
        </div>
      </div>
      
      <ImageGallery images={storyImages} />
      
      {!isEditingStory && (
        <CommentsSection comments={comments} setComments={setComments} />
      )}
    </div>
  );
};

export default StoryDisplay;
