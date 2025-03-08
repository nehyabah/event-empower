
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Check, X, Gift, ExternalLink, Tag } from "lucide-react";
import { WishlistItem as WishlistItemType } from "@/context/types";
import { useWishlist } from "@/context/useWishlist";
import { cn } from "@/lib/utils";

interface WishlistItemProps {
  item: WishlistItemType;
  isPreviewMode: boolean;
  isPublicView: boolean;
}

const WishlistItem = ({ item, isPreviewMode, isPublicView }: WishlistItemProps) => {
  const { markItemAsPurchased, removeItemPurchaser } = useWishlist();
  const [purchaserName, setPurchaserName] = useState("");
  const [open, setOpen] = useState(false);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (purchaserName.trim()) {
      markItemAsPurchased(item.id, purchaserName);
      setPurchaserName("");
      setOpen(false);
    }
  };
  
  const handleRemovePurchaser = () => {
    removeItemPurchaser(item.id);
  };
  
  const priorityColors = {
    high: "bg-red-400",
    medium: "bg-amber-400",
    low: "bg-blue-400"
  };
  
  const priorityLabels = {
    high: "High Priority",
    medium: "Medium Priority",
    low: "Nice to Have"
  };
  
  return (
    <Card className={cn(
      "overflow-hidden hover:shadow-md transition-shadow border-t-4",
      item.purchasedBy ? "bg-muted/30" : "",
      priorityColors[item.priority]
    )}>
      <CardContent className="p-6">
        <div className="flex justify-between items-start">
          <div className="space-y-2">
            <h3 className={`text-lg font-medium ${item.purchasedBy ? "line-through text-muted-foreground" : ""}`}>
              {item.name}
            </h3>
            
            <div className="flex items-center gap-2">
              <Tag className="h-3 w-3 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">
                {priorityLabels[item.priority]}
              </span>
            </div>
            
            {item.purchasedBy && (
              <p className="text-sm text-primary font-medium mt-2">
                <Check className="inline-block h-4 w-4 mr-1" />
                Being purchased by: {item.purchasedBy}
              </p>
            )}
          </div>
          
          {item.price && (
            <span className="text-sm font-medium px-3 py-1 bg-secondary rounded-full">
              {item.price}
            </span>
          )}
        </div>
        
        <div className="mt-4 flex items-center justify-between">
          {item.link && (
            <a 
              href={item.link} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-sm text-primary hover:underline flex items-center gap-1 hover:text-primary/80 transition-colors"
            >
              <ExternalLink size={14} />
              View Item
            </a>
          )}
          
          {!item.link && <div />}
          
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
      </CardContent>
    </Card>
  );
};

export default WishlistItem;
