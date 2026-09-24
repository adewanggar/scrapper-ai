import React, { useState, useEffect, useMemo, useRef } from 'react';
import ExportStatsModal from './components/ExportStatsModal';
import CitationModal from './components/CitationModal';
import VerbatimQuoteModal from './components/VerbatimQuoteModal';
import InterCoderModal from './components/InterCoderModal';
import AuthScreen from './components/AuthScreen';
// PinLockScreen dihapus
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import MobileNav from './components/layout/MobileNav';
import DashboardPage from './pages/DashboardPage';
import CommentsPage from './pages/CommentsPage';
import AnalysisPage from './pages/AnalysisPage';
import DatasetsPage from './pages/DatasetsPage';
import SettingsPage from './pages/SettingsPage';

import {
  STOPWORDS,
  API_BASE,
  TAB_ROUTES,
  ROUTE_TABS,
  getInitialTab
} from './constants/frameworks';

import {
  subscribeToAuth,
  logoutUser,
  saveUserScrape,
  getUserScrapes,
  getUserScrapeContent,
  saveUserAiAnalysis,
  getUserAiAnalysis
} from './firebase';

export default function App() {
  // Navigation & URL Routing State
  const [activeTab, setActiveTab] = useState(getInitialTab);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Central tab navigation with clean URL path routing
  const switchTab = (tabId, pushHistory = true) => {
    setActiveTab(tabId);
    if (pushHistory && typeof window !== 'undefined' && TAB_ROUTES[tabId]) {
      const targetPath = TAB_ROUTES[tabId];
      if (window.location.pathname.toLowerCase() !== targetPath) {
        window.history.pushState({ tab: tabId }, '', targetPath);
      }
    }
  };

  // Sync with browser back/forward buttons & format URL on first load
  useEffect(() => {
    const onPopState = () => {
      const p = window.location.pathname.toLowerCase().replace(/\/$/, '') || '/';
      const matched = ROUTE_TABS[p] || 'dashboard';
      setActiveTab(matched);
    };

    window.addEventListener('popstate', onPopState);

    const currentP = window.location.pathname.toLowerCase().replace(/\/$/, '') || '/';
    const targetPath = TAB_ROUTES[activeTab] || '/dashboard';
    if (currentP !== targetPath) {
      window.history.replaceState({ tab: activeTab }, '', targetPath);
    }

    return () => window.removeEventListener('popstate', onPopState);
  }, [activeTab]);

  // Platform Selector State (Fokus TikTok & YouTube - Instagram dinonaktifkan sementara)
  const [selectedPlatform, setSelectedPlatform] = useState('tiktok');
  // const [igCookie, setIgCookie] = useState('');

  // Backend & File State
  const [files, setFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState('');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  // Dashboard Scraper Form State
  const [scrapeInput, setScrapeInput] = useState('');
  const [isScraping, setIsScraping] = useState(false);
  const [scrapeError, setScrapeError] = useState('');
  const [scrapeSuccess, setScrapeSuccess] = useState(null);

  // Results & Filters State
  const [searchKeyword, setSearchKeyword] = useState('');
  const [searchScope, setSearchScope] = useState('all'); // 'all' | 'comments' | 'replies'
  const [hasRepliesOnly, setHasRepliesOnly] = useState(false);
  const [caseSensitive, setCaseSensitive] = useState(false);
  const [sortBy, setSortBy] = useState('newest'); // 'newest' | 'oldest' | 'most_replies'
  const [expandedReplies, setExpandedReplies] = useState(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [copiedId, setCopiedId] = useState(null);

  // AI Analysis (Skripsi Focus) State
  const [analysisType, setAnalysisType] = useState('entman_framing');
  const [aiSampleSize, setAiSampleSize] = useState(50); // 30, 50, 100, 150, 200, or 0 (all)
  const [aiLoading, setAiLoading] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [aiError, setAiError] = useState('');

  // Modals & UI Controls
  const [showExportStatsModal, setShowExportStatsModal] = useState(false);
  const [showCitationModal, setShowCitationModal] = useState(false);
  const [showInterCoderModal, setShowInterCoderModal] = useState(false);
  const [verbatimModalComment, setVerbatimModalComment] = useState(null);
  const [verbatimModalIndex, setVerbatimModalIndex] = useState(null);

  const fileInputRef = useRef(null);

  // User Dropdown State & Click-outside listener
  const [currentUser, setCurrentUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const userMenuRef = useRef(null);

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setShowUserDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  // Subscribe to Firebase Auth
  useEffect(() => {
    const unsubscribe = subscribeToAuth((user) => {
      setCurrentUser(user);
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Handle Logout
  const handleLogout = async () => {
    try {
      await logoutUser();
      setCurrentUser(null);
      setShowUserDropdown(false);
      setFiles([]);
      setData(null);
      setSelectedFile('');
      setAiAnalysis(null);
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  // PIN Lock Screen telah dihapus sesuai permintaan

  // Fetch list of saved files from Firestore (private per-user)
  const fetchFilesList = async () => {
    if (!currentUser) return;
    try {
      const userScrapes = await getUserScrapes(currentUser.uid);
      setFiles(userScrapes);

      if (userScrapes.length > 0 && !selectedFile) {
        loadFileContent(userScrapes[0].filename);
      }
    } catch (err) {
      console.error('Failed to fetch files from user Firestore:', err);
    }
  };

  useEffect(() => {
    if (currentUser) {
      fetchFilesList();
    }
  }, [currentUser]);

  // Load comment data for a specific file
  const loadFileContent = async (filename, shouldSwitchTab = false) => {
    if (!filename || !currentUser) return;
    setLoading(true);
    setSelectedFile(filename);
    try {
      const docData = await getUserScrapeContent(currentUser.uid, filename);
      if (docData) {
        setData(docData);
        setExpandedReplies(new Set());
        setCurrentPage(1);
        loadAiAnalysis(filename, analysisType);
        if (shouldSwitchTab) {
          switchTab('results');
        }
        return;
      }

      const res = await fetch(`${API_BASE}/api/files/${encodeURIComponent(filename)}`, {
        headers: { 'Cache-Control': 'no-cache' }
      });
      if (res.ok) {
        const json = await res.json();
        setData(json);
        setExpandedReplies(new Set());
        setCurrentPage(1);
        loadAiAnalysis(filename, analysisType);
        if (shouldSwitchTab) {
          switchTab('results');
        }
      }
    } catch (err) {
      console.error('Failed to load file content:', err);
    } finally {
      setLoading(false);
    }
  };

  // Load cached AI analysis from Firestore
  const loadAiAnalysis = async (filename, type = analysisType) => {
    if (!filename || !currentUser) return;
    try {
      const cached = await getUserAiAnalysis(currentUser.uid, filename, type);
      if (cached) {
        setAiAnalysis(cached);
        setAiError('');
        return;
      }
      setAiAnalysis(null);
    } catch (err) {
      console.error('Failed to check AI cache:', err);
    }
  };

  // Change research framework
  const handleFrameworkChange = (newType) => {
    setAnalysisType(newType);
    if (selectedFile) {
      loadAiAnalysis(selectedFile, newType);
    }
  };

  // Run AI Analysis for current active file
  const runAiAnalysis = async () => {
    if (!selectedFile) return;
    setAiLoading(true);
    setAiError('');
    try {
      const res = await fetch(`${API_BASE}/api/ai/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filename: selectedFile,
          analysis_type: analysisType,
          sample_size: aiSampleSize,
          comments_data: data?.comments || []
        })
      });

      const json = await res.json();
      if (!res.ok || json.error) {
        throw new Error(json.error || 'Gagal melakukan analisis AI');
      }

      setAiAnalysis(json);

      if (currentUser) {
        await saveUserAiAnalysis(currentUser.uid, selectedFile, analysisType, json);
      }
    } catch (err) {
      console.error('AI Analysis failed:', err);
      setAiError(err.message || 'Terjadi kesalahan saat memproses analisis dengan AI.');
    } finally {
      setAiLoading(false);
    }
  };

  // Drag & drop or file upload handler
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const parsed = JSON.parse(event.target.result);
        if (parsed.comments && Array.isArray(parsed.comments)) {
          const customFilename = file.name.endsWith('.json') ? file.name : `${file.name}.json`;

          if (currentUser) {
            await saveUserScrape(currentUser.uid, customFilename, parsed);
          }

          setData(parsed);
          setSelectedFile(customFilename);
          setExpandedReplies(new Set());
          setCurrentPage(1);
          await fetchFilesList();
          switchTab('results');
        } else {
          alert('Format berkas JSON tidak sesuai struktur scraper.');
        }
      } catch (err) {
        alert('Gagal membaca file JSON: ' + err.message);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Handle Scraper Submission from Dashboard
  const handleScrapeSubmit = async (e) => {
    e.preventDefault();
    if (!scrapeInput.trim() || isScraping) return;

    setIsScraping(true);
    setScrapeError('');
    setScrapeSuccess(null);

    try {
      const payload = {
        platform: selectedPlatform,
        video_url: scrapeInput.trim()
      };

      // Scraper Instagram dinonaktifkan sementara (fokus ke TikTok dan YouTube)
      // if (selectedPlatform === 'instagram') {
      //   payload.cookie = (igCookie || '').trim();
      // }

      const res = await fetch(`${API_BASE}/api/scrape`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const result = await res.json();

      if (!res.ok || result.error) {
        throw new Error(result.error || 'Terjadi kesalahan saat scraping komentar.');
      }

      if (currentUser && result.filename) {
        let fullData = null;
        try {
          const detailRes = await fetch(`${API_BASE}/api/files/${encodeURIComponent(result.filename)}`);
          if (detailRes.ok) {
            fullData = await detailRes.json();
          }
        } catch {}

        if (fullData) {
          await saveUserScrape(currentUser.uid, result.filename, fullData);
        }
      }

      setScrapeSuccess({
        filename: result.filename,
        commentsCount: result.total_comments || result.comments_count || 0
      });

      await fetchFilesList();
      await loadFileContent(result.filename, false);
      setScrapeInput('');
    } catch (err) {
      setScrapeError(err.message || 'Gagal menghubungi server scraping.');
    } finally {
      setIsScraping(false);
    }
  };

  // Toggle single reply thread expansion
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
    setTimeout(() => setCopiedId(null), 1500);
  };

  // Frequent Keywords Extractor
  const topKeywords = useMemo(() => {
    if (!data?.comments) return [];
    const counts = {};

    const extractWords = (str) => {
      if (!str) return;
      const words = str
        .toLowerCase()
        .replace(/[^a-zA-Z0-9\s]/g, ' ')
        .split(/\s+/);
      for (const w of words) {
        if (w.length >= 3 && !STOPWORDS.has(w) && !/^\d+$/.test(w)) {
          counts[w] = (counts[w] || 0) + 1;
        }
      }
    };

    data.comments.forEach((c) => {
      extractWords(c.comment);
      if (c.replies) {
        c.replies.forEach((r) => extractWords(r.comment));
      }
    });

    return Object.entries(counts)
      .map(([word, count]) => ({ word, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }, [data]);

  // Highlight search keywords in comment text
  const renderHighlighted = (text, keyword) => {
    if (!keyword.trim() || !text) return text;

    const terms = keyword
      .trim()
      .split(/\s+/)
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    if (terms.length === 0) return text;

    const escaped = terms.map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|');
    const regex = new RegExp(`(${escaped})`, caseSensitive ? 'g' : 'gi');

    const parts = text.split(regex);
    return parts.map((part, i) =>
      regex.test(part) ? (
        <mark key={i} className="highlight-pill">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  // Helper: check if a text contains the search query
  const textMatches = (text, keyword) => {
    if (!keyword.trim()) return true;
    const terms = keyword
      .trim()
      .split(/\s+/)
      .map((t) => (caseSensitive ? t.trim() : t.trim().toLowerCase()))
      .filter((t) => t.length > 0);

    const target = caseSensitive ? text : text.toLowerCase();
    return terms.every((term) => target.includes(term));
  };

  // Filtered comments based on search keyword and scopes
  const filteredComments = useMemo(() => {
    if (!data?.comments) return [];

    let list = data.comments.filter((item) => {
      if (hasRepliesOnly) {
        const replyCount = item.total_reply || (item.replies ? item.replies.length : 0);
        if (replyCount === 0) return false;
      }

      if (!searchKeyword.trim()) return true;

      const commentMatch = textMatches(item.comment, searchKeyword);
      const replyMatch = (item.replies || []).some((r) =>
        textMatches(r.comment, searchKeyword)
      );

      if (searchScope === 'comments') return commentMatch;
      if (searchScope === 'replies') return replyMatch;
      return commentMatch || replyMatch;
    });

    list = [...list].sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.create_time || 0) - new Date(a.create_time || 0);
      }
      if (sortBy === 'oldest') {
        return new Date(a.create_time || 0) - new Date(b.create_time || 0);
      }
      if (sortBy === 'most_replies') {
        const countA = a.total_reply || (a.replies?.length || 0);
        const countB = b.total_reply || (b.replies?.length || 0);
        return countB - countA;
      }
      return 0;
    });

    return list;
  }, [data, searchKeyword, searchScope, hasRepliesOnly, caseSensitive, sortBy]);

  // Paginated comments
  const totalPages = Math.ceil(filteredComments.length / pageSize) || 1;

  const paginatedComments = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredComments.slice(start, start + pageSize);
  }, [filteredComments, currentPage, pageSize]);

  const getPageNumbers = () => {
    const pages = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push('...');
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      for (let i = start; i <= end; i++) pages.push(i);
      if (currentPage < totalPages - 2) pages.push('...');
      pages.push(totalPages);
    }
    return pages;
  };

  // High-level stats for active dataset
  const stats = useMemo(() => {
    if (!data?.comments) return { totalComments: 0, totalReplies: 0, totalUsers: 0 };

    const users = new Set();
    let totalReplies = 0;

    data.comments.forEach((c) => {
      if (c.username) users.add(c.username);
      const repCount = c.total_reply || (c.replies ? c.replies.length : 0);
      totalReplies += repCount;

      if (c.replies) {
        c.replies.forEach((r) => {
          if (r.username) users.add(r.username);
        });
      }
    });

    return {
      totalComments: data.comments.length,
      totalReplies,
      totalUsers: users.size
    };
  }, [data]);

  // Total summary across all scrapes
  const totalScrapedStats = useMemo(() => {
    const totalVideos = files.length;
    const totalStoredComments = files.reduce((acc, f) => acc + (f.comments_count || 0), 0);
    return {
      totalVideos,
      totalStoredComments
    };
  }, [files]);

  // Export to CSV
  const exportToCSV = () => {
    if (!data?.comments) return;

    const escapeCsv = (val) => {
      if (val === null || val === undefined) return '""';
      return `"${String(val).replace(/"/g, '""')}"`;
    };

    const headers = ['Tipe', 'Comment ID', 'Username', 'Nickname', 'Tanggal', 'Komentar', 'Jumlah Balasan', 'Parent ID'];
    const rows = [];

    filteredComments.forEach((c) => {
      rows.push([
        escapeCsv('Komentar Utama'),
        escapeCsv(c.comment_id),
        escapeCsv(c.username),
        escapeCsv(c.nickname),
        escapeCsv(c.create_time),
        escapeCsv(c.comment),
        escapeCsv(c.total_reply || (c.replies ? c.replies.length : 0)),
        escapeCsv('-')
      ]);

      if (c.replies) {
        c.replies.forEach((r) => {
          rows.push([
            escapeCsv('Balasan'),
            escapeCsv(r.comment_id),
            escapeCsv(r.username),
            escapeCsv(r.nickname),
            escapeCsv(r.create_time),
            escapeCsv(r.comment),
            escapeCsv(0),
            escapeCsv(c.comment_id)
          ]);
        });
      }
    });

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `komentar_${selectedFile ? selectedFile.replace('.json', '') : 'export'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export to JSON
  const exportToJSON = () => {
    if (!data) return;
    const exportData = {
      ...data,
      filtered_count: filteredComments.length,
      comments: filteredComments
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `komentar_${selectedFile ? selectedFile.replace('.json', '') : 'export'}.json`;
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

  // Central tab navigation handler
  const handleNavClick = (tabId) => {
    switchTab(tabId);
    setIsMobileMenuOpen(false);
  };

  // PIN lock screen telah dihapus

  // Auth Loading Screen
  if (authLoading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#F8FAFC' }}>
        <img src="/logo.png" alt="Tassiori Logo" style={{ width: '48px', height: '48px', objectFit: 'contain', marginBottom: '12px' }} />
        <span style={{ fontSize: '13px', fontWeight: 600, color: '#64748B' }}>Menghubungkan ke Ruang Riset...</span>
      </div>
    );
  }

  // Not logged in -> Show Auth Screen
  if (!currentUser) {
    return <AuthScreen onAuthSuccess={(user) => setCurrentUser(user)} />;
  }

  return (
    <div className="app-shell">
      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        handleNavClick={handleNavClick}
        isMobileMenuOpen={isMobileMenuOpen}
        data={data}
        files={files}
      />

      {/* Main Content Area */}
      <div className="app-main">
        {/* Top Navbar */}
        <Header
          isMobileMenuOpen={isMobileMenuOpen}
          setIsMobileMenuOpen={setIsMobileMenuOpen}
          fileInputRef={fileInputRef}
          handleFileUpload={handleFileUpload}
          userMenuRef={userMenuRef}
          showUserDropdown={showUserDropdown}
          setShowUserDropdown={setShowUserDropdown}
          currentUser={currentUser}
          handleLogout={handleLogout}
        />

        {/* Page Container */}
        <main className="page-container">
          {/* TAB 1: DASHBOARD */}
          {activeTab === 'dashboard' && (
            <DashboardPage
              selectedPlatform={selectedPlatform}
              setSelectedPlatform={setSelectedPlatform}
              scrapeInput={scrapeInput}
              setScrapeInput={setScrapeInput}
              isScraping={isScraping}
              scrapeError={scrapeError}
              scrapeSuccess={scrapeSuccess}
              handleScrapeSubmit={handleScrapeSubmit}
              switchTab={switchTab}
              totalScrapedStats={totalScrapedStats}
              files={files}
              formatDate={formatDate}
              loadFileContent={loadFileContent}
            />
          )}

          {/* TAB 2: HASIL KOMENTAR */}
          {activeTab === 'results' && (
            <CommentsPage
              files={files}
              selectedFile={selectedFile}
              loadFileContent={loadFileContent}
              fetchFilesList={fetchFilesList}
              switchTab={switchTab}
              data={data}
              loading={loading}
              setShowCitationModal={setShowCitationModal}
              setShowInterCoderModal={setShowInterCoderModal}
              setShowExportStatsModal={setShowExportStatsModal}
              stats={stats}
              filteredComments={filteredComments}
              searchKeyword={searchKeyword}
              setSearchKeyword={setSearchKeyword}
              sortBy={sortBy}
              setSortBy={setSortBy}
              searchScope={searchScope}
              setSearchScope={setSearchScope}
              hasRepliesOnly={hasRepliesOnly}
              setHasRepliesOnly={setHasRepliesOnly}
              caseSensitive={caseSensitive}
              setCaseSensitive={setCaseSensitive}
              topKeywords={topKeywords}
              exportToCSV={exportToCSV}
              exportToJSON={exportToJSON}
              paginatedComments={paginatedComments}
              expandedReplies={expandedReplies}
              toggleReply={toggleReply}
              formatDate={formatDate}
              renderHighlighted={renderHighlighted}
              copyToClipboard={copyToClipboard}
              copiedId={copiedId}
              setVerbatimModalComment={setVerbatimModalComment}
              setVerbatimModalIndex={setVerbatimModalIndex}
              currentPage={currentPage}
              setCurrentPage={setCurrentPage}
              pageSize={pageSize}
              setPageSize={setPageSize}
              totalPages={totalPages}
              getPageNumbers={getPageNumbers}
              fileInputRef={fileInputRef}
            />
          )}

          {/* TAB 3: ANALISIS AI SKRIPSI */}
          {activeTab === 'ai-analysis' && (
            <AnalysisPage
              analysisType={analysisType}
              handleFrameworkChange={handleFrameworkChange}
              aiSampleSize={aiSampleSize}
              setAiSampleSize={setAiSampleSize}
              aiLoading={aiLoading}
              aiError={aiError}
              aiAnalysis={aiAnalysis}
              runAiAnalysis={runAiAnalysis}
              selectedFile={selectedFile}
              files={files}
              loadFileContent={loadFileContent}
              data={data}
              setShowCitationModal={setShowCitationModal}
              setShowInterCoderModal={setShowInterCoderModal}
              setShowExportStatsModal={setShowExportStatsModal}
              setVerbatimModalComment={setVerbatimModalComment}
              setVerbatimModalIndex={setVerbatimModalIndex}
            />
          )}

          {/* TAB 4: RIWAYAT FILE */}
          {activeTab === 'files' && (
            <DatasetsPage
              files={files}
              selectedFile={selectedFile}
              setSelectedFile={setSelectedFile}
              setData={setData}
              currentUser={currentUser}
              fetchFilesList={fetchFilesList}
              loadFileContent={loadFileContent}
              loadAiAnalysis={loadAiAnalysis}
              switchTab={switchTab}
              formatDate={formatDate}
            />
          )}

          {/* TAB 5: PENGATURAN */}
          {activeTab === 'settings' && (
            <SettingsPage
              currentUser={currentUser}
              handleLogout={handleLogout}
            />
          )}
        </main>
      </div>

      {/* Mobile App Bottom Navigation Bar */}
      <MobileNav
        activeTab={activeTab}
        handleNavClick={handleNavClick}
        data={data}
        files={files}
      />

      {/* Modal Ekspor Statistik Multi-Format */}
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
