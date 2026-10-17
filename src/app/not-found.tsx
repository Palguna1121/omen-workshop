import Link from "next/link";

export default function NotFound() {
  return (
    <main className="lost-page">
      <span className="eyebrow">404 · Workshop Omen</span>
      <h1>
        Jalan ini belum
        <br />
        <em>dibangun.</em>
      </h1>
      <Link className="cta" href="/">
        Kembali ke workshop →
      </Link>
    </main>
  );
}
