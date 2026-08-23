import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Check, Loader2, MapPin, Search, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { vendorService, VendorDetails } from "@/services/api/vendorService";
import { plannerService, WorkspaceVendor } from "@/services/api/plannerService";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clientId: string;
  /** Vendor profile ids already on the roster, so they can't be added twice. */
  existingVendorIds: string[];
  onAdded?: () => void;
}

const STATUSES: Array<{ value: WorkspaceVendor["status"]; label: string }> = [
  { value: "inquired",  label: "Inquired" },
  { value: "quoted",    label: "Quoted" },
  { value: "booked",    label: "Booked" },
  { value: "confirmed", label: "Confirmed" },
];

/**
 * Put a vendor on a client's roster.
 *
 * The roster is what connects a vendor to a couple: once listed, the vendor can
 * schedule against this wedding and becomes taggable on shared calendar events.
 */
export const AddVendorToRosterDialog = ({
  open, onOpenChange, clientId, existingVendorIds, onAdded,
}: Props) => {
  const [vendors, setVendors] = useState<VendorDetails[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<VendorDetails | null>(null);
  const [status, setStatus] = useState<WorkspaceVendor["status"]>("inquired");
  const [amount, setAmount] = useState("");

  useEffect(() => {
    if (!open) return;
    setIsLoading(true);
    setSearch(""); setSelected(null); setStatus("inquired"); setAmount("");
    vendorService.getVendors()
      .then(setVendors)
      .catch(() => toast.error("Couldn't load the vendor directory"))
      .finally(() => setIsLoading(false));
  }, [open]);

  const already = useMemo(() => new Set(existingVendorIds), [existingVendorIds]);

  const results = useMemo(() => {
    const q = search.trim().toLowerCase();
    return vendors
      .filter((v) => !already.has(v.profile.id))
      .filter((v) =>
        !q ||
        v.profile.business_name?.toLowerCase().includes(q) ||
        v.profile.category?.toLowerCase().includes(q) ||
        v.profile.location?.toLowerCase().includes(q))
      .slice(0, 40);
  }, [vendors, search, already]);

  const handleAdd = async () => {
    if (!selected) return;
    setIsSaving(true);
    try {
      const parsed = Number(amount);
      await plannerService.addClientProjectVendor(clientId, {
        vendorProfileId: selected.profile.id,
        category: selected.profile.category || undefined,
        status,
        amount: Number.isFinite(parsed) && amount !== "" ? parsed : undefined,
      });
      toast.success(`${selected.profile.business_name} added to the roster`);
      onOpenChange(false);
      onAdded?.();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to add vendor");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[560px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add a vendor</DialogTitle>
          <DialogDescription>
            Once on the roster, this vendor can schedule against the wedding and
            be tagged on shared calendar events.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="pl-9"
              placeholder="Search by name, category or location…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : results.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              {vendors.length === 0
                ? "No vendors in the directory yet."
                : already.size > 0 && !search
                  ? "Every vendor in the directory is already on this roster."
                  : "No vendors match that search."}
            </p>
          ) : (
            <div className="max-h-[260px] space-y-1.5 overflow-y-auto pr-1">
              {results.map((v) => {
                const on = selected?.profile.id === v.profile.id;
                return (
                  <button
                    key={v.profile.id}
                    type="button"
                    onClick={() => setSelected(v)}
                    aria-pressed={on}
                    className={`flex w-full items-center gap-3 rounded-lg border px-3 py-2.5 text-left transition-colors ${
                      on ? "border-primary bg-primary/5" : "hover:bg-muted/50"
                    }`}
                  >
                    <span
                      className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${
                        on ? "border-primary bg-primary text-primary-foreground" : "border-muted-foreground/40"
                      }`}
                    >
                      {on && <Check className="h-2.5 w-2.5" />}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium">
                        {v.profile.business_name}
                      </span>
                      <span className="flex items-center gap-2 text-xs text-muted-foreground">
                        {v.profile.category && <span className="capitalize">{v.profile.category}</span>}
                        {v.profile.location && (
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />{v.profile.location}
                          </span>
                        )}
                        {Number(v.profile.rating) > 0 && (
                          <span className="flex items-center gap-1">
                            <Star className="h-3 w-3 fill-current" />{v.profile.rating}
                          </span>
                        )}
                      </span>
                    </span>
                    {v.profile.is_verified && (
                      <Badge variant="secondary" className="shrink-0 text-[10px]">Verified</Badge>
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {selected && (
            <div className="grid gap-4 rounded-lg border bg-muted/30 p-3 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={status} onValueChange={(v) => setStatus(v as WorkspaceVendor["status"])}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {STATUSES.map((s) => (
                      <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="roster-amount">Agreed amount (₦)</Label>
                <Input
                  id="roster-amount"
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Optional"
                />
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleAdd} disabled={!selected || isSaving}>
            {isSaving ? "Adding…" : "Add to roster"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddVendorToRosterDialog;
