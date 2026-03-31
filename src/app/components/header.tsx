import { Bell, Search, Menu, Moon, Sun, Globe, Sparkles, Coins, ChevronDown } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger 
} from "./ui/dropdown-menu";
import { Avatar, AvatarImage, AvatarFallback } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { useTheme } from "./theme-provider";
import { mockUser } from "../lib/mock-data";
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";
import { useState } from "react";
import { Link, useLocation } from "react-router";
import { 
  LayoutDashboard, 
  ShoppingBag, 
  Package, 
  Users, 
  CreditCard, 
  BarChart3, 
  Mail, 
  FileText, 
  GraduationCap, 
  Store, 
  Plug, 
  Settings 
} from "lucide-react";

const mobileNavItems = [
  { path: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { path: "/dashboard/website", icon: Globe, label: "Website Builder" },
  { path: "/dashboard/orders", icon: ShoppingBag, label: "Orders" },
  { path: "/dashboard/inventory", icon: Package, label: "Inventory" },
  { path: "/dashboard/customers", icon: Users, label: "Customers" },
  { path: "/dashboard/payments", icon: CreditCard, label: "Payments" },
  { path: "/dashboard/analytics", icon: BarChart3, label: "Analytics" },
  { path: "/dashboard/marketing", icon: Mail, label: "Marketing" },
  { path: "/dashboard/blog", icon: FileText, label: "Blog" },
  { path: "/dashboard/tutor", icon: GraduationCap, label: "Training" },
  { path: "/dashboard/marketplace", icon: Store, label: "Marketplace" },
  { path: "/dashboard/integrations", icon: Plug, label: "Integrations" },
  { path: "/dashboard/settings", icon: Settings, label: "Settings" },
];

export function Header() {
  const { theme, setTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeIndustry, setActiveIndustry] = useState(mockUser.industries[0]);
  const location = useLocation();

  return (
    <header className="h-16 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-4 md:px-6">
      {/* Left section */}
      <div className="flex items-center gap-3 flex-1">
        {/* Mobile menu */}
        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="w-5 h-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0">
            <div className="flex flex-col h-full">
              <div className="p-4 border-b border-gray-200 dark:border-gray-800">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                  <span className="font-semibold text-lg">SiteForge AI</span>
                </div>
              </div>
              <nav className="flex-1 p-4 space-y-1">
                {mobileNavItems.map((item) => {
                  const isActive = location.pathname === item.path;
                  const Icon = item.icon;
                  
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                        isActive
                          ? "bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400"
                          : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="text-sm">{item.label}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>
          </SheetContent>
        </Sheet>

        {/* Industry Switcher */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2 hidden sm:flex">
              <span className="text-base">{activeIndustry.icon}</span>
              <span className="max-w-[120px] truncate">{activeIndustry.name}</span>
              <ChevronDown className="w-3 h-3 opacity-50" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-64">
            <DropdownMenuLabel>Switch Business</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {mockUser.industries.map((ind) => (
              <DropdownMenuItem
                key={ind.id}
                onClick={() => setActiveIndustry(ind)}
                className={activeIndustry.id === ind.id ? "bg-purple-50 dark:bg-purple-900/20" : ""}
              >
                <span className="text-lg mr-3">{ind.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm">{ind.name}</p>
                  <p className="text-xs text-gray-500">{ind.type}</p>
                </div>
                {activeIndustry.id === ind.id && (
                  <Badge variant="secondary" className="text-xs ml-2">Active</Badge>
                )}
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <span className="text-gray-500 text-sm">+ Add New Business</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Search */}
        <div className="hidden md:block relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input 
            placeholder="Search orders, products, customers..." 
            className="pl-9"
          />
        </div>
      </div>

      {/* Right section */}
      <div className="flex items-center gap-2">
        {/* Credits Badge */}
        <Link to="/dashboard/wallet">
          <Button variant="outline" size="sm" className="gap-2 hidden sm:flex">
            <Coins className="w-4 h-4 text-purple-600" />
            <span className="font-semibold">{mockUser.credits.toLocaleString()}</span>
            <span className="text-gray-500 text-xs">credits</span>
          </Button>
        </Link>

        {/* AI Assistant */}
        <Button variant="outline" className="hidden lg:flex gap-2">
          <Sparkles className="w-4 h-4" />
          <span>AI Assistant</span>
        </Button>

        {/* Theme toggle */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Toggle theme</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setTheme("light")}>
              Light
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme("dark")}>
              Dark
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme("system")}>
              System
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="w-5 h-5" />
              <Badge className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center p-0 text-xs">
                3
              </Badge>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel>Notifications</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <div className="space-y-1">
              <div className="p-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-md cursor-pointer">
                <p className="text-sm font-medium">New order received</p>
                <p className="text-xs text-gray-500">Order #ORD-2453 - $234.50</p>
                <p className="text-xs text-gray-400 mt-1">2 minutes ago</p>
              </div>
              <div className="p-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-md cursor-pointer">
                <p className="text-sm font-medium">Low stock alert</p>
                <p className="text-xs text-gray-500">Yoga Mat - Only 12 left</p>
                <p className="text-xs text-gray-400 mt-1">1 hour ago</p>
              </div>
              <div className="p-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-md cursor-pointer">
                <p className="text-sm font-medium">AI credits running low</p>
                <p className="text-xs text-gray-500">2,450 credits remaining</p>
                <p className="text-xs text-gray-400 mt-1">3 hours ago</p>
              </div>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* User menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-9 w-9 rounded-full">
              <Avatar className="h-9 w-9">
                <AvatarImage src={mockUser.avatar} alt={mockUser.name} />
                <AvatarFallback>{mockUser.name.charAt(0)}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium">{mockUser.name}</p>
                <p className="text-xs text-gray-500">{mockUser.email}</p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="secondary" className="text-xs">{mockUser.plan} Plan</Badge>
                  <span className="text-xs text-gray-500 flex items-center gap-1">
                    <Coins className="w-3 h-3" /> {mockUser.credits.toLocaleString()}
                  </span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link to="/dashboard/settings">Profile Settings</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/dashboard/billing">Billing</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/dashboard/wallet">Credits & Wallet</Link>
            </DropdownMenuItem>
            <DropdownMenuItem>
              Support
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-red-600">
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
