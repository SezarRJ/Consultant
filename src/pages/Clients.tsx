import { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { clients, engagements } from "@/data/mockData";
import { Search, Plus, MapPin, DollarSign, Building2 } from "lucide-react";

export default function Clients() {
  const [search, setSearch] = useState("");
  const [industryFilter, setIndustryFilter] = useState<string | null>(null);

  const industries = [...new Set(clients.map((c) => c.industry))];

  const filtered = clients.filter((c) => {
    const matchSearch = c.name.toLowerCase().includes(search.toLowerCase()) || c.industry.toLowerCase().includes(search.toLowerCase());
    const matchIndustry = !industryFilter || c.industry === industryFilter;
    return matchSearch && matchIndustry;
  });

  const getEngagement = (clientId: string) => engagements.find((e) => e.clientId === clientId);

  const healthColor = (score: number) =>
    score >= 80 ? "text-success" : score >= 60 ? "text-warning" : "text-destructive";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Clients</h1>
          <p className="text-muted-foreground">Manage and view all client engagements.</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button><Plus className="mr-2 h-4 w-4" /> New Client</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Client</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>Company Name</Label>
                <Input placeholder="Enter company name" />
              </div>
              <div className="space-y-2">
                <Label>Industry</Label>
                <Input placeholder="e.g. Manufacturing" />
              </div>
              <div className="space-y-2">
                <Label>Revenue</Label>
                <Input placeholder="e.g. $50M" />
              </div>
              <div className="space-y-2">
                <Label>Location</Label>
                <Input placeholder="e.g. New York, NY" />
              </div>
              <Button className="w-full">Create Client</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search clients..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Button variant={!industryFilter ? "default" : "outline"} size="sm" onClick={() => setIndustryFilter(null)}>All</Button>
        {industries.map((ind) => (
          <Button key={ind} variant={industryFilter === ind ? "default" : "outline"} size="sm" onClick={() => setIndustryFilter(ind)}>
            {ind}
          </Button>
        ))}
      </div>

      {/* Client Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((client) => {
          const eng = getEngagement(client.id);
          return (
            <Link key={client.id} to={`/clients/${client.id}`}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold text-lg">
                      {client.logo}
                    </div>
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-base truncate">{client.name}</CardTitle>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Building2 className="h-3 w-3" /> {client.industry}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-lg font-bold ${healthColor(client.healthScore)}`}>{client.healthScore}</p>
                      <p className="text-xs text-muted-foreground">Health</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{client.description}</p>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><DollarSign className="h-3 w-3" />{client.revenue}</span>
                    <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{client.location}</span>
                  </div>
                  {eng && (
                    <div className="mt-3 pt-3 border-t">
                      <div className="flex items-center justify-between">
                        <Badge variant="secondary" className="text-xs">{eng.phase}</Badge>
                        <span className="text-xs text-muted-foreground">{eng.progress}% complete</span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
