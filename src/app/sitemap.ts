import type { MetadataRoute } from "next";
import { notes } from "@/lib/notes";

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
    ...notes.map((note) => ({
      url: `${base}/rndm/${note.slug}`,
      // The day only: a time without a timezone isn't a valid sitemap date.
      lastModified: note.date.slice(0, 10),
      changeFrequency: "yearly" as const,
      priority: 0.3,
    })),
  ];
}
