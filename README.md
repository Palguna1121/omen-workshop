# Omen Workshop

MVP portfolio 3D berbasis web: cozy garage-lab, karakter chibi hooded Omen dari GLB lokal pengguna, cinematic exterior → approach → entrance → interior, lalu eksplorasi third-person. Fondasi kontrol/UI diadaptasi dari prototipe lokal `pf-workshop`; proyek itu tidak diubah.

## Menjalankan

Node.js 20.9+ dan npm. Semua dependency terkunci di `package-lock.json`.

```sh
cd /home/nanaaa/Code/portfolio/omen-workshop
npm ci
npm run dev
```

Buka **http://127.0.0.1:3110**. Tombol **Masuk workshop** memulai intro sekitar 9,6 detik; **Lewati intro** langsung memberikan kontrol. Port 3110 dipilih agar tidak berbenturan dengan prototipe sebelumnya.

```sh
npm run typecheck
npm run lint
npm run test
npm run build
npm run start
```

`dev` dan `start` memakai port yang sama, jadi hentikan dev sebelum menjalankan produksi. Tidak membutuhkan akun, API key, database, atau layanan berbayar.

## Kontrol

| Aksi | Desktop | Layar sentuh |
| --- | --- | --- |
| Bergerak | WASD / tombol panah | Joystick kiri |
| Berlari | Shift | Kecepatan jalan |
| Lompat | Space (sekali tekan) | Tombol Lompat |
| Kamera | Drag mouse; scroll untuk zoom | Drag dunia |
| Interaksi | E / klik label / tombol bawah | Tap label / Buka |
| Menu | Esc / tombol menu | Tombol menu |
| Tutup panel | Esc / tombol tutup / backdrop | Tombol tutup / backdrop |

Kontrol dan physics berhenti saat panel/menu terbuka. Blur/tab tersembunyi membersihkan input. Reduced motion melewati intro; perangkat sentuh memakai DPR 1 dan tanpa realtime shadow. Audio ambient sintetis opsional menyala setelah tombol suara ditekan.

## Model dan animasi

**Entry runtime:** `public/models/omen/chibi-hooded-walk-preview.glb` → `/models/omen/chibi-hooded-walk-preview.glb`.

Seluruh isi `/home/nanaaa/Downloads/omen` disalin ke `public/models/omen/` dengan struktur relatif utuh. Ada 20 file, total 120.372.987 byte, termasuk master, video, folder `tess`, referensi, serta laporan sumber. Sumber asli tidak diedit. Checksum SHA-256 semua salinan cocok dengan sumber; lihat `docs/model-inventory.json`.

| File | Ukuran | Isi |
| --- | ---: | --- |
| `chibi-hooded-walk-preview.glb` | 2.342.136 byte | Mesh, skin, tekstur embedded, klip `walk` |
| `chibi-hooded-rigged.glb` | 2.274.336 byte | Mesh, skin, tekstur embedded; tanpa klip |
| `chibi-hooded-textured-master.glb` | 54.668.072 byte | Master bertekstur; tanpa klip |
| `chibi-hooded-master.glb` | 45.557.660 byte | Master mesh; tanpa klip |

Semua GLB memiliki header v2 dan tidak membutuhkan URI `.bin`/tekstur eksternal. Salinan `tess/` dipertahankan. Browser hanya meminta walk preview 2,34 MB saat masuk; master dan video tidak dimuat oleh aplikasi.

Model dinormalisasi ke tinggi 1,65 unit, diklon dengan SkeletonUtils, dan mengikuti capsule Rapier. Klip asli **hanya `walk`** (sekitar 2,33 detik). `WorkshopIdle` kini merupakan loop skeletal 4,8 detik: dada bergerak halus, kepala dan lengan mengayun ringan, sementara kaki/hips mempertahankan bind pose agar menapak. `WorkshopJump` memberi pose udara; posisi lompat dan pendaratan ditangani Rapier. Kedua klip dibuat di aplikasi, tanpa menulis ulang GLB. Walk dipercepat 1,7× saat berlari. Ganti nama di `characterAsset.animations` dalam `src/game/config.ts` untuk memakai klip idle/run/jump final.

Space dan tombol mobile meminta satu lompatan. Ray di bawah capsule mengecualikan karakter sendiri dan memeriksa arah normal permukaan; permintaan di udara dibuang. Menahan Space tidak menyebabkan lompatan berulang. Ada tabrakan plafon dan furniture, dan kontrol lompat ikut berhenti saat panel/menu terbuka.

Model gagal dimuat memakai placeholder hooded dengan tiga tanda cyan. Aset asal memiliki keterbatasan auto-rig jubah; lipatan/penetrasi jubah masih terlihat pada beberapa pose. Perbaikan skin weights dan animasi jubah adalah tahap berikutnya.

Untuk memeriksa ulang inventaris dan salinan:

```sh
npm run inspect:assets -- /home/nanaaa/Downloads/omen
```

## Concept art dan storyboard

Folder `public/assets/concepts/` dan `public/assets/storyboards/` sudah disiapkan. **Gambar asli dari chat “Ide Game Web 3D” tidak tersedia sebagai lampiran/file yang dapat diambil pada sesi ini.** Pemeriksaan folder Downloads dan workspace tidak menemukan delapan gambar yang dimaksud. Screenshot prototipe lain tidak diperlakukan sebagai concept art.

Nama tujuan ketika gambar asli tersedia:

```text
public/assets/concepts/
  interior-isometric.png
  interior-cozy.png
  exterior-establishing.png
  exterior-approach.png
  entrance.png
  interior-3d-preview.png
public/assets/storyboards/
  storyboard-01-04.png
  storyboard-05-08.png
```

Lihat `docs/ASSETS.md`. Environment mengikuti deskripsi cozy garage-lab: plafon tertutup, rangka dan panel kayu/sage, lampu gantung hangat dan lampu kabel, PC, meja kerja/3D printer/hologram, pegboard beralat, rak buku, tanaman, sofa dengan bantal dan karpet, rak koleksi, papan cerita, dan portal. `WorkshopDetails.tsx` menampung detail tambahan. Layout masih procedural dan belum dicocokkan langsung ke gambar referensi yang belum tersedia.

## Interaksi dan halaman biasa

| Objek | Konten |
| --- | --- |
| Meja kerja | Proyek |
| PC | Keahlian / tech stack |
| Sofa | Tentang saya |
| Rak koleksi / trophy | Pengalaman |
| Papan cerita | Perjalanan |
| Portal | Proyek pilihan |

Konten portfolio dirender sebagai HTML dengan modal native dan pengembalian fokus. Menu memberi akses langsung ke semua sudut. `/portfolio`, `/projects`, `/projects/[slug]`, `/about`, dan `/experience` menyediakan portfolio biasa. Halaman HTML dapat dibaca tanpa WebGL dan tanpa JavaScript. Homepage memiliki ringkasan HTML dan tautan noscript. WebGL tidak tersedia atau context hilang menampilkan fallback.

Data awal di `src/data/` masih draft dari konteks sebelumnya. Tidak ada perusahaan, tanggal kerja, metrik hasil, kontak, CV, atau URL eksternal yang dikarang. Tinjau nama/deskripsi proyek dan tambahkan link nyata sebelum publikasi.

## Struktur

```text
src/
  app/                    Rute Next.js, metadata, CSS Tailwind
  game/
    Game.tsx              Canvas, physics, kualitas, fallback
    config.ts             Entry model, spawn, stasiun interaksi
    runtime.ts            Input/posisi per-frame
    player/               Controller, capsule, model, animasi
    camera/               Intro GSAP dan kamera third-person
    world/                Rumah, garage, equipment, portal
    interaction/          Radius terdekat, prompt, sistem interaksi
    audio/                Ambient WebAudio
  ui/                     Loading, HUD, joystick, modal, konten HTML
  data/                   Profil, proyek, skill, pengalaman
  store/                  State Zustand
scripts/inspect-assets.mjs Pemeriksaan inventaris dan checksum
```

Stack: Next.js 16.4, React 19, TypeScript, Tailwind 4, Three.js, Fiber 9, drei, Rapier 2, Zustand, dan GSAP. Font disajikan lokal. Tidak ada model, HDR, font, audio, atau decoder yang diunduh dari CDN saat runtime. Versi renderer dipasangkan sesuai [dokumentasi Fiber](https://r3f.docs.pmnd.rs/getting-started/installation) dan [Rapier](https://pmndrs.github.io/react-three-rapier/).

## Validasi dan tahap berikut

Hasil pemeriksaan sesi ini dicatat di `docs/VALIDATION.md`.

1. Masukkan concept art/storyboard asli, lalu finalisasi ukuran/layout dan lighting sesuai referensi favorit.
2. Ganti geometri rumah/prop dengan GLB teroptimasi; pertahankan collider sederhana dan titik interaksi.
3. Siapkan klip idle/run/jump dari animator, perbaiki skin weights jubah, dan poles transisi/feet contact.
4. Tambahkan collision kamera terhadap prop; saat ini kamera dibatasi ke dalam dinding hub.
5. Lengkapi studi kasus, pengalaman, kontak, dan CV milik pemilik.
6. Lakukan QA perangkat fisik, Safari/Firefox, koneksi lambat, kemudian hosting.
