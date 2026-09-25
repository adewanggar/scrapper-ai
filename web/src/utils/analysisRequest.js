export async function getServerAnalysis(apiBase, filename, type) {
  const response = await fetch(
    `${apiBase}/api/ai/analysis/${encodeURIComponent(filename)}?type=${encodeURIComponent(type)}`,
    { cache: 'no-store', signal: AbortSignal.timeout(20000) }
  );
  if (!response.ok) throw new Error('Hasil analisis di server belum dapat diambil.');
  const json = await response.json();
  return json.found ? json.analysis : null;
}

export async function requestAnalysis(apiBase, payload) {
  const requestId = crypto.randomUUID();
  let response;
  let json;
  try {
    response = await fetch(`${apiBase}/api/ai/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...payload, request_id: requestId })
    });
    json = await response.json();
  } catch {
    // Only read saved results: repeating the POST would run the model again.
    return recoverAnalysis(apiBase, payload, requestId);
  }

  if ([502, 503, 504].includes(response.status)) {
    return recoverAnalysis(apiBase, payload, requestId);
  }
  if (!response.ok || json.error) {
    throw new Error(json.error || 'Gagal melakukan analisis. Silakan coba kembali.');
  }
  return json;
}

async function recoverAnalysis(apiBase, payload, requestId) {
  for (let attempt = 0; attempt < 3; attempt += 1) {
    if (attempt > 0) await new Promise(resolve => setTimeout(resolve, 2000));
    try {
      const cached = await getServerAnalysis(apiBase, payload.filename, payload.analysis_type);
      // An older result must never be presented as this request's success.
      if (cached?.request_id === requestId) return { analysis: cached };
    } catch {
      // A temporary connection failure may also affect the cache request.
    }
  }
  throw new Error('Koneksi ke server terputus. Analisis mungkin sudah tersimpan. Muat ulang halaman untuk mengambil hasilnya; tidak perlu langsung menjalankan analisis ulang.');
}
