import { loadMethods, loadLibrary } from './data.js';
import { categories, label } from './taxonomy.js';
import { el, link, external, list, state, mountFooter } from './ui.js';

mountFooter();
const container = document.querySelector('#method-results');
const count = document.querySelector('#method-count');
const search = document.querySelector('#method-search');
const category = document.querySelector('#method-category');
try {
  const [methods, papers] = await Promise.all([loadMethods(), loadLibrary()]);
  function update() {
    const query = search.value.trim().toLocaleLowerCase();
    const filtered = methods.filter(m => (!category.value || m.category === category.value) && (!query || [m.name_zh, m.name_en].join(' ').toLocaleLowerCase().includes(query)));
    count.textContent = filtered.length + ' 個方法詞條'; container.replaceChildren();
    if (!methods.length) {
      const box = state(container, '把遇見的方法，累積成自己的筆記。', '目前尚無方法詞條。新增第一篇核對完成的案例時，會依規則同步建立方法通識、優缺點與參考資料。');
      box.append(link('了解新增內容的規則 ↗', 'AGENTS.md', 'button secondary'));
    } else if (!filtered.length) state(container, '找不到符合條件的方法', '試著換個關鍵字，或將方法類別改為全部。');
    else for (const m of filtered) {
      const card = el('article', undefined, 'method-entry'); card.id = 'method-' + m.id;
      card.append(el('span', label(categories, m.category), 'badge'), el('h2', m.name_zh), el('p', m.name_en, 'muted small'), el('p', m.explanation));
      card.append(el('h3', '一般優點')); list(card, m.strengths);
      card.append(el('h3', '一般限制')); list(card, m.limitations);
      card.append(el('h3', '參考資料')); const refs = el('ul');
      m.references.forEach(ref => { const item = el('li'); item.append(external(ref.title, ref.url)); refs.append(item); }); card.append(refs);
      card.append(el('h3', '相關案例')); const related = papers.filter(p => p.methods.some(method => method.id === m.id));
      if (!related.length) card.append(el('p', '尚無公開案例。', 'muted small'));
      else { const items = el('ul'); related.forEach(p => { const item = el('li'); item.append(link(p.article.title, 'paper.html?id=' + p.id)); items.append(item); }); card.append(items); }
      container.append(card);
    }
    container.setAttribute('aria-busy', 'false');
  }
  search.addEventListener('input', update); category.addEventListener('change', update); update();
  if (location.hash) document.getElementById(location.hash.slice(1))?.scrollIntoView();
} catch (error) { count.textContent = '詞條暫時無法讀取'; state(container, '資料載入遇到問題', error.message, true); container.setAttribute('aria-busy', 'false'); }
