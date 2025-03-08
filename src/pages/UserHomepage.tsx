
import { useState } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/home/Footer";
import ProjectStats from "@/components/dashboard/ProjectStats";
import WeddingCountdown from "@/components/dashboard/WeddingCountdown";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  CalendarDays, 
  ListTodo, 
  CreditCard, 
  Users, 
  Pencil,
  UserPlus,
  Search,
  MoreHorizontal,
  Link as LinkIcon,
  Copy,
  Phone
} from "lucide-react";
import { Link } from "react-router-dom";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { toast } from "sonner";

interface Guest {
  id: string;
  name: string;
  email: string;
  phone?: string;
  status: 'pending' | 'confirmed' | 'declined' | 'maybe';
  group?: string;
}

const UserHomepage = () => {
  const userEmail = localStorage.getItem("userEmail") || "user@example.com";
  const firstName = userEmail.split('@')[0].split('.')[0];
  const capitalizedName = firstName.charAt(0).toUpperCase() + firstName.slice(1);
  
  const [weddingDate, setWeddingDate] = useState(localStorage.getItem("weddingDate") || "2024-12-31");
  const [selectedGuest, setSelectedGuest] = useState<Guest | null>(null);
  const [guestInviteLink, setGuestInviteLink] = useState("");
  
  const [guests, setGuests] = useState<Guest[]>(() => {
    const savedGuests = localStorage.getItem("weddingGuests");
    return savedGuests ? JSON.parse(savedGuests) : [
      { id: '1', name: 'John Smith', email: 'john@example.com', phone: '123-456-7890', status: 'confirmed', group: 'Family' },
      { id: '2', name: 'Sarah Johnson', email: 'sarah@example.com', phone: '234-567-8901', status: 'pending', group: 'Friends' },
      { id: '3', name: 'Michael Brown', email: 'michael@example.com', status: 'declined', group: 'Work' }
    ];
  });
  
  const [searchQuery, setSearchQuery] = useState("");
  const [newGuestName, setNewGuestName] = useState("");
  const [newGuestEmail, setNewGuestEmail] = useState("");
  const [newGuestPhone, setNewGuestPhone] = useState("");
  const [newGuestGroup, setNewGuestGroup] = useState("Family");
  
  const handleDateChange = (newDate: string) => {
    setWeddingDate(newDate);
    localStorage.setItem("weddingDate", newDate);
  };
  
  const addGuest = () => {
    if (newGuestName && newGuestEmail) {
      const newGuest: Guest = {
        id: Date.now().toString(),
        name: newGuestName,
        email: newGuestEmail,
        phone: newGuestPhone,
        status: 'pending',
        group: newGuestGroup
      };
      
      const updatedGuests = [...guests, newGuest];
      setGuests(updatedGuests);
      localStorage.setItem("weddingGuests", JSON.stringify(updatedGuests));
      
      setNewGuestName("");
      setNewGuestEmail("");
      setNewGuestPhone("");
    }
  };
  
  const getGenericRsvpLink = () => {
    const baseUrl = window.location.origin;
    return `${baseUrl}/invitation`;
  };
  
  const copyGenericRsvpLink = () => {
    const link = getGenericRsvpLink();
    navigator.clipboard.writeText(link);
    toast.success("RSVP link copied to clipboard!");
  };

  // Add the missing functions
  const generateGuestInviteLink = (guest: Guest) => {
    setSelectedGuest(guest);
    const baseUrl = window.location.origin;
    const link = `${baseUrl}/invitation?name=${encodeURIComponent(guest.name)}&email=${encodeURIComponent(guest.email)}`;
    setGuestInviteLink(link);
  };
  
  const copyGuestInviteLink = () => {
    navigator.clipboard.writeText(guestInviteLink);
    toast.success("Guest invitation link copied to clipboard!");
  };
  
  const filteredGuests = guests.filter(guest => 
    guest.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    guest.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (guest.phone && guest.phone.includes(searchQuery)) ||
    (guest.group && guest.group.toLowerCase().includes(searchQuery.toLowerCase()))
  );
  
  const confirmedCount = guests.filter(g => g.status === 'confirmed').length;
  const pendingCount = guests.filter(g => g.status === 'pending').length;
  const declinedCount = guests.filter(g => g.status === 'declined').length;
  
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
              Continue planning your perfect wedding. Here's what needs your attention.
            </p>
          </section>
          
          <WeddingCountdown weddingDate={weddingDate} onDateChange={handleDateChange} />
          
          <section className="py-4 md:py-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4 md:mb-6">
              <h2 className="text-xl md:text-2xl font-serif">Guest List</h2>
              <div className="flex flex-col sm:flex-row w-full md:w-auto gap-2">
                <Button 
                  className="text-sm w-full md:w-auto gap-2 order-2 sm:order-1"
                  variant="outline"
                  onClick={copyGenericRsvpLink}
                >
                  <LinkIcon className="h-4 w-4" />
                  Copy RSVP Link
                </Button>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button className="text-sm w-full md:w-auto gap-2 order-1 sm:order-2">
                      <UserPlus className="h-4 w-4" />
                      Add Guest
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add New Guest</DialogTitle>
                      <DialogDescription>
                        Add guest details to send them an invitation link.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <label htmlFor="name" className="text-sm font-medium">Guest Name</label>
                        <Input 
                          id="name" 
                          value={newGuestName} 
                          onChange={(e) => setNewGuestName(e.target.value)} 
                          placeholder="Full Name" 
                        />
                      </div>
                      <div className="grid gap-2">
                        <label htmlFor="email" className="text-sm font-medium">Email Address</label>
                        <Input 
                          id="email" 
                          type="email" 
                          value={newGuestEmail} 
                          onChange={(e) => setNewGuestEmail(e.target.value)} 
                          placeholder="Email" 
                        />
                      </div>
                      <div className="grid gap-2">
                        <label htmlFor="phone" className="text-sm font-medium">Phone Number</label>
                        <Input 
                          id="phone" 
                          type="tel" 
                          value={newGuestPhone} 
                          onChange={(e) => setNewGuestPhone(e.target.value)} 
                          placeholder="Phone Number" 
                        />
                      </div>
                      <div className="grid gap-2">
                        <label htmlFor="group" className="text-sm font-medium">Group</label>
                        <select 
                          id="group" 
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          value={newGuestGroup} 
                          onChange={(e) => setNewGuestGroup(e.target.value)}
                        >
                          <option value="Family">Family</option>
                          <option value="Friends">Friends</option>
                          <option value="Work">Work</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                      <Button onClick={addGuest} className="w-full mt-2">Save Guest</Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
            
            <Card>
              <CardHeader className="pb-2">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div className="space-y-1">
                    <CardTitle>Your Wedding Guests</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Manage and track your guest list
                    </p>
                  </div>
                  <div className="w-full md:w-auto">
                    <div className="relative w-full">
                      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="search"
                        placeholder="Search guests..."
                        className="pl-8 w-full"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="all" className="w-full">
                  <div className="overflow-x-auto pb-2">
                    <TabsList className="w-full md:w-auto mb-4">
                      <TabsTrigger value="all">All ({guests.length})</TabsTrigger>
                      <TabsTrigger value="confirmed">Confirmed ({confirmedCount})</TabsTrigger>
                      <TabsTrigger value="pending">Pending ({pendingCount})</TabsTrigger>
                      <TabsTrigger value="declined">Declined ({declinedCount})</TabsTrigger>
                    </TabsList>
                  </div>
                  
                  <TabsContent value="all" className="mt-0">
                    <div className="rounded-md border overflow-x-auto">
                      <div className="grid grid-cols-12 p-4 text-sm font-medium text-muted-foreground bg-muted/50 min-w-[600px]">
                        <div className="col-span-3">Name</div>
                        <div className="col-span-3">Contact</div>
                        <div className="col-span-2">Group</div>
                        <div className="col-span-2">Status</div>
                        <div className="col-span-2 text-right">Actions</div>
                      </div>
                      <div className="divide-y min-w-[600px]">
                        {filteredGuests.length > 0 ? (
                          filteredGuests.map((guest) => (
                            <div key={guest.id} className="grid grid-cols-12 p-4 items-center text-sm">
                              <div className="col-span-3">
                                <div className="font-medium">{guest.name}</div>
                              </div>
                              <div className="col-span-3">
                                <div className="text-xs mb-1">{guest.email}</div>
                                {guest.phone && (
                                  <div className="text-xs flex items-center text-muted-foreground">
                                    <Phone className="h-3 w-3 mr-1" />
                                    {guest.phone}
                                  </div>
                                )}
                              </div>
                              <div className="col-span-2">{guest.group}</div>
                              <div className="col-span-2">
                                <div className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                                  guest.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                                  guest.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-red-100 text-red-800'
                                }`}>
                                  {guest.status.charAt(0).toUpperCase() + guest.status.slice(1)}
                                </div>
                              </div>
                              <div className="col-span-2 text-right">
                                <Dialog>
                                  <DialogTrigger asChild>
                                    <Button 
                                      variant="outline" 
                                      size="icon" 
                                      className="mr-1"
                                      onClick={() => generateGuestInviteLink(guest)}
                                    >
                                      <LinkIcon className="h-4 w-4" />
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent>
                                    <DialogHeader>
                                      <DialogTitle>Invitation Link for {selectedGuest?.name}</DialogTitle>
                                      <DialogDescription>
                                        Share this unique link with your guest to let them RSVP directly.
                                      </DialogDescription>
                                    </DialogHeader>
                                    <div className="space-y-4 py-4">
                                      <div className="flex items-center gap-2">
                                        <Input
                                          value={guestInviteLink}
                                          readOnly
                                          className="font-mono text-xs text-ellipsis"
                                        />
                                        <Button
                                          variant="outline"
                                          size="icon"
                                          onClick={copyGuestInviteLink}
                                        >
                                          <Copy className="h-4 w-4" />
                                        </Button>
                                      </div>
                                      <div className="text-sm text-muted-foreground">
                                        <p>When your guest opens this link, they'll be able to confirm or decline your invitation.</p>
                                      </div>
                                      <div className="flex justify-end">
                                        <Button 
                                          variant="default" 
                                          onClick={copyGuestInviteLink}
                                          className="w-full sm:w-auto"
                                        >
                                          Copy Link
                                        </Button>
                                      </div>
                                    </div>
                                  </DialogContent>
                                </Dialog>
                                <Button variant="ghost" size="icon">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="p-8 text-center text-muted-foreground">
                            No guests match your search
                          </div>
                        )}
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="confirmed" className="mt-0">
                    <div className="rounded-md border">
                      <div className="grid grid-cols-12 p-4 text-sm font-medium text-muted-foreground bg-muted/50">
                        <div className="col-span-3">Name</div>
                        <div className="col-span-3">Contact</div>
                        <div className="col-span-2">Group</div>
                        <div className="col-span-2">Status</div>
                        <div className="col-span-2 text-right">Actions</div>
                      </div>
                      <div className="divide-y">
                        {filteredGuests.filter(g => g.status === 'confirmed').length > 0 ? (
                          filteredGuests
                            .filter(g => g.status === 'confirmed')
                            .map((guest) => (
                              <div key={guest.id} className="grid grid-cols-12 p-4 items-center text-sm">
                                <div className="col-span-3">
                                  <div className="font-medium">{guest.name}</div>
                                </div>
                                <div className="col-span-3">
                                  <div className="text-xs mb-1">{guest.email}</div>
                                  {guest.phone && (
                                    <div className="text-xs flex items-center text-muted-foreground">
                                      <Phone className="h-3 w-3 mr-1" />
                                      {guest.phone}
                                    </div>
                                  )}
                                </div>
                                <div className="col-span-2">{guest.group}</div>
                                <div className="col-span-2">
                                  <div className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold bg-green-100 text-green-800">
                                    Confirmed
                                  </div>
                                </div>
                                <div className="col-span-2 text-right">
                                  <Button 
                                    variant="outline" 
                                    size="icon" 
                                    className="mr-1"
                                    onClick={() => generateGuestInviteLink(guest)}
                                  >
                                    <LinkIcon className="h-4 w-4" />
                                  </Button>
                                  <Button variant="ghost" size="icon">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            ))
                        ) : (
                          <div className="p-8 text-center text-muted-foreground">
                            No confirmed guests
                          </div>
                        )}
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="pending" className="mt-0">
                    <div className="rounded-md border">
                      <div className="grid grid-cols-12 p-4 text-sm font-medium text-muted-foreground bg-muted/50">
                        <div className="col-span-3">Name</div>
                        <div className="col-span-3">Contact</div>
                        <div className="col-span-2">Group</div>
                        <div className="col-span-2">Status</div>
                        <div className="col-span-2 text-right">Actions</div>
                      </div>
                      <div className="divide-y">
                        {filteredGuests.filter(g => g.status === 'pending').length > 0 ? (
                          filteredGuests
                            .filter(g => g.status === 'pending')
                            .map((guest) => (
                              <div key={guest.id} className="grid grid-cols-12 p-4 items-center text-sm">
                                <div className="col-span-3">
                                  <div className="font-medium">{guest.name}</div>
                                </div>
                                <div className="col-span-3">
                                  <div className="text-xs mb-1">{guest.email}</div>
                                  {guest.phone && (
                                    <div className="text-xs flex items-center text-muted-foreground">
                                      <Phone className="h-3 w-3 mr-1" />
                                      {guest.phone}
                                    </div>
                                  )}
                                </div>
                                <div className="col-span-2">{guest.group}</div>
                                <div className="col-span-2">
                                  <div className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold bg-yellow-100 text-yellow-800">
                                    Pending
                                  </div>
                                </div>
                                <div className="col-span-2 text-right">
                                  <Button 
                                    variant="outline" 
                                    size="icon" 
                                    className="mr-1"
                                    onClick={() => generateGuestInviteLink(guest)}
                                  >
                                    <LinkIcon className="h-4 w-4" />
                                  </Button>
                                  <Button variant="ghost" size="icon">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            ))
                        ) : (
                          <div className="p-8 text-center text-muted-foreground">
                            No pending guests
                          </div>
                        )}
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="declined" className="mt-0">
                    <div className="rounded-md border">
                      <div className="grid grid-cols-12 p-4 text-sm font-medium text-muted-foreground bg-muted/50">
                        <div className="col-span-3">Name</div>
                        <div className="col-span-3">Contact</div>
                        <div className="col-span-2">Group</div>
                        <div className="col-span-2">Status</div>
                        <div className="col-span-2 text-right">Actions</div>
                      </div>
                      <div className="divide-y">
                        {filteredGuests.filter(g => g.status === 'declined').length > 0 ? (
                          filteredGuests
                            .filter(g => g.status === 'declined')
                            .map((guest) => (
                              <div key={guest.id} className="grid grid-cols-12 p-4 items-center text-sm">
                                <div className="col-span-3">
                                  <div className="font-medium">{guest.name}</div>
                                </div>
                                <div className="col-span-3">
                                  <div className="text-xs mb-1">{guest.email}</div>
                                  {guest.phone && (
                                    <div className="text-xs flex items-center text-muted-foreground">
                                      <Phone className="h-3 w-3 mr-1" />
                                      {guest.phone}
                                    </div>
                                  )}
                                </div>
                                <div className="col-span-2">{guest.group}</div>
                                <div className="col-span-2">
                                  <div className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold bg-red-100 text-red-800">
                                    Declined
                                  </div>
                                </div>
                                <div className="col-span-2 text-right">
                                  <Button 
                                    variant="outline" 
                                    size="icon" 
                                    className="mr-1"
                                    onClick={() => generateGuestInviteLink(guest)}
                                  >
                                    <LinkIcon className="h-4 w-4" />
                                  </Button>
                                  <Button variant="ghost" size="icon">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            ))
                        ) : (
                          <div className="p-8 text-center text-muted-foreground">
                            No declined guests
                          </div>
                        )}
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </section>
          
          <section className="py-4 md:py-6">
            <h2 className="text-xl md:text-2xl font-serif mb-4 md:mb-6">Wedding Planning Progress</h2>
            <ProjectStats />
          </section>
          
          <section className="py-4 md:py-6">
            <h2 className="text-xl md:text-2xl font-serif mb-4 md:mb-6">Quick Actions</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <QuickActionCard 
                title="To-Do Lists" 
                description="Track your planning tasks" 
                icon={ListTodo} 
                to="/todo-lists" 
              />
              <QuickActionCard 
                title="Expense Tracker" 
                description="Manage your wedding budget" 
                icon={CreditCard} 
                to="/expense-tracker" 
              />
              <QuickActionCard 
                title="Find Vendors" 
                description="Discover local services" 
                icon={Users} 
                to="/vendors" 
              />
              <QuickActionCard 
                title="Edit Story" 
                description="Update your love story" 
                icon={Pencil} 
                to="/couple-story" 
              />
            </div>
          </section>
          
          <section className="py-6 md:py-8">
            <h2 className="text-xl md:text-2xl font-serif mb-4 md:mb-8">Your Wedding Timeline</h2>
            <div className="relative pl-8 md:pl-12 space-y-8 md:space-y-10 max-w-3xl before:absolute before:left-3 md:before:left-4 before:top-3 before:bottom-10 before:w-[2px] 
              before:bg-gradient-to-b before:from-primary/10 before:via-primary/50 before:to-primary/20">
              <TimelineItem 
                date="8 weeks before" 
                title="Final Venue Visit" 
                description="Confirm all venue details and arrangements" 
              />
              <TimelineItem 
                date="6 weeks before" 
                title="Wedding Outfits" 
                description="Final fittings for wedding attire" 
                active={true}
              />
              <TimelineItem 
                date="4 weeks before" 
                title="Guest Confirmation" 
                description="Finalize guest count and seating arrangements" 
              />
              <TimelineItem 
                date="2 weeks before" 
                title="Wedding Rehearsal" 
                description="Practice ceremony with wedding party" 
              />
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
};

interface QuickActionCardProps {
  title: string;
  description: string;
  icon: React.ElementType;
  to: string;
}

const QuickActionCard = ({ title, description, icon: Icon, to }: QuickActionCardProps) => (
  <Link to={to} className="block h-full">
    <Card className="h-full transition-all hover:shadow-lg hover:-translate-y-1 overflow-hidden group">
      <div className="absolute top-0 right-0 w-20 h-20 bg-primary/5 rounded-full -mr-10 -mt-10 group-hover:bg-primary/10 transition-all" />
      <CardContent className="p-6 relative">
        <div className="rounded-full bg-primary/10 w-10 h-10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-all">
          <Icon className="w-5 h-5 text-primary" />
        </div>
        <h3 className="font-medium text-lg mb-1">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  </Link>
);

interface TimelineItemProps {
  date: string;
  title: string;
  description: string;
  active?: boolean;
}

const TimelineItem = ({ date, title, description, active = false }: TimelineItemProps) => (
  <div className="relative transition-all duration-300 hover:translate-x-1 group">
    <div className={`absolute w-8 h-8 rounded-full -left-[21px] top-0 flex items-center justify-center 
      ${active 
        ? "bg-gradient-to-br from-primary to-primary/80 shadow-md shadow-primary/20" 
        : "bg-white border-2 border-primary/30"
      } transition-all duration-300 group-hover:scale-110`}>
      {active && <div className="w-2 h-2 rounded-full bg-white animate-pulse-soft"></div>}
    </div>
    <div className="pl-6">
      <div className={`${active ? "text-primary font-medium" : "text-muted-foreground"} text-sm mb-2 transition-colors group-hover:text-primary/80`}>
        {date}
      </div>
      <h3 className={`font-medium text-lg mb-2 transition-colors ${active ? "text-primary" : ""} group-hover:text-primary/90`}>
        {title}
      </h3>
      <p className="text-muted-foreground text-sm mb-3">{description}</p>
      {active && (
        <Button variant="outline" size="sm" className="text-xs text-primary border-primary/30 hover:bg-primary/5 hover:text-primary hover:border-primary/50">
          Update status
        </Button>
      )}
    </div>
  </div>
);

export default UserHomepage;
