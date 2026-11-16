import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { validatePaper, validId, safeUrl } from '../assets/js/core.js';
import { methodRows } from '../assets/js/method-layout.js';
import { designs, directions, purposes, categories, sections, bases, label } from '../assets/js/taxonomy.js';

const root = path.resolve(fileURLToPath(new URL('../', import.meta.url)));
const id = process.argv[2];
if (!validId(id)) throw new Error('Usage: node scripts/render-review.mjs <paper-id>');
const paper = JSON.parse(await fs.readFile(path.join(root, 'content/papers', id + '.json'), 'utf8'));
if (paper.id !== id || paper.status !== 'draft' || paper.review.status !== 'pending') throw new Error('Review renderer accepts pending drafts only.');
const errors = validatePaper(paper);
if (errors.length) throw new Error(errors.join('\n'));
const escape = value => String(value ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const url = (title, href) => safeUrl(href) ? '<a href="' + escape(safeUrl(href)) + '">' + escape(title) + '</a>' : escape(title);
const list = items => items.length ? '<ul>' + items.map(item => '<li>' + escape(item) + '</li>').join('') + '</ul>' : '<p class="muted small">未列出額外項目。</p>';
const claims = items => items.map(c => '<div class="claim"><span class="basis ' + c.basis + '">' + bases[c.basis] + '</span><p>' + escape(c.text) + '</p><div class="evidence-links">' + c.evidence_ids.map(e => '<a href="#evidence-' + e + '">依據 ' + e + '</a>').join(' ') + '</div></div>').join('');
const parts = [];
const c = paper.classification;
let classification = '<h3>研究設計 · ' + escape(label(designs, c.study_design.value)) + '</h3>' + claims([c.study_design.rationale]);
classification += '<h3>時間方向 · ' + escape(label(directions, c.time_direction.value)) + '</h3>' + claims([c.time_direction.rationale]);
classification += '<h3>研究目的</h3>' + claims([c.purposes_note]);
for (const p of c.purposes) classification += '<h4>' + escape(label(purposes, p.value)) + '</h4>' + claims([p.rationale]);
if(c.data_origin.length) classification += '<h3>資料來源背景</h3>' + claims(c.data_origin);
parts.push(['classification', '分類與判定依據', classification]);
for (const [key, title] of sections) parts.push([key, title, claims(paper.overview[key])]);
const methods = paper.methods.map(m => {
  const rows = methodRows.map(([key,title,kind]) => {
    let body;
    if (kind === 'text') body = '<p>' + escape(m[key]) + '</p>';
    else if (kind === 'claims') body = claims(m[key]);
    else if (kind === 'list') body = list(m[key]);
    else body = '<ul>' + m[key].map(r => '<li>' + url(r.title,r.url) + '</li>').join('') + '</ul>';
    return '<tr><th scope="row">' + title + '</th><td>' + body + '</td></tr>';
  }).join('');
  return '<article class="method-card" id="method-' + m.id + '"><span class="badge">' + escape(label(categories,m.category)) + '</span><h3>' + escape(m.name_zh) + '</h3><p class="muted small">' + escape(m.name_en) + '</p><table class="method-table"><caption class="visually-hidden">' + escape(m.name_zh+' / '+m.name_en+'：方法解析') + '</caption><thead><tr><th scope="col">閱讀面向</th><th scope="col">方法解析</th></tr></thead><tbody>' + rows + '</tbody></table></article>';
}).join('');
parts.push(['methods','方法卡片',methods], ['questions','批判閱讀問題',list(paper.reading_questions)]);
const evidence=paper.evidence.map(e=>{
  const source=paper.source_files.find(s=>s.id===e.source_file_id);
  return '<article class="evidence-item" id="evidence-' + e.id + '"><h3>' + escape(e.id+' · '+e.section) + '</h3><p class="muted small">' + escape(source.label+' · '+source.version) + '</p><p>' + escape(e.locator) + '</p>' + (e.pdf_page?'<p>PDF 第 '+e.pdf_page+' 頁</p>':'') + (e.printed_page?'<p>印刷頁碼 '+escape(e.printed_page)+'</p>':'') + (e.excerpt?'<blockquote>'+escape(e.excerpt)+'</blockquote>':'')+'</article>';
}).join('');
parts.push(['evidence','原文證據與定位',evidence],['limitations','分析限制',list(paper.limitations)]);
const css=await fs.readFile(path.join(root,'assets/css/style.css'),'utf8');
const html='<!doctype html><html lang="zh-Hant"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>待核對草稿｜'+escape(paper.article.title)+'</title><style>'+css+'</style></head><body><main class="page-width detail-main"><header class="article-header"><p class="eyebrow">PAPERLENS / LOCAL REVIEW DRAFT</p><h1>'+escape(paper.article.title)+'</h1><p class="muted small">'+escape(paper.article.authors.join('、'))+' · '+paper.article.year+'</p><p class="review-notice" style="background:#FBF0DF;border-color:#EDDBC1;color:#8A4B08">草稿，尚待人工核對。此頁僅供本機審閱，未加入公開案例庫；開啟本頁不會將審閱狀態改為完成。</p><p class="small">分析日期：'+paper.analysis_date+' · 閱讀範圍：'+escape(paper.source_scope)+' · '+url('論文原文 ↗',paper.article.url)+'</p></header><div class="article-layout"><nav class="article-nav" aria-label="分析目錄">'+parts.map(([key,title])=>'<a href="#'+key+'">'+title+'</a>').join('')+'</nav><div>'+parts.map(([key,title,body])=>'<section id="'+key+'" class="analysis-section"><h2>'+title+'</h2>'+body+'</section>').join('')+'</div></div></main></body></html>';
const markdown=['# 待核對草稿：'+paper.article.title,'','狀態：draft / pending；尚未人工核對，未加入公開案例索引。','', '原文：'+paper.article.url,'','分類：'+label(designs,c.study_design.value)+'｜'+label(directions,c.time_direction.value)+'｜'+c.purposes.map(p=>label(purposes,p.value)).join('、'),''];
const claimMarkdown=items=>items.flatMap(item=>['- **'+bases[item.basis]+'**：'+item.text+(item.evidence_ids.length?'（依據：'+item.evidence_ids.join('、')+'）':''),'']);
markdown.push('## 分類依據','',...claimMarkdown([c.study_design.rationale,c.time_direction.rationale,c.purposes_note]));
for(const [key,title] of sections) markdown.push('## '+title,'',...claimMarkdown(paper.overview[key]));
markdown.push('## 方法卡片','');
const mdCell=value=>String(value).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/\|/g,'&#124;').replace(/\r?\n/g,'<br>');
for(const m of paper.methods){
  markdown.push('### '+m.name_zh+' / '+m.name_en,'','| 閱讀面向 | 方法解析 |','| --- | --- |');
  for(const [key,title,kind] of methodRows){
    let cell;
    if(kind==='text')cell=mdCell(m[key]);
    else if(kind==='claims')cell=m[key].map(c=>'**'+bases[c.basis]+'**：'+mdCell(c.text)+(c.evidence_ids.length?'（依據：'+c.evidence_ids.join('、')+'）':'')).join('<br><br>');
    else if(kind==='list')cell=m[key].length?m[key].map(v=>'• '+mdCell(v)).join('<br>'):'未列出額外項目。';
    else cell=m[key].map(r=>'['+mdCell(r.title)+']('+safeUrl(r.url)+')').join('<br>');
    markdown.push('| '+title+' | '+cell+' |');
  }
  markdown.push('');
}
markdown.push('## 批判閱讀問題','',...paper.reading_questions.map(q=>'- '+q),'','## 原文證據與定位','');
for(const e of paper.evidence) markdown.push('### '+e.id+' / '+e.section,'',paper.source_files.find(s=>s.id===e.source_file_id).label,'',e.locator,'');
markdown.push('## 分析限制','',...paper.limitations.map(l=>'- '+l),'');
const output=path.resolve(root,'local','reviews');
if(path.dirname(output)!==path.join(root,'local')) throw new Error('Output guard failed');
await fs.mkdir(output,{recursive:true});
await fs.writeFile(path.join(output,id+'.html'),html,'utf8');
await fs.writeFile(path.join(output,id+'.md'),markdown.join('\n'),'utf8');
console.log('Generated local review files for '+id+'. Source JSON status remains draft/pending.');
