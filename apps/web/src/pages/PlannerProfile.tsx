import { useEffect, useRef, useState } from "react";
import OnboardingBanner from "@/components/auth/OnboardingBanner";
import { plannerService, PlannerProfileData, PlannerProfileResponse } from "@/services/api/plannerService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Camera, Loader2, MapPin, Globe, Phone, Instagram, Facebook,
  Twitter, Briefcase, Plus, X, Save, User,
} from "lucide-react";
import { toast } from "sonner";
import Navbar from "@/components/layout/Navbar";

const SPECIALIZATION_SUGGESTIONS = [
  "Traditional Weddings", "White Weddings", "Outdoor Ceremonies",
  "Destination Weddings", "Intimate Weddings", "Large-Scale Events",
  "Budget Weddings", "Luxury Weddings", "Corporate Events",
  "Engagement Parties", "Bridal Showers", "Church Weddings",
];

const PlannerProfilePage = () => {
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const [profileData, setProfileData] = useState<PlannerProfileResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isUploadingCover, setIsUploadingCover] = useState(false);

  // Form state
  const [name, setName] = useState("");
  const [tagline, setTagline] = useState("");
  const [bio, setBio] = useState("");
  const [location, setLocation] = useState("");
  const [phone, setPhone] = useState("");
  const [website, setWebsite] = useState("");
  const [yearsExp, setYearsExp] = useState("");
  const [instagram, setInstagram] = useState("");
  const [facebook, setFacebook] = useState("");
  const [twitter, setTwitter] = useState("");
  const [specializations, setSpecializations] = useState<string[]>([]);
  const [newSpec, setNewSpec] = useState("");
  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null);
  const [coverImageUrl, setCoverImageUrl] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await plannerService.getMyProfile();
        setProfileData(data);
        setName(data.user.name || "");
        const p = data.profile;
        if (p) {
          setTagline(p.tagline || "");
          setBio(p.bio || "");
          setLocation(p.location || "");
          setPhone(p.phone || "");
          setWebsite(p.website || "");
          setYearsExp(p.years_of_experience?.toString() || "");
          setInstagram(p.instagram || "");
          setFacebook(p.facebook || "");
          setTwitter(p.twitter || "");
          setSpecializations(p.specializations || []);
          setProfileImageUrl(p.profile_image_url || null);
          setCoverImageUrl(p.cover_image_url || null);
        }
      } catch {
        toast.error("Failed to load profile");
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await plannerService.updateMyProfile({
        name: name.trim() || undefined,
        tagline: tagline.trim() || null,
        bio: bio.trim() || null,
        location: location.trim() || null,
        phone: phone.trim() || null,
        website: website.trim() || null,
        years_of_experience: yearsExp ? parseInt(yearsExp) : null,
        instagram: instagram.trim() || null,
        facebook: facebook.trim() || null,
        twitter: twitter.trim() || null,
        specializations,
        profile_image_url: profileImageUrl,
        cover_image_url: coverImageUrl,
      });
      toast.success("Profile saved successfully");
    } catch {
      toast.error("Failed to save profile");
    } finally {
      setIsSaving(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingAvatar(true);
    try {
      const result = await plannerService.uploadProfileImage(file);
      setProfileImageUrl(result.url);
    } catch {
      toast.error("Failed to upload photo");
    } finally {
      setIsUploadingAvatar(false);
      if (avatarInputRef.current) avatarInputRef.current.value = "";
    }
  };

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingCover(true);
    try {
      const result = await plannerService.uploadProfileImage(file);
      setCoverImageUrl(result.url);
    } catch {
      toast.error("Failed to upload cover photo");
    } finally {
      setIsUploadingCover(false);
      if (coverInputRef.current) coverInputRef.current.value = "";
    }
  };

  const addSpecialization = (spec: string) => {
    const trimmed = spec.trim();
    if (trimmed && !specializations.includes(trimmed)) {
      setSpecializations((prev) => [...prev, trimmed]);
    }
    setNewSpec("");
  };

  const removeSpecialization = (spec: string) => {
    setSpecializations((prev) => prev.filter((s) => s !== spec));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center pt-20">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 pt-16">
        <div className="container mx-auto px-4 pt-6">
          <OnboardingBanner />
        </div>
        {/* Cover Photo */}
        <div className="relative h-48 sm:h-60 bg-muted overflow-hidden">
          {coverImageUrl ? (
            <img src={coverImageUrl} alt="Cover" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5" />
          )}
          <button
            type="button"
            onClick={() => coverInputRef.current?.click()}
            className="absolute top-3 right-3 bg-black/60 hover:bg-black/80 text-white rounded-lg px-3 py-1.5 text-xs flex items-center gap-1.5 transition-colors"
          >
            {isUploadingCover ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Camera className="h-3.5 w-3.5" />}
            {isUploadingCover ? "Uploading..." : "Change cover"}
          </button>
          <input ref={coverInputRef} type="file" accept="image/*" className="hidden" onChange={handleCoverUpload} />
        </div>

        <div className="container mx-auto px-4 pb-16">
          {/* Avatar + name header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4 -mt-12 sm:-mt-16 mb-8">
            <div className="relative flex-shrink-0">
              <div
                className="w-24 h-24 sm:w-32 sm:h-32 rounded-full border-4 border-background bg-muted overflow-hidden cursor-pointer"
                onClick={() => avatarInputRef.current?.click()}
              >
                {profileImageUrl ? (
                  <img src={profileImageUrl} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <User className="h-12 w-12 text-muted-foreground/50" />
                  </div>
                )}
                <div className="absolute inset-0 rounded-full bg-black/0 hover:bg-black/30 transition-colors flex items-center justify-center opacity-0 hover:opacity-100">
                  {isUploadingAvatar
                    ? <Loader2 className="h-6 w-6 text-white animate-spin" />
                    : <Camera className="h-6 w-6 text-white" />}
                </div>
              </div>
              <input ref={avatarInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
            </div>

            <div className="flex-1 sm:pb-2">
              <h1 className="text-2xl font-semibold">{name || "Your Name"}</h1>
              {tagline && <p className="text-muted-foreground mt-0.5">{tagline}</p>}
              {location && (
                <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                  <MapPin className="h-3.5 w-3.5" /> {location}
                </p>
              )}
            </div>

            <Button onClick={handleSave} disabled={isSaving} className="sm:self-end">
              {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
              Save Profile
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left column */}
            <div className="lg:col-span-2 space-y-6">
              {/* Basic info */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Basic Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="name">Full Name</Label>
                      <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="tagline">Tagline</Label>
                      <Input id="tagline" value={tagline} onChange={(e) => setTagline(e.target.value)} placeholder="e.g. Lagos' Premier Wedding Planner" />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea
                      id="bio"
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      placeholder="Tell clients about your experience, style, and what makes you unique..."
                      rows={4}
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="location">Location</Label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input id="location" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="e.g. Lagos, Nigeria" className="pl-9" />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="years">Years of Experience</Label>
                      <div className="relative">
                        <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="years"
                          type="number"
                          min="0"
                          max="50"
                          value={yearsExp}
                          onChange={(e) => setYearsExp(e.target.value)}
                          placeholder="e.g. 5"
                          className="pl-9"
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Specializations */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Specializations</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    {specializations.map((spec) => (
                      <Badge key={spec} variant="secondary" className="pr-1 flex items-center gap-1">
                        {spec}
                        <button type="button" onClick={() => removeSpecialization(spec)} className="ml-1 hover:text-destructive">
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                    {specializations.length === 0 && (
                      <p className="text-sm text-muted-foreground">No specializations added yet</p>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Input
                      value={newSpec}
                      onChange={(e) => setNewSpec(e.target.value)}
                      placeholder="Add a specialization..."
                      onKeyDown={(e) => {
                        if (e.key === "Enter") { e.preventDefault(); addSpecialization(newSpec); }
                      }}
                    />
                    <Button type="button" variant="outline" size="icon" onClick={() => addSpecialization(newSpec)}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>

                  <div>
                    <p className="text-xs text-muted-foreground mb-2">Quick add:</p>
                    <div className="flex flex-wrap gap-1.5">
                      {SPECIALIZATION_SUGGESTIONS.filter((s) => !specializations.includes(s)).map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => addSpecialization(s)}
                          className="text-xs border rounded-full px-2.5 py-0.5 hover:bg-muted transition-colors"
                        >
                          + {s}
                        </button>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right column */}
            <div className="space-y-6">
              {/* Contact */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Contact & Links</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="phone">Phone</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+234 800 000 0000" className="pl-9" />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="website">Website</Label>
                    <div className="relative">
                      <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input id="website" value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="https://yourwebsite.com" className="pl-9" />
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-1.5">
                    <Label htmlFor="instagram">Instagram</Label>
                    <div className="relative">
                      <Instagram className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input id="instagram" value={instagram} onChange={(e) => setInstagram(e.target.value)} placeholder="@username" className="pl-9" />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="facebook">Facebook</Label>
                    <div className="relative">
                      <Facebook className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input id="facebook" value={facebook} onChange={(e) => setFacebook(e.target.value)} placeholder="facebook.com/yourpage" className="pl-9" />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="twitter">Twitter / X</Label>
                    <div className="relative">
                      <Twitter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input id="twitter" value={twitter} onChange={(e) => setTwitter(e.target.value)} placeholder="@username" className="pl-9" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Account info */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Account</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm text-muted-foreground">
                  <p>Email: <span className="text-foreground font-medium">{profileData?.user.email || "—"}</span></p>
                  <p>Role: <span className="text-foreground font-medium">Wedding Planner</span></p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PlannerProfilePage;
