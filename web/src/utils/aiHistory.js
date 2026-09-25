import { normalizeAiAnalysis } from './aiNormalize.js';

export function researchCacheKey(kind) {
  return `research_${kind}`;
}

export function collectAiHistory(files, kind, frameworks = []) {
  const rows = [];
  for (const file of files) {
    for (const [type, record] of Object.entries(file.analyses || {})) {
      const research = type === 'research_titles' ? 'titles' : type === 'research_theories' ? 'theories' : null;
      if ((research || 'analysis') !== kind || !record?.result) continue;
      const framework = frameworks.find(item => item.id === type);
      if (!research && !framework) continue;
      const result = research ? record.result : normalizeAiAnalysis(record.result);
      if (research ? !Array.isArray(result.items) || !result.items.length : !Object.keys(result?.result || {}).length) continue;
      rows.push({
        id: `${file.filename}:${type}`, filename: file.filename, caption: file.caption || file.filename,
        kind, type, result, updatedAt: record.updatedAt || '',
        title: research ? (kind === 'titles' ? 'Ide Judul Skripsi' : 'Rekomendasi Teori') : framework.title,
        summary: research ? result.items.slice(0, 3).map(item => item.title || item.name).filter(Boolean).join(' · ') : result.research_context?.title || 'Hasil analisis komentar tersimpan',
        count: research ? result.items.length : result.sample_analyzed,
      });
    }
  }
  return rows.sort((a, b) => (Date.parse(b.updatedAt) || 0) - (Date.parse(a.updatedAt) || 0));
}

export function restoreResearchResults(analyses = {}) {
  return Object.fromEntries(['titles', 'theories'].flatMap(kind => {
    const result = analyses[researchCacheKey(kind)]?.result;
    return Array.isArray(result?.items) && result.items.length ? [[kind, result]] : [];
  }));
}
