import type { CSSProperties } from "react";

// ============================================================
// SITE FLORALS
// Watercolor botanicals for the wedding site.
// Whispers only: a small sprig ornament at the quote and footer,
// and faint corner washes behind the wishes section. Stark themes
// (midnight, mono) get nothing at all.
// ============================================================

export interface FloralPlacement {
  src: string;
  /** absolute-position box: top/right/bottom/left/width/height */
  style: CSSProperties;
  flip?: boolean;
  flipY?: boolean;
  rotate?: number;
  opacity?: number;
  /** backgroundPosition */
  anchor?: string;
  /** backgroundSize — "contain" (default) or e.g. "100% auto" for hems */
  size?: string;
}

export const Floral = ({ p }: { p: FloralPlacement }) => {
  const transforms = [
    p.flip ? "scaleX(-1)" : "",
    p.flipY ? "scaleY(-1)" : "",
    p.rotate ? `rotate(${p.rotate}deg)` : "",
  ].filter(Boolean).join(" ");
  return (
    <div
      aria-hidden
      className="absolute pointer-events-none select-none"
      style={{
        ...p.style,
        backgroundImage: `url(${p.src})`,
        backgroundRepeat: "no-repeat",
        backgroundSize: p.size ?? "contain",
        backgroundPosition: p.anchor ?? "center",
        transform: transforms || undefined,
        opacity: p.opacity ?? 1,
        zIndex: 0,
      }}
    />
  );
};

export const FloralGroup = ({ items }: { items?: FloralPlacement[] }) =>
  items && items.length > 0 ? (
    <>{items.map((p, i) => <Floral key={i} p={p} />)}</>
  ) : null;

/** Small centered ornament for the quote heading and footer */
export const Sprig = ({
  src, className = "h-16 w-36", opacity = 0.9, flip,
}: { src: string; className?: string; opacity?: number; flip?: boolean }) => (
  <div
    aria-hidden
    className={`mx-auto bg-contain bg-center bg-no-repeat pointer-events-none select-none ${className}`}
    style={{
      backgroundImage: `url(${src})`,
      opacity,
      transform: flip ? "scaleX(-1)" : undefined,
    }}
  />
);

export interface SiteFloralConfig {
  /** small heading ornament (quote + footer) */
  sprig?: string;
  sprigClass?: string;
  /** faint washes behind the wishes section */
  wishes?: FloralPlacement[];
  footer?: FloralPlacement[];
}

const F = "/florals";

// Corner wash — square box, contain, anchored into the corner
const corner = (
  src: string,
  pos: "tl" | "tr" | "bl" | "br",
  opacity: number,
  size = "min(32vw, 400px)",
  extra: Partial<FloralPlacement> = {},
): FloralPlacement => {
  const style: CSSProperties = { width: size, height: size };
  if (pos.includes("t")) style.top = "-2%"; else style.bottom = "-2%";
  if (pos.includes("l")) style.left = "-3%"; else style.right = "-3%";
  return {
    src,
    style,
    opacity,
    anchor: `${pos.includes("l") ? "left" : "right"} ${pos.includes("t") ? "top" : "bottom"}`,
    ...extra,
  };
};

const siteFlorals: Record<string, SiteFloralConfig | null> = {
  // Stark themes stay pure — no ornament is the ornament.
  midnight: null,
  mono: null,

  editorial: {
    sprig: `${F}/seeded-sprig.png`,
    sprigClass: "h-16 w-20",
    wishes: [
      corner(`${F}/eucalyptus-branch.png`, "tl", 0.08),
      corner(`${F}/eucalyptus-branch.png`, "br", 0.08, undefined, { flip: true, flipY: true }),
    ],
  },

  garden: {
    sprig: `${F}/laurel-branch.png`,
    sprigClass: "h-16 w-24",
    wishes: [
      corner(`${F}/jasmine-cascade.png`, "tl", 0.08),
      corner(`${F}/jasmine-cascade.png`, "br", 0.08, undefined, { flip: true, flipY: true }),
    ],
  },

  "golden-hour": {
    sprig: `${F}/posy-hearts.png`,
    sprigClass: "h-14 w-44",
    wishes: [
      corner(`${F}/peach-bouquet.png`, "tl", 0.08),
      corner(`${F}/peach-bouquet.png`, "br", 0.08, undefined, { flip: true, flipY: true }),
    ],
    footer: [
      {
        src: `${F}/rose-petals.png`,
        style: { left: 0, right: 0, bottom: "-30%", height: "110%" },
        size: "100% auto",
        anchor: "center bottom",
        opacity: 0.09,
      },
    ],
  },

  riviera: {
    sprig: `${F}/forget-me-not.png`,
    sprigClass: "h-16 w-24",
    wishes: [
      corner(`${F}/forget-me-not.png`, "tl", 0.08),
      corner(`${F}/forget-me-not.png`, "br", 0.08, undefined, { flip: true, flipY: true }),
    ],
  },

  chateau: {
    sprig: `${F}/sweet-pea.png`,
    sprigClass: "h-20 w-24",
    wishes: [
      corner(`${F}/lavender-haze.png`, "tl", 0.10, "min(36vw, 440px)", { anchor: "left top", size: "190%" }),
      corner(`${F}/lavender-haze.png`, "br", 0.10, "min(36vw, 440px)", { anchor: "left top", size: "190%", flip: true, flipY: true }),
    ],
  },

  bohemian: {
    sprig: `${F}/vintage-spray.png`,
    sprigClass: "h-20 w-20",
    wishes: [
      corner(`${F}/meadow-blush.png`, "bl", 0.10),
      corner(`${F}/meadow-blush.png`, "br", 0.10, undefined, { flip: true }),
    ],
    footer: [
      {
        src: `${F}/meadow-blush.png`,
        style: { left: "20%", right: "20%", bottom: 0, height: "70%" },
        size: "contain",
        anchor: "center bottom",
        opacity: 0.14,
      },
    ],
  },
};

export const getSiteFlorals = (themeId: string): SiteFloralConfig | null =>
  themeId in siteFlorals ? siteFlorals[themeId] : siteFlorals.editorial;
