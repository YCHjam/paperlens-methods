export const designs = [
  ['randomized_controlled_trial', '隨機對照試驗', 'RCT', '介入研究'],
  ['non_randomized_interventional', '非隨機介入研究', 'Non-randomized intervention', '介入研究'],
  ['cohort', '世代研究', 'Cohort study', '觀察性研究'],
  ['case_control', '病例對照研究', 'Case-control study', '觀察性研究'],
  ['cross_sectional', '橫斷面研究', 'Cross-sectional study', '觀察性研究'],
  ['case_series', '病例系列', 'Case series', '描述性報告'],
  ['case_report', '病例報告', 'Case report', '描述性報告'],
  ['systematic_review', '系統性文獻回顧', 'Systematic review', '文獻綜整'],
  ['scoping_review', '範疇性回顧', 'Scoping review', '文獻綜整'],
  ['narrative_review', '敘述性回顧', 'Narrative review', '文獻綜整'],
  ['other', '其他設計', 'Other', '其他'],
  ['unclear', '資訊不足／尚待確認', 'Unclear', '待判定']
];
export const directions = [
  ['prospective', '前瞻性'], ['retrospective', '回溯性'],
  ['ambidirectional', '雙向性'], ['not_applicable', '不適用'], ['unclear', '未交代／無法判定']
];
export const purposes = [
  ['description', '描述現象'], ['association', '評估關聯'],
  ['intervention_effect_or_causal_question', '介入效果／因果問題'],
  ['diagnostic_accuracy', '診斷準確度'], ['prognosis_or_risk_prediction', '預後或風險預測'],
  ['method_development_or_validation', '方法開發與驗證'], ['evidence_synthesis', '證據綜整']
];
export const categories = [
  ['biostatistics', '生物統計'], ['machine_learning', '機器學習'], ['evidence_synthesis', '證據綜整方法']
];
export const sections = [
  ['research_question', '研究問題'], ['study_design', '研究設計'],
  ['data_and_sample', '資料與樣本'], ['methods_summary', '方法清單'],
  ['rationale', '使用理由'], ['assumptions_and_limits', '假設與限制'],
  ['results_interpretation', '結果解讀'], ['critical_appraisal', '批判閱讀']
];
export const bases = {
  reported: '作者明述', inferred: '分析者推論',
  not_reported: '未報告／未見說明', not_applicable: '不適用'
};
export const label = (list, value) => list.find(item => item[0] === value)?.[1] ?? '待確認';
