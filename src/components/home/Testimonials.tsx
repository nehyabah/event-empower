
import { cn } from "@/lib/utils";
import { Quote } from "lucide-react";
import { CSSProperties } from "react";

interface TestimonialProps {
  quote: string;
  author: string;
  role: string;
  className?: string;
  style?: CSSProperties;
}

const Testimonial = ({ quote, author, role, className, style }: TestimonialProps) => {
  return (
    <div 
      className={cn(
        "glass rounded-xl p-6 md:p-8 transition-all",
        className
      )}
      style={style}
    >
      <Quote className="w-10 h-10 text-wedding-gold opacity-30 mb-4" />
      <p className="text-lg mb-6 font-medium italic">"{quote}"</p>
      <div>
        <p className="font-medium">{author}</p>
        <p className="text-muted-foreground text-sm">{role}</p>
      </div>
    </div>
  );
};

const Testimonials = () => {
  return (
    <section className="py-20 bg-gradient-to-b from-background to-secondary/30">
      <div className="container">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-serif mb-4">
            Loved by Nigerian Couples
          </h2>
          <p className="text-muted-foreground">
            Hear from couples who used EventEmpower to plan their perfect Nigerian wedding.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          <Testimonial
            quote="EventEmpower made planning our traditional Igbo wedding and white wedding seamless. The vendor recommendations in Enugu were spot-on!"
            author="Chioma & Emeka"
            role="Married in Enugu"
            className="animate-fade-in-up"
          />
          
          <Testimonial
            quote="The customized task list for our Yoruba traditional engagement saved us so much time. We found amazing vendors in Lagos through the platform."
            author="Yewande & Femi"
            role="Married in Lagos"
            className="animate-fade-in-up"
            style={{ animationDelay: "150ms" }}
          />
          
          <Testimonial
            quote="As a wedding planner in Abuja, I recommend EventEmpower to all my clients. The regional focus makes it perfect for Nigerian weddings."
            author="Fatima Yusuf"
            role="Wedding Planner in Abuja"
            className="animate-fade-in-up"
            style={{ animationDelay: "300ms" }}
          />
        </div>
        
        <div className="flex justify-center">
          <div className="flex space-x-2">
            <span className="w-3 h-3 rounded-full bg-wedding-gold/30" />
            <span className="w-3 h-3 rounded-full bg-wedding-gold" />
            <span className="w-3 h-3 rounded-full bg-wedding-gold/30" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
