
import Navbar from "@/components/layout/Navbar";
import Features from "@/components/home/Features";
import Footer from "@/components/home/Footer";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import AuthModal from "@/components/auth/AuthModal";

const FeaturesPage = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="pt-24 flex-grow">
        <div className="container max-w-4xl mx-auto px-4 py-20">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-serif mb-6 font-medium tracking-tight">
              Elegant <span className="text-gradient">Features</span> for Your Dream Celebration
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto leading-relaxed">
              Discover how Planr makes planning cultural ceremonies simpler, 
              more organized, and culturally appropriate with our thoughtfully designed features.
            </p>
            <div className="mt-8">
              <AuthModal 
                defaultTab="register" 
                trigger={
                  <Button className="button-hover group">
                    Start Planning <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                }
              />
            </div>
          </div>
        </div>
        <Features />
      </div>
      <Footer />
    </div>
  );
};

export default FeaturesPage;
