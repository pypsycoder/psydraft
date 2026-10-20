'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const base = path.join(__dirname, '../src/js/scales');

function setup() {
    const context = vm.createContext({ console, Date, Math, Set, Map, JSON, Object, Number, String, RegExp });
    for (const name of ['registry', 'full-cdss', 'validation', 'scoring', 'interpretation']) {
        vm.runInContext(fs.readFileSync(path.join(base, name + '.js'), 'utf8'), context, { filename: name + '.js' });
    }
    const S = context.PsyScales;
    S.registerDefinition(S.fullDefinitions.cdss);
    return S;
}

test('full Russian CDSS preserves all nine clinical items and the complete 0–3 rating anchors', () => {
    const S = setup();
    const def = S.getDefinition('cdss');
    assert.equal(def.mode, 'interview');
    assert.deepEqual(Array.from(def.items, item => item.id), ['C1', 'C2', 'C3', 'C4', 'C5', 'C6', 'C7', 'C8', 'C9']);
    assert.match(def.version, /2023/);
    assert.match(def.translationVersion, /номер редакции перевода не указан/);
    assert.equal(def.items.reduce((sum, item) => sum + item.anchors.length, 0), 36);
    for (const item of def.items) {
        assert.equal(item.min, 0); assert.equal(item.max, 3);
        assert.ok(item.question.length > 60, item.id + ' needs the actual interview text');
        assert.deepEqual(Array.from(item.anchors, anchor => anchor.value), [0, 1, 2, 3]);
        assert.ok(item.anchors.every(anchor => typeof anchor.label === 'string' && anchor.label.length > 5));
    }
});

test('CDSS source-specific period and observation instructions are preserved rather than silently standardized', () => {
    const S = setup(); const def = S.getDefinition('cdss');
    assert.match(def.instruction, /если не указано иное/);
    assert.match(def.instruction, /в ходе всего интервью/);
    assert.match(def.items[1].anchors[1].label, /За последнюю неделю/);
    assert.match(def.items[1].anchors[2].label, /в течение последней недели/);
    assert.match(def.items[7].question, /когда-нибудь/);
    assert.equal(def.items[8].interviewKind, 'observation');
    assert.match(def.items[8].question, /наблюдениях интервьюера в ходе всего опроса/);
    assert.match(def.items[7].anchors[3].label, /была случайно раскрыта, или использовались неэффективные средства/);
});

test('full interview retains null completeness, the independent manual total of nine and the suicide-item safety gate', () => {
    const S = setup(); const a = S.createAssessment('cdss', 'full-cdss-case');
    assert.equal(S.evaluate(a).complete, false); assert.equal(S.evaluate(a).total, null);
    a.answers.C8 = 1;
    assert.equal(S.evaluate(a).complete, false);
    assert.ok(S.evaluate(a).warnings.some(text => /безопасности/.test(text)));
    const manualAnswers = [2, 1, 0, 1, 2, 0, 1, 1, 1];
    manualAnswers.forEach((value, index) => { a.answers['C' + (index + 1)] = value; });
    assert.equal(S.evaluate(a).complete, true); assert.equal(S.evaluate(a).total, 9);
    for (const item of S.getDefinition('cdss').items) a.answers[item.id] = 3;
    assert.equal(S.evaluate(a).total, 27);
});
