
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
          
          {/* Important Dates */}
          <section className="py-6">
            <h2 className="text-2xl font-serif mb-6">Your Wedding Timeline</h2>
            <div className="relative pl-10 space-y-6 max-w-2xl before:absolute before:left-4 before:top-2 before:bottom-2 before:w-0.5 before:bg-primary/30">
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
  <div className="relative">
    <div className={`absolute w-6 h-6 rounded-full border-2 -left-11 top-0 ${
      active 
        ? "bg-primary border-primary" 
        : "bg-background border-primary/30"
    }`} />
    <div className={`${active ? "text-primary font-medium" : "text-muted-foreground"} text-sm mb-1`}>
      {date}
    </div>
    <h3 className="font-medium text-lg">{title}</h3>
    <p className="text-muted-foreground">{description}</p>
    {active && (
      <Button variant="link" className="p-0 h-auto text-primary mt-1">
        Update status
      </Button>
    )}
  </div>
);

export default UserHomepage;
