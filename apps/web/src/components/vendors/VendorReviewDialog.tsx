import { useState, useEffect } from "react";
import { Star, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { userService, VendorReview } from "@/services/api/userService";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vendorProfileId: string;
  vendorName: string;
  existingReview?: VendorReview | null;
  onSaved?: (review: VendorReview) => void;
  onDeleted?: () => void;
}

const StarInput = ({ value, onChange }: { value: number; onChange: (v: number) => void }) => {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex items-center gap-1.5">
      {[1, 2, 3, 4, 5].map((n) => {
        const active = (hover || value) >= n;
        return (
          <button
            key={n}
            type="button"
            onMouseEnter={() => setHover(n)}
            onMouseLeave={() => setHover(0)}
            onClick={() => onChange(n)}
            className="transition-transform hover:scale-110"
            aria-label={`${n} star${n > 1 ? "s" : ""}`}
          >
            <Star
              className={`w-8 h-8 ${active ? "fill-amber-400 text-amber-400" : "text-muted-foreground/40"}`}
            />
          </button>
        );
      })}
    </div>
  );
};

const VendorReviewDialog = ({
  open, onOpenChange, vendorProfileId, vendorName, existingReview, onSaved, onDeleted,
}: Props) => {
  const [rating, setRating] = useState(existingReview?.rating || 0);
  const [title, setTitle] = useState(existingReview?.title || "");
  const [comment, setComment] = useState(existingReview?.comment || "");
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Sync when opening for a different vendor / existing review
  useEffect(() => {
    if (open) {
      setRating(existingReview?.rating || 0);
      setTitle(existingReview?.title || "");
      setComment(existingReview?.comment || "");
    }
  }, [open, existingReview]);

  const handleSubmit = async () => {
    if (rating < 1) {
      toast.error("Please select a star rating");
      return;
    }
    setSubmitting(true);
    try {
      const review = await userService.submitVendorReview(vendorProfileId, {
        rating,
        title: title.trim() || null,
        comment: comment.trim() || null,
      });
      toast.success(existingReview ? "Review updated" : "Thanks for your review!");
      onSaved?.(review);
      onOpenChange(false);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to submit review");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await userService.deleteVendorReview(vendorProfileId);
      toast.success("Review removed");
      onDeleted?.();
      onOpenChange(false);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to remove review");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{existingReview ? "Edit your review" : "Rate this vendor"}</DialogTitle>
          <DialogDescription>
            Share your experience with <span className="font-medium text-foreground">{vendorName}</span>.
            Your review will appear on their public profile.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-2">
          <div className="flex flex-col items-center gap-2">
            <StarInput value={rating} onChange={setRating} />
            <span className="text-xs text-muted-foreground">
              {rating ? `${rating} out of 5` : "Tap to rate"}
            </span>
          </div>

          <div className="space-y-2">
            <Label htmlFor="review-title">Title <span className="text-muted-foreground font-normal">(optional)</span></Label>
            <Input
              id="review-title"
              placeholder="e.g. Made our day unforgettable"
              value={title}
              maxLength={150}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="review-comment">Review <span className="text-muted-foreground font-normal">(optional)</span></Label>
            <Textarea
              id="review-comment"
              placeholder="What was it like working with them? Would you recommend them?"
              rows={4}
              value={comment}
              maxLength={2000}
              onChange={(e) => setComment(e.target.value)}
              className="resize-none"
            />
          </div>
        </div>

        <div className="flex items-center justify-between gap-2">
          {existingReview ? (
            <Button variant="ghost" size="sm" onClick={handleDelete} disabled={deleting || submitting}
              className="text-destructive hover:text-destructive hover:bg-destructive/10">
              {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Trash2 className="w-4 h-4 mr-1.5" />Remove</>}
            </Button>
          ) : <span />}
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={submitting || deleting}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={submitting || deleting}>
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : existingReview ? "Save changes" : "Submit review"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default VendorReviewDialog;
