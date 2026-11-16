import test from 'node:test';
import assert from 'node:assert/strict';
import { matchesFilters, validatePaper, safeUrl, validId } from '../assets/js/core.js';
import { sections } from '../assets/js/taxonomy.js';

// Entirely synthetic fixtures. They are never served as real papers or added to the case index.
const claim = () => ({ text: '合成測試敘述，並非論文內容。', basis: 'reported', evidence_ids: ['e1'] });
function fixture() {
  return {
    schema_version:'2.0', id:'synthetic-test', status:'published', source_scope:'full_text',
    article:{title:'Synthetic fixture',authors:['Test'],year:2026,doi:null,url:null},
    analysis_date:'2026-11-16',review:{status:'reviewed',reviewer:'Synthetic reviewer',reviewed_at:'2026-11-16'},
    source_files:[{id:'source',label:'Synthetic source',version:'test'}],
    evidence:[{id:'e1',source_file_id:'source',section:'Test',pdf_page:1,printed_page:null,locator:'Synthetic locator',excerpt:''}],
    classification:{study_design:{value:'cohort',other_label:null,rationale:claim()},time_direction:{value:'retrospective',rationale:claim()},purposes:[{value:'prognosis_or_risk_prediction',rationale:claim()}],purposes_note:claim(),data_origin:[]},
    overview:Object.fromEntries(sections.map(([k])=>[k,[claim()]])),methods:[],reading_questions:[],limitations:[]
  };
}
test('different facets use AND; choices within a facet use OR',()=>{
  const p=fixture();
  assert.equal(matchesFilters(p,{design:['case_series','cohort'],direction:['retrospective']}),true);
  assert.equal(matchesFilters(p,{design:['cohort'],direction:['prospective']}),false);
  assert.equal(matchesFilters(p,{purpose:['description','prognosis_or_risk_prediction']}),true);
});
test('draft papers are excluded even if every filter matches',()=>{
  const p=fixture();p.status='draft'; assert.equal(matchesFilters(p,{}),false);
  assert.ok(validatePaper(p,{publication:true}).some(e=>e.includes('公開案例須')));
});
test('pending review and partial source both block publication',()=>{
  const p=fixture(); assert.deepEqual(validatePaper(p,{publication:true}),[]);
  p.review.status='pending';assert.ok(validatePaper(p).some(e=>e.includes('公開案例須')));
  p.review.status='reviewed';p.source_scope='partial';assert.ok(validatePaper(p).some(e=>e.includes('公開案例須')));
});
test('classification certainty requires evidence; dangling citations fail',()=>{
  const p=fixture();p.classification.study_design.rationale.evidence_ids=[];
  assert.ok(validatePaper(p).some(e=>e.includes('缺少證據')));
  p.classification.study_design.rationale.evidence_ids=['missing'];
  assert.ok(validatePaper(p).some(e=>e.includes('引用不存在')));
});
test('unknown design differs from other and from all filters',()=>{
  const p=fixture();p.classification.study_design.value='unclear';p.classification.study_design.rationale={text:'合成資料未交代設計。',basis:'not_reported',evidence_ids:[]};
  assert.deepEqual(validatePaper(p),[]);
  assert.equal(matchesFilters(p,{design:['unclear']}),true);
  assert.equal(matchesFilters(p,{design:['other']}),false);
  p.classification.study_design.value='other'; assert.ok(validatePaper(p).some(e=>e.includes('其他設計須')));
});
test('unsafe paths and executable URL protocols are rejected',()=>{
  assert.equal(validId('../private'),false);assert.equal(validId('cohort-2026'),true);
  assert.equal(safeUrl('javascript:alert(1)'),null);assert.equal(safeUrl('data:text/html,test'),null);
  assert.equal(safeUrl('https://example.org/'),'https://example.org/');
});
test('malformed arrays produce validation errors rather than crash',()=>{
  const p=fixture();p.source_files={};p.evidence=[null];p.methods={};p.classification.purposes=[null];
  assert.doesNotThrow(()=>validatePaper(p));assert.ok(validatePaper(p).length>0);
});
