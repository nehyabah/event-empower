
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, FileText, Wand2, Share2, Save, Download } from "lucide-react";
import { useForm, FormProvider } from "react-hook-form";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { toast } from "sonner";
import InvitationPreview from "./InvitationPreview";

type InvitationFormValues = {
  names: string;
  date: string;
  venue: string;
  details: string;
  style: string;
};

const samplePrompt = `Create a wedding invitation for Sarah & Michael, getting married on June 15, 2024 at Sunset Gardens Resort. The ceremony begins at 4:00 PM followed by a reception. Please RSVP by May 1st.`;

const InvitationGenerator = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState("");
  const [invitationStyle, setInvitationStyle] = useState("elegant");
  
  const form = useForm<InvitationFormValues>({
    defaultValues: {
      names: "",
      date: "",
      venue: "",
      details: "",
      style: "elegant"
    },
  });

  const generateInvitation = async (data: InvitationFormValues) => {
    setIsGenerating(true);
    
    try {
      // In a real implementation, this would call an AI API
      // For demo purposes, we'll simulate an API call with a timeout
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const styles = {
        elegant: `We joyfully request the honor of your presence as\n\n${data.names}\n\njoin in marriage\n\n${data.date}\n\n${data.venue}\n\n${data.details}`,
        casual: `Join us for the wedding of\n${data.names}\nWe're tying the knot on ${data.date} at ${data.venue}\n\n${data.details}`,
        formal: `${data.names}\nrequest the honor of your presence\nat their marriage\n\n${data.date}\n\n${data.venue}\n\n${data.details}`
      };
      
      setGeneratedContent(styles[data.style as keyof typeof styles]);
      toast.success("Invitation generated successfully!");
    } catch (error) {
      toast.error("Failed to generate invitation. Please try again.");
      console.error("Error generating invitation:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleStyleChange = (style: string) => {
    setInvitationStyle(style);
    form.setValue("style", style);
  };

  const handleSave = () => {
    // In a real app, this would save to a database
    toast.success("Invitation saved to your collection");
  };

  const handleShare = () => {
    // In a real app, this would create a shareable link
    navigator.clipboard.writeText("https://your-wedding-app.com/invitation/123456");
    toast.success("Shareable link copied to clipboard!");
  };

  const handleDownload = () => {
    // In a real app, this would generate a PDF or image file
    toast.success("Invitation downloaded");
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card className="h-fit">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wand2 className="h-5 w-5" />
            AI Invitation Generator
          </CardTitle>
        </CardHeader>
        <CardContent>
          <FormProvider {...form}>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(generateInvitation)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="names"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Couple Names</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Sarah & Michael" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Wedding Date & Time</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. June 15, 2024 at 4:00 PM" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="venue"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Venue</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Sunset Gardens Resort" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="details"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Additional Details</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="e.g. Reception to follow. Please RSVP by May 1st." 
                          className="min-h-24" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="space-y-2">
                  <Label>Invitation Style</Label>
                  <div className="grid grid-cols-3 gap-2">
                    <Button 
                      type="button"
                      variant={invitationStyle === "elegant" ? "default" : "outline"} 
                      onClick={() => handleStyleChange("elegant")}
                    >
                      Elegant
                    </Button>
                    <Button 
                      type="button"
                      variant={invitationStyle === "casual" ? "default" : "outline"} 
                      onClick={() => handleStyleChange("casual")}
                    >
                      Casual
                    </Button>
                    <Button 
                      type="button"
                      variant={invitationStyle === "formal" ? "default" : "outline"} 
                      onClick={() => handleStyleChange("formal")}
                    >
                      Formal
                    </Button>
                  </div>
                </div>
                
                <Button type="submit" className="w-full" disabled={isGenerating}>
                  {isGenerating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Wand2 className="mr-2 h-4 w-4" />
                      Generate Invitation
                    </>
                  )}
                </Button>
              </form>
            </Form>
          </FormProvider>
          
          <div className="mt-4 text-xs text-muted-foreground">
            <p>Example: {samplePrompt}</p>
          </div>
        </CardContent>
      </Card>
      
      <div className="space-y-4">
        <InvitationPreview 
          content={generatedContent} 
          style={invitationStyle}
          isLoading={isGenerating}
        />
        
        {generatedContent && (
          <Card>
            <CardFooter className="flex gap-2 pt-4">
              <Button variant="outline" onClick={handleSave} className="flex-1">
                <Save className="mr-2 h-4 w-4" />
                Save
              </Button>
              <Button variant="outline" onClick={handleShare} className="flex-1">
                <Share2 className="mr-2 h-4 w-4" />
                Share
              </Button>
              <Button variant="outline" onClick={handleDownload} className="flex-1">
                <Download className="mr-2 h-4 w-4" />
                Download
              </Button>
            </CardFooter>
          </Card>
        )}
      </div>
    </div>
  );
};

export default InvitationGenerator;
