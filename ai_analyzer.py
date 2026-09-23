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

# Model cascade: try user-requested model first, then nearby active variants
MODELS_TO_TRY = [
    "gemini-3.8-flash",
    "clario/deepseek-v4-flash",
    "clario/deepseek-v4.1-flash",
    "clario/gemini-3.7-flash"
]

DATA_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'data')

def get_cache_path(filename: str) -> str:
    base = os.path.splitext(os.path.basename(filename))[0]
    return os.path.join(DATA_DIR, f"{base}_ai_analysis.json")

def load_cached_analysis(filename: str):
    cache_path = get_cache_path(filename)
    if os.path.exists(cache_path):
        try:
            with open(cache_path, 'r', encoding='utf-8') as f:
                return json.load(f)
        except Exception as e:
            logger.warning(f"Failed to read cache {cache_path}: {e}")
    return None

def save_cached_analysis(filename: str, analysis_data: dict):
    cache_path = get_cache_path(filename)
    try:
        with open(cache_path, 'w', encoding='utf-8') as f:
            json.dump(analysis_data, f, ensure_ascii=False, indent=2)
        logger.info(f"Saved AI analysis cache to {cache_path}")
    except Exception as e:
        logger.error(f"Failed to save cache {cache_path}: {e}")

def call_google_gemini(prompt: str, model: str = "gemini-3.8-flash") -> tuple[str, str]:
    """Call Google AI Studio directly using official Generative Language API."""
    import time
    clean_model = model.replace("models/", "")
    url = f"https://generativelanguage.googleapis.com/v1beta/models/{clean_model}:generateContent?key={GOOGLE_GEMINI_KEY}"

    payload = {
        "systemInstruction": {
            "parts": [{
                "text": (
                    "Anda adalah asisten peneliti ahli komunikasi digital, video marketing, dan analisis media sosial. "
                    "Tugas Anda menganalisis dataset komentar penonton pada video marketing berbasis emosi atau kontroversi "
                    "(emotion-driven / controversy-driven marketing) untuk penulisan skripsi akademik. "
                    "WAJIB memberikan output dalam format JSON murni yang valid tanpa teks pembuka/penutup."
                )
            }]
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

def call_clario_llm(prompt: str, preferred_model: str = "clario/deepseek-v4-flash") -> tuple[str, str]:
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {API_KEY}"
    }

    # Order models prioritizing preferred_model
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

    last_error = None
    for model_name in models_to_try:
        payload = {
            "model": model_name,
            "messages": [
                {
                    "role": "system",
                    "content": (
                        "Anda adalah asisten peneliti ahli komunikasi digital, video marketing, dan analisis media sosial. "
                        "Tugas Anda menganalisis dataset komentar penonton pada video marketing berbasis emosi atau kontroversi "
                        "(emotion-driven / controversy-driven marketing) untuk penulisan skripsi akademik. "
                        "WAJIB memberikan output dalam format JSON murni yang valid tanpa teks pembuka/penutup."
                    )
                },
                {"role": "user", "content": prompt}
            ],
            "temperature": 0.2,
            "max_tokens": 3000
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

def call_llm(prompt: str, preferred_model: str = "gemini-3.8-flash") -> tuple[str, str]:
    """Unified LLM router: routes to Google AI Studio for gemini-3.8-flash, or Clario for others with fallback."""
    if "3.8" in preferred_model or preferred_model == "gemini-3.8-flash" or "google" in preferred_model.lower():
        try:
            return call_google_gemini(prompt, model="gemini-3.8-flash")
        except Exception as e:
            logger.warning(f"Google Gemini 3.8 error: {e}. Fallback ke Clario Gemini 3.7...")
            return call_clario_llm(prompt, preferred_model="clario/gemini-3.7-flash")
    else:
        return call_clario_llm(prompt, preferred_model=preferred_model)

def analyze_video_comments(filename: str, sample_size: int = 50, preferred_model: str = "gemini-3.8-flash") -> dict:
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
            # Truncate very long comments to save tokens
            clean_txt = txt[:150]
            comments_text_list.append(f"[{idx}] @{user} ({replies_count} balasan): \"{clean_txt}\"")

    formatted_comments = "\n".join(comments_text_list)

    prompt = f"""Analisis data video TikTok berikut untuk penelitian skripsi:

CAPTION VIDEO:
\"\"\"{caption}\"\"\"

SAMPEL KOMENTAR ({len(comments_text_list)} komentar):
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
    "side_a_name": "Pihak/Kubu A (sebutkan nama pihak/peran, misal Pihak Menegakkan Aturan / Kasir)",
    "side_a_pct": 45,
    "side_b_name": "Pihak/Kubu B (sebutkan nama pihak/peran, misal Pihak Membela Pelaku / Iba)",
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

    logger.info(f"Mengirim analisis AI untuk {safe_filename} ({len(comments_text_list)} komentar, model preferensi: {preferred_model})...")
    llm_output, model_used = call_llm(prompt, preferred_model=preferred_model)

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
        "sample_analyzed": len(comments_text_list),
        "total_comments": len(raw_comments),
        "model_used": model_used,
        "result": parsed_result
    }

    save_cached_analysis(safe_filename, analysis_meta)
    return analysis_meta

if __name__ == '__main__':
    res = analyze_video_comments('7687448180547456277.json', 30)
    print("SUCCESS! Model used:", res['model_used'])
    print("Dominant emotion:", res['result']['emotion_distribution']['dominant_emotion'])
