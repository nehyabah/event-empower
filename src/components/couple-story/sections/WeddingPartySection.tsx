import type { ThemeStyles } from "@/lib/siteThemes";
import type { WeddingPartyMember } from "@/services/api/storyService";

interface Props {
  weddingParty: WeddingPartyMember[];
  styles: ThemeStyles;
  isDark: boolean;
}

const WeddingPartySection = ({ weddingParty, styles: s }: Props) => {
  if (weddingParty.length === 0) return null;

  const bridesSide = weddingParty.filter((m) => m.side === "bride");
  const groomsSide = weddingParty.filter((m) => m.side === "groom");
  const bothSide = weddingParty.filter((m) => m.side === "both");

  const renderMember = (member: WeddingPartyMember) => (
    <div key={member.id} className={`flex flex-col items-center text-center p-6 ${s.card} ${s.cardHover}`}>
      {member.image_url ? (
        <img
          src={member.image_url}
          alt={member.name}
          className="w-28 h-28 rounded-full object-cover mb-4 border-2 border-current/10"
        />
      ) : (
        <div className={`w-28 h-28 rounded-full mb-4 flex items-center justify-center text-3xl font-bold border-2 border-current/10 ${s.sectionBgAlt} ${s.subtext}`}>
          {member.name.charAt(0)}
        </div>
      )}
      <h4 className={`text-lg font-bold ${s.fontHeading} ${s.text}`}>{member.name}</h4>
      <p className={`text-sm font-medium mt-1 ${s.accent}`}>{member.role}</p>
      {member.bio && (
        <p className={`mt-3 text-sm leading-relaxed ${s.subtext}`}>{member.bio}</p>
      )}
    </div>
  );

  return (
    <section className={`${s.sectionPadding} container mx-auto px-4`}>
      <div className="text-center mb-16">
        <span className={`${s.sectionLabel} ${s.accent}`}>
          The Crew
        </span>
        <h2 className={`text-4xl md:text-5xl mt-3 ${s.fontHeading}`}>Wedding Party</h2>
      </div>

      <div className="max-w-6xl mx-auto space-y-16">
        {bridesSide.length > 0 && (
          <div>
            <h3 className={`text-2xl text-center mb-8 ${s.fontHeading} ${s.accent}`}>
              Bride's Party
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {bridesSide.map(renderMember)}
            </div>
          </div>
        )}

        {groomsSide.length > 0 && (
          <div>
            <h3 className={`text-2xl text-center mb-8 ${s.fontHeading} ${s.accent}`}>
              Groom's Party
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {groomsSide.map(renderMember)}
            </div>
          </div>
        )}

        {bothSide.length > 0 && (
          <div>
            {(bridesSide.length > 0 || groomsSide.length > 0) && (
              <h3 className={`text-2xl text-center mb-8 ${s.fontHeading} ${s.accent}`}>
                Shared Party
              </h3>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {bothSide.map(renderMember)}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default WeddingPartySection;
