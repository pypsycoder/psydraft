function generateText() {
        // Общие части
        const complaints = document.getElementById('complaints').value.trim();
        const anamnesis = document.getElementById('anamnesis').value.trim();
        const dispensary_status = document.getElementById('dispensary_status').value.trim();
        const dispensary_treatment = document.getElementById('dispensary_treatment').value.trim();
        const ill_days = document.getElementById('ill_days').value.trim();
        const self_treatment = document.getElementById('self_treatment').value.trim();
        const dynamics = document.getElementById('dynamics').value.trim();
        const life_history = document.getElementById('life_history').value.trim();

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
        const motor = document.getElementById('motor').value.trim();
        const distance = document.getElementById('distance').value || '';
        const insight = document.getElementById('insight').value || '';
        const future_plans = document.getElementById('future_plans').value || '';
        const seizures = document.getElementById('seizures').value || '';

        // Сон, аппетит
        const sleep = getCheckedTextByName('sleep');
        const appetite = document.getElementById('appetite').value || '';

        // Диагноз, рекомендации, назначения
        const diagnosis = document.getElementById('diagnosis').value.trim();
        const recommendations = document.getElementById('recommendations').value.trim();
        const prescriptionsText = collectPrescriptionsText();

        let text = '';

        // Блоки с жирными заголовками
        text += '<strong>Жалобы:</strong> ' + (complaints || '&nbsp;') + '<br><br>';
        text += '<strong>Анамнез заболевания:</strong> ' + (anamnesis || '&nbsp;') + '<br><br>';
        text += '<strong>Состояние на учете в ПНД и наркологическом диспансере:</strong> ' + (dispensary_status || '&nbsp;') + '<br>';
        text += '<strong>Лечение в ПНД и наркологическом диспансере:</strong> ' + (dispensary_treatment || '&nbsp;') + '<br>';
        text += '<strong>Считает себя больным в течение (дней):</strong> ' + (ill_days || '__') + '<br>';
        text += '<strong>Самостоятельное лечение:</strong> ' + (self_treatment || '&nbsp;') + '<br>';
        text += '<strong>Динамика заболевания:</strong> ' + (dynamics || '&nbsp;') + '<br><br>';
        text += '<strong>Анамнез жизни:</strong> ' + (life_history || '&nbsp;') + '<br><br>';

        text += '<strong>Психический статус</strong><br>';

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
            text += 'Воля: ' + will + '.<br>';
        }
        if (motor) {
            text += 'Двигательная сфера: ' + motor + '.<br>';
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
            text += 'Эпилептиформные пароксизмы: ' + seizures + '.<br>';
        }
        if (sleep) {
            text += 'Сон: ' + sleep + '.<br>';
        }
        if (appetite) {
            text += 'Аппетит ' + appetite + '.<br>';
        }

        text += '<br><strong>Диагноз и рекомендации</strong><br><br>';

        // Диагноз
        const diagnosisHtml = diagnosis ? diagnosis.replace(/\n/g, '<br>') : '&nbsp;';
        text += '<strong>Диагноз (МКБ-10):</strong><br>' + diagnosisHtml + '<br><br>';

        // Рекомендации
        const recHtml = recommendations ? recommendations.replace(/\n/g, '<br>') : '&nbsp;';
        text += '<strong>Рекомендации:</strong><br>' + recHtml + '<br><br>';

        // Назначения
        const prescHtml = prescriptionsText || '&nbsp;';
        text += '<strong>Назначения:</strong><br>' + prescHtml + '<br>';

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
