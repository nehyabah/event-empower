import { useEffect, useMemo, useState } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/home/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { vendorService, VendorDashboard } from "@/services/api/vendorService";
import { Calendar, MessageSquare, Users } from "lucide-react";

const VendorAnalytics = () => {
  const [dashboard, setDashboard] = useState<VendorDashboard | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const fetchDashboard = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await vendorService.getVendorDashboard();
        if (isMounted) {
          setDashboard(data);
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to load analytics";
        if (isMounted) {
          setError(message);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchDashboard();
    return () => {
      isMounted = false;
    };
  }, []);

  const summaryCards = useMemo(() => {
    if (!dashboard) return [];
    return [
      {
        title: "Upcoming Events",
        value: dashboard.stats.upcoming_events,
        description: "Scheduled bookings ahead",
        icon: Calendar,
      },
      {
        title: "Confirmed Events",
        value: dashboard.stats.confirmed_events,
        description: "Locked in bookings",
        icon: Users,
      },
      {
        title: "New Inquiries",
        value: dashboard.stats.inquiries_new,
        description: `${dashboard.stats.inquiries_total} total inquiries`,
        icon: MessageSquare,
      },
    ];
  }, [dashboard]);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-grow pt-20 md:pt-24 pb-16">
        <div className="container mx-auto px-4 space-y-8 md:space-y-10">
          <section>
            <h1 className="font-serif text-2xl md:text-4xl mb-2">Vendor Analytics</h1>
            <p className="text-muted-foreground text-base md:text-lg max-w-2xl">
              Track your booking momentum and inquiry performance.
            </p>
          </section>

          {error && (
            <div className="rounded-lg border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
              {error}
            </div>
          )}

          <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(isLoading ? new Array(3).fill(null) : summaryCards).map((item, index) => (
              <Card key={index}>
                <CardContent className="pt-6">
                  {item ? (
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-1">
                          {item.title}
                        </p>
                        <h3 className="text-3xl font-bold">{item.value}</h3>
                        <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
                      </div>
                      <div className="bg-primary/10 p-3 rounded-full">
                        <item.icon className="w-5 h-5 text-primary" />
                      </div>
                    </div>
                  ) : (
                    <div className="h-20 animate-pulse rounded-md bg-muted" />
                  )}
                </CardContent>
              </Card>
            ))}
          </section>

          <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Inquiry Trend</CardTitle>
                <CardDescription>Recent inquiry volume by week</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-56 rounded-md border border-dashed border-muted-foreground/30 bg-muted/20 flex items-center justify-center text-sm text-muted-foreground">
                  Analytics chart placeholder
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Booking Mix</CardTitle>
                <CardDescription>Confirmed vs pending events</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-56 rounded-md border border-dashed border-muted-foreground/30 bg-muted/20 flex items-center justify-center text-sm text-muted-foreground">
                  Analytics chart placeholder
                </div>
              </CardContent>
            </Card>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default VendorAnalytics;
