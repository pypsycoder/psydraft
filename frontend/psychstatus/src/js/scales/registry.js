(function (root) {
    'use strict';
    const scales = root.PsyScales = root.PsyScales || {};
    scales.registry = Object.create(null);
    scales.versions = Object.create(null);
    scales.registerDefinition = function (definition) {
        if (!definition || !/^[a-z][a-z0-9-]*$/.test(definition.id) || scales.registry[definition.id]) {
            throw new Error('Некорректный или повторный идентификатор шкалы.');
        }
        const ids = new Set();
        for (const item of definition.items || []) {
            if (!item.id || ids.has(item.id)) throw new Error('Повторный пункт шкалы.');
            ids.add(item.id);
        }
        scales.registry[definition.id] = definition;
        (scales.versions[definition.id] ||= Object.create(null))[definition.version] = definition;
        return definition;
    };
    scales.installFullDefinition = function (definition) {
        const previous = scales.registry[definition.id];
        if (!previous || !definition.version || definition.version === previous.version) throw new Error('Для полной формы нужна отдельная версия.');
        const merged = { ...previous, ...definition,
            items: definition.items.map(item => ({ ...(previous.items.find(old => old.id === item.id) || {}), ...item })) };
        const ids = new Set();
        merged.items.forEach(function (item) {
            if (!item.id || ids.has(item.id)) throw new Error('Повторный пункт полной формы.');
            ids.add(item.id);
        });
        if (merged.id === 'cssrs') {
            const forms = [{ id: merged.defaultForm, label: merged.formLabel || merged.title, enabled: true },
                { id: 'recent', label: 'Screen Version — Recent (официальный русский скрининг)', enabled: true }];
            Object.values(scales.versions.cssrs).forEach(function (old) { old.forms = forms; old.approvedForms = forms.map(form => form.id); });
            merged.forms = forms; merged.approvedForms = forms.map(form => form.id);
        }
        scales.versions[merged.id][merged.version] = merged;
        scales.registry[merged.id] = merged;
        return merged;
    };
    scales.getDefinition = function (id, assessment) {
        if (assessment && assessment.scaleVersion) return (scales.versions[id] || {})[assessment.scaleVersion] || null;
        if (assessment && scales.registry[id] && scales.registry[id].version) return null;
        return scales.registry[id] || null;
    };
    scales.getFormDefinition = function (id, form) {
        return Object.values(scales.versions[id] || {}).find(def => def.defaultForm === form) || null;
    };
    scales.listDefinitions = () => Object.values(scales.registry);
    scales.escapeHTML = value => String(value == null ? '' : value).replace(/[&<>"']/g, char => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[char]));
    scales.uid = function () {
        return root.crypto && typeof root.crypto.randomUUID === 'function' ? root.crypto.randomUUID() :
            'assessment-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2);
    };
    scales.localDate = function () {
        const now = new Date();
        return [now.getFullYear(), String(now.getMonth() + 1).padStart(2, '0'), String(now.getDate()).padStart(2, '0')].join('-');
    };
    scales.createAssessment = function (scaleId, caseId, form) {
        const def = form ? scales.getFormDefinition(scaleId, form) : scales.getDefinition(scaleId);
        if (!def) throw new Error('Неизвестная шкала.');
        return {
            id: scales.uid(), caseId, scaleId, scaleName: def.name, scaleVersion: def.version,
            translationVersion: def.translationVersion, source: def.source,
            externalFormVersion: '', externalTranslationVersion: '', externalSource: '',
            date: scales.localDate(), period: def.period, form: def.defaultForm || null,
            opened: true, includeInReport: true,
            answers: Object.fromEntries(def.items.map(item => [item.id, null])),
            pendingRevision: null, answerRevisionHistory: [],
            itemComments: {}, details: {}, secondaryFactors: '', clinicianComment: '',
            reportComment: '', reportOverride: null, updatedAt: new Date().toISOString(), results: null
        };
    };
})(globalThis);
