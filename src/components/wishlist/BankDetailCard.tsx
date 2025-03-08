
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import { Copy, Trash2 } from "lucide-react";
import { BankDetail } from "@/context/types";

interface BankDetailCardProps {
  detail: BankDetail;
  index: number;
  onRemove?: () => void;
  isEditable: boolean;
}

const BankDetailCard = ({ detail, index, onRemove, isEditable }: BankDetailCardProps) => {
  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <CardTitle className="text-lg flex items-center justify-between">
          <div className="flex items-baseline gap-2">
            {detail.bankName}
            {index === 0 && isEditable && (
              <span className="text-xs text-muted-foreground bg-secondary px-2 py-0.5 rounded">Default</span>
            )}
          </div>
          
          {isEditable && onRemove && (
            <Button variant="ghost" size="sm" onClick={onRemove} className="text-destructive hover:text-destructive hover:bg-destructive/10">
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </CardTitle>
        <CardDescription>
          {detail.description || "Cash gift contribution"}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-sm font-medium">Account Name</p>
          <div className="flex justify-between items-center mt-1">
            <p className="text-sm">{detail.accountName}</p>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => copyToClipboard(detail.accountName, "Account name")}
            >
              <Copy className="h-3 w-3" />
            </Button>
          </div>
        </div>
        
        <div>
          <p className="text-sm font-medium">Account Number</p>
          <div className="flex justify-between items-center mt-1">
            <p className="text-sm">{detail.accountNumber}</p>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => copyToClipboard(detail.accountNumber, "Account number")}
            >
              <Copy className="h-3 w-3" />
            </Button>
          </div>
        </div>
        
        <div>
          <p className="text-sm font-medium">Sort Code</p>
          <div className="flex justify-between items-center mt-1">
            <p className="text-sm">{detail.sortCode}</p>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => copyToClipboard(detail.sortCode, "Sort code")}
            >
              <Copy className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          variant="outline" 
          className="w-full"
          onClick={() => {
            const details = `Bank: ${detail.bankName}\nAccount Name: ${detail.accountName}\nAccount Number: ${detail.accountNumber}\nSort Code: ${detail.sortCode}`;
            copyToClipboard(details, "Bank details");
          }}
        >
          <Copy className="mr-2 h-4 w-4" />
          Copy All Details
        </Button>
      </CardFooter>
    </Card>
  );
};

export default BankDetailCard;
