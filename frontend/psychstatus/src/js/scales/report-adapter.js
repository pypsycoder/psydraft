(function (root, S) {
    'use strict';
    let initialized = false;
    let synchronizing = false;

    function assessments() {
        return root.PsyCase ? root.PsyCase.get().scales.assessments : {};
    }

    function fingerprint(assessment, result) {
        return JSON.stringify({
            id: assessment.id, version: assessment.scaleVersion, date: assessment.date,
            period: assessment.period, form: assessment.form, answers: assessment.answers,
            externalFormVersion: assessment.externalFormVersion, externalTranslationVersion: assessment.externalTranslationVersion,
            externalSource: assessment.externalSource,
            details: assessment.details, secondaryFactors: assessment.secondaryFactors, result: result
        });
    }

    function signature(html) {
        let value = 2166136261;
        for (let index = 0; index < html.length; index++) {
            value ^= html.charCodeAt(index);
            value = Math.imul(value, 16777619);
        }
        return String(value >>> 0);
    }

    function normalizedHTML(html) {
        const element = document.createElement('div');
        element.innerHTML = root.PsyCase ? root.PsyCase.cleanHTML(html) : html;
        return element.innerHTML;
    }

    function dateLabel(value) {
        if (!/^\d{4}-\d{2}-\d{2}$/.test(value || '')) return value || '';
        return value.slice(8, 10) + '.' + value.slice(5, 7) + '.' + value.slice(0, 4);
    }

    function generatedHTML(assessment, result, definition) {
        const esc = S.escapeHTML;
        let html = '<strong>' + esc(definition.name) + '</strong> (' + esc(dateLabel(assessment.date)) +
            '; период: ' + esc(assessment.period) + '). ' + esc(S.resultText(assessment, result));
        if (definition.mode === 'scores') {
            html += ' Баллы зарегистрированы врачом по внешнему оценочному листу; полное интервью в приложении не проводилось.';
            html += '<br>Внешний инструмент: версия — ' + esc(assessment.externalFormVersion || 'не указана') +
                '; русский перевод — ' + esc(assessment.externalTranslationVersion || 'не указан') +
                '; источник — ' + esc(assessment.externalSource || 'не указан') + '.';
        }
        const interpretation = result.interpretation || (typeof S.interpret === 'function' ? S.interpret(assessment, result) : '');
        if (interpretation) html += ' ' + esc(interpretation);
        if (assessment.secondaryFactors) html += '<br>Вторичные факторы (оценка врача): ' + esc(assessment.secondaryFactors);
        if (result.warnings && result.warnings.length) html += '<br>' + result.warnings.map(esc).join(' ');
        return normalizedHTML(html);
    }

    function captureReportEdits() {
        if (synchronizing) return;
        const result = document.getElementById('result');
        if (!result) return;
        const current = assessments();
        result.querySelectorAll('[data-scale-report]').forEach(function (block) {
            const assessment = current[block.dataset.scaleReport];
            if (!assessment || assessment.id !== block.dataset.assessmentId) return;
            const calculated = block.querySelector('[data-scale-calculated]');
            if (calculated && signature(calculated.innerHTML) !== calculated.dataset.contentSignature) {
                assessment.reportOverride = {
                    html: normalizedHTML(calculated.innerHTML),
                    fingerprint: calculated.dataset.scaleFingerprint
                };
                calculated.dataset.contentSignature = signature(calculated.innerHTML);
            }
            const comment = block.querySelector('[data-scale-report-comment]');
            if (comment) assessment.reportComment = comment.innerText !== undefined ? comment.innerText.trim() : comment.textContent.trim();
        });
    }

    function buildReportHTML() {
        const current = assessments();
        const caseId = root.PsyCase && root.PsyCase.get().caseId;
        const esc = S.escapeHTML;
        const blocks = [];
        S.listDefinitions().forEach(function (definition) {
            const assessment = current[definition.id];
            if (!assessment || !assessment.opened || assessment.includeInReport === false ||
                assessment.caseId !== caseId || definition.mode === 'preparation') return;
            const result = S.evaluate(assessment);
            if (!result.complete) return;
            const key = fingerprint(assessment, result);
            let calculated = generatedHTML(assessment, result, definition);
            if (assessment.reportOverride && assessment.reportOverride.fingerprint === key) {
                calculated = normalizedHTML(assessment.reportOverride.html);
            } else if (assessment.reportOverride) {
                assessment.reportOverride = null;
            }
            let html = '<div data-scale-report="' + esc(definition.id) + '" data-assessment-id="' + esc(assessment.id) + '">' +
                '<div data-scale-calculated data-scale-fingerprint="' + esc(key) + '" data-content-signature="' + signature(calculated) + '">' + calculated + '</div>';
            if (assessment.clinicianComment) html += '<div>Комментарий к оценке: ' + esc(assessment.clinicianComment).replace(/\n/g, '<br>') + '</div>';
            html += '<div data-scale-report-comment aria-label="Независимый комментарий врача к результатам ' + esc(definition.name) + '">' +
                esc(assessment.reportComment || '').replace(/\n/g, '<br>') + '</div></div>';
            blocks.push(html);
        });
        return blocks.length ? '<strong>Результаты психометрического обследования</strong><br>' + blocks.join('<br>') + '<br>' : '';
    }

    function syncReport(skipCapture) {
        const result = document.getElementById('result');
        // Do not generate or replace the doctor's consultation before their first Generate action.
        if (!result || !result.innerHTML.trim()) return;
        if (!skipCapture) captureReportEdits();
        synchronizing = true;
        try {
            let slot = result.querySelector('[data-psychometrics-slot]');
            if (!slot) {
                const diagnosis = result.querySelector('[data-diagnosis-anchor]');
                if (!diagnosis) return;
                slot = document.createElement('div');
                slot.setAttribute('data-psychometrics-slot', '');
                diagnosis.before(slot);
            }
            slot.innerHTML = buildReportHTML();
            // A single managed slot prevents duplicate results after repeated edits.
            result.querySelectorAll('[data-psychometrics-slot]').forEach(function (other) {
                if (other !== slot) other.remove();
            });
        } finally {
            synchronizing = false;
        }
    }

    function initReportAdapter() {
        if (initialized) return;
        initialized = true;
        const result = document.getElementById('result');
        if (result) result.addEventListener('input', function () {
            captureReportEdits();
            if (root.PsyCase) root.PsyCase.save();
        });
        syncReport();
    }

    S.buildReportHTML = buildReportHTML;
    S.captureReportEdits = captureReportEdits;
    S.syncReport = syncReport;
    S.initReportAdapter = initReportAdapter;
})(globalThis, globalThis.PsyScales = globalThis.PsyScales || {});
