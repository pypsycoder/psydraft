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
        PsyCaseStorageProvider: options.provider || null,
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

test('direct clinical and independent report comments survive recalculation and escape markup', () => {
    const app = setup();
    app.api.init();
    const state = app.api.get();
    const a = complete(app.S, 'bnss', state.caseId, 2);
    a.clinicianComment = 'Исходная запись';
    state.scales.assessments.bnss = a;
    const clinician = { innerText: 'Авторская <оценка>\nВторая строка' };
    const independent = { innerText: 'Независимое дополнение' };
    const block = {
        dataset: { scaleReport: 'bnss', assessmentId: a.id },
        querySelector: selector => selector === '[data-scale-clinician-comment]' ? clinician : selector === '[data-scale-report-comment]' ? independent : null
    };
    app.editors[1].querySelectorAll = selector => selector === '[data-scale-report]' ? [block] : [];
    app.S.captureReportEdits();
    assert.equal(a.clinicianComment, clinician.innerText);
    assert.equal(a.reportComment, independent.innerText);
    app.S.store.update('bnss', assessment => { assessment.answers.B1 = 3; });
    const html = app.S.buildReportHTML();
    assert.match(html, /27\/78/);
    assert.match(html, /data-scale-clinician-comment/);
    assert.match(html, /Авторская &lt;оценка&gt;<br>Вторая строка/);
    assert.match(html, /Независимое дополнение/);
    assert.ok(!html.includes('Исходная запись'));
});

test('calculated report override survives comment edits and invalidates after answer changes', () => {
    const app = setup();
    app.api.init();
    const state = app.api.get();
    const a = complete(app.S, 'bnss', state.caseId, 2);
    state.scales.assessments.bnss = a;
    const html = app.S.buildReportHTML();
    const encoded = html.match(/data-scale-fingerprint="([^"]+)"/)[1];
    const fingerprint = encoded.replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
    a.reportOverride = { html: 'Авторская редакция рассчитанного текста', fingerprint };
    a.clinicianComment = 'Новый клинический комментарий';
    a.reportComment = 'Независимый комментарий';
    assert.match(app.S.buildReportHTML(), /Авторская редакция рассчитанного текста/);
    a.answers.B1 = 3;
    const changed = app.S.buildReportHTML();
    assert.ok(!changed.includes('Авторская редакция рассчитанного текста'));
    assert.match(changed, /27\/78/);
    assert.match(changed, /Новый клинический комментарий/);
    assert.match(changed, /Независимый комментарий/);
    assert.equal(a.reportOverride, null);
});

function rendererHarness(app) {
    class Node {
        constructor(tag) {
            this.tagName = tag.toUpperCase(); this.children = []; this.parentNode = null;
            this.dataset = {}; this.style = {}; this.attributes = {}; this.ownText = ''; this.listeners = {};
            const classes = new Set();
            this.classList = { add: value => classes.add(value), remove: value => classes.delete(value), contains: value => classes.has(value) };
        }
        set textContent(value) { this.ownText = String(value); this.children = []; }
        get textContent() { return this.ownText + this.children.map(child => child.textContent).join(' '); }
        appendChild(node) { this.children.push(node); node.parentNode = this; return node; }
        append(...nodes) { nodes.forEach(node => this.appendChild(node)); }
        replaceChildren(...nodes) { this.children = []; this.ownText = ''; this.append(...nodes); }
        setAttribute(name, value) { this.attributes[name] = value; }
        getAttribute(name) { return this.attributes[name] === undefined ? null : this.attributes[name]; }
        removeAttribute(name) { delete this.attributes[name]; }
        addEventListener(name, callback) { (this.listeners[name] ||= []).push(callback); }
        click() { (this.listeners.click || []).forEach(callback => callback({ target: this })); }
        focus() { app.context.document.activeElement = this; }
        showModal() { this.open = true; }
        close() { this.open = false; (this.listeners.close || []).forEach(callback => callback()); }
        cloneNode(deep) { const result = new Node(this.tagName); result.ownText = this.ownText; result.className = this.className; result.attributes = { ...this.attributes }; if (deep) this.children.forEach(child => result.appendChild(child.cloneNode(true))); return result; }
        remove() { if (this.parentNode) this.parentNode.children = this.parentNode.children.filter(node => node !== this); this.parentNode = null; }
        querySelector(selector) {
            for (const child of this.children) {
                if (selector.startsWith('#') && child.id === selector.slice(1)) return child;
                const nested = child.querySelector(selector); if (nested) return nested;
            }
            return null;
        }
    }
    const body = new Node('body');
    const panel = new Node('div');
    const history = new Node('details'); history.id = 'scales-history'; panel.appendChild(history);
    const originalGet = app.context.document.getElementById;
    app.context.document.getElementById = id => body.querySelector('#' + id) || originalGet(id);
    app.context.document.createElement = tag => new Node(tag);
    app.context.document.body = body;
    app.context.document.removeEventListener = () => {};
    app.context.removeEventListener = (name, callback) => { app.windowListeners[name] = (app.windowListeners[name] || []).filter(listener => listener !== callback); };
    app.context.focus = () => {};
    let prints = 0;
    app.context.print = () => { prints++; };
    // Expose private rendering entry points only inside this isolated test VM.
    const code = fs.readFileSync(path.join(source, 'scales/renderer.js'), 'utf8').replace('    S.init = function () {',
        '    S.__rendererTest = { history: refreshHistory, print: printAssessment, setContext(id, node) { activeId = id; panel = node; } };\n    S.init = function () {');
    vm.runInContext(code, app.context, { filename: 'scales/renderer.js' });
    app.S.__rendererTest.setContext('cssrs', panel);
    return { body, history, render: app.S.__rendererTest, prints: () => prints };
}

test('C-SSRS snapshot history shows its prior severity and behavior after reload', () => {
    const initial = setup();
    initial.api.init();
    const state = initial.api.get();
    const snapshot = complete(initial.S, 'cssrs', state.caseId, false);
    snapshot.answers.q2 = true; snapshot.answers.q4 = true; snapshot.answers.q6 = true; snapshot.answers.q6recent = true;
    snapshot.results = initial.S.evaluate(snapshot);
    state.scales.history.push(snapshot);
    state.scales.assessments.cssrs = complete(initial.S, 'cssrs', state.caseId, false);
    const app = setup(JSON.stringify(state));
    app.api.init();
    const dom = rendererHarness(app);
    dom.render.history(app.api.get().scales.assessments.cssrs);
    assert.match(dom.history.textContent, /Максимальная категория тяжести мыслей — 4/);
    assert.match(dom.history.textContent, /суицидальном поведении за жизнь — положительный ответ/);
    assert.match(dom.history.textContent, /поведение за последние 3 месяца — отмечено/);
    assert.ok(!dom.history.textContent.includes('Общая сумма не применяется'));
});

test('detached print sheet preserves hidden positive C-SSRS answers without opening print UI', () => {
    const app = setup();
    app.api.init();
    const state = app.api.get();
    const a = complete(app.S, 'cssrs', state.caseId, false);
    a.answers.q3 = true; a.answers.q6recent = true;
    a.pendingRevision = { previousAnswers: { q2: true, q3: true, q6: true, q6recent: true }, changedItems: ['q2', 'q6'] };
    state.scales.assessments.cssrs = a;
    const dom = rendererHarness(app);
    const sheet = app.S.buildPrintSheet(a);
    assert.equal(dom.prints(), 0);
    assert.ok(sheet);
    for (const id of ['q3', 'q6recent']) {
        const article = sheet.children.find(node => node.tagName === 'ARTICLE' && node.children[0].textContent.startsWith(id + '.'));
        assert.match(article.textContent, /Ответ: Да \(ранее положительный ответ; требуется клинический пересмотр\)/);
        assert.ok(!article.textContent.includes('Пропущено по алгоритму'));
    }
    assert.equal(dom.body.querySelector('#scales-print-root'), null);
    assert.equal(dom.body.classList.contains('scales-printing'), false);
});

const tick = () => new Promise(resolve => setImmediate(resolve));

test('parent storage queues latest state and marks saved only after acknowledgement using the last acknowledged raw version', async () => {
    const requests = [];
    const provider = { read: () => null, write: (text, expected) => new Promise(resolve => { requests.push({ text, expected, resolve }); }) };
    const app = setup(undefined, { provider, blockRead: true, blockWrite: true });
    app.api.init();
    const status = app.nodes.find(node => node.id === 'case-storage-status');
    assert.equal(status.dataset.state, 'saving');
    await tick();
    assert.equal(requests.length, 1);
    assert.equal(requests[0].expected, null);
    app.controls[0].value = 'Первое изменение'; app.api.save();
    app.controls[0].value = 'Последнее изменение'; app.api.save();
    await tick();
    assert.equal(requests.length, 1);
    assert.equal(status.dataset.state, 'saving');
    requests[0].resolve({ ok: true });
    await tick();
    assert.equal(requests.length, 2);
    assert.equal(requests[1].expected, requests[0].text);
    assert.equal(JSON.parse(requests[1].text).formData.controls['id:complaints:0'].value, 'Последнее изменение');
    assert.equal(status.dataset.state, 'saving');
    requests[1].resolve({ ok: true });
    await tick();
    assert.equal(status.dataset.state, 'saved');
    assert.equal(app.saved.size, 0);
});

test('parent storage conflict blocks queued stale saves and embedded new-case requests a shared reset', async () => {
    const requests = []; let resets = 0;
    const provider = {
        read: () => null,
        write: (text, expected) => new Promise(resolve => { requests.push({ text, expected, resolve }); }),
        requestReset: () => { resets++; }
    };
    const app = setup(undefined, { provider });
    app.api.init(); await tick();
    const id = app.api.get().caseId;
    app.controls[0].value = 'Устаревшие данные'; app.api.save();
    requests[0].resolve({ ok: false, code: 'conflict' }); await tick();
    app.api.save(); await tick();
    assert.equal(requests.length, 1);
    assert.match(app.nodes.find(node => node.id === 'case-storage-status').textContent, /изменён в другой вкладке/);
    app.api.newCase();
    assert.equal(resets, 1);
    assert.equal(app.api.get().caseId, id);
});

test('registered case extensions restore before form controls while change handlers observe restoring state', () => {
    const first = setup(); let courses = [{ drug: 'ser', dose: '50' }];
    first.api.registerAdapter('compass-source', { capture: () => ({ courses }), restore: value => { courses = value?.courses || []; } });
    first.api.init(); first.controls[0].value = 'Сохранённое поле'; first.api.save();
    assert.equal(JSON.parse(first.saved.get('psydraft.case.v1')).extensions['compass-source'].courses[0].drug, 'ser');
    const second = setup(first.saved.get('psydraft.case.v1')); let restoredCourses; const restoringFlags = [];
    second.api.registerAdapter('compass-source', {
        capture: () => ({ courses: restoredCourses }),
        restore: value => { restoringFlags.push(second.api.isRestoring); restoredCourses = value?.courses || []; second.controls[0].value = 'Создание динамических полей'; }
    });
    second.controls[1].onchange = () => { restoringFlags.push(second.api.isRestoring); };
    second.api.init();
    assert.equal(restoredCourses[0].drug, 'ser');
    assert.equal(second.controls[0].value, 'Сохранённое поле');
    assert.ok(restoringFlags.every(Boolean));
    assert.equal(second.api.isRestoring, false);
    second.api.setExtension('compass', { profile: { severity: 'moderate', targets: ['insomnia'] } });
    assert.equal(second.api.get().extensions.compass.profile.severity, 'moderate');
    second.api.newCase();
    assert.equal(restoredCourses.length, 0);
    assert.equal(second.api.get().extensions.compass, undefined);
});

test('refused standalone reset preserves the current patient and reports that a new case did not start', () => {
    const app = setup(); app.api.init();
    const id = app.api.get().caseId;
    app.controls[0].value = 'Текущий пациент';
    app.editors[1].innerHTML = '<p>Текущее заключение</p>';
    app.api.get().scales.assessments.bnss = complete(app.S, 'bnss', id, 2);
    app.api.save();
    const oldRaw = app.saved.get('psydraft.case.v1');
    const write = app.context.localStorage.setItem;
    app.context.localStorage.setItem = () => { throw new Error('Storage denied'); };
    app.context.localStorage.removeItem = () => { throw new Error('Reset must not remove the canonical key'); };
    const eventCount = app.events.length;
    app.api.newCase();
    assert.equal(app.api.get().caseId, id);
    assert.equal(app.controls[0].value, 'Текущий пациент');
    assert.equal(app.editors[1].innerHTML, '<p>Текущее заключение</p>');
    assert.equal(app.S.evaluate(app.api.get().scales.assessments.bnss).total, 26);
    assert.equal(app.saved.get('psydraft.case.v1'), oldRaw);
    assert.equal(app.events.length, eventCount);
    assert.match(app.nodes.find(node => node.id === 'case-storage-status').textContent, /Новый случай не начат/);
    app.context.localStorage.setItem = write;
    app.api.newCase();
    assert.notEqual(app.api.get().caseId, id);
    const reloaded = setup(app.saved.get('psydraft.case.v1')); reloaded.api.init();
    assert.equal(reloaded.api.get().caseId, app.api.get().caseId);
    assert.equal(reloaded.controls[0].value, '');
    assert.equal(Object.keys(reloaded.api.get().scales.assessments).length, 0);
});

test('standalone reset leaves a new empty canonical identity even if the following full save fails', () => {
    const app = setup(); app.api.init();
    const id = app.api.get().caseId;
    app.controls[0].value = 'Предыдущий пациент'; app.api.save();
    const write = app.context.localStorage.setItem; let writes = 0;
    app.context.localStorage.setItem = (key, text) => { if (++writes > 1) throw new Error('Quota'); write(key, text); };
    app.api.newCase();
    const reset = JSON.parse(app.saved.get('psydraft.case.v1'));
    assert.notEqual(reset.caseId, id);
    assert.equal(reset.caseId, app.api.get().caseId);
    assert.equal(reset.reportHTML, undefined);
    assert.equal(Object.keys(reset.scales.assessments).length, 0);
    const reloaded = setup(JSON.stringify(reset)); reloaded.api.init();
    assert.equal(reloaded.api.get().caseId, reset.caseId);
    assert.equal(reloaded.controls[0].value, '');
});

test('standalone reset rejects stale writers from both old cases and an originally empty canonical key', () => {
    const active = setup(); active.api.init();
    active.controls[0].value = 'Предыдущий пациент'; active.api.save();
    const shared = active.saved;
    const fromOld = setup(shared.get('psydraft.case.v1'));
    fromOld.context.localStorage.getItem = key => shared.get(key) ?? null;
    fromOld.context.localStorage.setItem = (key, value) => shared.set(key, value);
    fromOld.api.init();
    const fromNull = setup(undefined, { blockWrite: true }); fromNull.api.init();
    fromNull.context.localStorage.getItem = key => shared.get(key) ?? null;
    fromNull.context.localStorage.setItem = (key, value) => shared.set(key, value);
    active.api.newCase();
    const newRaw = shared.get('psydraft.case.v1');
    for (const stale of [fromOld, fromNull]) {
        stale.controls[0].value = 'Устаревший пациент'; stale.api.save();
        assert.equal(shared.get('psydraft.case.v1'), newRaw);
        assert.match(stale.nodes.find(node => node.id === 'case-storage-status').textContent, /изменён в другой вкладке/);
    }
});

test('damaged prescriptions are skipped without coercing doses while valid prescriptions, fields and scales survive reload', () => {
    const initial = setup(); initial.api.init();
    const state = initial.api.get();
    state.formData.controls['id:complaints:0'].value = 'Сохранённое поле';
    state.scales.assessments.bnss = complete(initial.S, 'bnss', state.caseId, 2);
    const valid = [
        { id: 7, name: 'Назначение A', times: { утром: '50' } },
        { id: 8, name: 'Назначение B', durationValue: '14', durationType: 'days', times: { вечером: '' }, comment: 'Авторский комментарий' }
    ];
    state.prescriptions = [
        null, 42, 'scalar', [], {},
        { id: 0, name: 'Нулевой ID', times: {} },
        { id: '2', name: 'Строковый ID', times: {} },
        { id: 3, name: 99, times: {} },
        { id: 4, name: 'Некорректная карта доз', times: [] },
        { id: 5, name: 'Числовая доза', times: { утром: 50 } },
        { id: 6, name: 'Объект вместо дозы', times: { утром: { dose: 10 } } },
        ...valid
    ];
    state.prescriptionEditingId = 5;
    state.prescriptionNextId = 1;
    const app = setup(JSON.stringify(state));
    assert.doesNotThrow(() => app.api.init());
    assert.deepEqual(JSON.parse(JSON.stringify(app.api.get().prescriptions)), valid);
    assert.equal(app.api.get().prescriptionEditingId, null);
    assert.equal(vm.runInContext('rxNextId', app.context), 9);
    assert.equal(app.controls[0].value, 'Сохранённое поле');
    assert.equal(app.S.evaluate(app.api.get().scales.assessments.bnss).total, 26);
    assert.match(app.nodes.find(node => node.id === 'case-storage-status').textContent, /Повреждённые назначения не загружены.*Перепроверьте назначения/);
    assert.doesNotThrow(() => app.api.save());
    const reloaded = setup(app.saved.get('psydraft.case.v1'));
    assert.doesNotThrow(() => reloaded.api.init());
    assert.deepEqual(JSON.parse(JSON.stringify(reloaded.api.get().prescriptions)), valid);
    assert.equal(reloaded.controls[0].value, 'Сохранённое поле');
    assert.equal(reloaded.S.evaluate(reloaded.api.get().scales.assessments.bnss).total, 26);
});
