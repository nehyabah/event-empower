import { useEffect, useState, useRef } from "react";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { useScrollScene } from "@/hooks/useScrollScene";
import { useSearchParams, useParams, Link } from "react-router-dom";
import {
  Heart,
  Gift,
  MessageSquare,
  Calendar,
  MapPin,
  Clock,
  Quote,
  ArrowDown,
  ChevronLeft,
  ChevronRight,
  Send,
  Pin,
} from "lucide-react";
import { type Comment } from "@/components/couple-story/CommentsSection";
import { StoryImage } from "@/components/couple-story/StoryEditor";
import WishlistItem from "@/components/wishlist/WishlistItem";
import BankDetailCard from "@/components/wishlist/BankDetailCard";
import type { ThemeStyles } from "@/lib/siteThemes";
import TimelineSection from "@/components/couple-story/sections/TimelineSection";
import WeddingPartySection from "@/components/couple-story/sections/WeddingPartySection";
import TravelSection from "@/components/couple-story/sections/TravelSection";
import FaqSection from "@/components/couple-story/sections/FaqSection";
import { Button } from "@/components/ui/button";
import storyService from "@/services/api/storyService";
import { WishlistItem as WishlistItemType, BankDetail } from "@/context/types";
import type { TimelineEvent, WeddingPartyMember, TravelInfoItem, FaqItem } from "@/services/api/storyService";
import { getTheme, isDarkTheme, DEFAULT_SECTION_ORDER } from "@/lib/siteThemes";
import { getSiteFlorals, FloralGroup, Sprig } from "@/components/couple-story/FloralDecor";

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

/** One scroll-driven section. Its own scene, so progress is measured against
 *  this section rather than the page. */
const SceneSection = ({
  sectionId,
  revealClass,
  children,
}: {
  sectionId: string;
  revealClass: string;
  children: React.ReactNode;
}) => {
  const ref = useScrollScene<HTMLDivElement>();
  return (
    <div
      ref={ref}
      id={`section-${sectionId}`}
      data-section={sectionId}
      className="scene"
    >
      <div className={`scene-settle ${revealClass ? "" : ""}`}>{children}</div>
    </div>
  );
};

const SharedStoryPage = () => {
  const [searchParams] = useSearchParams();
  const { slug } = useParams<{ slug?: string }>();
  const coupleId = searchParams.get("id") || "default";

  const [coupleStory, setCoupleStory] = useState<any>(null);
  const [storyImages, setStoryImages] = useState<StoryImage[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [wishlistItems, setWishlistItems] = useState<WishlistItemType[]>([]);
  const [bankDetails, setBankDetails] = useState<BankDetail[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTemplate, setSelectedTemplate] = useState("editorial");
  const [notFound, setNotFound] = useState(false);

  // New entity data
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
  const [weddingParty, setWeddingParty] = useState<WeddingPartyMember[]>([]);
  const [travelInfo, setTravelInfo] = useState<TravelInfoItem[]>([]);
  const [faqItems, setFaqItems] = useState<FaqItem[]>([]);

  // Premium fields
  const [sectionOrder, setSectionOrder] = useState<string[]>(DEFAULT_SECTION_ORDER);
  const [hiddenSections, setHiddenSections] = useState<string[]>([]);

  // Guests land here straight after answering; ?rsvp= carries what they said so
  // the redirect still acknowledges them.
  const rsvpResponse = searchParams.get("rsvp");
  const [showRsvpAck, setShowRsvpAck] = useState(
    rsvpResponse === "confirmed" || rsvpResponse === "declined",
  );

  // Comments
  const [newCommentName, setNewCommentName] = useState("");
  const [newCommentText, setNewCommentText] = useState("");
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  const heroRef = useRef<HTMLDivElement>(null);
  const carouselRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let isMounted = true;
    const loadStoryData = async () => {
      setIsLoading(true);
      setNotFound(false);
      try {
        // Blank rather than a fictional couple: this is the page guests
        // open, so an unfilled field showed them "Sarah & James" in Tuscany.
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

        let bundle;
        if (slug) {
          try {
            bundle = await storyService.getStoryBySlug(slug);
          } catch {
            if (isMounted) setNotFound(true);
            return;
          }
        } else if (coupleId === "default") {
          setCoupleStory(defaultStoryData);
          setSelectedTemplate(defaultStoryData.templateId);
          return;
        } else {
          bundle = await storyService.getSharedStory(coupleId);
        }

        if (!isMounted || !bundle) return;

        const story = bundle.story;
        if (!story) {
          setNotFound(true);
          return;
        }

        const mergedStory = {
          ...defaultStoryData,
          title: story.title || defaultStoryData.title,
          content: story.content || defaultStoryData.content,
          hashtag: story.hashtag || defaultStoryData.hashtag,
          weddingDate: story.wedding_date || defaultStoryData.weddingDate,
          weddingTime: story.wedding_time || defaultStoryData.weddingTime,
          venue: story.venue || defaultStoryData.venue,
          loveQuote: story.love_quote || defaultStoryData.loveQuote,
          bannerImage: story.banner_image_url || defaultStoryData.bannerImage,
          brideName: story.bride_name || defaultStoryData.brideName,
          brideBio: story.bride_bio || defaultStoryData.brideBio,
          brideImage: story.bride_image_url || defaultStoryData.brideImage,
          groomName: story.groom_name || defaultStoryData.groomName,
          groomBio: story.groom_bio || defaultStoryData.groomBio,
          groomImage: story.groom_image_url || defaultStoryData.groomImage,
          templateId: story.template_id || defaultStoryData.templateId,
          userId: story.user_id,
        };

        setCoupleStory(mergedStory);
        setSelectedTemplate(mergedStory.templateId || "editorial");
        setSectionOrder(story.section_order || DEFAULT_SECTION_ORDER);
        setHiddenSections(story.hidden_sections || []);

        setStoryImages(bundle.images.map((img) => ({ id: img.id, url: img.url, caption: img.caption || "", storyType: img.story_type })));
        setComments(bundle.comments.map((c) => ({ id: c.id, name: c.name, text: c.text, date: c.created_at })));
        setWishlistItems(bundle.wishlist.map((item) => ({ id: item.id, name: item.name, price: item.price || undefined, link: item.link || undefined, priority: item.priority, purchasedBy: item.purchased_by || undefined, isAnonymous: item.is_anonymous || undefined })));
        setBankDetails(bundle.bankDetails.map((d) => ({ id: d.id, bankName: d.bank_name, accountName: d.account_name, accountNumber: d.account_number, sortCode: d.sort_code || undefined, iban: d.iban || undefined, swift: d.swift || undefined, description: d.description || undefined })));
        setTimeline(bundle.timeline || []);
        setWeddingParty(bundle.weddingParty || []);
        setTravelInfo(bundle.travelInfo || []);
        setFaqItems(bundle.faqItems || []);
      } catch (error) {
        console.error("Error loading story data", error);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    void loadStoryData();
    return () => { isMounted = false; };
  }, [coupleId, slug]);

  const scrollToContent = () => {
    window.scrollTo({ top: window.innerHeight, behavior: "smooth" });
  };

  const handleScrollLeft = () => carouselRef.current?.scrollBy({ left: -320, behavior: "smooth" });
  const handleScrollRight = () => carouselRef.current?.scrollBy({ left: 320, behavior: "smooth" });

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentName.trim() || !newCommentText.trim()) return;
    if (!coupleStory?.userId) return;
    setIsSubmittingComment(true);
    try {
      const created = await storyService.addSharedComment(coupleStory.userId, { name: newCommentName, text: newCommentText });
      setComments((prev) => [{ id: created.id, name: created.name, text: created.text, date: created.created_at }, ...prev]);
      setNewCommentName(""); setNewCommentText("");
      carouselRef.current?.scrollTo({ left: 0, behavior: "smooth" });
    } catch { /* ignore */ } finally { setIsSubmittingComment(false); }
  };

  if (notFound) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50">
        <div className="text-center">
          <Heart className="h-12 w-12 text-stone-300 mx-auto mb-4" />
          <h1 className="text-2xl font-serif text-stone-800 mb-2">Wedding Site Not Found</h1>
          <p className="text-stone-500">This site may have been unpublished or the link is incorrect.</p>
        </div>
      </div>
    );
  }

  if (isLoading || !coupleStory) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50">
        <div className="flex flex-col items-center gap-4">
          <Heart className="h-8 w-8 text-stone-300 animate-pulse" />
          <p className="text-stone-400 font-serif text-sm tracking-widest uppercase">Loading Story...</p>
        </div>
      </div>
    );
  }

  // ?theme= lets the couple preview any theme on the live site without saving
  const themeOverride = searchParams.get("theme");
  const effectiveTemplate = themeOverride || selectedTemplate;
  const activeTheme = getTheme(effectiveTemplate);
  const s = activeTheme.styles;
  const isDark = isDarkTheme(effectiveTemplate);
  const florals = getSiteFlorals(effectiveTemplate);
  const weddingDateObj = new Date(coupleStory.weddingDate);
  const formattedDate = !Number.isNaN(weddingDateObj.getTime())
    ? weddingDateObj.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })
    : coupleStory.weddingDate;

  const visibleSections = sectionOrder.filter((id) => !hiddenSections.includes(id));
  const heroSceneRef = useScrollScene<HTMLElement>();

  useScrollReveal([visibleSections.join(","), isLoading]);
  const storyUserId = coupleStory.userId || coupleId;

  /**
   * Anchor for the builder preview to scroll to, and the scroll-reveal
   * boundary. The animation class comes from the theme, so a template's
   * motion is part of how it reads rather than a global default.
   */
  const renderSection = (sectionId: string) => (
    <SceneSection key={sectionId} sectionId={sectionId} revealClass={s.reveal}>
      {renderSectionBody(sectionId)}
    </SceneSection>
  );

  const renderSectionBody = (sectionId: string) => {
    switch (sectionId) {
      case "hero": return null;
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
              <h2 className={`text-3xl md:text-5xl lg:text-6xl ${s.fontHeading} max-w-3xl mx-auto leading-tight italic`}>"{coupleStory.loveQuote}"</h2>
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
            <div className="container mx-auto px-4">
              <div className="text-center mb-16">
                <span className={`${s.sectionLabel} ${s.accent}`}>Memories</span>
                <h2 className={`text-4xl md:text-5xl mt-3 ${s.fontHeading}`}>Gallery</h2>
              </div>
              <div className={`${s.galleryColumns} max-w-7xl mx-auto`}>
                {storyImages.map((image, i) => (
                  <div
                    key={image.id}
                    data-reveal
                    // Staggering by position is what makes a grid feel composed
                    // rather than every tile landing at the same instant. Capped
                    // so a large gallery does not trail for seconds.
                    data-reveal-delay={Math.min(i, 7) * s.revealStagger}
                    className={`${s.galleryItemClass} ${s.reveal} relative group overflow-hidden ${s.image}`}
                  >
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity z-10 duration-500" />
                    <img src={image.url} alt={image.caption || "Story moment"} className={`w-full h-full object-cover transform ${s.galleryHover}`} />
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
                    <div className="w-full py-12 text-center"><p className={`${s.subtext} italic`}>Be the first to leave a wish!</p></div>
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
                      <label className={`text-xs font-bold uppercase tracking-widest ml-1 ${s.subtext}`}>Your Name</label>
                      <input type="text" value={newCommentName} onChange={(e) => setNewCommentName(e.target.value)} placeholder="e.g. Aunt May" className={`w-full p-4 bg-transparent border outline-none transition-all ${s.inputStyle}`} />
                    </div>
                    <div className="space-y-2">
                      <label className={`text-xs font-bold uppercase tracking-widest ml-1 ${s.subtext}`}>Your Message</label>
                      <textarea rows={4} value={newCommentText} onChange={(e) => setNewCommentText(e.target.value)} placeholder="Share a memory or wish..." className={`w-full p-4 bg-transparent border outline-none transition-all resize-none ${s.inputStyle}`} />
                    </div>
                    <Button type="submit" disabled={isSubmittingComment} className={`w-full py-6 text-base ${s.button}`}>
                      {isSubmittingComment ? <span className="animate-pulse">Sending...</span> : <>Send Wish <Send className="w-4 h-4 ml-2" /></>}
                    </Button>
                  </form>
                </div>
              </div>
            </div>
          </section>
        );
      case "registry":
        if (wishlistItems.length === 0 && bankDetails.length === 0) return null;
        return (
          <section key="registry" className={`${s.sectionPadding} transition-colors duration-700 ${s.sectionBgAlt}`}>
            <div className="container mx-auto px-4 max-w-4xl">
              <div className="text-center mb-16">
                <span className={`${s.sectionLabel} ${s.accent}`}>Registry</span>
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
                            const updated = await storyService.markSharedWishlistPurchased(storyUserId, itemId, purchaserName, isAnonymous);
                            setWishlistItems((prev) => prev.map((ex) => ex.id === itemId ? { ...ex, purchasedBy: updated.purchased_by || undefined, isAnonymous: updated.is_anonymous || undefined } : ex));
                          }}
                        />
                      ))}
                    </div>
                  </div>
                )}
                {bankDetails.length > 0 && (
                  <div>
                    <div className="flex items-center gap-3 mb-8">
                      <div className={`w-5 h-5 rounded-full border-2 border-current ${s.accent} flex items-center justify-center text-[10px] font-bold`}>$</div>
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
        );
      case "faq":
        return <FaqSection key="faq" faqItems={faqItems} styles={s} isDark={isDark} />;
      default:
        return null;
    }
  };

  return (
    <div className={`min-h-screen transition-all duration-700 ease-in-out ${s.bg} ${s.text} ${s.fontBody}`}>
      {/* Acknowledgement for a guest who just responded and was redirected here */}
      {showRsvpAck && (
        <div className="fixed top-0 left-0 right-0 z-50 animate-fade-in-up">
          <div className="bg-[#b2834c] text-white shadow-lg">
            <div className="container mx-auto flex items-center gap-3 px-4 py-3">
              <span className="text-xl leading-none">
                {rsvpResponse === "confirmed" ? "🎉" : "💐"}
              </span>
              <p className="flex-1 text-sm leading-snug">
                {rsvpResponse === "confirmed"
                  ? "Your RSVP is in — we can't wait to celebrate with you!"
                  : "Thank you for letting us know. You'll be missed!"}
              </p>
              <button
                onClick={() => setShowRsvpAck(false)}
                aria-label="Dismiss"
                className="shrink-0 rounded-full px-2 py-1 text-white/80 transition-colors hover:bg-white/15 hover:text-white"
              >
                ✕
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hero */}
      {visibleSections.includes("hero") && (
        /* Pinned scene: the hero holds the viewport while the reader scrolls
           through it, the photograph drifting behind the text as the text
           lifts away. Two viewport-heights tall so there is something to
           scroll through before it releases. */
        <section
          id="section-hero"
          data-section="hero"
          ref={heroSceneRef}
          className="scene scene-pin"
        >
          <div className="scene-stage w-full flex flex-col justify-center" ref={heroRef}>
          <div className="absolute inset-0 z-0">
            <div className={`absolute inset-0 ${s.heroOverlay} z-10`} />
            <img
              src={coupleStory.bannerImage}
              alt="Couple"
              className={`w-full h-full object-cover scene-parallax ${isLoading ? "blur-sm" : ""}`}
            />
          </div>
          <div className={`relative z-20 container px-4 flex flex-col scene-recede ${s.heroLayout}`}>
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
          <button
            onClick={scrollToContent}
            /* Fades out as the hero is scrolled through — it has done its job
               by then and would otherwise sit over the next section. */
            className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 text-white/50 hover:text-white transition-colors animate-bounce cursor-pointer scene-recede"
          >
            <ArrowDown className="w-6 h-6" />
          </button>
          </div>
        </section>
      )}

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

export default SharedStoryPage;
