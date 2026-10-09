import type { Metadata } from "next";
import { Fraunces, Manrope } from "next/font/google";
import { CitySwitcherScript } from "@/components/city-switcher-script";
import { SiteFooter } from "@/components/site-footer";
import "./globals.css";

const display = Fraunces({
  variable: "--font-display",
  subsets: ["latin"],
});

const body = Manrope({
  variable: "--font-body",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "SceneAround",
    template: "%s · SceneAround",
  },
  description: "Discover the best events, experiences, and things to do across Indian cities.",
  metadataBase: new URL(process.env.SITE_URL ?? "http://localhost:3000"),
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en-IN" className={`${display.variable} ${body.variable} h-full`}>
      <body className="min-h-full flex flex-col antialiased">
        <CitySwitcherScript />
        {children}
        <SiteFooter />
      </body>
    </html>
  );
}
