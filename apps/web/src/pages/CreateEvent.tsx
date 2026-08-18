
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const formSchema = z.object({
  eventName: z.string().min(2, {
    message: "Event name must be at least 2 characters.",
  }),
  eventType: z.string({
    required_error: "Please select an event type.",
  }),
  region: z.string({
    required_error: "Please select a region.",
  }),
  date: z.date({
    required_error: "Please select a date.",
  }),
  budget: z.string().min(1, {
    message: "Please enter a budget amount.",
  }),
  guestCount: z.string().min(1, {
    message: "Please enter an estimated guest count.",
  }),
  notes: z.string().optional(),
});

const CreateEvent = () => {
  const [step, setStep] = useState(1);
  const navigate = useNavigate();
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      eventName: "",
      eventType: "",
      region: "",
      budget: "",
      guestCount: "",
      notes: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    console.log(values);
    
    // In a real app, you would save the event data to your backend here
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    toast.success("Event created successfully!", {
      description: "You can now start planning your wedding.",
    });
    
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <div className="flex-grow pt-32 pb-20">
        <div className="container max-w-3xl">
          <div className="text-center mb-10">
            <h1 className="text-3xl md:text-4xl font-serif mb-4">Create Your Wedding Event</h1>
            <p className="text-muted-foreground">
              Tell us about your wedding to get personalized planning assistance.
            </p>
          </div>
          
          <div className="flex justify-between items-center mb-8">
            <div className="flex gap-2">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                step >= 1 ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
              }`}>
                1
              </div>
              <div className="h-0.5 w-8 self-center bg-border" />
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                step >= 2 ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
              }`}>
                2
              </div>
              <div className="h-0.5 w-8 self-center bg-border" />
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                step >= 3 ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
              }`}>
                3
              </div>
            </div>
            <div className="text-sm text-muted-foreground">
              Step {step} of 3
            </div>
          </div>
          
          <div className="glass rounded-xl p-6 md:p-8">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {step === 1 && (
                  <div className="space-y-6 animate-fade-in">
                    <h2 className="font-serif text-xl mb-4">Basic Details</h2>
                    
                    <FormField
                      control={form.control}
                      name="eventName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Event Name</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="e.g., Chioma & Emeka's Wedding" 
                              {...field} 
                              className="input-elegant"
                            />
                          </FormControl>
                          <FormDescription>
                            This will appear on your wedding website and invitations.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="eventType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Event Type</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="input-elegant">
                                <SelectValue placeholder="Select event type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="traditional">Traditional Wedding</SelectItem>
                              <SelectItem value="whiteWedding">White Wedding</SelectItem>
                              <SelectItem value="combined">Combined (Traditional & White)</SelectItem>
                              <SelectItem value="engagement">Traditional Engagement</SelectItem>
                              <SelectItem value="civilCeremony">Civil Ceremony</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            Select the type of ceremony you're planning.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="region"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Region</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="input-elegant">
                                <SelectValue placeholder="Select your region" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="lagos">Lagos</SelectItem>
                              <SelectItem value="abuja">Abuja</SelectItem>
                              <SelectItem value="portHarcourt">Port Harcourt</SelectItem>
                              <SelectItem value="enugu">Enugu</SelectItem>
                              <SelectItem value="kano">Kano</SelectItem>
                              <SelectItem value="ibadan">Ibadan</SelectItem>
                              <SelectItem value="calabar">Calabar</SelectItem>
                              <SelectItem value="kaduna">Kaduna</SelectItem>
                              <SelectItem value="benin">Benin</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            This helps us recommend local vendors and customs.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="flex justify-end pt-4">
                      <Button 
                        type="button" 
                        onClick={() => setStep(2)}
                        disabled={!form.getValues().eventName || !form.getValues().eventType || !form.getValues().region}
                      >
                        Continue
                      </Button>
                    </div>
                  </div>
                )}
                
                {step === 2 && (
                  <div className="space-y-6 animate-fade-in">
                    <h2 className="font-serif text-xl mb-4">Date & Guests</h2>
                    
                    <FormField
                      control={form.control}
                      name="date"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>Event Date</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant={"outline"}
                                  className={cn(
                                    "w-full pl-3 text-left font-normal input-elegant",
                                    !field.value && "text-muted-foreground"
                                  )}
                                >
                                  {field.value ? (
                                    format(field.value, "PPP")
                                  ) : (
                                    <span>Pick a date</span>
                                  )}
                                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                disabled={(date) => date < new Date()}
                                initialFocus
                                className={cn("p-3 pointer-events-auto")}
                              />
                            </PopoverContent>
                          </Popover>
                          <FormDescription>
                            The date of your wedding or main event.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="budget"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Budget (in Naira)</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="e.g., 5000000" 
                              {...field} 
                              type="number"
                              className="input-elegant"
                            />
                          </FormControl>
                          <FormDescription>
                            Your estimated total budget for all wedding events.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="guestCount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Estimated Guest Count</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="e.g., 200" 
                              {...field} 
                              type="number"
                              className="input-elegant"
                            />
                          </FormControl>
                          <FormDescription>
                            Approximate number of guests you plan to invite.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="flex justify-between pt-4">
                      <Button type="button" variant="outline" onClick={() => setStep(1)}>
                        Back
                      </Button>
                      <Button 
                        type="button" 
                        onClick={() => setStep(3)}
                        disabled={!form.getValues().date || !form.getValues().budget || !form.getValues().guestCount}
                      >
                        Continue
                      </Button>
                    </div>
                  </div>
                )}
                
                {step === 3 && (
                  <div className="space-y-6 animate-fade-in">
                    <h2 className="font-serif text-xl mb-4">Additional Details</h2>
                    
                    <FormField
                      control={form.control}
                      name="notes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Additional Notes</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Any special requirements or information about your wedding..."
                              {...field}
                              rows={5}
                              className="input-elegant resize-none"
                            />
                          </FormControl>
                          <FormDescription>
                            Share any other details that might help with planning.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="bg-secondary/50 p-4 rounded-lg border border-border">
                      <h3 className="font-medium mb-2">What happens next?</h3>
                      <p className="text-sm text-muted-foreground">
                        After creating your event, we'll generate a personalized task list based on your event type, region, and date. You'll be able to browse regional vendors and start planning right away.
                      </p>
                    </div>
                    
                    <div className="flex justify-between pt-4">
                      <Button type="button" variant="outline" onClick={() => setStep(2)}>
                        Back
                      </Button>
                      <Button type="submit">
                        Create Event
                      </Button>
                    </div>
                  </div>
                )}
              </form>
            </Form>
          </div>
        </div>
      </div>
      
    </div>
  );
};

export default CreateEvent;
