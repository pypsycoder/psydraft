'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const base = path.join(__dirname, '..');
function scripts(html) {
    return Array.from(html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi))
        .filter(match => !/type="application\/json"/i.test(match[1]));
}
function documents() {
    const html = fs.readFileSync(path.join(base, 'antidepressant-assistant.html'), 'utf8');
    const data = html.match(/<script type="application\/json" id="pd-embedded-documents">([\s\S]*?)<\/script>/);
    assert.ok(data, 'the combined artifact must contain its offline documents');
    return { html, embedded: JSON.parse(data[1]) };
}
test('standalone and both combined documents parse after print sheet and bridge generation', () => {
    const { html, embedded } = documents();
    const standalone = fs.readFileSync(path.join(base, '../psychstatus/dist/psychstatus.html'), 'utf8');
    const all = { standalone, shell: html, ...embedded };
    for (const [name, document] of Object.entries(all)) {
        assert.doesNotMatch(document, /<!--\s*INCLUDE\b/);
        assert.doesNotMatch(document, /<script\b[^>]*\bsrc=/i, 'offline code must be inline');
        const prepared = document.replaceAll('__PD_SESSION_TOKEN__', 'test-session').replace('__PD_CASE_SEED__', JSON.stringify({ raw: null, error: null }));
        const entries = scripts(prepared);
        assert.ok(entries.length > 0, name);
        entries.forEach((entry, index) => { assert.doesNotThrow(() => new vm.Script(entry[2], { filename: name + '-' + index + '.js' })); });
    }
});
test('the combined artifact includes scales without weakening its iframe or network restrictions', () => {
    const { html, embedded } = documents();
    const frames = Array.from(html.matchAll(/<iframe\b[^>]*\bsandbox="([^"]*)"[^>]*>/g));
    assert.equal(frames.length, 2);
    frames.forEach(frame => {
        assert.ok(frame[1].includes('allow-scripts'));
        assert.ok(!frame[1].includes('allow-same-origin'));
    });
    assert.match(html, /connect-src 'none'/);
    for (const id of ['sops', 'bnss', 'cdss', 'spi-a', 'cssrs']) assert.ok(embedded.draft.includes("id: '" + id + "'"), id);
    assert.equal((embedded.draft.match(/id="section-scales"/g) || []).length, 1);
    assert.match(embedded.draft, /PsyCaseStorageProvider/);
    assert.ok(embedded.draft.indexOf('window.PsyCaseStorageProvider=') < embedded.draft.indexOf('const FORM_SCHEMA'), 'storage bootstrap precedes case initialization');
    assert.doesNotMatch(embedded.compass, /id="section-scales"/);
});
test('raw scale totals never become source symptoms or overwrite clinical diagnosis and manual Compass choices', () => {
    const context = vm.createContext({ JSON, Object, String, Set });
    vm.runInContext(fs.readFileSync(path.join(base, 'src/bridge-map.js'), 'utf8'), context);
    const raw = { diagnosis: 'F41.1 Генерализованное тревожное расстройство', age: '38', confirmed: false,
        scalars: {}, groups: { conditions: [], medications: [], priorities: [], 'red-flags': [] },
        sleep: [], attention: [], memory: [], emotions: [], history: [] };
    const original = JSON.stringify(context.mapPsyDraftSnapshot(raw));
    const withScales = { ...raw, scales: { assessments: { bnss: { total: 78 }, cdss: { total: 27 }, sops: { total: 114 }, cssrs: { severity: 5 } } } };
    assert.equal(JSON.stringify(context.mapPsyDraftSnapshot(withScales)), original);
    assert.equal(context.mapPsyDraftSnapshot(withScales).profile.dx, 'gad');
    assert.equal(context.mapPsyDraftSnapshot(withScales).profile.symptoms.length, 0);
    assert.equal(context.mapPsyDraftSnapshot(withScales).profile.severity, undefined);
    assert.equal(context.mapPsyDraftSnapshot(withScales).profile.targets, undefined);
});
