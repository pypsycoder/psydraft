// Модель: массив назначений
// Один элемент: {
//   id: number,
//   name: string,
//   durationValue: string | null,
//   durationType: "days" | "months",
//   times: { [time: string]: string }  // "утром": "50", ...
//   comment: string
// }

let prescriptions = [];
let rxNextId = 1;
let rxEditingId = null;

// Инициализация UI после загрузки DOM
document.addEventListener('DOMContentLoaded', function () {
    const submitBtn = document.getElementById('rx-submit-btn');
    const clearBtn = document.getElementById('rx-clear-btn');
    const timeCheckboxes = document.querySelectorAll('.rx-time-checkbox');

    if (submitBtn) {
        submitBtn.addEventListener('click', onRxSubmit);
    }

    if (clearBtn) {
        clearBtn.addEventListener('click', clearPrescriptionForm);
    }

    // включение/отключение доз в зависимости от чекбоксов
    timeCheckboxes.forEach(cb => {
        cb.addEventListener('change', function () {
            const time = cb.getAttribute('data-time');
            const doseInput = document.querySelector('.rx-dose-input[data-time="' + time + '"]');
            if (!doseInput) return;
            if (cb.checked) {
                doseInput.disabled = false;
                doseInput.focus();
            } else {
                doseInput.value = '';
                doseInput.disabled = true;
            }
        });
    });

    // Делегирование кликов по ✏️ / ❌
    const list = document.getElementById('prescriptions_list');
    if (list) {
        list.addEventListener('click', function (event) {
            const target = event.target.closest('.prescription-action-btn');
            if (!target) return;

            const id = parseInt(target.getAttribute('data-id'), 10);
            if (!id) return;

            const action = target.getAttribute('data-action');
            if (action === 'edit') {
                editPrescription(id);
            } else if (action === 'delete') {
                deletePrescription(id);
            }
        });
    }

    renderPrescriptionsList();
});

// Собрать данные из формы
function collectPrescriptionFormData() {
    const nameInput = document.getElementById('rx-name');
    const durationSelect = document.getElementById('rx-duration-value');
    const commentInput = document.getElementById('rx-comment');

    if (!nameInput || !durationSelect || !commentInput) {
        return null;
    }

    const name = nameInput.value.trim();
    if (!name) {
        return null;
    }

    const durationValue = durationSelect.value || null;
    let durationType = 'days';
    const durationTypeRadio = document.querySelector('input[name="rx-duration-type"]:checked');
    if (durationTypeRadio && (durationTypeRadio.value === 'days' || durationTypeRadio.value === 'months')) {
        durationType = durationTypeRadio.value;
    }

    const times = {};
    const timeCheckboxes = document.querySelectorAll('.rx-time-checkbox');
    timeCheckboxes.forEach(cb => {
        if (!cb.checked) return;
        const time = cb.getAttribute('data-time');
        const doseInput = document.querySelector('.rx-dose-input[data-time="' + time + '"]');
        if (!time) return;
        const doseVal = doseInput ? doseInput.value.trim() : '';
        if (doseVal) {
            times[time] = doseVal;
        } else {
            // время отмечено, но доза не указана — всё равно фиксируем как время без дозы
            times[time] = '';
        }
    });

    const comment = commentInput.value.trim();

    return {
        name,
        durationValue,
        durationType,
        times,
        comment
    };
}

// Применить данные к форме (для режима редактирования)
function fillPrescriptionForm(data) {
    const nameInput = document.getElementById('rx-name');
    const durationSelect = document.getElementById('rx-duration-value');
    const commentInput = document.getElementById('rx-comment');
    const timeCheckboxes = document.querySelectorAll('.rx-time-checkbox');

    if (!nameInput || !durationSelect || !commentInput) {
        return;
    }

    nameInput.value = data.name || '';
    durationSelect.value = data.durationValue || '';

    const radios = document.querySelectorAll('input[name="rx-duration-type"]');
    radios.forEach(r => {
        r.checked = (r.value === data.durationType);
    });

    // Сначала сбрасываем всё
    timeCheckboxes.forEach(cb => {
        const time = cb.getAttribute('data-time');
        const doseInput = document.querySelector('.rx-dose-input[data-time="' + time + '"]');
        cb.checked = false;
        if (doseInput) {
            doseInput.value = '';
            doseInput.disabled = true;
        }
    });

    // Затем включаем то, что есть в данных
    Object.keys(data.times || {}).forEach(time => {
        const cb = document.querySelector('.rx-time-checkbox[data-time="' + time + '"]');
        const doseInput = document.querySelector('.rx-dose-input[data-time="' + time + '"]');
        if (cb) {
            cb.checked = true;
        }
        if (doseInput) {
            doseInput.disabled = false;
            doseInput.value = data.times[time] || '';
        }
    });

    commentInput.value = data.comment || '';
}

// Очистка формы и выход из режима редактирования
function clearPrescriptionForm() {
    const nameInput = document.getElementById('rx-name');
    const durationSelect = document.getElementById('rx-duration-value');
    const commentInput = document.getElementById('rx-comment');
    const timeCheckboxes = document.querySelectorAll('.rx-time-checkbox');
    const submitBtn = document.getElementById('rx-submit-btn');

    if (nameInput) nameInput.value = '';
    if (durationSelect) durationSelect.value = '';
    if (commentInput) commentInput.value = '';

    timeCheckboxes.forEach(cb => {
        const time = cb.getAttribute('data-time');
        const doseInput = document.querySelector('.rx-dose-input[data-time="' + time + '"]');
        cb.checked = false;
        if (doseInput) {
            doseInput.value = '';
            doseInput.disabled = true;
        }
    });

    rxEditingId = null;
    if (submitBtn) {
        submitBtn.textContent = 'Добавить';
    }
}

// Обработка клика по кнопке "Добавить"/"Сохранить"
function onRxSubmit() {
    const formData = collectPrescriptionFormData();
    if (!formData) {
        // Можно в будущем добавить мягкую валидацию / подсветку
        return;
    }

    if (rxEditingId === null) {
        // режим добавления
        const newItem = {
            id: rxNextId++,
            name: formData.name,
            durationValue: formData.durationValue,
            durationType: formData.durationType,
            times: formData.times,
            comment: formData.comment
        };
        prescriptions.push(newItem);
    } else {
        // режим редактирования
        const index = prescriptions.findIndex(p => p.id === rxEditingId);
        if (index !== -1) {
            prescriptions[index] = {
                id: rxEditingId,
                name: formData.name,
                durationValue: formData.durationValue,
                durationType: formData.durationType,
                times: formData.times,
                comment: formData.comment
            };
        }
    }

    renderPrescriptionsList();
    clearPrescriptionForm();
}

// Рендер списка назначений
function renderPrescriptionsList() {
    const list = document.getElementById('prescriptions_list');
    if (!list) return;

    list.innerHTML = '';

    if (!prescriptions.length) {
        const empty = document.createElement('div');
        empty.className = 'prescriptions-empty';
        empty.textContent = 'Пока нет назначений.';
        list.appendChild(empty);
        return;
    }

    prescriptions.forEach((p, idx) => {
        const item = document.createElement('div');
        item.className = 'prescription-item';
        item.setAttribute('data-id', String(p.id));

        const titleParts = [];
        titleParts.push((idx + 1) + '. ' + p.name);

        const subParts = [];

        // схема приёма
        const timeParts = [];
        Object.keys(p.times || {}).forEach(time => {
            const dose = (p.times[time] || '').trim();
            if (dose) {
                timeParts.push(time + ' ' + dose + ' мг');
            } else {
                timeParts.push(time);
            }
        });

        if (timeParts.length) {
            subParts.push('Приём: ' + timeParts.join(', '));
        }

        if (p.durationValue) {
            const unit = p.durationType === 'months' ? 'месяцев' : 'дней';
            subParts.push('В течение ' + p.durationValue + ' ' + unit);
        }

        const titleText = titleParts.join(' ');
        const subText = subParts.join(' • ');

        const mainRow = document.createElement('div');
        mainRow.className = 'prescription-main-row';

        const textBlock = document.createElement('div');
        textBlock.className = 'prescription-main-text';

        const titleEl = document.createElement('div');
        titleEl.className = 'prescription-title';
        titleEl.textContent = titleText;

        textBlock.appendChild(titleEl);

        if (subText) {
            const subEl = document.createElement('div');
            subEl.className = 'prescription-subline';
            subEl.textContent = subText;
            textBlock.appendChild(subEl);
        }

        mainRow.appendChild(textBlock);

        const actions = document.createElement('div');
        actions.className = 'prescription-actions';

        const editBtn = document.createElement('button');
        editBtn.type = 'button';
        editBtn.className = 'prescription-action-btn';
        editBtn.setAttribute('data-action', 'edit');
        editBtn.setAttribute('data-id', String(p.id));
        editBtn.title = 'Редактировать';
        editBtn.innerHTML = '<span>✏️</span>';

        const deleteBtn = document.createElement('button');
        deleteBtn.type = 'button';
        deleteBtn.className = 'prescription-action-btn danger';
        deleteBtn.setAttribute('data-action', 'delete');
        deleteBtn.setAttribute('data-id', String(p.id));
        deleteBtn.title = 'Удалить';
        deleteBtn.innerHTML = '<span>❌</span>';

        actions.appendChild(editBtn);
        actions.appendChild(deleteBtn);

        mainRow.appendChild(actions);
        item.appendChild(mainRow);

        if (p.comment) {
            const commentRow = document.createElement('div');
            commentRow.className = 'prescription-comment-row';
            const labelSpan = document.createElement('span');
            labelSpan.className = 'prescription-comment-label';
            labelSpan.textContent = 'Комментарий: ';
            const textSpan = document.createElement('span');
            textSpan.textContent = p.comment;
            commentRow.appendChild(labelSpan);
            commentRow.appendChild(textSpan);
            item.appendChild(commentRow);
        }

        list.appendChild(item);
    });
}

// Вход в режим редактирования
function editPrescription(id) {
    const item = prescriptions.find(p => p.id === id);
    if (!item) return;

    rxEditingId = id;

    const submitBtn = document.getElementById('rx-submit-btn');
    if (submitBtn) {
        submitBtn.textContent = 'Сохранить';
    }

    fillPrescriptionForm(item);

    const nameInput = document.getElementById('rx-name');
    if (nameInput) {
        nameInput.focus();
        nameInput.select();
    }
}

// Удаление назначения
function deletePrescription(id) {
    prescriptions = prescriptions.filter(p => p.id !== id);

    if (rxEditingId === id) {
        // Если удалили то, что редактировали — выходим из режима редактирования
        clearPrescriptionForm();
    }

    renderPrescriptionsList();
}

// Экспорт в текст: используется при сборке заключения
function collectPrescriptionsText() {
    if (!prescriptions.length) {
        return '';
    }

    const lines = [];
    prescriptions.forEach((p, index) => {
        let line = (index + 1) + '. ' + p.name + '. ';

        const timeParts = [];
        Object.keys(p.times || {}).forEach(time => {
            const dose = (p.times[time] || '').trim();
            if (dose) {
                timeParts.push(time + ' ' + dose + ' мг');
            } else {
                timeParts.push(time);
            }
        });

        if (timeParts.length) {
            line += 'Приём: ' + timeParts.join(', ') + '. ';
        }

        if (p.durationValue) {
            const unit = p.durationType === 'months' ? 'месяцев' : 'дней';
            line += 'В течение ' + p.durationValue + ' ' + unit + '. ';
        }

        if (p.comment) {
            line += 'Комментарий: ' + p.comment + '.';
        }

        lines.push(line.trim());
    });

    return lines.join('<br>');
}
