import { createBrowserRouter } from "react-router";
import { LandingPage } from "./pages/landing";
import { AuthPage } from "./pages/auth";
import { OnboardingPage } from "./pages/onboarding";
import { DashboardLayout } from "./layouts/dashboard-layout";
import { DashboardHome } from "./pages/dashboard/home";
import { WebsiteBuilder } from "./pages/dashboard/website-builder";
import { Orders } from "./pages/dashboard/orders";
import { OrderDetails } from "./pages/dashboard/order-details";
import { Inventory } from "./pages/dashboard/inventory";
import { Payments } from "./pages/dashboard/payments";
import { Analytics } from "./pages/dashboard/analytics";
import { Blog } from "./pages/dashboard/blog";
import { Tutor } from "./pages/dashboard/tutor";
import { Marketplace } from "./pages/dashboard/marketplace";
import { Settings } from "./pages/dashboard/settings";
import { Customers } from "./pages/dashboard/customers";
import { Marketing } from "./pages/dashboard/marketing";
import { Integrations } from "./pages/dashboard/integrations";
import { Plugins } from "./pages/dashboard/plugins";
import { Billing } from "./pages/dashboard/billing";
import { Wallet } from "./pages/dashboard/wallet";
import { Domains } from "./pages/dashboard/domains";
import { SEO } from "./pages/dashboard/seo";
import { UsersManagement } from "./pages/dashboard/users";
import { NotFound } from "./pages/not-found";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: LandingPage,
  },
  {
    path: "/auth",
    Component: AuthPage,
  },
  {
    path: "/onboarding",
    Component: OnboardingPage,
  },
  {
    path: "/dashboard",
    Component: DashboardLayout,
    children: [
      { index: true, Component: DashboardHome },
      { path: "website", Component: WebsiteBuilder },
      { path: "orders", Component: Orders },
      { path: "orders/:id", Component: OrderDetails },
      { path: "inventory", Component: Inventory },
      { path: "customers", Component: Customers },
      { path: "payments", Component: Payments },
      { path: "analytics", Component: Analytics },
      { path: "marketing", Component: Marketing },
      { path: "blog", Component: Blog },
      { path: "tutor", Component: Tutor },
      { path: "marketplace", Component: Marketplace },
      { path: "plugins", Component: Plugins },
      { path: "billing", Component: Billing },
      { path: "wallet", Component: Wallet },
      { path: "domains", Component: Domains },
      { path: "seo", Component: SEO },
      { path: "users", Component: UsersManagement },
      { path: "integrations", Component: Integrations },
      { path: "settings", Component: Settings },
    ],
  },
  {
    path: "*",
    Component: NotFound,
  },
]);