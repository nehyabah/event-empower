
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/home/Footer";
import { Button } from "@/components/ui/button";
import { Check, Star } from "lucide-react";

const PricingTier = ({ 
  title, 
  price, 
  description, 
  features, 
  buttonText, 
  highlighted = false 
}: { 
  title: string; 
  price: string; 
  description: string; 
  features: string[]; 
  buttonText: string; 
  highlighted?: boolean;
}) => {
  return (
    <div className={`glass rounded-xl p-8 transition-all duration-300 hover:shadow-elegant hover:translate-y-[-4px] ${highlighted ? 'border-2 border-primary shadow-elegant relative' : 'border border-border/30'}`}>
      {highlighted && (
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-medium flex items-center">
          <Star className="w-3.5 h-3.5 mr-1.5" fill="currentColor" strokeWidth={0} />
          Most Popular
        </div>
      )}
      <h3 className="text-2xl font-serif mb-2 tracking-tight">{title}</h3>
      <div className="mb-4">
        <span className="text-3xl font-bold">₦{price}</span>
        {price !== "Free" && <span className="text-muted-foreground">/month</span>}
      </div>
      <p className="text-muted-foreground mb-6">{description}</p>
      <ul className="space-y-3 mb-8">
        {features.map((feature, index) => (
          <li key={index} className="flex items-start gap-2.5">
            <Check className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
            <span className="text-sm leading-relaxed">{feature}</span>
          </li>
        ))}
      </ul>
      <Button className={`w-full font-medium ${highlighted ? '' : 'bg-muted hover:bg-muted/80 text-foreground'}`}>
        {buttonText}
      </Button>
    </div>
  );
};

const PricingPage = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="pt-24 flex-grow">
        <div className="container mx-auto px-4 py-20">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-serif mb-6 font-medium tracking-tight">
              <span className="text-gradient">Transparent</span> Pricing
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto leading-relaxed">
              Choose the plan that perfectly complements your wedding vision and needs.
              No hidden fees, just clarity for your special day.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <PricingTier 
              title="Basic" 
              price="Free" 
              description="Perfect for couples just getting started"
              features={[
                "Basic event planning tools",
                "Limited task management",
                "Access to public vendor listings",
                "Simple wedding countdown",
                "Up to 50 guests"
              ]}
              buttonText="Get Started"
            />
            
            <PricingTier 
              title="Premium" 
              price="9,999" 
              description="Most popular for typical Nigerian weddings"
              features={[
                "Advanced planning tools",
                "Full task management & delegation",
                "Complete vendor directory",
                "Custom wedding website",
                "Up to 300 guests",
                "Budget tracking tools"
              ]}
              buttonText="Choose Premium"
              highlighted={true}
            />
            
            <PricingTier 
              title="Luxury" 
              price="24,999" 
              description="For elaborate celebrations with all the extras"
              features={[
                "All Premium features",
                "Unlimited guests",
                "Priority vendor access",
                "Advanced budget analytics",
                "Dedicated planning support",
                "Custom event app for guests",
                "VIP vendor discounts"
              ]}
              buttonText="Choose Luxury"
            />
          </div>
          
          <div className="mt-20 text-center max-w-xl mx-auto">
            <h3 className="font-serif text-2xl mb-4">Need a Custom Solution?</h3>
            <p className="text-muted-foreground mb-6">
              For larger celebrations or special requirements, contact us for a tailored package 
              that meets all your unique needs.
            </p>
            <Button variant="outline" className="button-hover">
              Contact Us
            </Button>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default PricingPage;
