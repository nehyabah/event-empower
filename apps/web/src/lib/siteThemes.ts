// Single source of truth for wedding site themes & font pairs

export interface ThemeStyles {
  fontHeading: string;
  fontBody: string;
  bg: string;
  text: string;
  subtext: string;
  accent: string;
  card: string;
  button: string;
  heroOverlay: string;
  heroLayout: string;
  heroTitle: string;
  heroMeta: string;
  image: string;
  badge: string;
  divider: string;
  wishCard: string;
  pinColor: string;
  // --- Distinct per-theme styling ---
  sectionPadding: string;
  sectionBgAlt: string;
  sectionLabel: string;
  sectionDivider: string;
  cardHover: string;
  imageHover: string;
  galleryColumns: string;
  galleryItemClass: string;
  galleryHover: string;
  coupleLayout: string;
  coupleOffset: string;
  detailsMiddleCard: string;
  wishCardRounding: string;
  inputStyle: string;
  navButton: string;
  floatingButton: string;
  heroDateVenue: string;
  heroDateVenueLayout: string;
  heroDivider: string;
  heroCountdown: string;
  heroCountdownUnit: string;
  heroCountdownLabel: string;
  /**
   * Motion. Applied by the section renderer to elements marked data-reveal,
   * so how a template moves is part of its identity rather than the same
   * fade on every theme.
   */
  reveal: string;
  /** Milliseconds between staggered siblings; 0 reveals them together. */
  revealStagger: number;
  /** Runs on the hero image for the life of the page. */
  heroMotion: string;
  /** Runs once on the hero's text block. */
  heroTextMotion: string;
}

export interface ThemeConfig {
  id: string;
  name: string;
  styles: ThemeStyles;
  previewColor: string; // Tailwind bg class for swatch preview
}

export interface FontPair {
  id: string;
  name: string;
  heading: string;
  body: string;
  headingClass: string;
  bodyClass: string;
}

export const fontPairs: FontPair[] = [
  {
    id: "classic",
    name: "Classic",
    heading: "Cormorant Garamond",
    body: "Inter",
    headingClass: "font-serif",
    bodyClass: "font-sans",
  },
  {
    id: "modern",
    name: "Modern",
    heading: "Montserrat",
    body: "Source Sans 3",
    headingClass: "font-sans",
    bodyClass: "font-sans",
  },
  {
    id: "romantic",
    name: "Romantic",
    heading: "Playfair Display",
    body: "Lora",
    headingClass: "font-serif",
    bodyClass: "font-serif",
  },
  {
    id: "elegant",
    name: "Elegant",
    heading: "Bodoni Moda",
    body: "Jost",
    headingClass: "font-serif",
    bodyClass: "font-sans",
  },
];

export const siteThemes: ThemeConfig[] = [
  /*
   * Premium set.
   *
   * The twelve themes below these vary colour, font and rounding over one
   * identical structure — seven of them share the exact same heroLayout and
   * coupleLayout — which is why a couple clicking through them sees one
   * template in twelve palettes. These five differ where it is actually
   * noticed: where the hero sits, how the gallery is built, whether the
   * couple block is symmetric, and how much air the page is given.
   */
  {
    id: "noir",
    name: "Noir",
    previewColor: "bg-neutral-950",
    styles: {
      fontHeading: "font-sans",
      fontBody: "font-sans",
      bg: "bg-neutral-950",
      text: "text-neutral-100",
      subtext: "text-neutral-400",
      accent: "text-neutral-500",
      card: "bg-neutral-900 border border-neutral-800",
      button: "bg-neutral-100 text-neutral-950 hover:bg-white rounded-none px-10 uppercase tracking-[0.15em] text-xs font-medium",
      heroOverlay: "bg-gradient-to-t from-black via-black/40 to-black/10",
      // Bottom-left rather than centred: the photograph carries the page and
      // the type sits out of its way.
      heroLayout: "items-start text-left justify-end pb-20 md:pb-28 pl-6 md:pl-20",
      heroTitle: "text-5xl md:text-8xl font-sans font-medium tracking-[-0.04em] uppercase text-white leading-[0.9]",
      heroMeta: "text-white/60 uppercase tracking-[0.25em] text-xs",
      image: "rounded-none",
      badge: "bg-white/5 border border-white/10 text-white rounded-none uppercase tracking-[0.2em] text-[10px]",
      divider: "hidden",
      wishCard: "bg-neutral-900 border border-neutral-800",
      pinColor: "text-neutral-600",
      sectionPadding: "py-24 md:py-32",
      sectionBgAlt: "bg-neutral-900/40",
      sectionLabel: "text-[10px] font-medium tracking-[0.35em] uppercase text-neutral-500",
      sectionDivider: "w-full h-px bg-neutral-800 my-6",
      cardHover: "hover:border-neutral-700 transition-colors duration-300",
      imageHover: "group-hover:opacity-80 transition-opacity duration-500",
      // A tight uniform grid, not masonry: editorial rather than scrapbook.
      galleryColumns: "grid grid-cols-2 md:grid-cols-3 gap-1",
      galleryItemClass: "aspect-[4/5] overflow-hidden",
      galleryHover: "group-hover:scale-[1.03] transition-transform duration-700",
      coupleLayout: "gap-0 md:gap-px",
      coupleOffset: "",
      detailsMiddleCard: "",
      wishCardRounding: "rounded-none",
      inputStyle: "bg-neutral-900 border-neutral-800 text-neutral-100 placeholder-neutral-600 rounded-none focus:ring-1 focus:ring-neutral-500",
      navButton: "bg-white/10 text-white hover:bg-white/20 rounded-none",
      floatingButton: "bg-white/5",
      heroDateVenue: "text-white/70 uppercase tracking-[0.2em] text-xs md:text-sm",
      heroDateVenueLayout: "flex flex-wrap items-center gap-x-6 gap-y-2 mt-8",
      heroDivider: "w-8 h-px bg-white/30",
      heroCountdown: "mt-12 flex items-center gap-8 md:gap-12",
      heroCountdownUnit: "text-4xl md:text-5xl font-sans font-light text-white tabular-nums tracking-tight",
      heroCountdownLabel: "text-[9px] uppercase tracking-[0.3em] text-white/40 mt-2",
      reveal: "animate-reveal-wipe",
      revealStagger: 70,
      heroMotion: "animate-ken-burns",
      heroTextMotion: "animate-hero-lift",
    },
  },
  {
    id: "atelier",
    name: "Atelier",
    previewColor: "bg-[#f6f4ef]",
    styles: {
      fontHeading: "font-serif",
      fontBody: "font-sans",
      bg: "bg-[#f6f4ef]",
      text: "text-[#1c1a17]",
      subtext: "text-[#6b665e]",
      accent: "text-[#a39a8c]",
      card: "bg-transparent border-0",
      button: "bg-[#1c1a17] text-[#f6f4ef] hover:bg-black rounded-none px-10 tracking-[0.1em] text-xs uppercase",
      heroOverlay: "bg-black/15",
      heroLayout: "items-center text-center",
      // Very large, very light, very tight: the gallery-wall look.
      heroTitle: "text-6xl md:text-[10rem] font-serif font-light tracking-[-0.05em] text-white leading-[0.85]",
      heroMeta: "text-white/80 tracking-[0.3em] uppercase text-[11px]",
      image: "rounded-none",
      badge: "bg-transparent border border-white/40 text-white rounded-none tracking-[0.2em] text-[10px] uppercase",
      divider: "hidden",
      wishCard: "bg-white border border-[#e6e1d8]",
      pinColor: "text-[#a39a8c]",
      // Deliberately enormous vertical rhythm — the whitespace is the design.
      sectionPadding: "py-32 md:py-48",
      sectionBgAlt: "bg-[#efece5]",
      sectionLabel: "text-[10px] tracking-[0.4em] uppercase text-[#a39a8c]",
      sectionDivider: "w-px h-16 bg-[#d5cec2] mx-auto my-8",
      cardHover: "transition-opacity duration-500 hover:opacity-80",
      imageHover: "group-hover:scale-105 transition-transform duration-[1200ms] ease-out",
      // One wide column: each photograph gets the page to itself.
      galleryColumns: "flex flex-col gap-16 md:gap-28 max-w-3xl mx-auto",
      galleryItemClass: "",
      galleryHover: "group-hover:scale-[1.02] transition-transform duration-[1200ms] ease-out",
      // Asymmetric — the second portrait drops, so it never reads as a table.
      coupleLayout: "gap-16 md:gap-32",
      coupleOffset: "md:mt-40",
      detailsMiddleCard: "",
      wishCardRounding: "rounded-none",
      inputStyle: "bg-transparent border-0 border-b border-[#d5cec2] text-[#1c1a17] placeholder-[#a39a8c] rounded-none focus:ring-0 focus:border-[#1c1a17]",
      navButton: "bg-white/70 text-[#1c1a17] hover:bg-white rounded-none",
      floatingButton: "bg-white/20",
      heroDateVenue: "text-white/85 tracking-[0.25em] uppercase text-[11px]",
      heroDateVenueLayout: "flex flex-col items-center gap-4 mt-10",
      heroDivider: "w-px h-10 bg-white/40",
      heroCountdown: "mt-14 flex items-start gap-10 md:gap-16",
      heroCountdownUnit: "text-3xl md:text-5xl font-serif font-light text-white tabular-nums",
      heroCountdownLabel: "text-[9px] uppercase tracking-[0.35em] text-white/50 mt-2",
      reveal: "animate-reveal-drift",
      revealStagger: 180,
      heroMotion: "animate-ken-burns",
      heroTextMotion: "animate-reveal-drift",
    },
  },
  {
    id: "aurum",
    name: "Aurum",
    previewColor: "bg-[#14100c]",
    styles: {
      fontHeading: "font-serif",
      fontBody: "font-sans",
      bg: "bg-[#14100c]",
      text: "text-[#f2e9dc]",
      subtext: "text-[#b6a68f]",
      accent: "text-[#c9a227]",
      card: "bg-[#1c1712] border border-[#2e2519] rounded-sm",
      button: "bg-[#c9a227] text-[#14100c] hover:bg-[#dcb63a] rounded-sm px-9 tracking-[0.08em] font-medium",
      heroOverlay: "bg-gradient-to-b from-black/50 via-black/30 to-[#14100c]",
      heroLayout: "items-center text-center",
      heroTitle: "text-5xl md:text-8xl font-serif italic font-light tracking-tight text-[#f2e9dc] leading-[0.95]",
      heroMeta: "text-[#c9a227] tracking-[0.3em] uppercase text-[11px]",
      image: "rounded-sm",
      badge: "bg-[#c9a227]/10 border border-[#c9a227]/30 text-[#c9a227] rounded-sm tracking-[0.15em] text-[10px] uppercase",
      divider: "hidden",
      wishCard: "bg-[#1c1712] border border-[#2e2519]",
      pinColor: "text-[#c9a227]",
      sectionPadding: "py-28 md:py-40",
      sectionBgAlt: "bg-[#1a1510]",
      sectionLabel: "text-[10px] tracking-[0.35em] uppercase text-[#c9a227]",
      sectionDivider: "w-24 h-px bg-gradient-to-r from-transparent via-[#c9a227] to-transparent mx-auto my-6",
      cardHover: "hover:border-[#c9a227]/40 transition-colors duration-500",
      imageHover: "group-hover:scale-105 transition-transform duration-1000",
      galleryColumns: "columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4",
      galleryItemClass: "break-inside-avoid",
      galleryHover: "group-hover:scale-105 transition-transform duration-1000",
      coupleLayout: "gap-14 md:gap-24",
      coupleOffset: "md:mt-20",
      detailsMiddleCard: "md:scale-105 border-[#c9a227]/40",
      wishCardRounding: "rounded-sm",
      inputStyle: "bg-[#1c1712] border-[#2e2519] text-[#f2e9dc] placeholder-[#6b5f4d] rounded-sm focus:ring-1 focus:ring-[#c9a227]",
      navButton: "bg-[#c9a227]/15 text-[#f2e9dc] hover:bg-[#c9a227]/25 rounded-sm",
      floatingButton: "bg-[#c9a227]/10",
      heroDateVenue: "text-[#f2e9dc]/80 tracking-[0.18em] uppercase text-xs md:text-sm",
      heroDateVenueLayout: "flex flex-col items-center gap-3 mt-8",
      heroDivider: "w-10 h-px bg-[#c9a227]/50",
      heroCountdown: "mt-12 flex items-center gap-8 md:gap-12 border-y border-[#c9a227]/20 py-6 px-2",
      heroCountdownUnit: "text-3xl md:text-5xl font-serif font-light text-[#c9a227] tabular-nums",
      heroCountdownLabel: "text-[9px] uppercase tracking-[0.3em] text-[#f2e9dc]/50 mt-2",
      reveal: "animate-reveal-glow",
      revealStagger: 110,
      heroMotion: "animate-ken-burns",
      heroTextMotion: "animate-reveal-glow",
    },
  },
  {
    id: "linen",
    name: "Linen",
    previewColor: "bg-[#faf7f2]",
    styles: {
      fontHeading: "font-serif",
      fontBody: "font-sans",
      bg: "bg-[#faf7f2]",
      text: "text-[#2f2a24]",
      subtext: "text-[#7d7469]",
      accent: "text-[#b08968]",
      card: "bg-white rounded-2xl shadow-[0_1px_3px_rgba(47,42,36,0.06)] border border-[#efe9e0]",
      button: "bg-[#2f2a24] text-[#faf7f2] hover:bg-[#1f1b16] rounded-full px-8",
      heroOverlay: "bg-black/20",
      // Left-anchored, mid-height: softer than Noir, still not centred.
      heroLayout: "items-start text-left justify-center pl-6 md:pl-24",
      heroTitle: "text-5xl md:text-8xl font-serif font-normal tracking-[-0.02em] text-white leading-[1.02]",
      heroMeta: "text-white/85 text-sm md:text-base",
      image: "rounded-2xl",
      badge: "bg-white/15 backdrop-blur-md border border-white/25 text-white rounded-full text-[11px]",
      divider: "hidden",
      wishCard: "bg-white border border-[#efe9e0] shadow-sm",
      pinColor: "text-[#b08968]",
      sectionPadding: "py-24 md:py-36",
      sectionBgAlt: "bg-[#f3ede4]",
      sectionLabel: "text-[11px] tracking-[0.25em] uppercase text-[#b08968]",
      sectionDivider: "w-12 h-px bg-[#dcd2c4] my-5",
      cardHover: "hover:-translate-y-1 hover:shadow-md transition-all duration-400",
      imageHover: "group-hover:scale-[1.04] transition-transform duration-700",
      // Two generous columns rather than three: fewer, larger, calmer.
      galleryColumns: "columns-1 md:columns-2 gap-6 space-y-6",
      galleryItemClass: "break-inside-avoid",
      galleryHover: "group-hover:scale-[1.04] transition-transform duration-700",
      coupleLayout: "gap-12 md:gap-20",
      coupleOffset: "md:mt-16",
      detailsMiddleCard: "md:scale-105",
      wishCardRounding: "rounded-2xl",
      inputStyle: "bg-white border-[#e5ddd1] text-[#2f2a24] placeholder-[#a89c8c] rounded-xl focus:ring-1 focus:ring-[#b08968]",
      navButton: "bg-white/80 text-[#2f2a24] hover:bg-white rounded-full",
      floatingButton: "bg-white/20",
      heroDateVenue: "text-white/85 text-base md:text-lg",
      heroDateVenueLayout: "flex flex-col items-start gap-2 mt-6",
      heroDivider: "w-10 h-px bg-white/40",
      heroCountdown: "mt-10 flex items-center gap-7 md:gap-10 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl px-7 py-4",
      heroCountdownUnit: "text-3xl md:text-4xl font-serif font-light text-white tabular-nums",
      heroCountdownLabel: "text-[9px] uppercase tracking-[0.2em] text-white/60 mt-1",
      reveal: "animate-reveal-rise",
      revealStagger: 90,
      heroMotion: "animate-ken-burns",
      heroTextMotion: "animate-hero-lift",
    },
  },
  {
    id: "terrazzo",
    name: "Terrazzo",
    previewColor: "bg-[#0f3d3e]",
    styles: {
      fontHeading: "font-serif",
      fontBody: "font-sans",
      bg: "bg-[#0f3d3e]",
      text: "text-[#f0ece3]",
      subtext: "text-[#9fb8b3]",
      accent: "text-[#e6a17a]",
      card: "bg-[#134747] border border-[#1d5a59] rounded-3xl",
      button: "bg-[#e6a17a] text-[#0f3d3e] hover:bg-[#f0b48f] rounded-full px-9 font-medium",
      heroOverlay: "bg-gradient-to-br from-[#0f3d3e]/80 via-[#0f3d3e]/40 to-transparent",
      heroLayout: "items-start text-left justify-end pb-24 md:pb-32 pl-6 md:pl-16",
      heroTitle: "text-5xl md:text-8xl font-serif font-medium tracking-[-0.03em] text-[#f0ece3] leading-[0.95]",
      heroMeta: "text-[#e6a17a] tracking-[0.2em] uppercase text-[11px]",
      image: "rounded-3xl",
      badge: "bg-[#e6a17a]/15 border border-[#e6a17a]/30 text-[#e6a17a] rounded-full text-[11px]",
      divider: "hidden",
      wishCard: "bg-[#134747] border border-[#1d5a59]",
      pinColor: "text-[#e6a17a]",
      sectionPadding: "py-24 md:py-36",
      sectionBgAlt: "bg-[#0c3334]",
      sectionLabel: "text-[10px] tracking-[0.3em] uppercase text-[#e6a17a]",
      sectionDivider: "w-16 h-1 bg-[#e6a17a] rounded-full my-6",
      cardHover: "hover:-translate-y-1.5 transition-transform duration-400",
      imageHover: "group-hover:scale-105 transition-transform duration-700",
      // Alternating wide/narrow, so the grid never reads as a contact sheet.
      galleryColumns: "grid grid-cols-2 md:grid-cols-4 gap-3",
      galleryItemClass: "[&:nth-child(4n+1)]:col-span-2 [&:nth-child(4n+1)]:row-span-2 overflow-hidden rounded-2xl",
      galleryHover: "group-hover:scale-105 transition-transform duration-700",
      coupleLayout: "gap-10 md:gap-16",
      coupleOffset: "md:mt-24",
      detailsMiddleCard: "md:scale-105 border-[#e6a17a]/40",
      wishCardRounding: "rounded-3xl",
      inputStyle: "bg-[#134747] border-[#1d5a59] text-[#f0ece3] placeholder-[#6f8f8b] rounded-2xl focus:ring-1 focus:ring-[#e6a17a]",
      navButton: "bg-[#e6a17a]/20 text-[#f0ece3] hover:bg-[#e6a17a]/30 rounded-full",
      floatingButton: "bg-[#e6a17a]/15",
      heroDateVenue: "text-[#f0ece3]/85 text-sm md:text-base",
      heroDateVenueLayout: "flex flex-wrap items-center gap-x-5 gap-y-2 mt-7",
      heroDivider: "w-8 h-px bg-[#e6a17a]/60",
      heroCountdown: "mt-11 flex items-center gap-7 md:gap-10 bg-[#0f3d3e]/60 backdrop-blur-md border border-[#e6a17a]/20 rounded-3xl px-8 py-5",
      heroCountdownUnit: "text-3xl md:text-5xl font-serif font-light text-[#e6a17a] tabular-nums",
      heroCountdownLabel: "text-[9px] uppercase tracking-[0.25em] text-[#f0ece3]/55 mt-1.5",
      reveal: "animate-reveal-settle",
      revealStagger: 100,
      heroMotion: "animate-ken-burns",
      heroTextMotion: "animate-reveal-settle",
    },
  },
  {
    id: "editorial",
    name: "Editorial",
    previewColor: "bg-stone-50",
    styles: {
      fontHeading: "font-serif",
      fontBody: "font-sans",
      bg: "bg-stone-50",
      text: "text-stone-900",
      subtext: "text-stone-500",
      accent: "text-stone-400",
      card: "bg-white rounded-[2.5rem] shadow-xl shadow-stone-200/50 border border-stone-100",
      button: "bg-stone-900 text-white hover:bg-stone-800 rounded-full px-8",
      heroOverlay: "bg-black/30",
      heroLayout: "items-center text-center",
      heroTitle:
        "text-6xl md:text-9xl font-serif font-medium tracking-tight italic text-white",
      heroMeta: "text-white/90 font-light",
      image: "rounded-[2rem] shadow-lg",
      badge:
        "bg-white/10 backdrop-blur-md border border-white/20 text-white rounded-full",
      divider: "hidden",
      wishCard:
        "bg-white shadow-lg rotate-0 hover:-rotate-1 transition-transform border border-stone-100",
      pinColor: "text-red-500",
      sectionPadding: "py-28 md:py-36",
      sectionBgAlt: "bg-stone-100/50",
      sectionLabel: "text-xs font-bold tracking-[0.2em] uppercase opacity-50",
      sectionDivider: "w-16 h-px bg-stone-300 mx-auto my-4",
      cardHover: "hover:-translate-y-2 hover:shadow-2xl transition-all duration-500",
      imageHover: "group-hover:scale-105 transition-transform duration-700 ease-out",
      galleryColumns: "columns-1 md:columns-2 lg:columns-3 gap-10 space-y-10",
      galleryItemClass: "break-inside-avoid",
      galleryHover: "group-hover:scale-105 transition-transform duration-700 ease-out",
      coupleLayout: "gap-12 md:gap-24",
      coupleOffset: "md:mt-24",
      detailsMiddleCard: "md:scale-110 z-10 shadow-2xl",
      wishCardRounding: "rounded-xl",
      inputStyle: "border-stone-200 text-stone-800 placeholder-stone-400 rounded-xl focus:ring-1 focus:ring-stone-400",
      navButton: "bg-white/80 text-stone-800 hover:bg-white",
      floatingButton: "bg-white/10",
      heroDateVenue: "text-white/90 font-light text-lg md:text-xl",
      heroDateVenueLayout: "flex flex-col items-center gap-3 mt-6",
      heroDivider: "w-12 h-px bg-white/30",
      heroCountdown: "mt-10 flex items-center gap-6 md:gap-10 backdrop-blur-sm bg-white/10 border border-white/15 rounded-full px-8 py-4",
      heroCountdownUnit: "text-3xl md:text-4xl font-serif font-light text-white tabular-nums",
      heroCountdownLabel: "text-[9px] uppercase tracking-[0.2em] text-white/50 font-medium mt-1",
      reveal: "animate-reveal-rise",
      revealStagger: 80,
      heroMotion: "animate-ken-burns",
      heroTextMotion: "animate-hero-lift",
    },
  },
  {
    id: "midnight",
    name: "Midnight Gala",
    previewColor: "bg-zinc-950",
    styles: {
      fontHeading: "font-serif",
      fontBody: "font-sans",
      bg: "bg-zinc-950",
      text: "text-zinc-200",
      subtext: "text-zinc-500",
      accent: "text-amber-200/60",
      card: "bg-zinc-900/60 backdrop-blur-md border border-zinc-800 rounded-none",
      button:
        "bg-white text-zinc-950 hover:bg-zinc-200 rounded-none uppercase tracking-widest text-xs font-bold px-8",
      heroOverlay: "bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-black/30",
      heroLayout: "items-start text-left pl-4 md:pl-20",
      heroTitle:
        "text-5xl md:text-8xl font-serif uppercase tracking-widest font-light text-white",
      heroMeta: "text-amber-100/80 font-serif italic",
      image:
        "rounded-none grayscale hover:grayscale-0 transition-all duration-700 border border-zinc-800",
      badge:
        "bg-zinc-900 border border-zinc-700 text-zinc-300 rounded-none uppercase tracking-widest text-[10px]",
      divider: "w-full h-px bg-zinc-800 my-12",
      wishCard: "bg-zinc-900 border border-zinc-800 shadow-2xl shadow-black",
      pinColor: "text-amber-200",
      sectionPadding: "py-20 md:py-28",
      sectionBgAlt: "bg-black/20",
      sectionLabel: "text-xs font-bold tracking-[0.3em] uppercase opacity-40",
      sectionDivider: "w-24 h-px bg-gradient-to-r from-transparent via-amber-400/40 to-transparent mx-auto my-4",
      cardHover: "hover:border-amber-400/30 hover:shadow-amber-400/10 hover:shadow-lg transition-all duration-500",
      imageHover: "grayscale group-hover:grayscale-0 transition-all duration-700",
      galleryColumns: "grid grid-cols-1 md:grid-cols-2 gap-1",
      galleryItemClass: "aspect-square",
      galleryHover: "grayscale group-hover:grayscale-0 transition-all duration-700",
      coupleLayout: "gap-8",
      coupleOffset: "",
      detailsMiddleCard: "md:scale-110 z-10 border-amber-400/20",
      wishCardRounding: "rounded-none",
      inputStyle: "border-zinc-700 text-white placeholder-zinc-600 rounded-none focus:ring-1 focus:ring-amber-400/50",
      navButton: "bg-zinc-800/80 text-white hover:bg-zinc-700",
      floatingButton: "bg-zinc-900/60",
      heroDateVenue: "text-amber-100/80 font-serif italic text-lg md:text-xl",
      heroDateVenueLayout: "flex flex-col items-start gap-2 mt-6",
      heroDivider: "w-8 h-px bg-amber-400/40",
      heroCountdown: "mt-10 flex items-center gap-0 border border-zinc-700",
      heroCountdownUnit: "text-2xl md:text-3xl font-sans font-bold text-white tabular-nums px-5 py-3 border-r border-zinc-700 last:border-r-0 bg-zinc-900/60 backdrop-blur-sm",
      heroCountdownLabel: "text-[8px] uppercase tracking-[0.3em] text-amber-200/50 font-bold mt-1",
      reveal: "animate-reveal-glow",
      revealStagger: 120,
      heroMotion: "animate-ken-burns",
      heroTextMotion: "animate-reveal-glow",
    },
  },
  {
    id: "golden-hour",
    name: "Golden Hour",
    previewColor: "bg-amber-50",
    styles: {
      fontHeading: "font-serif",
      fontBody: "font-sans",
      bg: "bg-amber-50",
      text: "text-amber-950",
      subtext: "text-amber-700/60",
      accent: "text-rose-400",
      card: "bg-white/90 backdrop-blur-md rounded-3xl shadow-xl shadow-amber-200/30 border border-amber-100",
      button:
        "bg-amber-800 text-white hover:bg-amber-900 rounded-full px-8 shadow-lg shadow-amber-800/20",
      heroOverlay: "bg-gradient-to-b from-amber-900/20 via-transparent to-amber-950/40",
      heroLayout: "items-center text-center",
      heroTitle:
        "text-6xl md:text-8xl font-serif font-light tracking-wide italic text-white drop-shadow-lg",
      heroMeta: "text-amber-100/90 font-light tracking-wider",
      image: "rounded-2xl shadow-lg shadow-amber-200/20",
      badge:
        "bg-white/15 backdrop-blur-md border border-white/25 text-white rounded-full",
      divider: "hidden",
      wishCard:
        "bg-white shadow-lg border border-amber-100 hover:shadow-xl transition-shadow",
      pinColor: "text-rose-400",
      sectionPadding: "py-24 md:py-32",
      sectionBgAlt: "bg-amber-100/30",
      sectionLabel: "text-xs font-bold tracking-[0.2em] uppercase opacity-50",
      sectionDivider: "hidden",
      cardHover: "hover:shadow-amber-200/40 hover:shadow-xl hover:-translate-y-1 transition-all duration-500",
      imageHover: "group-hover:scale-110 transition-transform duration-1000 ease-out",
      galleryColumns: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6",
      galleryItemClass: "aspect-[4/5]",
      galleryHover: "group-hover:scale-110 transition-transform duration-1000 ease-out",
      coupleLayout: "gap-8",
      coupleOffset: "",
      detailsMiddleCard: "md:scale-110 z-10 shadow-xl shadow-amber-200/30",
      wishCardRounding: "rounded-2xl",
      inputStyle: "border-amber-200 text-amber-950 placeholder-amber-400/50 rounded-xl focus:ring-1 focus:ring-rose-300/50",
      navButton: "bg-white/80 text-amber-900 hover:bg-white",
      floatingButton: "bg-amber-800/20",
      heroDateVenue: "text-amber-100/90 font-light tracking-wider text-lg md:text-xl",
      heroDateVenueLayout: "flex flex-col items-center gap-3 mt-6",
      heroDivider: "w-16 h-px bg-gradient-to-r from-transparent via-amber-200/50 to-transparent",
      heroCountdown: "mt-10 flex items-center gap-8 md:gap-12",
      heroCountdownUnit: "text-4xl md:text-5xl font-serif font-light italic text-white tabular-nums drop-shadow-lg",
      heroCountdownLabel: "text-[9px] uppercase tracking-[0.2em] text-amber-100/50 font-light mt-1",
      reveal: "animate-reveal-rise",
      revealStagger: 100,
      heroMotion: "animate-ken-burns",
      heroTextMotion: "animate-hero-lift",
    },
  },
  {
    id: "mono",
    name: "Mono",
    previewColor: "bg-white",
    styles: {
      fontHeading: "font-sans",
      fontBody: "font-sans",
      bg: "bg-white",
      text: "text-black",
      subtext: "text-neutral-400",
      accent: "text-neutral-500",
      card: "bg-neutral-50 rounded-none border border-neutral-200",
      button:
        "bg-black text-white hover:bg-neutral-800 rounded-none uppercase tracking-widest text-xs font-bold px-8",
      heroOverlay: "bg-black/40",
      heroLayout: "items-center text-center",
      heroTitle:
        "text-6xl md:text-[10rem] font-sans font-black uppercase tracking-tighter text-white leading-none",
      heroMeta: "text-white/80 uppercase tracking-[0.3em] text-sm font-light",
      image: "rounded-none border border-neutral-200",
      badge:
        "bg-black/10 backdrop-blur-md border border-white/20 text-white rounded-none uppercase tracking-[0.3em] text-[10px]",
      divider: "w-24 h-[2px] bg-black my-12",
      wishCard:
        "bg-neutral-50 border border-neutral-200 shadow-none hover:bg-neutral-100 transition-colors",
      pinColor: "text-black",
      sectionPadding: "py-16 md:py-24",
      sectionBgAlt: "bg-neutral-50",
      sectionLabel: "text-[10px] font-bold tracking-[0.3em] uppercase opacity-40",
      sectionDivider: "w-12 h-[3px] bg-black mx-auto my-4",
      cardHover: "hover:bg-neutral-100 transition-colors duration-300",
      imageHover: "",
      galleryColumns: "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-px bg-neutral-200",
      galleryItemClass: "aspect-square bg-white",
      galleryHover: "",
      coupleLayout: "gap-8",
      coupleOffset: "",
      detailsMiddleCard: "md:scale-110 z-10 border-black",
      wishCardRounding: "rounded-none",
      inputStyle: "border-neutral-300 text-black placeholder-neutral-400 rounded-none focus:ring-1 focus:ring-black",
      navButton: "bg-white/80 text-black hover:bg-white",
      floatingButton: "bg-black/10",
      heroDateVenue: "text-white/80 uppercase tracking-[0.3em] text-xs md:text-sm font-light",
      heroDateVenueLayout: "flex flex-row items-center gap-4 md:gap-8 mt-8",
      heroDivider: "w-4 h-px bg-white/40",
      heroCountdown: "mt-12 flex items-center gap-0",
      heroCountdownUnit: "text-4xl md:text-6xl font-sans font-black text-white tabular-nums px-4 md:px-6 leading-none",
      heroCountdownLabel: "text-[8px] uppercase tracking-[0.3em] text-white/30 font-bold mt-2",
      reveal: "animate-reveal-unmask",
      revealStagger: 60,
      heroMotion: "",
      heroTextMotion: "animate-hero-lift",
    },
  },
];

/** Where a site lands if its saved theme no longer exists. */
export const FALLBACK_THEME_ID = "editorial";

export function getTheme(themeId: string): ThemeConfig {
  return (
    siteThemes.find((t) => t.id === themeId) ||
    siteThemes.find((t) => t.id === FALLBACK_THEME_ID) ||
    siteThemes[0]
  );
}

const DARK_THEMES = new Set(["midnight", "noir", "aurum", "terrazzo"]);

export function isDarkTheme(themeId: string): boolean {
  return DARK_THEMES.has(themeId);
}

export const DEFAULT_SECTION_ORDER = [
  "hero",
  "quote",
  "couple",
  "gallery",
  "timeline",
  "wedding-party",
  "details",
  "travel",
  "wishes",
  "registry",
  "faq",
];

export const SECTION_LABELS: Record<string, string> = {
  hero: "Hero Banner",
  quote: "Love Quote",
  couple: "Bride & Groom",
  gallery: "Photo Gallery",
  timeline: "Our Timeline",
  "wedding-party": "Wedding Party",
  details: "When & Where",
  travel: "Travel & Stay",
  wishes: "Well Wishes",
  registry: "Registry & Gifts",
  faq: "FAQ",
};
