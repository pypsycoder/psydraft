// All case data stays in this browser. Scales use this same state and storage key.
(function () {
    let currentState = null;
    let initialForm = null;
    let initialized = false;
    let restoring = false;
    let pendingSave = null;
    let storageIssue = '';
    let storageBlocked = false;
    let recoveryNotice = '';
    let observedStorageText = null;
    let hasObservedStorage = false;
    const provider = window.PsyCaseStorageProvider || null;
    const adapters = new Map();
    let queuedWriteText = null;
    let writeInFlight = false;

    function clone(value) {
        return JSON.parse(JSON.stringify(value));
    }

    function isRecord(value) {
        return !!value && typeof value === 'object' && !Array.isArray(value);
    }

    function normalizeAssessment(value, id, caseId) {
        if (!isRecord(value) || value.caseId !== caseId || value.scaleId !== id ||
            typeof value.id !== 'string' || !value.id) return null;
        const definition = window.PsyScales && PsyScales.getDefinition(id, value);
        const result = { ...value };
        result.answers = isRecord(value.answers) ? value.answers : {};
        result.itemComments = isRecord(value.itemComments) ? value.itemComments : {};
        result.details = isRecord(value.details) ? value.details : {};
        ['scaleName', 'scaleVersion', 'translationVersion', 'externalFormVersion', 'externalTranslationVersion', 'externalSource', 'date', 'period', 'clinicianComment',
            'secondaryFactors', 'reportComment', 'updatedAt'].forEach(function (key) {
            result[key] = typeof value[key] === 'string' ? value[key] : '';
        });
        result.source = typeof value.source === 'string' ? value.source : isRecord(value.source) &&
            typeof value.source.title === 'string' && typeof value.source.url === 'string' && /^https:\/\//.test(value.source.url) ?
            { title: value.source.title, url: value.source.url } : '';
        if (definition) {
            result.scaleName = definition.name;
            if (!result.scaleVersion) result.scaleVersion = definition.version;
        }
        result.form = typeof value.form === 'string' ? value.form : null;
        result.opened = value.opened === true;
        result.includeInReport = value.includeInReport !== false;
        result.reportOverride = isRecord(value.reportOverride) && typeof value.reportOverride.html === 'string' &&
            typeof value.reportOverride.fingerprint === 'string' ? value.reportOverride : null;
        let damagedRevision = false;
        result.pendingRevision = null;
        if (value.pendingRevision) {
            const pending = isRecord(value.pendingRevision) ? value.pendingRevision : {};
            damagedRevision = !isRecord(value.pendingRevision) || !isRecord(pending.previousAnswers) || !Array.isArray(pending.changedItems);
            result.pendingRevision = {
                previousAnswers: isRecord(pending.previousAnswers) ? pending.previousAnswers : {},
                changedItems: Array.isArray(pending.changedItems) ? pending.changedItems.filter(function (item) { return typeof item === 'string'; }) : [],
                changedAt: typeof pending.changedAt === 'string' ? pending.changedAt : '',
                recoveryRequired: pending.recoveryRequired === true || damagedRevision
            };
        }
        const revisions = Array.isArray(value.answerRevisionHistory) ? value.answerRevisionHistory : [];
        result.answerRevisionHistory = revisions.filter(function (revision) {
            return isRecord(revision) && typeof revision.id === 'string' && !!revision.id &&
                typeof revision.confirmedAt === 'string' && !!revision.confirmedAt &&
                revision.clinicalRevisionConfirmed === true && isRecord(revision.previousAnswers) && isRecord(revision.revisedAnswers);
        }).map(function (revision) { return freeze(revision); });
        if (result.answerRevisionHistory.length !== revisions.length ||
            (value.answerRevisionHistory && !Array.isArray(value.answerRevisionHistory))) damagedRevision = true;
        if (damagedRevision) {
            // Corrupt revision bookkeeping must never silently turn a safety review into a negative result.
            if (!result.pendingRevision) result.pendingRevision = { previousAnswers: {}, changedItems: [], changedAt: '', recoveryRequired: true };
            result.pendingRevision.recoveryRequired = true;
            recoveryNotice = 'Случай восстановлен. Данные пересмотра ответов повреждены; требуется повторная клиническая проверка C-SSRS.';
        }
        // Cached scores are never trusted after restoring a draft.
        result.results = null;
        return result;
    }

    function freeze(value) {
        if (value && typeof value === 'object' && !Object.isFrozen(value)) {
            Object.values(value).forEach(freeze);
            Object.freeze(value);
        }
        return value;
    }

    function status(message, failed) {
        const element = document.getElementById('case-storage-status');
        if (!element) return;
        element.textContent = message;
        element.dataset.state = failed === 'pending' ? 'saving' : failed === true ? 'error' : 'saved';
    }

    function normalizeState(value) {
        if (!isRecord(value) || value.schemaVersion !== FORM_SCHEMA.schemaVersion ||
            typeof value.caseId !== 'string' || !value.caseId) return null;
        const fresh = createDefaultCase();
        const state = { ...fresh, ...value };
        const form = isRecord(value.formData) ? value.formData : {};
        state.formData = {
            controls: isRecord(form.controls) ? form.controls : {},
            editors: isRecord(form.editors) ? form.editors : {}
        };
        const prescriptionRecords = Array.isArray(value.prescriptions) ? value.prescriptions : [];
        state.prescriptions = prescriptionRecords.filter(function (prescription) {
            return isRecord(prescription) && typeof prescription.id === 'number' && Number.isFinite(prescription.id) && prescription.id > 0 &&
                typeof prescription.name === 'string' && isRecord(prescription.times) &&
                Object.values(prescription.times).every(function (dose) { return typeof dose === 'string'; });
        });
        const damagedPrescriptions = state.prescriptions.length !== prescriptionRecords.length ||
            (value.prescriptions !== undefined && !Array.isArray(value.prescriptions));
        state.prescriptionEditingId = state.prescriptions.some(function (prescription) { return prescription.id === value.prescriptionEditingId; }) ? value.prescriptionEditingId : null;
        state.selectedRecommendations = isRecord(value.selectedRecommendations) ? value.selectedRecommendations : {};
        state.clarifyLabels = isRecord(value.clarifyLabels) ? value.clarifyLabels : {};
        state.reportHTML = typeof value.reportHTML === 'string' ? value.reportHTML : '';
        state.extensions = isRecord(value.extensions) ? { ...value.extensions } : {};
        const scales = isRecord(value.scales) ? value.scales : {};
        state.scales = {
            assessments: isRecord(scales.assessments) ? scales.assessments : {},
            history: Array.isArray(scales.history) ? scales.history : []
        };
        // A record from a different patient can never enter the active case.
        let excluded = 0;
        Object.keys(state.scales.assessments).forEach(function (id) {
            const assessment = normalizeAssessment(state.scales.assessments[id], id, state.caseId);
            if (assessment) state.scales.assessments[id] = assessment;
            else { delete state.scales.assessments[id]; excluded++; }
        });
        const historyCount = state.scales.history.length;
        state.scales.history = state.scales.history.map(function (assessment) {
            return isRecord(assessment) ? normalizeAssessment(assessment, assessment.scaleId, state.caseId) : null;
        }).filter(Boolean).map(freeze);
        if (excluded || state.scales.history.length !== historyCount) {
            recoveryNotice = 'Случай восстановлен. Некорректные оценки и записи другого случая не загружены; проверьте результаты шкал.';
        }
        if (damagedPrescriptions) {
            const notice = 'Повреждённые назначения не загружены. Перепроверьте назначения и восстановите их по первичным данным.';
            recoveryNotice = recoveryNotice ? recoveryNotice + ' ' + notice : 'Случай восстановлен. ' + notice;
        }
        return state;
    }

    function readStorage() {
        try {
            const text = provider ? provider.read() : window.localStorage.getItem(FORM_SCHEMA.storageKey);
            if (!initialized) {
                observedStorageText = text;
                hasObservedStorage = true;
            }
            if (!text) return null;
            const state = normalizeState(JSON.parse(text));
            if (!state) throw new Error('Unsupported case data');
            return state;
        } catch (error) {
            storageBlocked = true;
            storageIssue = 'Не удалось восстановить сохранённый случай. Сохранённые данные не изменены; автосохранение остановлено. Для начала работы используйте «Новый случай».';
            status(storageIssue, true);
            return null;
        }
    }

    function get() {
        if (!currentState) currentState = createDefaultCase();
        return currentState;
    }

    function belongsToCase(element) {
        return !element.closest('#section-scales, [data-scales-root], [data-scale-print-sheet]') &&
            !element.closest('[data-editor-toolbar]');
    }

    function controlEntries() {
        const counts = Object.create(null);
        return Array.from(document.querySelectorAll(FORM_SCHEMA.controls)).filter(function (element) {
            return belongsToCase(element) && element.type !== 'file' && element.type !== 'button' && element.type !== 'submit';
        }).map(function (element, index) {
            let base;
            if (element.id) base = 'id:' + element.id;
            else if (element.dataset.recId) base = 'recommendation:' + element.dataset.recId;
            else if (element.name) base = 'name:' + element.name + ':' + element.type +
                ((element.type === 'checkbox' || element.type === 'radio') ? ':' + element.value : '');
            else base = 'control:' + element.tagName + ':' + element.type + ':' + index;
            const occurrence = counts[base] || 0;
            counts[base] = occurrence + 1;
            return { element: element, key: base + ':' + occurrence };
        });
    }

    function collectForm(useDefaults) {
        const form = { controls: {}, editors: {} };
        controlEntries().forEach(function (entry) {
            const element = entry.element;
            const data = { value: element.value, disabled: element.disabled };
            if (element.type === 'checkbox' || element.type === 'radio') {
                data.checked = useDefaults ? element.defaultChecked : element.checked;
            } else if (useDefaults) {
                if (element.tagName === 'SELECT') {
                    const option = Array.from(element.options).find(function (item) { return item.defaultSelected; }) || element.options[0];
                    data.value = option ? option.value : '';
                } else data.value = element.defaultValue || '';
            }
            form.controls[entry.key] = data;
        });
        document.querySelectorAll(FORM_SCHEMA.editors).forEach(function (element) {
            if (element.id && element.id !== 'result' && belongsToCase(element)) {
                form.editors[element.id] = useDefaults ? '' : element.innerHTML;
            }
        });
        return form;
    }

    // Stored editor markup is local user content; executable elements are never restored.
    function cleanHTML(html) {
        const template = document.createElement('template');
        template.innerHTML = typeof html === 'string' ? html : '';
        template.content.querySelectorAll('script, iframe, object, embed, link, meta, style, form').forEach(function (element) {
            element.remove();
        });
        template.content.querySelectorAll('*').forEach(function (element) {
            Array.from(element.attributes).forEach(function (attribute) {
                if (/^on/i.test(attribute.name) || attribute.name === 'srcdoc' ||
                    (/^(?:href|src|xlink:href)$/i.test(attribute.name) && /^\s*(?:javascript|data):/i.test(attribute.value))) {
                    element.removeAttribute(attribute.name);
                }
            });
        });
        return template.innerHTML;
    }

    function applyControls(form) {
        const data = form && isRecord(form.controls) ? form.controls : {};
        controlEntries().forEach(function (entry) {
            const saved = data[entry.key];
            if (!isRecord(saved)) return;
            if (typeof saved.value === 'string') entry.element.value = saved.value;
            if (typeof saved.checked === 'boolean') entry.element.checked = saved.checked;
            if (typeof saved.disabled === 'boolean') entry.element.disabled = saved.disabled;
        });
    }

    function applyEditors(form) {
        Object.keys((form && form.editors) || {}).forEach(function (id) {
            const element = document.getElementById(id);
            if (element && element.isContentEditable && belongsToCase(element)) {
                element.innerHTML = cleanHTML(form.editors[id]);
            }
        });
    }

    function restoreModels(state) {
        if (typeof prescriptions !== 'undefined') prescriptions = clone(state.prescriptions || []);
        if (typeof rxNextId !== 'undefined') {
            rxNextId = Math.max(Number(state.prescriptionNextId) || 1,
                (state.prescriptions || []).reduce(function (max, item) { return Math.max(max, Number(item.id) || 0); }, 0) + 1);
        }
        if (typeof rxEditingId !== 'undefined') rxEditingId = state.prescriptionEditingId || null;
        if (typeof selectedRecs !== 'undefined') {
            Object.keys(selectedRecs).forEach(function (key) { delete selectedRecs[key]; });
            Object.assign(selectedRecs, state.selectedRecommendations || {});
        }
        if (typeof activeGroup !== 'undefined') activeGroup = state.recommendationGroup || 'sleep';
        if (typeof _checkedClarifyLabels !== 'undefined') _checkedClarifyLabels = clone(state.clarifyLabels || {});
        if (typeof autoMonitoringRecIds !== 'undefined') autoMonitoringRecIds.clear();
        if (typeof syncDrugMonitoring === 'function') syncDrugMonitoring(state.prescriptions || []);
        // Preserve selections the doctor manually changed after automatic monitoring.
        if (typeof selectedRecs !== 'undefined') {
            Object.keys(selectedRecs).forEach(function (key) { delete selectedRecs[key]; });
            Object.assign(selectedRecs, state.selectedRecommendations || {});
        }
        if (typeof renderGroupFilters === 'function') renderGroupFilters();
        if (typeof renderRecommendations === 'function') renderRecommendations();
        if (typeof renderPrescriptionsList === 'function') renderPrescriptionsList();
        const submit = document.getElementById('rx-submit-btn');
        if (submit) submit.textContent = state.prescriptionEditingId ? 'Сохранить' : 'Добавить';
    }

    function restoreForm(state) {
        restoring = true;
        try {
            restoreModels(state);
            // Extensions create dynamic controls (for example, previous treatment courses).
            adapters.forEach(function (adapter, id) {
                const value = state.extensions[id];
                adapter.restore(value === undefined ? undefined : clone(value));
            });
            applyControls(state.formData);
            // Existing handlers own dependent visibility, enabled fields and summaries.
            controlEntries().forEach(function (entry) {
                if (entry.element.tagName === 'SELECT' || entry.element.type === 'checkbox' || entry.element.type === 'radio') {
                    entry.element.dispatchEvent(new Event('change', { bubbles: true }));
                }
            });
            // Some legacy handlers clear dependent values; restore their saved text afterwards.
            applyControls(state.formData);
            applyEditors(state.formData);
            const result = document.getElementById('result');
            if (result) result.innerHTML = cleanHTML(state.reportHTML);
        } finally {
            restoring = false;
        }
    }

    function capture() {
        const state = get();
        state.formData = collectForm(false);
        if (typeof prescriptions !== 'undefined') state.prescriptions = clone(prescriptions);
        if (typeof rxNextId !== 'undefined') state.prescriptionNextId = rxNextId;
        if (typeof rxEditingId !== 'undefined') state.prescriptionEditingId = rxEditingId;
        if (typeof selectedRecs !== 'undefined') state.selectedRecommendations = clone(selectedRecs);
        if (typeof activeGroup !== 'undefined') state.recommendationGroup = activeGroup;
        if (typeof _checkedClarifyLabels !== 'undefined') state.clarifyLabels = clone(_checkedClarifyLabels);
        adapters.forEach(function (adapter, id) { state.extensions[id] = clone(adapter.capture()); });
        const result = document.getElementById('result');
        state.reportHTML = result ? result.innerHTML : state.reportHTML;
        state.updatedAt = new Date().toISOString();
        return state;
    }

    function conflict() {
        storageBlocked = true;
        queuedWriteText = null;
        storageIssue = 'Случай изменён в другой вкладке. Перезагрузите страницу, чтобы загрузить актуальные данные. Изменения этой вкладки не сохранены.';
        status(storageIssue, true);
    }

    function sendQueuedWrite() {
        if (!provider || writeInFlight || queuedWriteText === null || storageBlocked) return;
        const text = queuedWriteText;
        queuedWriteText = null;
        if (hasObservedStorage && text === observedStorageText) {
            storageIssue = '';
            status('Случай сохранён в этом браузере', false);
            return;
        }
        writeInFlight = true;
        status('Сохранение случая…', 'pending');
        Promise.resolve().then(function () {
            return provider.write(text, hasObservedStorage ? observedStorageText : null);
        }).then(function (reply) {
            writeInFlight = false;
            if (!reply || reply.ok !== true) {
                if (reply && reply.code === 'conflict') conflict();
                else {
                    queuedWriteText = null;
                    storageIssue = 'Автосохранение недоступно. Данные останутся только до закрытия страницы. Скопируйте заключение или экспортируйте оценочные листы.';
                    status(storageIssue, true);
                }
                return;
            }
            observedStorageText = text;
            hasObservedStorage = true;
            storageIssue = '';
            if (queuedWriteText !== null && queuedWriteText !== text) sendQueuedWrite();
            else {
                queuedWriteText = null;
                status('Случай сохранён в этом браузере', false);
            }
        }).catch(function () {
            writeInFlight = false;
            queuedWriteText = null;
            storageIssue = 'Автосохранение недоступно. Данные останутся только до закрытия страницы. Скопируйте заключение или экспортируйте оценочные листы.';
            status(storageIssue, true);
        });
    }

    function save() {
        if (restoring) return get();
        if (pendingSave !== null) { clearTimeout(pendingSave); pendingSave = null; }
        const state = capture();
        if (storageBlocked) {
            status(storageIssue, true);
            return state;
        }
        if (provider) {
            queuedWriteText = JSON.stringify(state);
            sendQueuedWrite();
            return state;
        }
        try {
            const storedText = window.localStorage.getItem(FORM_SCHEMA.storageKey);
            if ((hasObservedStorage && storedText !== observedStorageText) || (!hasObservedStorage && storedText !== null)) {
                conflict();
                return state;
            }
            const text = JSON.stringify(state);
            window.localStorage.setItem(FORM_SCHEMA.storageKey, text);
            observedStorageText = text;
            hasObservedStorage = true;
            storageIssue = '';
            status('Случай сохранён в этом браузере', false);
        } catch (error) {
            storageIssue = 'Автосохранение недоступно. Данные останутся только до закрытия страницы. Скопируйте заключение или экспортируйте оценочные листы.';
            status(storageIssue, true);
        }
        return state;
    }

    function scheduleSave(event) {
        if (restoring || !initialized) return;
        // Confirmation actions save their models explicitly; a failed reset status must remain visible.
        if (event && event.type === 'click' && event.target && event.target.closest('#new-case, .scales-confirmation')) return;
        if (pendingSave !== null) clearTimeout(pendingSave);
        pendingSave = setTimeout(save, 150);
    }

    function newCase() {
        if (provider && typeof provider.requestReset === 'function') {
            provider.requestReset();
            return get();
        }
        if (pendingSave !== null) { clearTimeout(pendingSave); pendingSave = null; }
        const nextState = createDefaultCase();
        const resetRaw = JSON.stringify({
            schemaVersion: nextState.schemaVersion, caseId: nextState.caseId,
            scales: { assessments: {}, history: [] }, extensions: {}
        });
        // Persist the new identity before changing the visible patient. No empty-key interval permits stale writes.
        try {
            window.localStorage.setItem(FORM_SCHEMA.storageKey, resetRaw);
        } catch (error) {
            storageIssue = 'Не удалось сохранить новый случай. Новый случай не начат; данные текущего пациента не изменены. Проверьте настройки хранения браузера.';
            status(storageIssue, true);
            return get();
        }
        observedStorageText = resetRaw;
        hasObservedStorage = true;
        storageBlocked = false;
        storageIssue = '';
        recoveryNotice = '';
        currentState = nextState;
        currentState.formData = clone(initialForm || collectForm(true));
        restoreForm(currentState);
        const results = document.getElementById('nosology-results');
        if (results) results.replaceChildren();
        ['nosology-last-run', 'icd_results', 'rx-drug-results', 'rx-monitoring-notice'].forEach(function (id) {
            const element = document.getElementById(id);
            if (element) { element.textContent = ''; if (id === 'rx-monitoring-notice') element.style.display = 'none'; }
        });
        document.dispatchEvent(new CustomEvent('psydraft:case-reset', { detail: { caseId: currentState.caseId } }));
        save();
        return currentState;
    }

    function init() {
        if (initialized) return get();
        initialForm = collectForm(true);
        const restored = readStorage();
        currentState = restored || createDefaultCase();
        if (restored) restoreForm(currentState);
        initialized = true;
        document.addEventListener('input', scheduleSave);
        document.addEventListener('change', scheduleSave);
        // Legacy prescription and diagnosis actions update models without emitting input.
        document.addEventListener('click', scheduleSave);
        window.addEventListener('pagehide', save);
        window.addEventListener('beforeunload', save);
        document.addEventListener('visibilitychange', function () { if (document.visibilityState === 'hidden') save(); });
        const button = document.getElementById('new-case');
        if (button) button.addEventListener('click', function () {
            const question = 'Начать новый случай? Все данные текущего пациента, оценки шкал и заключение будут очищены.';
            if (window.PsyScales && typeof PsyScales.confirmAction === 'function') {
                PsyScales.confirmAction(question, newCase);
            } else if (window.confirm(question)) newCase();
        });
        if (storageIssue) status(storageIssue, true);
        else if (recoveryNotice) status(recoveryNotice, true);
        else save();
        return currentState;
    }

    function registerAdapter(id, adapter) {
        if (!/^[a-z][a-z0-9-]{0,63}$/.test(id) || !adapter || typeof adapter.capture !== 'function' || typeof adapter.restore !== 'function') {
            throw new Error('Некорректный адаптер состояния случая.');
        }
        if (adapters.has(id)) throw new Error('Адаптер состояния уже зарегистрирован.');
        adapters.set(id, adapter);
        if (initialized) {
            restoring = true;
            try { adapter.restore(get().extensions[id]); }
            finally { restoring = false; }
        }
    }

    function setExtension(id, value) {
        if (!/^[a-z][a-z0-9-]{0,63}$/.test(id) || adapters.has(id)) return false;
        get().extensions[id] = clone(value);
        save();
        return true;
    }

    window.PsyCase = {
        get: get, save: save, init: init, newCase: newCase, cleanHTML: cleanHTML,
        registerAdapter: registerAdapter, setExtension: setExtension,
        get isRestoring() { return restoring; }
    };
    window.loadState = readStorage;
    window.saveState = function (state) {
        if (state) {
            const normalized = normalizeState(state);
            if (!normalized) return get();
            currentState = normalized;
            if (initialized) restoreForm(currentState);
        }
        return save();
    };
}());
