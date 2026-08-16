import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://iegy.net/Kallista"),
  title: "Kallista by Ronadisa | Photography in Egypt",
  description:
    "Kallista by Ronadisa — wedding, children, fashion and personal photography in Egypt, with editorial elegance and authentic emotion.",
  keywords: [
    "Wedding Photographer Egypt",
    "Hijabi Wedding Photographer Egypt",
    "Wedding Photography Alexandria",
    "Fashion Photographer Egypt",
    "Children Photographer Egypt",
  ],
  openGraph: {
    title: "Kallista by Ronadisa",
    description: "Preserving what cannot be repeated.",
    type: "website",
    images: ["/ronadisa.jpg"],
  },
  other: { "codex-preview": "development" },
  icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ar" dir="rtl">
      <body>{children}</body>
    </html>
  );
}
