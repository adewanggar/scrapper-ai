import { test, before, after, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';
import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import { createServer } from 'vite';
import { fileURLToPath } from 'node:url';
import { emptyResearch } from '../src/utils/researchContext.js';

let server, ResearchPage, root, dom;
const originalFetch = globalThis.fetch;
before(async () => {
  dom = new JSDOM('<!doctype html><div id="root"></div>', { url: 'http://localhost/' });
  globalThis.window = dom.window;
  globalThis.document = dom.window.document;
  globalThis.HTMLElement = dom.window.HTMLElement;
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
  server = await createServer({ root: fileURLToPath(new URL('..', import.meta.url)), server: { middlewareMode: true }, appType: 'custom' });
  ResearchPage = (await server.ssrLoadModule('/src/pages/ResearchPage.jsx')).default;
});
afterEach(async () => { if (root) await act(() => root.unmount()); root = null; globalThis.fetch = originalFetch; });
after(async () => { await server?.close(); dom?.window.close(); });

const dataset = { caption: 'Layanan kampus', comments: [{ comment: 'Jam buka kurang panjang.' }] };
const titleCard = { title: 'Pembingkaian layanan kampus dalam komentar', method: 'Kualitatif', department: 'Ilmu Komunikasi', theory: 'Framing', focus: 'Layanan', rationale: 'Relevan', data_available: 'Komentar', data_needed: 'Tidak ada', question: 'Bagaimana layanan dibicarakan?', objective: 'Deskripsi', approach: 'Pengodean' };
const theoryCard = { theory_id: 'framing', name: 'Framing', author: 'Entman', framework_id: 'entman_framing', dimensions: ['Define problems'], explanation: 'Penjelasan', relevance: 'Relevan', indicators: 'Usulan kode', application: 'Penerapan', quote: dataset.comments[0].comment, quote_id: '0', limitations: 'Komentator', reference: 'Entman (1993)', url: 'https://doi.org/10.1111/j.1460-2466.1993.tb01304.x', verification: 'Identitas referensi terverifikasi' };
const response = (payload) => new Response(JSON.stringify({ kind: payload.kind, filename: payload.filename, items: payload.kind === 'titles' ? [titleCard] : [theoryCard], context: payload.context, coverage: { sampled: 1, total: 1, truncated: 0, strategy: 'Sistematis', limitations: 'Sampel kecil' }, limitations: 'Terbatas' }));
const button = name => [...document.querySelectorAll('button')].find(b => b.textContent === name);
async function click(name) { const el = button(name); assert.ok(el, `Button ${name}`); await act(async () => el.click()); }

async function mount({ kind = 'titles', empty = false, saveFailure = false } = {}) {
  const store = { selectedFile: empty ? '' : 'a.json', state: emptyResearch(), kind, saves: [], frameworks: [] };
  function Harness() {
    const [file, setFile] = React.useState(store.selectedFile);
    const [mode, setMode] = React.useState(kind);
    const [states, setStates] = React.useState({});
    const current = states[file] || emptyResearch();
    Object.assign(store, { selectedFile: file, state: current, kind: mode, changeFile: setFile });
    return React.createElement(ResearchPage, { key: file + mode, kind: mode,
      files: [{ filename: 'a.json', caption: 'Dataset A' }, { filename: 'b.json', caption: 'Dataset B' }], selectedFile: file,
      data: empty ? null : dataset, loading: false, loadFileContent: setFile, state: current,
      onChange: next => setStates(prev => ({ ...prev, [file]: typeof next === 'function' ? next(prev[file] || emptyResearch()) : next })),
      onSave: async value => { if (saveFailure) throw new Error('offline'); store.saves.push(value); },
      onUseFramework: value => store.frameworks.push(value),
      switchTab: tab => setMode(tab === 'research-theories' ? 'theories' : 'titles'),
    });
  }
  root = createRoot(document.getElementById('root'));
  await act(() => root.render(React.createElement(Harness)));
  return store;
}

test('complete title → theory → title flow, details, save and regeneration', async () => {
  const requests = [];
  globalThis.fetch = async (_url, options) => { const payload = JSON.parse(options.body); requests.push(payload); return response(payload); };
  const store = await mount();
  await click('Generate Ide Judul');
  assert.match(document.body.textContent, /Pembingkaian layanan kampus/);
  assert.ok(document.querySelector('details summary'));
  await click('Gunakan Judul');
  assert.equal(store.state.selectedTitle, titleCard.title);
  await click('Cari Teori yang Relevan');
  assert.equal(store.kind, 'theories');
  assert.equal(document.querySelector('textarea').value, titleCard.title);
  await click('Cari Rekomendasi Teori');
  assert.equal(requests[1].context.title, titleCard.title);
  assert.equal(requests[1].context.method, 'Kualitatif');
  assert.equal(document.querySelector('blockquote').textContent, dataset.comments[0].comment);
  await click('Gunakan untuk Generator Judul');
  assert.equal(store.kind, 'titles');
  assert.equal(store.state.selectedTheory.name, 'Framing');
  assert.deepEqual(store.frameworks, ['entman_framing']);
  await click('Generate Ulang');
  assert.equal(requests[2].context.theory, 'Framing');
  assert.equal(requests[2].previous_titles[0], titleCard.title);
  assert.equal(store.saves.length, 2);
});

test('standalone theory workflow works without selecting a title', async () => {
  globalThis.fetch = async (_url, options) => response(JSON.parse(options.body));
  const store = await mount({ kind: 'theories' });
  await click('Cari Rekomendasi Teori');
  await click('Gunakan Teori');
  assert.equal(store.state.selectedTitle, '');
  assert.equal(store.state.selectedTheory.theory_id, 'framing');
});

test('switching dataset aborts pending generation and rejects late UI update', async () => {
  let finish, signal;
  globalThis.fetch = (_url, options) => { signal = options.signal; return new Promise(resolve => { finish = () => resolve(response(JSON.parse(options.body))); }); };
  const store = await mount();
  await click('Generate Ide Judul');
  assert.match(document.body.textContent, /AI sedang/);
  await act(() => store.changeFile('b.json'));
  assert.equal(signal.aborted, true);
  await act(async () => finish());
  assert.equal(store.selectedFile, 'b.json');
  assert.deepEqual(store.state.results, {});
  assert.doesNotMatch(document.body.textContent, /Pembingkaian layanan kampus/);
});

test('empty datasets, AI failure and persistence failure are visible', async () => {
  await mount({ empty: true });
  assert.equal(button('Generate Ide Judul').disabled, true);
  await act(() => root.unmount()); root = null;
  await mount({ saveFailure: true });
  globalThis.fetch = async () => new Response('{"error":"AI gagal"}', { status: 502 });
  await click('Generate Ide Judul');
  assert.match(document.querySelector('[role="alert"]').textContent, /AI gagal/);
  await click('Simpan konteks');
  assert.match(document.querySelector('[role="alert"]').textContent, /gagal disimpan/);
});
