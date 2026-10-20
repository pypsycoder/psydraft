(function (S) {
    'use strict';
    const cogdisGroups = ['B1', 'C2', 'D3', 'C3', 'C4', 'C5', 'D4', 'O3', 'O7'];
    const visual = ['D5', 'F2', 'F3', ...Array.from({ length: 10 }, (_, i) => 'O4.' + (i + 1))];
    const auditory = ['F5', 'O5.1', 'O5.2'];
    const coperGroups = [
        ...['C2', 'O1', 'D3', 'C3', 'C4', 'O2', 'D4', 'O8'].map(id => ({ id, items: [id] })),
        { id: 'visual', items: visual }, { id: 'auditory', items: auditory }
    ];
    const allIds = [...new Set([...cogdisGroups, ...coperGroups.flatMap(group => group.items)])];
    const coperIds = new Set(coperGroups.flatMap(group => group.items));
    function validRating(value) { return typeof value === 'number' && Number.isInteger(value) && value >= 0 && value <= 9; }
    function aggregate(values) { return values.some(value => value === true) ? true : values.some(value => value === null) ? null : false; }
    function criterion(groups, threshold, periodConfirmed) {
        const qualifying = groups.filter(group => group.value === true).map(group => group.id);
        const unknown = groups.filter(group => group.value === null).map(group => group.id);
        let state = qualifying.length >= threshold ? 'met' : qualifying.length + unknown.length >= threshold ? 'insufficient' : 'not-met';
        if (!periodConfirmed) state = 'insufficient';
        return {
            state, value: state === 'insufficient' ? null : state === 'met',
            qualifyingCount: qualifying.length, requiredCount: threshold,
            qualifyingGroups: qualifying, unknownGroups: unknown
        };
    }
    S.basicSymptomCriteriaIds = Object.freeze(allIds.slice());
    S.evaluateBasicSymptomCriteria = function (assessment) {
        const answers = assessment && assessment.answers || {};
        const details = assessment && assessment.details || {};
        const operands = details.basicSymptoms || {};
        const errors = [], warnings = [], frequency = {}, historical = {};
        const periodConfirmed = details.basicSymptomPeriodConfirmed === true;
        let answered = periodConfirmed ? 1 : 0, required = 1;
        let unresolved = false;
        if (!periodConfirmed) errors.push('Подтвердите оценку частоты за последние три месяца.');
        for (const id of allIds) {
            const value = answers[id], item = operands[id] || {};
            required++;
            if (!validRating(value)) {
                frequency[id] = null; historical[id] = null;
                errors.push(value === null || value === undefined || value === '' ? 'Не оценён феномен ' + id + '.' : 'Недопустимый код частоты: ' + id + '.');
                continue;
            }
            answered++;
            if (value === 8 || value === 9) {
                frequency[id] = null; historical[id] = null; unresolved = true;
                errors.push(id + ': уточните частоту или соответствие определению; код ' + value + ' не означает отсутствие симптома.');
                continue;
            }
            if (value < 3 || value === 7) { frequency[id] = false; historical[id] = false; continue; }
            required++;
            if (typeof item.clinicallyConfirmed === 'boolean') answered++;
            else errors.push(id + ': требуется клиническое подтверждение феномена и проверка альтернативных объяснений.');
            frequency[id] = typeof item.clinicallyConfirmed === 'boolean' ? item.clinicallyConfirmed : null;
            if (!coperIds.has(id) || item.clinicallyConfirmed === false) { historical[id] = false; continue; }
            if (item.clinicallyConfirmed !== true) { historical[id] = null; continue; }
            required++;
            if (typeof item.onset12Months === 'boolean') {
                answered++;
                historical[id] = item.onset12Months;
            } else {
                historical[id] = null;
                errors.push(id + ': уточните, впервые ли этот феномен появился не менее 12 месяцев назад.');
            }
        }
        const cogdis = criterion(cogdisGroups.map(id => ({ id, value: frequency[id] })), 2, periodConfirmed);
        const coper = criterion(coperGroups.map(group => ({ id: group.id, value: aggregate(group.items.map(id => historical[id])) })), 1, periodConfirmed);
        const complete = periodConfirmed && answered === required && !unresolved && errors.length === 0;
        if (cogdis.value === true || coper.value === true) warnings.push('Критериальные признаки базисных симптомов присутствуют. Требуется клиническое сопоставление; критерий не устанавливает диагноз и не определяет вероятность перехода в психоз.');
        if (Object.values(answers).some(value => value === 7)) warnings.push('Постоянная черта (код 7) не учитывается как частотно-положительный базисный симптом.');
        return {
            complete, status: complete ? 'complete' : 'incomplete', answered, required,
            errors, warnings, cogdis, coper, total: null, max: null, partialTotal: null,
            algorithmVersion: 'COGDIS/COPER — Schultze-Lutter & Schimmelmann 2014, Tables 1–2',
            fullInstrument: false
        };
    };
})(globalThis.PsyScales = globalThis.PsyScales || {});
