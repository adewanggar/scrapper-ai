import { test } from 'node:test';
import assert from 'node:assert/strict';
import { collectAiHistory, restoreResearchResults, researchCacheKey } from './aiHistory.js';

const frameworks = [{ id: 'framing', title: 'Framing Entman' }, { id: 'sentiment', title: 'Sentimen' }];
const files = [{ filename: 'a.json', caption: 'Dataset A', analyses: {
  framing: { result: { analysis: { analysis_type: 'framing', result: { theme: 'A' }, sample_analyzed: 50 } }, updatedAt: '2026-09-25T10:00:00Z' },
  research_titles: { result: { kind: 'titles', items: [{ title: 'Judul A' }], input: { focus: 'Fokus A' } }, updatedAt: '2026-09-25T11:00:00Z' },
  research_theories: { result: { kind: 'theories', items: [{ name: 'Framing' }] } },
} }, { filename: 'b.json', analyses: {
  sentiment: { result: { analysis_type: 'sentiment', result: { score: 5 } }, updatedAt: '2026-09-26T10:00:00Z' },
} }];

test('legacy analysis caches appear across datasets sorted newest first', () => {
  const rows = collectAiHistory(files, 'analysis', frameworks);
  assert.equal(rows.length, 2);
  assert.equal(rows[0].filename, 'b.json');
  assert.equal(rows[1].count, 50);
  assert.equal(rows[1].result.result.theme, 'A');
});

test('title and theory caches stay separate from analysis', () => {
  assert.equal(collectAiHistory(files, 'titles', frameworks)[0].summary, 'Judul A');
  assert.equal(collectAiHistory(files, 'theories', frameworks)[0].summary, 'Framing');
  assert.equal(collectAiHistory(files, 'titles', frameworks).length, 1);
});

test('persisted results restore on a new session without changing selected research', () => {
  const results = restoreResearchResults(JSON.parse(JSON.stringify(files[0].analyses)));
  assert.equal(results.titles.input.focus, 'Fokus A');
  assert.equal(results.theories.items[0].name, 'Framing');
  assert.equal(researchCacheKey('titles'), 'research_titles');
  assert.deepEqual(restoreResearchResults(), {});
});

test('missing, empty and unrelated cache entries do not create misleading cards', () => {
  const invalid = [{ filename: 'a', analyses: { framing: { result: {} }, research_titles: { result: { items: [] } }, unknown: { result: { result: { ok: true } } } } }, { filename: 'b' }];
  assert.deepEqual(collectAiHistory(invalid, 'analysis', frameworks), []);
  assert.deepEqual(collectAiHistory(invalid, 'titles', frameworks), []);
});
