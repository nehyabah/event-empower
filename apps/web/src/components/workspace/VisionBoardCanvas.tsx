import { useEffect, useRef, useState, useCallback, type CSSProperties } from "react";
import { toast } from "sonner";
import { ImageIcon, StickyNote, Sparkles, Pin, PinOff, Trash2 } from "lucide-react";
import {
  visionBoardService,
  VisionBoardItem,
  VisionBoardColor,
  VisionBoardItemType,
  CreateItemInput,
  UpdateItemInput,
} from "@/services/api/visionBoardService";

export interface VisionBoardServiceApi {
  list(): Promise<VisionBoardItem[]>;
  create(input: CreateItemInput): Promise<VisionBoardItem>;
  update(id: string, input: UpdateItemInput): Promise<VisionBoardItem>;
  remove(id: string): Promise<void>;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const CANVAS_W = 3200;
const CANVAS_H = 2200;

export const CATEGORIES = [
  { id: "cake",     label: "Cake",      emoji: "🎂" },
  { id: "venue",    label: "Venue",     emoji: "🏛️" },
  { id: "decor",    label: "Decor",     emoji: "🌸" },
  { id: "florals",  label: "Florals",   emoji: "💐" },
  { id: "attire",   label: "Attire",    emoji: "👗" },
  { id: "music",    label: "Music",     emoji: "🎵" },
  { id: "catering", label: "Catering",  emoji: "🍽️" },
  { id: "colours",  label: "Colours",   emoji: "🎨" },
  { id: "other",    label: "Other",     emoji: "✨" },
];

export const COLOR_MAP: Record<VisionBoardColor, { bg: string; border: string; label: string }> = {
  cream:    { bg: "#faf9f7", border: "#e8e4df", label: "Cream"    },
  blush:    { bg: "#fde8e0", border: "#f5c9bc", label: "Blush"    },
  sage:     { bg: "#e8f0e8", border: "#c5d9c5", label: "Sage"     },
  lavender: { bg: "#ede8f5", border: "#d4c9eb", label: "Lavender" },
  gold:     { bg: "#fdf3e0", border: "#f0daa0", label: "Gold"     },
  sky:      { bg: "#e0f0fd", border: "#b8ddf7", label: "Sky"      },
  charcoal: { bg: "#2e3240", border: "#1a1e2a", label: "Charcoal" },
};

const DEFAULT_SIZES: Record<VisionBoardItemType, { w: number; h: number }> = {
  note:    { w: 240, h: 180 },
  image:   { w: 260, h: 280 },
  concept: { w: 220, h: 160 },
};

interface DragState {
  id: string;
  startMouseX: number;
  startMouseY: number;
  startItemX: number;
  startItemY: number;
}

interface Props {
  filter?: string | null;
  service?: VisionBoardServiceApi;
}

// ─── Component ────────────────────────────────────────────────────────────────

export const VisionBoardCanvas = ({ filter = null, service }: Props) => {
  const svc = service ?? visionBoardService;
  const scrollRef = useRef<HTMLDivElement>(null);
  const [items, setItems] = useState<VisionBoardItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [activeFilter, setActiveFilter] = useState<string | null>(filter);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [addingImageUrl, setAddingImageUrl] = useState<string | null>(null);
  const [pendingImageUrl, setPendingImageUrl] = useState("");
  const dragRef = useRef<DragState | null>(null);

  useEffect(() => {
    svc.list()
      .then(setItems)
      .catch(() => setLoadError(true))
      .finally(() => setLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const addItem = useCallback(async (type: VisionBoardItemType) => {
    const scroll = scrollRef.current;
    const cx = scroll ? scroll.scrollLeft + scroll.clientWidth / 2 : 400;
    const cy = scroll ? scroll.scrollTop  + scroll.clientHeight / 2 : 300;
    const { w, h } = DEFAULT_SIZES[type];
    const jitter = () => (Math.random() - 0.5) * 120;
    try {
      const item = await svc.create({
        type,
        position_x: Math.max(20, cx - w / 2 + jitter()),
        position_y: Math.max(20, cy - h / 2 + jitter()),
        width: w, height: h,
        color: type === "concept" ? "gold" : "cream",
      });
      setItems(prev => [...prev, item]);
      setEditingId(item.id);
      setEditTitle(item.title ?? "");
      setEditContent(item.content ?? "");
      if (type === "image") setAddingImageUrl(item.id);
    } catch {
      toast.error("Failed to add item");
    }
  }, []);

  const commitEdit = useCallback(async (id: string) => {
    setEditingId(null);
    try {
      const updated = await svc.update(id, { title: editTitle || null, content: editContent || null });
      setItems(prev => prev.map(i => i.id === id ? updated : i));
    } catch { toast.error("Failed to save"); }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editTitle, editContent, svc]);

  const commitImageUrl = useCallback(async (id: string) => {
    setAddingImageUrl(null);
    const url = pendingImageUrl.trim();
    setPendingImageUrl("");
    if (!url) return;
    try {
      const updated = await svc.update(id, { content: url });
      setItems(prev => prev.map(i => i.id === id ? updated : i));
    } catch { toast.error("Failed to save image"); }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingImageUrl, svc]);

  const changeColor = useCallback(async (id: string, color: VisionBoardColor) => {
    setItems(prev => prev.map(i => i.id === id ? { ...i, color } : i));
    svc.update(id, { color }).catch(() => {});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [svc]);

  const changeCategory = useCallback(async (id: string, category: string) => {
    setItems(prev => prev.map(i => i.id === id ? { ...i, category } : i));
    svc.update(id, { category }).catch(() => {});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [svc]);

  const togglePin = useCallback(async (id: string, pinned: boolean) => {
    setItems(prev => prev.map(i => i.id === id ? { ...i, pinned } : i));
    svc.update(id, { pinned }).catch(() => {});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [svc]);

  const deleteItem = useCallback(async (id: string) => {
    setItems(prev => prev.filter(i => i.id !== id));
    svc.remove(id).catch(() => toast.error("Failed to delete"));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [svc]);

  const onPointerDown = useCallback((e: React.PointerEvent, item: VisionBoardItem) => {
    if (item.pinned || editingId === item.id) return;
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    dragRef.current = { id: item.id, startMouseX: e.clientX, startMouseY: e.clientY, startItemX: item.position_x, startItemY: item.position_y };
  }, [editingId]);

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    const d = dragRef.current;
    if (!d) return;
    const dx = e.clientX - d.startMouseX;
    const dy = e.clientY - d.startMouseY;
    setItems(prev => prev.map(i =>
      i.id === d.id ? { ...i, position_x: Math.max(0, d.startItemX + dx), position_y: Math.max(0, d.startItemY + dy) } : i
    ));
  }, []);

  const onPointerUp = useCallback(async (_e: React.PointerEvent) => {
    const d = dragRef.current;
    if (!d) return;
    dragRef.current = null;
    const moved = items.find(i => i.id === d.id);
    if (moved) svc.update(d.id, { position_x: moved.position_x, position_y: moved.position_y }).catch(() => {});
  }, [items]);

  const visible = activeFilter ? items.filter(i => i.category === activeFilter) : items;

  // ─── Item render ──────────────────────────────────────────────────────────

  const renderItem = (item: VisionBoardItem) => {
    const { bg, border } = COLOR_MAP[item.color] ?? COLOR_MAP.cream;
    const isEditing = editingId === item.id;
    const isDark = item.color === "charcoal";
    const textColor = isDark ? "#ffffff" : "#2e3240";
    const mutedColor = isDark ? "rgba(255,255,255,0.55)" : "#9ca3af";
    const cat = CATEGORIES.find(c => c.id === item.category);

    return (
      <div key={item.id} style={{ position: "absolute", left: item.position_x, top: item.position_y, width: item.width, zIndex: isEditing ? 50 : item.pinned ? 1 : 10, cursor: item.pinned ? "default" : isEditing ? "default" : "grab", userSelect: "none" }}
        onPointerDown={e => onPointerDown(e, item)} onPointerMove={onPointerMove} onPointerUp={onPointerUp}>
        <div style={{ background: bg, border: `1.5px solid ${border}`, borderRadius: 12, boxShadow: isEditing ? "0 8px 30px rgba(0,0,0,0.15)" : "0 2px 8px rgba(0,0,0,0.08)", overflow: "hidden", transition: "box-shadow 0.15s" }}>

          {/* Header */}
          <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 10px 6px", borderBottom: `1px solid ${border}` }}>
            <span style={{ fontSize: 13, opacity: 0.5 }}>{item.type === "note" ? "📝" : item.type === "image" ? "🖼️" : "✨"}</span>
            <select value={item.category ?? ""} onChange={e => changeCategory(item.id, e.target.value)} onPointerDown={e => e.stopPropagation()}
              style={{ fontSize: 11, color: mutedColor, background: "transparent", border: "none", outline: "none", cursor: "pointer", flex: 1, minWidth: 0 }}>
              <option value="">No category</option>
              {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.emoji} {c.label}</option>)}
            </select>
            {item.added_by_name && (
              <span title={`Added by ${item.added_by_name}`} style={{ fontSize: 10, color: mutedColor, whiteSpace: "nowrap", maxWidth: 64, overflow: "hidden", textOverflow: "ellipsis", flexShrink: 0 }}>
                {item.added_by_name.split(" ")[0]}
              </span>
            )}
            <button title={item.pinned ? "Unpin" : "Pin"} onPointerDown={e => e.stopPropagation()} onClick={() => togglePin(item.id, !item.pinned)}
              style={{ background: "none", border: "none", cursor: "pointer", padding: 2, color: mutedColor, opacity: item.pinned ? 1 : 0.5 }}>
              {item.pinned ? <Pin size={12} /> : <PinOff size={12} />}
            </button>
            <button title="Delete" onPointerDown={e => e.stopPropagation()} onClick={() => deleteItem(item.id)}
              style={{ background: "none", border: "none", cursor: "pointer", padding: 2, color: "#ef4444", opacity: 0.6 }}>
              <Trash2 size={12} />
            </button>
          </div>

          {/* Body */}
          <div style={{ padding: "10px 12px 12px" }}>
            {/* NOTE */}
            {item.type === "note" && (isEditing ? (
              <div onPointerDown={e => e.stopPropagation()}>
                <input autoFocus placeholder="Title (optional)" value={editTitle} onChange={e => setEditTitle(e.target.value)}
                  style={{ width: "100%", background: "transparent", border: "none", outline: "none", fontSize: 13, fontWeight: 600, color: textColor, marginBottom: 6 }} />
                <textarea placeholder="Write your note..." value={editContent} onChange={e => setEditContent(e.target.value)}
                  style={{ width: "100%", background: "transparent", border: "none", outline: "none", fontSize: 13, color: textColor, resize: "none", minHeight: 80, lineHeight: 1.6 }} />
                <div style={{ display: "flex", gap: 6, marginTop: 8, flexWrap: "wrap", alignItems: "center" }}>
                  {(Object.keys(COLOR_MAP) as VisionBoardColor[]).map(c => (
                    <button key={c} onClick={() => changeColor(item.id, c)} style={{ width: 18, height: 18, borderRadius: "50%", background: COLOR_MAP[c].bg, border: `2px solid ${item.color === c ? "#b2834c" : COLOR_MAP[c].border}`, cursor: "pointer" }} />
                  ))}
                  <button onClick={() => commitEdit(item.id)} style={{ marginLeft: "auto", background: "#b2834c", color: "#fff", border: "none", borderRadius: 6, padding: "2px 10px", fontSize: 12, cursor: "pointer" }}>Done</button>
                </div>
              </div>
            ) : (
              <div onDoubleClick={() => { setEditingId(item.id); setEditTitle(item.title ?? ""); setEditContent(item.content ?? ""); }} onPointerDown={e => e.stopPropagation()} style={{ cursor: "text", minHeight: 60 }}>
                {item.title && <p style={{ margin: "0 0 4px", fontSize: 13, fontWeight: 600, color: textColor }}>{item.title}</p>}
                <p style={{ margin: 0, fontSize: 13, color: item.content ? textColor : mutedColor, lineHeight: 1.6, whiteSpace: "pre-wrap" }}>{item.content || "Double-click to edit…"}</p>
              </div>
            ))}

            {/* IMAGE */}
            {item.type === "image" && (addingImageUrl === item.id ? (
              <div onPointerDown={e => e.stopPropagation()}>
                <p style={{ margin: "0 0 6px", fontSize: 12, color: mutedColor }}>Paste an image URL</p>
                <input autoFocus placeholder="https://..." value={pendingImageUrl} onChange={e => setPendingImageUrl(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter") commitImageUrl(item.id); }}
                  style={{ width: "100%", padding: "6px 8px", fontSize: 13, borderRadius: 6, border: "1px solid #e8e4df", outline: "none", background: "#fff", boxSizing: "border-box" }} />
                <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
                  <button onClick={() => commitImageUrl(item.id)} style={{ flex: 1, background: "#b2834c", color: "#fff", border: "none", borderRadius: 6, padding: "6px", fontSize: 12, cursor: "pointer" }}>Add image</button>
                  <button onClick={() => { setAddingImageUrl(null); setPendingImageUrl(""); }} style={{ background: "#f3f4f6", border: "none", borderRadius: 6, padding: "6px 10px", fontSize: 12, cursor: "pointer" }}>Skip</button>
                </div>
              </div>
            ) : item.content ? (
              <>
                <div onPointerDown={e => e.stopPropagation()} style={{ marginBottom: 8, borderRadius: 8, overflow: "hidden" }}>
                  <img src={item.content} alt={item.title ?? "Vision"} style={{ width: "100%", display: "block", objectFit: "cover", maxHeight: 180, borderRadius: 8 }} onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
                </div>
                {isEditing ? (
                  <div onPointerDown={e => e.stopPropagation()}>
                    <input autoFocus placeholder="Caption (optional)" value={editTitle} onChange={e => setEditTitle(e.target.value)}
                      style={{ width: "100%", background: "transparent", border: "none", outline: "none", fontSize: 12, color: textColor, marginBottom: 4 }} />
                    <button onClick={() => { setAddingImageUrl(item.id); setPendingImageUrl(item.content ?? ""); }} style={{ fontSize: 11, color: "#b2834c", background: "none", border: "none", cursor: "pointer", padding: 0, marginBottom: 4 }}>Change image</button><br />
                    <button onClick={() => commitEdit(item.id)} style={{ background: "#b2834c", color: "#fff", border: "none", borderRadius: 6, padding: "4px 12px", fontSize: 12, cursor: "pointer", marginTop: 4 }}>Done</button>
                  </div>
                ) : (
                  <p onDoubleClick={() => { setEditingId(item.id); setEditTitle(item.title ?? ""); setEditContent(item.content ?? ""); }} onPointerDown={e => e.stopPropagation()}
                    style={{ margin: 0, fontSize: 12, color: item.title ? textColor : mutedColor, cursor: "text" }}>
                    {item.title || "Double-click to add caption"}
                  </p>
                )}
              </>
            ) : (
              <div onPointerDown={e => e.stopPropagation()} onClick={() => setAddingImageUrl(item.id)}
                style={{ minHeight: 100, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 6, cursor: "pointer", opacity: 0.5 }}>
                <ImageIcon size={28} color={mutedColor} />
                <p style={{ margin: 0, fontSize: 12, color: mutedColor }}>Click to add image</p>
              </div>
            ))}

            {/* CONCEPT */}
            {item.type === "concept" && (isEditing ? (
              <div onPointerDown={e => e.stopPropagation()}>
                <input autoFocus placeholder="Concept title" value={editTitle} onChange={e => setEditTitle(e.target.value)}
                  style={{ width: "100%", background: "transparent", border: "none", outline: "none", fontSize: 14, fontWeight: 600, color: textColor, marginBottom: 6 }} />
                <textarea placeholder="Describe the vibe, mood, or details…" value={editContent} onChange={e => setEditContent(e.target.value)}
                  style={{ width: "100%", background: "transparent", border: "none", outline: "none", fontSize: 12, color: textColor, resize: "none", minHeight: 60, lineHeight: 1.6 }} />
                <div style={{ display: "flex", gap: 6, marginTop: 8, flexWrap: "wrap", alignItems: "center" }}>
                  {(Object.keys(COLOR_MAP) as VisionBoardColor[]).map(c => (
                    <button key={c} onClick={() => changeColor(item.id, c)} style={{ width: 18, height: 18, borderRadius: "50%", background: COLOR_MAP[c].bg, border: `2px solid ${item.color === c ? "#b2834c" : COLOR_MAP[c].border}`, cursor: "pointer" }} />
                  ))}
                  <button onClick={() => commitEdit(item.id)} style={{ marginLeft: "auto", background: "#b2834c", color: "#fff", border: "none", borderRadius: 6, padding: "2px 10px", fontSize: 12, cursor: "pointer" }}>Done</button>
                </div>
              </div>
            ) : (
              <div onDoubleClick={() => { setEditingId(item.id); setEditTitle(item.title ?? ""); setEditContent(item.content ?? ""); }} onPointerDown={e => e.stopPropagation()} style={{ cursor: "text" }}>
                <p style={{ margin: "0 0 4px", fontSize: 24 }}>{cat?.emoji ?? "✨"}</p>
                <p style={{ margin: "0 0 4px", fontSize: 14, fontWeight: 600, color: textColor }}>{item.title || (cat ? cat.label : "Concept")}</p>
                {item.content && <p style={{ margin: 0, fontSize: 12, color: mutedColor, lineHeight: 1.6, whiteSpace: "pre-wrap" }}>{item.content}</p>}
                {!item.title && !item.content && <p style={{ margin: 0, fontSize: 12, color: mutedColor }}>Double-click to edit…</p>}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // ─── Layout ───────────────────────────────────────────────────────────────

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", background: "#faf9f7", fontFamily: "'Montserrat', sans-serif" }}>
      {/* Toolbar */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 14px", background: "#ffffff", borderBottom: "1px solid #ece8e2", flexShrink: 0, flexWrap: "wrap" }}>
        <button onClick={() => addItem("note")} style={addBtnStyle}><StickyNote size={14} /> Note</button>
        <button onClick={() => addItem("image")} style={addBtnStyle}><ImageIcon size={14} /> Image</button>
        <button onClick={() => addItem("concept")} style={addBtnStyle}><Sparkles size={14} /> Concept</button>
        <span style={{ color: "#e8e4df" }}>|</span>
        <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
          <button onClick={() => setActiveFilter(null)} style={{ ...chipStyle, background: activeFilter === null ? "#b2834c" : "#f3f0eb", color: activeFilter === null ? "#fff" : "#6b7280" }}>All</button>
          {CATEGORIES.map(c => (
            <button key={c.id} onClick={() => setActiveFilter(activeFilter === c.id ? null : c.id)}
              style={{ ...chipStyle, background: activeFilter === c.id ? "#b2834c" : "#f3f0eb", color: activeFilter === c.id ? "#fff" : "#6b7280" }}>
              {c.emoji} {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* Canvas */}
      <div ref={scrollRef} style={{ flex: 1, overflow: "auto", position: "relative" }}>
        <div style={{ position: "relative", width: CANVAS_W, height: CANVAS_H, backgroundImage: "radial-gradient(circle, #d1cdc7 1px, transparent 1px)", backgroundSize: "28px 28px", backgroundPosition: "14px 14px" }}>
          {loading ? (
            <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <p style={{ color: "#9ca3af", fontSize: 14 }}>Loading your board…</p>
            </div>
          ) : loadError ? (
            <div style={{ position: "absolute", left: "50%", top: "30%", transform: "translate(-50%,-50%)", textAlign: "center" }}>
              <p style={{ fontSize: 40, marginBottom: 12 }}>🌿</p>
              <p style={{ fontSize: 16, fontWeight: 600, color: "#2e3240", marginBottom: 4 }}>Couldn't load your board</p>
              <p style={{ fontSize: 13, color: "#9ca3af", marginBottom: 16 }}>There was an issue connecting. Please refresh and try again.</p>
              <button onClick={() => window.location.reload()} style={{ background: "#b2834c", color: "#fff", border: "none", borderRadius: 8, padding: "8px 20px", fontSize: 13, cursor: "pointer", fontWeight: 500 }}>Refresh</button>
            </div>
          ) : visible.length === 0 ? (
            <div style={{ position: "absolute", left: "50%", top: "30%", transform: "translate(-50%,-50%)", textAlign: "center" }}>
              <p style={{ fontSize: 40, marginBottom: 12 }}>🖼️</p>
              <p style={{ fontSize: 16, fontWeight: 600, color: "#2e3240", marginBottom: 4 }}>Your mood board is empty</p>
              <p style={{ fontSize: 13, color: "#9ca3af" }}>Add a note, image, or concept from the toolbar above</p>
            </div>
          ) : visible.map(renderItem)}
        </div>
      </div>
    </div>
  );
};

const addBtnStyle: CSSProperties = {
  display: "flex", alignItems: "center", gap: 5,
  background: "#f3f0eb", border: "1px solid #e8e4df",
  borderRadius: 7, padding: "5px 12px", fontSize: 13,
  cursor: "pointer", color: "#2e3240", fontWeight: 500,
};

const chipStyle: CSSProperties = {
  border: "none", borderRadius: 20, padding: "3px 10px",
  fontSize: 12, cursor: "pointer", fontWeight: 500, transition: "all 0.15s",
};
