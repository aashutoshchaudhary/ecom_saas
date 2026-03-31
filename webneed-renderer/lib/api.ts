/**
 * Website API Client
 *
 * Fetches website data from the SiteForge backend.
 * In production, this talks to website-builder-service (port 3006) via the API gateway.
 * In development, we use mock data for standalone testing.
 */

const API_BASE = process.env.SITEFORGE_API_URL || "http://localhost:3000/api/v1";

export interface SiteConfig {
  id: string;
  tenantId: string;
  name: string;
  slug: string;
  domain: string | null;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  structure: SiteStructure | null;
  settings: SiteSettings;
  seoConfig: SeoConfig;
  pages: PageConfig[];
}

export interface SiteStructure {
  header: {
    logo: string;
    logoText: string;
    navigation: { label: string; path: string }[];
    ctaText?: string;
    ctaLink?: string;
  };
  footer: {
    text: string;
    links: { label: string; url: string }[];
    socials: { platform: string; url: string }[];
  };
  colorScheme: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
  };
  fonts: {
    heading: string;
    body: string;
  };
}

export interface SiteSettings {
  favicon?: string;
  customCss?: string;
  analytics?: { googleId?: string; facebookPixel?: string };
  [key: string]: unknown;
}

export interface SeoConfig {
  title?: string;
  description?: string;
  ogImage?: string;
  keywords?: string[];
  robots?: string;
  canonical?: string;
}

export interface PageConfig {
  id: string;
  title: string;
  slug: string;
  path: string;
  isHomepage: boolean;
  isPublished: boolean;
  sections: SectionConfig[];
  seoTitle: string | null;
  seoDescription: string | null;
  sortOrder: number;
}

export interface SectionConfig {
  id: string;
  type: string;
  props: Record<string, unknown>;
  styles?: Record<string, unknown>;
  animation?: {
    type: string;
    duration: number;
    delay: number;
    trigger: "load" | "scroll" | "hover" | "click";
  };
  children?: SectionConfig[];
}

/**
 * Resolve a domain/subdomain to a site config.
 * The Host header tells us which tenant's site to render.
 */
export async function getSiteByDomain(domain: string): Promise<SiteConfig | null> {
  try {
    const res = await fetch(`${API_BASE}/websites/resolve?domain=${encodeURIComponent(domain)}`, {
      next: { revalidate: 60 }, // ISR: revalidate every 60s
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data || null;
  } catch {
    // Fallback to mock in development
    if (process.env.NODE_ENV === "development") {
      return getMockSite(domain);
    }
    return null;
  }
}

/**
 * Get a specific page's data for a site.
 */
export async function getPage(
  siteId: string,
  slug: string
): Promise<PageConfig | null> {
  try {
    const res = await fetch(`${API_BASE}/websites/${siteId}/pages?slug=${slug}`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data?.[0] || null;
  } catch {
    return null;
  }
}

/**
 * Get all published pages for sitemap generation.
 */
export async function getAllPages(siteId: string): Promise<PageConfig[]> {
  try {
    const res = await fetch(`${API_BASE}/websites/${siteId}/pages`, {
      next: { revalidate: 300 },
    });
    if (!res.ok) return [];
    const json = await res.json();
    return (json.data || []).filter((p: PageConfig) => p.isPublished);
  } catch {
    return [];
  }
}

// ─── Mock data for standalone development ────────────────────────────────────

function getMockSite(domain: string): SiteConfig {
  const slug = domain.split(".")[0];
  return {
    id: "mock-site-1",
    tenantId: "mock-tenant-1",
    name: slug.charAt(0).toUpperCase() + slug.slice(1).replace(/-/g, " "),
    slug,
    domain,
    status: "PUBLISHED",
    structure: {
      header: {
        logo: "",
        logoText: slug.charAt(0).toUpperCase() + slug.slice(1),
        navigation: [
          { label: "Home", path: "/" },
          { label: "About", path: "/about" },
          { label: "Services", path: "/services" },
          { label: "Contact", path: "/contact" },
        ],
        ctaText: "Get Started",
        ctaLink: "/contact",
      },
      footer: {
        text: `\u00a9 ${new Date().getFullYear()} ${slug}. All rights reserved.`,
        links: [
          { label: "Privacy", url: "/privacy" },
          { label: "Terms", url: "/terms" },
        ],
        socials: [],
      },
      colorScheme: {
        primary: "#7c3aed",
        secondary: "#3b82f6",
        accent: "#10b981",
        background: "#ffffff",
        text: "#1f2937",
      },
      fonts: {
        heading: "system-ui",
        body: "system-ui",
      },
    },
    settings: {},
    seoConfig: {
      title: `${slug} - Built with SiteForge AI`,
      description: "A beautiful website built with SiteForge AI website builder.",
      keywords: ["website", "business"],
    },
    pages: [
      {
        id: "page-home",
        title: "Home",
        slug: "home",
        path: "/",
        isHomepage: true,
        isPublished: true,
        sortOrder: 0,
        seoTitle: null,
        seoDescription: null,
        sections: [
          {
            id: "hero-1",
            type: "hero-gradient",
            props: {
              title: "Welcome to " + slug.charAt(0).toUpperCase() + slug.slice(1),
              subtitle: "We help you build amazing digital experiences that drive results.",
              ctaText: "Get Started",
              ctaLink: "/contact",
              backgroundGradient: "from-purple-600 to-blue-600",
            },
          },
          {
            id: "features-1",
            type: "features-grid",
            props: {
              title: "What We Offer",
              subtitle: "Everything you need to succeed online",
              features: [
                { icon: "sparkles", title: "AI Powered", description: "Leverage cutting-edge AI technology for your business." },
                { icon: "zap", title: "Lightning Fast", description: "Optimized performance with sub-second load times." },
                { icon: "shield", title: "Secure", description: "Enterprise-grade security with SSL and DDoS protection." },
              ],
            },
          },
          {
            id: "cta-1",
            type: "cta-centered",
            props: {
              title: "Ready to Get Started?",
              subtitle: "Join thousands of businesses already using our platform.",
              ctaText: "Contact Us",
              ctaLink: "/contact",
            },
          },
        ],
      },
      {
        id: "page-about",
        title: "About",
        slug: "about",
        path: "/about",
        isHomepage: false,
        isPublished: true,
        sortOrder: 1,
        seoTitle: "About Us",
        seoDescription: "Learn more about our company and mission.",
        sections: [
          {
            id: "hero-about",
            type: "hero-gradient",
            props: {
              title: "About Us",
              subtitle: "Our mission is to make the web accessible to everyone.",
              ctaText: "Learn More",
              backgroundGradient: "from-blue-600 to-cyan-500",
            },
          },
        ],
      },
    ],
  };
}
