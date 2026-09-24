import React, { useState, useMemo } from 'react';
import {
  Brain,
  Database,
  Download,
  FolderArchive,
  Grid,
  List,
  MessageSquare,
  PlayCircle,
  Search,
  Sparkles,
  Trash2,
  Users,
  Video
} from 'lucide-react';
import { deleteUserScrape, getUserScrapeContent } from '../firebase';

export default function DatasetsPage({
  files,
  selectedFile,
  setSelectedFile,
  setData,
  currentUser,
  fetchFilesList,
  loadFileContent,
  loadAiAnalysis,
  switchTab,
  formatDate
}) {
  const [fileSearchQuery, setFileSearchQuery] = useState('');
  const [filePlatformFilter, setFilePlatformFilter] = useState('all'); // 'all' | 'youtube' | 'tiktok'
  const [fileSortBy, setFileSortBy] = useState('newest'); // 'newest' | 'oldest' | 'most_comments' | 'least_comments'
  const [fileViewMode, setFileViewMode] = useState('grid'); // 'grid' | 'table'
  const [fileToDelete, setFileToDelete] = useState(null); // File object awaiting confirmation
  const [deletingFile, setDeletingFile] = useState(false);

  const filteredAndSortedFiles = useMemo(() => {
    return files
      .filter((f) => {
        const isYt = (f.filename && f.filename.startsWith('yt_')) || f.platform === 'youtube';
        if (filePlatformFilter === 'youtube' && !isYt) return false;
        if (filePlatformFilter === 'tiktok' && isYt) return false;

        if (!fileSearchQuery.trim()) return true;
        const q = fileSearchQuery.toLowerCase();
        const cap = (f.caption || '').toLowerCase();
        const fname = (f.filename || '').toLowerCase();
        return cap.includes(q) || fname.includes(q);
      })
      .sort((a, b) => {
        if (fileSortBy === 'most_comments') {
          return (b.comments_count || 0) - (a.comments_count || 0);
        }
        if (fileSortBy === 'least_comments') {
          return (a.comments_count || 0) - (b.comments_count || 0);
        }
        if (fileSortBy === 'oldest') {
          return new Date(a.modified || 0) - new Date(b.modified || 0);
        }
        // Default newest
        return new Date(b.modified || 0) - new Date(a.modified || 0);
      });
  }, [files, filePlatformFilter, fileSearchQuery, fileSortBy]);

  const fileStats = useMemo(() => {
    const totalDatasets = files.length;
    const totalComments = files.reduce((acc, f) => acc + (f.comments_count || 0), 0);
    const ytCount = files.filter((f) => (f.filename && f.filename.startsWith('yt_')) || f.platform === 'youtube').length;
    const ttCount = totalDatasets - ytCount;
    return { totalDatasets, totalComments, ytCount, ttCount };
  }, [files]);

  const requestDeleteFile = (fileItem) => {
    setFileToDelete(fileItem);
  };

  const confirmDeleteUserFile = async () => {
    if (!currentUser || !fileToDelete) return;
    setDeletingFile(true);
    try {
      await deleteUserScrape(currentUser.uid, fileToDelete.filename);
      if (selectedFile === fileToDelete.filename) {
        setSelectedFile('');
        setData(null);
      }
      await fetchFilesList();
      setFileToDelete(null);
    } catch (err) {
      console.error('Gagal menghapus file user:', err);
      alert('Gagal menghapus dataset: ' + (err.message || err));
    } finally {
      setDeletingFile(false);
    }
  };

  const handleDownloadDatasetJson = async (filename) => {
    try {
      const docData = await getUserScrapeContent(currentUser.uid, filename);
      if (!docData) {
        alert('Data tidak ditemukan');
        return;
      }
      const blob = new Blob([JSON.stringify(docData, null, 2)], { type: 'application/json;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      alert('Gagal mengunduh file JSON: ' + (err.message || err));
    }
  };

  return (
            <div>
              <div className="dashboard-hero" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px' }}>
                <div>
                  <h2>Riwayat Dataset Penelitian</h2>
                  <p>Seluruh kumpulan dataset komentar TikTok dan YouTube yang tersimpan aman di akun privat Anda.</p>
                </div>
                <button
                  className="btn btn-scrape-primary"
                  onClick={() => switchTab('dashboard')}
                  style={{ height: '38px', padding: '0 16px', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
                >
                  <PlayCircle size={16} />
                  <span>Scrape Dataset Baru</span>
                </button>
              </div>

              {/* Datasets Overview Stats Bar */}
              <div className="datasets-stats-bar">
                <div className="datasets-stat-card">
                  <div className="datasets-stat-icon-wrap" style={{ background: '#EFF6FF', color: '#2563EB' }}>
                    <Database size={22} />
                  </div>
                  <div>
                    <div className="datasets-stat-value">{fileStats.totalDatasets}</div>
                    <div className="datasets-stat-label">Total Dataset Tersimpan</div>
                  </div>
                </div>

                <div className="datasets-stat-card">
                  <div className="datasets-stat-icon-wrap" style={{ background: '#F0FDF4', color: '#16A34A' }}>
                    <MessageSquare size={22} />
                  </div>
                  <div>
                    <div className="datasets-stat-value">{fileStats.totalComments.toLocaleString('id-ID')}</div>
                    <div className="datasets-stat-label">Total Komentar Terkumpul</div>
                  </div>
                </div>

                <div className="datasets-stat-card">
                  <div className="datasets-stat-icon-wrap" style={{ background: '#FEF2F2', color: '#DC2626' }}>
                    <PlayCircle size={22} />
                  </div>
                  <div>
                    <div className="datasets-stat-value" style={{ fontSize: '16px' }}>
                      {fileStats.ytCount} YouTube • {fileStats.ttCount} TikTok
                    </div>
                    <div className="datasets-stat-label">Distribusi Platform Riset</div>
                  </div>
                </div>

                <div className="datasets-stat-card">
                  <div className="datasets-stat-icon-wrap" style={{ background: '#FAF5FF', color: '#7E22CE' }}>
                    <Sparkles size={22} />
                  </div>
                  <div>
                    <div className="datasets-stat-value" style={{ fontSize: '14px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '170px' }}>
                      {selectedFile ? selectedFile.replace(/\.json$/i, '') : 'Belum Ada'}
                    </div>
                    <div className="datasets-stat-label">Dataset Aktif di Workspace</div>
                  </div>
                </div>
              </div>

              {/* Datasets Toolbar */}
              <div className="datasets-toolbar">
                <div className="datasets-search-wrapper">
                  <Search size={15} style={{ color: '#94A3B8', flexShrink: 0 }} />
                  <input
                    type="text"
                    className="datasets-search-input"
                    placeholder="Cari judul video, topik, atau nama dataset..."
                    value={fileSearchQuery}
                    onChange={(e) => setFileSearchQuery(e.target.value)}
                  />
                  {fileSearchQuery && (
                    <button
                      type="button"
                      style={{ border: 'none', background: 'transparent', color: '#94A3B8', cursor: 'pointer', padding: 0 }}
                      onClick={() => setFileSearchQuery('')}
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>

                <div className="datasets-filter-group">
                  <button
                    type="button"
                    className={`platform-filter-pill ${filePlatformFilter === 'all' ? 'active' : ''}`}
                    onClick={() => setFilePlatformFilter('all')}
                  >
                    Semua ({files.length})
                  </button>
                  <button
                    type="button"
                    className={`platform-filter-pill pill-tiktok ${filePlatformFilter === 'tiktok' ? 'active' : ''}`}
                    onClick={() => setFilePlatformFilter('tiktok')}
                  >
                    TikTok ({fileStats.ttCount})
                  </button>
                  <button
                    type="button"
                    className={`platform-filter-pill pill-youtube ${filePlatformFilter === 'youtube' ? 'active' : ''}`}
                    onClick={() => setFilePlatformFilter('youtube')}
                  >
                    YouTube ({fileStats.ytCount})
                  </button>

                  <select
                    className="datasets-sort-select"
                    value={fileSortBy}
                    onChange={(e) => setFileSortBy(e.target.value)}
                  >
                    <option value="newest">Terbaru Disimpan</option>
                    <option value="oldest">Terlama Disimpan</option>
                    <option value="most_comments">Komentar Terbanyak</option>
                    <option value="least_comments">Komentar Tersedikit</option>
                  </select>

                  <div className="view-mode-toggle-group">
                    <button
                      type="button"
                      className={`view-mode-btn ${fileViewMode === 'grid' ? 'active' : ''}`}
                      onClick={() => setFileViewMode('grid')}
                      title="Tampilan Kartu"
                    >
                      <Grid size={15} />
                    </button>
                    <button
                      type="button"
                      className={`view-mode-btn ${fileViewMode === 'table' ? 'active' : ''}`}
                      onClick={() => setFileViewMode('table')}
                      title="Tampilan Tabel"
                    >
                      <List size={15} />
                    </button>
                  </div>
                </div>
              </div>

              {files.length === 0 ? (
                <div className="empty-state-box">
                  <FolderArchive size={42} className="empty-state-icon" />
                  <h4>Belum ada dataset penelitian tersimpan</h4>
                  <p>Mulai scraping video YouTube atau TikTok di tab Dashboard untuk mengumpulkan korpus komentar skripsi.</p>
                  <button className="btn btn-scrape-primary" onClick={() => switchTab('dashboard')} style={{ height: '38px', padding: '0 16px' }}>
                    Mulai Scraping
                  </button>
                </div>
              ) : filteredAndSortedFiles.length === 0 ? (
                <div className="empty-state-box">
                  <Search size={40} className="empty-state-icon" />
                  <h4>Tidak ada dataset yang cocok</h4>
                  <p>Pencarian "<strong>{fileSearchQuery}</strong>" pada filter yang dipilih tidak menemukan hasil.</p>
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => {
                      setFileSearchQuery('');
                      setFilePlatformFilter('all');
                    }}
                  >
                    Reset Filter Pencarian
                  </button>
                </div>
              ) : fileViewMode === 'grid' ? (
                <div className="datasets-grid">
                  {filteredAndSortedFiles.map((f) => {
                    const isYt = (f.filename && f.filename.startsWith('yt_')) || f.platform === 'youtube';
                    const isSelected = selectedFile === f.filename;
                    const cleanName = f.filename.replace(/\.json$/i, '');
                    return (
                      <div key={f.filename} className={`dataset-card ${isSelected ? 'active-selected' : ''}`}>
                        <div>
                          <div className="dataset-card-top">
                            <span className={`platform-badge ${isYt ? 'youtube' : 'tiktok'}`}>
                              {isYt ? <PlayCircle size={13} /> : <Video size={13} />}
                              <span>{isYt ? 'YouTube Video' : 'TikTok Video'}</span>
                            </span>
                            <span className="dataset-date-text">{formatDate(f.modified)}</span>
                          </div>

                          <div className="dataset-card-body">
                            <h4 className="dataset-title" title={f.caption || cleanName}>
                              {f.caption ? f.caption : cleanName}
                            </h4>

                            <div className="dataset-meta-chips">
                              <span className="dataset-chip dataset-chip-comments">
                                <Users size={12} />
                                <strong>{f.comments_count}</strong> komentar
                              </span>
                              <span className="dataset-chip dataset-chip-file" title={f.filename}>
                                <Database size={11} />
                                <span>{f.filename.length > 24 ? `${f.filename.slice(0, 22)}...` : f.filename}</span>
                              </span>
                              {isSelected && (
                                <span className="dataset-chip dataset-chip-ai">
                                  <Sparkles size={11} /> Aktif di Workspace
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="dataset-card-actions">
                          <button
                            type="button"
                            className="dataset-action-btn-main"
                            onClick={() => loadFileContent(f.filename, true)}
                            title="Buka data komentar di tabel interaktif"
                          >
                            <MessageSquare size={13} />
                            <span>Komentar</span>
                          </button>

                          <button
                            type="button"
                            className="dataset-action-btn-ai"
                            onClick={() => {
                              loadFileContent(f.filename);
                              switchTab('ai-analysis');
                            }}
                            title="Analisis dataset ini dengan AI Skripsi"
                          >
                            <Brain size={13} />
                            <span>Analisis AI</span>
                          </button>

                          <button
                            type="button"
                            className="dataset-action-btn-icon"
                            onClick={() => handleDownloadDatasetJson(f.filename)}
                            title="Unduh file mentah dataset (.json)"
                          >
                            <Download size={14} />
                          </button>

                          <button
                            type="button"
                            className="dataset-action-btn-icon btn-delete"
                            onClick={() => requestDeleteFile(f)}
                            title="Hapus dataset dari akun Anda"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="recent-table-card-clean">
                  <table className="recent-table-clean">
                    <thead>
                      <tr>
                        <th>Platform</th>
                        <th>Dataset & Topik Video</th>
                        <th>Jumlah Komentar</th>
                        <th>Tanggal Simpan</th>
                        <th style={{ textAlign: 'right' }}>Aksi Peneliti</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredAndSortedFiles.map((f) => {
                        const isYt = (f.filename && f.filename.startsWith('yt_')) || f.platform === 'youtube';
                        const isSelected = selectedFile === f.filename;
                        return (
                          <tr key={f.filename} style={isSelected ? { background: '#FFFBEB' } : undefined}>
                            <td>
                              <span className={`platform-badge ${isYt ? 'youtube' : 'tiktok'}`}>
                                {isYt ? <PlayCircle size={12} /> : <Video size={12} />}
                                <span>{isYt ? 'YouTube' : 'TikTok'}</span>
                              </span>
                            </td>
                            <td>
                              <div style={{ fontWeight: 600, color: '#0F172A', marginBottom: '2px' }}>
                                {f.caption ? `${f.caption.slice(0, 55)}...` : f.filename.replace(/\.json$/i, '')}
                              </div>
                              <span style={{ fontSize: '11.5px', color: '#64748B', fontFamily: 'monospace' }}>
                                {f.filename}
                              </span>
                            </td>
                            <td>
                              <span className="dataset-chip dataset-chip-comments">
                                <Users size={12} /> {f.comments_count} komentar
                              </span>
                            </td>
                            <td>
                              <span style={{ fontSize: '12.5px', color: '#64748B' }}>
                                {formatDate(f.modified)}
                              </span>
                            </td>
                            <td style={{ textAlign: 'right' }}>
                              <div style={{ display: 'inline-flex', gap: '6px' }}>
                                <button
                                  className="btn btn-white-bordered"
                                  style={{ padding: '6px 11px', fontSize: '12px' }}
                                  onClick={() => loadFileContent(f.filename, true)}
                                >
                                  Komentar ➔
                                </button>
                                <button
                                  className="btn btn-white-bordered"
                                  style={{ padding: '6px 11px', fontSize: '12px', color: '#7C3AED', borderColor: '#DDD6FE', background: '#FAF5FF' }}
                                  onClick={() => {
                                    loadFileContent(f.filename);
                                    switchTab('ai-analysis');
                                  }}
                                >
                                  Analisis AI ➔
                                </button>
                                <button
                                  className="btn btn-white-bordered"
                                  style={{ padding: '6px 9px', fontSize: '12px' }}
                                  onClick={() => handleDownloadDatasetJson(f.filename)}
                                  title="Unduh file mentah dataset (.json)"
                                >
                                  <Download size={13} />
                                </button>
                                <button
                                  className="btn btn-white-bordered"
                                  style={{ padding: '6px 9px', fontSize: '12px', color: '#DC2626', borderColor: '#FECACA' }}
                                  onClick={() => requestDeleteFile(f)}
                                  title="Hapus dataset"
                                >
                                  <Trash2 size={13} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Modal Konfirmasi Hapus Dataset */}
              {fileToDelete && (
                <div className="dataset-modal-backdrop" onClick={() => !deletingFile && setFileToDelete(null)}>
                  <div className="dataset-modal-box" onClick={(e) => e.stopPropagation()}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
                      <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: '#FEE2E2', color: '#DC2626', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Trash2 size={22} />
                      </div>
                      <div>
                        <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#0F172A' }}>Hapus Dataset Penelitian?</h3>
                        <p style={{ margin: '2px 0 0', fontSize: '12.5px', color: '#64748B' }}>Tindakan ini tidak dapat dibatalkan</p>
                      </div>
                    </div>

                    <div style={{ background: '#F8FAFC', padding: '12px 14px', borderRadius: '8px', border: '1px solid #E2E8F0', marginBottom: '18px', fontSize: '13px' }}>
                      <div style={{ fontWeight: 600, color: '#0F172A', marginBottom: '4px' }}>
                        {fileToDelete.caption ? `"${fileToDelete.caption.slice(0, 75)}..."` : fileToDelete.filename}
                      </div>
                      <div style={{ fontSize: '12px', color: '#64748B' }}>
                        {fileToDelete.comments_count || 0} komentar • File: <code>{fileToDelete.filename}</code>
                      </div>
                    </div>

                    <p style={{ fontSize: '13px', color: '#475569', lineHeight: '1.5', marginBottom: '20px' }}>
                      Dataset komentar dan seluruh hasil analisis AI skripsi yang terhubung akan dihapus secara permanen dari akun riset Anda.
                    </p>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                      <button
                        type="button"
                        className="btn btn-secondary"
                        disabled={deletingFile}
                        onClick={() => setFileToDelete(null)}
                      >
                        Batal
                      </button>
                      <button
                        type="button"
                        className="btn"
                        style={{ background: '#DC2626', color: '#FFFFFF', border: 'none' }}
                        disabled={deletingFile}
                        onClick={confirmDeleteUserFile}
                      >
                        {deletingFile ? 'Menghapus...' : 'Ya, Hapus Dataset'}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
  );
}
