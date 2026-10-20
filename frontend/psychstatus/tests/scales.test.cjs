'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const base = path.join(__dirname, '../src/js/scales');
function setup() {
    const context = vm.createContext({ console, Date, Math, Set, Map, JSON, Object, Number, String, RegExp });
    ['registry', 'definitions', 'validation', 'scoring', 'interpretation', 'storage-adapter'].forEach(name => {
        vm.runInContext(fs.readFileSync(path.join(base, name + '.js'), 'utf8'), context, { filename: name + '.js' });
    });
    const state = { caseId: 'case-test', scales: { assessments: {}, history: [] } };
    let saves = 0;
    context.PsyCase = { get: () => state, save: () => { saves++; } };
    return { S: context.PsyScales, state, saved: () => saves };
}
function fill(S, id, score) {
    const a = S.createAssessment(id, 'case-test');
    S.getDefinition(id).items.forEach(item => { a.answers[item.id] = score; });
    return a;
}
test('all answers start unassessed; partial answers never produce a final zero', () => {
    const { S } = setup();
    for (const id of ['bnss', 'cdss', 'sops']) {
        const a = S.createAssessment(id, 'case-test');
        assert.ok(Object.values(a.answers).every(v => v === null));
        assert.equal(S.evaluate(a).complete, false);
        assert.equal(S.evaluate(a).total, null);
        a.answers[S.getDefinition(id).items[0].id] = 0;
        const r = S.evaluate(a);
        assert.equal(r.answered, 1); assert.equal(r.total, null); assert.equal(r.partialTotal, 0);
        assert.equal(S.resultText(a), 'Недостаточно данных');
    }
});
test('BNSS minimum/maximum, six subscales and two domains preserve item 4 direction', () => {
    const { S } = setup();
    assert.equal(S.evaluate(fill(S, 'bnss', 0)).total, 0);
    const a = fill(S, 'bnss', 6); const r = S.evaluate(a);
    assert.equal(r.total, 78); assert.equal(r.max, 78);
    assert.deepEqual(Object.values(r.subscales).map(g => g.value), [18, 6, 12, 12, 18, 12]);
    assert.equal(r.domains.motivation.value, 42); assert.equal(r.domains.expression.value, 30);
    a.answers.B4 = 0;
    assert.equal(S.evaluate(a).total, 72);
    assert.equal(S.evaluate(a).domains.motivation.value, 42);
    assert.equal(S.evaluate(a).domains.expression.value, 30);
    a.secondaryFactors = 'Депрессия, седация, экстрапирамидные проявления';
    assert.equal(S.evaluate(a).total, 72);
});
test('CDSS minimum/maximum and positive item 8 safety warning', () => {
    const { S } = setup();
    assert.equal(S.evaluate(fill(S, 'cdss', 0)).total, 0);
    assert.equal(S.evaluate(fill(S, 'cdss', 3)).total, 27);
    const a = fill(S, 'cdss', 0); a.answers.C8 = 1;
    assert.equal(S.evaluate(a).total, 1);
    assert.ok(S.evaluate(a).warnings.some(v => v.includes('безопасности')));
});
test('SOPS four subscale maxima, flags 3–5/6, and one-point changes', () => {
    const { S } = setup();
    const a = fill(S, 'sops', 6); const r = S.evaluate(a);
    assert.deepEqual(Object.values(r.subscales).map(g => g.value), [30, 36, 24, 24]);
    assert.equal(r.total, 114);
    a.answers.P1 = 3; a.answers.P2 = 5;
    const changed = S.evaluate(a);
    assert.equal(changed.subscales.positive.value, 26);
    assert.equal(changed.positiveFlags[0].level, '3–5');
    assert.equal(changed.positiveFlags[2].level, '6');
    assert.ok(!/\d+\s*%/.test(changed.interpretation));
});
test('range/type validation and metadata validation prevent complete reports', () => {
    const { S } = setup();
    for (const bad of [-1, 7, 1.5, '0', true, NaN, Infinity, 'unable']) {
        const a = fill(S, 'bnss', 0); a.answers.B1 = bad;
        assert.equal(S.evaluate(a).complete, false, String(bad));
        assert.equal(S.evaluate(a).total, null);
    }
    const a = fill(S, 'cdss', 0); a.date = '2026-02-30';
    assert.equal(S.evaluate(a).complete, false);
    a.date = '2026-10-20'; a.period = '';
    assert.equal(S.evaluate(a).complete, false);
});
test('SPI-A remains insufficient even with arbitrary user notes', () => {
    const { S } = setup(); const a = S.createAssessment('spi-a', 'case-test');
    a.details = { cognitive: 'yes', frequency: 'daily', onset: '2020' };
    const r = S.evaluate(a);
    assert.equal(r.complete, false); assert.equal(r.total, null);
    assert.equal(r.cogdis, 'Недостаточно данных'); assert.equal(r.coper, 'Недостаточно данных');
});
test('registry permits a new scale without changing renderer or calculation', () => {
    const { S } = setup();
    S.registerDefinition({ id: 'example', name: 'Example', mode: 'scores', version: '1', period: 'test', items: [{ id: 'x', min: 0, max: 2 }], groups: [{ id: 'g', label: 'Test', items: ['x'], max: 2 }] });
    const a = S.createAssessment('example', 'case-test'); a.answers.x = 2;
    assert.equal(S.evaluate(a).total, 2);
    assert.throws(() => S.registerDefinition({ id: 'example' }));
});
test('single-case adapter isolates resets, snapshots and new assessment identities', () => {
    const { S, state, saved } = setup();
    S.store.update('bnss', a => { Object.keys(a.answers).forEach(key => { a.answers[key] = 1; }); a.reportComment = 'Сохранить комментарий'; });
    S.store.update('cdss', a => { a.answers.C1 = 2; });
    const first = S.store.get('bnss');
    assert.equal(first.results.total, 13); assert.ok(saved() > 0);
    assert.equal(S.store.snapshot('bnss'), true); assert.equal(S.store.snapshot('bnss'), false);
    const archived = S.store.history('bnss')[0];
    assert.equal(Object.isFrozen(archived.answers), true);
    S.store.update('bnss', a => { a.answers.B1 = 6; });
    assert.equal(archived.answers.B1, 1); assert.equal(S.store.get('bnss').results.total, 18);
    const next = S.store.newAssessment('bnss');
    assert.notEqual(next.id, first.id); assert.equal(next.answers.B1, null);
    assert.equal(S.store.history('bnss').length, 2);
    S.store.reset('bnss');
    assert.equal(state.scales.assessments.bnss, undefined);
    assert.equal(state.scales.assessments.cdss.answers.C1, 2);
    state.caseId = 'case-new';
    assert.notEqual(S.store.get('cdss').caseId, 'case-test');
    assert.equal(S.store.get('cdss').answers.C1, null);
    assert.equal(S.store.history('bnss').length, 0);
});
test('manual arithmetic fixtures independent from implementation constants', () => {
    const { S } = setup();
    const a = fill(S, 'bnss', 0);
    [2, 3, 1, 4, 2, 1, 3, 2, 1, 2, 3, 1, 3].forEach((value, i) => { a.answers['B' + (i + 1)] = value; });
    const r = S.evaluate(a);
    assert.equal(r.total, 28); assert.equal(r.domains.motivation.value, 14); assert.equal(r.domains.expression.value, 10);
    const c = fill(S, 'cdss', 0);
    [2, 1, 0, 1, 2, 0, 1, 1, 1].forEach((value, i) => { c.answers['C' + (i + 1)] = value; });
    assert.equal(S.evaluate(c).total, 9);
    const s = fill(S, 'sops', 0);
    Object.entries({ P: [1, 0, 1, 2, 0], N: [3, 2, 4, 3, 2, 3], D: [1, 1, 0, 1], G: [2, 2, 1, 3] }).forEach(([prefix, values]) => {
        values.forEach((value, index) => { s.answers[prefix + (index + 1)] = value; });
    });
    const profile = S.evaluate(s);
    assert.deepEqual(Object.values(profile.subscales).map(group => group.value), [4, 17, 3, 8]);
    assert.equal(profile.total, 32); assert.equal(profile.positiveFlags.length, 0);
});
test('C-SSRS official Russian questions and instructions match the verified source package', () => {
    const { S } = setup();
    const source = JSON.parse(fs.readFileSync(path.join(__dirname, '../../../docs/clinical-scales/C-SSRS-recent-ru-source.json'), 'utf8'));
    const def = S.getDefinition('cssrs');
    assert.equal(def.mode, 'cssrs');
    def.items.forEach(item => { assert.equal(item.question, source.questions[item.id]); });
    ['q3', 'q4', 'q6'].forEach(id => { assert.equal(def.items.find(item => item.id === id).instruction, source.detailsVerbatim[id]); });
});
test('C-SSRS unassessed, negative and conditional branches have no total risk score', () => {
    const { S } = setup();
    const a = S.createAssessment('cssrs', 'case-test');
    assert.equal(S.evaluate(a).complete, false);
    assert.equal(S.evaluate(a).severity, null);
    assert.deepEqual(Array.from(S.visibleItems(a), item => item.id), ['q1', 'q2', 'q6']);
    a.answers.q1 = false; a.answers.q2 = false; a.answers.q6 = false;
    let r = S.evaluate(a);
    assert.equal(r.complete, true); assert.equal(r.required, 3); assert.equal(r.severity, 0);
    assert.equal(r.total, null); assert.equal(r.max, null); assert.equal(r.behavior, false);
    assert.equal(a.answers.q3, null, 'structural skip is not stored as patient denial');
    a.answers.q2 = true;
    assert.deepEqual(Array.from(S.visibleItems(a), item => item.id), ['q1', 'q2', 'q3', 'q4', 'q5', 'q6']);
    assert.equal(S.evaluate(a).complete, false); assert.equal(S.evaluate(a).severity, null);
    a.answers.q3 = true; a.answers.q4 = false; a.answers.q5 = false;
    r = S.evaluate(a);
    assert.equal(r.complete, true); assert.equal(r.severity, 3); assert.equal(r.total, null);
    assert.ok(r.warnings.some(value => value.includes('безопасности')));
    a.answers.q5 = true;
    assert.equal(S.evaluate(a).severity, 5);
});
test('C-SSRS behavior recency is required, never inferred from missing answers', () => {
    const { S } = setup();
    const a = S.createAssessment('cssrs', 'case-test');
    a.answers.q1 = false; a.answers.q2 = false; a.answers.q6 = true;
    let r = S.evaluate(a);
    assert.equal(r.complete, false); assert.equal(r.required, 4); assert.equal(r.recentBehavior, null);
    a.answers.q6recent = false;
    r = S.evaluate(a);
    assert.equal(r.complete, true); assert.equal(r.behavior, true); assert.equal(r.recentBehavior, false);
    assert.equal(r.severity, 0, 'lifetime behavior does not create current ideation');
    assert.ok(r.warnings.some(value => value.includes('безопасности')));
    a.answers.q6recent = true;
    assert.equal(S.evaluate(a).recentBehavior, true);
    a.form = 'followup';
    assert.equal(S.evaluate(a).complete, false, 'unverified Russian follow-up is blocked');
});
test('C-SSRS formerly positive branches require explicit clinical revision before negative report', () => {
    const { S } = setup();
    S.store.update('cssrs', a => { a.answers.q1 = true; a.answers.q2 = true; a.answers.q6 = false; });
    S.store.update('cssrs', a => { a.answers.q3 = true; a.answers.q4 = true; a.answers.q5 = true; });
    assert.equal(S.evaluate(S.store.get('cssrs')).severity, 5);
    S.store.update('cssrs', a => { a.answers.q2 = false; });
    assert.equal(S.store.get('cssrs').answers.q5, true, 'positive evidence must survive pending review');
    assert.equal(S.evaluate(S.store.get('cssrs')).requiresReview, true);
    assert.equal(S.evaluate(S.store.get('cssrs')).severity, null);
    assert.equal(S.evaluate(S.store.get('cssrs')).behavior, null);
    assert.equal(S.evaluate(S.store.get('cssrs')).complete, false);
    assert.equal(S.store.confirmRevision('cssrs'), true);
    assert.equal(S.store.get('cssrs').answers.q3, null);
    assert.equal(S.store.get('cssrs').answers.q5, null);
    assert.equal(S.evaluate(S.store.get('cssrs')).severity, 1);
    assert.equal(S.store.get('cssrs').answerRevisionHistory.length, 1);
    assert.equal(S.store.get('cssrs').answerRevisionHistory[0].previousAnswers.q5, true);
    assert.equal(S.store.setForm('cssrs', 'followup'), false);
    assert.equal(S.store.get('cssrs').form, 'recent');
});
test('C-SSRS restored hidden positives and mismatched period cannot produce a negative complete report', () => {
    const { S } = setup();
    const a = S.createAssessment('cssrs', 'case-test');
    Object.assign(a.answers, { q1: false, q2: false, q5: true, q6: false, q6recent: true });
    assert.equal(S.evaluate(a).complete, false); assert.equal(S.evaluate(a).requiresReview, true);
    a.answers.q5 = null; a.answers.q6recent = null; a.period = 'После последнего визита';
    assert.equal(S.evaluate(a).complete, false);
    assert.ok(S.evaluate(a).errors.some(value => value.includes('Recent')));
});
