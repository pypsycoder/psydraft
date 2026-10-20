'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const source = path.join(__dirname, '../src/js');

function setup(stored, options = {}) {
    const saved = new Map(stored === undefined ? [] : [['psydraft.case.v1', stored]]);
    const listeners = {};
    const windowListeners = {};
    const events = [];
    const controls = [
        { id: 'complaints', tagName: 'TEXTAREA', type: 'textarea', value: '', defaultValue: '', disabled: false },
        { id: 'test-checkbox', tagName: 'INPUT', type: 'checkbox', value: 'yes', checked: false, defaultChecked: false, disabled: false },
        { id: 'scale-answer', tagName: 'INPUT', type: 'number', value: '', defaultValue: '', disabled: false, isScale: true }
    ];
    const editors = [
        { id: 'recommendations', innerHTML: '', isContentEditable: true },
        { id: 'result', innerHTML: '', isContentEditable: true }
    ];
    const nodes = [...controls, ...editors,
        { id: 'case-storage-status', textContent: '' }, { id: 'new-case' }, { id: 'rx-submit-btn' },
        { id: 'nosology-results', replaceChildren() { this.cleared = true; } }
    ];
    nodes.forEach(node => {
        node.dataset = {};
        node.style = {};
        node.closest = selector => node.isScale && selector.includes('#section-scales') ? {} : null;
        node.addEventListener = (name, callback) => { node['on' + name] = callback; };
        node.dispatchEvent = event => { if (node['on' + event.type]) node['on' + event.type](event); return true; };
        node.querySelectorAll = () => [];
    });
    const document = {
        getElementById: id => nodes.find(node => node.id === id) || null,
        querySelectorAll: selector => selector === 'input, select, textarea' ? controls : selector === '[contenteditable="true"]' ? editors : [],
        addEventListener: (name, callback) => { (listeners[name] ||= []).push(callback); },
        dispatchEvent: event => { events.push(event); (listeners[event.type] || []).forEach(callback => callback(event)); },
        createElement: tag => ({
            innerHTML: '', content: { querySelectorAll: () => [] }, querySelectorAll: () => []
        })
    };
    const context = vm.createContext({
        console, document, Date, Math, Object, JSON, Number, String, Set, Map,
        Event: class Event { constructor(type) { this.type = type; } },
        CustomEvent: class CustomEvent { constructor(type, init) { this.type = type; this.detail = init.detail; } },
        setTimeout: () => 1, clearTimeout: () => {},
        addEventListener: (name, callback) => { (windowListeners[name] ||= []).push(callback); }, confirm: () => options.confirm !== false,
        localStorage: {
            getItem: key => { if (options.blockRead) throw new Error('Storage denied'); return saved.get(key) || null; },
            setItem: (key, value) => { if (options.blockWrite) throw new Error('Quota'); saved.set(key, value); },
            removeItem: key => saved.delete(key)
        }
    });
    context.window = context;
    vm.runInContext('let prescriptions = []; let rxNextId = 1; let rxEditingId = null; const selectedRecs = {}; let activeGroup = "sleep"; var _checkedClarifyLabels = {}; const autoMonitoringRecIds = new Set();', context);
    ['state/schema', 'state/defaults', 'state/storage', 'scales/registry', 'scales/definitions',
        'scales/validation', 'scales/scoring', 'scales/interpretation', 'scales/storage-adapter', 'scales/report-adapter'].forEach(name => {
        vm.runInContext(fs.readFileSync(path.join(source, name + '.js'), 'utf8'), context, { filename: name + '.js' });
    });
    return { context, api: context.PsyCase, S: context.PsyScales, saved, nodes, controls, editors, events, windowListeners };
}

function complete(S, id, caseId, score = 0) {
    const assessment = S.createAssessment(id, caseId);
    S.getDefinition(id).items.forEach(item => { assessment.answers[item.id] = score; });
    return assessment;
}

test('one shared storage record restores fields, editor, prescriptions, recommendations and incomplete scales', () => {
    const first = setup();
    first.api.init();
    first.controls[0].value = 'Жалобы пациента';
    first.controls[1].checked = true;
    first.controls[2].value = '5';
    first.editors[0].innerHTML = 'Авторская рекомендация';
    first.editors[1].innerHTML = '<p>Ручное заключение</p>';
    vm.runInContext('prescriptions = [{ id: 7, name: "Препарат", times: { утром: "10" } }]; rxNextId = 8; selectedRecs.sleep_hygiene = "full";', first.context);
    const state = first.api.get();
    const assessment = first.S.createAssessment('bnss', state.caseId);
    assessment.answers.B1 = 4;
    state.scales.assessments.bnss = assessment;
    first.api.save();
    assert.equal(first.saved.size, 1);
    const persisted = JSON.parse(first.saved.get('psydraft.case.v1'));
    assert.ok(!Object.keys(persisted.formData.controls).some(key => key.includes('scale-answer')));
    const second = setup(first.saved.get('psydraft.case.v1'));
    second.api.init();
    assert.equal(second.api.get().caseId, state.caseId);
    assert.equal(second.controls[0].value, 'Жалобы пациента');
    assert.equal(second.controls[1].checked, true);
    assert.equal(second.editors[0].innerHTML, 'Авторская рекомендация');
    assert.equal(second.editors[1].innerHTML, '<p>Ручное заключение</p>');
    assert.equal(vm.runInContext('prescriptions[0].id', second.context), 7);
    assert.equal(vm.runInContext('rxNextId', second.context), 8);
    assert.equal(vm.runInContext('selectedRecs.sleep_hygiene', second.context), 'full');
    assert.equal(second.api.get().scales.assessments.bnss.answers.B1, 4);
    assert.equal(second.S.evaluate(second.api.get().scales.assessments.bnss).complete, false);
});

test('new case changes identity and clears patient fields, all scales, history, report and legacy models', () => {
    const app = setup();
    app.api.init();
    const id = app.api.get().caseId;
    app.controls[0].value = 'Чужой пациент';
    app.editors.forEach(editor => { editor.innerHTML = 'Ручной текст'; });
    app.api.get().scales.assessments.bnss = complete(app.S, 'bnss', id, 3);
    app.api.get().scales.history.push(complete(app.S, 'bnss', id, 2));
    vm.runInContext('prescriptions = [{id: 1}]; selectedRecs.test = "short"; _checkedClarifyLabels.test = "Симптом";', app.context);
    app.api.newCase();
    assert.notEqual(app.api.get().caseId, id);
    assert.equal(Object.keys(app.api.get().scales.assessments).length, 0);
    assert.equal(app.api.get().scales.history.length, 0);
    assert.equal(app.controls[0].value, '');
    assert.ok(app.editors.every(editor => editor.innerHTML === ''));
    assert.equal(vm.runInContext('prescriptions.length', app.context), 0);
    assert.equal(vm.runInContext('Object.keys(selectedRecs).length', app.context), 0);
    assert.equal(vm.runInContext('Object.keys(_checkedClarifyLabels).length', app.context), 0);
    assert.equal(app.events.at(-1).type, 'psydraft:case-reset');
    assert.equal(JSON.parse(app.saved.get('psydraft.case.v1')).caseId, app.api.get().caseId);
});

test('corrupt and unsupported saved data survive automatic saves until explicit new case', () => {
    for (const text of ['{broken', JSON.stringify({ schemaVersion: 999, caseId: 'future' })]) {
        const app = setup(text);
        app.api.init();
        app.api.save();
        assert.equal(app.saved.get('psydraft.case.v1'), text);
        assert.match(app.nodes.find(node => node.id === 'case-storage-status').textContent, /остановлено/);
        app.api.newCase();
        assert.notEqual(app.saved.get('psydraft.case.v1'), text);
        assert.equal(JSON.parse(app.saved.get('psydraft.case.v1')).schemaVersion, 1);
    }
});

test('blocked storage retains in-memory drafts and reports a persistent failure', () => {
    const app = setup(undefined, { blockWrite: true });
    app.api.init();
    app.controls[0].value = 'Черновик';
    app.api.save();
    assert.equal(app.api.get().formData.controls['id:complaints:0'].value, 'Черновик');
    assert.equal(app.saved.size, 0);
    assert.equal(app.nodes.find(node => node.id === 'case-storage-status').dataset.state, 'error');
});

test('restoration excludes foreign cases and normalizes damaged assessment containers without trusting cached results', () => {
    const initial = setup();
    initial.api.init();
    const state = initial.api.get();
    const a = complete(initial.S, 'bnss', state.caseId, 6);
    a.answers = null; a.details = false; a.itemComments = []; a.date = {}; a.period = null;
    a.results = { complete: true, total: 78 };
    state.scales.assessments.bnss = a;
    state.scales.assessments.sops = complete(initial.S, 'sops', 'another-case', 6);
    state.scales.history = [complete(initial.S, 'bnss', 'another-case', 6), complete(initial.S, 'bnss', state.caseId, 1)];
    const app = setup(JSON.stringify(state));
    app.api.init();
    assert.ok(!app.api.get().scales.assessments.sops);
    const restored = app.api.get().scales.assessments.bnss;
    assert.equal(restored.results, null);
    assert.equal(restored.date, '');
    assert.equal(app.S.evaluate(restored).complete, false);
    assert.equal(app.api.get().scales.history.length, 1);
    assert.ok(Object.isFrozen(app.api.get().scales.history[0]));
});

test('report includes only complete eligible assessments and clearly labels externally registered scores', () => {
    const app = setup();
    app.api.init();
    const state = app.api.get();
    const a = complete(app.S, 'bnss', state.caseId, 2);
    a.externalFormVersion = 'BNSS 2011';
    a.externalTranslationVersion = 'Русская версия из бланка';
    a.externalSource = 'Источник врача';
    state.scales.assessments.bnss = a;
    let html = app.S.buildReportHTML();
    assert.match(html, /Результаты психометрического обследования/);
    assert.match(html, /26\/78/);
    assert.match(html, /по внешнему оценочному листу/);
    assert.match(html, /BNSS 2011/);
    assert.match(html, /Русская версия из бланка/);
    assert.match(html, /Источник врача/);
    a.includeInReport = false;
    assert.equal(app.S.buildReportHTML(), '');
    a.includeInReport = true;
    a.answers.B1 = null;
    assert.equal(app.S.buildReportHTML(), '');
    a.answers.B1 = 0;
    a.reportComment = 'Независимый комментарий';
    html = app.S.buildReportHTML();
    assert.match(html, /24\/78/);
    assert.match(html, /Независимый комментарий/);
    state.scales.assessments['spi-a'] = complete(app.S, 'spi-a', state.caseId);
    assert.ok(!app.S.buildReportHTML().includes('data-scale-report="spi-a"'));
});

test('new-case button cancellation does not clear patient state', () => {
    const app = setup(undefined, { confirm: false });
    app.api.init();
    const id = app.api.get().caseId;
    app.controls[0].value = 'Сохранить';
    app.nodes.find(node => node.id === 'new-case').onclick();
    assert.equal(app.api.get().caseId, id);
    assert.equal(app.controls[0].value, 'Сохранить');
});

test('new-case button delegates confirmation to the in-page scales dialog when available', () => {
    const app = setup(undefined, { confirm: false });
    app.api.init();
    const id = app.api.get().caseId;
    app.controls[0].value = 'До подтверждения';
    let confirm;
    app.S.confirmAction = (message, onConfirm) => {
        assert.match(message, /Все данные текущего пациента/);
        confirm = onConfirm;
    };
    app.nodes.find(node => node.id === 'new-case').onclick();
    assert.equal(app.api.get().caseId, id);
    assert.equal(app.controls[0].value, 'До подтверждения');
    assert.equal(typeof confirm, 'function');
    confirm();
    assert.notEqual(app.api.get().caseId, id);
    assert.equal(app.controls[0].value, '');
});

test('external case replacement blocks stale tab saves including pagehide and unload; explicit new case resets guard', () => {
    const app = setup();
    app.api.init();
    const originalId = app.api.get().caseId;
    const external = JSON.stringify({ ...JSON.parse(app.saved.get('psydraft.case.v1')), caseId: 'new-patient-in-other-tab', reportHTML: 'Актуальный пациент' });
    app.saved.set('psydraft.case.v1', external);
    app.controls[0].value = 'Данные прошлого пациента из старой вкладки';
    app.api.save();
    assert.equal(app.saved.get('psydraft.case.v1'), external);
    assert.match(app.nodes.find(node => node.id === 'case-storage-status').textContent, /изменён в другой вкладке/);
    for (const event of ['pagehide', 'beforeunload']) app.windowListeners[event].forEach(callback => callback());
    assert.equal(app.saved.get('psydraft.case.v1'), external);
    app.api.newCase();
    assert.notEqual(app.api.get().caseId, originalId);
    assert.notEqual(app.api.get().caseId, 'new-patient-in-other-tab');
    assert.equal(JSON.parse(app.saved.get('psydraft.case.v1')).caseId, app.api.get().caseId);
});

test('external deletion or same-case edits cannot be overwritten by a stale tab', () => {
    for (const remove of [true, false]) {
        const app = setup();
        app.api.init();
        const external = remove ? null : JSON.stringify({ ...JSON.parse(app.saved.get('psydraft.case.v1')), reportHTML: 'Правка другой вкладки того же случая' });
        if (remove) app.saved.delete('psydraft.case.v1');
        else app.saved.set('psydraft.case.v1', external);
        app.api.save();
        assert.equal(app.saved.get('psydraft.case.v1') || null, external);
        assert.equal(app.nodes.find(node => node.id === 'case-storage-status').dataset.state, 'error');
    }
});

test('restored damaged pending revisions remain pending and tolerate later positive-answer edits', () => {
    for (const pending of [true, 'damaged', [], {}, { previousAnswers: null, changedItems: 'q2' }]) {
        const initial = setup();
        initial.api.init();
        const state = initial.api.get();
        const a = complete(initial.S, 'cssrs', state.caseId, false);
        a.answers.q2 = true;
        a.answers.q3 = true;
        a.pendingRevision = pending;
        state.scales.assessments.cssrs = a;
        const app = setup(JSON.stringify(state));
        app.api.init();
        const restored = app.api.get().scales.assessments.cssrs;
        assert.ok(restored.pendingRevision);
        assert.ok(Array.isArray(restored.pendingRevision.changedItems));
        assert.equal(app.S.validate(restored).requiresReview, true);
        assert.equal(app.S.evaluate(restored).complete, false);
        assert.doesNotThrow(() => app.S.store.update('cssrs', assessment => { assessment.answers.q2 = false; }));
        assert.ok(restored.pendingRevision.changedItems.includes('q2'));
        assert.equal(app.S.evaluate(restored).complete, false);
    }
});

test('restored revision history freezes valid snapshots and flags damaged history for clinical review', () => {
    const initial = setup();
    initial.api.init();
    const state = initial.api.get();
    const a = complete(initial.S, 'cssrs', state.caseId, false);
    const revision = {
        id: 'revision-test', confirmedAt: new Date().toISOString(), clinicalRevisionConfirmed: true,
        previousAnswers: { q2: true, q3: true }, revisedAnswers: { q2: false, q3: null }
    };
    a.answerRevisionHistory = [revision, { broken: true }];
    state.scales.assessments.cssrs = a;
    const app = setup(JSON.stringify(state));
    app.api.init();
    const restored = app.api.get().scales.assessments.cssrs;
    assert.equal(restored.answerRevisionHistory.length, 1);
    assert.equal(restored.answerRevisionHistory[0].id, 'revision-test');
    assert.ok(Object.isFrozen(restored.answerRevisionHistory[0]));
    assert.ok(Object.isFrozen(restored.answerRevisionHistory[0].previousAnswers));
    assert.ok(restored.pendingRevision.recoveryRequired);
    assert.equal(app.S.evaluate(restored).complete, false);
});
