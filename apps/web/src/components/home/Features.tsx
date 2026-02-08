import {
  CalendarCheck2,
  UsersRound,
  MapPinHouse,
  ListTodo,
  WalletCards,
  GalleryHorizontal,
  ArrowUpRight,
  Sparkles,
} from "lucide-react";
import { CSSProperties } from "react";

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  className?: string;
  delay?: string;
}

const FeatureCard = ({
  icon,
  title,
  description,
  className,
  delay,
}: FeatureCardProps) => {
  return (
    <div
      className={`group relative p-10 bg-white hover:bg-zinc-50 transition-colors duration-500 flex flex-col ${className}`}
      style={{ animationDelay: delay }}
    >
      <div className="absolute top-8 right-8 opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-x-2 group-hover:translate-x-0">
        <ArrowUpRight className="w-5 h-5 text-zinc-400" />
      </div>

      <div className="mb-6 inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-white via-zinc-50 to-zinc-100 text-zinc-900 group-hover:scale-110 group-hover:text-white group-hover:from-zinc-900 group-hover:via-zinc-900 group-hover:to-zinc-900 transition-all duration-300 border border-zinc-100 shadow-sm">
        {icon}
      </div>

      <h3 className="text-xl font-serif font-medium mb-3 text-zinc-900 tracking-tight">
        {title}
      </h3>
      <p className="text-zinc-500 leading-relaxed font-light">{description}</p>
    </div>
  );
};

const Features = () => {
  return (
    <section className="py-24 bg-white relative overflow-hidden">
      {/* Subtle Background Pattern */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(#000 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      ></div>

      <div className="container px-4 mx-auto relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 mb-4 animate-fade-in">
              <Sparkles className="w-4 h-4 text-yellow-600" />
              <span className="text-xs font-bold tracking-widest uppercase text-zinc-500">
                Premium Tools
              </span>
            </div>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif font-medium tracking-tight text-zinc-900 leading-[1.1]">
              Everything you need for <br />
              <span className="italic text-zinc-500 font-light">
                the perfect celebration
              </span>
            </h2>
          </div>

          <p className="max-w-md text-zinc-500 font-light leading-relaxed pb-2 border-l-2 border-zinc-100 pl-6">
            Our platform offers a suite of intelligent tools designed to make
            planning your wedding simple, elegant, and stress-free.
          </p>
        </div>

        {/* Modern Grid Layout with 1px borders via gap */}
        <div className="bg-zinc-200 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px border border-zinc-200 overflow-hidden rounded-2xl shadow-sm">
          <FeatureCard
            icon={<MapPinHouse className="w-5 h-5" strokeWidth={1.5} />}
            title="Local Vendors"
            description="Access a curated directory of elite local vendors and venues tailored to your specific region and style."
            delay="0ms"
          />

          <FeatureCard
            icon={<CalendarCheck2 className="w-5 h-5" strokeWidth={1.5} />}
            title="Smart Timeline"
            description="Drag-and-drop planning with intelligent templates for engagement, ceremony, and reception schedules."
            delay="100ms"
          />

          <FeatureCard
            icon={<UsersRound className="w-5 h-5" strokeWidth={1.5} />}
            title="Guest Management"
            description="Effortlessly manage RSVPs, dietary requirements, and seating charts in one centralized dashboard."
            delay="200ms"
          />

          <FeatureCard
            icon={<ListTodo className="w-5 h-5" strokeWidth={1.5} />}
            title="Task Automation"
            description="Stay on track with auto-generated checklists that adapt to your wedding date and priorities."
            delay="300ms"
          />

          <FeatureCard
            icon={<GalleryHorizontal className="w-5 h-5" strokeWidth={1.5} />}
            title="Visual Galleries"
            description="Create mood boards and share beautiful photo collections with vendors and family."
            delay="400ms"
          />

          <FeatureCard
            icon={<WalletCards className="w-5 h-5" strokeWidth={1.5} />}
            title="Budget Tracker"
            description="Real-time expense tracking and payment schedules to help you stay within your budget."
            delay="500ms"
          />
        </div>
      </div>
    </section>
  );
};

export default Features;
