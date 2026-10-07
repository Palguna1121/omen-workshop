# Validasi MVP — 7 Oktober 2026

## Pemeriksaan akhir

- `npm run build`: lolos, Next.js 16.4.0; homepage dan semua halaman portfolio diprerender.
- `npm run typecheck`: lolos.
- `npm run lint`: lolos, tanpa error/warning ESLint.
- `npm run test`: 9 tes lolos, 0 gagal. Mencakup proximity seluruh enam titik, pemilihan objek terdekat, batas radius, fase game, reduced motion, kunjungan unik, replay, serta idle bergerak dengan kaki stabil, loop menyambung, dan animasi sumber tidak berubah.
- Salinan model: 20 file, 120.372.987 byte, SHA-256 seluruh salinan cocok dengan Downloads. Header GLB v2 dan dependensi URI diperiksa; tidak ada referensi eksternal pada GLB.

## Browser

Chrome headless melalui `agent-browser`, desktop 1440 × 900 dan emulasi iPhone 14, 390 × 844. Chrome MCP headful tidak tersedia karena sesi ini tidak memiliki X server. Pemeriksaan dilakukan pada development dan diulang untuk alur utama di server produksi http://127.0.0.1:3110.

| Alur | Hasil |
| --- | --- |
| Loading → exterior preview → cinematic → third-person | Berfungsi; cinematic selesai otomatis |
| Lewati intro | Langsung memberikan kontrol |
| Model Omen asli | Berhasil dimuat dan tampil; request GLB 2.342.136 byte |
| WASD dan Shift | Karakter bergerak; Shift meningkatkan kecepatan |
| Idle → lompat → idle | Bone torso bergerak saat diam; lompat memakai pose udara dan kembali idle setelah mendarat |
| Space | Karakter naik dan mendarat di lantai yang sama |
| Space di udara / repeat | Tidak ada double jump atau lompatan otomatis saat Space ditahan |
| Lompat saat menu terbuka | Posisi tidak berubah, physics tetap berhenti |
| Tombol Lompat mobile | Bekerja pada emulasi 390 × 844; ukuran 86 × 54, berada di kanan bawah |
| Drag mouse | Kamera berputar; model dapat dilihat dari depan dan belakang |
| Dinding Rapier | Menahan W di dinding belakang tidak menembus dinding |
| E dan Esc | E dekat papan cerita membuka panel; Esc menutup |
| Panel menghentikan kontrol | Posisi tidak berubah saat tombol gerak ditekan selama panel terbuka |
| Menu → portal/proyek pilihan | Panel HTML AG Center terbuka |
| Portfolio ↔ dunia 3D | Navigasi pergi/kembali bekerja |
| Joystick emulasi mobile | Gerakan menuju papan cerita bekerja |
| Tombol Buka mobile | Membuka panel perjalanan |
| Reduced motion | Cinematic dilewati dan fase langsung playing |
| Overflow horizontal | Tidak terdeteksi pada desktop dan emulasi mobile |
| WebGL tidak tersedia | Fallback menampilkan tautan portfolio |
| Model gagal diunduh | Simulasi fetch GLB ditolak menghasilkan placeholder hooded dan game tetap masuk playing |
| Halaman portfolio tanpa skrip aplikasi | Konten HTML, proyek, navigasi, dan CSS tetap terlihat saat request skrip diblokir |

Pemeriksaan numerik tabrakan membaca posisi capsule dari browser: z berhenti pada -4,551 dan tetap sama setelah input maju ditahan lagi. Saat panel terbuka, posisi sebelum/sesudah input sama. Input dilakukan di browser, tanpa mengubah posisi karakter melalui skrip.

Pemeriksaan tambahan idle/lompat membaca posisi Rapier dan klip aktif melalui React DevTools: tinggi diam sekitar 0,899, sampel lompat mencapai 2,247, lalu kembali 0,899. Klip aktif berpindah `WorkshopIdle` → `WorkshopJump` → `WorkshopIdle`. Permintaan Space kedua di udara tidak menaikkan velocity kembali; repeat selama/selepas pendaratan tidak memulai lompatan baru. Tulang torso berubah saat diam, sedangkan posisi hips tetap. Seluruh input dibuat lewat keyboard atau tombol UI, tanpa teleport.

Ruangan memiliki plafon dan collider plafon, panel sage/kayu, lampu hangat, lampu kabel, rak buku, pegboard beralat, toolbox, bantal sofa/karpet, dan bangku bercollider. Lampu pusat menggunakan spotlight dengan satu shadow map. Referensi gambar asli masih belum ditemukan, jadi perubahan ini mengikuti deskripsi cozy garage-lab. Saat pengembangan, CSS tambahan sempat tersimpan pada cache loader; restart server membuat aturan tombol mobile tampil benar. Build produksi disusun ulang setelah perubahan.

Sampel resource produksi: hanya walk preview yang diminta, tidak ada request ke origin eksternal, dan tidak ada overflow. Ukuran ini bukan total transfer cold load atau benchmark koneksi lambat.

## HTTP produksi

Homepage, portfolio, daftar/detail proyek yang tersedia, about, experience, dan model memberi 200. `/projects/unknown` dan `/not-a-route` memberi 404. Detail proyek dibatasi ke data yang diprerender menggunakan `dynamicParams = false`.

Pada pemeriksaan normal produksi tidak terdeteksi page error. Console memiliki dua warning upstream: `THREE.Clock` deprecated dan parameter inisialisasi Rapier deprecated; keduanya tidak menghentikan MVP. Saat pengeditan struktur scene lewat hot reload, sempat muncul error DOM unmount yang pulih setelah reload penuh. Navigasi dan interaksi normal produksi diperiksa kembali tanpa error tersebut.

## Batas validasi

- Belum diuji pada ponsel fisik, Safari/Firefox, GPU lain, jaringan publik, atau hosting.
- Kamera dibatasi ke dalam dinding, tetapi belum memiliki collision sweep terhadap seluruh furniture.
- Jubah model sumber memiliki artefak auto-rig pada beberapa pose. Material ditampilkan dua sisi; perbaikan skin weights/jubah belum dilakukan.
- Klip asli hanya `walk`; idle adalah loop skeletal yang dibuat lokal, jump memakai pose lokal dan physics, run memakai walk dipercepat. Belum ada klip idle/run/jump dari animator.
- Concept art/storyboard asli belum tersedia. Environment procedural masih placeholder, bukan environment final berdasarkan gambar yang sudah diimpor.
- Isi portfolio masih draft dari konteks prototipe sebelumnya.
