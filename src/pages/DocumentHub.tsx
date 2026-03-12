import { useState, useMemo, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { documents, clients } from "@/data/mockData";
import {
  Search, FileText, FileSpreadsheet, File, FilePlus2,
  CheckCircle2, Loader2, Clock, AlertTriangle, ExternalLink,
  FolderOpen, ArrowUpDown, Download, PackageOpen, X,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

type SortField = "name" | "uploadDate" | "size" | "type";
type SortDir   = "asc" | "desc";

// ── Maps ─────────────────────────────────────────────────────────────────────

const typeIcon: Record<string, React.ReactNode> = {
  PDF:   <FileText       className="h-4 w-4 text-destructive" />,
  Excel: <FileSpreadsheet className="h-4 w-4 text-success"    />,
  CSV:   <FileSpreadsheet className="h-4 w-4 text-primary"    />,
  Word:  <File            className="h-4 w-4 text-blue-500"   />,
};

const statusConfig: Record<
  string,
  { icon: React.ReactNode; label: string; variant: "default" | "secondary" | "destructive" | "outline" }
> = {
  complete:   { icon: <CheckCircle2 className="h-3 w-3" />,           label: "Complete",   variant: "default"     },
  processing: { icon: <Loader2      className="h-3 w-3 animate-spin"/>,label: "Processing", variant: "secondary"   },
  pending:    { icon: <Clock        className="h-3 w-3" />,            label: "Pending",    variant: "outline"     },
  error:      { icon: <AlertTriangle className="h-3 w-3" />,           label: "Error",      variant: "destructive" },
};

// ── Mock download helper ───────────────────────────────────────────────────
// Creates a real browser download with placeholder text content.
// Replace the URL generation here with a real signed-URL fetch when the
// backend is ready (e.g. api.get(`/documents/${id}/download`) → { url }).
function triggerDownload(doc: typeof documents[0]) {
  const content = `Document: ${doc.name}\nType: ${doc.type}\nSize: ${doc.size}\nUploaded: ${doc.uploadDate}\nExtraction: ${doc.extractionStatus}`;
  const blob = new Blob([content], { type: "text/plain" });
  const url  = URL.createObjectURL(blob);
  const a    = Object.assign(document.createElement("a"), { href: url, download: doc.name });
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

// Bulk download: fires individual downloads sequentially with a small delay
// to avoid browser pop-up blockers throttling simultaneous downloads.
async function triggerBulkDownload(
  docs: typeof documents,
  onProgress: (n: number) => void
) {
  for (let i = 0; i < docs.length; i++) {
    triggerDownload(docs[i]);
    onProgress(i + 1);
    await new Promise((r) => setTimeout(r, 300));
  }
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function DocumentHub() {
  const navigate = useNavigate();

  // Filters & sort
  const [search,       setSearch]       = useState("");
  const [clientFilter, setClientFilter] = useState("all");
  const [typeFilter,   setTypeFilter]   = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortField,    setSortField]    = useState<SortField>("uploadDate");
  const [sortDir,      setSortDir]      = useState<SortDir>("desc");

  // Row selection
  const [selected,  setSelected]  = useState<Set<string>>(new Set());

  // UI state
  const [selectedDoc,      setSelectedDoc]      = useState<typeof documents[0] | null>(null);
  const [downloading,      setDownloading]      = useState<Set<string>>(new Set());
  const [bulkDownloading,  setBulkDownloading]  = useState(false);
  const [bulkProgress,     setBulkProgress]     = useState(0);

  // ── Derived data ───────────────────────────────────────────────────────────

  const clientMap = useMemo(() => {
    const m: Record<string, typeof clients[0]> = {};
    clients.forEach((c) => (m[c.id] = c));
    return m;
  }, []);

  const uniqueTypes = useMemo(() => [...new Set(documents.map((d) => d.type))], []);

  const filtered = useMemo(() => {
    let list = [...documents];
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (d) =>
          d.name.toLowerCase().includes(q) ||
          clientMap[d.clientId]?.name.toLowerCase().includes(q)
      );
    }
    if (clientFilter !== "all") list = list.filter((d) => d.clientId === clientFilter);
    if (typeFilter   !== "all") list = list.filter((d) => d.type === typeFilter);
    if (statusFilter !== "all") list = list.filter((d) => d.extractionStatus === statusFilter);

    list.sort((a, b) => {
      let cmp = 0;
      if (sortField === "name")       cmp = a.name.localeCompare(b.name);
      else if (sortField === "uploadDate") cmp = a.uploadDate.localeCompare(b.uploadDate);
      else if (sortField === "type")   cmp = a.type.localeCompare(b.type);
      else if (sortField === "size")   cmp = parseFloat(a.size) - parseFloat(b.size);
      return sortDir === "asc" ? cmp : -cmp;
    });
    return list;
  }, [search, clientFilter, typeFilter, statusFilter, sortField, sortDir, clientMap]);

  const stats = useMemo(() => ({
    total:      documents.length,
    complete:   documents.filter((d) => d.extractionStatus === "complete").length,
    processing: documents.filter((d) => d.extractionStatus === "processing").length,
    pending:    documents.filter((d) => d.extractionStatus === "pending").length,
  }), []);

  const allFilteredSelected =
    filtered.length > 0 && filtered.every((d) => selected.has(d.id));

  const someFilteredSelected = filtered.some((d) => selected.has(d.id));

  const selectedDocs = filtered.filter((d) => selected.has(d.id));

  // ── Actions ────────────────────────────────────────────────────────────────

  const toggleSort = (field: SortField) => {
    if (sortField === field) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortField(field); setSortDir("asc"); }
  };

  const toggleRow = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (allFilteredSelected) {
      setSelected((prev) => {
        const next = new Set(prev);
        filtered.forEach((d) => next.delete(d.id));
        return next;
      });
    } else {
      setSelected((prev) => {
        const next = new Set(prev);
        filtered.forEach((d) => next.add(d.id));
        return next;
      });
    }
  };

  // Single-file download
  const handleDownload = (
    e: React.MouseEvent,
    doc: typeof documents[0]
  ) => {
    e.stopPropagation();
    setDownloading((prev) => new Set([...prev, doc.id]));
    // Simulate a brief async fetch before triggering
    setTimeout(() => {
      triggerDownload(doc);
      setDownloading((prev) => {
        const next = new Set(prev);
        next.delete(doc.id);
        return next;
      });
      toast.success(`Downloaded "${doc.name}"`);
    }, 600);
  };

  // Bulk download (selected rows)
  const handleBulkDownload = async () => {
    if (selectedDocs.length === 0) return;
    setBulkDownloading(true);
    setBulkProgress(0);
    await triggerBulkDownload(selectedDocs, (n) => setBulkProgress(n));
    setBulkDownloading(false);
    setBulkProgress(0);
    toast.success(`Downloaded ${selectedDocs.length} file${selectedDocs.length > 1 ? "s" : ""}.`);
    setSelected(new Set());
  };

  // Download all visible (no selection required)
  const handleDownloadAll = async () => {
    if (filtered.length === 0) return;
    setBulkDownloading(true);
    setBulkProgress(0);
    await triggerBulkDownload(filtered, (n) => setBulkProgress(n));
    setBulkDownloading(false);
    setBulkProgress(0);
    toast.success(`Downloaded all ${filtered.length} documents.`);
  };

  // ── Sub-components ────────────────────────────────────────────────────────

  const SortButton = ({ field, children }: { field: SortField; children: React.ReactNode }) => (
    <button
      className="flex items-center gap-1 hover:text-foreground transition-colors"
      onClick={() => toggleSort(field)}
    >
      {children}
      <ArrowUpDown className={`h-3 w-3 ${sortField === field ? "text-primary" : "opacity-40"}`} />
    </button>
  );

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Document Hub</h1>
          <p className="text-muted-foreground">Browse all uploaded documents with client references.</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-sm gap-1.5">
            <FolderOpen className="h-3.5 w-3.5" /> {stats.total} Documents
          </Badge>
          {/* Download All Visible */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownloadAll}
            disabled={bulkDownloading || filtered.length === 0}
          >
            {bulkDownloading ? (
              <><Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> Downloading…</>
            ) : (
              <><PackageOpen className="mr-1.5 h-4 w-4" /> Download All ({filtered.length})</>
            )}
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Documents", value: stats.total,      icon: FolderOpen,   color: "text-primary bg-primary/10"        },
          { label: "Extracted",       value: stats.complete,   icon: CheckCircle2, color: "text-success bg-success/10"        },
          { label: "Processing",      value: stats.processing, icon: Loader2,      color: "text-warning bg-warning/10"        },
          { label: "Pending",         value: stats.pending,    icon: Clock,        color: "text-muted-foreground bg-muted"    },
        ].map((s) => (
          <Card key={s.label}>
            <CardContent className="pt-6 flex items-center gap-3">
              <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${s.color}`}>
                <s.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold">{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search documents or clients…"
                className="pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Select value={clientFilter} onValueChange={setClientFilter}>
              <SelectTrigger className="w-[180px]"><SelectValue placeholder="All Clients" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Clients</SelectItem>
                {clients.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[140px]"><SelectValue placeholder="All Types" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {uniqueTypes.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[160px]"><SelectValue placeholder="All Statuses" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="complete">Complete</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="error">Error</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Bulk action bar — slides in when rows are selected */}
      {someFilteredSelected && (
        <div className="flex items-center justify-between px-4 py-3 rounded-xl border bg-primary/5 border-primary/20">
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium">
              {selectedDocs.length} file{selectedDocs.length > 1 ? "s" : ""} selected
            </span>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs text-muted-foreground"
              onClick={() => setSelected(new Set())}
            >
              <X className="mr-1 h-3 w-3" /> Clear
            </Button>
          </div>
          <Button
            size="sm"
            onClick={handleBulkDownload}
            disabled={bulkDownloading}
          >
            {bulkDownloading ? (
              <>
                <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                {bulkProgress}/{selectedDocs.length}
              </>
            ) : (
              <><Download className="mr-1.5 h-4 w-4" /> Download Selected</>
            )}
          </Button>
        </div>
      )}

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {filtered.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <FilePlus2 className="h-10 w-10 mx-auto mb-3 opacity-30" />
              <p className="font-medium">No documents match your filters.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  {/* Select-all checkbox */}
                  <TableHead className="w-10">
                    <Checkbox
                      checked={allFilteredSelected}
                      onCheckedChange={toggleAll}
                      aria-label="Select all"
                    />
                  </TableHead>
                  <TableHead><SortButton field="name">Document</SortButton></TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead><SortButton field="type">Type</SortButton></TableHead>
                  <TableHead><SortButton field="size">Size</SortButton></TableHead>
                  <TableHead><SortButton field="uploadDate">Uploaded</SortButton></TableHead>
                  <TableHead>Status</TableHead>
                  {/* Download column header */}
                  <TableHead className="w-10 text-right pr-4">
                    <Download className="h-4 w-4 ml-auto text-muted-foreground" />
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((doc) => {
                  const client    = clientMap[doc.clientId];
                  const st        = statusConfig[doc.extractionStatus];
                  const isChecked = selected.has(doc.id);
                  const isLoading = downloading.has(doc.id);

                  return (
                    <TableRow
                      key={doc.id}
                      className={`cursor-pointer ${isChecked ? "bg-primary/5" : ""}`}
                      onClick={() => setSelectedDoc(doc)}
                    >
                      {/* Row checkbox */}
                      <TableCell onClick={(e) => { e.stopPropagation(); toggleRow(doc.id); }}>
                        <Checkbox
                          checked={isChecked}
                          onCheckedChange={() => toggleRow(doc.id)}
                          aria-label={`Select ${doc.name}`}
                        />
                      </TableCell>

                      <TableCell>
                        <div className="flex items-center gap-2">
                          {typeIcon[doc.type] ?? <File className="h-4 w-4 text-muted-foreground" />}
                          <span className="font-medium text-sm">{doc.name}</span>
                        </div>
                      </TableCell>

                      <TableCell>
                        {client ? (
                          <Button
                            variant="link"
                            size="sm"
                            className="h-auto p-0 text-xs"
                            onClick={(e) => { e.stopPropagation(); navigate(`/clients/${client.id}`); }}
                          >
                            {client.name}
                            <ExternalLink className="ml-1 h-3 w-3" />
                          </Button>
                        ) : (
                          <span className="text-xs text-muted-foreground">Unknown</span>
                        )}
                      </TableCell>

                      <TableCell>
                        <Badge variant="outline" className="text-xs">{doc.type}</Badge>
                      </TableCell>

                      <TableCell className="text-sm text-muted-foreground">{doc.size}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{doc.uploadDate}</TableCell>

                      <TableCell>
                        <Badge variant={st.variant} className="gap-1 text-xs">
                          {st.icon} {st.label}
                        </Badge>
                      </TableCell>

                      {/* Per-row download button */}
                      <TableCell className="text-right pr-4">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          title={`Download ${doc.name}`}
                          disabled={isLoading}
                          onClick={(e) => handleDownload(e, doc)}
                        >
                          {isLoading
                            ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            : <Download className="h-3.5 w-3.5" />
                          }
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <Dialog open={!!selectedDoc} onOpenChange={(open) => !open && setSelectedDoc(null)}>
        {selectedDoc && (() => {
          const client = clientMap[selectedDoc.clientId];
          const st     = statusConfig[selectedDoc.extractionStatus];
          return (
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-base">
                  {typeIcon[selectedDoc.type]} {selectedDoc.name}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-1">
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-lg bg-muted">
                    <p className="text-xs text-muted-foreground">Type</p>
                    <p className="text-sm font-medium mt-0.5">{selectedDoc.type}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-muted">
                    <p className="text-xs text-muted-foreground">Size</p>
                    <p className="text-sm font-medium mt-0.5">{selectedDoc.size}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-muted">
                    <p className="text-xs text-muted-foreground">Uploaded</p>
                    <p className="text-sm font-medium mt-0.5">{selectedDoc.uploadDate}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-muted">
                    <p className="text-xs text-muted-foreground">Extraction</p>
                    <div className="flex items-center gap-1 mt-0.5">
                      <Badge variant={st.variant} className="gap-1 text-xs">{st.icon} {st.label}</Badge>
                    </div>
                  </div>
                </div>

                {client && (
                  <Card className="border">
                    <CardContent className="pt-4 pb-4">
                      <p className="text-xs text-muted-foreground mb-1">Referenced Client</p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs font-bold">
                            {client.logo}
                          </div>
                          <div>
                            <p className="text-sm font-medium">{client.name}</p>
                            <p className="text-xs text-muted-foreground">{client.industry}</p>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => { setSelectedDoc(null); navigate(`/clients/${client.id}`); }}
                        >
                          View <ExternalLink className="ml-1 h-3 w-3" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Download button inside detail dialog */}
                <Button
                  className="w-full"
                  onClick={(e) => {
                    handleDownload(e as any, selectedDoc);
                    setSelectedDoc(null);
                  }}
                  disabled={downloading.has(selectedDoc.id)}
                >
                  <Download className="mr-2 h-4 w-4" /> Download {selectedDoc.name}
                </Button>
              </div>
            </DialogContent>
          );
        })()}
      </Dialog>
    </div>
  );
}
