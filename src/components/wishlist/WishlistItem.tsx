
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Check, X, Gift, ExternalLink } from "lucide-react";
import { useTodo, WishlistItem as WishlistItemType } from "@/context/TodoContext";

interface WishlistItemProps {
  item: WishlistItemType;
  isPreviewMode: boolean;
  isPublicView: boolean;
}

const WishlistItem = ({ item, isPreviewMode, isPublicView }: WishlistItemProps) => {
  const { markItemAsPurchased, removeItemPurchaser } = useTodo();
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
  
  return (
    <Card className={`overflow-hidden hover:shadow-md transition-shadow ${item.purchasedBy ? "bg-gray-50" : ""}`}>
      <div className={`h-2 ${
        priorityColors[item.priority]
      }`}></div>
      <CardContent className="p-6">
        <div className="flex justify-between items-start">
          <div className="space-y-2">
            <h3 className={`text-lg font-medium ${item.purchasedBy ? "line-through text-muted-foreground" : ""}`}>
              {item.name}
            </h3>
            
            {item.purchasedBy && (
              <p className="text-sm text-primary">
                Being purchased by: {item.purchasedBy}
              </p>
            )}
          </div>
          
          {item.price && (
            <span className="text-sm font-medium px-2 py-1 bg-secondary rounded-full">
              {item.price}
            </span>
          )}
        </div>
        
        <div className="flex gap-2 mt-4">
          {item.link && (
            <a 
              href={item.link} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-sm text-primary hover:underline flex items-center gap-1"
            >
              <ExternalLink size={14} />
              View Item
            </a>
          )}
        </div>
        
        <div className="mt-4">
          {!item.purchasedBy ? (
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="w-full">
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
            item.purchasedBy && (
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full text-muted-foreground"
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
