import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: SITE_URL.toString(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: new URL("/twibbon", SITE_URL).toString(),
      changeFrequency: "monthly",
      priority: 0.6,
    },
  ];
}
