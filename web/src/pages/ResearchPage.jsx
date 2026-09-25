import React, { useEffect, useRef, useState } from 'react';
import DatasetSwitcher from '../components/DatasetSwitcher';
import { API_BASE, FRAMEWORK_CATEGORIES, FRAMEWORKS_LIST } from '../constants/frameworks';
import { METHODS, requestResearch, selectResearchTitle, selectResearchTheory } from '../utils/researchContext';
import './research.css';

export default function ResearchPage({ kind, files, selectedFile, data, loading, loadFileContent, state, onChange, onSave, switchTab, onUseFramework }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const controller = useRef(null);
  const draft = state.draft;
  const result = state.results?.[kind];
  const titles = kind === 'titles';
  useEffect(() => () => controller.current?.abort(), []);
  const edit = (patch) => onChange({ ...state, draft: { ...draft, ...patch } });
  const save = async (next) => {
    setError(''); setNotice('');
    onChange(next);
    try { await onSave(next); setNotice('Konteks penelitian tersimpan.'); }
    catch { setError('Pilihan aktif pada sesi ini, tetapi gagal disimpan ke akun. Klik Simpan konteks untuk mencoba kembali.'); }
  };
  const chooseTheory = (card, goToTitles = false) => {
    const next = selectResearchTheory(state, card);
    save(next);
    if (card.framework_id) onUseFramework(card.framework_id);
    if (goToTitles) switchTab('research-titles');
  };
  const generate = async () => {
    if (busy || loading || !selectedFile || !data?.comments?.length) return;
    setBusy(true); setError(''); setNotice('');
    controller.current = new AbortController();
    const signal = controller.current.signal;
    const timeout = setTimeout(() => controller.current?.abort(), 180000);
    try {
      const framework = FRAMEWORKS_LIST.find(f => f.id === draft.framework_id);
      const response = await requestResearch(API_BASE, {
        kind, filename: selectedFile, dataset: data,
        context: { ...draft, department: FRAMEWORK_CATEGORIES.find(c => c.id === draft.department)?.label || draft.department, theory: draft.theory || framework?.theory || '' },
        previous_titles: result?.items?.map(c => c.title).filter(Boolean) || [],
      }, signal);
      if (!signal.aborted) onChange(prev => ({ ...prev, results: { ...prev.results, [kind]: { ...response, input: { ...draft } } } }));
    } catch (e) {
      if (signal.aborted) setError('Permintaan dihentikan atau melewati batas waktu. Silakan coba kembali.');
      else setError(e.message || 'Koneksi gagal. Silakan coba kembali.');
    } finally { clearTimeout(timeout); setBusy(false); }
  };
  return <section className="research-page">
    <header><span className="section-kicker">RANCANGAN PENELITIAN</span><h1>{titles ? 'Generator Ide Judul Skripsi' : 'Rekomendasi Teori Penelitian'}</h1>
      <p>Susun rancangan berdasarkan komentar pada dataset penelitian Anda.</p></header>
    <nav className="research-actions" aria-label="Fitur rancangan penelitian">
      <button aria-current={titles ? 'page' : undefined} onClick={() => switchTab('research-titles')}>Generator Ide Judul Skripsi</button>
      <button aria-current={!titles ? 'page' : undefined} onClick={() => switchTab('research-theories')}>Rekomendasi Teori Penelitian</button>
    </nav>
    <DatasetSwitcher files={files} selectedFile={selectedFile} data={data} onSelectDataset={loadFileContent} />
    {(state.selectedTitle || state.selectedTheory) && <aside className="research-context">
      <strong>Konteks penelitian aktif</strong><p>Judul: {state.selectedTitle || 'Belum dipilih'}</p><p>Teori: {state.selectedTheory?.name || 'Belum dipilih'}</p>
      {state.selectedTheory && !state.selectedTheory.framework_id && <p>Teori ini belum memiliki implementasi analisis otomatis. Kerangka analisis yang tersedia perlu dipilih secara terpisah.</p>}
      <button onClick={() => switchTab('ai-analysis')}>Lanjut ke Analisis Komentar</button>
    </aside>}
    <form className="research-form" onSubmit={e => { e.preventDefault(); generate(); }}>
      <fieldset disabled={busy || loading || !selectedFile}>
        <div className="research-grid">
          <label>Jurusan / Bidang Penelitian<select value={draft.department} onChange={e => edit({ department: e.target.value })}>{FRAMEWORK_CATEGORIES.filter(c => c.id !== 'all').map(c => <option key={c.id} value={c.id}>{c.label}</option>)}</select></label>
          <label>Metode Penelitian<select value={draft.method} onChange={e => edit({ method: e.target.value })}>{METHODS.map(m => <option key={m}>{m}</option>)}</select></label>
          <label>Kerangka Analisis<select value={draft.framework_id} onChange={e => edit({ framework_id: e.target.value, theory: '' })}>
            <option value="">Belum dipilih / teori di luar sistem</option>{FRAMEWORKS_LIST.map(f => <option key={f.id} value={f.id}>{f.title}</option>)}</select></label>
          <label>Fokus Penelitian (opsional)<input maxLength={1500} value={draft.focus} onChange={e => edit({ focus: e.target.value })} placeholder="Contoh: persepsi publik, identitas sosial" /></label>
          {!titles && <label className="research-wide">Judul penelitian (opsional)<textarea maxLength={1500} value={draft.title} onChange={e => edit({ title: e.target.value })} placeholder="Masukkan topik/judul atau mulai dari dataset" /></label>}
        </div>
        <p>Kerangka teori: {draft.theory || FRAMEWORKS_LIST.find(f => f.id === draft.framework_id)?.theory || 'Belum dipilih'}</p>
        <div className="research-actions"><button type="submit" className="research-primary" disabled={!data?.comments?.length}>{titles ? (result ? 'Generate Ulang' : 'Generate Ide Judul') : 'Cari Rekomendasi Teori'}</button>
          <button type="button" onClick={() => save({ ...state, selectedTitle: draft.title.trim() })}>Simpan konteks</button>
          {titles && <button type="button" onClick={() => switchTab('research-theories')}>Minta Rekomendasi Teori</button>}</div>
      </fieldset>
    </form>
    {loading && <p role="status">Memuat dataset…</p>}
    {!selectedFile && <p className="research-empty">Pilih atau unggah dataset melalui Koleksi Dataset untuk memulai.</p>}
    {selectedFile && !loading && !data?.comments?.length && <p className="research-empty">Dataset belum tersedia atau tidak memiliki komentar. Pilih dataset berisi teks komentar.</p>}
    {busy && <p role="status" className="research-context">AI sedang menelaah dataset dan menyusun {titles ? 'alternatif judul' : 'rekomendasi teori'}…</p>}
    {error && <p role="alert" className="research-error">{error}</p>}
    {notice && <p role="status">{notice}</p>}
    {!result && !busy && <p className="research-empty">Belum ada hasil. Sesuaikan formulir lalu jalankan {titles ? 'generator judul' : 'pencarian teori'}.</p>}
    {result && <>
      <aside className="research-context"><strong>Cakupan hasil</strong><p>{result.coverage.sampled} dari {result.coverage.total} teks komentar/balasan; {result.coverage.truncated} teks dipotong untuk konteks AI.</p>
        <p>{result.coverage.strategy}</p><p>{result.coverage.limitations}</p><p>{result.limitations}</p>
        <p>Hasil untuk {result.context.department} · {result.context.method} · Fokus: {result.context.focus || 'Umum'}. Perubahan formulir berlaku setelah generasi berikutnya.</p>
        {!titles && <p>Rekomendasi dibatasi pada katalog akademis terverifikasi. Belum mencakup semua teori; relevansi dan indikator AI perlu ditinjau bersama pembimbing.</p>}</aside>
      <div className="research-results">{result.items.map((card, index) => <article className="research-card" key={card.title || card.theory_id}>
        <span className="section-kicker">{titles ? 'IDE' : 'TEORI'} {index + 1}</span><h2>{titles ? card.title : card.name}</h2>
        {titles ? <>
          <p>{card.department} · {card.method}</p><p><strong>Teori:</strong> {card.theory}</p><p><strong>Fokus:</strong> {card.focus}</p><p>{card.rationale}</p>
          <p><strong>Data tersedia:</strong> {card.data_available}</p><p><strong>Data tambahan:</strong> {card.data_needed}</p>
          <details><summary>Lihat Detail</summary><h3>Rumusan masalah</h3><p>{card.question}</p><h3>Tujuan penelitian</h3><p>{card.objective}</p><h3>Pendekatan analisis</h3><p>{card.approach}</p></details>
          <div className="research-actions"><button onClick={async () => { try { await navigator.clipboard.writeText(card.title); setNotice('Judul disalin.'); } catch { setError('Clipboard tidak tersedia. Salin teks judul secara manual.'); } }}>Salin Judul</button>
            <button onClick={() => save(selectResearchTitle({ ...state, draft: { ...state.draft, ...result.input } }, card))}>{state.selectedTitle === card.title ? 'Judul Dipilih' : 'Gunakan Judul'}</button>
            <button onClick={() => { onChange({ ...state, draft: { ...state.draft, ...result.input, title: card.title, method: card.method, focus: card.focus } }); switchTab('research-theories'); }}>Cari Teori yang Relevan</button></div>
        </> : <>
          <p>{card.author}</p><p>{card.explanation}</p><h3>Relevansi dengan penelitian</h3><p>{card.relevance}</p>
          <h3>Konsep / dimensi teori</h3><ul>{card.dimensions.map(d => <li key={d}>{d}</li>)}</ul>
          <h3>Indikator operasional usulan</h3><p>{card.indicators}</p>
          <details><summary>Lihat Detail Teori</summary><h3>Contoh penerapan</h3><p>{card.application}</p>
            {card.quote && <><blockquote>{card.quote}</blockquote><small>Komentar asli #{card.quote_id} pada dataset aktif.</small></>}
            <h3>Batas penerapan</h3><p>{card.limitations}</p></details>
          <p><a href={card.url} target="_blank" rel="noreferrer">{card.reference}</a></p><small>{card.verification}</small>
          <p>{card.framework_id ? `Terhubung ke kerangka: ${FRAMEWORKS_LIST.find(f => f.id === card.framework_id)?.title || card.framework_id}. Kerangka dapat mencakup beberapa teori.` : 'Belum tersedia implementasi analisis otomatis untuk teori ini.'}</p>
          <div className="research-actions"><button onClick={() => chooseTheory(card)}>{state.selectedTheory?.theory_id === card.theory_id ? 'Teori Dipilih' : 'Gunakan Teori'}</button><button onClick={() => chooseTheory(card, true)}>Gunakan untuk Generator Judul</button></div>
        </>}
      </article>)}</div>
    </>}
  </section>;
}
