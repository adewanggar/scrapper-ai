import React from 'react';
import {
  Database,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Brain,
  Quote,
  ExternalLink,
  MessageSquare,
  CornerDownRight,
  Users,
  Layers,
  Search,
  X,
  Flame,
  Calculator,
  FileSpreadsheet,
  Download,
  FileJson,
  Clock,
  Copy,
  Check,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

export default function CommentsPage({
  files,
  selectedFile,
  loadFileContent,
  fetchFilesList,
  switchTab,
  data,
  loading,
  setShowCitationModal,
  setShowInterCoderModal,
  setShowExportStatsModal,
  stats,
  filteredComments,
  searchKeyword,
  setSearchKeyword,
  sortBy,
  setSortBy,
  searchScope,
  setSearchScope,
  hasRepliesOnly,
  setHasRepliesOnly,
  caseSensitive,
  setCaseSensitive,
  topKeywords,
  exportToCSV,
  exportToJSON,
  paginatedComments,
  expandedReplies,
  toggleReply,
  formatDate,
  renderHighlighted,
  copyToClipboard,
  copiedId,
  setVerbatimModalComment,
  setVerbatimModalIndex,
  currentPage,
  setCurrentPage,
  pageSize,
  setPageSize,
  totalPages,
  getPageNumbers,
  fileInputRef
}) {
  return (
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
            onClick={() => switchTab('ai-analysis')}
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
              <span className="caption-eyebrow">CAPTION VIDEO</span>
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
                    Buka Video
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
      {data && stats && (
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
          {topKeywords && topKeywords.length > 0 && (
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
              Daftar Komentar <span>({filteredComments.length} dari {data.comments?.length || 0} komentar)</span>
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
                              {comment.nickname || comment.username || 'Pengguna'}
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
                                    <Clock size={12} />
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
            <button className="btn btn-scrape-primary" onClick={() => switchTab('dashboard')} style={{ height: '38px', padding: '0 16px' }}>
              Buka Form Scraper
            </button>
            <button className="btn btn-white-bordered" onClick={() => fileInputRef.current?.click()}>
              Unggah Dataset
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
