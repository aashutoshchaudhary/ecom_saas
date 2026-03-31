import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Input } from "../../components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../components/ui/dialog";
import { Label } from "../../components/ui/label";
import { Switch } from "../../components/ui/switch";
import { toast } from "sonner";
import { CheckCircle, Search, ExternalLink, Settings, Zap, BarChart3, CreditCard, Truck, Mail, MessageSquare, Database, Globe, ShoppingBag, Users, Shield } from "lucide-react";

const integrations = [
  // Analytics & Tracking
  { id: "google-analytics", name: "Google Analytics 4", description: "Track website traffic, user behavior, and conversions", icon: BarChart3, category: "analytics", connected: true, color: "text-orange-600", bg: "bg-orange-100 dark:bg-orange-900/30" },
  { id: "facebook-pixel", name: "Facebook Pixel", description: "Track conversions and build audiences for Meta ads", icon: Users, category: "analytics", connected: false, color: "text-blue-600", bg: "bg-blue-100 dark:bg-blue-900/30" },
  { id: "hotjar", name: "Hotjar", description: "Heatmaps, recordings, and user feedback", icon: BarChart3, category: "analytics", connected: false, color: "text-red-600", bg: "bg-red-100 dark:bg-red-900/30" },
  { id: "google-tag-manager", name: "Google Tag Manager", description: "Manage marketing tags without editing code", icon: Globe, category: "analytics", connected: true, color: "text-blue-500", bg: "bg-blue-100 dark:bg-blue-900/30" },

  // Payments
  { id: "stripe", name: "Stripe", description: "Accept credit cards, Apple Pay, Google Pay", icon: CreditCard, category: "payments", connected: true, color: "text-purple-600", bg: "bg-purple-100 dark:bg-purple-900/30" },
  { id: "paypal", name: "PayPal", description: "Accept PayPal and Pay Later payments", icon: CreditCard, category: "payments", connected: false, color: "text-blue-700", bg: "bg-blue-100 dark:bg-blue-900/30" },
  { id: "clover", name: "Clover POS", description: "Sync with Clover POS for in-store and online", icon: ShoppingBag, category: "payments", connected: false, color: "text-green-600", bg: "bg-green-100 dark:bg-green-900/30" },
  { id: "square", name: "Square", description: "Square payments and POS integration", icon: CreditCard, category: "payments", connected: false, color: "text-gray-700", bg: "bg-gray-100 dark:bg-gray-800" },

  // Marketing
  { id: "mailchimp", name: "Mailchimp", description: "Email marketing and audience management", icon: Mail, category: "marketing", connected: true, color: "text-yellow-600", bg: "bg-yellow-100 dark:bg-yellow-900/30" },
  { id: "klaviyo", name: "Klaviyo", description: "Advanced email & SMS marketing automation", icon: Mail, category: "marketing", connected: false, color: "text-green-600", bg: "bg-green-100 dark:bg-green-900/30" },
  { id: "twilio", name: "Twilio", description: "SMS notifications and marketing messages", icon: MessageSquare, category: "marketing", connected: false, color: "text-red-500", bg: "bg-red-100 dark:bg-red-900/30" },

  // Shipping & Logistics
  { id: "shipstation", name: "ShipStation", description: "Multi-carrier shipping automation", icon: Truck, category: "shipping", connected: false, color: "text-green-600", bg: "bg-green-100 dark:bg-green-900/30" },
  { id: "shippo", name: "Shippo", description: "Compare rates and print shipping labels", icon: Truck, category: "shipping", connected: false, color: "text-blue-500", bg: "bg-blue-100 dark:bg-blue-900/30" },

  // Automation
  { id: "zapier", name: "Zapier", description: "Connect 5,000+ apps with automated workflows", icon: Zap, category: "automation", connected: false, color: "text-orange-500", bg: "bg-orange-100 dark:bg-orange-900/30" },
  { id: "make", name: "Make (Integromat)", description: "Visual automation platform for complex workflows", icon: Zap, category: "automation", connected: false, color: "text-purple-500", bg: "bg-purple-100 dark:bg-purple-900/30" },

  // Business Tools
  { id: "quickbooks", name: "QuickBooks", description: "Accounting, invoicing, and financial reporting", icon: Database, category: "business", connected: false, color: "text-green-700", bg: "bg-green-100 dark:bg-green-900/30" },
  { id: "slack", name: "Slack", description: "Get notifications for orders, alerts, and events", icon: MessageSquare, category: "business", connected: false, color: "text-purple-600", bg: "bg-purple-100 dark:bg-purple-900/30" },

  // Security
  { id: "cloudflare", name: "Cloudflare", description: "CDN, DDoS protection, and SSL management", icon: Shield, category: "security", connected: false, color: "text-orange-600", bg: "bg-orange-100 dark:bg-orange-900/30" },
];

const categories = [
  { id: "all", label: "All" },
  { id: "analytics", label: "Analytics" },
  { id: "payments", label: "Payments" },
  { id: "marketing", label: "Marketing" },
  { id: "shipping", label: "Shipping" },
  { id: "automation", label: "Automation" },
  { id: "business", label: "Business" },
  { id: "security", label: "Security" },
];

export function Integrations() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [configuring, setConfiguring] = useState<string | null>(null);
  const [connectionStates, setConnectionStates] = useState<Record<string, boolean>>(
    Object.fromEntries(integrations.map(i => [i.id, i.connected]))
  );

  const filtered = integrations.filter(i => {
    const matchSearch = !search || i.name.toLowerCase().includes(search.toLowerCase()) || i.description.toLowerCase().includes(search.toLowerCase());
    const matchCategory = category === "all" || i.category === category;
    return matchSearch && matchCategory;
  });

  const connectedCount = Object.values(connectionStates).filter(Boolean).length;
  const configuringIntegration = integrations.find(i => i.id === configuring);

  const toggleConnection = (id: string) => {
    setConnectionStates(prev => {
      const newState = !prev[id];
      toast.success(newState ? `${integrations.find(i => i.id === id)?.name} connected!` : `Disconnected`);
      return { ...prev, [id]: newState };
    });
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-[1600px] mx-auto space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold mb-1">Integrations</h1>
          <p className="text-gray-600 dark:text-gray-400">{connectedCount} of {integrations.length} connected</p>
        </div>
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input placeholder="Search integrations..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </div>

      {/* Category Tabs */}
      <Tabs value={category} onValueChange={setCategory}>
        <TabsList className="flex-wrap h-auto gap-1">
          {categories.map(c => (
            <TabsTrigger key={c.id} value={c.id} className="text-xs">{c.label}</TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {/* Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((integration) => {
          const isConnected = connectionStates[integration.id];
          const Icon = integration.icon;
          return (
            <Card key={integration.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-xl ${integration.bg}`}>
                      <Icon className={`w-6 h-6 ${integration.color}`} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm flex items-center gap-2">
                        {integration.name}
                        {isConnected && <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 text-[10px]"><CheckCircle className="w-2.5 h-2.5 mr-0.5" /> Active</Badge>}
                      </h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{integration.description}</p>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant={isConnected ? "outline" : "default"} size="sm" className="flex-1" onClick={() => isConnected ? setConfiguring(integration.id) : toggleConnection(integration.id)}>
                    {isConnected ? <><Settings className="w-3.5 h-3.5 mr-1.5" /> Configure</> : "Connect"}
                  </Button>
                  {isConnected && (
                    <Button variant="ghost" size="sm" className="text-red-500" onClick={() => toggleConnection(integration.id)}>
                      Disconnect
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Configure Dialog */}
      <Dialog open={!!configuring} onOpenChange={() => setConfiguring(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {configuringIntegration && <configuringIntegration.icon className={`w-5 h-5 ${configuringIntegration.color}`} />}
              Configure {configuringIntegration?.name}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <Label>API Key</Label>
              <Input type="password" placeholder="Enter your API key" className="mt-1" />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Auto-sync</Label>
                <p className="text-xs text-gray-500">Sync data automatically every hour</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Notifications</Label>
                <p className="text-xs text-gray-500">Get alerts for sync failures</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex gap-2 pt-2">
              <Button className="flex-1" onClick={() => { toast.success("Settings saved!"); setConfiguring(null); }}>Save Settings</Button>
              <Button variant="outline" onClick={() => setConfiguring(null)}>Cancel</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
