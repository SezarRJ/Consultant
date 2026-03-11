import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { agents, clients, activityLog } from "@/data/mockData";
import { Bot, Eye, Clock, CheckCircle, AlertCircle, Loader2 } from "lucide-react";

const statusConfig: Record<string, { icon: typeof CheckCircle; color: string; dot: string }> = {
  complete: { icon: CheckCircle, color: "text-success", dot: "bg-success" },
  running: { icon: Loader2, color: "text-primary", dot: "bg-primary animate-pulse-dot" },
  queued: { icon: Clock, color: "text-muted-foreground", dot: "bg-muted-foreground" },
  error: { icon: AlertCircle, color: "text-destructive", dot: "bg-destructive" },
};

export default function Agents() {
  const [selectedClient, setSelectedClient] = useState(clients[0].id);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">AI Agent Workspace</h1>
          <p className="text-muted-foreground">Monitor and manage AI analysis agents.</p>
        </div>
        <Select value={selectedClient} onValueChange={setSelectedClient}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Select client" />
          </SelectTrigger>
          <SelectContent>
            {clients.map(c => (
              <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Agent Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {agents.map((agent) => {
          const cfg = statusConfig[agent.status];
          const StatusIcon = cfg.icon;
          return (
            <Card key={agent.id}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`h-2.5 w-2.5 rounded-full ${cfg.dot}`} />
                    <CardTitle className="text-sm">{agent.name}</CardTitle>
                  </div>
                  <Badge variant="outline" className="text-xs">{agent.model}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-xs text-muted-foreground">{agent.description}</p>
                <div className="flex items-center gap-2 text-xs">
                  <StatusIcon className={`h-3.5 w-3.5 ${cfg.color} ${agent.status === 'running' ? 'animate-spin' : ''}`} />
                  <span className="capitalize">{agent.status}</span>
                  <span className="text-muted-foreground ml-auto">{agent.lastRun}</span>
                </div>
                {agent.status === 'running' && (
                  <Progress value={agent.progress} className="h-1.5" />
                )}
                <div className="flex gap-2 pt-1">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button size="sm" variant="outline" className="flex-1" disabled={agent.status !== 'complete'}>
                        <Eye className="mr-1 h-3 w-3" /> Output
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-lg">
                      <DialogHeader><DialogTitle>{agent.name} — Output</DialogTitle></DialogHeader>
                      <div className="space-y-3 pt-2">
                        <p className="text-sm text-muted-foreground">Task: {agent.task}</p>
                        <div className="p-3 rounded-lg bg-muted text-sm">
                          <p className="font-medium mb-2">Key Findings:</p>
                          <ul className="space-y-1 text-muted-foreground">
                            <li>• Revenue concentration risk identified in Midwest (35% of total)</li>
                            <li>• Operating margins 3.2% below industry benchmark</li>
                            <li>• Customer acquisition cost increased 18% YoY</li>
                            <li>• Supply chain efficiency score: 72/100</li>
                          </ul>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button size="sm" variant="ghost" className="flex-1" disabled={agent.status !== 'complete'}>
                        <Bot className="mr-1 h-3 w-3" /> Trace
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-lg">
                      <DialogHeader><DialogTitle>{agent.name} — Reasoning Trace</DialogTitle></DialogHeader>
                      <div className="space-y-3 pt-2 text-sm">
                        <div className="space-y-2">
                          {['Loaded 4 data sources', 'Applied extraction templates', 'Identified 12 key metrics', 'Cross-referenced with benchmarks', 'Generated confidence scores'].map((step, i) => (
                            <div key={i} className="flex gap-2 items-start">
                              <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center text-xs text-primary shrink-0">{i + 1}</div>
                              <p className="text-muted-foreground">{step}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Activity Feed & Results */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader><CardTitle className="text-base">Live Activity Feed</CardTitle></CardHeader>
          <CardContent className="space-y-3 max-h-80 overflow-auto">
            {activityLog.map(item => (
              <div key={item.id} className="flex gap-2 text-sm">
                <div className="h-1.5 w-1.5 rounded-full bg-primary mt-2 shrink-0" />
                <div>
                  <p>{item.action}</p>
                  <p className="text-xs text-muted-foreground">{new Date(item.timestamp).toLocaleTimeString()}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader><CardTitle className="text-base">Consolidated Results</CardTitle></CardHeader>
          <CardContent>
            <Tabs defaultValue="findings">
              <TabsList>
                <TabsTrigger value="findings">Key Findings</TabsTrigger>
                <TabsTrigger value="strategies">Strategy Options</TabsTrigger>
                <TabsTrigger value="simulations">Simulations</TabsTrigger>
                <TabsTrigger value="roadmap">Roadmap</TabsTrigger>
              </TabsList>
              <TabsContent value="findings" className="mt-4 space-y-2">
                {['Revenue declining 12% below forecast in Q1', 'Last-mile delivery costs 23% above industry average', 'Top 3 accounts represent 45% of total revenue', 'Customer satisfaction score dropped from 8.1 to 7.2'].map((f, i) => (
                  <div key={i} className="flex items-start gap-2 p-2 rounded bg-muted">
                    <span className="text-xs font-medium text-primary shrink-0">{i + 1}.</span>
                    <p className="text-sm">{f}</p>
                  </div>
                ))}
              </TabsContent>
              <TabsContent value="strategies" className="mt-4 text-sm text-muted-foreground">
                <p>3 strategy options generated. View in the client Strategy tab for detailed simulation results and accept/reject workflow.</p>
              </TabsContent>
              <TabsContent value="simulations" className="mt-4 text-sm text-muted-foreground">
                <p>Monte Carlo simulations complete for all 3 options. Results show Option B (Technology-Led Efficiency) with highest expected ROI at 18-month horizon.</p>
              </TabsContent>
              <TabsContent value="roadmap" className="mt-4 text-sm text-muted-foreground">
                <p>Implementation roadmap available after strategy acceptance. Navigate to client Strategy tab to accept an option.</p>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
