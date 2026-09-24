import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  LayoutDashboard,
  MessageSquare,
  FolderArchive,
  Settings,
  Search,
  Download,
  RefreshCw,
  Upload,
  Play,
  ExternalLink,
  CornerDownRight,
  Copy,
  Check,
  X,
  ChevronDown,
  ChevronUp,
  Clock,
  Users,
  FileJson,
  Layers,
  Flame,
  AlertCircle,
  Menu,
  ArrowRight,
  CheckCircle2,
  HardDrive,
  FileText,
  ChevronLeft,
  ChevronRight,
  Brain,
  Sparkles,
  Lightbulb,
  FileSpreadsheet,
  Target,
  Lock,
  Unlock,
  ShieldCheck,
  ShoppingBag,
  ShieldAlert,
  Award,
  MessageCircle,
  BarChart3,
  Quote,
  Calculator,
  User,
  Link2,
  Database,
  LogOut,
  Trash2
} from 'lucide-react';
import ExportStatsModal from './components/ExportStatsModal';
import CitationModal from './components/CitationModal';
import VerbatimQuoteModal from './components/VerbatimQuoteModal';
import InterCoderModal from './components/InterCoderModal';
import AuthScreen from './components/AuthScreen';
import {
  subscribeToAuth,
  logoutUser,
  saveUserScrape,
  getUserScrapes,
  getUserScrapeContent,
  deleteUserScrape,
  saveUserAiAnalysis,
  getUserAiAnalysis
} from './firebase';

const STOPWORDS = new Set([
  'di', 'ke', 'dari', 'yang', 'dan', 'ini', 'itu', 'ada', 'aku', 'kau', 'dia', 'mereka',
  'kami', 'kita', 'pada', 'untuk', 'dengan', 'adalah', 'akan', 'bisa', 'juga', 'sudah',
  'kalo', 'kalau', 'buat', 'mau', 'sama', 'nya', 'nih', 'dong', 'deh', 'aja', 'sih',
  'jadi', 'tapi', 'apa', 'lagi', 'kok', 'kan', 'lah', 'gitu', 'ga', 'gak', 'nggak',
  'tak', 'yg', 'dgn', 'dr', 'dlm', 'krn', 'karena', 'bgt', 'banget', 'yah', 'si', 'ya',
  'the', 'is', 'a', 'to', 'and', 'in', 'of', 'for', 'it', 'on', 'at'
]);

const FRAMEWORKS_LIST = [
  {
    id: 'emotion_marketing',
    title: 'Pemasaran Emosi & Kontroversi',
    badge: 'Marketing / Komunikasi',
    icon: Flame,
    color: '#F97316',
    desc: 'Analisis pemanfaatan emosi, rasio audiens terkecoh drama vs sadar iklan, dan polarisasi kubu.',
    theory: 'Affective Response Theory, Drama Baiting, Shock Advertising'
  },
  {
    id: 'public_sentiment',
    title: 'Sentimen Publik & Krisis PR',
    badge: 'Public Relations / Humas',
    icon: Target,
    color: '#2563EB',
    desc: 'Audit sentimen masyarakat, skor reputasi/kepercayaan, dan rekomendasi respons krisis PR.',
    theory: 'Situational Crisis Communication Theory (SCCT), Public Opinion Formation'
  },
  {
    id: 'consumer_behavior',
    title: 'Perilaku Konsumen & Minat Beli',
    badge: 'Manajemen Bisnis / E-Commerce',
    icon: ShoppingBag,
    color: '#059669',
    desc: 'Evaluasi intensi beli (purchase intention), persepsi harga & kualitas, dan dinamika eWOM.',
    theory: 'Theory of Planned Behavior (TPB), Technology Acceptance Model (TAM)'
  },
  {
    id: 'digital_discourse',
    title: 'Wacana & Netiket Netizen',
    badge: 'Linguistik / Komunikasi Digital',
    icon: MessageSquare,
    color: '#7C3AED',
    desc: 'Analisis kesantunan bahasa, penggunaan istilah gaul/slang, sarkasme, dan etika berinternet.',
    theory: 'Politeness Theory (Brown & Levinson), Computer-Mediated Communication'
  },
  {
    id: 'social_psychology',
    title: 'Psikologi Sosial & Dinamika Kelompok',
    badge: 'Psikologi / Sosiologi',
    icon: Brain,
    color: '#DB2777',
    desc: 'Kaji konformitas (efek ikut-ikutan), kemarahan moral kolektif, empati, dan bias atribusi.',
    theory: 'Social Identity Theory, Moral Foundations Theory, Attribution Theory'
  },
  {
    id: 'entman_framing',
    title: 'Analisis Framing Robert Entman',
    badge: 'Tesis S2 / Ilmu Komunikasi',
    icon: Layers,
    color: '#0D9488',
    desc: 'Analisis 4 elemen pembingkaian Entman (1993): Define Problems, Diagnose Causes, Make Moral Judgments, dan Suggest Remedies.',
    theory: 'Entman Framing Theory (1993), Agenda Setting, Social Construction of Reality'
  }
];

const API_BASE = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');
const CORRECT_PIN = '112233';

function PinLockScreen({ onUnlock }) {
  const [pin, setPin] = useState('');
  const [isError, setIsError] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const submitPin = (candidatePin) => {
    if (candidatePin === CORRECT_PIN) {
      setIsSuccess(true);
      setIsError(false);
      setErrorMessage('');
      setTimeout(() => {
        onUnlock(CORRECT_PIN);
      }, 400);
    } else {
      setIsError(true);
      setErrorMessage('PIN salah! Silakan coba lagi.');
      setTimeout(() => {
        setPin('');
        setIsError(false);
      }, 750);
    }
  };

  const handleDigit = (digit) => {
    if (isSuccess || isError || pin.length >= 6) return;
    const next = pin + digit;
    setPin(next);
    if (next.length === 6) {
      submitPin(next);
    }
  };

  const handleDelete = () => {
    if (isSuccess || isError) return;
    setPin((prev) => prev.slice(0, -1));
    setErrorMessage('');
  };

  const handleClear = () => {
    if (isSuccess || isError) return;
    setPin('');
    setErrorMessage('');
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key >= '0' && e.key <= '9') {
        handleDigit(e.key);
      } else if (e.key === 'Backspace') {
        handleDelete();
      } else if (e.key === 'Escape') {
        handleClear();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [pin, isSuccess, isError]);

  return (
    <div className="pin-screen-wrapper">
      <div className={`pin-card ${isError ? 'shake' : ''}`}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '16px' }}>
          <img src="/logo.png" alt="Tesisori" style={{ width: '52px', height: '52px', objectFit: 'contain', marginBottom: '6px' }} />
          <span style={{ fontSize: '20px', fontWeight: 800, color: '#F97316', letterSpacing: '-0.02em', lineHeight: 1.1 }}>Tesisori</span>
          <span style={{ fontSize: '9px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#EA580C' }}>AI Research Workspace</span>
        </div>

        <h2 className="pin-title">
          {isSuccess ? 'Akses Diterima' : 'Masukkan PIN Akses'}
        </h2>
        <p className="pin-subtitle">
          {isSuccess
            ? 'Membuka dashboard Tesisori...'
            : 'Sistem dilindungi keamanan. Masukkan PIN 6-digit untuk membuka aplikasi.'}
        </p>

        {/* 6 Dots Indicator */}
        <div className="pin-dots-container">
          {[0, 1, 2, 3, 4, 5].map((index) => {
            const isFilled = pin.length > index;
            let dotClass = 'pin-dot';
            if (isSuccess) dotClass += ' success';
            else if (isError) dotClass += ' error';
            else if (isFilled) dotClass += ' filled';

            return <div key={index} className={dotClass} />;
          })}
        </div>

        {/* Feedback message */}
        <div className={`pin-feedback ${isError ? 'error' : isSuccess ? 'success' : 'idle'}`}>
          {errorMessage ? (
            <>
              <AlertCircle size={15} />
              <span>{errorMessage}</span>
            </>
          ) : isSuccess ? (
            <>
              <CheckCircle2 size={15} />
              <span>PIN Benar! Membuka dashboard...</span>
            </>
          ) : (
            <span>Ketik PIN langsung atau gunakan keypad</span>
          )}
        </div>

        {/* Numeric Keypad */}
        <div className="pin-keypad">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
            <button
              key={num}
              type="button"
              className="pin-key-btn"
              onClick={() => handleDigit(String(num))}
              disabled={isSuccess || isError}
            >
              {num}
            </button>
          ))}
          <button
            type="button"
            className="pin-key-btn action"
            onClick={handleClear}
            disabled={isSuccess || isError}
            title="Reset"
          >
            Hapus
          </button>
          <button
            type="button"
            className="pin-key-btn"
            onClick={() => handleDigit('0')}
            disabled={isSuccess || isError}
          >
            0
          </button>
          <button
            type="button"
            className="pin-key-btn action"
            onClick={handleDelete}
            disabled={isSuccess || isError}
            title="Backspace"
          >
            ⌫
          </button>
        </div>

        <div className="pin-helper-note">
          🔒 Sesi akan tersimpan aman di browser Anda
        </div>
      </div>
    </div>
  );
}

export default function App() {
  // Navigation State
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard' | 'results' | 'ai-analysis' | 'files' | 'settings'
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Platform Selector State (Prepared for multi-platform)
  const [selectedPlatform, setSelectedPlatform] = useState('tiktok');
  const [igCookie, setIgCookie] = useState(() => {
    try {
      return localStorage.getItem('ig_cookie') || '';
    } catch {
      return '';
    }
  });

  // Backend & File State
  const [files, setFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState('');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [serverOnline, setServerOnline] = useState(false);

  // Dashboard Scraper Form State
  const [scrapeInput, setScrapeInput] = useState('');
  const [isScraping, setIsScraping] = useState(false);
  const [scrapeError, setScrapeError] = useState('');
  const [scrapeSuccess, setScrapeSuccess] = useState(null);

  // Results & Filters State
  const [searchKeyword, setSearchKeyword] = useState('');
  const [searchScope, setSearchScope] = useState('all'); // 'all' | 'comments' | 'replies'
  const [caseSensitive, setCaseSensitive] = useState(false);
  const [hasRepliesOnly, setHasRepliesOnly] = useState(false);
  const [sortBy, setSortBy] = useState('newest'); // 'newest' | 'oldest' | 'most_replies'

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  // AI Analysis State
  const [analysisType, setAnalysisType] = useState('emotion_marketing');
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiSampleSize, setAiSampleSize] = useState(50);
  const [aiModel, setAiModel] = useState('clario/gemini-3.7-flash');
  const [aiError, setAiError] = useState('');
  const [copiedThesisText, setCopiedThesisText] = useState(false);

  // Reset page when any filter or selected file changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchKeyword, searchScope, caseSensitive, hasRepliesOnly, sortBy, selectedFile]);

  // Comments Thread UI State
  const [expandedReplies, setExpandedReplies] = useState(new Set());
  const [copiedId, setCopiedId] = useState(null);
  const [showExportStatsModal, setShowExportStatsModal] = useState(false);
  const [showCitationModal, setShowCitationModal] = useState(false);
  const [showInterCoderModal, setShowInterCoderModal] = useState(false);
  const [verbatimModalComment, setVerbatimModalComment] = useState(null);
  const [verbatimModalIndex, setVerbatimModalIndex] = useState(1);

  const fileInputRef = useRef(null);

  // Firebase Authentication & User State
  const [currentUser, setCurrentUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const userMenuRef = useRef(null);

  // Close user dropdown when clicking outside
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setShowUserDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  // Listen to Firebase Auth state changes
  useEffect(() => {
    const unsubscribe = subscribeToAuth((user) => {
      setCurrentUser(user);
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    setShowUserDropdown(false);
    await logoutUser();
    setCurrentUser(null);
    setFiles([]);
    setData(null);
    setSelectedFile('');
    setAiAnalysis(null);
  };

  // Fetch private files belonging to current user from Firestore
  useEffect(() => {
    if (currentUser) {
      fetchFilesList();
    }
  }, [currentUser]);

  const fetchFilesList = async () => {
    if (!currentUser) return;
    try {
      // 1. Fetch user's private scrapes from Firestore
      const userScrapes = await getUserScrapes(currentUser.uid);

      // 2. Check local server connection in background
      try {
        const ping = await fetch(`${API_BASE}/api/status`);
        if (ping.ok) setServerOnline(true);
        else setServerOnline(false);
      } catch {
        setServerOnline(false);
      }

      setFiles(userScrapes);

      if (userScrapes.length > 0) {
        if (!selectedFile || !userScrapes.some((f) => f.filename === selectedFile)) {
          loadFileContent(userScrapes[0].filename);
        }
      } else {
        setData(null);
        setSelectedFile('');
      }
    } catch (err) {
      console.error('Error fetching private user files:', err);
    }
  };

  const loadFileContent = async (filename, switchTab = false) => {
    if (!filename || !currentUser) return;
    setLoading(true);
    try {
      // 1. Check user's private Firestore document first
      const docData = await getUserScrapeContent(currentUser.uid, filename);
      if (docData && docData.comments && docData.comments.length > 0) {
        setData(docData);
        setSelectedFile(filename);
        loadAiAnalysis(filename, analysisType);
        if (switchTab) {
          setActiveTab('results');
        }
        return;
      }

      // 2. Fallback to local server API if not yet synced
      const res = await fetch(`${API_BASE}/api/files/${encodeURIComponent(filename)}`, {
        headers: { 'X-Access-Pin': CORRECT_PIN }
      });
      if (res.ok) {
        const json = await res.json();
        setData(json);
        setSelectedFile(filename);

        // Auto-save to user's private Firestore collection
        await saveUserScrape(currentUser.uid, {
          filename,
          caption: json.caption || '',
          video_url: json.video_url || '',
          comments: json.comments || []
        });

        loadAiAnalysis(filename, analysisType);
        if (switchTab) {
          setActiveTab('results');
        }
      }
    } catch (err) {
      console.error('Error loading file content:', err);
    } finally {
      setLoading(false);
    }
  };

  // Load cached AI analysis from Firestore or server
  const loadAiAnalysis = async (filename, type = analysisType) => {
    if (!filename || !currentUser) return;
    try {
      // 1. Check user's private Firestore document for cached AI result
      const cached = await getUserAiAnalysis(currentUser.uid, filename, type);
      if (cached) {
        setAiAnalysis(cached);
        return;
      }

      // 2. Check local server API cache
      const res = await fetch(`${API_BASE}/api/ai/analysis/${encodeURIComponent(filename)}?type=${encodeURIComponent(type)}`, {
        headers: { 'X-Access-Pin': CORRECT_PIN }
      });
      if (res.ok) {
        const json = await res.json();
        if (json.found) {
          setAiAnalysis(json.analysis);
          // Persist to user's private Firestore document
          await saveUserAiAnalysis(currentUser.uid, filename, type, json.analysis);
        } else {
          setAiAnalysis(null);
        }
      }
    } catch (err) {
      console.error('Error loading cached AI analysis:', err);
    }
  };

  const handleFrameworkChange = (newType) => {
    setAnalysisType(newType);
    if (selectedFile) {
      loadAiAnalysis(selectedFile, newType);
    }
  };

  // Trigger fresh AI analysis and save privately to Firestore
  const runAiAnalysis = async () => {
    if (!selectedFile || !currentUser) return;
    setAiLoading(true);
    setAiError('');
    try {
      const res = await fetch(`${API_BASE}/api/ai/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Access-Pin': CORRECT_PIN
        },
        body: JSON.stringify({
          filename: selectedFile,
          sample_size: aiSampleSize,
          model: aiModel,
          analysis_type: analysisType
        })
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || 'Gagal melakukan analisis AI');
      }
      setAiAnalysis(json.analysis);

      // Save analysis privately to Firestore
      await saveUserAiAnalysis(currentUser.uid, selectedFile, analysisType, json.analysis);
    } catch (err) {
      setAiError(err.message);
    } finally {
      setAiLoading(false);
    }
  };

  // Delete a dataset from user account
  const handleDeleteUserFile = async (filename) => {
    if (!currentUser) return;
    const displayName = filename.replace(/\.json$/i, '');
    if (!confirm(`Hapus dataset "${displayName}" dari akun Anda? Data ini akan dihapus secara permanen.`)) {
      return;
    }
    try {
      await deleteUserScrape(currentUser.uid, filename);
      if (selectedFile === filename) {
        setData(null);
        setSelectedFile('');
      }
      fetchFilesList();
    } catch (err) {
      alert('Gagal menghapus file: ' + err.message);
    }
  };

  // Export AI Report as Markdown (.md)
  const exportAiReportMarkdown = () => {
    if (!aiAnalysis) return;
    const r = aiAnalysis.result;
    const type = aiAnalysis.analysis_type || 'emotion_marketing';
    const fwMeta = FRAMEWORKS_LIST.find((f) => f.id === type) || FRAMEWORKS_LIST[0];

    let md = `# Laporan Analisis AI Skripsi: ${fwMeta.title}\n\n`;
    md += `**Fokus Bidang:** ${fwMeta.badge}\n`;
    md += `**File:** \`${aiAnalysis.filename}\`\n`;
    md += `**Sampel Dianalisis:** ${aiAnalysis.sample_analyzed} dari ${aiAnalysis.total_comments} komentar\n`;
    md += `**Landasan Teori:** ${fwMeta.theory}\n\n`;
    md += `---\n\n`;

    if (type === 'public_sentiment') {
      md += `## 1. Konteks Isu & Audit Krisis Citra\n`;
      md += `- **Premis Isu:** ${r.context_summary?.issue_premise || '-'}\n`;
      md += `- **Entitas/Brand Terkait:** ${r.context_summary?.public_entity_or_brand || '-'}\n`;
      md += `- **Tingkat Ancaman Krisis:** **${r.context_summary?.crisis_threat_level || '-'}**\n`;
      md += `- **Skor Kepercayaan Publik:** **${r.reputation_audit?.trust_score_pct}%**\n`;
      md += `- **Status Persepsi:** ${r.reputation_audit?.public_perception_verdict || '-'}\n\n`;

      md += `## 2. Metrik Distribusi Sentimen Publik\n`;
      md += `- Sentimen Positif: ${r.sentiment_metrics?.positive_pct}%\n`;
      md += `- Sentimen Netral: ${r.sentiment_metrics?.neutral_pct}%\n`;
      md += `- Sentimen Negatif: ${r.sentiment_metrics?.negative_pct}%\n`;
      md += `- Sentimen Kritis/Menuntut: ${r.sentiment_metrics?.critical_pct}%\n`;
      md += `*Sentimen Dominan:* **${r.sentiment_metrics?.dominant_sentiment}**\n`;
      md += `*Dinamika Momentum:* ${r.sentiment_metrics?.sentiment_momentum}\n\n`;

      if (r.reputation_audit?.key_grievances?.length) {
        md += `### Poin Kritik & Kekecewaan Publik Terbesar:\n`;
        r.reputation_audit.key_grievances.forEach((g) => { md += `- ${g}\n`; });
        md += `\n`;
      }
      if (r.pr_crisis_recommendations) {
        md += `## 3. Rekomendasi Manajemen Krisis PR\n`;
        md += `- **Tipe Krisis:** ${r.pr_crisis_recommendations.crisis_type_detected}\n`;
        md += `- **Strategi Respons Disarankan:** ${r.pr_crisis_recommendations.recommended_response_strategy}\n`;
        if (r.pr_crisis_recommendations.holding_statement_draft) {
          md += `\n> **Draf Pernyataan Resmi / Holding Statement:**\n> "${r.pr_crisis_recommendations.holding_statement_draft}"\n\n`;
        }
      }
    } else if (type === 'consumer_behavior') {
      md += `## 1. Konteks Produk & Nilai Manfaat\n`;
      md += `- **Produk / Brand:** ${r.context_summary?.product_or_brand || '-'}\n`;
      md += `- **Persepsi Nilai Manfaat:** ${r.context_summary?.value_proposition_perceived || '-'}\n`;
      md += `- **Daya Tarik Pasar:** ${r.context_summary?.market_appeal_summary || '-'}\n\n`;

      md += `## 2. Metrik Intensi Beli & Persepsi Konsumen\n`;
      md += `- Minat Beli Tinggi: **${r.purchase_intent_metrics?.high_intent_pct}%**\n`;
      md += `- Penasaran / Butuh Info Lanjut: **${r.purchase_intent_metrics?.moderate_curious_pct}%**\n`;
      md += `- Skeptis Harga: **${r.purchase_intent_metrics?.price_skeptic_pct}%**\n`;
      md += `- Menolak / Tidak Tertarik: **${r.purchase_intent_metrics?.resistant_uninterested_pct}%**\n`;
      md += `*Kesimpulan Intensi:* **${r.purchase_intent_metrics?.purchase_intent_verdict}**\n\n`;

      md += `### Persepsi Konsumen Terhadap Kualitas & Harga:\n`;
      md += `- Persepsi Kualitas: ${r.consumer_perception?.perceived_quality || '-'}\n`;
      md += `- Kewajaran Harga: ${r.consumer_perception?.price_fairness_perception || '-'}\n`;
      md += `- Kredibilitas & Kepercayaan: ${r.consumer_perception?.trust_and_credibility || '-'}\n`;
      if (r.consumer_perception?.primary_purchase_barriers?.length) {
        md += `- **Hambatan Konversi:** ${r.consumer_perception.primary_purchase_barriers.join('; ')}\n`;
      }
      md += `\n`;
    } else if (type === 'digital_discourse') {
      md += `## 1. Konteks Situasi Komunikasi & Wacana\n`;
      md += `- **Situasi Komunikasi:** ${r.context_summary?.communicative_situation || '-'}\n`;
      md += `- **Wacana Sentral:** ${r.context_summary?.discourse_topic || '-'}\n`;
      md += `- **Iklim Komunikasi:** **${r.context_summary?.communication_climate || '-'}**\n\n`;

      md += `## 2. Tingkat Kesantunan & Nada Tutur Netizen\n`;
      md += `- Santun & Konstruktif: **${r.politeness_and_tone?.polite_constructive_pct}%**\n`;
      md += `- Netral / Informatif: **${r.politeness_and_tone?.neutral_informative_pct}%**\n`;
      md += `- Sarkastik / Satir: **${r.politeness_and_tone?.sarcastic_satirical_pct}%**\n`;
      md += `- Agresif / Toxic: **${r.politeness_and_tone?.aggressive_toxic_pct}%**\n`;
      md += `*Nada Dominan:* **${r.politeness_and_tone?.dominant_tone}**\n\n`;

      md += `### Karakteristik Linguistik & Netiket:\n`;
      md += `- **Tingkat Kepatuhan Netiket:** ${r.linguistic_features?.netiquette_compliance_level || '-'}\n`;
      md += `- **Risiko Flaming / Cyberbullying:** ${r.linguistic_features?.flaming_and_cyberbullying_risk || '-'}\n`;
      md += `- **Gaya Bahasa Utama:** ${r.linguistic_features?.rhetorical_devices_used || '-'}\n`;
      if (r.linguistic_features?.prominent_slang_and_jargon?.length) {
        md += `- **Slang / Kosakata Khas Netizen:** ${r.linguistic_features.prominent_slang_and_jargon.join(', ')}\n`;
      }
      md += `\n`;
    } else if (type === 'social_psychology') {
      md += `## 1. Konteks Stimulus Sosial & Fenomena Massa\n`;
      md += `- **Stimulus Sosial:** ${r.context_summary?.social_stimulus || '-'}\n`;
      md += `- **Fenomena Kelompok Teramati:** ${r.context_summary?.social_phenomenon_observed || '-'}\n`;
      md += `- **Ketegangan Psikologis:** ${r.context_summary?.psychological_tension || '-'}\n\n`;

      md += `## 2. Metrik Psikologis Penonton\n`;
      md += `- Kemarahan Moral Kolektif: **${r.psychological_metrics?.moral_outrage_pct}%**\n`;
      md += `- Konformitas (Efek Ikut-ikutan): **${r.psychological_metrics?.conformity_bandwagon_pct}%**\n`;
      md += `- Empati Sosial: **${r.psychological_metrics?.social_empathy_pct}%**\n`;
      md += `- Apati / Sikap Acuh: **${r.psychological_metrics?.apathy_detachment_pct}%**\n`;
      md += `*Kondisi Psikologis Dominan:* **${r.psychological_metrics?.dominant_psychological_state}**\n\n`;

      md += `### Pola Atribusi & Bias Kognitif:\n`;
      md += `- **Target Atribusi:** ${r.attribution_and_bias?.attribution_target || '-'}\n`;
      md += `- **Bias Kognitif Terdeteksi:** ${r.attribution_and_bias?.cognitive_bias_detected || '-'}\n`;
      md += `- **Pertimbangan Moralitas:** ${r.attribution_and_bias?.moral_judgment_summary || '-'}\n\n`;
    } else if (type === 'entman_framing') {
      md += `## 1. Ikhtisar Pembingkaian Wacana (Framing Overview)\n`;
      md += `- **Isu Sentral:** ${r.framing_overview?.central_issue || '-'}\n`;
      md += `- **Frame Dominan:** **${r.framing_overview?.dominant_frame_name || '-'}**\n`;
      md += `- **Intensitas Framing:** ${r.framing_overview?.framing_intensity || '-'}\n`;
      md += `> ${r.framing_overview?.framing_summary || ''}\n\n`;

      md += `## 2. Analisis 4 Dimensi Robert Entman (1993)\n\n`;
      const dims = r.entman_dimensions || {};
      if (dims.define_problems) {
        md += `### A. Define Problems (Mendefinisikan Masalah)\n`;
        md += `- **Definisi Dominan:** ${dims.define_problems.dominant_definition}\n`;
        md += `${dims.define_problems.explanation}\n`;
        (dims.define_problems.problem_aspects || []).forEach(a => {
          md += `  - ${a.aspect} (${a.pct}%)${a.sample_quote ? ` — "${a.sample_quote}"` : ''}\n`;
        });
        md += `\n`;
      }
      if (dims.diagnose_causes) {
        md += `### B. Diagnose Causes (Mendiagnosis Penyebab & Aktor)\n`;
        md += `- **Aktor/Faktor Utama:** **${dims.diagnose_causes.primary_culprit}**\n`;
        md += `${dims.diagnose_causes.explanation}\n`;
        (dims.diagnose_causes.cause_attributions || []).forEach(c => {
          md += `  - ${c.cause} (${c.pct}%)${c.sample_quote ? ` — "${c.sample_quote}"` : ''}\n`;
        });
        md += `\n`;
      }
      if (dims.make_moral_judgments) {
        md += `### C. Make Moral Judgments (Membuat Penilaian Moral)\n`;
        md += `- **Sikap Moral Publik:** **${dims.make_moral_judgments.moral_verdict}**\n`;
        md += `${dims.make_moral_judgments.explanation}\n`;
        (dims.make_moral_judgments.moral_evaluations || []).forEach(m => {
          md += `  - ${m.judgment} (${m.pct}%)${m.sample_quote ? ` — "${m.sample_quote}"` : ''}\n`;
        });
        md += `\n`;
      }
      if (dims.suggest_remedies) {
        md += `### D. Suggest Remedies (Menekankan Solusi & Tuntutan)\n`;
        md += `- **Tuntutan Dominan:** **${dims.suggest_remedies.dominant_remedy}**\n`;
        md += `${dims.suggest_remedies.explanation}\n`;
        (dims.suggest_remedies.remedy_proposals || []).forEach(rp => {
          md += `  - ${rp.proposal} (${rp.pct}%)${rp.sample_quote ? ` — "${rp.sample_quote}"` : ''}\n`;
        });
        md += `\n`;
      }

      if (r.counter_frames) {
        md += `### Frame Tandingan (Counter-Frame):\n`;
        md += `- **Nama Frame Tandingan:** ${r.counter_frames.counter_frame_name} (${r.counter_frames.counter_frame_pct}%)\n`;
        md += `> ${r.counter_frames.counter_frame_argument || ''}\n\n`;
      }
    } else {
      // Default: Emotion-driven marketing
      md += `## 1. Konteks Narasi & Strategi Pemasaran\n`;
      md += `- **Premis Video:** ${r.video_context?.premise || '-'}\n`;
      md += `- **Produk/Brand:** ${r.video_context?.product_or_brand || '-'}\n`;
      md += `- **Strategi Terdeteksi:** ${r.video_context?.marketing_strategy_detected || '-'}\n\n`;

      md += `## 2. Kesadaran Iklan (Ad-Awareness Ratio)\n`;
      md += `- Terkecoh/Terhanyut Drama: **${r.ad_awareness?.drama_engaged_pct}%**\n`;
      md += `- Sadar Iklan / Bongkar Marketing: **${r.ad_awareness?.marketing_aware_pct}%**\n`;
      md += `- Membahas Produk: **${r.ad_awareness?.product_focus_pct}%**\n`;
      md += `> ${r.ad_awareness?.analysis || ''}\n\n`;

      md += `## 3. Distribusi Emosi Penonton\n`;
      md += `- Kemarahan (Outrage): ${r.emotion_distribution?.anger_pct}%\n`;
      md += `- Simpati / Iba: ${r.emotion_distribution?.sympathy_pct}%\n`;
      md += `- Skeptis (Settingan): ${r.emotion_distribution?.skepticism_pct}%\n`;
      md += `- Sarkasme: ${r.emotion_distribution?.sarcasm_pct}%\n`;
      md += `- Netral: ${r.emotion_distribution?.neutral_pct}%\n`;
      md += `*Emosi Dominan:* **${r.emotion_distribution?.dominant_emotion}** (${r.emotion_distribution?.dominant_emotion_explanation})\n\n`;
    }

    md += `## ${type === 'emotion_marketing' ? '4' : '3'}. Polarisasi Kubu (Stance Dynamics)\n`;
    md += `- ${r.stance_dynamics?.side_a_name}: ${r.stance_dynamics?.side_a_pct}%\n`;
    md += `- ${r.stance_dynamics?.side_b_name}: ${r.stance_dynamics?.side_b_pct}%\n`;
    md += `- Netral: ${r.stance_dynamics?.neutral_pct}%\n`;
    md += `- Tingkat Kontroversi: **${r.stance_dynamics?.controversy_level || 'Sedang'}**\n`;
    md += `> ${r.stance_dynamics?.polarization_summary || ''}\n\n`;

    md += `## ${type === 'emotion_marketing' ? '5' : '4'}. Klaster Topik Pembicaraan Netizen\n`;
    (r.topic_clusters || []).forEach((tc, i) => {
      md += `### ${i+1}. ${tc.topic_name} (${tc.pct}%)\n`;
      md += `${tc.description}\n`;
      if (tc.sample_quote) {
        md += `> "${tc.sample_quote}"\n\n`;
      }
    });

    md += `## ${type === 'emotion_marketing' ? '6' : '5'}. Ringkasan Temuan Skripsi (Academic Synthesis)\n`;
    (r.academic_insights?.key_findings || []).forEach((kf) => {
      md += `- ${kf}\n`;
    });
    if (r.academic_insights?.brand_hijack_verdict) {
      md += `\n**Verdict Brand:** ${r.academic_insights.brand_hijack_verdict}\n`;
    }
    if (r.academic_insights?.theoretical_relevance) {
      md += `\n**Relevansi Teori:** ${r.academic_insights.theoretical_relevance}\n\n`;
    }
    md += `### Paragraf Pembahasan Skripsi (Bab 4):\n`;
    md += `${r.academic_insights?.thesis_summary_paragraph}\n`;

    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `laporan_skripsi_${type}_${selectedFile.replace('.json', '')}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Drag & drop or file upload handler (persists privately to user's Firestore)
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file || !currentUser) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const parsed = JSON.parse(event.target.result);
        if (parsed.comments && Array.isArray(parsed.comments)) {
          // Persist privately in Firestore
          await saveUserScrape(currentUser.uid, {
            filename: file.name,
            caption: parsed.caption || '',
            video_url: parsed.video_url || '',
            comments: parsed.comments,
            platform: parsed.platform || 'tiktok'
          });

          setData(parsed);
          setSelectedFile(file.name);
          loadAiAnalysis(file.name);
          await fetchFilesList();
          setActiveTab('results');
        } else {
          alert('Format data tidak sesuai: tidak ditemukan kolom komentar.');
        }
      } catch (err) {
        alert('File dataset tidak dapat dibaca: ' + err.message);
      }
    };
    reader.readAsText(file);
  };

  // Live Scraping trigger from Dashboard form
  const handleScrapeSubmit = async (e) => {
    e.preventDefault();
    if (!scrapeInput.trim()) return;
    if (!currentUser) return;

    if (selectedPlatform === 'instagram' && !igCookie.trim()) {
      setScrapeError('Cookie Instagram wajib diisi untuk mengambil komentar Instagram.');
      return;
    }

    setIsScraping(true);
    setScrapeError('');
    setScrapeSuccess(null);

    try {
      const payload = {
        platform: selectedPlatform,
        url: scrapeInput.trim(),
        aweme_id: scrapeInput.trim()
      };
      if (selectedPlatform === 'instagram') {
        payload.cookie = igCookie.trim();
      }

      const res = await fetch(`${API_BASE}/api/scrape`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Access-Pin': CORRECT_PIN
        },
        body: JSON.stringify(payload)
      });

      const result = await res.json();
      if (!res.ok) {
        throw new Error(result.error || 'Scraping gagal');
      }

      // Save privately to Firestore for this specific user account
      await saveUserScrape(currentUser.uid, {
        filename: result.filename,
        caption: result.data?.caption || '',
        video_url: result.data?.video_url || '',
        comments: result.data?.comments || [],
        platform: result.platform || selectedPlatform
      });

      setData(result.data);
      setSelectedFile(result.filename);
      setScrapeSuccess({
        filename: result.filename,
        commentsCount: result.data?.comments?.length || 0,
        caption: result.data?.caption || '',
        platform: result.platform || selectedPlatform
      });
      loadAiAnalysis(result.filename);
      await fetchFilesList();
    } catch (err) {
      setScrapeError(err.message);
    } finally {
      setIsScraping(false);
    }
  };

  // Toggle replies expanded
  const toggleReply = (commentId) => {
    setExpandedReplies((prev) => {
      const next = new Set(prev);
      if (next.has(commentId)) {
        next.delete(commentId);
      } else {
        next.add(commentId);
      }
      return next;
    });
  };

  // Copy comment text
  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1800);
  };

  // Copy thesis paragraph
  const copyThesisParagraph = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedThesisText(true);
    setTimeout(() => setCopiedThesisText(false), 2000);
  };

  // Top Keywords Extraction
  const topKeywords = useMemo(() => {
    if (!data?.comments) return [];
    const counts = {};

    data.comments.forEach((c) => {
      const extractWords = (str) => {
        if (!str) return;
        const words = str
          .toLowerCase()
          .replace(/[^\w\s]/gi, ' ')
          .split(/\s+/);
        words.forEach((w) => {
          if (w.length > 2 && !STOPWORDS.has(w) && !/^\d+$/.test(w)) {
            counts[w] = (counts[w] || 0) + 1;
          }
        });
      };

      extractWords(c.comment);
      if (c.replies) {
        c.replies.forEach((r) => extractWords(r.comment));
      }
    });

    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 15)
      .map(([word, count]) => ({ word, count }));
  }, [data]);

  // Highlight Text Helper
  const renderHighlighted = (text, keyword) => {
    if (!keyword.trim() || !text) return text;

    const terms = keyword
      .split(',')
      .map((k) => k.trim())
      .filter(Boolean);

    if (terms.length === 0) return text;

    const escaped = terms.map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|');
    const regex = new RegExp(`(${escaped})`, caseSensitive ? 'g' : 'gi');

    const parts = text.split(regex);
    return parts.map((part, i) =>
      regex.test(part) ? (
        <mark key={i} className="highlight-text">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  // Check if string matches keyword
  const textMatches = (text, keyword) => {
    if (!keyword.trim() || !text) return false;
    const terms = keyword
      .split(',')
      .map((k) => (caseSensitive ? k.trim() : k.trim().toLowerCase()))
      .filter(Boolean);

    const target = caseSensitive ? text : text.toLowerCase();
    return terms.some((term) => target.includes(term));
  };

  // Filtered comments logic
  const filteredComments = useMemo(() => {
    if (!data?.comments) return [];

    let list = data.comments.filter((item) => {
      if (hasRepliesOnly) {
        const replyCount = item.total_reply || (item.replies ? item.replies.length : 0);
        if (replyCount <= 0) return false;
      }

      if (!searchKeyword.trim()) return true;

      const commentMatch = textMatches(item.comment, searchKeyword);
      const replyMatch = (item.replies || []).some((r) =>
        textMatches(r.comment, searchKeyword)
      );

      if (searchScope === 'comments') {
        return commentMatch;
      } else if (searchScope === 'replies') {
        return replyMatch;
      } else {
        return commentMatch || replyMatch;
      }
    });

    list = [...list].sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.create_time || 0) - new Date(a.create_time || 0);
      } else if (sortBy === 'oldest') {
        return new Date(a.create_time || 0) - new Date(b.create_time || 0);
      } else if (sortBy === 'most_replies') {
        const countA = a.total_reply || (a.replies?.length || 0);
        const countB = b.total_reply || (b.replies?.length || 0);
        return countB - countA;
      }
      return 0;
    });

    return list;
  }, [data, searchKeyword, searchScope, caseSensitive, hasRepliesOnly, sortBy]);

  // Pagination Calculations
  const totalPages = Math.ceil(filteredComments.length / pageSize) || 1;

  const paginatedComments = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredComments.slice(start, start + pageSize);
  }, [filteredComments, currentPage, pageSize]);

  const getPageNumbers = () => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    if (currentPage <= 4) {
      return [1, 2, 3, 4, 5, '...', totalPages];
    }
    if (currentPage >= totalPages - 3) {
      return [1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    }
    return [1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages];
  };

  // Statistics for current selected video
  const stats = useMemo(() => {
    if (!data?.comments) return { totalComments: 0, totalReplies: 0, totalUsers: 0 };
    let repliesCount = 0;
    const users = new Set();

    data.comments.forEach((c) => {
      if (c.username) users.add(c.username);
      if (c.replies) {
        repliesCount += c.replies.length;
        c.replies.forEach((r) => {
          if (r.username) users.add(r.username);
        });
      } else if (c.total_reply) {
        repliesCount += c.total_reply;
      }
    });

    return {
      totalComments: data.comments.length,
      totalReplies: repliesCount,
      totalUsers: users.size
    };
  }, [data]);

  // Aggregate stats across all scraped files
  const totalScrapedStats = useMemo(() => {
    let totalVideos = files.length;
    let totalStoredComments = 0;
    files.forEach((f) => {
      totalStoredComments += f.comments_count || 0;
    });
    return { totalVideos, totalStoredComments };
  }, [files]);

  // Export to CSV
  const exportToCSV = () => {
    if (!filteredComments || filteredComments.length === 0) {
      alert('Tidak ada komentar yang cocok untuk diekspor.');
      return;
    }

    const headers = ['Tipe', 'Comment ID', 'Username', 'Nickname', 'Tanggal', 'Komentar', 'Jumlah Balasan', 'Parent ID'];
    const rows = [];

    filteredComments.forEach((c) => {
      rows.push([
        'Komentar Utama',
        `"${c.comment_id || ''}"`,
        `"${(c.username || '').replace(/"/g, '""')}"`,
        `"${(c.nickname || '').replace(/"/g, '""')}"`,
        `"${c.create_time || ''}"`,
        `"${(c.comment || '').replace(/"/g, '""')}"`,
        c.total_reply || (c.replies ? c.replies.length : 0),
        ''
      ]);

      if (c.replies && c.replies.length > 0) {
        c.replies.forEach((r) => {
          rows.push([
            'Balasan',
            `"${r.comment_id || ''}"`,
            `"${(r.username || '').replace(/"/g, '""')}"`,
            `"${(r.nickname || '').replace(/"/g, '""')}"`,
            `"${r.create_time || ''}"`,
            `"${(r.comment || '').replace(/"/g, '""')}"`,
            0,
            `"${c.comment_id || ''}"`
          ]);
        });
      }
    });

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `tiktok_comments_${selectedFile.replace('.json', '')}_filtered.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export to JSON
  const exportToJSON = () => {
    if (!filteredComments || filteredComments.length === 0) return;
    const exportData = {
      caption: data.caption,
      video_url: data.video_url,
      filter_keyword: searchKeyword,
      total_filtered: filteredComments.length,
      comments: filteredComments
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `tiktok_comments_${selectedFile.replace('.json', '')}_filtered.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Helper date formatter
  const formatDate = (isoStr) => {
    if (!isoStr) return '-';
    try {
      const d = new Date(isoStr);
      const datePart = d.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
      const hours = String(d.getHours()).padStart(2, '0');
      const minutes = String(d.getMinutes()).padStart(2, '0');
      return `${datePart}, ${hours}.${minutes}`;
    } catch {
      return isoStr;
    }
  };

  // Nav item helper
  const handleNavClick = (tabId) => {
    setActiveTab(tabId);
    setIsMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (authLoading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#F8FAFC' }}>
        <img src="/logo.png" alt="Tassiori Logo" style={{ width: '48px', height: '48px', objectFit: 'contain', marginBottom: '12px' }} />
        <span style={{ fontSize: '13px', fontWeight: 600, color: '#64748B' }}>Menghubungkan ke Firebase...</span>
      </div>
    );
  }

  if (!currentUser) {
    return <AuthScreen onAuthSuccess={(user) => setCurrentUser(user)} />;
  }

  return (
    <div className="app-shell">
      {/* Sidebar Navigation */}
      <aside className={`app-sidebar ${isMobileMenuOpen ? 'open' : ''}`}>
        {/* Brand */}
        <div className="sidebar-brand">
          <div className="brand-icon-square brand-icon-tesisori">
            <img src="/logo.png" alt="Tassiori Logo" style={{ width: '34px', height: '34px', objectFit: 'contain' }} />
          </div>
          <div className="brand-title-wrap">
            <h1 className="brand-tesisori-title">Tassiori</h1>
            <p className="brand-tesisori-sub">AI RESEARCH WORKSPACE</p>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="sidebar-nav">
          <button
            className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => handleNavClick('dashboard')}
          >
            <LayoutDashboard size={18} />
            <span>Dashboard</span>
          </button>

          <button
            className={`nav-item ${activeTab === 'results' ? 'active' : ''}`}
            onClick={() => handleNavClick('results')}
          >
            <MessageSquare size={18} />
            <span>Hasil Komentar</span>
            {data?.comments?.length ? (
              <span className="nav-badge-pill">{data.comments.length}</span>
            ) : files.length > 0 && files[0]?.comments_count ? (
              <span className="nav-badge-pill">{files[0].comments_count}</span>
            ) : (
              <span className="nav-badge-pill">0</span>
            )}
          </button>

          <button
            className={`nav-item ${activeTab === 'ai-analysis' ? 'active' : ''}`}
            onClick={() => handleNavClick('ai-analysis')}
          >
            <Brain size={18} />
            <span>Analisis AI (Skripsi)</span>
            <span className="nav-badge-pill badge-ai">AI</span>
          </button>

          <button
            className={`nav-item ${activeTab === 'files' ? 'active' : ''}`}
            onClick={() => handleNavClick('files')}
          >
            <FolderArchive size={18} />
            <span>Riwayat File</span>
            <span className="nav-badge-pill">{files.length}</span>
          </button>

          <div className="nav-section-title">SISTEM</div>

          <button
            className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => handleNavClick('settings')}
          >
            <Settings size={18} />
            <span>Pengaturan</span>
          </button>
        </nav>

        {/* Sidebar Footer */}
        <div className="sidebar-footer">
          <div className="sidebar-footer-row">
            <span className="sidebar-server-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <ShieldCheck size={14} color="#16A34A" /> Ruang Riset Privat
            </span>
            <span className="badge-status-pill online">
              <span className="status-dot" /> Aktif
            </span>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="app-main">
        {/* Top Navbar */}
        <header className="top-navbar-clean">
          <div className="navbar-left">
            <button
              className="btn-mobile-menu"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              title="Toggle Menu"
            >
              <Menu size={20} />
            </button>
          </div>

          <div className="navbar-right">
            <button
              className="btn-pill-header"
              onClick={() => fileInputRef.current?.click()}
              title="Unggah dataset penelitian dari komputer ke akun Anda"
            >
              <Upload size={14} />
              <span>Unggah Dataset</span>
            </button>

            {/* User Profile Menu with Google / Email Dropdown */}
            <div className="user-menu-wrapper" ref={userMenuRef}>
              <button
                className="btn-pill-user"
                onClick={() => setShowUserDropdown(!showUserDropdown)}
                title={`Akun: ${currentUser.email}`}
              >
                {currentUser.photoURL ? (
                  <img src={currentUser.photoURL} alt="Avatar" className="user-avatar-img" />
                ) : (
                  <div className="user-avatar-placeholder">
                    {(currentUser.displayName || currentUser.email || 'U')[0].toUpperCase()}
                  </div>
                )}
                <span>
                  {currentUser.displayName
                    ? currentUser.displayName.split(' ')[0]
                    : currentUser.email.split('@')[0]}
                </span>
                <ChevronDown size={13} style={{ opacity: 0.6 }} />
              </button>

              {showUserDropdown && (
                <div className="user-dropdown-menu">
                  <div className="user-dropdown-header">
                    <div className="user-dropdown-name">
                      {currentUser.displayName || 'Peneliti'}
                    </div>
                    <div className="user-dropdown-email">{currentUser.email}</div>
                    <div className="user-dropdown-badge">
                      <ShieldCheck size={12} />
                      <span>Ruang Riset Privat</span>
                    </div>
                  </div>
                  <button
                    className="user-dropdown-action"
                    onClick={handleLogout}
                  >
                    <LogOut size={15} />
                    <span>Keluar (Logout)</span>
                  </button>
                </div>
              )}
            </div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept=".json"
              style={{ display: 'none' }}
            />
          </div>
        </header>

        {/* Page Container */}
        <main className="page-container">
          {/* ====================================================================
              TAB 1: DASHBOARD (FORM INPUT LINK & PLATFORM SELECTOR)
              ==================================================================== */}
          {activeTab === 'dashboard' && (
            <div>
              {/* Hero Banner */}
              <div className="dashboard-hero-clean">
                <div className="dashboard-eyebrow">DASHBOARD</div>
                <h1 className="dashboard-main-heading">Mulai Scraping Komentar Baru</h1>
                <p className="dashboard-main-sub">
                  Pilih platform dan masukkan tautan video untuk mengambil semua komentar dan balasan secara instan.
                </p>
              </div>

              {/* Main Scraper Card */}
              <section className="scraper-main-card">
                {/* Platform Selector Chips */}
                <div className="platform-selector-section">
                  <span className="platform-label-clean">Platform</span>
                  <div className="platform-chips-row">
                    <button
                      type="button"
                      className={`platform-chip-btn ${selectedPlatform === 'tiktok' ? 'active' : ''}`}
                      onClick={() => setSelectedPlatform('tiktok')}
                    >
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M19.589 6.686a4.793 4.793 0 0 1-3.77-4.245V2h-3.445v13.672a2.896 2.896 0 0 1-5.201 1.743l-.068-.102a2.895 2.895 0 0 1 2.374-4.536c.313 0 .618.05.904.144V9.324a6.34 6.34 0 0 0-.904-.065c-3.528 0-6.387 2.86-6.387 6.388 0 3.528 2.859 6.388 6.387 6.388 3.528 0 6.388-2.86 6.388-6.388V8.653c1.53.945 3.328 1.488 5.253 1.488V6.686z" />
                      </svg>
                      <span>TikTok</span>
                    </button>

                    <button
                      type="button"
                      className={`platform-chip-btn ${selectedPlatform === 'youtube' ? 'active' : ''}`}
                      onClick={() => setSelectedPlatform('youtube')}
                      style={selectedPlatform === 'youtube' ? { borderColor: '#EF4444', color: '#EF4444', background: '#FEF2F2' } : {}}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill={selectedPlatform === 'youtube' ? '#EF4444' : 'currentColor'}>
                        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                      </svg>
                      <span>YouTube</span>
                    </button>

                    <button
                      type="button"
                      className={`platform-chip-btn ${selectedPlatform === 'instagram' ? 'active' : ''}`}
                      onClick={() => setSelectedPlatform('instagram')}
                      style={selectedPlatform === 'instagram' ? { borderColor: '#E1306C', color: '#E1306C', background: '#FDF2F8' } : {}}
                    >
                      <svg width="15" height="15" viewBox="0 0 24 24" fill={selectedPlatform === 'instagram' ? '#E1306C' : 'currentColor'}>
                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                      </svg>
                      <span>Instagram</span>
                    </button>
                  </div>
                </div>

                {/* Form Input Link */}
                <form onSubmit={handleScrapeSubmit}>
                  <label className="scrape-input-label">
                    {selectedPlatform === 'youtube'
                      ? 'Masukkan link video YouTube / Shorts'
                      : selectedPlatform === 'instagram'
                      ? 'Masukkan link postingan atau Reels Instagram'
                      : 'Masukkan link video TikTok'}
                  </label>
                  <div className="scrape-input-row">
                    <div className="scrape-input-wrapper">
                      <Link2 size={18} className="scrape-icon-left" />
                      <input
                        type="text"
                        className="scrape-input-field"
                        placeholder={
                          selectedPlatform === 'youtube'
                            ? 'Tempelkan link video YouTube, Shorts, atau ID video (contoh: https://www.youtube.com/watch?v=...)...'
                            : selectedPlatform === 'instagram'
                            ? 'Tempelkan link postingan / Reels Instagram (contoh: https://www.instagram.com/reel/...)...'
                            : 'Tempelkan link video TikTok, shortlink vt.tiktok.com, atau ID video (contoh: https://vt.tiktok.com/ZSbJY5aH9/)...'
                        }
                        value={scrapeInput}
                        onChange={(e) => setScrapeInput(e.target.value)}
                        disabled={isScraping}
                        autoFocus
                      />
                    </div>

                    <button
                      type="submit"
                      className="btn-scrape-primary"
                      disabled={isScraping || !scrapeInput.trim()}
                    >
                      {isScraping ? (
                        <>
                          <div className="spinner-icon" />
                          <span>Sedang Mengambil Komentar...</span>
                        </>
                      ) : (
                        <>
                          <Play size={15} fill="currentColor" />
                          <span>Mulai Scraping Komentar</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Cookie Input specifically for Instagram */}
                  {selectedPlatform === 'instagram' && (
                    <div style={{ marginTop: '14px', background: '#FDF2F8', border: '1px solid #FBCFE8', borderRadius: '8px', padding: '14px 18px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                        <label style={{ fontSize: '13px', fontWeight: 600, color: '#9D174D' }}>
                          🔑 Cookie Akun Instagram (Wajib untuk Akses API Instagram):
                        </label>
                        <span style={{ fontSize: '11px', color: '#BE185D' }}>Tersimpan otomatis di browser Anda</span>
                      </div>
                      <input
                        type="password"
                        className="scrape-input-field"
                        style={{ height: '40px', paddingLeft: '14px', fontSize: '12.5px', borderColor: '#F472B6', background: '#FFF' }}
                        placeholder="Contoh: sessionid=12345678%3Aabc...; ds_user_id=12345678; (paste cookie string Anda di sini)"
                        value={igCookie}
                        onChange={(e) => {
                          const val = e.target.value;
                          setIgCookie(val);
                          try {
                            localStorage.setItem('ig_cookie', val);
                          } catch {}
                        }}
                      />
                      <p style={{ fontSize: '11.5px', color: '#9D174D', marginTop: '6px', lineHeight: '1.5' }}>
                        💡 <strong>Cara ambil cookie:</strong> Buka instagram.com di Google Chrome ➔ Tekan F12 (Inspect) ➔ Buka tab <strong>Application</strong> ➔ Di menu kiri klik <strong>Cookies</strong> (https://www.instagram.com) ➔ Salin nilai <code>sessionid</code>.
                      </p>
                    </div>
                  )}

                  <div className="scrape-hint-text-clean">
                    {selectedPlatform === 'youtube' ? (
                      <>
                        <span>Contoh format YouTube didukung:</span>
                        <code>https://www.youtube.com/watch?v=dQw4w9WgXcQ</code>
                        <span>atau Shorts</span>
                        <code>https://www.youtube.com/shorts/...</code>
                        <span>atau youtu.be</span>
                        <code>https://youtu.be/...</code>
                      </>
                    ) : selectedPlatform === 'instagram' ? (
                      <>
                        <span>Contoh format Instagram:</span>
                        <code>https://www.instagram.com/reel/C1ACfnvh4KE/</code>
                        <span>atau shortcode</span>
                        <code>C1ACfnvh4KE</code>
                      </>
                    ) : (
                      <>
                        <span>Contoh format TikTok yang didukung:</span>
                        <code>https://www.tiktok.com/@user/video/7687448180547456277</code>
                        <span>atau angka ID</span>
                        <code>7687448180547456277</code>
                      </>
                    )}
                  </div>
                </form>

                {/* Error Banner */}
                {scrapeError && (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '12px 16px',
                      background: '#FEF2F2',
                      border: '1px solid #FECACA',
                      color: '#DC2626',
                      borderRadius: '8px',
                      fontSize: '13px',
                      marginTop: '16px'
                    }}
                  >
                    <AlertCircle size={16} />
                    <span>{scrapeError}</span>
                  </div>
                )}

                {/* Success Banner with Instant Link to Results Tab */}
                {scrapeSuccess && (
                  <div className="scrape-success-card">
                    <div className="success-message">
                      <CheckCircle2 size={20} color="#16A34A" />
                      <div>
                        <strong>Scraping Berhasil Selesai!</strong>
                        <div style={{ fontSize: '12.5px', color: '#166534', marginTop: '2px' }}>
                          Berhasil mengambil <strong>{scrapeSuccess.commentsCount} komentar</strong> dan tersimpan di <code>data/{scrapeSuccess.filename}</code>.
                        </div>
                      </div>
                    </div>

                    <button
                      className="btn-view-results"
                      onClick={() => setActiveTab('results')}
                    >
                      <span>Buka Hasil Komentar</span>
                      <ArrowRight size={14} />
                    </button>
                  </div>
                )}
              </section>

              {/* Quick Overview Metrics Cards (Matching Reference Screenshot) */}
              <div className="stats-grid-dashboard">
                {/* Card 1: Total Video Ter-scrape (Warm Peach) */}
                <div className="stat-card-clean stat-card-peach">
                  <div className="stat-card-icon-box peach-icon">
                    <Database size={20} />
                  </div>
                  <div className="stat-card-content">
                    <div className="stat-card-value">{totalScrapedStats.totalVideos}</div>
                    <div className="stat-card-title">Total Konten Riset</div>
                  </div>
                  <ArrowRight size={16} className="stat-card-arrow" />
                </div>

                {/* Card 2: Total Komentar Tersimpan (Soft Rose) */}
                <div className="stat-card-clean stat-card-rose">
                  <div className="stat-card-icon-box rose-icon">
                    <MessageSquare size={20} />
                  </div>
                  <div className="stat-card-content">
                    <div className="stat-card-value">{totalScrapedStats.totalStoredComments.toLocaleString()}</div>
                    <div className="stat-card-title">Total Komentar Dianalisis</div>
                  </div>
                  <ArrowRight size={16} className="stat-card-arrow" />
                </div>

                {/* Card 3: Dataset Tersimpan (Soft Lavender) */}
                <div className="stat-card-clean stat-card-lavender" onClick={() => setActiveTab('files')} style={{ cursor: 'pointer' }}>
                  <div className="stat-card-icon-box lavender-icon">
                    <FolderArchive size={20} />
                  </div>
                  <div className="stat-card-content">
                    <div className="stat-card-value">{files.length}</div>
                    <div className="stat-card-title">Dataset Tersimpan</div>
                  </div>
                  <ArrowRight size={16} className="stat-card-arrow" />
                </div>

                {/* Card 4: Privasi Akun Peneliti (Soft Mint) */}
                <div className="stat-card-clean stat-card-mint">
                  <div className="stat-card-icon-box mint-icon">
                    <ShieldCheck size={20} />
                  </div>
                  <div className="stat-card-content">
                    <div className="stat-card-value">100% Aman</div>
                    <div className="stat-card-title">Privasi Akun Peneliti</div>
                  </div>
                  <ArrowRight size={16} className="stat-card-arrow" />
                </div>
              </div>

              {/* Recent Scrapes List */}
              {files.length > 0 && (
                <section className="recent-section-clean">
                  <div className="recent-section-header-clean">
                    <h2 className="recent-section-title-clean">Riwayat Scraping Terakhir</h2>
                    <button
                      className="btn-pill-header"
                      onClick={() => setActiveTab('files')}
                    >
                      <span>Lihat Semua File</span>
                      <ArrowRight size={14} />
                    </button>
                  </div>

                  <div className="recent-table-card-clean">
                    <table className="recent-table-clean">
                      <thead>
                        <tr>
                          <th style={{ width: '28%' }}>KONTEN / VIDEO</th>
                          <th style={{ width: '32%' }}>CAPTION & TOPIK</th>
                          <th style={{ width: '16%' }}>JUMLAH KOMENTAR</th>
                          <th style={{ width: '14%' }}>WAKTU AMBIL</th>
                          <th style={{ width: '10%', textAlign: 'right' }}>AKSI</th>
                        </tr>
                      </thead>
                      <tbody>
                        {files.slice(0, 5).map((f) => (
                          <tr key={f.filename}>
                            <td>
                              <div className="file-name-cell">
                                <FileText size={16} className="file-icon-orange" />
                                <span className="file-name-text">{f.filename.replace(/\.json$/i, '')}</span>
                              </div>
                            </td>
                            <td>
                              <span className="caption-preview-text">
                                {f.caption ? `${f.caption.slice(0, 48)}...` : '-'}
                              </span>
                            </td>
                            <td>
                              <span className="comment-count-text">{f.comments_count} komentar</span>
                            </td>
                            <td>
                              <span className="scrape-time-text">
                                {formatDate(f.modified)}
                              </span>
                            </td>
                            <td style={{ textAlign: 'right' }}>
                              <button
                                className="btn-pill-action"
                                onClick={() => loadFileContent(f.filename, true)}
                              >
                                <span>Lihat Hasil</span>
                                <ArrowRight size={13} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>
              )}
            </div>
          )}

          {/* ====================================================================
              TAB 2: HASIL KOMENTAR (EXPLORER, KEYWORD FILTER, THREADS)
              ==================================================================== */}
          {activeTab === 'results' && (
            <div>
              {/* Video Selector Bar */}
              <div className="video-selector-row">
                <div className="video-selector-bar">
                  <div className="selector-icon">
                    <Database size={18} />
                  </div>
                  <span className="selector-label">Pilih Dataset Riset:</span>
                  {files.length > 0 ? (
                    <select
                      className="selector-select"
                      value={selectedFile}
                      onChange={(e) => loadFileContent(e.target.value)}
                    >
                      {files.map((f) => (
                        <option key={f.filename} value={f.filename}>
                          {f.caption ? `${f.caption.slice(0, 48)}...` : f.filename.replace(/\.json$/i, '')} ({f.comments_count} komentar)
                        </option>
                      ))}
                    </select>
                  ) : (
                    <span style={{ fontSize: '13px', color: 'var(--color-text-secondary)', flex: 1 }}>
                      {selectedFile ? selectedFile.replace(/\.json$/i, '') : 'Belum ada dataset penelitian tersimpan'}
                    </span>
                  )}
                  <ChevronDown size={16} color="var(--color-text-secondary)" style={{ pointerEvents: 'none', flexShrink: 0 }} />
                </div>

                <div className="selector-actions-group">
                  <button
                    className="btn btn-white-bordered"
                    onClick={fetchFilesList}
                    title="Segarkan riwayat dataset"
                  >
                    <RefreshCw size={14} />
                    Segarkan
                  </button>

                  <button
                    className="btn btn-white-bordered"
                    onClick={() => setActiveTab('ai-analysis')}
                    style={{ color: '#7C3AED', borderColor: '#DDD6FE', background: '#F5F3FF' }}
                    title="Lihat analisis AI untuk video ini"
                  >
                    <Brain size={15} />
                    Analisis AI
                  </button>
                </div>
              </div>

              {/* Caption Card */}
              {data && (
                <section className="caption-card">
                  <div className="caption-content">
                    <div className="caption-header">
                      <span className="caption-eyebrow">CAPTION VIDEO TIKTOK</span>
                      <div className="caption-actions">
                        <button
                          className="btn-cite-pill"
                          onClick={() => setShowCitationModal(true)}
                          title="Buat sitasi otomatis untuk Daftar Pustaka (APA 7th, Harvard, Mendeley, BibTeX)"
                        >
                          <Quote size={13} />
                          Sitasi Video (APA / Mendeley)
                        </button>
                        {data.video_url && (
                          <a
                            href={data.video_url}
                            target="_blank"
                            rel="noreferrer"
                            className="btn-tiktok-pill"
                          >
                            <ExternalLink size={13} />
                            Buka di TikTok
                          </a>
                        )}
                      </div>
                    </div>
                    <p className="caption-body">
                      {data.caption || 'Tidak ada caption dalam video ini.'}
                    </p>
                  </div>
                </section>
              )}

              {/* Stat Cards (4 columns, distinct pastel fills) */}
              {data && (
                <section className="stats-grid">
                  <div className="stat-card stat-card-blue">
                    <div className="stat-icon-wrapper">
                      <MessageSquare size={18} />
                    </div>
                    <div>
                      <div className="stat-number">{stats.totalComments.toLocaleString()}</div>
                      <div className="stat-label">Komentar Utama</div>
                    </div>
                  </div>

                  <div className="stat-card stat-card-rose">
                    <div className="stat-icon-wrapper">
                      <CornerDownRight size={18} />
                    </div>
                    <div>
                      <div className="stat-number">{stats.totalReplies.toLocaleString()}</div>
                      <div className="stat-label">Total Balasan</div>
                    </div>
                  </div>

                  <div className="stat-card stat-card-violet">
                    <div className="stat-icon-wrapper">
                      <Users size={18} />
                    </div>
                    <div>
                      <div className="stat-number">{stats.totalUsers.toLocaleString()}</div>
                      <div className="stat-label">Partisipan Unik</div>
                    </div>
                  </div>

                  <div className="stat-card stat-card-amber">
                    <div className="stat-icon-wrapper">
                      <Layers size={18} />
                    </div>
                    <div>
                      <div className="stat-number">{filteredComments.length.toLocaleString()}</div>
                      <div className="stat-label">Hasil Terfilter</div>
                    </div>
                  </div>
                </section>
              )}

              {/* Search & Filter Panel */}
              {data && (
                <section className="filter-card">
                  {/* Row 1: Search input + Sort dropdown */}
                  <div className="filter-row-1">
                    <div className="search-input-box">
                      <Search size={18} className="search-icon-svg" />
                      <input
                        type="text"
                        className="search-input-field"
                        placeholder="Cari komentar berdasarkan kata kunci (contoh: etawalin, curiga, kasir)..."
                        value={searchKeyword}
                        onChange={(e) => setSearchKeyword(e.target.value)}
                      />
                      {searchKeyword && (
                        <button
                          className="search-clear-btn"
                          onClick={() => setSearchKeyword('')}
                          title="Hapus filter"
                        >
                          <X size={15} />
                        </button>
                      )}
                    </div>

                    <select
                      className="sort-select-box"
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                    >
                      <option value="newest">Urutkan: Terbaru</option>
                      <option value="oldest">Urutkan: Terlama</option>
                      <option value="most_replies">Balasan Terbanyak</option>
                    </select>
                  </div>

                  {/* Row 2: Search Scope Tabs + Checkboxes */}
                  <div className="filter-row-2">
                    <div className="filter-tabs-group">
                      <span className="filter-tabs-label">Cari Di:</span>
                      <button
                        className={`filter-tab-pill ${searchScope === 'all' ? 'active' : 'inactive'}`}
                        onClick={() => setSearchScope('all')}
                      >
                        Semua
                      </button>
                      <button
                        className={`filter-tab-pill ${searchScope === 'comments' ? 'active' : 'inactive'}`}
                        onClick={() => setSearchScope('comments')}
                      >
                        Komentar Saja
                      </button>
                      <button
                        className={`filter-tab-pill ${searchScope === 'replies' ? 'active' : 'inactive'}`}
                        onClick={() => setSearchScope('replies')}
                      >
                        Balasan Saja
                      </button>
                    </div>

                    <div className="filter-checkboxes-group">
                      <label className="checkbox-label">
                        <input
                          type="checkbox"
                          checked={hasRepliesOnly}
                          onChange={(e) => setHasRepliesOnly(e.target.checked)}
                        />
                        Hanya yang punya balasan
                      </label>

                      <label className="checkbox-label">
                        <input
                          type="checkbox"
                          checked={caseSensitive}
                          onChange={(e) => setCaseSensitive(e.target.checked)}
                        />
                        Case sensitive (Aa)
                      </label>
                    </div>
                  </div>

                  {/* Row 3: Frequent Keywords Pills */}
                  {topKeywords.length > 0 && (
                    <div className="filter-row-3">
                      <div className="keyword-eyebrow">
                        <Flame size={14} color="#F97316" />
                        KATA KUNCI TERPOPULER (KLIK UNTUK MEMFILTER)
                      </div>
                      <div className="keyword-pills-wrap">
                        {topKeywords.map((item) => {
                          const isActive = searchKeyword.toLowerCase() === item.word.toLowerCase();
                          return (
                            <button
                              key={item.word}
                              className={`keyword-pill ${isActive ? 'active' : ''}`}
                              onClick={() => setSearchKeyword(isActive ? '' : item.word)}
                            >
                              <span>#{item.word}</span>
                              <span className="keyword-count">{item.count}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </section>
              )}

              {/* Comment List Section */}
              {data && (
                <section>
                  <div className="comment-section-header">
                    <div className="comment-section-title">
                      Daftar Komentar <span>({filteredComments.length} dari {data.comments.length} komentar)</span>
                    </div>

                    <div className="export-actions-group">
                      <button
                        className="btn btn-white-bordered"
                        onClick={() => setShowInterCoderModal(true)}
                        title="Kalkulator uji reliabilitas antar-pengkode (Cohen's Kappa) untuk Bab 3"
                      >
                        <Calculator size={14} color="#0891b2" />
                        <span>Uji Cohen's Kappa</span>
                      </button>
                      <button
                        className="btn btn-stat-export"
                        onClick={() => setShowExportStatsModal(true)}
                        title="Ekspor dataset terstandarisasi untuk SPSS, Excel, SmartPLS, dan JASP"
                      >
                        <FileSpreadsheet size={15} />
                        <span className="btn-stat-text-desktop">Ekspor Statistik (SPSS, Excel, PLS, JASP)</span>
                        <span className="btn-stat-text-mobile">Ekspor Statistik (SPSS/PLS)</span>
                      </button>
                      <button
                        className="btn btn-white-bordered"
                        onClick={exportToCSV}
                        title="Ekspor ke format Excel / CSV standar"
                      >
                        <Download size={14} />
                        <span>Ekspor CSV</span>
                      </button>
                      <button
                        className="btn btn-white-bordered"
                        onClick={exportToJSON}
                        title="Ekspor ke format JSON"
                      >
                        <FileJson size={14} />
                        <span>Ekspor JSON</span>
                      </button>
                    </div>
                  </div>

                  {loading ? (
                    <div className="empty-state-box">
                      <div className="spinner-icon" style={{ borderColor: 'rgba(0,0,0,0.2)', borderTopColor: 'var(--color-primary)', margin: '0 auto 12px' }} />
                      <p>Memuat data komentar...</p>
                    </div>
                  ) : filteredComments.length === 0 ? (
                    <div className="empty-state-box">
                      <Search size={36} className="empty-state-icon" />
                      <h4>Tidak ada komentar yang cocok</h4>
                      <p>Coba gunakan kata kunci lain atau ubah pengaturan cakupan pencarian.</p>
                      {searchKeyword && (
                        <button className="btn btn-white-bordered" onClick={() => setSearchKeyword('')}>
                          Reset Pencarian
                        </button>
                      )}
                    </div>
                  ) : (
                    <>
                      <div className="comment-list-container">
                        {paginatedComments.map((comment, index) => {
                          const isExpanded = expandedReplies.has(comment.comment_id || index);
                          const replyCount =
                            comment.total_reply || (comment.replies ? comment.replies.length : 0);

                          return (
                            <div key={comment.comment_id || index} className="comment-row">
                              <div className="comment-row-top">
                                <div className="author-meta-wrap">
                                  <div className="author-avatar">
                                    {comment.avatar ? (
                                      <img
                                        src={comment.avatar}
                                        alt={comment.nickname || comment.username}
                                        onError={(e) => {
                                          e.target.style.display = 'none';
                                        }}
                                      />
                                    ) : null}
                                    <span>
                                      {(comment.nickname || comment.username || '?').charAt(0).toUpperCase()}
                                    </span>
                                  </div>

                                  <div className="author-names-line">
                                    <span className="author-name-bold">
                                      {comment.nickname || comment.username || 'Pengguna TikTok'}
                                    </span>
                                    <span className="author-handle-gray">
                                      @{comment.username}
                                    </span>
                                  </div>
                                </div>

                                <div className="comment-right-meta">
                                  <div className="comment-timestamp">
                                    <Clock size={12} />
                                    {formatDate(comment.create_time)}
                                  </div>

                                  <div className="comment-actions-inline">
                                    <button
                                      className="comment-icon-subtle quote-btn"
                                      title="Kutip verbatim untuk Bab 4 Skripsi (Format APA / Narasi Ilmiah)"
                                      onClick={() => {
                                        setVerbatimModalComment(comment);
                                        setVerbatimModalIndex(index + 1);
                                      }}
                                      aria-label="Kutip komentar verbatim"
                                    >
                                      <Quote size={14} />
                                    </button>

                                    <button
                                      className="comment-icon-subtle"
                                      title="Salin isi komentar"
                                      onClick={() => copyToClipboard(comment.comment, comment.comment_id || index)}
                                      aria-label="Salin isi komentar"
                                    >
                                      {copiedId === (comment.comment_id || index) ? (
                                        <Check size={15} color="var(--color-success)" />
                                      ) : (
                                        <Copy size={15} />
                                      )}
                                    </button>
                                  </div>
                                </div>
                              </div>

                              <div className="comment-body-text">
                                {renderHighlighted(comment.comment, searchKeyword)}
                              </div>

                              <div className="comment-row-footer">
                                <div>
                                  {replyCount > 0 ? (
                                    <button
                                      className="btn-replies-toggle"
                                      onClick={() => toggleReply(comment.comment_id || index)}
                                    >
                                      <CornerDownRight size={13} />
                                      <span>{replyCount} Balasan</span>
                                      {isExpanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                                    </button>
                                  ) : (
                                    <span className="no-replies-text">
                                      Tidak ada balasan
                                    </span>
                                  )}
                                </div>
                              </div>

                              {/* Thread: Replies */}
                              {isExpanded && comment.replies && comment.replies.length > 0 && (
                                <div className="replies-thread-box">
                                  {comment.replies.map((reply, rIdx) => (
                                    <div key={reply.comment_id || rIdx} className="reply-row">
                                      <div className="comment-row-top" style={{ marginBottom: '4px' }}>
                                        <div className="author-meta-wrap">
                                          <div className="author-avatar">
                                            {reply.avatar ? (
                                              <img
                                                src={reply.avatar}
                                                alt={reply.nickname || reply.username}
                                                onError={(e) => {
                                                  e.target.style.display = 'none';
                                                }}
                                              />
                                            ) : null}
                                            <span>
                                              {(reply.nickname || reply.username || '?').charAt(0).toUpperCase()}
                                            </span>
                                          </div>
                                          <div className="author-names-line">
                                            <span className="author-name-bold">
                                              {reply.nickname || reply.username}
                                            </span>
                                            <span className="author-handle-gray">
                                              @{reply.username}
                                            </span>
                                          </div>
                                        </div>

                                        <div className="comment-right-meta">
                                          <div className="comment-timestamp">
                                            {formatDate(reply.create_time)}
                                          </div>
                                          <div className="comment-actions-inline">
                                            <button
                                              className="comment-icon-subtle quote-btn"
                                              title="Kutip balasan untuk Bab 4 Skripsi"
                                              onClick={() => {
                                                setVerbatimModalComment(reply);
                                                setVerbatimModalIndex(rIdx + 1);
                                              }}
                                              aria-label="Kutip balasan verbatim"
                                            >
                                              <Quote size={12} />
                                            </button>
                                            <button
                                              className="comment-icon-subtle"
                                              title="Salin balasan"
                                              onClick={() => copyToClipboard(reply.comment, reply.comment_id || rIdx)}
                                              aria-label="Salin balasan"
                                            >
                                              {copiedId === (reply.comment_id || rIdx) ? (
                                                <Check size={13} color="var(--color-success)" />
                                              ) : (
                                                <Copy size={13} />
                                              )}
                                            </button>
                                          </div>
                                        </div>
                                      </div>

                                      <div className="comment-body-text">
                                        {renderHighlighted(reply.comment, searchKeyword)}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>

                      {/* Pagination Bar */}
                      {filteredComments.length > 0 && (
                        <div className="pagination-bar">
                          <div className="pagination-info">
                            Menampilkan <strong>{Math.min((currentPage - 1) * pageSize + 1, filteredComments.length)}</strong> - <strong>{Math.min(currentPage * pageSize, filteredComments.length)}</strong> dari <strong>{filteredComments.length}</strong> komentar
                          </div>

                          <div className="pagination-controls-wrap">
                            <div className="page-size-selector">
                              <span>Per halaman:</span>
                              <select
                                className="page-size-select"
                                value={pageSize}
                                onChange={(e) => {
                                  setPageSize(Number(e.target.value));
                                  setCurrentPage(1);
                                }}
                              >
                                <option value={10}>10</option>
                                <option value={20}>20</option>
                                <option value={50}>50</option>
                                <option value={100}>100</option>
                              </select>
                            </div>

                            <div className="pagination-nav">
                              <button
                                className="pagination-btn"
                                onClick={() => {
                                  setCurrentPage((p) => Math.max(p - 1, 1));
                                  window.scrollTo({ top: 0, behavior: 'smooth' });
                                }}
                                disabled={currentPage === 1}
                                title="Halaman Sebelumnya"
                              >
                                <ChevronLeft size={16} />
                              </button>

                              {getPageNumbers().map((num, idx) =>
                                num === '...' ? (
                                  <span key={`ellipsis-${idx}`} className="pagination-ellipsis">
                                    ...
                                  </span>
                                ) : (
                                  <button
                                    key={num}
                                    className={`pagination-btn ${currentPage === num ? 'active' : ''}`}
                                    onClick={() => {
                                      setCurrentPage(num);
                                      window.scrollTo({ top: 0, behavior: 'smooth' });
                                    }}
                                  >
                                    {num}
                                  </button>
                                )
                              )}

                              <button
                                className="pagination-btn"
                                onClick={() => {
                                  setCurrentPage((p) => Math.min(p + 1, totalPages));
                                  window.scrollTo({ top: 0, behavior: 'smooth' });
                                }}
                                disabled={currentPage === totalPages}
                                title="Halaman Selanjutnya"
                              >
                                <ChevronRight size={16} />
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </section>
              )}

              {/* Empty state when no data loaded */}
              {!data && !loading && (
                <div className="empty-state-box">
                  <MessageSquare size={42} className="empty-state-icon" />
                  <h4>Belum ada data komentar yang dipilih</h4>
                  <p>Mulai scraping konten baru di tab Dashboard, atau pilih dataset dari riwayat penelitian Anda.</p>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
                    <button className="btn btn-scrape-primary" onClick={() => setActiveTab('dashboard')} style={{ height: '38px', padding: '0 16px' }}>
                      Buka Form Scraper
                    </button>
                    <button className="btn btn-white-bordered" onClick={() => fileInputRef.current?.click()}>
                      Unggah Dataset
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ====================================================================
              TAB: ANALISIS AI SKRIPSI (CLARIO DEEPSEEK-V4 FLASH)
              ==================================================================== */}
          {/* ====================================================================
              TAB: ANALISIS AI SKRIPSI (MULTI-FRAMEWORK / MULTI-SUDUT PANDANG)
              ==================================================================== */}
          {activeTab === 'ai-analysis' && (() => {
            const currentFw = FRAMEWORKS_LIST.find((f) => f.id === analysisType) || FRAMEWORKS_LIST[0];
            const resultType = aiAnalysis?.analysis_type || analysisType;
            const activeResultFw = FRAMEWORKS_LIST.find((f) => f.id === resultType) || FRAMEWORKS_LIST[0];

            return (
              <div>
                {/* Header Card with File Picker and Controls */}
                <div className="ai-header-card">
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <Brain size={22} color={currentFw.color} />
                      <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                        Analisis AI Skripsi: {currentFw.title}
                      </h2>
                    </div>
                    <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>
                      Fokus Kajian: <strong>{currentFw.badge}</strong>
                      {aiAnalysis && (
                        <span> • <strong>{aiAnalysis.sample_analyzed}</strong> dari <strong>{aiAnalysis.total_comments}</strong> komentar dianalisis</span>
                      )}
                    </p>
                  </div>

                  <div className="ai-config-controls">

                    {/* Sample Size Selector */}
                    <div className="sample-size-pill-group">
                      <span style={{ fontSize: '11px', color: 'var(--color-text-muted)', paddingLeft: '8px' }}>
                        Sampel:
                      </span>
                      <button
                        className={`sample-size-btn ${aiSampleSize === 30 ? 'active' : ''}`}
                        onClick={() => setAiSampleSize(30)}
                        title="30 komentar teratas"
                      >
                        30 Cepat
                      </button>
                      <button
                        className={`sample-size-btn ${aiSampleSize === 50 ? 'active' : ''}`}
                        onClick={() => setAiSampleSize(50)}
                        title="50 komentar teratas"
                      >
                        50 Standar
                      </button>
                      <button
                        className={`sample-size-btn ${aiSampleSize === 100 ? 'active' : ''}`}
                        onClick={() => setAiSampleSize(100)}
                        title="100 komentar teratas"
                      >
                        100
                      </button>
                      <button
                        className={`sample-size-btn ${aiSampleSize === 150 ? 'active' : ''}`}
                        onClick={() => setAiSampleSize(150)}
                        title="150 komentar teratas"
                      >
                        150
                      </button>
                      <button
                        className={`sample-size-btn ${aiSampleSize === 200 ? 'active' : ''}`}
                        onClick={() => setAiSampleSize(200)}
                        title="200 komentar teratas"
                      >
                        200
                      </button>
                      <button
                        className={`sample-size-btn ${aiSampleSize === 0 ? 'active' : ''}`}
                        onClick={() => setAiSampleSize(0)}
                        title="Menganalisis seluruh komentar dalam dataset"
                      >
                        Semua {data?.comments?.length ? `(${data.comments.length})` : ''}
                      </button>
                    </div>

                    <button
                      className="btn btn-scrape-primary"
                      style={{ height: '36px', padding: '0 16px', fontSize: '13px' }}
                      onClick={runAiAnalysis}
                      disabled={aiLoading || !selectedFile}
                    >
                      {aiLoading ? (
                        <>
                          <div className="spinner-icon" />
                          <span>Menganalisis ({currentFw.badge.split('/')[0].trim()})...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles size={15} />
                          <span>{aiAnalysis ? 'Analisis Ulang AI' : 'Mulai Analisis AI'}</span>
                        </>
                      )}
                    </button>

                    {aiAnalysis && (
                      <button
                        className="btn btn-white-bordered"
                        onClick={exportAiReportMarkdown}
                        title="Unduh draf bab 4 skripsi format Markdown (.md)"
                      >
                        <Download size={14} />
                        Ekspor Draf (.md)
                      </button>
                    )}

                    {data && (
                      <>
                        <button
                          className="btn btn-white-bordered"
                          onClick={() => setShowCitationModal(true)}
                          title="Salin sitasi video untuk Daftar Pustaka (APA 7th, Harvard, Mendeley)"
                        >
                          <Quote size={14} color="#db2777" />
                          <span>Sitasi Video (APA)</span>
                        </button>
                        <button
                          className="btn btn-white-bordered"
                          onClick={() => setShowInterCoderModal(true)}
                          title="Kalkulator uji reliabilitas antar-pengkode (Cohen's Kappa) untuk Bab 3"
                        >
                          <Calculator size={14} color="#0891b2" />
                          <span>Uji Cohen's Kappa</span>
                        </button>
                        <button
                          className="btn btn-stat-export"
                          onClick={() => setShowExportStatsModal(true)}
                          title="Ekspor data komentar & metrik statistik untuk SPSS, Excel, SmartPLS, JASP"
                        >
                          <FileSpreadsheet size={14} />
                          <span>Ekspor Statistik</span>
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* Selector Bar */}
                <div className="video-selector-row">
                  <div className="video-selector-bar">
                    <div className="selector-icon">
                      <Database size={18} />
                    </div>
                    <span className="selector-label">Pilih Dataset Riset:</span>
                    {files.length > 0 ? (
                      <select
                        className="selector-select"
                        value={selectedFile}
                        onChange={(e) => loadFileContent(e.target.value)}
                      >
                        {files.map((f) => (
                          <option key={f.filename} value={f.filename}>
                            {f.caption ? `${f.caption.slice(0, 48)}...` : f.filename.replace(/\.json$/i, '')} ({f.comments_count} komentar)
                          </option>
                        ))}
                      </select>
                    ) : (
                      <span style={{ fontSize: '13px', color: 'var(--color-text-secondary)', flex: 1 }}>
                        {selectedFile ? selectedFile.replace(/\.json$/i, '') : 'Belum ada dataset penelitian tersimpan'}
                      </span>
                    )}
                    <ChevronDown size={16} color="var(--color-text-secondary)" style={{ pointerEvents: 'none' }} />
                  </div>
                </div>

                {/* Academic Frameworks Selector */}
                <div className="ai-frameworks-section">
                  <div className="ai-frameworks-header">
                    <div className="ai-frameworks-title">
                      <Sparkles size={18} color="var(--color-primary)" />
                      <span>Pilih Sudut Pandang / Kerangka Analisis Skripsi:</span>
                    </div>
                    <span className="ai-frameworks-subtitle">
                      Pilih teori dan fokus kajian yang relevan dengan topik penelitian tugas akhir Anda
                    </span>
                  </div>

                  <div className="ai-frameworks-grid">
                    {FRAMEWORKS_LIST.map((fw) => {
                      const IconComp = fw.icon;
                      const isActive = analysisType === fw.id;
                      return (
                        <button
                          key={fw.id}
                          type="button"
                          className={`framework-card ${isActive ? 'active' : ''}`}
                          style={{
                            '--card-accent': fw.color,
                            '--card-accent-alpha': `${fw.color}25`
                          }}
                          onClick={() => handleFrameworkChange(fw.id)}
                        >
                          <div className="framework-card-top">
                            <div className="framework-icon-wrap" style={{ background: `${fw.color}15`, color: fw.color }}>
                              <IconComp size={18} />
                            </div>
                            <span className="framework-badge" style={{ background: `${fw.color}15`, color: fw.color }}>
                              {fw.badge.split('/')[0].trim()}
                            </span>
                          </div>

                          <div className="framework-card-body">
                            <h4>{fw.title}</h4>
                            <p>{fw.desc}</p>
                          </div>

                          <div className="framework-card-footer">
                            <span className="framework-theory-tag" title={fw.theory}>
                              {fw.theory.split(',')[0]}
                            </span>
                            {isActive && <div className="framework-active-indicator" />}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Error Alert */}
                {aiError && (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '14px 18px',
                      background: '#FEF2F2',
                      border: '1px solid #FECACA',
                      color: '#DC2626',
                      borderRadius: '10px',
                      fontSize: '13px',
                      marginBottom: '20px'
                    }}
                  >
                    <AlertCircle size={18} />
                    <div>
                      <strong>Terjadi Kesalahan Analisis AI:</strong>
                      <div>{aiError}</div>
                    </div>
                  </div>
                )}

                {/* Empty state when no analysis done yet for this framework */}
                {!aiAnalysis && !aiLoading && (
                  <div className="empty-state-box">
                    <div
                      style={{
                        width: '56px',
                        height: '56px',
                        borderRadius: '16px',
                        background: `${currentFw.color}15`,
                        color: currentFw.color,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 16px'
                      }}
                    >
                      {React.createElement(currentFw.icon, { size: 28 })}
                    </div>
                    <h4>Belum Ada Analisis: {currentFw.title}</h4>
                    <p style={{ maxWidth: '640px', margin: '0 auto 16px' }}>
                      {currentFw.desc}
                      <br />
                      <span style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginTop: '6px', display: 'inline-block' }}>
                        <strong>Landasan Teori:</strong> {currentFw.theory}
                      </span>
                    </p>
                    <button
                      className="btn btn-scrape-primary"
                      onClick={runAiAnalysis}
                      disabled={!selectedFile}
                      style={{ height: '40px', padding: '0 20px', margin: '0 auto' }}
                    >
                      <Sparkles size={16} />
                      Jalankan Analisis ({currentFw.badge.split('/')[0].trim()})
                    </button>
                  </div>
                )}

                {/* AI Analysis Content View */}
                {aiAnalysis && (
                  <div>
                    {/* 1. Context Banner (Perspective-Specific) */}
                    <div className="ai-context-banner">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                        <Lightbulb size={18} color="#B45309" />
                        <strong style={{ fontSize: '14px', color: '#92400E' }}>
                          Konteks Analisis: {activeResultFw.title} ({activeResultFw.badge})
                        </strong>
                      </div>

                      <div className="ai-context-grid">
                        {resultType === 'public_sentiment' ? (
                          <>
                            <div className="ai-context-item">
                              <div className="ai-context-item-label">Isu Utama / Topik yang Memicu Reaksi</div>
                              <div className="ai-context-item-value">
                                {aiAnalysis.result.context_summary?.issue_premise || '-'}
                              </div>
                            </div>
                            <div className="ai-context-item">
                              <div className="ai-context-item-label">Tokoh / Instansi / Brand Terkait</div>
                              <div className="ai-context-item-value" style={{ fontWeight: 700, color: '#1E40AF' }}>
                                {aiAnalysis.result.context_summary?.public_entity_or_brand || 'Tidak Terdeteksi'}
                              </div>
                            </div>
                            <div className="ai-context-item">
                              <div className="ai-context-item-label">Tingkat Ancaman Krisis PR</div>
                              <div className="ai-context-item-value" style={{ fontWeight: 700, color: '#DC2626' }}>
                                {aiAnalysis.result.context_summary?.crisis_threat_level || '-'}
                              </div>
                            </div>
                          </>
                        ) : resultType === 'consumer_behavior' ? (
                          <>
                            <div className="ai-context-item">
                              <div className="ai-context-item-label">Produk / Merek yang Dibicarakan</div>
                              <div className="ai-context-item-value" style={{ fontWeight: 700, color: '#059669' }}>
                                {aiAnalysis.result.context_summary?.product_or_brand || 'Tidak Terdeteksi'}
                              </div>
                            </div>
                            <div className="ai-context-item">
                              <div className="ai-context-item-label">Persepsi Nilai Manfaat (Value Proposition)</div>
                              <div className="ai-context-item-value">
                                {aiAnalysis.result.context_summary?.value_proposition_perceived || '-'}
                              </div>
                            </div>
                            <div className="ai-context-item">
                              <div className="ai-context-item-label">Daya Tarik Pasar & Segmen Audiens</div>
                              <div className="ai-context-item-value">
                                {aiAnalysis.result.context_summary?.market_appeal_summary || '-'}
                              </div>
                            </div>
                          </>
                        ) : resultType === 'digital_discourse' ? (
                          <>
                            <div className="ai-context-item">
                              <div className="ai-context-item-label">Situasi Interaksi Komunikasi</div>
                              <div className="ai-context-item-value">
                                {aiAnalysis.result.context_summary?.communicative_situation || '-'}
                              </div>
                            </div>
                            <div className="ai-context-item">
                              <div className="ai-context-item-label">Topik Wacana Sentral</div>
                              <div className="ai-context-item-value" style={{ fontWeight: 700, color: '#7C3AED' }}>
                                {aiAnalysis.result.context_summary?.discourse_topic || '-'}
                              </div>
                            </div>
                            <div className="ai-context-item">
                              <div className="ai-context-item-label">Iklim Komunikasi Warganet</div>
                              <div className="ai-context-item-value">
                                {aiAnalysis.result.context_summary?.communication_climate || '-'}
                              </div>
                            </div>
                          </>
                        ) : resultType === 'social_psychology' ? (
                          <>
                            <div className="ai-context-item">
                              <div className="ai-context-item-label">Stimulus Sosial / Pemicu Perilaku</div>
                              <div className="ai-context-item-value">
                                {aiAnalysis.result.context_summary?.social_stimulus || '-'}
                              </div>
                            </div>
                            <div className="ai-context-item">
                              <div className="ai-context-item-label">Fenomena Massa Teramati</div>
                              <div className="ai-context-item-value" style={{ fontWeight: 700, color: '#DB2777' }}>
                                {aiAnalysis.result.context_summary?.social_phenomenon_observed || '-'}
                              </div>
                            </div>
                            <div className="ai-context-item">
                              <div className="ai-context-item-label">Ketegangan Psikologis Penonton</div>
                              <div className="ai-context-item-value">
                                {aiAnalysis.result.context_summary?.psychological_tension || '-'}
                              </div>
                            </div>
                          </>
                        ) : resultType === 'entman_framing' ? (
                          <>
                            <div className="ai-context-item">
                              <div className="ai-context-item-label">Isu Sentral yang Dibingkai</div>
                              <div className="ai-context-item-value">
                                {aiAnalysis.result.framing_overview?.central_issue || '-'}
                              </div>
                            </div>
                            <div className="ai-context-item">
                              <div className="ai-context-item-label">Frame Dominan Publik</div>
                              <div className="ai-context-item-value" style={{ fontWeight: 700, color: '#0D9488' }}>
                                {aiAnalysis.result.framing_overview?.dominant_frame_name || '-'}
                              </div>
                            </div>
                            <div className="ai-context-item">
                              <div className="ai-context-item-label">Intensitas Pembingkaian</div>
                              <div className="ai-context-item-value">
                                {aiAnalysis.result.framing_overview?.framing_intensity || '-'}
                              </div>
                            </div>
                          </>
                        ) : (
                          <>
                            {/* Default: Emotion-driven marketing */}
                            <div className="ai-context-item">
                              <div className="ai-context-item-label">Premis / Cerita yang Dimanfaatkan</div>
                              <div className="ai-context-item-value">
                                {aiAnalysis.result.video_context?.premise || '-'}
                              </div>
                            </div>
                            <div className="ai-context-item">
                              <div className="ai-context-item-label">Produk / Merek yang Dipromosikan</div>
                              <div className="ai-context-item-value" style={{ fontWeight: 700, color: '#1E40AF' }}>
                                {aiAnalysis.result.video_context?.product_or_brand || 'Tidak Terdeteksi'}
                              </div>
                            </div>
                            <div className="ai-context-item">
                              <div className="ai-context-item-label">Strategi Pemasaran Teridentifikasi</div>
                              <div className="ai-context-item-value">
                                {aiAnalysis.result.video_context?.marketing_strategy_detected || '-'}
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    </div>

                    {/* 2. Primary 4-Metric Grid (Perspective-Specific) */}
                    <div className="stats-grid">
                      {resultType === 'public_sentiment' ? (
                        <>
                          <div className="stat-card stat-card-blue">
                            <div className="stat-icon-wrapper"><Target size={18} /></div>
                            <div>
                              <div className="stat-number">{aiAnalysis.result.reputation_audit?.trust_score_pct}%</div>
                              <div className="stat-label">Skor Kepercayaan Publik</div>
                            </div>
                          </div>
                          <div className="stat-card stat-card-rose">
                            <div className="stat-icon-wrapper"><AlertCircle size={18} /></div>
                            <div>
                              <div className="stat-number">
                                {(aiAnalysis.result.sentiment_metrics?.negative_pct || 0) + (aiAnalysis.result.sentiment_metrics?.critical_pct || 0)}%
                              </div>
                              <div className="stat-label">Sentimen Negatif & Kritis</div>
                            </div>
                          </div>
                          <div className="stat-card stat-card-violet">
                            <div className="stat-icon-wrapper"><Flame size={18} /></div>
                            <div>
                              <div className="stat-number" style={{ fontSize: '16px' }}>
                                {aiAnalysis.result.sentiment_metrics?.dominant_sentiment || '-'}
                              </div>
                              <div className="stat-label">Sentimen Publik Dominan</div>
                            </div>
                          </div>
                          <div className="stat-card stat-card-amber">
                            <div className="stat-icon-wrapper"><ShieldAlert size={18} /></div>
                            <div>
                              <div className="stat-number" style={{ fontSize: '18px' }}>
                                {aiAnalysis.result.context_summary?.crisis_threat_level || 'Sedang'}
                              </div>
                              <div className="stat-label">Tingkat Ancaman Krisis PR</div>
                            </div>
                          </div>
                        </>
                      ) : resultType === 'consumer_behavior' ? (
                        <>
                          <div className="stat-card stat-card-emerald" style={{ background: '#ECFDF5', borderColor: '#A7F3D0' }}>
                            <div className="stat-icon-wrapper" style={{ background: '#059669', color: '#FFF' }}><ShoppingBag size={18} /></div>
                            <div>
                              <div className="stat-number" style={{ color: '#065F46' }}>
                                {aiAnalysis.result.purchase_intent_metrics?.high_intent_pct}%
                              </div>
                              <div className="stat-label">Minat Beli Tinggi (High Intent)</div>
                            </div>
                          </div>
                          <div className="stat-card stat-card-blue">
                            <div className="stat-icon-wrapper"><Award size={18} /></div>
                            <div>
                              <div className="stat-number" style={{ fontSize: '16px' }}>
                                {aiAnalysis.result.consumer_perception?.perceived_quality || '-'}
                              </div>
                              <div className="stat-label">Persepsi Kualitas Produk</div>
                            </div>
                          </div>
                          <div className="stat-card stat-card-amber">
                            <div className="stat-icon-wrapper"><Target size={18} /></div>
                            <div>
                              <div className="stat-number" style={{ fontSize: '16px' }}>
                                {aiAnalysis.result.consumer_perception?.price_fairness_perception || '-'}
                              </div>
                              <div className="stat-label">Persepsi Kewajaran Harga</div>
                            </div>
                          </div>
                          <div className="stat-card stat-card-violet">
                            <div className="stat-icon-wrapper"><BarChart3 size={18} /></div>
                            <div>
                              <div className="stat-number" style={{ fontSize: '16px' }}>
                                {aiAnalysis.result.purchase_intent_metrics?.purchase_intent_verdict || '-'}
                              </div>
                              <div className="stat-label">Kesimpulan Potensi Pasar</div>
                            </div>
                          </div>
                        </>
                      ) : resultType === 'digital_discourse' ? (
                        <>
                          <div className="stat-card stat-card-blue">
                            <div className="stat-icon-wrapper"><CheckCircle2 size={18} /></div>
                            <div>
                              <div className="stat-number">{aiAnalysis.result.politeness_and_tone?.polite_constructive_pct}%</div>
                              <div className="stat-label">Tuturan Santun & Konstruktif</div>
                            </div>
                          </div>
                          <div className="stat-card stat-card-amber">
                            <div className="stat-icon-wrapper"><Flame size={18} /></div>
                            <div>
                              <div className="stat-number">
                                {(aiAnalysis.result.politeness_and_tone?.sarcastic_satirical_pct || 0) + (aiAnalysis.result.politeness_and_tone?.aggressive_toxic_pct || 0)}%
                              </div>
                              <div className="stat-label">Sarkasme & Tuturan Keras</div>
                            </div>
                          </div>
                          <div className="stat-card stat-card-violet">
                            <div className="stat-icon-wrapper"><MessageSquare size={18} /></div>
                            <div>
                              <div className="stat-number" style={{ fontSize: '16px' }}>
                                {aiAnalysis.result.politeness_and_tone?.dominant_tone || '-'}
                              </div>
                              <div className="stat-label">Nada Tutur Dominan</div>
                            </div>
                          </div>
                          <div className="stat-card stat-card-rose">
                            <div className="stat-icon-wrapper"><ShieldCheck size={18} /></div>
                            <div>
                              <div className="stat-number" style={{ fontSize: '16px' }}>
                                {aiAnalysis.result.linguistic_features?.netiquette_compliance_level || '-'}
                              </div>
                              <div className="stat-label">Kepatuhan Netiket Warganet</div>
                            </div>
                          </div>
                        </>
                      ) : resultType === 'social_psychology' ? (
                        <>
                          <div className="stat-card stat-card-rose">
                            <div className="stat-icon-wrapper"><Flame size={18} /></div>
                            <div>
                              <div className="stat-number">{aiAnalysis.result.psychological_metrics?.moral_outrage_pct}%</div>
                              <div className="stat-label">Kemarahan Moral Kolektif</div>
                            </div>
                          </div>
                          <div className="stat-card stat-card-blue">
                            <div className="stat-icon-wrapper"><Users size={18} /></div>
                            <div>
                              <div className="stat-number">{aiAnalysis.result.psychological_metrics?.conformity_bandwagon_pct}%</div>
                              <div className="stat-label">Konformitas (Ikut-ikutan)</div>
                            </div>
                          </div>
                          <div className="stat-card stat-card-violet">
                            <div className="stat-icon-wrapper"><Brain size={18} /></div>
                            <div>
                              <div className="stat-number" style={{ fontSize: '16px' }}>
                                {aiAnalysis.result.psychological_metrics?.dominant_psychological_state || '-'}
                              </div>
                              <div className="stat-label">Respon Psikologis Massa</div>
                            </div>
                          </div>
                          <div className="stat-card stat-card-amber">
                            <div className="stat-icon-wrapper"><Layers size={18} /></div>
                            <div>
                              <div className="stat-number" style={{ fontSize: '16px' }}>
                                {aiAnalysis.result.attribution_and_bias?.attribution_target || '-'}
                              </div>
                              <div className="stat-label">Arah Atribusi (Menyalahkan)</div>
                            </div>
                          </div>
                        </>
                      ) : resultType === 'entman_framing' ? (
                        <>
                          <div className="stat-card stat-card-blue">
                            <div className="stat-icon-wrapper"><Target size={18} /></div>
                            <div>
                              <div className="stat-number">{aiAnalysis.result.entman_dimensions?.define_problems?.problem_aspects?.[0]?.pct || 60}%</div>
                              <div className="stat-label">Define Problems</div>
                            </div>
                          </div>
                          <div className="stat-card stat-card-amber">
                            <div className="stat-icon-wrapper"><Layers size={18} /></div>
                            <div>
                              <div className="stat-number">{aiAnalysis.result.entman_dimensions?.diagnose_causes?.cause_attributions?.[0]?.pct || 55}%</div>
                              <div className="stat-label">Diagnose Causes</div>
                            </div>
                          </div>
                          <div className="stat-card stat-card-rose">
                            <div className="stat-icon-wrapper"><Award size={18} /></div>
                            <div>
                              <div className="stat-number">{aiAnalysis.result.entman_dimensions?.make_moral_judgments?.moral_evaluations?.[0]?.pct || 65}%</div>
                              <div className="stat-label">Moral Judgment</div>
                            </div>
                          </div>
                          <div className="stat-card stat-card-violet">
                            <div className="stat-icon-wrapper"><CheckCircle2 size={18} /></div>
                            <div>
                              <div className="stat-number">{aiAnalysis.result.entman_dimensions?.suggest_remedies?.remedy_proposals?.[0]?.pct || 50}%</div>
                              <div className="stat-label">Suggest Remedies</div>
                            </div>
                          </div>
                        </>
                      ) : (
                        <>
                          {/* Default: Emotion-driven marketing */}
                          <div className="stat-card stat-card-rose">
                            <div className="stat-icon-wrapper"><Target size={18} /></div>
                            <div>
                              <div className="stat-number">{aiAnalysis.result.ad_awareness?.drama_engaged_pct}%</div>
                              <div className="stat-label">Terkecoh / Terhanyut Drama</div>
                            </div>
                          </div>
                          <div className="stat-card stat-card-blue">
                            <div className="stat-icon-wrapper"><Flame size={18} /></div>
                            <div>
                              <div className="stat-number">{aiAnalysis.result.ad_awareness?.marketing_aware_pct}%</div>
                              <div className="stat-label">Sadar Iklan / Bongkar Marketing</div>
                            </div>
                          </div>
                          <div className="stat-card stat-card-violet">
                            <div className="stat-icon-wrapper"><Brain size={18} /></div>
                            <div>
                              <div className="stat-number" style={{ fontSize: '18px' }}>
                                {aiAnalysis.result.emotion_distribution?.dominant_emotion || '-'}
                              </div>
                              <div className="stat-label">Emosi Penonton Paling Dominan</div>
                            </div>
                          </div>
                          <div className="stat-card stat-card-amber">
                            <div className="stat-icon-wrapper"><Layers size={18} /></div>
                            <div>
                              <div className="stat-number">
                                {aiAnalysis.result.stance_dynamics?.controversy_level || 'Tinggi'}
                              </div>
                              <div className="stat-label">Tingkat Kontroversi & Debat</div>
                            </div>
                          </div>
                        </>
                      )}
                    </div>

                    {/* 3. Analytics Charts Grid */}
                    <div className="ai-analytics-grid">
                      {/* Left Card: Progress Breakdown */}
                      <div className="ai-card">
                        {resultType === 'public_sentiment' ? (
                          <>
                            <div className="ai-card-title">
                              <span>Distribusi Sentimen Publik</span>
                              <span className="ai-card-badge" style={{ background: '#DBEAFE', color: '#1E40AF' }}>
                                Audit Reputasi SCCT
                              </span>
                            </div>

                            <div className="progress-stat-row">
                              <div className="progress-stat-header">
                                <span className="progress-stat-name">👍 Positif / Apresiasi</span>
                                <span className="progress-stat-pct">{aiAnalysis.result.sentiment_metrics?.positive_pct}%</span>
                              </div>
                              <div className="progress-track">
                                <div className="progress-fill fill-green" style={{ width: `${aiAnalysis.result.sentiment_metrics?.positive_pct}%` }} />
                              </div>
                            </div>

                            <div className="progress-stat-row">
                              <div className="progress-stat-header">
                                <span className="progress-stat-name">😐 Netral / Pengamat</span>
                                <span className="progress-stat-pct">{aiAnalysis.result.sentiment_metrics?.neutral_pct}%</span>
                              </div>
                              <div className="progress-track">
                                <div className="progress-fill fill-gray" style={{ width: `${aiAnalysis.result.sentiment_metrics?.neutral_pct}%` }} />
                              </div>
                            </div>

                            <div className="progress-stat-row">
                              <div className="progress-stat-header">
                                <span className="progress-stat-name">👎 Negatif / Kecewa</span>
                                <span className="progress-stat-pct">{aiAnalysis.result.sentiment_metrics?.negative_pct}%</span>
                              </div>
                              <div className="progress-track">
                                <div className="progress-fill fill-amber" style={{ width: `${aiAnalysis.result.sentiment_metrics?.negative_pct}%` }} />
                              </div>
                            </div>

                            <div className="progress-stat-row">
                              <div className="progress-stat-header">
                                <span className="progress-stat-name">🚨 Kritis & Menuntut Pertanggungjawaban</span>
                                <span className="progress-stat-pct">{aiAnalysis.result.sentiment_metrics?.critical_pct}%</span>
                              </div>
                              <div className="progress-track">
                                <div className="progress-fill fill-rose" style={{ width: `${aiAnalysis.result.sentiment_metrics?.critical_pct}%` }} />
                              </div>
                            </div>

                            {aiAnalysis.result.reputation_audit?.key_grievances?.length > 0 && (
                              <div style={{ marginTop: '14px', fontSize: '12px', background: '#FEF2F2', padding: '10px 12px', borderRadius: '8px', border: '1px solid #FECACA' }}>
                                <strong style={{ color: '#DC2626' }}>Poin Kekecewaan Publik Terbesar:</strong>
                                <ul style={{ paddingLeft: '18px', marginTop: '4px', color: '#991B1B' }}>
                                  {aiAnalysis.result.reputation_audit.key_grievances.map((g, i) => (
                                    <li key={i}>{g}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </>
                        ) : resultType === 'consumer_behavior' ? (
                          <>
                            <div className="ai-card-title">
                              <span>Intensi Pembelian Konsumen (TPB)</span>
                              <span className="ai-card-badge" style={{ background: '#D1FAE5', color: '#065F46' }}>
                                E-Commerce & Perilaku
                              </span>
                            </div>

                            <div className="progress-stat-row">
                              <div className="progress-stat-header">
                                <span className="progress-stat-name">🛍️ Minat Beli Tinggi (Siap Checkout)</span>
                                <span className="progress-stat-pct">{aiAnalysis.result.purchase_intent_metrics?.high_intent_pct}%</span>
                              </div>
                              <div className="progress-track">
                                <div className="progress-fill fill-green" style={{ width: `${aiAnalysis.result.purchase_intent_metrics?.high_intent_pct}%` }} />
                              </div>
                            </div>

                            <div className="progress-stat-row">
                              <div className="progress-stat-header">
                                <span className="progress-stat-name">🔍 Tertarik / Penasaran Detail</span>
                                <span className="progress-stat-pct">{aiAnalysis.result.purchase_intent_metrics?.moderate_curious_pct}%</span>
                              </div>
                              <div className="progress-track">
                                <div className="progress-fill fill-blue" style={{ width: `${aiAnalysis.result.purchase_intent_metrics?.moderate_curious_pct}%` }} />
                              </div>
                            </div>

                            <div className="progress-stat-row">
                              <div className="progress-stat-header">
                                <span className="progress-stat-name">🏷️ Skeptis Terhadap Harga</span>
                                <span className="progress-stat-pct">{aiAnalysis.result.purchase_intent_metrics?.price_skeptic_pct}%</span>
                              </div>
                              <div className="progress-track">
                                <div className="progress-fill fill-amber" style={{ width: `${aiAnalysis.result.purchase_intent_metrics?.price_skeptic_pct}%` }} />
                              </div>
                            </div>

                            <div className="progress-stat-row">
                              <div className="progress-stat-header">
                                <span className="progress-stat-name">❌ Menolak / Tidak Berminat</span>
                                <span className="progress-stat-pct">{aiAnalysis.result.purchase_intent_metrics?.resistant_uninterested_pct}%</span>
                              </div>
                              <div className="progress-track">
                                <div className="progress-fill fill-rose" style={{ width: `${aiAnalysis.result.purchase_intent_metrics?.resistant_uninterested_pct}%` }} />
                              </div>
                            </div>

                            {aiAnalysis.result.consumer_perception?.primary_purchase_barriers?.length > 0 && (
                              <div style={{ marginTop: '14px', fontSize: '12px', background: '#FFFBEB', padding: '10px 12px', borderRadius: '8px', border: '1px solid #FDE68A' }}>
                                <strong style={{ color: '#B45309' }}>Hambatan Konversi Pembeli:</strong>
                                <ul style={{ paddingLeft: '18px', marginTop: '4px', color: '#92400E' }}>
                                  {aiAnalysis.result.consumer_perception.primary_purchase_barriers.map((b, i) => (
                                    <li key={i}>{b}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </>
                        ) : resultType === 'digital_discourse' ? (
                          <>
                            <div className="ai-card-title">
                              <span>Tingkat Kesantunan Bahasa (Politeness)</span>
                              <span className="ai-card-badge" style={{ background: '#EDE9FE', color: '#7C3AED' }}>
                                Brown & Levinson Model
                              </span>
                            </div>

                            <div className="progress-stat-row">
                              <div className="progress-stat-header">
                                <span className="progress-stat-name">✨ Santun, Hormat & Konstruktif</span>
                                <span className="progress-stat-pct">{aiAnalysis.result.politeness_and_tone?.polite_constructive_pct}%</span>
                              </div>
                              <div className="progress-track">
                                <div className="progress-fill fill-green" style={{ width: `${aiAnalysis.result.politeness_and_tone?.polite_constructive_pct}%` }} />
                              </div>
                            </div>

                            <div className="progress-stat-row">
                              <div className="progress-stat-header">
                                <span className="progress-stat-name">💬 Netral / Informatif Santai</span>
                                <span className="progress-stat-pct">{aiAnalysis.result.politeness_and_tone?.neutral_informative_pct}%</span>
                              </div>
                              <div className="progress-track">
                                <div className="progress-fill fill-blue" style={{ width: `${aiAnalysis.result.politeness_and_tone?.neutral_informative_pct}%` }} />
                              </div>
                            </div>

                            <div className="progress-stat-row">
                              <div className="progress-stat-header">
                                <span className="progress-stat-name">😏 Sarkasme, Ironi & Sindiran</span>
                                <span className="progress-stat-pct">{aiAnalysis.result.politeness_and_tone?.sarcastic_satirical_pct}%</span>
                              </div>
                              <div className="progress-track">
                                <div className="progress-fill fill-purple" style={{ width: `${aiAnalysis.result.politeness_and_tone?.sarcastic_satirical_pct}%` }} />
                              </div>
                            </div>

                            <div className="progress-stat-row">
                              <div className="progress-stat-header">
                                <span className="progress-stat-name">🔥 Agresif / Menyerang (Toxic)</span>
                                <span className="progress-stat-pct">{aiAnalysis.result.politeness_and_tone?.aggressive_toxic_pct}%</span>
                              </div>
                              <div className="progress-track">
                                <div className="progress-fill fill-rose" style={{ width: `${aiAnalysis.result.politeness_and_tone?.aggressive_toxic_pct}%` }} />
                              </div>
                            </div>

                            {aiAnalysis.result.linguistic_features?.prominent_slang_and_jargon?.length > 0 && (
                              <div style={{ marginTop: '14px', fontSize: '12px', background: '#F5F3FF', padding: '10px 12px', borderRadius: '8px', border: '1px solid #DDD6FE' }}>
                                <strong style={{ color: '#6D28D9' }}>Slang & Kosakata Dominan Netizen:</strong>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '6px' }}>
                                  {aiAnalysis.result.linguistic_features.prominent_slang_and_jargon.map((s, i) => (
                                    <span key={i} style={{ background: '#EDE9FE', color: '#5B21B6', padding: '2px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 600 }}>
                                      {s}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                          </>
                        ) : resultType === 'social_psychology' ? (
                          <>
                            <div className="ai-card-title">
                              <span>Reaksi Psikologis & Dinamika Kelompok</span>
                              <span className="ai-card-badge" style={{ background: '#FCE7F3', color: '#BE185D' }}>
                                Social Identity & Morality
                              </span>
                            </div>

                            <div className="progress-stat-row">
                              <div className="progress-stat-header">
                                <span className="progress-stat-name">⚡ Kemarahan Moral Kolektif (Outrage)</span>
                                <span className="progress-stat-pct">{aiAnalysis.result.psychological_metrics?.moral_outrage_pct}%</span>
                              </div>
                              <div className="progress-track">
                                <div className="progress-fill fill-rose" style={{ width: `${aiAnalysis.result.psychological_metrics?.moral_outrage_pct}%` }} />
                              </div>
                            </div>

                            <div className="progress-stat-row">
                              <div className="progress-stat-header">
                                <span className="progress-stat-name">👥 Konformitas (Efek Ikut-ikutan)</span>
                                <span className="progress-stat-pct">{aiAnalysis.result.psychological_metrics?.conformity_bandwagon_pct}%</span>
                              </div>
                              <div className="progress-track">
                                <div className="progress-fill fill-amber" style={{ width: `${aiAnalysis.result.psychological_metrics?.conformity_bandwagon_pct}%` }} />
                              </div>
                            </div>

                            <div className="progress-stat-row">
                              <div className="progress-stat-header">
                                <span className="progress-stat-name">🤝 Empati & Solidaritas Sosial</span>
                                <span className="progress-stat-pct">{aiAnalysis.result.psychological_metrics?.social_empathy_pct}%</span>
                              </div>
                              <div className="progress-track">
                                <div className="progress-fill fill-blue" style={{ width: `${aiAnalysis.result.psychological_metrics?.social_empathy_pct}%` }} />
                              </div>
                            </div>

                            <div className="progress-stat-row">
                              <div className="progress-stat-header">
                                <span className="progress-stat-name">😶 Apati / Ketidakpedulian</span>
                                <span className="progress-stat-pct">{aiAnalysis.result.psychological_metrics?.apathy_detachment_pct}%</span>
                              </div>
                              <div className="progress-track">
                                <div className="progress-fill fill-gray" style={{ width: `${aiAnalysis.result.psychological_metrics?.apathy_detachment_pct}%` }} />
                              </div>
                            </div>

                            {aiAnalysis.result.attribution_and_bias?.cognitive_bias_detected && (
                              <div style={{ marginTop: '14px', fontSize: '12px', background: '#FDF2F8', padding: '10px 12px', borderRadius: '8px', border: '1px solid #FBCFE8' }}>
                                <strong style={{ color: '#BE185D' }}>Bias Kognitif Teridentifikasi:</strong>
                                <p style={{ margin: '4px 0 0', color: '#9D174D' }}>
                                  {aiAnalysis.result.attribution_and_bias.cognitive_bias_detected}
                                </p>
                              </div>
                            )}
                          </>
                        ) : (
                          <>
                            {/* Default: Emotion-driven marketing */}
                            <div className="ai-card-title">
                              <span>Klasifikasi Emosi Penonton (RQ1)</span>
                              <span className="ai-card-badge" style={{ background: '#EDE9FE', color: '#7C3AED' }}>
                                Model Ekman / Plutchik
                              </span>
                            </div>

                            <div className="progress-stat-row">
                              <div className="progress-stat-header">
                                <span className="progress-stat-name">😡 Kemarahan / Outrage</span>
                                <span className="progress-stat-pct">{aiAnalysis.result.emotion_distribution?.anger_pct}%</span>
                              </div>
                              <div className="progress-track">
                                <div className="progress-fill fill-rose" style={{ width: `${aiAnalysis.result.emotion_distribution?.anger_pct}%` }} />
                              </div>
                            </div>

                            <div className="progress-stat-row">
                              <div className="progress-stat-header">
                                <span className="progress-stat-name">😢 Rasa Iba / Simpati / Empati</span>
                                <span className="progress-stat-pct">{aiAnalysis.result.emotion_distribution?.sympathy_pct}%</span>
                              </div>
                              <div className="progress-track">
                                <div className="progress-fill fill-blue" style={{ width: `${aiAnalysis.result.emotion_distribution?.sympathy_pct}%` }} />
                              </div>
                            </div>

                            <div className="progress-stat-row">
                              <div className="progress-stat-header">
                                <span className="progress-stat-name">🤨 Skeptis / Curiga Settingan</span>
                                <span className="progress-stat-pct">{aiAnalysis.result.emotion_distribution?.skepticism_pct}%</span>
                              </div>
                              <div className="progress-track">
                                <div className="progress-fill fill-amber" style={{ width: `${aiAnalysis.result.emotion_distribution?.skepticism_pct}%` }} />
                              </div>
                            </div>

                            <div className="progress-stat-row">
                              <div className="progress-stat-header">
                                <span className="progress-stat-name">😂 Ejekan / Sarkasme</span>
                                <span className="progress-stat-pct">{aiAnalysis.result.emotion_distribution?.sarcasm_pct}%</span>
                              </div>
                              <div className="progress-track">
                                <div className="progress-fill fill-purple" style={{ width: `${aiAnalysis.result.emotion_distribution?.sarcasm_pct}%` }} />
                              </div>
                            </div>

                            <div className="progress-stat-row">
                              <div className="progress-stat-header">
                                <span className="progress-stat-name">😐 Netral / Lainnya</span>
                                <span className="progress-stat-pct">{aiAnalysis.result.emotion_distribution?.neutral_pct}%</span>
                              </div>
                              <div className="progress-track">
                                <div className="progress-fill fill-gray" style={{ width: `${aiAnalysis.result.emotion_distribution?.neutral_pct}%` }} />
                              </div>
                            </div>

                            <div style={{ marginTop: '14px', fontSize: '12.5px', color: 'var(--color-text-secondary)', background: '#F9FAFB', padding: '10px 12px', borderRadius: '8px' }}>
                              <strong>Insight Emosi:</strong> {aiAnalysis.result.emotion_distribution?.dominant_emotion_explanation}
                            </div>
                          </>
                        )}
                      </div>

                      {/* Right Card: Stance Dynamics & Perspective-Specific Synthesis */}
                      <div className="ai-card">
                        <div className="ai-card-title">
                          <span>Polarisasi & Stance Dynamics</span>
                          <span className="ai-card-badge" style={{ background: '#FEF3C7', color: '#D97706' }}>
                            Dinamika Kubu
                          </span>
                        </div>

                        {/* Stance Dual Meter */}
                        <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: '6px' }}>
                          Dua Kubu Utama yang Terbelah di Komentar:
                        </div>

                        <div className="stance-meter-container">
                          <div className="stance-meter-bar">
                            <div
                              className="stance-side-a"
                              style={{ width: `${aiAnalysis.result.stance_dynamics?.side_a_pct || 45}%` }}
                              title={aiAnalysis.result.stance_dynamics?.side_a_name}
                            >
                              {aiAnalysis.result.stance_dynamics?.side_a_pct}%
                            </div>
                            <div
                              className="stance-side-b"
                              style={{ width: `${aiAnalysis.result.stance_dynamics?.side_b_pct || 40}%` }}
                              title={aiAnalysis.result.stance_dynamics?.side_b_name}
                            >
                              {aiAnalysis.result.stance_dynamics?.side_b_pct}%
                            </div>
                            <div
                              className="stance-side-neutral"
                              style={{ width: `${aiAnalysis.result.stance_dynamics?.neutral_pct || 15}%` }}
                              title="Netral"
                            >
                              {aiAnalysis.result.stance_dynamics?.neutral_pct}%
                            </div>
                          </div>

                          <div className="stance-legend-row">
                            <span style={{ color: '#2563EB', fontWeight: 600 }}>
                              ● {aiAnalysis.result.stance_dynamics?.side_a_name}
                            </span>
                            <span style={{ color: '#DC2626', fontWeight: 600 }}>
                              ● {aiAnalysis.result.stance_dynamics?.side_b_name}
                            </span>
                            <span style={{ color: '#6B7280' }}>
                              ● Netral
                            </span>
                          </div>
                        </div>

                        <p style={{ fontSize: '12.5px', color: 'var(--color-text-secondary)', lineHeight: '1.5', marginTop: '12px' }}>
                          {aiAnalysis.result.stance_dynamics?.polarization_summary}
                        </p>

                        {/* Perspective-Specific Bottom Evaluation */}
                        {resultType === 'public_sentiment' && aiAnalysis.result.pr_crisis_recommendations && (
                          <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px solid var(--color-border)' }}>
                            <div style={{ fontSize: '13px', fontWeight: 600, color: '#1E40AF', marginBottom: '4px' }}>
                              Rekomendasi Respons Krisis PR:
                            </div>
                            <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', lineHeight: '1.5', marginBottom: '8px' }}>
                              <strong>Strategi Disarankan:</strong> {aiAnalysis.result.pr_crisis_recommendations.recommended_response_strategy}
                            </p>
                            {aiAnalysis.result.pr_crisis_recommendations.holding_statement_draft && (
                              <div style={{ background: '#F8FAFC', padding: '8px 10px', borderRadius: '6px', fontSize: '11.5px', fontStyle: 'italic', borderLeft: '3px solid #3B82F6' }}>
                                "{aiAnalysis.result.pr_crisis_recommendations.holding_statement_draft}"
                              </div>
                            )}
                          </div>
                        )}

                        {resultType === 'consumer_behavior' && aiAnalysis.result.ewom_dynamics && (
                          <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px solid var(--color-border)' }}>
                            <div style={{ fontSize: '13px', fontWeight: 600, color: '#059669', marginBottom: '4px' }}>
                              Dinamika eWOM (Word of Mouth):
                            </div>
                            <p style={{ fontSize: '12.5px', color: 'var(--color-text-secondary)', lineHeight: '1.5' }}>
                              {aiAnalysis.result.ewom_dynamics.ewom_influence_summary}
                            </p>
                          </div>
                        )}

                        {resultType === 'digital_discourse' && aiAnalysis.result.linguistic_features && (
                          <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px solid var(--color-border)' }}>
                            <div style={{ fontSize: '13px', fontWeight: 600, color: '#7C3AED', marginBottom: '4px' }}>
                              Gaya Bahasa & Risiko Flaming:
                            </div>
                            <p style={{ fontSize: '12.5px', color: 'var(--color-text-secondary)', lineHeight: '1.5' }}>
                              Gaya Utama: <strong>{aiAnalysis.result.linguistic_features.rhetorical_devices_used}</strong> • Risiko Cyberbullying: <strong>{aiAnalysis.result.linguistic_features.flaming_and_cyberbullying_risk}</strong>
                            </p>
                          </div>
                        )}

                        {resultType === 'social_psychology' && aiAnalysis.result.attribution_and_bias && (
                          <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px solid var(--color-border)' }}>
                            <div style={{ fontSize: '13px', fontWeight: 600, color: '#DB2777', marginBottom: '4px' }}>
                              Pertimbangan Moralitas Kelompok:
                            </div>
                            <p style={{ fontSize: '12.5px', color: 'var(--color-text-secondary)', lineHeight: '1.5' }}>
                              {aiAnalysis.result.attribution_and_bias.moral_judgment_summary}
                            </p>
                          </div>
                        )}

                        {resultType === 'emotion_marketing' && aiAnalysis.result.ad_awareness && (
                          <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px solid var(--color-border)' }}>
                            <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: '4px' }}>
                              Evaluasi Ad-Awareness:
                            </div>
                            <p style={{ fontSize: '12.5px', color: 'var(--color-text-secondary)', lineHeight: '1.5' }}>
                              {aiAnalysis.result.ad_awareness.analysis}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Entman Framing 4 Quadrant Display (Khusus S2 Ilmu Komunikasi) */}
                    {resultType === 'entman_framing' && aiAnalysis.result.entman_dimensions && (
                      <div className="ai-card" style={{ marginBottom: '22px' }}>
                        <div className="ai-card-title">
                          <span>Matriks 4 Dimensi Framing Robert Entman (1993)</span>
                          <span className="ai-card-badge" style={{ background: '#CCFBF1', color: '#0F766E' }}>
                            Model Analisis Tesis S2
                          </span>
                        </div>

                        <div className="entman-quadrant-grid">
                          {/* 1. Define Problems */}
                          <div className="entman-quadrant-card q-problem">
                            <div className="quadrant-head">
                              <span className="quadrant-badge">1. Define Problems</span>
                              <span className="stat-pill-sm" style={{ background: '#E0F2FE', color: '#0369A1' }}>Masalah</span>
                            </div>
                            <div className="quadrant-main-highlight">
                              <strong>Definisi Dominan:</strong>
                              {aiAnalysis.result.entman_dimensions.define_problems?.dominant_definition}
                            </div>
                            <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', lineHeight: '1.4' }}>
                              {aiAnalysis.result.entman_dimensions.define_problems?.explanation}
                            </p>
                            <div className="quadrant-items-list">
                              {(aiAnalysis.result.entman_dimensions.define_problems?.problem_aspects || []).map((item, idx) => (
                                <div key={idx} className="quadrant-sub-item">
                                  <div className="quadrant-sub-item-header">
                                    <span>{item.aspect}</span>
                                    <span>{item.pct}%</span>
                                  </div>
                                  {item.sample_quote && (
                                    <span className="quadrant-quote">"{item.sample_quote}"</span>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* 2. Diagnose Causes */}
                          <div className="entman-quadrant-card q-cause">
                            <div className="quadrant-head">
                              <span className="quadrant-badge">2. Diagnose Causes</span>
                              <span className="stat-pill-sm" style={{ background: '#FEF3C7', color: '#B45309' }}>Penyebab</span>
                            </div>
                            <div className="quadrant-main-highlight">
                              <strong>Aktor / Faktor Kunci:</strong>
                              {aiAnalysis.result.entman_dimensions.diagnose_causes?.primary_culprit}
                            </div>
                            <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', lineHeight: '1.4' }}>
                              {aiAnalysis.result.entman_dimensions.diagnose_causes?.explanation}
                            </p>
                            <div className="quadrant-items-list">
                              {(aiAnalysis.result.entman_dimensions.diagnose_causes?.cause_attributions || []).map((item, idx) => (
                                <div key={idx} className="quadrant-sub-item">
                                  <div className="quadrant-sub-item-header">
                                    <span>{item.cause}</span>
                                    <span>{item.pct}%</span>
                                  </div>
                                  {item.sample_quote && (
                                    <span className="quadrant-quote">"{item.sample_quote}"</span>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* 3. Make Moral Judgments */}
                          <div className="entman-quadrant-card q-moral">
                            <div className="quadrant-head">
                              <span className="quadrant-badge">3. Make Moral Judgments</span>
                              <span className="stat-pill-sm" style={{ background: '#FFE4E6', color: '#BE123C' }}>Sikap Moral</span>
                            </div>
                            <div className="quadrant-main-highlight">
                              <strong>Penilaian Moral:</strong>
                              {aiAnalysis.result.entman_dimensions.make_moral_judgments?.moral_verdict}
                            </div>
                            <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', lineHeight: '1.4' }}>
                              {aiAnalysis.result.entman_dimensions.make_moral_judgments?.explanation}
                            </p>
                            <div className="quadrant-items-list">
                              {(aiAnalysis.result.entman_dimensions.make_moral_judgments?.moral_evaluations || []).map((item, idx) => (
                                <div key={idx} className="quadrant-sub-item">
                                  <div className="quadrant-sub-item-header">
                                    <span>{item.judgment}</span>
                                    <span>{item.pct}%</span>
                                  </div>
                                  {item.sample_quote && (
                                    <span className="quadrant-quote">"{item.sample_quote}"</span>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* 4. Suggest Remedies */}
                          <div className="entman-quadrant-card q-remedy">
                            <div className="quadrant-head">
                              <span className="quadrant-badge">4. Suggest Remedies</span>
                              <span className="stat-pill-sm" style={{ background: '#DCFCE7', color: '#15803D' }}>Solusi</span>
                            </div>
                            <div className="quadrant-main-highlight">
                              <strong>Tuntutan Utama:</strong>
                              {aiAnalysis.result.entman_dimensions.suggest_remedies?.dominant_remedy}
                            </div>
                            <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', lineHeight: '1.4' }}>
                              {aiAnalysis.result.entman_dimensions.suggest_remedies?.explanation}
                            </p>
                            <div className="quadrant-items-list">
                              {(aiAnalysis.result.entman_dimensions.suggest_remedies?.remedy_proposals || []).map((item, idx) => (
                                <div key={idx} className="quadrant-sub-item">
                                  <div className="quadrant-sub-item-header">
                                    <span>{item.proposal}</span>
                                    <span>{item.pct}%</span>
                                  </div>
                                  {item.sample_quote && (
                                    <span className="quadrant-quote">"{item.sample_quote}"</span>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>

                        {aiAnalysis.result.counter_frames?.has_counter_frame && (
                          <div className="entman-counter-frame-card">
                            <div className="counter-frame-head">
                              <span>Frame Tandingan (Counter-Frame): {aiAnalysis.result.counter_frames.counter_frame_name} ({aiAnalysis.result.counter_frames.counter_frame_pct}%)</span>
                            </div>
                            <p style={{ fontSize: '12.5px', color: '#92400e', lineHeight: '1.45' }}>
                              {aiAnalysis.result.counter_frames.counter_frame_argument}
                            </p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* 4. Topic Clusters */}
                    <div className="ai-card" style={{ marginBottom: '22px' }}>
                      <div className="ai-card-title">
                        <span>Klaster Topik Pembicaraan Netizen (Topic Modeling)</span>
                        <span className="ai-card-badge" style={{ background: '#DBEAFE', color: '#1E40AF' }}>
                          {aiAnalysis.result.topic_clusters?.length || 0} Klaster Ditemukan
                        </span>
                      </div>

                      <div className="topic-clusters-grid">
                        {(aiAnalysis.result.topic_clusters || []).map((cluster, idx) => (
                          <div key={idx} className="topic-cluster-item">
                            <div>
                              <div className="topic-cluster-header">
                                <span className="topic-cluster-name">{cluster.topic_name}</span>
                                <span className="topic-cluster-pct">{cluster.pct}%</span>
                              </div>
                              <p className="topic-cluster-desc">{cluster.description}</p>
                            </div>
                            {cluster.sample_quote && (
                              <div className="topic-quote-bubble">
                                "{cluster.sample_quote}"
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* 5. Academic Synthesis Card (Ready for Skripsi Chapter 4) */}
                    <div className="thesis-synthesis-card">
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px', marginBottom: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <Sparkles size={20} color="var(--color-primary)" />
                          <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                            Sintesis Analisis Akademik (Draf Bab 4 Skripsi - {activeResultFw.title})
                          </h3>
                        </div>

                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button
                            className="btn btn-white-bordered"
                            style={{ fontSize: '12px', padding: '6px 12px' }}
                            onClick={() => copyThesisParagraph(aiAnalysis.result.academic_insights?.thesis_summary_paragraph)}
                          >
                            {copiedThesisText ? (
                              <>
                                <Check size={14} color="#16A34A" />
                                <span style={{ color: '#16A34A' }}>Tersalin!</span>
                              </>
                            ) : (
                              <>
                                <Copy size={14} />
                                <span>Salin Paragraf Skripsi</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Verdict Tag & Theoretical Grounding */}
                      <div style={{ margin: '10px 0', display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                        {aiAnalysis.result.academic_insights?.brand_hijack_verdict && (
                          <span
                            style={{
                              fontSize: '12px',
                              fontWeight: 700,
                              padding: '4px 10px',
                              borderRadius: 'var(--radius-pill)',
                              background: '#FEF2F2',
                              color: '#DC2626',
                              border: '1px solid #FECACA'
                            }}
                          >
                            {aiAnalysis.result.academic_insights.brand_hijack_verdict}
                          </span>
                        )}
                        <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>
                          Relevansi Teori: <strong>{aiAnalysis.result.academic_insights?.theoretical_relevance || activeResultFw.theory}</strong>
                        </span>
                      </div>

                      {/* Bullet Points */}
                      <ul className="thesis-findings-list">
                        {(aiAnalysis.result.academic_insights?.key_findings || []).map((finding, idx) => (
                          <li key={idx} className="thesis-finding-item">
                            <CheckCircle2 size={16} color="#2563EB" style={{ flexShrink: 0, marginTop: '2px' }} />
                            <span>{finding}</span>
                          </li>
                        ))}
                      </ul>

                      {/* Paragraph */}
                      <div className="thesis-paragraph-box">
                        {aiAnalysis.result.academic_insights?.thesis_summary_paragraph}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })()}

          {/* ====================================================================
              TAB 3: RIWAYAT DATASET PENELITIAN
              ==================================================================== */}
          {activeTab === 'files' && (
            <div>
              <div className="dashboard-hero">
                <h2>Riwayat Dataset Penelitian</h2>
                <p>Seluruh dataset hasil riset dan analisis komentar yang tersimpan aman di akun privat Anda.</p>
              </div>

              {files.length === 0 ? (
                <div className="empty-state-box">
                  <FolderArchive size={42} className="empty-state-icon" />
                  <h4>Belum ada dataset penelitian tersimpan</h4>
                  <p>Gunakan tab Dashboard untuk memulai scraping video atau mengunggah data penelitian Anda.</p>
                  <button className="btn btn-scrape-primary" onClick={() => setActiveTab('dashboard')} style={{ height: '38px', padding: '0 16px' }}>
                    Mulai Scraping
                  </button>
                </div>
              ) : (
                <div className="recent-table-card">
                  <table className="recent-table">
                    <thead>
                      <tr>
                        <th>Nama Dataset</th>
                        <th>Topik / Caption Video</th>
                        <th>Jumlah Komentar</th>
                        <th>Terakhir Diperbarui</th>
                        <th style={{ textAlign: 'right' }}>Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {files.map((f) => (
                        <tr key={f.filename}>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600 }}>
                              <Database size={18} color="var(--color-primary)" />
                              <span>{f.filename.replace(/\.json$/i, '')}</span>
                            </div>
                          </td>
                          <td>
                            <span style={{ color: 'var(--color-text-secondary)', fontSize: '13px' }}>
                              {f.caption ? `${f.caption.slice(0, 60)}...` : '-'}
                            </span>
                          </td>
                          <td>
                            <span style={{ fontWeight: 600 }}>{f.comments_count} komentar</span>
                          </td>
                          <td>
                            <span style={{ fontSize: '12.5px', color: 'var(--color-text-muted)' }}>
                              {formatDate(f.modified)}
                            </span>
                          </td>
                          <td style={{ textAlign: 'right' }}>
                            <div style={{ display: 'inline-flex', gap: '6px' }}>
                              <button
                                className="btn btn-white-bordered"
                                style={{ padding: '6px 12px', fontSize: '12px' }}
                                onClick={() => loadFileContent(f.filename, true)}
                              >
                                Komentar ➔
                              </button>
                              <button
                                className="btn btn-white-bordered"
                                style={{ padding: '6px 12px', fontSize: '12px', color: '#7C3AED', borderColor: '#DDD6FE' }}
                                onClick={() => {
                                  loadFileContent(f.filename);
                                  setActiveTab('ai-analysis');
                                }}
                              >
                                Analisis AI ➔
                              </button>
                              <button
                                className="btn btn-white-bordered"
                                style={{ padding: '6px 10px', fontSize: '12px', color: '#DC2626', borderColor: '#FECACA' }}
                                onClick={() => handleDeleteUserFile(f.filename)}
                                title="Hapus dataset dari akun Anda"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ====================================================================
              TAB 4: PENGATURAN & PROFIL RISET
              ==================================================================== */}
          {activeTab === 'settings' && (
            <div>
              <div className="dashboard-hero">
                <h2>Pengaturan Akun & Preferensi Riset</h2>
                <p>Kelola profil peneliti, status keamanan akun, dan preferensi workspace penelitian.</p>
              </div>

              <div className="settings-card">
                <div className="settings-group">
                  <div className="settings-group-title">Profil Peneliti</div>
                  <div className="settings-group-desc">
                    Akun Anda terlindungi dengan privasi penuh. Seluruh data penelitian, dataset komentar, dan draf bab skripsi hanya dapat diakses oleh akun Anda.
                    <div style={{ marginTop: '14px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <div style={{ fontSize: '13px' }}>
                        👤 <strong>Nama Peneliti:</strong> {currentUser.displayName || 'Peneliti'}
                      </div>
                      <div style={{ fontSize: '13px' }}>
                        ✉️ <strong>Alamat Email:</strong> {currentUser.email}
                      </div>
                      <div style={{ fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <ShieldCheck size={15} color="#16A34A" />
                        <span><strong>Status Privasi:</strong> Ruang Riset Privat & Terenkripsi</span>
                      </div>
                      <div style={{ marginTop: '8px' }}>
                        <button
                          className="btn btn-white-bordered"
                          onClick={handleLogout}
                          style={{ color: '#DC2626', borderColor: '#FCA5A5', background: '#FEF2F2', padding: '7px 16px', fontSize: '12.5px' }}
                        >
                          <LogOut size={13} style={{ marginRight: '6px' }} /> Keluar dari Akun (Logout)
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="settings-group">
                  <div className="settings-group-title">Mesin Analisis Kecerdasan Buatan (AI Engine)</div>
                  <div className="settings-group-desc">
                    Workspace riset ini ditenagai oleh model AI penalaran tingkat lanjut untuk analisis kuantitatif dan kualitatif:
                    <ul style={{ paddingLeft: '20px', marginTop: '8px', lineHeight: '1.7' }}>
                      <li><strong>Model Penalaran:</strong> Gemini 3.8 Flash (Multimodal & Fast Reasoning)</li>
                      <li><strong>Kerangka Teoretis:</strong> Framing Robert Entman (1993), Sentimen Publik, Perilaku Konsumen, Psikologi Sosial</li>
                      <li><strong>Validitas Metodologis:</strong> Dilengkapi Kalkulator Reliabilitas Antar-Pengkode (Cohen's Kappa)</li>
                    </ul>
                  </div>
                </div>

                <div className="settings-group">
                  <div className="settings-group-title">Dukungan Platform Media Sosial</div>
                  <div className="settings-group-desc">
                    Workspace mendukung pengumpulan data komentar dari platform:
                    <ul style={{ paddingLeft: '20px', marginTop: '8px', lineHeight: '1.7' }}>
                      <li><strong>YouTube:</strong> Video Reguler & YouTube Shorts</li>
                      <li><strong>TikTok:</strong> Video Publik, Caption & Balasan Komentar Bertingkat</li>
                      <li><strong>Instagram:</strong> Postingan Feed & Reels</li>
                    </ul>
                  </div>
                </div>

                <div className="settings-group">
                  <div className="settings-group-title">Tentang Workspace</div>
                  <div className="settings-group-desc">
                    Tassiori — AI Research Workspace • Dirancang khusus untuk mahasiswa dan peneliti Ilmu Komunikasi & Sosial Humaniora.
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Mobile App Bottom Navigation Bar */}
      <nav className="mobile-bottom-nav">
        <button
          className={`mobile-nav-tab ${activeTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => handleNavClick('dashboard')}
          aria-label="Dashboard"
        >
          <div className="mobile-nav-icon-wrap">
            <LayoutDashboard size={20} />
          </div>
          <span className="mobile-nav-label">Dashboard</span>
        </button>

        <button
          className={`mobile-nav-tab ${activeTab === 'results' ? 'active' : ''}`}
          onClick={() => handleNavClick('results')}
          aria-label="Komentar"
        >
          <div className="mobile-nav-icon-wrap">
            <MessageSquare size={20} />
            {data?.comments?.length ? (
              <span className="mobile-nav-badge">{data.comments.length > 999 ? '999+' : data.comments.length}</span>
            ) : null}
          </div>
          <span className="mobile-nav-label">Komentar</span>
        </button>

        <button
          className={`mobile-nav-tab ${activeTab === 'ai-analysis' ? 'active' : ''}`}
          onClick={() => handleNavClick('ai-analysis')}
          aria-label="AI Skripsi"
        >
          <div className="mobile-nav-icon-wrap">
            <Brain size={20} />
            <span className="mobile-nav-badge ai">AI</span>
          </div>
          <span className="mobile-nav-label">AI Skripsi</span>
        </button>

        <button
          className={`mobile-nav-tab ${activeTab === 'files' ? 'active' : ''}`}
          onClick={() => handleNavClick('files')}
          aria-label="Riwayat File"
        >
          <div className="mobile-nav-icon-wrap">
            <FolderArchive size={20} />
            {files.length > 0 && <span className="mobile-nav-badge">{files.length}</span>}
          </div>
          <span className="mobile-nav-label">Riwayat</span>
        </button>

        <button
          className={`mobile-nav-tab ${activeTab === 'settings' ? 'active' : ''}`}
          onClick={() => handleNavClick('settings')}
          aria-label="Pengaturan"
        >
          <div className="mobile-nav-icon-wrap">
            <Settings size={20} />
          </div>
          <span className="mobile-nav-label">Pengaturan</span>
        </button>
      </nav>

      {/* Modal Ekspor Statistik Multi-Format (SPSS, Excel, SmartPLS, JASP) */}
      <ExportStatsModal
        isOpen={showExportStatsModal}
        onClose={() => setShowExportStatsModal(false)}
        allComments={data?.comments || []}
        filteredComments={filteredComments || []}
        selectedFileName={selectedFile || 'dataset'}
        searchKeyword={searchKeyword}
      />

      {/* Modal Sitasi Otomatis (APA 7th, Harvard, Mendeley, BibTeX) */}
      <CitationModal
        isOpen={showCitationModal}
        onClose={() => setShowCitationModal(false)}
        data={data}
        selectedFileName={selectedFile || 'video'}
      />

      {/* Modal Kutipan Verbatim Bab 4 Skripsi */}
      <VerbatimQuoteModal
        isOpen={!!verbatimModalComment}
        onClose={() => setVerbatimModalComment(null)}
        comment={verbatimModalComment}
        commentIndex={verbatimModalIndex}
        videoTitle={data?.caption || ''}
        videoUrl={data?.video_url || ''}
      />

      {/* Modal Kalkulator Inter-Coder Reliability (Cohen's Kappa) */}
      <InterCoderModal
        isOpen={showInterCoderModal}
        onClose={() => setShowInterCoderModal(false)}
        allComments={data?.comments || []}
        selectedFileName={selectedFile || 'dataset'}
      />
    </div>
  );
}
