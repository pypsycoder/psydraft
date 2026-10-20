(function (S) {
    'use strict';
    S.validAnswer = function (item, value) {
        if (value === null || value === undefined || value === '') return false;
        if (item.options) return item.options.some(option => option.value === value);
        return typeof value === 'number' && Number.isInteger(value) && value >= item.min && value <= item.max;
    };
    S.visibleItems = function (assessment) {
        const def = S.getDefinition(assessment.scaleId);
        if (!def) return [];
        if (def.mode !== 'cssrs') return def.items;
        const a = assessment.answers || {};
        return def.items.filter(item => {
            if (['q3', 'q4', 'q5'].includes(item.id)) return a.q2 === true;
            if (item.id === 'q6recent') return assessment.form !== 'followup' && a.q6 === true;
            return true;
        });
    };
    S.validate = function (assessment) {
        const def = assessment && S.getDefinition(assessment.scaleId);
        if (!def) return { complete: false, answered: 0, required: 0, errors: ['Неизвестная шкала.'] };
        const items = S.visibleItems(assessment);
        const answers = assessment.answers || {};
        const answered = items.filter(item => S.validAnswer(item, answers[item.id])).length;
        const errors = [];
        for (const item of items) {
            const v = answers[item.id];
            if (v !== null && v !== undefined && v !== '' && !S.validAnswer(item, v)) errors.push('Недопустимый ответ: ' + item.id + '.');
        }
        const date = typeof assessment.date === 'string' ? assessment.date : '';
        if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !Number.isFinite(Date.parse(date + 'T12:00:00Z')) || new Date(date + 'T12:00:00Z').toISOString().slice(0, 10) !== date) errors.push('Укажите корректную дату обследования.');
        if (typeof assessment.period !== 'string' || !assessment.period.trim()) errors.push('Укажите временной интервал обследования.');
        if (def.mode === 'cssrs' && !['recent', 'followup'].includes(assessment.form)) errors.push('Выберите официальную форму C-SSRS.');
        if (def.approvedForms && !def.approvedForms.includes(assessment.form)) errors.push('Официальный русский бланк выбранной формы ещё не подключён.');
        let requiresReview = false;
        if (def.mode === 'cssrs') {
            const hiddenPositive = (answers.q2 !== true && ['q3', 'q4', 'q5'].some(id => answers[id] === true)) ||
                (answers.q6 !== true && answers.q6recent === true);
            requiresReview = !!assessment.pendingRevision || hiddenPositive;
            if (requiresReview) errors.push('Ранее положительные ответы изменены или противоречат переходам формы. Повторно уточните сведения у пациента и подтвердите клинический пересмотр; до этого оценка не завершена.');
            if (assessment.form === 'recent' && assessment.period !== def.period) errors.push('Временной интервал не соответствует официальной форме Recent. Начните новую оценку этой формы и перепроверьте ответы за её период.');
        }
        return {
            complete: def.mode !== 'preparation' && items.length > 0 && answered === items.length && errors.length === 0,
            answered, required: items.length, errors, requiresReview
        };
    };
})(globalThis.PsyScales);
