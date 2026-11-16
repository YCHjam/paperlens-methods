import { safeUrl } from './core.js';
import { methodRows } from './method-layout.js';
import { bases, designs, directions, purposes, label } from './taxonomy.js';

export function el(tag, text, className) {
  const node = document.createElement(tag);
  if (text !== undefined && text !== null) node.textContent = text;
  if (className) node.className = className;
  return node;
}
export function link(text, href, className = '') {
  const node = el('a', text, className); node.href = href; return node;
}
export function external(text, href) {
  const url = safeUrl(href);
  return url ? link(text, url) : el('span', text);
}
export function state(container, title, message, error = false) {
  const box = el('div', undefined, 'empty-state' + (error ? ' error-state' : ''));
  const heading = container.id === 'paper-content' ? 'h1' : container.id === 'method-results' ? 'h2' : 'h3';
  box.append(el('span', error ? '!' : '↗', 'state-icon'), el(heading, title), el('p', message));
  if (error) box.setAttribute('role', 'alert');
  container.replaceChildren(box); return box;
}
export function paperBadges(paper) {
  const c = paper.classification;
  const box = el('div', undefined, 'badges');
  box.append(el('span', label(designs, c.study_design.value), 'badge'), el('span', label(directions, c.time_direction.value), 'badge neutral'));
  for (const purpose of c.purposes) box.append(el('span', label(purposes, purpose.value), 'badge neutral'));
  if (!c.purposes.length) box.append(el('span', '目的待確認', 'badge neutral'));
  return box;
}
export function paperCard(paper) {
  const card = el('article', undefined, 'paper-card');
  const heading = el('h3'); heading.append(link(paper.article.title, 'paper.html?id=' + encodeURIComponent(paper.id)));
  card.append(paperBadges(paper), heading, el('p', paper.article.authors.join('、') + (paper.article.year ? ' · ' + paper.article.year : ''), 'muted small'));
  const summary = paper.overview.research_question[0]?.text;
  if (summary) card.append(el('p', summary));
  const methods = el('div', undefined, 'badges');
  for (const method of paper.methods) methods.append(link(method.name_zh, 'index.html?method=' + encodeURIComponent(method.id) + '#library', 'method-tag'));
  const bottom = el('div', undefined, 'card-bottom');
  bottom.append(el('span', '教學案例 · 已確認發布 · ' + paper.review.reviewed_at, 'small muted'), link('閱讀分析 →', 'paper.html?id=' + encodeURIComponent(paper.id), 'text-link'));
  card.append(methods, bottom); return card;
}
export function claims(parent, items) {
  for (const item of items) {
    const row = el('div', undefined, 'claim');
    row.append(el('span', bases[item.basis], 'basis ' + item.basis), el('p', item.text));
    if (item.evidence_ids.length) {
      const refs = el('div', undefined, 'evidence-links');
      for (const id of item.evidence_ids) refs.append(link('依據 ' + id, '#evidence-' + id));
      row.append(refs);
    }
    parent.append(row);
  }
}
export function list(parent, items) {
  if (!items.length) { parent.append(el('p', '未列出額外項目。', 'muted small')); return; }
  const ul = el('ul'); for (const item of items) ul.append(el('li', item)); parent.append(ul);
}
export function methodTable(method) {
  const table = el('table', undefined, 'method-table');
  table.append(el('caption', method.name_zh + ' / ' + method.name_en + '：方法解析', 'visually-hidden'));
  const head = el('thead'); const heading = el('tr');
  for (const title of ['閱讀面向', '方法解析']) { const th = el('th', title); th.scope = 'col'; heading.append(th); }
  head.append(heading); table.append(head);
  const body = el('tbody');
  for (const [key, title, kind] of methodRows) {
    const row = el('tr'); const th = el('th', title); th.scope = 'row'; const cell = el('td');
    if (kind === 'text') cell.append(el('p', method[key]));
    else if (kind === 'claims') claims(cell, method[key]);
    else if (kind === 'list') list(cell, method[key]);
    else { const refs = el('ul'); for (const ref of method[key]) { const li = el('li'); li.append(external(ref.title, ref.url)); refs.append(li); } cell.append(refs); }
    row.append(th, cell); body.append(row);
  }
  table.append(body); return table;
}
export function mountFooter() {
  document.querySelectorAll('[data-year]').forEach(node => { node.textContent = new Date().getFullYear(); });
}
