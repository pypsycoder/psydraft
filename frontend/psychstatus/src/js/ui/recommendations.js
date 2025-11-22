const RECOMMENDATIONS_LIBRARY = [
    // ==== GENERAL (1–17) ====
    {
        id: 'gen_sleep_wake_rhythm',
        group: 'general',
        title: 'Режим сна и бодрствования',
        short: 'Соблюдать регулярный режим сна и бодрствования.',
        full: 'Соблюдать регулярный режим сна и бодрствования: ложиться и вставать в одно и то же время, по возможности без резких сдвигов даже в выходные.'
    },
    {
        id: 'gen_daily_activity',
        group: 'general',
        title: 'Умеренная физическая активность',
        short: 'Поддерживать умеренную физическую активность ежедневно.',
        full: 'Поддерживать умеренную физическую активность ежедневно: включать в день посильные прогулки, лёгкие упражнения или ЛФК с учётом соматического состояния.'
    },
    {
        id: 'gen_caffeine_limit',
        group: 'general',
        title: 'Ограничение стимуляторов',
        short: 'Ограничить кофеин и другие стимуляторы, особенно после 14:00.',
        full: 'Ограничить употребление кофе, крепкого чая, энергетиков и других стимуляторов, особенно после 14:00, так как они могут усиливать тревогу и нарушать сон.'
    },
    {
        id: 'gen_no_alcohol_pav',
        group: 'general',
        title: 'Отказ от алкоголя и ПАВ',
        short: 'Исключить алкоголь и немедицинское употребление ПАВ.',
        full: 'Исключить употребление алкоголя и немедицинское употребление психоактивных веществ, так как они ухудшают течение психического расстройства и снижают эффективность терапии.'
    },
    {
        id: 'gen_balance_load_rest',
        group: 'general',
        title: 'Баланс нагрузки и отдыха',
        short: 'Чередовать нагрузку и отдых, избегать переутомления.',
        full: 'Чередовать умственную и физическую нагрузку с периодами отдыха, избегать длительных периодов напряжённой работы без пауз и выраженного переутомления.'
    },
    {
        id: 'gen_day_planning',
        group: 'general',
        title: 'Планирование дня',
        short: 'Планировать распорядок дня с равномерной нагрузкой.',
        full: 'Планировать распорядок дня так, чтобы важные и второстепенные задачи были равномерно распределены, без концентрации всего объёма дел на один отрезок времени.'
    },
    {
        id: 'gen_structured_day',
        group: 'general',
        title: 'Структурирование дня',
        short: 'Структурировать день, включая важные и второстепенные дела.',
        full: 'Структурировать день: заранее отмечать основные дела, бытовые задачи и время отдыха, чтобы снизить чувство хаоса и перегруженности.'
    },
    {
        id: 'gen_nutrition',
        group: 'general',
        title: 'Сбалансированное питание',
        short: 'Поддерживать регулярное и сбалансированное питание.',
        full: 'Поддерживать регулярное и сбалансированное питание, избегать длительных перерывов между приёмами пищи и выраженного переедания, особенно в вечернее время.'
    },
    {
        id: 'gen_hydration',
        group: 'general',
        title: 'Питьевой режим',
        short: 'Следить за достаточным питьевым режимом.',
        full: 'Следить за адекватным питьевым режимом с учётом соматического состояния и рекомендаций терапевта/специалистов соматического профиля.'
    },
    {
        id: 'gen_household_hygiene',
        group: 'general',
        title: 'Режим быта',
        short: 'Поддерживать порядок, проветривание и достаточное освещение.',
        full: 'Поддерживать аккуратный режим быта: регулярно проветривать помещение, следить за освещённостью и порядком, формируя комфортную и предсказуемую среду.'
    },
    {
        id: 'gen_screen_time_limit',
        group: 'general',
        title: 'Экранное время',
        short: 'Снижать время за экранами, особенно вечером.',
        full: 'Снижать время за экранами (телефон, компьютер, телевизор), особенно за 1–2 часа до сна, так как это может ухудшать качество засыпания и усиливать напряжение.'
    },
    {
        id: 'gen_med_adherence',
        group: 'general',
        title: 'Соблюдение терапии',
        short: 'Принимать препараты строго по назначению врача.',
        full: 'Принимать назначенную медикаментозную терапию строго по схеме, не изменять дозировки и не отменять препараты самостоятельно, при побочных эффектах обсуждать ситуацию с врачом.'
    },
    {
        id: 'gen_mood_diary',
        group: 'general',
        title: 'Дневник самочувствия',
        short: 'Вести краткий дневник самочувствия.',
        full: 'Вести краткий дневник самочувствия, отмечая настроение, уровень тревоги, качество сна и значимые события, чтобы лучше отслеживать динамику состояния.'
    },
    {
        id: 'gen_relax_techniques',
        group: 'general',
        title: 'Релаксационные упражнения',
        short: 'Осваивать дыхательные и расслабляющие упражнения.',
        full: 'Осваивать простые дыхательные и релаксационные упражнения (медленное дыхание, поочерёдное напряжение и расслабление мышц) и применять их при повышенном напряжении.'
    },
    {
        id: 'gen_social_activity',
        group: 'general',
        title: 'Социальная активность',
        short: 'Поддерживать посильную социальную активность.',
        full: 'Поддерживать посильную социальную активность, по возможности не полностью изолироваться от общения с близкими и значимыми людьми.'
    },
    {
        id: 'gen_family_support',
        group: 'general',
        title: 'Поддержка близких',
        short: 'Привлекать близких к поддержке при желании.',
        full: 'При желании обсуждать своё состояние с доверенными близкими, привлекать их к поддержке и совместному планированию бытовых и лечебных шагов.'
    },
    {
        id: 'gen_stressor_reduction',
        group: 'general',
        title: 'Снижение стрессоров',
        short: 'По возможности снижать влияние стрессовых факторов.',
        full: 'По возможности снижать влияние хроничских и острых стрессовых факторов: пересматривать график, нагрузку, режим взаимодействия с конфликтогенными ситуациями и людьми.'
    },

    // ==== ANXIETY (18–26) ====
    {
        id: 'anx_diaphragmatic_breathing',
        group: 'anxiety',
        title: 'Диафрагмальное дыхание',
        short: 'Осваивать медленное диафрагмальное дыхание при тревоге.',
        full: 'Осваивать и регулярно использовать медленное диафрагмальное дыхание (с удлинённым выдохом) при усилении тревоги и внутреннего напряжения.'
    },
    {
        id: 'anx_grounding',
        group: 'anxiety',
        title: 'Grounding-упражнения',
        short: 'Использовать grounding-упражнения (5–4–3–2–1).',
        full: 'Использовать grounding-упражнения (например, техника 5–4–3–2–1: назвать 5 видимых предметов, 4 ощущаемых на теле, 3 звука и т.д.) для снижения уровня тревоги и «заземления» в настоящем моменте.'
    },
    {
        id: 'anx_hyperventilation_control',
        group: 'anxiety',
        title: 'Контроль дыхания',
        short: 'Применять техники снижения гипервентиляции.',
        full: 'Применять техники контроля дыхания при ощущении нехватки воздуха и учащённого дыхания, делая дыхание более медленным и ровным, с акцентом на длительный выдох.'
    },
    {
        id: 'anx_panic_observation',
        group: 'anxiety',
        title: 'Наблюдение при панике',
        short: 'По возможности наблюдать за симптомами паники без избегания.',
        full: 'При панической атаке по возможности наблюдать за симптомами как за временным состоянием, уменьшая избегающее поведение, и применять освоенные дыхательные и grounding-техники.'
    },
    {
        id: 'anx_worry_diary',
        group: 'anxiety',
        title: 'Дневник тревожных мыслей',
        short: 'Вести дневник тревожных мыслей и ситуаций.',
        full: 'Вести дневник тревожных мыслей, записывая ситуации, содержание мыслей и уровень тревоги, для последующего анализа и обсуждения с врачом или психотерапевтом.'
    },
    {
        id: 'anx_cognitive_reappraisal',
        group: 'anxiety',
        title: 'Перепроверка убеждений',
        short: 'Использовать техники перепроверки тревожных убеждений.',
        full: 'Использовать техники перепроверки тревожных убеждений: анализировать доказательства «за» и «против», рассматривать альтернативные объяснения, уменьшать тенденцию к катастрофизации.'
    },
    {
        id: 'anx_catastrophizing_work',
        group: 'anxiety',
        title: 'Работа с катастрофизацией',
        short: 'Работать с катастрофизацией с помощью письменных упражнений.',
        full: 'Работать с катастрофизацией с помощью письменных упражнений: выделять «наихудший сценарий», оценивать его вероятность и последствия, формировать более реалистичные прогнозы.'
    },
    {
        id: 'anx_planning_uncertainty',
        group: 'anxiety',
        title: 'Планирование при неопределённости',
        short: 'Планировать ситуации заранее для уменьшения неопределённости.',
        full: 'Планировать важные ситуации и события заранее, проговаривать возможные варианты развития, чтобы снизить уровень неопределённости и связанной с этим тревоги.'
    },
    {
        id: 'anx_avoidance_reduction',
        group: 'anxiety',
        title: 'Снижение избегания',
        short: 'Постепенно уменьшать избегание пугающих ситуаций.',
        full: 'Постепенно уменьшать избегание пугающих ситуаций, начиная с более лёгких, по шагам расширяя круг толерируемых ситуаций и поддерживая чувство контроля.'
    },

    // ==== DEPRESSION (27–33) ====
    {
        id: 'dep_behavioral_activation',
        group: 'depression',
        title: 'Поведенческая активация',
        short: 'Использовать поведенческую активацию — малые ежедневные шаги.',
        full: 'Использовать поведенческую активацию: планировать и выполнять небольшие, но регулярные действия, направленные на восстановление активности и интереса к повседневной жизни.'
    },
    {
        id: 'dep_daily_small_activity',
        group: 'depression',
        title: 'Ежедневная посильная активность',
        short: 'Включать хотя бы одну посильную активность ежедневно.',
        full: 'Стараться ежедневно включать хотя бы одну посильную активность (бытовое дело, короткая прогулка, хобби), даже при снижении мотивации и настроения.'
    },
    {
        id: 'dep_planned_day',
        group: 'depression',
        title: 'Планирование дня',
        short: 'Планировать день заранее с учётом нагрузки.',
        full: 'Планировать день заранее, распределяя дела по степени важности и сложности, чтобы избегать накопления нерешённых задач и усиления чувства беспомощности.'
    },
    {
        id: 'dep_task_breakdown',
        group: 'depression',
        title: 'Разбиение задач',
        short: 'Разбивать крупные задачи на небольшие этапы.',
        full: 'Разбивать крупные задачи на несколько небольших, более реалистичных этапов и выполнять их по шагам, отмечая даже небольшие успехи.'
    },
    {
        id: 'dep_negative_thoughts',
        group: 'depression',
        title: 'Негативные автоматические мысли',
        short: 'Отслеживать и анализировать негативные автоматические мысли.',
        full: 'Отслеживать и записывать негативные автоматические мысли, анализировать их логичность, искать альтернативные, более реалистичные и поддерживающие формулировки.'
    },
    {
        id: 'dep_social_involvement',
        group: 'depression',
        title: 'Социальная вовлечённость',
        short: 'Поддерживать посильную социальную вовлечённость.',
        full: 'Поддерживать посильную социальную вовлечённость: не полностью отказываться от общения, по возможности сохранять контакты с поддерживающими людьми.'
    },
    {
        id: 'dep_stable_wake_time',
        group: 'depression',
        title: 'Стабильное время подъёма',
        short: 'Поддерживать стабильное время подъёма ежедневно.',
        full: 'Поддерживать стабильное время подъёма ежедневно, даже при снижении настроения, чтобы не допускать смещения суточного ритма и усугубления апатии.'
    },

    // ==== OCD (34–38) ====
    {
        id: 'ocd_diary',
        group: 'ocd',
        title: 'Дневник навязчивостей',
        short: 'Вести дневник ситуаций, вызывающих навязчивости.',
        full: 'Вести дневник ситуаций, вызывающих навязчивые мысли и ритуалы, с описанием контекста, мыслей и уровня тревоги, для более точной работы с симптомами.'
    },
    {
        id: 'ocd_delay_ritual',
        group: 'ocd',
        title: 'Отложенный ритуал',
        short: 'Использовать технику «отложенного ритуала».',
        full: 'Использовать технику «отложенного ритуала»: по возможности откладывать выполнение компульсии на 5–10 минут, постепенно увеличивая интервал и отслеживая снижение тревоги.'
    },
    {
        id: 'ocd_separate_thought_intent',
        group: 'ocd',
        title: 'Разделение мыслей и намерений',
        short: 'Разделять «мысли» и «намерения», снижая гиперконтроль.',
        full: 'Разделять «мысли» и «намерения», воспринимая навязчивые мысли как симптом, а не как отражение истинных желаний или намерений, чтобы снижать чувство вины и гиперконтроля.'
    },
    {
        id: 'ocd_anxiety_monitoring',
        group: 'ocd',
        title: 'Отслеживание тревоги',
        short: 'Отслеживать уровень тревоги до и после ритуала.',
        full: 'Отслеживать уровень тревоги до и после выполнения или отмены ритуала, чтобы видеть, что тревога имеет тенденцию снижаться и без выполнения компульсий.'
    },
    {
        id: 'ocd_avoidance_reduction',
        group: 'ocd',
        title: 'Уменьшение избегания',
        short: 'Постепенно уменьшать избегание провоцирующих ситуаций.',
        full: 'Постепенно уменьшать избегание ситуаций, провоцирующих навязчивые мысли, начиная с менее тревожных, расширяя диапазон допустимых ситуаций по мере готовности.'
    },

    // ==== SLEEP (39–47) ====
    {
        id: 'sleep_no_screens',
        group: 'sleep',
        title: 'Исключение экранов перед сном',
        short: 'Исключить экраны за 1–2 часа до сна.',
        full: 'Исключить или максимально ограничить использование экранов (телефон, компьютер, телевизор) за 1–2 часа до сна, чтобы улучшить засыпание и качество сна.'
    },
    {
        id: 'sleep_stable_wake_time',
        group: 'sleep',
        title: 'Стабильный подъём',
        short: 'Установить одно и то же время подъёма ежедневно.',
        full: 'Установить и поддерживать одно и то же время подъёма ежедневно, независимо от качества ночного сна, чтобы выровнять суточный ритм.'
    },
    {
        id: 'sleep_evening_routine',
        group: 'sleep',
        title: 'Вечерняя рутина расслабления',
        short: 'Использовать спокойную вечернюю рутину.',
        full: 'Формировать перед сном спокойную вечернюю рутину: повторяющиеся действия, связанные с расслаблением и подготовкой ко сну, чтобы мозг ассоциировал их с засыпанием.'
    },
    {
        id: 'sleep_stretch_or_shower',
        group: 'sleep',
        title: 'Растяжка или тёплый душ',
        short: 'Использовать лёгкую растяжку или тёплый душ перед сном.',
        full: 'Использовать лёгкую растяжку, тёплый душ или ванну перед сном, если это переносится, как способ снижения мышечного и эмоционального напряжения.'
    },
    {
        id: 'sleep_avoid_late_conflicts',
        group: 'sleep',
        title: 'Избегать стимуляции вечером',
        short: 'Избегать тяжёлых разговоров и конфликтов вечером.',
        full: 'По возможности избегать тяжёлых эмоциональных разговоров, конфликтов и активной умственной/физической нагрузки в вечернее время, чтобы не провоцировать ухудшение сна.'
    },
    {
        id: 'sleep_minimal_light',
        group: 'sleep',
        title: 'Световой режим',
        short: 'Поддерживать минимальное освещение ночью.',
        full: 'Поддерживать минимальное освещение ночью, использовать приглушённый свет либо ночник, чтобы не «будить» организм ярким светом.'
    },
    {
        id: 'sleep_daytime_nap_limit',
        group: 'sleep',
        title: 'Ограничение дневного сна',
        short: 'Ограничить дневной сон до 20–30 минут или исключить.',
        full: 'Избегать длительного дневного сна; при необходимости ограничивать дневной сон до 20–30 минут и не спать днём во второй половине дня, чтобы не ухудшать ночной сон.'
    },
    {
        id: 'sleep_bed_only_for_sleep',
        group: 'sleep',
        title: 'Функция кровати',
        short: 'Использовать кровать только для сна и отдыха.',
        full: 'По возможности использовать кровать только для сна и отдыха, не работать и не есть в постели, чтобы сформировать устойчивую ассоциацию кровать=сон.'
    },
    {
        id: 'sleep_comfort_env',
        group: 'sleep',
        title: 'Комфортная среда для сна',
        short: 'Поддерживать комфортную температуру и влажность.',
        full: 'Поддерживать комфортную температуру, влажность и проветривание в спальне, подбирать удобное постельное бельё и одежду для сна.'
    },

    // ==== PSYCHOSIS (48–52) ====
    {
        id: 'psych_no_driving',
        group: 'psychosis',
        title: 'Безопасность при нарушениях восприятия',
        short: 'Избегать вождения и работы с опасными механизмами.',
        full: 'Избегать управления транспортом и работы с потенциально опасными механизмами при нарушении концентрации, восприятия или усилении психотической симптоматики.'
    },
    {
        id: 'psych_sleep_stability',
        group: 'psychosis',
        title: 'Стабильный сон при психозе',
        short: 'Поддерживать стабильный режим сна.',
        full: 'Поддерживать максимально стабильный режим сна, поскольку выраженный недосып и сбой суточного ритма могут усиливать психотические симптомы.'
    },
    {
        id: 'psych_report_worsening',
        group: 'psychosis',
        title: 'Сообщать о ухудшении',
        short: 'По возможности сообщать врачу об ухудшении симптомов.',
        full: 'По возможности сообщать врачу об усилении тревоги, подозрительности, галлюцинаций, нарушений мышления или поведения для своевременной коррекции терапии.'
    },
    {
        id: 'psych_med_adherence',
        group: 'psychosis',
        title: 'Соблюдение антипсихотической терапии',
        short: 'Принимать антипсихотические препараты строго по схеме врача.',
        full: 'Принимать антипсихотические препараты строго по схеме врача, не пропускать приём, не изменять дозу и не отменять лечение самостоятельно.'
    },
    {
        id: 'psych_emergency_help',
        group: 'psychosis',
        title: 'Помощь при значительном ухудшении',
        short: 'При значительном ухудшении обращаться за медицинской помощью.',
        full: 'При выраженном ухудшении состояния, появлении опасности для себя или окружающих рекомендуется обращаться за медицинской помощью в экстренном порядке.'
    },

    // ==== SUBSTANCE (53–56) ====
    {
        id: 'substance_no_use',
        group: 'substance',
        title: 'Отказ от употребления',
        short: 'Исключить употребление алкоголя и ПАВ.',
        full: 'Исключить употребление алкоголя и немедицинское употребление психоактивных веществ, учитывая их влияние на течение заболевания и эффективность лечения.'
    },
    {
        id: 'substance_env_avoid',
        group: 'substance',
        title: 'Избегать провоцирующей среды',
        short: 'Избегать ситуаций и окружений, связанных с употреблением.',
        full: 'Избегать компаний, мест и ситуаций, тесно связанных с употреблением алкоголя или других веществ, чтобы снизить риск рецидива.'
    },
    {
        id: 'substance_evening_structure',
        group: 'substance',
        title: 'Структурирование вечера',
        short: 'Структурировать вечернее время заранее.',
        full: 'Структурировать вечернее время заранее: планировать занятость и занятия, чтобы уменьшить вероятность автоматического обращения к веществам как к способу «разгрузки».'
    },
    {
        id: 'substance_urge_surfing',
        group: 'substance',
        title: 'Наблюдение за импульсом',
        short: 'Использовать техники наблюдения за импульсом (urge surfing).',
        full: 'Использовать техники наблюдения за импульсом (urge surfing): замечать желание употребить, описывать его волнообразный характер, не следуя импульсу автоматически.'
    },

    // ==== SUICIDE SAFETY (57–60) ====
    {
        id: 'suicide_talk_to_doctor',
        group: 'suicide',
        title: 'Обсуждение тяжёлых мыслей',
        short: 'Обсуждать тяжёлые переживания и мысли с врачом при возможности.',
        full: 'По возможности обсуждать возникающие тяжёлые переживания, чувства безнадёжности и суицидальные мысли с врачом, чтобы совместно искать способы снижения риска и облегчения состояния.'
    },
    {
        id: 'suicide_reduce_isolation',
        group: 'suicide',
        title: 'Снижение одиночества',
        short: 'Уменьшать одиночество в периоды напряжения.',
        full: 'Уменьшать одиночество в периоды сильного эмоционального напряжения: по возможности оставаться в контакте с людьми, которым пациент доверяет, либо рядом с членами семьи.'
    },
    {
        id: 'suicide_limit_means',
        group: 'suicide',
        title: 'Ограничение доступа к опасным предметам',
        short: 'Убирать потенциально опасные предметы при страхе потери контроля.',
        full: 'При страхе потери контроля или наличии суицидальных мыслей по возможности убирать из прямого доступа потенциально опасные предметы и вещества.'
    },
    {
        id: 'suicide_emergency_smp',
        group: 'suicide',
        title: 'Обращение в СМП при непреодолимом желании',
        short: 'При непреодолимом желании причинить себе вред обращаться в СМП.',
        full: 'При появлении непреодолимого желания причинить себе вред или невозможности самостоятельно контролировать поведение рекомендуется незамедлительно обращаться за экстренной медицинской помощью (служба скорой медицинской помощи).'
    },

    // ==== EXTRA (61–64) ====
    {
        id: 'extra_news_diet',
        group: 'extra',
        title: 'Информационная гигиена',
        short: 'Ограничивать потребление тревожных новостей и медиа.',
        full: 'Ограничивать потребление новостей и медиа-контента, усиливающего тревогу и напряжение, устанавливая для себя разумные временные рамки просмотра.'
    },
    {
        id: 'extra_mindfulness',
        group: 'extra',
        title: 'Осознанность',
        short: 'Использовать короткие практики осознанности 1–5 минут в день.',
        full: 'Использовать короткие практики осознанности (наблюдение за дыханием, телесными ощущениями, окружающими звуками) по 1–5 минут в день, чтобы тренировать способность оставаться в настоящем моменте.'
    },
    {
        id: 'extra_discuss_changes',
        group: 'extra',
        title: 'Обсуждение изменений состояния',
        short: 'Обсуждать изменения самочувствия с врачом по мере необходимости.',
        full: 'По мере необходимости обсуждать с врачом изменения в самочувствии, появление новых симптомов или изменение интенсивности уже имеющихся.'
    },
    {
        id: 'extra_delay_important_decisions',
        group: 'extra',
        title: 'Отсрочка важных решений',
        short: 'По возможности откладывать важные решения при нестабильном состоянии.',
        full: 'По возможности откладывать принятие важных жизненных решений (смена работы, разрыв отношений и т.п.) на период, когда состояние станет более стабильным и прогнозируемым.'
    }
];


// === ЛОГИКА КАРТОЧЕК РЕКОМЕНДАЦИЙ ===

// Сопоставление внутренних групп → русские названия
const GROUP_LABELS = {
    general: "Общие",
    sleep: "Сон",
    anxiety: "Тревога",
    ocd: "ОКР",
    suicide: "Суицид",
    depression: "Депрессия",
    psychosis: "Психоз",
    substance: "ПАВ",
    extra: "Дополнительно"
};

// Порядок отражения групп
const GROUP_ORDER = [
    "general",
    "anxiety",
    "sleep",
    "suicide",
    "depression",
    "ocd",
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
