import { Button } from "@/components/ui/button";
import AuthModal from "@/components/auth/AuthModal";
import { Link } from "react-router-dom";
import { ArrowRight, WandSparkles, Handshake, ClipboardCheck } from "lucide-react";
import type { ReactNode } from "react";

const Step = ({
  number,
  title,
  description,
  isLast,
  icon,
}: {
  number: string;
  title: string;
  description: string;
  isLast?: boolean;
  icon: ReactNode;
}) => (
  <div className="group relative flex flex-col items-start p-8 rounded-3xl transition-all duration-500 hover:bg-white hover:shadow-[0_8px_40px_-12px_rgba(0,0,0,0.1)] hover:-translate-y-1">
    {/* Decorative Line */}
    {!isLast && (
      <div className="hidden md:block absolute top-[5.5rem] left-[6rem] w-[calc(100%-3rem)] h-[1px] bg-gradient-to-r from-zinc-200 to-transparent z-0"></div>
    )}

    <div className="relative z-10 flex items-center gap-3 mb-8">
      <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-white via-zinc-50 to-zinc-100 border border-zinc-100 text-zinc-900 shadow-sm group-hover:scale-110 group-hover:text-white group-hover:border-zinc-900 group-hover:from-zinc-900 group-hover:via-zinc-900 group-hover:to-zinc-900 transition-all duration-500 ease-out">
        {icon}
      </div>
      <span className="text-xs uppercase tracking-[0.35em] text-zinc-400">
        {number}
      </span>
    </div>

    <h3 className="text-2xl font-serif font-medium mb-4 text-zinc-900 group-hover:translate-x-2 transition-transform duration-300">
      {title}
    </h3>
    <p className="text-zinc-500 leading-relaxed font-light text-lg group-hover:text-zinc-600 transition-colors">
      {description}
    </p>
  </div>
);

const HowItWorks = () => {
  return (
    <section className="py-32 bg-zinc-50/50 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-zinc-100 rounded-full blur-3xl opacity-50"></div>
        <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-zinc-100 rounded-full blur-3xl opacity-50"></div>
      </div>

      <div className="container mx-auto px-4 max-w-6xl relative z-10">
        {/* Header - Simple & Centered */}
        <div className="text-center max-w-3xl mx-auto mb-24 animate-fade-in-up">
          <span className="text-xs font-bold tracking-[0.2em] text-zinc-400 uppercase mb-6 block">
            The Process
          </span>
          <h2 className="text-4xl md:text-6xl font-serif font-medium text-zinc-900 mb-8 tracking-tight">
            Planning made{" "}
            <span className="italic text-zinc-500">effortless</span>.
          </h2>
          <p className="text-xl text-zinc-500 font-light leading-relaxed">
            We've distilled the complexity of wedding planning into three
            elegant stages, giving you clarity from day one.
          </p>
        </div>

        {/* Steps - Clean Horizontal Flow */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-24">
          <Step
            number="01"
            icon={<WandSparkles className="w-6 h-6" strokeWidth={1.5} />}
            title="Start your profile"
            description="Share your wedding date and location. We'll automatically generate a custom checklist tailored to your specific timeline."
          />
          <Step
            number="02"
            icon={<Handshake className="w-6 h-6" strokeWidth={1.5} />}
            title="Connect with vendors"
            description="Browse our curated network of local professionals. Compare portfolios, pricing, and availability in one place."
          />
          <Step
            number="03"
            title="Manage details"
            isLast
            icon={<ClipboardCheck className="w-6 h-6" strokeWidth={1.5} />}
            description="From guest lists to seating charts, keep every detail organized in your unified dashboard until the big day."
          />
        </div>

        {/* Minimal CTA */}
        <div className="flex flex-col items-center justify-center space-y-8">
          <div className="h-24 w-[1px] bg-gradient-to-b from-zinc-200 to-transparent mb-2"></div>
          <p className="text-zinc-900 font-serif text-3xl italic">
            Ready to begin?
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <AuthModal
              defaultTab="register"
              trigger={
                <Button className="px-10 py-7 rounded-full bg-zinc-900 text-white hover:bg-zinc-800 hover:scale-105 transition-all duration-300 shadow-xl shadow-zinc-200 text-lg font-medium">
                  Start Planning Free
                </Button>
              }
            />
            <Link to="/features">
              <Button
                variant="ghost"
                className="px-10 py-7 rounded-full hover:bg-white text-zinc-600 text-lg hover:shadow-lg transition-all duration-300"
              >
                See Features <ArrowRight className="ml-2 w-5 h-5 opacity-50" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
