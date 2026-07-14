const ISI_ITEMS = [
  'Трудность засыпания',
  'Трудность поддержания сна',
  'Ранние пробуждения',
  'Удовлетворенность текущим сном',
  'Заметность проблемы для окружающих',
  'Беспокойство из-за нарушения сна',
  'Влияние на дневное функционирование'
];

const ESS_ITEMS = [
  'Сидя и читая',
  'Просмотр телевизора',
  'Пассивно сидя в общественном месте',
  'Пассажиром в машине около часа',
  'Лежа днем после обеда',
  'Сидя и разговаривая',
  'Сидя спокойно после обеда без алкоголя',
  'В машине при остановке в пробке'
];

const STOPBANG_ITEMS = [
  ['S', 'Громкий храп'],
  ['T', 'Усталость / дневная сонливость'],
  ['O', 'Наблюдались остановки дыхания'],
  ['P', 'Артериальная гипертензия'],
  ['B', 'ИМТ > 35 кг/м²'],
  ['A', 'Возраст > 50 лет'],
  ['N', 'Окружность шеи > 40 см'],
  ['G', 'Мужской пол']
];

const DIAGNOSIS_OPTIONS = [
  { code: 'G47.0', name: 'Инсомния' },
  { code: 'G47.1', name: 'Гиперсомния' },
  { code: 'G47.2', name: 'Нарушения циркадного ритма сна и бодрствования' },
  { code: 'G47.3', name: 'Апноэ во сне / подозрение на обструктивное апноэ сна' },
  { code: 'G47.4', name: 'Нарколепсия и катаплексия' },
  { code: 'G47.5', name: 'Парасомния' },
  { code: 'G47.8', name: 'Другие нарушения сна' },
  { code: 'G47.9', name: 'Нарушение сна неуточненное' },
  { code: 'F51.0', name: 'Инсомния неорганической этиологии' },
  { code: 'F51.1', name: 'Гиперсомния неорганической этиологии' },
  { code: 'F51.2', name: 'Расстройство режима сна-бодрствования неорганической этиологии' },
  { code: 'F51.3', name: 'Снохождение' },
  { code: 'F51.4', name: 'Ужасы во сне' },
  { code: 'F51.5', name: 'Кошмары' },
  { code: 'G25.8', name: 'Синдром беспокойных ног' },
  { code: 'R06.5', name: 'Ротовое дыхание / храп' },
  { code: 'R53', name: 'Недомогание и утомляемость' }
];

let selectedDiagnoses = [];

const TEST_OPTIONS = [
  { id: 'sleep_diary', label: 'Дневник сна 2 недели', tags: ['G47.0', 'G47.2', 'F51.0', 'F51.2'] },
  { id: 'actigraphy', label: 'Актиграфия при возможности', tags: ['G47.0', 'G47.2', 'F51.2'] },
  { id: 'psg', label: 'Полисомнография', tags: ['G47.1', 'G47.3', 'G47.4', 'G47.5'] },
  { id: 'resp_monitoring', label: 'Кардиореспираторный мониторинг сна', tags: ['G47.3'] },
  { id: 'mslt', label: 'MSLT после ночной ПСГ', tags: ['G47.1', 'G47.4'] },
  { id: 'ferritin', label: 'Ферритин, железо, ОЖСС/трансферрин', tags: ['G25.8'] },
  { id: 'cbc', label: 'ОАК', tags: ['G25.8', 'G47.1', 'R53'] },
  { id: 'tsh', label: 'ТТГ', tags: ['G47.0', 'G47.1', 'R53'] },
  { id: 'glucose', label: 'Глюкоза крови / HbA1c по показаниям', tags: ['G47.3', 'R53'] },
  { id: 'ent', label: 'Консультация ЛОР-врача', tags: ['G47.3', 'R06.5'] },
  { id: 'neurology', label: 'Консультация невролога', tags: ['G47.4', 'G47.5', 'G25.8'] },
  { id: 'psychiatry', label: 'Оценка тревоги/депрессии при подозрении на вторичную инсомнию', tags: ['G47.0', 'F51.0', 'F51.1'] },
  { id: 'video', label: 'Видео ночных эпизодов от родственников при возможности', tags: ['G47.5', 'F51.3', 'F51.4', 'F51.5'] }
];

const RECOMMENDATION_GROUPS = [
  ['general', 'Общие'],
  ['apnea', 'Апноэ'],
  ['insomnia', 'Инсомния'],
  ['rls', 'Синдром беспокойных ног'],
  ['other', 'Прочее']
];

const MEDICATION_GROUPS = [
  {
    title: 'Стимулирующие вещества и симпатомиметики',
    items: [
      ['caffeine', 'Кофеин / энергетики', 'кофе, чай, энергетик', 'задержка засыпания, фрагментация сна'],
      ['nicotine', 'Никотин', 'сигареты, вейп, НЗТ', 'активация; абстиненция ночью'],
      ['stimulants', 'Психостимуляторы и препараты бодрствования', 'метилфенидат, амфетамин, модафинил', 'инсомния, подавление сонливости'],
      ['decongestants', 'Сосудосуживающие деконгестанты', 'псевдоэфедрин, фенилэфрин', 'активация, инсомния']
    ]
  },
  {
    title: 'Психотропные препараты',
    items: [
      ['antidepressants', 'Антидепрессанты, изменяющие REM/сон', 'СИОЗС/СИОЗСН, бупропион, ИМАО', 'инсомния или сонливость, яркие сновидения, RLS/RBD'],
      ['sedating_antidepressants', 'Седативные антидепрессанты', 'миртазапин, тразодон, амитриптилин', 'сонливость, изменение архитектуры сна'],
      ['antipsychotics', 'Антипсихотики', 'кветиапин, оланзапин, рисперидон', 'седация; возможны акатизия/RLS и набор веса'],
      ['sedatives', 'Бензодиазепины, Z-препараты, барбитураты', 'диазепам, клоназепам, золпидем', 'седация, изменение архитектуры; риск дыхания/зависимости'],
      ['mood_stabilizers', 'Нормотимики и противоэпилептические', 'литий, вальпроат, ламотриджин, карбамазепин', 'сонливость или инсомния; изменение архитектуры'],
      ['anxiolytics_other', 'Другие анксиолитики', 'буспирон, гидроксизин', 'активация либо остаточная сонливость']
    ]
  },
  {
    title: 'Сердечно-сосудистые препараты',
    items: [
      ['beta_blockers', 'β-блокаторы', 'пропранолол, метопролол, бисопролол, атенолол, тимолол', 'особенно липофильные: инсомния, яркие сновидения/кошмары, утомляемость'],
      ['alpha_agents', 'α-адренергические препараты', 'клонидин, празозин, доксазозин', 'сонливость, изменение REM/сновидений'],
      ['diuretics', 'Диуретики', 'гидрохлоротиазид, индапамид, фуросемид', 'никтурия и фрагментация сна'],
      ['lipid_lowering', 'Гиполипидемические препараты', 'статины и другие', 'возможные индивидуальные нарушения сна'],
      ['antiarrhythmics', 'Антиаритмические и другие кардиологические', 'амиодарон и др.', 'прямое влияние или через соматические симптомы']
    ]
  },
  {
    title: 'Дыхательная система, аллергия и воспаление',
    items: [
      ['beta_agonists', 'β₂-агонисты / бронходилататоры', 'сальбутамол, формотерол, теофиллин', 'активация, тремор, инсомния'],
      ['corticosteroids', 'Системные глюкокортикоиды', 'преднизолон, дексаметазон', 'выраженная активация и инсомния'],
      ['antihistamines', 'H1-антигистаминные', 'дифенгидрамин, доксиламин, гидроксизин', 'седация, остаточная сонливость; возможное усиление RLS'],
      ['montelukast', 'Антилейкотриеновые', 'монтелукаст', 'яркие сновидения/кошмары у части пациентов']
    ]
  },
  {
    title: 'Неврология, боль и другие системные препараты',
    items: [
      ['dopaminergic', 'Дофаминергические препараты', 'леводопа, прамипексол, ропинирол', 'сонливость/приступы сна, сновидения, нарушения контроля импульсов'],
      ['cholinesterase', 'Ингибиторы ацетилхолинэстеразы', 'донепезил, ривастигмин, галантамин', 'инсомния, яркие сновидения/RBD'],
      ['opioids', 'Опиоиды и опиоидные антагонисты', 'морфин, оксикодон, трамадол, налтрексон', 'седация, центральное апноэ, фрагментация сна'],
      ['gabapentinoids', 'Габапентиноиды и миорелаксанты', 'габапентин, прегабалин, баклофен', 'сонливость; возможный дыхательный риск'],
      ['thyroid', 'Тиреоидные гормоны', 'левотироксин', 'инсомния при избыточной дозе/позднем приёме'],
      ['antimicrobials', 'Препараты с возможной нейроактивацией', 'фторхинолоны, интерфероны', 'редкие инсомния, тревога или яркие сновидения'],
      ['hormonal', 'Гормональные препараты', 'эстрогены, прогестины, андрогены', 'индивидуальное влияние на сон и дыхание']
    ]
  },
  {
    title: 'Алкоголь и другие вещества',
    items: [
      ['alcohol', 'Алкоголь', 'вид и количество', 'фрагментация сна, усиление храпа/OSA, REM-rebound'],
      ['cannabis', 'Каннабиноиды', 'форма и количество', 'сонливость; изменение архитектуры и синдром отмены'],
      ['other_substances', 'Другие ПАВ / добавки', 'название и количество', 'эффект зависит от вещества и отмены']
    ]
  }
];

const RECOMMENDATION_OPTIONS = [
  {
    id: 'sleep_diary',
    group: 'general',
    label: 'Вести дневник сна 2 недели с фиксацией времени отхода ко сну, подъема, пробуждений, дневного сна, кофеина/алкоголя и самочувствия днем.',
    tags: ['G47.0', 'G47.2', 'F51.0', 'F51.2']
  },
  {
    id: 'regular_schedule',
    group: 'general',
    label: 'Стабилизировать время подъема, включая выходные; избегать длительного дневного сна и позднего пребывания в постели без сна.',
    tags: ['G47.0', 'G47.2', 'F51.0', 'F51.2']
  },
  {
    id: 'stimulus_control',
    group: 'insomnia',
    label: 'Соблюдать контроль стимулов: использовать кровать преимущественно для сна, вставать при длительном бодрствовании, возвращаться при сонливости.',
    tags: ['G47.0', 'F51.0']
  },
  {
    id: 'sleep_hygiene',
    group: 'general',
    label: 'Оптимизировать гигиену сна: затемнение, тишина, прохладная комната, отказ от кофеина во второй половине дня и алкоголя как средства для сна.',
    tags: ['G47.0', 'G47.2', 'F51.0', 'F51.2', 'G47.9']
  },
  {
    id: 'cbti',
    group: 'insomnia',
    label: 'Обсудить CBT-I как метод первой линии для восстановления сна; медикаментозную терапию использовать ограниченно и с учетом рисков.',
    tags: ['G47.0', 'F51.0']
  },
  {
    id: 'osa_weight',
    group: 'apnea',
    label: 'Постепенно снижать массу тела при ее избытке; отказаться от алкоголя и седативных препаратов перед сном.',
    tags: ['G47.3']
  },
  {
    id: 'osa_position',
    group: 'apnea',
    label: 'Избегать сна на спине, если в этом положении усиливаются храп или остановки дыхания; не садиться за руль при выраженной сонливости.',
    tags: ['G47.3']
  },
  {
    id: 'cpap_route',
    group: 'apnea',
    label: 'После подтверждения нарушения дыхания во сне обсудить CPAP/APAP-терапию, подбор маски и контроль эффективности лечения.',
    tags: ['G47.3']
  },
  {
    id: 'rls_iron',
    group: 'rls',
    label: 'Проверить показатели обмена железа; при дефиците обсудить коррекцию ферритина и пересмотр препаратов, усиливающих симптомы.',
    tags: ['G25.8']
  },
  {
    id: 'rls_behavior',
    group: 'rls',
    label: 'Ограничить кофеин и алкоголь вечером, избегать недосыпания, использовать умеренную вечернюю активность и растяжку по переносимости.',
    tags: ['G25.8']
  },
  {
    id: 'hypersomnia_safety',
    group: 'other',
    label: 'Избегать вождения и опасных работ при выраженной дневной сонливости до уточнения причины и стабилизации состояния.',
    tags: ['G47.1', 'G47.4']
  },
  {
    id: 'hypersomnia_schedule',
    group: 'other',
    label: 'Оценить достаточность ночного сна и регулярность графика; исключить депривацию сна, ОАС и лекарственные причины сонливости.',
    tags: ['G47.1', 'G47.4', 'R53']
  },
  {
    id: 'circadian_light',
    group: 'other',
    label: 'Настроить световой режим: яркий свет в целевое утреннее время и ограничение яркого/синего света вечером.',
    tags: ['G47.2', 'F51.2']
  },
  {
    id: 'circadian_shift',
    group: 'other',
    label: 'Сдвиг графика сна проводить постепенно, небольшими шагами; фиксировать эффект по дневнику сна.',
    tags: ['G47.2', 'F51.2']
  },
  {
    id: 'parasomnia_safety',
    group: 'other',
    label: 'Обеспечить безопасность спальни: убрать травмоопасные предметы, закрывать окна/двери, предупредить партнера по сну.',
    tags: ['G47.5', 'F51.3', 'F51.4', 'F51.5']
  },
  {
    id: 'parasomnia_triggers',
    group: 'other',
    label: 'Исключить провокаторы ночных эпизодов: недосыпание, алкоголь, стресс, седативные препараты; по возможности собрать видео эпизодов.',
    tags: ['G47.5', 'F51.3', 'F51.4', 'F51.5']
  },
  {
    id: 'nightmares',
    group: 'other',
    label: 'Оценить связь кошмаров с травматическим стрессом, тревогой, депрессией и лекарствами; обсудить психотерапевтические подходы.',
    tags: ['F51.5', 'G47.5']
  }
];

const ADVISOR_RULES = [
  {
    code: 'G47.0',
    name: 'Инсомния',
    status: 'критерии частично; требуется уточнение длительности и исключений',
    required: [
      ['Инсомнические жалобы', s => hasAny(s.sleepSymptoms, ['трудности засыпания', 'частые ночные пробуждения', 'ранние утренние пробуждения'])],
      ['Дневное нарушение / неосвежающий сон', s => s.sleepSymptoms.includes('неосвежающий сон') || s.ess >= 10],
      ['Частота >= 3 ночей в неделю', () => false],
      ['Длительность >= 3 месяцев', () => false],
      ['Есть достаточная возможность и условия для сна', () => false]
    ],
    supportive: [
      ['ISI >= 8', s => s.isi >= 8]
    ],
    exclusions: [
      ['Дыхательные симптомы или STOP-Bang >= 3: сначала исключить ОАС как причину инсомнии', s => hasAny(s.breathingSymptoms, ['храп', 'остановки дыхания во сне', 'удушье или нехватка воздуха ночью']) || s.stopbang >= 3],
      ['Нерегулярный график сна: исключить циркадное нарушение как основное объяснение', s => hasSleepVariability(s)],
      ['REM-феномены или катаплексия: исключить гиперсомнию/нарколептический спектр', s => hasAny(s.hypersomniaSymptoms, ['катаплексия', 'сонный паралич', 'гипнагогические феномены'])]
    ],
    confirm: ['Оценить тревогу/депрессию, боль, соматические причины, препараты и вещества как возможные причины инсомнии'],
    clarify: ['частота >= 3 ночей в неделю', 'длительность >= 3 месяцев', 'условия сна достаточны', 'исключить вторичную инсомнию']
  },
  {
    code: 'G47.3',
    name: 'Риск / подозрение на обструктивное апноэ сна',
    status: 'скрининг; диагноз требует КРМ или ПСГ',
    required: [
      ['Храп / остановки дыхания', s => hasAny(s.breathingSymptoms, ['храп', 'остановки дыхания во сне'])],
      ['Дневная сонливость или утренние симптомы', s => s.sleepSymptoms.includes('выраженная дневная сонливость') || s.breathingSymptoms.includes('утренние головные боли')]
    ],
    supportive: [
      ['STOP-Bang >= 3', s => s.stopbang >= 3],
      ['ИМТ > 35 или окружность шеи > 40 см', s => Number(String(s.bmi).replace(',', '.')) > 35 || Number(s.neck || 0) > 40]
    ],
    exclusions: [
      ['Нет дыхательных симптомов и STOP-Bang < 3 по заполненным данным', s => !hasAny(s.breathingSymptoms, ['храп', 'остановки дыхания во сне', 'удушье или нехватка воздуха ночью']) && s.stopbang < 3],
      ['Дневная сонливость может объясняться недостаточным временем сна < 6 ч', s => parseSleepHours(s.totalSleep) > 0 && parseSleepHours(s.totalSleep) < 6]
    ],
    confirm: ['КРМ или полисомнография', 'AHI/REI/ODI и десатурации', 'Тип событий: обструктивные, центральные, смешанные'],
    clarify: ['показан КРМ или полисомнография', 'оценить ИМТ, окружность шеи, АГ', 'уточнить безопасность вождения']
  },
  {
    code: 'G25.8',
    name: 'Синдром беспокойных ног',
    status: 'критерии частично; требуется уточнить классические признаки RLS',
    required: [
      ['Неприятные ощущения в ногах вечером', s => s.movementSymptoms.includes('неприятные ощущения в ногах вечером')],
      ['Облегчение при движении', s => s.movementSymptoms.includes('облегчение при движении ногами')],
      ['Ухудшение в покое', () => false],
      ['Усиление вечером или ночью', s => s.movementSymptoms.includes('неприятные ощущения в ногах вечером')]
    ],
    supportive: [
      ['Нарушение сна', s => s.isi >= 8 || s.sleepSymptoms.length > 0]
    ],
    exclusions: [
      ['Нет сенсомоторных жалоб в ногах по заполненным данным', s => !hasAny(s.movementSymptoms, ['неприятные ощущения в ногах вечером', 'облегчение при движении ногами'])],
      ['Преобладают ночные эпизоды поведения: дифференцировать с парасомнией', s => s.parasomniaSymptoms.length > 0 && s.movementSymptoms.length === 0]
    ],
    confirm: ['Ферритин, железо, ОЖСС/трансферрин', 'Исключить судороги, нейропатию, акатизию, артралгию, отеки и лекарственные причины'],
    clarify: ['ухудшение в покое и вечером/ночью', 'ферритин, железо, ОЖСС', 'лекарственные и неврологические причины']
  },
  {
    code: 'G47.1',
    name: 'Гиперсомния',
    status: 'подозрение; диагноз исключения после оценки сна, ОАС и препаратов',
    required: [
      ['Дневная сонливость', s => s.sleepSymptoms.includes('выраженная дневная сонливость')],
      ['ESS >= 11', s => s.ess >= 11],
      ['Достаточная длительность ночного сна подтверждена', s => parseSleepHours(s.totalSleep) >= 7]
    ],
    supportive: [
      ['Сонливость сохраняется несмотря на регулярный график', s => !hasSleepVariability(s) && s.sleepSymptoms.includes('выраженная дневная сонливость')]
    ],
    exclusions: [
      ['Недостаточное общее время сна < 6 ч может объяснять сонливость', s => parseSleepHours(s.totalSleep) > 0 && parseSleepHours(s.totalSleep) < 6],
      ['STOP-Bang >= 3 или дыхательные симптомы: сначала исключить ОАС', s => s.stopbang >= 3 || hasAny(s.breathingSymptoms, ['храп', 'остановки дыхания во сне'])],
      ['Седативные/алкоголь могут объяснять сонливость', s => textHasAny(s.substances, ['седативные', 'снотворные', 'алкоголь'])]
    ],
    confirm: ['Дневник сна/актиграфия для исключения депривации сна', 'ПСГ для исключения ОАС и других нарушений сна', 'MSLT по показаниям'],
    clarify: ['достаточность ночного сна', 'исключить ОАС и депривацию сна', 'при показаниях ПСГ + MSLT']
  },
  {
    code: 'G47.4',
    name: 'Нарколепсия и катаплексия',
    status: 'подозрение; требуется ПСГ + MSLT или профильный сомнологический протокол',
    required: [
      ['Непреодолимая дневная сонливость / приступы сна', s => s.sleepSymptoms.includes('выраженная дневная сонливость') || s.ess >= 11],
      ['Катаплексия', s => s.hypersomniaSymptoms.includes('катаплексия')]
    ],
    supportive: [
      ['Сонный паралич', s => s.hypersomniaSymptoms.includes('сонный паралич')],
      ['Гипнагогические феномены', s => s.hypersomniaSymptoms.includes('гипнагогические феномены')]
    ],
    exclusions: [
      ['Недостаточное общее время сна < 6 ч может объяснять сонливость', s => parseSleepHours(s.totalSleep) > 0 && parseSleepHours(s.totalSleep) < 6],
      ['STOP-Bang >= 3 или дыхательные симптомы: сначала исключить ОАС', s => s.stopbang >= 3 || hasAny(s.breathingSymptoms, ['храп', 'остановки дыхания во сне'])],
      ['Седативные/алкоголь могут объяснять сонливость', s => textHasAny(s.substances, ['седативные', 'снотворные', 'алкоголь'])]
    ],
    confirm: ['Ночная ПСГ перед MSLT', 'MSLT: латентность сна и SOREMP', 'Исключить депривацию сна, ОАС, лекарства и вещества'],
    clarify: ['частота приступов сна', 'наличие катаплексии', 'сонный паралич/гипнагогические феномены', 'безопасность вождения']
  },
  {
    code: 'G47.2',
    name: 'Нарушение циркадного ритма сна',
    status: 'подозрение; требуется дневник сна или актиграфия',
    required: [
      ['Нерегулярный график / высокая вариабельность сна', s => hasSleepVariability(s)],
      ['Дневное нарушение', s => s.ess >= 10 || s.isi >= 8]
    ],
    supportive: [
      ['Смещение времени сна', s => !!s.bedtime && !!s.waketime]
    ],
    exclusions: [
      ['Дыхательные симптомы или STOP-Bang >= 3: исключить ОАС', s => hasAny(s.breathingSymptoms, ['храп', 'остановки дыхания во сне']) || s.stopbang >= 3],
      ['Седативные/стимуляторы/алкоголь могут объяснять нарушение графика', s => textHasAny(s.substances, ['седативные', 'снотворные', 'стимуляторы', 'алкоголь'])]
    ],
    confirm: ['Дневник сна минимум 2 недели', 'Актиграфия при возможности', 'Сопоставить фактический сон с социальным/рабочим графиком'],
    clarify: ['дневник сна 2 недели', 'актиграфия при возможности', 'световой режим и график работы']
  },
  {
    code: 'G47.5',
    name: 'Парасомния',
    status: 'подозрение; требуется типизация эпизодов и исключение RBD/эпилепсии',
    required: [
      ['Ночные эпизоды поведения', s => s.parasomniaSymptoms.length > 0],
      ['Клиническое описание эпизодов', s => s.sleepNotes.length > 0]
    ],
    supportive: [
      ['Двигательная активность / снохождение / кошмары', s => hasAny(s.parasomniaSymptoms, ['двигательная активность во сне', 'снохождение или ночные эпизоды поведения', 'кошмары'])]
    ],
    exclusions: [
      ['Алкоголь/седативные могут провоцировать эпизоды', s => textHasAny(s.substances, ['алкоголь', 'седативные', 'снотворные'])],
      ['Нужно исключить эпилептические приступы при стереотипных эпизодах/травмах', s => textHasAny(s.sleepNotes, ['стереотип', 'судорог', 'травм', 'прикус', 'мочеиспуск'])]
    ],
    confirm: ['Уточнить время эпизодов: первая или вторая половина ночи', 'Видео эпизодов от родственников при возможности', 'ПСГ с видео/ЭЭГ по показаниям'],
    clarify: ['время эпизодов: первая/вторая половина ночи', 'травмы и безопасность спальни', 'дифференцировать с эпилепсией и RBD']
  }
];

function el(id) {
  return document.getElementById(id);
}

function value(id) {
  const node = el(id);
  return node ? node.value.trim() : '';
}

function checkedValues(name) {
  return Array.from(document.querySelectorAll(`input[name="${name}"]:checked`)).map(item => item.value);
}

function hasAny(values, needles) {
  return needles.some(needle => values.includes(needle));
}

function textHasAny(text, needles) {
  const normalized = normalizeSearch(text || '');
  return needles.some(needle => normalized.includes(normalizeSearch(needle)));
}

function parseSleepHours(value) {
  if (!value) return 0;
  return Number(String(value).replace(',', '.')) || 0;
}

function hasSleepVariability(state) {
  return state.sleepSymptoms.includes('нерегулярный график сна')
    || Number(state.bedtimeVariability || 0) >= 60
    || Number(state.waketimeVariability || 0) >= 60
    || Number(state.sleepDurationVariability || 0) >= 90;
}

function createScaleItems() {
  const isi = el('isi-items');
  const ess = el('ess-items');
  const stopbang = el('stopbang-items');

  ISI_ITEMS.forEach((label, index) => {
    const row = document.createElement('div');
    row.className = 'scale-row';
    row.innerHTML = `<div>${index + 1}. ${label}</div><select data-scale="isi"><option value="" selected>—</option><option value="0">0 - нет</option><option value="1">1 - слабо</option><option value="2">2 - умеренно</option><option value="3">3 - значительно</option><option value="4">4 - выражено</option></select>`;
    isi.appendChild(row);
  });

  ESS_ITEMS.forEach((label, index) => {
    const row = document.createElement('div');
    row.className = 'scale-row';
    row.innerHTML = `<div>${index + 1}. ${label}</div><select data-scale="ess"><option value="" selected>—</option><option value="0">0 - не заснул бы</option><option value="1">1 - малая вероятность</option><option value="2">2 - умеренная вероятность</option><option value="3">3 - высокая вероятность</option></select>`;
    ess.appendChild(row);
  });

  STOPBANG_ITEMS.forEach(([code, label]) => {
    const row = document.createElement('div');
    row.className = 'stopbang-row';
    const derived = ' disabled';
    row.innerHTML = `<label><input type="checkbox" data-scale="stopbang" data-stopbang-code="${code}"${derived}> <strong>${code}</strong> ${label}${derived ? ' <small>(из данных формы)</small>' : ''}</label>`;
    stopbang.appendChild(row);
  });
}

function createTestsChecklist() {
  const container = el('tests-checklist');
  if (!container) return;

  TEST_OPTIONS.forEach(option => {
    const label = document.createElement('label');
    label.innerHTML = `<input type="checkbox" name="test_option" value="${escapeHtml(option.label)}" data-test-id="${escapeHtml(option.id)}"> <span>${escapeHtml(option.label)}</span>`;
    container.appendChild(label);
  });
}

function createRecommendationsChecklist() {
  const container = el('recommendations-checklist');
  if (!container) return;

  RECOMMENDATION_GROUPS.forEach(([groupId, groupLabel]) => {
    const options = RECOMMENDATION_OPTIONS.filter(option => option.group === groupId);
    if (!options.length) return;

    const group = document.createElement('div');
    group.className = 'recommendation-group';
    group.dataset.recommendationGroup = groupId;
    group.innerHTML = `
      <button type="button" class="recommendation-group-title" aria-expanded="false">
        <span>${escapeHtml(groupLabel)}</span>
        <span class="recommendation-group-count">0</span>
      </button>
      <div class="recommendation-group-body" hidden></div>
    `;
    const body = group.querySelector('.recommendation-group-body');
    const title = group.querySelector('.recommendation-group-title');
    title.addEventListener('click', () => {
      const isOpen = group.classList.toggle('open');
      title.setAttribute('aria-expanded', String(isOpen));
      body.hidden = !isOpen;
    });

    options.forEach(option => {
      const label = document.createElement('label');
      label.innerHTML = `<input type="checkbox" name="recommendation_option" value="${escapeHtml(option.label)}" data-rec-id="${escapeHtml(option.id)}" data-rec-group="${escapeHtml(option.group)}"> <span>${escapeHtml(option.label)}</span>`;
      body.appendChild(label);
    });

    container.appendChild(group);
  });
}

function createMedicationGroups() {
  const container = el('medication-groups');
  if (!container || container.children.length) return;
  MEDICATION_GROUPS.forEach((group, groupIndex) => {
    const details = document.createElement('details');
    details.className = 'medication-group';
    if (groupIndex === 0) details.open = true;
    details.innerHTML = `<summary>${escapeHtml(group.title)}</summary><div class="medication-table">
      <div class="medication-head">Класс / фактор</div><div class="medication-head">Препарат и доза</div><div class="medication-head">Время</div>
      ${group.items.map(([id, label, examples, effect]) => `<label class="medication-choice" title="${escapeHtml(effect)}"><input type="checkbox" name="substance_option" value="${escapeHtml(label)}" data-substance-id="${escapeHtml(id)}"><span><strong>${escapeHtml(label)}</strong><small>${escapeHtml(effect)}</small></span></label><input type="text" data-substance-amount="${escapeHtml(id)}" placeholder="${escapeHtml(examples)}"><input type="time" data-substance-time="${escapeHtml(id)}">`).join('')}
    </div>`;
    container.appendChild(details);
  });
}

function updateRecommendationGroupCounts() {
  document.querySelectorAll('.recommendation-group').forEach(group => {
    const checkedCount = group.querySelectorAll('input[name="recommendation_option"]:checked').length;
    const count = group.querySelector('.recommendation-group-count');
    if (count) count.textContent = String(checkedCount);
    group.classList.toggle('has-selected', checkedCount > 0);
  });
}

function normalizeSearch(text) {
  return String(text).toLowerCase().replace(/ё/g, 'е').trim();
}

function diagnosisMatches(option, query) {
  if (!query) return true;
  const haystack = normalizeSearch(`${option.code} ${option.name}`);
  return normalizeSearch(query).split(/\s+/).every(word => haystack.includes(word));
}

function renderDiagnosisResults(query) {
  const container = el('diagnosis_results');
  if (!container) return;

  const matches = DIAGNOSIS_OPTIONS
    .filter(option => diagnosisMatches(option, query))
    .slice(0, 12);

  container.innerHTML = '';

  if (!query || matches.length === 0) {
    container.classList.remove('open');
    return;
  }

  matches.forEach(option => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'diagnosis-option';
    button.innerHTML = `<span class="diagnosis-option-code">${escapeHtml(option.code)}</span><span class="diagnosis-option-name">${escapeHtml(option.name)}</span>`;
    button.addEventListener('mousedown', event => {
      event.preventDefault();
      selectDiagnosis(option);
    });
    container.appendChild(button);
  });

  container.classList.add('open');
}

function syncDiagnosisField() {
  const diagnosis = el('diagnosis');
  if (diagnosis) diagnosis.value = selectedDiagnoses.join('\n');
}

function renderSelectedDiagnoses() {
  const container = el('diagnosis_list');
  if (!container) return;

  container.innerHTML = '';
  if (!selectedDiagnoses.length) {
    const empty = document.createElement('div');
    empty.className = 'diagnosis-empty';
    empty.textContent = 'Диагнозы пока не добавлены';
    container.appendChild(empty);
    return;
  }

  selectedDiagnoses.forEach((diagnosisText, index) => {
    const item = document.createElement('div');
    item.className = 'diagnosis-item';

    const text = document.createElement('div');
    text.className = 'diagnosis-item-text';
    text.textContent = diagnosisText;

    const remove = document.createElement('button');
    remove.type = 'button';
    remove.className = 'diagnosis-delete';
    remove.textContent = 'Удалить';
    remove.addEventListener('click', () => removeDiagnosis(index));

    item.appendChild(text);
    item.appendChild(remove);
    container.appendChild(item);
  });
}

function addDiagnosisText(text) {
  const normalized = String(text).trim();
  if (!normalized) return false;

  const exists = selectedDiagnoses.some(item => normalizeSearch(item) === normalizeSearch(normalized));
  if (!exists) {
    selectedDiagnoses.push(normalized);
  }

  syncDiagnosisField();
  renderSelectedDiagnoses();
  return !exists;
}

function removeDiagnosis(index) {
  selectedDiagnoses = selectedDiagnoses.filter((_, itemIndex) => itemIndex !== index);
  syncDiagnosisField();
  renderSelectedDiagnoses();
}

function selectDiagnosis(option) {
  const entry = `${option.code} ${option.name}`;
  const search = el('diagnosis_search');
  addDiagnosisText(entry);
  if (search) search.value = '';
  const results = el('diagnosis_results');
  if (results) results.classList.remove('open');
  applyTestsForDiagnosis(option.code);
  applyRecommendationsForDiagnosis(option.code);
}

function applyTestsForDiagnosis(code) {
  document.querySelectorAll('input[name="test_option"]').forEach(checkbox => {
    const option = TEST_OPTIONS.find(item => item.id === checkbox.dataset.testId);
    if (option && option.tags.includes(code)) {
      checkbox.checked = true;
    }
  });
}

function applyRecommendationsForDiagnosis(code) {
  document.querySelectorAll('input[name="recommendation_option"]').forEach(checkbox => {
    const option = RECOMMENDATION_OPTIONS.find(item => item.id === checkbox.dataset.recId);
    if (option && option.tags.includes(code)) {
      checkbox.checked = true;
    }
  });
  updateRecommendationGroupCounts();
}

function collectTestsItems() {
  const selected = Array.from(document.querySelectorAll('input[name="test_option"]:checked'))
    .map(checkbox => checkbox.value);
  const extra = value('tests_extra');
  if (extra) selected.push(extra);
  return selected;
}

function collectTestsText() {
  return collectTestsItems().join('; ');
}

function collectComorbidityText() {
  const selected = Array.from(document.querySelectorAll('input[name="comorbidity_option"]:checked'))
    .map(checkbox => checkbox.value);
  const extra = value('comorbidity_extra');
  if (extra) selected.push(extra);
  return selected.join('; ');
}

function collectSubstancesText() {
  const parts = Array.from(document.querySelectorAll('input[name="substance_option"]:checked'))
    .map(checkbox => {
      const id = checkbox.dataset.substanceId;
      const amount = document.querySelector(`[data-substance-amount="${id}"]`)?.value.trim() || '';
      const time = document.querySelector(`[data-substance-time="${id}"]`)?.value.trim() || '';
      const details = [];
      if (amount) details.push(amount);
      if (time) details.push(`время приёма ${time}`);
      return details.length ? `${checkbox.value} (${details.join(', ')})` : checkbox.value;
    });
  const extra = value('substances_extra');
  if (extra) parts.push(extra);
  return parts.join('; ');
}

function collectRecommendationsItems() {
  const selected = Array.from(document.querySelectorAll('input[name="recommendation_option"]:checked'))
    .map(checkbox => ({
      id: checkbox.dataset.recId || '',
      label: checkbox.value,
      group: checkbox.dataset.recGroup || 'other'
    }));
  const extra = value('recommendations_extra');
  if (extra) selected.push({ label: extra, group: 'other' });
  return selected;
}

function collectRecommendationsText() {
  return collectRecommendationsItems().map(item => item.label).join('; ');
}

function sumScale(name) {
  return Array.from(document.querySelectorAll(`[data-scale="${name}"]`)).reduce((sum, node) => {
    if (node.type === 'checkbox') return sum + (node.checked ? 1 : 0);
    return sum + Number(node.value || 0);
  }, 0);
}

function updateScores() {
  updateBmi();
  updateNeckStopBang();
  updateDemographicStopBang();
  updateTotalSleepV2();
  el('isi-score').textContent = String(sumScale('isi'));
  el('ess-score').textContent = String(sumScale('ess'));
  el('stopbang-score').textContent = String(sumScale('stopbang'));
  updateScaleCompletion();
}

function updateScaleCompletion() {
  [['isi', 7], ['ess', 8]].forEach(([name, total]) => {
    const done = Array.from(document.querySelectorAll(`select[data-scale="${name}"]`)).filter(node => node.value !== '').length;
    const badge = el(`${name}-completion`);
    if (badge) badge.textContent = `${done}/${total}${done === total ? ' · заполнено' : ''}`;
  });
  const stop = el('stopbang-completion');
  if (stop) stop.textContent = value('age') && value('sex') && value('neck') && value('bmi') ? 'исходные данные заполнены' : 'уточните возраст, пол, ИМТ и шею';
}

function numericValue(id) {
  const raw = value(id).replace(',', '.');
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : null;
}

function updateBmi() {
  const heightCm = numericValue('height_cm');
  const weightKg = numericValue('weight_kg');
  const bmiField = el('bmi');
  const bmiCheckbox = document.querySelector('[data-stopbang-code="B"]');

  if (!bmiField) return null;

  if (!heightCm || !weightKg || heightCm <= 0 || weightKg <= 0) {
    bmiField.value = '';
    updateBmiLabel(null);
    if (bmiCheckbox) bmiCheckbox.checked = false;
    return null;
  }

  const heightM = heightCm / 100;
  const bmi = weightKg / (heightM * heightM);
  const rounded = Math.round(bmi * 10) / 10;
  bmiField.value = String(rounded).replace('.', ',');
  updateBmiLabel(rounded);

  if (bmiCheckbox) {
    bmiCheckbox.checked = rounded > 35;
  }

  return rounded;
}

function getBmiCategory(bmi) {
  if (bmi < 16) {
    return { label: 'выраженный дефицит массы тела', className: 'bmi-label--underweight', valueClassName: 'bmi-value--underweight' };
  }
  if (bmi < 18.5) {
    return { label: 'дефицит массы тела', className: 'bmi-label--underweight', valueClassName: 'bmi-value--underweight' };
  }
  if (bmi < 25) {
    return { label: 'норма', className: 'bmi-label--normal', valueClassName: 'bmi-value--normal' };
  }
  if (bmi < 30) {
    return { label: 'избыточная масса тела (предожирение)', className: 'bmi-label--overweight', valueClassName: 'bmi-value--overweight' };
  }
  if (bmi < 35) {
    return { label: 'ожирение I степени', className: 'bmi-label--obesity', valueClassName: 'bmi-value--obesity' };
  }
  if (bmi < 40) {
    return { label: 'ожирение II степени', className: 'bmi-label--obesity', valueClassName: 'bmi-value--obesity' };
  }
  return { label: 'ожирение III степени', className: 'bmi-label--obesity', valueClassName: 'bmi-value--obesity' };
}

function updateBmiLabel(bmi) {
  const bmiLabel = el('bmi_label');
  const bmiField = el('bmi');
  if (!bmiLabel) return;

  bmiLabel.className = 'bmi-label';
  if (bmiField) {
    bmiField.classList.remove('bmi-value--underweight', 'bmi-value--normal', 'bmi-value--overweight', 'bmi-value--obesity');
  }

  if (bmi === null || bmi === undefined) {
    bmiLabel.textContent = '';
    return;
  }

  const category = getBmiCategory(bmi);
  bmiLabel.textContent = category.label;
  bmiLabel.classList.add(category.className);
  if (bmiField) {
    bmiField.classList.add(category.valueClassName);
  }
}

function updateNeckStopBang() {
  const neckCm = numericValue('neck');
  const neckCheckbox = document.querySelector('[data-stopbang-code="N"]');

  if (!neckCheckbox) return;

  neckCheckbox.checked = !!(neckCm && neckCm > 40);
}

function timeToMinutes(time) {
  if (!time || !time.includes(':')) return null;
  const parts = time.split(':').map(Number);
  if (parts.length < 2 || !Number.isFinite(parts[0]) || !Number.isFinite(parts[1])) return null;
  return parts[0] * 60 + parts[1];
}

function updateTotalSleep() {
  const totalField = el('total_sleep');
  const efficiencyField = el('sleep_efficiency');
  if (!totalField) return null;

  const bedtime = timeToMinutes(value('bedtime'));
  const waketime = timeToMinutes(value('waketime'));

  if (bedtime === null || waketime === null) {
    totalField.value = '';
    if (efficiencyField) efficiencyField.value = '';
    return null;
  }

  let timeInBed = waketime - bedtime;
  if (timeInBed <= 0) timeInBed += 24 * 60;

  const latency = numericValue('latency') || 0;
  const awakenings = numericValue('awakenings') || 0;
  const awakeningDuration = numericValue('awakening_duration') || 0;
  const wakeAfterSleepOnset = awakenings * awakeningDuration;
  const sleepMinutes = Math.max(0, timeInBed - latency - wakeAfterSleepOnset);
  const sleepHours = Math.round((sleepMinutes / 60) * 10) / 10;
  const sleepEfficiency = timeInBed > 0 ? Math.round((sleepMinutes / timeInBed) * 100) : 0;

  totalField.value = String(sleepHours).replace('.', ',');
  if (efficiencyField) efficiencyField.value = String(sleepEfficiency);
  return sleepHours;
}

function updateTotalSleepV2() {
  const totalField = el('total_sleep');
  const efficiencyField = el('sleep_efficiency');
  const timeInBedField = el('time_in_bed');
  const warning = el('sleep_calculation_warning');
  if (!totalField) return null;
  const bedtime = timeToMinutes(value('sleep_attempt') || value('bedtime'));
  const waketime = timeToMinutes(value('waketime'));
  if (bedtime === null || waketime === null) {
    totalField.value = '';
    if (efficiencyField) efficiencyField.value = '';
    if (timeInBedField) timeInBedField.value = '';
    if (warning) warning.textContent = 'Для расчёта заполните попытку уснуть/укладывание и подъём.';
    return null;
  }
  let timeInBed = waketime - bedtime;
  if (timeInBed <= 0) timeInBed += 1440;
  const latency = numericValue('latency') || 0;
  const waso = numericValue('waso') || 0;
  const sleepMinutes = Math.max(0, timeInBed - latency - waso);
  const sleepHours = Math.round(sleepMinutes / 6) / 10;
  const efficiency = Math.round(sleepMinutes / timeInBed * 100);
  totalField.value = String(sleepHours).replace('.', ',');
  if (efficiencyField) efficiencyField.value = String(efficiency);
  if (timeInBedField) timeInBedField.value = String(Math.round(timeInBed / 6) / 10).replace('.', ',');
  const invalid = timeInBed > 960 || latency + waso > timeInBed;
  if (warning) warning.textContent = invalid ? 'Проверьте значения: интервалы выглядят противоречиво.' : '';
  return sleepHours;
}

function updateDemographicStopBang() {
  const ageCheckbox = document.querySelector('[data-stopbang-code="A"]');
  const sexCheckbox = document.querySelector('[data-stopbang-code="G"]');
  const pressureCheckbox = document.querySelector('[data-stopbang-code="P"]');
  const snoreCheckbox = document.querySelector('[data-stopbang-code="S"]');
  const tiredCheckbox = document.querySelector('[data-stopbang-code="T"]');
  const observedCheckbox = document.querySelector('[data-stopbang-code="O"]');
  if (ageCheckbox) ageCheckbox.checked = (numericValue('age') || 0) > 50;
  if (sexCheckbox) sexCheckbox.checked = value('sex') === 'male';
  if (pressureCheckbox) pressureCheckbox.checked = checkedValues('comorbidity_option').some(item => item.includes('артериальная гипертензия'));
  if (snoreCheckbox) snoreCheckbox.checked = hasAny(checkedValues('breathing_symptom'), ['громкий храп', 'храп почти каждую ночь']);
  if (tiredCheckbox) tiredCheckbox.checked = checkedValues('sleep_symptom').includes('выраженная дневная сонливость') || sumScale('ess') > 10;
  if (observedCheckbox) observedCheckbox.checked = checkedValues('breathing_symptom').includes('остановки дыхания во сне');
}

function collectState() {
  return {
    age: value('age'), sex: value('sex'), workSchedule: value('work_schedule'), nightShifts: value('night_shifts'),
    complaintDuration: value('complaint_duration'), complaintFrequency: value('complaint_frequency'),
    sleepOpportunity: !!el('sleep_opportunity')?.checked, sleepConditions: !!el('sleep_conditions')?.checked,
    complaints: value('complaints'),
    history: value('history'),
    previousSleepCare: value('previous_sleep_care'), bedPartnerReport: value('bed_partner_report'), familyHistory: value('family_history'),
    safetyFlags: checkedValues('safety_flag'), safetyNotes: value('safety_notes'),
    comorbidity: collectComorbidityText(),
    substances: collectSubstancesText(),
    heightCm: value('height_cm'),
    weightKg: value('weight_kg'),
    bmi: value('bmi'),
    neck: value('neck'),
    bedtime: value('bedtime'),
    eveningSleepiness: value('evening_sleepiness'),
    sleepAttempt: value('sleep_attempt'), finalWake: value('final_wake'),
    waketime: value('waketime'),
    freeBedtime: value('free_bedtime'), freeSleepAttempt: value('free_sleep_attempt'), freeFinalWake: value('free_final_wake'), freeWaketime: value('free_waketime'), freeNapMinutes: value('free_nap_minutes'),
    latency: value('latency'),
    awakenings: value('awakenings'),
    awakeningDuration: value('waso'), waso: value('waso'), timeInBed: value('time_in_bed'),
    totalSleep: value('total_sleep'),
    sleepEfficiency: value('sleep_efficiency'),
    napMinutes: value('nap_minutes'),
    bedtimeVariability: value('bedtime_variability'),
    waketimeVariability: value('waketime_variability'),
    sleepDurationVariability: value('sleep_duration_variability'),
    sleepSymptoms: checkedValues('sleep_symptom'),
    dayImpairments: checkedValues('day_impairment'),
    breathingSymptoms: checkedValues('breathing_symptom'),
    movementSymptoms: checkedValues('movement_symptom'),
    rlsMimics: checkedValues('rls_mimic'),
    rlsKidneyDisease: value('rls_kidney_disease'), rlsPregnancy: value('rls_pregnancy'), rlsBloodLoss: value('rls_blood_loss'),
    rlsFamilyHistory: value('rls_family_history'), rlsIronResults: value('rls_iron_results'),
    parasomniaSymptoms: checkedValues('parasomnia_symptom'),
    hypersomniaSymptoms: checkedValues('hypersomnia_symptom'),
    sleepNotes: value('sleep_notes'),
    circadianPattern: document.querySelector('input[name="circadian_pattern"]:checked')?.value || '',
    preferredBedtime: value('preferred_bedtime'), preferredWaketime: value('preferred_waketime'), freeScheduleSleep: value('free_schedule_sleep'), morningLightMinutes: value('morning_light_minutes'),
    episodeTiming: value('episode_timing'), episodeOnsetAge: value('episode_onset_age'), episodeFrequency: value('episode_frequency'),
    episodeDuration: value('episode_duration'), episodeRecall: value('episode_recall'), episodeStereotypy: value('episode_stereotypy'),
    parasomniaSafetyPlan: value('parasomnia_safety_plan'),
    sleepDiaryPatientName: value('sleep_diary_patient_name'), sleepDiaryStartDate: value('sleep_diary_start_date'),
    diarySummary: el('sleep_diary_summary')?.dataset.report || '',
    isi: sumScale('isi'),
    ess: sumScale('ess'),
    stopbang: sumScale('stopbang'),
    diagnosis: value('diagnosis'), diagnosisStatus: value('diagnosis_status'), diagnosisBasis: value('diagnosis_basis'),
    advisorClarifications: collectAdvisorClarificationsText(),
    recommendations: collectRecommendationsText(),
    recommendationItems: collectRecommendationsItems(),
    tests: collectTestsText(),
    testItems: collectTestsItems(),
    treatment: value('treatment'),
    sleepStudyType: value('sleep_study_type'), sleepStudyDate: value('sleep_study_date'), sleepStudyRationale: value('sleep_study_rationale'),
    sleepStudyQuality: value('sleep_study_quality'), studyAhiRei: value('study_ahi_rei'), studyOdi: value('study_odi'),
    studyMinSpo2: value('study_min_spo2'), studyT90: value('study_t90'), studyPositionRem: value('study_position_rem'),
    msltPriorPsg: !!el('mslt_prior_psg')?.checked, msltSleepLog: !!el('mslt_sleep_log')?.checked,
    msltMedicationReview: !!el('mslt_medication_review')?.checked, msltSufficientSleep: !!el('mslt_sufficient_sleep')?.checked,
    msltPreparationNotes: value('mslt_preparation_notes')
  };
}

function classifyIsi(score) {
  if (score >= 22) return 'тяжелая инсомния';
  if (score >= 15) return 'умеренная инсомния';
  if (score >= 8) return 'субпороговая инсомния';
  return 'клинически значимой инсомнии по ISI не выявлено';
}

function classifyEss(score) {
  if (score >= 16) return 'выраженная дневная сонливость';
  if (score >= 11) return 'повышенная дневная сонливость';
  return 'значимой дневной сонливости по ESS не выявлено';
}

function classifyStopBang(score) {
  const codes = checkedStopBangCodes();
  const stopCore = ['S', 'T', 'O', 'P'].filter(code => codes.includes(code)).length;
  const enhancedHigh = stopCore >= 2 && ['B', 'N', 'G'].some(code => codes.includes(code));
  if (score >= 5 || enhancedHigh) return 'высокий риск ОАС';
  if (score >= 3) return 'промежуточный риск ОАС';
  return 'низкий риск ОАС';
}

function legacyRunAdvisor() {
  const state = collectState();
  const results = ADVISOR_RULES.map(rule => {
    const requiredMet = rule.required.filter(([, fn]) => fn(state)).map(([label]) => label);
    const requiredMissing = rule.required.filter(([, fn]) => !fn(state)).map(([label]) => label);
    const supportiveMet = (rule.supportive || []).filter(([, fn]) => fn(state)).map(([label]) => label);
    const exclusions = (rule.exclusions || []).filter(([, fn]) => fn(state)).map(([label]) => label);
    return { ...rule, requiredMet, requiredMissing, supportiveMet, exclusions };
  }).filter(result => result.requiredMet.length > 0 || result.supportiveMet.length > 0)
    .sort((a, b) => {
      if (b.requiredMet.length !== a.requiredMet.length) return b.requiredMet.length - a.requiredMet.length;
      if (b.supportiveMet.length !== a.supportiveMet.length) return b.supportiveMet.length - a.supportiveMet.length;
      return a.exclusions.length - b.exclusions.length;
    });

  renderAdvisor(results);
  const hint = el('advisor-hint');
  const now = new Date();
  hint.textContent = `Обновлено ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  return results;
}

function legacyRenderAdvisor(results) {
  const container = el('advisor-results');
  container.innerHTML = '';
  if (!results.length) {
    const empty = document.createElement('p');
    empty.className = 'hint';
    empty.textContent = 'Недостаточно данных для клинической гипотезы. Заполните профиль сна и шкалы.';
    container.appendChild(empty);
    return;
  }

  results.forEach(result => {
    const card = document.createElement('div');
    card.className = `advisor-card ${result.requiredMet.length >= 2 && !result.exclusions.length ? 'high' : 'mid'}`;
    card.dataset.code = result.code;
    card.dataset.name = result.name;
    const requiredItems = result.requiredMet.length
      ? result.requiredMet.map(item => `<li>${escapeHtml(item)}</li>`).join('')
      : '<li class="advisor-muted">нет совпадений</li>';
    const supportiveItems = result.supportiveMet.length
      ? result.supportiveMet.map(item => `<li>${escapeHtml(item)}</li>`).join('')
      : '<li class="advisor-muted">нет поддерживающих признаков</li>';
    const missingItems = result.requiredMissing.length
      ? result.requiredMissing.map(item => `<li>${escapeHtml(item)}</li>`).join('')
      : '<li class="advisor-muted">ключевые критерии заполнены</li>';
    const exclusionItems = result.exclusions.length
      ? result.exclusions.map(item => `<li>${escapeHtml(item)}</li>`).join('')
      : '<li class="advisor-muted">по заполненным данным не выявлены</li>';
    const confirmItems = (result.confirm || []).length
      ? result.confirm.map(item => `<li>${escapeHtml(item)}</li>`).join('')
      : '<li class="advisor-muted">не требуется</li>';
    const clarifyItems = result.clarify.map((item, index) => `
      <label class="advisor-clarify-item">
        <input type="checkbox" class="advisor-clarify-check">
        <span class="advisor-clarify-text">${escapeHtml(item)}</span>
        <input type="text" class="advisor-clarify-note" placeholder="уточнение" data-clarify-index="${index}">
      </label>
    `).join('');
    card.innerHTML = `
      <div class="advisor-title">
        <span>${result.code} ${escapeHtml(result.name)}</span>
        <span class="advisor-score">${result.requiredMet.length}/${result.required.length}</span>
      </div>
      <div class="advisor-status">${escapeHtml(result.status)}</div>
      <div class="advisor-criteria">
        <div class="advisor-criteria-block advisor-criteria-met">
          <strong>Обязательные критерии:</strong><ul>${requiredItems}</ul>
        </div>
        <div class="advisor-criteria-block advisor-criteria-supportive">
          <strong>Поддерживающие признаки:</strong><ul>${supportiveItems}</ul>
        </div>
        <div class="advisor-criteria-block advisor-criteria-missing">
          <strong>Не хватает:</strong><ul>${missingItems}</ul>
        </div>
        <div class="advisor-criteria-block advisor-criteria-exclusion">
          <strong>Против / исключить:</strong><ul>${exclusionItems}</ul>
        </div>
        <div class="advisor-criteria-block advisor-criteria-confirm">
          <strong>Подтверждение / обследования:</strong><ul>${confirmItems}</ul>
        </div>
      </div>
      <strong>Уточнить:</strong><div class="advisor-clarify-list">${clarifyItems}</div>
      <div class="advisor-actions"></div>
    `;
    container.appendChild(card);
  });
}

const ROUTER_RULES = [
  {
    id: 'insomnia', title: 'Инсомнический синдром', anchor: 'complaint_frequency',
    trigger: s => hasAny(s.sleepSymptoms, ['трудности засыпания', 'частые ночные пробуждения', 'ранние утренние пробуждения']) || s.isi >= 8,
    complete: s => Number(s.complaintFrequency) >= 3 && s.complaintDuration === 'ge_3m' && s.sleepOpportunity && s.sleepConditions && s.dayImpairments.length > 0,
    missing: s => [[!s.complaintFrequency, 'частоту жалоб', 'complaint_frequency'], [!s.complaintDuration, 'длительность жалоб', 'complaint_duration'], [!s.sleepOpportunity, 'достаточную возможность для сна', 'sleep_opportunity'], [!s.sleepConditions, 'условия для сна', 'sleep_conditions'], [!s.dayImpairments.length, 'дневные последствия', 'sleep']],
    alternatives: s => [s.stopbang >= 3 || s.breathingSymptoms.length ? 'Возможна коморбидная OSA (COMISA)' : '', s.circadianPattern ? 'Возможен циркадный компонент' : '', textHasAny(s.substances, ['стимуляторы', 'седативные', 'алкоголь']) ? 'Оценить влияние веществ/лекарств' : ''].filter(Boolean),
    redFlags: () => [], tests: ['sleep_diary'], recs: ['sleep_diary', 'stimulus_control', 'cbti']
  },
  {
    id: 'osa', title: 'Нарушение дыхания во сне / риск OSA', anchor: 'breathing_symptom',
    trigger: s => s.stopbang >= 3 || s.breathingSymptoms.length > 0,
    complete: s => s.stopbang >= 3 && hasAny(s.breathingSymptoms, ['громкий храп', 'остановки дыхания во сне', 'удушье или нехватка воздуха ночью']),
    missing: s => [[!s.age, 'возраст', 'age'], [!s.sex, 'пол', 'sex'], [!s.neck, 'окружность шеи', 'neck'], [!s.bedPartnerReport, 'сведения свидетеля', 'bed_partner_report']],
    alternatives: s => [parseSleepHours(s.totalSleep) > 0 && parseSleepHours(s.totalSleep) < 7 ? 'Недостаточный сон также может объяснять сонливость' : ''].filter(Boolean),
    redFlags: s => s.safetyFlags.filter(item => /рул|ДТП|удушье|груди|синкопе|одышка/.test(item)), tests: ['resp_monitoring'], recs: ['osa_position']
  },
  {
    id: 'rls', title: 'Сенсомоторный синдром / возможный RLS', anchor: 'sleep',
    trigger: s => s.movementSymptoms.length > 0,
    complete: s => ['императивное желание двигать ногами', 'начало или усиление в покое', 'облегчение при движении ногами', 'усиление вечером или ночью'].every(item => s.movementSymptoms.includes(item)) && !s.rlsMimics.length,
    missing: s => [['императивное желание двигать ногами', 'желание двигать ногами'], ['начало или усиление в покое', 'усиление в покое'], ['облегчение при движении ногами', 'облегчение движением'], ['усиление вечером или ночью', 'вечернее усиление']].filter(([key]) => !s.movementSymptoms.includes(key)).map(([, label]) => [true, label, 'sleep']),
    alternatives: s => s.rlsMimics.map(item => `Имитатор RLS: ${item}`), redFlags: () => [], tests: ['ferritin', 'cbc'], recs: ['rls_iron', 'rls_behavior']
  },
  {
    id: 'hypersomnia', title: 'Центральная гиперсомнолентность', anchor: 'sleep',
    trigger: s => s.ess >= 11 || hasAny(s.hypersomniaSymptoms, ['непреодолимые приступы сна', 'катаплексия', 'тяжёлая инерция сна', 'сон более 10 часов']),
    complete: s => s.ess >= 11 && (s.sleepOpportunity || parseSleepHours(s.totalSleep) >= 7) && !!s.diarySummary,
    missing: s => [[!s.diarySummary, '14-дневный дневник для подтверждения достаточного сна', 'sleep_diary_body'], [!s.previousSleepCare, 'препараты и предшествующие исследования', 'previous_sleep_care']],
    alternatives: s => [s.stopbang >= 3 ? 'Сначала исключить OSA' : '', parseSleepHours(s.totalSleep) > 0 && parseSleepHours(s.totalSleep) < 7 ? 'Вероятен недостаточный сон' : '', textHasAny(s.substances, ['седативные', 'алкоголь']) ? 'Возможна лекарственная/вещественная сонливость' : ''].filter(Boolean),
    redFlags: s => s.safetyFlags.filter(item => /рул|ДТП|опасная работа/.test(item)), tests: ['sleep_diary', 'psg', 'mslt'], recs: ['hypersomnia_safety', 'hypersomnia_schedule']
  },
  {
    id: 'circadian', title: 'Циркадное нарушение сна-бодрствования', anchor: 'preferred_bedtime',
    trigger: s => !!s.circadianPattern || s.workSchedule.includes('сменный') || Number(s.nightShifts) > 0,
    complete: s => !!s.circadianPattern && !!s.preferredBedtime && !!s.preferredWaketime && !!s.diarySummary,
    missing: s => [[!s.preferredBedtime, 'желаемое время засыпания', 'preferred_bedtime'], [!s.preferredWaketime, 'желаемое время подъёма', 'preferred_waketime'], [!s.diarySummary, 'дневник сна', 'sleep_diary_body']],
    alternatives: () => [], redFlags: s => s.safetyFlags.filter(item => /рул|ДТП|опасная работа/.test(item)), tests: ['sleep_diary', 'actigraphy'], recs: ['circadian_light', 'circadian_shift']
  },
  {
    id: 'parasomnia', title: 'Ночные эпизоды / парасомния', anchor: 'sleep_notes',
    trigger: s => s.parasomniaSymptoms.length > 0,
    complete: s => !!s.sleepNotes,
    missing: s => [[!s.sleepNotes, 'клиническое описание эпизодов', 'sleep_notes']],
    alternatives: s => [s.parasomniaSymptoms.some(item => item.includes('эпилеп')) ? 'Требуется дифференциация с ночной эпилепсией' : '', s.parasomniaSymptoms.some(item => item.includes('RBD')) ? 'Подозрение на RBD: оценить неврологический статус' : ''].filter(Boolean),
    redFlags: s => s.safetyFlags.filter(item => /травм/.test(item)), tests: ['video', 'psg', 'neurology'], recs: ['parasomnia_safety', 'parasomnia_triggers']
  }
];

let lastRouterResults = [];

function evaluateRouter(state) {
  const globalFlags = state.safetyFlags || [];
  const results = ROUTER_RULES.filter(rule => rule.trigger(state)).map(rule => {
    const missing = rule.missing(state).filter(([condition]) => condition).map(([, label, id]) => ({ label, id }));
    const redFlags = rule.redFlags(state);
    let status = rule.complete(state) ? 'есть скрининговый сигнал' : 'требуется приоритетное уточнение';
    if (redFlags.length || globalFlags.some(item => /груди|синкопе/.test(item))) status = 'красный флаг';
    let tests = [...rule.tests];
    if (rule.id === 'hypersomnia' && !(state.diarySummary && state.previousSleepCare && parseSleepHours(state.totalSleep) >= 7 && state.stopbang < 3)) tests = tests.filter(id => id !== 'mslt');
    if (rule.id === 'osa' && textHasAny(state.comorbidity, ['сердечная недостаточность', 'ХОБЛ', 'инсульт'])) tests = ['psg'];
    if (rule.id === 'rls' && state.movementSymptoms.length < 3) tests = [];
    return { ...rule, tests, status, missing, alternatives: rule.alternatives(state), redFlags };
  });
  if (globalFlags.length && !results.some(item => item.redFlags.length)) {
    results.unshift({ id: 'safety', title: 'Безопасность сна', status: 'красный флаг', missing: [], alternatives: [], redFlags: globalFlags, tests: [], recs: [], anchor: 'safety_notes' });
  }
  return results;
}

function runAdvisor() {
  lastRouterResults = evaluateRouter(collectState());
  renderRouter(lastRouterResults);
  const now = new Date();
  el('advisor-hint').textContent = `Обновлено ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}. Советник не изменил диагноз или план.`;
  return lastRouterResults;
}

function listHtml(items, empty) {
  return items.length ? items.map(item => `<li>${escapeHtml(item)}</li>`).join('') : `<li class="advisor-muted">${empty}</li>`;
}

function renderRouter(results) {
  const container = el('advisor-results');
  container.innerHTML = '';
  if (!results.length) {
    container.innerHTML = '<p class="hint">Недостаточно данных для синдромного сигнала. Заполните профиль сна и шкалы.</p>';
    return;
  }
  results.forEach(result => {
    const card = document.createElement('div');
    card.className = `advisor-card route-${result.status.replaceAll(' ', '-')}`;
    card.dataset.routeId = result.id;
    card.innerHTML = `<div class="advisor-title"><span>${escapeHtml(result.title)}</span><span class="advisor-status">${escapeHtml(result.status)}</span></div>
      <div class="advisor-criteria">
        <div><strong>Не хватает:</strong><ul>${result.missing.length ? result.missing.map(item => `<li><button type="button" class="link-button advisor-goto" data-target="${item.id}">${escapeHtml(item.label)}</button></li>`).join('') : '<li class="advisor-muted">минимальные данные собраны</li>'}</ul></div>
        <div><strong>Альтернативы / коморбидность:</strong><ul>${listHtml(result.alternatives, 'не выявлены по заполненным данным')}</ul></div>
        <div><strong>Красные флаги:</strong><ul>${listHtml(result.redFlags, 'не выявлены')}</ul></div>
        <div><strong>Подтверждение:</strong><ul>${listHtml(result.tests.map(id => TEST_OPTIONS.find(item => item.id === id)?.label).filter(Boolean), 'не требуется')}</ul></div>
      </div><div class="advisor-actions">${result.tests.length || result.recs.length ? '<button type="button" class="advisor-apply-plan">Добавить предложенный план</button>' : ''}</div>`;
    card.querySelectorAll('.advisor-goto').forEach(button => button.addEventListener('click', () => focusClinicalField(button.dataset.target)));
    card.querySelector('.advisor-apply-plan')?.addEventListener('click', () => applyRouterPlan(result, card));
    container.appendChild(card);
  });
}

function focusClinicalField(id) {
  const node = el(id) || document.querySelector(`[name="${id}"]`);
  if (!node) return;
  node.scrollIntoView({ behavior: 'smooth', block: 'center' });
  node.focus?.();
  node.closest('details')?.setAttribute('open', '');
}

function applyRouterPlan(result, card) {
  result.tests.forEach(id => { const input = document.querySelector(`[data-test-id="${id}"]`); if (input) input.checked = true; });
  result.recs.forEach(id => { const input = document.querySelector(`[data-rec-id="${id}"]`); if (input) input.checked = true; });
  updateRecommendationGroupCounts();
  const button = card.querySelector('.advisor-apply-plan');
  button.textContent = 'План добавлен'; button.disabled = true;
}

function collectAdvisorClarificationsFromCard(card) {
  return Array.from(card.querySelectorAll('.advisor-clarify-item'))
    .filter(item => item.querySelector('.advisor-clarify-check')?.checked)
    .map(item => {
      const label = item.querySelector('.advisor-clarify-text')?.textContent.trim() || '';
      const note = item.querySelector('.advisor-clarify-note')?.value.trim() || '';
      return note ? `${label}: ${note}` : label;
    })
    .filter(Boolean);
}

function collectAdvisorClarificationsText() {
  const parts = [];
  document.querySelectorAll('.advisor-card').forEach(card => {
    const clarifications = collectAdvisorClarificationsFromCard(card);
    if (clarifications.length) {
      parts.push(`${card.dataset.code} ${card.dataset.name}: ${clarifications.join('; ')}`);
    }
  });
  return parts.join('; ');
}

function addAdvisorDiagnosis(card) {
  const base = `${card.dataset.code} ${card.dataset.name}`;
  const search = el('diagnosis_search');
  addDiagnosisText(base);
  if (search) search.value = '';
  applyTestsForDiagnosis(card.dataset.code);
  applyRecommendationsForDiagnosis(card.dataset.code);
}

function escapeHtml(text) {
  return String(text).replace(/[&<>"']/g, char => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  }[char]));
}

function line(label, text) {
  return text ? `<strong>${label}:</strong> ${escapeHtml(text)}<br>` : '';
}

function multilineLine(label, text) {
  return text ? `<strong>${label}:</strong><br>${escapeHtml(text).replace(/\n/g, '<br>')}<br>` : '';
}

function numberedList(label, items) {
  if (!items.length) return '';
  const list = items.map(item => `<li>${escapeHtml(item)}</li>`).join('');
  return `<strong>${label}:</strong><ol>${list}</ol>`;
}

function groupedRecommendationList(items) {
  if (!items.length) return '';

  const sections = RECOMMENDATION_GROUPS.map(([groupId, groupLabel]) => {
    const groupItems = items.filter(item => item.group === groupId);
    if (!groupItems.length) return '';
    const list = groupItems.map(item => `<li>${escapeHtml(item.label)}</li>`).join('');
    return `<div class="result-subtitle">${escapeHtml(groupLabel)}</div><ol>${list}</ol>`;
  }).filter(Boolean).join('');

  return `<strong>Рекомендации:</strong>${sections}`;
}

function sleepDiaryAppendix() {
  const rows = Array.from(document.querySelectorAll('#sleep_diary_body tr')).map((row, index) => {
    const value = key => row.querySelector(`[data-diary="${key}"]`)?.value || '';
    const dayType = value('type') === 'free' ? 'СД' : value('type') === 'work' ? 'Р' : '';
    return `<tr><td>${index + 1}</td><td>${dayType}</td><td>${escapeHtml(value('bed'))}</td><td>${escapeHtml(value('sleep'))}</td><td>${escapeHtml(value('wake'))}</td><td>${escapeHtml(value('rise'))}</td><td>${escapeHtml(value('waso'))}</td><td>${escapeHtml(value('nap'))}</td></tr>`;
  }).join('');
  return `<div class="report-appendix">
    <div class="result-subtitle">Приложение: дневник сна на 2 недели</div>
    <div class="report-diary-meta"><div>ФИО: ________________________________</div><div>Дата начала дневника: ____.____.____</div></div>
    <p class="diary-instruction">Тип дня: Р — рабочий; СД — свободный. Латентность сна — время от попытки уснуть до засыпания. Бодрствование после засыпания — суммарное время всех ночных пробуждений.</p>
    <table class="report-diary-table"><thead><tr><th>День</th><th>Тип</th><th>Лёг</th><th>Уснул</th><th>Проснулся</th><th>Встал</th><th>Бодрствование после засыпания, мин</th><th>Дневной сон, мин</th></tr></thead><tbody>${rows}</tbody></table>
  </div>`;
}

function legacyGenerateReport() {
  const s = collectState();
  const sleepProfile = [
    s.bedtime ? `отход ко сну ${s.bedtime}` : '',
    s.waketime ? `подъем ${s.waketime}` : '',
    s.latency ? `латентность сна ${s.latency} мин` : '',
    s.awakenings ? `пробуждений за ночь: ${s.awakenings}` : '',
    s.awakeningDuration ? `длительность пробуждений ${s.awakeningDuration} мин` : '',
    s.totalSleep ? `общее время сна ${s.totalSleep} ч` : '',
    s.sleepEfficiency ? `эффективность сна ${s.sleepEfficiency}%` : '',
    s.napMinutes ? `дневной сон ${s.napMinutes} мин` : '',
    s.bedtimeVariability ? `вариабельность отхода ко сну ${s.bedtimeVariability} мин` : '',
    s.waketimeVariability ? `вариабельность подъема ${s.waketimeVariability} мин` : '',
    s.sleepDurationVariability ? `вариабельность длительности сна ${s.sleepDurationVariability} мин` : ''
  ].filter(Boolean).join(', ');

  let html = '';
  html += '<strong>Сомнологический прием</strong><br><br>';
  html += line('Жалобы', s.complaints || 'активно не предъявляет');
  html += line('Анамнез нарушения сна', s.history);
  html += line('Сопутствующие заболевания', s.comorbidity);
  html += line('Лекарства и вещества', s.substances);
  html += line('Антропометрия', [
    s.heightCm ? `рост ${s.heightCm} см` : '',
    s.weightKg ? `вес ${s.weightKg} кг` : '',
    s.bmi ? `ИМТ ${s.bmi}` : '',
    s.neck ? `окружность шеи ${s.neck}` : ''
  ].filter(Boolean).join('; '));
  html += '<br><strong>Профиль сна:</strong> ' + escapeHtml(sleepProfile || 'данные не заполнены') + '<br>';
  const sleepSymptoms = [
    ...s.sleepSymptoms,
    s.advisorClarifications
  ].filter(Boolean);
  if (sleepSymptoms.length) html += line('Основные симптомы сна', sleepSymptoms.join(', '));
  if (s.breathingSymptoms.length) html += line('Дыхание во сне', s.breathingSymptoms.join(', '));
  if (s.movementSymptoms.length) html += line('Движения / ощущения в конечностях', s.movementSymptoms.join(', '));
  if (s.parasomniaSymptoms.length) html += line('Парасомнии', s.parasomniaSymptoms.join(', '));
  if (s.hypersomniaSymptoms.length) html += line('Гиперсомнические признаки', s.hypersomniaSymptoms.join(', '));
  html += line('Комментарии к ночным эпизодам', s.sleepNotes);
  html += '<br><strong>Шкалы:</strong><br>';
  html += `ISI ${s.isi}/28 (${escapeHtml(classifyIsi(s.isi))}).<br>`;
  html += `ESS ${s.ess}/24 (${escapeHtml(classifyEss(s.ess))}).<br>`;
  html += `STOP-Bang ${s.stopbang}/8 (${escapeHtml(classifyStopBang(s.stopbang))}).<br>`;
  html += '<br>';
  html += multilineLine('Диагноз', s.diagnosis);
  html += numberedList('Обследования', s.testItems);
  html += groupedRecommendationList(s.recommendationItems);
  html += line('Лечение / маршрутизация', s.treatment);

  el('result').innerHTML = html;
}

function scaleIsComplete(name, total) {
  return Array.from(document.querySelectorAll(`select[data-scale="${name}"]`)).filter(node => node.value !== '').length === total;
}

function stateLabel(value, labels) {
  return labels[value] || value || '';
}

function generateReport() {
  const s = collectState();
  const signals = evaluateRouter(s);
  const durationLabel = stateLabel(s.complaintDuration, { lt_1m: 'менее 1 месяца', '1_3m': '1–3 месяца', ge_3m: '3 месяца и более' });
  const sexLabel = stateLabel(s.sex, { male: 'мужской', female: 'женский', other: 'другой / не указан' });
  const circadianLabel = stateLabel(s.circadianPattern, { delayed: 'задержка фазы', advanced: 'опережение фазы', irregular: 'нерегулярный ритм', shift: 'сменная работа' });
  const freeScheduleLabel = stateLabel(s.freeScheduleSleep, { normal: 'нормальный и освежающий', disturbed: 'остаётся нарушенным' });
  const workProfile = [s.eveningSleepiness && `появление вечерней сонливости ${s.eveningSleepiness}`, s.bedtime && `укладывание ${s.bedtime}`, s.sleepAttempt && `попытка уснуть ${s.sleepAttempt}`, s.latency && `латентность сна ${s.latency} мин`, s.awakenings && `ночных пробуждений ${s.awakenings}`, s.finalWake && `окончательное пробуждение ${s.finalWake}`, s.waketime && `подъём ${s.waketime}`, s.timeInBed && `время в постели ${s.timeInBed} ч`, s.totalSleep && `общее время сна (TST) ${s.totalSleep} ч`, s.waso && `бодрствование после засыпания ${s.waso} мин`, s.sleepEfficiency && `эффективность сна (SE) ${s.sleepEfficiency}%`, s.napMinutes && `дневной сон ${s.napMinutes} мин`].filter(Boolean).join(', ');
  const freeProfile = [s.freeBedtime && `укладывание ${s.freeBedtime}`, s.freeSleepAttempt && `попытка уснуть ${s.freeSleepAttempt}`, s.freeFinalWake && `пробуждение ${s.freeFinalWake}`, s.freeWaketime && `подъём ${s.freeWaketime}`, s.freeNapMinutes && `дневной сон ${s.freeNapMinutes} мин`].filter(Boolean).join(', ');
  const circadianProfile = [circadianLabel && `предполагаемый профиль: ${circadianLabel}`, s.preferredBedtime && `желаемое засыпание ${s.preferredBedtime}`, s.preferredWaketime && `желаемый подъём ${s.preferredWaketime}`, freeScheduleLabel && `сон при свободном графике ${freeScheduleLabel}`, s.morningLightMinutes && `утренний свет ${s.morningLightMinutes} мин`].filter(Boolean).join(', ');
  let html = '<strong>Сомнологический приём взрослого пациента</strong><br><br>';
  html += '<div class="result-subtitle">Повод обращения и анамнез</div>';
  html += line('Жалобы', s.complaints || 'активно не предъявляет');
  html += line('Длительность и частота жалоб', [durationLabel, s.complaintFrequency && `${s.complaintFrequency} ночей в неделю`].filter(Boolean).join('; '));
  html += line('Анамнез', s.history); html += line('Предыдущие исследования и лечение', s.previousSleepCare);
  html += line('Сведения партнёра', s.bedPartnerReport); html += line('Семейный анамнез', s.familyHistory);
  html += line('Контекст', [s.age && `возраст ${s.age} лет`, sexLabel && `пол ${sexLabel}`, s.workSchedule && `режим работы: ${s.workSchedule}`, s.nightShifts && `ночных смен в месяц: ${s.nightShifts}`].filter(Boolean).join('; '));
  html += line('Сопутствующие заболевания', s.comorbidity); html += line('Лекарства и вещества', s.substances);
  html += line('Антропометрия', [s.heightCm && `рост ${s.heightCm} см`, s.weightKg && `вес ${s.weightKg} кг`, s.bmi && `ИМТ ${s.bmi}`, s.neck && `шея ${s.neck} см`].filter(Boolean).join('; '));
  html += '<div class="result-subtitle">Профиль сна</div>';
  html += line('Рабочие дни', workProfile || 'данные не заполнены'); html += line('Свободные дни', freeProfile);
  html += line('Дневник сна 14 дней', s.diarySummary);
  html += line('Возможность и условия для сна', `достаточное время — ${s.sleepOpportunity ? 'подтверждено' : 'не подтверждено'}; приемлемые условия — ${s.sleepConditions ? 'подтверждены' : 'не подтверждены'}`);
  html += line('Циркадный профиль', circadianProfile);
  html += '<div class="result-subtitle">Синдромные признаки и дневное функционирование</div>';
  if (s.sleepSymptoms.length) html += line('Сон', s.sleepSymptoms.join(', '));
  if (s.dayImpairments.length) html += line('Дневные последствия', s.dayImpairments.join(', '));
  if (s.breathingSymptoms.length) html += line('Дыхание во сне', s.breathingSymptoms.join(', '));
  if (s.movementSymptoms.length) html += line('Сенсомоторные признаки', s.movementSymptoms.join(', '));
  if (s.rlsMimics.length) html += line('Возможные имитаторы RLS', s.rlsMimics.join(', '));
  if (s.hypersomniaSymptoms.length) html += line('Гиперсомнолентность / REM-феномены', s.hypersomniaSymptoms.join(', '));
  if (s.parasomniaSymptoms.length) html += line('Ночные эпизоды', s.parasomniaSymptoms.join(', '));
  html += line('Характеристики ночных эпизодов', [s.episodeTiming && `преимущественно ${s.episodeTiming}`, s.episodeOnsetAge && `возраст начала ${s.episodeOnsetAge} лет`].filter(Boolean).join('; '));
  html += line('Частота и длительность ночных эпизодов', [s.episodeFrequency && `частота: ${s.episodeFrequency}`, s.episodeDuration && `длительность: ${s.episodeDuration}`].filter(Boolean).join('; '));
  html += line('Воспоминание и стереотипность эпизодов', [s.episodeRecall && `воспоминание: ${s.episodeRecall}`, s.episodeStereotypy && `характер: ${s.episodeStereotypy}`].filter(Boolean).join('; '));
  html += line('Описание эпизодов', s.sleepNotes);
  html += line('Меры безопасности при ночных эпизодах', s.parasomniaSafetyPlan);
  html += line('Факторы вторичного RLS', [s.rlsKidneyDisease && `ХБП/диализ: ${s.rlsKidneyDisease}`, s.rlsPregnancy && `беременность/послеродовый период: ${s.rlsPregnancy}`, s.rlsBloodLoss && `кровопотери/донорство: ${s.rlsBloodLoss}`, s.rlsFamilyHistory && `семейный анамнез: ${s.rlsFamilyHistory}`].filter(Boolean).join('; '));
  html += line('Обмен железа при RLS', s.rlsIronResults);
  html += '<div class="result-subtitle">Безопасность</div>';
  html += line('Красные флаги', s.safetyFlags.length ? s.safetyFlags.join(', ') : 'по заполненным данным не отмечены'); html += line('Принятые меры', s.safetyNotes);
  html += '<div class="result-subtitle">Скрининговые шкалы (не диагноз)</div>';
  html += `ISI: ${scaleIsComplete('isi', 7) ? `${s.isi}/28 (${escapeHtml(classifyIsi(s.isi))})` : 'не заполнена полностью'}.<br>`;
  html += `ESS: ${scaleIsComplete('ess', 8) ? `${s.ess}/24 (${escapeHtml(classifyEss(s.ess))})` : 'не заполнена полностью'}.<br>`;
  html += `STOP-Bang: ${s.age && s.sex && s.bmi && s.neck ? `${s.stopbang}/8 (${escapeHtml(classifyStopBang(s.stopbang))})` : 'не хватает исходных данных'}.<br>`;
  html += '<div class="result-subtitle">Скрининговые сигналы и требующие уточнения данные</div>';
  if (signals.length) signals.forEach(signal => { html += `<strong>${escapeHtml(signal.title)} — ${escapeHtml(signal.status)}</strong><br>`; if (signal.missing.length) html += `Уточнить: ${escapeHtml(signal.missing.map(item => item.label).join(', '))}.<br>`; if (signal.alternatives.length) html += `Альтернативы/коморбидность: ${escapeHtml(signal.alternatives.join('; '))}.<br>`; });
  else html += 'Синдромных сигналов по заполненным данным не сформировано.<br>';
  html += '<div class="result-subtitle">Исследования сна и подготовка к тестам</div>';
  html += line('Исследование сна', [s.sleepStudyType, s.sleepStudyDate && `от ${s.sleepStudyDate}`, s.sleepStudyQuality].filter(Boolean).join('; '));
  html += line('Обоснование выбора метода', s.sleepStudyRationale);
  html += line('Показатели исследования', [s.studyAhiRei && `AHI/REI ${s.studyAhiRei}/ч`, s.studyOdi && `ODI ${s.studyOdi}/ч`, s.studyMinSpo2 && `минимальная SpO₂ ${s.studyMinSpo2}%`, s.studyT90 && `SpO₂ <90% ${s.studyT90} мин`, s.studyPositionRem].filter(Boolean).join('; '));
  html += line('Подготовка к MSLT/MWT', [s.msltPriorPsg && 'ночная ПСГ выполнена', s.msltSleepLog && 'дневник/актиграфия ≥2 недель рассмотрены', s.msltMedicationReview && 'влияющие лекарства и вещества оценены', s.msltSufficientSleep && 'достаточный сон и циркадный ритм подтверждены'].filter(Boolean).join('; '));
  html += line('План подготовки к MSLT/MWT', s.msltPreparationNotes);
  html += '<br>' + line('Статус клинической оценки', s.diagnosisStatus) + line('Основание клинической оценки', s.diagnosisBasis) + multilineLine('Клиническая оценка / диагноз врача', s.diagnosis);
  html += numberedList('Обследования', s.testItems); html += groupedRecommendationList(s.recommendationItems); html += line('Лечение / маршрутизация', s.treatment);
  const needsSleepDiaryAppendix = s.recommendationItems.some(item => item.id === 'sleep_diary') || !!document.querySelector('input[data-test-id="sleep_diary"]:checked');
  if (needsSleepDiaryAppendix) html += sleepDiaryAppendix();
  el('result').innerHTML = html;
}

async function copyReport() {
  const result = el('result');
  const text = result.innerText.trim();
  if (!text) return;
  try {
    await navigator.clipboard.writeText(text);
  } catch (_e) {
    const range = document.createRange();
    range.selectNodeContents(result);
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
    document.execCommand('copy');
    selection.removeAllRanges();
  }
}

const TIME_PICKER = {
  input: null,
  mode: 'hours',
  hours: 0,
  minutes: 0
};

function padTimePart(value) {
  return String(value).padStart(2, '0');
}

function syncTimePickerValue() {
  const valueNode = el('time-picker-value');
  if (valueNode) {
    valueNode.textContent = `${padTimePart(TIME_PICKER.hours)}:${padTimePart(TIME_PICKER.minutes)}`;
  }
}

function setTimePickerMode(mode) {
  TIME_PICKER.mode = mode;
  document.querySelectorAll('.time-picker-tab').forEach(tab => {
    tab.classList.toggle('active', tab.dataset.timeMode === mode);
  });
  renderTimePickerFace();
}

function renderTimePickerFace() {
  const face = el('time-picker-face');
  if (!face) return;

  face.innerHTML = '';
  const values = TIME_PICKER.mode === 'hours'
    ? Array.from({ length: 24 }, (_item, index) => index)
    : Array.from({ length: 12 }, (_item, index) => index * 5);
  const center = 140;
  const radius = TIME_PICKER.mode === 'hours' ? 112 : 110;

  values.forEach((value, index) => {
    const angle = ((index / values.length) * 360 - 90) * Math.PI / 180;
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'time-picker-option';
    button.textContent = padTimePart(value);
    button.style.left = `${center + Math.cos(angle) * radius}px`;
    button.style.top = `${center + Math.sin(angle) * radius}px`;
    button.classList.toggle('active', TIME_PICKER.mode === 'hours' ? value === TIME_PICKER.hours : value === TIME_PICKER.minutes);
    button.addEventListener('click', () => {
      if (TIME_PICKER.mode === 'hours') {
        TIME_PICKER.hours = value;
        setTimePickerMode('minutes');
      } else {
        TIME_PICKER.minutes = value;
        renderTimePickerFace();
      }
      syncTimePickerValue();
    });
    face.appendChild(button);
  });
}

function openTimePicker(input) {
  TIME_PICKER.input = input;
  const parsed = (input.value || '00:00').split(':').map(Number);
  TIME_PICKER.hours = Number.isFinite(parsed[0]) ? parsed[0] : 0;
  TIME_PICKER.minutes = Number.isFinite(parsed[1]) ? Math.round(parsed[1] / 5) * 5 : 0;
  if (TIME_PICKER.minutes >= 60) TIME_PICKER.minutes = 55;

  const backdrop = el('time-picker-backdrop');
  if (backdrop) {
    backdrop.classList.add('open');
    backdrop.setAttribute('aria-hidden', 'false');
  }

  syncTimePickerValue();
  setTimePickerMode('hours');
}

function closeTimePicker() {
  const backdrop = el('time-picker-backdrop');
  if (backdrop) {
    backdrop.classList.remove('open');
    backdrop.setAttribute('aria-hidden', 'true');
  }
}

function commitTimePicker() {
  if (TIME_PICKER.input) {
    TIME_PICKER.input.value = `${padTimePart(TIME_PICKER.hours)}:${padTimePart(TIME_PICKER.minutes)}`;
    TIME_PICKER.input.dispatchEvent(new Event('input', { bubbles: true }));
    TIME_PICKER.input.dispatchEvent(new Event('change', { bubbles: true }));
  }
  closeTimePicker();
}

function initTimePicker() {
  document.querySelectorAll('input[type="time"]').forEach(input => {
    input.addEventListener('focus', event => {
      event.target.blur();
      openTimePicker(input);
    });
    input.addEventListener('click', event => {
      event.preventDefault();
      openTimePicker(input);
    });
  });

  document.querySelectorAll('.time-picker-tab').forEach(tab => {
    tab.addEventListener('click', () => setTimePickerMode(tab.dataset.timeMode));
  });

  el('time-picker-close')?.addEventListener('click', closeTimePicker);
  el('time-picker-done')?.addEventListener('click', commitTimePicker);
  el('time-picker-clear')?.addEventListener('click', () => {
    if (TIME_PICKER.input) {
      TIME_PICKER.input.value = '';
      TIME_PICKER.input.dispatchEvent(new Event('input', { bubbles: true }));
      TIME_PICKER.input.dispatchEvent(new Event('change', { bubbles: true }));
    }
    closeTimePicker();
  });
  el('time-picker-backdrop')?.addEventListener('click', event => {
    if (event.target === event.currentTarget) closeTimePicker();
  });
}

function initNav() {
  const links = Array.from(document.querySelectorAll('.nav-link'));
  const sections = links
    .map(link => document.querySelector(link.getAttribute('href')))
    .filter(Boolean);

  function setActiveById(id) {
    links.forEach(item => {
      item.classList.toggle('active', item.getAttribute('href') === `#${id}`);
    });
  }

  links.forEach(link => {
    link.addEventListener('click', () => {
      const targetId = link.getAttribute('href').slice(1);
      setActiveById(targetId);
    });
  });

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      const visible = entries
        .filter(entry => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

      if (visible && visible.target.id) {
        setActiveById(visible.target.id);
      }
    }, {
      root: null,
      rootMargin: '-22% 0px -62% 0px',
      threshold: [0.12, 0.25, 0.5, 0.75]
    });

    sections.forEach(section => observer.observe(section));
  }
}

function initSidebar() {
  const sidebar = document.querySelector('.sidebar');
  const toggle = document.querySelector('.brand-mark');
  if (!sidebar || !toggle) return;

  function setCollapsed(collapsed) {
    sidebar.classList.toggle('sidebar--collapsed', collapsed);
    toggle.setAttribute('aria-expanded', String(!collapsed));
    const label = collapsed ? 'Развернуть боковую панель' : 'Свернуть боковую панель';
    toggle.setAttribute('aria-label', label);
    toggle.setAttribute('title', label);
  }

  setCollapsed(window.matchMedia('(max-width: 760px)').matches);
  toggle.addEventListener('click', () => {
    setCollapsed(!sidebar.classList.contains('sidebar--collapsed'));
  });
}

function createSleepDiary() {
  const body = el('sleep_diary_body');
  if (!body || body.children.length) return;
  for (let day = 1; day <= 14; day += 1) {
    const row = document.createElement('tr');
    row.innerHTML = `<td>${day}</td><td><select data-diary="type" aria-label="Тип дня"><option value="" selected>Тип дня</option><option value="work">Р</option><option value="free">СД</option></select></td>
      <td><input type="time" data-diary="bed"></td><td><input type="time" data-diary="sleep"></td><td><input type="time" data-diary="wake"></td><td><input type="time" data-diary="rise"></td>
      <td><input type="number" min="0" max="720" step="5" data-diary="waso"></td><td><input type="number" min="0" max="720" step="5" data-diary="nap"></td>`;
    body.appendChild(row);
  }
  body.addEventListener('input', updateDiarySummary);
  body.addEventListener('change', updateDiarySummary);
}

function diaryDuration(start, end) {
  const a = timeToMinutes(start); const b = timeToMinutes(end);
  if (a === null || b === null) return null;
  let duration = b - a; if (duration <= 0) duration += 1440;
  return duration > 1200 ? null : duration;
}

function updateDiarySummary() {
  const groups = { work: [], free: [] };
  document.querySelectorAll('#sleep_diary_body tr').forEach(row => {
    const get = key => row.querySelector(`[data-diary="${key}"]`)?.value || '';
    const timeInBed = diaryDuration(get('bed'), get('rise'));
    const sleepWindow = diaryDuration(get('sleep'), get('wake'));
    if (timeInBed === null && sleepWindow === null) return;
    const waso = Number(get('waso') || 0); const nap = Number(get('nap') || 0);
    const tst = sleepWindow === null ? null : Math.max(0, sleepWindow - waso);
    const dayType = get('type');
    if (!dayType) return;
    groups[dayType].push({ timeInBed, tst, nap });
  });
  const describe = (label, rows) => {
    if (!rows.length) return '';
    const average = key => { const values = rows.map(row => row[key]).filter(Number.isFinite); return values.length ? Math.round(values.reduce((a, b) => a + b, 0) / values.length) : null; };
    const tst = average('tst'); const tib = average('timeInBed'); const nap = average('nap');
    return `${label}: ${rows.length} дн., TST ${tst === null ? '—' : (tst / 60).toFixed(1)} ч, время в постели ${tib === null ? '—' : (tib / 60).toFixed(1)} ч, дневной сон ${nap ?? '—'} мин`;
  };
  const lines = [describe('Рабочие дни', groups.work), describe('Свободные дни', groups.free)].filter(Boolean);
  const summary = el('sleep_diary_summary');
  summary.textContent = lines.join(' · ') || 'Нет заполненных строк';
  summary.dataset.report = lines.join('; ');
}

function initDiagnosisSearch() {
  const search = el('diagnosis_search');
  if (!search) return;

  renderSelectedDiagnoses();

  search.addEventListener('input', () => renderDiagnosisResults(search.value));
  search.addEventListener('focus', () => renderDiagnosisResults(search.value));

  const manual = el('diagnosis_manual');
  const addManual = el('add_manual_diagnosis');
  if (manual && addManual) {
    addManual.addEventListener('click', () => {
      if (addDiagnosisText(manual.value)) {
        manual.value = '';
      }
    });
  }

  document.addEventListener('click', event => {
    const results = el('diagnosis_results');
    if (!results) return;
    if (!event.target.closest('.diagnosis-search')) {
      results.classList.remove('open');
    }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  createScaleItems();
  createMedicationGroups();
  createSleepDiary();
  createTestsChecklist();
  createRecommendationsChecklist();
  updateRecommendationGroupCounts();
  updateScores();
  initSidebar();
  initNav();
  initDiagnosisSearch();
  initTimePicker();
  initEditorToolbar();
  document.addEventListener('change', updateScores);
  document.addEventListener('change', updateRecommendationGroupCounts);
  document.addEventListener('input', updateScores);
  el('run-advisor').addEventListener('click', runAdvisor);
  el('generate-report').addEventListener('click', generateReport);
  el('copy-report').addEventListener('click', copyReport);
  el('print-report').addEventListener('click', () => {
    if (typeof window.print !== 'function') {
      alert('Печать не поддерживается этим браузером.');
      return;
    }

    window.focus();
    window.print();
  });
});
