import { headers } from "next/headers";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getSiteByDomain } from "@/lib/api";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { SectionRenderer } from "@/components/sections";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const headerList = await headers();
  const host = headerList.get("host") || "localhost";
  const site = await getSiteByDomain(host);

  if (!site) return { title: "Not Found" };

  const page = site.pages.find((p) => p.slug === slug || p.path === `/${slug}`);
  if (!page) return { title: "Not Found" };

  return {
    title: page.seoTitle || `${page.title} | ${site.name}`,
    description: page.seoDescription || site.seoConfig.description,
    openGraph: {
      title: page.seoTitle || `${page.title} | ${site.name}`,
      description: page.seoDescription || site.seoConfig.description,
      siteName: site.name,
      type: "website",
    },
    robots: "index, follow",
    alternates: {
      canonical: `https://${host}/${slug}`,
    },
  };
}

export default async function DynamicPage({ params }: PageProps) {
  const { slug } = await params;
  const headerList = await headers();
  const host = headerList.get("host") || "localhost";
  const site = await getSiteByDomain(host);

  if (!site) notFound();

  const page = site.pages.find((p) => p.slug === slug || p.path === `/${slug}`);
  if (!page || !page.isPublished) notFound();

  return (
    <div className="min-h-screen flex flex-col">
      {site.structure && <SiteHeader structure={site.structure} />}

      <main className="flex-1">
        {page.sections.map((section) => (
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
