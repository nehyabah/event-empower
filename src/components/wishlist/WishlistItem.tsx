
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
  
  return (
    <Card className={cn(
      "overflow-hidden hover:shadow-md transition-shadow border-l-4",
      item.purchasedBy ? "bg-muted/30" : "",
      priorityColors[item.priority]
    )}>
      <CardContent className="p-6">
        <div className="flex justify-between items-start">
          <div className="space-y-2 flex-1">
            <h3 className={`text-lg font-medium ${item.purchasedBy ? "line-through text-muted-foreground" : ""}`}>
              {item.name}
            </h3>
            
            <div className="flex items-center gap-2">
              <Badge 
                variant="outline" 
                className={cn("text-xs font-normal", priorityBadgeColors[item.priority])}
              >
                <Tag className="h-3 w-3 mr-1" />
                {priorityLabels[item.priority]}
              </Badge>
            </div>
            
            {item.purchasedBy && (
              <p className="text-sm text-primary/80 font-medium mt-2">
                <Check className="inline-block h-4 w-4 mr-1" />
                {item.isAnonymous ? (
                  <>
                    <UserX className="inline-block h-4 w-4 mr-1" />
                    Being purchased anonymously
                  </>
                ) : (
                  <>Being purchased by: {item.purchasedBy}</>
                )}
              </p>
            )}
          </div>
          
          {item.price && (
            <Badge variant="secondary" className="text-sm font-medium">
              {item.price}
            </Badge>
          )}
        </div>
        
        <div className="mt-4 flex items-center justify-between">
          {item.link && (
            <a 
              href={item.link} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-sm text-primary/80 hover:underline flex items-center gap-1 hover:text-primary/60 transition-colors"
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
      </CardContent>
    </Card>
  );
};

export default WishlistItem;
