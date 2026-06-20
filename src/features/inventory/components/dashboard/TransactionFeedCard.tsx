import { cn } from "@/shared/lib/utils";
import { AlertCircle, ArrowLeftRight, Check, Clock } from "lucide-react";
import { useState } from "react";

interface TxImgProps {
  src: string;
  alt: string;
}
const TxImg = ({ src, alt }: TxImgProps) => {
  const [hasError, setHasError] = useState(false);
  if (hasError)
    return <ArrowLeftRight className="h-4 w-4 text-muted-foreground" />;
  return (
    <img
      src={src}
      alt={alt}
      className="w-full h-full object-cover"
      onError={() => setHasError(true)}
    />
  );
};

interface Transaction {
  id: string;
  type: "checkout" | "return" | "consume" | "restock";
  item: string;
  category: "equipment" | "chemical" | "plant";
  user: string;
  quantity?: string;
  status: "completed" | "pending" | "overdue";
  time: string;
  imageUrl?: string;
}

// mock transactions removed

const typeConfig = {
  checkout: { label: "Out", color: "text-warning", bg: "bg-muted", border: "" },
  return: { label: "In", color: "text-primary", bg: "bg-muted", border: "" },
  consume: {
    label: "Use",
    color: "text-muted-foreground",
    bg: "bg-muted",
    border: "",
  },
  restock: { label: "Add", color: "text-primary", bg: "bg-muted", border: "" },
};

const statusConfig = {
  completed: { icon: Check, color: "text-primary" },
  pending: { icon: Clock, color: "text-warning" },
  overdue: { icon: AlertCircle, color: "text-destructive" },
};

import { useDashboardData } from "@/features/inventory/services/dashboardService";
import { formatDistanceToNow } from "date-fns";

const TransactionFeedCard = () => {
  const { data } = useDashboardData();
  const transactions = data?.recent_transactions || [];
  
  // Note: the backend transactions API doesn't currently return status for all types, 
  // so we won't count overdue/pending perfectly unless we parse borrow records.
  const pendingCount = 0;
  const overdueCount = 0;

  return (
    <div className="bg-card rounded-xl p-6 border border-border shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 mb-4 border-b border-border">
        <div className="flex items-center gap-3">
          <ArrowLeftRight className="h-5 w-5 text-muted-foreground" />
          <div>
            <h3 className="section-title text-foreground">Live Transactions</h3>
            <p className="text-xs text-muted-foreground font-medium mt-0.5">
              Real-time inventory movements
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          {pendingCount > 0 && (
            <span className="text-xs font-medium bg-muted text-warning px-2 py-1 rounded-xl">
              {pendingCount} pending
            </span>
          )}
          {overdueCount > 0 && (
            <span className="text-xs font-medium bg-muted text-destructive px-2 py-1 rounded-xl">
              {overdueCount} overdue
            </span>
          )}
        </div>
      </div>

      <div className="space-y-2">
        {transactions.map((tx, index) => {
          const tConfig = typeConfig[tx.action as keyof typeof typeConfig] || typeConfig.checkout;
          const StatusIcon = statusConfig.completed.icon;
          const timeAgo = tx.created_at ? formatDistanceToNow(new Date(tx.created_at), { addSuffix: true }) : "Unknown time";

          return (
            <div
              key={tx.id}
              className="flex items-center gap-3 p-2.5 hover:bg-muted/50 transition-colors cursor-pointer animate-fade-in rounded-xl"
              style={{ animationDelay: `${index * 60}ms` }}
            >
              {/* Item Image */}
              <div className="w-10 h-10 shrink-0 overflow-hidden bg-muted flex items-center justify-center rounded-xl">
                <ArrowLeftRight className="h-4 w-4 text-muted-foreground" />
              </div>

              {/* Type Badge */}
              <span
                className={cn(
                  "text-xs font-medium w-9 text-center py-1 shrink-0 rounded-xl",
                  tConfig.bg,
                  tConfig.color,
                )}
              >
                {tConfig.label}
              </span>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-foreground truncate">
                    {tx.item?.type} #{tx.item?.id}
                  </span>
                  {tx.quantity && (
                    <span className="text-xs font-medium text-muted-foreground bg-muted px-1.5 py-0.5 rounded-xl">
                      {tx.quantity}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs text-muted-foreground font-medium">
                    {tx.user?.name || "System"}
                  </span>
                  <span className="text-xs text-muted-foreground">·</span>
                  <span className="text-xs text-muted-foreground font-medium">
                    TX-{tx.id}
                  </span>
                </div>
              </div>

              {/* Time & Status */}
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-xs font-medium text-muted-foreground tabular-nums">
                  {timeAgo}
                </span>
                <StatusIcon className={cn("h-3.5 w-3.5", statusConfig.completed.color)} />
              </div>
            </div>
          );
        })}
        {transactions.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-4">No recent transactions</p>
        )}
      </div>
    </div>
  );
};

export default TransactionFeedCard;
