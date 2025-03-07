
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Hero from "@/components/home/Hero";
import Features from "@/components/home/Features";
import HowItWorks from "@/components/home/HowItWorks";
import Testimonials from "@/components/home/Testimonials";
import Footer from "@/components/home/Footer";

const Index = () => {
  const navigate = useNavigate();
  const isAuthenticated = localStorage.getItem("authenticated") === "true";
  const userType = localStorage.getItem("userType");
  
  // Redirect vendors to vendor homepage if they're authenticated
  useEffect(() => {
    if (isAuthenticated && userType === "vendor") {
      navigate("/vendor-home");
    }
  }, [isAuthenticated, userType, navigate]);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <Hero />
        <Features />
        <HowItWorks />
        <Testimonials />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
