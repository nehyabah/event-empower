
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/home/Footer";
import ProjectStats from "@/components/dashboard/ProjectStats";
import WeddingCountdown from "@/components/dashboard/WeddingCountdown";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CalendarDays, ListTodo, CreditCard, Users, Pencil } from "lucide-react";
import { Link } from "react-router-dom";

const UserHomepage = () => {
  // Retrieve user information (in a real app, this would come from your auth context)
  const userEmail = localStorage.getItem("userEmail") || "user@example.com";
  const firstName = userEmail.split('@')[0].split('.')[0];
  const capitalizedName = firstName.charAt(0).toUpperCase() + firstName.slice(1);
  
  // Mock wedding date - in a real app, this would come from your database
  const weddingDate = "2024-12-31";
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow pt-24 pb-16">
        <div className="container mx-auto px-4 space-y-10">
          {/* Welcome Section */}
          <section className="text-center md:text-left">
            <h1 className="font-serif text-3xl md:text-4xl mb-2">
              Welcome back, <span className="text-primary">{capitalizedName}</span>!
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl">
              Continue planning your perfect Nigerian wedding. Here's what needs your attention.
            </p>
          </section>
          
          {/* Countdown Timer */}
          <WeddingCountdown weddingDate={weddingDate} />
          
          {/* Quick Stats */}
          <section className="py-6">
            <h2 className="text-2xl font-serif mb-6">Wedding Planning Progress</h2>
            <ProjectStats />
          </section>
          
          {/* Quick Actions */}
          <section className="py-6">
            <h2 className="text-2xl font-serif mb-6">Quick Actions</h2>
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
          
          {/* Elegant Wedding Timeline */}
          <section className="py-8">
            <h2 className="text-2xl font-serif mb-8">Your Wedding Timeline</h2>
            <div className="relative pl-12 space-y-10 max-w-3xl before:absolute before:left-4 before:top-3 before:bottom-10 before:w-[2px] 
              before:bg-gradient-to-b before:from-primary/10 before:via-primary/50 before:to-primary/20">
              <TimelineItem 
                date="8 weeks before" 
                title="Final Venue Visit" 
                description="Confirm all venue details and arrangements" 
              />
              <TimelineItem 
                date="6 weeks before" 
                title="Traditional Outfits" 
                description="Final fittings for traditional attire" 
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

// Helper Components
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
