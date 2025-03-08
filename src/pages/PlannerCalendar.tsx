
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { Plus, ChevronLeft, ChevronRight } from "lucide-react";
import { addDays } from "date-fns";

const PlannerCalendar = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const today = new Date();
  
  // Sample events
  const events = [
    { date: today, title: "Team Meeting", type: "meeting", time: "10:00 AM" },
    { date: addDays(today, 2), title: "Smith Wedding - Venue Visit", type: "visit", time: "2:00 PM" },
    { date: addDays(today, 3), title: "Johnson Wedding - Rehearsal", type: "rehearsal", time: "5:00 PM" },
    { date: addDays(today, 5), title: "Garcia Wedding - Final Planning", type: "meeting", time: "11:00 AM" },
    { date: addDays(today, 8), title: "Chen Wedding - Vendor Meeting", type: "meeting", time: "3:30 PM" },
    { date: addDays(today, 10), title: "Williams Wedding", type: "wedding", time: "All Day" },
    { date: addDays(today, 15), title: "Rodriguez Wedding", type: "wedding", time: "All Day" },
  ];
  
  // Basic auth check
  useEffect(() => {
    const isAuthenticated = localStorage.getItem("authenticated");
    if (!isAuthenticated) {
      navigate("/");
    }
  }, [navigate]);
  
  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      // Check if there are events on this date
      const eventsOnDate = events.filter(event => 
        event.date.getDate() === date.getDate() && 
        event.date.getMonth() === date.getMonth() && 
        event.date.getFullYear() === date.getFullYear()
      );
      
      if (eventsOnDate.length > 0) {
        toast({
          title: `Events on ${date.toLocaleDateString()}`,
          description: (
            <ul className="mt-2 space-y-1">
              {eventsOnDate.map((event, i) => (
                <li key={i} className="text-sm">
                  {event.time} - {event.title}
                </li>
              ))}
            </ul>
          ),
        });
      } else {
        toast({
          title: "No events",
          description: `No events scheduled for ${date.toLocaleDateString()}`,
        });
      }
    }
  };
  
  const renderEventList = (eventType: string | null = null) => {
    const filteredEvents = eventType ? events.filter(event => event.type === eventType) : events;
    
    return filteredEvents
      .sort((a, b) => a.date.getTime() - b.date.getTime())
      .map((event, index) => (
        <div key={index} className="flex items-center p-3 hover:bg-muted/50 rounded-md transition-colors">
          <div className="mr-3 flex-shrink-0">
            <div className="w-12 h-12 bg-primary/10 rounded-md flex flex-col items-center justify-center">
              <span className="text-xs font-medium">{event.date.toLocaleDateString('default', { month: 'short' })}</span>
              <span className="text-lg font-bold leading-none">{event.date.getDate()}</span>
            </div>
          </div>
          <div className="flex-1">
            <h3 className="font-medium">{event.title}</h3>
            <p className="text-sm text-muted-foreground">{event.time}</p>
          </div>
          <Button variant="ghost" size="sm">View</Button>
        </div>
      ));
  };
  
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 pt-24 pb-16">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <h1 className="text-3xl font-serif">Calendar</h1>
            <p className="text-muted-foreground">Manage your schedule and appointments</p>
          </div>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Event
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="md:col-span-2">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-medium">March 2024</h2>
                <div className="flex gap-1">
                  <Button size="icon" variant="ghost">
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button size="icon" variant="ghost">
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <Calendar
                mode="single"
                className="rounded-md border shadow-sm"
                onSelect={handleDateSelect}
                selected={today}
                disabled={{ before: new Date() }}
              />
            </CardContent>
          </Card>
          
          <div className="space-y-6">
            <Card>
              <CardContent className="p-4">
                <Tabs defaultValue="upcoming">
                  <TabsList className="grid w-full grid-cols-2 mb-4">
                    <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
                    <TabsTrigger value="past">Past</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="upcoming" className="space-y-4">
                    {renderEventList()}
                  </TabsContent>
                  
                  <TabsContent value="past">
                    <p className="text-center text-muted-foreground py-4">No past events to show</p>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <h3 className="font-medium mb-3">Quick Filters</h3>
                <div className="space-y-2">
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    All Events
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    Weddings
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    Meetings
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    Venue Visits
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PlannerCalendar;
