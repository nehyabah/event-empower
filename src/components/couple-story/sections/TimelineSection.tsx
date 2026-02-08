import type { ThemeStyles } from "@/lib/siteThemes";
import type { TimelineEvent } from "@/services/api/storyService";

interface Props {
  timeline: TimelineEvent[];
  styles: ThemeStyles;
  isDark: boolean;
}

const TimelineSection = ({ timeline, styles: s }: Props) => {
  if (timeline.length === 0) return null;

  return (
    <section className={`${s.sectionPadding} ${s.sectionBgAlt}`}>
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <span className={`${s.sectionLabel} ${s.accent}`}>
            Our Journey
          </span>
          <h2 className={`text-4xl md:text-5xl mt-3 ${s.fontHeading}`}>Timeline</h2>
        </div>

        <div className="relative max-w-3xl mx-auto">
          {/* Vertical line */}
          <div className="absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-px bg-current/10" />

          <div className="space-y-12">
            {timeline.map((event, index) => {
              const isLeft = index % 2 === 0;
              return (
                <div
                  key={event.id}
                  className={`relative flex items-start ${isLeft ? "flex-row" : "flex-row-reverse"} gap-8`}
                >
                  {/* Content */}
                  <div className={`w-[calc(50%-2rem)] ${isLeft ? "text-right" : "text-left"}`}>
                    <div className={`p-6 ${s.card} ${s.cardHover}`}>
                      {event.date && (
                        <span className={`text-xs font-bold tracking-widest uppercase ${s.accent}`}>
                          {event.date}
                        </span>
                      )}
                      <h3 className={`text-xl font-bold mt-1 ${s.fontHeading} ${s.text}`}>
                        {event.title}
                      </h3>
                      {event.description && (
                        <p className={`mt-2 leading-relaxed ${s.subtext}`}>
                          {event.description}
                        </p>
                      )}
                      {event.image_url && (
                        <img
                          src={event.image_url}
                          alt={event.title}
                          className={`mt-4 w-full h-40 object-cover ${s.image}`}
                        />
                      )}
                    </div>
                  </div>

                  {/* Center dot */}
                  <div className={`absolute left-1/2 -translate-x-1/2 w-4 h-4 rounded-full border-2 z-10 ${s.bg} border-current/30`} />

                  {/* Spacer for the other side */}
                  <div className="w-[calc(50%-2rem)]" />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default TimelineSection;
