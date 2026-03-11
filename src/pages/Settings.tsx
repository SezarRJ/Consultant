import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { User, Bell, Shield, Key } from "lucide-react";

export default function Settings() {
  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Manage your account and preferences.</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <User className="h-5 w-5 text-primary" />
            <CardTitle className="text-base">Profile</CardTitle>
          </div>
          <CardDescription>Update your personal information.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2"><Label>First Name</Label><Input defaultValue="Alex" /></div>
            <div className="space-y-2"><Label>Last Name</Label><Input defaultValue="Thompson" /></div>
          </div>
          <div className="space-y-2"><Label>Email</Label><Input defaultValue="alex@consulting.com" /></div>
          <div className="space-y-2"><Label>Role</Label><Input defaultValue="Senior Consultant" /></div>
          <Button size="sm">Save Changes</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-primary" />
            <CardTitle className="text-base">Notifications</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {[
            { label: 'Critical Insights', desc: 'Get notified for critical AI insights', default: true },
            { label: 'Analysis Complete', desc: 'When an AI analysis finishes', default: true },
            { label: 'Deliverable Ready', desc: 'When a report is generated', default: false },
            { label: 'Weekly Digest', desc: 'Summary of all activity', default: true },
          ].map((item, i) => (
            <div key={i} className="flex items-center justify-between">
              <div><p className="text-sm font-medium">{item.label}</p><p className="text-xs text-muted-foreground">{item.desc}</p></div>
              <Switch defaultChecked={item.default} />
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Key className="h-5 w-5 text-primary" />
            <CardTitle className="text-base">API Keys</CardTitle>
          </div>
          <CardDescription>Manage API keys for AI providers.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2"><Label>OpenAI API Key</Label><Input type="password" defaultValue="sk-*********************" /></div>
          <div className="space-y-2"><Label>Anthropic API Key</Label><Input type="password" defaultValue="sk-ant-***************" /></div>
          <Button size="sm" variant="outline">Update Keys</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            <CardTitle className="text-base">Security</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2"><Label>Current Password</Label><Input type="password" /></div>
          <div className="space-y-2"><Label>New Password</Label><Input type="password" /></div>
          <Button size="sm" variant="outline">Change Password</Button>
          <Separator />
          <div className="flex items-center justify-between">
            <div><p className="text-sm font-medium">Two-Factor Authentication</p><p className="text-xs text-muted-foreground">Add an extra layer of security</p></div>
            <Switch />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
