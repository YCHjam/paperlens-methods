import { validId, validatePaper, safeUrl } from './core.js';
import { categories } from './taxonomy.js';

export async function fetchJson(relativePath) {
  const response = await fetch(new URL('../../' + relativePath, import.meta.url));
  if (!response.ok) throw new Error('資料讀取失敗（HTTP ' + response.status + '）。請稍後重試。');
  try { return await response.json(); }
  catch { throw new Error('資料不是有效的 JSON，請聯絡維護者。'); }
}
let library;
export async function loadLibrary() {
  library ??= (async () => {
    const ids = await fetchJson('content/papers/index.json');
    if (!Array.isArray(ids) || ids.some(id => !validId(id)) || new Set(ids).size !== ids.length) throw new Error('案例索引格式錯誤。');
    const papers = await Promise.all(ids.map(async id => {
      const paper = await fetchJson('content/papers/' + id + '.json');
      if (paper.id !== id || validatePaper(paper, { publication: true }).length) throw new Error('案例資料不完整，已停止顯示，請聯絡維護者。');
      return paper;
    }));
    return papers.sort((a, b) => b.analysis_date.localeCompare(a.analysis_date));
  })();
  return library;
}
export async function loadMethods() {
  const items = await fetchJson('content/methods/index.json');
  if (!Array.isArray(items)) throw new Error('方法小辭典格式錯誤。');
  const ids = new Set();
  for (const m of items) {
    if (!validId(m.id) || ids.has(m.id) || !m.name_zh || !m.name_en || !m.explanation || !categories.some(c => c[0] === m.category)
      || !['strengths', 'limitations'].every(key => Array.isArray(m[key]) && m[key].every(v => typeof v === 'string' && v.trim()))
      || !Array.isArray(m.references) || !m.references.length || !m.references.every(r => r.title && safeUrl(r.url))) throw new Error('方法詞條不完整。');
    ids.add(m.id);
  }
  return items;
}
