    function collectCheckboxDescriptions(selector) {
        const items = [];
        document.querySelectorAll(selector).forEach(cb => {
            if (cb.checked) {
                const type = cb.dataset.perceptionType;
                const descInput = document.querySelector('.perception-description[data-perception-type="' + type + '"]');
                const desc = descInput ? descInput.value.trim() : '';
                items.push({ type, desc });
            }
        });
        return items;
    }

    function collectIllusionsText() {
        const illusions = [];
        document.querySelectorAll('.illusion-checkbox').forEach(cb => {
            if (cb.checked) {
                const type = cb.dataset.illusionType;
                const descInput = document.querySelector(
                    '.illusion-description[data-illusion-type="' + type + '"]'
                );
                const desc = descInput ? descInput.value.trim() : '';
                illusions.push(desc ? type + ' — ' + desc : type);
            }
        });
        return illusions;
    }

    function collectHallucinationText() {
        const analyzer = getCheckedTextByName('hallucination_analyzer');

        const hallTypes = [];
        document.querySelectorAll('.hall-type-checkbox').forEach(cb => {
            if (cb.checked) {
                const type = cb.dataset.hallType;
                const descInput = document.querySelector(
                    '.hall-type-description[data-hall-type="' + type + '"]'
                );
                const desc = descInput ? descInput.value.trim() : '';
                hallTypes.push(desc ? type + ' — ' + desc : type);
            }
        });

        const parts = [];
        if (analyzer) parts.push('по анализатору: ' + analyzer);
        if (hallTypes.length) parts.push(hallTypes.join('; '));

        return parts.length ? 'галлюцинации (' + parts.join('; ') + ')' : '';
    }

    function collectPerceptionText() {
        const parts = [];

        // Иллюзии
        const illusions = collectIllusionsText();
        if (illusions.length) {
            parts.push('иллюзии: ' + illusions.join('; '));
        }

        // Галлюцинации
        const hallucinations = collectHallucinationText();
        if (hallucinations) {
            parts.push(hallucinations);
        }

        // Психосенсорные расстройства
        const dereal = getCheckedTextByName('psychosensory_derealization');
        const autopsych = getCheckedTextByName('psychosensory_autopsychic');
        const psychoDesc = document.getElementById('psychosensory_description')?.value.trim();
        if (dereal || autopsych || psychoDesc) {
            const psParts = [];
            if (dereal) psParts.push('дереализационные — ' + dereal);
            if (autopsych) psParts.push('аутопсихические — ' + autopsych);
            if (psychoDesc) psParts.push(psychoDesc);
            parts.push('психосенсорные расстройства: ' + psParts.join('; '));
        }

        // Психические автоматизмы
        const automatismTypes = getCheckedTextByName('psychic_automatism');
        const automatismDesc = document.getElementById('psychic_automatism_description')?.value.trim();
        if (automatismTypes || automatismDesc) {
            let line = 'психические автоматизмы: ';
            if (automatismTypes) line += automatismTypes;
            if (automatismDesc) line += (automatismTypes ? '; ' : '') + automatismDesc;
            parts.push(line);
        }

        // Свободный текст
        const freeText = document.getElementById('perception')?.value.trim();
        if (freeText) {
            parts.push(freeText);
        }

        return parts.join('; ');
