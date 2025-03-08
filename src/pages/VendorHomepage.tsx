
import { useState } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/home/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Calendar, 
  Users, 
  Star, 
  MessageSquare, 
  BarChart4, 
  Settings, 
  Camera, 
  Building,
  Plus,
  Mail,
  Clock
} from "lucide-react";
import { Link } from "react-router-dom";

const VendorHomepage = () => {
  const userEmail = localStorage.getItem("userEmail") || "vendor@example.com";
  const firstName = userEmail.split('@')[0].split('.')[0];
  const capitalizedName = firstName.charAt(0).toUpperCase() + firstName.slice(1);
  
  const [upcomingEvents] = useState([
    { id: 1, name: "Ayomide & Daniel", date: "Jun 15, 2024", type: "Wedding", status: "confirmed" },
    { id: 2, name: "Blessing & Michael", date: "Jul 22, 2024", type: "Wedding", status: "pending" },
    { id: 3, name: "Ngozi & Chijioke", date: "Aug 10, 2024", type: "Engagement", status: "confirmed" }
  ]);
  
  const [inquiries] = useState([
    { id: 1, name: "Tunde A.", date: "Today", message: "Do you cover events in Abuja?", status: "new" },
    { id: 2, name: "Maria F.", date: "Yesterday", message: "I need pricing for 200 guests", status: "replied" },
    { id: 3, name: "John B.", date: "3 days ago", message: "Are you available on December 10?", status: "new" }
  ]);
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow pt-20 md:pt-24 pb-16">
        <div className="container mx-auto px-4 space-y-8 md:space-y-10">
          <section className="text-center md:text-left">
            <h1 className="font-serif text-2xl md:text-4xl mb-2">
              Welcome back, <span className="text-primary">{capitalizedName}</span>!
            </h1>
            <p className="text-muted-foreground text-base md:text-lg max-w-2xl">
              Manage your wedding services, bookings, and client inquiries from your vendor dashboard.
            </p>
          </section>
          
          <section className="py-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <MetricCard 
                title="Upcoming Events" 
                value="3" 
                description="Next event: Jun 15" 
                icon={Calendar} 
                trend="+1 this month"
                trendUp={true}
              />
              <MetricCard 
                title="New Inquiries" 
                value="5" 
                description="2 unread messages" 
                icon={MessageSquare} 
                trend="+3 this week"
                trendUp={true}
              />
              <MetricCard 
                title="Profile Views" 
                value="142" 
                description="Last 30 days" 
                icon={Users} 
                trend="+18% vs last month"
                trendUp={true}
              />
            </div>
          </section>
          
          <section className="py-4">
            <Tabs defaultValue="upcoming" className="w-full">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl md:text-2xl font-serif">Events & Inquiries</h2>
                <TabsList>
                  <TabsTrigger value="upcoming">Upcoming Events</TabsTrigger>
                  <TabsTrigger value="inquiries">Inquiries</TabsTrigger>
                </TabsList>
              </div>
              
              <TabsContent value="upcoming" className="mt-0">
                <Card>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-center">
                      <div>
                        <CardTitle>Upcoming Events</CardTitle>
                        <CardDescription>Manage your booked events</CardDescription>
                      </div>
                      <Button className="flex items-center gap-1">
                        <Plus className="h-4 w-4" />
                        Add Event
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {upcomingEvents.map((event) => (
                      <div key={event.id} className="flex items-center justify-between border-b py-4 last:border-b-0 last:pb-0">
                        <div className="flex items-center gap-4">
                          <div className="bg-primary/10 text-primary p-3 rounded-full">
                            <Calendar className="h-5 w-5" />
                          </div>
                          <div>
                            <h3 className="font-medium">{event.name}</h3>
                            <p className="text-sm text-muted-foreground">{event.type}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">{event.date}</div>
                          <div className={`text-xs px-2 py-1 rounded-full inline-block ${
                            event.status === 'confirmed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    <div className="mt-4 text-center">
                      <Button variant="outline" className="w-full">View All Events</Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="inquiries" className="mt-0">
                <Card>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-center">
                      <div>
                        <CardTitle>Client Inquiries</CardTitle>
                        <CardDescription>Respond to potential clients</CardDescription>
                      </div>
                      <Button variant="outline" className="flex items-center gap-1">
                        <Mail className="h-4 w-4" />
                        Compose
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {inquiries.map((inquiry) => (
                      <div key={inquiry.id} className="flex items-center justify-between border-b py-4 last:border-b-0 last:pb-0">
                        <div className="flex items-center gap-4">
                          <div className={`p-3 rounded-full ${
                            inquiry.status === 'new' ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
                          }`}>
                            <MessageSquare className="h-5 w-5" />
                          </div>
                          <div>
                            <h3 className="font-medium">{inquiry.name}</h3>
                            <p className="text-sm text-muted-foreground">{inquiry.message}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs text-muted-foreground flex items-center justify-end gap-1">
                            <Clock className="h-3 w-3" />
                            {inquiry.date}
                          </div>
                          <div className={`text-xs px-2 py-1 mt-1 rounded-full inline-block ${
                            inquiry.status === 'new' ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
                          }`}>
                            {inquiry.status === 'new' ? 'New' : 'Replied'}
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    <div className="mt-4 text-center">
                      <Button variant="outline" className="w-full">View All Inquiries</Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </section>
          
          <section className="py-4">
            <h2 className="text-xl md:text-2xl font-serif mb-4">Manage Your Services</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <ActionCard 
                title="Portfolio" 
                description="Update your work samples" 
                icon={Camera} 
                to="/vendor-portfolio"
                badgeText="Pro"
              />
              <ActionCard 
                title="Services" 
                description="Edit your offerings" 
                icon={Building} 
              />
              <ActionCard 
                title="Reviews" 
                description="View client feedback" 
                icon={Star} 
                badgeCount="3"
              />
              <ActionCard 
                title="Analytics" 
                description="View performance stats" 
                icon={BarChart4} 
              />
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
};

interface MetricCardProps {
  title: string;
  value: string;
  description: string;
  icon: React.ElementType;
  trend?: string;
  trendUp?: boolean;
}

const MetricCard = ({ title, value, description, icon: Icon, trend, trendUp }: MetricCardProps) => (
  <Card>
    <CardContent className="pt-6">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm font-medium text-muted-foreground mb-1">{title}</p>
          <div className="flex items-baseline gap-2">
            <h3 className="text-3xl font-bold">{value}</h3>
            {trend && (
              <span className={`text-xs ${trendUp ? 'text-green-600' : 'text-red-600'}`}>
                {trend}
              </span>
            )}
          </div>
          <p className="text-sm text-muted-foreground mt-1">{description}</p>
        </div>
        <div className="bg-primary/10 p-3 rounded-full">
          <Icon className="w-5 h-5 text-primary" />
        </div>
      </div>
    </CardContent>
  </Card>
);

interface ActionCardProps {
  title: string;
  description: string;
  icon: React.ElementType;
  to?: string;
  badgeText?: string;
  badgeCount?: string;
}

const ActionCard = ({ title, description, icon: Icon, to = "#", badgeText, badgeCount }: ActionCardProps) => (
  <Link to={to} className="block h-full">
    <Card className="h-full transition-all hover:shadow-md hover:-translate-y-1 overflow-hidden group">
      <CardContent className="p-6 relative">
        <div className="rounded-full bg-primary/10 w-10 h-10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-all">
          <Icon className="w-5 h-5 text-primary" />
        </div>
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-medium text-lg mb-1">{title}</h3>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
          {badgeText && (
            <span className="bg-wedding-gold/20 text-wedding-gold text-xs px-2 py-1 rounded-full">
              {badgeText}
            </span>
          )}
          {badgeCount && (
            <span className="bg-primary text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
              {badgeCount}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  </Link>
);

export default VendorHomepage;
