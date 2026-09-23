# Saran Analisis AI untuk Penelitian Skripsi Anda

Judul topik Anda menarik: **"emotion-driven / controversy-driven video marketing"** (pemanfaatan kerusuhan, rasa iba, sensasionalisme untuk engagement). Berikut arsitektur analisis yang saya sarankan, dari yang paling feasible ke yang advanced.

---

## 🎯 1. Perjelas Dulu Pertanyaan Penelitian

Analisis AI harus mengikuti RQ, contoh kerangka:

- **RQ1**: Emosi apa yang paling dominan muncul di komentar video marketing berbasis emosi/kontroversi?
- **RQ2**: Bagaimana distribusi sentimen penonton terhadap konten vs produk yang diiklankan?
- **RQ3**: Apakah kontroversi (debat di kolom komentar) berkorelasi dengan tingkat engagement?
- **RQ4**: Sejauh mana penonton menyadari bahwa video tersebut adalah iklan? (-awareness)

---

## 🧩 2. Analisis yang Diperlukan (Level Komentar)

### A. Sentimen Analysis (wajib, dasar)
- Klasifikasi: **Positif / Negatif / Netral** per komentar
- Untuk Bahasa Indonesia: gunakan model pretrained seperti `indobert-base-p1` (fine-tuned untuk sentimen), atau `IndoBERTweet` (lebih cocok untuk bahasa gaul TikTok)
- ⚠️ Tantangan utama: **bahasa slang, singkatan, kata kasar terselubung** ("4nj", "bct", "raimu") — perlu normalisasi teks (slang dictionary / kamus alay)

### B. Emotion Classification (ini yang paling kuat untuk skripsi Anda!)
Lebih kaya daripada sentimen biasa. Klasifikasi ke emosi dasar (model Ekman atau Plutchik):
- 😡 Marah (kemarahan pada kasir/pencuri/pengkomen lain)
- 😢 Simpati/iba (membela si ibu)
- 😂 Ejekan/sarkasme
- 🤨 Skeptis (menduga video adalah akting/scripted)

Ini langsung nyambung dengan teori **emotional marketing** Anda. Contoh prompt LLM: *"Klasifikasikan komentar ini ke dalam emosi: anger, sympathy, sarcasm, skepticism, neutral, other"*

### C. Topic Modeling / Topic Clustering
Menemukan tema pembicaraan otomatis:
- BERTopic (works well for Indonesian dengan embedding multilingual)
- Atau lebih sederhana: LLM clustering (kirim 200-500 komentar, minta dikelompokkan)
- Hasil yang diharapkan: cluster seperti "debat etika kasir", "spekulasi akting", "diskusi sistem kerja retail", "serangan personal", "produk/etawalin"

### D. Brand Mention & Ad-Awareness Analysis (untuk RQ4)
- Deteksi: apakah komentar menyebut produk/caption/iklan? 
- Dari data yang Anda tunjukkan, **hampir 0% komentar membahas produk** — ini temuan penting! Penonton "kehijack" oleh drama, bukan pesan marketing. Itu bisa jadi temuan utama skripsi Anda.

### E. Stance Detection / Argument Mining (advanced, opsional)
- Deteksi posisi penonton: **pro-kasir / pro-ibu / netral**
- Cocok karena data Anda menunjukkan pola "kubu" yang jelas

---

## 📊 3. Analisis Level Thread (ini pembeda skripsi Anda!)

Karena scrapper Anda mengambil **replies**, manfaatkan struktur percakapan:

| Metrik | Kegunaan |
|---|---|
| **Pile-on detection** | Rasio balasan vs komentar utama (contoh Anda: 1 komentar → 85+ balasan) |
| **Polarization score** | Seberapa terbelah komunitas pada satu video |
| **Toxicity cascade** | Apakah thread makin toksik seiring jumlah balasan bertambah |
| **Reply-to-original sentiment shift** | Apakah balasan bergeser dari topik awal |

---

## 📈 4. Analisis Level Video (komparasi antar video)

Kumpulkan beberapa video (misal 10-20 video pola serupa), lalu bandingkan:
- Engagement rate per video vs intensity of controversy
- Apakah video dengan debat lebih panas → engagement lebih tinggi?
- Bandingkan dengan video marketing konvensional (non-drama) sebagai **kelompok pembanding** — ini penting untuk validitas skripsi!

---

## 🛠️ 5. Rekomendasi Teknis (Arsitektur Aplikasi)

```
TikTok API → Scrapper Anda → Preprocessing (slang normalization, 
dedup, cleaning) → Analisis:
  ├─ IndoBERT sentiment/emotion (cepat, gratis, batch)
  └─ LLM API (Gemini/GPT/Claude) untuk:
      ├─ Topic clustering
      ├─ Sarkasme & konteks (model kecil sering gagal di sini!)
      └─ Summarization per thread
→ Simpan hasil ke DB/CSV → Visualisasi (matplotlib, dashboard)
```

**Tips praktis:**
- **Hybrid approach** terbaik: BERT untuk volume besar + LLM untuk validasi sampel (misal 300 komentar manual check → hitung inter-rater reliability dengan Cohen's Kappa untuk validasi skripsi)
- Sarkasme hampir mustahil dideteksi model klasik — LLM jauh lebih baik
- Lakukan **coding manual pada sampel** sebagai ground truth (dosen penguji pasti tanya ini)

---

## 📚 6. Kerangka Teori yang Cocok

- **Emotional Marketing / Emotional Appeal** (Affective Response Theory)
- **Shock Advertising / Controversy Marketing**
- **AIDA atau Hierarchy of Effects** (untuk melihat di tahap mana penonton "berhenti" — mereka engage dengan drama tapi tidak sampai ke action/pembelian)
- **Online Toxicity & Pile-on behavior** (untuk analisis komentar)
- **Dual Process Theory** — penonton bereaksi secara emosional tanpa berpikir kritis bahwa itu iklan

---

## ✅ Ringkasan Prioritas

Kalau waktu terbatas, urutan prioritas:

1. **Preprocessing + slang normalization** (fundamental)
2. **Sentiment analysis** (wajib)
3. **Emotion classification** (inti skripsi Anda)
4. **Topic clustering** dengan LLM
5. **Analisis thread/pile-on** (pembeda dari skripsi lain)
6. **Validasi manual + Kappa** (untuk metodologi)

Mau saya bantu lebih detail di salah satu bagian? Misalnya: desain prompt LLM untuk klasifikasi emosi, strategi normalisasi slang Indonesia, atau kerangka bab metodologi skripsinya?