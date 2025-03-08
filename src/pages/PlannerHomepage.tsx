
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, CheckSquare, Users, Clock, ArrowRight, Plus } from "lucide-react";

const PlannerHomepage = () => {
  const navigate = useNavigate();
  
  // Basic auth check - replace with your auth logic
  useEffect(() => {
    const isAuthenticated = localStorage.getItem("authenticated");
    if (!isAuthenticated) {
      navigate("/");
    }
  }, [navigate]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 pt-24 pb-16">
        <div className="mb-8">
          <h1 className="text-3xl font-serif">Wedding Planner Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Welcome back! Manage your clients and upcoming events.
          </p>
        </div>

        <Tabs defaultValue="overview" className="space-y-8">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="clients">Clients</TabsTrigger>
            <TabsTrigger value="upcoming">Upcoming Events</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Clients</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">12</div>
                  <p className="text-xs text-muted-foreground">3 new this month</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Upcoming Events</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">8</div>
                  <p className="text-xs text-muted-foreground">Next: Johnson Wedding (3 days)</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pending Tasks</CardTitle>
                  <CheckSquare className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">24</div>
                  <p className="text-xs text-muted-foreground">7 high priority</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Hours Logged</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">156</div>
                  <p className="text-xs text-muted-foreground">This month</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activities</CardTitle>
                  <CardDescription>Your latest planning activities</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start space-x-4 rounded-md p-2 transition-all hover:bg-muted/50">
                    <div className="flex-1">
                      <p className="text-sm font-medium">Updated Smith Wedding Task List</p>
                      <div className="flex items-center text-xs text-muted-foreground">
                        <span>Today at 10:34 AM</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4 rounded-md p-2 transition-all hover:bg-muted/50">
                    <div className="flex-1">
                      <p className="text-sm font-medium">Added new vendor to Johnson Wedding</p>
                      <div className="flex items-center text-xs text-muted-foreground">
                        <span>Yesterday at 3:15 PM</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4 rounded-md p-2 transition-all hover:bg-muted/50">
                    <div className="flex-1">
                      <p className="text-sm font-medium">Sent budget update to Garcia couple</p>
                      <div className="flex items-center text-xs text-muted-foreground">
                        <span>Feb 28 at 9:20 AM</span>
                      </div>
                    </div>
                  </div>
                  <Button variant="link" size="sm" className="mt-2 w-full">
                    View all activities
                    <ArrowRight className="ml-1 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Upcoming Deadlines</CardTitle>
                  <CardDescription>Tasks due in the next 7 days</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start space-x-4 rounded-md p-2 transition-all hover:bg-muted/50">
                    <div className="flex-1">
                      <p className="text-sm font-medium">Confirm floral arrangements - Johnson Wedding</p>
                      <div className="flex items-center text-xs text-muted-foreground">
                        <span className="text-red-500 font-medium">Due tomorrow</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4 rounded-md p-2 transition-all hover:bg-muted/50">
                    <div className="flex-1">
                      <p className="text-sm font-medium">Menu tasting - Smith Wedding</p>
                      <div className="flex items-center text-xs text-muted-foreground">
                        <span className="text-amber-500 font-medium">Due in 3 days</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4 rounded-md p-2 transition-all hover:bg-muted/50">
                    <div className="flex-1">
                      <p className="text-sm font-medium">Send final guest list to venue - Garcia Wedding</p>
                      <div className="flex items-center text-xs text-muted-foreground">
                        <span className="text-amber-500 font-medium">Due in 5 days</span>
                      </div>
                    </div>
                  </div>
                  <Button variant="link" size="sm" className="mt-2 w-full">
                    View all deadlines
                    <ArrowRight className="ml-1 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            </div>

            <div className="flex flex-col md:flex-row gap-4">
              <Button onClick={() => navigate("/clients")} className="flex-1">
                <Users className="mr-2 h-4 w-4" />
                Manage Clients
              </Button>
              <Button onClick={() => navigate("/planner-tasks")} className="flex-1">
                <CheckSquare className="mr-2 h-4 w-4" />
                View All Tasks
              </Button>
              <Button onClick={() => navigate("/planner-calendar")} className="flex-1">
                <Calendar className="mr-2 h-4 w-4" />
                Calendar
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="clients" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-medium">Your Client List</h2>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add New Client
              </Button>
            </div>
            
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {["Smith", "Johnson", "Garcia", "Chen", "Williams", "Rodriguez"].map((name, index) => (
                <Card key={index} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">{name} Wedding</CardTitle>
                    <CardDescription>Event Date: {["Apr 15", "May 22", "Jun 10", "Jul 8", "Aug 14", "Sep 3"][index]}, 2024</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">Venue: {["Grand Ballroom", "Sunset Gardens", "Lakeside Pavilion", "Mountain View", "Harbor Point", "Rose Garden"][index]}</p>
                      <p className="text-sm text-muted-foreground">Guests: {[120, 85, 150, 100, 200, 75][index]}</p>
                      <div className="flex justify-between text-sm pt-2">
                        <span className="text-blue-500 font-medium">Tasks: {[12, 18, 15, 10, 22, 8][index]}</span>
                        <span className="text-green-500 font-medium">Budget: ${[25000, 30000, 35000, 22000, 40000, 18000][index]}</span>
                      </div>
                      <Button variant="outline" size="sm" className="w-full mt-2">
                        View Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            <Button variant="outline" className="w-full">
              View All Clients
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </TabsContent>

          <TabsContent value="upcoming" className="space-y-6">
            <div className="bg-muted/50 p-4 rounded-lg mb-6">
              <h2 className="text-xl font-medium mb-2">This Week's Events</h2>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-background rounded-md shadow-sm">
                  <div>
                    <p className="font-medium">Johnson Wedding</p>
                    <p className="text-sm text-muted-foreground">March 15 • Grand Ballroom • 120 guests</p>
                  </div>
                  <Button size="sm">Details</Button>
                </div>
                <div className="flex justify-between items-center p-3 bg-background rounded-md shadow-sm">
                  <div>
                    <p className="font-medium">Williams Engagement Party</p>
                    <p className="text-sm text-muted-foreground">March 16 • Rooftop Gardens • 50 guests</p>
                  </div>
                  <Button size="sm">Details</Button>
                </div>
              </div>
            </div>
            
            <div className="bg-muted/50 p-4 rounded-lg">
              <h2 className="text-xl font-medium mb-2">Next Month</h2>
              <div className="space-y-4">
                {[
                  { name: "Smith Wedding", date: "April 5", venue: "Lakeside Pavilion", guests: 85 },
                  { name: "Garcia Wedding", date: "April 12", venue: "Mountain View", guests: 150 },
                  { name: "Chen Wedding", date: "April 19", venue: "Harbor Point", guests: 100 },
                  { name: "Rodriguez Wedding", date: "April 26", venue: "Rose Garden", guests: 75 },
                ].map((event, index) => (
                  <div key={index} className="flex justify-between items-center p-3 bg-background rounded-md shadow-sm">
                    <div>
                      <p className="font-medium">{event.name}</p>
                      <p className="text-sm text-muted-foreground">{event.date} • {event.venue} • {event.guests} guests</p>
                    </div>
                    <Button size="sm" variant="outline">Details</Button>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default PlannerHomepage;
