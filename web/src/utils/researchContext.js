export const METHODS = ['Kualitatif', 'Kuantitatif', 'Mixed Methods', 'Belum menentukan metode'];

export function emptyResearch(department = 'komunikasi', frameworkId = 'entman_framing') {
  return { draft: { department, method: METHODS[3], focus: '', title: '', framework_id: frameworkId, theory: '' }, selectedTitle: '', selectedTheory: null, results: {} };
}

// Restored documents may predate the feature or have an incompatible shape.
export function restoreResearch(value, department, frameworkId) {
  const fallback = emptyResearch(department, frameworkId);
  if (!value || typeof value !== 'object' || Array.isArray(value)) return fallback;
  const draft = { ...fallback.draft };
  for (const key of Object.keys(draft)) {
    if (typeof value.draft?.[key] === 'string') draft[key] = value.draft[key];
  }
  if (!METHODS.includes(draft.method)) draft.method = METHODS[3];
  return { ...fallback, draft, selectedTitle: typeof value.selectedTitle === 'string' ? value.selectedTitle : '',
    selectedTheory: typeof value.selectedTheory?.name === 'string' ? value.selectedTheory : null };
}

export function selectResearchTitle(state, card) {
  return { ...state, selectedTitle: card.title, draft: { ...state.draft, title: card.title, method: card.method, focus: card.focus } };
}

export function selectResearchTheory(state, card) {
  return { ...state, selectedTheory: card, draft: { ...state.draft, theory: card.name, framework_id: card.framework_id || '' } };
}

export async function requestResearch(apiBase, payload, signal) {
  const response = await fetch(`${apiBase}/api/ai/research`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload), signal,
  });
  let result;
  try { result = await response.json(); } catch { throw new Error('Respons server tidak valid. Silakan coba kembali.'); }
  if (!response.ok) throw new Error(result.error || 'Gagal memproses permintaan AI.');
  if (result.filename !== payload.filename || result.kind !== payload.kind || !Array.isArray(result.items) || !result.coverage) {
    throw new Error('Respons AI tidak sesuai permintaan dataset.');
  }
  return result;
}
