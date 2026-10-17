# Status aset

- Model: seluruh 28 file dari `/home/nanaaa/Downloads/omen` disalin utuh ke `assets-src/omen/` (gitignored, tidak di-deploy; sebelum 17 Oktober 2026 berada di `public/models/omen/` dan masih ada di riwayat git lama), total 140.567.107 byte. Run/standing-relax diperbarui dari unduhan ulang. SHA-256 seluruh salinan cocok. Laporan: `model-inventory.json`, termasuk nama/durasi/channel setiap klip.
- Runtime: `/models/omen-character.glb`, 3.530.500 byte, satu mesh/skin/tekstur embedded dan tujuh klip: `sit`, `defeat_03`, `jump`, `idle`, `walk`, `run`, `standing_relax`. Dibuat dengan `npm run prepare:character`; sumber dan checksum dicatat di `character-runtime.json`. Hanya data animasi tambahan yang digabungkan, tanpa menduplikasi mesh/tekstur atau mengubah GLB sumber.
- Aktif di web: idle asli 15,33 detik, walk 2,33 detik, run 1,25 detik, standing-relax 17,58 detik, dan hop pertama jump asli (0–0,417 dari sumber 2,21 detik). Jump hanya sekali, root translation dikunci, dan durasi playback diselaraskan ke physics. Root XZ walk/run/relax diselaraskan ke bind pose agar pergantian klip tidak menggeser model dari collider.
- Shift + gerak memakai run asli 1×. Setelah diam 5 detik, idle berganti standing-relax; gerak atau jump membatalkannya. Panel/menu menghentikan animasi dan timer. Run dipercepat dari walk hanya sebagai cadangan bila model pengganti tidak menyediakan run.
- `sit` dipakai saat Omen duduk di sofa dan kursi gaming; `defeat` tersedia sebagai aset tetapi belum dipakai. `chibi-defeat-2.glb` menyediakan `defeat_02`; bundle runtime menyediakan `defeat_03`.
- Referensi visual dunia (16 Oktober 2026): lima gambar dari pemilik disimpan terkompresi di `docs/references/` (tidak ikut deploy): eksterior sunset, pendekatan garasi, interior portal, garasi dengan hotspot, ruang isometrik. Arah yang dipakai: gabungan eksterior ref 1–2, interior ref 3–4, ikon hotspot ref 4–5.
- Environment: lihat bagian "Dunia" di bawah.
- Model/video/master asli tetap disimpan tanpa optimasi atau modifikasi baru. Ukuran penyimpanan semua aset berbeda dari download awal, karena runtime hanya menggunakan bundle animasi.
- Keterbatasan model: jubah auto-rig masih memiliki artefak pada beberapa pose. Sesuaikan skin weights/rig jubah di salinan kerja terpisah sebelum mengganti entry runtime.

## Dunia (sunset garage-lab)

### Sumber dan lisensi

| Sumber | Lisensi | Dipakai untuk |
| --- | --- | --- |
| [Kenney Nature Kit](https://kenney.nl/assets/nature-kit) | CC0 1.0 | Palem, pohon, semak, bunga, lumut, batu |
| [Kenney Furniture Kit](https://kenney.nl/assets/furniture-kit) | CC0 1.0 | Tanaman pot, speaker, radio, boneka beruang, kardus, lampu lantai |
| [Kenney Survival Kit](https://kenney.nl/assets/survival-kit) | CC0 1.0 | Tong, peti, ember, landasan |
| [Kenney Fantasy Town Kit](https://kenney.nl/assets/fantasy-town-kit) | CC0 1.0 | Diunduh untuk evaluasi; belum dipakai di runtime |
| Dibuat di Blender (repo ini) | Milik proyek | Monstera, pisang, pakis, bougainvillea, pohon peneduh besar |
| Procedural di kode | Milik proyek | Arsitektur rumah/garasi, lentera, neon, portal, kristal, motor, layar, karpet, spanduk, langit, laut, pulau, pagoda |

CC0 tidak mewajibkan atribusi; kredit tetap dicantumkan di sini. Tidak ada aset berbayar, CC-BY, atau hasil generator AI di runtime.

### Pipeline kit props

```sh
npm run fetch:world-assets   # unduh 4 kit Kenney ke .cache/world-assets (gitignored)
npm run build:kit            # Blender headless: kurasi + skala meter + recolor palet + tanaman kustom → optimasi
npm run optimize:kit         # hanya langkah optimasi, bila kit-raw.glb sudah ada
```

- `scripts/blender/build-world-kit.py`: 37 prop, setiap prop satu objek root bernama dengan origin di dasar-tengah, tinggi dalam meter, material Kenney diseragamkan ke palet `kit_*` (sunset). Bisa dijalankan headless (`flatpak run org.blender.Blender -b -P ...`) atau lewat Blender MCP.
- `scripts/optimize-world-kit.mjs`: dedup, prune, weld, reorder, kuantisasi normal/UV, kompresi `EXT_meshopt_compression`. Posisi sengaja tetap float agar shader angin memakai tinggi dalam meter. Hasil `public/models/world/kit.glb`: 282.184 byte (dari 610.780 byte).
- Runtime (`src/game/world/Kit.tsx`) memuat kit sekali, lalu setiap prop menjadi `InstancedMesh` per bagian mesh. Daun, bunga, dan batang pohon memakai salinan material dengan goyangan angin di vertex shader.
- Decoder meshopt dibundel three-stdlib; tidak ada decoder/CDN yang diunduh saat runtime.

### Tekstur dan shader

Semua tekstur (ubin basah, papan, genteng, batu, plester, karpet, spanduk, layar monitor, blueprint, poster, panel ukir, rotan, ikon hotspot) dibuat dari canvas di browser (`src/game/world/textures.ts`), tanpa file gambar. Langit, laut, dan portal adalah shader kustom.
