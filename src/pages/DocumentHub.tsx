import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  FolderOpen, ArrowUpDown,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

type SortField = "name" | "uploadDate" | "size" | "type";
type SortDir = "asc" | "desc";

const typeIcon: Record<string, React.ReactNode> = {
  PDF: <FileText className="h-4 w-4 text-destructive" />,
  Excel: <FileSpreadsheet className="h-4 w-4 text-success" />,
  CSV: <FileSpreadsheet className="h-4 w-4 text-primary" />,
  Word: <File className="h-4 w-4 text-blue-500" />,
};

const statusConfig: Record<string, { icon: React.ReactNode; label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  complete: { icon: <CheckCircle2 className="h-3 w-3" />, label: "Complete", variant: "default" },
  processing: { icon: <Loader2 className="h-3 w-3 animate-spin" />, label: "Processing", variant: "secondary" },
  pending: { icon: <Clock className="h-3 w-3" />, label: "Pending", variant: "outline" },
  error: { icon: <AlertTriangle className="h-3 w-3" />, label: "Error", variant: "destructive" },
};

export default function DocumentHub() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [clientFilter, setClientFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortField, setSortField] = useState<SortField>("uploadDate");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [selectedDoc, setSelectedDoc] = useState<typeof documents[0] | null>(null);

  const clientMap = useMemo(() => {
    const m: Record<string, typeof clients[0]> = {};
    clients.forEach((c) => (m[c.id] = c));
    return m;
  }, []);

  const uniqueTypes = useMemo(() => [...new Set(documents.map((d) => d.type))], []);

  const toggleSort = (field: SortField) => {
    if (sortField === field) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortField(field); setSortDir("asc"); }
  };

  const filtered = useMemo(() => {
    let list = [...documents];
    if (search) {
      const q = search.toLowerCase();
      list = list.filter((d) => d.name.toLowerCase().includes(q) || clientMap[d.clientId]?.name.toLowerCase().includes(q));
    }
    if (clientFilter !== "all") list = list.filter((d) => d.clientId === clientFilter);
    if (typeFilter !== "all") list = list.filter((d) => d.type === typeFilter);
    if (statusFilter !== "all") list = list.filter((d) => d.extractionStatus === statusFilter);

    list.sort((a, b) => {
      let cmp = 0;
      if (sortField === "name") cmp = a.name.localeCompare(b.name);
      else if (sortField === "uploadDate") cmp = a.uploadDate.localeCompare(b.uploadDate);
      else if (sortField === "type") cmp = a.type.localeCompare(b.type);
      else if (sortField === "size") cmp = parseFloat(a.size) - parseFloat(b.size);
      return sortDir === "asc" ? cmp : -cmp;
    });
    return list;
  }, [search, clientFilter, typeFilter, statusFilter, sortField, sortDir, clientMap]);

  const stats = useMemo(() => ({
    total: documents.length,
    complete: documents.filter((d) => d.extractionStatus === "complete").length,
    processing: documents.filter((d) => d.extractionStatus === "processing").length,
    pending: documents.filter((d) => d.extractionStatus === "pending").length,
  }), []);

  const SortButton = ({ field, children }: { field: SortField; children: React.ReactNode }) => (
    <button className="flex items-center gap-1 hover:text-foreground transition-colors" onClick={() => toggleSort(field)}>
      {children}
      <ArrowUpDown className={`h-3 w-3 ${sortField === field ? "text-primary" : "opacity-40"}`} />
    </button>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Document Hub</h1>
          <p className="text-muted-foreground">Browse all uploaded documents with client references.</p>
        </div>
        <Badge variant="secondary" className="text-sm gap-1.5">
          <FolderOpen className="h-3.5 w-3.5" /> {stats.total} Documents
        </Badge>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Documents", value: stats.total, icon: FolderOpen, color: "text-primary bg-primary/10" },
          { label: "Extracted", value: stats.complete, icon: CheckCircle2, color: "text-success bg-success/10" },
          { label: "Processing", value: stats.processing, icon: Loader2, color: "text-warning bg-warning/10" },
          { label: "Pending", value: stats.pending, icon: Clock, color: "text-muted-foreground bg-muted" },
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
              <Input placeholder="Search documents or clients..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
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
                  <TableHead><SortButton field="name">Document</SortButton></TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead><SortButton field="type">Type</SortButton></TableHead>
                  <TableHead><SortButton field="size">Size</SortButton></TableHead>
                  <TableHead><SortButton field="uploadDate">Uploaded</SortButton></TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-10" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((doc) => {
                  const client = clientMap[doc.clientId];
                  const st = statusConfig[doc.extractionStatus];
                  return (
                    <TableRow key={doc.id} className="cursor-pointer" onClick={() => setSelectedDoc(doc)}>
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
                      <TableCell><Badge variant="outline" className="text-xs">{doc.type}</Badge></TableCell>
                      <TableCell className="text-sm text-muted-foreground">{doc.size}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{doc.uploadDate}</TableCell>
                      <TableCell>
                        <Badge variant={st.variant} className="gap-1 text-xs">
                          {st.icon} {st.label}
                        </Badge>
                      </TableCell>
                      <TableCell />
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
          const st = statusConfig[selectedDoc.extractionStatus];
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
                        <Button variant="outline" size="sm" onClick={() => { setSelectedDoc(null); navigate(`/clients/${client.id}`); }}>
                          View <ExternalLink className="ml-1 h-3 w-3" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </DialogContent>
          );
        })()}
      </Dialog>
    </div>
  );
}
