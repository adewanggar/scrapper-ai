import {
  Layers,
  MessageCircle,
  MessageSquare,
  ShieldAlert,
  CheckCircle2,
  Brain,
  Target,
  Award,
  Flame,
  ShoppingBag,
  Globe,
  Megaphone,
  Users,
  Briefcase,
  GraduationCap,
  Scale,
  HeartPulse,
  Cpu,
  Eye,
  Smile,
  Fingerprint,
  TrendingDown,
  Network,
  Zap,
  BookOpen,
  ShieldCheck,
  Gavel,
  Stethoscope,
  Activity,
  Smartphone,
  Bot,
  ThumbsUp,
  Lock,
  Heart,
  Laptop,
  Flag,
  Lightbulb
} from 'lucide-react';

export const STOPWORDS = new Set([
  'di', 'ke', 'dari', 'yang', 'dan', 'ini', 'itu', 'ada', 'aku', 'kau', 'dia', 'mereka',
  'kami', 'kita', 'pada', 'untuk', 'dengan', 'adalah', 'akan', 'bisa', 'juga', 'sudah',
  'kalo', 'kalau', 'buat', 'mau', 'sama', 'nya', 'nih', 'dong', 'deh', 'aja', 'sih',
  'jadi', 'tapi', 'apa', 'lagi', 'kok', 'kan', 'lah', 'gitu', 'ga', 'gak', 'nggak',
  'tak', 'yg', 'dgn', 'dr', 'dlm', 'krn', 'karena', 'bgt', 'banget', 'yah', 'si', 'ya',
  'the', 'is', 'a', 'to', 'and', 'in', 'of', 'for', 'it', 'on', 'at'
]);

export const FRAMEWORK_CATEGORIES = [
  { id: 'all', label: 'Semua Bidang', icon: Globe, color: '#0D9488', desc: 'Jelajahi seluruh kerangka analisis dari semua jurusan' },
  { id: 'komunikasi', label: 'Ilmu Komunikasi', icon: Megaphone, color: '#0284C7', desc: 'Framing, resepsi media, wacana & netiket digital' },
  { id: 'psikologi', label: 'Psikologi', icon: Brain, color: '#DB2777', desc: 'Persepsi, emosi, identitas sosial & atribusi' },
  { id: 'sosiologi', label: 'Sosiologi', icon: Users, color: '#65A30D', desc: 'Ketimpangan, konstruksi sosial, konflik & norma' },
  { id: 'bisnis_marketing', label: 'Manajemen & Bisnis', icon: Briefcase, color: '#059669', desc: 'Persepsi merek, konsumen digital, e-WOM & loyalitas' },
  { id: 'pendidikan', label: 'Pendidikan', icon: GraduationCap, color: '#4F46E5', desc: 'Kebijakan pendidikan, teknologi & motivasi belajar' },
  { id: 'hukum', label: 'Hukum', icon: Scale, color: '#B91C1C', desc: 'Kesadaran hukum, keadilan, regulasi & penegakan' },
  { id: 'kesehatan', label: 'Kesehatan Masyarakat', icon: HeartPulse, color: '#BE123C', desc: 'Persepsi risiko, kampanye & perilaku kesehatan' },
  { id: 'informatika', label: 'Sistem Informasi & Informatika', icon: Cpu, color: '#4338CA', desc: 'Penerimaan teknologi, AI, UX & keamanan privasi' }
];

export const FRAMEWORKS_LIST = [
  {
    id: 'entman_framing',
    category: 'komunikasi',
    title: 'Analisis Framing Robert Entman',
    badge: 'Tesis S2 / Ilmu Komunikasi',
    icon: Layers,
    color: '#0D9488',
    desc: 'Analisis 4 elemen pembingkaian Entman (1993): Define Problems, Diagnose Causes, Make Moral Judgments, dan Suggest Remedies.',
    theory: 'Entman Framing Theory (1993), Agenda Setting, Social Construction of Reality',
    keywords: ['framing', 'pembingkaian', 'entman', 'media', 'berita', 'narasi'],
    indicators: ['Define Problems', 'Diagnose Causes', 'Make Moral Judgments', 'Suggest Remedies']
  },
  {
    id: 'audience_reception',
    category: 'komunikasi',
    title: 'Resepsi Khalayak (Stuart Hall)',
    badge: 'Studi Media / Kultural',
    icon: MessageCircle,
    color: '#D97706',
    desc: 'Klasifikasi 3 posisi pembacaan audiens: Dominan-Hegemonik (menerima), Negosiasi (kompromi), atau Oposisional (menolak pesan).',
    theory: 'Encoding/Decoding (Stuart Hall 1973), Active Audience Theory',
    keywords: ['resepsi', 'audiens', 'stuart hall', 'encoding', 'decoding', 'pembacaan'],
    indicators: ['Dominan-Hegemonik', 'Negosiasi', 'Oposisional']
  },
  {
    id: 'digital_discourse',
    category: 'komunikasi',
    title: 'Wacana & Netiket Netizen',
    badge: 'Linguistik / Komunikasi Digital',
    icon: MessageSquare,
    color: '#7C3AED',
    desc: 'Analisis kesantunan bahasa, penggunaan istilah gaul/slang, sarkasme, dan etika berinternet.',
    theory: 'Politeness Theory (Brown & Levinson), Computer-Mediated Communication',
    keywords: ['wacana', 'netiket', 'kesantunan', 'slang', 'sarkasme', 'linguistik', 'cyberbullying'],
    indicators: ['Kesantunan Berbahasa', 'Gaya Bahasa & Slang', 'Sarkasme', 'Etika Berinternet']
  },
  {
    id: 'political_communication',
    category: 'komunikasi',
    title: 'Komunikasi Politik & Polarisasi Opini',
    badge: 'Politik / Komunikasi Publik',
    icon: ShieldAlert,
    color: '#DC2626',
    desc: 'Kaji polarisasi kubu partisipan, echo chamber, sentimen terhadap figur/kebijakan, dan bias konfirmasi politik.',
    theory: 'Selective Exposure, Echo Chamber, Spiral of Silence, Social Identity Theory',
    keywords: ['politik', 'pemilu', 'polarisasi', 'echo chamber', 'figur politik', 'kampanye'],
    indicators: ['Pro/Kontra Figur', 'Echo Chamber', 'Bias Konfirmasi', 'Sentimen Politik']
  },
  {
    id: 'public_policy',
    category: 'hukum',
    title: 'Aspirasi Warga & Kebijakan Publik',
    badge: 'Kebijakan Publik / Administrasi',
    icon: CheckCircle2,
    color: '#0284C7',
    desc: 'Evaluasi penerimaan publik terhadap regulasi pemerintah, kritik layanan umum, dan tuntutan transparansi masyarakat.',
    theory: 'Deliberative Democracy, Citizen Engagement, Good Governance & Accountability',
    keywords: ['kebijakan', 'pemerintah', 'layanan umum', 'transparansi', 'aspirasi', 'regulasi'],
    indicators: ['Dukungan Kebijakan', 'Kritik Layanan', 'Tuntutan Transparansi', 'Aspirasi Warga']
  },
  {
    id: 'social_psychology',
    category: 'psikologi',
    title: 'Psikologi Sosial & Dinamika Kelompok',
    badge: 'Psikologi / Sosiologi',
    icon: Brain,
    color: '#DB2777',
    desc: 'Kaji konformitas (efek ikut-ikutan), kemarahan moral kolektif, empati, dan bias atribusi.',
    theory: 'Social Identity Theory, Moral Foundations Theory, Attribution Theory',
    keywords: ['psikologi sosial', 'konformitas', 'moral outrage', 'empati', 'kerumunan', 'ikut-ikutan'],
    indicators: ['Konformitas', 'Moral Outrage', 'Empati Sosial', 'Bias Atribusi']
  },
  {
    id: 'public_sentiment',
    category: 'komunikasi',
    title: 'Sentimen Publik & Krisis PR',
    badge: 'Public Relations / Humas',
    icon: Target,
    color: '#2563EB',
    desc: 'Audit sentimen masyarakat, skor reputasi/kepercayaan, dan rekomendasi respons krisis PR.',
    theory: 'Situational Crisis Communication Theory (SCCT), Public Opinion Formation',
    keywords: ['sentimen', 'krisis', 'pr', 'humas', 'reputasi', 'kepercayaan', 'opini publik'],
    indicators: ['Sentimen Publik', 'Skor Kepercayaan', 'Potensi Krisis', 'Rekomendasi Respons']
  },
  {
    id: 'parasocial_culture',
    category: 'sosiologi',
    title: 'Budaya Digital & Interaksi Parasosial',
    badge: 'Kajian Fandom / Budaya Selebritas',
    icon: Award,
    color: '#8B5CF6',
    desc: 'Kaji keterikatan emosional khalayak pada figur kreator/selebritas (parasosial), loyalitas fans, dan dinamika micro-celebrity.',
    theory: 'Parasocial Interaction (Horton & Wohl), Participatory Culture (Henry Jenkins)',
    keywords: ['parasosial', 'fandom', 'kreator', 'selebritas', 'fans', 'budaya digital', 'idol'],
    indicators: ['Keterikatan Parasosial', 'Loyalitas Fandom', 'Pembelaan Fans', 'Micro-Celebrity']
  },
  {
    id: 'emotion_marketing',
    category: 'bisnis_marketing',
    title: 'Pemasaran Emosi & Kontroversi',
    badge: 'Marketing / Komunikasi',
    icon: Flame,
    color: '#F97316',
    desc: 'Analisis pemanfaatan emosi, rasio audiens terkecoh drama vs sadar iklan, dan polarisasi kubu.',
    theory: 'Affective Response Theory, Drama Baiting, Shock Advertising',
    keywords: ['emosi', 'kontroversi', 'iklan', 'marketing', 'drama', 'viral', 'brand hijack'],
    indicators: ['Respon Emosi', 'Sadar Iklan', 'Polarisasi Kubu', 'Brand Hijack']
  },
  {
    id: 'consumer_behavior',
    category: 'bisnis_marketing',
    title: 'Perilaku Konsumen & Minat Beli',
    badge: 'Manajemen Bisnis / E-Commerce',
    icon: ShoppingBag,
    color: '#059669',
    desc: 'Evaluasi intensi beli (purchase intention), persepsi harga & kualitas, dan dinamika eWOM.',
    theory: 'Theory of Planned Behavior (TPB), Technology Acceptance Model (TAM)',
    keywords: ['konsumen', 'minat beli', 'purchase intention', 'harga', 'kualitas', 'ewom'],
    indicators: ['Intensi Beli', 'Persepsi Harga', 'Persepsi Kualitas', 'eWOM']
  },

  // ================= PSIKOLOGI =================
  {
    id: 'persepsi_emosi_digital',
    category: 'psikologi',
    title: 'Persepsi, Emosi & Perilaku Digital',
    badge: 'Psikologi / Media Digital',
    icon: Eye,
    color: '#0891B2',
    desc: 'Menganalisis penilaian kognitif (persepsi), respons emosional, motivasi penggunaan media, dan kecenderungan perilaku keterlibatan digital netizen.',
    theory: 'Cognitive Appraisal Theory (Lazarus, 1991), Uses and Gratifications Theory (Katz, Blumler & Gurevitch, 1973), Basic Emotions (Ekman, 1992)',
    keywords: ['persepsi', 'emosi', 'perilaku digital', 'gratifikasi', 'motivasi media', 'kognitif'],
    indicators: ['Persepsi Positif', 'Persepsi Negatif', 'Respons Emosional', 'Motivasi Penggunaan Media', 'Kecenderungan Perilaku Keterlibatan']
  },
  {
    id: 'identitas_sosial_kelompok',
    category: 'psikologi',
    title: 'Identitas Sosial & Dinamika Kelompok',
    badge: 'Psikologi Sosial / Kelompok',
    icon: Users,
    color: '#E11D48',
    desc: 'Mengkaji identifikasi in-group vs out-group, konformitas terhadap opini mayoritas, solidaritas, dan favoritisme kelompok di kolom komentar.',
    theory: 'Social Identity Theory (Tajfel & Turner, 1979), Group Polarization (Moscovici & Zavalloni, 1969), Conformity Studies (Asch, 1955)',
    keywords: ['identitas sosial', 'in-group', 'out-group', 'konformitas', 'solidaritas', 'kelompok', 'favoritisme'],
    indicators: ['Identifikasi In-Group', 'Persepsi Out-Group', 'Konformitas / Bandwagon', 'Solidaritas & Dukungan Kelompok', 'Favoritisme In-Group & Bias']
  },
  {
    id: 'atribusi_sosial',
    category: 'psikologi',
    title: 'Persepsi dan Atribusi Sosial',
    badge: 'Psikologi Sosial / Kognisi',
    icon: Fingerprint,
    color: '#6366F1',
    desc: 'Menganalisis sebab yang ditudingkan netizen atas perilaku orang lain: atribusi internal (karakter) atau eksternal (situasi), beserta bias penilaiannya.',
    theory: 'Attribution Theory (Heider, 1958; Weiner, 1985), Fundamental Attribution Error (Ross, 1977)',
    keywords: ['atribusi', 'persepsi sosial', 'penyebab', 'blame', 'heider', 'weiner', 'bias atribusi'],
    indicators: ['Atribusi Internal', 'Atribusi Eksternal', 'Penilaian Tanggung Jawab', 'Bias Atribusi & Stereotip', 'Empati vs Kecaman']
  },
  {
    id: 'ekspresi_emosi_digital',
    category: 'psikologi',
    title: 'Ekspresi Emosi dalam Interaksi Digital',
    badge: 'Psikologi / CMC',
    icon: Smile,
    color: '#F59E0B',
    desc: 'Memetakan ekspresi emosi dasar warganet, penularan emosi kolektif (emotional contagion), sarkasme, dan bentuk dukungan emosional daring.',
    theory: 'Basic Emotion Theory (Ekman & Friesen, 1971), Emotional Contagion (Hatfield, Cacioppo & Rapson, 1994), Emotion Regulation (Gross, 1998)',
    keywords: ['ekspresi emosi', 'emosi dasar', 'empati', 'kontagion', 'sarkasme', 'dukungan emosional'],
    indicators: ['Ekspresi Emosi Dasar', 'Empati & Dukungan Emosional', 'Kontagion / Emosi Kolektif', 'Sarkasme & Emosi Terselubung', 'Regulasi & Penenangan Emosi']
  },

  // ================= SOSIOLOGI =================
  {
    id: 'ketimpangan_sosial',
    category: 'sosiologi',
    title: 'Ketimpangan Sosial & Dinamika Masyarakat',
    badge: 'Sosiologi / Stratifikasi',
    icon: TrendingDown,
    color: '#CA8A04',
    desc: 'Mengkaji kesadaran warganet terhadap kesenjangan ekonomi-sosial, kritik distribusi dan akses, suara kelompok terpinggirkan, serta tuntutan keadilan sosial.',
    theory: 'Forms of Capital & Stratification (Bourdieu, 1986), Digital Divide (van Dijk, 2005; DiMaggio & Hargittai, 2001)',
    keywords: ['ketimpangan', 'kesenjangan', 'stratifikasi', 'bourdieu', 'pemerataan', 'terpinggirkan', 'keadilan sosial'],
    indicators: ['Kesadaran Ketimpangan', 'Kritik Distribusi & Akses', 'Suara Kelompok Terpinggirkan', 'Simbol Kapital & Status', 'Tuntutan Keadilan Sosial']
  },
  {
    id: 'konstruksi_sosial_digital',
    category: 'sosiologi',
    title: 'Konstruksi Sosial di Media Digital',
    badge: 'Sosiologi / Kajian Media',
    icon: Network,
    color: '#65A30D',
    desc: 'Menganalisis bagaimana makna dan realitas sosial dibangun bersama warganet: narasi dominan, pelabelan, simbol khas, dan negosiasi makna antar kubu.',
    theory: 'Social Construction of Reality (Berger & Luckmann, 1966), Symbolic Interactionism (Blumer, 1969)',
    keywords: ['konstruksi sosial', 'makna', 'narasi', 'label', 'stigma', 'simbol', 'interaksionisme'],
    indicators: ['Definisi Situasi & Narasi Dominan', 'Pelabelan & Stigma Sosial', 'Simbol, Meme & Bahasa Khas', 'Negosiasi Makna Antar Kubu', 'Realitas yang Dikonstruksi Bersama']
  },
  {
    id: 'konflik_sosial_polarisasi',
    category: 'sosiologi',
    title: 'Konflik Sosial & Polarisasi Kelompok',
    badge: 'Sosiologi / Studi Konflik',
    icon: Zap,
    color: '#9F1239',
    desc: 'Mengkaji sumber konflik (sumber daya, nilai, identitas), pengelompokan kubu, eskalasi retorika, serta upaya mediasi atau de-eskalasi digital.',
    theory: 'Realistic Conflict Theory (Sherif, 1966), The Functions of Social Conflict (Coser, 1956), Group Polarization (Moscovici & Zavalloni, 1969)',
    keywords: ['konflik', 'polarisasi', 'perdebatan', 'eskalasi', 'permusuhan', 'mediasi', 'kubu'],
    indicators: ['Sumber Konflik', 'Pengelompokan Kubu', 'Eskalasi & De-eskalasi', 'Retorika Permusuhan', 'Mediasi & Jembatan Perdamaian']
  },
  {
    id: 'norma_sosial_interaksi',
    category: 'sosiologi',
    title: 'Norma Sosial & Interaksi Masyarakat',
    badge: 'Sosiologi / Antropologi',
    icon: BookOpen,
    color: '#4D7C0F',
    desc: 'Menganalisis norma yang dijaga warganet (deskriptif & injunktif), pelanggaran norma beserta sanksi sosial, dan tata krama interaksi daring.',
    theory: 'Focus Theory of Normative Conduct (Cialdini, Reno & Kallgren, 1990), Interaction Ritual (Goffman, 1967)',
    keywords: ['norma', 'sanksi sosial', 'tata krama', 'kesopanan', 'kontrol sosial', 'pelanggaran', 'goffman'],
    indicators: ['Norma Deskriptif', 'Norma Injunktif', 'Pelanggaran Norma', 'Sanksi Sosial & Penghakiman', 'Kesantunan & Tata Krama Interaksi']
  },

  // ================= MANAJEMEN & BISNIS =================
  {
    id: 'brand_perception_purchase',
    category: 'bisnis_marketing',
    title: 'Persepsi Merek & Keputusan Pembelian',
    badge: 'Manajemen / Pemasaran',
    icon: ShieldCheck,
    color: '#1D4ED8',
    desc: 'Menganalisis persepsi warganet terhadap merek: kesadaran, asosiasi & citra, persepsi kualitas, kepercayaan, dan kaitannya dengan niat membeli.',
    theory: 'Brand Equity Model (Aaker, 1991), Theory of Planned Behavior (Ajzen, 1991)',
    keywords: ['merek', 'brand', 'brand equity', 'citra', 'keputusan pembelian', 'niat beli', 'aaker'],
    indicators: ['Kesadaran & Pengenalan Merek', 'Asosiasi & Citra Merek', 'Persepsi Kualitas', 'Kepercayaan terhadap Merek', 'Niat Beli (Purchase Intention)']
  },
  {
    id: 'konsumen_digital',
    category: 'bisnis_marketing',
    title: 'Perilaku Konsumen Digital',
    badge: 'Manajemen / E-Commerce',
    icon: Smartphone,
    color: '#0EA5E9',
    desc: 'Memetakan perjalanan konsumen digital: dari mengenal produk, mencari & membandingkan informasi, pembelian impulsif, hingga hambatan keputusan membeli.',
    theory: 'Customer Journey & Experience (Lemon & Verhoef, 2016), Impulse Buying (Rook, 1987)',
    keywords: ['konsumen digital', 'customer journey', 'impulsif', 'fomo', 'ulasan', 'perbandingan', 'e-commerce'],
    indicators: ['Tahap Perjalanan Konsumen', 'Pembelian Impulsif', 'Pencarian & Perbandingan Informasi', 'Validasi Sosial', 'Hambatan Keputusan Pembelian']
  },
  {
    id: 'ewom',
    category: 'bisnis_marketing',
    title: 'Electronic Word of Mouth (e-WOM)',
    badge: 'Manajemen Pemasaran / Komunikasi',
    icon: ThumbsUp,
    color: '#16A34A',
    desc: 'Menganalisis rekomendasi dan penyebaran informasi oleh warganet: eWOM positif vs negatif, kualitas argumen, kredibilitas sumber, dan motivasi berbagi.',
    theory: 'eWOM Intention (Hennig-Thurau et al., 2004), Information Adoption Model (Sussman & Siegal, 2003)',
    keywords: ['ewom', 'rekomendasi', 'word of mouth', 'kredibilitas', 'informasi', 'testimoni', 'hennig-thurau'],
    indicators: ['eWOM Positif', 'eWOM Negatif', 'Kualitas Argumen Informasi', 'Kredibilitas Sumber', 'Motivasi Berbagi Informasi']
  },
  {
    id: 'loyalitas_pengalaman',
    category: 'bisnis_marketing',
    title: 'Loyalitas Pelanggan & Pengalaman Konsumen',
    badge: 'Manajemen / Layanan',
    icon: Heart,
    color: '#C026D3',
    desc: 'Mengukur kepuasan pelanggan, pengalaman layanan, advokasi (merekomendasikan), keluhan, dan niat penggunaan berkelanjutan yang terekspresikan dalam komentar.',
    theory: 'Customer Experience (Lemon & Verhoef, 2016), Customer Loyalty (Oliver, 1999), Expectation-Confirmation Theory (Bhattacherjee, 2001)',
    keywords: ['loyalitas', 'kepuasan', 'pengalaman pelanggan', 'advokasi', 'keluhan', 'repeat order', 'setia'],
    indicators: ['Kepuasan Pelanggan', 'Pengalaman Layanan & Penggunaan', 'Advokasi (Merekomendasikan)', 'Keluhan & Komplain', 'Niat Penggunaan Berkelanjutan']
  },

  // ================= PENDIDIKAN =================
  {
    id: 'persepsi_kebijakan_pendidikan',
    category: 'pendidikan',
    title: 'Persepsi Mahasiswa terhadap Kebijakan Pendidikan',
    badge: 'Pendidikan / Kebijakan',
    icon: GraduationCap,
    color: '#4F46E5',
    desc: 'Menganalisis sikap mahasiswa dan warganet terhadap kebijakan pendidikan: dukungan, penolakan, persepsi dampak & keadilan, serta kritik implementasinya.',
    theory: 'Theory of Reasoned Action (Fishbein & Ajzen, 1975), Understanding Public Policy (Dye, 1972)',
    keywords: ['kebijakan pendidikan', 'mahasiswa', 'kampus', 'kurikulum', 'ukt', 'persepsi', 'kebijakan'],
    indicators: ['Dukungan terhadap Kebijakan', 'Penolakan & Keberatan', 'Persepsi Dampak bagi Mahasiswa/Lembaga', 'Persepsi Keadilan & Pemerataan', 'Kritik Implementasi & Usulan Perubahan']
  },
  {
    id: 'teknologi_pendidikan',
    category: 'pendidikan',
    title: 'Penerimaan Teknologi dalam Pendidikan',
    badge: 'Pendidikan / Teknologi Pendidikan',
    icon: Laptop,
    color: '#0F766E',
    desc: 'Menganalisis penerimaan mahasiswa dan guru terhadap teknologi pembelajaran: persepsi kemudahan & kegunaan, kesiapan, hambatan, dan dampak belajar.',
    theory: 'Technology Acceptance Model (Davis, 1989), UTAUT (Venkatesh et al., 2003)',
    keywords: ['teknologi pendidikan', 'e-learning', 'daring', 'lms', 'tam', 'utaut', 'pembelajaran digital'],
    indicators: ['Persepsi Kemudahan Penggunaan', 'Persepsi Kegunaan Pembelajaran', 'Niat & Kesiapan Penggunaan', 'Hambatan Infrastruktur & Literasi', 'Dampak pada Efektivitas Belajar']
  },
  {
    id: 'motivasi_belajar_digital',
    category: 'pendidikan',
    title: 'Motivasi Belajar & Pembelajaran Digital',
    badge: 'Pendidikan / Psikologi Pendidikan',
    icon: Lightbulb,
    color: '#A16207',
    desc: 'Menganalisis motivasi intrinsik & ekstrinsik, kemandirian belajar, keterlibatan (engagement), serta hambatan dan kelelahan belajar digital pelajar.',
    theory: 'Self-Determination Theory (Deci & Ryan, 1985), ARCS Motivation Model (Keller, 1987), Self-Regulated Learning (Zimmerman, 1990)',
    keywords: ['motivasi belajar', 'kemandirian', 'engagement', 'self-regulated', 'belajar online', 'jenuh', 'semangat belajar'],
    indicators: ['Motivasi Intrinsik', 'Motivasi Ekstrinsik', 'Kemandirian & Disiplin Belajar', 'Keterlibatan (Engagement) Belajar', 'Hambatan & Kelelahan Belajar Digital']
  },
  {
    id: 'ai_pendidikan',
    category: 'pendidikan',
    title: 'Persepsi terhadap Penggunaan AI dalam Pendidikan',
    badge: 'Pendidikan / Teknologi',
    icon: Bot,
    color: '#6D28D9',
    desc: 'Menganalisis sikap terhadap AI dalam belajar: antusiasme, persepsi manfaat & akurasi, kekhawatiran integritas akademik, dan kepercayaan pada rekomendasi AI.',
    theory: 'Technology Acceptance Model (Davis, 1989), Expectation-Confirmation Theory (Bhattacherjee, 2001), Algorithm Aversion & Appreciation (Logg, Minson & Moore, 2019)',
    keywords: ['ai', 'chatgpt', 'kecerdasan buatan', 'plagiat', 'integritas akademik', 'pendidikan', 'algoritma'],
    indicators: ['Penerimaan & Antusiasme terhadap AI', 'Persepsi Manfaat & Akurasi AI', 'Kekhawatiran (Dependensi & Kejujuran Akademik)', 'Kepercayaan pada Rekomendasi AI', 'Harapan Peran Dosen & Manusia']
  },

  // ================= HUKUM =================
  {
    id: 'kesadaran_hukum',
    category: 'hukum',
    title: 'Kesadaran Hukum Masyarakat',
    badge: 'Hukum / Sosiologi Hukum',
    icon: Gavel,
    color: '#92400E',
    desc: 'Menganalisis pengetahuan dan literasi hukum warganet, sikap terhadap hukum, persepsi kepatuhan masyarakat, serta panggilan sosialisasi hukum.',
    theory: 'Legal Consciousness (Ewick & Silbey, 1998), Legal Culture (Friedman, 1975)',
    keywords: ['kesadaran hukum', 'literasi hukum', 'patuh hukum', 'pasal', 'aturan', 'sosialisasi hukum'],
    indicators: ['Pengetahuan & Literasi Hukum', 'Sikap terhadap Hukum', 'Persepsi Kepatuhan Masyarakat', 'Panggilan Sosialisasi & Edukasi Hukum', 'Keluhan Rendahnya Kesadaran Hukum']
  },
  {
    id: 'persepsi_keadilan',
    category: 'hukum',
    title: 'Persepsi Publik terhadap Keadilan',
    badge: 'Hukum / Kriminologi',
    icon: Scale,
    color: '#1E40AF',
    desc: 'Menganalisis penilaian publik atas keadilan proses hukum, kesetaraan di hadapan hukum, kepuasan terhadap putusan, dan simpati pada pihak perkara.',
    theory: 'Procedural Justice (Tyler, 1990), Distributive Justice (Rawls, 1971)',
    keywords: ['keadilan', 'putusan', 'vonis', 'procedural justice', 'kesetaraan', 'peradilan', 'basah berlaku'],
    indicators: ['Persepsi Keadilan Proses Hukum', 'Kesetaraan di Hadapan Hukum', 'Kepuasan terhadap Putusan', 'Simpati/Antipati pada Pihak Perkara', 'Tuntutan Transparansi Proses']
  },
  {
    id: 'opini_regulasi',
    category: 'hukum',
    title: 'Opini Publik terhadap Regulasi',
    badge: 'Hukum / Ilmu Politik',
    icon: Megaphone,
    color: '#B91C1C',
    desc: 'Menganalisis opini warganet atas aturan/kebijakan hukum: dukungan, penolakan, persepsi urgensi & dampak, serta tuntutan revisi dan partisipasi publik.',
    theory: 'Public Opinion (Price, 1992), Spiral of Silence (Noelle-Neumann, 1974)',
    keywords: ['regulasi', 'ruu', 'uu', 'opini publik', 'kebijakan hukum', 'uji materi', 'revisi aturan'],
    indicators: ['Dukungan terhadap Regulasi', 'Penolakan & Kritik Regulasi', 'Persepsi Urgensi Aturan Baru/Revisi', 'Persepsi Dampak Ekonomi-Sosial', 'Tuntutan Partisipasi Publik']
  },
  {
    id: 'kepercayaan_penegakan',
    category: 'hukum',
    title: 'Kepercayaan Masyarakat terhadap Penegakan Hukum',
    badge: 'Hukum / Kriminologi',
    icon: ShieldCheck,
    color: '#065F46',
    desc: 'Mengukur kepercayaan publik pada aparat dan institusi penegak hukum: transparansi, persepsi korupsi & pilih kasih, apresiasi, dan tuntutan reformasi.',
    theory: 'Trust and Power (Luhmann, 1979), Police & Legal Legitimacy (Tyler, 2004)',
    keywords: ['penegakan hukum', 'aparat', 'polisi', 'kepercayaan', 'korupsi', 'transparansi', 'legitimasi'],
    indicators: ['Kepercayaan pada Aparat/Instansi', 'Persepsi Transparansi & Akuntabilitas', 'Persepsi Korupsi & Pilih Kasih', 'Pujian & Apresiasi Penegakan', 'Tuntutan Reformasi Penegakan Hukum']
  },

  // ================= KESEHATAN MASYARAKAT =================
  {
    id: 'persepsi_risiko_kesehatan',
    category: 'kesehatan',
    title: 'Persepsi Risiko Kesehatan',
    badge: 'Kesehatan Masyarakat / Promosi',
    icon: Stethoscope,
    color: '#BE123C',
    desc: 'Menganalisis persepsi warganet atas risiko kesehatan: kerentanan, keparahan, manfaat tindakan pencegahan, hambatan, dan efikasi diri.',
    theory: 'Risk Perception (Slovic, 1987), Health Belief Model (Rosenstock, 1974)',
    keywords: ['risiko kesehatan', 'health belief', 'kerentanan', 'keparahan', 'pencegahan', 'efikasi diri'],
    indicators: ['Persepsi Kerentanan (Susceptibility)', 'Persepsi Keparahan (Severity)', 'Persepsi Manfaat Tindakan', 'Persepsi Hambatan (Barriers)', 'Efikasi Diri (Self-Efficacy)']
  },
  {
    id: 'komunikasi_kesehatan_digital',
    category: 'kesehatan',
    title: 'Komunikasi Kesehatan Digital',
    badge: 'Kesehatan Masyarakat / Komunikasi',
    icon: Activity,
    color: '#0E7490',
    desc: 'Menganalisis praktik berbagi informasi kesehatan digital: kredibilitas sumber, literasi kesehatan digital, respons pesan ancaman, dan solidaritas.',
    theory: 'eHealth Literacy Scale (Norman & Skinner, 2006), Extended Parallel Process Model (Witte, 1992)',
    keywords: ['komunikasi kesehatan', 'ehealth', 'literasi kesehatan', 'hoaks kesehatan', 'informasi kesehatan', 'fear appeal'],
    indicators: ['Berbagi Informasi Kesehatan', 'Evaluasi Kredibilitas Sumber', 'Literasi Kesehatan Digital', 'Respons Pesan Ancaman (Fear Appeal)', 'Dukungan Emosional & Solidaritas']
  },
  {
    id: 'respons_kampanye_kesehatan',
    category: 'kesehatan',
    title: 'Respons Publik terhadap Kampanye Kesehatan',
    badge: 'Kesehatan Masyarakat / Promosi',
    icon: Flag,
    color: '#C2410C',
    desc: 'Menganalisis respons warganet terhadap kampanye kesehatan: dukungan, kepatuhan pesan anjuran, skeptisisme, debat efektivitas, dan mobilisasi kolektif.',
    theory: 'Elaboration Likelihood Model (Petty & Cacioppo, 1986), Health Belief Model (Rosenstock, 1974)',
    keywords: ['kampanye kesehatan', 'vaksinasi', 'protokol', 'imunisasi', 'sosialisasi kesehatan', 'elaboration'],
    indicators: ['Dukungan terhadap Kampanye', 'Kepatuhan pada Pesan Anjuran', 'Skeptis & Resistensi Pesan', 'Debat Efektivitas Kampanye', 'Mobilisasi Kolektif & Penyebaran']
  },
  {
    id: 'perilaku_pencegahan',
    category: 'kesehatan',
    title: 'Perilaku Pencegahan & Kesadaran Kesehatan',
    badge: 'Kesehatan Masyarakat / Gizi',
    icon: HeartPulse,
    color: '#F43F5E',
    desc: 'Menganalisis niat & praktik pencegahan, kesadaran gejala, adopsi pola hidup sehat, penolakan misinformasi, dan norma kesehatan masyarakat.',
    theory: 'Theory of Planned Behavior (Ajzen, 1991), Transtheoretical Model (Prochaska & DiClemente, 1983)',
    keywords: ['perilaku pencegahan', 'pola hidup sehat', 'phbs', 'kesadaran kesehatan', 'misinformasi', 'olahraga', 'gizi'],
    indicators: ['Niat & Praktik Pencegahan', 'Kesadaran Gejala & Pentingnya Cek', 'Adopsi Pola Hidup Sehat', 'Penolakan Misinformasi', 'Norma Kesehatan Masyarakat']
  },

  // ================= SISTEM INFORMASI & INFORMATIKA =================
  {
    id: 'penerimaan_teknologi_digital',
    category: 'informatika',
    title: 'Penerimaan Teknologi Digital',
    badge: 'Sistem Informasi / Informatika',
    icon: Cpu,
    color: '#4338CA',
    desc: 'Menganalisis penerimaan warganet terhadap teknologi/fitur digital: persepsi kegunaan & kemudahan, niat adopsi, faktor pendukung, dan resistensi.',
    theory: 'Technology Acceptance Model (Davis, 1989), UTAUT (Venkatesh et al., 2003), Diffusion of Innovations (Rogers, 1962)',
    keywords: ['penerimaan teknologi', 'tam', 'utaut', 'adopsi', 'difusi inovasi', 'aplikasi baru', 'resistensi'],
    indicators: ['Persepsi Kegunaan (Perceived Usefulness)', 'Persepsi Kemudahan (Perceived Ease of Use)', 'Niat Adopsi Teknologi', 'Faktor Fasilitasi & Kondisi Pendukung', 'Resistensi & Kekhawatiran Teknologi']
  },
  {
    id: 'persepsi_ai',
    category: 'informatika',
    title: 'Persepsi Pengguna terhadap AI',
    badge: 'Sistem Informasi / HCI',
    icon: Bot,
    color: '#9333EA',
    desc: 'Menganalisis kepercayaan pengguna pada AI: persepsi akurasi, kenyamanan interaksi manusia-AI, kekhawatiran penggantian manusia, dan penerimaan fitur AI.',
    theory: 'Trust in Automation (Lee & See, 2004), Uncanny Valley (Mori, 1970)',
    keywords: ['ai', 'kecerdasan buatan', 'chatgpt', 'otomatisasi', 'trust', 'uncanny valley', 'robot'],
    indicators: ['Kepercayaan pada Output AI', 'Persepsi Akurasi & Kemampuan AI', 'Kenyamanan Interaksi Manusia-AI', 'Kekhawatiran Penggantian Manusia', 'Penerimaan Fitur/Produk Berbasis AI']
  },
  {
    id: 'ux_kepuasan',
    category: 'informatika',
    title: 'Kepuasan & Pengalaman Pengguna',
    badge: 'Sistem Informasi / Desain Interaksi',
    icon: Smile,
    color: '#10B981',
    desc: 'Mengukur kepuasan dan pengalaman pengguna aplikasi/platform: usability, pengalaman estetis & hedonis, keluhan bug, dan niat terus menggunakan.',
    theory: 'Expectation-Confirmation Theory (Bhattacherjee, 2001), Pragmatic & Hedonic UX (Hassenzahl, 2003)',
    keywords: ['user experience', 'ux', 'kepuasan pengguna', 'usability', 'aplikasi', 'bug', 'continuance'],
    indicators: ['Kepuasan Pengguna', 'Persepsi Usability', 'Pengalaman Estetis & Hedonis', 'Keluhan & Bug Pengalaman', 'Niat Penggunaan Berkelanjutan']
  },
  {
    id: 'keamanan_privasi',
    category: 'informatika',
    title: 'Kepercayaan, Keamanan & Privasi Digital',
    badge: 'Sistem Informasi / Keamanan Siber',
    icon: Lock,
    color: '#475569',
    desc: 'Menganalisis kekhawatiran privasi data, kepercayaan pada platform, persepsi keamanan, perilaku berbagi data pribadi, dan tuntutan perlindungan digital.',
    theory: 'Privacy Calculus (Culnan & Armstrong, 1999), Trust in Technology (McKnight et al., 2002), Privacy Paradox (Barnes, 2006)',
    keywords: ['privasi', 'keamanan data', 'kebocoran', 'trust', 'privacy paradox', 'perlindungan data', 'keamanan siber'],
    indicators: ['Kekhawatiran Privasi Data', 'Kepercayaan pada Platform', 'Persepsi Keamanan Sistem', 'Perilaku Berbagi Informasi Pribadi', 'Tuntutan Perlindungan & Regulasi']
  }
];

export const API_BASE = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');
export const CORRECT_PIN = '112233';

export const TAB_ROUTES = {
  'research-titles': '/ide-judul',
  'research-theories': '/rekomendasi-teori',
  dashboard: '/dashboard',
  results: '/komentar',
  'ai-analysis': '/analisis',
  files: '/riwayat',
  settings: '/pengaturan'
};

export const ROUTE_TABS = {
  '/ide-judul': 'research-titles',
  '/rekomendasi-teori': 'research-theories',
  '/dashboard': 'dashboard',
  '/': 'dashboard',
  '/komentar': 'results',
  '/results': 'results',
  '/comments': 'results',
  '/analisis': 'ai-analysis',
  '/ai-analysis': 'ai-analysis',
  '/analysis': 'ai-analysis',
  '/riwayat': 'files',
  '/files': 'files',
  '/pengaturan': 'settings',
  '/settings': 'settings'
};

export const getInitialTab = () => {
  if (typeof window !== 'undefined') {
    const p = window.location.pathname.toLowerCase().replace(/\/$/, '') || '/';
    return ROUTE_TABS[p] || 'dashboard';
  }
  return 'dashboard';
};
