# Status aset

- Model: seluruh 28 file dari `/home/nanaaa/Downloads/omen` disalin utuh, total 140.110.275 byte. Ada 8 GLB tambahan. SHA-256 seluruh salinan cocok. Laporan: `model-inventory.json`, termasuk nama/durasi/channel setiap klip.
- Runtime: `/models/omen/chibi-animation-source.glb`, 3,07 MB, satu mesh/skin/tekstur embedded dan klip `sit`, `defeat_03`, `jump`, `idle`, `walk`.
- Aktif di web: idle asli 15,33 detik, walk asli 2,33 detik, dan hop pertama jump asli (0–0,417 dari sumber 2,21 detik). Jump hanya sekali, root translation dikunci, dan durasi playback diselaraskan ke physics. File GLB tidak dimodifikasi.
- `chibi-omen-run.glb` dan `chibi-omen-standing-relax.glb` tidak memiliki klip, meskipun sudah ada mesh/skin. Run memakai walk 1,7× sampai export dengan animasi tersedia.
- Sit/defeat tersedia sebagai aset, tetapi belum memiliki aksi gameplay/portfolio. `chibi-defeat-2.glb` menyediakan `defeat_02`; bundle runtime menyediakan `defeat_03`.
- Concept art/storyboard: belum tersedia melalui lampiran referensi percakapan atau file lokal yang diperiksa. Folder tujuan sudah disiapkan; tidak dibuat gambar pengganti atau mengklaim screenshot sebagai konsep asli.
- Environment: geometri procedural modular cozy garage-lab, masih placeholder.
- Model/video/master asli tetap disimpan tanpa optimasi atau modifikasi baru. Ukuran penyimpanan semua aset berbeda dari download awal, karena runtime hanya menggunakan bundle animasi.
- Keterbatasan model: jubah auto-rig masih memiliki artefak pada beberapa pose. Sesuaikan skin weights/rig jubah di salinan kerja terpisah sebelum mengganti entry runtime.
