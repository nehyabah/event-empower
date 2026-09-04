import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ChevronDown, ChevronUp, Loader2, Pencil, Plus, Trash2, X } from "lucide-react";
import ImageField from "./ImageField";

/**
 * Add, edit, reorder and remove the entries behind a list-backed section.
 *
 * Timeline, wedding party, travel, FAQ and the gallery are all the same
 * shape — a list of records with a few fields each — so they share one
 * implementation described by a spec rather than five near-identical editors
 * that drift.
 */

export interface ListFieldSpec {
  key: string;
  label: string;
  placeholder?: string;
  multiline?: boolean;
  /** "image" renders a file picker; anything else is passed to <input type>. */
  type?: string;
  /**
   * Fixed choices. Use this wherever the column is constrained — free text into
   * a CHECK constraint is how "Bride" reached a column that only accepts
   * lowercase and took the API down.
   */
  options?: { value: string; label: string }[];
  required?: boolean;
}

export interface ListSectionSpec<T> {
  /** What one entry is called, e.g. "moment". Used in buttons and prompts. */
  noun: string;
  fields: ListFieldSpec[];
  /** Headline for an existing row. */
  primary: (item: T) => string;
  /** Optional second line for an existing row. */
  secondary?: (item: T) => string | null;
  add: (values: Record<string, string>) => Promise<unknown>;
  update?: (id: string, values: Record<string, string>) => Promise<unknown>;
  remove: (id: string) => Promise<unknown>;
  /** Absent when a section has no meaningful order. */
  reorder?: (ids: string[]) => Promise<unknown>;
}

interface ListSectionEditorProps<T extends { id: string }> {
  items: T[];
  spec: ListSectionSpec<T>;
  onChanged: () => void | Promise<void>;
}

const ListSectionEditor = <T extends { id: string }>({
  items,
  spec,
  onChanged,
}: ListSectionEditorProps<T>) => {
  const [draft, setDraft] = useState<Record<string, string> | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isBusy, setIsBusy] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<T | null>(null);

  const blank = () => Object.fromEntries(spec.fields.map((f) => [f.key, ""]));

  const startAdd = () => {
    setEditingId(null);
    setDraft(blank());
  };

  const startEdit = (item: T) => {
    const values = blank();
    for (const f of spec.fields) {
      const v = (item as unknown as Record<string, unknown>)[f.key];
      values[f.key] = v == null ? "" : String(v);
      // <input type="date"> only accepts YYYY-MM-DD; an ISO timestamp shows
      // as blank with no error.
      if (f.type === "date" && values[f.key]) values[f.key] = values[f.key].split("T")[0];
    }
    setEditingId(item.id);
    setDraft(values);
  };

  const missingRequired = draft
    ? spec.fields.filter((f) => f.required && !(draft[f.key] ?? "").trim())
    : [];

  const save = async () => {
    if (!draft || missingRequired.length > 0) return;
    setIsBusy(true);
    try {
      if (editingId && spec.update) {
        await spec.update(editingId, draft);
      } else {
        await spec.add(draft);
      }
      setDraft(null);
      setEditingId(null);
      await onChanged();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : `Could not save this ${spec.noun}`);
    } finally {
      setIsBusy(false);
    }
  };

  const doDelete = async (item: T) => {
    setIsBusy(true);
    try {
      await spec.remove(item.id);
      await onChanged();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not remove it");
    } finally {
      setIsBusy(false);
      setConfirmDelete(null);
    }
  };

  const move = async (index: number, delta: number) => {
    if (!spec.reorder) return;
    const to = index + delta;
    if (to < 0 || to >= items.length) return;
    const ids = items.map((i) => i.id);
    const [moved] = ids.splice(index, 1);
    ids.splice(to, 0, moved);
    setIsBusy(true);
    try {
      await spec.reorder(ids);
      await onChanged();
    } catch {
      toast.error("Could not reorder");
    } finally {
      setIsBusy(false);
    }
  };

  return (
    <div className="space-y-3">
      {items.length === 0 && !draft && (
        <p className="text-sm text-muted-foreground">
          Nothing here yet. Add your first {spec.noun}.
        </p>
      )}

      {items.length > 0 && (
        <div className="divide-y rounded-lg border">
          {items.map((item, index) => (
            <div key={item.id} className="flex items-start gap-2 p-3">
              {spec.reorder && (
                <div className="flex flex-col shrink-0 -my-1">
                  <button
                    onClick={() => move(index, -1)}
                    disabled={index === 0 || isBusy}
                    className="p-0.5 text-muted-foreground disabled:opacity-25 hover:text-foreground"
                    aria-label="Move up"
                  >
                    <ChevronUp className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => move(index, 1)}
                    disabled={index === items.length - 1 || isBusy}
                    className="p-0.5 text-muted-foreground disabled:opacity-25 hover:text-foreground"
                    aria-label="Move down"
                  >
                    <ChevronDown className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}

              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{spec.primary(item)}</p>
                {spec.secondary?.(item) && (
                  <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                    {spec.secondary(item)}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-0.5 shrink-0">
                {spec.update && (
                  <button
                    onClick={() => startEdit(item)}
                    className="p-1.5 text-muted-foreground hover:text-foreground"
                    aria-label={`Edit this ${spec.noun}`}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                )}
                <button
                  onClick={() => setConfirmDelete(item)}
                  className="p-1.5 text-muted-foreground hover:text-destructive"
                  aria-label={`Remove this ${spec.noun}`}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {draft ? (
        <div className="rounded-lg border p-4 space-y-3 bg-muted/20">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">
              {editingId ? `Edit ${spec.noun}` : `New ${spec.noun}`}
            </p>
            <button
              onClick={() => { setDraft(null); setEditingId(null); }}
              className="p-1 text-muted-foreground hover:text-foreground"
              aria-label="Cancel"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {spec.fields.map((f) => (
            <div key={f.key} className="space-y-1.5">
              <Label htmlFor={`l-${f.key}`}>
                {f.label}
                {f.required && <span className="text-muted-foreground font-normal"> (required)</span>}
              </Label>
              {f.type === "image" ? (
                <ImageField
                  value={draft[f.key] ?? ""}
                  label={f.label}
                  onChange={(url) => setDraft((d) => ({ ...d!, [f.key]: url }))}
                />
              ) : f.options ? (
                <select
                  id={`l-${f.key}`}
                  value={draft[f.key] ?? ""}
                  onChange={(e) => setDraft((d) => ({ ...d!, [f.key]: e.target.value }))}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base md:text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  {f.options.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              ) : f.multiline ? (
                <Textarea
                  id={`l-${f.key}`}
                  rows={3}
                  value={draft[f.key] ?? ""}
                  placeholder={f.placeholder}
                  onChange={(e) => setDraft((d) => ({ ...d!, [f.key]: e.target.value }))}
                />
              ) : (
                <Input
                  id={`l-${f.key}`}
                  type={f.type}
                  value={draft[f.key] ?? ""}
                  placeholder={f.placeholder}
                  onChange={(e) => setDraft((d) => ({ ...d!, [f.key]: e.target.value }))}
                />
              )}
            </div>
          ))}

          <Button onClick={save} disabled={isBusy || missingRequired.length > 0} size="sm">
            {isBusy ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
            {editingId ? "Save changes" : `Add ${spec.noun}`}
          </Button>
        </div>
      ) : (
        <Button variant="outline" size="sm" onClick={startAdd} disabled={isBusy}>
          <Plus className="h-4 w-4 mr-1.5" />
          Add {spec.noun}
        </Button>
      )}

      <AlertDialog open={!!confirmDelete} onOpenChange={(o) => !o && setConfirmDelete(null)}>
        <AlertDialogContent className="sm:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>
              Remove this {spec.noun}?
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirmDelete ? spec.primary(confirmDelete) : ""} will be removed from your
              wedding site. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => confirmDelete && doDelete(confirmDelete)}
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ListSectionEditor;
