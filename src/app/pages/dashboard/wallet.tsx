import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Switch } from "../../components/ui/switch";
import { Separator } from "../../components/ui/separator";
import { Progress } from "../../components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../../components/ui/dialog";
import {
  Coins,
  Plus,
  TrendingUp,
  TrendingDown,
  Sparkles,
  Zap,
  ArrowUpRight,
  ArrowDownLeft,
  RotateCcw,
  CheckCircle,
  Crown,
} from "lucide-react";
import { mockWallet, mockUser } from "../../lib/mock-data";
import { dataProvider } from "../../lib/data-provider";
import { useApiQuery } from "../../lib/hooks";
import { toast } from "sonner";

export function Wallet() {
  const { data: walletData } = useApiQuery(() => dataProvider.getWallet(), []);
  const wallet = walletData || mockWallet;
  const [autoTopUp, setAutoTopUp] = useState(wallet.autoTopUp);

  const usagePercentage = (wallet.totalUsed / wallet.totalPurchased) * 100;

  const handlePurchase = (packName: string) => {
    toast.success(`${packName} purchased successfully! Credits added to your wallet.`);
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-[1600px] mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Coins className="w-8 h-8 text-purple-600" />
            <h1 className="text-2xl md:text-3xl font-bold">Credits & Wallet</h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your AI credits, view usage history, and purchase credit packs
          </p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="gap-2 bg-gradient-to-r from-purple-600 to-blue-600">
              <Plus className="w-4 h-4" />
              Buy Credits
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Purchase Credit Packs</DialogTitle>
            </DialogHeader>
            <div className="grid md:grid-cols-2 gap-4 mt-4">
              {wallet.pricing.map((pack) => (
                <Card
                  key={pack.id}
                  className={`relative cursor-pointer hover:shadow-lg transition-shadow ${
                    pack.popular ? "ring-2 ring-purple-600" : ""
                  }`}
                >
                  {pack.popular && (
                    <Badge className="absolute -top-2 left-1/2 -translate-x-1/2 bg-gradient-to-r from-purple-600 to-blue-600">
                      Most Popular
                    </Badge>
                  )}
                  <CardContent className="p-6 text-center">
                    <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center mx-auto mb-3">
                      <Coins className="w-6 h-6 text-purple-600" />
                    </div>
                    <h3 className="font-semibold text-lg">{pack.name}</h3>
                    <p className="text-3xl font-bold mt-2">{pack.credits.toLocaleString()}</p>
                    <p className="text-sm text-gray-500 mb-4">credits</p>
                    <p className="text-2xl font-bold text-purple-600">${pack.price}</p>
                    <p className="text-xs text-gray-500 mb-4">
                      ${(pack.price / pack.credits * 1000).toFixed(2)} per 1K credits
                    </p>
                    <Button
                      className="w-full"
                      variant={pack.popular ? "default" : "outline"}
                      onClick={() => handlePurchase(pack.name)}
                    >
                      Purchase
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Balance Cards */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-purple-600 to-blue-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm opacity-90">Available Credits</p>
              <Coins className="w-6 h-6 opacity-80" />
            </div>
            <p className="text-4xl font-bold">{wallet.balance.toLocaleString()}</p>
            <div className="mt-3 flex items-center gap-2">
              <Badge className="bg-white/20 text-white border-0">
                <Crown className="w-3 h-3 mr-1" />
                {mockUser.plan} Plan
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Purchased</p>
              <ArrowDownLeft className="w-5 h-5 text-green-500" />
            </div>
            <p className="text-3xl font-bold">{wallet.totalPurchased.toLocaleString()}</p>
            <p className="text-sm text-green-600 mt-1">+5,000 this month</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Used</p>
              <ArrowUpRight className="w-5 h-5 text-orange-500" />
            </div>
            <p className="text-3xl font-bold">{wallet.totalUsed.toLocaleString()}</p>
            <p className="text-sm text-orange-600 mt-1">-525 this month</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600 dark:text-gray-400">Usage Rate</p>
              <Zap className="w-5 h-5 text-purple-500" />
            </div>
            <p className="text-3xl font-bold">{usagePercentage.toFixed(0)}%</p>
            <Progress value={usagePercentage} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="history">
        <TabsList>
          <TabsTrigger value="history">Usage History</TabsTrigger>
          <TabsTrigger value="pricing">Credit Pricing</TabsTrigger>
          <TabsTrigger value="settings">Auto Top-Up</TabsTrigger>
        </TabsList>

        <TabsContent value="history" className="mt-6 space-y-3">
          {/* Credit Usage Breakdown */}
          <Card className="mb-4">
            <CardHeader>
              <CardTitle className="text-lg">Credit Usage by Feature</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { name: "AI Website Generation", used: 2500, icon: Sparkles, color: "bg-purple-500" },
                  { name: "AI Image Generation", used: 1800, icon: Sparkles, color: "bg-blue-500" },
                  { name: "Content Regeneration", used: 1200, icon: RotateCcw, color: "bg-green-500" },
                  { name: "SEO Optimization", used: 900, icon: TrendingUp, color: "bg-orange-500" },
                  { name: "Premium Features", used: 1150, icon: Crown, color: "bg-pink-500" },
                ].map((item) => {
                  const Icon = item.icon;
                  const pct = (item.used / wallet.totalUsed) * 100;
                  return (
                    <div key={item.name} className="flex items-center gap-4">
                      <div className={`w-8 h-8 rounded-lg ${item.color} flex items-center justify-center`}>
                        <Icon className="w-4 h-4 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium truncate">{item.name}</span>
                          <span className="text-sm text-gray-500">{item.used.toLocaleString()} credits</span>
                        </div>
                        <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                          <div className={`h-full ${item.color} rounded-full`} style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Transaction History */}
          {wallet.history.map((tx) => (
            <Card key={tx.id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      tx.type === "purchase" ? "bg-green-100 dark:bg-green-900/30" :
                      tx.type === "refund" ? "bg-blue-100 dark:bg-blue-900/30" :
                      "bg-orange-100 dark:bg-orange-900/30"
                    }`}>
                      {tx.type === "purchase" ? (
                        <ArrowDownLeft className="w-5 h-5 text-green-600" />
                      ) : tx.type === "refund" ? (
                        <RotateCcw className="w-5 h-5 text-blue-600" />
                      ) : (
                        <ArrowUpRight className="w-5 h-5 text-orange-600" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium">{tx.description}</p>
                      <p className="text-sm text-gray-500">{new Date(tx.date).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-semibold ${tx.amount > 0 ? "text-green-600" : "text-orange-600"}`}>
                      {tx.amount > 0 ? "+" : ""}{tx.amount.toLocaleString()} credits
                    </p>
                    <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      {tx.status}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="pricing" className="mt-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {wallet.pricing.map((pack) => (
              <Card key={pack.id} className={`relative ${pack.popular ? "ring-2 ring-purple-600" : ""}`}>
                {pack.popular && (
                  <Badge className="absolute -top-2 left-1/2 -translate-x-1/2 bg-gradient-to-r from-purple-600 to-blue-600">
                    Best Value
                  </Badge>
                )}
                <CardContent className="p-6 text-center">
                  <h3 className="font-semibold text-lg mb-2">{pack.name}</h3>
                  <p className="text-4xl font-bold">{pack.credits.toLocaleString()}</p>
                  <p className="text-sm text-gray-500 mb-2">credits</p>
                  <Separator className="my-4" />
                  <p className="text-3xl font-bold text-purple-600">${pack.price}</p>
                  <p className="text-xs text-gray-500 mb-4">
                    ${(pack.price / pack.credits * 1000).toFixed(2)} / 1K credits
                  </p>
                  <ul className="text-sm text-left space-y-2 mb-6">
                    <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500" /> AI Generation</li>
                    <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500" /> Image Creation</li>
                    <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500" /> SEO Tools</li>
                    <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500" /> Never Expires</li>
                  </ul>
                  <Button className="w-full" variant={pack.popular ? "default" : "outline"} onClick={() => handlePurchase(pack.name)}>
                    Buy Now
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="settings" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Auto Top-Up Settings</CardTitle>
              <CardDescription>Automatically recharge when your balance runs low</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Enable Auto Top-Up</Label>
                  <p className="text-sm text-gray-500">Automatically purchase credits when balance is low</p>
                </div>
                <Switch checked={autoTopUp} onCheckedChange={setAutoTopUp} />
              </div>
              {autoTopUp && (
                <>
                  <Separator />
                  <div>
                    <Label>Top-Up Threshold</Label>
                    <p className="text-sm text-gray-500 mb-2">Trigger top-up when credits fall below</p>
                    <Input type="number" defaultValue={wallet.autoTopUpThreshold} />
                  </div>
                  <div>
                    <Label>Top-Up Amount</Label>
                    <p className="text-sm text-gray-500 mb-2">Number of credits to purchase</p>
                    <Input type="number" defaultValue={wallet.autoTopUpAmount} />
                  </div>
                </>
              )}
              <Button onClick={() => toast.success("Auto top-up settings saved!")}>Save Settings</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
