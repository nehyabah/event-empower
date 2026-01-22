import { useEffect, useState, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Heart,
  Gift,
  MessageSquare,
  Calendar,
  MapPin,
  Clock,
  Quote,
  ArrowDown,
  Palette,
  Share2,
  Sparkles,
} from "lucide-react";
import StoryDisplay from "@/components/couple-story/StoryDisplay";
import CommentsSection, { Comment } from "@/components/couple-story/CommentsSection";
import { StoryImage } from "@/components/couple-story/StoryEditor";
import WishlistItem from "@/components/wishlist/WishlistItem";
import BankDetailCard from "@/components/wishlist/BankDetailCard";
import WeddingCountdown from "@/components/dashboard/WeddingCountdown";
import { Button } from "@/components/ui/button";
import storyService from "@/services/api/storyService";
import { WishlistItem as WishlistItemType, BankDetail } from "@/context/types";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const templateOptions = [
  {
    id: "editorial",
    name: "Editorial",
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
      heroTitle: "text-6xl md:text-9xl font-serif font-medium tracking-tight italic text-white",
      heroMeta: "text-white/90 font-light",
      image: "rounded-[2rem] shadow-lg",
      badge: "bg-white/10 backdrop-blur-md border border-white/20 text-white rounded-full",
      divider: "hidden",
    },
  },
  {
    id: "midnight",
    name: "Midnight Gala",
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
      heroTitle: "text-5xl md:text-8xl font-serif uppercase tracking-widest font-light text-white",
      heroMeta: "text-amber-100/80 font-serif italic",
      image:
        "rounded-none grayscale hover:grayscale-0 transition-all duration-700 border border-zinc-800",
      badge:
        "bg-zinc-900 border border-zinc-700 text-zinc-300 rounded-none uppercase tracking-widest text-[10px]",
      divider: "w-full h-px bg-zinc-800 my-12",
    },
  },
  {
    id: "garden",
    name: "Modern Botanical",
    styles: {
      fontHeading: "font-serif",
      fontBody: "font-sans",
      bg: "bg-[#F0F4F2]",
      text: "text-emerald-950",
      subtext: "text-emerald-800/60",
      accent: "text-emerald-600",
      card:
        "bg-white/80 backdrop-blur-xl border border-white/60 shadow-lg shadow-emerald-900/5 rounded-3xl",
      button:
        "bg-emerald-900 text-white hover:bg-emerald-800 rounded-2xl px-6 shadow-lg shadow-emerald-900/20",
      heroOverlay: "bg-emerald-950/20",
      heroLayout: "items-center text-center",
      heroTitle: "text-5xl md:text-7xl font-serif font-normal text-white drop-shadow-md",
      heroMeta: "text-white/90 font-medium tracking-wide",
      image: "rounded-3xl shadow-md shadow-emerald-900/10",
      badge: "bg-emerald-900/10 backdrop-blur-md border border-emerald-900/10 text-emerald-100 rounded-2xl",
      divider: "hidden",
    },
  },
];

const SharedStoryPage = () => {
  const [searchParams] = useSearchParams();
  const coupleId = searchParams.get("id") || "default";

  const [coupleStory, setCoupleStory] = useState<any>(null);
  const [storyImages, setStoryImages] = useState<StoryImage[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [wishlistItems, setWishlistItems] = useState<WishlistItemType[]>([]);
  const [bankDetails, setBankDetails] = useState<BankDetail[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTemplate, setSelectedTemplate] = useState("editorial");

  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let isMounted = true;
    const loadStoryData = async () => {
      setIsLoading(true);
      try {
        const defaultStoryData = {
          title: "Sarah & James",
          content:
            "We met at a coffee shop on a rainy Tuesday. Neither of us had an umbrella, so we shared one to the subway station. Five years, three apartments, and one dog later, we're ready to share our lives forever.",
          hashtag: "SarahJames2024",
          weddingDate: "2024-10-15",
          weddingTime: "4:00 PM",
          venue: "The Grand Estate, Tuscany",
          loveQuote: "In all the world, there is no heart for me like yours.",
          bannerImage:
            "https://images.unsplash.com/photo-1519741497674-611481863552?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
          brideName: "Sarah",
          brideBio:
            "Always the dreamer, Sarah has spent her life collecting moments and memories. She found her anchor in James, whose steady presence grounds her wild spirit. She promises to always steal the covers and make him laugh.",
          brideImage:
            "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=1964&auto=format&fit=crop",
          groomName: "James",
          groomBio:
            "James approaches life with quiet determination and a warm smile. In Sarah, he found the spark that lights up his world and the adventure he was always waiting for. He promises to always kill the spiders and cook Sunday breakfast.",
          groomImage:
            "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=1887&auto=format&fit=crop",
          templateId: "editorial",
        };

        if (coupleId === "default") {
          setCoupleStory(defaultStoryData);
          setSelectedTemplate(defaultStoryData.templateId);
          setStoryImages([]);
          setComments([]);
          setWishlistItems([]);
          setBankDetails([]);
          return;
        }

        const bundle = await storyService.getSharedStory(coupleId);
        if (!isMounted) return;

        const story = bundle.story;
        const mergedStory = {
          ...defaultStoryData,
          title: story?.title || defaultStoryData.title,
          content: story?.content || defaultStoryData.content,
          hashtag: story?.hashtag || defaultStoryData.hashtag,
          weddingDate: story?.wedding_date || defaultStoryData.weddingDate,
          weddingTime: story?.wedding_time || defaultStoryData.weddingTime,
          venue: story?.venue || defaultStoryData.venue,
          loveQuote: story?.love_quote || defaultStoryData.loveQuote,
          bannerImage: story?.banner_image_url || defaultStoryData.bannerImage,
          brideName: story?.bride_name || defaultStoryData.brideName,
          brideBio: story?.bride_bio || defaultStoryData.brideBio,
          brideImage: story?.bride_image_url || defaultStoryData.brideImage,
          groomName: story?.groom_name || defaultStoryData.groomName,
          groomBio: story?.groom_bio || defaultStoryData.groomBio,
          groomImage: story?.groom_image_url || defaultStoryData.groomImage,
          templateId: story?.template_id || defaultStoryData.templateId,
        };

        setCoupleStory(mergedStory);
        setSelectedTemplate(mergedStory.templateId || "editorial");

        setStoryImages(
          bundle.images.map((image) => ({
            id: image.id,
            url: image.url,
            caption: image.caption || "",
            storyType: image.story_type,
          }))
        );

        setComments(
          bundle.comments.map((comment) => ({
            id: comment.id,
            name: comment.name,
            text: comment.text,
            date: comment.created_at,
          }))
        );

        setWishlistItems(
          bundle.wishlist.map((item) => ({
            id: item.id,
            name: item.name,
            price: item.price || undefined,
            link: item.link || undefined,
            priority: item.priority,
            purchasedBy: item.purchased_by || undefined,
            isAnonymous: item.is_anonymous || undefined,
          }))
        );

        setBankDetails(
          bundle.bankDetails.map((detail) => ({
            id: detail.id,
            bankName: detail.bank_name,
            accountName: detail.account_name,
            accountNumber: detail.account_number,
            sortCode: detail.sort_code || undefined,
            iban: detail.iban || undefined,
            swift: detail.swift || undefined,
            description: detail.description || undefined,
          }))
        );
      } catch (error) {
        console.error("Error loading story data", error);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void loadStoryData();
    return () => {
      isMounted = false;
    };
  }, [coupleId]);

  const scrollToContent = () => {
    window.scrollTo({
      top: window.innerHeight,
      behavior: "smooth",
    });
  };

  if (isLoading || !coupleStory) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50">
        <div className="flex flex-col items-center gap-4">
          <Heart className="h-8 w-8 text-stone-300 animate-pulse" />
          <p className="text-stone-400 font-serif text-sm tracking-widest uppercase">
            Loading Story...
          </p>
        </div>
      </div>
    );
  }

  const activeTheme = templateOptions.find((t) => t.id === selectedTemplate) || templateOptions[0];
  const s = activeTheme.styles;
  const isDark = activeTheme.id === "midnight";

  const weddingDateObj = new Date(coupleStory.weddingDate);
  const formattedDate = !Number.isNaN(weddingDateObj.getTime())
    ? weddingDateObj.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : coupleStory.weddingDate;

  return (
    <div className={`min-h-screen transition-all duration-700 ease-in-out ${s.bg} ${s.text} ${s.fontBody}`}>
      <div className="fixed top-6 right-6 z-50 flex gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              size="icon"
              variant="outline"
              className={`rounded-full backdrop-blur-md shadow-lg border-white/20 hover:bg-white/20 text-white ${
                activeTheme.id === "garden" ? "bg-emerald-900/40" : "bg-white/10"
              }`}
            >
              <Palette className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 p-2 rounded-2xl border-none shadow-xl bg-white/90 backdrop-blur-xl">
            {templateOptions.map((t) => (
              <DropdownMenuItem
                key={t.id}
                onClick={() => setSelectedTemplate(t.id)}
                className={`rounded-xl p-3 cursor-pointer mb-1 ${selectedTemplate === t.id ? "bg-stone-100" : ""}`}
              >
                <div
                  className={`w-6 h-6 rounded-full mr-3 border shadow-sm ${
                    t.id === "midnight"
                      ? "bg-zinc-950"
                      : t.id === "garden"
                        ? "bg-[#F0F4F2]"
                        : "bg-stone-50"
                  }`}
                ></div>
                <span className="font-medium text-stone-800">{t.name}</span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <Button
          size="icon"
          variant="outline"
          className={`rounded-full backdrop-blur-md shadow-lg border-white/20 hover:bg-white/20 text-white ${
            activeTheme.id === "garden" ? "bg-emerald-900/40" : "bg-white/10"
          }`}
        >
          <Share2 className="w-4 h-4" />
        </Button>
      </div>

      <section className="relative h-[100dvh] w-full overflow-hidden flex flex-col justify-center" ref={heroRef}>
        <div className="absolute inset-0 z-0">
          <div className={`absolute inset-0 ${s.heroOverlay} z-10 transition-colors duration-700`} />
          <img
            src={coupleStory.bannerImage}
            alt="Couple"
            className={`w-full h-full object-cover transition-transform duration-[20s] ease-linear scale-105 ${
              isLoading ? "blur-sm" : "scale-100"
            }`}
          />
        </div>

        <div
          className={`relative z-20 container px-4 flex flex-col gap-8 animate-fade-in-up transition-all duration-700 ${s.heroLayout}`}
        >
          <div className={`inline-flex items-center gap-3 px-4 py-1.5 backdrop-blur-md border shadow-sm ${s.badge}`}>
            <Sparkles className="w-3 h-3" />
            <span className="text-[10px] font-bold tracking-[0.3em] uppercase">Save the Date</span>
          </div>

          <h1 className={`${s.heroTitle} transition-all duration-500`}>{coupleStory.title}</h1>

          <div className={`flex flex-col md:flex-row items-center gap-4 md:gap-8 text-lg md:text-xl mt-4 ${s.heroMeta}`}>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 opacity-70" />
              <span>{formattedDate}</span>
            </div>
            <div className="hidden md:block w-1.5 h-1.5 rounded-full bg-white/30"></div>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 opacity-70" />
              <span>{coupleStory.venue}</span>
            </div>
          </div>

          <div className="mt-12 w-full max-w-4xl transform scale-75 md:scale-90 origin-top opacity-90 hover:opacity-100 transition-opacity">
            <WeddingCountdown date={!Number.isNaN(weddingDateObj.getTime()) ? weddingDateObj : undefined} onDateChange={() => {}} />
          </div>
        </div>

        <button
          onClick={scrollToContent}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 text-white/50 hover:text-white transition-colors animate-bounce cursor-pointer"
        >
          <ArrowDown className="w-6 h-6" />
        </button>
      </section>

      <div className={`relative z-20 transition-colors duration-700 ${s.bg}`}>
        <section className="py-24 md:py-32 container mx-auto px-4 text-center">
          <Quote className={`w-10 h-10 mx-auto mb-8 opacity-20 ${s.text}`} />
          <h2 className={`text-3xl md:text-5xl lg:text-6xl ${s.fontHeading} max-w-4xl mx-auto leading-tight italic`}>
            "{coupleStory.loveQuote}"
          </h2>
          <div className={`mx-auto mt-16 max-w-[100px] ${s.divider}`} />
        </section>

        <section className="pb-12 container mx-auto px-4 max-w-5xl">
          <div className={`p-8 md:p-16 transition-all duration-500 ${s.card}`}>
            <div className="flex items-center gap-2 mb-8 justify-center">
              <Heart className={`w-4 h-4 ${s.accent}`} />
              <span className={`text-xs font-bold tracking-[0.2em] uppercase opacity-50 ${s.accent}`}>How We Met</span>
            </div>

            <div className="prose prose-lg md:prose-xl mx-auto text-center">
              <StoryDisplay
                coupleStory={{ ...coupleStory, bannerImage: undefined }}
                storyImages={storyImages}
                comments={comments}
                setComments={setComments}
                isEditingStory={false}
                isSharedView={true}
              />
            </div>
          </div>
        </section>

        <section className="py-24 container mx-auto px-4">
          <div
            className={`grid grid-cols-1 md:grid-cols-2 max-w-6xl mx-auto ${
              activeTheme.id === "editorial" ? "gap-12 md:gap-24" : "gap-8"
            }`}
          >
            <div className={`flex flex-col gap-6 ${activeTheme.id === "editorial" ? "" : "md:mt-0"}`}>
              <div className={`aspect-[3/4] w-full overflow-hidden relative group ${s.image}`}>
                <div className="absolute inset-0 bg-black/10 z-10 transition-opacity group-hover:opacity-0"></div>
                <img
                  src={
                    coupleStory.brideImage ||
                    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=1964&auto=format&fit=crop"
                  }
                  alt="The Bride"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute bottom-0 left-0 p-8 z-20 text-white">
                  <span className="text-xs font-bold uppercase tracking-widest opacity-80 mb-2 block">The Bride</span>
                  <h3 className={`text-4xl ${s.fontHeading} font-medium`}>{coupleStory.brideName || "Sarah"}</h3>
                </div>
              </div>
              <div className={`p-8 relative ${s.card} ${activeTheme.id === "midnight" ? "border-t-0" : ""}`}>
                <Quote className={`w-6 h-6 absolute top-8 left-8 opacity-10 ${s.text}`} />
                <p className={`leading-relaxed text-lg pt-4 px-4 opacity-80 ${s.subtext}`}>
                  {coupleStory.brideBio || "Sarah brings the light and laughter..."}
                </p>
              </div>
            </div>

            <div className={`flex flex-col gap-6 ${activeTheme.id === "editorial" ? "md:mt-24" : ""}`}>
              <div className={`aspect-[3/4] w-full overflow-hidden relative group ${s.image}`}>
                <div className="absolute inset-0 bg-black/10 z-10 transition-opacity group-hover:opacity-0"></div>
                <img
                  src={
                    coupleStory.groomImage ||
                    "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=1887&auto=format&fit=crop"
                  }
                  alt="The Groom"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute bottom-0 left-0 p-8 z-20 text-white">
                  <span className="text-xs font-bold uppercase tracking-widest opacity-80 mb-2 block">The Groom</span>
                  <h3 className={`text-4xl ${s.fontHeading} font-medium`}>{coupleStory.groomName || "James"}</h3>
                </div>
              </div>
              <div className={`p-8 relative ${s.card} ${activeTheme.id === "midnight" ? "border-t-0" : ""}`}>
                <Quote className={`w-6 h-6 absolute top-8 left-8 opacity-10 ${s.text}`} />
                <p className={`leading-relaxed text-lg pt-4 px-4 opacity-80 ${s.subtext}`}>
                  {coupleStory.groomBio || "James is the steady anchor..."}
                </p>
              </div>
            </div>
          </div>
        </section>

        {storyImages.length > 0 && (
          <section className={`py-24 ${isDark ? "bg-black/20" : "bg-black/5"}`}>
            <div className="container mx-auto px-4">
              <div className="text-center mb-16">
                <span className={`text-xs font-bold tracking-[0.2em] uppercase opacity-50 ${s.accent}`}>Memories</span>
                <h2 className={`text-4xl md:text-5xl mt-3 ${s.fontHeading}`}>Gallery</h2>
              </div>

              <div className="columns-1 md:columns-2 lg:columns-3 gap-8 space-y-8 max-w-7xl mx-auto">
                {storyImages.map((image) => (
                  <div key={image.id} className={`break-inside-avoid relative group overflow-hidden ${s.image}`}>
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity z-10 duration-500"></div>
                    <img
                      src={image.url}
                      alt={image.caption}
                      className="w-full h-auto object-cover transform group-hover:scale-105 transition-transform duration-700 ease-out"
                    />
                    {image.caption && (
                      <div className="absolute bottom-0 left-0 right-0 p-6 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 transform translate-y-4 group-hover:translate-y-0">
                        <p className="text-white font-medium drop-shadow-md">{image.caption}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        <section className="py-24 container mx-auto px-4">
          <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className={`flex flex-col items-center justify-center p-12 text-center space-y-4 transition-all duration-500 ${s.card}`}>
              <div className={`w-14 h-14 rounded-full flex items-center justify-center ${s.accent} bg-current/10 mb-2`}>
                <Calendar className="w-6 h-6" />
              </div>
              <h3 className={`text-xl font-bold ${s.text}`}>When</h3>
              <p className={`text-lg opacity-70 leading-relaxed max-w-[200px] ${s.subtext}`}>
                {formattedDate}
                <br />
                {coupleStory.weddingTime}
              </p>
            </div>

            <div className={`flex flex-col items-center justify-center p-12 text-center space-y-4 md:scale-110 z-10 transition-all duration-500 ${s.card}`}>
              <div className={`w-14 h-14 rounded-full flex items-center justify-center ${s.accent} bg-current/10 mb-2`}>
                <MapPin className="w-6 h-6" />
              </div>
              <h3 className={`text-xl font-bold ${s.text}`}>Where</h3>
              <p className={`text-lg opacity-70 leading-relaxed max-w-[200px] ${s.subtext}`}>{coupleStory.venue}</p>
              <Button className={`mt-4 ${s.button}`}>View Map</Button>
            </div>

            <div className={`flex flex-col items-center justify-center p-12 text-center space-y-4 transition-all duration-500 ${s.card}`}>
              <div className={`w-14 h-14 rounded-full flex items-center justify-center ${s.accent} bg-current/10 mb-2`}>
                <Clock className="w-6 h-6" />
              </div>
              <h3 className={`text-xl font-bold ${s.text}`}>Reception</h3>
              <p className={`text-lg opacity-70 leading-relaxed max-w-[200px] ${s.subtext}`}>
                Dinner & Dancing
                <br />
                to follow immediately
              </p>
            </div>
          </div>
        </section>

        <section className="py-20 container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="flex items-center gap-3 mb-8">
              <MessageSquare className={`w-5 h-5 ${s.accent}`} />
              <div>
                <h3 className={`text-2xl ${s.fontHeading} ${s.text}`}>Well Wishes</h3>
                <p className={`text-sm ${s.subtext}`}>Notes from family and friends</p>
              </div>
            </div>
            <CommentsSection
              comments={comments}
              setComments={setComments}
              isSharedView={true}
              showHeader={false}
              showForm={true}
              onAddComment={async ({ name, text }) => {
                const created = await storyService.addSharedComment(coupleId, { name, text });
                return {
                  id: created.id,
                  name: created.name,
                  text: created.text,
                  date: created.created_at,
                };
              }}
            />
          </div>
        </section>

        <section className={`py-24 transition-colors duration-700 ${isDark ? "bg-zinc-900/30" : "bg-white/50"}`}>
          <div className="container mx-auto px-4 max-w-4xl">
            <div className="text-center mb-16">
              <span className={`text-xs font-bold tracking-[0.2em] uppercase opacity-50 ${s.accent}`}>Registry</span>
              <h2 className={`text-4xl md:text-5xl mt-3 ${s.fontHeading}`}>Gifts & Wishes</h2>
            </div>

            <div className="space-y-16">
              {wishlistItems.length > 0 && (
                <div>
                  <div className="flex items-center gap-3 mb-8">
                    <Gift className={`w-5 h-5 ${s.accent}`} />
                    <h3 className={`text-2xl ${s.fontHeading}`}>Wishlist</h3>
                  </div>
                  <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
                    {wishlistItems.map((item) => (
                      <WishlistItem
                        key={item.id}
                        item={item}
                        isPreviewMode={false}
                        isPublicView={true}
                        onPurchase={async (itemId, purchaserName, isAnonymous) => {
                          const updated = await storyService.markSharedWishlistPurchased(
                            coupleId,
                            itemId,
                            purchaserName,
                            isAnonymous
                          );
                          setWishlistItems((prev) =>
                            prev.map((existing) =>
                              existing.id === itemId
                                ? {
                                    ...existing,
                                    purchasedBy: updated.purchased_by || undefined,
                                    isAnonymous: updated.is_anonymous || undefined,
                                  }
                                : existing
                            )
                          );
                        }}
                      />
                    ))}
                  </div>
                </div>
              )}

              {bankDetails.length > 0 && (
                <div>
                  <div className="flex items-center gap-3 mb-8">
                    <div className={`w-5 h-5 rounded-full border-2 border-current ${s.accent} flex items-center justify-center text-[10px] font-bold`}>
                      $
                    </div>
                    <h3 className={`text-2xl ${s.fontHeading}`}>Cash Fund</h3>
                  </div>
                  <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
                    {bankDetails.map((detail, index) => (
                      <BankDetailCard key={index} detail={detail} index={index} isEditable={false} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        <footer className={`py-12 text-center opacity-60 text-sm ${s.subtext}`}>
          <p className="font-serif italic text-lg mb-2">
            {coupleStory.hashtag ? `#${coupleStory.hashtag}` : "Forever & Always"}
          </p>
          <p>Created with Planr</p>
        </footer>
      </div>
    </div>
  );
};

export default SharedStoryPage;
