
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { FileText } from "lucide-react";

interface InvitationPreviewProps {
  content: string;
  style: string;
  isLoading: boolean;
}

const InvitationPreview = ({ content, style, isLoading }: InvitationPreviewProps) => {
  // Define style variations based on the selected style
  const getStyleClasses = () => {
    switch (style) {
      case "elegant":
        return "font-serif text-center bg-[#f8f5f0] text-[#3a3a3a] border-[#d4c1a9]";
      case "casual":
        return "font-sans text-left bg-[#e8f4f8] text-[#2c5777] border-[#a1c6e7]";
      case "formal":
        return "font-serif text-center bg-[#f5f5f5] text-[#1a1a1a] border-[#c9c9c9]";
      default:
        return "font-serif text-center bg-[#f8f5f0] text-[#3a3a3a] border-[#d4c1a9]";
    }
  };

  if (isLoading) {
    return (
      <Card className="h-full flex flex-col justify-center">
        <CardContent className="pt-6 flex flex-col items-center gap-4">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-12 w-3/4" />
        </CardContent>
      </Card>
    );
  }

  if (!content) {
    return (
      <Card className="h-full flex flex-col justify-center">
        <CardContent className="pt-6 flex flex-col items-center gap-4 text-muted-foreground">
          <FileText className="h-12 w-12 opacity-50" />
          <p className="text-center">Fill out the form and generate an invitation to preview it here.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`h-full border-2 ${getStyleClasses()}`}>
      <CardContent className="pt-6 p-8 flex flex-col items-center justify-center min-h-[300px]">
        <div className="max-w-md w-full mx-auto">
          {content.split('\n').map((line, index) => (
            line.trim() ? <p key={index} className="my-2">{line}</p> : <div key={index} className="my-4" />
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default InvitationPreview;
