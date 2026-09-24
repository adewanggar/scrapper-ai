[![Twitter: romy](https://img.shields.io/twitter/follow/RomySihananda)](https://twitter.com/RomySihananda)

# tiktok-comment-scrapper

![](https://raw.githubusercontent.com/RomySaputraSihananda/RomySaputraSihananda/main/images/GA-U-u2bsAApmn9.jpeg)
Get all comments from tiktok video url or id

## Requirements

- **Python >= 3.11.4**
- **Requests >= 2.31.0**

## Installation

```sh
# Clonig Repository
git clone https://github.com/romysaputrasihananda/tiktok-comment-scrapper

# Change Directory
cd tiktok-comment-scrapper

# Create Virtual Environment (Optional)
python -m venv venv
source venv/bin/activate  # On Windows use `venv\Scripts\activate`

# Install Requirement
pip install -r requirements.txt
```

## Example Usages

```sh
python main.py --aweme_id=7170139292767882522 --size=10 --output=data
```

### Flags

| Flag        | Alias |           Description           | Example              |       Default       |
| :---------- | :---: | :-----------------------------: | :------------------- | :-----------------: |
| --aweme_id  |       | Url or video id of tiktok video | --aweme_id=id or url | 7170139292767882522 |
| --size      |  -s   |       number of comments        | --size=10            |         50          |
| --output    |  -o   |      json file output path      | --output=data        |        data         |

## Sample Output

![](https://raw.githubusercontent.com/RomySaputraSihananda/RomySaputraSihananda/main/images/Screenshot_20231211_001804.png)

```json
{
  "caption": "makk aku jadi animee🤩#faceplay #faceplayapp #anime #harem #xysryo ",
  "date_now": "2023-12-10T22:06:04",
  "video_url": "https://t.tiktok.com/i18n/share/video/7170139292767882522/?_d=0&comment_author_id=6838487455625479169&mid=7157599449395496962&preview_pb=0&region=ID&share_comment_id=7310977412674093829&share_item_id=7170139292767882522&sharer_language=en&source=h5_t&u_code=0",
  "comments": [
    {
      "username": "user760722966",
      "nickname": "rehan",
      "comment": "testing 😁😁",
      "create_time": "2023-12-10T21:46:36",
      "avatar": "https://p16-sign-useast2a.tiktokcdn.com/tos-useast2a-avt-0068-giso/f64f2c7df8a16098d3b3c80e958ffc52~c5_100x100.jpg?x-expires=1702306800&x-signature=KhUeuGmPAVij9A8gbgh7wK6rn98%3D",
      "total_reply": 0,
      "replies": []
    },
    {
      "username": "user760722966",
      "nickname": "rehan",
      "comment": "bagus",
      "create_time": "2023-12-10T18:55:47",
      "avatar": "https://p16-sign-useast2a.tiktokcdn.com/tos-useast2a-avt-0068-giso/f64f2c7df8a16098d3b3c80e958ffc52~c5_100x100.jpg?x-expires=1702306800&x-signature=KhUeuGmPAVij9A8gbgh7wK6rn98%3D",
      "total_reply": 3,
      "replies": [
        {
          "username": "ryo.syntax",
          "nickname": "Bukan Rio",
          "comment": "good game",
          "create_time": "2023-12-10T18:56:19",
          "avatar": "https://p16-sign-useast2a.tiktokcdn.com/tos-useast2a-avt-0068-giso/be4a9d0479f29d00cb3d06905ff5a972~c5_100x100.jpg?x-expires=1702306800&x-signature=IvkeSvXmvkmE0hZG5dtgpqcFn3A%3D"
        }
        // more replies
      ]
    }
    // more comments
  ]
}
## 🌐 Web Dashboard & AI Analysis (Skripsi & Tesis S2 Edition)

Aplikasi ini dilengkapi antarmuka web modern berbasis **React (Vite)** dan backend server **Python** dengan integrasi **AI Analysis (Clario LLM - DeepSeek V4 & Gemini 3.7 Flash)** untuk riset skripsi dan tesis:

### 🎓 Fitur Akademik Unggulan:
- **Analisis Framing Robert Entman (1993)**: Membedah 4 kuadran framing media (*Define Problems, Diagnose Causes, Make Moral Judgments, Suggest Remedies*) untuk ketajaman Bab 4 Pembahasan.
- **Kalkulator Inter-Coder Reliability (Cohen's Kappa $\kappa$)**: Uji reliabilitas reliabel 2 rater (AI vs Manusia / Rater A vs Rater B) lengkap dengan interpretasi Landis & Koch (1977) dan narasi siap tempel untuk Bab 3 Metodologi.
- **Export Multi-Format Software Statistik**: 1-klik ekspor ke **SPSS** (.sav syntax / datamap), **SmartPLS / PLS-SEM** (.csv bersih siap olah), **JASP**, dan **Excel** (.xlsx).
- **Sitasi Otomatis & Kutipan Verbatim**: Format sitasi APA 7th, Harvard, Mendeley/BibTeX dan kutipan verbatim terformat akademis untuk narasi skripsi/tesis.

### Menjalankan di Lokal:

```sh
# 1. Jalankan server backend (otomatis melayani frontend di http://localhost:5000)
python server.py

# 2. Atau jalankan frontend secara terpisah (development mode)
cd web
npm install
npm run dev
```

---

## 🚀 Panduan Deploy Cloud (Vercel + Render)

### 1. Backend di Render.com
1. Buat **New Web Service** di [Render.com](https://render.com).
2. Hubungkan ke repositori GitHub ini.
3. Konfigurasi:
   - **Environment**: `Python`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `python server.py`
4. Dapatkan URL backend Anda (misal: `https://scrapper-ai-backend.onrender.com`).

### 2. Frontend di Vercel
1. Buat **New Project** di [Vercel](https://vercel.com) dan impor repositori GitHub ini.
2. Pada **Environment Variables**, tambahkan:
   - `VITE_API_URL`: URL backend Render Anda (misal: `https://scrapper-ai-backend.onrender.com`).
3. Klik **Deploy**! Vercel akan otomatis mem-build frontend dan memberikan domain HTTPS yang cepat dan aktif 24/7.

---

## License

This project is licensed under the [MIT License](LICENSE).
