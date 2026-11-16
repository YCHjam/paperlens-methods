import { designs, directions, purposes, categories, sections, bases } from './taxonomy.js';

export const validId = value => typeof value === 'string' && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value);
export const safeUrl = value => {
  try { const url = new URL(value); return ['https:', 'http:'].includes(url.protocol) ? url.href : null; }
  catch { return null; }
};
const nonempty = value => typeof value === 'string' && value.trim().length > 0;
const array = value => Array.isArray(value);
const items = value => array(value) ? value : [];
const values = list => list.map(item => item[0]);
const date = value => typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(value)) && new Date(value).toISOString().slice(0, 10) === value;

// Semantic checks shared by the browser and the pre-publication command.
// Passing these checks does not replace checking the article or human review.
export function validatePaper(p, { publication = false } = {}) {
  const errors = [];
  const require = (condition, message) => { if (!condition) errors.push(message); };
  if (!p || typeof p !== 'object') return ['案例必須是物件'];
  require(p.schema_version === '2.0', '資料版本必須是 2.0');
  require(validId(p.id), '案例 id 格式錯誤');
  require(['draft', 'published'].includes(p.status), '案例狀態無效');
  require(['full_text', 'abstract_only', 'partial'].includes(p.source_scope), '來源範圍無效');
  require(nonempty(p.article?.title), '缺少文章標題');
  require(array(p.article?.authors) && p.article.authors.every(nonempty), '作者須為字串陣列');
  require(p.article?.year === null || (Number.isInteger(p.article?.year) && p.article.year > 0), '年份格式錯誤');
  require(p.article?.url === null || Boolean(safeUrl(p.article?.url)), '文章網址不安全或無效');
  require(p.article?.doi === null || nonempty(p.article?.doi), 'DOI 須為非空字串或 null');
  require(date(p.analysis_date), '分析日期無效');
  require(['pending', 'reviewed'].includes(p.review?.status), '審閱狀態無效');
  if (p.review?.status === 'reviewed') {
    require(nonempty(p.review.reviewer) && date(p.review.reviewed_at), '缺少人工審閱紀錄');
  }
  require(array(p.source_files) && p.source_files.length > 0, '缺少來源清單');
  const sources = new Set();
  for (const s of items(p.source_files)) {
    if (!s || typeof s !== 'object') { errors.push('來源須為物件'); continue; }
    require(validId(s.id) && !sources.has(s.id) && nonempty(s.label) && nonempty(s.version), '來源格式或唯一性錯誤');
    sources.add(s.id);
  }
  require(array(p.evidence), '證據須為陣列');
  const evidence = new Set();
  for (const e of items(p.evidence)) {
    if (!e || typeof e !== 'object') { errors.push('證據須為物件'); continue; }
    require(validId(e.id) && !evidence.has(e.id), '證據 id 無效或重複');
    evidence.add(e.id);
    require(sources.has(e.source_file_id), '證據來源不存在：' + e.id);
    require(nonempty(e.section) && nonempty(e.locator), '證據缺少章節或定位：' + e.id);
    require(e.pdf_page === null || (Number.isInteger(e.pdf_page) && e.pdf_page >= 1), 'PDF 頁碼無效');
    require(e.printed_page === null || nonempty(e.printed_page), '印刷頁碼須為字串或 null');
    require(typeof e.excerpt === 'string', '證據摘錄須為字串');
  }
  const claim = (c, at) => {
    require(nonempty(c?.text) && Object.hasOwn(bases, c?.basis) && array(c?.evidence_ids), '敘述格式不完整：' + at);
    for (const id of items(c?.evidence_ids)) require(evidence.has(id), '證據引用不存在：' + id);
    if (['reported', 'inferred'].includes(c?.basis)) require(c.evidence_ids?.length > 0, '確定敘述缺少證據：' + at);
  };
  const claims = (list, at, needed = false) => {
    require(array(list) && (!needed || list.length > 0), '敘述陣列缺漏：' + at);
    if (array(list)) list.forEach(c => claim(c, at));
  };
  const c = p.classification;
  require(values(designs).includes(c?.study_design?.value), '研究設計不在分類選項內');
  require(values(directions).includes(c?.time_direction?.value), '時間方向不在分類選項內');
  if (c?.study_design?.value === 'other') require(nonempty(c.study_design.other_label), '其他設計須說明名稱');
  else require(c?.study_design?.other_label === null, '非其他設計的 other_label 須為 null');
  for (const key of ['study_design', 'time_direction']) {
    claim(c?.[key]?.rationale, key);
    const item = c?.[key];
    if (item?.value === 'unclear') require(item.rationale?.basis === 'not_reported', '未確定分類須標為未報告');
    else if (item?.value === 'not_applicable') require(item.rationale?.basis === 'not_applicable', '不適用須附對應理由');
    else require(['reported', 'inferred'].includes(item?.rationale?.basis), '確定分類須有作者明述或推論依據');
  }
  require(array(c?.purposes), '研究目的須為陣列');
  const purposeIds = new Set();
  for (const item of items(c?.purposes)) {
    if (!item || typeof item !== 'object') { errors.push('研究目的須為物件'); continue; }
    require(values(purposes).includes(item.value) && !purposeIds.has(item.value), '研究目的無效或重複');
    purposeIds.add(item.value); claim(item.rationale, 'purpose');
    require(['reported', 'inferred'].includes(item.rationale?.basis), '研究目的須附確定判定的依據');
  }
  claim(c?.purposes_note, 'purposes_note');
  if (c?.purposes?.length === 0) require(c.purposes_note?.basis === 'not_reported', '目的不明須記錄查閱範圍');
  claims(c?.data_origin, 'data_origin');
  for (const [key] of sections) claims(p.overview?.[key], key, true);
  require(array(p.methods), '方法須為陣列');
  const methodIds = new Set();
  for (const m of items(p.methods)) {
    if (!m || typeof m !== 'object') { errors.push('方法須為物件'); continue; }
    require(validId(m.id) && !methodIds.has(m.id), '方法 id 無效或重複'); methodIds.add(m.id);
    require(nonempty(m.name_zh) && nonempty(m.name_en) && nonempty(m.general_explanation), '方法基本說明缺漏');
    require(values(categories).includes(m.category), '方法類別無效');
    for (const key of ['general_strengths', 'general_limitations', 'questions']) require(array(m[key]) && m[key].every(nonempty), '方法文字陣列無效：' + key);
    require(array(m.general_references) && m.general_references.length > 0 && m.general_references.every(ref => nonempty(ref.title) && safeUrl(ref.url)), '方法參考資料無效');
    for (const key of ['application', 'selection_reason', 'assumptions_check', 'interpretation']) claims(m[key], key, true);
  }
  for (const key of ['reading_questions', 'limitations']) require(array(p[key]) && p[key].every(nonempty), '文字陣列無效：' + key);
  if (publication || p.status === 'published') {
    require(p.status === 'published' && p.source_scope === 'full_text' && p.review?.status === 'reviewed', '公開案例須為完整全文且完成人工核對');
    require(p.evidence?.length > 0, '公開案例缺少證據');
  }
  return errors;
}

export function matchesFilters(paper, filters) {
  if (paper.status !== 'published') return false;
  const selected = (key, candidates) => !filters[key]?.length || filters[key].some(value => candidates.includes(value));
  const purposes = paper.classification.purposes.map(p => p.value);
  if (!purposes.length) purposes.push('unclear');
  const query = (filters.query ?? '').trim().toLocaleLowerCase();
  const haystack = [paper.article.title, ...paper.article.authors, ...paper.methods.flatMap(m => [m.name_zh, m.name_en])].join(' ').toLocaleLowerCase();
  return (!query || haystack.includes(query))
    && selected('design', [paper.classification.study_design.value])
    && selected('direction', [paper.classification.time_direction.value])
    && selected('purpose', purposes)
    && selected('method', paper.methods.map(m => m.id));
}
