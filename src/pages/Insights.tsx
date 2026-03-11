import { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useInsights, useDismissInsight } from "@/hooks/useInsights";
import { AlertCircle, AlertTriangle, Info, CheckCheck, X } from "lucide-react";

const severityConfig: Record<string, { icon: typeof AlertCircle; color: string; border: string }> = {
  critical: { icon: AlertCircle,   color: "text-destructive", border: "hsl(0, 84%, 50%)"   },
  warning:  { icon: AlertTriangle, color: "text-warning",     border: "hsl(38, 92%, 44%)"  },
  info:     { icon: Info,          color: "text-primary",     border: "hsl(217, 91%, 53%)" },
};

export default function Insights() {
  const [filter, setFilter] = useState<string | null>(null);
  // G-19 FIX: live hook instead of useState(allInsights)
  const { data: serverInsights = [], isLoading } = useInsights();
  // G-17 FIX: dismiss mutation
  const dismissInsight = useDismissInsight();

  // Local read state layered on top of server data (single mark-read)
  const [localRead, setLocalRead] = useState<Set<string>>(new Set());
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  const insights = serverInsights.filter((i: any) => !dismissed.has(i.id));
  const filtered = filter ? insights.filter((i: any) => i.severity === filter) : insights;
  const unreadCount = insights.filter((i: any) => !i.isRead && !localRead.has(i.id)).length;

  const markAllRead = () => {
    const allIds = new Set(insights.map((i: any) => i.id));
    setLocalRead(allIds);
  };

  // G-17 FIX: per-insight dismiss
  const handleDismiss = (id: string) => {
    setDismissed((prev) => new Set([...prev, id]));
    dismissInsight.mutate(id);
  };

  // G-18 FIX: single mark-read
  const handleMarkRead = (id: string) => {
    setLocalRead((prev) => new Set([...prev, id]));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Insights</h1>
          <p className="text-muted-foreground">{unreadCount} unread insights across all clients.</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={markAllRead}
          disabled={unreadCount === 0}
        >
          <CheckCheck className="mr-1 h-4 w-4" /> Mark All Read
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        <Button variant={!filter ? "default" : "outline"} size="sm" onClick={() => setFilter(null)}>All</Button>
        <Button variant={filter === "critical" ? "default" : "outline"} size="sm" onClick={() => setFilter("critical")}>
          <AlertCircle className="mr-1 h-3 w-3" /> Critical
        </Button>
        <Button variant={filter === "warning" ? "default" : "outline"} size="sm" onClick={() => setFilter("warning")}>
          <AlertTriangle className="mr-1 h-3 w-3" /> Warning
        </Button>
        <Button variant={filter === "info" ? "default" : "outline"} size="sm" onClick={() => setFilter("info")}>
          <Info className="mr-1 h-3 w-3" /> Info
        </Button>
      </div>

      {/* Insights List */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <CheckCheck className="h-10 w-10 mx-auto mb-3 opacity-30" />
          <p className="font-medium">No insights match your filter.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((insight: any) => {
            const cfg  = severityConfig[insight.severity];
            const Icon = cfg.icon;
            const isRead = insight.isRead || localRead.has(insight.id);

            return (
              <Card
                key={insight.id}
                className={`border-l-4 relative ${!isRead ? "bg-card" : "opacity-70"}`}
                style={{ borderLeftColor: cfg.border }}
              >
                {/* G-17 FIX: dismiss X button */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2 h-6 w-6 text-muted-foreground hover:text-foreground"
                  onClick={() => handleDismiss(insight.id)}
                >
                  <X className="h-3.5 w-3.5" />
                </Button>

                <CardContent className="py-4 flex items-start gap-3 pr-10">
                  <Icon className={`h-5 w-5 mt-0.5 shrink-0 ${cfg.color}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`font-medium text-sm ${!isRead ? "" : "text-muted-foreground"}`}>
                        {insight.title}
                      </span>
                      {/* G-18 FIX: clickable unread dot marks single insight as read */}
                      {!isRead && (
                        <button
                          className="h-2 w-2 rounded-full bg-primary shrink-0 cursor-pointer hover:bg-primary/70 transition-colors"
                          title="Mark as read"
                          onClick={() => handleMarkRead(insight.id)}
                        />
                      )}
                    </div>
                    <Badge variant="secondary" className="text-xs mb-1">{insight.clientName}</Badge>
                    <p className="text-sm text-muted-foreground">{insight.description}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(insight.timestamp).toLocaleString()} · {insight.source}
                    </p>
                  </div>
                  <Link to={`/clients/${insight.clientId}`}>
                    <Button size="sm" variant="outline">Investigate</Button>
                  </Link>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
