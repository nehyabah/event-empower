import { useEffect, useRef, useState } from "react";
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
  Palette,
  Share2,
  Sparkles,
  Edit,
  X,
  Plus,
  ChevronLeft,
  ChevronRight,
  Send,
  Pin,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useWishlist } from "@/context/useWishlist";
import StoryEditor, { StoryImage } from "@/components/couple-story/StoryEditor";
import { Comment } from "@/components/couple-story/CommentsSection"; // Keep type import
import WishlistItem from "@/components/wishlist/WishlistItem";
import BankDetailCard from "@/components/wishlist/BankDetailCard";
import WishlistForm from "@/components/wishlist/WishlistForm";
import BankDetailsForm from "@/components/couple-story/BankDetailsForm";
import WeddingCountdown from "@/components/dashboard/WeddingCountdown";
import { Button } from "@/components/ui/button";
import storyService from "@/services/api/storyService";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";

// --- Theme Configurations ---
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
    },
  },
];

// --- Main Component ---
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
  const [isEditingStory, setIsEditingStory] = useState(false);
  const [showWishlistForm, setShowWishlistForm] = useState(false);
  const [showBankForm, setShowBankForm] = useState(false);
  const [isLoadingStory, setIsLoadingStory] = useState(true);

  // New Comment Form State
  const [newCommentName, setNewCommentName] = useState("");
  const [newCommentText, setNewCommentText] = useState("");
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  const heroRef = useRef<HTMLDivElement>(null);
  const carouselRef = useRef<HTMLDivElement>(null);

  // --- Effects ---

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

        setStoryImages(
          bundle.images.map((image) => ({
            id: image.id,
            url: image.url,
            caption: image.caption || "",
            storyType: image.story_type,
          })),
        );

        setComments(
          bundle.comments.map((comment) => ({
            id: comment.id,
            name: comment.name,
            text: comment.text,
            date: comment.created_at,
          })),
        );
      } catch (error) {
        console.error("Error loading story data", error);
      } finally {
        if (isMounted) {
          setIsLoadingStory(false);
        }
      }
    };

    void loadStoryData();
    return () => {
      isMounted = false;
    };
  }, []);

  // --- Handlers ---

  const scrollToContent = () => {
    window.scrollTo({
      top: window.innerHeight,
      behavior: "smooth",
    });
  };

  const shareStory = () => {
    if (!user?.id) {
      toast.error("Unable to generate share link");
      return;
    }
    const url = `${window.location.origin}/shared-story?id=${user.id}`;
    navigator.clipboard.writeText(url);
    toast.success("Story URL copied to clipboard!");
  };

  const handleScrollLeft = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({ left: -320, behavior: "smooth" });
    }
  };

  const handleScrollRight = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({ left: 320, behavior: "smooth" });
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentName.trim() || !newCommentText.trim()) {
      toast.error("Please fill in both fields");
      return;
    }

    setIsSubmittingComment(true);
    try {
      const created = await storyService.addMyComment({
        name: newCommentName,
        text: newCommentText,
      });

      const newComment: Comment = {
        id: created.id,
        name: created.name,
        text: created.text,
        date: created.created_at,
      };

      setComments((prev) => [newComment, ...prev]);
      setNewCommentName("");
      setNewCommentText("");
      toast.success("Your well wish has been sent!");

      // Scroll to the start of the carousel to see the new message
      if (carouselRef.current) {
        carouselRef.current.scrollTo({ left: 0, behavior: "smooth" });
      }
    } catch (error) {
      toast.error("Failed to post message");
      console.error(error);
    } finally {
      setIsSubmittingComment(false);
    }
  };

  if (isLoading || !isAuthenticated) {
    return null;
  }

  if (isLoadingStory || !coupleStory) {
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

  const activeTheme =
    templateOptions.find((t) => t.id === selectedTemplate) ||
    templateOptions[0];
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
    <div
      className={`min-h-screen transition-all duration-700 ease-in-out ${s.bg} ${s.text} ${s.fontBody}`}
    >
      {/* Floating Action Menu */}
      <div className="fixed top-6 right-6 z-50 flex flex-wrap gap-2 justify-end">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              size="icon"
              variant="outline"
              className={`rounded-full backdrop-blur-md shadow-lg border-white/20 hover:bg-white/20 text-white ${
                activeTheme.id === "garden"
                  ? "bg-emerald-900/40"
                  : "bg-white/10"
              }`}
            >
              <Palette className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-56 p-2 rounded-2xl border-none shadow-xl bg-white/90 backdrop-blur-xl"
          >
            {templateOptions.map((t) => (
              <DropdownMenuItem
                key={t.id}
                onClick={async () => {
                  setSelectedTemplate(t.id);
                  try {
                    await storyService.updateMyStory({ template_id: t.id });
                  } catch (error) {
                    toast.error("Failed to save template");
                    console.error("Failed to update template:", error);
                  }
                }}
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
          variant="outline"
          className={`backdrop-blur-md shadow-lg border-white/20 hover:bg-white/20 text-white ${
            activeTheme.id === "garden" ? "bg-emerald-900/40" : "bg-white/10"
          }`}
          onClick={shareStory}
        >
          <Share2 className="w-4 h-4 mr-2" />
          Share
        </Button>

        <Dialog open={isEditingStory} onOpenChange={setIsEditingStory}>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              className={`backdrop-blur-md shadow-lg border-white/20 hover:bg-white/20 text-white ${
                activeTheme.id === "garden"
                  ? "bg-emerald-900/40"
                  : "bg-white/10"
              }`}
            >
              <Edit className="w-4 h-4 mr-2" />
              Edit Story
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-5xl p-0 max-h-[85vh] overflow-hidden">
            <DialogHeader className="p-6 pb-0">
              <DialogTitle>Edit your story</DialogTitle>
              <DialogDescription>
                Update your details, story, and photos. Changes save when you
                click the Save button.
              </DialogDescription>
            </DialogHeader>
            <div className="p-6 pt-4 overflow-y-auto max-h-[70vh]">
              <StoryEditor
                coupleStory={coupleStory}
                storyImages={storyImages}
                setStoryImages={setStoryImages}
                setCoupleStory={setCoupleStory}
                onStoryUpdated={() => setIsEditingStory(false)}
              />
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Hero Section */}
      <section
        className="relative h-[100dvh] w-full overflow-hidden flex flex-col justify-center"
        ref={heroRef}
      >
        <div className="absolute inset-0 z-0">
          <div
            className={`absolute inset-0 ${s.heroOverlay} z-10 transition-colors duration-700`}
          />
          <img
            src={coupleStory.bannerImage}
            alt="Couple"
            className={`w-full h-full object-cover transition-transform duration-[20s] ease-linear scale-105 ${
              isLoadingStory ? "blur-sm" : "scale-100"
            }`}
          />
        </div>

        <div
          className={`relative z-20 container px-4 flex flex-col gap-8 animate-fade-in-up transition-all duration-700 ${s.heroLayout}`}
        >
          <div
            className={`inline-flex items-center gap-3 px-4 py-1.5 backdrop-blur-md border shadow-sm ${s.badge}`}
          >
            <Sparkles className="w-3 h-3" />
            <span className="text-[10px] font-bold tracking-[0.3em] uppercase">
              Save the Date
            </span>
          </div>

          <h1 className={`${s.heroTitle} transition-all duration-500`}>
            {coupleStory.title}
          </h1>

          <div
            className={`flex flex-col md:flex-row items-center gap-4 md:gap-8 text-lg md:text-xl mt-4 ${s.heroMeta}`}
          >
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
            <WeddingCountdown
              date={
                !Number.isNaN(weddingDateObj.getTime())
                  ? weddingDateObj
                  : undefined
              }
              onDateChange={() => {}}
            />
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
        {/* Quote Section */}
        <section className="py-24 md:py-32 container mx-auto px-4 text-center">
          <Quote className={`w-10 h-10 mx-auto mb-8 opacity-20 ${s.text}`} />
          <h2
            className={`text-3xl md:text-5xl lg:text-6xl ${s.fontHeading} max-w-4xl mx-auto leading-tight italic`}
          >
            "{coupleStory.loveQuote}"
          </h2>
          <div className={`mx-auto mt-16 max-w-[100px] ${s.divider}`} />
        </section>

        {/* Bride & Groom Section */}
        <section className="py-24 container mx-auto px-4">
          <div
            className={`grid grid-cols-1 md:grid-cols-2 max-w-6xl mx-auto ${
              activeTheme.id === "editorial" ? "gap-12 md:gap-24" : "gap-8"
            }`}
          >
            <div
              className={`flex flex-col gap-6 ${activeTheme.id === "editorial" ? "" : "md:mt-0"}`}
            >
              <div
                className={`aspect-[3/4] w-full overflow-hidden relative group ${s.image}`}
              >
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
                  <span className="text-xs font-bold uppercase tracking-widest opacity-80 mb-2 block">
                    The Bride
                  </span>
                  <h3 className={`text-4xl ${s.fontHeading} font-medium`}>
                    {coupleStory.brideName || "Sarah"}
                  </h3>
                </div>
              </div>
              <div
                className={`p-8 relative ${s.card} ${activeTheme.id === "midnight" ? "border-t-0" : ""}`}
              >
                <Quote
                  className={`w-6 h-6 absolute top-8 left-8 opacity-10 ${s.text}`}
                />
                <p
                  className={`leading-relaxed text-lg pt-4 px-4 opacity-80 ${s.subtext}`}
                >
                  {coupleStory.brideBio ||
                    "Sarah brings the light and laughter..."}
                </p>
              </div>
            </div>

            <div
              className={`flex flex-col gap-6 ${activeTheme.id === "editorial" ? "md:mt-24" : ""}`}
            >
              <div
                className={`aspect-[3/4] w-full overflow-hidden relative group ${s.image}`}
              >
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
                  <span className="text-xs font-bold uppercase tracking-widest opacity-80 mb-2 block">
                    The Groom
                  </span>
                  <h3 className={`text-4xl ${s.fontHeading} font-medium`}>
                    {coupleStory.groomName || "James"}
                  </h3>
                </div>
              </div>
              <div
                className={`p-8 relative ${s.card} ${activeTheme.id === "midnight" ? "border-t-0" : ""}`}
              >
                <Quote
                  className={`w-6 h-6 absolute top-8 left-8 opacity-10 ${s.text}`}
                />
                <p
                  className={`leading-relaxed text-lg pt-4 px-4 opacity-80 ${s.subtext}`}
                >
                  {coupleStory.groomBio || "James is the steady anchor..."}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Gallery Section */}
        {storyImages.length > 0 && (
          <section className={`py-24 ${isDark ? "bg-black/20" : "bg-black/5"}`}>
            <div className="container mx-auto px-4">
              <div className="text-center mb-16">
                <span
                  className={`text-xs font-bold tracking-[0.2em] uppercase opacity-50 ${s.accent}`}
                >
                  Memories
                </span>
                <h2 className={`text-4xl md:text-5xl mt-3 ${s.fontHeading}`}>
                  Gallery
                </h2>
              </div>

              <div className="columns-1 md:columns-2 lg:columns-3 gap-8 space-y-8 max-w-7xl mx-auto">
                {storyImages.map((image) => (
                  <div
                    key={image.id}
                    className={`break-inside-avoid relative group overflow-hidden ${s.image}`}
                  >
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity z-10 duration-500"></div>
                    <img
                      src={image.url}
                      alt={image.caption || "Story moment"}
                      className="w-full h-auto object-cover transform group-hover:scale-105 transition-transform duration-700 ease-out"
                    />
                    {image.caption && (
                      <div className="absolute bottom-0 left-0 right-0 p-6 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 transform translate-y-4 group-hover:translate-y-0">
                        <p className="text-white font-medium drop-shadow-md">
                          {image.caption}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Details Cards Section */}
        <section className="py-24 container mx-auto px-4">
          <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
            <div
              className={`flex flex-col items-center justify-center p-12 text-center space-y-4 transition-all duration-500 ${s.card}`}
            >
              <div
                className={`w-14 h-14 rounded-full flex items-center justify-center ${s.accent} bg-current/10 mb-2`}
              >
                <Calendar className="w-6 h-6" />
              </div>
              <h3 className={`text-xl font-bold ${s.text}`}>When</h3>
              <p
                className={`text-lg opacity-70 leading-relaxed max-w-[200px] ${s.subtext}`}
              >
                {formattedDate}
                <br />
                {coupleStory.weddingTime}
              </p>
            </div>

            <div
              className={`flex flex-col items-center justify-center p-12 text-center space-y-4 md:scale-110 z-10 transition-all duration-500 ${s.card}`}
            >
              <div
                className={`w-14 h-14 rounded-full flex items-center justify-center ${s.accent} bg-current/10 mb-2`}
              >
                <MapPin className="w-6 h-6" />
              </div>
              <h3 className={`text-xl font-bold ${s.text}`}>Where</h3>
              <p
                className={`text-lg opacity-70 leading-relaxed max-w-[200px] ${s.subtext}`}
              >
                {coupleStory.venue}
              </p>
              <Button className={`mt-4 ${s.button}`}>View Map</Button>
            </div>

            <div
              className={`flex flex-col items-center justify-center p-12 text-center space-y-4 transition-all duration-500 ${s.card}`}
            >
              <div
                className={`w-14 h-14 rounded-full flex items-center justify-center ${s.accent} bg-current/10 mb-2`}
              >
                <Clock className="w-6 h-6" />
              </div>
              <h3 className={`text-xl font-bold ${s.text}`}>Reception</h3>
              <p
                className={`text-lg opacity-70 leading-relaxed max-w-[200px] ${s.subtext}`}
              >
                Dinner & Dancing
                <br />
                to follow immediately
              </p>
            </div>
          </div>
        </section>

        {/* Well Wishes Section - CAROUSEL OVERHAUL */}
        <section
          className={`py-24 border-t ${activeTheme.id === "midnight" ? "border-zinc-900 bg-zinc-950/50" : "border-stone-200/50 bg-stone-50/50"}`}
        >
          <div className="container mx-auto px-4">
            <div className="flex flex-col items-center text-center mb-16">
              <div className={`p-3 rounded-full bg-current/5 mb-4 ${s.accent}`}>
                <MessageSquare className="w-6 h-6" />
              </div>
              <h3 className={`text-4xl md:text-5xl ${s.fontHeading} ${s.text}`}>
                Well Wishes
              </h3>
              <p className={`mt-3 text-lg ${s.subtext}`}>
                Notes from family and friends
              </p>
            </div>

            {/* Carousel Container */}
            <div className="relative max-w-7xl mx-auto mb-20 group">
              {/* Controls */}
              <div className="absolute top-1/2 -left-4 md:-left-12 -translate-y-1/2 z-20">
                <button
                  onClick={handleScrollLeft}
                  className={`p-3 rounded-full backdrop-blur-md shadow-lg transition-all hover:scale-110 active:scale-95 ${isDark ? "bg-zinc-800/80 text-white hover:bg-zinc-700" : "bg-white/80 text-stone-800 hover:bg-white"}`}
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
              </div>

              <div className="absolute top-1/2 -right-4 md:-right-12 -translate-y-1/2 z-20">
                <button
                  onClick={handleScrollRight}
                  className={`p-3 rounded-full backdrop-blur-md shadow-lg transition-all hover:scale-110 active:scale-95 ${isDark ? "bg-zinc-800/80 text-white hover:bg-zinc-700" : "bg-white/80 text-stone-800 hover:bg-white"}`}
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </div>

              {/* Scroll Area */}
              <div
                ref={carouselRef}
                className="flex overflow-x-auto gap-8 pb-12 pt-4 px-4 snap-x snap-mandatory scrollbar-hide"
                style={{
                  scrollBehavior: "smooth",
                  msOverflowStyle: "none",
                  scrollbarWidth: "none",
                }}
              >
                {comments.length > 0 ? (
                  comments.map((comment, index) => (
                    <div
                      key={comment.id}
                      className="snap-center shrink-0 w-[300px] md:w-[350px] first:ml-0 md:first:ml-4 last:mr-0 md:last:mr-4"
                    >
                      <div
                        className={`relative h-full p-8 flex flex-col items-center text-center ${s.wishCard} ${activeTheme.id === "editorial" ? "rounded-xl" : activeTheme.id === "garden" ? "rounded-2xl" : "rounded-none"}`}
                      >
                        {/* Pin Visual */}
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10 drop-shadow-md">
                          <Pin
                            className={`w-8 h-8 fill-current ${s.pinColor} transform -rotate-45`}
                          />
                        </div>

                        <div className="mt-4 mb-6">
                          <Quote
                            className={`w-6 h-6 mx-auto opacity-20 ${s.text}`}
                          />
                        </div>

                        <p
                          className={`text-lg leading-relaxed font-medium mb-6 line-clamp-6 ${s.fontHeading} ${s.text}`}
                        >
                          "{comment.text}"
                        </p>

                        <div className="mt-auto pt-6 border-t border-current/10 w-full">
                          <p
                            className={`font-bold tracking-wide text-sm uppercase ${s.subtext}`}
                          >
                            {comment.name}
                          </p>
                          <p className="text-xs opacity-50 mt-1">
                            {new Date(comment.date).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="w-full py-12 text-center col-span-full">
                    <p className={`${s.subtext} italic`}>
                      Be the first to leave a wish!
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* New Comment Form (Bottom) */}
            <div className="max-w-xl mx-auto relative z-10">
              <div
                className={`p-8 md:p-10 ${s.card} transform transition-transform hover:scale-[1.01]`}
              >
                <div className="text-center mb-8">
                  <h4 className={`text-2xl ${s.fontHeading} ${s.text}`}>
                    Send Your Love
                  </h4>
                  <p className={`text-sm mt-2 ${s.subtext}`}>
                    Write a message for the happy couple
                  </p>
                </div>

                <form onSubmit={handleAddComment} className="space-y-6">
                  <div className="space-y-2">
                    <label
                      htmlFor="name"
                      className={`text-xs font-bold uppercase tracking-widest ml-1 ${s.subtext}`}
                    >
                      Your Name
                    </label>
                    <input
                      id="name"
                      type="text"
                      value={newCommentName}
                      onChange={(e) => setNewCommentName(e.target.value)}
                      placeholder="e.g. Aunt May"
                      className={`w-full p-4 bg-transparent border outline-none focus:ring-1 focus:ring-stone-400 transition-all ${activeTheme.id === "midnight" ? "border-zinc-700 text-white placeholder-zinc-600" : "border-stone-200 text-stone-800 placeholder-stone-400"} rounded-xl`}
                    />
                  </div>

                  <div className="space-y-2">
                    <label
                      htmlFor="message"
                      className={`text-xs font-bold uppercase tracking-widest ml-1 ${s.subtext}`}
                    >
                      Your Message
                    </label>
                    <textarea
                      id="message"
                      rows={4}
                      value={newCommentText}
                      onChange={(e) => setNewCommentText(e.target.value)}
                      placeholder="Share a memory or wish..."
                      className={`w-full p-4 bg-transparent border outline-none focus:ring-1 focus:ring-stone-400 transition-all resize-none ${activeTheme.id === "midnight" ? "border-zinc-700 text-white placeholder-zinc-600" : "border-stone-200 text-stone-800 placeholder-stone-400"} rounded-xl`}
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={isSubmittingComment}
                    className={`w-full py-6 text-base ${s.button} transition-transform active:scale-95`}
                  >
                    {isSubmittingComment ? (
                      <span className="animate-pulse">Sending...</span>
                    ) : (
                      <>
                        Send Wish <Send className="w-4 h-4 ml-2" />
                      </>
                    )}
                  </Button>
                </form>
              </div>
            </div>
          </div>
        </section>

        {/* Registry & Cash Fund Section */}
        <section
          className={`py-24 transition-colors duration-700 ${isDark ? "bg-zinc-900/30" : "bg-white/50"}`}
        >
          <div className="container mx-auto px-4 max-w-5xl">
            <div className="text-center mb-16">
              <span
                className={`text-xs font-bold tracking-[0.2em] uppercase opacity-50 ${s.accent}`}
              >
                Registry
              </span>
              <h2 className={`text-4xl md:text-5xl mt-3 ${s.fontHeading}`}>
                Gifts & Support
              </h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
              {/* Wishlist Column */}
              <div className="flex flex-col gap-6">
                <div className="flex items-center justify-between pb-4 border-b border-current/10">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg bg-current/5 ${s.accent}`}>
                      <Gift className="w-5 h-5" />
                    </div>
                    <h3 className={`text-2xl ${s.fontHeading}`}>Wishlist</h3>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="hover:bg-current/5"
                    onClick={() => setShowWishlistForm((prev) => !prev)}
                  >
                    {showWishlistForm ? (
                      <X className="w-4 h-4 mr-2" />
                    ) : (
                      <Plus className="w-4 h-4 mr-2" />
                    )}
                    {showWishlistForm ? "Close" : "Add"}
                  </Button>
                </div>

                {showWishlistForm && (
                  <div
                    className={`p-6 animate-in slide-in-from-top-4 ${s.card}`}
                  >
                    <WishlistForm
                      onSuccess={() => setShowWishlistForm(false)}
                    />
                  </div>
                )}

                <div className="grid gap-6">
                  {wishlistItems.length > 0 ? (
                    wishlistItems.map((item) => (
                      <div
                        key={item.id}
                        className="transform transition-all hover:-translate-y-1"
                      >
                        <WishlistItem
                          item={item}
                          isPreviewMode={false}
                          isPublicView={false}
                          onPurchase={(itemId, purchaserName, isAnonymous) =>
                            markItemAsPurchased(
                              itemId,
                              purchaserName,
                              isAnonymous,
                            )
                          }
                          onRemovePurchase={(itemId) =>
                            removeItemPurchaser(itemId)
                          }
                        />
                      </div>
                    ))
                  ) : (
                    <div
                      className={`p-12 text-center border border-dashed border-current/20 rounded-2xl ${s.subtext}`}
                    >
                      <Gift className="w-8 h-8 mx-auto mb-3 opacity-30" />
                      <p>No items in the registry yet.</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Cash Fund Column */}
              <div className="flex flex-col gap-6">
                <div className="flex items-center justify-between pb-4 border-b border-current/10">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg bg-current/5 ${s.accent}`}>
                      <Heart className="w-5 h-5" />
                    </div>
                    <h3 className={`text-2xl ${s.fontHeading}`}>Cash Funds</h3>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="hover:bg-current/5"
                    onClick={() => setShowBankForm((prev) => !prev)}
                  >
                    {showBankForm ? (
                      <X className="w-4 h-4 mr-2" />
                    ) : (
                      <Plus className="w-4 h-4 mr-2" />
                    )}
                    {showBankForm ? "Close" : "Add"}
                  </Button>
                </div>

                {showBankForm && (
                  <div
                    className={`p-6 animate-in slide-in-from-top-4 ${s.card}`}
                  >
                    <BankDetailsForm onSuccess={() => setShowBankForm(false)} />
                  </div>
                )}

                <div className="grid gap-6">
                  {bankDetails.length > 0 ? (
                    bankDetails.map((detail, index) => (
                      <div
                        key={detail.id || index}
                        className="transform transition-all hover:-translate-y-1"
                      >
                        <BankDetailCard
                          detail={detail}
                          onRemove={() =>
                            detail.id && removeBankDetail(detail.id)
                          }
                          index={index}
                          isEditable={true}
                        />
                      </div>
                    ))
                  ) : (
                    <div
                      className={`p-12 text-center border border-dashed border-current/20 rounded-2xl ${s.subtext}`}
                    >
                      <Heart className="w-8 h-8 mx-auto mb-3 opacity-30" />
                      <p>No cash funds set up yet.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        <footer className={`py-12 text-center opacity-60 text-sm ${s.subtext}`}>
          <p className="font-serif italic text-lg mb-2">
            {coupleStory.hashtag
              ? `#${coupleStory.hashtag}`
              : "Forever & Always"}
          </p>
          <p>Created with Planr</p>
        </footer>
      </div>
    </div>
  );
};

export default CoupleStory;
