'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { setup, completeAssessment: complete } = require('./helpers/scale-dom.cjs');

test('BNSS sheet contains all 13 answers, totals, six subscales, both domains, and source metadata', () => {
    const { S, descendants } = setup();
    const assessment = complete(S, 'bnss', 6);
    Object.assign(assessment, { externalFormVersion: 'Разрешённый бланк 2026', externalTranslationVersion: 'Русский перевод A', externalSource: 'Локальный методический материал', clinicianComment: 'Комментарий врача', reportComment: 'Дополнение к заключению', secondaryFactors: 'Седация требует уточнения' });
    assessment.itemComments.B13 = 'Отдельный комментарий к последнему пункту';
    const before = JSON.stringify(assessment);
    const sheet = S.buildPrintSheet(assessment);
    const text = sheet.textContent;
    assert.equal(descendants(sheet).filter(node => node.tagName === 'ARTICLE').length, 13);
    assert.match(text, /13\/13/); assert.match(text, /78\/78/);
    for (const expected of ['Ангедония: 18/18', 'Отсутствие переживания дистресса: 6/6', 'Асоциальность: 12/12', 'Абулия: 12/12', 'Уплощение аффекта: 18/18', 'Алогия: 12/12', 'Апато-мотивационный домен: 42/42', 'Экспрессивный домен: 30/30', '20.10.2026', 'Разрешённый бланк 2026', 'Русский перевод A', 'Локальный методический материал', 'Комментарий врача', 'Дополнение к заключению', 'Седация требует уточнения', 'Отдельный комментарий к последнему пункту']) assert.ok(text.includes(expected), expected);
    assert.equal(JSON.stringify(assessment), before, 'constructing a sheet must not mutate the assessment');
});

test('standalone HTML preserves exact safe sheet contents with UTF-8 and no executable or remote assets', () => {
    const { S } = setup(); const assessment = complete(S, 'bnss', 0);
    assessment.clinicianComment = '<img src="https://example.invalid/patient" onerror="bad()"> & "Особый случай"';
    assessment.itemComments.B1 = 'Первая строка\nВторая строка';
    const sheet = S.buildPrintSheet(assessment);
    const html = S.printSheetHTML(assessment);
    assert.ok(html.startsWith('<!DOCTYPE html>'));
    assert.match(html, /<html lang="ru">/); assert.match(html, /<meta charset="utf-8">/);
    assert.match(html, /Content-Security-Policy/); assert.match(html, /default-src 'none'/);
    assert.ok(html.includes(sheet.outerHTML), 'HTML export must contain the same generated sheet');
    assert.ok(html.includes('&lt;img src=&quot;https://example.invalid/patient&quot;'));
    assert.ok(html.includes('Первая строка\nВторая строка'));
    assert.doesNotMatch(html, /<(?:script|img|iframe|link|input|textarea|select)\b/i);
    assert.doesNotMatch(html, /(?:src|href)="https?:/i);
});

test('incomplete sheets distinguish unassessed answers from an explicit zero and missing versions', () => {
    const { S } = setup(); const assessment = S.createAssessment('bnss', 'print-case');
    assert.match(S.buildPrintSheet(assessment).textContent, /Ответ: Не оценено/);
    assessment.answers.B1 = 0;
    const text = S.buildPrintSheet(assessment).textContent;
    assert.match(text, /1\/13/); assert.match(text, /0\/78 \(сумма оценённых пунктов; неполно\)/);
    assert.match(text, /Версия внешнего бланка: не указана/);
    assert.match(text, /Оценка не завершена/);
});

test('SOPS sheet includes every item and all temporal details without turning the total into probability', () => {
    const { S, descendants } = setup(); const assessment = complete(S, 'sops', 1);
    assessment.details.P1 = { frequency: 'Ежедневно', onset: 'С начала октября', duration: 'Несколько минут', dynamics: 'Без изменений' };
    const sheet = S.buildPrintSheet(assessment);
    assert.equal(descendants(sheet).filter(node => node.tagName === 'ARTICLE').length, 19);
    for (const expected of ['Позитивные симптомы: 5/30', 'Негативные симптомы: 6/36', 'Дезорганизация: 4/24', 'Общие симптомы: 4/24', 'Частота: Ежедневно', 'Начало: С начала октября', 'Продолжительность: Несколько минут', 'Динамика: Без изменений']) assert.ok(sheet.textContent.includes(expected), expected);
    assert.doesNotMatch(sheet.textContent, /\d+\s*%/);
});

test('C-SSRS retains official criteria and a hidden prior positive instead of labelling it a lawful skip', () => {
    const { S, descendants } = setup(); const assessment = S.createAssessment('cssrs', 'print-case');
    Object.assign(assessment.answers, { q1: false, q2: false, q3: true, q6: false });
    assessment.answerRevisionHistory = [{ confirmedAt: '2026-10-20T10:00:00Z' }];
    const sheet = S.buildPrintSheet(assessment);
    const articles = descendants(sheet).filter(node => node.tagName === 'ARTICLE');
    assert.equal(articles.length, 7);
    const q3 = articles.find(node => node.textContent.startsWith('q3.'));
    assert.match(q3.textContent, /Да \(ранее положительный ответ; требуется клинический пересмотр\)/);
    assert.ok(q3.textContent.includes(S.getDefinition('cssrs').items.find(item => item.id === 'q3').instruction));
    assert.match(sheet.textContent, /Подтверждённых пересмотров ранее положительных ответов: 1/);
    assert.doesNotMatch(sheet.textContent, /Суммарный балл —/);
});

test('long notes remain full length; print styles allow paragraphs and articles to flow across pages', () => {
    const { S } = setup(); const assessment = complete(S, 'cdss', 0);
    assessment.clinicianComment = ('Длинная клиническая заметка. '.repeat(1000)) + 'КОНЕЦ ЗАМЕТКИ';
    const html = S.printSheetHTML(assessment);
    assert.ok(html.includes(assessment.clinicianComment));
    assert.match(html, /article\s*\{[^}]*break-inside:\s*auto/);
    assert.match(html, /h3\s*\{[^}]*break-after:\s*avoid/);
    assert.match(html, /white-space:\s*pre-wrap/);
    // Match complete CSS properties: line-height adjusts spacing without clipping text.
    assert.doesNotMatch(html, /(?:^|[;{])\s*(?:(?:max-)?height:\s*\d|overflow:\s*hidden|(?:page-)?break-inside:\s*avoid)/);
});

test('preview opens without native print and exports the captured sheet even if assessment later changes', () => {
    const app = setup(); const assessment = complete(app.S, 'bnss', 6);
    const dialog = app.S.showPrintPreview(assessment);
    assert.equal(app.prints(), 0);
    assert.equal(dialog.getAttribute('role'), 'dialog'); assert.equal(dialog.getAttribute('aria-modal'), 'true');
    const sheet = app.descendants(dialog).find(node => node.className === 'scales-print-sheet');
    const displayed = sheet.outerHTML;
    assessment.answers.B1 = 0;
    app.descendants(dialog).find(node => node.tagName === 'BUTTON' && node.textContent === 'Сохранить HTML').click();
    assert.equal(app.prints(), 0); assert.equal(app.document.downloads.length, 1);
    assert.match(app.document.downloads[0].name, /PSYDRAFT-BNSS-2026-10-20\.html/);
    assert.ok(app.blobs[0].text.includes(displayed));
    assert.match(app.blobs[0].text, /78\/78/);
    app.descendants(dialog).find(node => node.tagName === 'BUTTON' && node.textContent === 'Закрыть').click();
    assert.equal(dialog.isConnected, false); assert.equal(app.document.activeElement, app.trigger);
});

test('explicit print cleans temporary scope after cancel/afterprint and leaves preview reusable', () => {
    const app = setup({ afterPrint: true }); const dialog = app.S.showPrintPreview(complete(app.S, 'bnss', 0));
    const print = app.descendants(dialog).find(node => node.tagName === 'BUTTON' && node.textContent === 'Печать');
    print.click();
    assert.equal(app.prints(), 1); assert.equal(app.document.getElementById('scales-print-root'), null);
    assert.equal(app.document.body.classList.contains('scales-printing'), false);
    assert.equal(print.disabled, false); assert.equal(dialog.isConnected, true);
    app.descendants(dialog).find(node => node.tagName === 'BUTTON' && node.textContent === 'Сохранить HTML').click();
    assert.equal(app.document.downloads.length, 1);
});

test('print errors clean up without preventing HTML save; fallback preview closes safely', () => {
    const app = setup({ throwPrint: true, noDialogAPI: true });
    const dialog = app.S.showPrintPreview(complete(app.S, 'cdss', 0));
    assert.equal(app.trigger.inert, true);
    app.descendants(dialog).find(node => node.tagName === 'BUTTON' && node.textContent === 'Печать').click();
    assert.equal(app.prints(), 1); assert.equal(app.document.getElementById('scales-print-root'), null);
    assert.equal(app.document.body.classList.contains('scales-printing'), false);
    assert.match(dialog.textContent, /Не удалось открыть печать/);
    app.descendants(dialog).find(node => node.tagName === 'BUTTON' && node.textContent === 'Сохранить HTML').click();
    assert.equal(app.document.downloads.length, 1);
    dialog.dispatch('keydown', { key: 'Escape' });
    assert.equal(dialog.isConnected, false); assert.notEqual(app.trigger.inert, true);
    assert.equal(app.document.activeElement, app.trigger);
});

function openHistory(app, current, history) {
    const panel = app.document.createElement('div'); panel.id = 'scales-panel';
    const tabs = app.document.createElement('div'); tabs.id = 'scales-tabs';
    app.document.body.append(panel, tabs);
    app.S.store = {
        get: id => id === current.scaleId ? current : app.S.createAssessment(id, current.caseId),
        update(id, updater) { updater(current); },
        history: id => id === current.scaleId ? history : []
    };
    app.S.init();
    tabs.children.find(tab => tab.dataset.scale === current.scaleId).click();
    return () => panel.querySelector('#scales-history');
}

test('history baseline defaults to the previous assessment and keeps an explicit selection after editing', () => {
    const app = setup();
    const current = complete(app.S, 'bnss', 2);
    const older = complete(app.S, 'bnss', 1); older.snapshotId = 'older-snapshot'; older.archivedAt = '2026-10-20T08:00:00Z';
    const recent = complete(app.S, 'bnss', 3); recent.snapshotId = 'recent-snapshot'; recent.archivedAt = '2026-10-20T09:00:00Z';
    const same = JSON.parse(JSON.stringify(current)); same.snapshotId = 'current-snapshot'; same.archivedAt = '2026-10-20T10:00:00Z';
    const historyJSON = JSON.stringify([older, recent, same]);
    const getHistory = openHistory(app, current, [older, recent, same]);
    let comparison = getHistory().querySelector('.scales-comparison');
    let select = comparison.querySelector('select');
    assert.equal(select.value, 'recent-snapshot', 'skip a snapshot of the current assessment as the default');
    assert.equal(new Set(select.children.map(option => option.textContent)).size, 3, 'same-day snapshots need distinct labels');
    assert.match(comparison.textContent, /-13/);
    select.value = 'older-snapshot'; select.dispatch('change');
    assert.match(comparison.textContent, /\+13/);
    const comment = app.descendants(app.document.getElementById('scales-panel')).find(node => node.tagName === 'LABEL' && node.textContent.startsWith('Клинический комментарий врача')).children[0];
    comment.value = 'Новый комментарий'; comment.dispatch('input');
    comparison = getHistory().querySelector('.scales-comparison');
    select = comparison.querySelector('select');
    assert.equal(select.value, 'older-snapshot');
    assert.match(comparison.textContent, /\+13/);
    assert.equal(JSON.stringify([older, recent, same]), historyJSON, 'comparison must not edit immutable source snapshots');
});

test('comparison shows incompatibility reasons and C-SSRS categories without numeric risk deltas', () => {
    const numeric = setup(); const current = complete(numeric.S, 'bnss', 2); const previous = complete(numeric.S, 'bnss', 1);
    previous.snapshotId = 'other-period'; previous.period = 'Другой период';
    const getNumericHistory = openHistory(numeric, current, [previous]);
    const blocked = getNumericHistory().querySelector('.scales-comparison');
    assert.match(blocked.textContent, /Временные интервалы оценивания различаются/);
    assert.equal(blocked.querySelector('table'), null);

    const screening = setup();
    const now = complete(screening.S, 'cssrs', false); const before = complete(screening.S, 'cssrs', false);
    before.answers.q1 = true; before.snapshotId = 'prior-screening';
    const getScreenHistory = openHistory(screening, now, [before]);
    const comparison = getScreenHistory().querySelector('.scales-comparison');
    const rows = comparison.querySelector('tbody').children;
    assert.equal(rows.length, 2);
    assert.ok(rows.every(row => row.children[3].textContent === '—'));
    assert.match(comparison.textContent, /Прежние положительные сведения сохраняют клиническую значимость/);
    assert.doesNotMatch(comparison.querySelector('table').textContent, /Суммарный балл/);
});

function draftEditor(scaleId) {
    const app = setup();
    const state = { caseId: 'draft-test', scales: { assessments: {}, history: [] } };
    app.context.PsyCase = { get: () => state, save() {} };
    vm.runInContext(fs.readFileSync(path.join(__dirname, '../src/js/scales/storage-adapter.js'), 'utf8'), app.context);
    const panel = app.document.createElement('div'); panel.id = 'scales-panel';
    const tabs = app.document.createElement('div'); tabs.id = 'scales-tabs';
    const status = app.document.createElement('p'); status.id = 'scales-action-status';
    app.document.body.append(panel, tabs, status);
    app.S.init(); tabs.children.find(tab => tab.dataset.scale === scaleId).click();
    const action = name => app.descendants(app.document.body).find(node => node.tagName === 'BUTTON' && node.textContent === name);
    return { ...app, state, panel, status, action };
}

test('SPI-A note-only draft survives cancel and is discarded only after explicit confirmation', () => {
    const app = draftEditor('spi-a');
    const label = app.descendants(app.panel).find(node => node.tagName === 'LABEL' && node.textContent === 'Когнитивные переживания');
    label.children[0].value = 'Учебные подробные заметки'; label.children[0].dispatch('input');
    const id = app.S.store.get('spi-a').id;
    app.action('Новая оценка').click();
    let dialog = app.descendants(app.document.body).find(node => node.tagName === 'DIALOG');
    assert.ok(dialog); assert.match(dialog.textContent, /ответы и заметки/);
    app.action('Отмена').click();
    assert.equal(app.S.store.get('spi-a').id, id);
    assert.equal(app.S.store.get('spi-a').details.preparation.cognitive, 'Учебные подробные заметки');
    app.action('Новая оценка').click(); app.action('Подтвердить').click();
    assert.notEqual(app.S.store.get('spi-a').id, id);
    assert.equal(Object.keys(app.S.store.get('spi-a').details).length, 0);
    assert.equal(app.state.scales.history.length, 0);
    assert.doesNotMatch(app.status.textContent, /сохранена в истории/);
});

test('numeric comment-only drafts require confirmation and an untouched empty draft does not', () => {
    const app = draftEditor('bnss');
    const label = app.descendants(app.panel).find(node => node.tagName === 'LABEL' && node.textContent === 'Клинический комментарий врача');
    label.children[0].value = 'Комментарий без оценённых пунктов'; label.children[0].dispatch('input');
    const id = app.S.store.get('bnss').id;
    app.action('Новая оценка').click();
    assert.ok(app.action('Отмена'));
    app.action('Отмена').click();
    assert.equal(app.S.store.get('bnss').clinicianComment, 'Комментарий без оценённых пунктов');
    assert.equal(app.S.store.get('bnss').id, id);
    app.action('Новая оценка').click(); app.action('Подтвердить').click();
    assert.equal(app.S.store.get('bnss').clinicianComment, '');
    const emptyId = app.S.store.get('bnss').id;
    app.action('Новая оценка').click();
    assert.notEqual(app.S.store.get('bnss').id, emptyId);
    assert.equal(app.descendants(app.document.body).some(node => node.tagName === 'DIALOG'), false);
});

test('metadata, item comments, temporal notes and explicit zero/false prevent silently replacing a draft', () => {
    const scenarios = [
        ['bnss', a => { a.answers.B1 = 0; }],
        ['cssrs', a => { a.answers.q1 = false; }],
        ['sops', a => { a.details.P1 = { frequency: 'Еженедельно' }; }],
        ['bnss', a => { a.itemComments.B1 = 'Заметка'; }],
        ['bnss', a => { a.reportComment = 'Комментарий к заключению'; }],
        ['bnss', a => { a.secondaryFactors = 'Седация'; }],
        ['bnss', a => { a.externalFormVersion = 'Учебная версия'; }],
        ['bnss', a => { a.externalTranslationVersion = 'Учебный перевод'; }],
        ['bnss', a => { a.externalSource = 'Учебный источник'; }],
        ['bnss', a => { a.date = '1900-01-01'; }],
        ['bnss', a => { a.period = 'Уточнённый период'; }]
    ];
    scenarios.forEach(([id, mutate]) => {
        const app = draftEditor(id); app.S.store.update(id, mutate);
        const before = JSON.stringify(app.S.store.get(id));
        app.action('Новая оценка').click();
        assert.ok(app.action('Отмена'), id + ': confirmation is required');
        app.action('Отмена').click();
        assert.equal(JSON.stringify(app.S.store.get(id)), before);
    });
});
