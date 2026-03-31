import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { mockAnalytics } from "../../lib/mock-data";
import { dataProvider } from "../../lib/data-provider";
import { useApiQuery } from "../../lib/hooks";
import { BarChart3, TrendingUp, TrendingDown, DollarSign, ShoppingCart, Eye, Users, Download, Calendar, Sparkles } from "lucide-react";
import { LineChart, Line, BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { toast } from "sonner";

export function Analytics() {
  const [dateRange, setDateRange] = useState("30d");
  const { data: analyticsData } = useApiQuery(() => dataProvider.getAnalytics({ period: dateRange }), [dateRange]);
  const analytics = analyticsData || mockAnalytics;

  const trafficSources = [
    { name: "Direct", value: 4500, color: "#8b5cf6" },
    { name: "Social", value: 3200, color: "#3b82f6" },
    { name: "Search", value: 2800, color: "#10b981" },
    { name: "Email", value: 1500, color: "#f59e0b" },
  ];

  const conversionFunnel = [
    { stage: "Visitors", count: 24567, pct: 100 },
    { stage: "Product Views", count: 8934, pct: 36.4 },
    { stage: "Add to Cart", count: 2456, pct: 10.0 },
    { stage: "Checkout", count: 1567, pct: 6.4 },
    { stage: "Purchased", count: 1234, pct: 5.0 },
  ];

  const topProducts = [
    { name: "Wireless Headphones", revenue: 12345, orders: 123, growth: 15 },
    { name: "Smart Watch", revenue: 9876, orders: 98, growth: -5 },
    { name: "Coffee Maker", revenue: 7654, orders: 87, growth: 22 },
    { name: "Yoga Mat", revenue: 5432, orders: 109, growth: 8 },
  ];

  const stats = [
    {
      title: "Revenue",
      value: `$${analytics.revenue.current.toLocaleString()}`,
      change: analytics.revenue.change,
      icon: DollarSign,
      trend: "up",
      color: "text-green-600 dark:text-green-400"
    },
    {
      title: "Orders",
      value: analytics.orders.current.toLocaleString(),
      change: analytics.orders.change,
      icon: ShoppingCart,
      trend: "up",
      color: "text-blue-600 dark:text-blue-400"
    },
    {
      title: "Visitors",
      value: analytics.visitors.current.toLocaleString(),
      change: analytics.visitors.change,
      icon: Eye,
      trend: "up",
      color: "text-purple-600 dark:text-purple-400"
    },
    {
      title: "Conversion",
      value: `${analytics.conversion.current}%`,
      change: analytics.conversion.change,
      icon: Users,
      trend: "up",
      color: "text-orange-600 dark:text-orange-400"
    },
  ];

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-[1600px] mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold mb-1">Analytics</h1>
          <p className="text-gray-600 dark:text-gray-400">Track your business performance and insights</p>
        </div>
        <div className="flex gap-2">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-40">
              <Calendar className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="12m">Last 12 months</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" className="gap-2" onClick={() => toast.success("Report exported as CSV!")}>
            <Download className="w-4 h-4" />
            Export
          </Button>
          <Button className="gap-2 bg-gradient-to-r from-purple-600 to-blue-600" onClick={() => toast.success("AI insights generated!")}>
            <Sparkles className="w-4 h-4" />
            AI Insights
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          const TrendIcon = stat.trend === "up" ? TrendingUp : TrendingDown;
          
          return (
            <Card key={stat.title}>
              <CardContent className="p-4 md:p-6">
                <div className="flex items-center justify-between mb-4">
                  <Icon className={`w-8 h-8 ${stat.color}`} />
                  <div className={`flex items-center gap-1 text-sm ${
                    stat.trend === "up" ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
                  }`}>
                    <TrendIcon className="w-4 h-4" />
                    <span>{stat.change}%</span>
                  </div>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{stat.title}</p>
                <p className="text-2xl font-bold">{stat.value}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="conversion">Conversion</TabsTrigger>
          <TabsTrigger value="products">Top Products</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <div className="grid lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Revenue Over Time</CardTitle>
                <CardDescription>Monthly revenue for the last 30 days</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={analytics.revenue.data}>
                    <defs>
                      <linearGradient id="revenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="date" stroke="#6b7280" fontSize={12} />
                    <YAxis stroke="#6b7280" fontSize={12} />
                    <Tooltip />
                    <Area type="monotone" dataKey="value" stroke="#8b5cf6" strokeWidth={2} fill="url(#revenue)" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Traffic Sources</CardTitle>
                <CardDescription>Where your visitors come from</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={trafficSources}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={(entry) => `${entry.name} (${entry.value})`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {trafficSources.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Orders Trend</CardTitle>
                <CardDescription>Daily orders over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={analytics.orders.data}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="date" stroke="#6b7280" fontSize={12} />
                    <YAxis stroke="#6b7280" fontSize={12} />
                    <Tooltip />
                    <Bar dataKey="value" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Visitor Growth</CardTitle>
                <CardDescription>Website traffic over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={analytics.visitors.data}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="date" stroke="#6b7280" fontSize={12} />
                    <YAxis stroke="#6b7280" fontSize={12} />
                    <Tooltip />
                    <Line type="monotone" dataKey="value" stroke="#8b5cf6" strokeWidth={2} dot={{ fill: "#8b5cf6", r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="conversion" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Conversion Funnel</CardTitle>
              <CardDescription>Track how visitors convert to customers</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {conversionFunnel.map((step, idx) => (
                  <div key={step.stage}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-sm font-bold text-purple-600">
                          {idx + 1}
                        </div>
                        <span className="font-medium">{step.stage}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="font-semibold">{step.count.toLocaleString()}</span>
                        <Badge variant="secondary">{step.pct}%</Badge>
                      </div>
                    </div>
                    <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden ml-11">
                      <div
                        className="h-full bg-gradient-to-r from-purple-600 to-blue-600 rounded-full transition-all"
                        style={{ width: `${step.pct}%` }}
                      />
                    </div>
                    {idx < conversionFunnel.length - 1 && (
                      <div className="ml-[22px] mt-1 mb-1 text-xs text-gray-500">
                        {((conversionFunnel[idx + 1].count / step.count) * 100).toFixed(1)}% drop-off
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="products" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Top Performing Products</CardTitle>
              <CardDescription>Products ranked by revenue</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topProducts.map((product, idx) => (
                  <div key={product.name} className="flex items-center justify-between p-4 rounded-lg border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <div className="flex items-center gap-4">
                      <span className="text-lg font-bold text-gray-400 w-6">#{idx + 1}</span>
                      <div>
                        <p className="font-medium">{product.name}</p>
                        <p className="text-sm text-gray-500">{product.orders} orders</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="font-semibold">${product.revenue.toLocaleString()}</p>
                      </div>
                      <div className={`flex items-center gap-1 text-sm ${product.growth >= 0 ? "text-green-600" : "text-red-600"}`}>
                        {product.growth >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                        {product.growth}%
                      </div>
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
