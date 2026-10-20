(function (root) {
    'use strict';
    const scales = root.PsyScales = root.PsyScales || {};
    scales.registry = Object.create(null);
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
        return definition;
    };
    scales.getDefinition = id => scales.registry[id] || null;
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
    scales.createAssessment = function (scaleId, caseId) {
        const def = scales.getDefinition(scaleId);
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
