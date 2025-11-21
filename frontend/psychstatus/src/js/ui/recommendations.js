    const RECOMMENDATIONS_LIBRARY = [
        {
            id: 'rec_sleep_schedule',
            group: 'general',
            title: 'Режим сна и бодрствования',
            short: 'Соблюдать регулярный режим сна',
            full: 'Соблюдать регулярный режим сна и бодрствования: укладываться и просыпаться в одно и то же время, избегать дневного сна более 30 минут, ограничивать использование гаджетов за 1–2 часа до сна, формировать спокойный ритуал засыпания.'
        },
        {
            id: 'rec_activity',
            group: 'general',
            title: 'Умеренная физическая активность',
            short: 'Ежедневная умеренная активность',
            full: 'Рекомендована регулярная умеренная физическая активность не менее 30 минут в день (ходьба, ЛФК, растяжка, плавание) с учётом соматического состояния.'
        },
        {
            id: 'rec_caffeine_limit',
            group: 'general',
            title: 'Ограничение кофеина',
            short: 'Ограничить кофеин после 14:00',
            full: 'Ограничить употребление кофе, чая, энергетиков и других стимуляторов, особенно во второй половине дня, поскольку они могут усиливать тревогу и нарушать сон.'
        },
        {
            id: 'rec_no_alcohol',
            group: 'general',
            title: 'Исключение алкоголя и ПАВ',
            short: 'Исключить алкоголь и ПАВ',
            full: 'Полностью исключить употребление алкоголя и немедицинское употребление психоактивных веществ, так как они ухудшают течение заболевания и снижают эффективность назначенной терапии.'
        },
        {
            id: 'rec_med_adherence',
            group: 'general',
            title: 'Соблюдение медикаментозной терапии',
            short: 'Принимать препараты по схеме',
            full: 'Принимать препараты строго по назначенной схеме, не изменять дозировку и не отменять лекарства самостоятельно. При появлении побочных эффектов не прекращать приём, а обратиться к врачу для коррекции терапии.'
        },
        {
            id: 'rec_psychiatrist_followup',
            group: 'general',
            title: 'Наблюдение у психиатра',
            short: 'Регулярное наблюдение у психиатра',
            full: 'Регулярно наблюдаться у психиатра для контроля динамики состояния, переносимости терапии и своевременной коррекции лечения. Повторный визит рекомендуется через ___ дней или раньше при ухудшении состояния.'
        },
        {
            id: 'rec_day_structure',
            group: 'general',
            title: 'Структурирование дня',
            short: 'Структурировать день и активность',
            full: 'Структурировать день: планировать посильную активность, чередовать нагрузку и отдых, избегать длительной пассивности и чрезмерных перегрузок.'
        },
        {
            id: 'rec_stress_management',
            group: 'general',
            title: 'Работа со стрессом',
            short: 'Осваивать техники управления стрессом',
            full: 'Осваивать техники управления стрессом: дыхательные упражнения, мышечная релаксация, простые когнитивные техники, снижение воздействия провоцирующих факторов.'
        },
        {
            id: 'rec_psychoeducation',
            group: 'general',
            title: 'Психообразование',
            short: 'Психообразование пациента (и семьи)',
            full: 'Рекомендовано психообразование пациента и, при согласии, его близких: обсуждение природы заболевания, возможной симптоматики, принципов лечения и признаков, требующих повторного обращения к врачу.'
        },
        {
            id: 'rec_psychotherapy',
            group: 'general',
            title: 'Психотерапия',
            short: 'Рассмотреть психотерапию',
            full: 'Рассмотреть возможность индивидуальной или групповой психотерапии (когнитивно-поведенческой, поддерживающей и др.) с учётом запроса пациента и доступности специалистов.'
        },
        {
            id: 'rec_family_support',
            group: 'general',
            title: 'Поддержка близких',
            short: 'Привлечь поддержку семьи',
            full: 'Привлечь поддержку семьи и значимых близких: обсуждать состояние, совместно планировать помощь, информировать их о признаках возможного ухудшения.'
        },
        {
            id: 'rec_crisis_plan',
            group: 'general',
            title: 'Кризисный план',
            short: 'Составить кризисный план',
            full: 'Составить кризисный план: при выраженном ухудшении состояния, усилении тревоги или появлении суицидальных мыслей и намерений незамедлительно обращаться за медицинской помощью (к дежурному психиатру, в ПНД, в службу скорой помощи), по возможности информировать близких, исключить доступ к потенциально опасным предметам и веществам.'
        },
        {
            id: 'rec_self_monitoring',
            group: 'general',
            title: 'Самонаблюдение',
            short: 'Вести дневник самочувствия',
            full: 'Вести краткий дневник самочувствия: отмечать настроение, тревогу, качество сна, приём препаратов и значимые события для более точного обсуждения динамики на приёме.'
        },
        {
            id: 'rec_work_rest',
            group: 'general',
            title: 'Режим труда и отдыха',
            short: 'Оптимизировать режим работы и отдыха',
            full: 'Оптимизировать режим труда и отдыха: по возможности избегать ночных смен, переработок и хронического недосыпания; при необходимости обсуждать с работодателем временное снижение нагрузки.'
        },
        {
            id: 'rec_anxiety_management',
            group: 'anxiety',
            title: 'Работа с тревогой',
            short: 'Осваивать техники снижения тревоги',
            full: 'Рекомендовано освоение техник снижения тревоги: медленное диафрагмальное дыхание, мышечная релаксация, техники переключения внимания, ведение дневника тревоги.'
        },
        {
            id: 'rec_stimulant_limit',
            group: 'anxiety',
            title: 'Ограничение стимуляторов',
            short: 'Сократить кофеин и никотин',
            full: 'Сократить употребление кофеина, никотина и других стимуляторов, так как они могут усиливать тревожные симптомы и нарушать сон.'
        },
        {
            id: 'rec_activity_depression',
            group: 'depression',
            title: 'Повышение активности',
            short: 'Поддерживать умеренную активность',
            full: 'Поддерживать умеренную ежедневную активность: включать посильные дела, прогулки, постепенно расширять круг активности с учётом самочувствия.'
        },
        {
            id: 'rec_psychotherapy_depression',
            group: 'depression',
            title: 'Психотерапия при депрессии',
            short: 'Психотерапия при депрессии',
            full: 'Рассмотреть когнитивно-поведенческую или межличностную психотерапию для работы с негативными убеждениями, сниженной активностью и нарушенной самооценкой.'
        },
        {
            id: 'rec_antipsychotic_control',
            group: 'psychosis',
            title: 'Контроль антипсихотической терапии',
            short: 'Не пропускать антипсихотики',
            full: 'Строго соблюдать антипсихотическую терапию: не пропускать приём, не менять дозировку и не отменять препарат самостоятельно.'
        },
        {
            id: 'rec_psychosis_safety',
            group: 'psychosis',
            title: 'Безопасность при психозе',
            short: 'Соблюдать меры безопасности',
            full: 'При выраженных психотических симптомах избегать управления транспортом, работы с потенциально опасными механизмами и ситуаций с высоким риском травм.'
        },
        {
            id: 'rec_psychosis_support',
            group: 'psychosis',
            title: 'Поддержка близких при психозе',
            short: 'Информировать близких о признаках ухудшения',
            full: 'Информировать близких о признаках возможного ухудшения (усиление галлюцинаций, бредовых идей, снижение критики, нарастание возбудимости) и просить их о наблюдении и своевременном обращении за помощью при необходимости.'
        },
        {
            id: 'rec_sleep_hygiene',
            group: 'sleep',
            title: 'Гигиена сна',
            short: 'Гигиена сна',
            full: 'Соблюдать гигиену сна: ограничивать использование экранов за 1–2 часа до сна, проветривать комнату, избегать тяжёлой пищи и интенсивной нагрузки вечером.'
        },
        {
            id: 'rec_day_sleep_limit',
            group: 'sleep',
            title: 'Ограничение дневного сна',
            short: 'Исключить дневной сон',
            full: 'Избегать дневного сна или ограничивать его продолжительность до 20–30 минут, чтобы не ухудшать ночной сон.'
        },
        {
            id: 'rec_sleep_relaxation',
            group: 'sleep',
            title: 'Релаксация перед сном',
            short: 'Релаксация перед сном',
            full: 'Использовать перед сном расслабляющие процедуры: дыхательные упражнения, лёгкую растяжку, тёплый душ или ванну.'
        },
        {
            id: 'rec_substance_stop',
            group: 'substance',
            title: 'Отказ от алкоголя и ПАВ',
            short: 'Полный отказ от алкоголя и ПАВ',
            full: 'Рекомендован полный отказ от употребления алкоголя и немедицинского употребления психоактивных веществ; при трудностях — консультация нарколога или специализированной службы.'
        },
        {
            id: 'rec_evening_plan',
            group: 'substance',
            title: 'Структурирование времени при зависимости',
            short: 'Структурировать вечернее время',
            full: 'Структурировать особенно вечернее время, заранее планировать занятость, чтобы снизить риск употребления алкоголя или других веществ.'
        },
        {
            id: 'rec_nutrition',
            group: 'extra',
            title: 'Питание',
            short: 'Сбалансированное питание',
            full: 'Сохранять регулярное и сбалансированное питание, избегать больших перерывов между приёмами пищи и переедания, особенно вечером.'
        },
        {
            id: 'rec_screen_time',
            group: 'extra',
            title: 'Ограничение экранного времени',
            short: 'Снизить время за экранами',
            full: 'По возможности снизить общее время за экранами (телефон, компьютер, телевизор), особенно перед сном.'
        },
        {
            id: 'rec_social_activity',
            group: 'extra',
            title: 'Социальная активность',
            short: 'Поддерживать социальные контакты',
            full: 'Поддерживать посильный уровень общения с близкими и знакомыми, избегая длительной социальной изоляции.'
        }
    ];

    const RECOMMENDATION_GROUP_LABELS = {
        all: 'Все',
        general: 'Общие',
        anxiety: 'Тревога',
        depression: 'Депрессия',
        psychosis: 'Психоз',
        sleep: 'Сон',
        substance: 'Алкоголь/ПАВ',
        extra: 'Дополнительно'
    };

    let currentRecommendationFilter = 'all';
    const recommendationSelections = {};
    function getRecommendationPreview(text) {
        const words = text.split(' ').filter(Boolean);
        const preview = words.slice(0, 3).join(' ');
        return words.length > 3 ? preview + '…' : preview;
    }

    function renderRecommendationFilters() {
        const container = document.getElementById('recommendations-filters');
        if (!container) return;
        container.innerHTML = '';

        Object.entries(RECOMMENDATION_GROUP_LABELS).forEach(([key, label]) => {
            const chip = document.createElement('button');
            chip.type = 'button';
            chip.className = 'filter-chip' + (currentRecommendationFilter === key ? ' active' : '');
            chip.textContent = label;
            chip.addEventListener('click', () => {
                currentRecommendationFilter = key;
                renderRecommendationFilters();
                renderRecommendationsList();
            });
            container.appendChild(chip);
        });
    }

    function renderRecommendationsList() {
        const list = document.getElementById('recommendations-list');
        if (!list) return;
        list.innerHTML = '';

        const filtered = RECOMMENDATIONS_LIBRARY.filter(item =>
            currentRecommendationFilter === 'all' || item.group === currentRecommendationFilter
        );

        filtered.forEach(item => {
            if (!recommendationSelections[item.id]) {
                recommendationSelections[item.id] = { selected: false, mode: 'short' };
            }
            const state = recommendationSelections[item.id];

            const wrapper = document.createElement('div');
            wrapper.className = 'recommendation-item';

            const header = document.createElement('div');
            header.className = 'recommendation-header';

            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.checked = state.selected;
            checkbox.addEventListener('change', () => {
                recommendationSelections[item.id].selected = checkbox.checked;
                updateSelectedCount();
            });

            const title = document.createElement('span');
            title.className = 'recommendation-title';
            title.textContent = item.title;

            header.appendChild(checkbox);
            header.appendChild(title);

            const texts = document.createElement('div');
            texts.className = 'recommendation-texts';

            const shortLine = document.createElement('div');
            const shortLabel = document.createElement('strong');
            shortLabel.textContent = 'Коротко: ';
            shortLine.appendChild(shortLabel);
            shortLine.append(document.createTextNode(item.short));

            const fullLine = document.createElement('div');
            const fullLabel = document.createElement('strong');
            fullLabel.textContent = 'Полный: ';
            fullLine.appendChild(fullLabel);
            fullLine.append(document.createTextNode(getRecommendationPreview(item.full)));

            texts.appendChild(shortLine);
            texts.appendChild(fullLine);

            const mode = document.createElement('div');
            mode.className = 'recommendation-mode';

            const shortMode = document.createElement('label');
            const shortRadio = document.createElement('input');
            shortRadio.type = 'radio';
            shortRadio.name = 'mode_' + item.id;
            shortRadio.value = 'short';
            shortRadio.checked = state.mode === 'short';
            shortRadio.addEventListener('change', () => {
                recommendationSelections[item.id].mode = 'short';
            });
            shortMode.appendChild(shortRadio);
            shortMode.append(document.createTextNode('Коротко'));

            const fullMode = document.createElement('label');
            const fullRadio = document.createElement('input');
            fullRadio.type = 'radio';
            fullRadio.name = 'mode_' + item.id;
            fullRadio.value = 'full';
            fullRadio.checked = state.mode === 'full';
            fullRadio.addEventListener('change', () => {
                recommendationSelections[item.id].mode = 'full';
            });
            fullMode.appendChild(fullRadio);
            fullMode.append(document.createTextNode('Полный'));

            mode.appendChild(shortMode);
            mode.appendChild(fullMode);

            wrapper.appendChild(header);
            wrapper.appendChild(texts);
            wrapper.appendChild(mode);

            list.appendChild(wrapper);
        });

        updateSelectedCount();
    }

    function updateSelectedCount() {
        const counter = document.getElementById('recommendations-selected-count');
        if (!counter) return;
        const count = Object.values(recommendationSelections).filter(item => item.selected).length;
        counter.textContent = count;
    }

    function collectSelectedRecommendations() {
        const selectedTexts = [];

        RECOMMENDATIONS_LIBRARY.forEach(item => {
            const state = recommendationSelections[item.id];
            if (state?.selected) {
                selectedTexts.push(state.mode === 'full' ? item.full : item.short);
            }
        });

        const textarea = document.getElementById('recommendations');
        if (!textarea) return;
        const formatted = selectedTexts.map((text, index) => `${index + 1}. ${text}`).join('\n');
        textarea.value = formatted;
    }

    function initRecommendationsLibrary() {
        renderRecommendationFilters();
        renderRecommendationsList();
        const collectBtn = document.getElementById('collect-recommendations-button');
        if (collectBtn) {
            collectBtn.addEventListener('click', collectSelectedRecommendations);
        }
    }

    const recommendationsLibrary = [
        {
            id: 'sleep',
            title: 'Режим сна',
            short: 'Наладить график сна с соблюдением постоянного времени засыпания и пробуждения.',
            full: 'Рекомендовано регуляризировать цикл сна: ложиться и вставать в одно и то же время, исключить длительные дневные сны, за 2–3 часа до сна избегать кофеина, гаджетов и тяжёлой пищи.'
        },
        {
            id: 'activity',
            title: 'Физическая активность',
            short: 'Лёгкая ежедневная физическая активность при отсутствии соматических противопоказаний.',
            full: 'Рекомендована регулярная умеренная физическая активность (ходьба, ЛФК, растяжка) не менее 20–30 минут в день при отсутствии соматических противопоказаний; нагрузку увеличивать постепенно.'
        },
        {
            id: 'psychoeducation',
            title: 'Психообразование',
            short: 'Провести психообразовательную беседу о природе болезни и лечении.',
            full: 'Рекомендуется психообразовательная беседа: обсудить с пациентом особенности состояния, факторы обострения и ремиссии, принципы фармако- и психотерапии, важность приверженности лечению.'
        }
    ];

    function initRecommendationCards() {
        const container = document.getElementById('recommendation-cards');
        if (!container || !Array.isArray(recommendationsLibrary)) return;

        recommendationsLibrary.forEach(item => {
            const card = document.createElement('div');
            card.className = 'rec-card';

            card.innerHTML = `
            <label class="rec-title">
                <input type="checkbox" class="rec-toggle" data-rec-id="${item.id}">
                <span>${item.title}</span>
            </label>
            <div class="rec-modes" data-rec-id="${item.id}">
                <label><input type="radio" name="rec-${item.id}-mode" value="short" disabled> Коротко</label>
                <label><input type="radio" name="rec-${item.id}-mode" value="full" disabled> Полно</label>
            </div>
            <div class="rec-text" id="rec-text-${item.id}"></div>
        `;

            container.appendChild(card);
        });

        container.addEventListener('change', function (event) {
            const target = event.target;
            if (!target) return;

            // Toggle checkbox
            if (target.classList.contains('rec-toggle')) {
                const id = target.getAttribute('data-rec-id');
                const modes = container.querySelector(`.rec-modes[data-rec-id="${id}"]`);
                const textBlock = document.getElementById(`rec-text-${id}`);
                if (!modes || !textBlock) return;

                const radios = modes.querySelectorAll('input[type="radio"]');
                if (target.checked) {
                    radios.forEach(r => r.disabled = false);
                    textBlock.style.display = 'block';
                    // по умолчанию "Коротко"
                    const shortRadio = modes.querySelector('input[value="short"]');
                    if (shortRadio && !shortRadio.checked) {
                        shortRadio.checked = true;
                        setRecText(id, 'short');
                    }
                } else {
                    radios.forEach(r => {
                        r.disabled = true;
                        r.checked = false;
                    });
                    textBlock.style.display = 'none';
                    textBlock.textContent = '';
                }
            }

            // Toggle mode (short/full)
            if (target.type === 'radio' && target.name.startsWith('rec-') && target.name.endsWith('-mode')) {
                const id = target.name.replace(/^rec-/, '').replace(/-mode$/, '');
                const mode = target.value;
                setRecText(id, mode);
            }
        });
    }

    function setRecText(id, mode) {
        const item = recommendationsLibrary.find(r => r.id === id);
        const block = document.getElementById(`rec-text-${id}`);
        if (!item || !block) return;

        block.textContent = mode === 'full' ? item.full : item.short;
    }

