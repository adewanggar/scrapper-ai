import { test, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { emptyResearch, restoreResearch, selectResearchTitle, selectResearchTheory, requestResearch } from './researchContext.js';

const originalFetch = globalThis.fetch;
afterEach(() => { globalThis.fetch = originalFetch; });

test('title to theory to title preserves shared research context and explicit selections', () => {
  const initial = emptyResearch('psikologi', 'social_psychology');
  const title = { title: 'Identitas dalam komentar', method: 'Kualitatif', focus: 'Identitas sosial' };
  const chosen = selectResearchTitle(initial, title);
  assert.equal(initial.selectedTitle, '');
  const theory = { name: 'Framing', theory_id: 'framing', framework_id: 'entman_framing' };
  const next = selectResearchTheory(chosen, theory);
  assert.equal(next.selectedTitle, title.title);
  assert.equal(next.draft.title, title.title);
  assert.equal(next.draft.method, title.method);
  assert.equal(next.draft.department, 'psikologi');
  assert.equal(next.draft.framework_id, 'entman_framing');
  const restored = restoreResearch(JSON.parse(JSON.stringify(next)));
  assert.equal(restored.selectedTitle, title.title);
  assert.equal(restored.selectedTheory.name, 'Framing');
});

test('external theory carries context without pretending to have an implementation', () => {
  const next = selectResearchTheory(emptyResearch(), { name: 'Agenda Setting', framework_id: null });
  assert.equal(next.draft.framework_id, '');
  assert.equal(next.draft.theory, 'Agenda Setting');
});

test('form edits and separate datasets do not implicitly select title or theory', () => {
  const a = emptyResearch();
  const b = emptyResearch();
  a.draft.title = 'Judul yang baru dieksplorasi';
  assert.equal(a.selectedTitle, '');
  assert.equal(b.draft.title, '');
  assert.equal(b.selectedTheory, null);
});

test('invalid persisted context falls back safely', () => {
  assert.equal(restoreResearch(null).draft.method, 'Belum menentukan metode');
  assert.equal(restoreResearch({ draft: { method: 'invalid', title: {} } }).draft.title, '');
});

test('sends active cloud dataset and carries abort signal', async () => {
  const payload = { kind: 'titles', filename: 'cloud.json', dataset: { comments: [{ comment: 'Asli' }] } };
  const controller = new AbortController();
  globalThis.fetch = async (url, options) => {
    assert.equal(url, '/api/ai/research');
    assert.deepEqual(JSON.parse(options.body), payload);
    assert.equal(options.signal, controller.signal);
    return new Response(JSON.stringify({ ...payload, items: [], coverage: {} }));
  };
  assert.equal((await requestResearch('', payload, controller.signal)).filename, 'cloud.json');
});

test('rejects stale dataset response, malformed JSON, and server failure', async () => {
  const payload = { kind: 'titles', filename: 'current.json' };
  for (const response of [new Response(JSON.stringify({ kind: 'titles', filename: 'old.json', items: [], coverage: {} })), new Response('bad'), new Response('{"error":"AI gagal"}', { status: 502 })]) {
    globalThis.fetch = async () => response;
    await assert.rejects(requestResearch('', payload));
  }
});
