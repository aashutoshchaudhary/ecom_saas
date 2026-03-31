import { MetadataRoute } from "next";
import { headers } from "next/headers";
import { getSiteByDomain } from "@/lib/api";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const headerList = await headers();
  const host = headerList.get("host") || "localhost";
  const site = await getSiteByDomain(host);

  if (!site) return [];

  const baseUrl = `https://${host}`;

  return site.pages
    .filter((p) => p.isPublished)
    .map((page) => ({
      url: page.isHomepage ? baseUrl : `${baseUrl}${page.path}`,
      lastModified: new Date(),
      changeFrequency: page.isHomepage ? "daily" : "weekly",
      priority: page.isHomepage ? 1 : 0.8,
    }));
}
