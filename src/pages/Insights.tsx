import { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { insights as allInsights } from "@/data/mockData";
import { AlertCircle, AlertTriangle, Info, CheckCheck } from "lucide-react";

const severityConfig: Record<string, { icon: typeof AlertCircle; color: string; border: string }> = {
  critical: { icon: AlertCircle, color: "text-destructive", border: "hsl(0, 84%, 50%)" },
  warning: { icon: AlertTriangle, color: "text-warning", border: "hsl(38, 92%, 44%)" },
  info: { icon: Info, color: "text-primary", border: "hsl(217, 91%, 53%)" },
};

export default function Insights() {
  const [insights, setInsights] = useState(allInsights);
  const [filter, setFilter] = useState<string | null>(null);

  const filtered = filter ? insights.filter(i => i.severity === filter) : insights;
  const unreadCount = insights.filter(i => !i.isRead).length;

  const markAllRead = () => setInsights(prev => prev.map(i => ({ ...i, isRead: true })));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Insights</h1>
          <p className="text-muted-foreground">{unreadCount} unread insights across all clients.</p>
        </div>
        <Button variant="outline" size="sm" onClick={markAllRead} disabled={unreadCount === 0}>
          <CheckCheck className="mr-1 h-4 w-4" /> Mark All Read
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        <Button variant={!filter ? "default" : "outline"} size="sm" onClick={() => setFilter(null)}>All</Button>
        <Button variant={filter === 'critical' ? "default" : "outline"} size="sm" onClick={() => setFilter('critical')}>
          <AlertCircle className="mr-1 h-3 w-3" /> Critical
        </Button>
        <Button variant={filter === 'warning' ? "default" : "outline"} size="sm" onClick={() => setFilter('warning')}>
          <AlertTriangle className="mr-1 h-3 w-3" /> Warning
        </Button>
        <Button variant={filter === 'info' ? "default" : "outline"} size="sm" onClick={() => setFilter('info')}>
          <Info className="mr-1 h-3 w-3" /> Info
        </Button>
      </div>

      {/* Insights List */}
      <div className="space-y-3">
        {filtered.map((insight) => {
          const cfg = severityConfig[insight.severity];
          const Icon = cfg.icon;
          return (
            <Card
              key={insight.id}
              className={`border-l-4 ${!insight.isRead ? 'bg-card' : 'opacity-75'}`}
              style={{ borderLeftColor: cfg.border }}
            >
              <CardContent className="py-4 flex items-start gap-3">
                <Icon className={`h-5 w-5 mt-0.5 shrink-0 ${cfg.color}`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`font-medium text-sm ${!insight.isRead ? '' : 'text-muted-foreground'}`}>{insight.title}</span>
                    {!insight.isRead && <div className="h-2 w-2 rounded-full bg-primary" />}
                  </div>
                  <Badge variant="secondary" className="text-xs mb-1">{insight.clientName}</Badge>
                  <p className="text-sm text-muted-foreground">{insight.description}</p>
                  <p className="text-xs text-muted-foreground mt-1">{new Date(insight.timestamp).toLocaleString()} · {insight.source}</p>
                </div>
                <Link to={`/clients/${insight.clientId}`}>
                  <Button size="sm" variant="outline">Investigate</Button>
                </Link>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
