import React, { useMemo, useState } from 'react';
import { History, ArrowUpRight, Search } from 'lucide-react';
import { collectAiHistory } from '../utils/aiHistory';
import { FRAMEWORKS_LIST } from '../constants/frameworks';
import './ai-history.css';

export default function AiHistory({ files, kind, selectedFile, onOpen, loading = false, error = '', onRefresh, disabled = false, openedId = '' }) {
  const [query, setQuery] = useState('');
  const [scope, setScope] = useState('all');
  const [expanded, setExpanded] = useState(false);
  const entries = useMemo(() => collectAiHistory(files, kind, FRAMEWORKS_LIST), [files, kind]);
  const filtered = entries.filter(entry => (scope === 'all' || entry.filename === selectedFile) &&
    `${entry.caption} ${entry.filename} ${entry.title} ${entry.summary}`.toLowerCase().includes(query.toLowerCase()));
  return <section className="ai-history" aria-label="Riwayat hasil AI">
    <div className="ai-history-heading"><div><h2><History size={20} /> Hasil AI Tersimpan <span>{entries.length}</span></h2>
      <p>Buka kembali hasil tanpa menjalankan AI ulang. Menampilkan hasil terakhir per dataset dan jenis analisis.</p></div>
      {onRefresh && <button type="button" onClick={onRefresh} disabled={loading || disabled}>Muat ulang riwayat</button>}</div>
    <div className="ai-history-filters"><label><Search size={16} /><input aria-label="Cari hasil AI tersimpan" placeholder="Cari dataset, judul, atau teori…" value={query} onChange={e => { setQuery(e.target.value); setExpanded(false); }} /></label>
      <select aria-label="Cakupan riwayat AI" value={scope} onChange={e => { setScope(e.target.value); setExpanded(false); }}><option value="all">Semua dataset</option><option value="active">Dataset aktif</option></select></div>
    {loading && <p role="status">Memuat riwayat hasil AI…</p>}
    {error && <p role="alert" className="ai-history-error">{error}</p>}
    {!loading && !error && !filtered.length && <p className="ai-history-empty">{entries.length ? 'Tidak ada hasil yang sesuai pencarian atau dataset ini.' : 'Belum ada hasil AI tersimpan. Hasil yang berhasil diproses akan muncul di sini.'}</p>}
    <div className="ai-history-grid">{(expanded ? filtered : filtered.slice(0, 6)).map(entry => <article key={entry.id} className={`ai-history-card ${entry.id === openedId ? 'is-open' : ''}`}>
      <div className="ai-history-meta"><span>{entry.filename === selectedFile ? 'Dataset aktif' : 'Dataset lain'}</span><span>{entry.id === openedId ? 'Sedang dibuka' : 'Tersimpan'}</span></div>
      <h3 title={entry.caption}>{entry.caption}</h3><strong>{entry.title}</strong><p className="ai-history-summary">{entry.summary}</p>
      <small>{entry.count != null && `${entry.count} ${kind === 'analysis' ? 'komentar dianalisis' : kind === 'titles' ? 'ide judul' : 'teori'} · `}
        {Number.isFinite(Date.parse(entry.updatedAt)) ? <time dateTime={entry.updatedAt}>{new Date(entry.updatedAt).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}</time> : 'Waktu belum tercatat'}</small>
      <button type="button" disabled={disabled || loading} onClick={() => onOpen(entry)} aria-label={`Buka hasil ${entry.title} untuk ${entry.caption}`}>Buka Hasil <ArrowUpRight size={15} /></button>
    </article>)}</div>
    {filtered.length > 6 && <button className="ai-history-more" onClick={() => setExpanded(!expanded)}>{expanded ? 'Tampilkan lebih sedikit' : `Lihat semua ${filtered.length} hasil`}</button>}
  </section>;
}
