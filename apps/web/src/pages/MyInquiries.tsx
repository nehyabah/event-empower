import { useEffect, useState } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/home/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Clock, Building, Calendar, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { vendorService, ClientInquiry } from "@/services/api/vendorService";
import InquiryDetailModal from "@/components/vendors/InquiryDetailModal";

const MyInquiries = () => {
  const [inquiries, setInquiries] = useState<ClientInquiry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedInquiryId, setSelectedInquiryId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchInquiries = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await vendorService.listMyInquiries();
        setInquiries(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load inquiries");
      } finally {
        setIsLoading(false);
      }
    };

    fetchInquiries();
  }, []);

  const handleOpenInquiry = (inquiryId: string) => {
    setSelectedInquiryId(inquiryId);
    setIsModalOpen(true);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getStatusBadge = (status: string, unreadCount: number) => {
    if (unreadCount > 0) {
      return (
        <Badge variant="default" className="bg-primary">
          {unreadCount} new {unreadCount === 1 ? "reply" : "replies"}
        </Badge>
      );
    }
    switch (status) {
      case "new":
        return <Badge variant="outline">Awaiting Reply</Badge>;
      case "replied":
        return <Badge variant="secondary">Replied</Badge>;
      case "archived":
        return <Badge variant="outline" className="text-muted-foreground">Archived</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow pt-20 md:pt-24 pb-16">
        <div className="container mx-auto px-4 space-y-8">
          {/* Header */}
          <section className="text-center md:text-left">
            <div className="flex items-center gap-4 mb-4">
              <Link to="/home">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Home
                </Button>
              </Link>
            </div>
            <h1 className="font-serif text-2xl md:text-4xl mb-2">My Inquiries</h1>
            <p className="text-muted-foreground text-base md:text-lg max-w-2xl">
              View and manage your conversations with vendors. Track responses and continue discussions.
            </p>
          </section>

          {/* Inquiries List */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Vendor Inquiries
              </CardTitle>
              <CardDescription>
                {inquiries.length === 0
                  ? "You haven't sent any inquiries yet"
                  : `You have ${inquiries.length} ${inquiries.length === 1 ? "inquiry" : "inquiries"}`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-12 text-muted-foreground">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                  Loading your inquiries...
                </div>
              ) : error ? (
                <div className="text-center py-12 text-destructive">
                  {error}
                </div>
              ) : inquiries.length === 0 ? (
                <div className="text-center py-12">
                  <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-medium text-lg mb-2">No inquiries yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Start browsing vendors and send them inquiries about their services.
                  </p>
                  <Link to="/vendors">
                    <Button>Browse Vendors</Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {inquiries.map((inquiry) => (
                    <div
                      key={inquiry.id}
                      className="border rounded-lg p-4 cursor-pointer hover:bg-muted/50 transition-colors"
                      onClick={() => handleOpenInquiry(inquiry.id)}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-4 flex-1 min-w-0">
                          <div className={`p-3 rounded-full flex-shrink-0 ${
                            inquiry.unread_count > 0 ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                          }`}>
                            <Building className="h-5 w-5" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="font-semibold">{inquiry.vendor_name}</h3>
                              {getStatusBadge(inquiry.status, inquiry.unread_count)}
                            </div>
                            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                              {inquiry.message}
                            </p>
                            <div className="flex items-center gap-4 mt-2 flex-wrap">
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Clock className="h-3 w-3" />
                                <span>Sent {formatDate(inquiry.created_at)}</span>
                              </div>
                              {inquiry.event_date && (
                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                  <Calendar className="h-3 w-3" />
                                  <span>Event: {formatDate(inquiry.event_date)}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        <Button variant="outline" size="sm" className="flex-shrink-0">
                          View
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Info Section */}
          {inquiries.length > 0 && (
            <Card className="bg-muted/50">
              <CardContent className="pt-6">
                <h3 className="font-medium mb-2">Tips for communicating with vendors</h3>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>Be specific about your event date and requirements</li>
                  <li>Ask about availability and pricing early</li>
                  <li>Request references or portfolio samples</li>
                  <li>Discuss payment terms and cancellation policies</li>
                </ul>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
      <Footer />

      <InquiryDetailModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        inquiryId={selectedInquiryId}
        mode="client"
      />
    </div>
  );
};

export default MyInquiries;
