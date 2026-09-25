import useModalDialog from './useModalDialog';
import './research-modals.css';
import React, { useState, useMemo } from 'react';
import {
  X,
  Copy,
  Check,
  Download,
  Quote,
  BookOpen,
  ExternalLink,
  Sparkles,
  CheckCircle2,
  FileText,
  Info
} from 'lucide-react';
import {
  generateVideoCitations,
  parseCreatorFromUrl,
  extractTahun
} from '../utils/citationHelper';
import { downloadFile } from '../utils/statExporter';

export default function CitationModal({
  isOpen,
  onClose,
  data,
  selectedFileName = 'video'
}) {
  const dialogRef = useModalDialog(isOpen, onClose);
  const [copiedKey, setCopiedKey] = useState(null);
  const [successToast, setSuccessToast] = useState('');

  // Auto-detect creator info
  const initialCreator = useMemo(() => {
    const fromUrl = parseCreatorFromUrl(data?.video_url);
    const dateStr = data?.published_at || data?.date_now || (data?.comments?.[0]?.create_time) || '';
    const isYt = data?.platform === 'youtube' || data?.video_url?.includes('youtube.com') || data?.video_url?.includes('youtu.be');
    const isIg = data?.platform === 'instagram' || data?.video_url?.includes('instagram.com');
    return {
      creatorName: data?.author_name || (fromUrl.creatorName !== 'Kreator Konten' ? fromUrl.creatorName : isYt ? 'Kreator YouTube' : 'Kreator Video'),
      handle: fromUrl.handle !== 'tiktok_creator' ? fromUrl.handle : isYt ? 'youtube' : 'kreator_tiktok',
      publishDate: dateStr ? dateStr.slice(0, 10) : new Date().toISOString().slice(0, 10),
      platform: isYt ? 'YouTube' : isIg ? 'Instagram' : 'TikTok'
    };
  }, [data]);

  const [creatorName, setCreatorName] = useState(initialCreator.creatorName);
  const [handle, setHandle] = useState(initialCreator.handle);
  const [publishDate, setPublishDate] = useState(initialCreator.publishDate);
  const [platform, setPlatform] = useState(initialCreator.platform);
  const [activeTab, setActiveTab] = useState('apa7'); // 'apa7' | 'harvard' | 'chicago_mla' | 'mendeley'

  // Update whenever initialCreator changes
  React.useEffect(() => {
    setCreatorName(initialCreator.creatorName);
    setHandle(initialCreator.handle);
    setPublishDate(initialCreator.publishDate);
    setPlatform(initialCreator.platform);
  }, [initialCreator]);

  // Generate citations
  const citations = useMemo(() => {
    return generateVideoCitations({
      creatorName,
      handle,
      caption: data?.caption || '',
      videoUrl: data?.video_url || '',
      publishDate,
      platform
    });
  }, [creatorName, handle, data, publishDate, platform]);

  if (!isOpen) return null;

  const handleCopy = (text, key, label) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedKey(key);
      setSuccessToast(`Sitasi format ${label} tersalin ke Clipboard!`);
      setTimeout(() => {
        setCopiedKey(null);
        setSuccessToast('');
      }, 3000);
    });
  };

  const handleDownloadFile = (type) => {
    const base = selectedFileName.replace(/\.json$/i, '');
    if (type === 'ris') {
      downloadFile(citations.ris, `sitasi_${base}_mendeley.ris`, 'application/x-research-info-systems;charset=utf-8');
      setSuccessToast('File .RIS (Mendeley & Zotero) berhasil diunduh!');
    } else if (type === 'bib') {
      downloadFile(citations.bibtex, `sitasi_${base}.bib`, 'text/plain;charset=utf-8');
      setSuccessToast('File .BIB (BibTeX) berhasil diunduh!');
    }
    setTimeout(() => setSuccessToast(''), 3000);
  };

  return (
    <div className="stat-modal-overlay" onClick={onClose}>
      <div ref={dialogRef} role="dialog" aria-modal="true" aria-label="Sitasi video" tabIndex={-1} className="stat-modal-container research-modal citation-modal-container" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="stat-modal-header">
          <div className="stat-modal-title-wrap">
            <div className="stat-modal-icon-badge" style={{ background: '#fdf2f8', borderColor: '#fbcfe8', color: '#db2777' }}>
              <Quote size={22} color="#db2777" />
            </div>
            <div>
              <h3 className="stat-modal-title">Sitasi video</h3>
              <p className="stat-modal-subtitle">
                Format standar Daftar Pustaka (APA 7th, Harvard, Mendeley, BibTeX) untuk Skripsi & Tugas Akhir.
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
          {/* Metadata Video Bar (Editable) */}
          <div className="citation-meta-box">
            <div className="citation-meta-title">
              <BookOpen size={15} color="var(--color-primary)" />
              <span>Detail Objek Penelitian (Dapat Disesuaikan):</span>
            </div>
            <div className="citation-meta-grid">
              <div className="meta-field">
                <label>Nama Akun / Kreator</label>
                <input
                  type="text"
                  value={creatorName}
                  onChange={(e) => setCreatorName(e.target.value)}
                  placeholder="Nama Akun Kreator"
                />
              </div>

              <div className="meta-field">
                <label>Username / Handle (@)</label>
                <div className="handle-input-wrap">
                  <span className="handle-prefix">@</span>
                  <input
                    type="text"
                    value={handle}
                    onChange={(e) => setHandle(e.target.value.replace(/^@/, ''))}
                    placeholder="username"
                  />
                </div>
              </div>

              <div className="meta-field">
                <label>Tanggal Unggah / Tahun</label>
                <input
                  type="date"
                  value={publishDate}
                  onChange={(e) => setPublishDate(e.target.value)}
                />
              </div>

              <div className="meta-field">
                <label>Platform Media Sosial</label>
                <select value={platform} onChange={(e) => setPlatform(e.target.value)}>
                  <option value="TikTok">TikTok</option>
                  <option value="Instagram">Instagram</option>
                  <option value="YouTube">YouTube Shorts</option>
                  <option value="X">X (Twitter)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Style Tabs */}
          <div className="citation-tab-bar">
            <button
              className={`citation-tab ${activeTab === 'apa7' ? 'active' : ''}`}
              onClick={() => setActiveTab('apa7')}
            >
              <span>APA 7th Edition</span>

            </button>
            <button
              className={`citation-tab ${activeTab === 'harvard' ? 'active' : ''}`}
              onClick={() => setActiveTab('harvard')}
            >
              <span>Harvard Style</span>
            </button>
            <button
              className={`citation-tab ${activeTab === 'chicago_mla' ? 'active' : ''}`}
              onClick={() => setActiveTab('chicago_mla')}
            >
              <span>Chicago & MLA</span>
            </button>
            <button
              className={`citation-tab ${activeTab === 'mendeley' ? 'active' : ''}`}
              onClick={() => setActiveTab('mendeley')}
            >
              <span>Mendeley & BibTeX</span>

            </button>
          </div>

          {/* Tab 1: APA 7th Edition */}
          {activeTab === 'apa7' && (
            <div className="citation-body-content">
              <div className="citation-card-block">
                <div className="cite-block-header">
                  <span className="cite-block-label">Format Daftar Pustaka (Bibliografi):</span>
                  <button
                    className="btn btn-primary btn-sm-copy"
                    onClick={() => handleCopy(citations.apa7, 'apa7', 'APA 7th')}
                  >
                    {copiedKey === 'apa7' ? <Check size={14} /> : <Copy size={14} />}
                    <span>{copiedKey === 'apa7' ? 'Tersalin!' : 'Salin Sitasi APA'}</span>
                  </button>
                </div>
                <div className="cite-preview-text apa-font">
                  {citations.apa7}
                </div>
              </div>

              {/* In-Text Citations */}
              <div className="citation-in-text-grid">
                <div className="in-text-item">
                  <div className="in-text-head">
                    <span>Sitasi dalam Kurung (Parenthetical):</span>
                    <button
                      className="copy-mini-btn"
                      onClick={() => handleCopy(citations.apaInTextParenthetical, 'apa_in1', 'In-Text')}
                    >
                      {copiedKey === 'apa_in1' ? <Check size={12} color="var(--color-success)" /> : <Copy size={12} />}
                    </button>
                  </div>
                  <code>{citations.apaInTextParenthetical}</code>
                </div>

                <div className="in-text-item">
                  <div className="in-text-head">
                    <span>Sitasi Naratif (Narrative Citation):</span>
                    <button
                      className="copy-mini-btn"
                      onClick={() => handleCopy(citations.apaInTextNarrative, 'apa_in2', 'Naratif')}
                    >
                      {copiedKey === 'apa_in2' ? <Check size={12} color="var(--color-success)" /> : <Copy size={12} />}
                    </button>
                  </div>
                  <code>{citations.apaInTextNarrative}</code>
                </div>
              </div>

              <div className="stat-quick-guide" style={{ marginTop: '8px' }}>
                <Info size={15} />
                <span>
                  <strong>Pedoman APA 7th:</strong> Gunakan format ini pada Bab <em>Daftar Pustaka</em> di akhir skripsi. Judul caption video dicetak miring (*italics*) bila ditempel ke Microsoft Word.
                </span>
              </div>
            </div>
          )}

          {/* Tab 2: Harvard */}
          {activeTab === 'harvard' && (
            <div className="citation-body-content">
              <div className="citation-card-block">
                <div className="cite-block-header">
                  <span className="cite-block-label">Format Daftar Pustaka (Harvard Referencing):</span>
                  <button
                    className="btn btn-primary btn-sm-copy"
                    onClick={() => handleCopy(citations.harvard, 'harvard', 'Harvard')}
                  >
                    {copiedKey === 'harvard' ? <Check size={14} /> : <Copy size={14} />}
                    <span>{copiedKey === 'harvard' ? 'Tersalin!' : 'Salin Sitasi Harvard'}</span>
                  </button>
                </div>
                <div className="cite-preview-text">
                  {citations.harvard}
                </div>
              </div>

              <div className="stat-quick-guide">
                <Info size={15} />
                <span>
                  <strong>Harvard Style:</strong> Menyertakan tanggal spesifik ketika Anda mengakses video media sosial tersebut secara daring.
                </span>
              </div>
            </div>
          )}

          {/* Tab 3: Chicago & MLA */}
          {activeTab === 'chicago_mla' && (
            <div className="citation-body-content">
              <div className="citation-card-block">
                <div className="cite-block-header">
                  <span className="cite-block-label">Chicago Manual of Style (17th Author-Date):</span>
                  <button
                    className="btn btn-white-bordered btn-sm-copy"
                    onClick={() => handleCopy(citations.chicago, 'chicago', 'Chicago')}
                  >
                    {copiedKey === 'chicago' ? <Check size={14} color="var(--color-success)" /> : <Copy size={14} />}
                    <span>{copiedKey === 'chicago' ? 'Tersalin!' : 'Salin Chicago'}</span>
                  </button>
                </div>
                <div className="cite-preview-text">
                  {citations.chicago}
                </div>
              </div>

              <div className="citation-card-block" style={{ marginTop: '12px' }}>
                <div className="cite-block-header">
                  <span className="cite-block-label">MLA 9th Edition:</span>
                  <button
                    className="btn btn-white-bordered btn-sm-copy"
                    onClick={() => handleCopy(citations.mla, 'mla', 'MLA 9th')}
                  >
                    {copiedKey === 'mla' ? <Check size={14} color="var(--color-success)" /> : <Copy size={14} />}
                    <span>{copiedKey === 'mla' ? 'Tersalin!' : 'Salin MLA'}</span>
                  </button>
                </div>
                <div className="cite-preview-text">
                  {citations.mla}
                </div>
              </div>
            </div>
          )}

          {/* Tab 4: Mendeley & BibTeX */}
          {activeTab === 'mendeley' && (
            <div className="citation-body-content">
              <div className="citation-export-cards">
                <div className="cite-export-card">
                  <div className="cite-export-head">
                    <FileText size={18} color="#db2777" />
                    <div>
                      <strong>Mendeley & Zotero (.RIS)</strong>
                      <p>Format standar referensi manajer universal</p>
                    </div>
                  </div>
                  <pre className="code-snippet-preview">{citations.ris}</pre>
                  <button
                    className="btn btn-primary stat-dl-btn"
                    style={{ backgroundColor: '#db2777', borderColor: '#db2777' }}
                    onClick={() => handleDownloadFile('ris')}
                  >
                    <Download size={15} />
                    <span>Unduh File .RIS (Mendeley/Zotero)</span>
                  </button>
                </div>

                <div className="cite-export-card">
                  <div className="cite-export-head">
                    <Sparkles size={18} color="var(--color-primary)" />
                    <div>
                      <strong>LaTeX / Overleaf (BibTeX .bib)</strong>
                      <p>Format sitasi akademik untuk LaTeX</p>
                    </div>
                  </div>
                  <pre className="code-snippet-preview">{citations.bibtex}</pre>
                  <button
                    className="btn btn-white-bordered stat-dl-btn"
                    onClick={() => handleDownloadFile('bib')}
                  >
                    <Download size={15} />
                    <span>Unduh File .BIB (BibTeX)</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="stat-modal-footer">
          <div className="stat-footer-left">
            <span>Sesuai standar American Psychological Association (APA) 7th Edition</span>
          </div>
          <button className="btn btn-white-bordered" onClick={onClose}>
            Selesai
          </button>
        </div>
      </div>
    </div>
  );
}
