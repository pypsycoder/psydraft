(function (S) {
    'use strict';
    S.compareAssessments = function (current, previous) {
        const comparison = { comparable: false, reasons: [], notices: [], rows: [] };
        if (!current || !previous) {
            comparison.reasons.push('Выберите две оценки одного случая.');
            return comparison;
        }
        const def = S.getDefinition(current.scaleId);
        if (!def || current.scaleId !== previous.scaleId) comparison.reasons.push('Для сравнения нужны оценки одной шкалы.');
        if (!current.caseId || current.caseId !== previous.caseId) comparison.reasons.push('Оценки относятся к разным клиническим случаям.');
        if (current.id === previous.id) comparison.reasons.push('Это снимок текущей оценки. Для наблюдения в динамике начните новую оценку.');
        if (current.scaleVersion !== previous.scaleVersion || current.translationVersion !== previous.translationVersion || current.form !== previous.form) comparison.reasons.push('Версии инструмента, перевода или формы различаются.');
        if (current.period !== previous.period) comparison.reasons.push('Временные интервалы оценивания различаются.');
        if (def && def.mode === 'scores') {
            if ((current.externalFormVersion || '') !== (previous.externalFormVersion || '') ||
                (current.externalTranslationVersion || '') !== (previous.externalTranslationVersion || '')) comparison.reasons.push('Версии внешнего бланка или русского перевода различаются.');
            if (!current.externalFormVersion || !current.externalTranslationVersion) comparison.notices.push('Версии внешнего бланка или перевода не указаны. Сопоставимость необходимо подтвердить клинически.');
        }
        const now = S.evaluate(current), before = S.evaluate(previous);
        if (!now.complete || !before.complete) comparison.reasons.push('Обе оценки должны быть полностью заполнены и проверены.');
        if (comparison.reasons.length) return comparison;
        comparison.comparable = true;
        comparison.currentDate = current.date;
        comparison.previousDate = previous.date;
        if (def.mode === 'cssrs') {
            // Ideation categories are ordinal; a subtraction would imply an unsupported interval scale.
            comparison.rows.push({ id: 'severity', label: 'Максимальная категория тяжести мыслей', previous: before.severity, current: now.severity, delta: null, kind: 'category' });
            comparison.rows.push({ id: 'behavior', label: 'Суицидальное поведение за жизнь (скрининг)', previous: before.behavior ? 'Да' : 'Нет', current: now.behavior ? 'Да' : 'Нет', delta: null, kind: 'answer' });
            if (previous.answers.q6 === true && current.answers.q6 === true) comparison.rows.push({ id: 'recentBehavior', label: 'Поведение за последние 3 месяца', previous: before.recentBehavior ? 'Да' : 'Нет', current: now.recentBehavior ? 'Да' : 'Нет', delta: null, kind: 'answer' });
            comparison.notices.push('Показаны ответы скрининга, а не изменение суммарного риска. Прежние положительные сведения сохраняют клиническую значимость.');
        } else {
            comparison.rows.push({ id: 'total', label: def.id === 'sops' ? 'Общая сумма (описательно)' : 'Суммарный балл', previous: before.total, current: now.total, delta: now.total - before.total, max: now.max, kind: 'score' });
            for (const key of ['subscales', 'domains']) {
                Object.entries(now[key] || {}).forEach(([id, group]) => {
                    const old = before[key] && before[key][id];
                    if (old && old.complete && group.complete) comparison.rows.push({ id: key + ':' + id, label: group.label, previous: old.value, current: group.value, delta: group.value - old.value, max: group.max, kind: 'score' });
                });
            }
            comparison.notices.push('Разность баллов — описательный показатель. Она не определяет диагноз, клиническую значимость изменения или выбор лечения.');
        }
        return comparison;
    };
})(globalThis.PsyScales);
