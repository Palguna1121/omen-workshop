# Validasi MVP — 8 Oktober 2026

## Dunia sunset — 16 Oktober 2026

- `npm run typecheck`, `npm run lint`, `npm run build`: lolos. `npm run test`: 11/11 lolos (tes proximity diperbarui ke posisi stasiun baru, ditambah titik spawn halaman).
- Uji Chrome headless dengan GPU (ANGLE Vulkan, AMD Radeon 780M iGPU), server produksi port 3111, 1440 × 900 DPR 1, kualitas Standar: 60 fps di welcome, intro, halaman, dan interior. Kualitas Tinggi (N8AO) turun ke ~51 fps di interior, karena itu AO opsional.
- Emulasi iPhone 14 (390 × 844): 60 fps di GPU desktop (bukan angka perangkat nyata), tanpa overflow horizontal, kontrol sentuh bertema dusk, FOV portrait melebar.
- Chrome headless tanpa GPU (SwiftShader) hanya ~1,4 fps; GSAP lag smoothing membuat intro tampak berhenti di sana. Ini batas renderer CPU, bukan perangkat dengan GPU.
- Alur diuji: loading → welcome → intro 4 shot → halaman; jalan ke interior (W), marker + prompt E stasiun Keahlian muncul; jalan ke tangga rumah lalu naik ke teras (ramp collider); kamera tidak menembus dinding/plafon (raycast Rapier).
- Bloom + MSAA composer (multisampling 4) menghasilkan layar kosong di three r186 + postprocessing 6.39.5; composer memakai multisampling 0 + SMAA.
- Aset dunia: `public/models/world/kit.glb` 282.184 byte (37 prop). Tidak ada request CDN; decoder meshopt dibundel.
- Watcher `next dev` sempat tidak memuat ulang `src/app/globals.css`; menyentuh `layout.tsx` memaksa kompilasi ulang. Build produksi tidak terpengaruh.

## Pemeriksaan akhir

- `npm run build`: lolos, Next.js 16.4.0; homepage dan semua halaman portfolio diprerender.
- `npm run typecheck`: lolos.
- `npm run lint`: lolos, tanpa error/warning ESLint.
- `npm run test`: 11 tes lolos, 0 gagal. Mencakup proximity/fase game, fallback idle, klip asli yang dipertahankan, root motion walk/jump, satu hop tanpa pengulangan, durasi playback sesuai physics, dan mixer berhenti saat panel terbuka.
- Salinan model: 28 file, 140.567.107 byte, SHA-256 seluruh salinan cocok dengan Downloads. Header GLB v2 dan dependensi URI diperiksa; tidak ada referensi eksternal pada GLB.

## Run dan standing-relax — 8 Oktober

Unduhan ulang menyediakan `run` (1,25 detik) dan `standing_relax` (17,58 detik), masing-masing 195 channel dengan 65 joint/bind pose yang kompatibel. Keduanya disalin, lalu data animasinya digabungkan ke `public/models/omen-character.glb` (3.530.500 byte). Seluruh sampler, keyframe buffer, dan nama target dua klip hasil gabungan cocok dengan sumber. Bundle memiliki tujuh klip, satu mesh/skin, dan semua buffer view berada dalam batas BIN. Manifest: `character-runtime.json`.

Run memakai klip asli 1× ketika Shift + gerak. Berhenti mengembalikan idle, lalu standing-relax aktif setelah 5 detik. Root XZ walk/run/relax diselaraskan ke bind pose; ini menghapus offset awal Z sekitar 0,338 pada ekspor run agar model tetap sejajar dengan collider. Pose dan gerak vertikal asli tetap dipertahankan. Unit test mencakup offset ini dan memastikan klip sumber tidak berubah.

Uji Chrome headless pada development dan production mengonfirmasi `standing_relax` → `walk` → `run` → `walk` → `idle` → `standing_relax`, termasuk action run dengan weight 1/playback 1× dan root XZ pada anchor bind pose. Uji gerak memakai event keyboard DOM melalui controller yang sama, tanpa mengubah posisi/kecepatan/action secara langsung. Input Space dan Escape menggunakan keyboard browser. Selama menu terbuka, timer, posisi hips, dan quaternion hips tidak berubah; mixer timeScale 0. Space dari standing-relax memakai jump lalu kembali idle setelah mendarat. Production hanya meminta `/models/omen-character.glb` sebesar 3.530.500 byte, tanpa page error.

## Pembaruan animasi sebelumnya — 7 Oktober

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
| Model Omen asli | Berhasil dimuat dan tampil; bundle aktif terbaru 3.530.500 byte |
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
- Sit/defeat belum ditautkan ke aksi portfolio. Jump menggunakan excerpt satu hop, bukan seluruh rangkaian hop pada klip sumber.
- Concept art/storyboard asli belum tersedia. Environment procedural masih placeholder, bukan environment final berdasarkan gambar yang sudah diimpor.
- Isi portfolio masih draft dari konteks prototipe sebelumnya.
