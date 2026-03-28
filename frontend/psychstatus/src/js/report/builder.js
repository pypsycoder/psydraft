function generateText() {
        // Общие части
        const complaints = document.getElementById('complaints').value.trim();
        const anamnesis = document.getElementById('anamnesis').value.trim();
        const dispensary_status = document.getElementById('dispensary_status').value.trim();
        const dispensary_treatment = document.getElementById('dispensary_treatment').value.trim();
        const ill_days = document.getElementById('ill_days').value.trim();
        const ill_days_unit = document.getElementById('ill_days_unit')?.value || 'дней';
        const self_treatment = document.getElementById('self_treatment').value.trim();
        const dynamics = document.getElementById('dynamics').value.trim();
        const life_history = collectLifeHistoryText();

        // ПСИХСТАТУС
        //  Сознание и общение
        const consciousness = document.getElementById('consciousness').value || '';
        const behavior = getCheckedTextByName('behavior');
        const appearance = document.getElementById('appearance')?.value.trim() || '';
        const facial_expression = getCheckedTextByName('facial_expression');
        const eye_contact = document.getElementById('eye_contact').value || '';
        const contact = document.getElementById('contact').value || '';
        const conversation = getCheckedTextByName('conversation');
        const answers = getCheckedTextByName('answers');
        const speech = document.getElementById('speech').value || '';

        // Ориентировка
        const getOrient = (name) => {
            const checked = document.querySelector(`input[name="${name}"]:checked`);
            return checked ? checked.value : '';
        };
        const orient_personality = getOrient('orient_personality');
        const orient_personality_comment = document.getElementById('orient_personality_comment')?.value.trim() || '';
        const orient_place = getOrient('orient_place');
        const orient_place_comment = document.getElementById('orient_place_comment')?.value.trim() || '';
        const orient_time = getOrient('orient_time');
        const orient_time_comment = document.getElementById('orient_time_comment')?.value.trim() || '';

        // Мышление
        const thinking_tempo = document.getElementById('thinking_tempo').value || '';
        const thinking_productivity = document.getElementById('thinking_productivity').value || '';
        const thinking_sequence = document.getElementById('thinking_sequence').value || '';
        const thinking_goal = document.getElementById('thinking_goal').value || '';
        const thinking_disorders = getCheckedTextByName('thinking_disorders');
        const thinking_mobility = getCheckedTextByName('thinking_mobility');
        const abstraction = document.getElementById('abstraction').value || '';
        const ideas = collectIdeasText();
        const judgment = getCheckedTextByName('judgment');
        const intellect = document.getElementById('intellect').value || '';
        const vocabulary = document.getElementById('vocabulary').value || '';

        // Восприятие
        const perceptionDetails = collectPerceptionText();

        // Память, внимание
        const memory = getCheckedTextByName('memory');
        const amnesia = getCheckedTextByName('amnesia');
        const paramnesia = getCheckedTextByName('paramnesia');
        const attention = getCheckedTextByName('attention');

        // Эмоции
        const mood = document.getElementById('mood').value || '';
        const emotions_stability = document.getElementById('emotions_stability').value || '';
        const emotions = getCheckedTextByName('emotions');
        const aggression = document.getElementById('aggression').value || '';

        // Суицидальное поведение (текущие мысли/планы + контрфакторы)
        const suicidal_thoughts = document.getElementById('suicidal_thoughts').value || '';
        const suicidal_plans = document.getElementById('suicidal_plans').value || '';
        const contrsuicidal_factors = document.getElementById('contrsuicidal_factors').value || '';

        // Мотивация, двигательна сфера, планы, судороги
        const will = document.getElementById('will').value || '';
        const will_disorders = getCheckedTextByName('will_disorders');
        const will_description = document.getElementById('will_description')?.value.trim() || '';
        const motor = document.getElementById('motor').value.trim();
        const catatonia_flag = document.getElementById('catatonia_flag')?.checked || false;
        const catatonia = catatonia_flag ? getCheckedTextByName('catatonia') : '';
        const distance = document.getElementById('distance').value || '';
        const insight = document.getElementById('insight').value || '';
        const future_plans = document.getElementById('future_plans').value || '';
        const seizures = document.getElementById('seizures').value || '';
        const seizures_description = document.getElementById('seizures_description')?.value.trim() || '';

        // Сон, аппетит
        const sleep = getCheckedTextByName('sleep');
        const sleepHours = document.getElementById('sleep_hours').value.trim();
        const sleepDays  = document.getElementById('sleep_days').value.trim();
        const appetite = document.getElementById('appetite').value || '';

        // Диагноз, рекомендации, назначения
        const diagnosis = document.getElementById('diagnosis').value.trim();
        const recommendations = document.getElementById('recommendations').innerHTML.trim();
        const prescriptionsText = collectPrescriptionsText();

        let text = '';

        // Блоки с жирными заголовками
        text += '<strong>Жалобы:</strong> ' + (complaints || 'активно не предъявляет') + '<br><br>';
        text += '<strong>Анамнез заболевания:</strong> ' + (anamnesis || '&nbsp;') + '<br><br>';
        if (dispensary_status) text += '<strong>Состояние на учете в ПНД и наркологическом диспансере:</strong> ' + dispensary_status + '<br>';
        if (dispensary_treatment) text += '<strong>Лечение у психиатра, нарколога, психотерапевта:</strong> ' + dispensary_treatment + '<br>';
        if (ill_days) text += '<strong>Считает себя больным в течение:</strong> ' + ill_days + ' ' + ill_days_unit + '<br>';
        if (self_treatment) text += '<strong>Самостоятельное лечение:</strong> ' + self_treatment + '<br>';
        if (dynamics) text += '<strong>Динамика заболевания:</strong> ' + dynamics + '<br>';
        text += '<strong>Анамнез жизни:</strong> ' + (life_history || '&nbsp;') + '<br><br>';

        text += '<strong>Психический статус</strong><br>';

        // Ориентировка — группируем одинаковые ответы
        const orientDims = [
            { label: 'в собственной личности', val: orient_personality, comment: orient_personality_comment },
            { label: 'в месте',                val: orient_place,       comment: orient_place_comment },
            { label: 'во времени',             val: orient_time,        comment: orient_time_comment },
        ].filter(d => d.val);
        if (orientDims.length > 0) {
            // группируем: те у кого нет комментария — по значению; с комментарием — всегда отдельно
            const groups = {};
            const singles = [];
            orientDims.forEach(d => {
                if (d.comment) {
                    singles.push(d.label + ' — ' + d.val + ' (' + d.comment + ')');
                } else {
                    if (!groups[d.val]) groups[d.val] = [];
                    groups[d.val].push(d.label);
                }
            });
            const parts = [];
            Object.entries(groups).forEach(([val, labels]) => {
                parts.push(labels.join(', ') + ' — ' + val);
            });
            singles.forEach(s => parts.push(s));
            text += 'Ориентировка: ' + parts.join('; ') + '.<br>';
        }

        let psLine1 = '';
        if (consciousness) {
            psLine1 += 'Сознание ' + consciousness + '. ';
        }
        if (behavior) {
            psLine1 += 'Поведение: ' + behavior + '. ';
        }
        if (appearance) {
            psLine1 += 'Внешний вид ' + appearance + '. ';
        }
        if (facial_expression) {
            psLine1 += 'Мимика: ' + facial_expression + '. ';
        }
        if (eye_contact) {
            psLine1 += 'Зрительный контакт ' + eye_contact + '. ';
        }
        if (contact) {
            psLine1 += 'Контакт ' + contact + '. ';
        }
        if (conversation) {
            psLine1 += 'Беседует: ' + conversation + '. ';
        }
        if (answers) {
            psLine1 += 'На вопросы отвечает: ' + answers + '. ';
        }
        if (speech) {
            psLine1 += 'Речь ' + speech + '. ';
        }

        if (psLine1) {
            text += psLine1 + '<br>';
        }

        let thinkingParts = [];
        if (thinking_tempo) thinkingParts.push(thinking_tempo);
        if (thinking_productivity) thinkingParts.push(thinking_productivity);
        if (thinking_sequence) thinkingParts.push(thinking_sequence);
        if (thinking_goal) thinkingParts.push(thinking_goal);
        if (thinking_disorders) thinkingParts.push('с признаками: ' + thinking_disorders);
        if (thinking_mobility) thinkingParts.push('подвижность мышления: ' + thinking_mobility);
        if (abstraction) thinkingParts.push('абстрагирование ' + abstraction);

        if (thinkingParts.length > 0) {
            text += 'Мышление ' + thinkingParts.join(', ') + '.<br>';
        }

        if (ideas) {
            text += 'Идеи: ' + ideas + '.<br>';
        }
        if (judgment) {
            text += 'Суждения: ' + judgment + '.<br>';
        }
        if (intellect) {
            text += 'Интеллект ' + intellect + '.<br>';
        }
        if (vocabulary) {
            text += 'Словарный запас ' + vocabulary + '.<br>';
        }

        if (perceptionDetails) {
            text += 'Обманы восприятия: ' + perceptionDetails + '.<br>';
        }

        if (memory) {
            text += 'Память: ' + memory + '.<br>';
        }
        if (amnesia) {
            text += 'Амнезия: ' + amnesia + '.<br>';
        }
        if (paramnesia) {
            text += 'Парамнезии: ' + paramnesia + '.<br>';
        }
        if (attention) {
            text += 'Внимание: ' + attention + '.<br>';
        }

        let emoLine = '';
        if (mood) emoLine += 'Настроение ' + mood + '. ';
        if (emotions_stability) emoLine += 'Эмоциональные реакции ' + emotions_stability + '. ';
        if (emotions) emoLine += 'Характер эмоциональных реакций: ' + emotions + '. ';
        if (aggression) emoLine += 'Агрессивные тенденции: ' + aggression + '. ';
        if (suicidal_thoughts) emoLine += 'Суицидальные мысли на момент осмотра: ' + suicidal_thoughts + '. ';
        if (suicidal_plans) emoLine += 'Суицидальные планы на момент осмотра: ' + suicidal_plans + '. ';
        if (contrsuicidal_factors) emoLine += 'Контрсуицидальные факторы: ' + contrsuicidal_factors + '. ';

        if (emoLine) {
            text += emoLine + '<br>';
        }

        // Суицидальное поведение в анамнезе из мультчека (если функция есть)
        if (typeof buildSuicideHistoryText === 'function') {
            const sh = buildSuicideHistoryText();
            if (sh) {
                text += sh + '<br>';
            }
        }

        // Воля
        if (will) {
            let willText = 'Воля: ' + will;
            if (will === 'нарушены') {
                if (will_disorders) willText += ' (' + will_disorders + ')';
                if (will_description) willText += '; ' + will_description;
            }
            text += willText + '.<br>';
        }
        if (motor) {
            text += 'Двигательная сфера: ' + motor + '.<br>';
        }
        if (catatonia_flag) {
            text += 'Кататонические симптомы: ' + (catatonia || 'отмечаются') + '.<br>';
        }
        if (distance) {
            text += 'Чувство дистанции ' + distance + '.<br>';
        }
        if (insight) {
            text += 'Критика к своему заболеванию ' + insight + '.<br>';
        }
        if (future_plans) {
            text += 'Планы на будущее ' + future_plans + '.<br>';
        }
        if (seizures) {
            let seizuresText = 'Эпилептиформные пароксизмы: ' + seizures;
            if (seizures_description) seizuresText += ' — ' + seizures_description;
            text += seizuresText + '.<br>';
        }
        if (sleep || sleepHours) {
            let sleepText = sleep || '';
            if (sleepHours) {
                const durStr = 'в среднем ' + sleepHours + ' ч' +
                               (sleepDays ? ' за ' + sleepDays + ' дн.' : '');
                sleepText = sleepText ? sleepText + ', ' + durStr : durStr;
            }
            text += 'Сон: ' + sleepText + '.<br>';
        }
        if (appetite) {
            text += 'Аппетит ' + appetite + '.<br>';
        }

        // Уточнённые у пациента пункты из нозологического советника
        if (typeof getCheckedClarifyTexts === 'function') {
            var clarifyTexts = getCheckedClarifyTexts();
            if (clarifyTexts.length > 0) {
                clarifyTexts.forEach(function(label) {
                    text += label + '.<br>';
                });
            }
        }

        // Диагноз
        const diagnosisHtml = diagnosis ? diagnosis.replace(/\n/g, '<br>') : '&nbsp;';
        text += '<br><strong>Диагноз (МКБ-10):</strong>' + diagnosisHtml + '<br><br>';

        // Рекомендации
        const recHtml = recommendations ? recommendations.replace(/\n/g, '<br>') : '&nbsp;';
        text += '<strong>Рекомендации:</strong><br>' + recHtml + '<br>';

        // Препараты
        const prescHtml = prescriptionsText || '&nbsp;';
        text += '<br><strong>Препараты:</strong><br>' + prescHtml + '<br>';

        document.getElementById('result').innerHTML = text;
    }

    function copyResult() {
        const resultDiv = document.getElementById('result');
        const range = document.createRange();
        range.selectNodeContents(resultDiv);
        const sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
        try {
            document.execCommand('copy');
            alert('Текст скопирован в буфер обмена.');
        } catch (e) {
            alert('Не удалось скопировать автоматически. Выделите текст вручную и нажмите Ctrl+C.');
        }
        sel.removeAllRanges();
    }
