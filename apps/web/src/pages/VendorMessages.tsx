import { useEffect, useState } from "react";
import Navbar from "@/components/layout/Navbar";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, MessageSquare } from "lucide-react";
import { workspaceEventService, WorkspaceContext } from "@/services/api/workspaceEventService";
import WorkspaceChat from "@/components/workspace/WorkspaceChat";

/**
 * A vendor's weddings, and the group chat for whichever one is selected.
 *
 * Unlike the couple and the planner, a vendor has no existing page scoped to
 * a single wedding - their calendar and dashboard are both organised around
 * their own bookings, not any one couple's workspace. getContexts() already
 * resolves "every wedding this account can act on" for any role, so this
 * page is just that list with a chat panel attached.
 */
const VendorMessages = () => {
  const [contexts, setContexts] = useState<WorkspaceContext[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

  useEffect(() => {
    workspaceEventService
      .getContexts()
      .then((data) => {
        setContexts(data);
        if (data.length === 1) setSelectedEventId(data[0].event_id);
      })
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 pt-24 pb-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto space-y-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-serif font-medium tracking-tight">Messages</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Chat with a couple and their planner about a wedding you're booked on.
              </p>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : contexts.length === 0 ? (
              <Card>
                <CardContent className="py-16 text-center text-muted-foreground">
                  <MessageSquare className="h-10 w-10 mx-auto mb-3 opacity-40" />
                  No weddings yet. Once a couple books you, you'll be able to message them here.
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6 md:grid-cols-[220px_1fr]">
                <div className="flex md:flex-col gap-2 overflow-x-auto md:overflow-visible pb-2 md:pb-0">
                  {contexts.map((ctx) => (
                    <button
                      key={ctx.event_id}
                      onClick={() => setSelectedEventId(ctx.event_id)}
                      className={`shrink-0 text-left rounded-lg border px-3 py-2.5 text-sm transition-colors ${
                        selectedEventId === ctx.event_id
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-card hover:bg-muted"
                      }`}
                    >
                      <p className="font-medium truncate">{ctx.couple_names}</p>
                      {ctx.event_date && (
                        <p
                          className={`text-xs mt-0.5 ${
                            selectedEventId === ctx.event_id ? "opacity-80" : "text-muted-foreground"
                          }`}
                        >
                          {new Date(ctx.event_date).toLocaleDateString(undefined, {
                            month: "short", day: "numeric", year: "numeric",
                          })}
                        </p>
                      )}
                    </button>
                  ))}
                </div>

                <div>
                  {selectedEventId ? (
                    <WorkspaceChat eventId={selectedEventId} />
                  ) : (
                    <div className="flex items-center justify-center rounded-xl border bg-card py-16 text-sm text-muted-foreground">
                      Choose a wedding to open its chat.
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default VendorMessages;
