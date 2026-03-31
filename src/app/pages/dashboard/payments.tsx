import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { Input } from "../../components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../components/ui/dialog";
import { Label } from "../../components/ui/label";
import { Switch } from "../../components/ui/switch";
import { toast } from "sonner";
import {
  CreditCard, CheckCircle, DollarSign, TrendingUp, ArrowDownRight,
  ArrowUpRight, Search, Download, Filter, Clock, AlertCircle,
  Shield, Settings, ExternalLink, RefreshCcw
} from "lucide-react";
import { dataProvider } from "../../lib/data-provider";

const paymentProviders = [
  { id: "stripe", name: "Stripe", description: "Credit cards, Apple Pay, Google Pay, ACH transfers", color: "text-purple-600", bg: "bg-purple-100 dark:bg-purple-900/30", connected: true, fee: "2.9% + $0.30" },
  { id: "paypal", name: "PayPal", description: "PayPal balance, Pay Later, Venmo", color: "text-blue-700", bg: "bg-blue-100 dark:bg-blue-900/30", connected: true, fee: "3.49% + $0.49" },
  { id: "clover", name: "Clover POS", description: "In-store and online payments with POS sync", color: "text-green-600", bg: "bg-green-100 dark:bg-green-900/30", connected: false, fee: "2.3% + $0.10" },
  { id: "nmi", name: "NMI Gateway", description: "Network Merchants Inc payment processing", color: "text-gray-700", bg: "bg-gray-100 dark:bg-gray-800", connected: false, fee: "Custom" },
];

const recentTransactions = [
  { id: "txn_1", orderId: "ORD-001", customer: "Sarah Johnson", amount: 129.99, status: "succeeded", method: "Visa •••• 4242", provider: "Stripe", date: "2026-03-30 14:23" },
  { id: "txn_2", orderId: "ORD-002", customer: "Mike Chen", amount: 89.50, status: "succeeded", method: "PayPal", provider: "PayPal", date: "2026-03-30 12:15" },
  { id: "txn_3", orderId: "ORD-003", customer: "Emily Davis", amount: 245.00, status: "succeeded", method: "Mastercard •••• 5555", provider: "Stripe", date: "2026-03-29 18:42" },
  { id: "txn_4", orderId: "ORD-004", customer: "Alex Rivera", amount: 67.25, status: "failed", method: "Visa •••• 1234", provider: "Stripe", date: "2026-03-29 15:30" },
  { id: "txn_5", orderId: "ORD-005", customer: "Jordan Kim", amount: 199.99, status: "succeeded", method: "Apple Pay", provider: "Stripe", date: "2026-03-29 10:55" },
  { id: "txn_6", orderId: "ORD-006", customer: "Taylor Wright", amount: 54.00, status: "refunded", method: "PayPal", provider: "PayPal", date: "2026-03-28 16:20" },
  { id: "txn_7", orderId: "ORD-007", customer: "Morgan Lee", amount: 312.50, status: "succeeded", method: "Amex •••• 3782", provider: "Stripe", date: "2026-03-28 09:10" },
  { id: "txn_8", orderId: "ORD-008", customer: "Casey Adams", amount: 78.00, status: "pending", method: "Visa •••• 9876", provider: "Stripe", date: "2026-03-27 20:45" },
];

const statusConfig: Record<string, { color: string; icon: any }> = {
  succeeded: { color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400", icon: CheckCircle },
  failed: { color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400", icon: AlertCircle },
  refunded: { color: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400", icon: RefreshCcw },
  pending: { color: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400", icon: Clock },
};

export function Payments() {
  const [tab, setTab] = useState("transactions");
  const [search, setSearch] = useState("");
  const [configuring, setConfiguring] = useState<string | null>(null);

  const totalRevenue = recentTransactions.filter(t => t.status === "succeeded").reduce((s, t) => s + t.amount, 0);
  const successRate = (recentTransactions.filter(t => t.status === "succeeded").length / recentTransactions.length * 100);
  const refundTotal = recentTransactions.filter(t => t.status === "refunded").reduce((s, t) => s + t.amount, 0);

  const filteredTransactions = recentTransactions.filter(t =>
    !search || t.customer.toLowerCase().includes(search.toLowerCase()) || t.orderId.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-[1600px] mx-auto space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold mb-1">Payments</h1>
        <p className="text-gray-600 dark:text-gray-400">Transaction history and payment provider management</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Revenue", value: `$${totalRevenue.toFixed(2)}`, icon: DollarSign, trend: "+12.5%", up: true, color: "text-green-600" },
          { label: "Transactions", value: recentTransactions.length.toString(), icon: CreditCard, trend: "+8", up: true, color: "text-blue-600" },
          { label: "Success Rate", value: `${successRate.toFixed(1)}%`, icon: TrendingUp, trend: "+2.1%", up: true, color: "text-purple-600" },
          { label: "Refunds", value: `$${refundTotal.toFixed(2)}`, icon: RefreshCcw, trend: "-15%", up: false, color: "text-orange-600" },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
                <span className={`text-xs flex items-center gap-0.5 ${stat.up ? 'text-green-600' : 'text-red-500'}`}>
                  {stat.up ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />} {stat.trend}
                </span>
              </div>
              <p className="text-lg font-bold">{stat.value}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="transactions" className="gap-1.5"><CreditCard className="w-3.5 h-3.5" /> Transactions</TabsTrigger>
          <TabsTrigger value="providers" className="gap-1.5"><Shield className="w-3.5 h-3.5" /> Providers</TabsTrigger>
        </TabsList>

        <TabsContent value="transactions" className="mt-4 space-y-4">
          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input placeholder="Search transactions..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <Button variant="outline" size="sm" className="gap-1.5"><Download className="w-3.5 h-3.5" /> Export</Button>
          </div>

          <div className="rounded-lg border border-gray-200 dark:border-gray-800 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-900">
                <tr>
                  <th className="text-left p-3 font-medium text-gray-500">Transaction</th>
                  <th className="text-left p-3 font-medium text-gray-500">Customer</th>
                  <th className="text-left p-3 font-medium text-gray-500 hidden md:table-cell">Method</th>
                  <th className="text-left p-3 font-medium text-gray-500 hidden lg:table-cell">Provider</th>
                  <th className="text-right p-3 font-medium text-gray-500">Amount</th>
                  <th className="text-center p-3 font-medium text-gray-500">Status</th>
                  <th className="text-right p-3 font-medium text-gray-500 hidden md:table-cell">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {filteredTransactions.map((txn) => {
                  const sc = statusConfig[txn.status];
                  const StatusIcon = sc.icon;
                  return (
                    <tr key={txn.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/50">
                      <td className="p-3 font-mono text-xs">{txn.orderId}</td>
                      <td className="p-3">{txn.customer}</td>
                      <td className="p-3 text-xs text-gray-500 hidden md:table-cell">{txn.method}</td>
                      <td className="p-3 text-xs hidden lg:table-cell">{txn.provider}</td>
                      <td className="p-3 text-right font-semibold">${txn.amount.toFixed(2)}</td>
                      <td className="p-3 text-center">
                        <Badge className={`${sc.color} text-[10px] gap-0.5`}><StatusIcon className="w-2.5 h-2.5" /> {txn.status}</Badge>
                      </td>
                      <td className="p-3 text-right text-xs text-gray-500 hidden md:table-cell">{txn.date}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </TabsContent>

        <TabsContent value="providers" className="mt-4">
          <div className="grid md:grid-cols-2 gap-4">
            {paymentProviders.map((provider) => (
              <Card key={provider.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`p-3 rounded-xl ${provider.bg}`}>
                        <CreditCard className={`w-6 h-6 ${provider.color}`} />
                      </div>
                      <div>
                        <h3 className="font-semibold flex items-center gap-2">
                          {provider.name}
                          {provider.connected && <Badge className="bg-green-100 text-green-700 text-[10px]"><CheckCircle className="w-2.5 h-2.5 mr-0.5" /> Active</Badge>}
                        </h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{provider.description}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                    <span>Processing fee: {provider.fee}</span>
                  </div>
                  <div className="flex gap-2">
                    <Button variant={provider.connected ? "outline" : "default"} size="sm" className="flex-1" onClick={() => provider.connected ? setConfiguring(provider.id) : toast.success(`${provider.name} connected!`)}>
                      {provider.connected ? <><Settings className="w-3.5 h-3.5 mr-1.5" /> Configure</> : "Connect"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Configure Dialog */}
      <Dialog open={!!configuring} onOpenChange={() => setConfiguring(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Configure {paymentProviders.find(p => p.id === configuring)?.name}</DialogTitle></DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <Label>API Key (Secret)</Label>
              <Input type="password" placeholder="sk_live_..." className="mt-1 font-mono" />
            </div>
            <div>
              <Label>Publishable Key</Label>
              <Input placeholder="pk_live_..." className="mt-1 font-mono" />
            </div>
            <div>
              <Label>Webhook Endpoint</Label>
              <Input readOnly value="https://api.yourdomain.com/api/v1/payments/webhooks/stripe" className="mt-1 font-mono text-xs bg-gray-50 dark:bg-gray-900" />
            </div>
            <div className="flex items-center justify-between">
              <div><Label>Test Mode</Label><p className="text-xs text-gray-500">Use test API keys</p></div>
              <Switch />
            </div>
            <div className="flex items-center justify-between">
              <div><Label>Auto-capture</Label><p className="text-xs text-gray-500">Capture payments automatically</p></div>
              <Switch defaultChecked />
            </div>
            <Button className="w-full" onClick={() => { toast.success("Settings saved!"); setConfiguring(null); }}>Save Configuration</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
