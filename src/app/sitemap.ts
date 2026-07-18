import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://anavare.la";

  return [
    {
      url: `${base}/`,
      changeFrequency: "monthly",
      priority: 1,
    },
    {
      url: `${base}/rndm`,
      changeFrequency: "monthly",
      priority: 0.5,
    },
  ];
}
