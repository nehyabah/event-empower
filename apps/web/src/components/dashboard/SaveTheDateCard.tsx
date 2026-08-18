import { useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { rsvpService } from "@/services/api/rsvpService";

// ============================================================
// MINIMAL BOTANICAL SPRIGS
// The Etsy-minimal formula: clean paper, hairline frame, one or
// two simple sprigs at the edges. Muted dusty colors, thin stems,
// nothing busy.
// ============================================================

// Watercolor PNG accent — transparent clipart placed at a corner/edge.
// Swap the files in /public/florals/ to change artwork (e.g. with a
// purchased watercolor clipart set) — no code changes needed.
const PngAccent = ({ src, box, flip, flipY, rotate, opacity, anchor = "left top", size = "contain", blend }: {
  src: string;
  box: React.CSSProperties;
  flip?: boolean;
  flipY?: boolean;
  rotate?: number;
  opacity?: number;
  anchor?: string;
  /** backgroundSize — "contain" for isolated pieces, "100% 100%" for full frames */
  size?: string;
  /** multiply-blend, for artwork with a baked-in white background */
  blend?: boolean;
}) => {
  const transforms = [
    flip ? "scaleX(-1)" : "",
    flipY ? "scaleY(-1)" : "",
    rotate ? `rotate(${rotate}deg)` : "",
  ].filter(Boolean).join(" ");
  return (
    <div
      className="absolute pointer-events-none"
      style={{
        ...box,
        backgroundImage: `url(${src})`,
        backgroundPosition: anchor,
        backgroundSize: size,
        backgroundRepeat: "no-repeat",
        mixBlendMode: blend ? "multiply" : undefined,
        transform: transforms || undefined,
        opacity: opacity ?? 1,
      }}
    />
  );
};

// One-line rose — the hand-sketched continuous-line bloom
const LineRose = ({ ink = "#a98a72" }: { ink?: string }) => (
  <svg viewBox="0 0 120 110" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
    <g fill="none" stroke={ink} strokeWidth="1.5" strokeLinecap="round">
      {/* spiral heart of the bloom */}
      <path d="M 60,42 a 3,3 0 1,1 5,2 a 6.5,6 0 1,1 -10,-3 a 10.5,10 0 1,1 16,8 a 15,14.5 0 1,1 -23,-10" />
      {/* outer petal sweeps */}
      <path d="M 41,38 C 38,26 47,16 60,15 C 74,14 84,24 84,37" opacity="0.85" />
      <path d="M 84,37 C 90,46 88,58 79,64" opacity="0.7" />
      <path d="M 41,38 C 34,46 34,57 41,64" opacity="0.7" />
      {/* stem */}
      <path d="M 60,64 C 59,76 58,88 58,102" />
      {/* leaves */}
      <path d="M 58,78 C 48,72 40,74 35,82 C 42,88 52,86 58,80" opacity="0.85" />
      <path d="M 58,90 C 67,84 76,86 81,93 C 74,99 64,98 58,92" opacity="0.85" />
    </g>
  </svg>
);

// Gold demi-laurel — two mirrored arcs of small pointed leaves
const LaurelArc = ({ gold = ["#c2a36b", "#ad8d52"] }: { gold?: string[] }) => (
  <svg viewBox="0 0 200 70" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
    {[false, true].map(flip => (
      <g key={String(flip)} transform={flip ? "translate(200,0) scale(-1,1)" : undefined}>
        <path d="M 100,58 C 70,56 38,44 20,16" fill="none" stroke={gold[1]} strokeWidth="1.2"
          strokeLinecap="round" opacity="0.9" />
        {[
          { cx: 82, cy: 53, rot: -8 }, { cx: 66, cy: 49, rot: -16 },
          { cx: 52, cy: 43, rot: -26 }, { cx: 40, cy: 35, rot: -38 },
          { cx: 30, cy: 26, rot: -50 }, { cx: 23, cy: 16, rot: -62 },
        ].map((l, i) => (
          <ellipse key={i} cx={l.cx} cy={l.cy} rx="9.5" ry="3.1"
            fill={gold[i % 2]} opacity="0.88"
            transform={`rotate(${l.rot} ${l.cx} ${l.cy})`} />
        ))}
      </g>
    ))}
  </svg>
);

// ============================================================
// TEMPLATES
// ============================================================

export type CardAlign = "left" | "center" | "right";

export interface CardDesign {
  align?: CardAlign;
}

export interface CardTemplate {
  id: string;
  name: string;
  dark?: boolean;
  /** front-side decoration, absolutely positioned sprigs */
  Decor: () => JSX.Element;
  paper: string;
  ink: string;
  inkSoft: string;
  accent: string;
  frame: string;
  border: string;
  accentBg: string;
  headerFont: string;
  nameFont: string;
  scriptFont: string;
  bodyFont: string;
  headerTracking: string;
  /** skip the hairline frame (for artwork that brings its own frame) */
  noFrame?: boolean;
  /** per-template text-block inset, for asymmetric edge layouts */
  textStyle?: React.CSSProperties;
}

export const saveTheDateTemplates: CardTemplate[] = [
  // ── Statement frames — artwork wraps the whole card ──
  {
    id: "dusty-blue-romance",
    name: "Dusty Blue Romance",
    noFrame: true,
    Decor: () => (
      <PngAccent src="/florals/dustyblue-frame.png" size="100% 100%"
        box={{ inset: 0 }} />
    ),
    paper: "#f3f0e9",
    ink: "#566075",
    inkSoft: "#8d94a5",
    accent: "#c2788a",
    frame: "#cfd3da",
    border: "#dfe2e7",
    accentBg: "#eef0f3",
    headerFont: "'Cinzel', serif",
    nameFont: "'Playfair Display', serif",
    scriptFont: "'Great Vibes', cursive",
    bodyFont: "'Cormorant Garamond', serif",
    headerTracking: "0.4em",
  },
  {
    id: "rose-gold-frame",
    name: "Rose Gold Frame",
    noFrame: true,
    Decor: () => (
      <PngAccent src="/florals/rosegold-frame.png" size="100% 100%"
        box={{ inset: 0 }} />
    ),
    paper: "#fffdfb",
    ink: "#7a5c52",
    inkSoft: "#b39d92",
    accent: "#c98da1",
    frame: "#e6d2c8",
    border: "#f0e3db",
    accentBg: "#f9f0ec",
    headerFont: "'Cinzel', serif",
    nameFont: "'Playfair Display', serif",
    scriptFont: "'Great Vibes', cursive",
    bodyFont: "'Cormorant Garamond', serif",
    headerTracking: "0.42em",
  },
  {
    id: "chintz-roses",
    name: "Chintz Roses",
    noFrame: true,
    textStyle: { paddingTop: "4%", paddingBottom: "10%" },
    Decor: () => (
      <PngAccent src="/florals/chintz-frame.png" size="100% 100%"
        box={{ inset: 0 }} />
    ),
    paper: "#fffdfd",
    ink: "#6d3c50",
    inkSoft: "#a8798c",
    accent: "#cf6592",
    frame: "#ecd4de",
    border: "#f3e2e9",
    accentBg: "#faedf2",
    headerFont: "'Libre Baskerville', serif",
    nameFont: "'Lora', serif",
    scriptFont: "'Great Vibes', cursive",
    bodyFont: "'Libre Baskerville', serif",
    headerTracking: "0.35em",
  },
  {
    id: "hydrangea-frame",
    name: "Hydrangea Frame",
    noFrame: true,
    Decor: () => (
      <PngAccent src="/florals/hydrangea-frame.png" size="100% 100%"
        box={{ inset: 0 }} />
    ),
    paper: "#fffefc",
    ink: "#5c5470",
    inkSoft: "#938ba3",
    accent: "#9d7bb0",
    frame: "#ddd6e4",
    border: "#e9e4ef",
    accentBg: "#f4f0f7",
    headerFont: "'Libre Baskerville', serif",
    nameFont: "'Lora', serif",
    scriptFont: "'Dancing Script', cursive",
    bodyFont: "'Libre Baskerville', serif",
    headerTracking: "0.35em",
  },
  {
    id: "hydrangea-garden",
    name: "Hydrangea Garden",
    Decor: () => (
      <PngAccent src="/florals/hydrangea-corners.png" size="100% 100%"
        box={{ inset: 0 }} />
    ),
    paper: "#fefcfd",
    ink: "#74505e",
    inkSoft: "#ab8a96",
    accent: "#e08aa4",
    frame: "#eed4dd",
    border: "#f4e2e8",
    accentBg: "#fbedf1",
    headerFont: "'Montserrat', sans-serif",
    nameFont: "'Lora', serif",
    scriptFont: "'Dancing Script', cursive",
    bodyFont: "'Montserrat', sans-serif",
    headerTracking: "0.48em",
  },

  // ── Corner pieces — one or two sprays, generous paper ──
  {
    id: "ivory-garden",
    name: "Ivory Garden",
    Decor: () => (
      <>
        <PngAccent src="/florals/ivory-corner.png" size="contain" anchor="right top"
          box={{ top: "1%", right: "0%", width: "50%", aspectRatio: "1.07" }} />
        <PngAccent src="/florals/ivory-corner.png" size="contain" anchor="left bottom" flip flipY
          box={{ bottom: "1%", left: "0%", width: "50%", aspectRatio: "1.07" }} />
      </>
    ),
    paper: "#fbfaf6",
    ink: "#4e4a3f",
    inkSoft: "#94907f",
    accent: "#9aa274",
    frame: "#dcd9c8",
    border: "#e9e6d8",
    accentBg: "#f3f1e7",
    headerFont: "'Cinzel', serif",
    nameFont: "'Playfair Display', serif",
    scriptFont: "'Great Vibes', cursive",
    bodyFont: "'Cormorant Garamond', serif",
    headerTracking: "0.42em",
  },
  {
    id: "vintage-spray",
    name: "Vintage Spray",
    Decor: () => (
      <>
        <PngAccent src="/florals/vintage-spray.png" anchor="right top"
          box={{ top: "1%", right: "0%", width: "38%", height: "52%" }} />
        <PngAccent src="/florals/vintage-spray.png" anchor="right top" rotate={172} opacity={0.8}
          box={{ bottom: "1%", left: "0%", width: "28%", height: "40%" }} />
      </>
    ),
    paper: "#fdf9f7",
    ink: "#6e4a52",
    inkSoft: "#aa8a91",
    accent: "#d6718e",
    frame: "#ead2d8",
    border: "#f2e1e5",
    accentBg: "#f9ecef",
    headerFont: "'Montserrat', sans-serif",
    nameFont: "'Lora', serif",
    scriptFont: "'Dancing Script', cursive",
    bodyFont: "'Montserrat', sans-serif",
    headerTracking: "0.5em",
  },

  // ── Edge garlands — asymmetric, text shifts off the artwork ──
  {
    id: "english-rose-border",
    name: "English Rose Border",
    textStyle: { paddingRight: "30%", paddingLeft: "9%" },
    Decor: () => (
      <PngAccent src="/florals/english-roses.png" size="auto 102%" anchor="right center"
        box={{ top: "-1%", bottom: "-1%", right: 0, width: "40%" }} />
    ),
    paper: "#fcfaf5",
    ink: "#5a4a3c",
    inkSoft: "#a3937f",
    accent: "#c97083",
    frame: "#e0d4c2",
    border: "#ebe2d3",
    accentBg: "#f5efe4",
    headerFont: "'Cormorant Garamond', serif",
    nameFont: "'Playfair Display', serif",
    scriptFont: "'Great Vibes', cursive",
    bodyFont: "'Cormorant Garamond', serif",
    headerTracking: "0.35em",
  },
  {
    id: "dusty-meadow",
    name: "Dusty Meadow",
    textStyle: { paddingLeft: "23%", paddingRight: "23%" },
    Decor: () => (
      <>
        <PngAccent src="/florals/dusty-vine.png" size="contain" anchor="left center"
          box={{ top: "3%", bottom: "3%", left: "1%", width: "30%" }} />
        <PngAccent src="/florals/dusty-vine.png" size="contain" anchor="right center" flip
          box={{ top: "3%", bottom: "3%", right: "1%", width: "30%" }} />
      </>
    ),
    paper: "#fbfaf8",
    ink: "#5e5560",
    inkSoft: "#9a909c",
    accent: "#a48ba6",
    frame: "#ded6df",
    border: "#e9e3ea",
    accentBg: "#f3eff4",
    headerFont: "'Montserrat', sans-serif",
    nameFont: "'Cormorant Garamond', serif",
    scriptFont: "'Cormorant Garamond', serif",
    bodyFont: "'Montserrat', sans-serif",
    headerTracking: "0.55em",
  },

  // ── Greenery & minimal ──
  {
    id: "garden-greens",
    name: "Garden Greens",
    Decor: () => (
      <>
        <PngAccent src="/florals/eucalyptus-branch.png" anchor="left top" rotate={-10}
          box={{ top: "4%", left: "-4%", width: "34%", height: "70%" }} />
        <PngAccent src="/florals/seeded-sprig.png" anchor="left top" rotate={158} opacity={0.9}
          box={{ bottom: "0%", right: "-2%", width: "26%", height: "46%" }} />
      </>
    ),
    paper: "#fbfcf9",
    ink: "#45524a",
    inkSoft: "#8b9a8e",
    accent: "#7d9b84",
    frame: "#d2dcd2",
    border: "#e2e9e1",
    accentBg: "#eef3ee",
    headerFont: "'Montserrat', sans-serif",
    nameFont: "'Cormorant Garamond', serif",
    scriptFont: "'Dancing Script', cursive",
    bodyFont: "'Montserrat', sans-serif",
    headerTracking: "0.5em",
  },
  {
    id: "laurel-rise",
    name: "Laurel Rise",
    Decor: () => (
      <>
        <PngAccent src="/florals/laurel-branch.png" anchor="left bottom"
          box={{ bottom: "3%", left: "3%", width: "23%", height: "56%" }} />
        <PngAccent src="/florals/laurel-branch.png" anchor="left bottom" flip
          box={{ bottom: "3%", right: "3%", width: "23%", height: "56%" }} />
      </>
    ),
    paper: "#fbfdf9",
    ink: "#4d5a48",
    inkSoft: "#90a089",
    accent: "#8aa57e",
    frame: "#d5dfd0",
    border: "#e3eade",
    accentBg: "#eff4ec",
    headerFont: "'Cinzel', serif",
    nameFont: "'Cormorant Garamond', serif",
    scriptFont: "'Great Vibes', cursive",
    bodyFont: "'Cormorant Garamond', serif",
    headerTracking: "0.45em",
  },
  {
    id: "sweetheart-posy",
    name: "Sweetheart Posy",
    textStyle: { paddingTop: "22%" },
    Decor: () => (
      <PngAccent src="/florals/posy-hearts.png" size="contain" anchor="center top"
        box={{ top: "5%", left: "14%", right: "14%", height: "20%" }} />
    ),
    paper: "#fdfcfb",
    ink: "#555a5e",
    inkSoft: "#9aa0a5",
    accent: "#e294a8",
    frame: "#dfe2e4",
    border: "#eaeced",
    accentBg: "#f6eef1",
    headerFont: "'Montserrat', sans-serif",
    nameFont: "'Cormorant Garamond', serif",
    scriptFont: "'Dancing Script', cursive",
    bodyFont: "'Montserrat', sans-serif",
    headerTracking: "0.55em",
  },
  {
    id: "peach-bouquet",
    name: "Peach Bouquet",
    Decor: () => (
      <>
        <PngAccent src="/florals/peach-bouquet.png"
          box={{ top: "1%", left: "0%", width: "44%", aspectRatio: "1" }} />
        <PngAccent src="/florals/peach-bouquet.png" flip flipY opacity={0.92}
          box={{ bottom: "1%", right: "0%", width: "38%", aspectRatio: "1" }} />
      </>
    ),
    paper: "#fdfaf5",
    ink: "#5c4a3d",
    inkSoft: "#a8917e",
    accent: "#cf8662",
    frame: "#e3cdb8",
    border: "#eedfcf",
    accentBg: "#f8eee3",
    headerFont: "'Montserrat', sans-serif",
    nameFont: "'Cormorant Garamond', serif",
    scriptFont: "'Dancing Script', cursive",
    bodyFont: "'Montserrat', sans-serif",
    headerTracking: "0.5em",
  },
  {
    id: "line-rose",
    name: "Line Rose",
    Decor: () => (
      <div className="absolute pointer-events-none" style={{ top: "5.5%", left: "50%", transform: "translateX(-50%)", width: "30%", height: "24%" }}>
        <LineRose />
      </div>
    ),
    paper: "#fcfaf6",
    ink: "#5b5048",
    inkSoft: "#a3968b",
    accent: "#a98a72",
    frame: "#ddd2c4",
    border: "#eae2d6",
    accentBg: "#f4eee6",
    headerFont: "'Montserrat', sans-serif",
    nameFont: "'Cormorant Garamond', serif",
    scriptFont: "'Cormorant Garamond', serif",
    bodyFont: "'Montserrat', sans-serif",
    headerTracking: "0.55em",
  },
  {
    id: "rose-ribbon",
    name: "Rose Ribbon",
    textStyle: { paddingRight: "6%" },
    Decor: () => (
      // unflipped so the cascade falls along the right edge, not across the text
      <PngAccent src="/florals/rose-ribbon.png" anchor="right top"
        box={{ top: "0%", right: "0%", width: "54%", aspectRatio: "1" }} />
    ),
    paper: "#fdf8f7",
    ink: "#69464c",
    inkSoft: "#b08e94",
    accent: "#dd8296",
    frame: "#ecccd3",
    border: "#f3dde1",
    accentBg: "#fae9ec",
    headerFont: "'Libre Baskerville', serif",
    nameFont: "'Lora', serif",
    scriptFont: "'Great Vibes', cursive",
    bodyFont: "'Libre Baskerville', serif",
    headerTracking: "0.35em",
  },
  {
    id: "forget-me-not",
    name: "Forget-Me-Not",
    Decor: () => (
      <>
        <PngAccent src="/florals/forget-me-not.png"
          box={{ top: "0%", left: "0%", width: "44%", aspectRatio: "1" }} />
        <PngAccent src="/florals/forget-me-not.png" flip flipY opacity={0.9}
          box={{ bottom: "0%", right: "0%", width: "38%", aspectRatio: "1" }} />
      </>
    ),
    paper: "#f9fbfd",
    ink: "#2f4858",
    inkSoft: "#7e98a8",
    accent: "#4a7fa5",
    frame: "#c5d6e2",
    border: "#dae6ee",
    accentBg: "#eaf2f7",
    headerFont: "'Montserrat', sans-serif",
    nameFont: "'Playfair Display', serif",
    scriptFont: "'Dancing Script', cursive",
    bodyFont: "'Montserrat', sans-serif",
    headerTracking: "0.5em",
  },
  {
    id: "gilded-laurel",
    name: "Gilded Laurel",
    dark: true,
    Decor: () => (
      <>
        <div className="absolute pointer-events-none" style={{ top: "8%", left: "18%", right: "18%", height: "13%" }}>
          <LaurelArc />
        </div>
        <div className="absolute pointer-events-none" style={{ bottom: "8%", left: "18%", right: "18%", height: "13%", transform: "rotate(180deg)" }}>
          <LaurelArc />
        </div>
      </>
    ),
    paper: "#2c3530",
    ink: "#f2efe6",
    inkSoft: "#b8b2a0",
    accent: "#c2a36b",
    frame: "#5d6a5e",
    border: "#3c463f",
    accentBg: "#f2efe4",
    headerFont: "'Cinzel', serif",
    nameFont: "'Playfair Display', serif",
    scriptFont: "'Great Vibes', cursive",
    bodyFont: "'Cormorant Garamond', serif",
    headerTracking: "0.42em",
  },

  // ── New designs ──
  {
    id: "dusty-rose",
    name: "Dusty Rose",
    Decor: () => (
      <PngAccent src="/florals/dusty-rose-bouquet.png" size="contain" anchor="right bottom" flip flipY opacity={0.95}
        box={{ bottom: "1%", right: "1%", width: "38%", aspectRatio: "0.79" }} />
    ),
    paper: "#fbf8f7",
    ink: "#5d4750",
    inkSoft: "#a68d96",
    accent: "#bf8298",
    frame: "#e4d2d9",
    border: "#efe2e7",
    accentBg: "#f8edf1",
    headerFont: "'Cormorant Garamond', serif",
    nameFont: "'Playfair Display', serif",
    scriptFont: "'Great Vibes', cursive",
    bodyFont: "'Cormorant Garamond', serif",
    headerTracking: "0.4em",
  },
  {
    id: "falling-petals",
    name: "Falling Petals",
    textStyle: { paddingBottom: "16%" },
    Decor: () => (
      // 100% auto keeps the rose bed spanning the full card width at any size
      <PngAccent src="/florals/rose-petals.png" size="100% auto" anchor="center bottom"
        box={{ left: 0, right: 0, bottom: 0, top: "46%" }} />
    ),
    paper: "#fdf9f8",
    ink: "#6b4a52",
    inkSoft: "#b09098",
    accent: "#dd8b9c",
    frame: "#eccfd5",
    border: "#f4dfe3",
    accentBg: "#fbecef",
    headerFont: "'Cinzel', serif",
    nameFont: "'Playfair Display', serif",
    scriptFont: "'Great Vibes', cursive",
    bodyFont: "'Cormorant Garamond', serif",
    headerTracking: "0.42em",
  },
  {
    id: "bluebell",
    name: "Bluebell",
    Decor: () => (
      <PngAccent src="/florals/bluebell-corners.png" size="100% 100%"
        box={{ inset: 0 }} />
    ),
    paper: "#f7fbfc",
    ink: "#2f5566",
    inkSoft: "#7ba0ad",
    accent: "#3d97ad",
    frame: "#c4dee4",
    border: "#daebef",
    accentBg: "#e9f4f6",
    headerFont: "'Montserrat', sans-serif",
    nameFont: "'Lora', serif",
    scriptFont: "'Dancing Script', cursive",
    bodyFont: "'Montserrat', sans-serif",
    headerTracking: "0.48em",
  },
  {
    id: "lavender-haze",
    name: "Lavender Haze",
    Decor: () => (
      <PngAccent src="/florals/lavender-haze.png" size="100% 100%"
        box={{ inset: 0 }} />
    ),
    paper: "#fbfafd",
    ink: "#574b66",
    inkSoft: "#9d92ad",
    accent: "#9277b8",
    frame: "#ddd4ea",
    border: "#e9e3f1",
    accentBg: "#f3eef9",
    headerFont: "'Libre Baskerville', serif",
    nameFont: "'Lora', serif",
    scriptFont: "'Dancing Script', cursive",
    bodyFont: "'Libre Baskerville', serif",
    headerTracking: "0.35em",
  },
  {
    id: "wild-greenery",
    name: "Wild Greenery",
    noFrame: true,
    Decor: () => (
      <PngAccent src="/florals/wild-greenery.png" size="100% 100%"
        box={{ inset: 0 }} />
    ),
    paper: "#fbfdf9",
    ink: "#42554a",
    inkSoft: "#8a9c8e",
    accent: "#6f9a7e",
    frame: "#cfdcd0",
    border: "#e0e9e0",
    accentBg: "#edf3ed",
    headerFont: "'Montserrat', sans-serif",
    nameFont: "'Cormorant Garamond', serif",
    scriptFont: "'Dancing Script', cursive",
    bodyFont: "'Montserrat', sans-serif",
    headerTracking: "0.5em",
  },
  {
    id: "spring-meadow",
    name: "Spring Meadow",
    textStyle: { paddingBottom: "30%" },
    Decor: () => (
      <PngAccent src="/florals/meadow-blush.png" size="contain" anchor="right bottom"
        box={{ right: "2%", bottom: "0%", width: "56%", top: "58%" }} />
    ),
    paper: "#fdfafb",
    ink: "#6a5057",
    inkSoft: "#ab9097",
    accent: "#e58aa6",
    frame: "#edd5dc",
    border: "#f5e4e9",
    accentBg: "#fbeef2",
    headerFont: "'Montserrat', sans-serif",
    nameFont: "'Cormorant Garamond', serif",
    scriptFont: "'Dancing Script', cursive",
    bodyFont: "'Montserrat', sans-serif",
    headerTracking: "0.55em",
  },
  {
    id: "sweet-pea",
    name: "Sweet Pea",
    textStyle: { paddingLeft: "8%" },
    Decor: () => (
      <PngAccent src="/florals/sweet-pea.png" size="contain" anchor="left bottom"
        box={{ bottom: "1%", left: "0%", width: "48%", aspectRatio: "0.81" }} />
    ),
    paper: "#fbfafc",
    ink: "#4f4564",
    inkSoft: "#968cab",
    accent: "#8a72b5",
    frame: "#d9d1e8",
    border: "#e7e1f0",
    accentBg: "#f1edf8",
    headerFont: "'Cormorant Garamond', serif",
    nameFont: "'Playfair Display', serif",
    scriptFont: "'Great Vibes', cursive",
    bodyFont: "'Cormorant Garamond', serif",
    headerTracking: "0.4em",
  },
];

// Old template ids (previous designs) → closest current template
const legacyIdMap: Record<string, string> = {
  "camellia-vine": "english-rose-border",
  "jasmine-cascade": "garden-greens",
  "classic-roses": "rose-ribbon",
  "soft-peonies": "peach-bouquet",
  "wildflower-meadow": "forget-me-not",
  "tropical-paradise": "garden-greens",
  "minimalist-botanical": "line-rose",
  "vintage-blush": "rose-ribbon",
  "crimson-rose": "english-rose-border",
  "vintage-rose": "vintage-spray",
  "blush-peony": "peach-bouquet",
  "painted-anemones": "forget-me-not",
  "midnight-bouquet": "gilded-laurel",
  "garden-dahlias": "gilded-laurel",
  "olive-branch": "garden-greens",
  "blush-bloom": "peach-bouquet",
  "delicate-fern": "garden-greens",
  "sage-eucalyptus": "garden-greens",
};

export const resolveTemplate = (templateId: string): CardTemplate => {
  const id = legacyIdMap[templateId] || templateId;
  return saveTheDateTemplates.find(t => t.id === id) ?? saveTheDateTemplates[0];
};

// ============================================================
// MAIN COMPONENT
// ============================================================

interface SaveTheDateCardProps {
  templateId: string;
  names: { partner1: string; partner2: string };
  date: string;
  venue: string;
  design?: CardDesign;
  isEditable?: boolean;
  isFlipped?: boolean;
  onFlip?: () => void;
  rsvpCode?: string;
  storySlug?: string | null;
}

const SaveTheDateCard = ({
  templateId, names, date, venue, design,
  isFlipped: controlledIsFlipped, onFlip, rsvpCode, storySlug,
}: SaveTheDateCardProps) => {
  const navigate = useNavigate();
  const [internalIsFlipped, setInternalIsFlipped] = useState(false);
  const [rsvpStatus, setRsvpStatus] = useState<"attending" | "declined" | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [guestName, setGuestName] = useState("");
  const [guestCount, setGuestCount] = useState("1");
  // One response per guest per invitation — remembered on this device.
  // A guest may only flip their answer afterwards (also enforced server-side).
  const rsvpStorageKey = rsvpCode ? `rsvp-response:${rsvpCode}` : null;
  const [priorResponse, setPriorResponse] = useState<{ name: string; status: "confirmed" | "declined" } | null>(() => {
    if (!rsvpStorageKey) return null;
    try { return JSON.parse(localStorage.getItem(rsvpStorageKey) || "null"); } catch { return null; }
  });
  const [isDragging, setIsDragging] = useState(false);
  const [dragRotation, setDragRotation] = useState(0);
  const startX = useRef<number>(0);
  const cardRef = useRef<HTMLDivElement>(null);

  const isFlipped = controlledIsFlipped !== undefined ? controlledIsFlipped : internalIsFlipped;
  const baseRotation = isFlipped ? 180 : 0;
  const align: CardAlign = design?.align || "center";

  const handleFlip = useCallback(() => {
    if (onFlip) onFlip(); else setInternalIsFlipped(f => !f);
  }, [onFlip, internalIsFlipped]);

  const calcRot = (dx: number) => {
    const w = cardRef.current?.offsetWidth || 300;
    const r = (dx / w) * 180;
    return isFlipped ? Math.max(-180, Math.min(0, r)) : Math.max(0, Math.min(180, -r));
  };

  const isInteractive = (t: EventTarget | null) =>
    !!(t instanceof HTMLElement && t.closest('input,textarea,select,button,[role="button"],label'));

  const handleTouchStart = (e: React.TouchEvent) => {
    if (isInteractive(e.target)) return;
    startX.current = e.touches[0].clientX; setIsDragging(true); setDragRotation(0);
  };
  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    setDragRotation(calcRot(e.touches[0].clientX - startX.current));
  };
  const handleTouchEnd = () => {
    if (!isDragging) return;
    if (Math.abs(dragRotation) > 45) handleFlip();
    setIsDragging(false); setDragRotation(0);
  };

  const gMouseMove = useCallback((e: MouseEvent) => {
    setDragRotation(calcRot(e.clientX - startX.current));
  }, [isFlipped]);

  const gMouseUp = useCallback(() => {
    setDragRotation(prev => { if (Math.abs(prev) > 45) setTimeout(() => handleFlip(), 0); return 0; });
    setIsDragging(false);
    document.removeEventListener('mousemove', gMouseMove);
    document.removeEventListener('mouseup', gMouseUp);
  }, [handleFlip, gMouseMove]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (isInteractive(e.target)) return;
    e.preventDefault();
    startX.current = e.clientX; setIsDragging(true); setDragRotation(0);
    document.addEventListener('mousemove', gMouseMove);
    document.addEventListener('mouseup', gMouseUp);
  };

  const template = resolveTemplate(templateId);
  const { Decor } = template;

  const handleRsvpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestName.trim()) { toast.error("Please enter your name"); return; }
    if (!rsvpStatus) { toast.error("Please select if you're attending"); return; }
    setIsSubmitting(true);
    try {
      if (rsvpCode) {
        const status = rsvpStatus === "attending" ? "confirmed" : "declined";
        const res = await rsvpService.submitRsvp({
          rsvpCode, name: guestName.trim(),
          status,
          guestCount: parseInt(guestCount, 10),
        });
        toast.success(res.message);
        if (rsvpStorageKey) {
          const stored = { name: guestName.trim(), status } as const;
          localStorage.setItem(rsvpStorageKey, JSON.stringify(stored));
          setPriorResponse(stored);
        }
        setGuestName(""); setGuestCount("1"); setRsvpStatus(null);
        // Straight to the couple's website; the site acknowledges the response
        // from the query param, so there's no need to linger here first.
        if (storySlug) navigate(`/s/${storySlug}?rsvp=${status}`, { replace: true });
      } else {
        toast.success(rsvpStatus === "attending"
          ? "Thank you! We can't wait to celebrate with you!"
          : "Thank you for letting us know. We'll miss you!");
        setGuestName(""); setGuestCount("1"); setRsvpStatus(null);
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to submit RSVP");
    } finally { setIsSubmitting(false); }
  };

  // Flip a previous answer to the opposite one (the only allowed change)
  const handleChangeResponse = async () => {
    if (!priorResponse || !rsvpCode || !rsvpStorageKey) return;
    const newStatus = priorResponse.status === "confirmed" ? "declined" : "confirmed";
    setIsSubmitting(true);
    try {
      const res = await rsvpService.submitRsvp({
        rsvpCode,
        name: priorResponse.name,
        status: newStatus,
        guestCount: newStatus === "confirmed" ? parseInt(guestCount, 10) : undefined,
      });
      toast.success(res.message);
      const stored = { name: priorResponse.name, status: newStatus } as const;
      localStorage.setItem(rsvpStorageKey, JSON.stringify(stored));
      setPriorResponse(stored);
      if (storySlug) navigate(`/s/${storySlug}?rsvp=${newStatus}`, { replace: true });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update RSVP");
    } finally { setIsSubmitting(false); }
  };

  const stopProp = (e: React.MouseEvent | React.TouchEvent) => e.stopPropagation();

  const formatDate = (s: string) => {
    try {
      const d = new Date(s);
      if (isNaN(d.getTime())) return s;
      return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    } catch { return s; }
  };

  const formatName = (n: string) =>
    n.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');

  const currentRotation = baseRotation + dragRotation;

  const alignClasses =
    align === "left" ? "items-start text-left"
    : align === "right" ? "items-end text-right"
    : "items-center text-center";

  // Double hairline frame — the printed-stationery signature detail
  const Frame = () => (
    <>
      <div className="absolute pointer-events-none rounded-[10px] z-10"
        style={{ inset: "9px", border: `1px solid ${template.frame}`, opacity: 0.9 }} />
      <div className="absolute pointer-events-none rounded-[8px] z-10"
        style={{ inset: "13px", border: `1px solid ${template.frame}`, opacity: 0.4 }} />
    </>
  );

  const Rule = () => (
    <div className="flex items-center gap-2 my-2 sm:my-2.5" style={{ width: "42%" }}>
      <div className="flex-1 h-px" style={{ backgroundColor: template.accent, opacity: 0.5 }} />
      <div className="w-1 h-1 rotate-45" style={{ backgroundColor: template.accent, opacity: 0.75 }} />
      <div className="flex-1 h-px" style={{ backgroundColor: template.accent, opacity: 0.5 }} />
    </div>
  );

  return (
    <div
      ref={cardRef}
      className="w-full h-full min-h-[360px] sm:min-h-[450px] md:min-h-[500px]"
      style={{ perspective: "1200px" }}
      onTouchStart={handleTouchStart} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd}
      onMouseDown={handleMouseDown}
    >
      <div
        className={`relative w-full h-full ${isDragging ? "" : "transition-transform duration-500 ease-out"}`}
        style={{
          transformStyle: "preserve-3d",
          // @ts-ignore
          WebkitTransformStyle: "preserve-3d",
          transform: `rotateY(${currentRotation}deg)`,
          cursor: isDragging ? "grabbing" : "grab",
          willChange: "transform",
        }}
      >
        {/* ── FRONT ── */}
        <div
          className="absolute inset-0 w-full h-full rounded-xl overflow-hidden shadow-2xl"
          style={{
            backgroundColor: template.paper,
            border: `1px solid ${template.border}`,
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
            // @ts-ignore
            WebkitTransform: "rotateY(0deg)",
            willChange: "transform",
            pointerEvents: isFlipped ? "none" : "auto",
          }}
        >
          <Decor />
          {!template.noFrame && <Frame />}

          {/* Text — generous whitespace */}
          <div
            className={`relative z-20 flex flex-col justify-center h-full px-8 sm:px-10 ${alignClasses}`}
            style={template.textStyle}
          >
            <p className="uppercase text-[9px] sm:text-[11px]"
              style={{ fontFamily: template.headerFont, letterSpacing: template.headerTracking, color: template.inkSoft }}>
              Save the Date
            </p>
            <p className="text-base sm:text-xl mt-1"
              style={{ fontFamily: template.scriptFont, color: template.accent }}>
              for the wedding of
            </p>

            <Rule />

            <h2 className="leading-tight text-xl sm:text-3xl md:text-4xl"
              style={{ fontFamily: template.nameFont, color: template.ink }}>
              {formatName(names.partner1 || "Partner One")}
            </h2>
            <p className="text-xl sm:text-3xl leading-snug my-0.5"
              style={{ fontFamily: template.scriptFont, color: template.accent }}>
              &amp;
            </p>
            <h2 className="leading-tight text-xl sm:text-3xl md:text-4xl"
              style={{ fontFamily: template.nameFont, color: template.ink }}>
              {formatName(names.partner2 || "Partner Two")}
            </h2>

            <Rule />

            <p className="tracking-[0.2em] uppercase text-[10px] sm:text-xs"
              style={{ fontFamily: template.bodyFont, color: template.ink }}>
              {formatDate(date)}
            </p>
            <p className="text-base sm:text-lg mt-1"
              style={{ fontFamily: template.scriptFont, color: template.inkSoft }}>
              {venue || "Venue TBD"}
            </p>

            <p className="uppercase mt-4 sm:mt-6 text-[7px] sm:text-[8px]"
              style={{ fontFamily: template.headerFont, letterSpacing: "0.3em", color: template.inkSoft, opacity: 0.75 }}>
              Invitation to Follow
            </p>
          </div>

          <p className="absolute bottom-1.5 left-1/2 -translate-x-1/2 z-20 text-[7px] sm:text-[8px] whitespace-nowrap"
            style={{ color: template.inkSoft, opacity: 0.5 }}>
            ← swipe to RSVP →
          </p>
        </div>

        {/* ── BACK – RSVP ── */}
        <div
          className="absolute inset-0 w-full h-full rounded-xl overflow-hidden shadow-2xl flex flex-col"
          style={{
            backgroundColor: template.dark ? "#faf8f2" : template.paper,
            border: `1px solid ${template.border}`,
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
            // @ts-ignore
            WebkitTransform: "rotateY(180deg)",
            willChange: "transform",
            pointerEvents: isFlipped ? "auto" : "none",
          }}
        >
          {/* Header */}
          <div className="shrink-0 pt-4 pb-2 text-center">
            <p className="uppercase text-[8px] sm:text-[9px]"
              style={{ fontFamily: template.headerFont, letterSpacing: template.headerTracking, color: template.inkSoft }}>
              kindly reply
            </p>
            <p className="mt-0.5 text-xl sm:text-2xl"
              style={{ fontFamily: template.scriptFont, color: template.accent }}>
              RSVP
            </p>
            <div className="flex items-center justify-center gap-2 mt-1 px-14">
              <div className="flex-1 h-px" style={{ backgroundColor: template.frame }} />
              <div className="w-1 h-1 rotate-45" style={{ backgroundColor: template.accent, opacity: 0.6 }} />
              <div className="flex-1 h-px" style={{ backgroundColor: template.frame }} />
            </div>
          </div>

          {/* Form — stationery-style: bottom-border fields, no box look */}
          <div className="flex-1 overflow-y-auto px-5 sm:px-6 py-1" onMouseDown={stopProp} onTouchStart={stopProp}>
            {priorResponse ? (
              /* Already responded — only a change of heart is allowed */
              <div className="h-full flex flex-col items-center justify-center text-center px-2 pb-4">
                <p className="text-2xl sm:text-3xl"
                  style={{ fontFamily: template.scriptFont, color: template.accent }}>
                  Thank you
                </p>
                <p className="mt-1 text-sm sm:text-base"
                  style={{ fontFamily: template.nameFont, color: template.dark ? "#4d4a43" : template.ink }}>
                  {priorResponse.name}
                </p>
                <p className="mt-2 text-[10px] sm:text-xs"
                  style={{ fontFamily: template.bodyFont, color: template.inkSoft }}>
                  {priorResponse.status === "confirmed"
                    ? "You've accepted — we can't wait to see you!"
                    : "You've declined this invitation."}
                </p>

                <div className="flex items-center gap-2 my-4 w-2/3">
                  <div className="flex-1 h-px" style={{ backgroundColor: template.frame }} />
                  <div className="w-1 h-1 rotate-45" style={{ backgroundColor: template.accent, opacity: 0.6 }} />
                  <div className="flex-1 h-px" style={{ backgroundColor: template.frame }} />
                </div>

                <p className="text-[9px] uppercase tracking-widest mb-2"
                  style={{ fontFamily: template.bodyFont, color: template.inkSoft }}>
                  Changed your mind?
                </p>

                {priorResponse.status === "declined" && (
                  <select
                    value={guestCount}
                    onChange={e => setGuestCount(e.target.value)}
                    className="w-2/3 bg-transparent text-xs sm:text-sm outline-none pb-0.5 mb-3 text-center appearance-none"
                    style={{
                      fontFamily: template.bodyFont,
                      color: template.dark ? "#4d4a43" : template.ink,
                      borderBottom: `1px solid ${template.frame}`,
                    }}>
                    <option value={1}>Just me</option>
                    <option value={2}>Me + 1 guest</option>
                  </select>
                )}

                <button
                  type="button"
                  onClick={handleChangeResponse}
                  disabled={isSubmitting}
                  className="w-2/3 py-2 text-[9px] sm:text-[10px] uppercase tracking-[0.25em]"
                  style={{
                    fontFamily: template.bodyFont,
                    border: `1px solid ${template.accent}`,
                    backgroundColor: "transparent",
                    color: template.accent,
                    borderRadius: "4px",
                  }}>
                  {isSubmitting
                    ? <Loader2 className="w-3 h-3 animate-spin mx-auto" />
                    : priorResponse.status === "confirmed" ? "Decline instead" : "Accept instead"}
                </button>
              </div>
            ) : (
            <form onSubmit={handleRsvpSubmit} className="space-y-3 sm:space-y-3.5">

              {/* Name */}
              <div>
                <p className="text-[8px] uppercase tracking-widest mb-0.5"
                  style={{ fontFamily: template.bodyFont, color: template.inkSoft }}>
                  Your name
                </p>
                <input
                  placeholder="Full name"
                  value={guestName}
                  onChange={e => setGuestName(e.target.value)}
                  required
                  className="w-full bg-transparent text-xs sm:text-sm outline-none pb-0.5"
                  style={{
                    fontFamily: template.bodyFont,
                    color: template.dark ? "#4d4a43" : template.ink,
                    borderBottom: `1px solid ${template.frame}`,
                    caretColor: template.accent,
                  }}
                />
              </div>

              {/* Attend / Decline */}
              <div>
                <p className="text-[8px] uppercase tracking-widest mb-1.5"
                  style={{ fontFamily: template.bodyFont, color: template.inkSoft }}>
                  Will you join us?
                </p>
                <div className="flex gap-2">
                  {(["attending", "declined"] as const).map(s => {
                    const selected = rsvpStatus === s;
                    return (
                      <button key={s} type="button" onClick={() => setRsvpStatus(s)}
                        className="flex-1 py-1.5 sm:py-2 text-[9px] sm:text-[10px] uppercase tracking-wider transition-all"
                        style={{
                          fontFamily: template.bodyFont,
                          border: `1px solid ${selected ? template.accent : template.frame}`,
                          backgroundColor: selected ? template.accentBg : "transparent",
                          color: selected ? template.accent : template.inkSoft,
                          borderRadius: "4px",
                        }}>
                        {s === "attending" ? "Joyfully accept" : "Regretfully decline"}
                      </button>
                    );
                  })}
                </div>
              </div>

              {rsvpStatus === "attending" && (
                <div>
                  <p className="text-[8px] uppercase tracking-widest mb-0.5"
                    style={{ fontFamily: template.bodyFont, color: template.inkSoft }}>
                    Number of guests
                  </p>
                  <select
                    value={guestCount}
                    onChange={e => setGuestCount(e.target.value)}
                    className="w-full bg-transparent text-xs sm:text-sm outline-none pb-0.5 appearance-none"
                    style={{
                      fontFamily: template.bodyFont,
                      color: template.dark ? "#4d4a43" : template.ink,
                      borderBottom: `1px solid ${template.frame}`,
                    }}>
                    <option value={1}>Just me</option>
                    <option value={2}>Me + 1 guest</option>
                  </select>
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={!rsvpStatus || !guestName.trim() || isSubmitting}
                className="w-full py-2 sm:py-2.5 text-[9px] sm:text-[10px] uppercase tracking-[0.25em] transition-opacity"
                style={{
                  fontFamily: template.bodyFont,
                  backgroundColor: rsvpStatus && guestName.trim() ? template.accent : template.frame,
                  color: "white",
                  borderRadius: "4px",
                  opacity: rsvpStatus && guestName.trim() ? 1 : 0.55,
                }}>
                {isSubmitting
                  ? <Loader2 className="w-3 h-3 animate-spin mx-auto" />
                  : "Send Response"}
              </button>
            </form>
            )}
          </div>

          <p className="shrink-0 text-center text-[7px] sm:text-[8px] py-1.5"
            style={{ color: template.inkSoft, opacity: 0.5, borderTop: `1px solid ${template.border}` }}>
            ← swipe to flip back →
          </p>
        </div>
      </div>
    </div>
  );
};

export default SaveTheDateCard;
