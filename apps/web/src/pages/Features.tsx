import Navbar from "@/components/layout/Navbar";
import Features from "@/components/home/Features";
import Footer from "@/components/home/Footer";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import AuthModal from "@/components/auth/AuthModal";

const FeaturesPage = () => {
  return (
    <div className="min-h-screen flex flex-col bg-zinc-50">
      <Navbar />

      <main className="flex-grow pt-32">
        {/* Header Section */}
        <section className="container mx-auto px-4 mb-20">
          <div className="max-w-4xl mx-auto text-center space-y-8 animate-fade-in-up">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-zinc-200 shadow-sm mb-4">
              <span className="text-xs font-bold tracking-widest uppercase text-zinc-500">
                Features
              </span>
            </div>

            <h1 className="text-5xl md:text-7xl font-serif font-medium text-zinc-900 tracking-tight leading-[1.1]">
              Tools designed for <br />
              <span className="italic text-zinc-500">modern romance.</span>
            </h1>

            <p className="text-xl text-zinc-500 font-light leading-relaxed max-w-2xl mx-auto">
              Your website, invitations, guest replies, budget and vendors —
              kept together, so you stop stitching a wedding out of group chats
              and spreadsheets.
            </p>

          </div>
        </section>

        {/* Features Grid Component */}
        <Features />

        {/* Bottom CTA */}
        <section className="container mx-auto px-4 py-24">
          <div className="bg-zinc-900 rounded-[2.5rem] p-12 md:p-24 text-center relative overflow-hidden shadow-2xl">
            {/* Abstract shapes */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-30">
              <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-zinc-800 rounded-full blur-3xl"></div>
              <div className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] bg-zinc-800 rounded-full blur-3xl"></div>
            </div>

            <div className="relative z-10 max-w-3xl mx-auto space-y-8">
              <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-6 backdrop-blur-sm">
                <Heart className="w-8 h-8 text-white" />
              </div>

              <h2 className="text-4xl md:text-6xl font-serif font-medium text-white tracking-tight">
                Ready to start planning?
              </h2>

              <p className="text-zinc-400 text-lg font-light max-w-xl mx-auto leading-relaxed">
                Join thousands of couples who have simplified their journey to
                the altar. Experience the difference today.
              </p>

              <div className="pt-8">
                <AuthModal
                  defaultTab="register"
                  trigger={
                    <Button className="h-auto px-10 py-6 text-lg bg-white text-zinc-900 hover:bg-zinc-200 rounded-full font-medium transition-all hover:scale-105 shadow-xl shadow-zinc-900/50">
                      Create Free Account
                    </Button>
                  }
                />
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default FeaturesPage;
