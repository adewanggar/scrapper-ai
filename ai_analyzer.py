import os
import json
import re
import urllib.request
import urllib.error
from loguru import logger

API_DIRECT_URL = "http://api-direct.apicloud.my.id:8088/v1/chat/completions"
API_FALLBACK_URL = "https://clario.apicloud.my.id/v1/chat/completions"
API_KEY = "sk-clario-55d0256b6122b118913907be97c57f834a6f9ae814133bca"

GOOGLE_GEMINI_KEY = os.environ.get("GEMINI_API_KEY", "AIzaSyC-5euhOw4bOzix7FaMB91jP_y12iPX9XA")

DATA_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'data')

# Daftar Definisi Framework Analisis Akademik (Pilihan Sudut Pandang Skripsi)
ANALYSIS_FRAMEWORKS = {
    "emotion_marketing": {
        "id": "emotion_marketing",
        "title": "Pemasaran Berbasis Emosi & Kontroversi (Emotion-Driven Marketing)",
        "short_title": "Emosi & Kontroversi",
        "icon": "Flame",
        "description": "Menganalisis respon emosi audiens (kemarahan, simpati, skeptis), rasio terkecoh drama vs sadar iklan, dan potensi brand hijack.",
        "theory": "Affective Response Theory, Drama Baiting, Shock Advertising",
        "target_major": "Manajemen Pemasaran, Ilmu Komunikasi, Periklanan"
    },
    "public_sentiment": {
        "id": "public_sentiment",
        "title": "Sentimen Publik & Manajemen Krisis PR (Public Relations)",
        "short_title": "Sentimen & Krisis PR",
        "icon": "Target",
        "description": "Mengukur opini dan sentimen publik, audit reputasi, deteksi potensi krisis citra, serta rekomendasi strategi komunikasi krisis.",
        "theory": "Situational Crisis Communication Theory (SCCT), Public Opinion Formation, Framing Theory",
        "target_major": "Public Relations (Humas), Ilmu Komunikasi, Kebijakan Publik"
    },
    "consumer_behavior": {
        "id": "consumer_behavior",
        "title": "Perilaku Konsumen & Minat Beli (Consumer Behavior & Purchase Intent)",
        "short_title": "Perilaku & Minat Beli",
        "icon": "ShoppingBag",
        "description": "Menganalisis intensi beli (purchase intention), persepsi harga & kualitas, electronic word-of-mouth (eWOM), dan hambatan konversi pembeli.",
        "theory": "Theory of Planned Behavior (TPB), Technology Acceptance Model (TAM), Perceived Value Theory",
        "target_major": "Manajemen Bisnis, Pemasaran Digital, Ekonomi Terapan"
    },
    "digital_discourse": {
        "id": "digital_discourse",
        "title": "Wacana Komunikasi & Netiket Netizen (Digital Discourse & Netiquette)",
        "short_title": "Wacana & Netiket",
        "icon": "MessageSquare",
        "description": "Menganalisis etika komunikasi warganet, tingkat kesantunan berbahasa, penggunaan slang/slang Gen-Z, sarkasme, hingga potensi cyberbullying.",
        "theory": "Politeness Theory (Brown & Levinson), Computer-Mediated Communication (CMC), Critical Discourse Analysis",
        "target_major": "Linguistik Terapan, Ilmu Komunikasi, Sosiologi Komunikasi"
    },
    "social_psychology": {
        "id": "social_psychology",
        "title": "Psikologi Sosial & Dinamika Kelompok (Social Psychology & Crowd Dynamics)",
        "short_title": "Psikologi Sosial",
        "icon": "Brain",
        "description": "Mengkaji konformitas (efek ikut-ikutan), moral outrage (kemarahan moral kolektif), empati sosial, polarisasi kelompok, dan bias atribusi.",
        "theory": "Social Identity Theory, Moral Foundations Theory, Attribution Theory",
        "target_major": "Psikologi, Sosiologi, Humaniora Digital"
    }
}

def get_cache_path(filename: str, analysis_type: str = "emotion_marketing") -> str:
    base = os.path.splitext(os.path.basename(filename))[0]
    if analysis_type and analysis_type != "emotion_marketing":
        return os.path.join(DATA_DIR, f"{base}_{analysis_type}_ai_analysis.json")
    return os.path.join(DATA_DIR, f"{base}_ai_analysis.json")

def load_cached_analysis(filename: str, analysis_type: str = "emotion_marketing"):
    cache_path = get_cache_path(filename, analysis_type=analysis_type)
    if os.path.exists(cache_path):
        try:
            with open(cache_path, 'r', encoding='utf-8') as f:
                return json.load(f)
        except Exception as e:
            logger.warning(f"Failed to read cache {cache_path}: {e}")
    return None

def save_cached_analysis(filename: str, analysis_data: dict, analysis_type: str = "emotion_marketing"):
    cache_path = get_cache_path(filename, analysis_type=analysis_type)
    try:
        with open(cache_path, 'w', encoding='utf-8') as f:
            json.dump(analysis_data, f, ensure_ascii=False, indent=2)
        logger.info(f"Saved AI analysis cache to {cache_path}")
    except Exception as e:
        logger.error(f"Failed to save cache {cache_path}: {e}")

def call_google_gemini(prompt: str, model: str = "gemini-3.8-flash", system_instruction: str = None) -> tuple[str, str]:
    """Call Google AI Studio directly using official Generative Language API."""
    import time
    clean_model = model.replace("models/", "")
    url = f"https://generativelanguage.googleapis.com/v1beta/models/{clean_model}:generateContent?key={GOOGLE_GEMINI_KEY}"

    sys_text = system_instruction or (
        "Anda adalah asisten peneliti ahli komunikasi digital, video marketing, dan analisis media sosial. "
        "Tugas Anda menganalisis dataset komentar penonton pada video untuk penulisan skripsi akademik. "
        "WAJIB memberikan output dalam format JSON murni yang valid tanpa teks pembuka/penutup."
    )

    payload = {
        "systemInstruction": {
            "parts": [{"text": sys_text}]
        },
        "contents": [
            {
                "role": "user",
                "parts": [{"text": prompt}]
            }
        ],
        "generationConfig": {
            "temperature": 0.2
        }
    }

    data_bytes = json.dumps(payload).encode('utf-8')
    headers = {"Content-Type": "application/json"}

    last_error = None
    for attempt in range(3):
        try:
            logger.info(f"Mencoba Google AI Studio API: {clean_model} (attempt {attempt + 1})...")
            req = urllib.request.Request(url, data=data_bytes, headers=headers)
            with urllib.request.urlopen(req, timeout=90) as resp:
                resp_json = json.loads(resp.read().decode('utf-8'))
                content = resp_json['candidates'][0]['content']['parts'][0]['text'].strip()
                logger.info(f"Berhasil mendapatkan respon dari Google AI Studio {clean_model}")
                return content, f"Google {clean_model}"
        except Exception as e:
            logger.warning(f"Google AI Studio attempt {attempt + 1} gagal ({clean_model}): {e}")
            last_error = e
            time.sleep(2)

    raise RuntimeError(f"Gagal menghubungi Google AI Studio ({clean_model}): {last_error}")

def call_clario_llm(prompt: str, preferred_model: str = "clario/deepseek-v4-flash", system_instruction: str = None) -> tuple[str, str]:
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {API_KEY}"
    }

    if "gemini" in preferred_model.lower():
        models_to_try = [
            "clario/gemini-3.7-flash",
            "clario/deepseek-v4-flash",
            "clario/deepseek-v4.1-flash"
        ]
    else:
        models_to_try = [
            "clario/deepseek-v4-flash",
            "clario/gemini-3.7-flash",
            "clario/deepseek-v4.1-flash"
        ]

    sys_text = system_instruction or (
        "Anda adalah asisten peneliti ahli komunikasi digital, video marketing, dan analisis media sosial. "
        "Tugas Anda menganalisis dataset komentar penonton pada video untuk penulisan skripsi akademik. "
        "WAJIB memberikan output dalam format JSON murni yang valid tanpa teks pembuka/penutup."
    )

    last_error = None
    for model_name in models_to_try:
        payload = {
            "model": model_name,
            "messages": [
                {
                    "role": "system",
                    "content": sys_text
                },
                {"role": "user", "content": prompt}
            ],
            "temperature": 0.2,
            "max_tokens": 3500
        }
        data_bytes = json.dumps(payload).encode('utf-8')

        for url in [API_DIRECT_URL, API_FALLBACK_URL]:
            try:
                logger.info(f"Mencoba API Clario: {model_name} di {url}")
                req = urllib.request.Request(url, data=data_bytes, headers=headers)
                with urllib.request.urlopen(req, timeout=90) as resp:
                    resp_json = json.loads(resp.read().decode('utf-8'))
                    content = resp_json['choices'][0]['message']['content'].strip()
                    logger.info(f"Berhasil mendapatkan respon dari {model_name}")
                    return content, model_name
            except Exception as e:
                logger.warning(f"Gagal {model_name} di {url}: {e}")
                last_error = e
                continue

    raise RuntimeError(f"Gagal menghubungi API Clario setelah mencoba semua model: {last_error}")

def call_llm(prompt: str, preferred_model: str = "gemini-3.8-flash", system_instruction: str = None) -> tuple[str, str]:
    """Unified LLM router: routes to Google AI Studio for gemini-3.8-flash, or Clario for others with fallback."""
    if "3.8" in preferred_model or preferred_model == "gemini-3.8-flash" or "google" in preferred_model.lower():
        try:
            return call_google_gemini(prompt, model="gemini-3.8-flash", system_instruction=system_instruction)
        except Exception as e:
            logger.warning(f"Google Gemini 3.8 error: {e}. Fallback ke Clario Gemini 3.7...")
            return call_clario_llm(prompt, preferred_model="clario/gemini-3.7-flash", system_instruction=system_instruction)
    else:
        return call_clario_llm(prompt, preferred_model=preferred_model, system_instruction=system_instruction)

def build_prompt_and_system(analysis_type: str, caption: str, formatted_comments: str, count: int) -> tuple[str, str]:
    """Menghasilkan prompt dan system instruction sesuai sudut pandang penelitian skripsi."""

    # 1. EMOTION & CONTROVERSY DRIVEN MARKETING (Default, preserved 100%)
    if analysis_type == "emotion_marketing":
        sys_inst = (
            "Anda adalah asisten peneliti ahli komunikasi digital, video marketing, dan analisis media sosial. "
            "Tugas Anda menganalisis dataset komentar penonton pada video marketing berbasis emosi atau kontroversi "
            "(emotion-driven / controversy-driven marketing) untuk penulisan skripsi akademik. "
            "WAJIB memberikan output dalam format JSON murni yang valid tanpa teks pembuka/penutup."
        )
        prompt = f"""Analisis data video TikTok berikut untuk penelitian skripsi:

CAPTION VIDEO:
\"\"\"{caption}\"\"\"

SAMPEL KOMENTAR ({count} komentar):
\"\"\"{formatted_comments}\"\"\"

Analisis data di atas secara mendalam dan kembalikan HANYA format JSON valid berikut (semua nilai persen harus angka bulat 0-100):

{{
  "video_context": {{
    "premise": "Penjelasan singkat premis/cerita/momen emosional apa yang terjadi atau dimanfaatkan dalam video",
    "product_or_brand": "Nama produk atau brand yang diiklankan (atau 'Tidak Disebutkan')",
    "marketing_strategy_detected": "Ringkasan strategi pemasaran yang dipakai (misal: Shock Advertising, Drama Baiting, Pity Appeal, dsb)"
  }},
  "ad_awareness": {{
    "drama_engaged_pct": 82,
    "marketing_aware_pct": 14,
    "product_focus_pct": 4,
    "analysis": "Penjelasan apakah audiens terhanyut emosinya oleh drama ataukah sadar ini iklan"
  }},
  "emotion_distribution": {{
    "anger_pct": 35,
    "sympathy_pct": 30,
    "skepticism_pct": 15,
    "sarcasm_pct": 15,
    "neutral_pct": 5,
    "dominant_emotion": "Kemarahan / Outrage",
    "dominant_emotion_explanation": "Uraian mengapa emosi tersebut mendominasi kolom komentar"
  }},
  "sentiment_distribution": {{
    "positive_pct": 20,
    "negative_pct": 65,
    "neutral_pct": 15,
    "dominant_sentiment": "Negatif",
    "sentiment_summary": "Rangkuman sentimen penonton terhadap konten/situasi"
  }},
  "stance_dynamics": {{
    "side_a_name": "Pihak/Kubu A (sebutkan nama peran, misal Pihak Menegakkan Aturan / Kasir)",
    "side_a_pct": 45,
    "side_b_name": "Pihak/Kubu B (sebutkan nama peran, misal Pihak Membela Pelaku / Iba)",
    "side_b_pct": 40,
    "neutral_pct": 15,
    "controversy_level": "Tinggi",
    "polarization_summary": "Uraian bagaimana perdebatan kubu terjadi di komentar"
  }},
  "topic_clusters": [
    {{
      "topic_name": "Nama Klaster Topik 1",
      "pct": 35,
      "description": "Uraian apa yang diperdebatkan dalam topik ini",
      "sample_quote": "Kutipan komentar representatif dari sampel"
    }},
    {{
      "topic_name": "Nama Klaster Topik 2",
      "pct": 25,
      "description": "Uraian apa yang diperdebatkan dalam topik ini",
      "sample_quote": "Kutipan komentar representatif dari sampel"
    }},
    {{
      "topic_name": "Nama Klaster Topik 3",
      "pct": 20,
      "description": "Uraian apa yang diperdebatkan dalam topik ini",
      "sample_quote": "Kutipan komentar representatif dari sampel"
    }},
    {{
      "topic_name": "Nama Klaster Topik 4",
      "pct": 20,
      "description": "Uraian apa yang diperdebatkan dalam topik ini",
      "sample_quote": "Kutipan komentar representatif dari sampel"
    }}
  ],
  "academic_insights": {{
    "key_findings": [
      "Temuan empiris 1 untuk skripsi",
      "Temuan empiris 2 untuk skripsi",
      "Temuan empiris 3 untuk skripsi"
    ],
    "brand_hijack_verdict": "Overshadowed by Drama (Brand Tertutupi Drama)",
    "theoretical_relevance": "Kaitan temuan dengan teori (misal: Affective Response Theory, Dual Process Theory)",
    "thesis_summary_paragraph": "Paragraf ringkasan kesimpulan akademik komprehensif yang siap disalin untuk Bab 4 Skripsi."
  }}
}}
"""
        return prompt, sys_inst

    # 2. SENTIMEN PUBLIK & MANAJEMEN KRISIS PR
    elif analysis_type == "public_sentiment":
        sys_inst = (
            "Anda adalah asisten peneliti ahli Public Relations (PR), komunikasi krisis, dan analisis opini publik media sosial. "
            "Tugas Anda menganalisis dataset komentar publik untuk penelitian skripsi/tugas akhir bidang Ilmu Komunikasi dan Hubungan Masyarakat. "
            "WAJIB memberikan output dalam format JSON murni yang valid tanpa teks pembuka/penutup."
        )
        prompt = f"""Analisis dataset komentar media sosial berikut dari perspektif Sentimen Publik & Manajemen Krisis PR untuk skripsi:

CAPTION KONTEN:
\"\"\"{caption}\"\"\"

SAMPEL KOMENTAR ({count} komentar):
\"\"\"{formatted_comments}\"\"\"

Lakukan audit opini publik dan kembalikan HANYA format JSON valid berikut (semua persen harus angka bulat 0-100):

{{
  "context_summary": {{
    "issue_premise": "Rangkuman isu utama atau topik video yang memicu tanggapan publik",
    "public_entity_or_brand": "Tokoh, instansi, atau merek yang menjadi sorotan audiens",
    "crisis_threat_level": "Rendah / Sedang / Tinggi / Sangat Kritis"
  }},
  "sentiment_metrics": {{
    "positive_pct": 20,
    "neutral_pct": 20,
    "negative_pct": 40,
    "critical_pct": 20,
    "dominant_sentiment": "Sentimen Kritis & Menuntut Pertanggungjawaban",
    "sentiment_momentum": "Uraian apakah sentimen memburuk atau berangsur terkendali"
  }},
  "reputation_audit": {{
    "trust_score_pct": 45,
    "public_perception_verdict": "Terancam Krisis Kepercayaan / Positif / Netral Terbelah",
    "key_grievances": [
      "Poin kritik atau kekecewaan publik terbesar 1",
      "Poin kritik atau kekecewaan publik terbesar 2"
    ],
    "praise_points": [
      "Poin pembelaan atau respon positif publik 1",
      "Poin pembelaan atau respon positif publik 2"
    ]
  }},
  "stance_dynamics": {{
    "side_a_name": "Pihak Pendukung / Apresiatif",
    "side_a_pct": 35,
    "side_b_name": "Pihak Pengkritik / Penuntut Klarifikasi",
    "side_b_pct": 50,
    "neutral_pct": 15,
    "controversy_level": "Tinggi",
    "polarization_summary": "Uraian polarisasi opini publik di kolom komentar"
  }},
  "topic_clusters": [
    {{
      "topic_name": "Klaster Isu Publik 1",
      "pct": 40,
      "description": "Fokus pembicaraan warganet pada isu ini",
      "sample_quote": "Kutipan komentar representatif dari sampel"
    }},
    {{
      "topic_name": "Klaster Isu Publik 2",
      "pct": 35,
      "description": "Fokus pembicaraan warganet pada isu ini",
      "sample_quote": "Kutipan komentar representatif dari sampel"
    }},
    {{
      "topic_name": "Klaster Isu Publik 3",
      "pct": 25,
      "description": "Fokus pembicaraan warganet pada isu ini",
      "sample_quote": "Kutipan komentar representatif dari sampel"
    }}
  ],
  "pr_crisis_recommendations": {{
    "crisis_type_detected": "Miscommunication / Faux Pas / Transgression / Rumor / Performance Deficit",
    "recommended_response_strategy": "Rebuild (Permintaan Maaf Tulus) / Diminish (Klarifikasi Konteks) / Bolstering (Penguatan Bukti)",
    "immediate_pr_actions": [
      "Langkah taktis mitigasi krisis 1",
      "Langkah taktis mitigasi krisis 2"
    ],
    "holding_statement_draft": "Draf pernyataan resmi klarifikasi/tanggapan humas yang disarankan untuk meredam kegaduhan warganet."
  }},
  "academic_insights": {{
    "key_findings": [
      "Temuan empiris 1 untuk skripsi",
      "Temuan empiris 2 untuk skripsi",
      "Temuan empiris 3 untuk skripsi"
    ],
    "theoretical_relevance": "Kaitan temuan dengan teori (misal: Situational Crisis Communication Theory (Coombs), Framing Theory, Public Opinion Spiral)",
    "thesis_summary_paragraph": "Paragraf ringkasan kesimpulan akademik komprehensif yang siap disalin untuk Bab 4 Skripsi."
  }}
}}
"""
        return prompt, sys_inst

    # 3. PERILAKU KONSUMEN & MINAT BELI
    elif analysis_type == "consumer_behavior":
        sys_inst = (
            "Anda adalah asisten peneliti ahli perilaku konsumen (consumer behavior), pemasaran digital, dan riset e-commerce. "
            "Tugas Anda menganalisis dataset komentar calon konsumen untuk penelitian skripsi/tugas akhir bidang Manajemen Bisnis dan Pemasaran. "
            "WAJIB memberikan output dalam format JSON murni yang valid tanpa teks pembuka/penutup."
        )
        prompt = f"""Analisis dataset komentar penonton berikut dari perspektif Perilaku Konsumen & Minat Beli untuk skripsi:

CAPTION KONTEN:
\"\"\"{caption}\"\"\"

SAMPEL KOMENTAR ({count} komentar):
\"\"\"{formatted_comments}\"\"\"

Kembalikan HANYA format JSON valid berikut (semua persen harus angka bulat 0-100):

{{
  "context_summary": {{
    "product_or_brand": "Nama produk, jasa, atau merek yang diobrolkan",
    "value_proposition_perceived": "Nilai manfaat utama yang dipersepsikan oleh penonton",
    "market_appeal_summary": "Tingkat daya tarik produk bagi segmen audiens"
  }},
  "purchase_intent_metrics": {{
    "high_intent_pct": 30,
    "moderate_curious_pct": 35,
    "price_skeptic_pct": 20,
    "resistant_uninterested_pct": 15,
    "purchase_intent_verdict": "Tinggi (High Conversion Potential) / Butuh Edukasi Harga / Rendah"
  }},
  "consumer_perception": {{
    "perceived_quality": "Sangat Berkualitas / Sebanding Harga / Kurang Meyakinkan",
    "price_fairness_perception": "Terjangkau (Affordable) / Sepadan (Worth it) / Terlalu Mahal",
    "trust_and_credibility": "Kredibel / Butuh Bukti Ulasan Nyata / Ragu / Skeptis",
    "primary_purchase_barriers": [
      "Hambatan pembelian utama 1 (misal: keraguan keamanan, harga, ketiadaan ulasan)",
      "Hambatan pembelian utama 2 (misal: ketersediaan stok, perbandingan dengan kompetitor)"
    ]
  }},
  "ewom_dynamics": {{
    "positive_ewom_pct": 50,
    "negative_ewom_pct": 20,
    "inquiry_questions_pct": 30,
    "ewom_influence_summary": "Bagaimana komentar rekomendasi atau testimoni mempengaruhi minat belanja audiens lain"
  }},
  "stance_dynamics": {{
    "side_a_name": "Calon Pembeli Tertarik & Membela Produk",
    "side_a_pct": 45,
    "side_b_name": "Kelompok Ragu & Membandingkan Kompetitor",
    "side_b_pct": 35,
    "neutral_pct": 20,
    "controversy_level": "Sedang",
    "polarization_summary": "Dinamika perdebatan antara audiens yang berminat vs yang meragukan nilai produk"
  }},
  "topic_clusters": [
    {{
      "topic_name": "Pertanyaan & Minat Transaksi",
      "pct": 40,
      "description": "Pertanyaan seputar cara beli, harga, varian, atau spesifikasi",
      "sample_quote": "Kutipan komentar representatif dari sampel"
    }},
    {{
      "topic_name": "Ulasan Kualitas & Khasiat Produk",
      "pct": 35,
      "description": "Tanggapan netizen mengenai kualitas atau testimoni pemakaian",
      "sample_quote": "Kutipan komentar representatif dari sampel"
    }},
    {{
      "topic_name": "Keraguan & Perbandingan Pasar",
      "pct": 25,
      "description": "Kritik atau pertimbangan terhadap alternatif produk lain",
      "sample_quote": "Kutipan komentar representatif dari sampel"
    }}
  ],
  "academic_insights": {{
    "key_findings": [
      "Temuan empiris 1 untuk skripsi",
      "Temuan empiris 2 untuk skripsi",
      "Temuan empiris 3 untuk skripsi"
    ],
    "theoretical_relevance": "Kaitan temuan dengan teori (misal: Theory of Planned Behavior (Ajzen), Technology Acceptance Model, Perceived Value Theory)",
    "thesis_summary_paragraph": "Paragraf ringkasan kesimpulan akademik komprehensif yang siap disalin untuk Bab 4 Skripsi."
  }}
}}
"""
        return prompt, sys_inst

    # 4. WACANA KOMUNIKASI & NETIKET NETIZEN
    elif analysis_type == "digital_discourse":
        sys_inst = (
            "Anda adalah asisten peneliti ahli linguistik terapan, analisis wacana kritis (discourse analysis), dan etika komunikasi digital (netiket). "
            "Tugas Anda menganalisis dataset komentar warganet untuk penelitian skripsi/tugas akhir bidang Ilmu Komunikasi dan Bahasa. "
            "WAJIB memberikan output dalam format JSON murni yang valid tanpa teks pembuka/penutup."
        )
        prompt = f"""Analisis dataset komentar media sosial berikut dari perspektif Wacana Komunikasi & Netiket Netizen untuk skripsi:

CAPTION KONTEN:
\"\"\"{caption}\"\"\"

SAMPEL KOMENTAR ({count} komentar):
\"\"\"{formatted_comments}\"\"\"

Kembalikan HANYA format JSON valid berikut (semua persen harus angka bulat 0-100):

{{
  "context_summary": {{
    "communicative_situation": "Konteks situasi interaksi warganet pada konten ini",
    "discourse_topic": "Topik wacana sentral yang berkembang di ruang komentar",
    "communication_climate": "Kondusif & Hangat / Interaktif Santai / Sarkastik & Sinis / Agresif & Beracun (Toxic)"
  }},
  "politeness_and_tone": {{
    "polite_constructive_pct": 25,
    "neutral_informative_pct": 30,
    "sarcastic_satirical_pct": 30,
    "aggressive_toxic_pct": 15,
    "dominant_tone": "Sarkasme Kritis / Santun Mengapresiasi / Menghakimi / Guyonan Slang"
  }},
  "linguistic_features": {{
    "prominent_slang_and_jargon": [
      "Istilah gaul / slang / ungkapan khas warganet yang dominan muncul 1",
      "Istilah gaul / slang / ungkapan khas warganet yang dominan muncul 2"
    ],
    "rhetorical_devices_used": "Gaya bahasa utama yang digunakan (misal: Ironi, Hiperbola, Eufemisme, Sindiran Retoris)",
    "netiquette_compliance_level": "Tinggi (Menjaga Adab) / Sedang (Batas Wajar) / Rendah (Banyak Pelanggaran Netiket)",
    "flaming_and_cyberbullying_risk": "Rendah / Sedang / Mengkhawatirkan"
  }},
  "stance_dynamics": {{
    "side_a_name": "Pola Tuturan Konstruktif & Solutif",
    "side_a_pct": 40,
    "side_b_name": "Pola Tuturan Sinis & Menyerang (Flaming)",
    "side_b_pct": 45,
    "neutral_pct": 15,
    "controversy_level": "Tinggi",
    "polarization_summary": "Bagaimana warganet menggunakan pilihan kata dan nada tutur untuk mendominasi percakapan"
  }},
  "topic_clusters": [
    {{
      "topic_name": "Pola Wacana 1",
      "pct": 40,
      "description": "Bentuk wacana dan gaya tuturan warganet",
      "sample_quote": "Kutipan komentar representatif dari sampel"
    }},
    {{
      "topic_name": "Pola Wacana 2",
      "pct": 35,
      "description": "Bentuk wacana dan gaya tuturan warganet",
      "sample_quote": "Kutipan komentar representatif dari sampel"
    }},
    {{
      "topic_name": "Pola Wacana 3",
      "pct": 25,
      "description": "Bentuk wacana dan gaya tuturan warganet",
      "sample_quote": "Kutipan komentar representatif dari sampel"
    }}
  ],
  "academic_insights": {{
    "key_findings": [
      "Temuan empiris 1 untuk skripsi",
      "Temuan empiris 2 untuk skripsi",
      "Temuan empiris 3 untuk skripsi"
    ],
    "theoretical_relevance": "Kaitan temuan dengan teori (misal: Politeness Theory (Brown & Levinson), Computer-Mediated Communication (CMC), Critical Discourse Analysis)",
    "thesis_summary_paragraph": "Paragraf ringkasan kesimpulan akademik komprehensif yang siap disalin untuk Bab 4 Skripsi."
  }}
}}
"""
        return prompt, sys_inst

    # 5. PSIKOLOGI SOSIAL & DINAMIKA KELOMPOK
    elif analysis_type == "social_psychology":
        sys_inst = (
            "Anda adalah asisten peneliti ahli psikologi sosial, sosiologi perilaku massa, dan dinamika interaksi kelompok online. "
            "Tugas Anda menganalisis dataset komentar warganet untuk penelitian skripsi/tugas akhir bidang Psikologi dan Sosiologi. "
            "WAJIB memberikan output dalam format JSON murni yang valid tanpa teks pembuka/penutup."
        )
        prompt = f"""Analisis dataset komentar penonton berikut dari perspektif Psikologi Sosial & Dinamika Kelompok untuk skripsi:

CAPTION KONTEN:
\"\"\"{caption}\"\"\"

SAMPEL KOMENTAR ({count} komentar):
\"\"\"{formatted_comments}\"\"\"

Kembalikan HANYA format JSON valid berikut (semua persen harus angka bulat 0-100):

{{
  "context_summary": {{
    "social_stimulus": "Stimulus sosial atau pemicu psikologis dalam konten video",
    "social_phenomenon_observed": "Fenomena sosial kolektif yang teramati di kolom komentar",
    "psychological_tension": "Ketegangan psikologis yang dirasakan audiens (misal: disonansi kognitif, kecemasan moral)"
  }},
  "psychological_metrics": {{
    "conformity_bandwagon_pct": 35,
    "moral_outrage_pct": 40,
    "social_empathy_pct": 15,
    "apathy_detachment_pct": 10,
    "dominant_psychological_state": "Kemarahan Moral Kolektif (Collective Moral Outrage)"
  }},
  "attribution_and_bias": {{
    "attribution_target": "Menyalahkan Karakter Individu (Internal) / Menyalahkan Sistem & Keadaan (Eksternal) / Menyalahkan Korban (Victim Blaming)",
    "cognitive_bias_detected": "Fundamental Attribution Error / In-Group Favoritism / Confirmation Bias / Halo Effect",
    "moral_judgment_summary": "Bagaimana audiens menetapkan standar moralitas benar vs salah pada peristiwa tersebut"
  }},
  "stance_dynamics": {{
    "side_a_name": "Kelompok Penilai Moral Keras (Moral Guardians)",
    "side_a_pct": 50,
    "side_b_name": "Kelompok Empatik / Pembela Kontekstual",
    "side_b_pct": 35,
    "neutral_pct": 15,
    "controversy_level": "Tinggi",
    "polarization_summary": "Bagaimana audiens terbelah berdasarkan nilai moralitas dan identitas sosial kelompok"
  }},
  "topic_clusters": [
    {{
      "topic_name": "Dinamika Respon Sosial 1",
      "pct": 45,
      "description": "Bentuk reaksi psikologis kelompok audiens",
      "sample_quote": "Kutipan komentar representatif dari sampel"
    }},
    {{
      "topic_name": "Dinamika Respon Sosial 2",
      "pct": 30,
      "description": "Bentuk reaksi psikologis kelompok audiens",
      "sample_quote": "Kutipan komentar representatif dari sampel"
    }},
    {{
      "topic_name": "Dinamika Respon Sosial 3",
      "pct": 25,
      "description": "Bentuk reaksi psikologis kelompok audiens",
      "sample_quote": "Kutipan komentar representatif dari sampel"
    }}
  ],
  "academic_insights": {{
    "key_findings": [
      "Temuan empiris 1 untuk skripsi",
      "Temuan empiris 2 untuk skripsi",
      "Temuan empiris 3 untuk skripsi"
    ],
    "theoretical_relevance": "Kaitan temuan dengan teori (misal: Social Identity Theory (Tajfel), Deindividuation Theory (Zimbardo), Moral Foundations Theory (Haidt))",
    "thesis_summary_paragraph": "Paragraf ringkasan kesimpulan akademik komprehensif yang siap disalin untuk Bab 4 Skripsi."
  }}
}}
"""
        return prompt, sys_inst

    # Fallback to emotion_marketing if unrecognized
    return build_prompt_and_system("emotion_marketing", caption, formatted_comments, count)

def analyze_video_comments(
    filename: str,
    sample_size: int = 50,
    preferred_model: str = "gemini-3.8-flash",
    analysis_type: str = "emotion_marketing"
) -> dict:
    safe_filename = os.path.basename(filename)
    file_path = os.path.join(DATA_DIR, safe_filename)

    if not os.path.exists(file_path):
        raise FileNotFoundError(f"File data {safe_filename} tidak ditemukan.")

    with open(file_path, 'r', encoding='utf-8') as f:
        video_data = json.load(f)

    caption = video_data.get('caption', '')
    raw_comments = video_data.get('comments', [])

    if not raw_comments:
        raise ValueError("File komentar tidak memiliki data komentar untuk dianalisis.")

    # Sort comments by total_reply descending to prioritize high-engagement debate comments
    sorted_comments = sorted(
        raw_comments,
        key=lambda c: (c.get('total_reply') or len(c.get('replies', []))),
        reverse=True
    )

    if sample_size and sample_size > 0:
        sampled_items = sorted_comments[:sample_size]
    else:
        # sample_size <= 0 means ALL comments (capped at 400 for LLM context safety)
        sampled_items = sorted_comments[:400]

    comments_text_list = []
    for idx, c in enumerate(sampled_items, 1):
        txt = (c.get('comment') or '').strip().replace('\n', ' ')
        user = c.get('username', 'anon')
        replies_count = c.get('total_reply') or len(c.get('replies', []))
        if txt:
            clean_txt = txt[:150]
            comments_text_list.append(f"[{idx}] @{user} ({replies_count} balasan): \"{clean_txt}\"")

    formatted_comments = "\n".join(comments_text_list)

    # Dapatkan prompt dan system instruction sesuai jenis analisis yang dipilih
    prompt, sys_instruction = build_prompt_and_system(
        analysis_type=analysis_type,
        caption=caption,
        formatted_comments=formatted_comments,
        count=len(comments_text_list)
    )

    framework_meta = ANALYSIS_FRAMEWORKS.get(analysis_type, ANALYSIS_FRAMEWORKS["emotion_marketing"])
    logger.info(
        f"Mengirim analisis AI [{framework_meta['short_title']}] untuk {safe_filename} "
        f"({len(comments_text_list)} komentar, model: {preferred_model})..."
    )

    llm_output, model_used = call_llm(prompt, preferred_model=preferred_model, system_instruction=sys_instruction)

    # Clean code fences if present
    cleaned_json_str = re.sub(r"^```(?:json)?\s*", "", llm_output, flags=re.MULTILINE)
    cleaned_json_str = re.sub(r"\s*```$", "", cleaned_json_str, flags=re.MULTILINE).strip()

    try:
        parsed_result = json.loads(cleaned_json_str)
    except Exception as e:
        logger.error(f"Failed to parse LLM JSON: {e}\nRaw output:\n{llm_output}")
        start = cleaned_json_str.find('{')
        end = cleaned_json_str.rfind('}')
        if start != -1 and end != -1:
            parsed_result = json.loads(cleaned_json_str[start:end+1])
        else:
            raise ValueError("Output dari AI bukan format JSON yang valid.")

    analysis_meta = {
        "filename": safe_filename,
        "analysis_type": analysis_type,
        "framework_title": framework_meta["title"],
        "sample_analyzed": len(comments_text_list),
        "total_comments": len(raw_comments),
        "model_used": model_used,
        "result": parsed_result
    }

    save_cached_analysis(safe_filename, analysis_meta, analysis_type=analysis_type)
    return analysis_meta

if __name__ == '__main__':
    res = analyze_video_comments('7688421946832293141.json', 30, analysis_type="public_sentiment")
    print("SUCCESS! Model used:", res['model_used'])
    print("Dominant sentiment:", res['result']['sentiment_metrics']['dominant_sentiment'])
