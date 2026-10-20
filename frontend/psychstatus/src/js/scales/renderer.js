(function () {
    'use strict';
    const S = window.PsyScales;
    if (!S) return;
    let activeId = null;
    let opened = false;
    let initialized = false;
    let panel;
    let tabs;
    let observer;
    let closeConfirmation = null;
    let closePrintPreview = null;
    let confirmationId = 0;
    const itemNodes = new Map();
    const comparisonBaselines = new Map();

    function element(tag, className, text) {
        const el = document.createElement(tag);
        if (className) el.className = className;
        if (text !== undefined && text !== null) el.textContent = String(text);
        return el;
    }

    S.confirmAction = function (text, onConfirm) {
        if (closeConfirmation) closeConfirmation(false);
        const trigger = document.activeElement;
        const dialog = element('dialog', 'scales-confirmation');
        const id = 'scales-confirmation-' + (++confirmationId);
        const title = element('h2', '', 'Подтверждение действия');
        title.id = id + '-title';
        const description = element('p', '', text);
        description.id = id + '-description';
        dialog.setAttribute('role', 'dialog');
        dialog.setAttribute('aria-modal', 'true');
        dialog.setAttribute('aria-labelledby', title.id);
        dialog.setAttribute('aria-describedby', description.id);
        const actions = element('div', 'scales-confirm-actions');
        const cancel = element('button', 'btn-secondary', 'Отмена');
        cancel.type = 'button';
        cancel.autofocus = true;
        const confirm = element('button', '', 'Подтвердить');
        confirm.type = 'button';
        actions.append(cancel, confirm);
        dialog.append(title, description, actions);
        document.body.appendChild(dialog);
        let host = dialog;
        let fallback = false;
        let settled = false;
        const background = [];
        function retainFocus(event) {
            if (fallback && !dialog.contains(event.target)) cancel.focus();
        }
        function finish(accepted) {
            if (settled) return;
            settled = true;
            closeConfirmation = null;
            document.removeEventListener('focusin', retainFocus, true);
            if (!fallback && dialog.open && typeof dialog.close === 'function') dialog.close();
            host.remove();
            background.forEach(([node, inert, hidden]) => {
                node.inert = inert;
                if (hidden === null) node.removeAttribute('aria-hidden');
                else node.setAttribute('aria-hidden', hidden);
            });
            try { if (accepted && typeof onConfirm === 'function') onConfirm(); }
            finally {
                if (trigger && trigger.isConnected && typeof trigger.focus === 'function') trigger.focus();
                else if (panel && panel.isConnected) panel.focus();
            }
        }
        closeConfirmation = finish;
        cancel.addEventListener('click', () => finish(false));
        confirm.addEventListener('click', () => finish(true));
        dialog.addEventListener('cancel', event => { event.preventDefault(); finish(false); });
        dialog.addEventListener('close', () => finish(false));
        dialog.addEventListener('keydown', event => {
            if (event.key === 'Escape') { event.preventDefault(); finish(false); }
            else if (event.key === 'Tab') {
                if (event.shiftKey && document.activeElement === cancel) { event.preventDefault(); confirm.focus(); }
                else if (!event.shiftKey && document.activeElement === confirm) { event.preventDefault(); cancel.focus(); }
            }
        });
        try {
            if (typeof dialog.showModal !== 'function') throw new Error('Dialog API unavailable');
            dialog.showModal();
        } catch (error) {
            fallback = true;
            dialog.classList.add('scales-confirmation--fallback');
            dialog.setAttribute('open', '');
            host = element('div', 'scales-confirm-backdrop');
            dialog.replaceWith(host);
            host.appendChild(dialog);
            Array.from(document.body.children).forEach(node => {
                if (node === host) return;
                background.push([node, node.inert, node.getAttribute('aria-hidden')]);
                node.inert = true;
                node.setAttribute('aria-hidden', 'true');
            });
            document.addEventListener('focusin', retainFocus, true);
        }
        cancel.focus();
    };

    function field(text, control) {
        const label = element('label', '', text);
        label.appendChild(control);
        return label;
    }

    function textArea(value, update, rows) {
        const control = element('textarea');
        control.rows = rows || 2;
        control.value = value || '';
        control.addEventListener('input', () => update(control.value));
        return control;
    }

    function input(type, value, update) {
        const control = element('input');
        control.type = type;
        control.value = value || '';
        control.addEventListener('input', () => update(control.value));
        return control;
    }

    function message(text) {
        const target = document.getElementById('scales-action-status');
        if (target) target.textContent = text || '';
    }

    function definition(assessment) {
        return S.getDefinition(activeId, assessment);
    }

    function visibleItems(assessment, def) {
        return typeof S.visibleItems === 'function' ? S.visibleItems(assessment) : (def.items || []);
    }

    function hasDraftData(assessment, def) {
        function hasValue(value) {
            if (value === null || value === undefined) return false;
            if (typeof value === 'string') return value.trim().length > 0;
            if (typeof value === 'object') return Object.values(value).some(hasValue);
            return true; // An explicit zero or false is an assessed answer.
        }
        if (hasValue(assessment.answers) || hasValue(assessment.itemComments) || hasValue(assessment.details)) return true;
        if (['clinicianComment', 'reportComment', 'secondaryFactors', 'externalFormVersion', 'externalTranslationVersion', 'externalSource'].some(key => hasValue(assessment[key]))) return true;
        if (assessment.reportOverride && hasValue(assessment.reportOverride.html)) return true;
        const defaultPeriod = assessment.form === 'followup' ? 'После последнего визита' : def.period;
        return assessment.date !== S.localDate() || assessment.period !== defaultPeriod;
    }

    function patch(updater) {
        S.store.update(activeId, updater);
        const assessment = S.store.get(activeId);
        refreshResults(assessment);
        return assessment;
    }

    function formattedDate(value) {
        if (!value) return 'Дата не указана';
        const date = new Date(value.length === 10 ? value + 'T12:00:00' : value);
        return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString('ru-RU');
    }

    function sourceText(source) {
        if (!source) return '';
        if (typeof source === 'string') return source;
        return source.title || source.label || source.name || source.url || '';
    }

    function appendSource(container, def) {
        if (!def.source) return;
        const text = sourceText(def.source);
        const url = typeof def.source === 'object' ? def.source.url : (/^https:\/\//.test(text) ? text : null);
        const line = element('p', 'scales-meta', 'Источник: ');
        if (url && /^https:\/\//.test(url)) {
            const link = element('a', '', text);
            link.href = url;
            link.target = '_blank';
            link.rel = 'noopener noreferrer';
            line.appendChild(link);
        } else line.appendChild(document.createTextNode(text));
        container.appendChild(line);
    }

    function activate(id, focusTab) {
        activeId = id;
        opened = true;
        if (observer) observer.disconnect();
        Array.from(tabs.querySelectorAll('[role="tab"]')).forEach(tab => {
            const selected = tab.dataset.scale === id;
            tab.setAttribute('aria-selected', String(selected));
            tab.tabIndex = selected ? 0 : -1;
            if (selected && focusTab) tab.focus();
        });
        panel.setAttribute('aria-labelledby', 'scales-tab-' + id);
        render();
        message('');
    }

    function render() {
        itemNodes.clear();
        panel.replaceChildren();
        const a = S.store.get(activeId);
        const def = definition(a);
        if (!def) {
            panel.appendChild(element('p', 'scales-warning', 'Редакция сохранённой оценки не определена. Её ответы не выдаются за полное интервью и не включаются в заключение.'));
            panel.appendChild(button('Начать новую оценку по текущей редакции', () => {
                S.confirmAction('Начать новую оценку? Ответы неизвестной редакции и её заметки будут очищены; они не могут считаться завершённым интервью.', () => { S.store.startCurrentVersion(activeId); render(); });
            }));
            return;
        }
        panel.appendChild(element('h3', 'scales-title', def.name + (def.title ? ' — ' + def.title : '')));
        const latest = S.getDefinition(activeId);
        const isLegacy = latest.version !== def.version;
        if (isLegacy) {
            const legacy = element('div', 'scales-version-upgrade');
            legacy.setAttribute('role', 'note');
            legacy.appendChild(element('h4', '', activeId === 'bnss' ? 'Доступна полная BNSS из клинических рекомендаций' : 'Доступна новая редакция ' + latest.name));
            legacy.appendChild(element('p', '', 'Сейчас открыта сохранённая оценка прежней редакции. Новая форма: ' + latest.version + '.'));
            legacy.appendChild(element('p', '', 'Новая оценка начнётся с пустых ответов. Завершённая прежняя оценка останется в истории; замена незавершённого черновика потребует подтверждения.'));
            legacy.appendChild(button(activeId === 'bnss' ? 'Открыть полную BNSS — новая оценка' : 'Начать оценку по новой редакции', () => {
                const start = () => { S.store.startCurrentVersion(activeId); render(); panel.focus(); };
                if (!S.evaluate(a).complete && hasDraftData(a, def)) S.confirmAction('Новая редакция начнётся с пустых ответов. Незавершённый текущий черновик и заметки будут очищены. Продолжить?', start);
                else start();
            }));
            panel.appendChild(legacy);
        }
        panel.appendChild(element('p', 'scales-meta', (isLegacy ? 'Сохранённая редакция: ' : 'Версия: ') + (a.scaleVersion || def.version || 'не указана') + '. Русский перевод: ' + (a.translationVersion || def.translationVersion || 'не подтверждён')));
        appendSource(panel, def);
        if (def.notice) panel.appendChild(element('p', 'scales-notice', (isLegacy ? 'Описание прежней редакции: ' : '') + def.notice));
        const instructions = [def.instruction, ...(def.instructions || []), ...(Array.isArray(def.sourceNotes) ? def.sourceNotes : def.sourceNotes ? [def.sourceNotes] : [])].filter(Boolean);
        if (instructions.length || def.sourceInterpretation) {
            const help = element('details', 'scales-instructions');
            help.appendChild(element('summary', '', 'Инструкция и примечания к источнику'));
            instructions.forEach(text => help.appendChild(element('p', '', typeof text === 'string' ? text : text.text || JSON.stringify(text))));
            if (def.sourceInterpretation) help.appendChild(element('p', '', def.sourceInterpretation));
            panel.appendChild(help);
        }

        if (def.mode === 'cssrs' || def.mode === 'cssrs-full') {
            const variant = element('select');
            const forms = def.forms || [{ id: 'recent', label: 'Скрининг Recent — последний месяц', enabled: true }];
            forms.forEach(form => {
                const option = element('option', '', form.label);
                option.value = form.id;
                option.disabled = form.enabled === false || (def.approvedForms && !def.approvedForms.includes(form.id));
                variant.appendChild(option);
            });
            variant.value = a.form || 'recent';
            variant.addEventListener('change', () => {
                const previous = S.store.get(activeId);
                const next = variant.value;
                if (next === previous.form) return;
                const selectedForm = forms.find(form => form.id === next);
                if (!selectedForm || selectedForm.enabled === false || (def.approvedForms && !def.approvedForms.includes(next))) {
                    variant.value = previous.form || 'recent';
                    return;
                }
                const hasData = hasDraftData(previous, def);
                const changeForm = () => {
                    if (typeof S.store.setForm === 'function') S.store.setForm(activeId, next);
                    else {
                        S.store.newAssessment(activeId);
                        S.store.update(activeId, current => { current.form = next; current.answers = {}; });
                    }
                    if (typeof S.syncReport === 'function') S.syncReport();
                    render();
                };
                if (hasData) {
                    variant.value = previous.form || 'recent';
                    S.confirmAction('Сменить форму? Будет открыта новая оценка с другим временным интервалом. Полная текущая оценка сохранится в истории; незавершённые ответы и заметки будут очищены.', changeForm);
                } else changeForm();
            });
            panel.appendChild(field('Форма C-SSRS', variant));
        }

        const metadata = element('div', 'scales-fields');
        metadata.appendChild(field('Дата оценки', input('date', a.date, value => patch(current => { current.date = value; }))));
        const period = input('text', a.period || def.period, value => patch(current => { current.period = value; }));
        if (!def.periodEditable && def.mode !== 'scores' && def.mode !== 'preparation') {
            period.readOnly = true;
            period.title = 'Временной интервал определяется выбранной официальной формой.';
        }
        metadata.appendChild(field('Временной интервал', period));
        panel.appendChild(metadata);
        if (def.mode === 'basic-symptom-criteria') {
            const periodConfirmed = element('input'); periodConfirmed.type = 'checkbox';
            periodConfirmed.checked = (a.details || {}).basicSymptomPeriodConfirmed === true;
            periodConfirmed.addEventListener('change', () => patch(current => { current.details.basicSymptomPeriodConfirmed = periodConfirmed.checked; }));
            panel.appendChild(field(def.periodConfirmationLabel, periodConfirmed));
        }
        if (def.mode === 'scores') {
            const externalStatus = element('p', 'scales-note');
            externalStatus.id = 'scales-external-status';
            panel.appendChild(externalStatus);
            const external = element('div', 'scales-fields');
            [['externalFormVersion', 'Версия использованного бланка'], ['externalTranslationVersion', 'Версия русского перевода'], ['externalSource', 'Источник использованного бланка']].forEach(([key, label]) => {
                const control = input('text', a[key], value => patch(current => { current[key] = value; }));
                control.placeholder = 'Не указано';
                external.appendChild(field(label + ' (необязательно)', control));
            });
            panel.appendChild(external);
        }

        const include = element('input');
        include.type = 'checkbox';
        include.checked = a.includeInReport !== false;
        include.disabled = def.mode === 'preparation';
        include.addEventListener('change', () => patch(current => { current.includeInReport = include.checked; }));
        const includeLabel = element('label', 'scales-include');
        includeLabel.append(include, element('span', '', 'Включать полностью заполненную оценку в заключение'));
        panel.appendChild(includeLabel);

        const results = element('div', 'scales-results');
        results.id = 'scales-results';
        results.setAttribute('aria-label', 'Результаты оценки');
        panel.appendChild(results);

        const items = element('div', 'scales-items');
        items.id = 'scales-items';
        panel.appendChild(items);
        if (def.mode === 'preparation') renderPreparation(items, a);
        else refreshItems(a, def);

        const comments = element('div', 'scales-comments');
        if (activeId.toLowerCase() === 'bnss') {
            comments.appendChild(field('Предполагаемые вторичные факторы: депрессия, седация, экстрапирамидные нарушения и другие', textArea(a.secondaryFactors, value => patch(current => { current.secondaryFactors = value; }))));
            comments.appendChild(element('p', 'scales-note', 'Эти сведения дополняют клиническую оценку и не меняют баллы BNSS.'));
        }
        comments.appendChild(field('Клинический комментарий врача', textArea(a.clinicianComment, value => patch(current => { current.clinicianComment = value; }), 3)));
        comments.appendChild(field('Дополнение к результатам в заключении', textArea(a.reportComment, value => patch(current => { current.reportComment = value; }), 2)));
        const edit = element('details', 'scales-report-edit');
        edit.appendChild(element('summary', '', 'Ручная редакция текста результатов'));
        edit.appendChild(element('p', 'scales-note', 'Готовый блок можно редактировать в разделе «Сформированный текст». После изменения ответов рассчитанное описание обновится; независимое дополнение к заключению сохранится. Незавершённые оценки не добавляются автоматически.'));
        if (a.reportOverride) edit.appendChild(button('Вернуть автоматический текст', () => {
            patch(current => { current.reportOverride = null; });
            render();
            message('Ручная редакция сброшена. Текст результатов рассчитан по ответам.');
        }));
        comments.appendChild(edit);
        panel.appendChild(comments);

        const actions = element('div', 'scales-actions');
        actions.appendChild(button('Сохранить снимок', () => {
            const saved = S.store.snapshot(activeId);
            refreshHistory(S.store.get(activeId));
            message(saved ? 'Неизменяемый снимок сохранён в истории этого случая.' : 'Снимок уже сохранён или оценка ещё не завершена.');
        }, 'scales-snapshot'));
        actions.appendChild(button('Новая оценка', () => {
            const current = S.store.get(activeId);
            const wasComplete = S.evaluate(current).complete;
            const startNew = () => {
                S.store.newAssessment(activeId);
                render();
                message(wasComplete ? 'Открыта новая оценка. Завершённая предыдущая оценка сохранена в истории.' : 'Открыта новая оценка. Предыдущий незавершённый черновик очищен.');
            };
            if (!wasComplete && hasDraftData(current, def)) S.confirmAction('Начать новую оценку? Незавершённые ответы и заметки текущей шкалы будут очищены и не сохранятся в истории.', startNew);
            else startNew();
        }));
        actions.appendChild(button('Распечатать', printAssessment));
        actions.appendChild(button('Экспорт JSON', exportAssessment));
        const reset = button('Сбросить шкалу', () => {
            S.confirmAction('Сбросить текущую оценку ' + def.name + '? Её результаты будут удалены из заключения. Другие шкалы и сохранённая история останутся.', () => {
                S.store.reset(activeId);
                if (typeof S.syncReport === 'function') S.syncReport();
                render();
                message('Текущая оценка сброшена.');
            });
        });
        reset.classList.add('scales-reset');
        actions.appendChild(reset);
        panel.appendChild(actions);
        const history = element('details', 'scales-history');
        history.id = 'scales-history';
        panel.appendChild(history);
        refreshResults(a);
        refreshHistory(a);
    }

    function button(text, handler, id) {
        const control = element('button', 'btn-secondary', text);
        control.type = 'button';
        if (id) control.id = id;
        control.addEventListener('click', handler);
        return control;
    }

    function renderItem(item, a, def) {
        const block = element('article', 'scales-item');
        block.dataset.item = item.id;
        if (item.attention || (activeId.toLowerCase() === 'cdss' && /^(8|C8|CDSS8|suicide)$/i.test(item.id))) block.classList.add('scales-item--attention');
        const heading = element('div', 'scales-item-heading');
        const title = element('h5');
        title.id = 'scales-item-' + activeId + '-' + item.id;
        if (def.mode !== 'cssrs-full') title.appendChild(element('span', 'scales-item-code', item.id));
        title.appendChild(document.createTextNode(item.label && item.label !== item.id ? item.label : 'Оценка по оригинальному бланку'));
        heading.appendChild(title);
        block.appendChild(heading);
        let question;
        if (item.question) {
            question = element('p', 'scales-question', item.question);
            question.id = 'scales-question-' + activeId + '-' + item.id;
            block.appendChild(question);
        }

        const typed = ['date', 'integer', 'text'].includes(item.type);
        const select = element(typed ? 'input' : 'select');
        if (typed) {
            select.type = item.type === 'integer' ? 'number' : item.type;
            if (item.type === 'integer') { select.min = item.min; select.max = item.max; select.step = 1; }
            select.placeholder = item.optional ? 'Можно оставить неизвестным' : 'Не оценено';
        }
        select.id = 'scales-answer-' + activeId + '-' + item.id;
        select.setAttribute('aria-labelledby', title.id + (question ? ' ' + question.id : ''));
        const empty = element('option', '', 'Не оценено');
        empty.value = '';
        if (!typed) select.appendChild(empty);
        const options = typed ? [] : item.options || Array.from({ length: item.max - item.min + 1 }, (_, index) => {
            const value = item.min + index, anchor = (item.anchors || []).find(entry => entry.value === value);
            return { value, label: anchor ? value + ' — ' + anchor.label.slice(0, 95) : String(value) };
        });
        options.forEach(option => {
            const entry = element('option', '', option.label === undefined ? String(option.value) : option.label);
            entry.value = String(option.value);
            select.appendChild(entry);
        });
        if (item.allowUnable || item.allowUnassessable) {
            const unable = element('option', '', 'Не удалось оценить');
            unable.value = 'unable';
            select.appendChild(unable);
        }
        const value = (a.answers || {})[item.id];
        select.value = value === null || value === undefined ? '' : String(value);
        select.addEventListener(typed ? 'input' : 'change', () => {
            const raw = select.value;
            const value = raw === '' ? null : ['date', 'text'].includes(item.type) ? raw : raw === 'true' ? true : raw === 'false' ? false : raw === 'unable' ? 'unable' : Number(raw);
            const current = patch(assessment => {
                assessment.answers = assessment.answers || {};
                assessment.answers[item.id] = value;
            });
            refreshItems(current, definition(current));
            if (def.mode === 'basic-symptom-criteria') renderBasicOperands(block, item, current, def);
        });
        block.appendChild(select);
        const criteria = element('details', 'scales-criteria');
        criteria.appendChild(element('summary', '', 'Критерии оценки и инструкция'));
        if (item.instruction) criteria.appendChild(element('p', '', item.instruction));
        if (item.interviewKind === 'observation') block.appendChild(element('p', 'scales-note', 'Оценка по наблюдению врача в ходе интервью.'));
        if (item.anchors && item.anchors.length) {
            item.anchors.forEach(anchor => criteria.appendChild(element('p', '', anchor.value + ' — ' + (anchor.label || '') + (anchor.description ? '\n' + anchor.description : ''))));
        } else if (!item.instruction) {
            criteria.appendChild(element('p', '', def.mode === 'scores' ? 'Введите оценку, полученную по разрешённому оригинальному интервью. Полные вопросы и оценочные якоря не включены до подтверждения прав на электронное использование.' : (item.instruction || 'Следуйте формулировке и переходам выбранной официальной формы. Ответ «Нет» отличается от неоценённого пункта.')));
        }
        block.appendChild(criteria);
        const comment = field('Комментарий к пункту', textArea((a.itemComments || {})[item.id], value => patch(current => {
            current.itemComments = current.itemComments || {};
            current.itemComments[item.id] = value;
        })));
        comment.className = 'scales-comment-label';
        block.appendChild(comment);
        if (def.mode === 'basic-symptom-criteria') renderBasicOperands(block, item, a, def);
        if (activeId.toLowerCase() === 'sops') {
            const details = element('details', 'scales-item-details');
            details.appendChild(element('summary', '', 'Частота, начало, продолжительность и динамика'));
            const fields = element('div', 'scales-fields');
            [['frequency', 'Частота'], ['onset', 'Начало'], ['duration', 'Продолжительность'], ['dynamics', 'Динамика']].forEach(([key, label]) => {
                fields.appendChild(field(label, input('text', ((a.details || {})[item.id] || {})[key], value => patch(current => {
                    current.details = current.details || {};
                    current.details[item.id] = current.details[item.id] || {};
                    current.details[item.id][key] = value;
                }))));
            });
            details.appendChild(fields);
            block.appendChild(details);
        }
        return block;
    }

    function renderBasicOperands(block, item, a, def) {
        const old = block.querySelector('.scales-basic-operands');
        const focusedId = old && old.contains(document.activeElement) ? document.activeElement.id : null;
        if (old) old.remove();
        const value = a.answers[item.id];
        if (typeof value !== 'number' || value < 3 || value > 6) return;
        const container = element('div', 'scales-basic-operands');
        const details = ((a.details || {}).basicSymptoms || {})[item.id] || {};
        const add = (key, label) => {
            const control = element('select');
            control.id = 'scales-basic-' + item.id + '-' + key;
            [['', 'Не уточнено'], ['true', 'Да'], ['false', 'Нет']].forEach(([value, text]) => { const option = element('option', '', text); option.value = value; control.appendChild(option); });
            control.value = typeof details[key] === 'boolean' ? String(details[key]) : '';
            control.addEventListener('change', () => {
                const current = patch(assessment => {
                    const all = assessment.details.basicSymptoms ||= {};
                    const current = all[item.id] ||= {};
                    current[key] = control.value === '' ? null : control.value === 'true';
                });
                renderBasicOperands(block, item, current, def);
            });
            container.appendChild(field(label, control));
        };
        add('clinicallyConfirmed', def.clinicalConfirmationLabel);
        if (details.clinicallyConfirmed === true && item.group !== 'cogdis-only') add('onset12Months', def.onsetLabel);
        block.appendChild(container);
        if (focusedId) { const control = document.getElementById(focusedId); if (control) control.focus(); }
    }

    function refreshItems(a, def) {
        if (def.mode === 'preparation') return;
        const container = panel.querySelector('#scales-items');
        const items = visibleItems(a, def);
        const ids = new Set(items.map(item => item.id));
        itemNodes.forEach((node, id) => {
            if (!ids.has(id)) { node.remove(); itemNodes.delete(id); }
        });
        const groups = def.groups && def.groups.length ? def.groups : [{ id: 'all', label: def.mode === 'cssrs' ? 'Скрининговые вопросы' : 'Оценки по пунктам', items: items.map(item => item.id) }];
        groups.forEach((group, groupIndex) => {
            const relevant = items.filter(item => item.group === group.id || (group.items || []).includes(item.id) || group.id === 'all');
            let section = container.querySelector('[data-group="' + group.id + '"]');
            if (!relevant.length) { if (section) section.remove(); return; }
            if (!section) {
                section = element('section', 'scales-group');
                section.dataset.group = group.id;
                section.appendChild(element('h4', '', group.label));
                const nextGroup = groups.slice(groupIndex + 1).map(next => container.querySelector('[data-group="' + next.id + '"]')).find(Boolean);
                container.insertBefore(section, nextGroup || null);
            }
            relevant.forEach((item, index) => {
                if (!itemNodes.has(item.id)) {
                    const node = renderItem(item, a, def);
                    itemNodes.set(item.id, node);
                    const nextItem = relevant.slice(index + 1).find(next => itemNodes.has(next.id));
                    section.insertBefore(node, nextItem ? itemNodes.get(nextItem.id) : null);
                }
            });
        });
    }

    function renderPreparation(container, a) {
        container.appendChild(element('p', 'scales-notice', 'Технические заметки к обследованию. Эти поля не являются интервью SPI-A. COGDIS и COPER: недостаточно данных; автоматическая проверка критериев не выполняется.'));
        const fields = element('div', 'scales-comments');
        [['cognitive', 'Когнитивные переживания'], ['perceptual', 'Перцептивные переживания'], ['onset', 'Начало и динамика'], ['frequency', 'Частота и продолжительность'], ['distinctness', 'Отличимость от привычного состояния'], ['alternatives', 'Возможные альтернативные объяснения']].forEach(([key, label]) => {
            fields.appendChild(field(label, textArea(((a.details || {}).preparation || {})[key], value => patch(current => {
                current.details = current.details || {};
                current.details.preparation = current.details.preparation || {};
                current.details.preparation[key] = value;
            }))));
        });
        container.appendChild(fields);
    }

    function explanationLines(a, result) {
        const lines = [];
        const value = result.interpretation || result.explanation;
        if (typeof value === 'string') lines.push(value);
        else if (Array.isArray(value)) lines.push(...value.filter(item => typeof item === 'string'));
        if (typeof S.interpret === 'function' && !value) {
            const interpreted = S.interpret(a, result);
            if (typeof interpreted === 'string') lines.push(interpreted);
            else if (Array.isArray(interpreted)) lines.push(...interpreted.filter(item => typeof item === 'string'));
        }
        return lines;
    }

    function scoreText(result) {
        if (!result.complete && typeof result.partialTotal === 'number') return result.answered ? result.partialTotal + '/' + result.max + ' (сумма оценённых пунктов; неполно)' : 'Не оценено';
        return result.total === null || result.total === undefined ? 'Общая сумма не применяется' : result.total + (result.max === undefined || result.max === null ? '' : '/' + result.max) + (result.complete ? '' : ' (частично)');
    }

    function addScore(grid, label, value, max, complete) {
        const cell = element('div', 'scales-result-cell');
        cell.appendChild(element('dt', '', label));
        const text = value === null || value === undefined ? 'Недостаточно данных' : String(value) + (max === null || max === undefined ? '' : '/' + max);
        const dd = element('dd', '', text);
        if (complete === false && value !== null && value !== undefined) dd.appendChild(element('small', '', ' · частично'));
        cell.appendChild(dd);
        grid.appendChild(cell);
    }

    function refreshResults(a) {
        const target = panel.querySelector('#scales-results');
        if (!target) return;
        const def = definition(a);
        const result = S.evaluate(a);
        const externalStatus = panel.querySelector('#scales-external-status');
        if (externalStatus) externalStatus.textContent = a.externalFormVersion ? 'Использованный внешний бланк: ' + a.externalFormVersion + (a.externalTranslationVersion ? '; русский перевод: ' + a.externalTranslationVersion : '; версия русского перевода не указана') : 'Версия внешнего бланка не указана. Укажите реквизиты использованной разрешённой методики для сохранения и печати.';
        target.replaceChildren(element('h4', '', 'Результаты'));
        let status = (result.answered || 0) + '/' + (result.required || 0) + ' обязательных пунктов';
        if (def.mode === 'preparation') status = 'Недостаточно данных — техническая подготовка';
        else if (result.complete) status += a.includeInReport === false ? ' · включение в заключение отключено' : ' · готово к включению в заключение';
        else status += ' · оценка не завершена, в заключение не добавляется';
        const statusLine = element('p', 'scales-result-status', status);
        statusLine.setAttribute('role', 'status');
        statusLine.setAttribute('aria-live', 'polite');
        target.appendChild(statusLine);
        const grid = element('dl', 'scales-result-grid');
        if (def.mode === 'scores' || def.mode === 'interview') addScore(grid, result.complete ? (activeId.toLowerCase() === 'sops' ? 'Общая сумма (описательно)' : 'Суммарный балл') : 'Сумма оценённых пунктов', result.complete ? result.total : result.answered ? result.partialTotal : null, result.max, result.complete);
        function currentValue(score, group) {
            if (score.complete) return score.value;
            const hasAnswer = group && group.items.some(id => {
                const item = def.items.find(entry => entry.id === id);
                return item && S.validAnswer(item, (a.answers || {})[id]);
            });
            return hasAnswer ? score.partialValue : null;
        }
        Object.entries(result.subscales || {}).forEach(([id, score]) => addScore(grid, score.label, currentValue(score, (def.groups || []).find(group => group.id === id)), score.max, score.complete));
        Object.entries(result.domains || {}).forEach(([id, score]) => {
            if (score && typeof score === 'object') addScore(grid, score.label, currentValue(score, (def.domainDefinitions || []).find(group => group.id === id)), score.max, score.complete);
        });
        if (def.mode === 'cssrs') {
            const severity = result.ideationSeverity !== undefined ? result.ideationSeverity : result.severity;
            if (severity !== undefined && severity !== null) addScore(grid, 'Максимальная тяжесть мыслей', severity, 5, result.complete);
            addScore(grid, 'Суицидальное поведение за жизнь', result.behavior === null ? null : result.behavior ? 'Да' : 'Нет');
            if (result.behavior === true) addScore(grid, 'Поведение за последние 3 месяца', result.recentBehavior === null ? null : result.recentBehavior ? 'Да' : 'Нет');
            target.appendChild(element('p', 'scales-note', 'Единая сумма суицидального риска не рассчитывается. Краткий скрининг не оценивает интенсивность мыслей и все типы поведения полной формы.'));
        }
        if (def.mode === 'cssrs-full') {
            addScore(grid, 'Максимальная категория тяжести мыслей за жизнь', result.severity, 5, result.complete);
            addScore(grid, 'Интенсивность наиболее опасной идеи (отдельно)', result.intensityApplicable === false ? 'Не применяется' : result.intensityTotal, result.intensityApplicable === true ? 25 : null, result.complete);
            addScore(grid, 'Суицидальное поведение за жизнь', result.behavior === null ? null : result.behavior ? 'Да' : 'Нет');
            addScore(grid, 'Несуицидальные самоповреждения', result.nssi === null ? null : result.nssi ? 'Да' : 'Нет');
            target.appendChild(element('p', 'scales-note', 'Тяжесть, интенсивность и виды поведения — разные показатели. Единого балла риска нет. Период и состав этой формы заданы приложением КР.'));
        }
        if (def.mode === 'basic-symptom-criteria') {
            ['cogdis', 'coper'].forEach(key => addScore(grid, key.toUpperCase(), result[key].value === null || (!result.complete && result[key].value === false) ? null : result[key].value ? result.complete ? 'Критерии выполнены' : 'Предварительно набран; требуется завершить оценку' : 'Критерии не выполнены', null, result.complete));
            target.appendChild(element('p', 'scales-note', 'Отображается критериальная оценка базисных симптомов; полное интервью SPI-A не проводилось.'));
        }
        if (grid.children.length) target.appendChild(grid);
        if (activeId === 'sops') {
            const profile = element('div', 'scales-profile');
            profile.setAttribute('aria-label', 'Профиль симптомов SOPS');
            Object.entries(result.subscales || {}).forEach(([id, score]) => {
                const value = currentValue(score, (def.groups || []).find(group => group.id === id));
                if (value === null) return;
                const meter = element('meter');
                meter.min = 0;
                meter.max = score.max;
                meter.value = value;
                meter.setAttribute('aria-label', score.label + ': ' + value + ' из ' + score.max + (score.complete ? '' : ', оценка неполная'));
                profile.appendChild(field(score.label + (score.complete ? '' : ' · частично'), meter));
            });
            if (profile.children.length) target.appendChild(profile);
        }
        if (['cssrs', 'cssrs-full', 'basic-symptom-criteria'].includes(def.mode) && result.complete && typeof S.resultText === 'function') target.appendChild(element('p', 'scales-result-explanation', S.resultText(a, result)));
        (result.warnings || []).forEach(warning => target.appendChild(element('p', 'scales-warning', typeof warning === 'string' ? warning : warning.message || warning.text || 'Требуется внимание врача.')));
        if (result.requiresReview) {
            target.appendChild(button('Подтвердить пересмотр ранее положительных ответов', () => {
                S.confirmAction('Подтверждаете, что прежние положительные ответы повторно уточнены у пациента и пересмотрены? Изменения сохранятся в истории пересмотра.', () => {
                    S.store.confirmRevision(activeId);
                    render();
                    message('Пересмотр ранее положительных ответов подтверждён и сохранён в истории.');
                });
            }));
        }
        explanationLines(a, result).forEach(line => target.appendChild(element('p', 'scales-result-explanation', line)));
        if (a.reportOverride) target.appendChild(element('p', 'scales-note', 'Сохранена ручная редакция текста результатов. После изменения ответов используется обновлённое рассчитанное описание. Независимый комментарий сохраняется.'));
        const snapshot = panel.querySelector('#scales-snapshot');
        if (snapshot) snapshot.disabled = !result.complete || def.mode === 'preparation';
        refreshHistory(a);
    }

    function historyList() {
        return typeof S.store.history === 'function' ? S.store.history(activeId) : [];
    }

    function renderComparison(a, history) {
        const container = element('div', 'scales-comparison');
        container.appendChild(element('h4', '', 'Сравнение оценок'));
        const select = element('select');
        const snapshotKey = snapshot => snapshot.snapshotId || snapshot.id + ':' + (snapshot.archivedAt || snapshot.updatedAt || '');
        history.forEach(snapshot => {
            const stamp = snapshot.archivedAt || snapshot.updatedAt;
            const date = stamp ? new Date(stamp) : null;
            const time = date && Number.isFinite(date.getTime()) ? date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : '';
            const suffix = (snapshot.snapshotId || snapshot.id || '').slice(-6);
            const option = element('option', '', formattedDate(snapshot.date) + (time ? ' · ' + time : '') + (suffix ? ' · ' + suffix : ''));
            option.value = snapshotKey(snapshot);
            select.appendChild(option);
        });
        let key = comparisonBaselines.get(a.scaleId);
        if (!history.some(snapshot => snapshotKey(snapshot) === key)) {
            const latest = history.slice().reverse().find(snapshot => snapshot.id !== a.id) || history[history.length - 1];
            key = snapshotKey(latest);
        }
        comparisonBaselines.set(a.scaleId, key);
        select.value = key;
        container.appendChild(field('Сравнить текущую оценку с сохранённой', select));
        const output = element('div', 'scales-comparison-output');
        container.appendChild(output);
        function updateComparison() {
            const baseline = history.find(snapshot => snapshotKey(snapshot) === select.value);
            comparisonBaselines.set(a.scaleId, select.value);
            const comparison = S.compareAssessments(a, baseline);
            output.replaceChildren();
            (comparison.reasons || []).forEach(reason => output.appendChild(element('p', 'scales-comparison-reason', reason)));
            if (comparison.comparable) {
                const scroll = element('div', 'scales-comparison-table-wrap');
                const table = element('table', 'scales-comparison-table');
                table.appendChild(element('caption', '', 'Динамика относительно оценки от ' + formattedDate(baseline.date)));
                const head = element('thead');
                const titles = element('tr');
                ['Показатель', 'Ранее', 'Сейчас', 'Разность'].forEach(text => {
                    const th = element('th', '', text);
                    th.scope = 'col';
                    titles.appendChild(th);
                });
                head.appendChild(titles);
                const body = element('tbody');
                (comparison.rows || []).forEach(row => {
                    const tr = element('tr');
                    const label = element('th', '', row.label);
                    label.scope = 'row';
                    tr.appendChild(label);
                    const score = value => value === null || value === undefined ? '—' : String(value) + (row.kind === 'score' && row.max !== undefined ? '/' + row.max : '');
                    tr.append(element('td', '', score(row.previous)), element('td', '', score(row.current)), element('td', '', row.delta === null || row.delta === undefined ? '—' : (row.delta > 0 ? '+' : '') + row.delta));
                    body.appendChild(tr);
                });
                table.append(head, body);
                scroll.appendChild(table);
                output.appendChild(scroll);
            }
            (comparison.notices || []).forEach(notice => output.appendChild(element('p', 'scales-note', notice)));
        }
        select.addEventListener('change', updateComparison);
        updateComparison();
        return container;
    }

    function refreshHistory(a) {
        const target = panel.querySelector('#scales-history');
        if (!target) return;
        const history = historyList();
        target.replaceChildren(element('summary', '', 'История оценок (' + history.length + ')'));
        target.appendChild(element('p', 'scales-note', 'Сохранённые снимки неизменяемы и относятся к текущему случаю. Новую оценку начинайте отдельной записью.'));
        if (!history.length) return;
        const list = element('ol', 'scales-history-list');
        history.slice().reverse().forEach(snapshot => {
            const result = snapshot.results || S.evaluate(snapshot);
            const entry = element('li');
            entry.appendChild(element('strong', '', formattedDate(snapshot.date) + ' · ' + (snapshot.period || '')));
            entry.appendChild(element('p', '', ['cssrs', 'spi-a'].includes(snapshot.scaleId) && result.complete && typeof S.resultText === 'function' ? S.resultText(snapshot, result) : scoreText(result)));
            Object.values(result.subscales || {}).forEach(score => entry.appendChild(element('p', 'scales-note', score.label + ': ' + score.value + (score.max === undefined ? '' : '/' + score.max))));
            if (snapshot.clinicianComment) entry.appendChild(element('p', '', snapshot.clinicianComment));
            list.appendChild(entry);
        });
        target.appendChild(list);
        if (typeof S.compareAssessments === 'function') {
            target.appendChild(renderComparison(a, history));
            return;
        }
        const latest = history[history.length - 1];
        const currentResult = S.evaluate(a);
        const previous = latest.results || S.evaluate(latest);
        const comparable = currentResult.complete && previous.complete && a.form === latest.form && a.scaleVersion === latest.scaleVersion && a.id !== latest.id && typeof currentResult.total === 'number' && typeof previous.total === 'number';
        if (comparable) {
            const delta = currentResult.total - previous.total;
            target.appendChild(element('p', 'scales-delta', 'Изменение суммы к оценке от ' + formattedDate(latest.date) + ': ' + (delta > 0 ? '+' : '') + delta + '. Сопоставьте временные интервалы и клинические обстоятельства.'));
        }
    }

    function exportAssessment() {
        const a = S.store.get(activeId);
        const def = definition(a);
        const data = { format: 'psydraft-clinical-scale', formatVersion: 1, exportedAt: new Date().toISOString(), scale: { id: def.id, name: def.name, version: def.version, translationVersion: def.translationVersion, source: def.source }, assessment: a, results: S.evaluate(a), history: historyList() };
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = element('a');
        link.href = url;
        link.download = 'PSYDRAFT-' + def.name.replace(/[^a-z0-9-]/gi, '') + '-' + (a.date || 'assessment') + '.json';
        document.body.appendChild(link);
        link.click();
        link.remove();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
        message('Оценочный лист экспортирован в JSON.');
    }

    function answerLabel(item, value) {
        if (value === null || value === undefined) return 'Не оценено';
        if (value === 'unable') return 'Не удалось оценить';
        const selected = (item.options || []).find(option => option.value === value);
        if (selected) return selected.label;
        return value === true ? 'Да' : value === false ? 'Нет' : String(value);
    }

    const PRINT_SHEET_CSS = `
.scales-print-sheet { color: #111; font: 11pt/1.4 Arial, sans-serif; overflow: visible; overflow-wrap: anywhere; }
.scales-print-sheet h1 { font-size: 18pt; margin: 0 0 10pt; }
.scales-print-sheet h2 { font-size: 13pt; margin: 16pt 0 6pt; break-after: avoid; page-break-after: avoid; }
.scales-print-sheet h3 { font-size: 11pt; margin: 10pt 0 4pt; break-after: avoid; page-break-after: avoid; }
.scales-print-sheet p { margin: 4pt 0; white-space: pre-wrap; overflow-wrap: anywhere; }
.scales-print-sheet article { border-top: 1px solid #aaa; margin-top: 8pt; padding-top: 6pt; break-inside: auto; page-break-inside: auto; overflow: visible; }
.scales-print-sheet .scales-print-meta { font-size: 9pt; }
@media print {
    @page { margin: 16mm; }
    .scales-print-sheet { max-width: none; margin: 0; padding: 0; }
}
`;

    S.buildPrintSheet = function (a, def, result) {
        def = def || S.getDefinition(a.scaleId, a);
        result = result || S.evaluate(a);
        const root = element('div');
        root.className = 'scales-print-sheet';
        root.appendChild(element('h1', '', def.name + (def.title ? ' — ' + def.title : '')));
        root.appendChild(element('p', 'scales-print-meta', 'PSYDRAFT · Дата оценки: ' + formattedDate(a.date) + ' · ' + (a.period || def.period || '')));
        root.appendChild(element('p', 'scales-print-meta', 'Версия: ' + (a.scaleVersion || def.version || '') + ' · Русский перевод: ' + (a.translationVersion || def.translationVersion || 'не подтверждён')));
        root.appendChild(element('p', 'scales-print-meta', 'Источник: ' + sourceText(a.source || def.source)));
        if (def.mode === 'scores') {
            root.appendChild(element('p', 'scales-print-meta', 'Версия внешнего бланка: ' + (a.externalFormVersion || 'не указана')));
            root.appendChild(element('p', 'scales-print-meta', 'Версия использованного русского перевода: ' + (a.externalTranslationVersion || 'не указана')));
            root.appendChild(element('p', 'scales-print-meta', 'Источник использованного бланка: ' + (a.externalSource || 'не указан')));
        }
        if (def.notice) root.appendChild(element('p', '', def.notice));
        [def.instruction, ...(def.instructions || []), ...(Array.isArray(def.sourceNotes) ? def.sourceNotes : [])].filter(Boolean).forEach(text => root.appendChild(element('p', '', typeof text === 'string' ? text : text.text || JSON.stringify(text))));
        root.appendChild(element('h2', '', 'Результаты: ' + (result.answered || 0) + '/' + (result.required || 0) + ' · ' + (result.complete ? 'Оценка завершена' : 'Оценка не завершена')));
        if (def.mode === 'scores' || def.mode === 'interview') root.appendChild(element('p', '', scoreText(result)));
        if (['cssrs', 'cssrs-full', 'basic-symptom-criteria'].includes(def.mode) && result.complete && typeof S.resultText === 'function') root.appendChild(element('p', '', S.resultText(a, result)));
        Object.values(result.subscales || {}).concat(Object.values(result.domains || {})).forEach(score => {
            if (score && typeof score === 'object') root.appendChild(element('p', '', score.label + ': ' + (score.value === null || score.value === undefined ? 'Недостаточно данных' : score.value + (score.max === undefined || score.max === null ? '' : '/' + score.max))));
        });
        (result.warnings || []).forEach(warning => root.appendChild(element('p', '', typeof warning === 'string' ? warning : warning.message || warning.text || '')));
        explanationLines(a, result).forEach(line => root.appendChild(element('p', '', line)));
        root.appendChild(element('p', '', 'Включать в заключение: ' + (a.includeInReport !== false ? 'Да (при полном заполнении)' : 'Нет')));
        if (Array.isArray(a.answerRevisionHistory) && a.answerRevisionHistory.length) root.appendChild(element('p', 'scales-print-meta', 'Подтверждённых пересмотров ранее положительных ответов: ' + a.answerRevisionHistory.length + '.'));
        const visible = new Set(visibleItems(a, def).map(item => item.id));
        (def.items || []).forEach(item => {
            const article = element('article');
            article.appendChild(element('h3', '', (def.mode === 'cssrs-full' ? '' : item.id + '. ') + item.label));
            if (item.question) article.appendChild(element('p', '', item.question));
            if (item.instruction) article.appendChild(element('p', '', item.instruction));
            let skipText = 'Пропущено по алгоритму выбранной формы';
            if (def.mode === 'cssrs' && ((['q3', 'q4', 'q5'].includes(item.id) && typeof (a.answers || {}).q2 !== 'boolean') || (item.id === 'q6recent' && typeof (a.answers || {}).q6 !== 'boolean'))) skipText = 'Переход ещё не определён — предшествующий вопрос не оценён';
            const answer = (a.answers || {})[item.id];
            const hiddenEvidence = (def.mode === 'cssrs' || def.mode === 'cssrs-full') && (answer === true || (typeof answer === 'number' && answer > 0));
            const response = visible.has(item.id) ? item.optional && (answer === null || answer === undefined) ? 'Не указано (необязательное поле)' : answerLabel(item, answer) :
                hiddenEvidence ? answerLabel(item, answer) + (answer === true ? ' (ранее положительный ответ; требуется клинический пересмотр)' : ' (ранее положительные сведения; требуется клинический пересмотр)') : skipText;
            article.appendChild(element('p', '', 'Ответ: ' + response));
            const selected = (item.anchors || []).find(anchor => anchor.value === (a.answers || {})[item.id]);
            if (selected) article.appendChild(element('p', '', 'Критерий: ' + (selected.label || '') + (selected.description ? '\n' + selected.description : '')));
            if ((a.itemComments || {})[item.id]) article.appendChild(element('p', '', 'Комментарий: ' + a.itemComments[item.id]));
            const details = (a.details || {})[item.id];
            if (details) [['frequency', 'Частота'], ['onset', 'Начало'], ['duration', 'Продолжительность'], ['dynamics', 'Динамика']].forEach(([key, label]) => { if (details[key]) article.appendChild(element('p', '', label + ': ' + details[key])); });
            if (def.mode === 'basic-symptom-criteria' && typeof answer === 'number' && answer >= 3 && answer <= 6) {
                const operands = ((a.details || {}).basicSymptoms || {})[item.id] || {};
                [[def.clinicalConfirmationLabel, operands.clinicallyConfirmed], [def.onsetLabel, operands.onset12Months]].forEach(([label, value]) => {
                    if (typeof value === 'boolean') article.appendChild(element('p', '', label + ': ' + (value ? 'Да' : 'Нет')));
                });
            }
            root.appendChild(article);
        });
        if (def.mode === 'preparation') {
            root.appendChild(element('p', '', 'COGDIS / COPER: недостаточно данных. Технические заметки не являются интервью SPI-A.'));
            const notes = (a.details || {}).preparation || {};
            [['cognitive', 'Когнитивные переживания'], ['perceptual', 'Перцептивные переживания'], ['onset', 'Начало и динамика'], ['frequency', 'Частота и продолжительность'], ['distinctness', 'Отличимость от привычного состояния'], ['alternatives', 'Альтернативные объяснения']].forEach(([key, label]) => { if (notes[key]) root.appendChild(element('p', '', label + ': ' + notes[key])); });
        }
        [['secondaryFactors', 'Предполагаемые вторичные факторы'], ['clinicianComment', 'Комментарий врача'], ['reportComment', 'Дополнение к заключению']].forEach(([key, label]) => {
            if (a[key]) { root.appendChild(element('h2', '', label)); root.appendChild(element('p', '', a[key])); }
        });
        if (a.reportOverride) root.appendChild(element('p', 'scales-print-meta', 'Оценочный лист показывает рассчитанные результаты. Ручная редакция блока заключения хранится отдельно.'));
        return root;
    };

    function serializePrintSheet(sheet, title) {
        return '<!DOCTYPE html>\n<html lang="ru"><head><meta charset="utf-8">' +
            '<meta name="viewport" content="width=device-width, initial-scale=1">' +
            '<meta http-equiv="Content-Security-Policy" content="default-src \'none\'; style-src \'unsafe-inline\'; base-uri \'none\'; form-action \'none\'">' +
            '<title>' + S.escapeHTML(title) + '</title><style>' + PRINT_SHEET_CSS +
            '\nbody { margin: 0; padding: 24px; background: white; } .scales-print-sheet { max-width: 190mm; margin: 0 auto; } @media print { body { padding: 0; } }' +
            '</style></head><body>' + sheet.outerHTML + '</body></html>';
    }

    S.printSheetHTML = function (assessment, def, result) {
        def = def || S.getDefinition(assessment.scaleId, assessment);
        return serializePrintSheet(S.buildPrintSheet(assessment, def, result), def.name + ' — ' + (assessment.date || 'Оценочный лист'));
    };

    function downloadPrintSheet(sheet, def, date) {
        const html = serializePrintSheet(sheet, def.name + ' — ' + (date || 'Оценочный лист'));
        const url = URL.createObjectURL(new Blob([html], { type: 'text/html;charset=utf-8' }));
        const link = element('a');
        link.href = url;
        link.download = 'PSYDRAFT-' + def.name.replace(/[^a-z0-9-]/gi, '') + '-' + (date || 'assessment') + '.html';
        document.body.appendChild(link);
        link.click();
        link.remove();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
    }

    S.showPrintPreview = function (assessment, def, result) {
        if (closeConfirmation) closeConfirmation(false);
        if (closePrintPreview) closePrintPreview();
        def = def || S.getDefinition(assessment.scaleId, assessment);
        const sheet = S.buildPrintSheet(assessment, def, result);
        const date = assessment.date;
        const trigger = document.activeElement;
        const dialog = element('dialog', 'scales-print-preview');
        dialog.setAttribute('role', 'dialog');
        dialog.setAttribute('aria-modal', 'true');
        dialog.setAttribute('aria-labelledby', 'scales-print-preview-title');
        const heading = element('h2', '', 'Оценочный лист — ' + def.name);
        heading.id = 'scales-print-preview-title';
        const header = element('div', 'scales-print-preview-header');
        const actions = element('div', 'scales-print-preview-actions');
        const status = element('p', 'scales-print-preview-status', 'Проверьте лист перед печатью или сохраните его в отдельный HTML-файл.');
        status.setAttribute('role', 'status');
        const content = element('div', 'scales-print-preview-content');
        content.tabIndex = 0;
        content.setAttribute('role', 'document');
        content.setAttribute('aria-label', 'Заполненный оценочный лист');
        content.appendChild(sheet);
        const style = element('style', '', PRINT_SHEET_CSS);
        let host = dialog;
        let fallback = false;
        let closed = false;
        let cleanPrint = null;
        const background = [];
        const close = button('Закрыть', finish);
        const save = button('Сохранить HTML', () => {
            downloadPrintSheet(sheet, def, date);
            status.textContent = 'Оценочный лист сохранён в отдельный HTML-файл.';
        });
        const print = button('Печать', () => {
            if (typeof window.print !== 'function') { status.textContent = 'Печать недоступна. Сохраните HTML-файл и откройте его в другом браузере.'; return; }
            if (cleanPrint) return;
            const oldRoot = document.getElementById('scales-print-root');
            if (oldRoot) oldRoot.remove();
            const root = element('div');
            root.id = 'scales-print-root';
            root.appendChild(sheet.cloneNode(true));
            document.body.appendChild(root);
            document.body.classList.add('scales-printing');
            print.disabled = true;
            const cleanup = () => {
                document.body.classList.remove('scales-printing');
                root.remove();
                window.removeEventListener('afterprint', cleanup);
                print.disabled = false;
                cleanPrint = null;
            };
            cleanPrint = cleanup;
            window.addEventListener('afterprint', cleanup, { once: true });
            try { window.focus(); window.print(); }
            catch (error) { status.textContent = 'Не удалось открыть печать. Можно сохранить оценочный лист в HTML.'; }
            finally { cleanup(); }
        });
        print.classList.remove('btn-secondary');
        actions.append(print, save, close);
        header.append(heading, actions, status);
        dialog.append(style, header, content);
        document.body.appendChild(dialog);
        function retainFocus(event) { if (fallback && !dialog.contains(event.target)) close.focus(); }
        function finish() {
            if (closed) return;
            closed = true;
            if (cleanPrint) cleanPrint();
            closePrintPreview = null;
            document.removeEventListener('focusin', retainFocus, true);
            if (!fallback && dialog.open && typeof dialog.close === 'function') dialog.close();
            host.remove();
            background.forEach(([node, inert, hidden]) => {
                node.inert = inert;
                if (hidden === null) node.removeAttribute('aria-hidden'); else node.setAttribute('aria-hidden', hidden);
            });
            if (trigger && trigger.isConnected && typeof trigger.focus === 'function') trigger.focus();
            else if (panel && panel.isConnected) panel.focus();
        }
        closePrintPreview = finish;
        dialog.addEventListener('cancel', event => { event.preventDefault(); finish(); });
        dialog.addEventListener('close', finish);
        dialog.addEventListener('keydown', event => {
            if (event.key === 'Escape') { event.preventDefault(); finish(); }
            else if (event.key === 'Tab') {
                const first = print.disabled ? save : print;
                if (event.shiftKey && document.activeElement === first) { event.preventDefault(); content.focus(); }
                else if (!event.shiftKey && document.activeElement === content) { event.preventDefault(); first.focus(); }
            }
        });
        try {
            if (typeof dialog.showModal !== 'function') throw new Error('Dialog API unavailable');
            dialog.showModal();
        } catch (error) {
            fallback = true;
            dialog.classList.add('scales-print-preview--fallback');
            dialog.setAttribute('open', '');
            host = element('div', 'scales-confirm-backdrop');
            dialog.replaceWith(host);
            host.appendChild(dialog);
            Array.from(document.body.children).forEach(node => {
                if (node === host) return;
                background.push([node, node.inert, node.getAttribute('aria-hidden')]);
                node.inert = true;
                node.setAttribute('aria-hidden', 'true');
            });
            document.addEventListener('focusin', retainFocus, true);
        }
        close.focus();
        return dialog;
    };

    function printAssessment() {
        const assessment = S.store.get(activeId);
        S.showPrintPreview(assessment, definition(assessment), S.evaluate(assessment));
    }

    S.init = function () {
        if (initialized) return;
        panel = document.getElementById('scales-panel');
        tabs = document.getElementById('scales-tabs');
        if (!panel || !tabs || !S.store) return;
        initialized = true;
        const definitions = Object.values(S.registry || {});
        const ids = definitions.map(def => def.id);
        if (ids.length) panel.setAttribute('aria-labelledby', 'scales-tab-' + ids[0]);
        ids.forEach((id, index) => {
            const def = S.getDefinition(id);
            const tab = element('button', '', def.name || id);
            tab.type = 'button';
            tab.id = 'scales-tab-' + id;
            tab.dataset.scale = id;
            tab.setAttribute('role', 'tab');
            tab.setAttribute('aria-controls', 'scales-panel');
            tab.setAttribute('aria-selected', String(index === 0));
            tab.tabIndex = index === 0 ? 0 : -1;
            tab.title = def.title || def.name;
            tab.addEventListener('click', () => activate(id, false));
            tab.addEventListener('keydown', event => {
                let next;
                if (event.key === 'ArrowRight') next = (index + 1) % ids.length;
                else if (event.key === 'ArrowLeft') next = (index - 1 + ids.length) % ids.length;
                else if (event.key === 'Home') next = 0;
                else if (event.key === 'End') next = ids.length - 1;
                if (next !== undefined) { event.preventDefault(); activate(ids[next], true); }
            });
            tabs.appendChild(tab);
        });
        const open = () => { if (!opened && ids.length) activate(ids[0], false); };
        document.querySelectorAll('a[href="#section-scales"]').forEach(link => link.addEventListener('click', open));
        if ('IntersectionObserver' in window) {
            observer = new IntersectionObserver(entries => { if (entries.some(entry => entry.isIntersecting)) open(); }, { threshold: 0.05 });
            observer.observe(document.getElementById('section-scales'));
        }
        if (window.location.hash === '#section-scales') open();
        document.addEventListener('psydraft:case-reset', () => {
            if (closePrintPreview) closePrintPreview();
            opened = false;
            activeId = null;
            itemNodes.clear();
            comparisonBaselines.clear();
            panel.replaceChildren(element('p', 'small-note', 'Новый случай. Выберите шкалу, чтобы начать отдельную оценку.'));
            tabs.querySelectorAll('[role="tab"]').forEach((tab, index) => {
                tab.setAttribute('aria-selected', 'false');
                tab.tabIndex = index === 0 ? 0 : -1;
            });
            message('Результаты шкал предыдущего случая очищены.');
        });
    };
}());
