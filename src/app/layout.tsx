import type { Metadata, Viewport } from "next";
import "@fontsource/manrope/400.css";
import "@fontsource/manrope/600.css";
import "@fontsource/fredoka/600.css";
import "./globals.css";

const description =
  "Jelajahi rumah, garasi, dan halaman Omen di atas bukit saat matahari terbenam. Duduk, nyalakan radio, lewati portal, dan temukan kristal yang tersembunyi.";

// Domain publik untuk URL absolut (gambar share). Di Vercel otomatis memakai
// domain produksi; host lain: set SITE_URL, mis. https://workshop-omen.example.
const siteUrl = process.env.SITE_URL;

export const metadata: Metadata = {
  ...(siteUrl ? { metadataBase: new URL(siteUrl) } : {}),
  title: { default: "Workshop Omen", template: "%s · Workshop Omen" },
  description,
  applicationName: "Workshop Omen",
  icons: { icon: "/icon.svg" },
  openGraph: {
    type: "website",
    siteName: "Workshop Omen",
    title: "Workshop Omen",
    description,
    locale: "id_ID",
  },
  twitter: {
    card: "summary_large_image",
    title: "Workshop Omen",
    description,
  },
};

export const viewport: Viewport = {
  themeColor: "#140c22",
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
