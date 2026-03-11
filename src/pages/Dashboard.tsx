import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { engagements, insights, playbooks } from "@/data/mockData";
import { ArrowRight, AlertTriangle, Info, AlertCircle, BookOpen, Layers, Globe, TrendingUp } from "lucide-react";

const phaseColor: Record<string, string> = {
  Discovery: "bg-primary/10 text-primary",
  Analysis: "bg-warning/10 text-warning",
  Strategy: "bg-success/10 text-success",
  Reporting: "bg-muted text-muted-foreground",
  Complete: "bg-success/10 text-success",
};

const statusColor: Record<string, string> = {
  "On Track": "bg-success/10 text-success border-success/20",
  "Needs Attention": "bg-warning/10 text-warning border-warning/20",
  Complete: "bg-muted text-muted-foreground border-border",
};

const severityConfig: Record<string, { icon: typeof AlertCircle; color: string }> = {
  critical: { icon: AlertCircle, color: "text-destructive" },
  warning: { icon: AlertTriangle, color: "text-warning" },
  info: { icon: Info, color: "text-primary" },
};

export default function Dashboard() {
  const unreadInsights = insights.filter((i) => !i.isRead);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Overview of active engagements and AI insights.</p>
      </div>

      {/* Active Engagements */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Active Engagements</h2>
          <Link to="/clients">
            <Button variant="ghost" size="sm">View All <ArrowRight className="ml-1 h-4 w-4" /></Button>
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {engagements.map((eng) => (
            <Link key={eng.id} to={`/clients/${eng.clientId}`}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">{eng.clientName}</CardTitle>
                    <Badge variant="outline" className={statusColor[eng.status]}>{eng.status}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{eng.type}</p>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${phaseColor[eng.phase]}`}>{eng.phase}</span>
                    <span className="text-sm font-medium">{eng.progress}%</span>
                  </div>
                  <Progress value={eng.progress} className="h-2" />
                  <p className="text-xs text-muted-foreground mt-2">Due: {eng.dueDate}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* Middle row: Opportunity Radar + Knowledge */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* AI Opportunity Radar */}
        <div className="lg:col-span-2">
          <h2 className="text-lg font-semibold mb-4">AI Opportunity Radar</h2>
          <div className="grid gap-3">
            {insights.filter(i => i.severity === 'info').slice(0, 2).map((insight) => (
              <Card key={insight.id} className="border-l-4 border-l-primary">
                <CardContent className="py-4 flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="secondary" className="text-xs">{insight.clientName}</Badge>
                    </div>
                    <p className="font-medium text-sm">{insight.title}</p>
                    <p className="text-sm text-muted-foreground mt-1">{insight.description}</p>
                  </div>
                  <Link to={`/clients/${insight.clientId}`}>
                    <Button size="sm" variant="outline">Explore Idea</Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Knowledge Maturity */}
        <div>
          <h2 className="text-lg font-semibold mb-4">Knowledge Maturity</h2>
          <Card>
            <CardContent className="pt-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <BookOpen className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{playbooks.length}</p>
                  <p className="text-xs text-muted-foreground">Playbooks</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-success/10 flex items-center justify-center">
                  <Layers className="h-5 w-5 text-success" />
                </div>
                <div>
                  <p className="text-2xl font-bold">12</p>
                  <p className="text-xs text-muted-foreground">Frameworks</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-warning/10 flex items-center justify-center">
                  <Globe className="h-5 w-5 text-warning" />
                </div>
                <div>
                  <p className="text-2xl font-bold">85%</p>
                  <p className="text-xs text-muted-foreground">Domain Coverage</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-destructive/10 flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-destructive" />
                </div>
                <div>
                  <p className="text-2xl font-bold">34</p>
                  <p className="text-xs text-muted-foreground">Case Studies</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Proactive Insights Feed */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Proactive Insights Feed</h2>
          <Link to="/insights">
            <Button variant="ghost" size="sm">View All <ArrowRight className="ml-1 h-4 w-4" /></Button>
          </Link>
        </div>
        <div className="space-y-3">
          {unreadInsights.slice(0, 4).map((insight) => {
            const cfg = severityConfig[insight.severity];
            const Icon = cfg.icon;
            return (
              <Card key={insight.id} className="border-l-4" style={{ borderLeftColor: insight.severity === 'critical' ? 'hsl(0, 84%, 50%)' : insight.severity === 'warning' ? 'hsl(38, 92%, 44%)' : 'hsl(217, 91%, 53%)' }}>
                <CardContent className="py-3 flex items-start gap-3">
                  <Icon className={`h-5 w-5 mt-0.5 shrink-0 ${cfg.color}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="font-medium text-sm">{insight.title}</span>
                      <Badge variant="secondary" className="text-xs shrink-0">{insight.clientName}</Badge>
                    </div>
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
      </section>
    </div>
  );
}
