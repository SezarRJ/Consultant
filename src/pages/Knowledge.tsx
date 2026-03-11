import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { playbooks, clients } from "@/data/mockData";
import { useApplyPlaybook } from "@/hooks/usePlaybooks";
import { BookOpen, Layers, Globe, Upload, TrendingUp, FileText, CheckCircle, Search } from "lucide-react";
import { toast } from "sonner";

export default function Knowledge() {
  // G-20 FIX: search state for playbook filtering
  const [playbookSearch, setPlaybookSearch] = useState("");
  const [applyClient, setApplyClient] = useState<Record<string, string>>({});
  const [appliedPlaybooks, setAppliedPlaybooks] = useState<Record<string, string>>({});

  // G-22 FIX: use real mutation instead of local state only
  const applyPlaybookMutation = useApplyPlaybook();

  // G-21 FIX: drag-and-drop state + file ref
  const fileRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);

  // G-20 FIX: filter playbooks by title and description
  const filteredPlaybooks = playbooks.filter((pb) => {
    const q = playbookSearch.toLowerCase();
    return (
      pb.title.toLowerCase().includes(q) ||
      pb.description.toLowerCase().includes(q) ||
      pb.category.toLowerCase().includes(q)
    );
  });

  // G-22 FIX: apply playbook calls mutation
  const handleApplyPlaybook = (playbookId: string, playbookTitle: string) => {
    const clientId = applyClient[playbookId];
    if (!clientId) return;
    const clientName = clients.find((c) => c.id === clientId)?.name ?? "Unknown client";

    applyPlaybookMutation.mutate(
      { playbookId, engagementId: clientId },
      {
        onSuccess: () => {
          setAppliedPlaybooks((prev) => ({ ...prev, [playbookId]: clientId }));
          toast.success(`"${playbookTitle}" applied to ${clientName}.`);
        },
        onError: () => {
          toast.error("Failed to apply playbook. Please try again.");
        },
      }
    );
  };

  // G-21 FIX: handle dropped or selected files
  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const names = Array.from(files).map((f) => f.name);
    setUploadedFiles((prev) => [...prev, ...names]);
    toast.success(`${names.length} file(s) added to knowledge base.`);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
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
          { icon: BookOpen,   label: "Playbooks",      value: playbooks.length, color: "text-primary bg-primary/10"      },
          { icon: Layers,     label: "Frameworks",     value: 12,               color: "text-success bg-success/10"      },
          { icon: TrendingUp, label: "Case Studies",   value: 34,               color: "text-warning bg-warning/10"      },
          { icon: Globe,      label: "Domain Coverage",value: "85%",            color: "text-destructive bg-destructive/10" },
        ].map((stat) => (
          <Card key={stat.label}>
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

      <Tabs defaultValue="playbooks">
        <TabsList>
          <TabsTrigger value="playbooks">Playbooks</TabsTrigger>
          <TabsTrigger value="cases">Case Studies</TabsTrigger>
          <TabsTrigger value="frameworks">Frameworks</TabsTrigger>
          <TabsTrigger value="custom">Custom Knowledge</TabsTrigger>
        </TabsList>

        {/* ── Playbooks ──────────────────────────────────────────────────── */}
        <TabsContent value="playbooks" className="mt-4 space-y-4">
          {/* G-20 FIX: search input */}
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search playbooks..."
              className="pl-9"
              value={playbookSearch}
              onChange={(e) => setPlaybookSearch(e.target.value)}
            />
          </div>

          {filteredPlaybooks.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <BookOpen className="h-10 w-10 mx-auto mb-3 opacity-30" />
              <p>No playbooks match your search.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredPlaybooks.map((pb) => {
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
                      <div className="flex items-center gap-1">
                        <div className="h-2 w-16 rounded-full bg-muted overflow-hidden">
                          <div className="h-full bg-success rounded-full" style={{ width: `${pb.successRate}%` }} />
                        </div>
                        <span className="text-xs text-muted-foreground">{pb.successRate}% success</span>
                      </div>

                      {isApplied ? (
                        <div className="flex items-center gap-2 p-2 rounded-lg bg-success/10 text-success text-xs">
                          <CheckCircle className="h-3.5 w-3.5 shrink-0" />
                          <span>Applied to {appliedClientName}</span>
                        </div>
                      ) : (
                        <div className="flex gap-2">
                          <Select
                            value={applyClient[pb.id] || ""}
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
                          <Button
                            size="sm"
                            className="h-8 px-3 text-xs"
                            disabled={!applyClient[pb.id] || applyPlaybookMutation.isPending}
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
          )}
        </TabsContent>

        {/* ── Case Studies ──────────────────────────────────────────────── */}
        <TabsContent value="cases" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              "Supply Chain Optimization — Manufacturing Sector",
              "Digital Transformation — Retail Industry",
              "Revenue Recovery — Distribution Company",
              "Market Expansion — SaaS Platform",
            ].map((title, i) => (
              <Card key={i}>
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3">
                    <FileText className="h-8 w-8 text-muted-foreground shrink-0" />
                    <div>
                      <p className="font-medium text-sm">{title}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Published Q{(i % 4) + 1} 2025 · 12 pages · Applied 8 times
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* ── Frameworks ────────────────────────────────────────────────── */}
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

        {/* ── Custom Knowledge ──────────────────────────────────────────── */}
        <TabsContent value="custom" className="mt-4 space-y-4">
          {/* G-21 FIX: working drag-and-drop with onDrop + onDragOver + file input */}
          <input
            ref={fileRef}
            type="file"
            multiple
            accept=".pdf,.docx,.xlsx,.csv"
            className="hidden"
            onChange={(e) => handleFiles(e.target.files)}
          />
          <Card>
            <CardContent className="pt-6">
              <div
                className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
                  isDragging ? "border-primary bg-primary/5" : "border-border"
                }`}
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
              >
                <Upload className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
                <p className="font-medium">{isDragging ? "Drop files here" : "Upload Custom Knowledge"}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Drag & drop files or click to browse. Supports PDF, DOCX, XLSX, CSV.
                </p>
                <Button variant="outline" className="mt-4" onClick={() => fileRef.current?.click()}>
                  Browse Files
                </Button>
              </div>
            </CardContent>
          </Card>

          {uploadedFiles.length > 0 && (
            <Card>
              <CardHeader><CardTitle className="text-base">Uploaded Files</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {uploadedFiles.map((name, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-lg border">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <p className="text-sm">{name}</p>
                    <CheckCircle className="h-4 w-4 text-success ml-auto" />
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
