import type { Metadata } from "next";
import "@fontsource/lora/500.css";
import "@fontsource/lora/500-italic.css";
import "@fontsource/manrope/400.css";
import "@fontsource/manrope/600.css";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "Omen Workshop · Palguna", template: "%s · Omen Workshop" },
  description:
    "Jelajahi cozy garage-lab bersama Omen. Portfolio interaktif Palguna dengan proyek, keahlian, dan cerita yang juga tersedia sebagai halaman web biasa.",
  icons: { icon: "/icon.svg" },
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
