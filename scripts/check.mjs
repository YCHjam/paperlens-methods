import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { validatePaper, validId, safeUrl } from '../assets/js/core.js';

const root = fileURLToPath(new URL('../', import.meta.url));
const read = async file => JSON.parse(await fs.readFile(path.join(root, file), 'utf8'));
const errors = [];
const template = await read('templates/paper-template.json');
if (template.schema_version !== '2.0' || template.status !== 'draft' || template.review.status !== 'pending' || template.classification.study_design.value !== 'unclear') errors.push('空白範本狀態錯誤');
const index = await read('content/papers/index.json');
if (!Array.isArray(index) || new Set(index).size !== index.length || index.some(id => !validId(id))) throw new Error('案例索引錯誤');
const methods = await read('content/methods/index.json');
if (!Array.isArray(methods)) throw new Error('方法索引錯誤');
const methodIds = new Set();
for (const m of methods) {
  if (!validId(m.id) || methodIds.has(m.id) || !m.name_zh || !m.name_en || !m.explanation || !['biostatistics','machine_learning','evidence_synthesis'].includes(m.category)
    || !['strengths','limitations'].every(k => Array.isArray(m[k]) && m[k].every(v => typeof v === 'string' && v.trim()))
    || !Array.isArray(m.references) || !m.references.length || !m.references.every(r => r.title && safeUrl(r.url))) errors.push('方法詞條不完整：' + m.id);
  methodIds.add(m.id);
}
const filenames = (await fs.readdir(path.join(root, 'content/papers'))).filter(f => f.endsWith('.json') && f !== 'index.json');
for (const file of filenames) {
  const paper = await read('content/papers/' + file);
  if (file !== paper.id + '.json') errors.push('案例檔名不符合 id：' + file);
  errors.push(...validatePaper(paper, { publication: index.includes(paper.id) }).map(e => file + ': ' + e));
  if (paper.status === 'published' && !index.includes(paper.id)) errors.push('公開案例未加入索引：' + file);
  if (index.includes(paper.id)) for (const method of paper.methods) {
    if (!methodIds.has(method.id)) errors.push('缺少對應小辭典：' + method.id);
    else {
      const dictionary = methods.find(m => m.id === method.id);
      for (const [a,b] of [['name_zh','name_zh'],['name_en','name_en'],['category','category'],['general_explanation','explanation'],['general_strengths','strengths'],['general_limitations','limitations'],['general_references','references']]) {
        if (JSON.stringify(method[a]) !== JSON.stringify(dictionary[b])) errors.push('案例與小辭典通識不一致：' + method.id + '/' + a);
      }
    }
  }
}
for (const id of index) if (!filenames.includes(id + '.json')) errors.push('索引引用不存在：' + id);
const jsFiles = await fs.readdir(path.join(root,'assets/js'));
for (const file of jsFiles.filter(f => f.endsWith('.js'))) {
  const result = spawnSync(process.execPath, ['--check', path.join(root,'assets/js',file)], { encoding: 'utf8' });
  if (result.status !== 0) errors.push('JavaScript 語法錯誤：' + file + '\n' + result.stderr);
}
for (const file of ['index.html','paper.html','methods.html']) {
  const html = await fs.readFile(path.join(root,file),'utf8');
  if ((html.match(/<h1(?:\s|>)/g) ?? []).length !== (file === 'paper.html' ? 0 : 1)) errors.push('h1 結構錯誤：' + file);
  for (const match of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
    if (/^(https?:|#)/.test(match[1])) continue;
    const target = match[1].split(/[?#]/)[0];
    try { await fs.access(path.join(root,target)); } catch { errors.push('失效的本機連結：' + file + ' -> ' + target); }
  }
}
if (errors.length) { console.error(errors.join('\n')); process.exitCode = 1; }
else console.log('PASS — JS syntax, local links, template state, ' + index.length + ' public papers, ' + methods.length + ' dictionary entries. Source accuracy and human review are not automated.');
