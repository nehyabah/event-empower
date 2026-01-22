import { useState, useRef, useCallback } from "react";
import { Check, X, Loader2, Users, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

// ============================================
// FLORAL DESIGNS - Each template has unique flowers
// ============================================

// Template 1: Classic Roses - Traditional romantic roses
const RosesCorner = ({ className = "", flip = false }: { className?: string; flip?: boolean }) => (
  <svg viewBox="0 0 200 200" className={className} style={{ transform: flip ? "scaleX(-1)" : undefined }}>
    {/* Main Rose */}
    <g>
      <circle cx="50" cy="55" r="18" fill="#c97b84" />
      <circle cx="50" cy="55" r="14" fill="#d4919a" />
      <circle cx="50" cy="55" r="9" fill="#e0a8af" />
      <circle cx="50" cy="55" r="5" fill="#ebc4c9" />
      <ellipse cx="35" cy="48" rx="10" ry="7" fill="#c97b84" opacity="0.8" transform="rotate(-25 35 48)" />
      <ellipse cx="65" cy="48" rx="10" ry="7" fill="#c97b84" opacity="0.8" transform="rotate(25 65 48)" />
      <ellipse cx="38" cy="68" rx="9" ry="6" fill="#c97b84" opacity="0.7" transform="rotate(15 38 68)" />
      <ellipse cx="62" cy="68" rx="9" ry="6" fill="#c97b84" opacity="0.7" transform="rotate(-15 62 68)" />
    </g>
    {/* Small Rose Bud */}
    <g>
      <ellipse cx="95" cy="35" rx="8" ry="10" fill="#d4919a" transform="rotate(-10 95 35)" />
      <ellipse cx="92" cy="32" rx="5" ry="7" fill="#e0a8af" transform="rotate(-15 92 32)" />
    </g>
    {/* Leaves and Stems */}
    <g stroke="#4a6741" strokeWidth="2" fill="none">
      <path d="M50 73 Q45 100, 35 140" />
      <path d="M35 140 Q30 165, 40 190" />
      <path d="M95 45 Q100 70, 90 100" />
    </g>
    <g fill="#5a7f4e">
      <ellipse cx="28" cy="100" rx="15" ry="8" transform="rotate(-45 28 100)" opacity="0.8" />
      <ellipse cx="55" cy="115" rx="12" ry="6" transform="rotate(30 55 115)" opacity="0.7" />
      <ellipse cx="25" cy="155" rx="14" ry="7" transform="rotate(-30 25 155)" opacity="0.8" />
    </g>
    {/* Small accent flowers */}
    <g fill="#f0c4c4">
      <circle cx="80" cy="70" r="4" />
      <circle cx="75" cy="68" r="3" opacity="0.7" />
      <circle cx="85" cy="72" r="3" opacity="0.7" />
    </g>
  </svg>
);

// Template 2: Peonies - Lush, full peony blooms
const PeoniesCorner = ({ className = "", flip = false }: { className?: string; flip?: boolean }) => (
  <svg viewBox="0 0 200 200" className={className} style={{ transform: flip ? "scaleX(-1)" : undefined }}>
    {/* Main Peony */}
    <g>
      {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => (
        <ellipse
          key={i}
          cx="55"
          cy="60"
          rx="22"
          ry="12"
          fill={i % 2 === 0 ? "#f4b8c5" : "#f9d1db"}
          transform={`rotate(${angle} 55 60)`}
          opacity={0.9 - i * 0.05}
        />
      ))}
      <circle cx="55" cy="60" r="12" fill="#fce4ec" />
      <circle cx="55" cy="60" r="6" fill="#fff5f7" />
    </g>
    {/* Secondary Peony */}
    <g>
      {[0, 60, 120, 180, 240, 300].map((angle, i) => (
        <ellipse
          key={i}
          cx="100"
          cy="40"
          rx="14"
          ry="8"
          fill={i % 2 === 0 ? "#f9d1db" : "#fce4ec"}
          transform={`rotate(${angle} 100 40)`}
          opacity={0.85}
        />
      ))}
      <circle cx="100" cy="40" r="8" fill="#fff5f7" />
    </g>
    {/* Foliage */}
    <g fill="#3d5c3a">
      <ellipse cx="30" cy="110" rx="20" ry="10" transform="rotate(-50 30 110)" opacity="0.85" />
      <ellipse cx="70" cy="100" rx="18" ry="9" transform="rotate(40 70 100)" opacity="0.8" />
      <ellipse cx="25" cy="150" rx="22" ry="11" transform="rotate(-35 25 150)" opacity="0.85" />
      <ellipse cx="55" cy="140" rx="16" ry="8" transform="rotate(25 55 140)" opacity="0.75" />
    </g>
    <g stroke="#3d5c3a" strokeWidth="1.5" fill="none">
      <path d="M55 80 Q45 110, 35 150" />
      <path d="M35 150 Q30 170, 45 190" />
    </g>
  </svg>
);

// Template 3: Wildflowers - Meadow style with varied flowers
const WildflowersCorner = ({ className = "", flip = false }: { className?: string; flip?: boolean }) => (
  <svg viewBox="0 0 200 200" className={className} style={{ transform: flip ? "scaleX(-1)" : undefined }}>
    {/* Daisy */}
    <g>
      {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((angle, i) => (
        <ellipse key={i} cx="45" cy="50" rx="12" ry="5" fill="white" stroke="#e8e8e8" strokeWidth="0.5" transform={`rotate(${angle} 45 50)`} />
      ))}
      <circle cx="45" cy="50" r="8" fill="#ffd54f" />
    </g>
    {/* Lavender Sprigs */}
    <g>
      <line x1="85" y1="80" x2="95" y2="30" stroke="#7c9a6e" strokeWidth="1.5" />
      {[30, 40, 50, 60, 70].map((y, i) => (
        <ellipse key={i} cx="95" cy={y} rx="4" ry="6" fill="#9b7bb8" transform={`rotate(${i % 2 ? 15 : -15} 95 ${y})`} />
      ))}
    </g>
    {/* Small Blue Flowers */}
    <g fill="#7ba3c9">
      {[0, 72, 144, 216, 288].map((angle, i) => (
        <ellipse key={i} cx="70" cy="75" rx="6" ry="4" transform={`rotate(${angle} 70 75)`} />
      ))}
      <circle cx="70" cy="75" r="3" fill="#ffd54f" />
    </g>
    {/* Orange Poppy */}
    <g>
      {[0, 72, 144, 216, 288].map((angle, i) => (
        <ellipse key={i} cx="30" cy="95" rx="10" ry="8" fill="#e8956d" opacity="0.9" transform={`rotate(${angle} 30 95)`} />
      ))}
      <circle cx="30" cy="95" r="5" fill="#3d3d3d" />
    </g>
    {/* Stems and grass */}
    <g stroke="#7c9a6e" strokeWidth="1.5" fill="none">
      <path d="M45 62 Q40 100, 35 150" />
      <path d="M30 108 Q25 140, 30 180" />
      <path d="M70 85 Q65 120, 55 160" />
    </g>
    <g stroke="#9cb88a" strokeWidth="1" fill="none" opacity="0.6">
      <path d="M15 180 Q20 150, 15 120" />
      <path d="M25 185 Q30 160, 22 130" />
      <path d="M60 190 Q55 165, 60 140" />
    </g>
  </svg>
);

// Template 4: Tropical - Monstera and exotic flowers
const TropicalCorner = ({ className = "", flip = false }: { className?: string; flip?: boolean }) => (
  <svg viewBox="0 0 200 200" className={className} style={{ transform: flip ? "scaleX(-1)" : undefined }}>
    {/* Monstera Leaf */}
    <g fill="#2d5a45">
      <path d="M60 30 Q90 50, 85 100 Q70 90, 60 100 Q50 90, 35 100 Q30 50, 60 30" opacity="0.9" />
      <path d="M60 30 Q60 60, 60 100" stroke="#1a3d2e" strokeWidth="2" fill="none" />
      {/* Leaf holes */}
      <ellipse cx="50" cy="60" rx="8" ry="12" fill="#faf8f5" />
      <ellipse cx="70" cy="65" rx="7" ry="10" fill="#faf8f5" />
    </g>
    {/* Bird of Paradise */}
    <g>
      <path d="M110 50 Q130 30, 140 45 Q130 50, 110 50" fill="#ff7043" />
      <path d="M110 50 Q125 40, 135 55 Q125 55, 110 50" fill="#ff8a65" />
      <path d="M110 50 Q120 55, 130 65 Q118 58, 110 50" fill="#5c6bc0" />
      <path d="M95 70 Q110 50, 110 50 Q105 65, 95 70" fill="#2d5a45" />
    </g>
    {/* Palm Frond */}
    <g stroke="#3d6b4f" strokeWidth="1.5" fill="none">
      <path d="M30 120 Q20 80, 40 40" />
    </g>
    <g fill="#4a7c59">
      {[40, 50, 60, 70, 80, 90, 100].map((y, i) => (
        <ellipse key={i} cx={25 + i * 2} cy={y} rx="15" ry="4" transform={`rotate(${-30 + i * 5} ${25 + i * 2} ${y})`} opacity="0.8" />
      ))}
    </g>
    {/* Plumeria */}
    <g>
      {[0, 72, 144, 216, 288].map((angle, i) => (
        <ellipse key={i} cx="50" cy="150" rx="12" ry="8" fill="white" transform={`rotate(${angle} 50 150)`} />
      ))}
      <circle cx="50" cy="150" r="6" fill="#fff59d" />
    </g>
  </svg>
);

// Template 5: Minimalist Botanical - Simple line art
const MinimalistCorner = ({ className = "", flip = false }: { className?: string; flip?: boolean }) => (
  <svg viewBox="0 0 200 200" className={className} style={{ transform: flip ? "scaleX(-1)" : undefined }}>
    <g stroke="#8b7355" strokeWidth="1.2" fill="none">
      {/* Main branch */}
      <path d="M30 180 Q40 140, 50 100 Q60 60, 80 30" />
      {/* Leaves - simple lines */}
      <path d="M42 130 Q30 120, 25 135 Q35 140, 42 130" />
      <path d="M48 110 Q60 100, 65 115 Q55 120, 48 110" />
      <path d="M55 85 Q42 75, 38 90 Q50 95, 55 85" />
      <path d="M65 60 Q78 50, 82 65 Q70 70, 65 60" />
      {/* Small circles/berries */}
      <circle cx="75" cy="40" r="4" fill="#c9a96b" stroke="none" />
      <circle cx="85" cy="35" r="3" fill="#c9a96b" stroke="none" />
      <circle cx="80" cy="48" r="3" fill="#c9a96b" stroke="none" />
      {/* Secondary branch */}
      <path d="M50 100 Q70 110, 90 100" />
      <path d="M70 105 Q75 95, 85 100 Q78 108, 70 105" />
      {/* Eucalyptus-style leaves */}
      <ellipse cx="100" cy="95" rx="8" ry="12" transform="rotate(20 100 95)" />
      <ellipse cx="115" cy="90" rx="7" ry="10" transform="rotate(-15 115 90)" />
    </g>
    {/* Subtle dots */}
    <g fill="#c9a96b" opacity="0.5">
      <circle cx="20" cy="160" r="2" />
      <circle cx="25" cy="170" r="1.5" />
      <circle cx="15" cy="150" r="1.5" />
    </g>
  </svg>
);

// ============================================
// TEMPLATE DEFINITIONS
// ============================================

export const saveTheDateTemplates = [
  {
    id: "classic-roses",
    name: "Classic Roses",
    // Fonts
    headerFont: "'Cinzel', serif",
    nameFont: "'Playfair Display', serif",
    scriptFont: "'Great Vibes', cursive",
    bodyFont: "'Cormorant Garamond', serif",
    // Colors
    accent: "#8b4557",
    accentLight: "#c97b8a",
    border: "#f0d4da",
    background: "#fffbfc",
    accentBg: "#fdf5f7",
    // Floral component
    FloralComponent: RosesCorner,
    // Style variations
    nameStyle: "uppercase",
    headerTracking: "0.4em",
  },
  {
    id: "soft-peonies",
    name: "Soft Peonies",
    headerFont: "'Libre Baskerville', serif",
    nameFont: "'Lora', serif",
    scriptFont: "'Dancing Script', cursive",
    bodyFont: "'Libre Baskerville', serif",
    accent: "#6b4c5a",
    accentLight: "#a07a8a",
    border: "#e8d8e0",
    background: "#fdf9fb",
    accentBg: "#f8f0f4",
    FloralComponent: PeoniesCorner,
    nameStyle: "capitalize",
    headerTracking: "0.35em",
  },
  {
    id: "wildflower-meadow",
    name: "Wildflower Meadow",
    headerFont: "'Montserrat', sans-serif",
    nameFont: "'Cormorant Garamond', serif",
    scriptFont: "'Dancing Script', cursive",
    bodyFont: "'Montserrat', sans-serif",
    accent: "#5a6b4a",
    accentLight: "#8a9b7a",
    border: "#d8e4d0",
    background: "#fafdf8",
    accentBg: "#f0f5ec",
    FloralComponent: WildflowersCorner,
    nameStyle: "uppercase",
    headerTracking: "0.5em",
  },
  {
    id: "tropical-paradise",
    name: "Tropical Paradise",
    headerFont: "'Cinzel', serif",
    nameFont: "'Playfair Display', serif",
    scriptFont: "'Tangerine', cursive",
    bodyFont: "'Lora', serif",
    accent: "#2d5a45",
    accentLight: "#4a7c59",
    border: "#c8e0d8",
    background: "#f8fcfa",
    accentBg: "#e8f4f0",
    FloralComponent: TropicalCorner,
    nameStyle: "uppercase",
    headerTracking: "0.45em",
  },
  {
    id: "minimalist-botanical",
    name: "Minimalist Botanical",
    headerFont: "'Montserrat', sans-serif",
    nameFont: "'Cormorant Garamond', serif",
    scriptFont: "'Cormorant Garamond', serif",
    bodyFont: "'Montserrat', sans-serif",
    accent: "#5a4a3a",
    accentLight: "#8b7355",
    border: "#e8dfd5",
    background: "#faf8f5",
    accentBg: "#f5efe8",
    FloralComponent: MinimalistCorner,
    nameStyle: "uppercase",
    headerTracking: "0.6em",
  },
];

// ============================================
// DECORATIVE ELEMENTS
// ============================================

const Butterfly = ({ color = "#c97b84" }: { color?: string }) => (
  <svg viewBox="0 0 40 30" className="w-8 h-6 md:w-10 md:h-8">
    <g fill="none" stroke={color} strokeWidth="0.5">
      <ellipse cx="12" cy="15" rx="10" ry="8" fill={color} opacity="0.3" transform="rotate(-20 12 15)" />
      <ellipse cx="28" cy="15" rx="10" ry="8" fill={color} opacity="0.3" transform="rotate(20 28 15)" />
      <ellipse cx="14" cy="18" rx="6" ry="5" fill={color} opacity="0.2" transform="rotate(-15 14 18)" />
      <ellipse cx="26" cy="18" rx="6" ry="5" fill={color} opacity="0.2" transform="rotate(15 26 18)" />
      <line x1="20" y1="8" x2="20" y2="24" stroke={color} strokeWidth="1.5" />
      <path d="M20 8 Q18 4, 15 2" stroke={color} />
      <path d="M20 8 Q22 4, 25 2" stroke={color} />
    </g>
  </svg>
);

// ============================================
// MAIN COMPONENT
// ============================================

interface SaveTheDateCardProps {
  templateId: string;
  names: { partner1: string; partner2: string };
  date: string;
  venue: string;
  isEditable?: boolean;
  isFlipped?: boolean;
  onFlip?: () => void;
}

const SaveTheDateCard = ({
  templateId,
  names,
  date,
  venue,
  isFlipped: controlledIsFlipped,
  onFlip,
}: SaveTheDateCardProps) => {
  const [internalIsFlipped, setInternalIsFlipped] = useState(false);
  const [rsvpStatus, setRsvpStatus] = useState<"attending" | "declined" | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [guestName, setGuestName] = useState("");
  const [guestCount, setGuestCount] = useState("1");
  const [dietaryNotes, setDietaryNotes] = useState("");

  const [isDragging, setIsDragging] = useState(false);
  const [dragRotation, setDragRotation] = useState(0);
  const startX = useRef<number>(0);
  const cardRef = useRef<HTMLDivElement>(null);

  const isFlipped = controlledIsFlipped !== undefined ? controlledIsFlipped : internalIsFlipped;
  const baseRotation = isFlipped ? 180 : 0;

  const handleFlip = useCallback(() => {
    if (onFlip) {
      onFlip();
    } else {
      setInternalIsFlipped(!internalIsFlipped);
    }
  }, [onFlip, internalIsFlipped]);

  const calculateRotation = (deltaX: number) => {
    const cardWidth = cardRef.current?.offsetWidth || 300;
    const rotation = (deltaX / cardWidth) * 180;
    return isFlipped
      ? Math.max(-180, Math.min(0, rotation))
      : Math.max(0, Math.min(180, -rotation));
  };

  const isInteractiveElement = (target: EventTarget | null): boolean => {
    if (!target || !(target instanceof HTMLElement)) return false;
    return !!(target.closest('input, textarea, select, button, [role="button"], label'));
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (isInteractiveElement(e.target)) return;
    startX.current = e.touches[0].clientX;
    setIsDragging(true);
    setDragRotation(0);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    setDragRotation(calculateRotation(e.touches[0].clientX - startX.current));
  };

  const handleTouchEnd = () => {
    if (!isDragging) return;
    if (Math.abs(dragRotation) > 45) handleFlip();
    setIsDragging(false);
    setDragRotation(0);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (isInteractiveElement(e.target)) return;
    e.preventDefault();
    startX.current = e.clientX;
    setIsDragging(true);
    setDragRotation(0);
    document.addEventListener('mousemove', handleGlobalMouseMove);
    document.addEventListener('mouseup', handleGlobalMouseUp);
  };

  const handleGlobalMouseMove = useCallback((e: MouseEvent) => {
    setDragRotation(calculateRotation(e.clientX - startX.current));
  }, [isFlipped]);

  const handleGlobalMouseUp = useCallback(() => {
    setDragRotation(prev => {
      if (Math.abs(prev) > 45) setTimeout(() => handleFlip(), 0);
      return 0;
    });
    setIsDragging(false);
    document.removeEventListener('mousemove', handleGlobalMouseMove);
    document.removeEventListener('mouseup', handleGlobalMouseUp);
  }, [handleFlip, handleGlobalMouseMove]);

  const template = saveTheDateTemplates.find((t) => t.id === templateId) || saveTheDateTemplates[0];
  const FloralComponent = template.FloralComponent;

  const handleRsvpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestName.trim()) { toast.error("Please enter your name"); return; }
    if (!rsvpStatus) { toast.error("Please select if you're attending"); return; }
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      toast.success(rsvpStatus === "attending"
        ? "Thank you! We can't wait to celebrate with you!"
        : "Thank you for letting us know. We'll miss you!");
      setGuestName(""); setGuestCount("1"); setDietaryNotes(""); setRsvpStatus(null);
    }, 1500);
  };

  const handleFormInteraction = (e: React.MouseEvent | React.TouchEvent) => e.stopPropagation();

  const formatDateElegant = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return { month: "", day: "", year: "", full: dateStr };
      return {
        month: d.toLocaleDateString('en-US', { month: 'short' }).toUpperCase(),
        day: d.getDate().toString(),
        year: d.getFullYear().toString(),
        full: dateStr,
      };
    } catch { return { month: "", day: "", year: "", full: dateStr }; }
  };

  const dateFormatted = formatDateElegant(date);
  const currentRotation = baseRotation + dragRotation;

  const formatName = (name: string) => {
    if (template.nameStyle === "uppercase") return name.toUpperCase();
    if (template.nameStyle === "capitalize") return name.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
    return name;
  };

  return (
    <div
      ref={cardRef}
      className="w-full h-full min-h-[500px]"
      style={{ perspective: "1200px" }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleMouseDown}
    >
      <div
        className={`relative w-full h-full ${isDragging ? '' : 'transition-transform duration-500 ease-out'}`}
        style={{
          transformStyle: "preserve-3d",
          transform: `rotateY(${currentRotation}deg)`,
          cursor: isDragging ? 'grabbing' : 'grab',
        }}
      >
        {/* ============ FRONT ============ */}
        <div
          className="absolute inset-0 w-full h-full rounded-2xl overflow-hidden shadow-2xl"
          style={{
            backgroundColor: template.background,
            borderColor: template.border,
            borderWidth: "1px",
            borderStyle: "solid",
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
            pointerEvents: isFlipped ? "none" : "auto",
          }}
        >
          {/* Floral Corners */}
          <FloralComponent className="absolute top-0 left-0 w-28 h-28 md:w-36 md:h-36" />
          <FloralComponent className="absolute top-0 right-0 w-28 h-28 md:w-36 md:h-36" flip />
          <FloralComponent className="absolute bottom-0 left-0 w-28 h-28 md:w-36 md:h-36 rotate-180" flip />
          <FloralComponent className="absolute bottom-0 right-0 w-28 h-28 md:w-36 md:h-36 rotate-180" />

          {/* Butterfly */}
          <div className="absolute top-6 left-1/2 -translate-x-1/2">
            <Butterfly color={template.accentLight} />
          </div>

          {/* Content */}
          <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-6 py-10">
            {/* Header */}
            <div className="mb-1">
              <p
                style={{
                  fontFamily: template.headerFont,
                  letterSpacing: template.headerTracking,
                  color: template.accentLight,
                }}
                className="text-[10px] md:text-xs uppercase"
              >
                Save the Date
              </p>
              <p
                style={{ fontFamily: template.scriptFont, color: template.accentLight }}
                className="text-base md:text-lg mt-0.5"
              >
                for the wedding of
              </p>
            </div>

            {/* Names */}
            <div className="my-4 md:my-6">
              <h2
                style={{ fontFamily: template.nameFont, color: template.accent }}
                className="text-xl md:text-2xl lg:text-3xl tracking-wide leading-relaxed"
              >
                {formatName(names.partner1 || "Partner One")}
              </h2>
              <p
                style={{ fontFamily: template.scriptFont, color: template.accentLight }}
                className="text-2xl md:text-3xl my-0.5"
              >
                &amp;
              </p>
              <h2
                style={{ fontFamily: template.nameFont, color: template.accent }}
                className="text-xl md:text-2xl lg:text-3xl tracking-wide leading-relaxed"
              >
                {formatName(names.partner2 || "Partner Two")}
              </h2>
            </div>

            {/* Date */}
            <div className="my-3">
              {dateFormatted.day ? (
                <p
                  style={{ fontFamily: template.bodyFont, color: template.accent }}
                  className="text-xs md:text-sm tracking-[0.25em]"
                >
                  {dateFormatted.month} • {dateFormatted.day} • {dateFormatted.year}
                </p>
              ) : (
                <p style={{ fontFamily: template.bodyFont, color: template.accent }} className="text-xs md:text-sm">
                  {date}
                </p>
              )}
              <p
                style={{ fontFamily: template.scriptFont, color: template.accentLight }}
                className="text-sm md:text-base mt-0.5"
              >
                {venue || "Venue TBD"}
              </p>
            </div>

            {/* Invitation to Follow */}
            <div className="mt-4 md:mt-6">
              <p
                style={{ fontFamily: template.headerFont, letterSpacing: "0.25em", color: template.accentLight }}
                className="text-[9px] md:text-[10px] uppercase"
              >
                Invitation to Follow
              </p>
            </div>

            {/* Swipe hint */}
            <p
              style={{ color: template.accentLight }}
              className="absolute bottom-3 text-[9px] opacity-50"
            >
              ← Swipe to RSVP →
            </p>
          </div>
        </div>

        {/* ============ BACK - RSVP ============ */}
        <div
          className="absolute inset-0 w-full h-full rounded-2xl overflow-hidden shadow-2xl flex flex-col"
          style={{
            backgroundColor: template.background,
            borderColor: template.border,
            borderWidth: "1px",
            borderStyle: "solid",
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
            pointerEvents: isFlipped ? "auto" : "none",
          }}
        >
          {/* Subtle florals */}
          <FloralComponent className="absolute top-0 left-0 w-16 h-16 opacity-30" />
          <FloralComponent className="absolute top-0 right-0 w-16 h-16 opacity-30" flip />

          {/* Header */}
          <div className="px-5 py-4 shrink-0" style={{ borderBottomColor: template.border, borderBottomWidth: "1px" }}>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full flex items-center justify-center" style={{ backgroundColor: template.accentBg }}>
                <MessageSquare className="w-4 h-4" style={{ color: template.accent }} />
              </div>
              <div>
                <h3 style={{ fontFamily: template.nameFont, color: template.accent }} className="text-base">RSVP</h3>
                <p style={{ fontFamily: template.bodyFont, color: template.accentLight }} className="text-[10px]">Kindly respond</p>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="p-4 overflow-y-auto flex-1" onMouseDown={handleFormInteraction} onTouchStart={handleFormInteraction}>
            <form onSubmit={handleRsvpSubmit} className="space-y-3">
              <div className="space-y-1">
                <label style={{ fontFamily: template.bodyFont, color: template.accentLight }} className="text-[10px] uppercase tracking-wider flex items-center gap-1.5">
                  <Users className="w-3 h-3" /> Your Name
                </label>
                <Input
                  placeholder="Enter your full name"
                  className="h-9 text-sm"
                  style={{ borderColor: template.border, backgroundColor: "rgba(255,255,255,0.8)" }}
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-1">
                <label style={{ fontFamily: template.bodyFont, color: template.accentLight }} className="text-[10px] uppercase tracking-wider">
                  Will you be attending?
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {(["attending", "declined"] as const).map((status) => (
                    <button
                      key={status}
                      type="button"
                      onClick={() => setRsvpStatus(status)}
                      className="flex flex-col items-center p-2.5 rounded-lg border-2 transition-all"
                      style={{
                        borderColor: rsvpStatus === status ? template.accent : template.border,
                        backgroundColor: rsvpStatus === status ? template.accentBg : "rgba(255,255,255,0.8)",
                        color: rsvpStatus === status ? template.accent : template.accentLight,
                      }}
                    >
                      <div
                        className="w-7 h-7 rounded-full flex items-center justify-center mb-1"
                        style={{ backgroundColor: rsvpStatus === status ? template.border : template.accentBg }}
                      >
                        {status === "attending" ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                      </div>
                      <span style={{ fontFamily: template.bodyFont }} className="text-[10px]">
                        {status === "attending" ? "Joyfully Accept" : "Regretfully Decline"}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {rsvpStatus === "attending" && (
                <>
                  <div className="space-y-1">
                    <label style={{ fontFamily: template.bodyFont, color: template.accentLight }} className="text-[10px] uppercase tracking-wider">
                      Number of Guests
                    </label>
                    <select
                      className="w-full h-9 rounded-md px-2 text-sm"
                      style={{ borderColor: template.border, backgroundColor: "rgba(255,255,255,0.8)" }}
                      value={guestCount}
                      onChange={(e) => setGuestCount(e.target.value)}
                    >
                      {[1, 2, 3, 4, 5].map(n => <option key={n} value={n}>{n} Guest{n > 1 ? 's' : ''}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label style={{ fontFamily: template.bodyFont, color: template.accentLight }} className="text-[10px] uppercase tracking-wider">
                      Dietary Notes / Message
                    </label>
                    <Textarea
                      placeholder="Any dietary requirements?"
                      className="h-14 text-sm resize-none"
                      style={{ borderColor: template.border, backgroundColor: "rgba(255,255,255,0.8)" }}
                      value={dietaryNotes}
                      onChange={(e) => setDietaryNotes(e.target.value)}
                    />
                  </div>
                </>
              )}

              <Button
                type="submit"
                className="w-full h-10 text-sm font-medium"
                style={{
                  backgroundColor: rsvpStatus ? template.accent : template.border,
                  color: rsvpStatus ? "white" : template.accentLight,
                }}
                disabled={!rsvpStatus || !guestName.trim() || isSubmitting}
              >
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Send Response"}
              </Button>
            </form>
          </div>

          <div className="px-4 py-2 shrink-0" style={{ borderTopColor: template.border, borderTopWidth: "1px" }}>
            <p style={{ color: template.accentLight }} className="text-center text-[9px]">← Swipe to flip back →</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SaveTheDateCard;
