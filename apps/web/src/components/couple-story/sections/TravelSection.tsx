import { Hotel, Car, ParkingCircle, Info, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ThemeStyles } from "@/lib/siteThemes";
import type { TravelInfoItem } from "@/services/api/storyService";

interface Props {
  travelInfo: TravelInfoItem[];
  styles: ThemeStyles;
  isDark: boolean;
}

const categoryIcons = {
  hotel: Hotel,
  transport: Car,
  parking: ParkingCircle,
  other: Info,
};

const categoryLabels: Record<string, string> = {
  hotel: "Hotels & Accommodation",
  transport: "Transport",
  parking: "Parking",
  other: "Other",
};

const TravelSection = ({ travelInfo, styles: s }: Props) => {
  if (travelInfo.length === 0) return null;

  const grouped = travelInfo.reduce<Record<string, TravelInfoItem[]>>((acc, item) => {
    const cat = item.category || "other";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(item);
    return acc;
  }, {});

  return (
    <section className={`${s.sectionPadding} ${s.sectionBgAlt}`}>
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <span className={`${s.sectionLabel} ${s.accent}`}>
            Getting There
          </span>
          <h2 className={`text-4xl md:text-5xl mt-3 ${s.fontHeading}`}>Travel & Stay</h2>
        </div>

        <div className="max-w-5xl mx-auto space-y-12">
          {Object.entries(grouped).map(([category, items]) => {
            const Icon = categoryIcons[category as keyof typeof categoryIcons] || Info;
            return (
              <div key={category}>
                <div className="flex items-center gap-3 mb-6">
                  <div className={`p-2 rounded-lg bg-current/5 ${s.accent}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className={`text-2xl ${s.fontHeading}`}>
                    {categoryLabels[category] || category}
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {items.map((item) => (
                    <div key={item.id} className={`p-6 ${s.card} ${s.cardHover}`}>
                      {item.image_url && (
                        <img
                          src={item.image_url}
                          alt={item.title}
                          className={`w-full h-40 object-cover mb-4 ${s.image}`}
                        />
                      )}
                      <h4 className={`text-lg font-bold ${s.text}`}>{item.title}</h4>
                      {item.description && (
                        <p className={`mt-2 leading-relaxed ${s.subtext}`}>
                          {item.description}
                        </p>
                      )}
                      {item.address && (
                        <p className={`mt-2 text-sm ${s.subtext} opacity-70`}>
                          {item.address}
                        </p>
                      )}
                      {item.link && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="mt-4"
                          onClick={() => window.open(item.link!, "_blank", "noopener")}
                        >
                          <ExternalLink className="w-3 h-3 mr-2" />
                          View Details
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default TravelSection;
