import { useEffect, useState } from "react";
import { toast } from "sonner";
import Navbar from "@/components/layout/Navbar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Loader2, Mail, Bell, Lock } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import userService from "@/services/api/userService";

/**
 * Account settings: name, email, and which optional email categories to
 * receive.
 *
 * Login codes, password resets and booking updates are never listed as a
 * toggle here - they are the account functioning, not a preference, and
 * nothing in the backend gates them on these three columns. Only reminders,
 * product updates and the newsletter are actually optional.
 */

const Settings = () => {
  const { user, updateUser } = useAuth();

  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [notifyReminders, setNotifyReminders] = useState(true);
  const [notifyProductUpdates, setNotifyProductUpdates] = useState(true);
  const [notifyNewsletter, setNotifyNewsletter] = useState(false);

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    // The session object from login never carries these preference fields,
    // so the page fetches its own current values rather than assuming
    // defaults are still accurate.
    userService
      .getMyAccount()
      .then((account) => {
        if (cancelled) return;
        setName(account.name || "");
        setEmail(account.email || "");
        setNotifyReminders(account.notifyReminders ?? true);
        setNotifyProductUpdates(account.notifyProductUpdates ?? true);
        setNotifyNewsletter(account.notifyNewsletter ?? false);
      })
      .catch(() => {
        // Session data is enough to show a usable form even if this fails.
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateUser({
        name: name.trim(),
        email: email.trim(),
        notifyReminders,
        notifyProductUpdates,
        notifyNewsletter,
      });
      toast.success("Settings saved");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save settings");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 pt-24 pb-16">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto space-y-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-serif font-medium tracking-tight">Settings</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Manage your account details and email preferences.
              </p>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Lock className="h-4 w-4" />
                      Account
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="settings-name">Name</Label>
                      <Input
                        id="settings-name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Your name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="settings-email">Email</Label>
                      <Input
                        id="settings-email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                      />
                      <p className="text-xs text-muted-foreground">
                        Used to sign in and to receive login codes and booking updates.
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Bell className="h-4 w-4" />
                      Email notifications
                    </CardTitle>
                    <CardDescription className="flex items-start gap-2 pt-1">
                      <Mail className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                      <span>
                        Sign-in codes, password resets and booking updates are always sent —
                        turning these off only affects the emails below.
                      </span>
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-1">
                    <div className="flex items-center justify-between py-3">
                      <div className="pr-4">
                        <p className="text-sm font-medium">Reminders</p>
                        <p className="text-xs text-muted-foreground">
                          Nudges about your wedding planning, like upcoming deadlines.
                        </p>
                      </div>
                      <Switch checked={notifyReminders} onCheckedChange={setNotifyReminders} />
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between py-3">
                      <div className="pr-4">
                        <p className="text-sm font-medium">Product updates</p>
                        <p className="text-xs text-muted-foreground">
                          New features and improvements to àjọyọ.
                        </p>
                      </div>
                      <Switch checked={notifyProductUpdates} onCheckedChange={setNotifyProductUpdates} />
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between py-3">
                      <div className="pr-4">
                        <p className="text-sm font-medium">Newsletter</p>
                        <p className="text-xs text-muted-foreground">
                          Occasional wedding planning tips and stories.
                        </p>
                      </div>
                      <Switch checked={notifyNewsletter} onCheckedChange={setNotifyNewsletter} />
                    </div>
                  </CardContent>
                </Card>

                <div className="flex justify-end">
                  <Button onClick={handleSave} disabled={isSaving}>
                    {isSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                    Save changes
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Settings;
