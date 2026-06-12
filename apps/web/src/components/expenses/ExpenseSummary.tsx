import { useState } from "react";
import { useExpenses } from "@/context/ExpenseContext";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Check, Pencil } from "lucide-react";

const fmt = (n: number) =>
  "₦" + new Intl.NumberFormat("en-NG").format(Math.abs(Math.round(n)));

const ExpenseSummary = () => {
  const { totalBudget, setTotalBudget, totalSpent, remainingBudget, expenses } = useExpenses();
  const [isEditing, setIsEditing] = useState(false);
  const [draftBudget, setDraftBudget] = useState(totalBudget);

  const totalCommitted = expenses.reduce((s, e) => s + e.amount, 0);
  const totalOwed = Math.max(totalCommitted - totalSpent, 0);

  const paidPct  = totalBudget > 0 ? Math.min((totalSpent / totalBudget) * 100, 100) : 0;
  const owedPct  = totalBudget > 0 ? Math.min((totalOwed / totalBudget) * 100, 100 - paidPct) : 0;

  const handleSave = () => {
    setTotalBudget(draftBudget);
    setIsEditing(false);
  };

  const overBudget = remainingBudget < 0;

  return (
    <div className="space-y-4">

      {/* Budget gauge */}
      <div className="relative rounded-2xl overflow-hidden text-white" style={{ background: "linear-gradient(135deg, #1c1917 0%, #292524 50%, #1c1917 100%)" }}>
        <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: "radial-gradient(ellipse at 10% 70%, rgba(180,130,80,0.15) 0%, transparent 55%), radial-gradient(ellipse at 90% 15%, rgba(120,90,55,0.12) 0%, transparent 50%)" }} />
        <div className="relative px-7 py-7">
          <p className="text-xs uppercase tracking-[0.2em] text-stone-400 mb-1 font-medium">Total Budget</p>
          <div className="flex items-end gap-3 mb-5">
            {isEditing ? (
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-stone-300">₦</span>
                <Input
                  type="number"
                  autoFocus
                  value={draftBudget}
                  onChange={e => setDraftBudget(Number(e.target.value))}
                  onKeyDown={e => { if (e.key === "Enter") handleSave(); if (e.key === "Escape") setIsEditing(false); }}
                  className="w-44 h-10 text-xl font-bold bg-white/10 border-white/20 text-white placeholder:text-stone-400"
                />
                <Button size="icon" className="h-9 w-9 bg-white/10 hover:bg-white/20 border-0" onClick={handleSave}>
                  <Check className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <>
                <span className="text-3xl md:text-4xl font-bold tracking-tight">{fmt(totalBudget)}</span>
                <button
                  onClick={() => { setDraftBudget(totalBudget); setIsEditing(true); }}
                  className="mb-1 text-stone-400 hover:text-stone-200 transition-colors"
                >
                  <Pencil className="h-4 w-4" />
                </button>
              </>
            )}
          </div>

          {/* Segmented bar */}
          <div className="h-2.5 rounded-full overflow-hidden flex" style={{ background: "rgba(255,255,255,0.08)" }}>
            <div className="h-full bg-emerald-500 transition-all duration-500" style={{ width: `${paidPct}%` }} />
            <div className="h-full bg-amber-400 transition-all duration-500" style={{ width: `${owedPct}%` }} />
          </div>

          {/* Legend */}
          <div className="flex flex-wrap gap-5 mt-3 text-xs text-stone-400">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block shrink-0" />
              Paid · {fmt(totalSpent)}
            </span>
            {totalOwed > 0 && (
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-400 inline-block shrink-0" />
                Still owed · {fmt(totalOwed)}
              </span>
            )}
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full inline-block shrink-0" style={{ background: "rgba(255,255,255,0.2)" }} />
              {overBudget ? "Over budget" : "Available"} · {overBudget ? "-" : ""}{fmt(Math.abs(remainingBudget))}
            </span>
          </div>
        </div>
      </div>

      {/* Stat strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          {
            label: "Committed",
            value: fmt(totalCommitted),
            sub: expenses.length + " expense" + (expenses.length !== 1 ? "s" : ""),
            accent: "text-foreground",
            bg: "bg-card border border-border/60",
          },
          {
            label: "Paid",
            value: fmt(totalSpent),
            sub: totalBudget > 0 ? `${Math.round(paidPct)}% of budget` : "",
            accent: "text-emerald-600",
            bg: "bg-emerald-50 border border-emerald-100",
          },
          {
            label: "Still Owed",
            value: fmt(totalOwed),
            sub: totalOwed > 0 ? "across vendors" : "all settled",
            accent: totalOwed > 0 ? "text-amber-600" : "text-muted-foreground",
            bg: totalOwed > 0 ? "bg-amber-50 border border-amber-100" : "bg-card border border-border/60",
          },
          {
            label: "Remaining",
            value: (overBudget ? "-" : "") + fmt(Math.abs(remainingBudget)),
            sub: overBudget ? "over budget" : "left to spend",
            accent: overBudget ? "text-red-600" : "text-foreground",
            bg: overBudget ? "bg-red-50 border border-red-100" : "bg-card border border-border/60",
          },
        ].map(({ label, value, sub, accent, bg }) => (
          <div key={label} className={`rounded-xl p-4 ${bg}`}>
            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1.5">{label}</p>
            <p className={`text-xl font-bold tabular-nums ${accent}`}>{value}</p>
            {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ExpenseSummary;
