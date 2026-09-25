import os
import json
import re
import urllib.request
import urllib.error
from loguru import logger

API_DIRECT_URL = "https://clario.apicloud.my.id/v1/chat/completions"
API_FALLBACK_URL = "http://api-direct.apicloud.my.id:8088/v1/chat/completions"
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
    },
    "entman_framing": {
        "id": "entman_framing",
        "title": "Analisis Framing Robert Entman (Media & Communication Framing)",
        "short_title": "Framing Entman (S2)",
        "icon": "Layers",
        "description": "Analisis 4 elemen framing Entman (1993): Define Problems, Diagnose Causes, Make Moral Judgments, dan Suggest Remedies pada diskursus media sosial.",
        "theory": "Entman's Framing Theory (1993), Agenda Setting, Social Construction of Reality",
        "target_major": "Magister Ilmu Komunikasi (S2), Kajian Media, Komunikasi Politik"
    },
    "political_communication": {
        "id": "political_communication",
        "title": "Komunikasi Politik & Polarisasi Opini (Political Communication & Echo Chamber)",
        "short_title": "Komunikasi Politik",
        "icon": "ShieldAlert",
        "description": "Menganalisis polarisasi kubu partisipan, echo chamber, sentimen terhadap figur/kebijakan politik, dan bias konfirmasi pemilih.",
        "theory": "Selective Exposure, Echo Chamber, Spiral of Silence, Social Identity Theory",
        "target_major": "Ilmu Politik, Komunikasi Politik, Kebijakan Publik"
    },
    "audience_reception": {
        "id": "audience_reception",
        "title": "Resepsi Khalayak & Dekoding Audiens (Stuart Hall Reception Analysis)",
        "short_title": "Resepsi Stuart Hall",
        "icon": "MessageCircle",
        "description": "Mengklasifikasikan pemaknaan audiens ke dalam 3 posisi: Dominan-Hegemonik (menerima pesan), Negosiasi (kompromi), atau Oposisional (menolak/kritis).",
        "theory": "Encoding/Decoding Model (Stuart Hall 1973), Active Audience Theory, Cultural Studies",
        "target_major": "Kajian Media, Studi Budaya, Ilmu Komunikasi"
    },
    "parasocial_culture": {
        "id": "parasocial_culture",
        "title": "Budaya Digital & Interaksi Parasosial (Parasocial Interaction & Fandom)",
        "short_title": "Interaksi Parasosial",
        "icon": "Award",
        "description": "Mengkaji keterikatan emosional semu khalayak pada figur kreator/selebritas, loyalitas fandom, pembelaan moral fans, dan dinamika micro-celebrity.",
        "theory": "Parasocial Interaction (Horton & Wohl), Participatory Culture (Henry Jenkins), Micro-Celebrity",
        "target_major": "Sosiologi Budaya, Kajian Fandom, Komunikasi Digital"
    },
    "public_policy": {
        "id": "public_policy",
        "title": "Aspirasi Warga & Kebijakan Publik (Citizen Feedback & Public Governance)",
        "short_title": "Kebijakan Publik",
        "icon": "CheckCircle2",
        "description": "Evaluasi penerimaan publik terhadap kebijakan pemerintah, regulasi hukum, kritik layanan umum, dan tuntutan transparansi masyarakat.",
        "theory": "Deliberative Democracy, Citizen Engagement, Good Governance & Accountability",
        "target_major": "Administrasi Publik, Kebijakan Publik, Ilmu Komunikasi"
    },

    # ============ PSIKOLOGI ============
    "persepsi_emosi_digital": {
        "id": "persepsi_emosi_digital",
        "title": "Persepsi, Emosi & Perilaku Digital (Cognitive Appraisal & Uses & Gratifications)",
        "short_title": "Persepsi & Emosi Digital",
        "icon": "Eye",
        "description": "Menganalisis cara netizen menilai (persepsi kognitif) dan merespons secara emosional sebuah konten atau fenomena, serta motivasi keterlibatan mereka di media digital.",
        "theory": "Cognitive Appraisal Theory (Lazarus, 1991), Uses and Gratifications Theory (Katz, Blumler & Gurevitch, 1973), Basic Emotions (Ekman, 1992)",
        "target_major": "Psikologi, Psikologi Media, Ilmu Komunikasi",
        "research_persona": "psikologi media dan persepsi kognitif digital",
        "focus": "menilai persepsi kognitif netizen terhadap konten, respons emosional yang muncul, motivasi penggunaan media, dan kecenderungan perilaku keterlibatan digital",
        "indicators": [
            {"name": "Persepsi Positif", "desc": "komentar yang menilai konten/fenomena secara positif, setuju, atau apresiatif"},
            {"name": "Persepsi Negatif", "desc": "komentar yang menilai negatif, keberatan, atau tidak setuju dengan konten/fenomena"},
            {"name": "Respons Emosional", "desc": "emosi yang diekspresikan (gembira, marah, khawatir, sedih, terhibur, terkejut)"},
            {"name": "Motivasi Penggunaan Media", "desc": "gratifikasi yang dicari: hiburan, informasi, interaksi sosial, pelarian (escapism)"},
            {"name": "Kecenderungan Perilaku Keterlibatan", "desc": "niat bereaksi, membagikan ulang, mengikuti perkembangan, atau mengambil sikap"}
        ]
    },
    "identitas_sosial_kelompok": {
        "id": "identitas_sosial_kelompok",
        "title": "Identitas Sosial & Dinamika Kelompok (Social Identity & Group Dynamics)",
        "short_title": "Identitas & Kelompok",
        "icon": "Users",
        "description": "Mengkaji bagaimana netizen mendefinisikan identitas kelompoknya (in-group vs out-group), konformitas terhadap mayoritas, dan solidaritas di dalam kolom komentar.",
        "theory": "Social Identity Theory (Tajfel & Turner, 1979), Group Polarization (Moscovici & Zavalloni, 1969), Conformity Studies (Asch, 1955)",
        "target_major": "Psikologi Sosial, Psikologi, Sosiologi",
        "research_persona": "psikologi sosial dengan spesialisasi identitas sosial dan dinamika kelompok",
        "focus": "mengidentifikasi pengelompokan identitas in-group dan out-group, konformitas terhadap opini mayoritas, solidaritas kelompok, dan favoritisme in-group",
        "indicators": [
            {"name": "Identifikasi In-Group", "desc": "komentar yang menunjukkan identitas/bangga dengan kelompoknya sendiri (kami, kita)"},
            {"name": "Persepsi terhadap Out-Group", "desc": "komentar yang menandai, mengelompokkan, atau menyerang kelompok lawan (mereka)"},
            {"name": "Konformitas / Bandwagon", "desc": "mengikuti opini mayoritas atau ikut-ikutan tanpa argumen mandiri"},
            {"name": "Solidaritas & Dukungan Kelompok", "desc": "dukungan emosional dan verbal kepada anggota kelompoknya"},
            {"name": "Favoritisme In-Group & Bias", "desc": "penilaian timpang yang lebih baik untuk kelompok sendiri dibanding kelompok lain"}
        ]
    },
    "atribusi_sosial": {
        "id": "atribusi_sosial",
        "title": "Persepsi dan Atribusi Sosial (Social Perception & Attribution)",
        "short_title": "Atribusi Sosial",
        "icon": "Fingerprint",
        "description": "Menganalisis sebab yang ditudingkan netizen terhadap perilaku orang lain: atribusi internal (karakter) atau eksternal (situasi), beserta bias-bias penilaiannya.",
        "theory": "Attribution Theory (Heider, 1958; Weiner, 1985), Fundamental Attribution Error (Ross, 1977)",
        "target_major": "Psikologi Sosial, Psikologi, Humaniora",
        "research_persona": "psikologi sosial dengan spesialisasi persepsi dan atribusi kausal",
        "focus": "mengklasifikasikan atribusi sebab yang diberikan netizen (internal vs eksternal), penilaian tanggung jawab, dan bias atribusi yang muncul",
        "indicators": [
            {"name": "Atribusi Internal", "desc": "menyalahkan atau memuji karakter, niat, dan kemampuan pribadi pelaku"},
            {"name": "Atribusi Eksternal", "desc": "menyalahkan atau mengkreditkan situasi, tekanan lingkungan, atau kebetulan"},
            {"name": "Penilaian Tanggung Jawab", "desc": "pemberian blame (kecaman) atau credit (pengakuan) kepada aktor tertentu"},
            {"name": "Bias Atribusi & Stereotip", "desc": "fundamental attribution error, stereotip kelompok, atau penilaian tergesa"},
            {"name": "Empati vs Kecaman", "desc": "kecenderungan menempatkan diri pada situasi pelaku vs langsung menghakimi"}
        ]
    },
    "ekspresi_emosi_digital": {
        "id": "ekspresi_emosi_digital",
        "title": "Ekspresi Emosi dalam Interaksi Digital (Emotional Expression in CMC)",
        "short_title": "Ekspresi Emosi",
        "icon": "Smile",
        "description": "Memetakan ekspresi emosi dasar yang ditampilkan warganet, penularan emosi (emotional contagion), dan bentuk dukungan emosional dalam interaksi daring.",
        "theory": "Basic Emotion Theory (Ekman & Friesen, 1971), Emotional Contagion (Hatfield, Cacioppo & Rapson, 1994), Emotion Regulation (Gross, 1998)",
        "target_major": "Psikologi, Psikologi Komunikasi, Humaniora Digital",
        "research_persona": "psikologi emosi dan interaksi berbantuan komputer",
        "focus": "memetakan ekspresi emosi dasar netizen, penularan emosi kolektif, sarkasme, dan bentuk regulasi atau dukungan emosional di ruang digital",
        "indicators": [
            {"name": "Ekspresi Emosi Dasar", "desc": "emosi dasar Ekman: senang, marah, sedih, takut, terkejut, jijik/tidak suka"},
            {"name": "Empati & Dukungan Emosional", "desc": "ucapan belasungkawa, doa, semangat, atau ikut merasakan"},
            {"name": "Kontagion / Emosi Kolektif", "desc": "emosi yang menular dan membesar secara kolektif di kolom komentar"},
            {"name": "Sarkasme & Emosi Terselubung", "desc": "ejekan, sindiran, humor hitam, atau emosi yang disamarkan"},
            {"name": "Regulasi & Penenangan Emosi", "desc": "upaya menenangkan pihak lain, meredam ketegangan, atau menyerahkan pada waktu"}
        ]
    },

    # ============ SOSIOLOGI ============
    "ketimpangan_sosial": {
        "id": "ketimpangan_sosial",
        "title": "Ketimpangan Sosial & Dinamika Masyarakat (Social Inequality & Stratification)",
        "short_title": "Ketimpangan Sosial",
        "icon": "TrendingDown",
        "description": "Mengkaji kesadaran warganet terhadap kesenjangan ekonomi-sosial, kritik distribusi dan akses, serta suara kelompok terpinggirkan di media digital.",
        "theory": "Forms of Capital & Stratification (Bourdieu, 1986), Digital Divide (van Dijk, 2005; DiMaggio & Hargittai, 2001)",
        "target_major": "Sosiologi, Kajian Pembangunan, Ilmu Sosial",
        "research_persona": "sosiolog dengan spesialisasi stratifikasi sosial dan ketimpangan",
        "focus": "mengidentifikasi kesadaran ketimpangan, kritik terhadap distribusi dan akses, posisi kelompok terpinggirkan, dan tuntutan keadilan sosial dalam komentar",
        "indicators": [
            {"name": "Kesadaran Ketimpangan", "desc": "komentar yang menyadari atau menyoroti kesenjangan sosial-ekonomi"},
            {"name": "Kritik Distribusi & Akses", "desc": "kritik terhadap pemerataan pendapatan, layanan, atau akses digital"},
            {"name": "Suara Kelompok Terpinggirkan", "desc": "pengalaman atau pembelaan bagi kelompok rentan/marginal"},
            {"name": "Simbol Kapital & Status", "desc": "penanda kapital ekonomi/sosial/budaya: gaya hidup, harga, prestise"},
            {"name": "Tuntutan Keadilan Sosial", "desc": "seruan pemerataan, subsidi, atau perbaikan struktur"}
        ]
    },
    "konstruksi_sosial_digital": {
        "id": "konstruksi_sosial_digital",
        "title": "Konstruksi Sosial di Media Digital (Social Construction of Reality)",
        "short_title": "Konstruksi Sosial",
        "icon": "Network",
        "description": "Menganalisis bagaimana makna dan realitas sosial dibangun bersama oleh warganet: narasi dominan, pelabelan, simbol, dan negosiasi makna.",
        "theory": "Social Construction of Reality (Berger & Luckmann, 1966), Symbolic Interactionism (Blumer, 1969)",
        "target_major": "Sosiologi, Kajian Media, Antropologi Digital",
        "research_persona": "sosiolog dengan spesialisasi konstruksi sosial realitas dan interaksionisme simbolik",
        "focus": "menganalisis definisi situasi, narasi dominan, pelabelan dan stigma, simbol bahasa khas, serta negosiasi makna antar kubu warganet",
        "indicators": [
            {"name": "Definisi Situasi & Narasi Dominan", "desc": "cara warganet mendefinisikan 'apa yang sebenarnya terjadi'"},
            {"name": "Pelabelan & Stigma Sosial", "desc": "pemberian label, julukan, atau stigma kepada aktor/kelompok"},
            {"name": "Simbol, Meme & Bahasa Khas", "desc": "simbol verbal/visual khas yang dipakai untuk memaknai situasi"},
            {"name": "Negosiasi Makna Antar Kubu", "desc": "tarik-menarik interpretasi antara kubu yang berbeda"},
            {"name": "Realitas yang Dikonstruksi Bersama", "desc": "kesepakatan makna yang terbentuk dan diperkuat secara kolektif"}
        ]
    },
    "konflik_sosial_polarisasi": {
        "id": "konflik_sosial_polarisasi",
        "title": "Konflik Sosial & Polarisasi Kelompok (Social Conflict & Polarization)",
        "short_title": "Konflik & Polarisasi",
        "icon": "Zap",
        "description": "Mengkaji sumber konflik, pengelompokan kubu, eskalasi retorika, serta upaya mediasi atau de-eskalasi yang muncul dalam diskursus digital.",
        "theory": "Realistic Conflict Theory (Sherif, 1966), The Functions of Social Conflict (Coser, 1956), Group Polarization (Moscovici & Zavalloni, 1969)",
        "target_major": "Sosiologi, Ilmu Sosial, Studi Perdamaian",
        "research_persona": "sosiolog dengan spesialisasi konflik sosial dan polarisasi kelompok",
        "focus": "mengidentifikasi sumber konflik, garis pengelompokan kubu, eskalasi dan de-eskalasi, retorika permusuhan, serta jembatan mediasi dalam komentar",
        "indicators": [
            {"name": "Sumber Konflik", "desc": "akar pertikaian: sumber daya, nilai, identitas, atau informasi"},
            {"name": "Pengelompokan Kubu", "desc": "garis pembatas kubu yang terbentuk dalam perdebatan"},
            {"name": "Eskalasi & De-eskalasi", "desc": "meningkatnya ketegangan atau upaya meredam konflik"},
            {"name": "Retorika Permusuhan", "desc": "serangan personal, hinaan, atau ujaran kebencian antar kubu"},
            {"name": "Mediasi & Jembatan Perdamaian", "desc": "komentar yang menengahi, berpindah kubu, atau mengajak berdamai"}
        ]
    },
    "norma_sosial_interaksi": {
        "id": "norma_sosial_interaksi",
        "title": "Norma Sosial & Interaksi Masyarakat (Social Norms & Interaction Order)",
        "short_title": "Norma & Interaksi",
        "icon": "BookOpen",
        "description": "Menganalisis norma yang dijaga warganet: norma deskriptif dan injunktif, pelanggaran beserta sanksi sosial, dan tata krama interaksi daring.",
        "theory": "Focus Theory of Normative Conduct (Cialdini, Reno & Kallgren, 1990), Interaction Ritual (Goffman, 1967), Social Control Theory",
        "target_major": "Sosiologi, Antropologi, Ilmu Komunikasi",
        "research_persona": "sosiolog dengan spesialisasi norma sosial dan kontrol sosial",
        "focus": "mengklasifikasikan norma yang berlaku dan dijaga warganet, bentuk pelanggaran norma, sanksi sosial, serta pola tata krama interaksi",
        "indicators": [
            {"name": "Norma Deskriptif", "desc": "referensi pada 'kebiasaan kebanyakan orang' sebagai pedoman perilaku"},
            {"name": "Norma Injunktif", "desc": "referensi pada aturan, larangan, dan penilaian benar-salah"},
            {"name": "Pelanggaran Norma", "desc": "perilaku yang dinilai melanggar norma agama, sosial, atau hukum"},
            {"name": "Sanksi Sosial & Penghakiman", "desc": "camplakan, pengucilan, viral-bashing, atau 'pengadilan publik'"},
            {"name": "Kesantunan & Tata Krama Interaksi", "desc": "ritual sopan santun, sapaan, dan etika percakapan daring"}
        ]
    },

    # ============ MANAJEMEN & BISNIS ============
    "brand_perception_purchase": {
        "id": "brand_perception_purchase",
        "title": "Persepsi Merek & Keputusan Pembelian (Brand Equity & Purchase Decision)",
        "short_title": "Persepsi Merek",
        "icon": "ShieldCheck",
        "description": "Menganalisis persepsi warganet terhadap sebuah merek (kesadaran, asosiasi, kualitas, kepercayaan) dan kaitannya dengan niat membeli.",
        "theory": "Brand Equity Model (Aaker, 1991), Theory of Planned Behavior (Ajzen, 1991)",
        "target_major": "Manajemen, Pemasaran, Bisnis Digital",
        "research_persona": "ahli manajemen pemasaran dengan spesialisasi ekuitas merek dan keputusan pembelian",
        "focus": "menganalisis kesadaran merek, asosiasi dan citra merek, persepsi kualitas, kepercayaan, serta niat beli yang terekspresikan dalam komentar",
        "indicators": [
            {"name": "Kesadaran & Pengenalan Merek", "desc": "komentar yang menyebut, mengenali, atau mengingat merek/produk"},
            {"name": "Asosiasi & Citra Merek", "desc": "atribut dan kesan yang dilekatkan pada merek (murah, premium, kampungan, dsb)"},
            {"name": "Persepsi Kualitas", "desc": "penilaian atas kualitas produk/layanan yang dibicarakan"},
            {"name": "Kepercayaan terhadap Merek", "desc": "kredibilitas, jujur, amanah, atau sebaliknya diragukan"},
            {"name": "Niat Beli (Purchase Intention)", "desc": "ekspresi ingin membeli, memesan, atau menunggu promo"}
        ]
    },
    "konsumen_digital": {
        "id": "konsumen_digital",
        "title": "Perilaku Konsumen Digital (Digital Consumer Behaviour & Customer Journey)",
        "short_title": "Konsumen Digital",
        "icon": "Smartphone",
        "description": "Memetakan perjalanan konsumen digital: dari mengenal produk, mencari dan membandingkan informasi, hingga hambatan yang menahan keputusan pembelian.",
        "theory": "Customer Journey & Experience (Lemon & Verhoef, 2016), Impulse Buying (Rook, 1987)",
        "target_major": "Manajemen, Pemasaran Digital, E-Commerce",
        "research_persona": "ahli perilaku konsumen dengan spesialisasi customer journey digital",
        "focus": "memetakan tahapan perjalanan konsumen, pembelian impulsif, pencarian informasi, validasi sosial, dan hambatan keputusan pembelian",
        "indicators": [
            {"name": "Tahap Perjalanan Konsumen", "desc": "awareness, pertimbangan, pembelian, atau pengalaman pascabeli"},
            {"name": "Pembelian Impulsif", "desc": "godaan beli mendadak akibat konten, harga, atau FOMO"},
            {"name": "Pencarian & Perbandingan Informasi", "desc": "menanyakan harga, spesifikasi, membandingkan dengan kompetitor"},
            {"name": "Validasi Sosial", "desc": "bergantung pada ulasan, testimoni, bukti sosial, atau rekomendasi orang lain"},
            {"name": "Hambatan Keputusan Pembelian", "desc": "keraguan: harga, kualitas, kepercayaan, logistik, atau budget"}
        ]
    },
    "ewom": {
        "id": "ewom",
        "title": "Electronic Word of Mouth (e-WOM) (eWOM & Information Adoption)",
        "short_title": "e-WOM",
        "icon": "ThumbsUp",
        "description": "Menganalisis komunikasi dari mulut ke mulut secara elektronik: rekomendasi, kualitas argumen, kredibilitas sumber, dan motivasi warganet berbagi informasi.",
        "theory": "eWOM Intention (Hennig-Thurau et al., 2004), Information Adoption Model (Sussman & Siegal, 2003)",
        "target_major": "Manajemen Pemasaran, Ilmu Komunikasi, Bisnis Digital",
        "research_persona": "ahli pemasaran dengan spesialisasi electronic word of mouth",
        "focus": "mengklasifikasikan eWOM positif dan negatif, kualitas argumen, kredibilitas sumber, dan motivasi warganet menyebarkan informasi",
        "indicators": [
            {"name": "eWOM Positif", "desc": "rekomendasi, pujian, dan ajakan memakai produk/jasa"},
            {"name": "eWOM Negatif", "desc": "peringatan, keluhan yang disebarkan, dan ajakan menghindari"},
            {"name": "Kualitas Argumen Informasi", "desc": "kelengkapan, relevansi, dan kesaktian argumen yang disampaikan"},
            {"name": "Kredibilitas Sumber", "desc": "penilaian sumber: pengalaman langsung, influencer, atau cuma tukang iklan"},
            {"name": "Motivasi Berbagi Informasi", "desc": "altruisme, ekspresi diri, membantu orang lain, atau sekadar ikut trending"}
        ]
    },
    "loyalitas_pengalaman": {
        "id": "loyalitas_pengalaman",
        "title": "Loyalitas Pelanggan & Pengalaman Konsumen (Customer Loyalty & Experience)",
        "short_title": "Loyalitas & Pengalaman",
        "icon": "Award",
        "description": "Mengukur kepuasan, pengalaman layanan, advokasi, dan niat penggunaan berkelanjutan pelanggan yang terekspresikan dalam komentar.",
        "theory": "Customer Experience (Lemon & Verhoef, 2016), Customer Loyalty (Oliver, 1999), Expectation-Confirmation Theory (Bhattacherjee, 2001)",
        "target_major": "Manajemen, Kewirausahaan, Manajemen Layanan",
        "research_persona": "ahli manajemen dengan spesialisasi pengalaman pelanggan dan loyalitas",
        "focus": "menganalisis kepuasan pelanggan, kualitas pengalaman layanan, advokasi, keluhan, dan niat menggunakan kembali",
        "indicators": [
            {"name": "Kepuasan Pelanggan", "desc": "ekspresi puas atau kecewa terhadap produk/layanan"},
            {"name": "Pengalaman Layanan & Penggunaan", "desc": "cerita pengalaman memakai produk, pelayanan, atau fitur"},
            {"name": "Advokasi (Merekomendasikan)", "desc": "menganjurkan orang lain ikut memakai"},
            {"name": "Keluhan & Komplain", "desc": "gugatan spesifik atas masalah produk, layanan, atau penanganan"},
            {"name": "Niat Penggunaan Berkelanjutan", "desc": "niat repurchase, langganan, atau setia pada merek"}
        ]
    },

    # ============ PENDIDIKAN ============
    "persepsi_kebijakan_pendidikan": {
        "id": "persepsi_kebijakan_pendidikan",
        "title": "Persepsi Mahasiswa terhadap Kebijakan Pendidikan (Student Perception of Education Policy)",
        "short_title": "Persepsi Kebijakan Dikti",
        "icon": "GraduationCap",
        "description": "Menganalisis sikap mahasiswa dan warganet terhadap kebijakan pendidikan: dukungan, persepsi dampak, kritik implementasi, dan tuntutan perubahan.",
        "theory": "Theory of Reasoned Action (Fishbein & Ajzen, 1975), Understanding Public Policy (Dye, 1972)",
        "target_major": "Pendidikan, Administrasi Pendidikan, Kebijakan Publik",
        "research_persona": "peneliti pendidikan dengan spesialisasi persepsi terhadap kebijakan pendidikan",
        "focus": "menganalisis dukungan dan penolakan terhadap kebijakan pendidikan, persepsi dampak dan keadilan, kritik implementasi, serta usulan perubahan",
        "indicators": [
            {"name": "Dukungan terhadap Kebijakan", "desc": "apresiasi dan persetujuan atas kebijakan pendidikan yang dibahas"},
            {"name": "Penolakan & Keberatan", "desc": "penolakan, protes, atau keberatan terhadap kebijakan"},
            {"name": "Persepsi Dampak bagi Mahasiswa/Lembaga", "desc": "perkiraan manfaat atau kerugian yang dirasakan"},
            {"name": "Persepsi Keadilan & Pemerataan", "desc": "penilaian apakah kebijakan adil dan merata bagi semua pihak"},
            {"name": "Kritik Implementasi & Usulan Perubahan", "desc": "kritik pelaksanaan di lapangan serta saran perbaikan konkret"}
        ]
    },
    "teknologi_pendidikan": {
        "id": "teknologi_pendidikan",
        "title": "Penerimaan Teknologi dalam Pendidikan (Technology Acceptance in Education)",
        "short_title": "Teknologi Pendidikan",
        "icon": "Cpu",
        "description": "Menganalisis penerimaan mahasiswa dan guru terhadap teknologi pembelajaran: persepsi kemudahan, kegunaan, kesiapan, hambatan, dan dampak belajar.",
        "theory": "Technology Acceptance Model (Davis, 1989), UTAUT (Venkatesh et al., 2003)",
        "target_major": "Pendidikan, Teknologi Pendidikan, Manajemen Pendidikan",
        "research_persona": "peneliti teknologi pendidikan dengan spesialisasi adopsi teknologi pembelajaran",
        "focus": "menganalisis persepsi kemudahan dan kegunaan teknologi pembelajaran, niat penggunaan, hambatan infrastruktur dan literasi, serta dampaknya pada efektivitas belajar",
        "indicators": [
            {"name": "Persepsi Kemudahan Penggunaan", "desc": "penilaian apakah teknologi mudah dipakai untuk belajar"},
            {"name": "Persepsi Kegunaan Pembelajaran", "desc": "penilaian manfaat teknologi bagi hasil belajar"},
            {"name": "Niat & Kesiapan Penggunaan", "desc": "kesediaan memakai platform/aplikasi pembelajaran"},
            {"name": "Hambatan Infrastruktur & Literasi", "desc": "kendala jaringan, perangkat, biaya, atau kemampuan digital"},
            {"name": "Dampak pada Efektivitas Belajar", "desc": "perubahan prestasi, fokus, atau kualitas belajar yang dirasakan"}
        ]
    },
    "motivasi_belajar_digital": {
        "id": "motivasi_belajar_digital",
        "title": "Motivasi Belajar & Pembelajaran Digital (Learning Motivation & Self-Regulated Learning)",
        "short_title": "Motivasi Belajar",
        "icon": "Lightbulb",
        "description": "Menganalisis motivasi intrinsik dan ekstrinsik, kemandirian belajar, keterlibatan, serta hambatan yang dialami pelajar dalam pembelajaran digital.",
        "theory": "Self-Determination Theory (Deci & Ryan, 1985), ARCS Motivation Model (Keller, 1987), Self-Regulated Learning (Zimmerman, 1990)",
        "target_major": "Pendidikan, Psikologi Pendidikan, Bimbingan Konseling",
        "research_persona": "peneliti pendidikan dengan spesialisasi motivasi belajar dan regulasi diri",
        "focus": "menganalisis motivasi intrinsik dan ekstrinsik belajar, kemandirian, engagement, serta hambatan dan kelelahan belajar digital",
        "indicators": [
            {"name": "Motivasi Intrinsik", "desc": "minat, rasa ingin tahu, dan kesenangan belajar itu sendiri"},
            {"name": "Motivasi Ekstrinsik", "desc": "dorongan nilai, beasiswa, pekerjaan, atau tekanan orang tua"},
            {"name": "Kemandirian & Disiplin Belajar", "desc": "self-regulated learning: aturan belajar sendiri, manajemen waktu"},
            {"name": "Keterlibatan (Engagement) Belajar", "desc": "partisipasi aktif, antusias, atau sebaliknya pasif"},
            {"name": "Hambatan & Kelelahan Belajar Digital", "desc": "jenuh, lelah layar, distraksi, atau kehilangan semangat"}
        ]
    },
    "ai_pendidikan": {
        "id": "ai_pendidikan",
        "title": "Persepsi terhadap Penggunaan AI dalam Pendidikan (AI Acceptance in Education)",
        "short_title": "AI dalam Pendidikan",
        "icon": "Bot",
        "description": "Menganalisis sikap mahasiswa dan pendidik terhadap penggunaan AI: antusiasme, persepsi manfaat dan akurasi, kekhawatiran, serta kepercayaan pada AI.",
        "theory": "Technology Acceptance Model (Davis, 1989), Expectation-Confirmation Theory (Bhattacherjee, 2001), Algorithm Aversion & Appreciation (Logg, Minson & Moore, 2019)",
        "target_major": "Pendidikan, Teknologi Pendidikan, Informatika",
        "research_persona": "peneliti pendidikan dengan spesialisasi penerimaan kecerdasan buatan dalam pembelajaran",
        "focus": "menganalisis penerimaan dan antusiasme terhadap AI, persepsi manfaat dan akurasi, kekhawatiran integritas akademik, kepercayaan pada rekomendasi AI, serta harapan peran dosen",
        "indicators": [
            {"name": "Penerimaan & Antusiasme terhadap AI", "desc": "sikap positif dan antusias pada penggunaan AI dalam belajar"},
            {"name": "Persepsi Manfaat & Akurasi AI", "desc": "penilaian kebergunaan dan ketepatan jawaban/fitur AI"},
            {"name": "Kekhawatiran (Dependensi & Kejujuran Akademik)", "desc": "cemas terhadap plagiat, kemalasan, atau ketergantungan pada AI"},
            {"name": "Kepercayaan pada Rekomendasi AI", "desc": "sejauh mana saran AI dipercaya dibanding sumber lain"},
            {"name": "Harapan Peran Dosen & Manusia", "desc": "ekspektasi peran pendidik di tengah kehadiran AI"}
        ]
    },

    # ============ HUKUM ============
    "kesadaran_hukum": {
        "id": "kesadaran_hukum",
        "title": "Kesadaran Hukum Masyarakat (Legal Consciousness)",
        "short_title": "Kesadaran Hukum",
        "icon": "BookOpen",
        "description": "Menganalisis pengetahuan hukum, sikap terhadap hukum, dan panggilan sosialisasi hukum yang terekspresikan warganet dalam suatu isu.",
        "theory": "Legal Consciousness (Ewick & Silbey, 1998), Legal Culture (Friedman, 1975)",
        "target_major": "Ilmu Hukum, Sosiologi Hukum, Kriminologi",
        "research_persona": "peneliti hukum dengan spesialisasi kesadaran dan budaya hukum masyarakat",
        "focus": "menganalisis pengetahuan hukum warganet, sikap terhadap hukum (hormat, sinis, acuh), persepsi kepatuhan, serta seruan sosialisasi hukum",
        "indicators": [
            {"name": "Pengetahuan & Literasi Hukum", "desc": "kutipan pasal, penjelasan aturan, atau kesalahan pemahaman hukum"},
            {"name": "Sikap terhadap Hukum", "desc": "menghormati, sinis, mengabaikan, atau menantang hukum"},
            {"name": "Persepsi Kepatuhan Masyarakat", "desc": "penilaian seberapa patuh masyarakat terhadap aturan"},
            {"name": "Panggilan Sosialisasi & Edukasi Hukum", "desc": "seruan sosialisasi, edukasi hukum, atau penindakan"},
            {"name": "Keluhan Rendahnya Kesadaran Hukum", "desc": "kekesalan terhadap masyarakat yang minim literasi hukum"}
        ]
    },
    "persepsi_keadilan": {
        "id": "persepsi_keadilan",
        "title": "Persepsi Publik terhadap Keadilan (Perceived Justice & Procedural Justice)",
        "short_title": "Persepsi Keadilan",
        "icon": "Scale",
        "description": "Menganalisis penilaian publik atas keadilan proses hukum, kesetaraan di hadapan hukum, dan kepuasan terhadap putusan atau tindakan aparat.",
        "theory": "Procedural Justice (Tyler, 1990), Distributive Justice (Rawls, 1971)",
        "target_major": "Ilmu Hukum, Kriminologi, Ilmu Pemerintahan",
        "research_persona": "peneliti hukum dengan spesialisasi persepsi keadilan prosedural dan distributif",
        "focus": "menganalisis persepsi keadilan proses hukum, kesetaraan di hadapan hukum, kepuasan terhadap putusan, simpati pada pihak perkara, dan tuntutan transparansi",
        "indicators": [
            {"name": "Persepsi Keadilan Proses Hukum", "desc": "penilaian apakah proses hukum berjalan adil dan sesuai prosedur"},
            {"name": "Kesetaraan di Hadapan Hukum", "desc": "perbandingan perlakuan orang kuat vs orang kecil (basah-berlaku vs tegak)"},
            {"name": "Kepuasan terhadap Putusan", "desc": "puas, kecewa, atau menolak hasil putusan/tindakan aparat"},
            {"name": "Simpati/Antipati pada Pihak Perkara", "desc": "pembelaan terhadap korban/terdakwa atau kecaman terhadap mereka"},
            {"name": "Tuntutan Transparansi Proses", "desc": "seruan keterbukaan alur perkara dan alasan putusan"}
        ]
    },
    "opini_regulasi": {
        "id": "opini_regulasi",
        "title": "Opini Publik terhadap Regulasi (Public Opinion on Regulation)",
        "short_title": "Opini Regulasi",
        "icon": "Megaphone",
        "description": "Menganalisis opini warganet atas aturan/kebijakan hukum: dukungan, penolakan, persepsi urgensi, dampak yang dirasakan, dan tuntutan partisipasi.",
        "theory": "Public Opinion (Price, 1992), Spiral of Silence (Noelle-Neumann, 1974)",
        "target_major": "Ilmu Hukum, Ilmu Politik, Kebijakan Publik",
        "research_persona": "peneliti hukum dengan spesialisasi opini publik terhadap regulasi",
        "focus": "menganalisis dukungan dan penolakan regulasi, persepsi urgensi aturan, dampak ekonomi-sosial yang dirasakan, serta tuntutan revisi dan partisipasi publik",
        "indicators": [
            {"name": "Dukungan terhadap Regulasi", "desc": "persetujuan dan apresiasi atas aturan yang dibahas"},
            {"name": "Penolakan & Kritik Regulasi", "desc": "penolakan, kritik substansi, atau ejekan terhadap aturan"},
            {"name": "Persepsi Urgensi Aturan Baru/Revisi", "desc": "tuntutan regulasi baru, revisi, atau pencabutan"},
            {"name": "Persepsi Dampak Ekonomi-Sosial", "desc": "perkiraan dampak aturan pada kehidupan sehari-hari"},
            {"name": "Tuntutan Partisipasi Publik", "desc": "seruan uji materi, audiensi publik, atau libatkan masyarakat"}
        ]
    },
    "kepercayaan_penegakan": {
        "id": "kepercayaan_penegakan",
        "title": "Kepercayaan Masyarakat terhadap Penegakan Hukum (Institutional Trust & Legal Legitimacy)",
        "short_title": "Kepercayaan Penegakan",
        "icon": "ShieldCheck",
        "description": "Mengukur kepercayaan publik pada aparat dan institusi penegak hukum: transparansi, persepsi korupsi, apresiasi, dan tuntutan reformasi.",
        "theory": "Trust and Power (Luhmann, 1979), Police & Legal Legitimacy (Tyler, 2004)",
        "target_major": "Ilmu Hukum, Kriminologi, Ilmu Pemerintahan",
        "research_persona": "peneliti hukum dengan spesialisasi legitimasi dan kepercayaan pada institusi penegak hukum",
        "focus": "menganalisis kepercayaan pada aparat/instansi, persepsi transparansi dan akuntabilitas, persepsi korupsi dan pilih kasih, pujian, serta tuntutan reformasi",
        "indicators": [
            {"name": "Kepercayaan pada Aparat/Instansi", "desc": "ekspresi percaya atau tidak percaya pada polisi, jaksa, hakim, dsb"},
            {"name": "Persepsi Transparansi & Akuntabilitas", "desc": "penilaian keterbukaan proses dan pertanggungjawaban"},
            {"name": "Persepsi Korupsi & Pilih Kasih", "desc": "dugaan suap, intervensi, atau hukum hanya berlaku untuk rakyat kecil"},
            {"name": "Pujian & Apresiasi Penegakan", "desc": "apresiasi atas tindakan cepat, tegas, dan adil"},
            {"name": "Tuntutan Reformasi Penegakan Hukum", "desc": "seruan perbaikan sistem, mutasi pejabat, atau pengawasan"}
        ]
    },

    # ============ KESEHATAN MASYARAKAT ============
    "persepsi_risiko_kesehatan": {
        "id": "persepsi_risiko_kesehatan",
        "title": "Persepsi Risiko Kesehatan (Health Risk Perception)",
        "short_title": "Persepsi Risiko Kesehatan",
        "icon": "Stethoscope",
        "description": "Menganalisis persepsi warganet atas risiko kesehatan: kerentanan, keparahan, manfaat tindakan, hambatan, dan efikasi diri.",
        "theory": "Risk Perception (Slovic, 1987), Health Belief Model (Rosenstock, 1974)",
        "target_major": "Kesehatan Masyarakat, Ilmu Keperawatan, Gizi",
        "research_persona": "peneliti kesehatan masyarakat dengan spesialisasi persepsi risiko kesehatan",
        "focus": "menganalisis persepsi kerentanan dan keparahan risiko kesehatan, persepsi manfaat tindakan, hambatan perilaku, dan efikasi diri warganet",
        "indicators": [
            {"name": "Persepsi Kerentanan (Susceptibility)", "desc": "perkiraan seberapa mungkin dirinya/kelompoknya terkena"},
            {"name": "Persepsi Keparahan (Severity)", "desc": "penilaian betapa serius dampaknya bagi kesehatan"},
            {"name": "Persepsi Manfaat Tindakan", "desc": "keyakinan bahwa tindakan pencegahan berguna"},
            {"name": "Persepsi Hambatan (Barriers)", "desc": "kendala biaya, akses, kebiasaan, atau informasi"},
            {"name": "Efikasi Diri (Self-Efficacy)", "desc": "keyakinan mampu melakukan tindakan pencegahan"}
        ]
    },
    "komunikasi_kesehatan_digital": {
        "id": "komunikasi_kesehatan_digital",
        "title": "Komunikasi Kesehatan Digital (Digital Health Communication & eHealth Literacy)",
        "short_title": "Komunikasi Kesehatan",
        "icon": "Activity",
        "description": "Menganalisis praktik berbagi informasi kesehatan digital: kredibilitas sumber, literasi kesehatan digital, respons pesan ancaman, dan solidaritas.",
        "theory": "eHealth Literacy Scale (Norman & Skinner, 2006), Extended Parallel Process Model (Witte, 1992)",
        "target_major": "Kesehatan Masyarakat, Ilmu Komunikasi, Promosi Kesehatan",
        "research_persona": "peneliti kesehatan masyarakat dengan spesialisasi komunikasi kesehatan digital",
        "focus": "menganalisis perilaku berbagi informasi kesehatan, evaluasi kredibilitas sumber, literasi kesehatan digital, respons pesan fear appeal, dan dukungan emosional",
        "indicators": [
            {"name": "Berbagi Informasi Kesehatan", "desc": "komentar yang membagikan tips, pengalaman, atau informasi kesehatan"},
            {"name": "Evaluasi Kredibilitas Sumber", "desc": "memvalidasi sumber: dokter, penelitian, atau sekadar hoaks"},
            {"name": "Literasi Kesehatan Digital", "desc": "kemampuan mencari, memahami, dan menerapkan info kesehatan daring"},
            {"name": "Respons Pesan Ancaman (Fear Appeal)", "desc": "reaksi terhadap pesan menakutkan: paham, panik, atau sebaliknya"},
            {"name": "Dukungan Emosional & Solidaritas", "desc": "doa, semangat, dan pengalaman saling berbagi"}
        ]
    },
    "respons_kampanye_kesehatan": {
        "id": "respons_kampanye_kesehatan",
        "title": "Respons Publik terhadap Kampanye Kesehatan (Public Response to Health Campaigns)",
        "short_title": "Respons Kampanye",
        "icon": "Megaphone",
        "description": "Menganalisis respons warganet terhadap kampanye kesehatan: dukungan, kepatuhan pesan, skeptisisme, debat efektivitas, dan mobilisasi kolektif.",
        "theory": "Elaboration Likelihood Model (Petty & Cacioppo, 1986), Health Belief Model (Rosenstock, 1974)",
        "target_major": "Kesehatan Masyarakat, Promosi Kesehatan, Ilmu Komunikasi",
        "research_persona": "peneliti kesehatan masyarakat dengan spesialisasi evaluasi kampanye kesehatan",
        "focus": "menganalisis dukungan terhadap kampanye kesehatan, kepatuhan pada pesan anjuran, skeptisisme, debat efektivitas, dan mobilisasi kolektif",
        "indicators": [
            {"name": "Dukungan terhadap Kampanye", "desc": "apresiasi dan dukungan terhadap pesan kampanye"},
            {"name": "Kepatuhan pada Pesan Anjuran", "desc": "ekspresi mengikuti anjuran: vaksin, cuci tangan, cek kesehatan, dll"},
            {"name": "Skeptis & Resistensi Pesan", "desc": "keraguan, teori konspirasi, atau penolakan pesan kampanye"},
            {"name": "Debat Efektivitas Kampanye", "desc": "perdebatan apakah kampanye efektif atau hanya formalitas"},
            {"name": "Mobilisasi Kolektif & Penyebaran", "desc": "ajakan kolektif mematuhi dan menyebarluaskan pesan"}
        ]
    },
    "perilaku_pencegahan": {
        "id": "perilaku_pencegahan",
        "title": "Perilaku Pencegahan & Kesadaran Kesehatan (Preventive Behaviour & Health Awareness)",
        "short_title": "Perilaku Pencegahan",
        "icon": "HeartPulse",
        "description": "Menganalisis niat dan praktik pencegahan, adopsi pola hidup sehat, kesadaran gejala, serta penolakan misinformasi kesehatan.",
        "theory": "Theory of Planned Behavior (Ajzen, 1991), Transtheoretical Model (Prochaska & DiClemente, 1983)",
        "target_major": "Kesehatan Masyarakat, Ilmu Gizi, Keperawatan",
        "research_persona": "peneliti kesehatan masyarakat dengan spesialisasi perilaku pencegahan",
        "focus": "menganalisis niat dan praktik pencegahan, kesadaran gejala, adopsi pola hidup sehat, penolakan misinformasi, dan norma kesehatan masyarakat",
        "indicators": [
            {"name": "Niat & Praktik Pencegahan", "desc": "ekspresi berniat atau sudah menerapkan tindakan pencegahan"},
            {"name": "Kesadaran Gejala & Pentingnya Cek", "desc": "penyadaran gejala dan ajakan memeriksakan diri"},
            {"name": "Adopsi Pola Hidup Sehat", "desc": "praktik olahraga, gizi, tidur, kebersihan, dan lainnya"},
            {"name": "Penolakan Misinformasi", "desc": "meluruskan hoaks atau pseudoscience kesehatan"},
            {"name": "Norma Kesehatan Masyarakat", "desc": "referensi pada kebiasaan sehat lingkungan/sekolah/keluarga"}
        ]
    },

    # ============ SISTEM INFORMASI & INFORMATIKA ============
    "penerimaan_teknologi_digital": {
        "id": "penerimaan_teknologi_digital",
        "title": "Penerimaan Teknologi Digital (Technology Acceptance & Diffusion of Innovation)",
        "short_title": "Penerimaan Teknologi",
        "icon": "Cpu",
        "description": "Menganalisis penerimaan warganet terhadap teknologi/fitur digital: persepsi kegunaan, kemudahan, niat adopsi, faktor pendukung, dan resistensi.",
        "theory": "Technology Acceptance Model (Davis, 1989), UTAUT (Venkatesh et al., 2003), Diffusion of Innovations (Rogers, 1962)",
        "target_major": "Sistem Informasi, Informatika, Teknologi Informasi",
        "research_persona": "peneliti sistem informasi dengan spesialisasi adopsi dan difusi teknologi digital",
        "focus": "menganalisis persepsi kegunaan dan kemudahan teknologi digital, niat adopsi, kondisi yang memfasilitasi, serta resistensi dan kekhawatiran pengguna",
        "indicators": [
            {"name": "Persepsi Kegunaan (Perceived Usefulness)", "desc": "penilaian manfaat teknologi bagi pekerjaan/kehidupan"},
            {"name": "Persepsi Kemudahan (Perceived Ease of Use)", "desc": "penilaian kemudahan penggunaan teknologi"},
            {"name": "Niat Adopsi Teknologi", "desc": "ekspresi berniat memakai atau beralih ke teknologi baru"},
            {"name": "Faktor Fasilitasi & Kondisi Pendukung", "desc": "dukungan infrastruktur, biaya, komunitas, atau pelatihan"},
            {"name": "Resistensi & Kekhawatiran Teknologi", "desc": "keraguan, kekhawatiran keamanan, atau kenyamanan cara lama"}
        ]
    },
    "persepsi_ai": {
        "id": "persepsi_ai",
        "title": "Persepsi Pengguna terhadap AI (User Perception of AI & Trust in Automation)",
        "short_title": "Persepsi Pengguna AI",
        "icon": "Bot",
        "description": "Menganalisis kepercayaan pengguna pada AI: persepsi akurasi, kenyamanan interaksi manusia-AI, kekhawatiran penggantian manusia, dan penerimaan fitur AI.",
        "theory": "Trust in Automation (Lee & See, 2004), Uncanny Valley (Mori, 1970)",
        "target_major": "Sistem Informasi, Informatika, Human-Computer Interaction",
        "research_persona": "peneliti sistem informasi dengan spesialisasi persepsi dan kepercayaan pada kecerdasan buatan",
        "focus": "menganalisis kepercayaan pada output AI, persepsi akurasi, kenyamanan interaksi manusia-AI, kekhawatiran penggantian manusia, dan penerimaan fitur AI",
        "indicators": [
            {"name": "Kepercayaan pada Output AI", "desc": "sejauh mana hasil AI dipercaya atau diragukan"},
            {"name": "Persepsi Akurasi & Kemampuan AI", "desc": "penilaian ketepatan, kecepatan, dan kemampuan AI"},
            {"name": "Kenyamanan Interaksi Manusia-AI", "desc": "rasa nyaman, kagum, atau janggal (uncanny) berinteraksi"},
            {"name": "Kekhawatiran Penggantian Manusia", "desc": "cemas AI merebut pekerjaan atau menghilangkan peran manusia"},
            {"name": "Penerimaan Fitur/Produk Berbasis AI", "desc": "sikap pada fitur AI baru: tertarik, netral, atau menolak"}
        ]
    },
    "ux_kepuasan": {
        "id": "ux_kepuasan",
        "title": "Kepuasan & Pengalaman Pengguna (User Satisfaction & Experience)",
        "short_title": "Kepuasan & UX",
        "icon": "Smile",
        "description": "Mengukur kepuasan dan pengalaman pengguna sebuah aplikasi/platform: usability, pengalaman estetis-hedonis, keluhan, dan niat terus menggunakan.",
        "theory": "Expectation-Confirmation Theory (Bhattacherjee, 2001), Pragmatic & Hedonic UX (Hassenzahl, 2003)",
        "target_major": "Sistem Informasi, Informatika, Desain Interaksi",
        "research_persona": "peneliti sistem informasi dengan spesialisasi kepuasan dan pengalaman pengguna",
        "focus": "menganalisis kepuasan pengguna, persepsi usability, pengalaman estetis dan hedonis, keluhan pengalaman, dan niat penggunaan berkelanjutan",
        "indicators": [
            {"name": "Kepuasan Pengguna", "desc": "ekspresi puas atau kecewa terhadap aplikasi/platform"},
            {"name": "Persepsi Usability", "desc": "penilaian mudah dipakai, cepat, dan tidak membingungkan"},
            {"name": "Pengalaman Estetis & Hedonis", "desc": "kesan tampilan, kesenangan, dan identitas pengguna"},
            {"name": "Keluhan & Bug Pengalaman", "desc": "keluhan error, lambat, atau alur yang membingungkan"},
            {"name": "Niat Penggunaan Berkelanjutan", "desc": "niat terus memakai atau beralih ke aplikasi lain"}
        ]
    },
    "keamanan_privasi": {
        "id": "keamanan_privasi",
        "title": "Kepercayaan, Keamanan & Privasi Digital (Digital Trust, Security & Privacy)",
        "short_title": "Keamanan & Privasi",
        "icon": "Lock",
        "description": "Menganalisis kekhawatiran privasi, kepercayaan pada platform, persepsi keamanan, perilaku berbagi data pribadi, dan tuntutan perlindungan digital.",
        "theory": "Privacy Calculus (Culnan & Armstrong, 1999), Trust in Technology (McKnight et al., 2002), Privacy Paradox (Barnes, 2006)",
        "target_major": "Sistem Informasi, Informatika, Keamanan Siber",
        "research_persona": "peneliti sistem informasi dengan spesialisasi keamanan, privasi, dan kepercayaan digital",
        "focus": "menganalisis kekhawatiran privasi data, kepercayaan pada platform, persepsi keamanan sistem, perilaku berbagi informasi pribadi, dan tuntutan perlindungan regulasi",
        "indicators": [
            {"name": "Kekhawatiran Privasi Data", "desc": "cemas data pribadi disalahgunakan, dijual, atau bocor"},
            {"name": "Kepercayaan pada Platform", "desc": "penilaian seberapa layak dipercaya layanan/aplikasi"},
            {"name": "Persepsi Keamanan Sistem", "desc": "penilaian keamanan akun, transaksi, dan enkripsi"},
            {"name": "Perilaku Berbagi Informasi Pribadi", "desc": "semangat berbagi data pribadi meski tahu risikonya (privacy paradox)"},
            {"name": "Tuntutan Perlindungan & Regulasi", "desc": "seruan aturan perlindungan data dan penegakan hukum digital"}
        ]
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

def call_clario_llm(prompt: str, preferred_model: str = "clario/gemini-3.7-flash", system_instruction: str = None) -> tuple[str, str]:
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {API_KEY}"
    }

    models_to_try = [
        "clario/gemini-3.7-flash",
        "clario/deepseek-v4-flash",
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

def call_llm(prompt: str, preferred_model: str = "clario/gemini-3.7-flash", system_instruction: str = None) -> tuple[str, str]:
    """Menggunakan Clario Gemini 3.7 Flash untuk pemrosesan AI."""
    return call_clario_llm(prompt, preferred_model="clario/gemini-3.7-flash", system_instruction=system_instruction)

def _format_indicator_list(indicators):
    lines = []
    for i, ind in enumerate(indicators, 1):
        lines.append(f"   {i}. {ind['name']} — {ind['desc']}")
    return "\n".join(lines)


def build_generic_framework_prompt(fw: dict, caption: str, formatted_comments: str, count: int) -> tuple[str, str]:
    """Prompt generik berbasis data untuk kerangka bidang penelitian tambahan.

    Setiap kerangka mendefinisikan `research_persona`, `focus`, dan `indicators`
    (dimensi analisis teori-spesifik), sehingga skema output tetap seragam untuk
    frontend namun klasifikasi isinya mengikuti karakteristik teori masing-masing.
    """
    indicators_block = _format_indicator_list(fw["indicators"])
    sys_inst = (
        f"Anda adalah asisten peneliti ahli {fw['research_persona']}. "
        f"Tugas Anda menganalisis dataset komentar media sosial untuk penelitian skripsi/tugas akhir "
        f"bidang {fw['target_major']} menggunakan sudut pandang: {fw['title']}. "
        "Klasifikasikan komentar SESUAI dengan indikator/dimensi analisis yang diberikan, bukan dengan indikator generik. "
        "WAJIB memberikan output dalam format JSON murni yang valid tanpa teks pembuka/penutup."
    )
    prompt = f"""Analisis dataset komentar media sosial berikut dari perspektif {fw['title']} untuk skripsi:

CAPTION KONTEN:
\"\"\"{caption}\"\"\"

SAMPEL KOMENTAR ({count} komentar):
\"\"\"{formatted_comments}\"\"\"

LANDASAN TEORI:
{fw['theory']}

FOKUS KAJIAN:
{fw['focus']}

KLASIFIKASIKAN komentar ke dalam indikator/dimensi analisis berikut (klasifikasi tiap komentar wajib memakai salah satu indikator ini):
{indicators_block}

Kembalikan HANYA format JSON valid berikut (semua persen harus angka bulat 0-100, jumlah persen indikator 100):

{{
  "context_summary": {{
    "research_object": "Objek/fenomena yang dianalisis dalam konten dan komentar",
    "main_topic": "Topik diskusi dominan di antara warganet",
    "analysis_note": "Catatan kontekstual penting yang relevan dengan landasan teori"
  }},
  "sentiment_distribution": {{
    "positive_pct": 30,
    "neutral_pct": 25,
    "negative_pct": 45,
    "dominant_sentiment": "Positif / Netral / Negatif",
    "sentiment_summary": "Rangkuman sentimen warganet terhadap konten"
  }},
  "indicator_analysis": {{
    "dominant_indicator": "Nama indikator yang paling dominan",
    "dominant_explanation": "Uraian mengapa indikator tersebut mendominasi menurut perspektif teori",
    "indicators": [
      {{
        "name": "Nama Indikator 1 (WAJIB sama dengan daftar indikator di atas)",
        "description": "Uraian bagaimana indikator ini muncul dan apa maknanya menurut teori",
        "pct": 40,
        "sample_quote": "Kutipan komentar representatif dari sampel"
      }},
      {{
        "name": "Nama Indikator 2",
        "description": "Uraian indikator",
        "pct": 30,
        "sample_quote": "Kutipan representatif"
      }},
      {{
        "name": "Nama Indikator N (uraikan SEMUA indikator yang diberikan)",
        "description": "Uraian indikator",
        "pct": 5,
        "sample_quote": "Kutipan representatif"
      }}
    ]
  }},
  "stance_dynamics": {{
    "side_a_name": "Kubu A yang relevan dengan topik (sebutkan perannya)",
    "side_a_pct": 40,
    "side_b_name": "Kubu B yang relevan dengan topik (sebutkan perannya)",
    "side_b_pct": 45,
    "neutral_pct": 15,
    "controversy_level": "Rendah / Sedang / Tinggi",
    "polarization_summary": "Uraian dinamika dua kubu dalam kolom komentar"
  }},
  "topic_clusters": [
    {{
      "topic_name": "Klaster Topik 1 yang relevan dengan fokus kajian",
      "pct": 40,
      "description": "Uraian pembicaraan warganet pada topik ini",
      "sample_quote": "Kutipan komentar representatif dari sampel"
    }},
    {{
      "topic_name": "Klaster Topik 2",
      "pct": 35,
      "description": "Uraian pembicaraan warganet pada topik ini",
      "sample_quote": "Kutipan representatif"
    }},
    {{
      "topic_name": "Klaster Topik 3",
      "pct": 25,
      "description": "Uraian pembicaraan warganet pada topik ini",
      "sample_quote": "Kutipan representatif"
    }}
  ],
  "academic_insights": {{
    "key_findings": [
      "Temuan empiris 1 untuk skripsi sesuai perspektif teori",
      "Temuan empiris 2 untuk skripsi",
      "Temuan empiris 3 untuk skripsi"
    ],
    "theoretical_relevance": "Kaitan temuan dengan landasan teori: {fw['theory']}",
    "thesis_summary_paragraph": "Paragraf ringkasan kesimpulan akademik komprehensif yang siap disalin untuk Bab 4 Skripsi."
  }}
}}
"""
    return prompt, sys_inst


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

    # 6. ANALISIS FRAMING ROBERT ENTMAN (KHUSUS TESIS S2 ILMU KOMUNIKASI)
    elif analysis_type == "entman_framing":
        sys_inst = (
            "Anda adalah pakar analisis teks dan wacana media untuk penelitian tesis jenjang Magister (S2) Ilmu Komunikasi. "
            "Tugas Anda menganalisis dataset komentar warganet menggunakan model framing Robert Entman (1993) "
            "dengan 4 dimensi inti: define problems, diagnose causes, make moral judgments, dan suggest remedies. "
            "WAJIB memberikan output dalam format JSON murni yang valid tanpa teks pembuka/penutup."
        )
        prompt = f"""Lakukan Analisis Framing Robert Entman (1993) pada dataset komentar penonton video media sosial berikut untuk penulisan tesis S2 Ilmu Komunikasi:

CAPTION KONTEN:
\"\"\"{caption}\"\"\"

SAMPEL KOMENTAR ({count} komentar):
\"\"\"{formatted_comments}\"\"\"

Analisis bagaimana publik mengkonstruksi realitas melalui 4 elemen pembingkaian Entman dan kembalikan HANYA format JSON valid berikut (semua persen harus angka bulat 0-100):

{{
  "framing_overview": {{
    "central_issue": "Isu atau peristiwa utama yang menjadi objek pembingkaian publik",
    "dominant_frame_name": "Nama Frame Dominan (misal: Frame Pelanggaran Etika & Akuntabilitas / Frame Korban vs Pelaku / Frame Teatrikal Drama)",
    "framing_intensity": "Sangat Kuat / Terbelah Polarisasi / Terfragmentasi",
    "framing_summary": "Penjelasan komprehensif bagaimana warganet membingkai realitas peristiwa"
  }},
  "entman_dimensions": {{
    "define_problems": {{
      "dimension_name": "Define Problems (Mendefinisikan Masalah)",
      "explanation": "Uraian bagaimana warganet mengidentifikasi apa yang menjadi masalah utama",
      "dominant_definition": "Definisi masalah paling dominan",
      "problem_aspects": [
        {{"aspect": "Aspek masalah utama 1", "pct": 60, "sample_quote": "Kutipan representatif warganet"}},
        {{"aspect": "Aspek masalah utama 2", "pct": 40, "sample_quote": "Kutipan representatif warganet"}}
      ]
    }},
    "diagnose_causes": {{
      "dimension_name": "Diagnose Causes (Mendiagnosis Penyebab & Aktor)",
      "explanation": "Uraian pihak, faktor, atau aktor yang diatribusikan sebagai biang masalah",
      "primary_culprit": "Aktor atau faktor utama yang dituding/disalahkan",
      "cause_attributions": [
        {{"cause": "Faktor penyebab/aktor 1", "pct": 55, "sample_quote": "Kutipan representatif warganet"}},
        {{"cause": "Faktor penyebab/aktor 2", "pct": 45, "sample_quote": "Kutipan representatif warganet"}}
      ]
    }},
    "make_moral_judgments": {{
      "dimension_name": "Make Moral Judgments (Membuat Penilaian Moral)",
      "explanation": "Penilaian etika dan nilai moral yang dilontarkan audiens terhadap tindakan para aktor",
      "moral_verdict": "Kecaman Keras / Simpati & Iba / Skeptisisme Moral / Terbelah",
      "moral_evaluations": [
        {{"judgment": "Penilaian etis 1", "pct": 65, "sample_quote": "Kutipan representatif warganet"}},
        {{"judgment": "Penilaian etis 2", "pct": 35, "sample_quote": "Kutipan representatif warganet"}}
      ]
    }},
    "suggest_remedies": {{
      "dimension_name": "Suggest Remedies (Menekankan Solusi & Tuntutan)",
      "explanation": "Rekomendasi tindakan, tuntutan, sanksi, atau solusi yang diinginkan warganet",
      "dominant_remedy": "Tuntutan atau solusi paling disuarakan",
      "remedy_proposals": [
        {{"proposal": "Tuntutan/solusi 1", "pct": 50, "sample_quote": "Kutipan representatif warganet"}},
        {{"proposal": "Tuntutan/solusi 2", "pct": 30, "sample_quote": "Kutipan representatif warganet"}},
        {{"proposal": "Tuntutan/solusi 3", "pct": 20, "sample_quote": "Kutipan representatif warganet"}}
      ]
    }}
  }},
  "counter_frames": {{
    "has_counter_frame": true,
    "counter_frame_name": "Nama Frame Tandingan (Pembelaan/Alternatif)",
    "counter_frame_pct": 25,
    "counter_frame_argument": "Uraian bagaimana kubu tandingan mencoba merebut narasi di kolom komentar"
  }},
  "stance_dynamics": {{
    "side_a_name": "Kubu Frame Dominan",
    "side_a_pct": 65,
    "side_b_name": "Kubu Frame Alternatif / Tandingan",
    "side_b_pct": 25,
    "neutral_pct": 10,
    "controversy_level": "Tinggi",
    "polarization_summary": "Pertarungan wacana antara frame dominan vs frame tandingan"
  }},
  "academic_insights": {{
    "key_findings": [
      "Temuan empiris 1 untuk Bab 4 Tesis S2",
      "Temuan empiris 2 untuk Bab 4 Tesis S2",
      "Temuan empiris 3 untuk Bab 4 Tesis S2"
    ],
    "theoretical_relevance": "Kaitan temuan dengan teori Entman (1993), Framing Effects, dan Konstruksionisme Sosial",
    "thesis_summary_paragraph": "Paragraf pembahasan Bab 4 Tesis S2 yang mendalam, komprehensif, dan siap salin."
  }}
}}
"""
        return prompt, sys_inst

    # 7. KOMUNIKASI POLITIK & POLARISASI OPINI
    elif analysis_type == "political_communication":
        sys_inst = (
            "Anda adalah asisten peneliti ahli komunikasi politik, opini publik, dan polarisasi media sosial. "
            "Tugas Anda menganalisis dataset komentar warganet untuk penelitian skripsi/tugas akhir bidang Ilmu Komunikasi dan Ilmu Politik. "
            "WAJIB memberikan output dalam format JSON murni yang valid tanpa teks pembuka/penutup."
        )
        prompt = f"""Analisis dataset komentar berikut dari perspektif Komunikasi Politik & Polarisasi Opini untuk skripsi:

CAPTION KONTEN:
\"\"\"{caption}\"\"\"

SAMPEL KOMENTAR ({count} komentar):
\"\"\"{formatted_comments}\"\"\"

Kembalikan HANYA format JSON valid berikut (semua persen harus angka bulat 0-100):

{{
  "context_summary": {{
    "political_issue": "Isu politik, figur, atau kebijakan yang menjadi fokus perdebatan",
    "polarization_level": "Rendah / Sedang / Sangat Tinggi & Mengakar",
    "dominant_narrative": "Narasi politik yang paling vokal mengemuka di kolom komentar"
  }},
  "political_metrics": {{
    "pro_stance_pct": 40,
    "contra_stance_pct": 45,
    "neutral_skeptical_pct": 15,
    "dominant_stance": "Kubu Kontra / Kubu Pro / Skeptis Golput",
    "echo_chamber_intensity": "Tinggi (Saling Menguatkan Bias) / Terbuka Dialog"
  }},
  "stance_dynamics": {{
    "side_a_name": "Kubu Pro / Pembela Narasi",
    "side_a_pct": 40,
    "side_b_name": "Kubu Kontra / Penentang Narasi",
    "side_b_pct": 45,
    "neutral_pct": 15,
    "controversy_level": "Tinggi",
    "polarization_summary": "Bagaimana dinamika polarisasi kubu politik dan framing partisan berlangsung"
  }},
  "topic_clusters": [
    {{
      "topic_name": "Tema Debat Partisan 1",
      "pct": 40,
      "description": "Fokus argumen warganet pada topik ini",
      "sample_quote": "Kutipan representatif warganet"
    }},
    {{
      "topic_name": "Tema Debat Partisan 2",
      "pct": 35,
      "description": "Fokus argumen warganet pada topik ini",
      "sample_quote": "Kutipan representatif warganet"
    }},
    {{
      "topic_name": "Tema Debat Partisan 3",
      "pct": 25,
      "description": "Fokus argumen warganet pada topik ini",
      "sample_quote": "Kutipan representatif warganet"
    }}
  ],
  "academic_insights": {{
    "key_findings": [
      "Temuan empiris polarisasi politik 1 untuk skripsi",
      "Temuan empiris polarisasi politik 2 untuk skripsi",
      "Temuan empiris polarisasi politik 3 untuk skripsi"
    ],
    "theoretical_relevance": "Kaitan temuan dengan teori Selective Exposure, Echo Chamber, dan Spiral of Silence",
    "thesis_summary_paragraph": "Paragraf kesimpulan akademik komprehensif yang siap disalin untuk Bab 4 Skripsi."
  }}
}}
"""
        return prompt, sys_inst

    # 8. RESEPSI KHALAYAK (STUART HALL)
    elif analysis_type == "audience_reception":
        sys_inst = (
            "Anda adalah asisten peneliti ahli analisis resepsi khalayak (Audience Reception Studies) dan teori kultural Stuart Hall. "
            "Tugas Anda mengklasifikasikan pemaknaan penonton ke dalam 3 posisi pembacaan Stuart Hall (1973). "
            "WAJIB memberikan output dalam format JSON murni yang valid tanpa teks pembuka/penutup."
        )
        prompt = f"""Analisis dataset komentar berikut menggunakan Model Resepsi Khalayak Stuart Hall (Encoding/Decoding) untuk skripsi:

CAPTION KONTEN:
\"\"\"{caption}\"\"\"

SAMPEL KOMENTAR ({count} komentar):
\"\"\"{formatted_comments}\"\"\"

Kembalikan HANYA format JSON valid berikut (semua persen harus angka bulat 0-100):

{{
  "context_summary": {{
    "encoded_message": "Pesan atau nilai yang di-encode oleh pembuat konten",
    "dominant_reception_trend": "Kecenderungan pemaknaan umum khalayak terhadap video",
    "cultural_context": "Konteks sosial-budaya penonton yang memengaruhi pemaknaan"
  }},
  "hall_reception_positions": {{
    "dominant_hegemonic_pct": 45,
    "negotiated_pct": 30,
    "oppositional_pct": 25,
    "dominant_position": "Posisi Dominan-Hegemonik / Posisi Negosiasi / Posisi Oposisional",
    "reception_verdict": "Khalayak Cenderung Menerima / Menolak Pesan Dominan"
  }},
  "stance_dynamics": {{
    "side_a_name": "Pembacaan Menerima (Dominan)",
    "side_a_pct": 45,
    "side_b_name": "Pembacaan Menolak (Oposisional)",
    "side_b_pct": 25,
    "neutral_pct": 30,
    "controversy_level": "Sedang",
    "polarization_summary": "Pertarungan pemaknaan antara khalayak yang sepakat vs yang mendekonstruksi pesan"
  }},
  "topic_clusters": [
    {{
      "topic_name": "Pola Pemaknaan Khalayak 1",
      "pct": 45,
      "description": "Bagaimana penonton menafsirkan isi konten",
      "sample_quote": "Kutipan komentar representatif dari sampel"
    }},
    {{
      "topic_name": "Pola Pemaknaan Khalayak 2",
      "pct": 35,
      "description": "Bagaimana penonton menafsirkan isi konten",
      "sample_quote": "Kutipan komentar representatif dari sampel"
    }},
    {{
      "topic_name": "Pola Pemaknaan Khalayak 3",
      "pct": 20,
      "description": "Bagaimana penonton menafsirkan isi konten",
      "sample_quote": "Kutipan komentar representatif dari sampel"
    }}
  ],
  "academic_insights": {{
    "key_findings": [
      "Temuan empiris dekoding pesan 1 untuk skripsi",
      "Temuan empiris dekoding pesan 2 untuk skripsi",
      "Temuan empiris dekoding pesan 3 untuk skripsi"
    ],
    "theoretical_relevance": "Kaitan temuan dengan Encoding/Decoding Stuart Hall (1973) dan Active Audience Theory",
    "thesis_summary_paragraph": "Paragraf kesimpulan akademik komprehensif yang siap disalin untuk Bab 4 Skripsi."
  }}
}}
"""
        return prompt, sys_inst

    # 9. BUDAYA DIGITAL & INTERAKSI PARASOSIAL
    elif analysis_type == "parasocial_culture":
        sys_inst = (
            "Anda adalah asisten peneliti ahli budaya digital, interaksi parasosial, dan studi fandom media sosial. "
            "Tugas Anda menganalisis dataset komentar warganet untuk penelitian skripsi/tugas akhir bidang Kajian Media dan Komunikasi Digital. "
            "WAJIB memberikan output dalam format JSON murni yang valid tanpa teks pembuka/penutup."
        )
        prompt = f"""Analisis dataset komentar berikut dari perspektif Interaksi Parasosial & Budaya Fandom untuk skripsi:

CAPTION KONTEN:
\"\"\"{caption}\"\"\"

SAMPEL KOMENTAR ({count} komentar):
\"\"\"{formatted_comments}\"\"\"

Kembalikan HANYA format JSON valid berikut (semua persen harus angka bulat 0-100):

{{
  "context_summary": {{
    "creator_persona": "Persona atau citra yang dibangun kreator/figur publik",
    "parasocial_closeness_level": "Sangat Akrab Semu / Pengagum / Netral / Kritis",
    "fandom_dynamic": "Uraian bagaimana komunitas penggemar merespons konten"
  }},
  "parasocial_metrics": {{
    "parasocial_attachment_pct": 50,
    "fandom_loyalty_pct": 30,
    "critical_detachment_pct": 20,
    "dominant_attachment": "Ikatan Parasosial Afektif (Penuh Kasih & Peduli)",
    "protective_behavior": "Tinggi (Membela Kreator Mati-matian) / Wajar / Tidak Terlihat"
  }},
  "stance_dynamics": {{
    "side_a_name": "Penggemar Setia / Pembela Kreator",
    "side_a_pct": 60,
    "side_b_name": "Pengkritik / Penonton Kasual",
    "side_b_pct": 30,
    "neutral_pct": 10,
    "controversy_level": "Sedang",
    "polarization_summary": "Bagaimana relasi emosional memicu respon afektif dan pembelaan di kolom komentar"
  }},
  "topic_clusters": [
    {{
      "topic_name": "Bentuk Kedekatan Emosional 1",
      "pct": 40,
      "description": "Ungkapan rasa memiliki atau kepedulian pada kreator",
      "sample_quote": "Kutipan representatif warganet"
    }},
    {{
      "topic_name": "Bentuk Kedekatan Emosional 2",
      "pct": 35,
      "description": "Ungkapan rasa memiliki atau kepedulian pada kreator",
      "sample_quote": "Kutipan representatif warganet"
    }},
    {{
      "topic_name": "Bentuk Kedekatan Emosional 3",
      "pct": 25,
      "description": "Ungkapan rasa memiliki atau kepedulian pada kreator",
      "sample_quote": "Kutipan representatif warganet"
    }}
  ],
  "academic_insights": {{
    "key_findings": [
      "Temuan empiris interaksi parasosial 1 untuk skripsi",
      "Temuan empiris interaksi parasosial 2 untuk skripsi",
      "Temuan empiris interaksi parasosial 3 untuk skripsi"
    ],
    "theoretical_relevance": "Kaitan temuan dengan Parasocial Interaction Theory (Horton & Wohl) dan Participatory Culture (Jenkins)",
    "thesis_summary_paragraph": "Paragraf kesimpulan akademik komprehensif yang siap disalin untuk Bab 4 Skripsi."
  }}
}}
"""
        return prompt, sys_inst

    # 10. ASPIRASI WARGA & KEBIJAKAN PUBLIK
    elif analysis_type == "public_policy":
        sys_inst = (
            "Anda adalah asisten peneliti ahli analisis kebijakan publik, akuntabilitas pemerintahan, dan aspirasi masyarakat. "
            "Tugas Anda menganalisis dataset komentar warganet untuk penelitian skripsi/tugas akhir bidang Kebijakan Publik dan Komunikasi Pemerintahan. "
            "WAJIB memberikan output dalam format JSON murni yang valid tanpa teks pembuka/penutup."
        )
        prompt = f"""Analisis dataset komentar berikut dari perspektif Kebijakan Publik & Aspirasi Warga untuk skripsi:

CAPTION KONTEN:
\"\"\"{caption}\"\"\"

SAMPEL KOMENTAR ({count} komentar):
\"\"\"{formatted_comments}\"\"\"

Kembalikan HANYA format JSON valid berikut (semua persen harus angka bulat 0-100):

{{
  "context_summary": {{
    "policy_or_service_issue": "Isu kebijakan pemerintah, regulasi, atau pelayanan publik yang disorot",
    "public_grievance_level": "Tinggi / Sedang / Rendah",
    "trust_in_governance": "Tinggi / Menurun / Krisis Kepercayaan"
  }},
  "policy_sentiment": {{
    "supportive_pct": 20,
    "constructive_criticism_pct": 45,
    "cynical_distrust_pct": 35,
    "dominant_stance": "Kritik Konstruktif Menuntut Perbaikan Layanan / Sinisme Publik"
  }},
  "stance_dynamics": {{
    "side_a_name": "Mendukung Regulasi / Pemerintah",
    "side_a_pct": 25,
    "side_b_name": "Menuntut Evaluasi & Transparansi",
    "side_b_pct": 60,
    "neutral_pct": 15,
    "controversy_level": "Tinggi",
    "polarization_summary": "Tuntutan warga vs pembenaran kebijakan institusi"
  }},
  "topic_clusters": [
    {{
      "topic_name": "Aspirasi / Keluhan Warga 1",
      "pct": 40,
      "description": "Tuntutan atau kritik konkret yang disuarakan",
      "sample_quote": "Kutipan representatif warganet"
    }},
    {{
      "topic_name": "Aspirasi / Keluhan Warga 2",
      "pct": 35,
      "description": "Tuntutan atau kritik konkret yang disuarakan",
      "sample_quote": "Kutipan representatif warganet"
    }},
    {{
      "topic_name": "Aspirasi / Keluhan Warga 3",
      "pct": 25,
      "description": "Tuntutan atau kritik konkret yang disuarakan",
      "sample_quote": "Kutipan representatif warganet"
    }}
  ],
  "academic_insights": {{
    "key_findings": [
      "Temuan aspirasi warga 1 untuk skripsi",
      "Temuan aspirasi warga 2 untuk skripsi",
      "Temuan aspirasi warga 3 untuk skripsi"
    ],
    "theoretical_relevance": "Kaitan temuan dengan Deliberative Democracy, Citizen Feedback, dan Good Governance",
    "thesis_summary_paragraph": "Paragraf kesimpulan akademik komprehensif yang siap disalin untuk Bab 4 Skripsi."
  }}
}}
"""
        return prompt, sys_inst

    # 11+. KERANGKA BIDANG PENELITIAN TAMBAHAN (Psikologi, Sosiologi, Manajemen & Bisnis,
    #     Pendidikan, Hukum, Kesehatan Masyarakat, Sistem Informasi & Informatika)
    fw_meta = ANALYSIS_FRAMEWORKS.get(analysis_type)
    if fw_meta and fw_meta.get("indicators"):
        return build_generic_framework_prompt(fw_meta, caption, formatted_comments, count)

    # Fallback to emotion_marketing if unrecognized
    return build_prompt_and_system("emotion_marketing", caption, formatted_comments, count)

def analyze_video_comments(
    filename: str,
    sample_size: int = 50,
    preferred_model: str = "clario/gemini-3.7-flash",
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
