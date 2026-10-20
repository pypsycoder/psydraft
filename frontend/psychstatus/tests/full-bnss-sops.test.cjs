'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const source = JSON.parse(fs.readFileSync(path.join(__dirname, '../../../docs/clinical-scales/full/SOPS_BNSS_KR_RU-source.json'), 'utf8'));
function definitions() {
    const context = vm.createContext({ PsyScales: { fullDefinitions: { existing: { retained: true } } }, Object });
    vm.runInContext(fs.readFileSync(path.join(__dirname, '../src/js/scales/full-bnss-sops.js'), 'utf8'), context);
    return JSON.parse(JSON.stringify(context.PsyScales.fullDefinitions));
}

test('full SOPS and BNSS data preserve all source descriptions, probes and 224 anchors', () => {
    const data = definitions();
    assert.equal(data.existing.retained, true, 'loading this package must preserve other full instruments');
    assert.deepEqual(data.sops, source.definitions.sops);
    assert.deepEqual(data.bnss, source.definitions.bnss);
    const expectedSOPS = ['P1','P2','P3','P4','P5','N1','N2','N3','N4','N5','N6','D1','D2','D3','D4','G1','G2','G3','G4'];
    assert.deepEqual(data.sops.items.map(item => item.id), expectedSOPS);
    assert.deepEqual(data.bnss.items.map(item => item.id), Array.from({ length: 13 }, (_, i) => 'B' + (i + 1)));
    let anchorCount = 0;
    for (const definition of [data.sops, data.bnss]) {
        assert.equal(definition.id, definition === data.sops ? 'sops' : 'bnss');
        assert.equal(definition.mode, 'interview');
        assert.match(definition.source.url, /^https:\/\/apicr\.minzdrav\.gov\.ru\//);
        for (const item of definition.items) {
            assert.deepEqual(item.anchors.map(anchor => anchor.value), [0,1,2,3,4,5,6]);
            assert.equal(item.min, 0); assert.equal(item.max, 6);
            assert.equal(item.anchors.length, 7);
            assert.ok(item.label.length > 4);
            item.anchors.forEach(anchor => {
                assert.ok(anchor.label.length > 8);
                assert.equal(typeof anchor.sourcePrintedValue, 'number');
                assert.doesNotMatch(anchor.label, /СУБШКАЛА|ПУНКТ \d|ШКАЛА ОЦЕНКИ|Степень тяжести:/, 'headings from the next item must not enter an anchor');
            });
            anchorCount += item.anchors.length;
        }
    }
    assert.equal(anchorCount, 224);
});

test('source numbering errors are explicit and mapped to the independently checked BNSS 0–6 levels', () => {
    const data = definitions().bnss;
    for (const id of ['B1','B4','B6','B7','B8']) {
        const item = data.items.find(item => item.id === id);
        assert.deepEqual(item.anchors.map(anchor => anchor.sourcePrintedValue), [1,2,3,4,5,6,7]);
    }
    assert.deepEqual(data.items.find(item => item.id === 'B5').anchors.map(anchor => anchor.sourcePrintedValue), [1,2,3,3,4,5,6]);
    for (const item of data.items) {
        const original = source.englishReferenceAnchors[item.id];
        assert.deepEqual(original.map(anchor => anchor.value), [0,1,2,3,4,5,6]);
        assert.match(original[0].label, /Normal|No impairment/);
        assert.match(original[6].label, /severe/i);
    }
    assert.match(data.items.find(item => item.id === 'B4').anchors[0].label, /способность испытывать дистресс/);
    assert.match(data.items.find(item => item.id === 'B4').anchors[6].label, /не испытывает дистресс/);
    assert.equal(data.errata.length, 3);
    const repaired = data.items[0].anchors[3];
    assert.match(repaired.sourceExactLabel2026, /103 потери интенсивности$/);
    assert.match(repaired.label, /получаемого удовольствия при осуществлении некоторых видов деятельности\.$/);
    assert.match(repaired.anchorSource, /2023/);
    assert.doesNotMatch(repaired.label, /103/);
});

test('interview content distinguishes source clinical descriptions from invented patient questions', () => {
    const data = definitions();
    data.sops.items.forEach(item => { assert.equal(item.question, ''); assert.ok(item.instruction.length > 80); });
    assert.match(data.sops.notice, /полный диагностический протокол SIPS не воспроизводится/);
    assert.equal(data.sops.period, '');
    assert.equal(data.sops.periodEditable, true);
    assert.match(data.sops.instruction, /укажите временной интервал/);
    assert.equal(data.bnss.items[0].question, data.bnss.items[1].question);
    assert.match(data.bnss.items[0].question, /СОЦИАЛЬНАЯ АКТИВНОСТЬ/);
    assert.match(data.bnss.items[0].question, /ФИЗИЧЕСКИЕ ОЩУЩЕНИЯ/);
    assert.match(data.bnss.items[0].question, /РАБОТА И УЧЕБА/);
    assert.match(data.bnss.items[6].question, /работает или учится/);
    data.bnss.items.slice(8).forEach(item => {
        assert.equal(item.question, '');
        assert.match(item.instruction, /наблюдению/);
    });
});
