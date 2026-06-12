
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Check, X, Gift, ExternalLink, Tag, UserX } from "lucide-react";
import { WishlistItem as WishlistItemType } from "@/context/types";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface WishlistItemProps {
  item: WishlistItemType;
  isPreviewMode: boolean;
  isPublicView: boolean;
  onPurchase?: (itemId: string, purchaserName: string, isAnonymous: boolean) => Promise<void> | void;
  onRemovePurchase?: (itemId: string) => Promise<void> | void;
}

const WishlistItem = ({
  item,
  isPreviewMode,
  isPublicView,
  onPurchase,
  onRemovePurchase,
}: WishlistItemProps) => {
  const [purchaserName, setPurchaserName] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [open, setOpen] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (purchaserName.trim()) {
      if (onPurchase) {
        await onPurchase(item.id, purchaserName, isAnonymous);
      }
      setPurchaserName("");
      setIsAnonymous(false);
      setOpen(false);
    }
  };
  
  const handleRemovePurchaser = () => {
    if (onRemovePurchase) {
      onRemovePurchase(item.id);
    }
  };
  
  const priorityColors = {
    high: "border-rose-200",
    medium: "border-amber-200",
    low: "border-blue-200"
  };
  
  const priorityBadgeColors = {
    high: "bg-rose-100 text-rose-800 hover:bg-rose-100",
    medium: "bg-amber-100 text-amber-800 hover:bg-amber-100",
    low: "bg-blue-100 text-blue-800 hover:bg-blue-100"
  };
  
  const priorityLabels = {
    high: "High Priority",
    medium: "Medium Priority",
    low: "Nice to Have"
  };
  
  const cardContent = (
    <CardContent className="p-0">
      {/* Image */}
      {item.imageUrl && (
        <div className="relative w-full h-40 bg-muted overflow-hidden">
          <img
            src={item.imageUrl}
            alt={item.name}
            className="w-full h-full object-cover"
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
          />
          {item.link && (
            <div className="absolute inset-0 bg-black/0 hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 hover:opacity-100">
              <ExternalLink className="h-6 w-6 text-white drop-shadow" />
            </div>
          )}
        </div>
      )}

      <div className="p-4 sm:p-5">
        <div className="flex justify-between items-start gap-2">
          <div className="space-y-1.5 flex-1 min-w-0">
            <h3 className={`text-base font-medium truncate ${item.purchasedBy ? "line-through text-muted-foreground" : ""}`}>
              {item.name}
            </h3>

            <div className="flex items-center gap-2 flex-wrap">
              <Badge
                variant="outline"
                className={cn("text-xs font-normal", priorityBadgeColors[item.priority])}
              >
                <Tag className="h-3 w-3 mr-1" />
                {priorityLabels[item.priority]}
              </Badge>
              {item.link && !item.imageUrl && (
                <span className="text-xs text-muted-foreground flex items-center gap-0.5">
                  <ExternalLink size={11} />
                  Buy link
                </span>
              )}
            </div>

            {item.purchasedBy && (
              <p className="text-sm text-primary/80 font-medium">
                {item.isAnonymous ? (
                  <span className="flex items-center gap-1">
                    <UserX className="h-3.5 w-3.5" />
                    Being purchased anonymously
                  </span>
                ) : (
                  <span className="flex items-center gap-1">
                    <Check className="h-3.5 w-3.5" />
                    Being purchased by: {item.purchasedBy}
                  </span>
                )}
              </p>
            )}
          </div>

          {item.price && (
            <Badge variant="secondary" className="text-sm font-medium shrink-0">
              {item.price}
            </Badge>
          )}
        </div>

        <div className="mt-4 flex items-center justify-between gap-2">
          {item.link && !item.imageUrl ? (
            <a
              href={item.link}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="text-sm text-primary/80 hover:underline flex items-center gap-1 hover:text-primary/60 transition-colors"
            >
              <ExternalLink size={14} />
              Buy now
            </a>
          ) : <div />}
          
          {!item.purchasedBy ? (
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="rounded-full">
                  <Gift className="mr-2 h-4 w-4" />
                  I'll get this!
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Confirm Gift Selection</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                  <p className="text-sm text-muted-foreground">
                    Great! Let the couple know who's getting the {item.name}.
                  </p>
                  <Input
                    placeholder="Your name or family name"
                    value={purchaserName}
                    onChange={(e) => setPurchaserName(e.target.value)}
                    required
                  />
                  <div className="flex items-center space-x-2">
                    <Switch 
                      id="anonymous-mode" 
                      checked={isAnonymous}
                      onCheckedChange={setIsAnonymous}
                    />
                    <Label htmlFor="anonymous-mode">Make my gift anonymous</Label>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit">
                      Confirm
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          ) : (
            item.purchasedBy && !isPublicView && (
              <Button 
                variant="outline" 
                size="sm" 
                className="rounded-full"
                onClick={handleRemovePurchaser}
              >
                <X className="mr-2 h-4 w-4" />
                Remove selection
              </Button>
            )
          )}
        </div>
      </div>
    </CardContent>
  );

  const cardClass = cn(
    "overflow-hidden hover:shadow-md transition-shadow border-l-4",
    item.purchasedBy ? "bg-muted/30" : "",
    priorityColors[item.priority],
    item.link ? "cursor-pointer" : ""
  );

  if (item.link && item.imageUrl) {
    return (
      <>
        <a href={item.link} target="_blank" rel="noopener noreferrer">
          <Card className={cardClass}>{cardContent}</Card>
        </a>
      </>
    );
  }

  return <Card className={cardClass}>{cardContent}</Card>;
};

export default WishlistItem;
