import { validId } from './core.js';
import { loadLibrary } from './data.js';
import { designs, directions, purposes, categories, sections, label } from './taxonomy.js';
import { el, link, external, state, claims, list, paperBadges, methodTable, mountFooter } from './ui.js';

mountFooter();
const container = document.querySelector('#paper-content');
const id = new URLSearchParams(location.search).get('id');
function render(paper) {
  document.title = paper.article.title + '｜PaperLens';
  container.replaceChildren();
  const header = el('header', undefined, 'article-header');
  header.append(el('p', 'PAPER / METHODS ANALYSIS', 'eyebrow'), el('h1', paper.article.title), el('p', paper.article.authors.join('、'), 'muted small'), paperBadges(paper));
  const meta = el('div', undefined, 'meta-row');
  meta.append(el('span', '發表年份：' + (paper.article.year ?? '未確認')), el('span', '分析日期：' + paper.analysis_date), el('span', '閱讀範圍：全文'));
  if (paper.article.url) meta.append(external('原文連結 ↗', paper.article.url));
  if (paper.article.doi) meta.append(external('DOI：' + paper.article.doi, 'https://doi.org/' + encodeURIComponent(paper.article.doi)));
  header.append(meta, el('p', '教學案例發布確認：' + paper.review.reviewer + ' · ' + paper.review.reviewed_at + '。AI 依原文整理，未重分析原始資料；未核對事項見分析限制。', 'review-notice'));
  container.append(header);
  const layout = el('div', undefined, 'article-layout');
  const nav = el('nav', undefined, 'article-nav'); nav.setAttribute('aria-label', '本篇分析目錄');
  const body = el('div'); layout.append(nav, body); container.append(layout);
  function section(key, title) {
    const part = el('section', undefined, 'analysis-section'); part.id = key; part.append(el('h2', title));
    nav.append(link(title, '#' + key)); body.append(part); return part;
  }
  const c = paper.classification;
  const classification = section('classification', '分類與判定依據');
  classification.append(el('h3', '研究設計 · ' + label(designs, c.study_design.value)));
  if (c.study_design.other_label) classification.append(el('p', c.study_design.other_label, 'muted small'));
  claims(classification, [c.study_design.rationale]);
  classification.append(el('h3', '時間方向 · ' + label(directions, c.time_direction.value))); claims(classification, [c.time_direction.rationale]);
  classification.append(el('h3', '研究目的')); claims(classification, [c.purposes_note]);
  c.purposes.forEach(item => { classification.append(el('h4', label(purposes, item.value))); claims(classification, [item.rationale]); });
  if (c.data_origin.length) { classification.append(el('h3', '資料來源背景')); claims(classification, c.data_origin); }
  for (const [key, title] of sections) claims(section(key, title), paper.overview[key]);
  const methods = section('methods', '方法卡片');
  if (!paper.methods.length) methods.append(el('p', '未建立方法卡片；請參閱方法清單及分析限制。', 'muted small'));
  for (const m of paper.methods) {
    const card = el('article', undefined, 'method-card'); card.id = 'method-' + m.id;
    card.append(el('span', label(categories, m.category), 'badge'), el('h3', m.name_zh), el('p', m.name_en, 'muted small'), methodTable(m));
    card.append(link('到方法小辭典閱讀 →', 'methods.html#method-' + m.id, 'text-link'));
    methods.append(card);
  }
  list(section('questions', '批判閱讀問題'), paper.reading_questions);
  const evidence = section('evidence', '原文證據與定位');
  for (const e of paper.evidence) {
    const source = paper.source_files.find(s => s.id === e.source_file_id);
    const item = el('article', undefined, 'evidence-item'); item.id = 'evidence-' + e.id;
    item.append(el('h3', e.id + ' · ' + e.section), el('p', source.label + ' · ' + source.version, 'muted small'));
    const pages = [e.pdf_page ? 'PDF 第 ' + e.pdf_page + ' 頁' : null, e.printed_page ? '印刷頁碼 ' + e.printed_page : null].filter(Boolean).join(' ／ ');
    if (pages) item.append(el('p', pages)); item.append(el('p', e.locator));
    if (e.excerpt) item.append(el('blockquote', e.excerpt)); evidence.append(item);
  }
  list(section('limitations', '分析限制'), paper.limitations);
}
try {
  if (!id) {
    const box = state(container, '先選擇一篇論文', '每篇分析會依相同格式呈現研究設計、方法與原文證據。請從案例庫選擇文章。');
    box.append(link('前往案例庫 →', 'index.html#library', 'button primary'));
  } else if (!validId(id)) {
    state(container, '案例網址格式不正確', '請返回案例庫，使用文章連結開啟分析。', true);
  } else {
    const paper = (await loadLibrary()).find(p => p.id === id);
    if (!paper) state(container, '找不到已公開的案例', '這篇案例可能尚未完成核對，或網址已變更。請返回案例庫查看。');
    else render(paper);
  }
} catch (error) { state(container, '分析暫時無法讀取', error.message, true); }
finally { container.setAttribute('aria-busy', 'false'); }
