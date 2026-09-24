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
  ShoppingBag
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
  { id: 'all', label: 'Semua Bidang' },
  { id: 'komunikasi', label: 'Komunikasi & Media' },
  { id: 'sosial_politik', label: 'Politik & Kebijakan' },
  { id: 'pr_budaya', label: 'Humas & Budaya Digital' },
  { id: 'bisnis_marketing', label: 'Pemasaran & Bisnis' }
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
    theory: 'Entman Framing Theory (1993), Agenda Setting, Social Construction of Reality'
  },
  {
    id: 'audience_reception',
    category: 'komunikasi',
    title: 'Resepsi Khalayak (Stuart Hall)',
    badge: 'Studi Media / Kultural',
    icon: MessageCircle,
    color: '#D97706',
    desc: 'Klasifikasi 3 posisi pembacaan audiens: Dominan-Hegemonik (menerima), Negosiasi (kompromi), atau Oposisional (menolak pesan).',
    theory: 'Encoding/Decoding (Stuart Hall 1973), Active Audience Theory'
  },
  {
    id: 'digital_discourse',
    category: 'komunikasi',
    title: 'Wacana & Netiket Netizen',
    badge: 'Linguistik / Komunikasi Digital',
    icon: MessageSquare,
    color: '#7C3AED',
    desc: 'Analisis kesantunan bahasa, penggunaan istilah gaul/slang, sarkasme, dan etika berinternet.',
    theory: 'Politeness Theory (Brown & Levinson), Computer-Mediated Communication'
  },
  {
    id: 'political_communication',
    category: 'sosial_politik',
    title: 'Komunikasi Politik & Polarisasi Opini',
    badge: 'Politik / Komunikasi Publik',
    icon: ShieldAlert,
    color: '#DC2626',
    desc: 'Kaji polarisasi kubu partisipan, echo chamber, sentimen terhadap figur/kebijakan, dan bias konfirmasi politik.',
    theory: 'Selective Exposure, Echo Chamber, Spiral of Silence, Social Identity Theory'
  },
  {
    id: 'public_policy',
    category: 'sosial_politik',
    title: 'Aspirasi Warga & Kebijakan Publik',
    badge: 'Kebijakan Publik / Administrasi',
    icon: CheckCircle2,
    color: '#0284C7',
    desc: 'Evaluasi penerimaan publik terhadap regulasi pemerintah, kritik layanan umum, dan tuntutan transparansi masyarakat.',
    theory: 'Deliberative Democracy, Citizen Engagement, Good Governance & Accountability'
  },
  {
    id: 'social_psychology',
    category: 'sosial_politik',
    title: 'Psikologi Sosial & Dinamika Kelompok',
    badge: 'Psikologi / Sosiologi',
    icon: Brain,
    color: '#DB2777',
    desc: 'Kaji konformitas (efek ikut-ikutan), kemarahan moral kolektif, empati, dan bias atribusi.',
    theory: 'Social Identity Theory, Moral Foundations Theory, Attribution Theory'
  },
  {
    id: 'public_sentiment',
    category: 'pr_budaya',
    title: 'Sentimen Publik & Krisis PR',
    badge: 'Public Relations / Humas',
    icon: Target,
    color: '#2563EB',
    desc: 'Audit sentimen masyarakat, skor reputasi/kepercayaan, dan rekomendasi respons krisis PR.',
    theory: 'Situational Crisis Communication Theory (SCCT), Public Opinion Formation'
  },
  {
    id: 'parasocial_culture',
    category: 'pr_budaya',
    title: 'Budaya Digital & Interaksi Parasosial',
    badge: 'Kajian Fandom / Budaya Selebritas',
    icon: Award,
    color: '#8B5CF6',
    desc: 'Kaji keterikatan emosional khalayak pada figur kreator/selebritas (parasosial), loyalitas fans, dan dinamika micro-celebrity.',
    theory: 'Parasocial Interaction (Horton & Wohl), Participatory Culture (Henry Jenkins)'
  },
  {
    id: 'emotion_marketing',
    category: 'bisnis_marketing',
    title: 'Pemasaran Emosi & Kontroversi',
    badge: 'Marketing / Komunikasi',
    icon: Flame,
    color: '#F97316',
    desc: 'Analisis pemanfaatan emosi, rasio audiens terkecoh drama vs sadar iklan, dan polarisasi kubu.',
    theory: 'Affective Response Theory, Drama Baiting, Shock Advertising'
  },
  {
    id: 'consumer_behavior',
    category: 'bisnis_marketing',
    title: 'Perilaku Konsumen & Minat Beli',
    badge: 'Manajemen Bisnis / E-Commerce',
    icon: ShoppingBag,
    color: '#059669',
    desc: 'Evaluasi intensi beli (purchase intention), persepsi harga & kualitas, dan dinamika eWOM.',
    theory: 'Theory of Planned Behavior (TPB), Technology Acceptance Model (TAM)'
  }
];

export const API_BASE = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');
export const CORRECT_PIN = '112233';

export const TAB_ROUTES = {
  dashboard: '/dashboard',
  results: '/komentar',
  'ai-analysis': '/analisis',
  files: '/riwayat',
  settings: '/pengaturan'
};

export const ROUTE_TABS = {
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
