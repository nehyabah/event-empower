import {
  UsersRound,
  MapPinHouse,
  ListTodo,
  WalletCards,
  Globe,
  MailOpen,
  ArrowUpRight,
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
              <span className="text-xs font-bold tracking-widest uppercase text-zinc-500">
                What you get
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
            One place for your website, invitations, guest list, budget and
            vendors — so you are not chasing details across six apps and a
            spreadsheet.
          </p>
        </div>

        {/* Modern Grid Layout with 1px borders via gap */}
        <div className="bg-zinc-200 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px border border-zinc-200 overflow-hidden rounded-2xl shadow-sm">
          <FeatureCard
            icon={<Globe className="w-5 h-5" strokeWidth={1.5} />}
            title="Your Wedding Website"
            description="Pick a theme, add your story, timeline, wedding party and travel notes, then share one link with everyone."
            delay="0ms"
          />

          <FeatureCard
            icon={<MailOpen className="w-5 h-5" strokeWidth={1.5} />}
            title="Invitations & RSVP"
            description="Design your invitation card, share it as a link, and collect replies. Set a deadline and send reminders to whoever has not answered."
            delay="100ms"
          />

          <FeatureCard
            icon={<UsersRound className="w-5 h-5" strokeWidth={1.5} />}
            title="Guest List"
            description="Track who is coming, their party size and any dietary notes, all updated as replies come in."
            delay="200ms"
          />

          <FeatureCard
            icon={<WalletCards className="w-5 h-5" strokeWidth={1.5} />}
            title="Budget Tracker"
            description="Record what each thing costs, what you have paid and what is still owed, with due dates so nothing is missed."
            delay="300ms"
          />

          <FeatureCard
            icon={<MapPinHouse className="w-5 h-5" strokeWidth={1.5} />}
            title="Vendors"
            description="Browse vendors by category and location, send an enquiry, and keep their bookings alongside the rest of your plan."
            delay="400ms"
          />

          <FeatureCard
            icon={<ListTodo className="w-5 h-5" strokeWidth={1.5} />}
            title="Checklists & Mood Boards"
            description="Keep your to-do lists and inspiration in one place, shared with your partner or your planner — or kept private."
            delay="500ms"
          />

        </div>
      </div>
    </section>
  );
};

export default Features;
