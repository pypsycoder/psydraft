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
        },

    // === ОБСЛЕДОВАНИЯ (таблицы) ===

    // Инструментальные исследования
    {id: 'exam_eeg',         group: 'instrumental', uiType: 'table', title: 'ЭЭГ',                                   indication: 'Эпилептические приступы, подозрение на органическое поражение ЦНС, дифдиагностика'},
    {id: 'exam_mri_brain',   group: 'instrumental', uiType: 'table', title: 'МРТ головного мозга',                   indication: 'Очаговая симптоматика, впервые выявленный психоз'},
    {id: 'exam_ct_brain',    group: 'instrumental', uiType: 'table', title: 'КТ головного мозга',                    indication: 'Экстренная альтернатива МРТ'},
    {id: 'exam_uzdс',        group: 'instrumental', uiType: 'table', title: 'УЗДС сосудов головы и шеи',             indication: 'ЦВБ, когнитивный дефицит'},
    {id: 'exam_ecg',         group: 'instrumental', uiType: 'table', title: 'ЭКГ',                                   indication: 'Контроль QTc при антипсихотиках и трициклических антидепрессантах'},
    {id: 'exam_holter',      group: 'instrumental', uiType: 'table', title: 'Суточный мониторинг ЭКГ (Холтер)',      indication: 'Жалобы на перебои в работе сердца, синкопе'},
    {id: 'exam_xray_chest',  group: 'instrumental', uiType: 'table', title: 'Рентгенография органов грудной клетки', indication: 'Скрининг, подготовка к госпитализации'},
    {id: 'exam_echo',        group: 'instrumental', uiType: 'table', title: 'ЭхоКГ',                                 indication: 'Кардиальная патология'},
    {id: 'exam_uzi_abdom',   group: 'instrumental', uiType: 'table', title: 'УЗИ органов брюшной полости',           indication: 'Гепатотоксичность на фоне вальпроатов, клозапина'},
    {id: 'exam_uzi_thyroid', group: 'instrumental', uiType: 'table', title: 'УЗИ щитовидной железы',                indication: 'Структурная патология ЩЖ, пальпаторные изменения, узловой зоб, длительная терапия литием'},

    // Лабораторные исследования
    {id: 'lab_cbc',           group: 'laboratory', uiType: 'table', title: 'ОАК с лейкоцитарной формулой',                                                    indication: 'Базовый скрининг; обязателен при клозапине — риск агранулоцитоза'},
    {id: 'lab_ua',            group: 'laboratory', uiType: 'table', title: 'ОАМ',                                                                              indication: 'Базовый скрининг'},
    {id: 'lab_biochem',       group: 'laboratory', uiType: 'table', title: 'Биохимия крови (АЛТ, АСТ, креатинин, мочевина, билирубин, глюкоза, общий белок)', indication: 'Функция печени/почек, базовый'},
    {id: 'lab_electrolytes',  group: 'laboratory', uiType: 'table', title: 'Натрий, калий',                                                                    indication: 'Карбамазепин (риск гипонатриемии), литий (контроль электролитного баланса)'},
    {id: 'lab_lipids',        group: 'laboratory', uiType: 'table', title: 'Липидный профиль',                                                                 indication: 'Атипичные антипсихотики, метаболический синдром'},
    {id: 'lab_glucose',       group: 'laboratory', uiType: 'table', title: 'Глюкоза натощак',                                                                  indication: 'Атипичные антипсихотики (особенно клозапин, оланзапин)'},
    {id: 'lab_hba1c',         group: 'laboratory', uiType: 'table', title: 'Гликированный гемоглобин',                                                         indication: 'Нарушение углеводного обмена'},
    {id: 'lab_thyroid',       group: 'laboratory', uiType: 'table', title: 'ТТГ, Т4 свободный',                                                                indication: 'Депрессия, биполярное расстройство, терапия литием'},
    {id: 'lab_prolactin',     group: 'laboratory', uiType: 'table', title: 'Пролактин',                                                                        indication: 'Антипсихотики, галакторея, нарушение менструального цикла'},
    {id: 'lab_valproate',     group: 'laboratory', uiType: 'table', title: 'Концентрация вальпроатов в крови',                                                 indication: 'Контроль терапии'},
    {id: 'lab_lithium',       group: 'laboratory', uiType: 'table', title: 'Концентрация лития в крови',                                                       indication: 'Контроль терапии'},
    {id: 'lab_carbamazepine', group: 'laboratory', uiType: 'table', title: 'Концентрация карбамазепина в крови',                                               indication: 'Контроль терапии'},
    {id: 'lab_lamotrigine',   group: 'laboratory', uiType: 'table', title: 'Концентрация ламотриджина в крови',                                                indication: 'Контроль терапии при БАР, эпилепсии'},
    {id: 'lab_hiv',           group: 'laboratory', uiType: 'table', title: 'ВИЧ, RW, гепатиты B и C',                                                         indication: 'Скрининг при первичном приёме, госпитализации'},
    {id: 'lab_b12',           group: 'laboratory', uiType: 'table', title: 'Витамин B12, фолиевая кислота',                                                    indication: 'Когнитивный дефицит, депрессия'},
    {id: 'lab_coag',          group: 'laboratory', uiType: 'table', title: 'Коагулограмма',                                                                    indication: 'Вальпроаты (риск кровотечений), предоперационная подготовка'},

    // Консультации специалистов (медицинские)
    {id: 'cons_neurologist',       group: 'consultations', uiType: 'table', title: 'Невролог',              indication: 'Очаговая симптоматика, эпиприступы, когнитивный дефицит'},
    {id: 'cons_therapist',         group: 'consultations', uiType: 'table', title: 'Терапевт',              indication: 'Соматическая коморбидность'},
    {id: 'cons_endocrinologist',   group: 'consultations', uiType: 'table', title: 'Эндокринолог',          indication: 'Метаболический синдром, патология щитовидной железы'},
    {id: 'cons_cardiologist',      group: 'consultations', uiType: 'table', title: 'Кардиолог',             indication: 'Удлинение QTc, аритмии'},
    {id: 'cons_narcologist',       group: 'consultations', uiType: 'table', title: 'Нарколог',              indication: 'Злоупотребление ПАВ/алкоголем, двойной диагноз'},
    {id: 'cons_ophthalmologist',   group: 'consultations', uiType: 'table', title: 'Офтальмолог',           indication: 'Фенотиазины, длительная антипсихотическая терапия'},
    {id: 'cons_gynecologist',      group: 'consultations', uiType: 'table', title: 'Гинеколог',             indication: 'Гиперпролактинемия, нарушение менструального цикла'},
    {id: 'cons_gastroenterologist',group: 'consultations', uiType: 'table', title: 'Гастроэнтеролог',       indication: 'Нарушение функции печени на фоне терапии'},
    {id: 'cons_psychotherapist',   group: 'consultations', uiType: 'table', title: 'Психотерапевт (врач)',  indication: 'Психотерапевтическое сопровождение'},

    // Немедицинские специалисты
    {id: 'cons_med_psychologist',  group: 'nonmedical', uiType: 'table', title: 'Клиничекский психолог',  indication: 'Нейропсихологическое тестирование, патопсихологическое исследование, психодиагностика'},
    {id: 'cons_clin_psychologist', group: 'nonmedical', uiType: 'table', title: 'Психолог',  indication: 'Психологическая коррекция, работа с копингом, психообразование'},
    {id: 'cons_social_worker',     group: 'nonmedical', uiType: 'table', title: 'Социальный работник',   indication: 'Реабилитация, социальная дезадаптация, юридические вопросы'},
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
    extra: "Дополнительно",
    instrumental:  "Инструментальные",
    laboratory:    "Лабораторные",
    consultations: "Консультации",
    nonmedical:    "Немед. специалисты"
};
// Порядок отражения групп

const GROUP_ORDER = [
    "general",
    "sleep",
    "anxiety",
    "depression",
    "psychosis",
    "substance",
    "extra",
    "instrumental",
    "laboratory",
    "consultations",
    "nonmedical"
];


// == Переменная активной группы и функции рендера групп ==

let activeGroup = 'sleep'; // "Сон" по умолчанию

// Персистентное состояние выбранных рекомендаций: { recId: 'short'|'full' }
const selectedRecs = {};

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

function renderGroupFilters() {
    const container = document.getElementById('group-filters');
    if (!container) return;

    const groups = getGroups();
    let html = '';

    // Кнопка "Все"
    html += `
        <button 
            class="group-filter-btn ${activeGroup === 'all' ? 'active' : ''}" 
            data-group="all">
            Все
        </button>
    `;

    // Кнопки по группам
    groups.forEach(group => {
        const label = GROUP_LABELS[group] || group;
        html += `
          <button 
            class="group-filter-btn ${activeGroup === group ? 'active' : ''}" 
            data-group="${group}">
            ${label}
          </button>
        `;
    });

    container.innerHTML = html;

    // Обработчики на кнопки (делегирование не нужно, коллекция маленькая)
    container.querySelectorAll('.group-filter-btn').forEach((btn) => {
        btn.addEventListener('click', () => {
            activeGroup = btn.dataset.group;
            renderGroupFilters();    // обновляем .active
            renderRecommendations(); // перерисовываем карточки с учётом фильтра
        });
    });
}

// == Сортировка и фильтрация карточек ==

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

// == Рендер карточек рекомендаций ==

// Группы, которые отображаются таблицей
const TABLE_GROUPS = new Set(['instrumental', 'laboratory', 'consultations', 'nonmedical']);
// Порядок секций при сборе текста
const EXAM_GROUP_ORDER = ['instrumental', 'laboratory', 'consultations', 'nonmedical'];
const EXAM_GROUP_LABELS = {
    instrumental:  'Инструментальные исследования',
    laboratory:    'Лабораторные исследования',
    consultations: 'Консультации специалистов',
    nonmedical:    'Немедицинские специалисты'
};

function renderRecommendations() {
    const container = document.getElementById('recommendation-cards');
    if (!container || !Array.isArray(RECOMMENDATIONS_LIBRARY)) return;

    container.innerHTML = '';

    const items = getSortedFilteredRecommendations();
    const cardItems  = items.filter(i => !TABLE_GROUPS.has(i.group));
    const tableItems = items.filter(i =>  TABLE_GROUPS.has(i.group));

    // --- Карточки (существующая логика) ---
    cardItems.forEach((item) => {
        const card = document.createElement('div');
        card.className = 'rec-card';
        card.dataset.recId = item.id;
        card.dataset.mode = 'short';

        card.innerHTML = `
            <label class="rec-title">
                <input type="checkbox"
                       class="rec-toggle"
                       data-rec-id="${item.id}">
                <span>${item.title}</span>
            </label>

            <div class="rec-modes" data-rec-id="${item.id}">
                <label>
                    <input type="radio"
                           name="rec-${item.id}-mode"
                           value="short"
                           disabled>
                    Коротко
                </label>
                <label>
                    <input type="radio"
                           name="rec-${item.id}-mode"
                           value="full"
                           disabled>
                    Полно
                </label>
            </div>

            <div class="rec-text"
                 id="rec-text-${item.id}"
                 style="display:none;"></div>
        `;

        container.appendChild(card);
    });

    // Восстанавливаем состояние карточек
    Object.entries(selectedRecs).forEach(([id, mode]) => {
        const card = container.querySelector(`.rec-card[data-rec-id="${id}"]`);
        if (!card) return;

        const checkbox = card.querySelector('.rec-toggle');
        const modesBlock = card.querySelector('.rec-modes');
        const textBlock = card.querySelector('.rec-text');
        if (!checkbox || !modesBlock || !textBlock) return;

        checkbox.checked = true;
        card.dataset.mode = mode;

        const radios = modesBlock.querySelectorAll('input[type="radio"]');
        radios.forEach((r) => { r.disabled = false; });

        const radioToCheck = modesBlock.querySelector(`input[value="${mode}"]`);
        if (radioToCheck) radioToCheck.checked = true;

        setRecText(id, mode);
        textBlock.style.display = 'block';
    });

    // --- Таблицы обследований ---
    if (tableItems.length > 0) {
        const wrapper = document.createElement('div');
        wrapper.className = 'rec-table-wrapper';

        if (activeGroup === 'all') {
            // сгруппировать по group в нашем порядке
            const grouped = {};
            tableItems.forEach(item => {
                if (!grouped[item.group]) grouped[item.group] = [];
                grouped[item.group].push(item);
            });
            EXAM_GROUP_ORDER.forEach(group => {
                if (!grouped[group]) return;
                const heading = document.createElement('h4');
                heading.className = 'exam-section-heading';
                heading.textContent = EXAM_GROUP_LABELS[group];
                wrapper.appendChild(heading);
                wrapper.appendChild(buildExamTable(grouped[group]));
            });
        } else {
            wrapper.appendChild(buildExamTable(tableItems));
        }

        container.appendChild(wrapper);
    }

    updateSelectedCount();
}

// Строит таблицу для набора элементов-обследований
function buildExamTable(items) {
    const table = document.createElement('table');
    table.className = 'exam-table';

    const thead = document.createElement('thead');
    thead.innerHTML = '<tr><th></th><th>Название</th><th>Показание</th></tr>';
    table.appendChild(thead);

    const tbody = document.createElement('tbody');
    items.forEach(item => {
        const tr = document.createElement('tr');
        const isChecked = !!selectedRecs[item.id];
        if (isChecked) tr.classList.add('exam-row--checked');
        tr.innerHTML = `
            <td class="exam-cb-cell">
                <input type="checkbox" class="rec-toggle" data-rec-id="${item.id}"${isChecked ? ' checked' : ''}>
            </td>
            <td class="exam-name">${item.title}</td>
            <td class="exam-indication">${item.indication || ''}</td>
        `;
        tbody.appendChild(tr);
    });
    table.appendChild(tbody);
    return table;
}

// == Инициализация карточек (один раз) ==

function initRecommendationCards() {
    const container = document.getElementById('recommendation-cards');
    if (!container || !Array.isArray(RECOMMENDATIONS_LIBRARY)) return;

    // делаем первый рендер с учётом активной группы (по умолчанию "all")
    renderRecommendations();

    // один раз вешаем обработчик событий на контейнер (делегирование)
    container.addEventListener('change', onRecommendationCardsChange);
}

// == Обработка изменений в карточках ==

function onRecommendationCardsChange(event) {
    const target = event.target;
    if (!target) return;

    // Чекбоксы в таблицах обследований
    if (target.classList.contains('rec-toggle') && !target.closest('.rec-card')) {
        const id = target.dataset.recId;
        const row = target.closest('tr');
        if (target.checked) {
            selectedRecs[id] = 'short';
            if (row) row.classList.add('exam-row--checked');
        } else {
            delete selectedRecs[id];
            if (row) row.classList.remove('exam-row--checked');
        }
        updateSelectedCount();
        return;
    }

    const card = target.closest('.rec-card');
    if (!card) return;

    const id = card.dataset.recId;
    const modesBlock = card.querySelector('.rec-modes');
    const textBlock = card.querySelector('.rec-text');
    if (!modesBlock || !textBlock) return;

    const radios = modesBlock.querySelectorAll('input[type="radio"]');

    // клик по чекбоксу (включение / выключение карточки)
    if (target.classList.contains('rec-toggle')) {
        if (target.checked) {
            radios.forEach((r) => { r.disabled = false; });

            let mode = card.dataset.mode || 'short';
            let radioToCheck =
                modesBlock.querySelector(`input[value="${mode}"]`) ||
                modesBlock.querySelector('input[value="short"]');

            if (radioToCheck) {
                radioToCheck.checked = true;
                mode = radioToCheck.value;
                card.dataset.mode = mode;
                setRecText(id, mode);
            }

            selectedRecs[id] = mode;
            textBlock.style.display = 'block';
        } else {
            radios.forEach((r) => {
                r.disabled = true;
                r.checked = false;
            });
            delete selectedRecs[id];
            textBlock.style.display = 'none';
            textBlock.textContent = '';
        }

        updateSelectedCount();
        return;
    }

    // клик по радио Коротко/Полно
    if (target.type === 'radio' &&
        target.name.startsWith('rec-') &&
        target.name.endsWith('-mode')) {

        const mode = target.value;
        card.dataset.mode = mode;
        if (selectedRecs[id] !== undefined) selectedRecs[id] = mode;
        setRecText(id, mode);
    }
}

// == Установка текста в зависимости от режима ==

function setRecText(id, mode) {
    const item = RECOMMENDATIONS_LIBRARY.find((r) => r.id === id);
    if (!item) return;

    const block = document.getElementById(`rec-text-${id}`);
    if (!block) return;

    block.textContent = mode === 'full' ? item.full : item.short;
}

// == Счётчик выбранных рекомендаций ==

function updateSelectedCount() {
    const counter = document.getElementById('recommendations-selected-count');
    if (!counter) return;

    counter.textContent = String(Object.keys(selectedRecs).length);
}

// == Сбор выбранных рекомендаций в текстовое поле ==

function collectSelectedRecommendations() {
    const textarea = document.getElementById('recommendations');
    if (!textarea) return;

    const regularTexts = [];
    const examSections = {};

    Object.entries(selectedRecs).forEach(([id, mode]) => {
        const item = RECOMMENDATIONS_LIBRARY.find((r) => r.id === id);
        if (!item) return;

        if (TABLE_GROUPS.has(item.group)) {
            if (!examSections[item.group]) examSections[item.group] = [];
            examSections[item.group].push(item.title);
        } else {
            const text = mode === 'full' ? item.full : item.short;
            regularTexts.push(text);
        }
    });

    const lines = [];
    regularTexts.forEach((text, i) => lines.push(`${i + 1}. ${text}`));

    EXAM_GROUP_ORDER.forEach(group => {
        if (!examSections[group] || examSections[group].length === 0) return;
        if (lines.length > 0) lines.push('');
        lines.push('<strong>' + EXAM_GROUP_LABELS[group] + ':</strong>');
        examSections[group].forEach((name, i) => lines.push(`${i + 1}. ${name}`));
    });

    textarea.value = lines.join('\n');
}

// == Общая инициализация библиотеки рекомендаций ==

function initRecommendationsLibrary() {
    // сначала рисуем фильтры по группам (если есть контейнер)
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
