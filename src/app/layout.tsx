import type { Metadata } from "next";
import { Geist_Mono } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";

const switzer = localFont({
  src: [
    { path: "./fonts/Switzer-Regular.woff2", weight: "400", style: "normal" },
    { path: "./fonts/Switzer-Medium.woff2", weight: "500", style: "normal" },
    { path: "./fonts/Switzer-Semibold.woff2", weight: "600", style: "normal" },
    { path: "./fonts/Switzer-Bold.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-switzer",
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
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
    <html
      lang="en"
      className={`${switzer.variable} ${geistMono.variable} h-full antialiased`}
    >
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
