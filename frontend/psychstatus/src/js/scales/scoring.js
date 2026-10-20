(function (S) {
    'use strict';
    function scoreGroups(definitions, assessment, def) {
        return Object.fromEntries((definitions || []).map(group => {
            const items = group.items.map(id => def.items.find(item => item.id === id));
            const complete = items.every(item => item && S.validAnswer(item, assessment.answers[item.id]));
            const partialValue = items.reduce((sum, item) => sum + (item && S.validAnswer(item, assessment.answers[item.id]) ? assessment.answers[item.id] : 0), 0);
            return [group.id, { label: group.label, value: complete ? partialValue : null, partialValue, max: group.max, complete }];
        }));
    }
    S.evaluate = function (assessment) {
        const def = assessment && S.getDefinition(assessment.scaleId, assessment);
        if (def && def.mode === 'basic-symptom-criteria') {
            const criteria = S.evaluateBasicSymptomCriteria(assessment);
            const metadata = S.validate(assessment);
            criteria.complete = criteria.complete && metadata.complete;
            criteria.errors = Array.from(new Set([...(criteria.errors || []), ...metadata.errors]));
            const unassessed = criteria.errors.filter(error => /^Не оценён феномен /.test(error));
            criteria.warnings = Array.from(new Set([...(criteria.warnings || []), ...criteria.errors.filter(error => !/^Не оценён феномен /.test(error))]));
            if (unassessed.length) criteria.warnings.push('Не оценены феномены: ' + unassessed.length + '. Заполните пункты интервью; пустые ответы не считаются отсутствием симптомов.');
            criteria.status = criteria.complete ? 'complete' : 'incomplete';
            return { total: null, max: null, partialTotal: null, subscales: {}, domains: {}, ...criteria,
                interpretation: 'Критериальная оценка COGDIS/COPER не заменяет полное интервью SPI-A и не устанавливает диагноз.' };
        }
        const validity = S.validate(assessment);
        const result = Object.assign({}, validity, {
            status: validity.complete ? 'complete' : 'incomplete', total: null, max: null,
            partialTotal: null, subscales: {}, domains: {}, warnings: [], interpretation: ''
        });
        if (!def) return result;
        if (def.mode === 'preparation') {
            result.status = 'preparation';
            result.cogdis = 'Недостаточно данных'; result.coper = 'Недостаточно данных';
            result.warnings.push('Недостаточно данных. Полное интервью и расчёт не подключены.');
        } else if (def.mode === 'cssrs-full') {
            Object.assign(result, S.scoreFullCssrs(assessment, def, validity));
        } else if (def.mode === 'cssrs') {
            const a = assessment.answers || {};
            const ideology = S.visibleItems(assessment).filter(item => /^q[1-5]$/.test(item.id));
            result.ideationComplete = !validity.requiresReview && ideology.every(item => S.validAnswer(item, a[item.id]));
            result.severity = result.ideationComplete ? Math.max(0, ...ideology.filter(item => a[item.id] === true).map(item => Number(item.id.slice(1)))) : null;
            result.behavior = !validity.requiresReview && typeof a.q6 === 'boolean' ? a.q6 : null;
            result.recentBehavior = validity.requiresReview ? null : a.q6 === false ? false : assessment.form === 'followup' ? result.behavior : typeof a.q6recent === 'boolean' ? a.q6recent : null;
            if (S.visibleItems(assessment).some(item => a[item.id] === true)) result.warnings.push('Положительный ответ в C-SSRS: проведите дополнительную оценку безопасности и определите клиническую тактику. Категория риска автоматически не присваивается.');
            if (validity.requiresReview) result.warnings.push('Прежние положительные сведения требуют повторной оценки безопасности. Отрицательный итог до подтверждения пересмотра недоступен.');
            if (a.q2 === true && a.q1 === false) result.warnings.push('Активные мысли указаны при отрицательном ответе о желании смерти; уточните клиническую картину.');
            if (a.q5 === true && a.q4 === false) result.warnings.push('План с намерением указан при отрицательном ответе на вопрос 4; повторно уточните сведения. Максимальная подтверждённая категория сохраняется.');
        } else {
            result.subscales = scoreGroups(def.groups, assessment, def);
            result.domains = scoreGroups(def.domainDefinitions, assessment, def);
            result.max = def.items.reduce((sum, item) => sum + item.max, 0);
            result.partialTotal = def.items.reduce((sum, item) => sum + (S.validAnswer(item, assessment.answers[item.id]) ? assessment.answers[item.id] : 0), 0);
            result.total = validity.complete ? result.partialTotal : null;
            if (def.id === 'sops') {
                result.positiveFlags = def.items.filter(item => item.group === 'positive' && S.validAnswer(item, assessment.answers[item.id]) && assessment.answers[item.id] >= 3).map(item => ({ id: item.id, value: assessment.answers[item.id], level: assessment.answers[item.id] === 6 ? '6' : '3–5' }));
                result.positiveFlags.forEach(flag => result.warnings.push(flag.id + ' = ' + flag.value + ': требуется клиническое уточнение частоты, начала, длительности и динамики. Балл не устанавливает синдром SIPS.'));
            }
            if (def.id === 'cdss' && S.validAnswer(def.items[7], assessment.answers.C8) && assessment.answers.C8 > 0) result.warnings.push('Суицидальный пункт CDSS (8) положителен: требуется дополнительная оценка безопасности.');
        }
        result.warnings.push(...validity.errors);
        if (typeof S.interpret === 'function') result.interpretation = S.interpret(assessment, result);
        return result;
    };
})(globalThis.PsyScales);
