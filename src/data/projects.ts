export type Project = {
  slug: string;
  name: string;
  category: string;
  description: string;
  tags: string[];
  color: string;
  index: string;
  url?: string;
  repository?: string;
};

// Deskripsi awal untuk ditinjau pemilik. Tambahkan URL yang sudah terverifikasi.
export const projects: Project[] = [
  {
    slug: "ag-center",
    name: "AG Center",
    category: "Platform web",
    description:
      "Eksplorasi aplikasi operasional bisnis, alur pembayaran, dan pengelolaan transaksi dalam satu platform.",
    tags: ["Laravel", "PHP", "Payment integration"],
    color: "#b4c5b2",
    index: "01",
  },
  {
    slug: "yespos",
    name: "YesPOS",
    category: "Aplikasi mobile",
    description:
      "Aplikasi kasir mobile dengan fokus pada operasional toko, stok, dan laporan shift.",
    tags: ["React Native", "TypeScript", "Mobile"],
    color: "#d5ab79",
    index: "02",
  },
  {
    slug: "coin-hunt",
    name: "Coin Hunt",
    category: "Eksperimen interaktif",
    description:
      "Eksplorasi pengalaman augmented reality yang mempertemukan karakter digital dengan ruang di sekitar kita.",
    tags: ["Flutter", "AR", "3D"],
    color: "#a3bcc1",
    index: "03",
  },
];
