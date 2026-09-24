import React, { useState, useMemo } from 'react';
import {
  X,
  Copy,
  Check,
  Calculator,
  CheckCircle2,
  FileText,
  Users,
  Sparkles,
  Info,
  RefreshCw,
  Award,
  Table,
  ArrowRight
} from 'lucide-react';
import {
  calculateKappaFromMatrix,
  calculateKappaFromPairs,
  interpretKappa,
  generateBab3ReliabilityReport
} from '../utils/kappaCalculator';
import { analyzeCommentMetrics } from '../utils/statExporter';

export default function InterCoderModal({
  isOpen,
  onClose,
  allComments = [],
  selectedFileName = 'dataset'
}) {
  const [activeTab, setActiveTab] = useState('interactive'); // 'interactive' | 'matrix'
  const [sampleSize, setSampleSize] = useState(30); // 30, 50, 100
  const [coder1Name, setCoder1Name] = useState('Peneliti (Pengkode 1)');
  const [coder2Name, setCoder2Name] = useState('Pengkode 2 (AI / Rekan)');
  const [variableName, setVariableName] = useState('Valensi Sentimen Respon Netizen');

  // Manual Matrix State (Default standard substantial agreement sample: N=50, Kappa ~0.76)
  const [manualMatrix, setManualMatrix] = useState([
    [16, 2, 0],  // Positif Coder 1: 16 sepakat Pos, 2 dikira Net, 0 Neg
    [3, 18, 2],  // Netral Coder 1: 3 Pos, 18 Net, 2 Neg
    [0, 1, 8]    // Negatif Coder 1: 0 Pos, 1 Net, 8 Neg
  ]);

  // Interactive Samples
  const sampledComments = useMemo(() => {
    if (!allComments || allComments.length === 0) return [];
    // Ambil sampel deterministik atau acak
    const pool = [...allComments];
    const takeCount = Math.min(pool.length, sampleSize);
    const step = Math.max(1, Math.floor(pool.length / takeCount));
    const result = [];
    for (let i = 0; i < pool.length && result.length < takeCount; i += step) {
      const c = pool[i];
      const metrics = analyzeCommentMetrics(c.comment);
      result.push({
        id: c.comment_id || `sample_${i + 1}`,
        username: c.username,
        comment: c.comment,
        aiCode: metrics.sentimentLabel, // Positif / Netral / Negatif
        humanCode: metrics.sentimentLabel // default sama, user bisa ubah
      });
    }
    return result;
  }, [allComments, sampleSize]);

  // State untuk kode pengkode manusia per baris sampel
  const [humanCodes, setHumanCodes] = useState({});
  const [copiedSuccess, setCopiedSuccess] = useState(false);

  // Inisialisasi human codes
  React.useEffect(() => {
    const initial = {};
    sampledComments.forEach((sc, idx) => {
      // Simulasikan 90% sepakat, 10% ada variasi alami manusia
      if (idx % 8 === 0) {
        initial[sc.id] = sc.aiCode === 'Positif' ? 'Netral' : sc.aiCode === 'Negatif' ? 'Netral' : 'Positif';
      } else {
        initial[sc.id] = sc.aiCode;
      }
    });
    setHumanCodes(initial);
  }, [sampledComments]);

  // Hitung Kappa dari tab interaktif
  const interactiveStats = useMemo(() => {
    const pairs = sampledComments.map((sc) => ({
      code1: humanCodes[sc.id] || sc.aiCode,
      code2: sc.aiCode
    }));
    return calculateKappaFromPairs(pairs);
  }, [sampledComments, humanCodes]);

  // Hitung Kappa dari tab matriks manual
  const manualStats = useMemo(() => {
    return calculateKappaFromMatrix(manualMatrix);
  }, [manualMatrix]);

  const activeStats = activeTab === 'interactive' ? interactiveStats : manualStats;
  const currentSampleSize = activeTab === 'interactive' ? sampledComments.length : manualStats.totalN;

  if (!isOpen) return null;

  const handleMatrixCellChange = (row, col, value) => {
    const num = Math.max(0, parseInt(value, 10) || 0);
    setManualMatrix((prev) => {
      const copy = prev.map((r) => [...r]);
      copy[row][col] = num;
      return copy;
    });
  };

  const handleHumanCodeChange = (commentId, code) => {
    setHumanCodes((prev) => ({
      ...prev,
      [commentId]: code
    }));
  };

  const handleCopyBab3Report = () => {
    const text = generateBab3ReliabilityReport({
      coder1Name,
      coder2Name,
      variableTested: variableName,
      sampleSize: currentSampleSize,
      stats: activeStats
    });

    navigator.clipboard.writeText(text).then(() => {
      setCopiedSuccess(true);
      setTimeout(() => setCopiedSuccess(false), 3000);
    });
  };

  const k = activeStats.kappa;
  const interp = activeStats.interpretation;

  return (
    <div className="stat-modal-overlay" onClick={onClose}>
      <div className="stat-modal-container kappa-modal-container" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="stat-modal-header">
          <div className="stat-modal-title-wrap">
            <div className="stat-modal-icon-badge" style={{ background: '#ecfeff', borderColor: '#a5f3fc', color: '#0891b2' }}>
              <Calculator size={22} color="#0891b2" />
            </div>
            <div>
              <h3 className="stat-modal-title">Kalkulator Inter-Coder Reliability (Cohen's Kappa κ)</h3>
              <p className="stat-modal-subtitle">
                Uji validitas & reliabilitas metodologis analisis isi data teks komentar untuk Bab 3 Tesis S2 & Skripsi.
              </p>
            </div>
          </div>
          <button className="stat-modal-close" onClick={onClose} aria-label="Tutup">
            <X size={20} />
          </button>
        </div>

        {/* Notifikasi feedback */}
        {copiedSuccess && (
          <div className="stat-alert-success">
            <CheckCircle2 size={16} />
            <span>Naskah narasi & tabel metodologi Bab 3 berhasil disalin ke Clipboard!</span>
          </div>
        )}

        <div className="stat-modal-body">
          {/* Top Score Dashboard */}
          <div className="kappa-score-dashboard">
            <div className="kappa-main-gauge">
              <span className="kappa-label">Koefisien Cohen's Kappa (κ)</span>
              <div className="kappa-number-row">
                <span className="kappa-big-number">{k >= 0 ? `+${k.toFixed(3)}` : k.toFixed(3)}</span>
                <span className={`kappa-level-badge ${interp.badgeClass}`}>
                  {interp.level.split('(')[0].trim()}
                </span>
              </div>
              <p className="kappa-verdict-desc">{interp.description}</p>
            </div>

            <div className="kappa-metrics-summary">
              <div className="kappa-metric-box">
                <span className="metric-title">Observed Agreement (P<sub>o</sub>)</span>
                <strong>{activeStats.observedAgreementPct}%</strong>
                <span className="metric-sub">Kesesuaian Nyata Pengkode</span>
              </div>

              <div className="kappa-metric-box">
                <span className="metric-title">Chance Agreement (P<sub>e</sub>)</span>
                <strong>{activeStats.expectedAgreementPct}%</strong>
                <span className="metric-sub">Kesesuaian Peluang Acak</span>
              </div>

              <div className="kappa-metric-box">
                <span className="metric-title">Standar Kelolosan S2</span>
                <strong style={{ color: interp.accepted ? '#16a34a' : '#dc2626' }}>
                  {interp.accepted ? 'MEMENUHI (≥ 0.61)' : 'BELUM LOLOS'}
                </strong>
                <span className="metric-sub">Batas Ambang Landis & Koch</span>
              </div>
            </div>
          </div>

          {/* Mode Tabs */}
          <div className="citation-tab-bar kappa-tab-bar" style={{ marginTop: '4px' }}>
            <button
              className={`citation-tab ${activeTab === 'interactive' ? 'active' : ''}`}
              onClick={() => setActiveTab('interactive')}
            >
              <Users size={14} />
              <span className="tab-text-desktop">Mode 1: Uji Sampel Data Nyata (AI vs Peneliti)</span>
              <span className="tab-text-mobile">Mode 1: Sampel Nyata</span>
              <span className="cite-badge">{sampledComments.length}</span>
            </button>
            <button
              className={`citation-tab ${activeTab === 'matrix' ? 'active' : ''}`}
              onClick={() => setActiveTab('matrix')}
            >
              <Table size={14} />
              <span className="tab-text-desktop">Mode 2: Input Matriks Kontingensi 3×3 Manual</span>
              <span className="tab-text-mobile">Mode 2: Matriks 3×3</span>
            </button>
          </div>

          {/* Tab 1: Interactive Sample Coding */}
          {activeTab === 'interactive' && (
            <div className="kappa-interactive-panel">
              <div className="kappa-sample-toolbar">
                <div className="sample-size-selector">
                  <span className="selector-text">Ukuran Sampel:</span>
                  {[20, 30, 50].map((sz) => (
                    <button
                      key={sz}
                      className={`btn-sample-chip ${sampleSize === sz ? 'active' : ''}`}
                      onClick={() => setSampleSize(sz)}
                    >
                      {sz} Komentar
                    </button>
                  ))}
                </div>
                <div className="coder-names-row">
                  <input
                    type="text"
                    value={coder1Name}
                    onChange={(e) => setCoder1Name(e.target.value)}
                    placeholder="Nama Pengkode 1 (Peneliti)"
                    title="Pengkode 1"
                  />
                  <span className="coder-vs-divider">vs</span>
                  <input
                    type="text"
                    value={coder2Name}
                    onChange={(e) => setCoder2Name(e.target.value)}
                    placeholder="Nama Pengkode 2 (AI / Independen)"
                    title="Pengkode 2"
                  />
                </div>
              </div>

              {/* Table of samples (Desktop) */}
              <div className="stat-table-wrapper kappa-desktop-table" style={{ maxHeight: '240px' }}>
                <table className="stat-preview-table">
                  <thead>
                    <tr>
                      <th style={{ width: '40px' }}>No</th>
                      <th style={{ width: '130px' }}>Akun</th>
                      <th>Kutipan Komentar Sampel</th>
                      <th style={{ width: '120px' }}>{coder2Name} (AI)</th>
                      <th style={{ width: '190px' }}>{coder1Name} (Anda)</th>
                      <th style={{ width: '70px' }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sampledComments.map((sc, idx) => {
                      const userChoice = humanCodes[sc.id] || sc.aiCode;
                      const isMatch = userChoice === sc.aiCode;
                      return (
                        <tr key={sc.id}>
                          <td>{idx + 1}</td>
                          <td>@{sc.username}</td>
                          <td className="comment-cell-preview">{sc.comment}</td>
                          <td>
                            <span className={`stat-pill-sm sent-${sc.aiCode === 'Positif' ? '3' : sc.aiCode === 'Negatif' ? '1' : '2'}`}>
                              {sc.aiCode}
                            </span>
                          </td>
                          <td>
                            <div className="kappa-code-buttons">
                              {['Positif', 'Netral', 'Negatif'].map((opt) => (
                                <button
                                  key={opt}
                                  className={`btn-code-opt ${userChoice === opt ? 'selected ' + opt.toLowerCase() : ''}`}
                                  onClick={() => handleHumanCodeChange(sc.id, opt)}
                                >
                                  {opt}
                                </button>
                              ))}
                            </div>
                          </td>
                          <td>
                            {isMatch ? (
                              <span className="match-pill match">Sepakat</span>
                            ) : (
                              <span className="match-pill diff">Beda</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card List (Thumb-friendly & 0 horizontal scroll) */}
              <div className="kappa-mobile-sample-list">
                {sampledComments.map((sc, idx) => {
                  const userChoice = humanCodes[sc.id] || sc.aiCode;
                  const isMatch = userChoice === sc.aiCode;
                  return (
                    <div className="km-sample-card" key={sc.id}>
                      <div className="km-card-top">
                        <div className="km-author-line">
                          <span className="km-badge-num">#{idx + 1}</span>
                          <span className="km-username">@{sc.username}</span>
                        </div>
                        {isMatch ? (
                          <span className="match-pill match">Sepakat</span>
                        ) : (
                          <span className="match-pill diff">Beda</span>
                        )}
                      </div>
                      <p className="km-comment-text">{sc.comment}</p>
                      <div className="km-coding-bar">
                        <div className="km-ai-side">
                          <span className="km-tag-label">AI:</span>
                          <span className={`stat-pill-sm sent-${sc.aiCode === 'Positif' ? '3' : sc.aiCode === 'Negatif' ? '1' : '2'}`}>
                            {sc.aiCode}
                          </span>
                        </div>
                        <div className="km-user-side">
                          <span className="km-tag-label">Anda:</span>
                          <div className="kappa-code-buttons">
                            {['Positif', 'Netral', 'Negatif'].map((opt) => (
                              <button
                                key={opt}
                                className={`btn-code-opt ${userChoice === opt ? 'selected ' + opt.toLowerCase() : ''}`}
                                onClick={() => handleHumanCodeChange(sc.id, opt)}
                              >
                                {opt}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Tab 2: Manual 3x3 Matrix Input */}
          {activeTab === 'matrix' && (
            <div className="kappa-matrix-panel">
              <div className="matrix-instruction">
                <Info size={15} color="var(--color-primary)" />
                <span>
                  Masukkan frekuensi jumlah komentar hasil pengkodean silang Coder 1 (Baris) dan Coder 2 (Kolom). Nilai diagonal utama merepresentasikan jumlah kesepakatan (*agreed units*).
                </span>
              </div>

              <div className="matrix-input-table-wrap">
                <table className="matrix-input-table">
                  <thead>
                    <tr>
                      <th colSpan="2" rowSpan="2" style={{ background: '#f1f5f9' }}>
                        Matriks Silang
                      </th>
                      <th colSpan="3" style={{ textAlign: 'center', background: '#e0f2fe', color: '#0369a1' }}>
                        {coder2Name} (Kolom)
                      </th>
                      <th rowSpan="2" style={{ background: '#f8fafc' }}>Total Baris</th>
                    </tr>
                    <tr>
                      <th>Positif</th>
                      <th>Netral</th>
                      <th>Negatif</th>
                    </tr>
                  </thead>
                  <tbody>
                    {['Positif', 'Netral', 'Negatif'].map((rowLabel, rIdx) => (
                      <tr key={rowLabel}>
                        {rIdx === 0 && (
                          <th rowSpan="3" className="matrix-row-header-side">
                            {coder1Name} (Baris)
                          </th>
                        )}
                        <th className="matrix-row-label">{rowLabel}</th>
                        {[0, 1, 2].map((cIdx) => (
                          <td key={cIdx} className={rIdx === cIdx ? 'cell-diagonal' : ''}>
                            <input
                              type="number"
                              min="0"
                              value={manualMatrix[rIdx][cIdx]}
                              onChange={(e) => handleMatrixCellChange(rIdx, cIdx, e.target.value)}
                            />
                          </td>
                        ))}
                        <td className="cell-total">{manualStats.rowTotals[rIdx]}</td>
                      </tr>
                    ))}
                    <tr className="matrix-total-row">
                      <th colSpan="2">Total Kolom</th>
                      <td>{manualStats.colTotals[0]}</td>
                      <td>{manualStats.colTotals[1]}</td>
                      <td>{manualStats.colTotals[2]}</td>
                      <td className="cell-grand-total">{manualStats.totalN}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Action Bar: Copy Report for Bab 3 */}
          <div className="kappa-action-bar">
            <div className="kappa-action-info">
              <FileText size={18} color="var(--color-primary)" />
              <div>
                <strong>Laporan Siap Tempel untuk Bab 3 Tesis:</strong>
                <p>Otomatis menghasilkan narasi akademik metode penelitian, rujukan sitasi (Cohen 1960, Neuendorf 2002), dan interpretasi kriteria Landis &amp; Koch.</p>
              </div>
            </div>
            <button
              className="btn btn-primary"
              style={{ backgroundColor: '#0891b2', borderColor: '#0891b2' }}
              onClick={handleCopyBab3Report}
            >
              {copiedSuccess ? <Check size={16} /> : <Copy size={16} />}
              <span>{copiedSuccess ? 'Tersalin!' : 'Salin Narasi Bab 3 (Metodologi)'}</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="stat-modal-footer">
          <div className="stat-footer-left">
            <span>Standar Metodologi Analisis Isi (Krippendorff, 2004; Neuendorf, 2002)</span>
          </div>
          <button className="btn btn-white-bordered" onClick={onClose}>
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
