import { useState } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/home/Footer";
import { Button } from "@/components/ui/button";
import { Check, Sparkles } from "lucide-react";

interface PricingTierProps {
  id: string;
  title: string;
  price: string;
  description: string;
  features: string[];
  buttonText: string;
  highlighted?: boolean;
  selected?: boolean;
  onSelect: (id: string) => void;
}

const PricingTier = ({
  id,
  title,
  price,
  description,
  features,
  buttonText,
  highlighted = false,
  selected = false,
  onSelect,
}: PricingTierProps) => {
  return (
    <div
      onClick={() => onSelect(id)}
      className={`relative flex flex-col p-8 md:p-10 rounded-3xl transition-all duration-500 cursor-pointer group ${
        highlighted
          ? "bg-zinc-900 text-white shadow-2xl scale-100 md:scale-110 z-10 ring-1 ring-zinc-900/50"
          : "bg-white text-zinc-900 border border-zinc-200 hover:border-zinc-300 hover:shadow-xl hover:-translate-y-1"
      } ${selected && !highlighted ? "ring-2 ring-zinc-900 border-zinc-900" : ""}`}
    >
      {highlighted && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-gradient-to-r from-wedding-gold/80 to-yellow-500 text-white text-[10px] font-bold tracking-widest uppercase rounded-full flex items-center gap-1.5 shadow-lg">
          <Sparkles className="w-3 h-3" /> Most Popular
        </div>
      )}

      <div className="mb-8">
        <h3
          className={`text-xl font-medium mb-3 ${highlighted ? "text-white" : "text-zinc-900"}`}
        >
          {title}
        </h3>
        <div className="flex items-baseline gap-1">
          <span
            className={`text-5xl font-serif font-medium ${highlighted ? "text-white" : "text-zinc-900"}`}
          >
            {price === "Free" ? (
              "Free"
            ) : (
              <>
                <span className="text-2xl align-top opacity-70 mr-1">₦</span>
                {price}
              </>
            )}
          </span>
          {price !== "Free" && (
            <span
              className={`text-sm font-medium ${highlighted ? "text-zinc-400" : "text-zinc-400"}`}
            >
              /mo
            </span>
          )}
        </div>
        <p
          className={`mt-6 text-sm leading-relaxed ${highlighted ? "text-zinc-300" : "text-zinc-500"}`}
        >
          {description}
        </p>
      </div>

      <div className="flex-1 mb-10">
        <ul className="space-y-4">
          {features.map((feature: string, index: number) => (
            <li
              key={index}
              className="flex items-start gap-3 text-sm group/item"
            >
              <Check
                className={`w-5 h-5 flex-shrink-0 mt-0.5 transition-colors ${
                  highlighted
                    ? "text-yellow-400"
                    : "text-zinc-900 group-hover/item:text-yellow-600"
                }`}
              />
              <span className={highlighted ? "text-zinc-300" : "text-zinc-600"}>
                {feature}
              </span>
            </li>
          ))}
        </ul>
      </div>

      <Button
        className={`w-full py-7 rounded-2xl text-base font-medium transition-all duration-300 ${
          highlighted
            ? "bg-white text-zinc-900 hover:bg-zinc-100 hover:scale-[1.02]"
            : "bg-zinc-100 text-zinc-900 hover:bg-zinc-900 hover:text-white"
        }`}
      >
        {buttonText}
      </Button>
    </div>
  );
};

const PricingPage = () => {
  const [selectedTier, setSelectedTier] = useState<string>("premium");

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50">
      <Navbar />

      <main className="flex-grow pt-32 pb-24">
        <div className="container mx-auto px-4">
          {/* Header Section */}
          <div className="text-center max-w-3xl mx-auto mb-20 animate-fade-in-up">
            <span className="text-xs font-bold tracking-[0.2em] text-zinc-400 uppercase mb-6 block">
              Pricing
            </span>
            <h1 className="text-5xl md:text-7xl font-serif font-medium text-zinc-900 mb-8 tracking-tight">
              Invest in peace of mind.
            </h1>
            <p className="text-xl text-zinc-500 font-light leading-relaxed">
              Transparent pricing packages designed to match the scale of your
              celebration. No hidden fees.
            </p>
          </div>

          {/* Pricing Grid */}
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 items-center">
            {/* Basic Tier */}
            <PricingTier
              id="basic"
              title="Basic"
              price="Free"
              description="Share the news, gather replies, and keep it all in one place."
              features={[
                "Wedding website — 1 template",
                "Invitation card — 1 design, with a shareable link",
                "RSVP management for up to 50 guests",
                "Checklist to track your tasks",
                "Guest list with dietary notes and plus-ones",
                "Browse the vendor directory",
              ]}
              buttonText="Get Started"
              selected={selectedTier === "basic"}
              onSelect={setSelectedTier}
            />

            {/* Premium Tier */}
            <PricingTier
              id="premium"
              title="Premium"
              price="15,000"
              description="Everything you need to plan the day yourself, without the spreadsheets."
              features={[
                "Everything in Basic",
                "All website templates, not just one",
                "Design your invitation card — 24 templates to choose from",
                "Unlimited guests",
                "RSVP deadlines with automatic reminders, plus bulk email to your guest list on demand",
                "Checklist tasks shared with your partner, and mood boards",
                "Budget tracker with payments, balances and due dates",
                "Message and book vendors directly",
                "Registry and cash gifts with bank details",
                "Sync your calendar to Google or Apple",
              ]}
              buttonText="Start Free Trial"
              highlighted={true}
              selected={selectedTier === "premium"}
              onSelect={setSelectedTier}
            />

            {/* Luxury Tier */}
            <PricingTier
              id="luxury"
              title="Luxury"
              price="30,000"
              description="For multi-day celebrations and couples working with a planner."
              features={[
                "Everything in Premium",
                "Plan alongside your wedding planner in one workspace",
                "Traditional, white wedding and reception as separate events",
                "Vendor bookings and schedules on a shared calendar",
                "Priority support",
              ]}
              buttonText="Contact Sales"
              selected={selectedTier === "luxury"}
              onSelect={setSelectedTier}
            />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default PricingPage;
