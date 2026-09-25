import React from "react";
import "./comments.css";
import { API_BASE } from "../constants/frameworks";
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
  Search,
  X,
  Calculator,
  FileSpreadsheet,
  Download,
  FileJson,
  Clock,
  Copy,
  Check,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

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
  fileInputRef,
}) {
  const handleAvatarError = (e, originalAvatar) => {
    const target = e.currentTarget;
    if (!target.dataset.triedFallback && originalAvatar) {
      target.dataset.triedFallback = "true";
      if (
        originalAvatar.includes("tiktokcdn.com") &&
        (originalAvatar.includes("-sign-") || originalAvatar.includes("?"))
      ) {
        const cleanUrl = originalAvatar.split("?")[0].replace(/-sign-/, "-");
        if (cleanUrl !== target.src) {
          target.src = cleanUrl;
          return;
        }
      }
    }
    if (!target.dataset.triedProxy && originalAvatar) {
      target.dataset.triedProxy = "true";
      target.src = `${API_BASE}/api/avatar-proxy?url=${encodeURIComponent(originalAvatar)}`;
      return;
    }
    target.style.display = "none";
  };

  return (
    <div className="comments-workspace">
      <header className="comments-page-heading">
        <div>
          <h1>Hasil komentar</h1>
          <p>Telusuri percakapan dan pilih kutipan untuk penelitian Anda.</p>
        </div>
        <button
          className="btn comments-analysis-button"
          onClick={() => switchTab("ai-analysis")}
        >
          <Brain size={16} />
          Analisis riset
        </button>
      </header>
      {/* Video Selector Bar */}
      <div className="video-selector-row">
        <div className="video-selector-bar">
          <div className="selector-icon">
            <Database size={18} />
          </div>
          <label htmlFor="comments-dataset" className="selector-label">
            Dataset
          </label>
          {files.length > 0 ? (
            <select
              id="comments-dataset"
              className="selector-select"
              value={selectedFile}
              onChange={(e) => loadFileContent(e.target.value)}
            >
              {files.map((f) => (
                <option key={f.filename} value={f.filename}>
                  {f.caption
                    ? `${f.caption.slice(0, 48)}...`
                    : f.filename.replace(/\.json$/i, "")}{" "}
                  ({f.comments_count} komentar)
                </option>
              ))}
            </select>
          ) : (
            <span
              style={{
                fontSize: "13px",
                color: "var(--color-text-secondary)",
                flex: 1,
              }}
            >
              {selectedFile
                ? selectedFile.replace(/\.json$/i, "")
                : "Belum ada dataset penelitian tersimpan"}
            </span>
          )}
          <ChevronDown
            size={16}
            color="var(--color-text-secondary)"
            style={{ pointerEvents: "none", flexShrink: 0 }}
          />
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
        </div>
      </div>

      {/* Caption Card */}
      {data && (
        <section className="caption-card">
          <div className="caption-content">
            <div className="caption-header">
              <span className="caption-eyebrow">SUMBER PERCAKAPAN</span>
              <div className="caption-actions">
                <button
                  className="btn-cite-pill"
                  onClick={() => setShowCitationModal(true)}
                  title="Buat sitasi otomatis untuk Daftar Pustaka (APA 7th, Harvard, Mendeley, BibTeX)"
                >
                  <Quote size={13} />
                  Buat sitasi
                </button>
                {data.video_url && (
                  <a
                    href={data.video_url}
                    target="_blank"
                    rel="noreferrer"
                    className="btn-tiktok-pill"
                  >
                    <ExternalLink size={13} />
                    Buka video
                  </a>
                )}
              </div>
            </div>
            <p className="caption-body">
              {data.caption || "Tidak ada caption dalam video ini."}
            </p>
          </div>
        </section>
      )}

      {data && stats && (
        <dl className="comments-summary">
          <div>
            <dt>Komentar</dt>
            <dd>{stats.totalComments.toLocaleString("id-ID")}</dd>
          </div>
          <div>
            <dt>Balasan</dt>
            <dd>{stats.totalReplies.toLocaleString("id-ID")}</dd>
          </div>
          <div>
            <dt>Partisipan</dt>
            <dd>{stats.totalUsers.toLocaleString("id-ID")}</dd>
          </div>
          <div>
            <dt>Hasil filter</dt>
            <dd>{filteredComments.length.toLocaleString("id-ID")}</dd>
          </div>
        </dl>
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
                aria-label="Cari komentar"
                placeholder="Cari kata atau frasa dalam komentar…"
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
              />
              {searchKeyword && (
                <button
                  className="search-clear-btn"
                  onClick={() => setSearchKeyword("")}
                  title="Hapus filter"
                >
                  <X size={15} />
                </button>
              )}
            </div>

            <select
              aria-label="Urutkan komentar"
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
              <span className="filter-tabs-label">Cari di:</span>
              <button
                className={`filter-tab-pill ${searchScope === "all" ? "active" : "inactive"}`}
                aria-pressed={searchScope === "all"}
                onClick={() => setSearchScope("all")}
              >
                Semua
              </button>
              <button
                className={`filter-tab-pill ${searchScope === "comments" ? "active" : "inactive"}`}
                aria-pressed={searchScope === "comments"}
                onClick={() => setSearchScope("comments")}
              >
                Komentar
              </button>
              <button
                className={`filter-tab-pill ${searchScope === "replies" ? "active" : "inactive"}`}
                aria-pressed={searchScope === "replies"}
                onClick={() => setSearchScope("replies")}
              >
                Balasan
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
                Bedakan huruf besar/kecil
              </label>
            </div>
          </div>

          {/* Row 3: Frequent Keywords Pills */}
          {topKeywords && topKeywords.length > 0 && (
            <div className="filter-row-3">
              <div className="keyword-eyebrow">Kata yang sering muncul</div>
              <div className="keyword-pills-wrap">
                {topKeywords.map((item) => {
                  const isActive =
                    searchKeyword.toLowerCase() === item.word.toLowerCase();
                  return (
                    <button
                      key={item.word}
                      aria-pressed={isActive}
                      className={`keyword-pill ${isActive ? "active" : ""}`}
                      onClick={() =>
                        setSearchKeyword(isActive ? "" : item.word)
                      }
                    >
                      <span>{item.word}</span>
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
              Percakapan{" "}
              <span>
                ({filteredComments.length} dari {data.comments?.length || 0}{" "}
                komentar)
              </span>
            </div>

            <details className="comments-tools">
              <summary>
                <Download size={15} /> Ekspor & alat riset{" "}
                <ChevronDown size={14} />
              </summary>
              <div
                className="comments-tools-menu"
                onClick={(e) => {
                  if (e.target.closest("button"))
                    e.currentTarget.closest("details").removeAttribute("open");
                }}
                onKeyDown={(e) => {
                  if (e.key === "Escape") {
                    const details = e.currentTarget.closest("details");
                    details.removeAttribute("open");
                    details.querySelector("summary").focus();
                  }
                }}
              >
                <button onClick={exportToCSV}>
                  <Download size={16} />
                  <span>
                    Unduh CSV<small>Spreadsheet dan pengolahan data</small>
                  </span>
                </button>
                <button onClick={exportToJSON}>
                  <FileJson size={16} />
                  <span>
                    Unduh JSON<small>Salinan dataset lengkap</small>
                  </span>
                </button>
                <button onClick={() => setShowExportStatsModal(true)}>
                  <FileSpreadsheet size={16} />
                  <span>
                    Ekspor statistik<small>SPSS, Excel, SmartPLS, JASP</small>
                  </span>
                </button>
                <button onClick={() => setShowInterCoderModal(true)}>
                  <Calculator size={16} />
                  <span>
                    Uji Cohen’s Kappa<small>Reliabilitas antar-pengkode</small>
                  </span>
                </button>
              </div>
            </details>
          </div>

          {loading ? (
            <div className="empty-state-box">
              <div
                className="spinner-icon"
                style={{
                  borderColor: "rgba(0,0,0,0.2)",
                  borderTopColor: "var(--color-primary)",
                  margin: "0 auto 12px",
                }}
              />
              <p>Memuat data komentar...</p>
            </div>
          ) : filteredComments.length === 0 ? (
            <div className="empty-state-box">
              <Search size={36} className="empty-state-icon" />
              <h4>Tidak ada komentar yang cocok</h4>
              <p>
                Coba gunakan kata kunci lain atau ubah pengaturan cakupan
                pencarian.
              </p>
              {(searchKeyword ||
                hasRepliesOnly ||
                caseSensitive ||
                searchScope !== "all") && (
                <button
                  className="btn btn-white-bordered"
                  onClick={() => {
                    setSearchKeyword("");
                    setHasRepliesOnly(false);
                    setCaseSensitive(false);
                    setSearchScope("all");
                  }}
                >
                  Reset filter
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="comment-list-container">
                {paginatedComments.map((comment, index) => {
                  const isExpanded = expandedReplies.has(
                    comment.comment_id || index,
                  );
                  const replyCount =
                    comment.total_reply ||
                    (comment.replies ? comment.replies.length : 0);

                  return (
                    <div
                      key={comment.comment_id || index}
                      className="comment-row"
                    >
                      <div className="comment-row-top">
                        <div className="author-meta-wrap">
                          <div className="author-avatar">
                            {comment.avatar ? (
                              <img
                                src={comment.avatar}
                                alt={comment.nickname || comment.username}
                                referrerPolicy="no-referrer"
                                loading="lazy"
                                decoding="async"
                                onError={(e) => handleAvatarError(e, comment.avatar)}
                              />
                            ) : null}
                            <span>
                              {(comment.nickname || comment.username || "?")
                                .charAt(0)
                                .toUpperCase()}
                            </span>
                          </div>

                          <div className="author-names-line">
                            <span className="author-name-bold">
                              {comment.nickname ||
                                comment.username ||
                                "Pengguna"}
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
                              onClick={() =>
                                copyToClipboard(
                                  comment.comment,
                                  comment.comment_id || index,
                                )
                              }
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
                              aria-expanded={isExpanded}
                              className="btn-replies-toggle"
                              onClick={() =>
                                toggleReply(comment.comment_id || index)
                              }
                            >
                              <CornerDownRight size={13} />
                              <span>{replyCount} Balasan</span>
                              {isExpanded ? (
                                <ChevronUp size={13} />
                              ) : (
                                <ChevronDown size={13} />
                              )}
                            </button>
                          ) : (
                            <span className="no-replies-text">
                              Tanpa balasan
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Thread: Replies */}
                      {isExpanded &&
                        comment.replies &&
                        comment.replies.length > 0 && (
                          <div className="replies-thread-box">
                            {comment.replies.map((reply, rIdx) => (
                              <div
                                key={reply.comment_id || rIdx}
                                className="reply-row"
                              >
                                <div
                                  className="comment-row-top"
                                  style={{ marginBottom: "4px" }}
                                >
                                  <div className="author-meta-wrap">
                                    <div className="author-avatar">
                                      {reply.avatar ? (
                                        <img
                                          src={reply.avatar}
                                          alt={reply.nickname || reply.username}
                                          referrerPolicy="no-referrer"
                                          loading="lazy"
                                          decoding="async"
                                          onError={(e) => handleAvatarError(e, reply.avatar)}
                                        />
                                      ) : null}
                                      <span>
                                        {(
                                          reply.nickname ||
                                          reply.username ||
                                          "?"
                                        )
                                          .charAt(0)
                                          .toUpperCase()}
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
                                        onClick={() =>
                                          copyToClipboard(
                                            reply.comment,
                                            reply.comment_id || rIdx,
                                          )
                                        }
                                        aria-label="Salin balasan"
                                      >
                                        {copiedId ===
                                        (reply.comment_id || rIdx) ? (
                                          <Check
                                            size={13}
                                            color="var(--color-success)"
                                          />
                                        ) : (
                                          <Copy size={13} />
                                        )}
                                      </button>
                                    </div>
                                  </div>
                                </div>

                                <div className="comment-body-text">
                                  {renderHighlighted(
                                    reply.comment,
                                    searchKeyword,
                                  )}
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
                    Menampilkan{" "}
                    <strong>
                      {Math.min(
                        (currentPage - 1) * pageSize + 1,
                        filteredComments.length,
                      )}
                    </strong>{" "}
                    -{" "}
                    <strong>
                      {Math.min(
                        currentPage * pageSize,
                        filteredComments.length,
                      )}
                    </strong>{" "}
                    dari <strong>{filteredComments.length}</strong> komentar
                  </div>

                  <div className="pagination-controls-wrap">
                    <div className="page-size-selector">
                      <span>Per halaman:</span>
                      <select
                        aria-label="Komentar per halaman"
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
                          window.scrollTo({ top: 0, behavior: "smooth" });
                        }}
                        disabled={currentPage === 1}
                        title="Halaman Sebelumnya"
                      >
                        <ChevronLeft size={16} />
                      </button>

                      {getPageNumbers().map((num, idx) =>
                        num === "..." ? (
                          <span
                            key={`ellipsis-${idx}`}
                            className="pagination-ellipsis"
                          >
                            ...
                          </span>
                        ) : (
                          <button
                            key={num}
                            aria-current={
                              currentPage === num ? "page" : undefined
                            }
                            aria-label={`Halaman ${num}`}
                            className={`pagination-btn ${currentPage === num ? "active" : ""}`}
                            onClick={() => {
                              setCurrentPage(num);
                              window.scrollTo({ top: 0, behavior: "smooth" });
                            }}
                          >
                            {num}
                          </button>
                        ),
                      )}

                      <button
                        className="pagination-btn"
                        onClick={() => {
                          setCurrentPage((p) => Math.min(p + 1, totalPages));
                          window.scrollTo({ top: 0, behavior: "smooth" });
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

      {!data && loading && (
        <div className="empty-state-box" role="status">
          Memuat data komentar…
        </div>
      )}
      {/* Empty state when no data loaded */}
      {!data && !loading && (
        <div className="empty-state-box">
          <MessageSquare size={42} className="empty-state-icon" />
          <h4>Belum ada data komentar yang dipilih</h4>
          <p>
            Pilih dataset di atas, ambil komentar baru, atau unggah dataset
            Anda.
          </p>
          <div
            style={{ display: "flex", justifyContent: "center", gap: "10px" }}
          >
            <button
              className="btn btn-scrape-primary"
              onClick={() => switchTab("dashboard")}
              style={{ height: "38px", padding: "0 16px" }}
            >
              Ambil komentar
            </button>
            <button
              className="btn btn-white-bordered"
              onClick={() => fileInputRef.current?.click()}
            >
              Unggah Dataset
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
