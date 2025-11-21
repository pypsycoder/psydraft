    let prescriptionCounter = 0;

    function addPrescription() {
        prescriptionCounter += 1;
        const list = document.getElementById('prescriptions_list');
        const item = document.createElement('div');
        item.className = 'prescription-item';
        item.dataset.index = prescriptionCounter;

        item.innerHTML = `
            <div class="prescription-row">
                <div>
                    <div class="prescription-label-small">Название препарата</div>
                    <input type="text" class="prescription-name" placeholder="например, Сертралин">
                </div>
                <div>
                    <div class="prescription-label-small">В течение (дней)</div>
                    <input type="number" class="prescription-days" min="1" placeholder="30">
                </div>
            </div>
            <div class="prescription-row">
                <div>
                    <div class="prescription-label-small">Приём и доза (мг)</div>
                    <div class="time-dose-row">
                        <input type="checkbox" class="time-checkbox" data-time="утром">
                        <span>утром</span>
                        <input type="number" class="dose-input" data-time="утром" placeholder="мг">
                    </div>
                    <div class="time-dose-row">
                        <input type="checkbox" class="time-checkbox" data-time="днём">
                        <span>днём</span>
                        <input type="number" class="dose-input" data-time="днём" placeholder="мг">
                    </div>
                    <div class="time-dose-row">
                        <input type="checkbox" class="time-checkbox" data-time="вечером">
                        <span>вечером</span>
                        <input type="number" class="dose-input" data-time="вечером" placeholder="мг">
                    </div>
                    <div class="time-dose-row">
                        <input type="checkbox" class="time-checkbox" data-time="на ночь">
                        <span>на ночь</span>
                        <input type="number" class="dose-input" data-time="на ночь" placeholder="мг">
                    </div>
                </div>
            </div>
            <div class="prescription-comment">
                <div class="prescription-label-small">Комментарий (необязательно)</div>
                <input type="text" class="prescription-comment-input" placeholder="например, принимать после еды">
            </div>
        `;

        list.appendChild(item);
    }

    function removeLastPrescription() {
        const list = document.getElementById('prescriptions_list');
        if (list.lastElementChild) {
            list.removeChild(list.lastElementChild);
        }
    }

    function collectPrescriptionsText() {
        const items = document.querySelectorAll('.prescription-item');
        const lines = [];
        let index = 1;

        items.forEach(item => {
            const name = item.querySelector('.prescription-name')?.value.trim();
            const days = item.querySelector('.prescription-days')?.value.trim();
            const timeCheckboxes = item.querySelectorAll('.time-checkbox');
            const doses = item.querySelectorAll('.dose-input');
            const comment = item.querySelector('.prescription-comment-input')?.value.trim();

            if (!name) return;

            const timeParts = [];
            timeCheckboxes.forEach(cb => {
                if (cb.checked) {
                    const time = cb.getAttribute('data-time');
                    const doseInput = item.querySelector('.dose-input[data-time="' + time + '"]');
                    const doseVal = doseInput && doseInput.value.trim() ? doseInput.value.trim() + ' мг' : '';
                    if (doseVal) {
                        timeParts.push(time + ' ' + doseVal);
                    } else {
                        timeParts.push(time);
                    }
                }
            });

            let line = index + '. ' + name + '. ';
            if (timeParts.length) {
                line += 'Приём: ' + timeParts.join(', ') + '. ';
            }
            if (days) {
                line += 'В течение ' + days + ' дней. ';
            }
            if (comment) {
                line += 'Комментарий: ' + comment + '.';
            }

            lines.push(line.trim());
            index += 1;
        });

        return lines.join('<br>');
    }

    function generateText() {
