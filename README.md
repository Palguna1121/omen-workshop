# Omen Workshop

Portfolio 3D berbasis web: villa dua lantai dan garage-lab di atas bukit tepi laut saat matahari terbenam, karakter chibi hooded Omen dari GLB lokal pengguna, cinematic exterior → approach → entrance → halaman, lalu eksplorasi third-person di halaman, teras, dan interior garasi. Fondasi kontrol/UI diadaptasi dari prototipe lokal `pf-workshop`; proyek itu tidak diubah.

## Menjalankan

Node.js 20.9+ dan npm. Semua dependency terkunci di `package-lock.json`.

```sh
cd /home/nanaaa/Code/portfolio/omen-workshop
npm ci
npm run dev
```

Buka **http://127.0.0.1:3110**. Tombol **Masuk workshop** memulai intro sekitar 9,2 detik dan berakhir di halaman depan garasi; **Lewati intro** langsung memberikan kontrol. Port 3110 dipilih agar tidak berbenturan dengan prototipe sebelumnya.

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

Kontrol dan physics berhenti saat panel/menu terbuka. Blur/tab tersembunyi membersihkan input. Reduced motion melewati intro dan membekukan animasi dunia (awan, laut, angin, portal, burung). Kamera ditarik maju bila terhalang dinding/plafon (raycast Rapier); layar portrait memakai FOV lebih lebar. Audio ambient sintetis opsional (drone hangat, angin, jangkrik) menyala setelah tombol suara ditekan.

Kualitas di menu **Detail dunia**:

| Pilihan | Isi |
| --- | --- |
| Ringan (otomatis untuk layar sentuh/≤4 core) | DPR 1, tanpa shadow, tanpa post-processing, lampu non-esensial dimatikan, hutan jauh separuh |
| Standar (default) | Shadow matahari 2048, bloom, vignette, tone mapping ACES, SMAA |
| Tinggi (AO) | Standar + ambient occlusion N8AO |

## Model dan animasi

**Entry runtime:** `public/models/omen-character.glb` → `/models/omen-character.glb`.

Seluruh isi `/home/nanaaa/Downloads/omen` disalin ke `public/models/omen/` dengan struktur relatif utuh, termasuk 8 GLB tambahan dan unduhan ulang run/standing-relax. Ada 28 file, total 140.567.107 byte, termasuk master, video, folder `tess`, referensi, serta laporan sumber. Sumber asli tidak diedit. Checksum SHA-256 semua salinan cocok dengan sumber; lihat `docs/model-inventory.json`.

| File | Ukuran | Isi |
| --- | ---: | --- |
| `chibi-animation-source.glb` | 3.072.132 byte | Bundle sumber; `idle`, `walk`, `jump`, `sit`, `defeat_03` |
| `chibi-idle.glb` | 2.615.944 byte | Klip `idle` |
| `chibi-jump.glb` | 2.354.600 byte | Klip `jump` |
| `chibi-walk.glb` | 2.330.852 byte | Klip `walk` |
| `chibi-sit.glb` | 2.455.832 byte | Klip `sit` |
| `chibi-defeat-2.glb` | 2.359.252 byte | Klip `defeat_02` |
| `chibi-omen-run.glb` | 2.332.996 byte | Klip `run`, 1,25 detik |
| `chibi-omen-standing-relax.glb` | 2.672.512 byte | Klip `standing_relax`, 17,58 detik |
| `chibi-hooded-walk-preview.glb` | 2.342.136 byte | Mesh, skin, tekstur embedded, klip `walk` |
| `chibi-hooded-rigged.glb` | 2.274.336 byte | Mesh, skin, tekstur embedded; tanpa klip |
| `chibi-hooded-textured-master.glb` | 54.668.072 byte | Master bertekstur; tanpa klip |
| `chibi-hooded-master.glb` | 45.557.660 byte | Master mesh; tanpa klip |

Semua GLB memiliki header v2 dan tidak membutuhkan URI `.bin`/tekstur eksternal. Salinan `tess/` dipertahankan. `npm run prepare:character` menggabungkan data klip run/standing-relax ke model utama, tanpa menduplikasi mesh/tekstur/skeleton dan tanpa mengubah salinan sumber. Hasilnya `public/models/omen-character.glb`, 3.530.500 byte, dengan tujuh klip. Browser hanya meminta bundle runtime 3,53 MB; GLB sumber, master, dan video tidak dimuat oleh aplikasi. Asal dan checksum bundle dicatat di `docs/character-runtime.json`.

Model dinormalisasi ke tinggi 1,65 unit, diklon dengan SkeletonUtils, dan mengikuti capsule Rapier. Semua klip memakai skeleton 65 joint yang kompatibel. Web menggunakan klip asli `idle` (15,33 detik), `walk` (2,33 detik), `run` (1,25 detik), `standing_relax` (17,58 detik), dan `jump` (sumber 2,21 detik). Shift + gerak memakai run dengan playback asli 1×. Setelah diam 5 detik, idle berganti standing-relax; gerak atau jump langsung membatalkannya. Timer dan animasi berhenti saat panel/menu terbuka. Idle mempertahankan weight shift animator. Root XZ walk/run/relax dikunci ke bind pose agar tidak bergeser dari collider, termasuk offset Z awal ekspor run; gerak vertikal/pose tulang tetap dipertahankan.

Klip jump sumber berisi beberapa hop. Runtime menggunakan segmen pertama, frame 0 sampai sebelum 11 pada 24 fps (0–0,417 detik), sebagai satu lompatan. Root translation XYZ pada segmen ini dikunci agar tidak menambahkan perpindahan/tinggi di atas Rapier. Pose tulang tetap berasal dari klip asli. Klip dimainkan sekali, waktunya disesuaikan ke lama terbang nominal sekitar 1,08 detik, lalu kembali idle/walk setelah kaki menapak. Input dan state animasi diproses sebelum mixer/physics; posisi runtime diperbarui sesudah step physics. File sumber dan klip sumber dalam GLB tetap utuh.

Pemetaan klip dan jeda standing-relax dapat diganti di `src/game/config.ts`. Run hanya memakai walk 1,7× sebagai cadangan jika model pengganti tidak mempunyai klip run. `sit` (7,17 detik), `defeat_03` (5,54 detik), dan `defeat_02` (5,54 detik) sudah tersimpan; belum ditautkan ke aksi portfolio. Idle/jump prosedural hanya menjadi cadangan bila model pengganti tidak memiliki klip tersebut.

Space dan tombol mobile meminta satu lompatan. Ray di bawah capsule mengecualikan karakter sendiri dan memeriksa arah normal permukaan; permintaan di udara dibuang. Menahan Space tidak menyebabkan lompatan berulang. Ada tabrakan plafon dan furniture. Physics, kontrol, dan mixer animasi ikut berhenti saat panel/menu terbuka.

Model gagal dimuat memakai placeholder hooded dengan tiga tanda cyan. Aset asal memiliki keterbatasan auto-rig jubah; lipatan/penetrasi jubah masih terlihat pada beberapa pose. Perbaikan skin weights dan animasi jubah adalah tahap berikutnya.

Untuk memeriksa ulang inventaris dan salinan:

```sh
npm run inspect:assets -- /home/nanaaa/Downloads/omen
npm run prepare:character
```

## Dunia

- **Langit & laut**: shader kubah sunset (gradasi ungu–magenta–jingga, matahari, awan fbm, bintang) dan laut dengan kilau matahari; tebing laut, pagoda, hutan tropis dari pohon kit, lampu desa di lembah, dan burung terbang.
- **Plot**: halaman ubin basah (memantulkan langit lewat environment map), tembok batu dengan pilar lentera dan pagar kayu, pohon peneduh besar berlampion rotan, palem, pisang, bougainvillea, pot besar.
- **Rumah**: plinth batu, tangga dengan strip LED (bisa dinaiki), teras dan balkon kayu, pintu berukir, jendela hangat, spanduk ungu, lampu dinding, lampu kabel, atap genteng.
- **Garasi**: bukaan lebar dengan neon oranye, awning genteng, rooftop terrace berpergola dan lampu kabel. Interiornya dinding panel merah, lampion rotan, lampu tabung oranye, meja PC tiga monitor, papan blueprint, workbench + pegboard, lemari perkakas merah, portal batu dengan pusaran shader dan kristal, rak trofi, sudut santai, motor dengan rim neon cyan.
- **Hotspot**: ikon gelembung neon melayang di atas tiap stasiun dan memudar saat kamera terlalu dekat; stasiun terdekat diganti tombol HTML yang bisa diklik.
- **Performa**: arsitektur statis digabung per material (`StaticBatch`), props kit di-instance, material/geometri dipakai bersama, lampu bertingkat prioritas. Di iGPU Radeon 780M (Chrome, 1440×900, DPR 1): 60 fps di welcome, intro, halaman, dan interior pada kualitas Standar.

Sumber aset, lisensi, dan pipeline Blender → glTF ada di `docs/ASSETS.md`.

## Concept art dan storyboard

Lima referensi visual dunia dari pemilik (16 Oktober 2026) tersimpan terkompresi di `docs/references/` dan tidak ikut deploy. Folder `public/assets/concepts/` dan `public/assets/storyboards/` tetap disiapkan untuk delapan gambar asli dari chat “Ide Game Web 3D”, yang belum tersedia sebagai file.

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

Lihat `docs/ASSETS.md`.

## Interaksi dan halaman biasa

| Objek | Konten |
| --- | --- |
| Workbench + pegboard | Proyek |
| Meja PC tiga monitor | Keahlian / tech stack |
| Sudut santai (sofa) | Tentang saya |
| Rak trofi | Pengalaman |
| Papan blueprint | Perjalanan |
| Portal batu | Proyek pilihan |

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
scripts/inspect-assets.mjs        Pemeriksaan inventaris dan checksum
scripts/fetch-world-assets.mjs    Unduh kit Kenney CC0 ke .cache/
scripts/blender/build-world-kit.py Rakit kit props di Blender
scripts/optimize-world-kit.mjs    Optimasi kit → public/models/world/kit.glb
docs/references/                  Referensi visual dunia (tidak di-deploy)
```

Stack: Next.js 16.4, React 19, TypeScript, Tailwind 4, Three.js, Fiber 9, drei, Rapier 2, @react-three/postprocessing, Zustand, dan GSAP. glTF-Transform + meshoptimizer hanya untuk pipeline aset (devDependency). Font disajikan lokal. Tidak ada model, HDR, font, audio, atau decoder yang diunduh dari CDN saat runtime. Versi renderer dipasangkan sesuai [dokumentasi Fiber](https://r3f.docs.pmnd.rs/getting-started/installation) dan [Rapier](https://pmndrs.github.io/react-three-rapier/).

## Validasi dan tahap berikut

Hasil pemeriksaan sesi ini dicatat di `docs/VALIDATION.md`.

1. Interior rumah belum bisa dimasuki; pintu rumah bisa menjadi stasiun baru (misalnya kontak) bila dibutuhkan.
2. Arsitektur rumah/garasi masih procedural; bila ingin detail setara referensi, model ulang fasad di Blender dan muat lewat pipeline kit, pertahankan collider sederhana.
3. Tautkan sit/defeat bila interaksinya dibutuhkan, dan perbaiki skin weights jubah/feet contact.
4. Tambahkan collision kamera terhadap prop; saat ini kamera dibatasi ke dalam dinding hub.
5. Lengkapi studi kasus, pengalaman, kontak, dan CV milik pemilik.
6. Lakukan QA perangkat fisik, Safari/Firefox, koneksi lambat, kemudian hosting.
