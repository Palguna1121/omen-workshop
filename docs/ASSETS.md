# Status aset

- Model: seluruh 20 file dari `/home/nanaaa/Downloads/omen` disalin utuh, total 120.372.987 byte. SHA-256 seluruh salinan cocok. Laporan: `model-inventory.json`.
- Runtime: `/models/omen/chibi-hooded-walk-preview.glb`, 2,34 MB, satu mesh/skin/tekstur embedded dan klip asli `walk`.
- Idle: loop skeletal lokal `WorkshopIdle` (4,8 detik), dengan dada/kepala/lengan bergerak halus dan kaki menapak. Jump: pose udara lokal `WorkshopJump`, dengan gerakan vertikal Rapier. Run: walk dipercepat. Folder sumber hanya menyediakan klip `walk`; klip pelengkap tidak ditulis ke file GLB.
- Concept art/storyboard: belum tersedia melalui lampiran referensi percakapan atau file lokal yang diperiksa. Folder tujuan sudah disiapkan; tidak dibuat gambar pengganti atau mengklaim screenshot sebagai konsep asli.
- Environment: geometri procedural modular cozy garage-lab, masih placeholder.
- Model/video/master asli tetap disimpan tanpa optimasi atau modifikasi baru. Ukuran penyimpanan semua aset berbeda dari download awal, karena runtime hanya menggunakan walk preview.
- Keterbatasan model: jubah auto-rig masih memiliki artefak pada beberapa pose. Sesuaikan skin weights/rig jubah di salinan kerja terpisah sebelum mengganti entry runtime.
