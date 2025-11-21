function toggleMultiGroup(name) {
    const body = document.getElementById(name + '_body');
    if (!body) return;
    body.classList.toggle('open');
}

/**
 * Универсальное обновление summary под заголовком мультичекса.
 * Поддерживает "другое":
 *  - чекбокс со значением D_OTHER / ДРУГОЕ
 *  - текстовое поле с id="<name>_other"
 */
function updateMultiSummary(name) {
    const summary = document.getElementById(name + '_summary');
    if (!summary) return;

    const checked = document.querySelectorAll('input[type="checkbox"][name="' + name + '"]:checked');
    const parts = [];

    checked.forEach(cb => {
        if (cb.value !== 'D_OTHER' && cb.value !== 'ДРУГОЕ') {
            parts.push(cb.value);
        }
    });

    const otherCheckbox = document.querySelector(
    `input[type="checkbox"][name="${name}"][value="D_OTHER"]`
    );
    const otherField = document.getElementById(name + '_other');

    if (otherCheckbox && otherCheckbox.checked && otherField) {
        const txt = otherField.value.trim();
        if (txt) parts.push(txt);
    }

    summary.textContent = parts.length ? parts.join(', ') : 'Не выбрано';
}

function toggleOtherField(name) {
    const otherCheckbox = document.querySelector(`input[name="${name}"][value="D_OTHER"]`);
    const otherField = document.getElementById(name + '_other');

    if (!otherCheckbox || !otherField) return;

    if (otherCheckbox.checked) {
        otherField.style.display = 'block';
    } else {
        otherField.style.display = 'none';
        otherField.value = '';
    }

    updateMultiSummary(name);
}


/**
 * Универсальный сбор текста для builder.js.
 * Логика совпадает с updateMultiSummary:
 *  - игнорирует сам маркер "другое" (D_OTHER/ДРУГОЕ)
 *  - добавляет текст из "<name>_other", если он есть.
 */
function getCheckedTextByName(name) {
    const checked = document.querySelectorAll('input[type="checkbox"][name="' + name + '"]:checked');
    const parts = [];

    checked.forEach(cb => {
        if (cb.value !== 'D_OTHER' && cb.value !== 'ДРУГОЕ') {
            parts.push(cb.value);
        }
    });

    const otherCheckbox = document.querySelector(
        `input[type="checkbox"][name="${name}"][value="D_OTHER"]`
    );
    const otherField = document.getElementById(name + '_other');

    if (otherCheckbox && otherCheckbox.checked && otherField) {
        const txt = otherField.value.trim();
        if (txt) parts.push(txt);
    }

    return parts.join(', ');
}

// Функции сбора выбранных симптомов в "Внешний вид"
function toggleAppearanceOther(cb) {
    const field = document.getElementById('appearance_other');
    field.style.display = cb.checked ? 'block' : 'none';
    if (!cb.checked) field.value = "";
}

function updateAppearance() {
    const checkboxes = document.querySelectorAll('input[name="appearance"]:checked');
    const parts = [];

    // Добавляем все отмеченные варианты, кроме самого слова "другое"
    checkboxes.forEach(cb => {
        if (cb.value !== "ДРУГОЕ" && cb.value !== "D_OTHER") {
            parts.push(cb.value);
        }
    });

    // Если в поле "другое" что-то написано — просто добавляем это как текст
    const otherField = document.getElementById('appearance_other');
    if (otherField && otherField.value.trim() !== "") {
        parts.push(otherField.value.trim());
    }

    // Пишем строку в скрытое поле для builder.js
    const hidden = document.getElementById('appearance');
    if (hidden) {
        hidden.value = parts.join(', ');
    }

    // Обновляем summary под заголовком
    const summary = document.getElementById('appearance_summary');
    if (summary) {
        summary.innerText = parts.length ? parts.join(', ') : 'Не выбрано';
    }
}

// ==========================
// Суицидальное поведение в анамнезе
// ==========================

function initSuicideHistory() {
    const checkboxes = document.querySelectorAll('input[type="checkbox"][name="suicide_history"]');
    if (!checkboxes.length) return;

    const noneCb      = document.getElementById('suicide_history_none');
    const uncertainCb = document.getElementById('suicide_history_uncertain');
    const attemptsCb  = document.getElementById('suicide_history_attempts');
    const nssiCb      = document.getElementById('suicide_history_nssi');

    const attemptsInput = document.getElementById('suicide_attempts_times');
    const nssiInput     = document.getElementById('suicide_nssi_times');

    const lastLabel = document.getElementById('suicide_last_description_label');
    const lastInput = document.getElementById('suicide_last_description');
    const summary   = document.getElementById('suicide_history_summary');

    function updateSuicideHistorySummary() {
        if (!summary) return;

        // Если отмечено "не отмечает" — это и выводим
        if (noneCb && noneCb.checked) {
            summary.textContent = 'не отмечает';
            return;
        }

        const parts = [];

        if (attemptsCb && attemptsCb.checked) {
            parts.push('были попытки суицида');
        }
        if (nssiCb && nssiCb.checked) {
            parts.push('самоповреждение без суицидального намерения');
        }
        if (uncertainCb && uncertainCb.checked) {
            parts.push('затрудняется ответить');
        }

        if (parts.length === 0) {
            summary.textContent = 'Не выбрано';
        } else {
            summary.textContent = parts.join(', ');
        }
    }

    function updateSuicideHistoryState(changedCb) {
        // Эксклюзивность "не отмечает"
        if (noneCb && changedCb === noneCb && noneCb.checked) {
            checkboxes.forEach(cb => {
                if (cb !== noneCb) cb.checked = false;
            });
        }

        // Эксклюзивность "затрудняется ответить"
        if (uncertainCb && changedCb === uncertainCb && uncertainCb.checked) {
            checkboxes.forEach(cb => {
                if (cb !== uncertainCb) cb.checked = false;
            });
        }

        // Если отметили попытки/НСС — снимаем "не отмечает" и "затрудняется"
        const attemptsChecked = attemptsCb && attemptsCb.checked;
        const nssiChecked     = nssiCb && nssiCb.checked;

        if (attemptsChecked || nssiChecked) {
            if (noneCb) noneCb.checked = false;
            if (uncertainCb) uncertainCb.checked = false;
        }

        // Управление полями "раз"
        if (attemptsInput) {
            attemptsInput.disabled = !attemptsChecked;
            if (!attemptsChecked) attemptsInput.value = '';
        }

        if (nssiInput) {
            nssiInput.disabled = !nssiChecked;
            if (!nssiChecked) nssiInput.value = '';
        }

        // Показ / скрытие "Описание последнего эпизода"
        const showLast = attemptsChecked || nssiChecked;

        if (lastLabel && lastInput) {
            lastLabel.style.display = showLast ? '' : 'none';
            lastInput.style.display = showLast ? '' : 'none';

            if (!showLast) {
                lastInput.value = '';
            }
        }

        // Обновляем короткое описание в заголовке
        updateSuicideHistorySummary();
    }

    checkboxes.forEach(cb => {
        cb.addEventListener('change', function () {
            updateSuicideHistoryState(cb);
        });
    });

    // Инициализация при загрузке
    updateSuicideHistoryState(null);
}

// =========================================
// Генерация текста: суицидальное поведение в анамнезе
// =========================================

function buildSuicideHistoryText() {
    const noneCb      = document.getElementById('suicide_history_none');
    const attemptsCb  = document.getElementById('suicide_history_attempts');
    const nssiCb      = document.getElementById('suicide_history_nssi');
    const uncertainCb = document.getElementById('suicide_history_uncertain');

    const attemptsInput = document.getElementById('suicide_attempts_times');
    const nssiInput     = document.getElementById('suicide_nssi_times');
    const lastInput     = document.getElementById('suicide_last_description');

    // На всякий случай — если блока нет, ничего не выводим
    if (!noneCb && !attemptsCb && !nssiCb && !uncertainCb) {
        return '';
    }

    // 1. Эксклюзивные варианты

    if (noneCb && noneCb.checked) {
        return 'Суицидальное поведение в анамнезе не отмечает.';
    }

    if (uncertainCb && uncertainCb.checked) {
        return 'Относительно суицидального поведения в анамнезе затрудняется ответить.';
    }

    // 2. Попытки и НСС

    const parts = [];

    if (attemptsCb && attemptsCb.checked) {
        const t = attemptsInput ? attemptsInput.value.trim() : '';
        if (t) {
            parts.push(`отмечает суицидальные попытки (${t} раз)`);
        } else {
            parts.push('отмечает суицидальные попытки');
        }
    }

    if (nssiCb && nssiCb.checked) {
        const n = nssiInput ? nssiInput.value.trim() : '';
        if (n) {
            parts.push(`отмечает эпизоды самоповреждения без суицидального намерения (${n} раз)`);
        } else {
            parts.push('отмечает эпизоды самоповреждения без суицидального намерения');
        }
    }

    if (parts.length === 0) {
        // Ничего не выбрано — ничего не добавляем в текст
        return '';
    }

    const base = 'В анамнезе ' + parts.join('; ') + '.';

    // 3. Описание последнего эпизода

    const last = lastInput ? lastInput.value.trim() : '';
    if (last) {
        return base + ' Последний эпизод: ' + last + '.';
    }

    return base;
}


document.addEventListener('DOMContentLoaded', function () {
    initSuicideHistory();
});

