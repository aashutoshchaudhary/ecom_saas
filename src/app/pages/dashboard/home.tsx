import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  ShoppingCart, 
  Users, 
  Eye,
  ArrowRight,
  Package,
  AlertCircle,
  Sparkles,
  Coins,
  Globe,
  Search,
  Zap,
  MessageSquare,
  Send,
  Bot,
} from "lucide-react";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Input } from "../../components/ui/input";
import { Progress } from "../../components/ui/progress";
import { Link } from "react-router";
import { statusColors } from "../../lib/mock-data";
import { dataProvider } from "../../lib/data-provider";
import { useApiQuery } from "../../lib/hooks";
import { useAuth } from "../../lib/auth-context";
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Avatar, AvatarImage, AvatarFallback } from "../../components/ui/avatar";
import { toast } from "sonner";

export function DashboardHome() {
  const { user } = useAuth();
  const [aiMessage, setAiMessage] = useState("");
  const [showAiChat, setShowAiChat] = useState(false);
  const [aiMessages, setAiMessages] = useState([
    { role: "assistant", content: `Hi${user ? ` ${user.firstName}` : ""}! I noticed your conversion rate increased this month. Would you like me to suggest ways to maintain this momentum?` },
  ]);

  const { data: orders } = useApiQuery(() => dataProvider.getOrders(), []);
  const { data: products } = useApiQuery(() => dataProvider.getProducts(), []);
  const { data: analytics } = useApiQuery(() => dataProvider.getAnalytics(), []);
  const { data: website } = useApiQuery(() => dataProvider.getWebsite(), []);
  const { data: wallet } = useApiQuery(() => dataProvider.getWallet(), []);

  const mockOrders = orders || [];
  const mockProducts = products || [];
  const mockAnalytics = analytics || { revenue: { current: 0, change: 0, data: [] }, orders: { current: 0, change: 0, data: [] }, visitors: { current: 0, change: 0, data: [] }, conversion: { current: 0, change: 0 } };
  const mockWebsite = website || { name: "Loading...", url: "", status: "draft", pages: 0, visitors: 0, conversionRate: 0, logo: "", lastPublished: "" };
  const mockWallet = wallet || { balance: 0, limit: 5000 };
  const mockUser = { name: user ? `${user.firstName} ${user.lastName}` : "User", credits: (mockWallet as any).balance || 0 };

  const lowStockProducts = mockProducts.filter((p: any) => p.stock <= p.lowStockThreshold);
  const recentOrders = mockOrders.slice(0, 5);

  const stats = [
    {
      title: "Total Revenue",
      value: `$${mockAnalytics.revenue.current.toLocaleString()}`,
      change: mockAnalytics.revenue.change,
      icon: DollarSign,
      trend: mockAnalytics.revenue.change > 0 ? "up" : "down",
      color: "text-green-600 dark:text-green-400",
      bgColor: "bg-green-50 dark:bg-green-900/20"
    },
    {
      title: "Orders",
      value: mockAnalytics.orders.current.toLocaleString(),
      change: mockAnalytics.orders.change,
      icon: ShoppingCart,
      trend: mockAnalytics.orders.change > 0 ? "up" : "down",
      color: "text-blue-600 dark:text-blue-400",
      bgColor: "bg-blue-50 dark:bg-blue-900/20"
    },
    {
      title: "Visitors",
      value: mockAnalytics.visitors.current.toLocaleString(),
      change: mockAnalytics.visitors.change,
      icon: Eye,
      trend: mockAnalytics.visitors.change > 0 ? "up" : "down",
      color: "text-purple-600 dark:text-purple-400",
      bgColor: "bg-purple-50 dark:bg-purple-900/20"
    },
    {
      title: "Conversion Rate",
      value: `${mockAnalytics.conversion.current}%`,
      change: mockAnalytics.conversion.change,
      icon: Users,
      trend: mockAnalytics.conversion.change > 0 ? "up" : "down",
      color: "text-orange-600 dark:text-orange-400",
      bgColor: "bg-orange-50 dark:bg-orange-900/20"
    },
  ];

  const handleAiSend = () => {
    if (!aiMessage.trim()) return;
    setAiMessages([...aiMessages, { role: "user", content: aiMessage }]);
    setAiMessage("");
    setTimeout(() => {
      setAiMessages(prev => [...prev, {
        role: "assistant",
        content: "Great question! Based on your store data, I recommend focusing on email marketing campaigns targeting your VIP customers. They have a 3x higher conversion rate. Would you like me to draft a campaign?"
      }]);
    }, 1000);
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-[1600px] mx-auto space-y-6">
      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold mb-1">Welcome back, Sarah!</h1>
          <p className="text-gray-600 dark:text-gray-400">Here's what's happening with your store today.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" className="gap-2" onClick={() => setShowAiChat(!showAiChat)}>
            <Sparkles className="w-4 h-4" />
            AI Assistant
          </Button>
          <Link to="/dashboard/website">
            <Button className="gap-2 bg-gradient-to-r from-purple-600 to-blue-600">
              Edit Website
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </div>

      {/* Quick Actions + Credit Status */}
      <div className="grid lg:grid-cols-3 gap-4">
        {/* Website Status */}
        <Card className="lg:col-span-2 border-purple-200 dark:border-purple-800 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-white dark:bg-gray-900 flex items-center justify-center flex-shrink-0">
                  <img src={mockWebsite.logo} alt={mockWebsite.name} className="w-8 h-8 rounded" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">{mockWebsite.name}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    {mockWebsite.url} &bull; {mockWebsite.pages} pages
                  </p>
                  <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                    Published
                  </Badge>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
                <Button variant="outline" size="sm">View Live Site</Button>
                <Link to="/dashboard/website">
                  <Button size="sm">Edit Website</Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Credits Card */}
        <Card className="bg-gradient-to-br from-purple-600 to-blue-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Coins className="w-5 h-5" />
                <span className="text-sm opacity-90">AI Credits</span>
              </div>
              <Link to="/dashboard/wallet">
                <Badge className="bg-white/20 text-white border-0 cursor-pointer hover:bg-white/30">
                  Buy More
                </Badge>
              </Link>
            </div>
            <p className="text-3xl font-bold">{mockWallet.balance.toLocaleString()}</p>
            <Progress value={(mockWallet.balance / mockWallet.totalPurchased) * 100} className="mt-3 bg-white/20 [&>div]:bg-white" />
            <p className="text-xs opacity-75 mt-2">
              {((mockWallet.balance / mockWallet.totalPurchased) * 100).toFixed(0)}% remaining
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "New Order", icon: ShoppingCart, path: "/dashboard/orders", color: "text-blue-600 bg-blue-50 dark:bg-blue-900/20" },
          { label: "SEO Check", icon: Search, path: "/dashboard/seo", color: "text-green-600 bg-green-50 dark:bg-green-900/20" },
          { label: "View Analytics", icon: TrendingUp, path: "/dashboard/analytics", color: "text-purple-600 bg-purple-50 dark:bg-purple-900/20" },
          { label: "Manage Domains", icon: Globe, path: "/dashboard/domains", color: "text-orange-600 bg-orange-50 dark:bg-orange-900/20" },
        ].map((action) => {
          const Icon = action.icon;
          return (
            <Link key={action.label} to={action.path}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg ${action.color} flex items-center justify-center flex-shrink-0`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-sm font-medium">{action.label}</span>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          const TrendIcon = stat.trend === "up" ? TrendingUp : TrendingDown;
          
          return (
            <Card key={stat.title}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-10 h-10 rounded-lg ${stat.bgColor} flex items-center justify-center`}>
                    <Icon className={`w-5 h-5 ${stat.color}`} />
                  </div>
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

      {/* Charts Row */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Revenue Overview</CardTitle>
            <CardDescription>Your revenue for the last 30 days</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={mockAnalytics.revenue.data}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="date" stroke="#6b7280" fontSize={12} />
                <YAxis stroke="#6b7280" fontSize={12} />
                <Tooltip />
                <Area 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#8b5cf6" 
                  strokeWidth={2}
                  fill="url(#colorRevenue)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Orders Trend</CardTitle>
            <CardDescription>Daily orders for the last 30 days</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={mockAnalytics.orders.data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="date" stroke="#6b7280" fontSize={12} />
                <YAxis stroke="#6b7280" fontSize={12} />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  dot={{ fill: "#3b82f6", r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders & Alerts + AI Chat */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Orders */}
        <Card className={showAiChat ? "lg:col-span-1" : "lg:col-span-2"}>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Orders</CardTitle>
              <CardDescription>Latest orders from your customers</CardDescription>
            </div>
            <Link to="/dashboard/orders">
              <Button variant="ghost" size="sm">
                View All <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentOrders.slice(0, showAiChat ? 3 : 5).map((order) => (
                <div key={order.id} className="flex items-center justify-between p-4 rounded-lg border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={order.avatar} />
                      <AvatarFallback>{order.customer.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{order.customer}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                        {order.id} &bull; {order.items} items
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <Badge className={statusColors[order.status as keyof typeof statusColors]}>
                      {order.status}
                    </Badge>
                    <span className="font-semibold hidden sm:inline">${order.total}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* AI Chat or Alerts */}
        {showAiChat ? (
          <Card className="lg:col-span-2 flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div>
                  <CardTitle className="text-lg">AI Assistant</CardTitle>
                  <CardDescription>Ask anything about your business</CardDescription>
                </div>
              </div>
              <Badge variant="secondary" className="gap-1">
                <Zap className="w-3 h-3" /> 5 credits/query
              </Badge>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col">
              <div className="flex-1 space-y-4 mb-4 max-h-[300px] overflow-y-auto">
                {aiMessages.map((msg, idx) => (
                  <div key={idx} className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      msg.role === "user" 
                        ? "bg-purple-600" 
                        : "bg-gradient-to-br from-purple-600 to-blue-600"
                    }`}>
                      {msg.role === "user" ? (
                        <span className="text-white text-xs">SJ</span>
                      ) : (
                        <Bot className="w-4 h-4 text-white" />
                      )}
                    </div>
                    <div className={`max-w-[80%] p-3 rounded-lg text-sm ${
                      msg.role === "user"
                        ? "bg-purple-600 text-white"
                        : "bg-gray-100 dark:bg-gray-800"
                    }`}>
                      {msg.content}
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  placeholder="Ask about sales, products, marketing..."
                  value={aiMessage}
                  onChange={(e) => setAiMessage(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAiSend()}
                />
                <Button size="icon" onClick={handleAiSend}>
                  <Send className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-3">
                {[
                  "Top selling products?",
                  "Generate marketing ideas",
                  "Optimize SEO",
                ].map((suggestion) => (
                  <Button
                    key={suggestion}
                    variant="outline"
                    size="sm"
                    className="text-xs"
                    onClick={() => { setAiMessage(suggestion); }}
                  >
                    {suggestion}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Alerts</CardTitle>
              <CardDescription>Important notifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {lowStockProducts.length > 0 && (
                <div className="p-4 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-sm mb-1">Low Stock Alert</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        {lowStockProducts.length} product{lowStockProducts.length > 1 ? 's are' : ' is'} running low
                      </p>
                      <Link to="/dashboard/inventory">
                        <Button variant="outline" size="sm" className="h-8">
                          View Inventory
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              )}

              <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                <div className="flex items-start gap-3">
                  <Package className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-sm mb-1">Pending Orders</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      You have {mockOrders.filter(o => o.status === "pending").length} orders waiting to be processed
                    </p>
                    <Link to="/dashboard/orders">
                      <Button variant="outline" size="sm" className="h-8">
                        Process Orders
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800">
                <div className="flex items-start gap-3">
                  <Sparkles className="w-5 h-5 text-purple-600 dark:text-purple-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-sm mb-1">AI Recommendation</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      Your conversion rate increased 18.8%. Consider promoting your top products!
                    </p>
                    <Button variant="outline" size="sm" className="h-8" onClick={() => setShowAiChat(true)}>
                      View Insights
                    </Button>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800">
                <div className="flex items-start gap-3">
                  <Coins className="w-5 h-5 text-orange-600 dark:text-orange-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-sm mb-1">Credits Balance</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      {mockWallet.balance.toLocaleString()} credits remaining. Consider top-up.
                    </p>
                    <Link to="/dashboard/wallet">
                      <Button variant="outline" size="sm" className="h-8">
                        Buy Credits
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
