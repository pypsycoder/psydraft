(function (S) {
    'use strict';
    S.interpret = function (assessment, result) {
        const def = S.getDefinition(assessment.scaleId);
        if (!result.complete) return 'Недостаточно данных для итогового результата. Неоценённые пункты не считаются нулевыми.';
        if (def.id === 'sops') return 'Описательный профиль SOPS. Оценка не является полным интервью SIPS; вероятность психоза и синдром высокого риска автоматически не определяются.';
        if (def.id === 'bnss') return 'Баллы негативной симптоматики требуют клинического сопоставления. Вторичные причины учитываются отдельно; категории тяжести по общей сумме не присваиваются. Пункт 4 не инвертирован и не входит в два укрупнённых домена.';
        if (def.id === 'cdss') return 'Баллы CDSS требуют сопоставления с клиническим состоянием при расстройствах шизофренического спектра. Депрессивный эпизод по сумме автоматически не устанавливается.';
        if (def.id === 'cssrs') return 'Результаты выбранной скрининговой формы. Интенсивность мыслей и отдельные типы поведения этой формой не оцениваются; при необходимости используйте полную C-SSRS. Окончательная оценка безопасности производится врачом.';
        return 'Результат требует клинической оценки.';
    };
    S.resultText = function (assessment, result) {
        result = result || S.evaluate(assessment);
        if (!result.complete) return 'Недостаточно данных';
        if (assessment.scaleId === 'sops') return Object.values(result.subscales).map(g => g.label + ' — ' + g.value + '/' + g.max).join('; ') + '.';
        if (assessment.scaleId === 'cssrs') {
            const severityLabels = ['не выявлены по скрининговым вопросам', 'желание смерти', 'неспецифические активные мысли', 'мысли о способе без намерения', 'намерение без конкретного плана', 'план и намерение'];
            const behaviorPeriod = assessment.form === 'followup' ? 'после последнего визита' : 'за жизнь';
            let text = 'Максимальная категория тяжести мыслей — ' + result.severity + ' (' + severityLabels[result.severity] + '); сведения о суицидальном поведении ' + behaviorPeriod + ' — ' + (result.behavior ? 'положительный ответ' : 'отрицательный ответ');
            if (assessment.form !== 'followup' && result.behavior) text += '; поведение за последние 3 месяца — ' + (result.recentBehavior ? 'отмечено' : 'не отмечено');
            return text + '. Скрининг не разделяет типы поведения; общего балла риска нет. Несуицидальные самоповреждения не приравниваются к попытке.';
        }
        let text = 'Суммарный балл — ' + result.total + '/' + result.max + '.';
        if (assessment.scaleId === 'bnss') text += ' ' + Object.values(result.domains).map(g => g.label + ' — ' + g.value + '/' + g.max).join('; ') + '.';
        return text;
    };
})(globalThis.PsyScales);
