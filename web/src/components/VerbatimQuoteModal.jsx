import React, { useState, useMemo } from 'react';
import {
  X,
  Copy,
  Check,
  Quote,
  Clock,
  Sparkles,
  CheckCircle2,
  Table,
  FileText,
  Shield,
  Layers,
  Info
} from 'lucide-react';
import { generateVerbatimQuote } from '../utils/citationHelper';
import { analyzeCommentMetrics } from '../utils/statExporter';

export default function VerbatimQuoteModal({
  isOpen,
  onClose,
  comment,
  commentIndex = 1,
  videoTitle = '',
  videoUrl = ''
}) {
  const [anonymous, setAnonymous] = useState(false);
  const [copiedKey, setCopiedKey] = useState(null);
  const [successToast, setSuccessToast] = useState('');

  // Hitung metrik leksikon jika belum ada
  const metrics = useMemo(() => {
    if (!comment) return null;
    return analyzeCommentMetrics(comment.comment);
  }, [comment]);

  // Generate variasi kutipan
  const quotes = useMemo(() => {
    if (!comment) return null;
    return generateVerbatimQuote({
      rawComment: comment.comment || '',
      username: comment.username || 'user',
      nickname: comment.nickname || '',
      createTime: comment.create_time || '',
      sentimentLabel: metrics?.sentimentLabel || 'Netral',
      emotionLabel: metrics?.emotionLabel || 'Netral',
      videoTitle,
      videoUrl,
      anonymous,
      informantNumber: commentIndex
    });
  }, [comment, commentIndex, videoTitle, videoUrl, anonymous, metrics]);

  if (!isOpen || !comment || !quotes) return null;

  const handleCopy = (text, key, label) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedKey(key);
      setSuccessToast(`Kutipan ${label} berhasil disalin! Siap ditempel ke Microsoft Word.`);
      setTimeout(() => {
        setCopiedKey(null);
        setSuccessToast('');
      }, 3000);
    });
  };

  return (
    <div className="stat-modal-overlay" onClick={onClose}>
      <div className="stat-modal-container quote-modal-container" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="stat-modal-header">
          <div className="stat-modal-title-wrap">
            <div className="stat-modal-icon-badge" style={{ background: '#ecfdf5', borderColor: '#a7f3d0', color: '#059669' }}>
              <Quote size={22} color="#059669" />
            </div>
            <div>
              <h3 className="stat-modal-title">Kutipan Verbatim untuk Bab 4 Skripsi</h3>
              <p className="stat-modal-subtitle">
                Salin kutipan langsung respon komentar dengan kaidah penulisan karya ilmiah akademik.
              </p>
            </div>
          </div>
          <button className="stat-modal-close" onClick={onClose} aria-label="Tutup">
            <X size={20} />
          </button>
        </div>

        {/* Feedback Alert */}
        {successToast && (
          <div className="stat-alert-success">
            <CheckCircle2 size={16} />
            <span>{successToast}</span>
          </div>
        )}

        <div className="stat-modal-body">
          {/* Card Info Komentar Terpilih */}
          <div className="quote-comment-highlight">
            <div className="quote-author-line">
              <div className="quote-author-name">
                <span className="author-name-bold">{quotes.displayAuthor}</span>
                {!anonymous && comment.nickname && (
                  <span className="author-handle-gray">({comment.nickname})</span>
                )}
              </div>
              <div className="quote-badges">
                <span className={`stat-pill-sm sent-${metrics?.sentimentCode || 2}`}>
                  Sentimen {metrics?.sentimentLabel}
                </span>
                <span className="stat-pill-sm emot">
                  Emosi: {metrics?.emotionLabel}
                </span>
                <span className="quote-time-badge">
                  <Clock size={11} />
                  {quotes.tglKomentar}
                </span>
              </div>
            </div>
            <p className="quote-text-original">"{quotes.cleanText}"</p>
          </div>

          {/* Opsi Anonimitas Responden (Etika Penelitian) */}
          <div className="quote-ethics-bar">
            <div className="quote-ethics-info">
              <Shield size={16} color="var(--color-primary)" />
              <div>
                <strong>Etika Penelitian & Privasi Responden:</strong>
                <p>Samarkan username asli menjadi <code>Informan #{String(commentIndex).padStart(2, '0')}</code> untuk melindungi identitas subjek penelitian.</p>
              </div>
            </div>
            <label className="quote-toggle-switch">
              <input
                type="checkbox"
                checked={anonymous}
                onChange={(e) => setAnonymous(e.target.checked)}
              />
              <span className="toggle-slider" />
              <span className="toggle-label">{anonymous ? 'Anonim (Aktif)' : 'Nama Akun Asli'}</span>
            </label>
          </div>

          {/* Variasi Format Kutipan */}
          <div className="quote-variants-list">
            {/* Format 1: Narasi Langsung */}
            <div className="quote-variant-card">
              <div className="variant-header">
                <div className="variant-meta">
                  <FileText size={16} color="#2563EB" />
                  <strong>1. Format Narasi Langsung (In-Text Direct Quote)</strong>
                  <span className="variant-badge">Paling Sering Digunakan</span>
                </div>
                <button
                  className="btn btn-primary btn-sm-copy"
                  onClick={() => handleCopy(quotes.narasiLangsung, 'narasi', 'Narasi Langsung')}
                >
                  {copiedKey === 'narasi' ? <Check size={14} /> : <Copy size={14} />}
                  <span>{copiedKey === 'narasi' ? 'Tersalin!' : 'Salin Narasi'}</span>
                </button>
              </div>
              <div className="variant-body quote-academic-font">
                {quotes.narasiLangsung}
              </div>
            </div>

            {/* Format 2: Narasi Analitis */}
            <div className="quote-variant-card">
              <div className="variant-header">
                <div className="variant-meta">
                  <Sparkles size={16} color="#7C3AED" />
                  <strong>2. Format Narasi Argumentatif & Analitis</strong>
                  <span className="variant-badge">Analisis Pembahasan</span>
                </div>
                <button
                  className="btn btn-white-bordered btn-sm-copy"
                  onClick={() => handleCopy(quotes.narasiArgumentatif, 'analitis', 'Narasi Argumentatif')}
                >
                  {copiedKey === 'analitis' ? <Check size={14} color="var(--color-success)" /> : <Copy size={14} />}
                  <span>{copiedKey === 'analitis' ? 'Tersalin!' : 'Salin Analisis'}</span>
                </button>
              </div>
              <div className="variant-body quote-academic-font">
                {quotes.narasiArgumentatif}
              </div>
            </div>

            {/* Format 3: Blok Kutipan (>40 kata) */}
            <div className="quote-variant-card">
              <div className="variant-header">
                <div className="variant-meta">
                  <Layers size={16} color="#D97706" />
                  <strong>3. Format Blok Kutipan (Indented Blockquote)</strong>
                  <span className="variant-badge">Kutipan Panjang / Lampiran</span>
                </div>
                <button
                  className="btn btn-white-bordered btn-sm-copy"
                  onClick={() => handleCopy(quotes.blokKutipan, 'blok', 'Blok Kutipan')}
                >
                  {copiedKey === 'blok' ? <Check size={14} color="var(--color-success)" /> : <Copy size={14} />}
                  <span>{copiedKey === 'blok' ? 'Tersalin!' : 'Salin Blok'}</span>
                </button>
              </div>
              <div className="variant-body blockquote-display quote-academic-font">
                <pre>{quotes.blokKutipan}</pre>
              </div>
            </div>

            {/* Format 4: Baris Tabel Word */}
            <div className="quote-variant-card">
              <div className="variant-header">
                <div className="variant-meta">
                  <Table size={16} color="#059669" />
                  <strong>4. Format Baris Tabel Microsoft Word (Tab-Separated)</strong>
                  <span className="variant-badge">Tabel Informan Bab 4</span>
                </div>
                <button
                  className="btn btn-white-bordered btn-sm-copy"
                  onClick={() => handleCopy(quotes.barisTabel, 'tabel', 'Baris Tabel')}
                >
                  {copiedKey === 'tabel' ? <Check size={14} color="var(--color-success)" /> : <Copy size={14} />}
                  <span>{copiedKey === 'tabel' ? 'Tersalin!' : 'Salin Baris Tabel'}</span>
                </button>
              </div>
              <div className="variant-body table-row-preview">
                <div className="table-row-chip">No: {commentIndex}</div>
                <div className="table-row-chip">Informan: {quotes.displayAuthor}</div>
                <div className="table-row-chip quote-chip">"{quotes.cleanText}"</div>
                <div className="table-row-chip">{metrics?.sentimentLabel} / {metrics?.emotionLabel}</div>
              </div>
            </div>
          </div>

          <div className="stat-quick-guide" style={{ marginTop: '10px' }}>
            <Info size={15} />
            <span>
              <strong>Kiat Penulisan Skripsi:</strong> Di Microsoft Word, kutipan langsung pendek (&lt;40 kata) disatukan dalam paragraf dengan tanda petik ganda. Kutipan panjang (&ge;40 kata) dibuat terpisah dengan margin kiri menjorok 1 cm dan spasi tunggal.
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="stat-modal-footer">
          <div className="stat-footer-left">
            <span>Standar Pedoman Tata Tulis Skripsi & Karya Ilmiah Indonesia</span>
          </div>
          <button className="btn btn-white-bordered" onClick={onClose}>
            Selesai
          </button>
        </div>
      </div>
    </div>
  );
}
