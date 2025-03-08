
import { Calendar, Users, MapPin, CheckCircle2, Clock, ListChecks, BarChart4, Camera, Palette } from "lucide-react";
import { cn } from "@/lib/utils";
import { CSSProperties } from "react";

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  className?: string;
  iconClassName?: string;
  style?: CSSProperties;
}

const FeatureCard = ({ 
  icon, 
  title, 
  description, 
  className, 
  iconClassName,
  style
}: FeatureCardProps) => {
  return (
    <div 
      className={cn(
        "glass rounded-xl p-7 transition-all hover:shadow-elegant hover:translate-y-[-3px] duration-300 border border-white/5",
        className
      )}
      style={style}
    >
      <div className={cn(
        "w-14 h-14 rounded-xl flex items-center justify-center bg-primary/10 text-primary mb-6",
        iconClassName
      )}>
        {icon}
      </div>
      <h3 className="text-xl font-medium font-serif mb-3 tracking-tight">{title}</h3>
      <p className="text-muted-foreground leading-relaxed">{description}</p>
    </div>
  );
};

const Features = () => {
  return (
    <section className="py-28 bg-gradient-to-b from-background via-secondary/30 to-background relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 left-1/4 w-64 h-64 bg-wedding-blush/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-wedding-sage/10 rounded-full blur-3xl" />
      
      <div className="container relative z-10">
        <div className="text-center max-w-2xl mx-auto mb-20">
          <span className="inline-block px-3 py-1 text-sm font-medium bg-wedding-gold/10 text-wedding-gold rounded-full mb-4">
            Features
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif mb-6 font-medium tracking-tight">
            Curated for Your <span className="text-gradient">Traditional Celebration</span>
          </h2>
          <p className="text-muted-foreground text-lg leading-relaxed">
            Our platform embraces cultural nuances, providing tools that respect tradition 
            while offering modern planning solutions.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          <FeatureCard
            icon={<MapPin className="w-6 h-6" />}
            title="Region-Specific Planning"
            description="Find vendors and event details tailored to your specific region, from Lagos to Abuja and beyond."
            className="animate-fade-in-up"
          />
          
          <FeatureCard
            icon={<Calendar className="w-6 h-6" />}
            title="Cultural Event Templates"
            description="Access templates for traditional engagement, ceremonial events, and other culturally significant celebrations."
            className="animate-fade-in-up"
            iconClassName="bg-wedding-sage/20 text-wedding-sage"
            style={{ animationDelay: "100ms" }}
          />
          
          <FeatureCard
            icon={<Users className="w-6 h-6" />}
            title="Vendor Directory"
            description="Connect with trusted local vendors who understand traditional customs and expectations."
            className="animate-fade-in-up"
            iconClassName="bg-wedding-blush/20 text-wedding-burgundy"
            style={{ animationDelay: "200ms" }}
          />
          
          <FeatureCard
            icon={<ListChecks className="w-6 h-6" />}
            title="Smart Task Management"
            description="Auto-generated task lists based on your celebration type with timelines customized for traditional events."
            className="animate-fade-in-up"
            iconClassName="bg-wedding-burgundy/20 text-wedding-burgundy"
            style={{ animationDelay: "300ms" }}
          />
          
          <FeatureCard
            icon={<Camera className="w-6 h-6" />}
            title="Photo Collections"
            description="Create and share beautiful galleries of your celebration preparations and special day with family and friends."
            className="animate-fade-in-up"
            iconClassName="bg-wedding-navy/20 text-wedding-navy"
            style={{ animationDelay: "400ms" }}
          />
          
          <FeatureCard
            icon={<BarChart4 className="w-6 h-6" />}
            title="Budget Management"
            description="Track expenses, manage vendor payments, and stay on budget with tools designed for ceremonial event costs."
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
