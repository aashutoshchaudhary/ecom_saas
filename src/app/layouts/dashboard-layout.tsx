import { Outlet } from "react-router";
import { Sidebar } from "../components/sidebar";
import { Header } from "../components/header";
import { MobileNav } from "../components/mobile-nav";
import { useState } from "react";

export function DashboardLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="h-screen flex overflow-hidden bg-gray-50 dark:bg-gray-950">
      <Sidebar collapsed={sidebarCollapsed} onCollapse={setSidebarCollapsed} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        
        <main className="flex-1 overflow-y-auto pb-16 md:pb-0">
          <Outlet />
        </main>
        
        <MobileNav />
      </div>
    </div>
  );
}
