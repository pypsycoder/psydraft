'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

function definition() {
    const context = vm.createContext({ Object });
    vm.runInContext(fs.readFileSync(path.join(__dirname, '../src/js/scales/full-cssrs.js'), 'utf8'), context);
    return context.PsyScales.fullDefinitions.cssrs;
}
function applies(condition, answers) {
    if (!condition) return true;
    if (condition.all) return condition.all.every(item => applies(item, answers));
    if (condition.any) return condition.any.some(item => applies(item, answers));
    return answers[condition.answer] === condition.equals;
}

test('the KR full C-SSRS names its lifetime edition and includes every source section without pretending to be Since Last Visit', () => {
    const def = definition();
    assert.equal(def.mode, 'cssrs-full'); assert.equal(def.defaultForm, 'kr-baseline');
    assert.equal(def.items.length, 30); assert.equal(new Set(def.items.map(item => item.id)).size, 30);
    assert.match(def.version, /2025/); assert.match(def.version, /за жизнь/);
    assert.match(def.source.url, /apicr\.minzdrav\.gov\.ru.*675_2/);
    assert.deepEqual(Array.from(def.approvedForms), ['kr-baseline']);
    for (const id of ['q1', 'q2', 'q3', 'q4', 'q5', 'intensity_type', 'intensity_description',
        'intensity_frequency', 'intensity_duration', 'intensity_control', 'intensity_deterrents', 'intensity_reasons',
        'behavior_actual', 'actual_count', 'behavior_nssi', 'behavior_interrupted', 'interrupted_count',
        'behavior_aborted', 'aborted_count', 'behavior_preparatory', 'behavior_summary',
        'lethality_latest_date', 'lethality_latest_actual', 'lethality_latest_potential',
        'lethality_worst_date', 'lethality_worst_actual', 'lethality_worst_potential',
        'lethality_first_date', 'lethality_first_actual', 'lethality_first_potential']) {
        assert.ok(def.items.some(item => item.id === id), id);
    }
    assert.ok(def.items.every(item => item.question && item.label && item.group));
});

test('full C-SSRS preserves meaningful zero anchors, real/potential injury codes and the source definitions of behavior', () => {
    const def = definition(); const item = id => def.items.find(item => item.id === id);
    for (const id of ['intensity_frequency', 'intensity_duration']) {
        assert.deepEqual(Array.from(item(id).anchors, anchor => anchor.value), [1, 2, 3, 4, 5]);
    }
    for (const id of ['intensity_control', 'intensity_deterrents', 'intensity_reasons']) {
        assert.deepEqual(Array.from(item(id).anchors, anchor => anchor.value), [0, 1, 2, 3, 4, 5]);
    }
    assert.match(item('intensity_control').anchors[0].label, /Не пытается/);
    assert.match(item('intensity_deterrents').anchors[3].label, /не уверены.*не удержали/);
    assert.match(item('behavior_actual').instruction, /необязательно должно быть стопроцентным/);
    assert.match(item('behavior_actual').instruction, /нанесение себе повреждений или увечий необязательно/);
    assert.match(item('behavior_interrupted').instruction, /Как только человек проглатывает таблетки/);
    assert.match(item('behavior_aborted').instruction, /человек останавливает себя сам/);
    assert.match(item('behavior_nssi').instruction, /безо ВСЯКОГО намерения убить себя/);
    for (const key of ['latest', 'worst', 'first']) {
        assert.deepEqual(Array.from(item('lethality_' + key + '_actual').anchors, anchor => anchor.value), [0, 1, 2, 3, 4, 5]);
        assert.equal(item('lethality_' + key + '_actual').anchors[5].label, 'Смерть.');
        assert.deepEqual(Array.from(item('lethality_' + key + '_potential').anchors, anchor => anchor.value), [0, 1, 2]);
        assert.equal(item('lethality_' + key + '_date').optional, true);
    }
});

test('source dependencies retain behavior without ideation, keep NSSI separate and ask potential injury only after explicit actual zero', () => {
    const def = definition();
    const visible = answers => def.items.filter(item => applies(item.when, answers));
    const negative = { q1: false, q2: false, behavior_actual: false, behavior_nssi: true,
        behavior_interrupted: false, behavior_aborted: false, behavior_preparatory: false, behavior_summary: false };
    const ids = visible(negative).map(item => item.id);
    assert.equal(ids.length, 8);
    assert.ok(ids.includes('behavior_nssi')); assert.ok(!ids.includes('q3'));
    assert.ok(!ids.some(id => id.startsWith('intensity_') || id.startsWith('lethality_') || id.endsWith('_count')));
    const actual = { ...negative, behavior_actual: true, actual_count: 1 };
    const actualIds = visible(actual).map(item => item.id);
    assert.ok(actualIds.includes('actual_count'));
    assert.ok(actualIds.includes('lethality_latest_actual'));
    assert.ok(!actualIds.includes('lethality_latest_potential'), 'missing actual injury is not a zero');
    actual.lethality_latest_actual = 0;
    assert.ok(visible(actual).some(item => item.id === 'lethality_latest_potential'));
    actual.lethality_latest_actual = 1;
    assert.ok(!visible(actual).some(item => item.id === 'lethality_latest_potential'));
    const passive = visible({ ...negative, q1: true });
    assert.ok(passive.some(item => item.id === 'intensity_frequency'));
    assert.ok(!passive.some(item => item.id === 'q3'));
    const active = visible({ ...negative, q2: true });
    assert.ok(active.some(item => item.id === 'q3'));
    assert.ok(active.some(item => item.id === 'intensity_type'));
});
