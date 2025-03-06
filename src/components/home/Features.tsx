
import { Calendar, Landmark, Users, MapPin, CheckCircle2, Clock, ListChecks, BarChart4 } from "lucide-react";
import { cn } from "@/lib/utils";

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  className?: string;
  iconClassName?: string;
}

const FeatureCard = ({ 
  icon, 
  title, 
  description, 
  className, 
  iconClassName 
}: FeatureCardProps) => {
  return (
    <div className={cn(
      "glass rounded-xl p-6 transition-all hover:shadow-elegant hover:translate-y-[-2px]",
      className
    )}>
      <div className={cn(
        "w-12 h-12 rounded-lg flex items-center justify-center bg-primary/10 text-primary mb-4",
        iconClassName
      )}>
        {icon}
      </div>
      <h3 className="text-xl font-medium font-serif mb-2">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  );
};

const Features = () => {
  return (
    <section className="py-20 bg-secondary/50">
      <div className="container">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-serif mb-4">Everything You Need For Your Nigerian Wedding</h2>
          <p className="text-muted-foreground">
            Our platform is designed with Nigerian cultural nuances in mind, providing tools that respect tradition while embracing modern planning approaches.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <FeatureCard
            icon={<MapPin className="w-6 h-6" />}
            title="Region-Specific Planning"
            description="Find vendors and event details tailored to your specific Nigerian region, from Lagos to Abuja and beyond."
            className="animate-fade-in-up"
          />
          
          <FeatureCard
            icon={<Calendar className="w-6 h-6" />}
            title="Cultural Event Templates"
            description="Access templates for traditional engagement, white wedding, and other culturally significant ceremonies."
            className="animate-fade-in-up"
            iconClassName="bg-wedding-sage/20 text-wedding-sage"
            style={{ animationDelay: "100ms" }}
          />
          
          <FeatureCard
            icon={<Users className="w-6 h-6" />}
            title="Vendor Directory"
            description="Connect with trusted local vendors who understand Nigerian wedding traditions and expectations."
            className="animate-fade-in-up"
            iconClassName="bg-wedding-blush/20 text-wedding-burgundy"
            style={{ animationDelay: "200ms" }}
          />
          
          <FeatureCard
            icon={<ListChecks className="w-6 h-6" />}
            title="Smart Task Management"
            description="Auto-generated task lists based on your wedding type with timelines customized for Nigerian events."
            className="animate-fade-in-up"
            iconClassName="bg-wedding-burgundy/20 text-wedding-burgundy"
            style={{ animationDelay: "300ms" }}
          />
          
          <FeatureCard
            icon={<Clock className="w-6 h-6" />}
            title="Countdown & Timeline"
            description="Beautiful countdown pages to share with guests and detailed timelines for your big day."
            className="animate-fade-in-up"
            iconClassName="bg-wedding-navy/20 text-wedding-navy"
            style={{ animationDelay: "400ms" }}
          />
          
          <FeatureCard
            icon={<BarChart4 className="w-6 h-6" />}
            title="Budget Management"
            description="Track expenses, manage vendor payments, and stay on budget with tools designed for Nigerian wedding costs."
            className="animate-fade-in-up"
            iconClassName="bg-wedding-gold/20 text-wedding-gold"
            style={{ animationDelay: "500ms" }}
          />
        </div>
      </div>
    </section>
  );
};

export default Features;
