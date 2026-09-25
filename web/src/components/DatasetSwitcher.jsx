import React, { useState, useMemo } from 'react';
import {
  Database,
  Search,
  ArrowUpDown,
  Check,
  CheckCircle2,
  X,
  Users,
  Calendar,
  ArrowLeftRight,
  User,
  RefreshCw
} from 'lucide-react';
import useModalDialog from './useModalDialog';
import './dataset-switcher.css';

/**
 * Format timestamp or ISO string into localized Indonesian date
 */
function formatDateShort(dateVal) {
  if (!dateVal) return '';
  try {
    const d = new Date(dateVal);
    if (isNaN(d.getTime())) return '';
    return d.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  } catch (e) {
    return '';
  }
}

/**
 * Helper to determine platform from filename or platform property
 */
function detectPlatform(file) {
  if (!file) return null;
  const isYt = (file.filename && file.filename.startsWith('yt_')) || file.platform === 'youtube';
  return isYt ? 'youtube' : 'tiktok';
}

/**
 * Produce a clean, academic, human-friendly dataset title without .json or backend technical prefixes
 */
function getCleanDatasetTitle(file, fallback = '') {
  if (file?.caption && file.caption.trim()) {
    return file.caption.trim();
  }
  if (file?.author_name || file?.author) {
    const platform = detectPlatform(file);
    const platformName = platform === 'youtube' ? 'YouTube' : 'TikTok';
    return `Kumpulan Komentar ${platformName} (@${file.author_name || file.author})`;
  }
  const raw = file?.filename || fallback || '';
  if (!raw) return 'Dataset Penelitian';
  
  // Clean raw filename from technical extensions and prefixes
  const clean = raw
    .replace(/\.json$/i, '')
    .replace(/^(yt_|youtube_|tiktok_)/i, '');
  const platform = detectPlatform(file);
  const platformName = platform === 'youtube' ? 'YouTube' : 'TikTok';
  
  if (!clean) return `Dataset Riset ${platformName}`;
  return `Dataset Riset ${platformName} (${clean.slice(0, 10)})`;
}

export default function DatasetSwitcher({
  files = [],
  selectedFile = '',
  onSelectDataset,
  label = 'Dataset Riset Aktif',
  data = null,
  onRefresh = null
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tempSelected, setTempSelected] = useState(selectedFile);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest'); // 'newest' | 'most_comments' | 'least_comments' | 'name_asc' | 'name_desc'
  const [platformFilter, setPlatformFilter] = useState('all'); // 'all' | 'tiktok' | 'youtube'

  // Modal dialog accessibility (ESC closing & focus trap)
  const dialogRef = useModalDialog(isModalOpen, () => {
    handleCancel();
  });

  // Find currently active file object
  const activeFile = useMemo(() => {
    return files.find((f) => f.filename === selectedFile) || null;
  }, [files, selectedFile]);

  // Extract display information for the active card (WITHOUT any .json backend filenames)
  const activeDisplay = useMemo(() => {
    const platform = detectPlatform(activeFile) || (data?.platform === 'youtube' ? 'youtube' : 'tiktok');
    const title = getCleanDatasetTitle(activeFile, data?.caption || selectedFile);
    const commentsCount = activeFile?.comments_count ?? (data?.comments?.length ?? 0);
    const author = activeFile?.author_name || activeFile?.author || data?.author_name || data?.author || '';
    const date = formatDateShort(activeFile?.modified || data?.published_at || data?.date_now);

    return {
      platform,
      title,
      commentsCount,
      author,
      date
    };
  }, [activeFile, selectedFile, data]);

  // Real-time search and sorting of datasets for the modal
  const filteredAndSortedFiles = useMemo(() => {
    let result = files.filter((f) => {
      // Platform filter
      const platform = detectPlatform(f);
      if (platformFilter === 'youtube' && platform !== 'youtube') return false;
      if (platformFilter === 'tiktok' && platform !== 'tiktok') return false;

      // Real-time search filter (matches clean title, caption, author, topic)
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase().trim();
      const cap = (f.caption || '').toLowerCase();
      const fname = (f.filename || '').replace(/\.json$/i, '').toLowerCase();
      const author = (f.author_name || f.author || '').toLowerCase();

      return cap.includes(q) || fname.includes(q) || author.includes(q);
    });

    // Sorting
    result.sort((a, b) => {
      if (sortBy === 'most_comments') {
        return (b.comments_count || 0) - (a.comments_count || 0);
      }
      if (sortBy === 'least_comments') {
        return (a.comments_count || 0) - (b.comments_count || 0);
      }
      if (sortBy === 'name_asc') {
        const titleA = getCleanDatasetTitle(a);
        const titleB = getCleanDatasetTitle(b);
        return titleA.localeCompare(titleB, 'id', { sensitivity: 'base' });
      }
      if (sortBy === 'name_desc') {
        const titleA = getCleanDatasetTitle(a);
        const titleB = getCleanDatasetTitle(b);
        return titleB.localeCompare(titleA, 'id', { sensitivity: 'base' });
      }
      // Default: 'newest' (based on modified timestamp if available)
      const dateA = a.modified ? new Date(a.modified).getTime() : 0;
      const dateB = b.modified ? new Date(b.modified).getTime() : 0;
      return dateB - dateA;
    });

    return result;
  }, [files, searchQuery, sortBy, platformFilter]);

  // Platform counts for badges
  const counts = useMemo(() => {
    let yt = 0;
    let tt = 0;
    files.forEach((f) => {
      if (detectPlatform(f) === 'youtube') yt++;
      else tt++;
    });
    return { all: files.length, youtube: yt, tiktok: tt };
  }, [files]);

  // Actions
  const handleOpenModal = () => {
    setTempSelected(selectedFile || (files[0]?.filename ?? ''));
    setSearchQuery('');
    setPlatformFilter('all');
    setIsModalOpen(true);
  };

  const handleCancel = () => {
    setTempSelected(selectedFile);
    setSearchQuery('');
    setIsModalOpen(false);
  };

  const handleApply = () => {
    if (tempSelected) {
      if (tempSelected !== selectedFile && typeof onSelectDataset === 'function') {
        onSelectDataset(tempSelected);
      }
      setIsModalOpen(false);
    }
  };

  return (
    <>
      {/* 1. KARTU RINGKAS DATASET AKTIF */}
      <div className="dataset-switcher-card">
        <div className="dataset-switcher-left">
          <div className="dataset-switcher-icon-wrap" title="Dataset Penelitian Aktif">
            <Database size={20} />
          </div>
          <div className="dataset-switcher-info">
            <div className="dataset-switcher-meta">
              <span className="dataset-switcher-badge-active">
                <span className="dataset-active-pulse" />
                {label}
              </span>
              {activeDisplay.platform && (
                <span className={`dataset-platform-badge ${activeDisplay.platform}`}>
                  {activeDisplay.platform === 'youtube' ? 'YouTube' : 'TikTok'}
                </span>
              )}
              <span className="dataset-switcher-comments-count">
                <Users size={12} />
                {activeDisplay.commentsCount} Komentar
              </span>
            </div>

            <div className="dataset-switcher-title" title={activeDisplay.title}>
              {activeDisplay.title}
            </div>

            <div className="dataset-switcher-sub">
              {activeDisplay.author ? (
                <span className="dataset-sub-item">
                  <User size={12} />
                  <span>Kreator: @{activeDisplay.author.replace(/^@/, '')}</span>
                </span>
              ) : null}
              {activeDisplay.date ? (
                <span className="dataset-sub-item">
                  <Calendar size={12} />
                  <span>Waktu Riset: {activeDisplay.date}</span>
                </span>
              ) : null}
            </div>
          </div>
        </div>

        <div className="dataset-switcher-actions-wrap">
          {typeof onRefresh === 'function' && (
            <button
              type="button"
              className="btn-refresh-dataset"
              onClick={onRefresh}
              title="Segarkan riwayat dataset penelitian"
            >
              <RefreshCw size={14} />
              <span>Segarkan</span>
            </button>
          )}
          <button
            type="button"
            className="btn-change-dataset"
            onClick={handleOpenModal}
            title="Pilih dan ganti dataset yang ingin dianalisis"
          >
            <ArrowLeftRight size={15} />
            <span>Ganti Dataset</span>
          </button>
        </div>
      </div>

      {/* 2. MODAL PEMILIHAN DATASET */}
      {isModalOpen && (
        <div className="stat-modal-overlay" onClick={handleCancel}>
          <div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="dataset-modal-title"
            tabIndex={-1}
            className="stat-modal-container dataset-modal-container"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="dataset-modal-header">
              <div className="dataset-modal-title-wrap">
                <div className="dataset-modal-icon-badge">
                  <Database size={20} />
                </div>
                <div>
                  <h3 id="dataset-modal-title" className="dataset-modal-title">
                    Pilih Dataset
                  </h3>
                  <p className="dataset-modal-subtitle">
                    Pilih dataset penelitian yang ingin digunakan untuk riset akademik Anda
                  </p>
                </div>
              </div>
              <button
                type="button"
                className="stat-modal-close"
                onClick={handleCancel}
                aria-label="Tutup modal"
              >
                <X size={18} />
              </button>
            </div>

            {/* Search & Sort Toolbar */}
            <div className="dataset-modal-toolbar">
              <div className="dataset-search-box">
                <Search size={15} className="dataset-search-icon" />
                <input
                  type="text"
                  className="dataset-search-input"
                  placeholder="Cari judul video, topik riset, atau kreator..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoFocus
                />
                {searchQuery && (
                  <button
                    type="button"
                    className="dataset-search-clear"
                    onClick={() => setSearchQuery('')}
                    title="Hapus pencarian"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>

              <div className="dataset-sort-wrap">
                <ArrowUpDown size={14} className="dataset-sort-icon" />
                <select
                  className="dataset-sort-select"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  title="Urutkan daftar dataset"
                >
                  <option value="newest">Terbaru Ditambahkan</option>
                  <option value="most_comments">Komentar Terbanyak</option>
                  <option value="least_comments">Komentar Tersedikit</option>
                  <option value="name_asc">Judul / Topik (A - Z)</option>
                  <option value="name_desc">Judul / Topik (Z - A)</option>
                </select>
              </div>
            </div>

            {/* Platform Filter Tabs */}
            {files.length > 0 && (
              <div className="dataset-platform-tabs">
                <button
                  type="button"
                  className={`platform-tab-btn ${platformFilter === 'all' ? 'active' : ''}`}
                  onClick={() => setPlatformFilter('all')}
                >
                  Semua ({counts.all})
                </button>
                <button
                  type="button"
                  className={`platform-tab-btn ${platformFilter === 'tiktok' ? 'active' : ''}`}
                  onClick={() => setPlatformFilter('tiktok')}
                >
                  TikTok ({counts.tiktok})
                </button>
                <button
                  type="button"
                  className={`platform-tab-btn ${platformFilter === 'youtube' ? 'active' : ''}`}
                  onClick={() => setPlatformFilter('youtube')}
                >
                  YouTube ({counts.youtube})
                </button>
              </div>
            )}

            {/* Scrollable Dataset Items List */}
            <div className="dataset-modal-body">
              {filteredAndSortedFiles.length === 0 ? (
                <div className="dataset-empty-state">
                  {files.length === 0 ? (
                    <>
                      <div className="dataset-empty-icon">
                        <Database size={28} />
                      </div>
                      <h4>Belum Ada Dataset Tersimpan</h4>
                      <p>Silakan kumpulkan data komentar terlebih dahulu di menu Pengambilan Data.</p>
                    </>
                  ) : (
                    <>
                      <div className="dataset-empty-icon">
                        <Search size={28} />
                      </div>
                      <h4>Dataset Tidak Ditemukan</h4>
                      <p>
                        Tidak ada dataset yang cocok dengan kata kunci &quot;<strong>{searchQuery}</strong>&quot;.
                      </p>
                      <button
                        type="button"
                        className="btn btn-white-bordered"
                        style={{ marginTop: '12px', fontSize: '12px' }}
                        onClick={() => {
                          setSearchQuery('');
                          setPlatformFilter('all');
                        }}
                      >
                        Reset Pencarian & Tampilkan Semua
                      </button>
                    </>
                  )}
                </div>
              ) : (
                <div className="dataset-items-list" role="radiogroup" aria-label="Daftar dataset penelitian">
                  {filteredAndSortedFiles.map((file) => {
                    const isActive = file.filename === selectedFile;
                    const isSelected = file.filename === tempSelected;
                    const platform = detectPlatform(file);
                    const title = getCleanDatasetTitle(file);
                    const comments = file.comments_count ?? 0;
                    const author = file.author_name || file.author || '';

                    return (
                      <div
                        key={file.filename}
                        role="radio"
                        aria-checked={isSelected}
                        tabIndex={0}
                        className={`dataset-list-item ${isSelected ? 'selected' : ''} ${isActive ? 'is-active' : ''}`}
                        onClick={() => setTempSelected(file.filename)}
                        onDoubleClick={() => {
                          setTempSelected(file.filename);
                          if (file.filename !== selectedFile && typeof onSelectDataset === 'function') {
                            onSelectDataset(file.filename);
                          }
                          setIsModalOpen(false);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            setTempSelected(file.filename);
                          }
                        }}
                      >
                        {/* Radio Selector */}
                        <div className="dataset-item-radio">
                          {isSelected ? (
                            <CheckCircle2 size={19} className="radio-icon checked" />
                          ) : (
                            <span className="radio-icon unchecked" />
                          )}
                        </div>

                        {/* Item Details (Clean academic, no .json backend filenames) */}
                        <div className="dataset-item-content">
                          <div className="dataset-item-title-row">
                            <span className="dataset-item-title" title={title}>
                              {title}
                            </span>
                          </div>

                          <div className="dataset-item-meta-row">
                            <span className={`dataset-platform-tag ${platform}`}>
                              {platform === 'youtube' ? 'YouTube' : 'TikTok'}
                            </span>
                            <span className="dataset-meta-item">
                              <Users size={12} />
                              {comments} komentar
                            </span>
                            {author ? (
                              <span className="dataset-meta-item">
                                <User size={11} />
                                @{author.replace(/^@/, '')}
                              </span>
                            ) : null}
                            {file.modified && (
                              <span className="dataset-meta-item">
                                <Calendar size={11} />
                                {formatDateShort(file.modified)}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Status Badges: Current Active vs Selected */}
                        <div className="dataset-item-status-col">
                          {isActive && (
                            <span className="status-badge-active" title="Dataset yang saat ini sedang aktif digunakan">
                              <span className="pulse-green-dot" />
                              Sedang Aktif
                            </span>
                          )}
                          {isSelected && !isActive && (
                            <span className="status-badge-selected" title="Dataset dipilih untuk digunakan">
                              <Check size={12} />
                              Dipilih
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="dataset-modal-footer">
              <div className="dataset-footer-info">
                <span>
                  Menampilkan <strong>{filteredAndSortedFiles.length}</strong> dari <strong>{files.length}</strong> dataset
                </span>
                {tempSelected && tempSelected !== selectedFile && (
                  <span className="dataset-selection-hint">
                    Klik &quot;Gunakan Dataset&quot; untuk beralih ke dataset ini
                  </span>
                )}
              </div>

              <div className="dataset-footer-actions">
                <button
                  type="button"
                  className="btn-modal-cancel"
                  onClick={handleCancel}
                >
                  Batal
                </button>
                <button
                  type="button"
                  className="btn-modal-apply"
                  onClick={handleApply}
                  disabled={!tempSelected || files.length === 0}
                >
                  <Check size={15} />
                  <span>Gunakan Dataset</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
