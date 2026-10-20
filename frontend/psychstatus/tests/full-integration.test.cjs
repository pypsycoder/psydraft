'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { setup } = require('./helpers/scale-dom.cjs');
function appWithStore() {
    const app = setup({ full: true });
    const state = { caseId: 'full-case', scales: { assessments: {}, history: [] } };
    app.context.PsyCase = { get: () => state, save() {} };
    vm.runInContext(fs.readFileSync(path.join(__dirname, '../src/js/scales/storage-adapter.js'), 'utf8'), app.context);
    return { ...app, state };
}
function negative(S) {
    const a = S.createAssessment('cssrs', 'full-case');
    ['q1', 'q2', 'behavior_actual', 'behavior_nssi', 'behavior_interrupted', 'behavior_aborted', 'behavior_preparatory', 'behavior_summary'].forEach(id => { a.answers[id] = false; });
    return a;
}
function positive(S) {
    const a = negative(S);
    ['q1', 'q2', 'q3', 'q4', 'q5'].forEach(id => { a.answers[id] = true; });
    a.answers.intensity_type = 5;
    ['frequency', 'duration', 'control', 'deterrents', 'reasons'].forEach(id => { a.answers['intensity_' + id] = 5; });
    return a;
}
test('full definitions activate together and preserve numeric domain arithmetic and editable SOPS period', () => {
    const { S } = setup({ full: true });
    for (const id of ['sops', 'bnss', 'cdss']) {
        const a = S.createAssessment(id, 'full-case');
        S.getDefinition(id).items.forEach(item => { a.answers[item.id] = item.max; });
        assert.equal(S.getDefinition(id).mode, 'interview');
        if (id === 'sops') { assert.equal(S.evaluate(a).complete, false); a.period = 'Последний месяц'; }
        const r = S.evaluate(a); assert.equal(r.complete, true); assert.equal(r.total, { sops: 114, bnss: 78, cdss: 27 }[id]);
        assert.ok(S.getDefinition(id).items.every(item => item.anchors.length === item.max + 1));
    }
    const a = S.createAssessment('bnss', 'full-case');
    [2, 3, 1, 4, 2, 1, 3, 2, 1, 2, 3, 1, 3].forEach((value, index) => { a.answers['B' + (index + 1)] = value; });
    const r = S.evaluate(a); assert.equal(r.total, 28); assert.equal(r.domains.motivation.value, 14); assert.equal(r.domains.expression.value, 10);
});
test('missing or unknown saved instrument versions cannot be promoted to a completed full interview', () => {
    const { S } = setup({ full: true }); const a = S.createAssessment('bnss', 'full-case');
    Object.keys(a.answers).forEach(id => { a.answers[id] = 0; });
    assert.equal(S.evaluate(a).complete, true);
    a.scaleVersion = ''; assert.equal(S.evaluate(a).complete, false); assert.equal(S.getDefinition('bnss', a), null);
    a.scaleVersion = 'unknown'; assert.equal(S.evaluate(a).complete, false);
});
test('full C-SSRS keeps behavior independent of ideation and NSSI separate from attempts', () => {
    const { S } = setup({ full: true }); const a = negative(S);
    assert.equal(S.evaluate(S.createAssessment('cssrs', 'full-case')).intensityApplicable, null);
    assert.equal(S.validate(a).required, 8); assert.equal(S.evaluate(a).complete, true);
    assert.equal(S.evaluate(a).severity, 0); assert.equal(S.evaluate(a).intensityTotal, null); assert.equal(S.evaluate(a).total, null);
    a.answers.behavior_nssi = true;
    assert.equal(S.evaluate(a).complete, true); assert.equal(S.evaluate(a).behavior, false); assert.equal(S.evaluate(a).nssi, true);
    assert.match(S.resultText(a), /несуицидальные самоповреждения — да/);
    a.answers.behavior_summary = true;
    assert.equal(S.evaluate(a).complete, false); assert.equal(S.evaluate(a).behavior, null);
    a.answers.behavior_summary = null; assert.equal(S.evaluate(a).behavior, null);
});
test('full C-SSRS intensity requires the identified most severe idea and all five operands', () => {
    const { S } = setup({ full: true }); const a = positive(S);
    assert.equal(S.evaluate(a).complete, true); assert.equal(S.evaluate(a).severity, 5); assert.equal(S.evaluate(a).intensityTotal, 25);
    a.answers.intensity_type = 1;
    assert.equal(S.evaluate(a).complete, false); assert.equal(S.evaluate(a).intensityTotal, null); assert.equal(S.evaluate(a).severity, 5);
    a.answers.intensity_type = 5; a.answers.intensity_control = 0; a.answers.intensity_deterrents = 0; a.answers.intensity_reasons = 0;
    assert.equal(S.evaluate(a).intensityTotal, 10);
    a.answers.intensity_duration = null; assert.equal(S.evaluate(a).intensityTotal, null);
});
test('revealed full interview sections retain their source order and typed operands save on input', () => {
    const app = appWithStore();
    const panel = app.document.createElement('div'); panel.id = 'scales-panel';
    const tabs = app.document.createElement('div'); tabs.id = 'scales-tabs';
    app.document.body.append(panel, tabs); app.S.init();
    tabs.children.find(tab => tab.dataset.scale === 'cssrs').click();
    const q1 = app.document.getElementById('scales-answer-cssrs-q1'); q1.value = 'true'; q1.dispatch('change');
    const groups = panel.querySelector('#scales-items').children.map(node => node.dataset.group);
    assert.ok(groups.indexOf('intensity') < groups.indexOf('behavior'));
    const type = app.document.getElementById('scales-answer-cssrs-intensity_type'); type.value = '1'; type.dispatch('input');
    assert.equal(app.S.store.get('cssrs').answers.intensity_type, 1);
});
test('full C-SSRS requires actual-attempt quantities and actual/potential injury without inferring missing zeros', () => {
    const { S } = setup({ full: true }); const a = negative(S);
    a.answers.behavior_actual = true; a.answers.behavior_summary = true;
    assert.equal(S.evaluate(a).complete, false);
    a.answers.actual_count = 1;
    for (const prefix of ['latest', 'worst', 'first']) a.answers['lethality_' + prefix + '_actual'] = 0;
    assert.equal(S.evaluate(a).complete, false);
    for (const prefix of ['latest', 'worst', 'first']) a.answers['lethality_' + prefix + '_potential'] = 0;
    assert.equal(S.evaluate(a).complete, true); assert.equal(S.evaluate(a).behavior, true);
    a.answers.actual_count = 0; assert.equal(S.evaluate(a).complete, false);
    a.answers.actual_count = 1; a.answers.lethality_latest_date = '2099-01-01'; assert.equal(S.evaluate(a).complete, false);
});
test('full C-SSRS revision retains prior positive branches and historical evidence until explicit confirmation', () => {
    const { S, state } = appWithStore(); const a = positive(S); state.scales.assessments.cssrs = a;
    S.store.update('cssrs', current => { current.answers.q1 = false; current.answers.q2 = false; });
    assert.equal(S.evaluate(a).complete, false); assert.equal(S.evaluate(a).severity, null); assert.equal(S.evaluate(a).behavior, null);
    assert.equal(a.answers.q5, true);
    assert.equal(S.store.confirmRevision('cssrs'), true);
    assert.equal(S.evaluate(a).complete, true); assert.equal(S.evaluate(a).severity, 0);
    assert.equal(a.answerRevisionHistory[0].previousAnswers.q5, true);
    assert.equal(a.answers.intensity_frequency, null); assert.equal(Object.isFrozen(a.answerRevisionHistory[0]), true);
});
test('C-SSRS form changes create a separate version and never carry full answers into the screener', () => {
    const { S, state } = appWithStore(); state.scales.assessments.cssrs = positive(S);
    const firstId = state.scales.assessments.cssrs.id;
    const recent = S.store.setForm('cssrs', 'recent');
    assert.notEqual(recent.id, firstId); assert.equal(S.getDefinition('cssrs', recent).mode, 'cssrs');
    assert.equal(recent.answers.q1, null); assert.equal(S.store.history('cssrs').length, 1);
    const full = S.store.setForm('cssrs', 'kr-baseline'); assert.equal(S.getDefinition('cssrs', full).mode, 'cssrs-full');
    assert.equal(full.answers.behavior_actual, null); assert.equal(S.store.setForm('cssrs', 'followup'), false);
    full.form = 'damaged-form';
    assert.equal(S.store.newAssessment('cssrs').form, 'kr-baseline');
});
test('criteria completeness, Russian comparisons and print sheets retain independent COGDIS/COPER operands', () => {
    const { S } = setup({ full: true }); const a = S.createAssessment('spi-a', 'full-case');
    S.getDefinition('spi-a').items.forEach(item => { a.answers[item.id] = 0; });
    assert.equal(S.validate(a).complete, false); assert.equal(S.evaluate(a).complete, false);
    a.details.basicSymptomPeriodConfirmed = true;
    assert.equal(S.validate(a).complete, true); assert.equal(S.evaluate(a).coper.value, false);
    const previous = JSON.parse(JSON.stringify(a)); previous.id = 'prior-criteria';
    a.answers.C2 = 3; a.details.basicSymptoms = { C2: { clinicallyConfirmed: true, onset12Months: true } };
    assert.equal(S.evaluate(a).complete, true); assert.equal(S.evaluate(a).coper.value, true);
    const comparison = S.compareAssessments(a, previous);
    assert.equal(comparison.rows[1].current, 'Критерии выполнены'); assert.equal(comparison.rows[1].delta, null);
    const html = S.printSheetHTML(a);
    assert.match(html, /не менее 12 месяцев назад: Да/); assert.match(html, /COPER/); assert.match(html, /не полное интервью/);
});
test('full print sheets preserve source questions, zero anchors, selected criteria and unsafe hidden evidence', () => {
    const { S } = setup({ full: true }); const a = positive(S);
    a.answers.q1 = false; a.answers.q2 = false;
    const sheet = S.buildPrintSheet(a).textContent;
    assert.match(sheet, /ранее положительный ответ/); assert.match(sheet, /реальная опасность/);
    assert.match(sheet, /Оценка не завершена/);
    const b = S.createAssessment('cdss', 'full-case'); b.answers.C1 = 0;
    assert.match(S.buildPrintSheet(b).textContent, /Критерий: Отсутствует/);
});
