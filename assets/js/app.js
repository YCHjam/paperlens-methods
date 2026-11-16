import { designs, directions, purposes, label } from './taxonomy.js';
import { matchesFilters } from './core.js';
import { loadLibrary } from './data.js';
import { el, link, paperCard, state, mountFooter } from './ui.js';

mountFooter();
const results = document.querySelector('#paper-results');
const count = document.querySelector('#result-count');
const search = document.querySelector('#paper-search');
const groups = document.querySelector('#filter-groups');
const chips = document.querySelector('#active-filters');
const params = new URLSearchParams(location.search);
const filters = { query: params.get('q') ?? '', design: [], direction: [], purpose: [], method: [] };
const definitions = { design: designs, direction: directions, purpose: [...purposes, ['unclear', '目的待確認']], method: [] };
for (const key of ['design', 'direction', 'purpose']) filters[key] = [...new Set(params.getAll(key).filter(value => definitions[key].some(item => item[0] === value)))];
search.value = filters.query;
let papers = [];
let ready = false;

function syncUrl() {
  const next = new URLSearchParams();
  if (filters.query) next.set('q', filters.query);
  for (const key of ['design', 'direction', 'purpose', 'method']) for (const value of filters[key]) next.append(key, value);
  history.replaceState(null, '', location.pathname + (next.size ? '?' + next.toString() : '') + location.hash);
}
function renderChips() {
  chips.replaceChildren();
  for (const key of ['design', 'direction', 'purpose', 'method']) {
    for (const value of filters[key]) {
      const name = label(definitions[key], value);
      const chip = el('button', name + ' ×', 'active-chip');
      chip.type = 'button'; chip.setAttribute('aria-label', '移除條件：' + name);
      chip.addEventListener('click', () => {
        filters[key] = filters[key].filter(item => item !== value);
        const checkbox = groups.querySelector('input[data-filter="' + key + '"][value="' + value + '"]');
        if (checkbox) checkbox.checked = false;
        update();
      });
      chips.append(chip);
    }
  }
}
function update() {
  syncUrl(); renderChips();
  if (!ready) return;
  const matches = papers.filter(paper => matchesFilters(paper, filters));
  count.textContent = '找到 ' + matches.length + ' 篇分析' + (papers.length ? ' ／ 共 ' + papers.length + ' 篇' : '');
  results.replaceChildren();
  if (!papers.length) {
    const box = state(results, '你的第一篇分析，從這裡開始。', '案例庫尚未收錄完成核對的論文。先依專案規則整理一篇全文，確認方法與證據後，就能沿用同一個版型加入這裡。');
    const actions = el('div', undefined, 'actions');
    actions.append(link('查看分析指令 ↗', 'prompts/analyze-paper.md', 'button primary'), link('下載資料範本 ↓', 'templates/paper-template.json', 'button secondary'));
    actions.lastChild.download = 'paper-template.json';
    box.append(actions, el('p', '目前未提供網站內 PDF 自動分析。', 'state-caption'));
  } else if (!matches.length) {
    const box = state(results, '目前沒有符合條件的案例', '試著減少篩選條件，或換一個關鍵字。');
    const clear = el('button', '清除篩選', 'button secondary'); clear.type = 'button';
    clear.addEventListener('click', clearFilters); box.append(clear);
  } else matches.forEach(paper => results.append(paperCard(paper)));
  results.setAttribute('aria-busy', 'false');
}
function addGroup(key, title, items, visible = 5) {
  const fieldset = el('fieldset', undefined, 'filter-group');
  fieldset.append(el('legend', title));
  let extra;
  if (items.length > visible) {
    extra = el('details'); extra.append(el('summary', '更多選項（' + (items.length - visible) + '）'));
    const options = el('div', undefined, 'more-options'); extra.append(options);
    extra.open = items.slice(visible).some(item => filters[key].includes(item[0]));
  }
  items.forEach(([value, name], index) => {
    const row = el('label', undefined, 'filter-option');
    const input = el('input'); input.type = 'checkbox'; input.value = value; input.dataset.filter = key;
    input.checked = filters[key].includes(value);
    input.addEventListener('change', () => {
      filters[key] = input.checked ? [...filters[key], value] : filters[key].filter(v => v !== value); update();
    });
    row.append(input, el('span', name));
    (index >= visible && extra ? extra.lastChild : fieldset).append(row);
  });
  if (extra) fieldset.append(extra);
  if (!items.length) fieldset.append(el('p', '隨案例建立方法標籤。', 'small muted'));
  groups.append(fieldset);
}
function clearFilters() {
  filters.query = ''; search.value = '';
  for (const key of ['design', 'direction', 'purpose', 'method']) filters[key] = [];
  groups.querySelectorAll('input').forEach(input => { input.checked = false; }); update();
}
addGroup('design', '研究設計', definitions.design);
addGroup('direction', '時間方向', definitions.direction);
addGroup('purpose', '研究目的', definitions.purpose, 4);
search.addEventListener('input', () => { filters.query = search.value; update(); });
document.querySelector('#clear-filters').addEventListener('click', clearFilters);

try {
  papers = await loadLibrary();
  const methods = new Map();
  papers.forEach(paper => paper.methods.forEach(method => methods.set(method.id, method.name_zh)));
  definitions.method = [...methods].sort((a, b) => a[1].localeCompare(b[1], 'zh-Hant'));
  filters.method = [...new Set(params.getAll('method').filter(value => methods.has(value)))];
  addGroup('method', '分析方法', definitions.method);
  ready = true; update();
} catch (error) {
  count.textContent = '案例暫時無法讀取';
  state(results, '資料載入遇到問題', error.message, true);
  results.setAttribute('aria-busy', 'false');
}
