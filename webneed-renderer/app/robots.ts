import { MetadataRoute } from "next";
import { headers } from "next/headers";

export default async function robots(): Promise<MetadataRoute.Robots> {
  const headerList = await headers();
  const host = headerList.get("host") || "localhost";

  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: `https://${host}/sitemap.xml`,
  };
}
