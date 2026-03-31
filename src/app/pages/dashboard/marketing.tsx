import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Input } from "../../components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../../components/ui/dialog";
import { Label } from "../../components/ui/label";
import { Separator } from "../../components/ui/separator";
import { toast } from "sonner";
import {
  Mail, MessageSquare, Send, Plus, BarChart3, Users,
  MousePointerClick, TrendingUp, Calendar, Clock,
  Target, Megaphone, ShoppingCart, Gift, Percent,
  Eye, Pencil, Trash2, Play, Pause, Copy
} from "lucide-react";

const campaigns = [
  { id: "1", name: "Summer Sale 2026", type: "email", status: "active", sent: 12450, opened: 4230, clicked: 1856, revenue: 45200, date: "2026-03-20" },
  { id: "2", name: "New Collection Launch", type: "email", status: "draft", sent: 0, opened: 0, clicked: 0, revenue: 0, date: "2026-03-28" },
  { id: "3", name: "Flash Sale Weekend", type: "sms", status: "completed", sent: 8500, opened: 7200, clicked: 3100, revenue: 28400, date: "2026-03-15" },
  { id: "4", name: "Welcome Series", type: "email", status: "active", sent: 3200, opened: 2100, clicked: 890, revenue: 12300, date: "2026-03-01" },
  { id: "5", name: "Cart Recovery", type: "email", status: "active", sent: 1560, opened: 980, clicked: 420, revenue: 8900, date: "2026-02-28" },
  { id: "6", name: "VIP Exclusive Offer", type: "sms", status: "scheduled", sent: 0, opened: 0, clicked: 0, revenue: 0, date: "2026-04-01" },
];

const automations = [
  { id: "1", name: "Welcome Email Series", trigger: "New signup", status: "active", sent: 4520, conversion: 18.5 },
  { id: "2", name: "Abandoned Cart Recovery", trigger: "Cart abandoned > 1hr", status: "active", sent: 2340, conversion: 12.3 },
  { id: "3", name: "Post-Purchase Follow-up", trigger: "Order delivered", status: "active", sent: 1890, conversion: 8.7 },
  { id: "4", name: "Re-engagement Campaign", trigger: "Inactive > 30 days", status: "paused", sent: 780, conversion: 5.2 },
  { id: "5", name: "Birthday Discount", trigger: "Customer birthday", status: "active", sent: 320, conversion: 22.1 },
];

const statusColors: Record<string, string> = {
  active: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  draft: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400",
  completed: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  scheduled: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  paused: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
};

export function Marketing() {
  const [tab, setTab] = useState("campaigns");
  const [showCreate, setShowCreate] = useState(false);
  const [campaignName, setCampaignName] = useState("");
  const [campaignType, setCampaignType] = useState("email");

  const totalSent = campaigns.reduce((s, c) => s + c.sent, 0);
  const totalRevenue = campaigns.reduce((s, c) => s + c.revenue, 0);
  const avgOpenRate = campaigns.filter(c => c.sent > 0).reduce((s, c) => s + (c.opened / c.sent), 0) / campaigns.filter(c => c.sent > 0).length * 100;
  const avgClickRate = campaigns.filter(c => c.sent > 0).reduce((s, c) => s + (c.clicked / c.sent), 0) / campaigns.filter(c => c.sent > 0).length * 100;

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-[1600px] mx-auto space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold mb-1">Marketing</h1>
          <p className="text-gray-600 dark:text-gray-400">Campaigns, automations & promotional tools</p>
        </div>
        <Dialog open={showCreate} onOpenChange={setShowCreate}>
          <DialogTrigger asChild>
            <Button className="gap-2"><Plus className="w-4 h-4" /> New Campaign</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Create Campaign</DialogTitle></DialogHeader>
            <div className="space-y-4 mt-4">
              <div>
                <Label>Campaign Name</Label>
                <Input value={campaignName} onChange={(e) => setCampaignName(e.target.value)} placeholder="e.g., Spring Sale 2026" className="mt-1" />
              </div>
              <div>
                <Label>Type</Label>
                <div className="flex gap-2 mt-1">
                  {[{v: "email", l: "Email", i: Mail}, {v: "sms", l: "SMS", i: MessageSquare}].map(({v, l, i: Icon}) => (
                    <Button key={v} variant={campaignType === v ? "default" : "outline"} className="flex-1 gap-2" onClick={() => setCampaignType(v)}>
                      <Icon className="w-4 h-4" /> {l}
                    </Button>
                  ))}
                </div>
              </div>
              <Button className="w-full" onClick={() => { toast.success("Campaign created!"); setShowCreate(false); setCampaignName(""); }}>
                Create Campaign
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Sent", value: totalSent.toLocaleString(), icon: Send, color: "text-purple-600" },
          { label: "Avg Open Rate", value: `${avgOpenRate.toFixed(1)}%`, icon: Eye, color: "text-blue-600" },
          { label: "Avg Click Rate", value: `${avgClickRate.toFixed(1)}%`, icon: MousePointerClick, color: "text-green-600" },
          { label: "Revenue Generated", value: `$${totalRevenue.toLocaleString()}`, icon: TrendingUp, color: "text-orange-600" },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-4 flex items-center gap-3">
              <div className={`p-2 rounded-lg bg-gray-100 dark:bg-gray-800 ${stat.color}`}>
                <stat.icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">{stat.label}</p>
                <p className="text-lg font-bold">{stat.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="campaigns" className="gap-1.5"><Megaphone className="w-3.5 h-3.5" /> Campaigns</TabsTrigger>
          <TabsTrigger value="automations" className="gap-1.5"><Target className="w-3.5 h-3.5" /> Automations</TabsTrigger>
          <TabsTrigger value="tools" className="gap-1.5"><Gift className="w-3.5 h-3.5" /> Tools</TabsTrigger>
        </TabsList>

        <TabsContent value="campaigns" className="mt-4">
          <div className="space-y-3">
            {campaigns.map((c) => (
              <Card key={c.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between flex-wrap gap-3">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${c.type === 'email' ? 'bg-purple-100 dark:bg-purple-900/30' : 'bg-blue-100 dark:bg-blue-900/30'}`}>
                        {c.type === 'email' ? <Mail className="w-5 h-5 text-purple-600" /> : <MessageSquare className="w-5 h-5 text-blue-600" />}
                      </div>
                      <div>
                        <h3 className="font-semibold text-sm">{c.name}</h3>
                        <div className="flex items-center gap-2 mt-0.5">
                          <Badge className={`text-[10px] ${statusColors[c.status]}`}>{c.status}</Badge>
                          <span className="text-xs text-gray-500">{c.date}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-6 text-sm">
                      {c.sent > 0 && (
                        <>
                          <div className="text-center"><p className="text-xs text-gray-500">Sent</p><p className="font-semibold">{c.sent.toLocaleString()}</p></div>
                          <div className="text-center"><p className="text-xs text-gray-500">Opened</p><p className="font-semibold">{((c.opened / c.sent) * 100).toFixed(1)}%</p></div>
                          <div className="text-center"><p className="text-xs text-gray-500">Clicked</p><p className="font-semibold">{((c.clicked / c.sent) * 100).toFixed(1)}%</p></div>
                          <div className="text-center"><p className="text-xs text-gray-500">Revenue</p><p className="font-semibold text-green-600">${c.revenue.toLocaleString()}</p></div>
                        </>
                      )}
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0"><Pencil className="w-3.5 h-3.5" /></Button>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0"><Copy className="w-3.5 h-3.5" /></Button>
                        {c.status === 'active' ? (
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0"><Pause className="w-3.5 h-3.5" /></Button>
                        ) : c.status === 'draft' ? (
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-green-600"><Play className="w-3.5 h-3.5" /></Button>
                        ) : null}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="automations" className="mt-4">
          <div className="space-y-3">
            {automations.map((a) => (
              <Card key={a.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between flex-wrap gap-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-indigo-100 dark:bg-indigo-900/30">
                        <Target className="w-5 h-5 text-indigo-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-sm">{a.name}</h3>
                        <p className="text-xs text-gray-500 mt-0.5">Trigger: {a.trigger}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6 text-sm">
                      <Badge className={statusColors[a.status]}>{a.status}</Badge>
                      <div className="text-center"><p className="text-xs text-gray-500">Sent</p><p className="font-semibold">{a.sent.toLocaleString()}</p></div>
                      <div className="text-center"><p className="text-xs text-gray-500">Conversion</p><p className="font-semibold text-green-600">{a.conversion}%</p></div>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        {a.status === 'active' ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="tools" className="mt-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { name: "Abandoned Cart Recovery", desc: "Automatically recover lost sales with targeted emails", icon: ShoppingCart, color: "text-red-600", bg: "bg-red-100 dark:bg-red-900/30", active: true },
              { name: "Discount Code Generator", desc: "Create unique discount codes for campaigns", icon: Percent, color: "text-green-600", bg: "bg-green-100 dark:bg-green-900/30", active: true },
              { name: "Social Media Scheduler", desc: "Schedule posts across Facebook, Instagram, Twitter", icon: Calendar, color: "text-blue-600", bg: "bg-blue-100 dark:bg-blue-900/30", active: false },
              { name: "Push Notifications", desc: "Send browser push notifications to subscribers", icon: Megaphone, color: "text-purple-600", bg: "bg-purple-100 dark:bg-purple-900/30", active: false },
              { name: "Referral Program", desc: "Let customers earn rewards for referrals", icon: Users, color: "text-orange-600", bg: "bg-orange-100 dark:bg-orange-900/30", active: false },
              { name: "A/B Testing", desc: "Test different content to optimize conversions", icon: BarChart3, color: "text-teal-600", bg: "bg-teal-100 dark:bg-teal-900/30", active: false },
            ].map((tool) => (
              <Card key={tool.name} className="hover:shadow-md transition-shadow">
                <CardContent className="p-5">
                  <div className={`p-2.5 rounded-xl ${tool.bg} w-fit mb-3`}>
                    <tool.icon className={`w-6 h-6 ${tool.color}`} />
                  </div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-sm">{tool.name}</h3>
                    {tool.active && <Badge className="bg-green-100 text-green-700 text-[10px]">Active</Badge>}
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">{tool.desc}</p>
                  <Button variant={tool.active ? "outline" : "default"} size="sm" className="w-full">
                    {tool.active ? "Configure" : "Enable"}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
