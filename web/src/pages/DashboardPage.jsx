import React from 'react';
import {
  Link2,
  Play,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  Database,
  MessageSquare,
  FolderArchive,
  ShieldCheck,
  FileText
} from 'lucide-react';

export default function DashboardPage({
  selectedPlatform,
  setSelectedPlatform,
  scrapeInput,
  setScrapeInput,
  isScraping,
  scrapeError,
  scrapeSuccess,
  handleScrapeSubmit,
  switchTab,
  totalScrapedStats,
  files,
  formatDate,
  loadFileContent
}) {
  return (
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

            {/* Scraper Instagram dikomentari sementara - fokus TikTok & YouTube terlebih dahulu
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
            */}
          </div>
        </div>

        {/* Form Input Link */}
        <form onSubmit={handleScrapeSubmit}>
          <label className="scrape-input-label">
            {selectedPlatform === 'youtube'
              ? 'Masukkan link video YouTube / Shorts'
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
                    : 'Tempelkan link video TikTok, shortlink vt.tiktok.com, atau ID video (contoh: https://vt.tiktok.com/ZSbJY5aH9/)...'
                }
                value={scrapeInput}
                onChange={(e) => {
                  const val = e.target.value;
                  setScrapeInput(val);
                  if (val.includes('youtube.com') || val.includes('youtu.be')) {
                    setSelectedPlatform('youtube');
                  } else if (val.includes('tiktok.com')) {
                    setSelectedPlatform('tiktok');
                  }
                }}
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

          {/* Cookie Input specifically for Instagram - dinonaktifkan sementara (fokus TikTok & YouTube)
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
          */}

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
              onClick={() => switchTab('results')}
            >
              <span>Buka Hasil Komentar</span>
              <ArrowRight size={14} />
            </button>
          </div>
        )}
      </section>

      {/* Quick Overview Metrics Cards */}
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
        <div className="stat-card-clean stat-card-lavender" onClick={() => switchTab('files')} style={{ cursor: 'pointer' }}>
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
              onClick={() => switchTab('files')}
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
  );
}
