import useModalDialog from './useModalDialog';
import './research-modals.css';
import React, { useState, useMemo } from 'react';
import {
  X,
  Download,
  Copy,
  Check,
  FileSpreadsheet,
  BarChart3,
  Layers,
  Database,
  Info,
  CheckCircle2,
  FileText,
  Code,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import {
  buildStatisticalDataset,
  generateExcelCSV,
  generateExcelTSV,
  generateSPSSCSV,
  generateSPSSSyntax,
  generateSmartPLSCSV,
  generateJASPCSV,
  downloadFile
} from '../utils/statExporter';

export default function ExportStatsModal({
  isOpen,
  onClose,
  allComments = [],
  filteredComments = [],
  selectedFileName = 'dataset',
  searchKeyword = ''
}) {
  const dialogRef = useModalDialog(isOpen, onClose);
  const [activeSoftware, setActiveSoftware] = useState('excel'); // 'excel' | 'spss' | 'smartpls' | 'jasp'
  const [dataScope, setDataScope] = useState('all'); // 'all' | 'filtered'
  const [includeReplies, setIncludeReplies] = useState(true);
  const [copiedType, setCopiedType] = useState(null);
  const [downloadSuccess, setDownloadSuccess] = useState('');

  // Tentukan sumber data berdasarkan opsi cakupan
  const sourceComments = useMemo(() => {
    if (dataScope === 'filtered' && filteredComments.length > 0) {
      return filteredComments;
    }
    return allComments;
  }, [dataScope, filteredComments, allComments]);

  // Bangun dataset terstandarisasi untuk ekspor
  const dataset = useMemo(() => {
    return buildStatisticalDataset(sourceComments, { includeReplies });
  }, [sourceComments, includeReplies]);

  // Hitung ringkasan statistik dataset
  const statsSummary = useMemo(() => {
    let mainCount = 0;
    let replyCount = 0;
    let positiveCount = 0;
    let neutralCount = 0;
    let negativeCount = 0;

    dataset.forEach((d) => {
      if (d.is_reply === 0) mainCount++;
      else replyCount++;

      if (d.sent_code === 3) positiveCount++;
      else if (d.sent_code === 1) negativeCount++;
      else neutralCount++;
    });

    return {
      total: dataset.length,
      mainCount,
      replyCount,
      positiveCount,
      neutralCount,
      negativeCount
    };
  }, [dataset]);

  if (!isOpen) return null;

  const baseFileName = selectedFileName.replace(/\.json$/i, '');

  // Handler Download per Software
  const handleDownload = (formatType) => {
    const timestamp = new Date().toISOString().slice(0, 10);

    if (formatType === 'excel') {
      const csv = generateExcelCSV(dataset);
      downloadFile(csv, `skripsi_excel_${baseFileName}_${timestamp}.csv`, 'text/csv;charset=utf-8');
      triggerSuccess('File Excel (.csv UTF-8 BOM) berhasil diunduh!');
    } else if (formatType === 'spss_data') {
      const csv = generateSPSSCSV(dataset);
      downloadFile(csv, `dataset_spss_${baseFileName}.csv`, 'text/csv;charset=utf-8');
      triggerSuccess('Dataset SPSS (.csv) berhasil diunduh!');
    } else if (formatType === 'spss_syntax') {
      const sps = generateSPSSSyntax(dataset, `dataset_spss_${baseFileName}.csv`);
      downloadFile(sps, `syntax_spss_${baseFileName}.sps`, 'text/plain;charset=utf-8');
      triggerSuccess('Sintaks SPSS (.sps) berhasil diunduh!');
    } else if (formatType === 'smartpls') {
      const csv = generateSmartPLSCSV(dataset);
      downloadFile(csv, `smartpls_matrix_${baseFileName}_${timestamp}.csv`, 'text/csv;charset=utf-8');
      triggerSuccess('Matriks SmartPLS (.csv) berhasil diunduh!');
    } else if (formatType === 'jasp') {
      const csv = generateJASPCSV(dataset);
      downloadFile(csv, `jasp_dataset_${baseFileName}_${timestamp}.csv`, 'text/csv;charset=utf-8');
      triggerSuccess('Dataset JASP (.csv) berhasil diunduh!');
    }
  };

  // Handler Salin ke Clipboard (TSV / Syntax)
  const handleCopyTSV = () => {
    const tsv = generateExcelTSV(dataset);
    navigator.clipboard.writeText(tsv).then(() => {
      setCopiedType('tsv');
      triggerSuccess('Data tersalin! Buka Excel atau Google Sheets lalu tekan Ctrl+V (Paste).');
      setTimeout(() => setCopiedType(null), 2500);
    });
  };

  const handleCopySPSSSyntax = () => {
    const sps = generateSPSSSyntax(dataset, `dataset_spss_${baseFileName}.csv`);
    navigator.clipboard.writeText(sps).then(() => {
      setCopiedType('syntax');
      triggerSuccess('Sintaks SPSS tersalin ke Clipboard!');
      setTimeout(() => setCopiedType(null), 2500);
    });
  };

  const triggerSuccess = (msg) => {
    setDownloadSuccess(msg);
    setTimeout(() => {
      setDownloadSuccess('');
    }, 4000);
  };

  // Daftar Software Pilihan
  const SOFTWARE_OPTIONS = [
    {
      id: 'excel',
      name: 'Microsoft Excel',
      ext: '.xlsx / .csv',
      badge: 'Umum & Spreadsheet',
      color: '#107C41',
      icon: FileSpreadsheet,
      desc: 'Format CSV dengan UTF-8 BOM agar tulisan Indonesia & emoji tidak rusak di Excel. Dilengkapi kolom teks bersih dan metrik olah data.'
    },
    {
      id: 'spss',
      name: 'IBM SPSS Statistics',
      ext: '.csv + .sps',
      badge: 'Deskriptif & Hipotesis',
      color: '#0062FF',
      icon: BarChart3,
      desc: 'Dataset dengan nama variabel standar SPSS plus File Script Sintaks (.sps) otomatis untuk variabel label, value labels, frekuensi & crosstab.'
    },
    {
      id: 'smartpls',
      name: 'SmartPLS 3 & 4',
      ext: '.csv Matrix',
      badge: 'PLS-SEM / Jalur',
      color: '#F97316',
      icon: Layers,
      desc: 'Matriks indikator numerik murni tanpa missing value atau string rusak. Siap bangun Outer Model & Inner Model jalur penelitian skripsi.'
    },
    {
      id: 'jasp',
      name: 'JASP Statistics',
      ext: '.csv JASP Ready',
      badge: 'Open-Source & Gratis',
      color: '#7C3AED',
      icon: Database,
      desc: 'Format terstandarisasi untuk JASP (Univ. of Amsterdam). Langsung mendeteksi skala Nominal, Ordinal, dan Scale untuk T-Test, ANOVA & Korelasi.'
    }
  ];

  return (
    <div className="stat-modal-overlay" onClick={onClose}>
      <div ref={dialogRef} role="dialog" aria-modal="true" aria-label="Ekspor statistik" tabIndex={-1} className="stat-modal-container research-modal" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="stat-modal-header">
          <div className="stat-modal-title-wrap">
            <div className="stat-modal-icon-badge">
              <FileSpreadsheet size={22} color="var(--color-primary)" />
            </div>
            <div>
              <h3 className="stat-modal-title">Ekspor statistik</h3>
              <p className="stat-modal-subtitle">
                Olah data skripsi langsung ke SPSS, Excel, SmartPLS, dan JASP tanpa pusing format ulang.
              </p>
            </div>
          </div>
          <button className="stat-modal-close" onClick={onClose} aria-label="Tutup">
            <X size={20} />
          </button>
        </div>

        {/* Notifikasi feedback sukses */}
        {downloadSuccess && (
          <div className="stat-alert-success">
            <CheckCircle2 size={16} />
            <span>{downloadSuccess}</span>
          </div>
        )}

        <div className="stat-modal-body">
          {/* Pengaturan Cakupan Data (Data Scope) */}
        <div className="stat-scope-toolbar">
          <div className="stat-scope-label">
            <span className="stat-scope-title">Cakupan Data:</span>
            <div className="stat-scope-radios">
              <label className={`stat-scope-radio ${dataScope === 'all' ? 'active' : ''}`}>
                <input
                  type="radio"
                  name="dataScope"
                  value="all"
                  checked={dataScope === 'all'}
                  onChange={() => setDataScope('all')}
                />
                <span>Semua Komentar ({allComments.length})</span>
              </label>

              {filteredComments.length > 0 && filteredComments.length !== allComments.length && (
                <label className={`stat-scope-radio ${dataScope === 'filtered' ? 'active' : ''}`}>
                  <input
                    type="radio"
                    name="dataScope"
                    value="filtered"
                    checked={dataScope === 'filtered'}
                    onChange={() => setDataScope('filtered')}
                  />
                  <span>Hanya Hasil Filter & Pencarian ({filteredComments.length})</span>
                </label>
              )}
            </div>
          </div>

          <label className="stat-checkbox-label">
            <input
              type="checkbox"
              checked={includeReplies}
              onChange={(e) => setIncludeReplies(e.target.checked)}
            />
            <span>Sertakan Komentar Balasan (Thread Replies)</span>
          </label>
        </div>

        {/* Ringkasan Dataset Badge Bar */}
        <div className="stat-summary-bar">
          <div className="stat-badge-item">
            <span className="stat-badge-lbl">Total Baris:</span>
            <strong>{statsSummary.total} baris</strong>
          </div>
          <div className="stat-badge-item">
            <span className="stat-badge-lbl">Komentar Utama:</span>
            <strong>{statsSummary.mainCount}</strong>
          </div>
          <div className="stat-badge-item">
            <span className="stat-badge-lbl">Balasan:</span>
            <strong>{statsSummary.replyCount}</strong>
          </div>
          <div className="stat-badge-item">
            <span className="stat-badge-lbl">Sentimen:</span>
            <span className="sent-pill pos">{statsSummary.positiveCount} Pos</span>
            <span className="sent-pill net">{statsSummary.neutralCount} Net</span>
            <span className="sent-pill neg">{statsSummary.negativeCount} Neg</span>
          </div>
        </div>

        {/* Software Selector Cards */}
        <div className="stat-software-grid">
          {SOFTWARE_OPTIONS.map((sw) => {
            const Icon = sw.icon;
            const isSelected = activeSoftware === sw.id;
            return (
              <button
                type="button"
                aria-pressed={isSelected}
                key={sw.id}
                className={`stat-software-card ${isSelected ? 'active' : ''}`}
                onClick={() => setActiveSoftware(sw.id)}
                style={{ '--accent-color': sw.color }}
              >
                <div className="stat-card-head">
                  <div className="stat-sw-icon-wrap" style={{ backgroundColor: `${sw.color}15`, color: sw.color }}>
                    <Icon size={20} />
                  </div>
                  <span className="stat-sw-badge">{sw.badge}</span>
                </div>
                <div className="stat-sw-name">{sw.name}</div>
                <div className="stat-sw-ext">{sw.ext}</div>
                <p className="stat-sw-desc">{sw.desc}</p>
                {isSelected && (
                  <div className="stat-sw-selected-check">
                    <CheckCircle2 size={16} color={sw.color} />
                    <span>Terpilih</span>
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Detail Panel & Action Box sesuai Software Terpilih */}
        <div className="stat-action-container">
          {activeSoftware === 'excel' && (
            <div className="stat-format-panel">
              <div className="stat-panel-content">
                <div className="stat-panel-info">
                  <div className="stat-panel-title">
                    <FileSpreadsheet size={18} color="#107C41" />
                    <h4>Ekspor Dataset ke Microsoft Excel (.xlsx / .csv)</h4>
                  </div>
                  <p>
                    File CSV ini dibuat dengan <strong>UTF-8 BOM (\uFEFF)</strong> sehingga karakter huruf, tanda baca Indonesia, dan emoji akan terbaca rapi saat dibuka langsung di Microsoft Excel (Windows & Mac) tanpa teracak.
                  </p>
                  <ul className="stat-feature-list">
                    <li>• Sudah mencakup kolom <code>Teks_Komentar_Asli</code> dan <code>Teks_Bersih_Preprocessed</code>.</li>
                    <li>• Dilengkapi metrik kuantitatif: Jumlah Karakter, Jumlah Kata, Jumlah Balasan, Flag Emoji.</li>
                    <li>• Kode Sentimen Numerik (1: Negatif, 2: Netral, 3: Positif) & Kode Emosi (1-5) siap untuk analisis tabulasi silang.</li>
                  </ul>
                </div>

                <div className="stat-button-group">
                  <button
                    className="btn btn-primary stat-dl-btn"

                    onClick={() => handleDownload('excel')}
                  >
                    <Download size={16} />
                    <span>Unduh File Excel (.csv)</span>
                  </button>
                  <button
                    className="btn btn-white-bordered"
                    onClick={handleCopyTSV}
                    title="Salin tabel untuk ditempel langsung ke Excel / Google Sheets"
                  >
                    {copiedType === 'tsv' ? <Check size={16} color="var(--color-success)" /> : <Copy size={16} />}
                    <span>{copiedType === 'tsv' ? 'Tersalin ke Clipboard!' : 'Salin Tabel (Ctrl+V ke Excel)'}</span>
                  </button>
                </div>
              </div>

              {/* Panduan Singkat Excel */}
              <div className="stat-quick-guide">
                <Info size={15} />
                <span>
                  <strong>Tips Mahasiswa:</strong> Buka Excel &rarr; Klik ganda file <code>.csv</code> hasil unduhan. Jika ingin otomatis membuat diagram pie atau grafik batang untuk Bab 4, sorot kolom <code>Kategori_Sentimen</code> lalu klik <em>Insert &rarr; Recommended Charts</em>.
                </span>
              </div>
            </div>
          )}

          {activeSoftware === 'spss' && (
            <div className="stat-format-panel">
              <div className="stat-panel-content">
                <div className="stat-panel-info">
                  <div className="stat-panel-title">
                    <BarChart3 size={18} color="#0062FF" />
                    <h4>Ekspor IBM SPSS Statistics (Dataset .csv + Sintaks Otomatis .sps)</h4>
                  </div>
                  <p>
                    SPSS membutuhkan format variabel yang ketat (tanpa spasi). Paket ini menyediakan <strong>Dataset Terstandarisasi</strong> serta <strong>File Sintaks (.sps)</strong> otomatis yang langsung mendefinisikan label variabel, label nilai (value labels), uji frekuensi, dan tabulasi silang (Chi-Square) bab 4 skripsi Anda!
                  </p>
                  <ul className="stat-feature-list">
                    <li>• <strong>File 1: <code>dataset_spss.csv</code></strong> &mdash; Variabel: <code>id, is_reply, char_len, word_cnt, reply_cnt, sent_code, emot_code, engage_lvl</code>.</li>
                    <li>• <strong>File 2: <code>syntax_spss.sps</code></strong> &mdash; Sintaks SPSS 1-klik untuk impor, pelabelan, tabel frekuensi, dan uji Chi-Square otomatis.</li>
                  </ul>
                </div>

                <div className="stat-button-group">
                  <button
                    className="btn btn-primary stat-dl-btn"

                    onClick={() => handleDownload('spss_data')}
                  >
                    <Download size={16} />
                    <span>1. Unduh Data SPSS (.csv)</span>
                  </button>
                  <button
                    className="btn btn-white-bordered"
                    onClick={() => handleDownload('spss_syntax')}
                    title="Unduh script sintaks otomatis untuk SPSS"
                  >
                    <Code size={16} color="#0062FF" />
                    <span>2. Unduh Sintaks (.sps)</span>
                  </button>
                  <button
                    className="btn btn-white-bordered"
                    onClick={handleCopySPSSSyntax}
                    title="Salin isi script sintaks SPSS"
                  >
                    {copiedType === 'syntax' ? <Check size={16} color="var(--color-success)" /> : <Copy size={16} />}
                    <span>{copiedType === 'syntax' ? 'Sintaks Tersalin!' : 'Salin Sintaks'}</span>
                  </button>
                </div>
              </div>

              {/* Panduan Singkat SPSS */}
              <div className="stat-quick-guide">
                <Info size={15} />
                <span>
                  <strong>Cara Pakai di SPSS:</strong> Buka IBM SPSS &rarr; Klik menu <em>File &rarr; Open &rarr; Syntax</em> &rarr; Pilih file <code>.sps</code> yang diunduh &rarr; Tekan <code>Ctrl+A</code> lalu klik tombol panah hijau <strong>Run All</strong>. SPSS akan otomatis memuat data, mengatur label variabel, dan mencetak output Bab 4!
                </span>
              </div>
            </div>
          )}

          {activeSoftware === 'smartpls' && (
            <div className="stat-format-panel">
              <div className="stat-panel-content">
                <div className="stat-panel-info">
                  <div className="stat-panel-title">
                    <Layers size={18} color="#F97316" />
                    <h4>Ekspor Matriks Indikator SmartPLS 3 & 4 (PLS-SEM)</h4>
                  </div>
                  <p>
                    SmartPLS mensyaratkan dataset numerik bersih tanpa nilai kosong (missing string). File ini menghasilkan matriks indikator pengukuran untuk pemodelan persamaan struktural (PLS-SEM):
                  </p>
                  <div className="stat-pls-constructs">
                    <div className="stat-pls-item">
                      <strong>Konstruk X1 (Elaborasi Verbal):</strong> <code>CHAR_LEN</code>, <code>WORD_CNT</code>
                    </div>
                    <div className="stat-pls-item">
                      <strong>Konstruk X2 (Intensitas Afektif):</strong> <code>EMOJI_CNT</code>, <code>EXCLAM_CNT</code>, <code>QMARK_CNT</code>
                    </div>
                    <div className="stat-pls-item">
                      <strong>Konstruk Mediasi (Valensi Sentimen):</strong> <code>SENT_CODE</code>, <code>SENT_SCORE</code>
                    </div>
                    <div className="stat-pls-item">
                      <strong>Konstruk Y (Tingkat Keterlibatan/eWOM):</strong> <code>REPLY_CNT</code>, <code>ENGAGE_LVL</code>
                    </div>
                  </div>
                </div>

                <div className="stat-button-group">
                  <button
                    className="btn btn-primary stat-dl-btn"

                    onClick={() => handleDownload('smartpls')}
                  >
                    <Download size={16} />
                    <span>Unduh Matriks SmartPLS (.csv)</span>
                  </button>
                </div>
              </div>

              {/* Panduan Singkat SmartPLS */}
              <div className="stat-quick-guide">
                <Info size={15} />
                <span>
                  <strong>Cara Import ke SmartPLS:</strong> Buka SmartPLS &rarr; <em>Create New Project</em> &rarr; Klik ganda <em>"Import Data File"</em> &rarr; Pilih file CSV ini &rarr; Tarik indikator ke diagram jalur PLS untuk uji Outer Model (validitas konvergen, reliabilitas komposit) & Inner Model (R-Square & Path Coefficients).
                </span>
              </div>
            </div>
          )}

          {activeSoftware === 'jasp' && (
            <div className="stat-format-panel">
              <div className="stat-panel-content">
                <div className="stat-panel-info">
                  <div className="stat-panel-title">
                    <Database size={18} color="#7C3AED" />
                    <h4>Ekspor JASP (Free Open-Source Statistical Package)</h4>
                  </div>
                  <p>
                    JASP adalah alternatif gratis dan resmi dari Universitas Amsterdam yang sangat populer untuk skripsi karena bebas lisensi berbayar. Dataset ini disusun dengan tipe data variabel yang langsung dikenali JASP:
                  </p>
                  <ul className="stat-feature-list">
                    <li>• <strong>Skala Ordinal/Nominal:</strong> <code>Comment_Type</code>, <code>Sentiment_Label</code>, <code>Emotion_Label</code>, <code>Engagement_Level</code>.</li>
                    <li>• <strong>Skala Rasio/Kontinu:</strong> <code>Character_Length</code>, <code>Word_Count</code>, <code>Reply_Count</code>, <code>Sentiment_Score</code>.</li>
                    <li>• Siap 1-klik untuk <em>Descriptives</em>, <em>Independent Samples T-Test</em> (uji beda panjang kata sentimen positif vs negatif), dan <em>Contingency Tables (Chi-Square)</em>.</li>
                  </ul>
                </div>

                <div className="stat-button-group">
                  <button
                    className="btn btn-primary stat-dl-btn"

                    onClick={() => handleDownload('jasp')}
                  >
                    <Download size={16} />
                    <span>Unduh Dataset JASP (.csv)</span>
                  </button>
                </div>
              </div>

              {/* Panduan Singkat JASP */}
              <div className="stat-quick-guide">
                <Info size={15} />
                <span>
                  <strong>Cara Pakai di JASP:</strong> Buka software JASP &rarr; Klik menu <em>Open &rarr; Computer &rarr; Browse</em> &rarr; Pilih file <code>.csv</code> ini &rarr; Pilih menu <em>Descriptives</em> atau <em>T-Tests</em> di bilah atas untuk melihat tabel APA dan plot distribusi instan!
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Live Data Preview Section (5 Baris Pertama) */}
        <div className="stat-preview-section">
          <div className="stat-preview-header">
            <div className="stat-preview-title">
              <Sparkles size={15} color="var(--color-primary)" />
              <span>Pratinjau Data Sampel (5 Baris Pertama dari {dataset.length} Baris):</span>
            </div>
            <span className="stat-preview-tag">Format: {SOFTWARE_OPTIONS.find((s) => s.id === activeSoftware)?.name}</span>
          </div>

          <div className="stat-table-wrapper">
            <table className="stat-preview-table">
              <thead>
                {activeSoftware === 'smartpls' ? (
                  <tr>
                    <th>ID</th>
                    <th>IS_REPLY</th>
                    <th>CHAR_LEN</th>
                    <th>WORD_CNT</th>
                    <th>REPLY_CNT</th>
                    <th>EMOJI_CNT</th>
                    <th>SENT_CODE</th>
                    <th>SENT_SCORE</th>
                    <th>EMOT_CODE</th>
                    <th>ENGAGE_LVL</th>
                  </tr>
                ) : activeSoftware === 'spss' ? (
                  <tr>
                    <th>id</th>
                    <th>is_reply</th>
                    <th>sent_code</th>
                    <th>sent_label</th>
                    <th>emot_label</th>
                    <th>char_len</th>
                    <th>word_cnt</th>
                    <th>reply_cnt</th>
                    <th>user_handle</th>
                    <th>comment_text</th>
                  </tr>
                ) : (
                  <tr>
                    <th>No</th>
                    <th>Tipe</th>
                    <th>Username</th>
                    <th>Teks Komentar</th>
                    <th>Sentimen</th>
                    <th>Emosi</th>
                    <th>Karakter</th>
                    <th>Kata</th>
                    <th>Balasan</th>
                    <th>Interaksi</th>
                  </tr>
                )}
              </thead>
              <tbody>
                {dataset.slice(0, 5).map((row) => {
                  if (activeSoftware === 'smartpls') {
                    return (
                      <tr key={row.id}>
                        <td>{row.id}</td>
                        <td>{row.is_reply}</td>
                        <td>{row.char_len}</td>
                        <td>{row.word_cnt}</td>
                        <td>{row.reply_cnt}</td>
                        <td>{row.emoji_cnt}</td>
                        <td>
                          <span className={`stat-pill-sm sent-${row.sent_code}`}>
                            {row.sent_code}
                          </span>
                        </td>
                        <td>{row.sent_score}</td>
                        <td>{row.emot_code}</td>
                        <td>{row.engage_lvl}</td>
                      </tr>
                    );
                  }

                  if (activeSoftware === 'spss') {
                    return (
                      <tr key={row.id}>
                        <td>{row.id}</td>
                        <td>{row.is_reply === 1 ? 'Balasan (1)' : 'Utama (0)'}</td>
                        <td>{row.sent_code}</td>
                        <td>
                          <span className={`stat-pill-sm sent-${row.sent_code}`}>
                            {row.sent_label}
                          </span>
                        </td>
                        <td>{row.emot_label}</td>
                        <td>{row.char_len}</td>
                        <td>{row.word_cnt}</td>
                        <td>{row.reply_cnt}</td>
                        <td>@{row.username}</td>
                        <td className="comment-cell-preview">{row.raw_comment}</td>
                      </tr>
                    );
                  }

                  return (
                    <tr key={row.id}>
                      <td>{row.id}</td>
                      <td>
                        <span className={`type-tag ${row.is_reply ? 'reply' : 'main'}`}>
                          {row.comment_type}
                        </span>
                      </td>
                      <td>@{row.username}</td>
                      <td className="comment-cell-preview">{row.raw_comment}</td>
                      <td>
                        <span className={`stat-pill-sm sent-${row.sent_code}`}>
                          {row.sent_label}
                        </span>
                      </td>
                      <td>
                        <span className="stat-pill-sm emot">
                          {row.emot_label}
                        </span>
                      </td>
                      <td>{row.char_len}</td>
                      <td>{row.word_cnt}</td>
                      <td>{row.reply_cnt}</td>
                      <td>
                        <span className={`engage-pill lvl-${row.engage_lvl}`}>
                          {row.engage_lvl === 3 ? 'Tinggi' : row.engage_lvl === 2 ? 'Sedang' : 'Rendah'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal Footer */}
      <div className="stat-modal-footer">
          <div className="stat-footer-left">
            <span>Social Scraper Hub v2.1 &bull; Modul Olah Data Statistik Skripsi</span>
          </div>
          <button className="btn btn-white-bordered" onClick={onClose}>
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
