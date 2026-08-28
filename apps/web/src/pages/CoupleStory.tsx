import { useEffect, useRef, useState } from "react";
import type { StoryImage } from "@/components/couple-story/StoryEditor";
import StoryGallery from "@/components/couple-story/StoryGallery";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  Heart,
  Gift,
  MessageSquare,
  Calendar,
  MapPin,
  Clock,
  Quote,
  ArrowDown,
  Settings,
  Share2,
  Edit,
  X,
  Plus,
  ChevronLeft,
  ChevronRight,
  Send,
  Pin,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import Navbar from "@/components/layout/Navbar";
import { useWishlist } from "@/context/useWishlist";
import { Comment } from "@/components/couple-story/CommentsSection";
import WishlistItem from "@/components/wishlist/WishlistItem";
import BankDetailCard from "@/components/wishlist/BankDetailCard";
import WishlistForm from "@/components/wishlist/WishlistForm";
import BankDetailsForm from "@/components/couple-story/BankDetailsForm";
import type { ThemeStyles } from "@/lib/siteThemes";
import TimelineSection from "@/components/couple-story/sections/TimelineSection";
import WeddingPartySection from "@/components/couple-story/sections/WeddingPartySection";
import TravelSection from "@/components/couple-story/sections/TravelSection";
import FaqSection from "@/components/couple-story/sections/FaqSection";
import { Button } from "@/components/ui/button";
import storyService from "@/services/api/storyService";
import type { TimelineEvent, WeddingPartyMember, TravelInfoItem, FaqItem } from "@/services/api/storyService";
import { getTheme, isDarkTheme, DEFAULT_SECTION_ORDER } from "@/lib/siteThemes";
import { getSiteFlorals, FloralGroup, Sprig } from "@/components/couple-story/FloralDecor";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";

function useCountdown(date: Date | undefined) {
  const [tl, setTl] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  useEffect(() => {
    if (!date) return;
    const tick = () => {
      const diff = date.getTime() - Date.now();
      if (diff <= 0) { setTl({ days: 0, hours: 0, minutes: 0, seconds: 0 }); return; }
      setTl({
        days: Math.floor(diff / 86400000),
        hours: Math.floor((diff / 3600000) % 24),
        minutes: Math.floor((diff / 60000) % 60),
        seconds: Math.floor((diff / 1000) % 60),
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [date]);
  return tl;
}

function HeroCountdown({ date, styles: s }: { date: Date | undefined; styles: ThemeStyles }) {
  const tl = useCountdown(date);
  if (!date || Number.isNaN(date.getTime())) return null;
  const units = [
    { value: tl.days, label: "Days" },
    { value: tl.hours, label: "Hrs" },
    { value: tl.minutes, label: "Min" },
    { value: tl.seconds, label: "Sec" },
  ];
  return (
    <div className={s.heroCountdown}>
      {units.map((u) => (
        <div key={u.label} className="flex flex-col items-center">
          <span className={s.heroCountdownUnit}>
            {u.value.toString().padStart(2, "0")}
          </span>
          <span className={s.heroCountdownLabel}>{u.label}</span>
        </div>
      ))}
    </div>
  );
}

const CoupleStory = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading, user } = useAuth();
  const {
    wishlistItems,
    bankDetails,
    removeBankDetail,
    markItemAsPurchased,
    removeItemPurchaser,
  } = useWishlist();

  const [coupleStory, setCoupleStory] = useState<any>(null);
  const [storyImages, setStoryImages] = useState<StoryImage[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState("editorial");
  const [showWishlistForm, setShowWishlistForm] = useState(false);
  const [showBankForm, setShowBankForm] = useState(false);
  const [isLoadingStory, setIsLoadingStory] = useState(true);

  // New premium fields
  const [accentColor, setAccentColor] = useState<string | null>(null);
  const [fontPair, setFontPair] = useState("classic");
  const [sectionOrder, setSectionOrder] = useState<string[]>(DEFAULT_SECTION_ORDER);
  const [hiddenSections, setHiddenSections] = useState<string[]>([]);
  const [slug, setSlug] = useState<string | null>(null);
  const [sitePublished, setSitePublished] = useState(true);

  // New entity data
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
  const [weddingParty, setWeddingParty] = useState<WeddingPartyMember[]>([]);
  const [travelInfo, setTravelInfo] = useState<TravelInfoItem[]>([]);
  const [faqItems, setFaqItems] = useState<FaqItem[]>([]);

  // Comment form
  const [newCommentName, setNewCommentName] = useState("");
  const [newCommentText, setNewCommentText] = useState("");
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  const heroRef = useRef<HTMLDivElement>(null);
  const carouselRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated) {
      navigate("/");
      toast.error("Please log in to view the couple's story");
    }
  }, [isAuthenticated, isLoading, navigate]);

  useEffect(() => {
    let isMounted = true;
    const loadStoryData = async () => {
      setIsLoadingStory(true);
      try {
        // Blank, not a fictional couple. Every field below fell back to
          // "Sarah & James" in Tuscany with stock photos, so anything the
          // couple had not filled in appeared as theirs — including on the
          // public wedding site their guests visit.
          const defaultStoryData = {
            title: "",
            content: "",
            hashtag: "",
            weddingDate: "",
            weddingTime: "",
            venue: "",
            loveQuote: "",
            bannerImage: "",
            brideName: "",
            brideBio: "",
            brideImage: "",
            groomName: "",
            groomBio: "",
            groomImage: "",
            templateId: "editorial",
          };

        const bundle = await storyService.getMyStory();
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
          selectedIcon: story?.selected_icon || "heart",
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
        setAccentColor(story?.accent_color || null);
        setFontPair(story?.font_pair || "classic");
        setSectionOrder(story?.section_order || DEFAULT_SECTION_ORDER);
        setHiddenSections(story?.hidden_sections || []);
        setSlug(story?.slug || null);
        setSitePublished(story?.site_published ?? true);

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

        setTimeline(bundle.timeline || []);
        setWeddingParty(bundle.weddingParty || []);
        setTravelInfo(bundle.travelInfo || []);
        setFaqItems(bundle.faqItems || []);
      } catch (error) {
        console.error("Error loading story data", error);
      } finally {
        if (isMounted) setIsLoadingStory(false);
      }
    };

    void loadStoryData();
    return () => { isMounted = false; };
  }, []);

  const scrollToContent = () => {
    window.scrollTo({ top: window.innerHeight, behavior: "smooth" });
  };


  const handleScrollLeft = () => {
    carouselRef.current?.scrollBy({ left: -320, behavior: "smooth" });
  };

  const handleScrollRight = () => {
    carouselRef.current?.scrollBy({ left: 320, behavior: "smooth" });
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentName.trim() || !newCommentText.trim()) { toast.error("Please fill in both fields"); return; }
    setIsSubmittingComment(true);
    try {
      const created = await storyService.addMyComment({ name: newCommentName, text: newCommentText });
      setComments((prev) => [{ id: created.id, name: created.name, text: created.text, date: created.created_at }, ...prev]);
      setNewCommentName(""); setNewCommentText("");
      toast.success("Your well wish has been sent!");
      carouselRef.current?.scrollTo({ left: 0, behavior: "smooth" });
    } catch { toast.error("Failed to post message"); } finally { setIsSubmittingComment(false); }
  };

  // Above every early return below — this component bails out for auth and
  // again for loading, and a hook skipped on one render and called on the
  // next is what React refuses to do.
  useScrollReveal([
    sectionOrder.filter((id) => !hiddenSections.includes(id)).join(","),
    storyImages.length,
    isLoadingStory,
  ]);

  if (isLoading || !isAuthenticated) return null;

  if (isLoadingStory || !coupleStory) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50">
        <div className="flex flex-col items-center gap-4">
          <Heart className="h-8 w-8 text-stone-300 animate-pulse" />
          <p className="text-stone-400 font-serif text-sm tracking-widest uppercase">Loading Story...</p>
        </div>
      </div>
    );
  }

  const activeTheme = getTheme(selectedTemplate);
  const s = activeTheme.styles;
  const isDark = isDarkTheme(selectedTemplate);
  const florals = getSiteFlorals(selectedTemplate);
  const weddingDateObj = new Date(coupleStory.weddingDate);
  const formattedDate = !Number.isNaN(weddingDateObj.getTime())
    ? weddingDateObj.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })
    : coupleStory.weddingDate;

  const visibleSections = sectionOrder.filter((id) => !hiddenSections.includes(id));


  // Accent color override style
  const accentStyle = accentColor ? { "--accent-override": accentColor } as React.CSSProperties : undefined;

  // Section renderers
  const renderSection = (sectionId: string) => {
    switch (sectionId) {
      case "hero": return null; // Hero is always rendered outside the loop
      case "quote":
        return (
          <section key="quote" className={`${s.sectionPadding} text-center relative overflow-hidden`}>
            <div className="container mx-auto px-4 relative z-10">
              {florals?.sprig ? (
                <div className="mb-8">
                  <Sprig src={florals.sprig} className={florals.sprigClass ?? "h-16 w-36"} />
                </div>
              ) : (
                <Quote className={`w-10 h-10 mx-auto mb-8 opacity-20 ${s.text}`} />
              )}
              <h2 className={`text-3xl md:text-5xl lg:text-6xl ${s.fontHeading} max-w-4xl mx-auto leading-tight italic`}>
                "{coupleStory.loveQuote}"
              </h2>
            </div>
            {s.sectionDivider !== "hidden" && (
              <div className="mt-16">
                {s.sectionDivider.includes("[&>span]") ? (
                  <div className={s.sectionDivider}><span /><span /><span /></div>
                ) : (
                  <div className={`mx-auto max-w-[100px] ${s.sectionDivider}`} />
                )}
              </div>
            )}
          </section>
        );
      case "couple":
        return (
          <section key="couple" className={`${s.sectionPadding} container mx-auto px-4`}>
            <div className={`grid grid-cols-1 md:grid-cols-2 max-w-6xl mx-auto ${s.coupleLayout}`}>
              <div className="flex flex-col gap-6">
                <div className={`aspect-[3/4] w-full overflow-hidden relative group ${s.image}`}>
                  <div className="absolute inset-0 bg-black/10 z-10 transition-opacity group-hover:opacity-0" />
                  <img src={coupleStory.brideImage} alt="The Bride" className={`w-full h-full object-cover ${s.imageHover}`} />
                  <div className="absolute bottom-0 left-0 p-8 z-20 text-white">
                    <span className="text-xs font-bold uppercase tracking-widest opacity-80 mb-2 block">The Bride</span>
                    <h3 className={`text-4xl ${s.fontHeading} font-medium`}>{coupleStory.brideName}</h3>
                  </div>
                </div>
                <div className={`p-8 relative ${s.card} ${s.cardHover}`}>
                  <Quote className={`w-6 h-6 absolute top-8 left-8 opacity-10 ${s.text}`} />
                  <p className={`leading-relaxed text-lg pt-4 px-4 opacity-80 ${s.subtext}`}>{coupleStory.brideBio}</p>
                </div>
              </div>
              <div className={`flex flex-col gap-6 ${s.coupleOffset}`}>
                <div className={`aspect-[3/4] w-full overflow-hidden relative group ${s.image}`}>
                  <div className="absolute inset-0 bg-black/10 z-10 transition-opacity group-hover:opacity-0" />
                  <img src={coupleStory.groomImage} alt="The Groom" className={`w-full h-full object-cover ${s.imageHover}`} />
                  <div className="absolute bottom-0 left-0 p-8 z-20 text-white">
                    <span className="text-xs font-bold uppercase tracking-widest opacity-80 mb-2 block">The Groom</span>
                    <h3 className={`text-4xl ${s.fontHeading} font-medium`}>{coupleStory.groomName}</h3>
                  </div>
                </div>
                <div className={`p-8 relative ${s.card} ${s.cardHover}`}>
                  <Quote className={`w-6 h-6 absolute top-8 left-8 opacity-10 ${s.text}`} />
                  <p className={`leading-relaxed text-lg pt-4 px-4 opacity-80 ${s.subtext}`}>{coupleStory.groomBio}</p>
                </div>
              </div>
            </div>
          </section>
        );
      case "gallery":
        if (storyImages.length === 0) return null;
        return (
          <section key="gallery" className={`${s.sectionPadding} ${s.sectionBgAlt}`}>
            <div className="text-center mb-16 container mx-auto px-4">
              <span className={`${s.sectionLabel} ${s.accent}`}>Memories</span>
              <h2 className={`text-4xl md:text-5xl mt-3 ${s.fontHeading}`}>Gallery</h2>
            </div>
            {/* Same component as the public site, so the couple's own view
                cannot drift from what their guests actually see. */}
            <div className={s.galleryStyle === "marquee" ? "" : "container mx-auto px-4"}>
              <StoryGallery
                images={storyImages}
                style={s.galleryStyle}
                imageClass={s.image}
                hoverClass={s.galleryHover}
                revealClass={s.reveal}
              />
            </div>
          </section>
        );
      case "timeline":
        return <TimelineSection key="timeline" timeline={timeline} styles={s} isDark={isDark} />;
      case "wedding-party":
        return <WeddingPartySection key="wedding-party" weddingParty={weddingParty} styles={s} isDark={isDark} />;
      case "details":
        return (
          <section key="details" className={`${s.sectionPadding} container mx-auto px-4`}>
            <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className={`flex flex-col items-center justify-center p-12 text-center space-y-4 transition-all duration-500 ${s.card} ${s.cardHover}`}>
                <div className={`w-14 h-14 rounded-full flex items-center justify-center ${s.accent} bg-current/10 mb-2`}><Calendar className="w-6 h-6" /></div>
                <h3 className={`text-xl font-bold ${s.text}`}>When</h3>
                <p className={`text-lg opacity-70 leading-relaxed max-w-[200px] ${s.subtext}`}>{formattedDate}<br />{coupleStory.weddingTime}</p>
              </div>
              <div className={`flex flex-col items-center justify-center p-12 text-center space-y-4 transition-all duration-500 ${s.card} ${s.detailsMiddleCard} ${s.cardHover}`}>
                <div className={`w-14 h-14 rounded-full flex items-center justify-center ${s.accent} bg-current/10 mb-2`}><MapPin className="w-6 h-6" /></div>
                <h3 className={`text-xl font-bold ${s.text}`}>Where</h3>
                <p className={`text-lg opacity-70 leading-relaxed max-w-[200px] ${s.subtext}`}>{coupleStory.venue}</p>
                <Button className={`mt-4 ${s.button}`}>View Map</Button>
              </div>
              <div className={`flex flex-col items-center justify-center p-12 text-center space-y-4 transition-all duration-500 ${s.card} ${s.cardHover}`}>
                <div className={`w-14 h-14 rounded-full flex items-center justify-center ${s.accent} bg-current/10 mb-2`}><Clock className="w-6 h-6" /></div>
                <h3 className={`text-xl font-bold ${s.text}`}>Reception</h3>
                <p className={`text-lg opacity-70 leading-relaxed max-w-[200px] ${s.subtext}`}>Dinner & Dancing<br />to follow immediately</p>
              </div>
            </div>
          </section>
        );
      case "travel":
        return <TravelSection key="travel" travelInfo={travelInfo} styles={s} isDark={isDark} />;
      case "wishes":
        return (
          <section key="wishes" className={`${s.sectionPadding} ${s.sectionBgAlt} relative overflow-hidden`}>
            <FloralGroup items={florals?.wishes} />
            <div className="container mx-auto px-4 relative z-10">
              <div className="flex flex-col items-center text-center mb-16">
                <div className={`p-3 rounded-full bg-current/5 mb-4 ${s.accent}`}><MessageSquare className="w-6 h-6" /></div>
                <h3 className={`text-4xl md:text-5xl ${s.fontHeading} ${s.text}`}>Well Wishes</h3>
                <p className={`mt-3 text-lg ${s.subtext}`}>Notes from family and friends</p>
              </div>
              <div className="relative max-w-7xl mx-auto mb-20 group">
                <div className="absolute top-1/2 -left-4 md:-left-12 -translate-y-1/2 z-20">
                  <button onClick={handleScrollLeft} className={`p-3 rounded-full backdrop-blur-md shadow-lg transition-all hover:scale-110 active:scale-95 ${s.navButton}`}><ChevronLeft className="w-6 h-6" /></button>
                </div>
                <div className="absolute top-1/2 -right-4 md:-right-12 -translate-y-1/2 z-20">
                  <button onClick={handleScrollRight} className={`p-3 rounded-full backdrop-blur-md shadow-lg transition-all hover:scale-110 active:scale-95 ${s.navButton}`}><ChevronRight className="w-6 h-6" /></button>
                </div>
                <div ref={carouselRef} className="flex overflow-x-auto gap-8 pb-12 pt-4 px-4 snap-x snap-mandatory scrollbar-hide" style={{ scrollBehavior: "smooth", msOverflowStyle: "none", scrollbarWidth: "none" }}>
                  {comments.length > 0 ? comments.map((comment) => (
                    <div key={comment.id} className="snap-center shrink-0 w-[300px] md:w-[350px] first:ml-0 md:first:ml-4 last:mr-0 md:last:mr-4">
                      <div className={`relative h-full p-8 flex flex-col items-center text-center ${s.wishCard} ${s.wishCardRounding}`}>
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10 drop-shadow-md"><Pin className={`w-8 h-8 fill-current ${s.pinColor} transform -rotate-45`} /></div>
                        <div className="mt-4 mb-6"><Quote className={`w-6 h-6 mx-auto opacity-20 ${s.text}`} /></div>
                        <p className={`text-lg leading-relaxed font-medium mb-6 line-clamp-6 ${s.fontHeading} ${s.text}`}>"{comment.text}"</p>
                        <div className="mt-auto pt-6 border-t border-current/10 w-full">
                          <p className={`font-bold tracking-wide text-sm uppercase ${s.subtext}`}>{comment.name}</p>
                          <p className="text-xs opacity-50 mt-1">{new Date(comment.date).toLocaleDateString()}</p>
                        </div>
                      </div>
                    </div>
                  )) : (
                    <div className="w-full py-12 text-center col-span-full"><p className={`${s.subtext} italic`}>Be the first to leave a wish!</p></div>
                  )}
                </div>
              </div>
              <div className="max-w-xl mx-auto relative z-10">
                <div className={`p-8 md:p-10 ${s.card} ${s.cardHover}`}>
                  <div className="text-center mb-8">
                    <h4 className={`text-2xl ${s.fontHeading} ${s.text}`}>Send Your Love</h4>
                    <p className={`text-sm mt-2 ${s.subtext}`}>Write a message for the happy couple</p>
                  </div>
                  <form onSubmit={handleAddComment} className="space-y-6">
                    <div className="space-y-2">
                      <label htmlFor="name" className={`text-xs font-bold uppercase tracking-widest ml-1 ${s.subtext}`}>Your Name</label>
                      <input id="name" type="text" value={newCommentName} onChange={(e) => setNewCommentName(e.target.value)} placeholder="e.g. Aunt May" className={`w-full p-4 bg-transparent border outline-none transition-all ${s.inputStyle}`} />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="message" className={`text-xs font-bold uppercase tracking-widest ml-1 ${s.subtext}`}>Your Message</label>
                      <textarea id="message" rows={4} value={newCommentText} onChange={(e) => setNewCommentText(e.target.value)} placeholder="Share a memory or wish..." className={`w-full p-4 bg-transparent border outline-none transition-all resize-none ${s.inputStyle}`} />
                    </div>
                    <Button type="submit" disabled={isSubmittingComment} className={`w-full py-6 text-base ${s.button} transition-transform active:scale-95`}>
                      {isSubmittingComment ? <span className="animate-pulse">Sending...</span> : <>Send Wish <Send className="w-4 h-4 ml-2" /></>}
                    </Button>
                  </form>
                </div>
              </div>
            </div>
          </section>
        );
      case "registry":
        return (
          <section key="registry" className={`${s.sectionPadding} transition-colors duration-700 ${s.sectionBgAlt}`}>
            <div className="container mx-auto px-4 max-w-5xl">
              <div className="text-center mb-16">
                <span className={`${s.sectionLabel} ${s.accent}`}>Registry</span>
                <h2 className={`text-4xl md:text-5xl mt-3 ${s.fontHeading}`}>Gifts & Support</h2>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
                <div className="flex flex-col gap-6">
                  <div className="flex items-center justify-between pb-4 border-b border-current/10">
                    <div className="flex items-center gap-3"><div className={`p-2 rounded-lg bg-current/5 ${s.accent}`}><Gift className="w-5 h-5" /></div><h3 className={`text-2xl ${s.fontHeading}`}>Wishlist</h3></div>
                    <Button variant="ghost" size="sm" className="hover:bg-current/5" onClick={() => setShowWishlistForm((p) => !p)}>
                      {showWishlistForm ? <><X className="w-4 h-4 mr-2" />Close</> : <><Plus className="w-4 h-4 mr-2" />Add</>}
                    </Button>
                  </div>
                  {showWishlistForm && <div className={`p-6 animate-in slide-in-from-top-4 ${s.card}`}><WishlistForm onSuccess={() => setShowWishlistForm(false)} /></div>}
                  <div className="grid gap-6">
                    {wishlistItems.length > 0 ? wishlistItems.map((item) => (
                      <div key={item.id} className="transform transition-all hover:-translate-y-1">
                        <WishlistItem item={item} isPreviewMode={false} isPublicView={false} onPurchase={(id, name, anon) => markItemAsPurchased(id, name, anon)} onRemovePurchase={(id) => removeItemPurchaser(id)} />
                      </div>
                    )) : (
                      <div className={`p-12 text-center border border-dashed border-current/20 rounded-2xl ${s.subtext}`}><Gift className="w-8 h-8 mx-auto mb-3 opacity-30" /><p>No items in the registry yet.</p></div>
                    )}
                  </div>
                </div>
                <div className="flex flex-col gap-6">
                  <div className="flex items-center justify-between pb-4 border-b border-current/10">
                    <div className="flex items-center gap-3"><div className={`p-2 rounded-lg bg-current/5 ${s.accent}`}><Heart className="w-5 h-5" /></div><h3 className={`text-2xl ${s.fontHeading}`}>Cash Funds</h3></div>
                    <Button variant="ghost" size="sm" className="hover:bg-current/5" onClick={() => setShowBankForm((p) => !p)}>
                      {showBankForm ? <><X className="w-4 h-4 mr-2" />Close</> : <><Plus className="w-4 h-4 mr-2" />Add</>}
                    </Button>
                  </div>
                  {showBankForm && <div className={`p-6 animate-in slide-in-from-top-4 ${s.card}`}><BankDetailsForm onSuccess={() => setShowBankForm(false)} /></div>}
                  <div className="grid gap-6">
                    {bankDetails.length > 0 ? bankDetails.map((detail, index) => (
                      <div key={detail.id || index} className="transform transition-all hover:-translate-y-1">
                        <BankDetailCard detail={detail} onRemove={() => detail.id && removeBankDetail(detail.id)} index={index} isEditable={true} />
                      </div>
                    )) : (
                      <div className={`p-12 text-center border border-dashed border-current/20 rounded-2xl ${s.subtext}`}><Heart className="w-8 h-8 mx-auto mb-3 opacity-30" /><p>No cash funds set up yet.</p></div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </section>
        );
      case "faq":
        return <FaqSection key="faq" faqItems={faqItems} styles={s} isDark={isDark} />;
      default:
        return null;
    }
  };

  return (
    <div className={`min-h-screen transition-all duration-700 ease-in-out ${s.bg} ${s.text} ${s.fontBody}`} style={accentStyle}>
      {/* App menu bar — only on the couple's own editing view, never on the shared site */}
      <Navbar />

      {/* Hero Section (always rendered if visible) */}
      {visibleSections.includes("hero") && (
        <section className="relative h-[100dvh] w-full overflow-hidden flex flex-col justify-center" ref={heroRef}>
          <div className="absolute inset-0 z-0">
            <div className={`absolute inset-0 ${s.heroOverlay} z-10 transition-colors duration-700`} />
            <img src={coupleStory.bannerImage} alt="Couple" className={`w-full h-full object-cover transition-transform duration-[20s] ease-linear scale-105 ${isLoadingStory ? "blur-sm" : "scale-100"}`} />
          </div>
          <div className={`relative z-20 container px-4 flex flex-col animate-fade-in-up transition-all duration-700 ${s.heroLayout}`}>
            <h1 className={`${s.heroTitle} transition-all duration-500`}>{coupleStory.title}</h1>
            <div className={`${s.heroDateVenueLayout}`}>
              <span className={s.heroDateVenue}>{formattedDate}</span>
              {s.heroDivider.includes("[&>span]") ? (
                <div className={s.heroDivider}><span /><span /><span /></div>
              ) : s.heroDivider.includes("text-") ? (
                <span className={s.heroDivider}>&middot;</span>
              ) : (
                <div className={s.heroDivider} />
              )}
              <span className={s.heroDateVenue}>{coupleStory.venue}</span>
            </div>
            <HeroCountdown date={!Number.isNaN(weddingDateObj.getTime()) ? weddingDateObj : undefined} styles={s} />
          </div>
          <button onClick={scrollToContent} className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 text-white/50 hover:text-white transition-colors animate-bounce cursor-pointer">
            <ArrowDown className="w-6 h-6" />
          </button>
        </section>
      )}

      {/* Dynamic sections */}
      <div className={`relative z-20 transition-colors duration-700 ${s.bg}`}>
        {visibleSections.filter((id) => id !== "hero").map(renderSection)}

        <footer className={`py-16 text-center text-sm relative overflow-hidden ${s.subtext}`}>
          <FloralGroup items={florals?.footer} />
          <div className="relative z-10">
            {florals?.sprig && (
              <Sprig src={florals.sprig} className={`${florals.sprigClass ?? "h-16 w-36"} mb-5`} opacity={0.75} />
            )}
            <p className="font-serif italic text-lg mb-2 opacity-80">{coupleStory.hashtag ? `#${coupleStory.hashtag}` : "Forever & Always"}</p>
            <p className="opacity-60">Created with àjọyọ</p>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default CoupleStory;
