import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import { updateAdminUserNotes } from "@/services/api/adminService";

/**
 * Internal notes, written while reviewing rather than after deciding.
 *
 * The admin_notes column and its endpoint already existed, but were only
 * reachable from the user detail page — so a half-finished review of a vendor
 * or planner had nowhere to record "waiting on them to add photos", and
 * whoever picked it up next started from nothing.
 *
 * Never shown to the applicant.
 */
const ReviewNotes = ({
  userId,
  initialNotes,
}: {
  /** The account id, not a vendor_profiles id — notes live on users. */
  userId: string | null | undefined;
  initialNotes: string | null;
}) => {
  const [notes, setNotes] = useState(initialNotes ?? "");
  const [isSaving, setIsSaving] = useState(false);
  const [savedNotes, setSavedNotes] = useState(initialNotes ?? "");

  // The page usually renders before the fetch resolves, so seed from props
  // once they arrive rather than leaving the box stuck empty.
  useEffect(() => {
    setNotes(initialNotes ?? "");
    setSavedNotes(initialNotes ?? "");
  }, [initialNotes]);

  const dirty = notes !== savedNotes;

  const save = async () => {
    if (!userId) return;
    setIsSaving(true);
    try {
      await updateAdminUserNotes(userId, notes);
      setSavedNotes(notes);
      toast.success("Notes saved");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save notes");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Internal notes</CardTitle>
        <p className="text-sm text-muted-foreground">
          Only visible to admins. Use it to record what you checked, or what you are
          waiting on.
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        <Textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="e.g. Instagram checked, looks legitimate. Waiting on them to add photos before approving."
          rows={4}
          disabled={!userId}
        />
        <div className="flex items-center gap-3">
          <Button onClick={save} disabled={!userId || isSaving || !dirty} size="sm">
            {isSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
            Save notes
          </Button>
          {dirty && !isSaving && (
            <span className="text-xs text-amber-700">Unsaved changes</span>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ReviewNotes;
