import type { Metadata } from "next";
import { Inter, Lora } from "next/font/google";
import "./globals.css";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { PreviewBanner } from "@/components/PreviewBanner";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap"
});

const lora = Lora({
  subsets: ["latin"],
  variable: "--font-lora",
  display: "swap"
});

export const metadata: Metadata = {
  title: {
    default: "Counterbench.AI",
    template: "%s | Counterbench.AI"
  },
  description: "A curated directory of legal AI tools, prompts, and skills for legal professionals.",
  metadataBase: new URL(process.env.SITE_URL ?? "https://counterbench.ai")
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${lora.variable}`}>
      <head>
        {/* Keep legacy stylesheet classes for migrated marketing pages */}
        <link rel="stylesheet" href="/css/style.css" />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body>
        <SiteHeader />
        <PreviewBanner />
        {children}
        <SiteFooter />
      </body>
    </html>
  );
}
