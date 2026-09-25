# Product Requirements Document (PRD)

# TesisOri — AI Research Workspace

**Versi:** 2.0

**Status:** Implemented / living document

**Produk:** Workspace riset komentar media sosial untuk skripsi dan tesis

---

## 1. Ringkasan Produk

TesisOri membantu mahasiswa dan peneliti mengubah komentar TikTok dan YouTube menjadi dataset penelitian yang terkelola, rancangan judul, rekomendasi teori, analisis berbasis kerangka akademis, kutipan verbatim, serta data siap ekspor.

Produk tidak menggantikan keputusan metodologis peneliti atau pembimbing. Hasil AI harus memperlihatkan cakupan dataset, keterbatasan sampel, kebutuhan data tambahan, dan batas inferensi. Komentar pada satu konten tidak boleh diposisikan sebagai representasi seluruh populasi atau sebagai bukti hubungan sebab-akibat.

### 1.1 Visi

Menjadi ruang kerja riset digital yang menghubungkan pengumpulan data, perancangan penelitian, pemilihan teori, analisis, validasi, dan penyusunan bukti akademis dalam satu alur yang konsisten.

### 1.2 Proposisi Nilai

- Mengambil dan mengelola komentar TikTok dan YouTube tanpa proses teknis manual.
- Menjaga dataset, jurusan, metode, judul, teori, dan kerangka analisis sebagai satu konteks penelitian aktif.
- Menghasilkan ide penelitian yang sesuai dengan data yang benar-benar tersedia.
- Memberikan rekomendasi teori dari katalog dengan identitas bibliografi yang dapat diverifikasi.
- Menyediakan 38 kerangka analisis pada 8 bidang penelitian.
- Mendukung bukti penelitian melalui kutipan asli, uji inter-coder, sitasi, dan ekspor statistik.

### 1.3 Masalah yang Diselesaikan

1. Pengambilan komentar dan balasan media sosial membutuhkan proses teknis yang rumit.
2. Dataset komentar sering tidak langsung terhubung dengan rumusan masalah, metode, dan teori yang layak.
3. Rekomendasi AI umum berisiko mengarang teori, referensi, kutipan, atau menyarankan inferensi yang tidak didukung data.
4. Perpindahan halaman dapat membuat konteks dataset dan rancangan penelitian tidak konsisten.
5. Data mentah perlu dibersihkan dan distrukturkan sebelum dipakai dalam analisis isi atau perangkat statistik.
6. Mahasiswa memerlukan dukungan untuk reliabilitas pengodean, kutipan verbatim, dan sitasi akademis.

---

## 2. Sasaran dan Batas Produk

### 2.1 Sasaran

- Memungkinkan pengguna memulai dari dataset, judul, atau teori.
- Menghasilkan 5–10 alternatif judul yang spesifik dan layak dikaji dengan dataset aktif.
- Menghasilkan 3–5 rekomendasi teori yang relevan dan dapat dilacak ke sumber akademis.
- Menyimpan pilihan eksplisit pengguna sebagai konteks penelitian per dataset.
- Menghubungkan konteks penelitian ke modul analisis komentar.
- Menjaga pengalaman responsif dan mudah dipindai pada desktop, tablet, dan ponsel.

### 2.2 Di Luar Cakupan Saat Ini

- AI tidak menetapkan validitas akhir judul, teori, atau desain penelitian.
- Produk tidak mengklaim komentar sebagai sampel probabilitas populasi.
- Produk tidak otomatis membuktikan pengaruh, korelasi, kausalitas, atau perilaku nyata.
- Teori yang belum memiliki kerangka analisis tidak dianggap otomatis mempunyai implementasi analisis lengkap.
- Scraping Instagram dinonaktifkan sampai integrasi stabil tersedia.
- Hasil AI terakhir disimpan per dataset dan jenis hasil; arsip seluruh versi generasi belum tersedia.

---

## 3. Target Pengguna

| Persona | Kebutuhan utama | Modul utama |
|---|---|---|
| Mahasiswa S1 | Menentukan judul, teori, metode, dan bukti komentar untuk skripsi | Generator Judul, Rekomendasi Teori, Analisis, Kutipan Verbatim |
| Mahasiswa S2 | Analisis teori lebih dalam dan transparansi metodologis | Kerangka Analisis, Inter-Coder Reliability, Ekspor Laporan |
| Peneliti kualitatif | Pengodean tema, framing, resepsi, wacana, dan contoh komentar asli | Analisis AI, Dataset Explorer, Kutipan Verbatim |
| Peneliti kuantitatif | Analisis isi deskriptif dan keluaran terstruktur | Ekspor Statistik, Kappa, CSV/Excel |
| Praktisi komunikasi dan brand | Memahami pola respons, sentimen, reputasi, dan e-WOM | Analisis Sentimen, Krisis, Konsumen, Dashboard |

---

## 4. Alur Pengguna Utama

```text
Autentikasi
    ↓
Pilih / scrape / unggah dataset
    ↓
Tentukan jurusan, metode, fokus, dan kerangka awal
    ↓
Generate ide judul ─────────────┐
    ↓                           │
Pilih judul secara eksplisit    │
    ↓                           │
Cari rekomendasi teori ←────────┘
    ↓
Pilih teori secara eksplisit
    ↓
Simpan konteks penelitian per dataset
    ↓
Analisis komentar, validasi, kutip, dan ekspor
```

Pengguna juga dapat memulai langsung dari Rekomendasi Teori tanpa menghasilkan judul terlebih dahulu.

---

## 5. Kebutuhan Fungsional

### 5.1 Autentikasi dan Penyimpanan Privat

- Login Google serta email/password melalui Firebase Authentication.
- Dataset, cache analisis, dan konteks penelitian tersimpan pada dokumen Firestore milik pengguna.
- Data dipisahkan berdasarkan `uid`; state dataset dan riset dibersihkan saat akun berubah atau logout.
- Dataset lokal backend dapat disinkronkan ke akun melalui tindakan eksplisit.

### 5.2 Akuisisi dan Pengelolaan Dataset

- Menerima URL atau ID video TikTok.
- Menerima URL atau ID video YouTube, termasuk `watch`, `youtu.be`, dan Shorts.
- Mengambil komentar utama, balasan, metadata kreator, waktu, dan statistik yang tersedia.
- Mendukung unggah dataset JSON.
- Menyediakan Koleksi Dataset dengan pencarian, filter platform, urutan, dan penghapusan.
- Dataset Switcher yang sama tersedia di halaman analisis dan perancangan penelitian.
- Dataset aktif tidak berubah tanpa tindakan pengguna.

### 5.3 Penjelajah Komentar

- Pencarian real-time pada komentar dan/atau balasan.
- Opsi case-sensitive, hanya thread yang memiliki balasan, pengurutan, dan pagination.
- Highlight kata kunci dan ringkasan kata/hashtag populer.
- Salin komentar, buka Kutipan Verbatim, dan ekspor CSV/JSON.

### 5.4 Generator Ide Judul Skripsi

**Input:** dataset aktif, jurusan, metode, kerangka teori/analisis, dan fokus opsional.

**Proses:**

- Menggunakan layanan AI yang sama dengan modul analisis.
- Mengambil sampel sistematis maksimum 100 komentar/balasan yang tersebar dari awal hingga akhir dataset.
- Melaporkan jumlah data total, jumlah sampel, dan teks yang dipotong.
- Menghasilkan 5–10 judul; Generate Ulang membawa input yang sama dan menghindari judul sebelumnya.
- Jika metode belum dipilih, hasil mencakup lebih dari satu pendekatan yang sesuai.
- Judul dengan klaim pengaruh, kausalitas, korelasi, atau uji hipotesis yang tidak didukung korpus komentar harus ditolak.

**Kartu hasil:** judul, jurusan, metode, teori, fokus, alasan kesesuaian, data tersedia, data tambahan, rumusan masalah, tujuan, dan pendekatan analisis. Tindakan: Salin Judul, Lihat Detail, Gunakan Judul, serta Cari Teori yang Relevan.

### 5.5 Rekomendasi Teori Penelitian

**Input:** dataset aktif, jurusan, metode, fokus, judul, dan kerangka aktif. Semua input dapat ditinjau sebelum rekomendasi dijalankan.

**Proses dan validasi:**

- Menghasilkan 3–5 teori dari katalog server dengan identitas bibliografi yang sudah diperiksa.
- Memprioritaskan teori yang terhubung dengan kerangka analisis bila relevan.
- Nama teori, tokoh, dimensi, referensi, URL, dan pemetaan kerangka berasal dari katalog server, bukan dibuat model.
- Kutipan komentar dibentuk dari teks asli berdasarkan ID; model tidak memasok teks kutipan.
- Respons dengan teori tidak dikenal, ID kutipan salah, jumlah kartu salah, atau struktur tidak lengkap ditolak.
- UI menjelaskan bahwa identitas referensi telah diperiksa, sedangkan relevansi dan indikator operasional AI tetap perlu tinjauan akademis.

**Kartu hasil:** nama teori dan pengembang, penjelasan, relevansi, dimensi asli, indikator operasional usulan, contoh penerapan, kutipan asli bila tersedia, referensi, dan batas penerapan. Tindakan: Lihat Detail Teori, Gunakan Teori, serta Gunakan untuk Generator Judul.

### 5.6 Konteks Penelitian Aktif

- Konteks mencakup dataset, jurusan, metode, fokus, judul terpilih, teori terpilih, dan kerangka analisis.
- Draft form tidak otomatis menjadi pilihan aktif.
- Hanya Gunakan Judul, Gunakan Teori, atau Simpan Konteks yang menetapkan pilihan.
- Konteks disimpan per dataset pada `researchContext` di Firestore.
- Penyimpanan beruntun menjaga pilihan terbaru saat pengguna mengklik cepat.
- Pergantian dataset/fitur membatalkan request UI dan mencegah respons lama tampil pada dataset baru.
- Teori tanpa implementasi analisis dapat menjadi konteks, tetapi tidak mengganti kerangka secara diam-diam.

### 5.7 Analisis AI Multi-Framework

- Menyediakan 38 kerangka pada 8 bidang: Ilmu Komunikasi, Psikologi, Sosiologi, Manajemen & Bisnis, Pendidikan, Hukum, Kesehatan Masyarakat, serta Sistem Informasi & Informatika.
- Mendukung pencarian kerangka dan eksplorasi lintas jurusan.
- Ukuran sampel AI dapat dipilih pengguna; hasil di-cache per dataset dan kerangka.
- Judul, teori, metode, dan fokus aktif diteruskan sebagai konteks tambahan.
- Struktur hasil tetap mengikuti kerangka yang benar-benar diimplementasikan.
- Tersedia loading, recovery hasil tersimpan, error state, dan ekspor laporan.

### 5.8 Reliabilitas, Sitasi, dan Ekspor

- Inter-coder mendukung sampel manusia versus AI serta matriks kontingensi 3×3.
- Menghitung observed agreement, expected agreement, Cohen's Kappa, interpretasi, dan draf narasi metodologi.
- Sitasi video mendukung APA, Harvard, Chicago Author-Date, BibTeX, dan RIS bila metadata tersedia.
- Kutipan pendek, blok, dan tabel selalu berasal dari komentar asli.
- Ekspor: CSV, JSON, Excel, SPSS syntax/datamap, SmartPLS, dan JASP.

### 5.9 Kartu Hasil AI Tersimpan

- Analisis Riset, Generator Judul, dan Rekomendasi Teori menampilkan kartu hasil yang sudah tersimpan pada akun.
- Kartu memuat nama dataset, kerangka/jenis hasil, ringkasan, jumlah komentar/ide/teori, waktu simpan, dan penanda dataset aktif.
- Pengguna dapat mencari hasil, memfilter dataset aktif, atau menjelajahi seluruh dataset.
- Buka Hasil memilih dataset terkait dan memuat hasil terakhir tanpa memanggil AI atau mengubah judul/teori terpilih.
- Hasil analisis lama dari cache Firestore langsung dikenali. Hasil judul/teori yang dihasilkan mulai versi ini tersimpan otomatis dan dapat dipulihkan setelah refresh/login ulang.
- Jika penyimpanan gagal, hasil tetap terlihat dan tersedia tombol Simpan Ulang tanpa mengulang generasi.
- Riwayat menampilkan hasil terakhir per dataset dan jenis/kerangka, bukan seluruh versi hasil generasi.

---

## 6. Arsitektur dan Teknologi

```text
React 19 + Vite 8
  ├─ Workspace UI dan routing History API
  ├─ Firebase Authentication
  └─ Firestore: dataset, cache analisis, researchContext
                 │ REST /api
                 ▼
Python Standard HTTP Server
  ├─ TikTok / YouTube collectors
  ├─ AI analysis service
  ├─ Research planner + response validation
  └─ Local JSON cache / static frontend dist
                 │
                 ▼
Existing Clario LLM gateway and configured fallback
```

| Lapisan | Teknologi |
|---|---|
| Frontend | React 19, Vite 8, Lucide React, Vanilla CSS |
| Backend | Python, `http.server`, Requests, Loguru |
| Identitas dan cloud data | Firebase Authentication, Cloud Firestore |
| AI | Integrasi Clario pada `ai_analyzer.py` |
| Test | Python `unittest`, Node test runner, jsdom |
| Output | JSON, CSV, Excel, SPSS, SmartPLS, JASP, BibTeX/RIS |

---

## 7. Design System UI

### 7.1 Arah Visual

TesisOri menggunakan gaya **warm academic workspace**: latar off-white, permukaan putih, garis tipis, tipografi sans-serif yang tenang, dan aksen oranye hangat. Antarmuka harus terasa seperti alat kerja riset yang serius, ringan, dan mudah dipindai.

Prinsip desain:

- **Calm and focused:** ruang putih cukup, shadow halus, tanpa neon atau animasi berlebihan.
- **Evidence first:** konteks dataset, cakupan sampel, keterbatasan, dan sumber dekat dengan hasil.
- **Progressive disclosure:** ringkasan di kartu; detail menggunakan disclosure.
- **Explicit actions:** pilihan aktif hanya berubah melalui tombol yang jelas.
- **Consistent workspace:** sidebar, header, Dataset Switcher, form, kartu, dan feedback memakai pola sama.
- **Responsive by default:** dua kolom menjadi satu dan sidebar menjadi bottom navigation pada layar kecil.

### 7.2 Color Palette

#### Warna inti

| Token | Hex | Pemakaian |
|---|---:|---|
| Background | `#FAFAF9` | Latar utama warm off-white |
| Surface | `#FFFFFF` | Kartu, form, header, sidebar, modal |
| Border | `#E5E7EB` | Hairline dan border kartu |
| Border strong | `#D1D5DB` | Input dan kontrol |
| Text primary | `#0F172A` | Judul dan teks utama |
| Text secondary | `#64748B` | Label, deskripsi, metadata |
| Text muted | `#94A3B8` | Placeholder dan informasi tersier |
| Primary orange | `#F97316` | CTA, focus, indikator brand |
| Primary dark | `#EA580C` | Hover dan state aktif |
| Primary light | `#FB923C` | Gradient dan aksen ringan |
| Primary background | `#FFF7ED` | Active nav, hover, panel aksen |
| Primary border | `#FED7AA` | Border state aktif dan selection |

#### Status dan visualisasi

| Peran | Foreground | Background |
|---|---:|---:|
| Success | `#16A34A` | `#DCFCE7` |
| Error | `#DC2626` | `#FEF2F2` |
| Warning | `#D97706` | `#FEF3C7` |
| Information | `#2563EB` | `#EFF6FF` |
| Violet | `#7C3AED` | `#EDE9FE` |
| Search highlight | `#9A3412` | `#FED7AA` |

#### Accent bidang penelitian

| Bidang | Warna |
|---|---:|
| Ilmu Komunikasi | `#0284C7` |
| Psikologi | `#DB2777` |
| Sosiologi | `#65A30D` |
| Manajemen & Bisnis | `#059669` |
| Pendidikan | `#4F46E5` |
| Hukum | `#B91C1C` |
| Kesehatan Masyarakat | `#BE123C` |
| Sistem Informasi & Informatika | `#4338CA` |

Warna bidang hanya membantu identifikasi. CTA global tetap memakai warna primer oranye.

#### Gradient dan shadow

```css
--gradient-cta: linear-gradient(135deg, #FB923C 0%, #EA580C 100%);
--gradient-primary: linear-gradient(135deg, #F97316 0%, #C2410C 100%);
--shadow-card: 0 1px 2px rgba(15, 23, 42, 0.04),
               0 1px 3px rgba(15, 23, 42, 0.06);
--shadow-cta: 0 3px 10px rgba(234, 88, 12, 0.28);
```

### 7.3 Tipografi

- Font utama: `Plus Jakarta Sans`, fallback `Inter`, `-apple-system`, dan `sans-serif`.
- Judul halaman: 32–48px desktop, responsif dengan `clamp()`, weight 500–600.
- Judul kartu: 18–20px, weight 600.
- Body: 14–16px, line-height 1.5–1.65.
- Label/form: 13–14px, weight 500–600.
- Metadata: 11–12px, warna secondary/muted.
- Section kicker: 11px, weight 600, letter spacing sekitar `0.14em`; uppercase hanya untuk eyebrow singkat.
- Angka statistik memakai tabular numerals bila relevan.

### 7.4 Bentuk, Jarak, dan Grid

| Elemen | Spesifikasi |
|---|---|
| Radius kecil | `6px` untuk kontrol kecil dan navigasi |
| Radius sedang | `10px` untuk input dan tombol |
| Radius besar | `14px`; kartu fitur riset boleh `16px` |
| Pill | `999px` untuk badge, tag, dan filter |
| Page padding | 38–40px desktop; 16–20px mobile |
| Jarak antarseksi | 20–35px sesuai hierarki |
| Grid form/hasil | 2 kolom desktop, 1 kolom pada ≤720px |
| Sidebar | 256px desktop |
| Konten maksimum | sekitar 1200–1420px sesuai halaman |

Kartu utama memakai permukaan putih, border 1px, dan shadow ringan. Hindari border tebal, gradient, dan shadow berat pada elemen yang sama.

### 7.5 Komponen dan Interaction Style

**Navigasi:** sidebar desktop memuat brand dan kelompok Workspace. Item aktif memakai orange tint. Header sekitar 76px menampilkan breadcrumb, unggah dataset, dan profil. Pada ≤860px, sidebar digantikan bottom navigation; Generator Judul dan Rekomendasi Teori masuk melalui tab Rancangan.

**Tombol:** primary berwarna orange/gradient dengan teks putih; secondary putih/transparan dengan border netral; destructive merah hanya untuk risiko. Disabled memakai opacity lebih rendah. Target sentuh mobile minimum 40×40px.

**Form:** label selalu terlihat di atas input. Input putih, border strong, radius 8–10px, padding 12px. Focus memakai outline primer. Fieldset dinonaktifkan selama proses untuk mencegah request ganda.

**Kartu hasil:** konteks utama tampil sebelum narasi; data tersedia, kebutuhan tambahan, batas penerapan, dan verifikasi tampil eksplisit. Detail memakai `<details>`. Tindakan dapat wrap. Kutipan asli memakai blockquote dengan ID komentar.

**Feedback:** loading menjelaskan proses; empty state memberi langkah berikutnya; error memakai panel merah muda dan pesan yang dapat ditindaklanjuti; coverage/limitations tampil permanen di atas hasil.

### 7.6 Aksesibilitas

- Kontras teks normal minimal 4.5:1.
- Semua kontrol dapat dioperasikan dengan keyboard.
- `:focus-visible` menggunakan outline minimal 2px.
- Status asinkron memakai `role="status"`; error memakai `role="alert"`.
- Tab aktif memakai `aria-current="page"`.
- Modal memiliki focus trap, Escape untuk menutup, dan mengembalikan fokus.
- Animasi menghormati `prefers-reduced-motion`.
- Warna bukan satu-satunya pembeda status.

---

## 8. Kebutuhan Non-Fungsional

### 8.1 Integritas dan Keamanan

- Dataset tidak boleh tercampur antar akun atau dataset aktif.
- Nama file disanitasi pada backend; request research planning dibatasi 20 MB.
- Komentar diperlakukan sebagai data tidak tepercaya, bukan instruksi model.
- Respons AI divalidasi sebelum ditampilkan; error tidak membocorkan detail internal sensitif.

### 8.2 Reliabilitas

- Gangguan jaringan tidak otomatis menjalankan analisis dua kali.
- Sistem mencoba mengambil hasil tersimpan dengan `request_id` setelah kegagalan gateway tertentu.
- Respons lama tidak boleh dianggap sebagai keberhasilan request baru.
- Dataset kosong, format salah, timeout, JSON AI salah, dan penyimpanan gagal memiliki state yang jelas.

### 8.3 Performa dan Responsif

- Dataset besar ditangani dengan pagination dan pembatasan konteks AI.
- Build produksi menggunakan Vite dan menghasilkan aset pada `web/dist`.
- Ukuran bundle dipantau; code splitting menjadi optimasi lanjutan.
- Desktop memakai sidebar dan grid; tablet memakai grid adaptif; mobile memakai bottom navigation, satu kolom, dan tanpa overflow horizontal.

---

## 9. Acceptance Criteria Utama

1. Dataset aktif konsisten pada Generator Judul, Rekomendasi Teori, dan Analisis.
2. Generator menampilkan 5–10 judul lengkap dengan metode, teori, alasan, data, rumusan masalah, tujuan, dan pendekatan.
3. Rekomendasi menampilkan 3–5 teori katalog dengan sumber, dimensi, indikator operasional, penerapan, dan batas.
4. Kutipan kartu teori identik dengan teks komentar asli.
5. Judul dan teori aktif berubah hanya setelah tindakan eksplisit.
6. Konteks terpilih bertahan saat berpindah fitur dan setelah dataset dimuat kembali.
7. Teori tanpa implementasi tidak mengganti kerangka otomatis.
8. Pergantian dataset saat AI berjalan tidak menampilkan hasil lama pada dataset baru.
9. Loading, empty, error, dan success state berbeda secara visual dan aksesibel.
10. Layout tidak overflow pada desktop, tablet, atau mobile.
11. Build frontend, test backend, test state, dan interaction test lintas fitur berhasil.

---

## 10. Roadmap

### Selesai

- [x] Scraping TikTok dan YouTube beserta balasan.
- [x] Firebase Authentication dan penyimpanan privat.
- [x] Dataset Switcher, Koleksi Dataset, pencarian, pagination, dan ekspor.
- [x] 38 kerangka analisis pada 8 bidang.
- [x] Generator Ide Judul dan Rekomendasi Teori.
- [x] Konteks penelitian aktif per dataset.
- [x] Cohen's Kappa, sitasi, kutipan verbatim, dan ekspor statistik.
- [x] UI responsif dengan sidebar dan bottom navigation.

### Berikutnya

- [ ] Menambah katalog teori dan metadata sumber primer.
- [x] Kartu hasil AI tersimpan lintas sesi, pencarian, filter, dan buka hasil tanpa generasi ulang.
- [ ] Arsip seluruh versi generasi untuk setiap dataset dan jenis hasil.
- [ ] Dukungan Instagram setelah integrasi stabil.
- [ ] Krippendorff's Alpha dan Fleiss' Kappa untuk lebih dari dua coder.
- [ ] Ekspor laporan terformat ke DOCX/PDF.
- [ ] Code splitting untuk memperkecil initial JavaScript bundle.
- [ ] Audit aksesibilitas otomatis dan test browser end-to-end.

---

## 11. Referensi Implementasi

- Design tokens global: `web/src/index.css`
- Layout workspace: `web/src/workspace.css`
- UI rancangan penelitian: `web/src/pages/ResearchPage.jsx` dan `web/src/pages/research.css`
- Katalog kerangka: `web/src/constants/frameworks.js`
- Research planner dan katalog teori: `research_planner.py`
- Detail fitur penelitian: `RESEARCH_FEATURES.md`

Dokumen ini adalah spesifikasi produk yang hidup. Ketika implementasi dan PRD berbeda, perubahan harus diselaraskan dan diuji sebelum rilis.
