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
