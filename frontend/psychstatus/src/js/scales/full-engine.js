(function (S) {
    'use strict';
    const behaviorIds = ['behavior_actual', 'behavior_interrupted', 'behavior_aborted', 'behavior_preparatory'];
    const intensityIds = ['intensity_frequency', 'intensity_duration', 'intensity_control', 'intensity_deterrents', 'intensity_reasons'];
    S.conditionMatches = function (condition, answers) {
        if (!condition) return true;
        if (condition.any) return condition.any.some(rule => S.conditionMatches(rule, answers));
        if (condition.all) return condition.all.every(rule => S.conditionMatches(rule, answers));
        return answers[condition.answer] === condition.equals;
    };
    S.fullHiddenEvidence = function (assessment, def) {
        return def.items.some(item => !S.conditionMatches(item.when, assessment.answers || {}) &&
            (assessment.answers[item.id] === true || (typeof assessment.answers[item.id] === 'number' && assessment.answers[item.id] > 0)));
    };
    S.validateFullCssrs = function (assessment, def) {
        const a = assessment.answers || {}, errors = [];
        if (assessment.form !== def.defaultForm) errors.push('Выбранная форма C-SSRS не соответствует сохранённой версии.');
        const knownBehavior = behaviorIds.every(id => typeof a[id] === 'boolean');
        const behavior = behaviorIds.some(id => a[id] === true);
        if (knownBehavior && typeof a.behavior_summary === 'boolean' && a.behavior_summary !== behavior) errors.push('Сводная отметка суицидального поведения не согласуется с отдельными видами действий. Уточните ответы.');
        const ideationIds = ['q1', 'q2', ...(a.q2 === true ? ['q3', 'q4', 'q5'] : [])];
        if ((a.q1 === true || a.q2 === true) && ideationIds.every(id => typeof a[id] === 'boolean') &&
            a.intensity_type !== null && a.intensity_type !== undefined) {
            const maximum = Math.max(...ideationIds.filter(id => a[id] === true).map(id => Number(id.slice(1))));
            if (a.intensity_type !== maximum) errors.push('Тип наиболее опасной идеи для оценки интенсивности должен совпадать с максимальной подтверждённой категорией 1–5.');
        }
        def.items.filter(item => item.type === 'date').forEach(item => {
            if (S.conditionMatches(item.when, a) && S.validAnswer(item, a[item.id]) && a[item.id] > assessment.date) errors.push('Дата попытки не может быть позднее даты обследования: ' + item.label + '.');
        });
        return errors;
    };
    S.scoreFullCssrs = function (assessment, def, validity) {
        const a = assessment.answers || {};
        const ideationIds = ['q1', 'q2', ...(a.q2 === true ? ['q3', 'q4', 'q5'] : [])];
        const ideationComplete = !validity.requiresReview && ideationIds.every(id => typeof a[id] === 'boolean');
        const applicable = a.q1 === true || a.q2 === true;
        const maximum = ideationComplete ? Math.max(0, ...ideationIds.filter(id => a[id] === true).map(id => Number(id.slice(1)))) : null;
        const intensityComplete = applicable && ideationComplete && a.intensity_type === maximum && intensityIds.every(id => S.validAnswer(def.items.find(item => item.id === id), a[id]));
        const warnings = [];
        const behaviorKnown = behaviorIds.every(id => typeof a[id] === 'boolean');
        const behavior = behaviorIds.some(id => a[id] === true);
        if (ideationIds.some(id => a[id] === true) || behavior || a.behavior_summary === true) warnings.push('Выявлены суицидальные мысли или действия. Проведите дополнительную оценку безопасности и определите клиническую тактику; общая сумма риска не рассчитывается.');
        if (a.behavior_nssi === true) warnings.push('Несуицидальные самоповреждения зарегистрированы отдельно. Они не приравниваются к суицидальной попытке и требуют клинической оценки.');
        if (validity.requiresReview) warnings.push('Прежние положительные сведения сохранены. Отрицательный итог до подтверждённого клинического пересмотра недоступен.');
        if (a.q5 === true && a.q4 === false) warnings.push('План и намерение указаны при отрицании намерения в пункте 4. Уточните клинические сведения.');
        return {
            ideationComplete, severity: ideationComplete ? Math.max(0, ...ideationIds.filter(id => a[id] === true).map(id => Number(id.slice(1)))) : null,
            intensityApplicable: applicable ? true : typeof a.q1 === 'boolean' && typeof a.q2 === 'boolean' ? false : null,
            intensityTotal: !validity.requiresReview && intensityComplete ? intensityIds.reduce((sum, id) => sum + a[id], 0) : null,
            behavior: !validity.requiresReview && behaviorKnown && a.behavior_summary === behavior ? behavior : null, recentBehavior: null,
            behaviorTypes: Object.fromEntries(behaviorIds.map(id => [id, !validity.requiresReview && typeof a[id] === 'boolean' ? a[id] : null])),
            nssi: !validity.requiresReview && typeof a.behavior_nssi === 'boolean' ? a.behavior_nssi : null,
            warnings
        };
    };
})(globalThis.PsyScales);
