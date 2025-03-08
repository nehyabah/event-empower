
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Plus, 
  Search, 
  Filter, 
  Calendar, 
  Users, 
  ArrowUpDown, 
  Mail, 
  Phone,
  Heart 
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Client {
  id: string;
  names: string;
  email: string;
  phone: string;
  eventType: string;
  eventDate: string;
  status: "active" | "completed" | "upcoming";
  budget: string;
  venue?: string;
  guests?: number;
}

const PlannerClients = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  
  // Sample clients data
  const initialClients: Client[] = [
    { 
      id: "1", 
      names: "John & Sarah Smith", 
      email: "smiths@example.com", 
      phone: "(555) 123-4567", 
      eventType: "Wedding", 
      eventDate: "Apr 15, 2024", 
      status: "active",
      budget: "$25,000",
      venue: "Grand Ballroom",
      guests: 120
    },
    { 
      id: "2", 
      names: "Michael & Emma Johnson", 
      email: "johnsons@example.com", 
      phone: "(555) 234-5678", 
      eventType: "Wedding", 
      eventDate: "May 22, 2024", 
      status: "active",
      budget: "$30,000",
      venue: "Sunset Gardens",
      guests: 85
    },
    { 
      id: "3", 
      names: "David & Maria Garcia", 
      email: "garcias@example.com", 
      phone: "(555) 345-6789", 
      eventType: "Wedding", 
      eventDate: "Jun 10, 2024", 
      status: "upcoming",
      budget: "$35,000",
      venue: "Lakeside Pavilion",
      guests: 150
    },
    { 
      id: "4", 
      names: "Robert & Amy Chen", 
      email: "chens@example.com", 
      phone: "(555) 456-7890", 
      eventType: "Wedding", 
      eventDate: "Jul 8, 2024", 
      status: "upcoming",
      budget: "$22,000",
      venue: "Mountain View",
      guests: 100
    },
    { 
      id: "5", 
      names: "James & Lisa Williams", 
      email: "williams@example.com", 
      phone: "(555) 567-8901", 
      eventType: "Wedding", 
      eventDate: "Aug 14, 2024", 
      status: "upcoming",
      budget: "$40,000",
      venue: "Harbor Point",
      guests: 200
    },
    { 
      id: "6", 
      names: "Kevin & Ana Rodriguez", 
      email: "rodriguez@example.com", 
      phone: "(555) 678-9012", 
      eventType: "Wedding", 
      eventDate: "Sep 3, 2024", 
      status: "upcoming",
      budget: "$18,000",
      venue: "Rose Garden",
      guests: 75
    },
  ];
  
  const [clients, setClients] = useState<Client[]>(initialClients);
  
  // Basic auth check
  useEffect(() => {
    const isAuthenticated = localStorage.getItem("authenticated");
    if (!isAuthenticated) {
      navigate("/");
    }
  }, [navigate]);
  
  // Filter clients based on search term
  const filteredClients = clients.filter(client => 
    client.names.toLowerCase().includes(searchTerm.toLowerCase()) || 
    client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.eventType.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Get status badge with appropriate color
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active': 
        return <Badge variant="default" className="bg-blue-500">Active</Badge>;
      case 'completed': 
        return <Badge variant="outline" className="text-green-500 border-green-500">Completed</Badge>;
      case 'upcoming': 
        return <Badge variant="outline" className="text-amber-500 border-amber-500">Upcoming</Badge>;
      default: 
        return null;
    }
  };
  
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 pt-24 pb-16">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <h1 className="text-3xl font-serif">Client Management</h1>
            <p className="text-muted-foreground">Manage all your wedding clients</p>
          </div>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add New Client
          </Button>
        </div>
        
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search clients..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="icon">
              <Filter className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon">
              <ArrowUpDown className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <Tabs defaultValue="all" className="space-y-6">
          <TabsList className="grid grid-cols-4 w-full max-w-md">
            <TabsTrigger value="all">All Clients</TabsTrigger>
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredClients.length > 0 ? (
                filteredClients.map((client) => (
                  <Card key={client.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-2 flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg flex items-center">
                          {client.names}
                          <Heart className="h-3 w-3 ml-2 text-red-400" />
                        </CardTitle>
                        <p className="text-sm text-muted-foreground">{client.eventType} • {client.eventDate}</p>
                      </div>
                      {getStatusBadge(client.status)}
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center text-sm">
                          <Mail className="mr-2 h-4 w-4 text-muted-foreground" />
                          <span>{client.email}</span>
                        </div>
                        <div className="flex items-center text-sm">
                          <Phone className="mr-2 h-4 w-4 text-muted-foreground" />
                          <span>{client.phone}</span>
                        </div>
                        <div className="flex items-center text-sm">
                          <Users className="mr-2 h-4 w-4 text-muted-foreground" />
                          <span>{client.guests || 'TBD'} guests</span>
                        </div>
                        <div className="flex items-center text-sm">
                          <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                          <span>{client.venue || 'Venue TBD'}</span>
                        </div>
                        <div className="pt-2 flex justify-between">
                          <span className="font-medium">Budget: {client.budget}</span>
                          <Button variant="outline" size="sm">
                            View
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="col-span-full p-8 text-center bg-muted/50 rounded-lg">
                  <p className="text-muted-foreground">No clients found matching your search.</p>
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="active">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredClients.filter(client => client.status === "active").map((client) => (
                <Card key={client.id} className="hover:shadow-md transition-shadow">
                  {/* Same content as in the "all" tab */}
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">{client.names}</CardTitle>
                    <p className="text-sm text-muted-foreground">{client.eventType} • {client.eventDate}</p>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <p className="text-sm">{client.email}</p>
                      <p className="text-sm">{client.phone}</p>
                      <div className="pt-2 flex justify-between">
                        <span className="font-medium">Budget: {client.budget}</span>
                        <Button variant="outline" size="sm">
                          View
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="upcoming">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredClients.filter(client => client.status === "upcoming").map((client) => (
                <Card key={client.id} className="hover:shadow-md transition-shadow">
                  {/* Same content as in the "all" tab */}
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">{client.names}</CardTitle>
                    <p className="text-sm text-muted-foreground">{client.eventType} • {client.eventDate}</p>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <p className="text-sm">{client.email}</p>
                      <p className="text-sm">{client.phone}</p>
                      <div className="pt-2 flex justify-between">
                        <span className="font-medium">Budget: {client.budget}</span>
                        <Button variant="outline" size="sm">
                          View
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="completed">
            <div className="p-8 text-center bg-muted/50 rounded-lg">
              <p className="text-muted-foreground">No completed client events yet.</p>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default PlannerClients;
