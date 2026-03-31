import { headers } from "next/headers";
import { Metadata } from "next";
import { getSiteByDomain } from "@/lib/api";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { SectionRenderer } from "@/components/sections";

export async function generateMetadata(): Promise<Metadata> {
  const headerList = await headers();
  const host = headerList.get("host") || "localhost";
  const site = await getSiteByDomain(host);

  if (!site) return { title: "Site Not Found" };

  const homepage = site.pages.find((p) => p.isHomepage);
  return {
    title: homepage?.seoTitle || site.seoConfig.title || site.name,
    description: homepage?.seoDescription || site.seoConfig.description,
    keywords: site.seoConfig.keywords,
    openGraph: {
      title: homepage?.seoTitle || site.seoConfig.title || site.name,
      description: homepage?.seoDescription || site.seoConfig.description,
      images: site.seoConfig.ogImage ? [site.seoConfig.ogImage] : undefined,
      siteName: site.name,
      type: "website",
    },
    robots: site.seoConfig.robots || "index, follow",
    alternates: {
      canonical: site.seoConfig.canonical || `https://${host}`,
    },
  };
}

export default async function HomePage() {
  const headerList = await headers();
  const host = headerList.get("host") || "localhost";
  const site = await getSiteByDomain(host);

  if (!site) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Site Not Found</h1>
          <p className="text-gray-500">
            No website is configured for this domain.
          </p>
        </div>
      </div>
    );
  }

  const homepage = site.pages.find((p) => p.isHomepage);

  return (
    <div className="min-h-screen flex flex-col">
      {site.structure && <SiteHeader structure={site.structure} />}

      <main className="flex-1">
        {homepage?.sections.map((section) => (
          <SectionRenderer
            key={section.id}
            section={section}
            colorScheme={site.structure?.colorScheme}
          />
        ))}
      </main>

      {site.structure && <SiteFooter structure={site.structure} />}
    </div>
  );
}
