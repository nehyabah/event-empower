
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
  onAddComment?: (input: { name: string; text: string }) => Promise<Comment>;
  cardsOnly?: boolean;
  showHeader?: boolean;
  showForm?: boolean;
}

const CommentsSection = ({
  comments,
  setComments,
  isSharedView = false,
  onAddComment,
  cardsOnly = false,
  showHeader = true,
  showForm = true,
}: CommentsSectionProps) => {
  const resolvedShowHeader = cardsOnly ? false : showHeader;
  const resolvedShowForm = cardsOnly ? false : showForm;
  // Comment form
  const commentForm = useForm<z.infer<typeof commentSchema>>({
    resolver: zodResolver(commentSchema),
    defaultValues: {
      name: "",
      text: ""
    },
  });

  const handleAddComment = () => {
    commentForm.handleSubmit(async (values) => {
      try {
        let newCommentObj: Comment;
        if (onAddComment) {
          newCommentObj = await onAddComment({ name: values.name, text: values.text });
        } else {
          newCommentObj = {
            id: crypto.randomUUID(),
            name: values.name,
            text: values.text,
            date: new Date().toISOString(),
          };
        }

        setComments((prev) => [...prev, newCommentObj]);
        commentForm.reset();
        toast.success(isSharedView ? "Thank you for your well wishes!" : "Comment added!");
      } catch (error) {
        toast.error("Failed to add comment");
        console.error("Failed to add comment:", error);
      }
    })();
  };

  return (
    <div className={`${isSharedView ? "" : "mt-8 border-t pt-6"}`}>
      {resolvedShowHeader && (
        <h3 className="text-xl font-medium mb-4 flex items-center">
          <MessageSquare className="mr-2 h-5 w-5" />
          {isSharedView ? `Well Wishes (${comments.length})` : `Comments (${comments.length})`}
        </h3>
      )}
      
      {comments.length > 0 ? (
        <div className="rounded-3xl border border-black/5 bg-white/70 p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs uppercase tracking-[0.3em] text-gray-400">Well Wishes</p>
            <p className="text-xs text-gray-400">{comments.length} notes</p>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-4 pr-1 snap-x snap-mandatory">
            {comments.map((comment) => (
              <div
                key={comment.id}
                className="snap-start min-w-[240px] max-w-[240px] rounded-2xl border border-black/5 bg-white px-5 py-6 shadow-md transition-transform duration-300 hover:-translate-y-1"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-black/5 text-xs font-semibold text-gray-700">
                    {(comment.name || "G").slice(0, 1).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900">{comment.name}</h4>
                    <span className="text-[11px] text-gray-400">
                      {new Date(comment.date).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <p className="mt-4 text-sm leading-relaxed text-gray-700">{comment.text}</p>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <p className="text-gray-500 mb-4">
          {isSharedView 
            ? "No well wishes yet. Be the first to send your blessings!" 
            : "No comments yet. Be the first to leave a comment!"}
        </p>
      )}

      {resolvedShowForm && (
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
      )}
    </div>
  );
};

export default CommentsSection;
