(function (root, S) {
    'use strict';
    function state() {
        if (!root.PsyCase) throw new Error('Состояние случая не инициализировано.');
        const current = root.PsyCase.get();
        if (!current.scales) current.scales = { assessments: {}, history: [] };
        return current;
    }
    function clone(value) { return JSON.parse(JSON.stringify(value)); }
    function freeze(value) {
        if (value && typeof value === 'object' && !Object.isFrozen(value)) {
            Object.values(value).forEach(freeze); Object.freeze(value);
        }
        return value;
    }
    function commit() {
        if (typeof S.syncReport === 'function') S.syncReport(true);
        root.PsyCase.save();
    }
    function captureEdits() {
        if (typeof S.captureReportEdits === 'function') S.captureReportEdits();
    }
    function fresh(id, form) {
        const current = state();
        const assessment = S.createAssessment(id, current.caseId, form);
        current.scales.assessments[id] = assessment;
        return assessment;
    }
    S.store = {
        get(id) {
            const current = state();
            const existing = current.scales.assessments[id];
            if (existing && existing.caseId === current.caseId) return existing;
            const created = fresh(id); commit(); return created;
        },
        update(id, updater) {
            captureEdits();
            const assessment = this.get(id);
            const oldForm = assessment.form;
            const previousAnswers = clone(assessment.answers);
            const oldQ2 = assessment.answers.q2;
            const oldQ6 = assessment.answers.q6;
            updater(assessment);
            // Cross-period answers must not be silently carried to another C-SSRS form.
            if (assessment.form !== oldForm) assessment.form = oldForm;
            if (id === 'cssrs') {
                const def = S.getDefinition(id, assessment);
                const changedPositive = Object.keys(previousAnswers).filter(key => previousAnswers[key] === true && assessment.answers[key] !== true);
                if (changedPositive.length) {
                    if (!assessment.pendingRevision) assessment.pendingRevision = { previousAnswers, changedItems: [], changedAt: new Date().toISOString() };
                    assessment.pendingRevision.changedItems = Array.from(new Set(assessment.pendingRevision.changedItems.concat(changedPositive)));
                }
                // Retain a formerly positive hidden answer until the clinician explicitly reviews the revision.
                if (def.mode === 'cssrs-full' && S.fullHiddenEvidence(assessment, def) && !assessment.pendingRevision) {
                    assessment.pendingRevision = { previousAnswers, changedItems: def.items.filter(item => !S.conditionMatches(item.when, assessment.answers)).map(item => item.id), changedAt: new Date().toISOString() };
                }
                if (def.mode === 'cssrs' && oldQ2 !== assessment.answers.q2 && assessment.answers.q2 !== true) ['q3', 'q4', 'q5'].forEach(key => {
                    if (assessment.answers[key] !== true) assessment.answers[key] = null;
                });
                if (def.mode === 'cssrs' && oldQ6 !== assessment.answers.q6 && assessment.answers.q6 !== true && assessment.answers.q6recent !== true) assessment.answers.q6recent = null;
            }
            assessment.updatedAt = new Date().toISOString();
            assessment.results = S.evaluate(assessment);
            commit(); return assessment;
        },
        confirmRevision(id) {
            if (id !== 'cssrs') return false;
            captureEdits();
            const assessment = this.get(id);
            if (!S.validate(assessment).requiresReview) return false;
            const previous = assessment.pendingRevision ? assessment.pendingRevision.previousAnswers : clone(assessment.answers);
            const revision = {
                id: S.uid(), confirmedAt: new Date().toISOString(),
                previousAnswers: clone(previous), revisedAnswers: null,
                clinicalRevisionConfirmed: true
            };
            const def = S.getDefinition(id, assessment);
            if (def.mode === 'cssrs-full') {
                def.items.filter(item => !S.conditionMatches(item.when, assessment.answers)).forEach(item => { assessment.answers[item.id] = null; });
            } else {
                if (assessment.answers.q2 !== true) ['q3', 'q4', 'q5'].forEach(key => { assessment.answers[key] = null; });
                if (assessment.answers.q6 !== true) assessment.answers.q6recent = null;
            }
            revision.revisedAnswers = clone(assessment.answers);
            if (!Array.isArray(assessment.answerRevisionHistory)) assessment.answerRevisionHistory = [];
            assessment.answerRevisionHistory.push(freeze(revision));
            assessment.pendingRevision = null;
            assessment.updatedAt = new Date().toISOString();
            assessment.results = S.evaluate(assessment);
            commit(); return true;
        },
        reset(id) {
            if (!S.getDefinition(id)) return false;
            captureEdits();
            delete state().scales.assessments[id]; commit(); return true;
        },
        snapshot(id) {
            captureEdits();
            const current = state(); const assessment = current.scales.assessments[id];
            if (!assessment || !S.evaluate(assessment).complete) return false;
            const signature = JSON.stringify([assessment.id, assessment.date, assessment.period, assessment.form,
                assessment.answers, assessment.itemComments, assessment.details, assessment.secondaryFactors,
                assessment.clinicianComment, assessment.reportComment, assessment.externalFormVersion,
                assessment.externalTranslationVersion, assessment.externalSource]);
            if (current.scales.history.some(a => a.snapshotSignature === signature)) return false;
            const snapshot = clone(assessment);
            snapshot.results = S.evaluate(snapshot);
            snapshot.snapshotSignature = signature;
            snapshot.snapshotId = S.uid(); snapshot.archivedAt = new Date().toISOString();
            current.scales.history.push(freeze(snapshot)); commit(); return true;
        },
        history(id) {
            return state().scales.history.filter(a => a.caseId === state().caseId && a.scaleId === id).map(a => freeze(clone(a)));
        },
        newAssessment(id) {
            captureEdits();
            const current = state().scales.assessments[id];
            if (current && S.evaluate(current).complete) this.snapshot(id);
            const form = current && current.form && S.getFormDefinition(id, current.form) ? current.form : undefined;
            const assessment = fresh(id, form); commit(); return assessment;
        },
        startCurrentVersion(id) {
            captureEdits();
            const current = state().scales.assessments[id];
            if (current && S.evaluate(current).complete) this.snapshot(id);
            const assessment = fresh(id); commit(); return assessment;
        },
        setForm(id, form) {
            if (id !== 'cssrs' || !S.getFormDefinition(id, form)) return false;
            captureEdits();
            const old = state().scales.assessments[id];
            if (old && S.evaluate(old).complete) this.snapshot(id);
            const assessment = fresh(id, form); commit(); return assessment;
        }
    };
})(globalThis, globalThis.PsyScales);
