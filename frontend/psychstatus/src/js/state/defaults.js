const DEFAULT_STATE = Object.freeze({ schemaVersion: 1 });

function createCaseId() {
    if (window.crypto && typeof window.crypto.randomUUID === 'function') {
        return window.crypto.randomUUID();
    }
    return 'case-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2);
}

function createDefaultCase() {
    const now = new Date().toISOString();
    return {
        schemaVersion: DEFAULT_STATE.schemaVersion,
        caseId: createCaseId(),
        createdAt: now,
        updatedAt: now,
        formData: { controls: {}, editors: {} },
        prescriptions: [],
        prescriptionNextId: 1,
        prescriptionEditingId: null,
        selectedRecommendations: {},
        recommendationGroup: 'sleep',
        clarifyLabels: {},
        reportHTML: '',
        scales: { assessments: {}, history: [] }
    };
}
