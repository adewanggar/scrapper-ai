/**
 * Normalizes AI analysis objects from backend or Firestore cache.
 * Handles nested shapes like { success: true, analysis: ... }, { found: true, analysis: ... },
 * and ensures `result` is always a valid object so property accesses never throw.
 */
export function normalizeAiAnalysis(data) {
  if (!data || typeof data !== 'object') return null;

  let target = data;
  while (target && target.analysis && typeof target.analysis === 'object') {
    target = target.analysis;
  }

  if (!target || typeof target !== 'object') return null;

  let result = target.result;
  if (typeof result === 'string') {
    try {
      result = JSON.parse(result);
    } catch {
      result = {};
    }
  }

  if (!result || typeof result !== 'object') {
    result = {};
  }

  return {
    ...target,
    result
  };
}
