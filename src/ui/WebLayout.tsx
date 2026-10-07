import Link from "next/link";
import type { ReactNode } from "react";
import { profile } from "@/data/profile";

export function WebLayout({
  children,
  active,
}: {
  children: ReactNode;
  active?: string;
}) {
  return (
    <div className="web-shell">
      <a href="#content" className="skip-link">
        Lewati ke konten
      </a>
      <header className="web-header">
        <Link className="brand" href="/portfolio">
          <span className="brand-mark">P.</span>
          <span>
            Palguna<span className="brand-subtitle">WORKSHOP</span>
          </span>
        </Link>
        <nav aria-label="Navigasi portfolio">
          {[
            { url: "/projects", label: "Proyek" },
            { url: "/experience", label: "Pengalaman" },
            { url: "/about", label: "Tentang" },
          ].map((item) => (
            <Link
              key={item.url}
              href={item.url}
              aria-current={active === item.url ? "page" : undefined}
            >
              {item.label}
            </Link>
          ))}
          <Link href="/" className="web-enter">
            Masuk dunia 3D <span>↗</span>
          </Link>
        </nav>
      </header>
      <main id="content" className="web-content">
        {children}
      </main>
      <footer className="web-footer">
        <span>© {profile.name}</span>
        <span>Dari ide kecil, untuk dunia yang lebih luas.</span>
        <Link href="/">Kembali ke workshop ↗</Link>
      </footer>
    </div>
  );
}
