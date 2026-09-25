import { test, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { getServerAnalysis, requestAnalysis } from './analysisRequest.js';

const originalFetch = globalThis.fetch;
afterEach(() => { globalThis.fetch = originalFetch; });
const payload = { filename: 'video.json', analysis_type: 'public_sentiment', sample_size: 50 };
const response = (body, status = 200) => new Response(JSON.stringify(body), { status });

test('returns the normal response without requesting cache', async () => {
  let calls = 0;
  globalThis.fetch = async () => { calls++; return response({ analysis: { result: { ok: true } } }); };
  assert.equal((await requestAnalysis('', payload)).analysis.result.ok, true);
  assert.equal(calls, 1);
});

for (const failure of ['network', 'body', 'gateway']) {
  test(`recovers saved result after ${failure} failure without repeating POST`, async () => {
    const calls = [];
    let id;
    globalThis.fetch = async (url, options) => {
      calls.push(options.method || 'GET');
      if (options.method === 'POST') {
        id = JSON.parse(options.body).request_id;
        if (failure === 'network') throw new TypeError('Failed to fetch');
        if (failure === 'body') return { json: async () => { throw new TypeError('Body interrupted'); } };
        return response({ error: 'Gateway timeout' }, 504);
      }
      assert.match(url, /video.json\?type=public_sentiment/);
      return response({ found: true, analysis: { request_id: id, result: { ok: true } } });
    };
    assert.equal((await requestAnalysis('', payload)).analysis.result.ok, true);
    assert.deepEqual(calls, ['POST', 'GET']);
  });
}

test('rejects stale cached results rather than reporting false success', async () => {
  globalThis.fetch = async (url, options) => {
    if (options.method === 'POST') throw new TypeError('Failed to fetch');
    return response({ found: true, analysis: { request_id: 'older-request' } });
  };
  await assert.rejects(requestAnalysis('', payload), /Koneksi ke server terputus/);
});

test('keeps backend validation errors and does not retry', async () => {
  let calls = 0;
  globalThis.fetch = async () => { calls++; return response({ error: 'File tidak ditemukan' }, 400); };
  await assert.rejects(requestAnalysis('', payload), /File tidak ditemukan/);
  assert.equal(calls, 1);
});

test('loads existing server cache, including results created before request IDs', async () => {
  globalThis.fetch = async () => response({ found: true, analysis: { result: { saved: true } } });
  assert.equal((await getServerAnalysis('', payload.filename, payload.analysis_type)).result.saved, true);
});
