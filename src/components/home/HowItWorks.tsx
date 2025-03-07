
import { Button } from "@/components/ui/button";
import AuthModal from '@/components/auth/AuthModal';

const HowItWorks = () => {
  return (
    <section className="py-20">
      <div className="container">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-serif mb-4">How Planr Works</h2>
          <p className="text-muted-foreground">
            Our simple process helps you plan your perfect Nigerian wedding from start to finish.
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
          <div className="flex flex-col items-center text-center animate-fade-in-up">
            <div className="w-16 h-16 rounded-full bg-wedding-gold/10 text-wedding-gold flex items-center justify-center text-2xl font-medium mb-4">
              1
            </div>
            <h3 className="text-xl font-medium font-serif mb-2">Create Your Event</h3>
            <p className="text-muted-foreground">
              Sign up and create your wedding profile. Choose your region, wedding type, and set your date.
            </p>
          </div>
          
          <div className="flex flex-col items-center text-center animate-fade-in-up" style={{ animationDelay: "200ms" }}>
            <div className="w-16 h-16 rounded-full bg-wedding-sage/10 text-wedding-sage flex items-center justify-center text-2xl font-medium mb-4">
              2
            </div>
            <h3 className="text-xl font-medium font-serif mb-2">Manage Tasks & Vendors</h3>
            <p className="text-muted-foreground">
              Use your personalized checklist to track progress and connect with local vendors in your region.
            </p>
          </div>
          
          <div className="flex flex-col items-center text-center animate-fade-in-up" style={{ animationDelay: "400ms" }}>
            <div className="w-16 h-16 rounded-full bg-wedding-burgundy/10 text-wedding-burgundy flex items-center justify-center text-2xl font-medium mb-4">
              3
            </div>
            <h3 className="text-xl font-medium font-serif mb-2">Share & Celebrate</h3>
            <p className="text-muted-foreground">
              Create a beautiful countdown page to share with guests and keep everyone informed about your big day.
            </p>
          </div>
        </div>
        
        <div className="glass rounded-2xl p-8 md:p-12 relative overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute -top-12 -right-12 w-48 h-48 bg-wedding-gold/10 rounded-full blur-2xl" />
          <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-wedding-burgundy/10 rounded-full blur-2xl" />
          
          <div className="relative z-10 flex flex-col lg:flex-row gap-8 md:gap-12 items-center">
            <div className="flex-1">
              <h3 className="text-2xl md:text-3xl font-serif mb-4">
                Ready to Plan Your Dream Nigerian Wedding?
              </h3>
              <p className="text-muted-foreground mb-6">
                Join thousands of couples who have planned successful Nigerian weddings with Planr. Our platform understands local traditions, vendors, and timelines.
              </p>
              <div className="flex flex-wrap gap-4">
                <AuthModal 
                  defaultTab="register" 
                  triggerClassName="px-6 py-2.5 shadow-elegant"
                />
                <Button variant="outline" className="px-6 py-2.5 button-hover">
                  Learn More
                </Button>
              </div>
            </div>
            
            <div className="lg:flex-1 w-full max-w-md">
              <div className="aspect-square rounded-xl overflow-hidden">
                <img 
                  src="https://images.unsplash.com/photo-1511285560929-80b456fea0bc?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=869&q=80" 
                  alt="Couple planning their wedding"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
