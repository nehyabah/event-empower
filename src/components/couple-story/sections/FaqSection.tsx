import { useState } from "react";
import { ChevronDown } from "lucide-react";
import type { ThemeStyles } from "@/lib/siteThemes";
import type { FaqItem } from "@/services/api/storyService";

interface Props {
  faqItems: FaqItem[];
  styles: ThemeStyles;
  isDark: boolean;
}

const FaqSection = ({ faqItems, styles: s }: Props) => {
  const [openId, setOpenId] = useState<string | null>(null);

  if (faqItems.length === 0) return null;

  return (
    <section className={`${s.sectionPadding} container mx-auto px-4`}>
      <div className="text-center mb-16">
        <span className={`${s.sectionLabel} ${s.accent}`}>
          Questions?
        </span>
        <h2 className={`text-4xl md:text-5xl mt-3 ${s.fontHeading}`}>FAQ</h2>
      </div>

      <div className="max-w-3xl mx-auto space-y-4">
        {faqItems.map((item) => {
          const isOpen = openId === item.id;
          return (
            <div key={item.id} className={`overflow-hidden transition-all ${s.card} ${s.cardHover}`}>
              <button
                onClick={() => setOpenId(isOpen ? null : item.id)}
                className={`w-full flex items-center justify-between p-6 text-left ${s.text}`}
              >
                <span className={`text-lg font-medium ${s.fontHeading}`}>
                  {item.question}
                </span>
                <ChevronDown
                  className={`w-5 h-5 shrink-0 ml-4 transition-transform duration-300 ${s.accent} ${isOpen ? "rotate-180" : ""}`}
                />
              </button>
              <div
                className={`overflow-hidden transition-all duration-300 ${isOpen ? "max-h-96 pb-6" : "max-h-0"}`}
              >
                <div className={`px-6 leading-relaxed ${s.subtext}`}>
                  {item.answer}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default FaqSection;
