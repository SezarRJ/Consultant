import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { clients, engagements, documents, strategies, insights, deliverables, revenueData, regionalData, activityLog } from "@/data/mockData";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import { Building2, MapPin, DollarSign, User, Edit, Bot, FileText, Upload, Download, CheckCircle, XCircle, Clock, AlertTriangle, Eye, ArrowLeft } from "lucide-react";

export default function ClientWorkspace() {
  const { id } = useParams<{ id: string }>();
  const client = clients.find((c) => c.id === id);
  const engagement = engagements.find((e) => e.clientId === id);
  const clientDocs = documents.filter((d) => d.clientId === id);
  const clientStrategies = strategies.filter((s) => s.clientId === id);
  const clientInsights = insights.filter((i) => i.clientId === id);
  const clientDeliverables = deliverables.filter((d) => d.clientId === id);
  const [strategyStatuses, setStrategyStatuses] = useState<Record<string, string>>(
    Object.fromEntries(clientStrategies.map((s) => [s.id, s.status]))
  );

  if (!client) {
    return <div className="flex items-center justify-center h-64"><p className="text-muted-foreground">Client not found</p></div>;
  }

  const healthColor = client.healthScore >= 80 ? "text-success" : client.healthScore >= 60 ? "text-warning" : "text-destructive";

  const extractionIcon: Record<string, typeof CheckCircle> = { complete: CheckCircle, processing: Clock, pending: Clock, error: XCircle };
  const extractionColor: Record<string, string> = { complete: "text-success", processing: "text-warning", pending: "text-muted-foreground", error: "text-destructive" };

  return (
    <div className="space-y-6">
      {/* Back button */}
      <Link to="/clients" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4 mr-1" /> Back to Clients
      </Link>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="h-16 w-16 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold text-2xl shrink-0">
            {client.logo}
          </div>
          <div>
            <h1 className="text-2xl font-bold">{client.name}</h1>
            <div className="flex flex-wrap items-center gap-3 mt-1 text-sm text-muted-foreground">
              <span className="flex items-center gap-1"><Building2 className="h-4 w-4" />{client.industry}</span>
              <span className="flex items-center gap-1"><DollarSign className="h-4 w-4" />{client.revenue}</span>
              <span className="flex items-center gap-1"><MapPin className="h-4 w-4" />{client.location}</span>
              <span className="flex items-center gap-1"><User className="h-4 w-4" />{client.contactName} · {client.contactRole}</span>
            </div>
            <p className={`text-sm mt-1`}>Health Score: <span className={`font-bold ${healthColor}`}>{client.healthScore}/100</span></p>
          </div>
        </div>
        <div className="flex gap-2 shrink-0">
          <Button variant="outline" size="sm"><Edit className="mr-1 h-4 w-4" /> Edit</Button>
          <Button variant="outline" size="sm"><Bot className="mr-1 h-4 w-4" /> Run AI Analysis</Button>
          <Button size="sm"><FileText className="mr-1 h-4 w-4" /> Generate Deliverable</Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="data">Data</TabsTrigger>
          <TabsTrigger value="analysis">Analysis</TabsTrigger>
          <TabsTrigger value="strategy">Strategy</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
          <TabsTrigger value="activity">Activity Log</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader><CardTitle className="text-base">Company Context</CardTitle></CardHeader>
              <CardContent><p className="text-sm text-muted-foreground">{client.description}</p>
                {engagement && (
                  <div className="mt-4 p-3 rounded-lg bg-muted">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">{engagement.type}</span>
                      <Badge variant="outline">{engagement.phase}</Badge>
                    </div>
                    <Progress value={engagement.progress} className="h-2" />
                    <p className="text-xs text-muted-foreground mt-1">{engagement.progress}% complete · Due {engagement.dueDate}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="text-base">Active Problems</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {clientInsights.filter(i => i.severity !== 'info').map((insight) => (
                  <div key={insight.id} className="flex items-start gap-2">
                    <AlertTriangle className={`h-4 w-4 mt-0.5 shrink-0 ${insight.severity === 'critical' ? 'text-destructive' : 'text-warning'}`} />
                    <div>
                      <p className="text-sm font-medium">{insight.title}</p>
                      <p className="text-xs text-muted-foreground">{insight.description}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="text-base">Strategic Goals & KPIs</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {[
                  { goal: 'Increase revenue by 15%', status: 'On Track', progress: 62 },
                  { goal: 'Reduce operational costs by 10%', status: 'Behind', progress: 35 },
                  { goal: 'Expand to 5 new markets', status: 'On Track', progress: 40 },
                ].map((kpi, i) => (
                  <div key={i}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm">{kpi.goal}</span>
                      <Badge variant={kpi.status === 'On Track' ? 'secondary' : 'destructive'} className="text-xs">{kpi.status}</Badge>
                    </div>
                    <Progress value={kpi.progress} className="h-1.5" />
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="text-base">Recent AI Insights</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {clientInsights.slice(0, 3).map((insight) => (
                  <div key={insight.id} className="p-2 rounded-lg bg-muted">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant={insight.severity === 'critical' ? 'destructive' : insight.severity === 'warning' ? 'secondary' : 'default'} className="text-xs">{insight.severity}</Badge>
                      <span className="text-sm font-medium">{insight.title}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{insight.source} · {new Date(insight.timestamp).toLocaleDateString()}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Data Tab */}
        <TabsContent value="data">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Documents</CardTitle>
                <Button size="sm"><Upload className="mr-1 h-4 w-4" /> Upload</Button>
              </div>
            </CardHeader>
            <CardContent>
              {clientDocs.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Upload className="h-10 w-10 mx-auto mb-2 opacity-40" />
                  <p>No documents yet. Upload files to begin analysis.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {clientDocs.map((doc) => {
                    const StatusIcon = extractionIcon[doc.extractionStatus];
                    return (
                      <div key={doc.id} className="flex items-center gap-3 p-3 rounded-lg border">
                        <FileText className="h-8 w-8 text-muted-foreground" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{doc.name}</p>
                          <p className="text-xs text-muted-foreground">{doc.type} · {doc.size} · Uploaded {doc.uploadDate}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <StatusIcon className={`h-4 w-4 ${extractionColor[doc.extractionStatus]}`} />
                          <span className="text-xs capitalize">{doc.extractionStatus}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analysis Tab */}
        <TabsContent value="analysis">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader><CardTitle className="text-base">Revenue Trend (12 Months)</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={280}>
                  <LineChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Line type="monotone" dataKey="actual" stroke="hsl(217, 91%, 53%)" strokeWidth={2} name="Actual" />
                    <Line type="monotone" dataKey="target" stroke="hsl(142, 72%, 36%)" strokeWidth={2} strokeDasharray="5 5" name="Target" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="text-base">Regional Revenue Split</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie data={regionalData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={4} dataKey="value" label={({ name, value }) => `${name} ${value}%`}>
                      {regionalData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                    </Pie>
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader><CardTitle className="text-base">AI-Generated Key Insights</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {[
                  { title: 'Revenue concentration risk in Midwest region', confidence: 92, framework: 'Porter\'s Five Forces' },
                  { title: 'Last-mile delivery costs 23% above industry average', confidence: 87, framework: 'Value Chain Analysis' },
                  { title: 'Customer acquisition cost trending upward since Q3', confidence: 78, framework: 'Unit Economics' },
                ].map((item, i) => (
                  <div key={i} className="flex items-start justify-between p-3 rounded-lg border">
                    <div>
                      <p className="text-sm font-medium">{item.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">Confidence: {item.confidence}%</Badge>
                        <Badge variant="secondary" className="text-xs">{item.framework}</Badge>
                      </div>
                    </div>
                    <Sheet>
                      <SheetTrigger asChild>
                        <Button size="sm" variant="ghost"><Eye className="mr-1 h-4 w-4" /> View Reasoning</Button>
                      </SheetTrigger>
                      <SheetContent>
                        <SheetHeader><SheetTitle>AI Reasoning Trace</SheetTitle></SheetHeader>
                        <div className="mt-6 space-y-4">
                          <div>
                            <h4 className="text-sm font-semibold mb-2">Sources</h4>
                            <ul className="text-sm text-muted-foreground space-y-1">
                              <li>• Q4 2025 Financial Report.pdf</li>
                              <li>• Operations Dashboard Export.xlsx</li>
                              <li>• Customer Survey Results.csv</li>
                            </ul>
                          </div>
                          <div>
                            <h4 className="text-sm font-semibold mb-2">Framework Applied</h4>
                            <p className="text-sm text-muted-foreground">{item.framework}</p>
                          </div>
                          <div>
                            <h4 className="text-sm font-semibold mb-2">Agent Steps</h4>
                            <ol className="text-sm text-muted-foreground space-y-2">
                              <li>1. Data Ingestion Agent extracted financial metrics</li>
                              <li>2. Financial Analysis Agent identified revenue patterns</li>
                              <li>3. Market Intelligence Agent cross-referenced industry benchmarks</li>
                              <li>4. Risk Assessment Agent evaluated concentration risk</li>
                            </ol>
                          </div>
                          <div>
                            <h4 className="text-sm font-semibold mb-2">Confidence Breakdown</h4>
                            <div className="space-y-1">
                              <div className="flex justify-between text-sm"><span>Data quality</span><span>{item.confidence - 5}%</span></div>
                              <div className="flex justify-between text-sm"><span>Framework fit</span><span>{item.confidence}%</span></div>
                              <div className="flex justify-between text-sm"><span>Cross-validation</span><span>{item.confidence - 8}%</span></div>
                            </div>
                          </div>
                        </div>
                      </SheetContent>
                    </Sheet>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Strategy Tab */}
        <TabsContent value="strategy">
          <Card className="mb-6 bg-primary/5 border-primary/20">
            <CardContent className="py-4">
              <p className="text-sm font-medium">Problem Statement</p>
              <p className="text-sm text-muted-foreground mt-1">ABC Distribution is experiencing margin compression due to rising last-mile delivery costs and increasing competition in the midwest region.</p>
            </CardContent>
          </Card>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {clientStrategies.map((strategy) => (
              <Card key={strategy.id} className={strategyStatuses[strategy.id] === 'accepted' ? 'border-success' : ''}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <Badge variant="outline">{strategy.label}</Badge>
                    {strategyStatuses[strategy.id] === 'accepted' && <CheckCircle className="h-5 w-5 text-success" />}
                  </div>
                  <CardTitle className="text-base mt-2">{strategy.title}</CardTitle>
                  <CardDescription className="text-xs">{strategy.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="p-2 rounded-lg bg-muted">
                      <p className="text-lg font-bold text-primary">{strategy.revenueChange}</p>
                      <p className="text-xs text-muted-foreground">Revenue</p>
                    </div>
                    <div className="p-2 rounded-lg bg-muted">
                      <p className="text-lg font-bold text-success">{strategy.costChange}</p>
                      <p className="text-xs text-muted-foreground">Cost</p>
                    </div>
                    <div className="p-2 rounded-lg bg-muted">
                      <p className="text-sm font-bold">{strategy.roiBreakeven}</p>
                      <p className="text-xs text-muted-foreground">ROI</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span>Impact: <strong>{strategy.impactScore}/10</strong></span>
                    <span>Risk: <strong>{strategy.riskScore}/10</strong></span>
                    <Badge variant="secondary">{strategy.investmentLevel}</Badge>
                  </div>
                  {strategyStatuses[strategy.id] === 'pending' && (
                    <div className="flex gap-2 pt-2">
                      <Button size="sm" className="flex-1" onClick={() => setStrategyStatuses(prev => ({ ...prev, [strategy.id]: 'accepted' }))}>
                        <CheckCircle className="mr-1 h-3 w-3" /> Accept
                      </Button>
                      <Button size="sm" variant="outline" className="flex-1" onClick={() => setStrategyStatuses(prev => ({ ...prev, [strategy.id]: 'rejected' }))}>
                        <XCircle className="mr-1 h-3 w-3" /> Reject
                      </Button>
                    </div>
                  )}
                  {strategyStatuses[strategy.id] === 'rejected' && (
                    <p className="text-xs text-center text-muted-foreground">Rejected</p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {Object.values(strategyStatuses).some(s => s === 'accepted') && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Accepted Strategies</CardTitle>
              </CardHeader>
              <CardContent>
                {clientStrategies.filter(s => strategyStatuses[s.id] === 'accepted').map(s => (
                  <div key={s.id} className="flex items-center justify-between py-2">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-success" />
                      <span className="text-sm font-medium">{s.title}</span>
                    </div>
                    <Button size="sm" variant="outline">View Roadmap</Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Reports Tab */}
        <TabsContent value="reports">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Generated Deliverables</CardTitle>
                <Link to="/deliverables"><Button size="sm">Generate New</Button></Link>
              </div>
            </CardHeader>
            <CardContent>
              {clientDeliverables.length === 0 ? (
                <p className="text-center py-8 text-muted-foreground">No deliverables generated yet.</p>
              ) : (
                <div className="space-y-2">
                  {clientDeliverables.map(del => (
                    <div key={del.id} className="flex items-center justify-between p-3 rounded-lg border">
                      <div>
                        <p className="text-sm font-medium">{del.type}</p>
                        <p className="text-xs text-muted-foreground">Audience: {del.audience} · {del.format} · {new Date(del.createdAt).toLocaleDateString()}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={del.status === 'complete' ? 'default' : 'secondary'}>{del.status}</Badge>
                        {del.downloadUrl && <Button size="sm" variant="outline"><Download className="h-4 w-4" /></Button>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Activity Log Tab */}
        <TabsContent value="activity">
          <Card>
            <CardHeader><CardTitle className="text-base">Activity Timeline</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-4">
                {activityLog.map((item) => (
                  <div key={item.id} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className="h-2.5 w-2.5 rounded-full bg-primary mt-1.5" />
                      <div className="w-px flex-1 bg-border" />
                    </div>
                    <div className="pb-4">
                      <p className="text-sm">{item.action}</p>
                      <p className="text-xs text-muted-foreground">{new Date(item.timestamp).toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
