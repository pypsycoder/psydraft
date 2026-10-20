'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const source = path.join(__dirname, '../src');
const key = 'psydraft.case.v1';

function shellFixture(raw, options = {}) {
    const values = new Map(raw === undefined ? [] : [[key, raw]]);
    const messages = [];
    const handlers = {};
    const nodes = new Map();
    const document = { activeElement: null };
    function node(id) {
        const result = {
            id, hidden: id === 'pd-reset-overlay', attributes: {}, textContent: '', inert: false,
            setAttribute(name, value) { this.attributes[name] = value; },
            removeAttribute(name) { delete this.attributes[name]; },
            addEventListener(name, callback) { this['on' + name] = callback; },
            focus() { document.activeElement = this; },
            contentWindow: { postMessage(message) { messages.push({ target: id, message }); } }
        };
        nodes.set(id, result);
        return result;
    }
    for (const id of ['pd-draft-frame', 'pd-compass-frame', 'pd-shell-status', 'pd-embedded-documents',
        'pd-panel-draft', 'pd-panel-compass', 'pd-tab-draft', 'pd-tab-compass', 'pd-new-case',
        'pd-reset-overlay', 'pd-reset-cancel', 'pd-reset-confirm', 'shell-main', 'shell-tabs']) node(id);
    nodes.get('pd-embedded-documents').textContent = JSON.stringify({
        draft: "<script>const token='__PD_SESSION_TOKEN__';globalThis.seed=__PD_CASE_SEED__;</script>",
        compass: "<script>const token='__PD_SESSION_TOKEN__';</script>"
    });
    document.getElementById = id => nodes.get(id);
    document.querySelector = selector => nodes.get(selector === '.pd-shell' ? 'shell-main' : 'shell-tabs');
    const shell = {
        addEventListener(name, callback) { (handlers[name] ||= []).push(callback); }
    };
    const context = vm.createContext({
        window: shell, document, console, Uint32Array,
        localStorage: {
            getItem(name) { if (options.blockRead) throw new Error('Denied'); return values.get(name) ?? null; },
            setItem(name, value) { if (options.blockWrite) throw new Error('Quota'); values.set(name, value); },
            removeItem(name) { if (options.blockRemove) throw new Error('Denied'); values.delete(name); }
        },
        crypto: { getRandomValues(bytes) { for (let i = 0; i < bytes.length; i++) bytes[i] = ++shellFixture.nonce; } }
    });
    const html = fs.readFileSync(path.join(source, 'shell.html'), 'utf8');
    const script = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].at(-1)[1];
    vm.runInContext(script, context, { filename: 'shell.html' });
    const token = () => nodes.get('pd-draft-frame').srcdoc.match(/const token='([^']+)'/)[1];
    function message(data, sender = 'pd-draft-frame') {
        const event = { source: typeof sender === 'string' ? nodes.get(sender).contentWindow : sender, data: { channel: 'psydraft-compass', token: token(), ...data } };
        (handlers.message || []).forEach(callback => callback(event));
    }
    function seed() {
        const code = nodes.get('pd-draft-frame').srcdoc.match(/<script>([\s\S]*)<\/script>/)[1];
        const target = vm.createContext({}); vm.runInContext(code, target); return target.seed;
    }
    return { nodes, values, messages, message, token, seed, html, document };
}
shellFixture.nonce = 0;

test('sandbox seed safely preserves clinical text, Unicode separators and replacement metacharacters', () => {
    const raw = JSON.stringify({ schemaVersion: 1, caseId: 'patient', reportHTML: '</script><script>globalThis.injected=true</script> $& $` $\' \u2028\u2029' });
    const app = shellFixture(raw);
    assert.equal(app.seed().raw, raw);
    assert.equal((app.nodes.get('pd-draft-frame').srcdoc.match(/<script>/g) || []).length, 1);
    assert.ok(!app.nodes.get('pd-draft-frame').srcdoc.includes('globalThis.injected=true</script>'));
    assert.ok(!app.html.includes('allow-same-origin'));
    assert.ok(!app.html.includes('window.confirm('));
});

test('parent accepts only authenticated draft writes and acknowledges only exact expected raw versions', () => {
    const first = JSON.stringify({ schemaVersion: 1, caseId: 'patient', reportHTML: 'До изменения' });
    const next = JSON.stringify({ schemaVersion: 1, caseId: 'patient', reportHTML: 'После изменения' });
    const app = shellFixture(first);
    app.message({ type: 'source-ready', caseId: 'patient' });
    const write = { type: 'case-storage-write', requestId: 1, text: next, expected: first };
    app.message({ ...write, token: 'invalid' });
    app.message(write, {});
    assert.equal(app.values.get(key), first);
    assert.ok(!app.messages.some(item => item.message.type === 'case-storage-ack'));
    app.message(write);
    assert.equal(app.values.get(key), next);
    assert.equal(app.messages.at(-1).message.ok, true);
    app.message({ ...write, requestId: 2 });
    assert.equal(app.values.get(key), next);
    assert.equal(app.messages.at(-1).message.code, 'conflict');
    assert.match(app.nodes.get('pd-shell-status').textContent, /другой вкладке/);
});

test('parent reports storage failures and keeps the canonical case unchanged', () => {
    const raw = JSON.stringify({ schemaVersion: 1, caseId: 'patient' });
    const app = shellFixture(raw, { blockWrite: true });
    app.message({ type: 'source-ready', caseId: 'patient' });
    app.message({ type: 'case-storage-write', requestId: 1, expected: raw, text: JSON.stringify({ schemaVersion: 1, caseId: 'patient', reportHTML: 'Черновик' }) });
    assert.equal(app.values.get(key), raw);
    assert.equal(app.messages.at(-1).message.ok, false);
    assert.equal(app.messages.at(-1).message.code, 'storage');
});

test('one confirmed shell reset clears the canonical case and invalidates stale child messages', () => {
    const raw = JSON.stringify({ schemaVersion: 1, caseId: 'patient', extensions: { compass: { profile: { severity: 'severe' } } } });
    const app = shellFixture(raw);
    const previousToken = app.token();
    app.nodes.get('pd-new-case').onclick();
    assert.equal(app.values.get(key), raw);
    assert.equal(app.nodes.get('pd-reset-overlay').hidden, false);
    assert.equal(app.nodes.get('shell-main').inert, true);
    assert.equal(app.document.activeElement, app.nodes.get('pd-reset-cancel'));
    app.nodes.get('pd-reset-cancel').onclick();
    assert.equal(app.token(), previousToken);
    app.nodes.get('pd-new-case').onclick();
    app.nodes.get('pd-reset-confirm').onclick();
    const resetRaw = app.values.get(key);
    const resetCase = JSON.parse(resetRaw);
    assert.notEqual(resetCase.caseId, 'patient');
    assert.equal(Object.keys(resetCase.extensions).length, 0);
    assert.equal(Object.keys(resetCase.scales.assessments).length, 0);
    assert.equal(resetCase.scales.history.length, 0);
    assert.notEqual(app.token(), previousToken);
    assert.equal(app.seed().raw, resetRaw);
    assert.equal(app.nodes.get('shell-main').inert, false);
    app.message({ type: 'case-storage-write', token: previousToken, requestId: 10, expected: null, text: raw });
    assert.equal(app.values.get(key), resetRaw);
    // Even a different shell that originally observed an empty key cannot resurrect its old case.
    app.message({ type: 'case-storage-write', requestId: 11, expected: null, text: raw });
    assert.equal(app.values.get(key), resetRaw);
    assert.equal(app.messages.at(-1).message.code, 'conflict');
});

test('sandbox bootstrap resolves writes only for matching parent acknowledgements', async () => {
    const posted = []; const handlers = []; const timers = new Map(); let nextTimer = 0;
    const parent = { postMessage: data => posted.push(data) };
    const child = { parent, addEventListener: (name, callback) => { if (name === 'message') handlers.push(callback); } };
    const context = vm.createContext({
        window: child, setTimeout: callback => { timers.set(++nextTimer, callback); return nextTimer; }, clearTimeout: id => timers.delete(id)
    });
    const script = fs.readFileSync(path.join(source, 'case-storage-bridge.js'), 'utf8').replace('__PD_SESSION_TOKEN__', 'trusted').replace('__PD_CASE_SEED__', JSON.stringify({ raw: 'seed-data', error: null }));
    vm.runInContext(script, context);
    assert.equal(child.PsyCaseStorageProvider.read(), 'seed-data');
    let settled = false;
    const writing = child.PsyCaseStorageProvider.write('new-data', 'seed-data').then(value => { settled = true; return value; });
    assert.equal(posted[0].expected, 'seed-data');
    const ack = { channel: 'psydraft-compass', token: 'trusted', type: 'case-storage-ack', requestId: posted[0].requestId, ok: true };
    handlers.forEach(callback => callback({ source: {}, data: ack }));
    handlers.forEach(callback => callback({ source: parent, data: { ...ack, token: 'wrong' } }));
    await Promise.resolve();
    assert.equal(settled, false);
    handlers.forEach(callback => callback({ source: parent, data: ack }));
    assert.equal((await writing).ok, true);
    assert.equal(child.PsyCaseStorageProvider.read(), 'new-data');
    assert.equal(timers.size, 0);
    child.PsyCaseStorageProvider.requestReset();
    assert.equal(posted.at(-1).type, 'case-reset-request');
});

test('invalid source persists a safe compass profile and does not cache the last valid source as already applied', () => {
    const posted = []; const listeners = [];
    const nodes = new Map();
    for (const id of ['import', 'reset', 'example', 'export', 'pd-bridge-note', 'pd-refresh-source', 'pd-open-source', 'pd-source-context', 'profile']) {
        nodes.set(id, { textContent: '', hidden: false, addEventListener() {}, querySelector: () => nodes.get('pd-source-context'), append() {} });
    }
    const parent = { postMessage: message => posted.push(message) };
    const child = { parent, addEventListener: (name, callback) => { if (name === 'message') listeners.push(callback); } };
    let profile = { age: '', dx: '', severity: '', targets: [], policy: 'union', mddGuide: 'rf', foreign: false, symptomLevels: {}, confirmed: false };
    const context = vm.createContext({
        window: child, VERSION: 'test',
        document: { getElementById: id => nodes.get(id), querySelector: () => null, createElement: () => ({ textContent: '' }) },
        state: () => profile,
        applyProfile: value => { profile = value; },
        presentLevel: value => value === 'p',
        validateImport: value => { if (value.profile.age === 'bad') throw new Error('Некорректный возраст'); return value.profile; },
        clinicalGate: value => ({ missing: value.age ? [] : ['Возраст'] })
    });
    vm.runInContext(fs.readFileSync(path.join(source, 'compass-bridge.js'), 'utf8').replace('__PD_SESSION_TOKEN__', 'trusted'), context);
    const send = message => listeners.forEach(callback => callback({ source: parent, data: { channel: 'psydraft-compass', token: 'trusted', ...message } }));
    send({ type: 'restore-case', caseId: 'patient', value: null });
    const snapshot = { schema: 'psydraft-compass-transfer', version: 1, signature: 'valid-source', diagnosisCodes: ['F32'], profile: { age: '38', dx: 'mdd', symptomLevels: { insomnia: 'p' }, confirmed: true } };
    send({ type: 'apply-source', caseId: 'patient', snapshot });
    profile.severity = 'moderate'; profile.targets = ['insomnia'];
    send({ type: 'apply-source', caseId: 'patient', snapshot: { ...snapshot, signature: 'invalid-source', profile: { ...snapshot.profile, age: 'bad' } } });
    const saved = posted.filter(message => message.type === 'compass-state').at(-1).profileState;
    assert.equal(saved.caseId, 'patient');
    assert.equal(saved.profile.age, '');
    assert.equal(saved.profile.dx, '');
    assert.equal(saved.profile.severity, '');
    assert.equal(saved.profile.targets.length, 0);
    assert.equal(saved.sourceFingerprint, '');
    assert.equal(saved.sourceSignature, '');
    assert.equal(posted.at(-1).type, 'compass-error');
    send({ type: 'apply-source', caseId: 'patient', snapshot });
    assert.equal(profile.age, '38');
    assert.equal(profile.dx, 'mdd');
    assert.equal(profile.severity, '');
    assert.equal(posted.at(-1).type, 'compass-imported');
});
