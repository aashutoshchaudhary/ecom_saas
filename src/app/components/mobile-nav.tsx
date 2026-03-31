import { Link, useLocation } from "react-router";
import { 
  LayoutDashboard, 
  ShoppingBag, 
  Globe, 
  BarChart3, 
  Coins 
} from "lucide-react";

const navItems = [
  { path: "/dashboard", icon: LayoutDashboard, label: "Home" },
  { path: "/dashboard/orders", icon: ShoppingBag, label: "Orders" },
  { path: "/dashboard/website", icon: Globe, label: "Builder" },
  { path: "/dashboard/analytics", icon: BarChart3, label: "Analytics" },
  { path: "/dashboard/wallet", icon: Coins, label: "Credits" },
];

export function MobileNav() {
  const location = useLocation();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 z-50 safe-area-bottom">
      <div className="flex items-center justify-around h-16">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
                isActive 
                  ? "text-purple-600 dark:text-purple-400" 
                  : "text-gray-600 dark:text-gray-400"
              }`}
            >
              <Icon className="w-5 h-5 mb-1" />
              <span className="text-xs">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
