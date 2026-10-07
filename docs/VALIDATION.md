# Validasi MVP — 7 Oktober 2026

## Pemeriksaan akhir

- `npm run build`: lolos, Next.js 16.4.0; homepage dan semua halaman portfolio diprerender.
- `npm run typecheck`: lolos.
- `npm run lint`: lolos, tanpa error/warning ESLint.
- `npm run test`: 11 tes lolos, 0 gagal. Mencakup proximity/fase game, fallback idle, klip asli yang dipertahankan, root motion walk/jump, satu hop tanpa pengulangan, durasi playback sesuai physics, dan mixer berhenti saat panel terbuka.
- Salinan model: 28 file, 140.110.275 byte, SHA-256 seluruh salinan cocok dengan Downloads. Header GLB v2 dan dependensi URI diperiksa; tidak ada referensi eksternal pada GLB.

## Pembaruan animasi tambahan

8 GLB baru disalin tanpa mengubah Downloads. Entry aktif diganti menjadi `chibi-animation-source.glb` dengan lima klip (`sit`, `defeat_03`, `jump`, `idle`, `walk`). `defeat_02` tersedia pada GLB terpisah. Run dan standing-relax mempunyai 0 klip. Web memakai idle/walk/jump asli; sit/defeat tersimpan untuk interaksi berikutnya, dan run tetap walk dipercepat.

Uji browser terbaru membaca klip aktif, waktu/weight action, dan posisi Rapier melalui React DevTools: idle asli bergerak, walk menggunakan root motion horizontal yang sudah dikunci, Shift memberi velocity 4,6, jump memakai satu segmen 0,417 detik dengan `LoopOnce`. Pada emulasi mobile, tinggi capsule naik dari sekitar 0,899 sampai 2,319 lalu kembali 0,899; klip berpindah `idle` → `jump` → `idle`. Weight jump sudah aktif pada frame awal input, tidak mengulang hop, dan menjadi 0 setelah transisi kembali idle. Model hanya meminta bundle 3.072.132 byte. Menu menghentikan posisi dan pose tulang bersama mixer (timeScale 0). Tidak ada overflow mobile atau page error. Pengujian memakai tombol UI/keyboard tanpa teleport.

Baris MVP lain di bawah mencatat validasi sebelumnya pada hari yang sama; perubahan animasi diuji ulang pada development dan alur utama produksi.

## Browser

Chrome headless melalui `agent-browser`, desktop 1440 × 900 dan emulasi iPhone 14, 390 × 844. Chrome MCP headful tidak tersedia karena sesi ini tidak memiliki X server. Pemeriksaan dilakukan pada development dan diulang untuk alur utama di server produksi http://127.0.0.1:3110.

Pemeriksaan production setelah build animasi baru mengonfirmasi bundle aktif dan lima klip runtime. Input Space memberi action `jump` dengan weight 1 saat capsule berada di udara, lalu kembali `idle` dengan weight 1 pada tinggi lantai sekitar 0,899. Reload dan intro normal tidak menghasilkan page error.

| Alur | Hasil |
| --- | --- |
| Loading → exterior preview → cinematic → third-person | Berfungsi; cinematic selesai otomatis |
| Lewati intro | Langsung memberikan kontrol |
| Model Omen asli | Berhasil dimuat dan tampil; bundle aktif 3.072.132 byte |
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

Pada versi fallback sebelumnya, klip `WorkshopIdle`/`WorkshopJump` memverifikasi kontrol Space di udara dan repeat tanpa lompatan tambahan. Versi terbaru menggantinya dengan klip asli; hasil pengujian klip/physics dicatat pada pembaruan animasi di atas. Idle asli mempertahankan weight shift lokal sementara capsule diam.

Ruangan memiliki plafon dan collider plafon, panel sage/kayu, lampu hangat, lampu kabel, rak buku, pegboard beralat, toolbox, bantal sofa/karpet, dan bangku bercollider. Lampu pusat menggunakan spotlight dengan satu shadow map. Referensi gambar asli masih belum ditemukan, jadi perubahan ini mengikuti deskripsi cozy garage-lab. Saat pengembangan, CSS tambahan sempat tersimpan pada cache loader; restart server membuat aturan tombol mobile tampil benar. Build produksi disusun ulang setelah perubahan.

Sampel resource: hanya bundle animasi yang diminta, tidak ada request ke GLB standalone/master saat bermain. Ukuran ini bukan total transfer cold load atau benchmark koneksi lambat.

## HTTP produksi

Homepage, portfolio, daftar/detail proyek yang tersedia, about, experience, dan model memberi 200. `/projects/unknown` dan `/not-a-route` memberi 404. Detail proyek dibatasi ke data yang diprerender menggunakan `dynamicParams = false`.

Pada pemeriksaan normal produksi tidak terdeteksi page error. Console memiliki dua warning upstream: `THREE.Clock` deprecated dan parameter inisialisasi Rapier deprecated; keduanya tidak menghentikan MVP. Saat pengeditan struktur scene lewat hot reload, sempat muncul error DOM unmount yang pulih setelah reload penuh. Navigasi dan interaksi normal produksi diperiksa kembali tanpa error tersebut.

## Batas validasi

- Belum diuji pada ponsel fisik, Safari/Firefox, GPU lain, jaringan publik, atau hosting.
- Kamera dibatasi ke dalam dinding, tetapi belum memiliki collision sweep terhadap seluruh furniture.
- Jubah model sumber memiliki artefak auto-rig pada beberapa pose. Material ditampilkan dua sisi; perbaikan skin weights/jubah belum dilakukan.
- Run dan standing-relax belum berisi klip; run memakai walk dipercepat. Sit/defeat belum ditautkan ke aksi portfolio. Jump menggunakan excerpt satu hop, bukan seluruh rangkaian hop pada klip sumber.
- Concept art/storyboard asli belum tersedia. Environment procedural masih placeholder, bukan environment final berdasarkan gambar yang sudah diimpor.
- Isi portfolio masih draft dari konteks prototipe sebelumnya.
