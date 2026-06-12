import { useExpenses } from "@/context/ExpenseContext";

const CATEGORY_META: Record<string, { emoji: string; label: string }> = {
  venue:         { emoji: "🏛️", label: "Venue" },
  catering:      { emoji: "🍽️", label: "Catering" },
  photography:   { emoji: "📸", label: "Photography" },
  videography:   { emoji: "🎥", label: "Videography" },
  flowers:       { emoji: "💐", label: "Flowers & Florals" },
  decor:         { emoji: "🌸", label: "Décor" },
  music:         { emoji: "🎵", label: "Music & Entertainment" },
  attire:        { emoji: "👗", label: "Attire" },
  cake:          { emoji: "🎂", label: "Cake" },
  transportation:{ emoji: "🚗", label: "Transportation" },
  invitations:   { emoji: "✉️", label: "Invitations" },
  rings:         { emoji: "💍", label: "Rings & Jewelry" },
  hair:          { emoji: "💄", label: "Hair & Beauty" },
  honeymoon:     { emoji: "✈️", label: "Honeymoon" },
  gifts:         { emoji: "🎁", label: "Gifts & Favors" },
  other:         { emoji: "✨", label: "Other" },
};

const fmt = (n: number) =>
  "₦" + new Intl.NumberFormat("en-NG").format(Math.round(n));

const ExpenseCategories = () => {
  const { expenses, totalBudget } = useExpenses();

  if (expenses.length === 0) {
    return (
      <div className="text-center py-16 text-muted-foreground">
        <p className="text-4xl mb-3">📊</p>
        <p className="font-medium">No expenses yet</p>
        <p className="text-sm mt-1">Add expenses to see your category breakdown</p>
      </div>
    );
  }

  // Group by category
  const byCategory = expenses.reduce((acc, e) => {
    const cat = e.category || "other";
    if (!acc[cat]) acc[cat] = { total: 0, paid: 0, count: 0 };
    acc[cat].total += e.amount;
    acc[cat].paid  += e.amountPaid;
    acc[cat].count += 1;
    return acc;
  }, {} as Record<string, { total: number; paid: number; count: number }>);

  const totalCommitted = expenses.reduce((s, e) => s + e.amount, 0);

  const sorted = Object.entries(byCategory).sort((a, b) => b[1].total - a[1].total);

  const maxTotal = sorted[0]?.[1].total ?? 1;

  return (
    <div className="space-y-2">
      {sorted.map(([cat, data]) => {
        const meta = CATEGORY_META[cat] ?? { emoji: "✨", label: cat.charAt(0).toUpperCase() + cat.slice(1) };
        const pctOfTotal   = totalCommitted > 0 ? (data.total / totalCommitted) * 100 : 0;
        const pctOfBudget  = totalBudget > 0 ? (data.total / totalBudget) * 100 : 0;
        const paidPct      = data.total > 0 ? (data.paid / data.total) * 100 : 0;
        const barWidth     = maxTotal > 0 ? (data.total / maxTotal) * 100 : 0;

        return (
          <div
            key={cat}
            className="rounded-xl border border-border/60 bg-card px-5 py-4 hover:bg-muted/20 transition-colors"
          >
            <div className="flex items-center gap-4">
              {/* Emoji */}
              <span className="text-2xl shrink-0 w-8 text-center">{meta.emoji}</span>

              {/* Name + stats */}
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline justify-between gap-3 mb-2">
                  <div className="flex items-baseline gap-2 min-w-0">
                    <span className="font-medium text-sm truncate">{meta.label}</span>
                    <span className="text-xs text-muted-foreground shrink-0">
                      {data.count} {data.count === 1 ? "item" : "items"}
                    </span>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="font-semibold text-sm tabular-nums">{fmt(data.total)}</span>
                    <span className="text-xs text-muted-foreground ml-1.5">{pctOfTotal.toFixed(0)}%</span>
                  </div>
                </div>

                {/* Proportional bar */}
                <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full bg-primary/70 transition-all duration-500"
                    style={{ width: `${barWidth}%` }}
                  />
                </div>

                {/* Paid sub-row */}
                <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <span
                      className="inline-block w-1.5 h-1.5 rounded-full"
                      style={{ background: `hsl(142 71% 45% / ${paidPct / 100})`, minWidth: 6 }}
                    />
                    <span>Paid {fmt(data.paid)} ({Math.round(paidPct)}%)</span>
                  </div>
                  {totalBudget > 0 && (
                    <span>{pctOfBudget.toFixed(1)}% of budget</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ExpenseCategories;
