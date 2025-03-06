
import Navbar from "@/components/layout/Navbar";
import Features from "@/components/home/Features";
import Footer from "@/components/home/Footer";

const FeaturesPage = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="pt-24 flex-grow">
        <div className="container max-w-4xl mx-auto px-4 py-16">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-serif mb-4">Our Features</h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Discover how EventEmpower makes planning Nigerian weddings simpler, 
              more organized, and culturally appropriate.
            </p>
          </div>
        </div>
        <Features />
      </div>
      <Footer />
    </div>
  );
};

export default FeaturesPage;
