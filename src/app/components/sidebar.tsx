import { Link, useLocation } from "react-router";
import { 
  LayoutDashboard, 
  Globe, 
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
  Settings,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Receipt,
  Boxes,
  Coins,
  Search,
  Globe2,
  UserCog,
} from "lucide-react";
import { useState } from "react";
import { Button } from "./ui/button";
import { ScrollArea } from "./ui/scroll-area";
import { mockUser, mockWebsite } from "../lib/mock-data";
import { Avatar, AvatarImage, AvatarFallback } from "./ui/avatar";

const navigationGroups = [
  {
    title: "Overview",
    items: [
      { path: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
      { path: "/dashboard/website", icon: Globe, label: "Website Builder" },
    ]
  },
  {
    title: "Commerce",
    items: [
      { path: "/dashboard/orders", icon: ShoppingBag, label: "Orders" },
      { path: "/dashboard/inventory", icon: Package, label: "Inventory" },
      { path: "/dashboard/customers", icon: Users, label: "Customers" },
      { path: "/dashboard/payments", icon: CreditCard, label: "Payments" },
    ]
  },
  {
    title: "Growth",
    items: [
      { path: "/dashboard/analytics", icon: BarChart3, label: "Analytics" },
      { path: "/dashboard/marketing", icon: Mail, label: "Marketing" },
      { path: "/dashboard/blog", icon: FileText, label: "Blog" },
      { path: "/dashboard/seo", icon: Search, label: "SEO Tools" },
    ]
  },
  {
    title: "Platform",
    items: [
      { path: "/dashboard/tutor", icon: GraduationCap, label: "Training" },
      { path: "/dashboard/marketplace", icon: Store, label: "Marketplace" },
      { path: "/dashboard/plugins", icon: Boxes, label: "Plugins" },
      { path: "/dashboard/integrations", icon: Plug, label: "Integrations" },
      { path: "/dashboard/domains", icon: Globe2, label: "Domains & Email" },
      { path: "/dashboard/wallet", icon: Coins, label: "Credits" },
      { path: "/dashboard/users", icon: UserCog, label: "Users & Roles" },
      { path: "/dashboard/billing", icon: Receipt, label: "Billing" },
      { path: "/dashboard/settings", icon: Settings, label: "Settings" },
    ]
  },
];

interface SidebarProps {
  collapsed?: boolean;
  onCollapse?: (collapsed: boolean) => void;
}

export function Sidebar({ collapsed = false, onCollapse }: SidebarProps) {
  const location = useLocation();

  return (
    <aside className={`hidden md:flex flex-col bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 transition-all duration-300 ${collapsed ? 'w-16' : 'w-64'}`}>
      {/* Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200 dark:border-gray-800">
        {!collapsed && (
          <Link to="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="font-semibold text-lg">SiteForge AI</span>
          </Link>
        )}
        {collapsed && (
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
        )}
        {onCollapse && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onCollapse(!collapsed)}
            className={collapsed ? "w-full" : ""}
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </Button>
        )}
      </div>

      {/* Business Info */}
      {!collapsed && (
        <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <Avatar className="w-10 h-10">
              <AvatarImage src={mockWebsite.logo} />
              <AvatarFallback>MB</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{mockWebsite.name}</p>
              <p className="text-xs text-gray-500 truncate">{mockWebsite.url}</p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <ScrollArea className="flex-1">
        <nav className="p-2">
          {navigationGroups.map((group) => (
            <div key={group.title} className="mb-4">
              {!collapsed && (
                <h3 className="px-3 mb-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {group.title}
                </h3>
              )}
              <div className="space-y-1">
                {group.items.map((item) => {
                  const isActive = location.pathname === item.path;
                  const Icon = item.icon;
                  
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                        isActive
                          ? "bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400"
                          : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                      } ${collapsed ? "justify-center" : ""}`}
                      title={collapsed ? item.label : undefined}
                    >
                      <Icon className="w-5 h-5 flex-shrink-0" />
                      {!collapsed && <span className="text-sm">{item.label}</span>}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </ScrollArea>

      {/* User Info */}
      {!collapsed && (
        <div className="p-4 border-t border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <Avatar className="w-9 h-9">
              <AvatarImage src={mockUser.avatar} />
              <AvatarFallback>{mockUser.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{mockUser.name}</p>
              <p className="text-xs text-gray-500 truncate">{mockUser.plan} Plan</p>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}