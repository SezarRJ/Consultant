// BUG 7 FIX: "Apply to client..." Select now has a functional Apply button with toast feedback.
//            Previously selecting a client had zero effect — no button, no action, no feedback.
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { playbooks, clients } from "@/data/mockData";
import { BookOpen, Layers, Globe, Upload, TrendingUp, FileText, CheckCircle } from "lucide-react";

export default function Knowledge() {
  // BUG 7 FIX: track both selected client AND whether it's been applied per playbook
  const [applyClient, setApplyClient] = useState<Record<string, string>>({});
  const [appliedPlaybooks, setAppliedPlaybooks] = useState<Record<string, string>>({});
  const { toast } = useToast();

  // BUG 7 FIX: actual apply action with toast confirmation
  const handleApplyPlaybook = (playbookId: string, playbookTitle: string) => {
    const clientId = applyClient[playbookId];
    if (!clientId) return;
    const clientName = clients.find((c) => c.id === clientId)?.name ?? "Unknown client";
    setAppliedPlaybooks((prev) => ({ ...prev, [playbookId]: clientId }));
    toast({
      title: "Playbook Applied",
      description: `"${playbookTitle}" has been applied to ${clientName}.`,
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Knowledge Base</h1>
        <p className="text-muted-foreground">Manage playbooks, frameworks, and case studies.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { icon: BookOpen, label: 'Playbooks', value: playbooks.length, color: 'text-primary bg-primary/10' },
          { icon: Layers, label: 'Frameworks', value: 12, color: 'text-success bg-success/10' },
          { icon: TrendingUp, label: 'Case Studies', value: 34, color: 'text-warning bg-warning/10' },
          { icon: Globe, label: 'Domain Coverage', value: '85%', color: 'text-destructive bg-destructive/10' },
        ].map((stat, i) => (
          <Card key={i}>
            <CardContent className="pt-6 flex items-center gap-3">
              <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${stat.color}`}>
                <stat.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabbed Content */}
      <Tabs defaultValue="playbooks">
        <TabsList>
          <TabsTrigger value="playbooks">Playbooks</TabsTrigger>
          <TabsTrigger value="cases">Case Studies</TabsTrigger>
          <TabsTrigger value="frameworks">Frameworks</TabsTrigger>
          <TabsTrigger value="custom">Custom Knowledge</TabsTrigger>
        </TabsList>

        <TabsContent value="playbooks" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {playbooks.map((pb) => {
              const isApplied = !!appliedPlaybooks[pb.id];
              const appliedClientName = isApplied
                ? clients.find((c) => c.id === appliedPlaybooks[pb.id])?.name
                : null;

              return (
                <Card key={pb.id}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <Badge variant="secondary" className="text-xs">{pb.category}</Badge>
                      <span className="text-xs text-muted-foreground">Used {pb.timesUsed}x</span>
                    </div>
                    <CardTitle className="text-base mt-2">{pb.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-sm text-muted-foreground">{pb.description}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <div className="h-2 w-16 rounded-full bg-muted overflow-hidden">
                          <div className="h-full bg-success rounded-full" style={{ width: `${pb.successRate}%` }} />
                        </div>
                        <span className="text-xs text-muted-foreground">{pb.successRate}% success</span>
                      </div>
                    </div>

                    {/* BUG 7 FIX: applied state shows confirmation instead of select */}
                    {isApplied ? (
                      <div className="flex items-center gap-2 p-2 rounded-lg bg-success/10 text-success text-xs">
                        <CheckCircle className="h-3.5 w-3.5 shrink-0" />
                        <span>Applied to {appliedClientName}</span>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <Select
                          value={applyClient[pb.id] || ''}
                          onValueChange={(v) => setApplyClient((prev) => ({ ...prev, [pb.id]: v }))}
                        >
                          <SelectTrigger className="h-8 text-xs flex-1">
                            <SelectValue placeholder="Apply to client..." />
                          </SelectTrigger>
                          <SelectContent>
                            {clients.map((c) => (
                              <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {/* BUG 7 FIX: Apply button that actually triggers an action */}
                        <Button
                          size="sm"
                          className="h-8 px-3 text-xs"
                          disabled={!applyClient[pb.id]}
                          onClick={() => handleApplyPlaybook(pb.id, pb.title)}
                        >
                          Apply
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="cases" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {['Supply Chain Optimization — Manufacturing Sector', 'Digital Transformation — Retail Industry', 'Revenue Recovery — Distribution Company', 'Market Expansion — SaaS Platform'].map((title, i) => (
              <Card key={i}>
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3">
                    <FileText className="h-8 w-8 text-muted-foreground shrink-0" />
                    <div>
                      <p className="font-medium text-sm">{title}</p>
                      <p className="text-xs text-muted-foreground mt-1">Published Q{(i % 4) + 1} 2025 · 12 pages · Applied 8 times</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="frameworks" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {["Porter's Five Forces", "SWOT Analysis", "Value Chain Analysis", "BCG Matrix", "Ansoff Matrix", "McKinsey 7S", "Blue Ocean Strategy", "Balanced Scorecard", "PESTLE Analysis"].map((fw, i) => (
              <Card key={i}>
                <CardContent className="pt-6 flex items-center gap-3">
                  <Layers className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm font-medium">{fw}</p>
                    <p className="text-xs text-muted-foreground">Used in {5 + i} analyses</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="custom" className="mt-4">
          <Card>
            <CardContent className="pt-6">
              <div className="border-2 border-dashed border-border rounded-xl p-8 text-center">
                <Upload className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
                <p className="font-medium">Upload Custom Knowledge</p>
                <p className="text-sm text-muted-foreground mt-1">Drag & drop files or click to browse. Supports PDF, DOCX, XLSX, CSV.</p>
                <Button variant="outline" className="mt-4">Browse Files</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
