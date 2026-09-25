# Rancangan penelitian

Menu **Generator ide judul** (`/ide-judul`) dan **Rekomendasi teori** (`/rekomendasi-teori`) menggunakan Dataset Switcher dan state `App` yang sama dengan analisis. Navigasi mobile menyediakan pintasan **Rancangan**.

Generator menghasilkan 5–10 ide; rekomendasi menghasilkan 3–5 teori. Kartu mencakup penjelasan, kebutuhan data, detail, dan tindakan untuk membawa konteks ke fitur lain. Mengubah formulir atau mencari teori dari sebuah kartu tidak otomatis menetapkan judul. **Gunakan Judul**, **Gunakan Teori**, dan **Simpan konteks** menyimpan konteks pada `users/{uid}/scrapes/{dataset}.researchContext` melalui Firebase yang sudah digunakan aplikasi. **Simpan konteks** juga menetapkan judul yang dimasukkan secara manual. Hasil generasi disimpan dalam state per dataset selama sesi; pilihan penelitian dipulihkan dari Firestore.

## Alur teknis

- `POST /api/ai/research` menerima `kind`, `filename`, `dataset`, `context`, dan opsional `previous_titles`. Dataset dikirim dari data aktif yang sudah dimuat dari Firestore; tidak membutuhkan salinan file lokal di server. Batas permintaan 20 MB.
- `research_planner.py` menggunakan `ai_analyzer.call_llm`, termasuk model dan fallback aplikasi yang sudah ada. Tidak ada provider atau kredensial tambahan.
- Sampel sistematis maksimum 100 komentar/balasan tersebar dari awal sampai akhir urutan dataset. Teks prompt maksimum 1.000 karakter per entri, caption 6.000 karakter. UI melaporkan jumlah total, sampel, dan entri yang dipotong. Sampel ini eksploratif, tidak menjamin keterwakilan populasi maupun setiap tema minoritas.
- Respons AI divalidasi: tipe dan panjang isian, jumlah kartu, duplikasi, konsistensi metode, ID teori, dan ID komentar. Judul dengan istilah inferensi seperti pengaruh/kausalitas/korelasi ditolak untuk korpus komentar ini. Prompt meminta analisis isi deskriptif untuk pendekatan kuantitatif dan menjelaskan kebutuhan data tambahan. Validasi struktur tidak menggantikan peninjauan metodologis manusia.
- Kutipan dirakit dari teks asli berdasarkan ID; nama teori, tokoh, referensi, URL, dimensi, dan pemetaan kerangka berasal dari katalog server, bukan respons model. Katalog memiliki 11 teori dengan tautan penerbit/penulis atau naskah akademis. Identitas bibliografi diperiksa 25 September 2026; penjelasan, relevansi, dan indikator operasional AI tidak diklaim sebagai hasil verifikasi akademis.
- Rekomendasi di luar katalog ditolak, bukan ditampilkan dengan referensi yang tidak terbukti. Katalog dapat diperluas setelah memeriksa sumber primer. Agenda Setting tersedia sebagai konteks teori tanpa implementasi analisis khusus; memilihnya tidak mengubah kerangka analisis secara diam-diam.
- Konteks judul, metode, fokus, dan teori diteruskan ke endpoint analisis yang sudah ada. Struktur hasil tetap mengikuti kerangka analisis yang diimplementasikan. Kerangka dapat mencakup lebih dari satu teori.
- Pergantian dataset/fitur membatalkan permintaan UI dan mengabaikan respons terlambat. Pengiriman ke provider yang sudah berlangsung mungkin tetap selesai di server. Penyimpanan konteks per dataset diurutkan agar klik cepat tidak menyimpan pilihan lama setelah pilihan baru.

## Pengujian

```powershell
python -m unittest discover -s tests -v
npm --prefix web test
npm --prefix web run build
```

Gunakan Python dengan dependensi `requirements.txt` terpasang. Pada mesin pengembangan ini launcher `venv` merujuk lokasi Python lama; pengujian dijalankan dengan Python sistem dan `PYTHONPATH` menunjuk `venv/Lib/site-packages`.

Pengujian mencakup endpoint HTTP, dataset kosong/tidak valid/cloud-only, sampel besar, JSON salah, teori/kutipan fiktif, pemilihan metode, pemulihan state, alur judul → teori → judul, penggunaan teori secara mandiri, pembatalan saat berganti dataset, dan kegagalan AI/penyimpanan. Interaksi React dijalankan melalui jsdom; uji tersebut tidak menulis akun Firestore sungguhan.

Uji langsung provider pada dataset sintetis berhasil menghasilkan 5 judul dan 3 rekomendasi tervalidasi. Endpoint Clario utama mengembalikan HTTP 410 saat pengujian; fallback bawaan berhasil. Build memiliki peringatan ukuran bundle yang sudah besar. Pemeriksaan lint sumber tidak memiliki error; beberapa warning lama masih ada. Skrip lint global juga memindai bundle `dist`, sehingga lint sumber lebih tepat untuk pemeriksaan kode.
