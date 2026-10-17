# Workshop Omen

Dunia 3D eksplorasi berbasis web: villa dua lantai dan garasi milik Omen di atas bukit tepi laut saat matahari terbenam. Karakter chibi hooded Omen berasal dari GLB lokal pengguna. Alurnya: cinematic exterior → approach → entrance → halaman, lalu jelajah bebas third-person di halaman, teras, interior garasi, dan teras atap. Tidak ada konten portfolio: yang ada benda yang bisa dipakai, kristal tersembunyi, dan makhluk kecil. Fondasi kontrol diadaptasi dari prototipe lokal `pf-workshop`; proyek itu tidak diubah.

## Menjalankan

Node.js 20.9+ dan npm. Semua dependency terkunci di `package-lock.json`.

```sh
cd /home/nanaaa/Code/portfolio/omen-workshop
npm ci
npm run dev
```

Buka **http://127.0.0.1:3110**. Tombol **Masuk** memulai intro sekitar 9,2 detik (sekaligus menyalakan suara) dan berakhir di halaman depan garasi; **Lewati intro** langsung memberikan kontrol. Port 3110 dipilih agar tidak berbenturan dengan prototipe sebelumnya.

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
| Kamera | Drag mouse; scroll untuk zoom; **M** atau **Alt** mengunci kursor (kamera mengikuti mouse tanpa drag) | Drag dunia |
| Aksi benda | E / klik label / tombol bawah | Tap label / Aksi |
| Berdiri dari kursi | Gerak, Space, E, atau Esc | Joystick / Berdiri |
| Peta | **Tab** / klik minimap / ikon peta | Ikon peta |
| Pengaturan | Esc / ikon pengaturan | Ikon pengaturan |
| Suara cepat | Ikon speaker di kanan atas | Ikon speaker |

Kontrol dan physics berhenti saat pengaturan/peta terbuka; kursor yang terkunci otomatis dilepas. Esc yang dipakai browser untuk melepas kursor tidak sekaligus membuka pengaturan. Chrome tidak menghitung Alt tunggal sebagai gestur pengguna, jadi bila Alt gagal mengunci, layar memberi petunjuk memakai M; Alt juga dicegah membuka menu bar Firefox. Blur/tab tersembunyi membersihkan input. Reduced motion melewati intro dan membekukan animasi dunia (awan, laut, angin, portal, burung, kipas, uap). Kamera ditarik maju bila terhalang dinding/plafon (raycast Rapier); layar portrait memakai FOV lebih lebar.

### Antarmuka

Tidak ada header: semua kontrol berupa widget mengambang. Kiri atas menampilkan area tempat Omen berada (Halaman, Garasi, Teras rumah, Teras atap, Taman tebing, Kebun palem, Lorong belakang, Pohon lentera) dan, bila diaktifkan, chip FPS. Kanan atas berisi ikon suara, peta, kunci kursor (disembunyikan di layar sentuh), pengaturan, counter kristal, dan minimap (desktop).

Peta digambar dengan canvas 2D dari konstanta layout yang sama dengan dunia (`src/ui/WorldMap.tsx`): denah rumah/garasi, halaman, pohon, ikon benda, kristal yang sudah ditemukan, panah arah Omen, dan kerucut pandang kamera. Peta besar menambah label area dan legenda.

### Pengaturan

Panel pengaturan memakai kontrol kustom (segmen, saklar, slider dengan role ARIA dan navigasi keyboard), tanpa dropdown atau elemen form bawaan browser. Semua nilai tersimpan di `localStorage` (`workshop-omen:pengaturan`) dan divalidasi saat dimuat.

| Tab | Isi |
| --- | --- |
| Grafis | Preset Ringan/Standar/Tinggi, resolusi render 50–100 %, bloom, bayangan matahari, ambient occlusion, partikel & debu, lampu tambahan, tampilkan FPS. Mengubah opsi manual menandai preset "Kustom". |
| Suara | Saklar suara, volume utama, ambient senja, musik radio, efek, tombol uji suara. |
| Kontrol | Sensitivitas kamera (drag & kursor terkunci), balik sumbu Y, kurangi gerakan, daftar tombol. |
| Kristal | Daftar kristal, putar intro lagi, sembunyikan kristal lagi, reset pengaturan. |

Perangkat sentuh atau ≤4 core mulai dari preset Ringan bila belum ada pengaturan tersimpan. Di iGPU Radeon 780M: Standar 60 fps, Tinggi (AO) ~51 fps di interior.

## Deploy

Semua rute statis (`/`, 404, gambar Open Graph/Twitter), tanpa API key atau database.

- **Vercel (disarankan):** impor repo, build default `npm run build`. URL gambar share otomatis memakai domain produksi.
- **Host lain (Node):** set `SITE_URL` saat build (mis. `SITE_URL=https://workshop-omen.contoh npm run build`), lalu `npm run start`. Tanpa `SITE_URL`, URL gambar share jatuh ke `localhost`.
- **Ukuran:** `public/` 3,7 MB (karakter 3,4 MB + kit 0,28 MB). Bundle JS game ~1,4 MB gzip (Three.js + Rapier). Model di-*preload* lewat `<link rel="preload">` sehingga diunduh bersamaan dengan JS.
- **Aset mentah** (master, video, sumber animasi; 135 MB) ada di `assets-src/omen/`, di-gitignore dan tidak ikut deploy. Riwayat git lama masih memuatnya; bersihkan dengan `git filter-repo` sebelum push bila repo akan publik.
- **Metadata share:** `src/app/opengraph-image.jpg` dan `twitter-image.jpg` (1200 × 630, screenshot hero) beserta teks alt.

Sebelum publik, uji di perangkat nyata: iPhone Safari, Android kelas bawah, Firefox, dan kunci kursor (M/Alt).

## Model dan animasi

**Entry runtime:** `public/models/omen-character.glb` → `/models/omen-character.glb`.

Seluruh isi `/home/nanaaa/Downloads/omen` disalin ke `assets-src/omen/` (di-gitignore dan tidak ikut deploy; hanya bundle runtime yang ada di `public/`) dengan struktur relatif utuh, termasuk 8 GLB tambahan dan unduhan ulang run/standing-relax. Ada 28 file, total 140.567.107 byte, termasuk master, video, folder `tess`, referensi, serta laporan sumber. Sumber asli tidak diedit. Checksum SHA-256 semua salinan cocok dengan sumber; lihat `docs/model-inventory.json`.

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

Pemetaan klip dan jeda standing-relax dapat diganti di `src/game/config.ts`. Run hanya memakai walk 1,7× sebagai cadangan jika model pengganti tidak mempunyai klip run. `sit` (7,17 detik), `defeat_03` (5,54 detik), dan `defeat_02` (5,54 detik) sudah tersimpan; `sit` dipakai untuk duduk di sofa dan kursi gaming; `defeat` belum dipakai. Idle/jump prosedural hanya menjadi cadangan bila model pengganti tidak memiliki klip tersebut.

Space dan tombol mobile meminta satu lompatan. Ray di bawah capsule mengecualikan karakter sendiri dan memeriksa arah normal permukaan; permintaan di udara dibuang. Menahan Space tidak menyebabkan lompatan berulang. Ada tabrakan plafon dan furniture. Physics, kontrol, dan mixer animasi ikut berhenti saat panel/menu terbuka.

Model gagal dimuat memakai placeholder hooded dengan tiga tanda cyan. Aset asal memiliki keterbatasan auto-rig jubah; lipatan/penetrasi jubah masih terlihat pada beberapa pose. Perbaikan skin weights dan animasi jubah adalah tahap berikutnya.

Untuk memeriksa ulang inventaris dan salinan:

```sh
npm run inspect:assets -- /home/nanaaa/Downloads/omen
npm run prepare:character
```

## Dunia

- **Langit & laut**: shader kubah sunset (gradasi ungu–magenta–jingga, matahari, awan fbm, bintang) dan laut dengan kilau matahari; tebing laut, pagoda, hutan tropis dari pohon kit, lampu desa di lembah, dan burung terbang.
- **Halaman**: ubin basah (memantulkan langit lewat environment map), tembok batu dengan pilar lentera dan pagar kayu, pohon peneduh besar berlampion rotan, palem, pisang, bougainvillea, pot besar.
- **Rumah**: plinth batu, tangga ber-LED (bisa dinaiki), teras dan balkon, pintu berukir, jendela hangat, spanduk ungu, lampu dinding, lampu kabel.
- **Garasi**: neon oranye di atas pintu, awning genteng, teras atap berpergola. Di dalam: dinding panel merah, neon sign "WORKSHOP OMEN", lampion rotan, kipas plafon, lampu kabel, tanaman gantung, meja PC tiga monitor, papan blueprint, workbench + pegboard, portal batu, rak trofi, sofa, motor neon.
- **Performa**: arsitektur statis digabung per material (`StaticBatch`), props kit di-instance, material/geometri dipakai bersama, lampu bertingkat prioritas. Di iGPU Radeon 780M (Chrome, 1440×900, DPR 1): 60 fps di hero, intro, halaman, dan interior pada kualitas Standar.

### Benda yang bisa dipakai

| Benda | Aksi |
| --- | --- |
| Sofa | Omen duduk (klip `sit`), kamera mengikuti |
| Meja komputer | Duduk di kursi gaming; tiga monitor menyala dengan kode bergulir |
| Workbench | Printer 3D bergerak dan mencetak, hologram berganti bentuk, percikan api |
| Radio tua | Musik lo-fi generatif; volume mengikuti jarak, not musik melayang |
| Motor neon | Mesin dipanaskan: getar, lampu depan, cahaya bawah, asap knalpot |
| Portal batu | Teleport ke teras atap; portal atap membawa kembali |
| Pintu rumah | Ketuk; ketukan kedua membuat sosok mengintip dari jendela atas |

Ikon gelembung neon melayang di atas tiap benda dan memudar saat kamera terlalu dekat. Benda terdekat menampilkan tombol HTML yang bisa diklik.

### Kristal tersembunyi

Delapan kristal ungu tersebar di halaman, teras, atap, lorong belakang, kebun, dan interior. Progres tersimpan di `localStorage` (`workshop-omen:kristal`); menu menunjukkan lokasi yang sudah ditemukan dan bisa menyembunyikan semuanya lagi. Setelah kedelapannya ditemukan, kembang api menyala di atas laut dan kedua portal berubah keemasan.

### Makhluk kecil

Kucing hitam tidur di bean bag (bangun, menoleh, dan mengeong saat didekati), kunang-kunang di pohon besar (berkerumun mengitari Omen), burung di pagar depan (terbang saat didekati, kembali setelah 25 detik), figur Omen mini di rak yang menoleh ke arah Omen, dan robot penyedot debu yang berkeliling garasi.

### Suara

Semua suara disintesis WebAudio, tanpa file audio: ambient senja (drone, angin, ombak, jangkrik), langkah kaki (kayu di dalam/teras, batu di halaman), dengung portal sesuai jarak, radio lo-fi, serta efek duduk, PC, workbench, mesin motor, teleport, ketukan, kristal, kucing, dan burung. Suara menyala saat menekan **Masuk** (kecuali sebelumnya dimatikan lewat tombol), dan berhenti saat tab disembunyikan.

Sumber aset, lisensi, dan pipeline Blender → glTF ada di `docs/ASSETS.md`. Referensi visual dari pemilik tersimpan terkompresi di `docs/references/` (tidak ikut deploy).

Tidak ada halaman HTML lain selain `/` dan 404. Perangkat tanpa WebGL atau JavaScript melihat kartu sederhana yang menjelaskan kebutuhan itu.

## Struktur

```text
src/
  app/                    Rute Next.js, metadata, CSS Tailwind
  game/
    Game.tsx              Canvas, physics, kualitas, fallback
    Effects.tsx           Bloom, vignette, ACES, SMAA, AO opsional
    config.ts             Entry model, spawn, spot aksi, kristal
    runtime.ts            Input/posisi per-frame
    player/               Controller, capsule, model, animasi
    camera/               Intro GSAP dan kamera third-person
    world/                Langit, laut, lanskap, halaman, rumah, garasi,
                          interior, dekor, benda interaktif, kristal,
                          makhluk, vegetasi, lentera, portal, hotspot,
                          kit props (Kit.tsx), palet & tekstur canvas
    interaction/          Spot terdekat, aksi (duduk/toggle/teleport)
    audio/                Sintesis WebAudio + suara berbasis posisi
  ui/                     Hero, HUD, joystick, menu, ikon
  store/                  State Zustand (aksi, kristal, suara)
scripts/inspect-assets.mjs        Pemeriksaan inventaris dan checksum
scripts/fetch-world-assets.mjs    Unduh kit Kenney CC0 ke .cache/
scripts/blender/build-world-kit.py Rakit kit props di Blender
scripts/optimize-world-kit.mjs    Optimasi kit → public/models/world/kit.glb
docs/references/                  Referensi visual dunia (tidak di-deploy)
```

Stack: Next.js 16.4, React 19, TypeScript, Tailwind 4, Three.js, Fiber 9, drei, Rapier 2, @react-three/postprocessing, Zustand, dan GSAP. glTF-Transform + meshoptimizer hanya untuk pipeline aset (devDependency). Font disajikan lokal. Tidak ada model, HDR, font, audio, atau decoder yang diunduh dari CDN saat runtime. Versi renderer dipasangkan sesuai [dokumentasi Fiber](https://r3f.docs.pmnd.rs/getting-started/installation) dan [Rapier](https://pmndrs.github.io/react-three-rapier/).

## Validasi dan tahap berikut

Hasil pemeriksaan sesi ini dicatat di `docs/VALIDATION.md`.

1. Interior rumah belum bisa dimasuki; pintu hanya bisa diketuk.
2. Arsitektur rumah/garasi masih procedural; untuk detail setara referensi, model ulang fasad di Blender dan muat lewat pipeline kit, pertahankan collider sederhana.
3. Klip `defeat` belum dipakai; skin weights jubah/feet contact masih bisa diperbaiki.
4. Kamera bertabrakan dengan collider Rapier, belum dengan props tanpa collider (tanaman, lampion).
5. Lakukan QA perangkat fisik, Safari/Firefox, koneksi lambat, kemudian hosting.
