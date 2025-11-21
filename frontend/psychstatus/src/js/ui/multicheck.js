function toggleMultiGroup(name) {
    const body = document.getElementById(name + '_body');
    if (!body) return;
    body.classList.toggle('open');
}

function updateMultiSummary(name) {
    const summary = document.getElementById(name + '_summary');
    if (!summary) return;
    const checked = document.querySelectorAll('input[type="checkbox"][name="' + name + '"]:checked');
    const values = Array.from(checked).map(c => c.value);
    summary.textContent = values.length ? values.join(', ') : 'Не выбрано';
}

function getCheckedTextByName(name) {
    const checked = document.querySelectorAll('input[type="checkbox"][name="' + name + '"]:checked');
    return Array.from(checked).map(c => c.value).join(', ');
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
// Суицидальное поведение в анамнезе логика UI
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
    }

    checkboxes.forEach(cb => {
        cb.addEventListener('change', function () {
            updateSuicideHistoryState(cb);
        });
    });

    // Инициализация при загрузке
    updateSuicideHistoryState(null);
}

document.addEventListener('DOMContentLoaded', function () {
    // ...если тут уже есть другие init-функции — просто добавляем ещё одну
    initSuicideHistory();
});

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

    // --- Эксклюзивные варианты ---
    if (noneCb.checked) {
        return "Суицидальное поведение в анамнезе не отмечает.";
    }

    if (uncertainCb.checked) {
        return "Относительно суицидального поведения в анамнезе затрудняется ответить.";
    }

    // --- Если выбраны попытки / НСС ---
    let parts = [];

    if (attemptsCb.checked) {
        const t = attemptsInput.value.trim();
        if (t) {
            parts.push(`отмечает суицидальные попытки (${t} раз)`);
        } else {
            parts.push("отмечает суицидальные попытки");
        }
    }

    if (nssiCb.checked) {
        const n = nssiInput.value.trim();
        if (n) {
            parts.push(`отмечает эпизоды самоповреждения без суицидального намерения (${n} раз)`);
        } else {
            parts.push("отмечает эпизоды самоповреждения без суицидального намерения");
        }
    }

    if (parts.length === 0) {
        return "";
    }

    const last = lastInput.value.trim();
    let lastPart = last ? ` Последний эпизод: ${last}.` : "";

    return "В анамнезе " + parts.join("; ") + "." + lastPart;
}
