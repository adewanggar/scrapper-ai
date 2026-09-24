# Product Requirement Document (PRD) & Deskripsi Produk
# Scrapper AI: TikTok Academic Text Mining & AI Research Assistant
### *Edisi Khusus Riset Skripsi & Tesis S2 (Ilmu Komunikasi, Manajemen, & Sains Sosial)*

---

## 📌 1. Executive Summary & Deskripsi Produk

### 1.1 Visi Produk
**Scrapper AI** adalah platform riset terpadu (*all-in-one research workbench*) yang menggabungkan kemampuan **ekstraksi data komentar media sosial TikTok** berkecepatan tinggi dengan modul **analisis kecerdasan buatan (AI LLM - DeepSeek V4 & Gemini 3.7 Flash)** serta utilitas **metodologi penelitian ilmiah** (uji reliabilitas inter-coder, ekspor perangkat lunak statistik SPSS/SmartPLS/JASP, sitasi APA 7th, dan kutipan verbatim).

### 1.2 Tagline
> *"Dari Jutaan Komentar TikTok Menjadi Naskah Bab 3 & Bab 4 Skripsi/Tesis yang Lolos Uji Sidang."*

### 1.3 Latar Belakang & Masalah (Problem Statement)
Penelitian media sosial kontemporer (terutama di bidang Ilmu Komunikasi, Pemasaran Media Sosial, dan Psikologi Siber) menghadapi hambatan teknis yang tinggi:
1. **Hambatan Ekstraksi Data**: Mengambil ribuan komentar TikTok beserta balasan bersarang (*nested replies*) memerlukan pemahaman teknis scraping yang rumit dan sering terblokir oleh rate-limit.
2. **Kesenjangan antara Data Mentah vs Teori Akademik**: Mahasiswa sering kali memiliki data komentar, tetapi bingung membedah temuan tersebut menggunakan pisau bedah teori komunikasi/pemasaran yang valid.
3. **Ketidaksiapan Data untuk Software Statistik**: Data teks mentah tidak dapat langsung diimpor ke SPSS atau SmartPLS tanpa proses pengkodean numerik (*numerical transformation*) dan pembersihan manual yang memakan waktu berhari-hari.
4. **Validitas Metodologis Bab 3**: Analisis isi kualitatif/kuantitatif mewajibkan uji reliabilitas antar-pengkode (*Inter-Coder Reliability* seperti Cohen's Kappa $\kappa$), namun mahasiswa kesulitan menghitung matriks kontingensi secara manual.
5. **Standar Sitasi & Kutipan Akademik**: Kesalahan format daftar pustaka (APA 7th) dan kesalahan penulisan kutipan langsung/verbatim di Bab 4 Pembahasan sering menjadi sasaran kritik dosen penguji.

### 1.4 Solusi Scrapper AI
Scrapper AI menjembatani kesenjangan teknis tersebut melalui antarmuka web modern yang ramah pengguna, memungkinkan peneliti mengunduh ribuan komentar, mengujinya dengan kerangka teori ilmiah terkemuka (seperti **Framing Robert Entman 1993**, **SCCT Coombs**, atau **Affective Marketing**), menguji koefisien reliabilitas Cohen's Kappa secara instan, dan mengekspor data siap olah ke software statistik favorit.

---

## 👥 2. Target Pengguna & Persona

| Persona | Jenjang / Profesi | Fokus Kebutuhan | Fitur Kunci yang Digunakan |
| :--- | :--- | :--- | :--- |
| **Mahasiswa S1 (Skripsi)** | S1 Ilmu Komunikasi, Manajemen, Sosiologi | Ekstraksi cepat komentar kampanye brand/isu viral, analisis sentimen, kutipan verbatim untuk narasi Bab 4. | TikTok Scraper, Analisis Sentimen, Kutipan Verbatim 1-Klik, Ekspor Excel/CSV. |
| **Mahasiswa S2 (Tesis)** | Magister Ilmu Komunikasi / Media Studies | Ketajaman analisis wacana/framing, metodologi analisis isi baku, uji inter-coder reliability yang lolos uji etik sidang. | Framing Robert Entman, Kalkulator Cohen's Kappa $\kappa$, Generator Narasi Bab 3. |
| **Peneliti Kuantitatif** | Peneliti SEM / Statistik | Data terstruktur dengan skor metrik terstandarisasi untuk diolah ke pemodelan jalur. | Ekspor SPSS Syntax/Datamap, SmartPLS PLS-SEM CSV, JASP Academic Data. |
| **Brand Analyst / Praktisi** | Social Media & PR Strategist | Deteksi sentimen krisis reputasi dan evaluasi efektivitas iklan berbasis drama. | Analisis Krisis (SCCT), Pemasaran Kontroversi & Drama Baiting, Word Cloud. |

---

## 🏗️ 3. Arsitektur Sistem & Spesifikasi Teknologi

```
┌────────────────────────────────────────────────────────────────────────┐
│                       FRONTEND LAYER (Vite + React 19)                 │
│  - Komponen Modular (Modal Sitasi, Modal Ekspor Statistik, Modal Kappa) │
│  - Responsif Mobile (2x2 Grid Actions, Card List Mobile, Bottom Nav)   │
│  - Visualisasi Interaktif (Gauge Kappa, Word Cloud, Entman 4 Kuadran)  │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ HTTP REST API (Port 5000)
┌───────────────────────────────────▼────────────────────────────────────┐
│                       BACKEND LAYER (Python 3.11+)                     │
│  - server.py: Web Server Flask/Werkzeug (Serve API + Frontend Dist)     │
│  - ai_analyzer.py: Clario LLM Engine (DeepSeek V4 & Gemini 3.7 Flash)   │
│  - tiktokcomment/crawler.py: Signature-based Aweme HTTP Scraper        │
│  - data/: File Storage Manager (JSON persistence & auto-caching)       │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
┌───────────────────────────────────▼────────────────────────────────────┐
│                    EXTERNAL SERVICES & EXPORT ENGINE                   │
│  - Clario AI API (Dual-Engine LLM Analysis)                            │
│  - SPSS Data Mapper & Syntax Generator (.sps)                           │
│  - SmartPLS Matrix Generator (PLS-SEM Ready .csv)                      │
│  - Mendeley / BibTeX / APA 7th Formatter                               │
└────────────────────────────────────────────────────────────────────────┘
```

### 3.1 Tech Stack
- **Frontend**: React 19, Vite 8, Lucide React Icons, Vanilla CSS Design System (Light Theme Glassmorphic).
- **Backend**: Python >= 3.11, Requests, Urllib3, Flask/Standard HTTP.
- **AI Core**: DeepSeek V4 & Gemini 3.7 Flash (via Clario AI Gateway).
- **Format Keluaran Data**: JSON, CSV, XLSX (SheetJS), SPSS Data Map, BibTeX/RIS.

---

## ⚙️ 4. Rincian Fitur & Kebutuhan Fungsional (Functional Requirements)

### Modul 1: Mesin Ekstraksi Komentar (TikTok Scraper Engine)
- **Input Fleksibel**: Menerima input berupa URL video TikTok lengkap (web/mobile) atau 19-digit Aweme ID numerik video.
- **Multi-Level Cursor Pagination**: Menarik komentar hingga ribuan baris secara stabil menggunakan perulangan kursor API TikTok internal.
- **Nested Replies Extraction**: Otomatis mengekstrak seluruh komentar balasan (*thread conversation*) hingga kedalaman penuh.
- **Metadata Lengkap**: Mengambil Avatar URL, Nickname, Unique Username (@handle), Komentar Teks, Waktu Unggah (Timestamp Unix), dan Jumlah Like/Balasan.
- **Local Cache & Offline Mode**: Komentar yang sudah di-scrape disimpan otomatis ke folder `data/*.json`, memungkinkan analisis offline tanpa scraping ulang.

### Modul 2: Penjelajah Komentar & Filter Linguistik (Comment Explorer)
- **Real-Time Highlight Search**: Pencarian kata kunci dengan penanda warna (*highlighter*) instan tanpa memuat ulang halaman.
- **Filter Sentimen 3-Arah**: Filter cepat untuk melihat hanya komentar Positif, Netral, atau Negatif.
- **Filter Komentar Berbalas**: Toggle untuk memilah komentar yang memicu diskusi panjang vs komentar satu arah.
- **Top 10 Hashtag & Keyword Cloud**: Algoritma tokenisasi frekuensi kata untuk membedah isu yang paling banyak diperbincangkan netizen.

### Modul 3: AI Skripsi & Tesis Multi-Framework (5 Pisau Bedah Teori)
Platform dilengkapi modul analisis cerdas berbasis Large Language Model dengan 5 kerangka teori akademik:
1. **Analisis Framing Robert M. Entman (1993)** *(Khusus Tesis S2 Komunikasi)*:
   - *Define Problems*: Mengidentifikasi konstruksi masalah dan nilai yang terancam.
   - *Diagnose Causes*: Menentukan aktor penyebab masalah (*causal agent*) dan atribusi kesalahan.
   - *Make Moral Judgments*: Menilai justifikasi etika, norma budaya, atau penilaian moral audiens.
   - *Suggest Remedies*: Menangkap tuntutan solusi, pembenaran, atau tindakan korektif yang diharapkan.
   - Visualisasi: Kartu 4 Kuadran Entman interaktif dengan persentase dominansi isu dan kutipan empiris.
2. **Pemasaran Emosi & Kontroversi (Affective Response & Drama Baiting)**:
   - Menghitung rasio audiens terkecoh (*gullibility index*) vs audiens kritis yang menyadari trik marketing (*ad-awareness*).
3. **Analisis Sentimen Akademik & Slang TikTok**:
   - Mendeteksi sarkasme, bahasa gaul kekinian (*slang*), singkatan kasar terselubung, dan konteks linguistik netizen Indonesia.
4. **Psikologi Sosial & Dinamika Kelompok (Social Identity Theory)**:
   - Menganalisis polarisasi kelompok, konformitas audiens (*bandwagon effect*), dan kemarahan moral kolektif (*collective moral outrage*).
5. **Komunikasi Krisis & Manajemen Isu (SCCT W.T. Coombs)**:
   - Mengelompokkan atribusi krisis publik (*Victim, Accidental, Preventable cluster*) dan rekomendasi respon juru bicara.

### Modul 4: Kalkulator Inter-Coder Reliability (Cohen's Kappa $\kappa$)
Dibuat khusus untuk memenuhi prasyarat ketat **Bab 3 Metodologi Penelitian**:
- **Dua Mode Perhitungan**:
  - *Mode 1 (Uji Sampel Interaktif)*: Mengambil sampel 20, 30, atau 50 komentar nyata. Pengguna menguji koding dirinya (*Human Coder*) melawan koding AI secara mandiri dengan visualisasi *match/difference*.
  - *Mode 2 (Matriks Kontingensi 3×3 Cepat)*: Input nilai sel frekuensi tabel silang secara langsung.
- **Parameter Statistik yang Dihitung**:
  - Kesesuaian Teramati (*Observed Agreement, $P_o$*).
  - Kesesuaian Peluang Acak (*Expected Chance Agreement, $P_e$*).
  - Koefisien Cohen's Kappa: $\kappa = \frac{P_o - P_e}{1 - P_e}$.
  - Interpretasi otomatis berdasar standar baku **Landis & Koch (1977)** ($< 0.20$ *Slight*, $0.41-0.60$ *Moderate*, $0.61-0.80$ *Substantial*, $> 0.81$ *Almost Perfect*).
- **1-Click Generator Narasi Bab 3**:
  - Tombol instan untuk menyalin teks metodologi formal siap tempel ke draf Word, lengkap dengan rujukan sitasi ilmiah (Cohen 1960; Krippendorff 2004; Neuendorf 2002; Landis & Koch 1977).

### Modul 5: Ekspor Multi-Format Software Statistik
- **SPSS (.sav Datamap & .sps Syntax)**: Menghasilkan skrip syntax SPSS lengkap dengan `VARIABLE LABELS`, `VALUE LABELS`, dan transformasi skala Likert 1-5 / Nominal untuk uji regresi, ANOVA, dan korelasi Pearson.
- **SmartPLS / PLS-SEM (.csv Clean Format)**: Data tabular bersih tanpa karakter baris baru (*newline free*) dengan kode indikator manifest (`SENT_VAL`, `SUBJ_SCORE`, `ENG_INT`) siap uji *Outer Measurement Model* dan *Inner Structural Model*.
- **JASP Academic (.csv)**: Kompatibel penuh dengan analisis bayesian dan statistik klasik perangkat lunak JASP.
- **Excel (.xlsx) & CSV**: Lembar kerja Excel multi-kolom rapi untuk keperluan tabulasi data kualitatif.

### Modul 6: Sitasi Otomatis & Kutipan Verbatim Bab 4
- **Generator Sitasi Video Otomatis**:
  - Format **APA 7th Edition**: `Pengunggah. (Tahun, Tanggal Bulan). Caption... [Video]. TikTok. URL`
  - Format **Harvard Reference System**.
  - Format **BibTeX / Mendeley / Zotero** siap impor ke reference manager.
- **Kutipan Verbatim 1-Klik**:
  - Format kutipan langsung baku sesuai pedoman penulisan karya ilmiah:
    - Kutipan Pendek (< 40 kata): Terpadu dalam teks dengan tanda petik ganda.
    - Kutipan Blok (> 40 kata): Indentasi khusus 0.5 inci dengan spasi tunggal.
  - Rekomendasi kalimat pengantar ilmiah dan parafrase akademis siap pakai.

---

## 📱 5. Spesifikasi Antarmuka & Kebutuhan Responsif (Mobile Experience)

Aplikasi telah diuji dan dioptimalkan secara ketat pada perangkat layar kecil (smartphone/tablet Android & iOS):
1. **Navigasi Bawah Adaptif (Mobile Bottom Navigation Bar)**: Menu navigasi utama (Dashboard, Komentar, AI Skripsi, Riwayat, Pengaturan) menetap di bagian bawah layar dengan *safe-area inset* untuk kemudahan akses satu jempol.
2. **Tata Letak Baris Komentar Zero-Overflow**:
   - Sisi kiri: Avatar + Nama Pengguna & Handle ditumpuk vertikal dengan proteksi pemotongan teks (*text-overflow: ellipsis*).
   - Sisi kanan: Tombol aksi **Kutip Verbatim** (hijau emerald) dan **Salin** selalu berada di kanan atas dengan ukuran sentuh nyaman (32×32px), dan timestamp waktu di bawahnya. Tidak pernah terdorong ke luar layar.
3. **Grid Aksi 2×2 Simetris**:
   - Tombol `Uji Cohen's Kappa`, `Ekspor Statistik (SPSS/PLS)`, `Ekspor CSV`, dan `Ekspor JSON` diatur dalam grid 2 baris × 2 kolom dengan tinggi seragam `38px` untuk mencegah tampilan memanjang/gepeng.
4. **Kartu Sampel Uji Interaktif di HP (Mobile Card List)**:
   - Pada layar smartphone, tabel koding 6 kolom yang lebar otomatis berganti menjadi kartu vertikal yang nyaman (*thumb-friendly*), memungkinkan pengkodean sampel tanpa perlu menggeser layar ke kanan/kiri.

---

## 🔒 6. Kebutuhan Non-Fungsional (Non-Functional Requirements)

1. **Performa & Kecepatan**:
   - Kompilasi bundling Vite di bawah 500 ms.
   - Rendering virtualisasi responsif hingga 5.000 komentar tanpa penurunan frame rate (60 FPS).
2. **Integritas Data**:
   - Skraping mengabaikan komentar duplikat berdasarkan ID unik TikTok.
   - Seluruh pembersihan karakter emoji dan karakter khusus pada teks komentar dilakukan sebelum proses konversi ke format statistik SPSS/SmartPLS.
3. **Kompatibilitas Standar Akademik**:
   - Seluruh rujukan rumus dan ambang batas koefisien statistik didasarkan pada literatur metodologi komunikasi yang terindeks dan bereputasi.
4. **Zero-Configuration Deployment**:
   - Siap dijalankan di komputer lokal hanya dengan perintah `python server.py`.
   - Siap dideploy ke cloud secara gratis melalui kombinasi Render.com (Backend Python) dan Vercel (Frontend Web).

---

## 🗺️ 7. Roadmap & Pengembangan Mendatang

- [x] Ekstraksi Komentar & Balasan Bersarang TikTok.
- [x] Dashboard Filter & Highlight Kata Kunci.
- [x] Integrasi AI Multi-Teori Komunikasi & Pemasaran.
- [x] Modul Ekspor SPSS, SmartPLS, JASP, dan Excel.
- [x] Sitasi Otomatis APA 7th & Kutipan Verbatim Bab 4.
- [x] Analisis Framing Robert Entman (1993) untuk Tesis S2.
- [x] Kalkulator Cohen's Kappa $\kappa$ & Generator Metodologi Bab 3.
- [x] Optimasi Penuh Desain Responsif Layar Ponsel (Mobile UI).
- [ ] *Dukungan Platform Tambahan*: Ekstraksi komentar Instagram Reels & YouTube Shorts.
- [ ] *Multi-Rater Reliability*: Kalkulator **Krippendorff's Alpha ($\alpha$)** dan Fleiss' Kappa untuk pengujian > 2 orang pengkode.
- [ ] *Ekspor Dokumen Skripsi Lengkap*: Ekspor langsung hasil analisis ke file Microsoft Word (.docx) dengan tabel terformat otomatis.

---

*Dokumen ini merupakan panduan resmi spesifikasi produk dan fungsionalitas untuk repositori Scrapper AI (c:\Other\scrapper-ai).*
