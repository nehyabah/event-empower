import { useState } from "react";
import { Link } from "react-router-dom";
import { Heart, Mail, Instagram, Twitter, Facebook, Youtube } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { subscribeToNewsletter } from "@/services/api/publicService";

const Footer = () => {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubscribe = async () => {
    setFeedback(null);
    setError(null);
    if (!email) {
      setError("Email is required");
      return;
    }

    setIsSubmitting(true);
    try {
      await subscribeToNewsletter({ email, source: "footer" });
      setEmail("");
      setFeedback("Subscribed successfully.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to subscribe");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <footer className="bg-secondary pt-20 pb-10">
      <div className="container">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="font-serif text-lg font-medium">àjọyọ̀</span>
            </div>
            <p className="text-muted-foreground mb-6">
              The ultimate Nigerian wedding planning platform, connecting couples with local vendors and resources.
            </p>
            <div className="flex space-x-4">
              <Button variant="ghost" size="icon" className="rounded-full hover:bg-primary/10 hover:text-primary">
                <Instagram className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="icon" className="rounded-full hover:bg-primary/10 hover:text-primary">
                <Twitter className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="icon" className="rounded-full hover:bg-primary/10 hover:text-primary">
                <Facebook className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="icon" className="rounded-full hover:bg-primary/10 hover:text-primary">
                <Youtube className="w-5 h-5" />
              </Button>
            </div>
          </div>

          <div>
            <h3 className="font-serif text-lg font-medium mb-4">Quick Links</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/features" className="text-muted-foreground hover:text-foreground transition-colors">
                  Features
                </Link>
              </li>
              <li>
                <Link to="/pricing" className="text-muted-foreground hover:text-foreground transition-colors">
                  Pricing
                </Link>
              </li>
              <li>
                <Link to="/vendors" className="text-muted-foreground hover:text-foreground transition-colors">
                  Vendor Directory
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-muted-foreground hover:text-foreground transition-colors">
                  Contact Support
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-serif text-lg font-medium mb-4">Subscribe</h3>
            <p className="text-muted-foreground mb-4">
              Get wedding planning tips and updates delivered to your inbox.
            </p>
            {error && <p className="mb-2 text-xs text-red-600">{error}</p>}
            {feedback && <p className="mb-2 text-xs text-green-700">{feedback}</p>}
            <div className="flex gap-2">
              <Input
                placeholder="Your email"
                className="input-elegant"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <Button onClick={handleSubscribe} disabled={isSubmitting}>
                <Mail className="w-4 h-4 mr-2" />
                {isSubmitting ? "..." : "Subscribe"}
              </Button>
            </div>
          </div>
        </div>

        <div className="border-t border-border/50 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-muted-foreground text-sm mb-4 md:mb-0">
            (c) {new Date().getFullYear()} àjọyọ̀. All rights reserved.
          </p>
          <div className="flex space-x-6">
            <Link to="/privacy" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Privacy Policy
            </Link>
            <Link to="/terms" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Terms of Service
            </Link>
            <Link to="/contact" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Contact Support
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
