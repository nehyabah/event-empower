import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import AuthModal from "@/components/auth/AuthModal";
import {
  ArrowRight,
  UsersRound,
  ListTodo,
  Sparkles,
  Gem,
  BadgeCheck,
} from "lucide-react";
import { Link } from "react-router-dom";

const Hero = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div className="flex flex-col w-full">
      {/* Video Hero Section */}
      <section className="relative h-[110vh] min-h-[800px] w-full overflow-hidden">
        {/* Video Background with Parallax-like feel */}
        <div className="absolute inset-0 w-full h-full z-0">
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/20 to-zinc-950 z-10"></div>
          <video
            className="w-full h-full object-cover scale-105"
            autoPlay
            muted
            loop
            playsInline
          >
            <source
              src="https://res.cloudinary.com/dfjv35kht/video/upload/v1741438100/8775884-hd_1920_1080_25fps_mjcobz.mp4"
              type="video/mp4"
            />
            Your browser does not support the video tag.
          </video>
        </div>

        {/* Main Content Container */}
        <div className="container relative z-20 h-full flex flex-col justify-center pt-20 pb-32">
          <div
            className={`flex flex-col max-w-4xl mx-auto space-y-8 transition-all duration-1000 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
          >
            {/* Social Proof Pill */}
            <div className="flex justify-center md:justify-start">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white/90 text-sm font-medium animate-fade-in">
                <div className="flex -space-x-2">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="w-6 h-6 rounded-full bg-gray-200 border-2 border-black flex items-center justify-center overflow-hidden"
                    >
                      <img
                        src={`https://picsum.photos/32/32?random=${i}`}
                        alt="user"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
                <span className="pl-1">Trusted by 2,000+ couples</span>
              </div>
            </div>

            {/* Main heading with Editorial Typography */}
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif font-medium tracking-tight text-white text-center md:text-left leading-[1.1]">
              <span className="block text-white/90">Curate Your</span>
              <span className="block italic text-wedding-gold relative inline-block">
                Perfect Day
                <Sparkles className="absolute -top-6 -right-8 w-8 h-8 text-white/60 animate-pulse hidden md:block" />
              </span>
            </h1>

            <p className="text-lg md:text-xl text-white/80 max-w-xl text-center md:text-left font-light leading-relaxed">
              Experience the new standard in wedding planning. Seamlessly
              connect with elite vendors and manage every detail in one elegant
              dashboard.
            </p>

            {/* Call-to-action buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4 justify-center md:justify-start items-center md:items-start">
              <AuthModal
                defaultTab="register"
                triggerClassName="w-full sm:w-auto"
                trigger={
                  <Button
                    size="lg"
                    className="w-full sm:w-auto px-8 py-7 text-lg bg-white text-black hover:bg-wedding-gold hover:text-white border-none rounded-none transition-all duration-300 font-medium tracking-wide shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:shadow-[0_0_30px_rgba(212,175,55,0.4)]"
                  >
                    Start Planning Free
                  </Button>
                }
              />
              <Link to="/features" className="w-full sm:w-auto">
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full sm:w-auto px-8 py-7 text-lg bg-transparent border-white/40 text-white hover:bg-white hover:text-black rounded-none backdrop-blur-sm transition-all duration-300 group"
                >
                  Explore Features
                  <ArrowRight className="ml-2 w-5 h-5 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2 text-white/50 animate-bounce">
          <span className="text-[10px] uppercase tracking-widest">Scroll</span>
          <div className="w-[1px] h-12 bg-gradient-to-b from-white to-transparent"></div>
        </div>
      </section>

      {/* Floating Features Section - Breaks the grid by overlapping the video */}
      <section className="relative z-30 -mt-24 pb-24 px-4">
        <div className="container max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Card 1 */}
            <div className="group relative p-8 bg-white/95 backdrop-blur-xl border border-white/20 shadow-2xl hover:-translate-y-2 transition-all duration-500 rounded-2xl overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                <UsersRound className="w-24 h-24 text-wedding-gold" strokeWidth={1.3} />
              </div>
              <div className="relative z-10">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-white via-wedding-gold/10 to-wedding-gold/20 text-wedding-gold flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500 shadow-sm">
                  <UsersRound className="w-6 h-6" strokeWidth={1.4} />
                </div>
                <h3 className="text-2xl font-serif font-medium mb-3 text-gray-900">
                  Curated Vendors
                </h3>
                <p className="text-gray-500 leading-relaxed mb-6">
                  Discover and connect with hand-picked local artisans and
                  professionals who align with your aesthetic.
                </p>
                <div className="flex items-center text-sm font-medium text-wedding-gold opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-2 group-hover:translate-y-0">
                  Browse Directory <ArrowRight className="w-4 h-4 ml-1" />
                </div>
              </div>
            </div>

            {/* Card 2 - Featured/Middle */}
            <div className="group relative p-8 bg-zinc-900 text-white shadow-2xl hover:-translate-y-4 transition-all duration-500 rounded-2xl overflow-hidden md:-mt-8 md:mb-8 border border-zinc-800">
              <div className="absolute inset-0 bg-gradient-to-br from-wedding-gold/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
              <div className="relative z-10">
                <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center mb-6 group-hover:rotate-12 transition-transform duration-500">
                  <Gem className="w-6 h-6 text-white" strokeWidth={1.4} />
                </div>
                <h3 className="text-2xl font-serif font-medium mb-3">
                  Vision Board
                </h3>
                <p className="text-zinc-400 leading-relaxed mb-6">
                  Access premium templates and style guides. Visualize your
                  perfect day before it happens.
                </p>
                <ul className="space-y-2 text-sm text-zinc-300">
                  <li className="flex items-center gap-2">
                    <BadgeCheck className="w-4 h-4 text-wedding-gold" /> Drag
                    & Drop Planning
                  </li>
                  <li className="flex items-center gap-2">
                    <BadgeCheck className="w-4 h-4 text-wedding-gold" />{" "}
                    Budget Tracking
                  </li>
                </ul>
              </div>
            </div>

            {/* Card 3 */}
            <div className="group relative p-8 bg-white/95 backdrop-blur-xl border border-white/20 shadow-2xl hover:-translate-y-2 transition-all duration-500 rounded-2xl overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                <ListTodo className="w-24 h-24 text-wedding-sage" strokeWidth={1.3} />
              </div>
              <div className="relative z-10">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-white via-wedding-sage/10 to-wedding-sage/20 text-wedding-sage flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500 shadow-sm">
                  <ListTodo className="w-6 h-6" strokeWidth={1.4} />
                </div>
                <h3 className="text-2xl font-serif font-medium mb-3 text-gray-900">
                  Intelligent Tasks
                </h3>
                <p className="text-gray-500 leading-relaxed mb-6">
                  Automated checklists that adapt to your wedding date. Never
                  miss a deadline or deposit again.
                </p>
                <div className="flex items-center text-sm font-medium text-wedding-sage opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-2 group-hover:translate-y-0">
                  View Demo <ArrowRight className="w-4 h-4 ml-1" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Hero;
