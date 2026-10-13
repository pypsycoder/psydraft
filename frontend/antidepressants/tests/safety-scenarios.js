'use strict';
// Regression expectations reviewed against the cited SmPC sections; not clinical validation.
function runSafetyScenarios(engine) {
  const results = [];
  const check = (name, passed) => results.push({ name, passed: Boolean(passed) });
  const previousCourse = { drug: 'ser', diagnosis: 'mdd', episode: 'current', dose: '100', duration: '8', adherence: 'good', adequacy: 'yes', response: 'failure', adverse: 'none', adverseSeverity: 'mild', reason: 'ineffective' };
  const base = { dx: 'mdd', age: '38', severity: 'moderate', policy: 'union', mddGuide: 'can', historyStatus: 'recorded', history: [previousCourse], targets: [], symptomLevels: { anxiety: 'u', insomnia: 'u', hypersomnia: 'u', lowappetite: 'u', fatigue: 'u', cognition: 'u', pain: 'u', anhedonia: 'u', diarrhea: 'u', constipation: 'u' }, preg: 'no', bipolar: 'no', suicide: 'no', psychosis: 'no', renal: 'normal', liver: 'normal', alt: 'normal', current: 'none', trials: '1', previous: 'none', prevOutcome: 'unknown', cardiacDetail: 'unknown', glaucomaDetail: 'unknown', urinaryDetail: 'unknown', confirmed: true, foreign: true, symptoms: [], priorities: [], conditions: [], medications: [], 'red-flags': [] };
  const cases = [
    { name: 'Недавний ИМ', extra: { conditions: ['cardiac'], cardiacDetail: 'recentmi' }, ids: ['ami', 'clo'], category: 'limited', rule: 'TCA_CARDIAC', collection: 'limits' },
    { name: 'Блокада сердца', extra: { conditions: ['cardiac'], cardiacDetail: 'block' }, ids: ['ami', 'clo'], category: 'limited', rule: 'TCA_CARDIAC', collection: 'limits' },
    { name: 'Аритмия', extra: { conditions: ['cardiac'], cardiacDetail: 'arrhythmia' }, ids: ['ami', 'clo'], category: 'limited', rule: 'TCA_CARDIAC', collection: 'limits' },
    { name: 'Неуточнённый сердечный анамнез', extra: { conditions: ['cardiac'] }, ids: ['ami', 'clo'], category: 'review', rule: 'TCA_CARDIAC_UNKNOWN', collection: 'unknown' },
    { name: 'Тяжёлое заболевание печени', extra: { liver: 'severe' }, ids: ['ami', 'clo'], category: 'limited', rule: 'TCA_LIVER', collection: 'limits' },
    { name: 'Неуточнённая функция печени', extra: { liver: 'unknown' }, ids: ['ami', 'clo'], category: 'review', rule: 'TCA_LIVER_UNKNOWN', collection: 'unknown' },
    { name: 'Неуточнённая тяжесть болезни печени', extra: { liver: 'disease' }, ids: ['ami', 'clo'], category: 'review', rule: 'TCA_LIVER_UNKNOWN', collection: 'unknown' },
    { name: 'Коронарная недостаточность', extra: { conditions: ['cardiac'], cardiacDetail: 'coronary' }, ids: ['ami'], category: 'limited', rule: 'AMI_CORONARY', collection: 'limits' },
    { name: 'Узкоугольная глаукома', extra: { conditions: ['glaucoma'], glaucomaDetail: 'confirmed' }, ids: ['clo'], category: 'limited', rule: 'CLO_GLAUCOMA', collection: 'limits' },
    { name: 'Офтальмологический фактор не уточнён', extra: { conditions: ['glaucoma'] }, ids: ['clo'], category: 'review', rule: 'CLO_GLAUCOMA_UNKNOWN', collection: 'unknown' },
    { name: 'Задержка мочи', extra: { conditions: ['urinary'], urinaryDetail: 'retention' }, ids: ['clo'], category: 'limited', rule: 'CLO_RETENTION', collection: 'limits' },
    { name: 'Мочеиспускание не уточнено', extra: { conditions: ['urinary'] }, ids: ['clo'], category: 'review', rule: 'CLO_RETENTION_UNKNOWN', collection: 'unknown' },
    { name: 'Агомелатин в 75 лет', extra: { age: '75' }, ids: ['ago'], category: 'limited', rule: 'AGO_AGE', collection: 'limits' },
    { name: 'Боль не компенсирует почечное противопоказание', extra: { renal: 'dialysis', symptoms: ['pain'], targets: ['pain'] }, ids: ['dul'], category: 'limited', rule: 'DUL_RENAL', collection: 'limits' },
    { name: 'Положительный прошлый ответ не компенсирует тяжёлую болезнь печени', extra: { liver: 'severe', history: [{ ...previousCourse, drug: 'ami', response: 'remitted' }] }, ids: ['ami'], category: 'limited', rule: 'TCA_LIVER', collection: 'limits' }
  ];
  for (const guide of ['rf', 'can', 'va', 'nice']) {
    for (const scenario of cases) {
      const out = engine.calculate({ ...base, ...scenario.extra, mddGuide: guide });
      for (const id of scenario.ids) {
        const drug = out.drugs.find(r => r.drug.id === id);
        check(`${guide} · ${scenario.name} · ${id}`, drug && drug.category === scenario.category && drug[scenario.collection].some(x => x.id === scenario.rule) && !(drug.dominatedBy || []).length);
      }
    }
  }
  for (const dx of ['ocd', 'panic']) {
    const out = engine.calculate({ ...base, dx, conditions: ['cardiac'], cardiacDetail: 'recentmi' });
    const drug = out.drugs.find(r => r.drug.id === 'clo');
    check(`${dx} · противопоказание кломипрамина`, drug && drug.category === 'limited' && drug.limits.some(x => x.id === 'TCA_CARDIAC'));
  }
  for (const extra of [
    { conditions: ['cardiac'], cardiacDetail: 'other' },
    { conditions: ['glaucoma'], glaucomaDetail: 'risk' },
    { conditions: ['urinary'], urinaryDetail: 'symptoms' },
    { age: '74' }
  ]) {
    const out = engine.calculate({ ...base, ...extra });
    for (const id of ['ami', 'clo', 'ago']) {
      const drug = out.drugs.find(r => r.drug.id === id);
      check(`Нет автоматического запрета · ${JSON.stringify(extra)} · ${id}`, drug && !drug.limits.length && !drug.unknown.length);
    }
  }
  const coronary = engine.calculate({ ...base, conditions: ['cardiac'], cardiacDetail: 'coronary' }).drugs.find(r => r.drug.id === 'clo');
  check('Коронарный запрет амитриптилина не переносится автоматически на кломипрамин', coronary && !coronary.limits.length && coronary.risks.some(x => x.id === 'CARDIAC'));
  for (const extra of [{ bipolar: 'yes' }, { suicide: 'active' }, { preg: 'yes' }, { age: '17' }, { medications: ['maoi'] }]) {
    check(`Стоп-маршрут · ${JSON.stringify(extra)}`, engine.calculate({ ...base, ...extra }).drugs.length === 0);
  }
  check('Противоречие: курсы есть, но выбран статус «курсов не было»', engine.calculate({ ...base, historyStatus: 'none' }).gate.missing.includes('Согласовать анамнез терапии'));
  for (const version of ['0.1', '0.2', '0.3']) {
    const profile = { ...base };
    if (version !== '0.3') { delete profile.cardiacDetail; delete profile.glaucomaDetail; delete profile.urinaryDetail; }
    const migrated = engine.validateImport({ schema: 'antidepressant-profile', version, profile });
    check(`Импорт ${version} сохраняет неопределённость кардиального анамнеза`, migrated.cardiacDetail === 'unknown');
  }
  const full = engine.calculate({ ...base, liver: 'severe', conditions: ['cardiac', 'glaucoma', 'urinary'], cardiacDetail: 'recentmi', glaucomaDetail: 'confirmed', urinaryDetail: 'retention' });
  check('Несколько противопоказаний сохраняются в объяснении', full.drugs.find(x => x.drug.id === 'clo').limits.length >= 4);
  return results;
}
