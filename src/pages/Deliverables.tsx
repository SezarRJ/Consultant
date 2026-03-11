import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { clients, deliverables } from "@/data/mockData";
import { FileText, Download, Loader2, CheckCircle, ChevronRight } from "lucide-react";

const reportTypes = ['Executive Summary', 'Full Report', 'Strategy Presentation', 'Board Report', 'Implementation Plan', 'Financial Analysis'];
const audiences = ['CEO', 'Board', 'Marketing', 'Operations', 'Finance', 'All Stakeholders'];
const formats = ['PDF', 'PPTX', 'DOCX'];

const tonePreview: Record<string, string> = {
  CEO: 'Strategic, concise, outcome-focused. Emphasizes ROI and competitive positioning.',
  Board: 'Formal, data-driven, comprehensive. Includes governance implications and risk assessment.',
  Marketing: 'Customer-centric, growth-oriented. Highlights market opportunities and brand positioning.',
  Operations: 'Process-focused, detailed, actionable. Includes implementation timelines and resource needs.',
  Finance: 'Quantitative, analytical. Emphasizes financial projections, margins, and cost structures.',
  'All Stakeholders': 'Balanced, accessible language. Covers strategic vision with supporting data.',
};

export default function Deliverables() {
  const [step, setStep] = useState(1);
  const [selectedClient, setSelectedClient] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedAudience, setSelectedAudience] = useState('');
  const [selectedFormat, setSelectedFormat] = useState('PDF');
  const [options, setOptions] = useState({ charts: true, appendix: false, executive: true });
  const [generating, setGenerating] = useState(false);
  const [generated, setGenerated] = useState(false);

  const handleGenerate = () => {
    setGenerating(true);
    setTimeout(() => { setGenerating(false); setGenerated(true); }, 3000);
  };

  const reset = () => { setStep(1); setSelectedType(''); setSelectedAudience(''); setGenerated(false); };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Deliverable Generator</h1>
        <p className="text-muted-foreground">Create polished reports and presentations.</p>
      </div>

      {/* Wizard Steps Indicator */}
      <div className="flex items-center gap-2 mb-4">
        {[1, 2, 3].map(s => (
          <div key={s} className="flex items-center gap-2">
            <div className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-medium ${step >= s ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>{s}</div>
            <span className={`text-sm ${step >= s ? 'font-medium' : 'text-muted-foreground'}`}>
              {s === 1 ? 'Choose Type' : s === 2 ? 'Select Audience' : 'Configure'}
            </span>
            {s < 3 && <ChevronRight className="h-4 w-4 text-muted-foreground" />}
          </div>
        ))}
      </div>

      {/* Step 1 */}
      {step === 1 && (
        <div className="space-y-4">
          <div className="mb-4">
            <Label className="mb-2 block">Client</Label>
            <Select value={selectedClient} onValueChange={setSelectedClient}>
              <SelectTrigger className="w-64"><SelectValue placeholder="Select client" /></SelectTrigger>
              <SelectContent>{clients.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {reportTypes.map(type => (
              <Card key={type} className={`cursor-pointer hover:shadow-md transition-shadow ${selectedType === type ? 'ring-2 ring-primary' : ''}`} onClick={() => setSelectedType(type)}>
                <CardContent className="pt-6 text-center">
                  <FileText className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm font-medium">{type}</p>
                </CardContent>
              </Card>
            ))}
          </div>
          <Button disabled={!selectedType || !selectedClient} onClick={() => setStep(2)}>Next <ChevronRight className="ml-1 h-4 w-4" /></Button>
        </div>
      )}

      {/* Step 2 */}
      {step === 2 && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {audiences.map(aud => (
              <Card key={aud} className={`cursor-pointer hover:shadow-md transition-shadow ${selectedAudience === aud ? 'ring-2 ring-primary' : ''}`} onClick={() => setSelectedAudience(aud)}>
                <CardContent className="pt-6 text-center">
                  <p className="text-sm font-medium">{aud}</p>
                </CardContent>
              </Card>
            ))}
          </div>
          {selectedAudience && (
            <Card className="bg-muted/50">
              <CardContent className="pt-4">
                <p className="text-xs font-medium text-muted-foreground mb-1">Tone Preview</p>
                <p className="text-sm italic">{tonePreview[selectedAudience]}</p>
              </CardContent>
            </Card>
          )}
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setStep(1)}>Back</Button>
            <Button disabled={!selectedAudience} onClick={() => setStep(3)}>Next <ChevronRight className="ml-1 h-4 w-4" /></Button>
          </div>
        </div>
      )}

      {/* Step 3 */}
      {step === 3 && !generated && (
        <div className="space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-base">Configuration</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="mb-2 block">Output Format</Label>
                <div className="flex gap-2">
                  {formats.map(f => (
                    <Button key={f} variant={selectedFormat === f ? 'default' : 'outline'} size="sm" onClick={() => setSelectedFormat(f)}>{f}</Button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <Label>Options</Label>
                <div className="flex items-center gap-2"><Checkbox checked={options.charts} onCheckedChange={(c) => setOptions(p => ({ ...p, charts: !!c }))} /><span className="text-sm">Include charts & visualizations</span></div>
                <div className="flex items-center gap-2"><Checkbox checked={options.appendix} onCheckedChange={(c) => setOptions(p => ({ ...p, appendix: !!c }))} /><span className="text-sm">Include data appendix</span></div>
                <div className="flex items-center gap-2"><Checkbox checked={options.executive} onCheckedChange={(c) => setOptions(p => ({ ...p, executive: !!c }))} /><span className="text-sm">Include executive summary</span></div>
              </div>
              <div className="p-3 rounded-lg bg-muted text-sm">
                <p><strong>Summary:</strong> {selectedType} for {selectedAudience} as {selectedFormat}</p>
                <p className="text-muted-foreground">Client: {clients.find(c => c.id === selectedClient)?.name}</p>
              </div>
            </CardContent>
          </Card>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setStep(2)}>Back</Button>
            <Button onClick={handleGenerate} disabled={generating}>
              {generating ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating...</> : 'Generate Deliverable'}
            </Button>
          </div>
        </div>
      )}

      {/* Generated */}
      {generated && (
        <Card className="border-success">
          <CardContent className="pt-6 text-center space-y-3">
            <CheckCircle className="h-12 w-12 text-success mx-auto" />
            <p className="text-lg font-semibold">Deliverable Generated!</p>
            <p className="text-sm text-muted-foreground">{selectedType} for {selectedAudience} — {selectedFormat}</p>
            <div className="flex gap-2 justify-center">
              <Button><Download className="mr-1 h-4 w-4" /> Download</Button>
              <Button variant="outline" onClick={reset}>Generate Another</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Deliverables */}
      <Card>
        <CardHeader><CardTitle className="text-base">Recent Deliverables</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {deliverables.map(del => (
            <div key={del.id} className="flex items-center justify-between p-3 rounded-lg border">
              <div>
                <p className="text-sm font-medium">{del.type}</p>
                <p className="text-xs text-muted-foreground">{del.clientName} · {del.audience} · {del.format} · {new Date(del.createdAt).toLocaleDateString()}</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={del.status === 'complete' ? 'default' : 'secondary'}>{del.status}</Badge>
                {del.downloadUrl && <Button size="sm" variant="outline"><Download className="h-4 w-4" /></Button>}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
