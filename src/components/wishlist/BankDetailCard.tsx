
import { BankDetail } from "@/context/types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy, Check, Building, CreditCard } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface BankDetailCardProps {
  detail: BankDetail;
  onRemove?: (index: number) => void;
  index: number;
  isEditable: boolean;
}

const BankDetailCard = ({ detail, onRemove, index, isEditable }: BankDetailCardProps) => {
  const [copied, setCopied] = useState<string | null>(null);

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopied(field);
    toast.success(`${field} copied to clipboard`);
    
    setTimeout(() => {
      setCopied(null);
    }, 2000);
  };

  return (
    <Card className="overflow-hidden border-none shadow-lg">
      <div className="bg-gradient-to-r from-primary/80 to-primary p-6 text-white flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Building className="h-5 w-5" />
          <h3 className="text-xl font-serif">{detail.bankName}</h3>
        </div>
        {isEditable && onRemove && (
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-white hover:bg-primary/80" 
            onClick={() => onRemove(index)}
          >
            Remove
          </Button>
        )}
      </div>
      <CardContent className="p-6 bg-white">
        {detail.description && (
          <p className="text-muted-foreground mb-4">{detail.description}</p>
        )}
        
        <div className="space-y-3">
          <div className="flex justify-between items-center p-3 bg-secondary/30 rounded-md">
            <div>
              <span className="text-xs text-muted-foreground">Account Name</span>
              <p className="font-medium">{detail.accountName}</p>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 w-8 p-0" 
              onClick={() => copyToClipboard(detail.accountName, "Account Name")}
            >
              {copied === "Account Name" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
          
          <div className="flex justify-between items-center p-3 bg-secondary/30 rounded-md">
            <div>
              <span className="text-xs text-muted-foreground">Account Number</span>
              <p className="font-medium">{detail.accountNumber}</p>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 w-8 p-0" 
              onClick={() => copyToClipboard(detail.accountNumber, "Account Number")}
            >
              {copied === "Account Number" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
          
          {detail.sortCode && (
            <div className="flex justify-between items-center p-3 bg-secondary/30 rounded-md">
              <div>
                <span className="text-xs text-muted-foreground">Sort Code</span>
                <p className="font-medium">{detail.sortCode}</p>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 w-8 p-0" 
                onClick={() => copyToClipboard(detail.sortCode, "Sort Code")}
              >
                {copied === "Sort Code" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          )}
          
          {detail.iban && (
            <div className="flex justify-between items-center p-3 bg-secondary/30 rounded-md">
              <div>
                <span className="text-xs text-muted-foreground">IBAN</span>
                <p className="font-medium">{detail.iban}</p>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 w-8 p-0" 
                onClick={() => copyToClipboard(detail.iban, "IBAN")}
              >
                {copied === "IBAN" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          )}
          
          {detail.swift && (
            <div className="flex justify-between items-center p-3 bg-secondary/30 rounded-md">
              <div>
                <span className="text-xs text-muted-foreground">SWIFT/BIC</span>
                <p className="font-medium">{detail.swift}</p>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 w-8 p-0" 
                onClick={() => copyToClipboard(detail.swift, "SWIFT/BIC")}
              >
                {copied === "SWIFT/BIC" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default BankDetailCard;
