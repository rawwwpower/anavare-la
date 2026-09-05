import type { Metadata } from "next";
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
  keywords: [
    "Ana Varela",
    "designer",
    "product designer",
    "diseñadora de producto",
    "designer Argentina",
    "raw power",
    "portfolio",
  ],
  authors: [{ name: "Ana Varela", url: "https://anavare.la" }],
  creator: "Ana Varela",
  alternates: {
    canonical: "/",
  },
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
    <html lang="en" className={`${switzer.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
        />
        {children}
      </body>
    </html>
  );
}
