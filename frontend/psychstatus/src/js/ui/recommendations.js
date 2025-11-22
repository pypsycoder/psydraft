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

// === ЛОГИКА КАРТОЧЕК РЕКОМЕНДАЦИЙ ===

// Сопоставление внутренних групп → русские названия
const GROUP_LABELS = {
    general: "Общие",
    sleep: "Сон",
    anxiety: "Тревога",
    depression: "Депрессия",
    psychosis: "Психоз",
    substance: "ПАВ",
    extra: "Дополнительно"
};

// Порядок отражения групп
const GROUP_ORDER = [
    "general",
    "sleep",
    "anxiety",
    "depression",
    "psychosis",
    "substance",
    "extra"
];

// === Глобальное состояние выбранных рекомендаций ===
//
// selectedRecommendationsState[id] = {
//   selected: boolean,
//   mode: 'short' | 'full'
// }
const selectedRecommendationsState = {};

// Активная группа (вкладка). По умолчанию "Сон" как было.
let activeGroup = 'sleep';

// Инициализация состояния по библиотеке
function initSelectedRecommendationsState() {
    RECOMMENDATIONS_LIBRARY.forEach((item) => {
        if (!selectedRecommendationsState[item.id]) {
            selectedRecommendationsState[item.id] = {
                selected: false,
                mode: 'short'
            };
        }
    });
}

// === Работа с группами ===

function getGroups() {
    const groupsSet = new Set();
    RECOMMENDATIONS_LIBRARY.forEach(item => {
        if (item.group) groupsSet.add(item.group);
    });

    const groups = Array.from(groupsSet);

    // сортировка по нашему порядку
    groups.sort((a, b) => GROUP_ORDER.indexOf(a) - GROUP_ORDER.indexOf(b));

    return groups;
}

// Подсчёт выбранных рекомендаций по группам
function getSelectedCountsByGroup() {
    const counts = { all: 0 };

    RECOMMENDATIONS_LIBRARY.forEach((item) => {
        const state = selectedRecommendationsState[item.id];
        if (state && state.selected) {
            counts.all += 1;
            const g = item.group || 'extra';
            counts[g] = (counts[g] || 0) + 1;
        }
    });

    return counts;
}

function renderGroupFilters() {
    const container = document.getElementById('group-filters');
    if (!container) return;

    const groups = getGroups();
    const counts = getSelectedCountsByGroup();

    let html = '';

    // Кнопка "Все" с общим счётчиком
    const allCount = counts.all || 0;
    const allLabel = allCount > 0 ? `Все (${allCount})` : 'Все';

    html += `
        <button 
            class="group-filter-btn ${activeGroup === 'all' ? 'active' : ''}" 
            data-group="all">
            ${allLabel}
        </button>
    `;

    // Кнопки по группам с их счётчиками
    groups.forEach(group => {
        const baseLabel = GROUP_LABELS[group] || group;
        const groupCount = counts[group] || 0;
        const label = groupCount > 0
            ? `${baseLabel} (${groupCount})`
            : baseLabel;

        html += `
            <button 
                class="group-filter-btn ${activeGroup === group ? 'active' : ''}" 
                data-group="${group}">
                ${label}
            </button>
        `;
    });

    container.innerHTML = html;

    // Обработчики на кнопки
    container.querySelectorAll('.group-filter-btn').forEach((btn) => {
        btn.addEventListener('click', () => {
            activeGroup = btn.dataset.group;
            renderGroupFilters();    // обновляем .active и счётчики
            renderRecommendations(); // перерисовываем карточки с учётом фильтра
        });
    });
}

// === Сортировка и фильтрация карточек ===

function getSortedFilteredRecommendations() {
    let items = RECOMMENDATIONS_LIBRARY.slice();

    // фильтр по активной группе
    if (activeGroup !== 'all') {
        items = items.filter((item) => item.group === activeGroup);
    }

    // сортировка: сначала по group, потом по title
    items.sort((a, b) => {
        if (a.group === b.group) {
            return (a.title || '').localeCompare(b.title || '', 'ru');
        }
        return (a.group || '').localeCompare(b.group || '', 'ru');
    });

    return items;
}

// === Рендер карточек рекомендаций ===

function renderRecommendations() {
    const container = document.getElementById('recommendation-cards');
    if (!container || !Array.isArray(RECOMMENDATIONS_LIBRARY)) return;

    container.innerHTML = '';

    const items = getSortedFilteredRecommendations();

    items.forEach((item) => {
        const state = selectedRecommendationsState[item.id] || {
            selected: false,
            mode: 'short'
        };

        const card = document.createElement('div');
        card.className = 'rec-card';
        card.dataset.recId = item.id;
        card.dataset.mode = state.mode || 'short';

        const isSelected = !!state.selected;
        const mode = state.mode || 'short';
        const textValue = isSelected
            ? (mode === 'full' ? item.full : item.short)
            : '';

        card.innerHTML = `
            <label class="rec-title">
                <input type="checkbox"
                       class="rec-toggle"
                       data-rec-id="${item.id}"
                       ${isSelected ? 'checked' : ''}>
                <span>${item.title}</span>
            </label>

            <div class="rec-modes" data-rec-id="${item.id}">
                <label>
                    <input type="radio"
                           name="rec-${item.id}-mode"
                           value="short"
                           ${isSelected ? '' : 'disabled'}
                           ${isSelected && mode === 'short' ? 'checked' : ''}>
                    Коротко
                </label>
                <label>
                    <input type="radio"
                           name="rec-${item.id}-mode"
                           value="full"
                           ${isSelected ? '' : 'disabled'}
                           ${isSelected && mode === 'full' ? 'checked' : ''}>
                    Полно
                </label>
            </div>

            <div class="rec-text"
                 id="rec-text-${item.id}"
                 style="${isSelected ? '' : 'display:none;'}">${textValue}</div>
        `;

        container.appendChild(card);
    });

    // после перерисовки карточек пересчитываем счётчик
    updateSelectedCount();
}

// === Инициализация карточек (один раз) ===

function initRecommendationCards() {
    const container = document.getElementById('recommendation-cards');
    if (!container || !Array.isArray(RECOMMENDATIONS_LIBRARY)) return;

    renderRecommendations();

    // один раз вешаем обработчик событий на контейнер (делегирование)
    container.addEventListener('change', onRecommendationCardsChange);
}

// === Обработка изменений в карточках ===

function onRecommendationCardsChange(event) {
    const target = event.target;
    if (!target) return;

    const card = target.closest('.rec-card');
    if (!card) return;

    const id = card.dataset.recId;
    const modesBlock = card.querySelector('.rec-modes');
    const textBlock = card.querySelector('.rec-text');
    if (!modesBlock || !textBlock) return;

    const radios = modesBlock.querySelectorAll('input[type="radio"]');

    const state = selectedRecommendationsState[id] || {
        selected: false,
        mode: 'short'
    };

    // клик по чекбоксу (включение / выключение карточки)
    if (target.classList.contains('rec-toggle')) {
        if (target.checked) {
            state.selected = true;

            radios.forEach((r) => { r.disabled = false; });

            let mode = card.dataset.mode || state.mode || 'short';
            let radioToCheck =
                modesBlock.querySelector(`input[value="${mode}"]`) ||
                modesBlock.querySelector('input[value="short"]');

            if (radioToCheck) {
                radioToCheck.checked = true;
                mode = radioToCheck.value;
                card.dataset.mode = mode;
                state.mode = mode;
                setRecText(id, mode);
            }

            textBlock.style.display = 'block';
        } else {
            state.selected = false;

            radios.forEach((r) => {
                r.disabled = true;
                r.checked = false;
            });
            textBlock.style.display = 'none';
            textBlock.textContent = '';
            // mode оставляем, чтобы при повторном выборе вернуться к прежнему варианту
        }

        selectedRecommendationsState[id] = state;
        updateSelectedCount();
        return;
    }

    // клик по радио Коротко/Полно
    if (target.type === 'radio' &&
        target.name.startsWith('rec-') &&
        target.name.endsWith('-mode')) {

        const mode = target.value;
        card.dataset.mode = mode;
        state.mode = mode;
        selectedRecommendationsState[id] = state;

        setRecText(id, mode);
        // счётчик тут не меняется, но фильтры с числами по группам можно обновить
        renderGroupFilters();
    }
}

// === Установка текста в зависимости от режима ===

function setRecText(id, mode) {
    const item = RECOMMENDATIONS_LIBRARY.find((r) => r.id === id);
    if (!item) return;

    const block = document.getElementById(`rec-text-${id}`);
    if (!block) return;

    block.textContent = mode === 'full' ? item.full : item.short;
}

// === Счётчик выбранных рекомендаций (общий) ===

function updateSelectedCount() {
    const counter = document.getElementById('recommendations-selected-count');
    if (!counter) return;

    const count = Object.values(selectedRecommendationsState)
        .filter((s) => s.selected)
        .length;

    counter.textContent = String(count);

    // Обновим фильтры, чтобы подтянуть счётчики в кнопках
    renderGroupFilters();
}

// === Сбор выбранных рекомендаций в текстовое поле ===
//
// ВАЖНО: теперь берём не из DOM, а из глобального состояния,
// чтобы учитывались все вкладки.
function collectSelectedRecommendations() {
    const textarea = document.getElementById('recommendations');
    if (!textarea) return;

    const texts = [];

    RECOMMENDATIONS_LIBRARY.forEach((item) => {
        const state = selectedRecommendationsState[item.id];
        if (!state || !state.selected) return;

        const mode = state.mode || 'short';
        const text = mode === 'full' ? item.full : item.short;
        texts.push(`${texts.length + 1}. ${text}`);
    });

    textarea.value = texts.join('\n');
}

// === Общая инициализация библиотеки рекомендаций ===

function initRecommendationsLibrary() {
    // сначала инициализируем глобальное состояние
    initSelectedRecommendationsState();

    // рисуем фильтры по группам
    renderGroupFilters();

    // затем инициализируем карточки
    initRecommendationCards();

    const collectBtn =
        document.getElementById('collect-recommendations-button');
    if (collectBtn) {
        collectBtn.addEventListener('click', collectSelectedRecommendations);
    }
}

// гарантируем инициализацию после загрузки DOM
document.addEventListener('DOMContentLoaded', initRecommendationsLibrary);
