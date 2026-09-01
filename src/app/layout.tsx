import type { Metadata } from "next";
import { Oswald, Barlow, Cormorant_Garamond } from "next/font/google";
import { SITE_NAME, SITE_URL } from "@/lib/site";
import { BRAND_KEYWORDS, DEFAULT_OG_IMAGE, absoluteUrl } from "@/lib/seo/metadata";
import "./globals.css";

const oswald = Oswald({
  subsets: ["latin"],
  variable: "--font-oswald",
  display: "swap",
});

const barlow = Barlow({
  subsets: ["latin"],
  weight: ["400", "600"],
  variable: "--font-barlow",
  display: "swap",
  preload: true,
});

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["500"],
  style: ["italic"],
  variable: "--font-cormorant",
  display: "swap",
  preload: false,
});

const siteDescription =
  "RAX Cut Co. builds American hardwood cutting boards with an integrated drip tray — for steaks, brisket, BBQ, and wild game. Maple from $180.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  applicationName: SITE_NAME,
  title: {
    default: `${SITE_NAME} | Original Drip Board — Crafted for the Cut`,
    template: `%s | ${SITE_NAME}`,
  },
  description: siteDescription,
  keywords: [...BRAND_KEYWORDS],
  authors: [{ name: SITE_NAME, url: SITE_URL }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  category: "shopping",
  alternates: {
    canonical: SITE_URL,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: `${SITE_NAME} | Original Drip Board — Crafted for the Cut`,
    description: siteDescription,
    images: [
      {
        url: absoluteUrl(DEFAULT_OG_IMAGE),
        width: 1200,
        height: 630,
        alt: `${SITE_NAME} Original Drip Board`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} | Crafted for the Cut`,
    description: siteDescription,
    images: [absoluteUrl(DEFAULT_OG_IMAGE)],
  },
  icons: {
    icon: "/icon.png",
    apple: "/apple-icon.png",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${oswald.variable} ${barlow.variable} ${cormorant.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-white font-sans text-rax-ink">
        {children}
      </body>
    </html>
  );
}
