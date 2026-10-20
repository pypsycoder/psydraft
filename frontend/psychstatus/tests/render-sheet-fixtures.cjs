'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { setup, completeAssessment } = require('./helpers/scale-dom.cjs');

// Synthetic, local-only examples for inspecting the actual standalone HTML export.
// Run directly; importing this module does not generate files or run tests.
function renderFixtures(destination = path.join(__dirname, '../dist')) {
    const { S } = setup();
    const bnss = completeAssessment(S, 'bnss', 0);
    const scores = [3, 2, 1, 2, 3, 3, 2, 2, 2, 2, 2, 2, 2];
    S.getDefinition('bnss').items.forEach((item, index) => { bnss.answers[item.id] = scores[index]; });
    Object.assign(bnss, {
        externalFormVersion: 'Учебный внешний бланк — версия 1.0',
        externalTranslationVersion: 'Учебные реквизиты русского перевода — версия A',
        externalSource: 'Учебный пример, не пациент. Реквизиты показаны для проверки оформления.',
        secondaryFactors: 'Учебный пример: предполагаемая седация отмечена отдельно и не изменяет расчёт.',
        clinicianComment: 'Учебный пример, не пациент.\n' + ('Это синтетическая клиническая заметка для проверки многостраничного печатного листа. Текст должен сохранять переносы строк и переходить на следующую страницу целиком без обрезания. '.repeat(24)) + '\nКОНЕЦ ДЛИННОЙ УЧЕБНОЙ ЗАМЕТКИ.',
        reportComment: 'Учебное дополнение к заключению. Сведения полностью вымышлены.'
    });
    bnss.itemComments.B2 = 'Учебный пример, не пациент.\n' + ('Развёрнутое наблюдение к отдельному пункту для проверки переноса длинного блока через границу страницы. '.repeat(18)) + '\nКОНЕЦ КОММЕНТАРИЯ К ПУНКТУ B2.';
    bnss.itemComments.B13 = 'Учебный комментарий к последнему пункту — должен присутствовать в конце перечня.';
    assert.equal(S.evaluate(bnss).total, 28);

    const cssrs = completeAssessment(S, 'cssrs', false);
    Object.assign(cssrs.answers, { q1: false, q2: false, q3: true, q4: false, q5: false, q6: true, q6recent: false });
    cssrs.clinicianComment = 'Учебный пример, не пациент. Сохранён прежний положительный ответ q3 при изменённом q2; оценка ожидает клинического пересмотра. Никакие выводы о реальном человеке не делаются.';
    cssrs.itemComments.q3 = 'Учебная заметка: прежние положительные сведения должны оставаться видимыми на печатном листе.';
    const cssrsResult = S.evaluate(cssrs);
    assert.equal(cssrsResult.complete, false);
    assert.equal(cssrsResult.requiresReview, true);

    const fixtures = [
        { name: 'qa-bnss28.html', assessment: bnss },
        { name: 'qa-cssrs-pending-review.html', assessment: cssrs }
    ];
    fs.mkdirSync(destination, { recursive: true });
    return fixtures.map(({ name, assessment }) => {
        const file = path.join(destination, name);
        const html = S.printSheetHTML(assessment);
        assert.ok(html.includes('Учебный пример, не пациент'));
        assert.doesNotMatch(html, /<(?:script|img|iframe|link)\b/i);
        fs.writeFileSync(file, html, 'utf8');
        return file;
    });
}

if (require.main === module) renderFixtures().forEach(file => console.log(file));
module.exports = { renderFixtures };
