    function lhToggleHeredityDesc() {
        const hasOther = !!document.querySelector('input[name="lh_heredity"]:checked:not([value="не отягощена"])');
        document.getElementById('lh_heredity_desc_row').style.display = hasOther ? '' : 'none';
    }

    function lhToggleChildren() {
        const checked = document.getElementById('lh_has_children').checked;
        document.getElementById('lh_children_count').style.display = checked ? '' : 'none';
    }

    function lhToggleAllergyDesc() {
        const val = document.getElementById('lh_allergy').value;
        document.getElementById('lh_allergy_desc').style.display = val === 'есть' ? '' : 'none';
    }

    function lhToggleConvictionDesc() {
        const val = document.getElementById('lh_conviction').value;
        document.getElementById('lh_conviction_desc').style.display = val === 'была' ? '' : 'none';
    }

    function collectLifeHistoryText() {
        const parts = [];

        // 1. Наследственность
        const heredity = getCheckedTextByName('lh_heredity');
        if (heredity) {
            const desc = document.getElementById('lh_heredity_desc')?.value.trim();
            parts.push('Наследственность: ' + (desc ? heredity + ' (' + desc + ')' : heredity));
        }

        // 2. Ранний анамнез
        const early = getCheckedTextByName('lh_early');
        if (early) {
            parts.push('Ранний анамнез: ' + early);
        }

        // 3. Образование
        const education = document.getElementById('lh_education')?.value;
        const specialSchool = document.getElementById('lh_special_school')?.checked;
        if (education || specialSchool) {
            let eduText = education || '';
            if (specialSchool) eduText += (eduText ? ', обучался в коррекционной школе' : 'обучался в коррекционной школе');
            parts.push('Образование: ' + eduText);
        }

        // 4. Трудовая деятельность
        const employment = document.getElementById('lh_employment')?.value;
        const employmentDesc = document.getElementById('lh_employment_desc')?.value.trim();
        if (employment || employmentDesc) {
            let empText = employment || '';
            if (employmentDesc) empText += (empText ? ', ' + employmentDesc : employmentDesc);
            parts.push('Трудовая деятельность: ' + empText);
        }

        // 5. Семейное положение
        const marital = document.getElementById('lh_marital')?.value;
        const hasChildren = document.getElementById('lh_has_children')?.checked;
        const childrenCount = document.getElementById('lh_children_count')?.value.trim();
        if (marital || hasChildren) {
            let marText = marital || '';
            if (hasChildren) {
                const cStr = childrenCount ? childrenCount + ' дет.' : 'есть дети';
                marText += (marText ? ', ' : '') + cStr;
            }
            parts.push('Семейное положение: ' + marText);
        }

        // 6. Перенесённые заболевания и травмы
        const illness = getCheckedTextByName('lh_illness');
        const illnessDesc = document.getElementById('lh_illness_desc')?.value.trim();
        if (illness || illnessDesc) {
            let illText = illness || '';
            if (illnessDesc) illText += (illText ? '; ' + illnessDesc : illnessDesc);
            parts.push('Перенесённые заболевания и травмы: ' + illText);
        }

        // 7. Алкоголь
        const alcohol = document.getElementById('lh_alcohol')?.value;
        if (alcohol) parts.push('Алкоголь: ' + alcohol);

        // 8. Курение
        const smoking = document.getElementById('lh_smoking')?.value;
        if (smoking) parts.push('Курение: ' + smoking);

        // 9. ПАВ
        const substances = getCheckedTextByName('lh_substances');
        const substancesDesc = document.getElementById('lh_substances_desc')?.value.trim();
        if (substances || substancesDesc) {
            let subText = substances || '';
            if (substancesDesc) subText += (subText ? '; ' + substancesDesc : substancesDesc);
            parts.push('ПАВ: ' + subText);
        }

        // 10. Аллергия
        const allergy = document.getElementById('lh_allergy')?.value;
        const allergyDesc = document.getElementById('lh_allergy_desc')?.value.trim();
        if (allergy) {
            parts.push('Аллергия: ' + (allergy === 'есть' && allergyDesc ? allergyDesc : allergy));
        }

        // 11. Судимость
        const conviction = document.getElementById('lh_conviction')?.value;
        const convictionDesc = document.getElementById('lh_conviction_desc')?.value.trim();
        if (conviction) {
            parts.push('Судимость: ' + (conviction === 'была' && convictionDesc ? convictionDesc : conviction));
        }

        // 12. Дополнения
        const extra = document.getElementById('life_history_extra')?.value.trim();
        if (extra) parts.push(extra);

        return parts.join('. ');
    }
