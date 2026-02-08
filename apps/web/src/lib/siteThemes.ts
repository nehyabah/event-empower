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
    },
  },
  {
    id: "garden",
    name: "Modern Botanical",
    previewColor: "bg-[#F0F4F2]",
    styles: {
      fontHeading: "font-serif",
      fontBody: "font-sans",
      bg: "bg-[#F0F4F2]",
      text: "text-emerald-950",
      subtext: "text-emerald-800/60",
      accent: "text-emerald-600",
      card: "bg-white/80 backdrop-blur-xl border border-white/60 shadow-lg shadow-emerald-900/5 rounded-3xl",
      button:
        "bg-emerald-900 text-white hover:bg-emerald-800 rounded-2xl px-6 shadow-lg shadow-emerald-900/20",
      heroOverlay: "bg-emerald-950/20",
      heroLayout: "items-center text-center",
      heroTitle:
        "text-5xl md:text-7xl font-serif font-normal text-white drop-shadow-md",
      heroMeta: "text-white/90 font-medium tracking-wide",
      image: "rounded-3xl shadow-md shadow-emerald-900/10",
      badge:
        "bg-emerald-900/10 backdrop-blur-md border border-emerald-900/10 text-emerald-100 rounded-2xl",
      divider: "hidden",
      wishCard:
        "bg-[#fffff0] shadow-md border border-emerald-100/50 rotate-1 hover:rotate-2 transition-transform",
      pinColor: "text-emerald-600",
      sectionPadding: "py-24 md:py-32",
      sectionBgAlt: "bg-emerald-950/[0.03]",
      sectionLabel: "text-xs font-medium tracking-[0.15em] uppercase opacity-50",
      sectionDivider: "hidden",
      cardHover: "hover:border-emerald-300/50 hover:shadow-emerald-200/30 hover:shadow-lg hover:scale-[1.02] transition-all duration-500",
      imageHover: "group-hover:scale-105 group-hover:brightness-105 transition-all duration-700",
      galleryColumns: "columns-1 md:columns-2 gap-12 space-y-12",
      galleryItemClass: "break-inside-avoid",
      galleryHover: "group-hover:scale-105 group-hover:brightness-105 transition-all duration-700",
      coupleLayout: "gap-8",
      coupleOffset: "",
      detailsMiddleCard: "md:scale-110 z-10",
      wishCardRounding: "rounded-2xl",
      inputStyle: "border-emerald-200/60 text-emerald-950 placeholder-emerald-400/50 rounded-2xl focus:ring-1 focus:ring-emerald-400/40",
      navButton: "bg-white/80 text-emerald-900 hover:bg-white",
      floatingButton: "bg-emerald-900/40",
      heroDateVenue: "text-white/90 font-medium tracking-wide text-base md:text-lg",
      heroDateVenueLayout: "flex flex-row items-center gap-4 md:gap-6 mt-6",
      heroDivider: "w-1 h-1 rounded-full bg-white/40",
      heroCountdown: "mt-10 flex items-center gap-6 md:gap-8 bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl px-8 py-5",
      heroCountdownUnit: "text-3xl md:text-4xl font-serif text-white tabular-nums",
      heroCountdownLabel: "text-[9px] uppercase tracking-[0.15em] text-white/60 font-medium mt-1",
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
    },
  },
  {
    id: "riviera",
    name: "Riviera",
    previewColor: "bg-sky-50",
    styles: {
      fontHeading: "font-serif",
      fontBody: "font-sans",
      bg: "bg-sky-50",
      text: "text-sky-950",
      subtext: "text-sky-700/60",
      accent: "text-sky-500",
      card: "bg-white rounded-2xl shadow-lg shadow-sky-100/50 border border-sky-100",
      button:
        "bg-sky-700 text-white hover:bg-sky-800 rounded-xl px-8 shadow-md shadow-sky-700/20",
      heroOverlay: "bg-gradient-to-t from-sky-950/30 via-transparent to-sky-900/10",
      heroLayout: "items-center text-center",
      heroTitle:
        "text-5xl md:text-8xl font-serif font-normal tracking-tight text-white drop-shadow-md",
      heroMeta: "text-white/90 font-light tracking-wide",
      image: "rounded-2xl shadow-md shadow-sky-200/30",
      badge:
        "bg-white/15 backdrop-blur-md border border-white/20 text-white rounded-xl",
      divider: "hidden",
      wishCard:
        "bg-white shadow-md border border-sky-100 hover:-translate-y-1 transition-transform",
      pinColor: "text-sky-500",
      sectionPadding: "py-24 md:py-32",
      sectionBgAlt: "bg-sky-50/60",
      sectionLabel: "text-xs font-bold tracking-[0.2em] uppercase opacity-50",
      sectionDivider: "w-20 h-px bg-sky-200 mx-auto my-4 rounded-full",
      cardHover: "hover:shadow-sky-200/40 hover:shadow-lg hover:-translate-y-1 transition-all duration-500",
      imageHover: "group-hover:scale-105 transition-transform duration-700",
      galleryColumns: "grid grid-cols-2 md:grid-cols-4 gap-4 auto-rows-[250px]",
      galleryItemClass: "first:col-span-2 first:row-span-2",
      galleryHover: "group-hover:scale-105 transition-transform duration-700",
      coupleLayout: "gap-8",
      coupleOffset: "",
      detailsMiddleCard: "md:scale-110 z-10",
      wishCardRounding: "rounded-xl",
      inputStyle: "border-sky-200 text-sky-950 placeholder-sky-400/50 rounded-xl focus:ring-1 focus:ring-sky-400/40",
      navButton: "bg-white/80 text-sky-800 hover:bg-white",
      floatingButton: "bg-sky-700/20",
      heroDateVenue: "text-white/90 font-light tracking-wide text-base md:text-lg",
      heroDateVenueLayout: "flex flex-row items-center gap-3 md:gap-6 mt-6 flex-wrap justify-center",
      heroDivider: "w-6 h-px bg-white/30 hidden md:block",
      heroCountdown: "mt-10 flex items-center gap-4 md:gap-6 bg-white/15 backdrop-blur-md border border-white/20 rounded-2xl px-6 py-4",
      heroCountdownUnit: "text-2xl md:text-3xl font-sans font-medium text-white tabular-nums",
      heroCountdownLabel: "text-[9px] uppercase tracking-[0.15em] text-white/50 font-medium mt-1",
    },
  },
  {
    id: "chateau",
    name: "Chateau",
    previewColor: "bg-violet-50",
    styles: {
      fontHeading: "font-serif",
      fontBody: "font-sans",
      bg: "bg-[#FAF8FF]",
      text: "text-violet-950",
      subtext: "text-violet-400",
      accent: "text-violet-300",
      card: "bg-white/90 backdrop-blur-sm rounded-[2rem] shadow-xl shadow-violet-100/40 border border-violet-100",
      button:
        "bg-violet-800 text-white hover:bg-violet-900 rounded-full px-8 shadow-md shadow-violet-800/20",
      heroOverlay: "bg-gradient-to-b from-violet-950/20 via-transparent to-violet-950/30",
      heroLayout: "items-center text-center",
      heroTitle:
        "text-5xl md:text-8xl font-serif font-medium italic text-white drop-shadow-md",
      heroMeta: "text-violet-100/90 font-light",
      image: "rounded-[1.5rem] shadow-lg shadow-violet-200/20",
      badge:
        "bg-white/15 backdrop-blur-md border border-white/20 text-white rounded-full",
      divider: "hidden",
      wishCard:
        "bg-white shadow-lg border border-violet-100 hover:shadow-xl transition-shadow",
      pinColor: "text-violet-400",
      sectionPadding: "py-28 md:py-36",
      sectionBgAlt: "bg-violet-50/50",
      sectionLabel: "text-xs font-medium tracking-[0.2em] uppercase italic opacity-50",
      sectionDivider: "w-16 h-px bg-violet-200/60 mx-auto my-4",
      cardHover: "hover:border-violet-300/50 hover:shadow-violet-200/30 hover:shadow-lg hover:scale-[1.02] transition-all duration-500",
      imageHover: "group-hover:scale-105 group-hover:brightness-105 transition-all duration-700",
      galleryColumns: "columns-1 sm:columns-2 lg:columns-3 gap-8 space-y-8",
      galleryItemClass: "break-inside-avoid",
      galleryHover: "group-hover:scale-105 group-hover:brightness-105 transition-all duration-700",
      coupleLayout: "gap-8",
      coupleOffset: "",
      detailsMiddleCard: "md:scale-110 z-10 shadow-xl shadow-violet-100/40",
      wishCardRounding: "rounded-2xl",
      inputStyle: "border-violet-200 text-violet-950 placeholder-violet-400/40 rounded-2xl focus:ring-1 focus:ring-violet-400/40",
      navButton: "bg-white/80 text-violet-800 hover:bg-white",
      floatingButton: "bg-violet-800/20",
      heroDateVenue: "text-violet-100/90 font-light text-lg md:text-xl",
      heroDateVenueLayout: "flex flex-col items-center gap-3 mt-6",
      heroDivider: "text-violet-200/40 text-sm",
      heroCountdown: "mt-10 flex items-center gap-8 md:gap-12 backdrop-blur-sm bg-white/5 border border-white/10 rounded-full px-10 py-5",
      heroCountdownUnit: "text-3xl md:text-4xl font-serif italic text-white tabular-nums",
      heroCountdownLabel: "text-[9px] uppercase tracking-[0.2em] text-violet-200/40 font-light mt-1",
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
    },
  },
  {
    id: "bohemian",
    name: "Bohemian",
    previewColor: "bg-orange-50",
    styles: {
      fontHeading: "font-serif",
      fontBody: "font-sans",
      bg: "bg-[#FDF6F0]",
      text: "text-orange-950",
      subtext: "text-orange-800/50",
      accent: "text-green-700/60",
      card: "bg-white/70 backdrop-blur-sm rounded-2xl shadow-md shadow-orange-200/20 border border-orange-100/50",
      button:
        "bg-orange-800 text-white hover:bg-orange-900 rounded-full px-8 shadow-md shadow-orange-800/20",
      heroOverlay: "bg-gradient-to-t from-orange-950/30 via-transparent to-orange-950/10",
      heroLayout: "items-center text-center",
      heroTitle:
        "text-5xl md:text-8xl font-serif font-normal text-white drop-shadow-md",
      heroMeta: "text-orange-100/90 font-light tracking-wide",
      image: "rounded-xl shadow-md shadow-orange-200/20",
      badge:
        "bg-white/15 backdrop-blur-md border border-white/20 text-white rounded-full",
      divider: "hidden",
      wishCard:
        "bg-[#FFFCF7] shadow-md border border-orange-100/60 rotate-1 hover:rotate-0 transition-transform",
      pinColor: "text-orange-600",
      sectionPadding: "py-20 md:py-28",
      sectionBgAlt: "bg-orange-50/50",
      sectionLabel: "text-xs font-bold tracking-[0.15em] uppercase opacity-50",
      sectionDivider: "flex items-center justify-center gap-2 mx-auto my-4 [&>span]:w-1.5 [&>span]:h-1.5 [&>span]:rounded-full [&>span]:bg-orange-300",
      cardHover: "hover:border-orange-200 hover:shadow-orange-200/20 hover:shadow-lg hover:rotate-[-0.5deg] transition-all duration-500",
      imageHover: "group-hover:scale-105 group-hover:rotate-1 transition-all duration-700",
      galleryColumns: "columns-1 md:columns-2 gap-6 space-y-6",
      galleryItemClass: "break-inside-avoid odd:rotate-1 even:-rotate-1",
      galleryHover: "group-hover:scale-105 group-hover:rotate-0 transition-all duration-700",
      coupleLayout: "gap-8",
      coupleOffset: "",
      detailsMiddleCard: "md:scale-110 z-10",
      wishCardRounding: "rounded-xl",
      inputStyle: "border-orange-200 text-orange-950 placeholder-orange-400/40 rounded-xl focus:ring-1 focus:ring-orange-400/40",
      navButton: "bg-white/80 text-orange-900 hover:bg-white",
      floatingButton: "bg-orange-800/20",
      heroDateVenue: "text-orange-100/90 font-light tracking-wide text-base md:text-lg",
      heroDateVenueLayout: "flex flex-col items-center gap-2 mt-6",
      heroDivider: "flex items-center gap-1.5 [&>span]:w-1 [&>span]:h-1 [&>span]:rounded-full [&>span]:bg-white/40",
      heroCountdown: "mt-10 flex items-center gap-6 md:gap-8",
      heroCountdownUnit: "text-3xl md:text-4xl font-serif text-white tabular-nums drop-shadow-md",
      heroCountdownLabel: "text-[9px] uppercase tracking-[0.15em] text-orange-100/50 font-medium mt-1",
    },
  },
];

export function getTheme(themeId: string): ThemeConfig {
  return siteThemes.find((t) => t.id === themeId) || siteThemes[0];
}

export function isDarkTheme(themeId: string): boolean {
  return themeId === "midnight";
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
