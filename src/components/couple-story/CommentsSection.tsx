
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
  FormMessage,
} from "@/components/ui/form";
import { MessageSquare, Send } from "lucide-react";
import { toast } from "sonner";

// Comment type
export type Comment = {
  id: string;
  name: string;
  text: string;
  date: string;
};

// Comment schema
const commentSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  text: z.string().min(1, { message: "Comment cannot be empty" }),
});

interface CommentsSectionProps {
  comments: Comment[];
  setComments: React.Dispatch<React.SetStateAction<Comment[]>>;
  isSharedView?: boolean;
}

const CommentsSection = ({ comments, setComments, isSharedView = false }: CommentsSectionProps) => {
  // Comment form
  const commentForm = useForm<z.infer<typeof commentSchema>>({
    resolver: zodResolver(commentSchema),
    defaultValues: {
      name: "",
      text: ""
    },
  });

  const handleAddComment = () => {
    commentForm.handleSubmit((values) => {
      const newCommentObj: Comment = {
        id: crypto.randomUUID(),
        name: values.name,
        text: values.text,
        date: new Date().toISOString()
      };
      setComments(prev => [...prev, newCommentObj]);
      commentForm.reset();
      toast.success(isSharedView ? "Thank you for your well wishes!" : "Comment added!");
    })();
  };

  return (
    <div className={`${isSharedView ? "" : "mt-8 border-t pt-6"}`}>
      <h3 className="text-xl font-medium mb-4 flex items-center">
        <MessageSquare className="mr-2 h-5 w-5" />
        {isSharedView ? `Well Wishes (${comments.length})` : `Comments (${comments.length})`}
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
        <p className="text-gray-500 mb-4">
          {isSharedView 
            ? "No well wishes yet. Be the first to send your blessings!" 
            : "No comments yet. Be the first to leave a comment!"}
        </p>
      )}
      
      <div className="bg-gray-50 p-4 rounded-md">
        <h4 className="text-sm font-medium mb-2">
          {isSharedView ? "Send Your Blessings" : "Leave a Comment"}
        </h4>
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
                      placeholder={isSharedView ? "Write your well wishes..." : "Write your comment..."}
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
              {isSharedView ? "Send Well Wishes" : "Submit Comment"}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default CommentsSection;
