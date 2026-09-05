import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";

// Only Regular and Semibold are ever used (font-semibold on the h1, Regular
// everywhere else) — Medium and Bold aren't referenced anywhere in the site,
// so declaring them here would just make every page preload two dead fonts.
const switzer = localFont({
  src: [
    { path: "./fonts/Switzer-Regular.woff2", weight: "400", style: "normal" },
    { path: "./fonts/Switzer-Semibold.woff2", weight: "600", style: "normal" },
  ],
  variable: "--font-switzer",
  display: "swap",
  // `swap` means the first paint is Arial. Without matched metrics that
  // handover reflows every line the instant Switzer lands; adjustFontFallback
  // generates a size-adjusted Arial so the swap is close to invisible.
  fallback: ["Arial", "Helvetica", "sans-serif"],
  adjustFontFallback: "Arial",
});

const description =
  "designer based in Argentina. Raised by FADU & soulseek and making the internet fun (and raw) again.";

const socialLinks = [
  "https://x.com/_rawpower",
  "https://github.com/rawwwpower",
  "https://www.linkedin.com/in/anabelenv",
];

export const metadata: Metadata = {
  metadataBase: new URL("https://anavare.la"),
  title: {
    default: "Ana Varela, designer",
    template: "%s · Ana Varela",
  },
  description,
  authors: [{ name: "Ana Varela", url: "https://anavare.la" }],
  creator: "Ana Varela",
  // No canonical here on purpose: metadata in the root layout applies to
  // every route, so a canonical of "/" told search engines that /rndm and
  // every note were duplicates of the home page — while sitemap.ts was
  // asking for them to be indexed. Each page declares its own.
  openGraph: {
    type: "website",
    url: "https://anavare.la",
    siteName: "Ana Varela",
    locale: "en_US",
    title: "Ana Varela, designer",
    description,
  },
  twitter: {
    card: "summary_large_image",
    site: "@_rawpower",
    creator: "@_rawpower",
    title: "Ana Varela, designer",
    description,
  },
};

// Keeps mobile browser chrome the same colour as the page instead of a
// system bar sitting over it. /rndm overrides this with its light value.
export const viewport: Viewport = {
  themeColor: "#1c1c1a",
};

// JSON-LD: tells search engines that anavare.la and all these profiles are
// the same person, so searches for "Ana Varela" connect back here.
const personJsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "Ana Varela",
  url: "https://anavare.la",
  jobTitle: "Designer",
  description,
  sameAs: socialLinks,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${switzer.variable} antialiased`}>
      {/* No height or flex plumbing here: every page's own root is
          min-h-svh, and body's background paints the whole canvas anyway. */}
      <body className="bg-background text-foreground">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
        />
        {children}
      </body>
    </html>
  );
}
