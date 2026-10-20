'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
function load() {
    const context = vm.createContext({ Object, Array, Set, JSON, Number, String });
    for (const file of ['full-spia.js', 'spia-criteria.js']) vm.runInContext(fs.readFileSync(path.join(__dirname, '../src/js/scales', file), 'utf8'), context, { filename: file });
    return context.PsyScales;
}
const ids = ['B1','C5','O3','O7','C2','C3','C4','D3','D4','O1','O2','O8','D5','F2','F3','O4.1','O4.2','O4.3','O4.4','O4.5','O4.6','O4.7','O4.8','O4.9','O4.10','F5','O5.1','O5.2'];
function empty() { return { answers: {}, details: { basicSymptoms: {} } }; }
function zero() { const a = empty(); ids.forEach(id => { a.answers[id] = 0; }); a.details.basicSymptomPeriodConfirmed = true; return a; }
function positive(a, id, onset = true, rating = 3) { a.answers[id] = rating; a.details.basicSymptoms[id] = { clinicallyConfirmed: true, onset12Months: onset }; }

test('basic-symptom criteria data is explicitly a subset with 28 unique original codes and no invented interview questions', () => {
    const S = load(), d = S.basicSymptomCriteriaDefinition;
    assert.equal(d.id, 'spi-a'); assert.equal(d.fullInstrument, false); assert.equal(d.mode, 'basic-symptom-criteria');
    assert.match(d.title, /не полное интервью/); assert.match(d.translationVersion, /Рабочая/);
    assert.deepEqual([...d.items.map(item => item.id)].sort(), [...ids].sort());
    assert.equal(new Set(d.items.map(item => item.id)).size, 28);
    assert.deepEqual([...d.anchors.map(anchor => anchor.value)], [0,1,2,3,4,5,6,7,8,9]);
    assert.ok(d.items.every(item => !item.question && item.min === 0 && item.max === 9));
    assert.match(d.instructions.join(' '), /не менее 12 месяцев/);
});

test('unassessed basic symptoms remain insufficient and all explicit zeros complete without a total score', () => {
    const S = load(), a = empty();
    let r = S.evaluateBasicSymptomCriteria(a);
    assert.equal(r.complete, false); assert.equal(r.cogdis.value, null); assert.equal(r.coper.value, null);
    r = S.evaluateBasicSymptomCriteria(zero());
    assert.equal(r.complete, true); assert.equal(r.cogdis.value, false); assert.equal(r.coper.value, false);
    assert.equal(r.total, null); assert.equal(r.max, null); assert.equal(r.partialTotal, null);
});

test('COGDIS requires two of its nine categories and has no COPER onset condition', () => {
    const S = load(), a = zero(); positive(a, 'B1', false);
    let r = S.evaluateBasicSymptomCriteria(a);
    assert.equal(r.cogdis.value, false); assert.equal(r.coper.value, false);
    positive(a, 'C5', false, 6); r = S.evaluateBasicSymptomCriteria(a);
    assert.equal(r.complete, true); assert.equal(r.cogdis.value, true); assert.equal(r.cogdis.qualifyingCount, 2);
    assert.equal(r.coper.value, false);
});

test('COPER binds frequency and confirmed first onset to the same eligible symptom', () => {
    const S = load(), a = zero(); positive(a, 'O1', false);
    let r = S.evaluateBasicSymptomCriteria(a);
    assert.equal(r.complete, true); assert.equal(r.coper.value, false);
    a.details.basicSymptoms.O1.onset12Months = null; r = S.evaluateBasicSymptomCriteria(a);
    assert.equal(r.complete, false); assert.equal(r.coper.value, null);
    a.details.basicSymptoms.O1.onset12Months = true; r = S.evaluateBasicSymptomCriteria(a);
    assert.equal(r.complete, true); assert.equal(r.coper.value, true); assert.equal(r.coper.qualifyingCount, 1);
    a.details.basicSymptoms.O1.clinicallyConfirmed = null; r = S.evaluateBasicSymptomCriteria(a);
    assert.equal(r.complete, false); assert.equal(r.coper.value, null);
    a.details.basicSymptoms.O1.clinicallyConfirmed = false; r = S.evaluateBasicSymptomCriteria(a);
    assert.equal(r.complete, true); assert.equal(r.coper.value, false);
});

test('visual and auditory subitems are counted once per category without mixing onset from a different phenomenon', () => {
    const S = load(), a = zero();
    positive(a, 'D5', false, 6); positive(a, 'F2', true, 1);
    let r = S.evaluateBasicSymptomCriteria(a);
    assert.equal(r.coper.value, false, 'high frequency of new D5 cannot borrow old onset from rare F2');
    positive(a, 'F2', true, 3); positive(a, 'O4.1', true, 4); positive(a, 'O4.10', true, 6);
    r = S.evaluateBasicSymptomCriteria(a);
    assert.equal(r.coper.qualifyingCount, 1); assert.equal(r.cogdis.value, false);
    positive(a, 'F5', true, 3); positive(a, 'O5.1', true, 6); positive(a, 'O5.2', true, 4);
    r = S.evaluateBasicSymptomCriteria(a);
    assert.equal(r.coper.qualifyingCount, 2);
    assert.deepEqual([...r.coper.qualifyingGroups].sort(), ['auditory', 'visual']);
});

test('special codes 7/8/9 are never mistaken for severe frequency and malformed ratings never become zero', () => {
    const S = load(), a = zero();
    positive(a, 'C2', true, 7); positive(a, 'C3', true, 7);
    let r = S.evaluateBasicSymptomCriteria(a);
    assert.equal(r.complete, true); assert.equal(r.cogdis.value, false); assert.equal(r.coper.value, false);
    for (const code of [8,9,null,'',undefined,-1,10,3.5,'3',false]) {
        const b = zero(); b.answers.C2 = code; r = S.evaluateBasicSymptomCriteria(b);
        assert.equal(r.complete, false, String(code)); assert.equal(r.coper.value, null, String(code));
    }
});

test('period confirmation and unknown operands block completion even when a positive criterion is already established', () => {
    const S = load(), a = zero();
    a.details.basicSymptomPeriodConfirmed = false;
    let r = S.evaluateBasicSymptomCriteria(a);
    assert.equal(r.cogdis.value, null); assert.equal(r.coper.value, null); assert.equal(r.complete, false);
    const b = empty(); b.details.basicSymptomPeriodConfirmed = true; positive(b, 'B1'); positive(b, 'C5');
    r = S.evaluateBasicSymptomCriteria(b);
    assert.equal(r.cogdis.value, true); assert.equal(r.complete, false); assert.equal(r.coper.value, null);
    assert.ok(r.warnings.length);
});

test('criteria evaluation is deterministic and never modifies frozen assessment operands', () => {
    const S = load(), a = zero(); positive(a, 'C2'); positive(a, 'C3');
    const before = JSON.stringify(a);
    Object.values(a.details.basicSymptoms).forEach(Object.freeze);
    Object.freeze(a.answers); Object.freeze(a.details.basicSymptoms); Object.freeze(a.details); Object.freeze(a);
    const r1 = S.evaluateBasicSymptomCriteria(a), r2 = S.evaluateBasicSymptomCriteria(a);
    assert.equal(JSON.stringify(r1), JSON.stringify(r2)); assert.equal(JSON.stringify(a), before);
    assert.equal(r1.cogdis.value, true); assert.equal(r1.coper.value, true);
});
