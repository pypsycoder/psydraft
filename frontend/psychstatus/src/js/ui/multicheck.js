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

