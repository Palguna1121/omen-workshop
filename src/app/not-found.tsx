import Link from "next/link";
import { WebLayout } from "@/ui/WebLayout";

export default function NotFound() {
  return (
    <WebLayout>
      <header className="web-hero">
        <span className="eyebrow">404 / Sudut yang belum dibangun</span>
        <h1>
          Sepertinya kita
          <br />
          <em>tersesat sedikit.</em>
        </h1>
        <p>Masih ada banyak ide untuk ditemukan di workshop.</p>
        <Link className="button button-dark" href="/portfolio">
          Kembali ke portfolio →
        </Link>
      </header>
    </WebLayout>
  );
}
