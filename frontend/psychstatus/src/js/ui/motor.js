function toggleWillDisorders() {
    const val = document.getElementById('will').value;
    const block = document.getElementById('will_disorders_block');
    if (block) block.style.display = (val === 'нарушены') ? 'block' : 'none';
}

function toggleCatatonia() {
    const cb = document.getElementById('catatonia_flag');
    const block = document.getElementById('catatonia_block');
    if (block) block.style.display = cb.checked ? 'block' : 'none';
}

function toggleSeizuresDescription() {
    const val = document.getElementById('seizures').value;
    const block = document.getElementById('seizures_description_block');
    if (block) block.style.display = (val === 'отмечались в прошлом' || val === 'наблюдаются') ? 'block' : 'none';
}
