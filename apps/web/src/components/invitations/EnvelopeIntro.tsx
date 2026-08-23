import { useEffect, useRef, useState } from "react";
import { CardTemplate } from "@/components/dashboard/SaveTheDateCard";

interface Props {
  template: CardTemplate;
  partner1Name: string;
  partner2Name: string;
  formattedDate: string;
  /** Fired once the envelope has finished opening. */
  onOpened: () => void;
}

/** Total run time of the open sequence, in ms. Keep in step with the keyframes. */
const OPEN_MS = 2200;

const initialOf = (n: string) => (n.trim()[0] || "").toUpperCase();

/**
 * The sealed-envelope intro.
 *
 * Staged rather than simultaneous: the wax seal cracks and its halves fall
 * away, then the flap swings back on a real 3D hinge, and only then does the
 * card rise. The flap has two faces — printed outside, lighter lining inside —
 * because a single face with `backface-visibility: hidden` disappears past 90°
 * instead of reading as an opening flap.
 */
export const EnvelopeIntro = ({
  template: t, partner1Name, partner2Name, formattedDate, onOpened,
}: Props) => {
  const [opening, setOpening] = useState(false);
  const timer = useRef<number>();

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const open = () => {
    if (opening) return;
    setOpening(true);
    timer.current = window.setTimeout(onOpened, OPEN_MS);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open(); }
  };

  const state = opening ? "is-opening" : "";

  return (
    <div
      className="env-scene min-h-screen flex flex-col items-center justify-center p-4 overflow-hidden"
      style={{
        // A soft vignette so the envelope sits in a room rather than on a page.
        background: t.dark
          ? `radial-gradient(ellipse at 50% 20%, ${t.accentBg} 0%, #0d0d10 70%)`
          : `radial-gradient(ellipse at 50% 18%, #ffffff 0%, ${t.accentBg} 55%, ${t.frame} 130%)`,
      }}
    >
      <style>{`
        /* Sequence — seal breaks, flap opens, card rises. Each waits on the last. */
        @keyframes env-enter {
          from { opacity: 0; transform: translateY(24px) scale(.96); }
          to   { opacity: 1; transform: none; }
        }
        @keyframes seal-crack {
          0%   { transform: translate(-50%,-50%) rotate(0deg) scale(1); }
          35%  { transform: translate(-50%,-50%) rotate(-2deg) scale(1.06); }
          100% { transform: translate(-50%,-50%) rotate(0deg) scale(1); }
        }
        @keyframes seal-half-l {
          from { transform: translate(0,0) rotate(0deg); opacity: 1; }
          to   { transform: translate(-26px, 30px) rotate(-38deg); opacity: 0; }
        }
        @keyframes seal-half-r {
          from { transform: translate(0,0) rotate(0deg); opacity: 1; }
          to   { transform: translate(26px, 32px) rotate(34deg); opacity: 0; }
        }
        @keyframes flap-open {
          from { transform: rotateX(0deg); }
          to   { transform: rotateX(-172deg); }
        }
        @keyframes card-rise {
          0%   { transform: translateY(0) scale(1); }
          70%  { transform: translateY(-54%) scale(1.035); }
          100% { transform: translateY(-50%) scale(1.02); }
        }
        @keyframes card-shadow {
          from { opacity: .18; filter: blur(6px);  transform: scaleX(.92); }
          to   { opacity: .30; filter: blur(16px); transform: scaleX(1.02); }
        }
        @keyframes scene-out { to { opacity: 0; transform: scale(1.03); } }
        @keyframes hint-pulse { 0%,100% { opacity: .55; } 50% { opacity: 1; } }

        .env-enter   { animation: env-enter .9s cubic-bezier(.2,.7,.3,1) both; }
        .env-hint    { animation: hint-pulse 2.4s ease-in-out infinite; }

        /* The hinge itself: a real 3D rotation, not a clipped flip. */
        .env-flap {
          transform-origin: top center;
          transform-style: preserve-3d;
          transition: none;
        }
        .is-opening .env-flap {
          animation: flap-open .95s cubic-bezier(.62,.02,.3,1) .34s both;
        }
        .env-flap-face { backface-visibility: hidden; -webkit-backface-visibility: hidden; }
        .env-flap-back { transform: rotateX(180deg); }

        .is-opening .env-seal      { animation: seal-crack .34s ease-in both; }
        .is-opening .env-seal-l    { animation: seal-half-l .55s cubic-bezier(.4,0,.5,1) .3s both; }
        .is-opening .env-seal-r    { animation: seal-half-r .6s  cubic-bezier(.4,0,.5,1) .3s both; }
        .is-opening .env-card      { animation: card-rise 1.05s cubic-bezier(.22,.9,.3,1) 1.05s both; }
        .is-opening .env-card-shad { animation: card-shadow 1.05s ease-out 1.05s both; }
        .is-opening .env-out       { animation: scene-out .5s ease-in 1.75s both; }
        .is-opening .env-fade      { opacity: 0; transition: opacity .35s ease; }

        /* Honour a reduced-motion preference: reveal without the theatrics. */
        @media (prefers-reduced-motion: reduce) {
          .env-enter, .is-opening .env-flap, .is-opening .env-seal,
          .is-opening .env-seal-l, .is-opening .env-seal-r,
          .is-opening .env-card, .is-opening .env-card-shad,
          .is-opening .env-out, .env-hint { animation: none !important; }
          .is-opening .env-out { opacity: 0; transition: opacity .3s ease; }
        }
      `}</style>

      <div className={`w-full max-w-[320px] sm:max-w-sm ${state}`}>
        <div className="env-enter">
          <p
            className="env-fade text-center text-[10px] sm:text-xs uppercase tracking-[0.34em] mb-6"
            style={{ color: t.inkSoft, opacity: opening ? 0 : undefined }}
          >
            You&rsquo;re Invited
          </p>

          <div className="env-out">
            <div
              role="button"
              tabIndex={0}
              aria-label="Open the invitation"
              onClick={open}
              onKeyDown={onKeyDown}
              className="relative w-full h-[430px] sm:h-[500px] md:h-[560px] cursor-pointer select-none outline-none focus-visible:ring-2 focus-visible:ring-offset-4 rounded-2xl"
              style={{ perspective: "1400px", perspectiveOrigin: "50% 30%" }}
            >
              {/* Interior — what you see once the flap is back */}
              <div
                className="absolute inset-0 rounded-2xl"
                style={{
                  background: `linear-gradient(170deg, ${t.frame} 0%, ${t.accentBg} 60%)`,
                  boxShadow: `inset 0 10px 24px rgba(0,0,0,.16)`,
                }}
              />

              {/* Soft ground shadow that grows as the card lifts */}
              <div
                className="env-card-shad absolute rounded-full pointer-events-none"
                style={{
                  left: "14%", right: "14%", top: "62%", height: 26,
                  background: "rgba(0,0,0,.5)", opacity: 0, zIndex: 5,
                }}
              />

              {/* The card itself */}
              <div
                className="env-card absolute rounded-xl flex flex-col items-center text-center px-6 pt-9"
                style={{
                  left: "5.5%", right: "5.5%", top: "5%", bottom: "6%",
                  zIndex: 10,
                  background: `linear-gradient(178deg, ${t.paper} 0%, ${t.paper} 72%, ${t.accentBg} 100%)`,
                  border: `1px solid ${t.frame}`,
                  boxShadow: "0 10px 30px rgba(0,0,0,.13), 0 2px 6px rgba(0,0,0,.07)",
                }}
              >
                <span
                  className="block w-9 h-px mb-4"
                  style={{ background: t.accent, opacity: .5 }}
                />
                <p
                  className="uppercase text-[9px] sm:text-[10px]"
                  style={{ fontFamily: t.headerFont, letterSpacing: t.headerTracking, color: t.inkSoft }}
                >
                  Save the Date
                </p>
                <p className="text-base sm:text-lg mt-2" style={{ fontFamily: t.scriptFont, color: t.accent }}>
                  for the wedding of
                </p>
                <p className="text-xl sm:text-2xl mt-2.5 leading-tight" style={{ fontFamily: t.nameFont, color: t.ink }}>
                  {partner1Name}
                </p>
                <p className="text-base sm:text-lg my-0.5" style={{ fontFamily: t.scriptFont, color: t.accent }}>&amp;</p>
                <p className="text-xl sm:text-2xl leading-tight" style={{ fontFamily: t.nameFont, color: t.ink }}>
                  {partner2Name}
                </p>
                <span
                  className="block w-9 h-px mt-4"
                  style={{ background: t.accent, opacity: .5 }}
                />
              </div>

              {/* Front pocket, V-notched, with a paper-grain sheen */}
              <div
                className="absolute inset-0 rounded-2xl"
                style={{
                  zIndex: 20,
                  clipPath: "polygon(0 14%, 50% 44%, 100% 14%, 100% 100%, 0 100%)",
                  background: `
                    linear-gradient(115deg, rgba(255,255,255,.55) 0%, rgba(255,255,255,0) 42%),
                    linear-gradient(180deg, ${t.accentBg} 0%, ${t.paper} 58%)
                  `,
                  boxShadow: `inset 0 2px 3px rgba(255,255,255,.6), 0 18px 40px -12px rgba(0,0,0,.32)`,
                  border: `1px solid ${t.frame}`,
                }}
              />

              {/* Hand-addressed names */}
              <div className="absolute inset-x-0 text-center pointer-events-none" style={{ top: "60%", zIndex: 25 }}>
                <p className="text-[26px] sm:text-[32px] leading-tight" style={{ fontFamily: t.scriptFont, color: t.ink }}>
                  {partner1Name} &amp; {partner2Name}
                </p>
                <span className="block mx-auto my-3 w-12 h-px" style={{ background: t.frame }} />
                <p
                  className="uppercase text-[8px] sm:text-[9px] tracking-[0.36em]"
                  style={{ fontFamily: t.headerFont, color: t.inkSoft }}
                >
                  {formattedDate}
                </p>
              </div>

              {/* Flap — two faces on a top hinge */}
              <div
                className="env-flap absolute inset-x-0 top-0 h-full"
                style={{ zIndex: 30 }}
              >
                <div
                  className="env-flap-face absolute inset-0"
                  style={{
                    clipPath: "polygon(0 0, 100% 0, 50% 44.5%)",
                    background: `
                      linear-gradient(125deg, rgba(255,255,255,.5) 0%, rgba(255,255,255,0) 46%),
                      linear-gradient(180deg, ${t.accentBg} 0%, ${t.paper} 88%)
                    `,
                    borderRadius: "16px 16px 0 0",
                    boxShadow: `inset 0 1px 0 rgba(255,255,255,.7)`,
                  }}
                />
                {/* Lining: what the guest sees once it swings back */}
                <div
                  className="env-flap-face env-flap-back absolute inset-0"
                  style={{
                    clipPath: "polygon(0 0, 100% 0, 50% 44.5%)",
                    background: `linear-gradient(0deg, ${t.frame} 0%, ${t.accentBg} 70%)`,
                    borderRadius: "16px 16px 0 0",
                    boxShadow: "inset 0 -8px 18px rgba(0,0,0,.16)",
                  }}
                />
              </div>

              {/* Wax seal — domed, irregular, embossed, splits in two */}
              <div
                className="env-seal absolute left-1/2"
                style={{ zIndex: 40, top: "44.5%", width: 66, height: 66, transform: "translate(-50%,-50%)" }}
              >
                {(["l", "r"] as const).map((side) => (
                  <div
                    key={side}
                    className={`env-seal-${side} absolute inset-0`}
                    style={{
                      // Each half carries the whole seal, clipped — so the
                      // monogram splits down the middle as they part.
                      clipPath: side === "l" ? "inset(0 50% 0 0)" : "inset(0 0 0 50%)",
                    }}
                  >
                    <div
                      className="absolute inset-0 flex items-center justify-center"
                      style={{
                        // Slightly irregular edge, the way poured wax sets.
                        borderRadius: "48% 52% 51% 49% / 50% 48% 52% 50%",
                        background: `
                          radial-gradient(circle at 32% 28%, rgba(255,255,255,.45) 0%, rgba(255,255,255,0) 38%),
                          radial-gradient(circle at 68% 76%, rgba(0,0,0,.28) 0%, rgba(0,0,0,0) 46%),
                          ${t.accent}
                        `,
                        boxShadow: `
                          0 6px 14px rgba(0,0,0,.28),
                          inset 0 -2px 4px rgba(0,0,0,.30),
                          inset 0 2px 3px rgba(255,255,255,.35)
                        `,
                      }}
                    >
                      <span
                        style={{
                          fontFamily: t.scriptFont,
                          fontSize: 21,
                          lineHeight: 1,
                          color: "rgba(255,255,255,.94)",
                          // Embossed: dark above, light below.
                          textShadow: "0 -1px 1px rgba(0,0,0,.45), 0 1px 1px rgba(255,255,255,.28)",
                        }}
                      >
                        {initialOf(partner1Name)}&thinsp;&amp;&thinsp;{initialOf(partner2Name)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <p
            className="env-fade env-hint text-center text-[10px] sm:text-xs uppercase tracking-[0.28em] mt-7"
            style={{ color: t.inkSoft, opacity: opening ? 0 : undefined }}
          >
            Tap to open
          </p>
        </div>
      </div>
    </div>
  );
};

export default EnvelopeIntro;
