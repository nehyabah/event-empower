
import { cn } from "@/lib/utils";
import { Quote } from "lucide-react";
import { CSSProperties } from "react";

interface TestimonialProps {
  quote: string;
  author: string;
  role: string;
  image?: string;
  className?: string;
  style?: CSSProperties;
}

const Testimonial = ({ quote, author, role, image, className, style }: TestimonialProps) => {
  return (
    <div 
      className={cn(
        "glass rounded-xl p-8 transition-all hover:shadow-elegant hover:translate-y-[-5px] duration-300 border border-white/5",
        className
      )}
      style={style}
    >
      <Quote className="w-10 h-10 text-wedding-gold opacity-40 mb-6" />
      <p className="text-lg mb-8 font-medium leading-relaxed italic text-foreground/90">"{quote}"</p>
      <div className="flex items-center">
        {image && (
          <div className="w-12 h-12 rounded-full overflow-hidden mr-4 border border-wedding-gold/20">
            <img src={image} alt={author} className="w-full h-full object-cover" />
          </div>
        )}
        <div>
          <p className="font-medium">{author}</p>
          <p className="text-muted-foreground text-sm">{role}</p>
        </div>
      </div>
    </div>
  );
};

const Testimonials = () => {
  return (
    <section className="py-28 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 right-1/4 w-64 h-64 bg-wedding-sage/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-1/4 w-64 h-64 bg-wedding-gold/10 rounded-full blur-3xl" />
      
      <div className="container relative z-10">
        <div className="text-center max-w-2xl mx-auto mb-20">
          <span className="inline-block px-3 py-1 text-sm font-medium bg-wedding-sage/10 text-wedding-sage rounded-full mb-4">
            Testimonials
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif mb-6 font-medium tracking-tight">
            Loved by Nigerian Couples
          </h2>
          <p className="text-muted-foreground text-lg leading-relaxed">
            Hear from couples who used Planr to create their perfect Nigerian wedding celebration.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <Testimonial
            quote="Planr made planning our traditional Igbo wedding and white wedding seamless. The vendor recommendations in Enugu were spot-on!"
            author="Chioma & Emeka"
            role="Married in Enugu"
            image="https://images.unsplash.com/photo-1541216970279-affbfdd55aa8?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=774&q=80"
            className="animate-fade-in-up"
          />
          
          <Testimonial
            quote="The customized task list for our Yoruba traditional engagement saved us so much time. We found amazing vendors in Lagos through the platform."
            author="Yewande & Femi"
            role="Married in Lagos"
            image="https://images.unsplash.com/photo-1523824921871-d6f1a15151f1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=774&q=80"
            className="animate-fade-in-up"
            style={{ animationDelay: "150ms" }}
          />
          
          <Testimonial
            quote="As a wedding planner in Abuja, I recommend Planr to all my clients. The regional focus makes it perfect for Nigerian weddings."
            author="Fatima Yusuf"
            role="Wedding Planner in Abuja"
            image="https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=774&q=80"
            className="animate-fade-in-up"
            style={{ animationDelay: "300ms" }}
          />
        </div>
        
        <div className="flex justify-center">
          <div className="flex space-x-3">
            <span className="w-3 h-3 rounded-full bg-wedding-gold/30" />
            <span className="w-8 h-3 rounded-full bg-wedding-gold" />
            <span className="w-3 h-3 rounded-full bg-wedding-gold/30" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
