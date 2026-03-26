// ============================================================
//   НОЗОЛОГИЧЕСКИЙ СОВЕТНИК — анализ симптомов по МКБ-10
// ============================================================

// ── A. Сбор данных из формы ──────────────────────────────────

function collectFormSymptoms() {
    // Вспомогательные функции
    function sel(id) {
        const el = document.getElementById(id);
        return el ? el.value : '';
    }
    function multi(name) {
        return Array.from(
            document.querySelectorAll('input[type="checkbox"][name="' + name + '"]:checked')
        ).map(function(cb) { return cb.value; }).filter(function(v) {
            return v !== 'D_OTHER' && v !== 'ДРУГОЕ';
        });
    }
    function idea(type) {
        return document.querySelector('.idea-checkbox[data-idea-type="' + type + '"]:checked') !== null;
    }
    function hallType(type) {
        return document.querySelector('.hall-type-checkbox[data-hall-type="' + type + '"]:checked') !== null;
    }

    var sleepValues = multi('sleep');
    var attentionValues = multi('attention');
    var memoryValues = multi('memory');

    return {
        // Настроение
        mood:                   sel('mood'),
        emotions:               multi('emotions'),
        emotions_stability:     sel('emotions_stability'),
        aggression:             sel('aggression'),
        suicidal_thoughts:      sel('suicidal_thoughts'),
        suicidal_plans:         sel('suicidal_plans'),

        // Мышление
        thinking_tempo:         sel('thinking_tempo'),
        thinking_productivity:  sel('thinking_productivity'),
        thinking_sequence:      sel('thinking_sequence'),
        thinking_goal:          sel('thinking_goal'),
        thinking_disorders:     multi('thinking_disorders'),
        thinking_mobility:      multi('thinking_mobility'),
        idea_obsessive:         idea('навязчивые'),
        idea_delusional:        idea('бредовые'),
        idea_overvalued:        idea('сверхценные'),
        idea_affective:         idea('аффективно обусловленные'),

        // Восприятие
        hallucination_analyzer:     multi('hallucination_analyzer'),
        hall_type_true:             hallType('Истинные галлюцинации'),
        hall_type_pseudo:           hallType('Псевдогаллюцинации'),
        psychic_automatism:         multi('psychic_automatism'),
        psychosensory_autopsychic:  multi('psychosensory_autopsychic'),
        psychosensory_derealization: multi('psychosensory_derealization'),

        // Память, внимание
        memory:     memoryValues,
        amnesia:    multi('amnesia'),
        attention:  attentionValues,

        // Сон, аппетит
        sleep:      sleepValues,
        appetite:   sel('appetite'),

        // Критика
        insight:    sel('insight'),
        distance:   sel('distance'),

        // Суицидальное поведение в анамнезе
        suicide_history_attempts: !!(document.getElementById('suicide_history_attempts') && document.getElementById('suicide_history_attempts').checked),
        suicide_history_nssi:     !!(document.getElementById('suicide_history_nssi') && document.getElementById('suicide_history_nssi').checked),

        // Вспомогательные булевы для удобства в критериях
        _sleepDisturbed: sleepValues.some(function(v) {
            return v !== 'удовлетворительный';
        }),
        _attentionImpaired: attentionValues.length > 0,
        _memoryImpaired: memoryValues.some(function(v) {
            return v !== 'не нарушена';
        }),
        _hasAnyHallucination: multi('hallucination_analyzer').length > 0 ||
            hallType('Истинные галлюцинации') || hallType('Псевдогаллюцинации'),
    };
}


// ── B. База диагностических критериев ───────────────────────

function computeDepressiveSeverity(symptoms, coreMet, additionalMet) {
    // F32.3: тяжёлая депрессия с психотическими симптомами
    var hasPsychotic = symptoms.idea_delusional ||
        (symptoms._hasAnyHallucination &&
         (symptoms.hall_type_true || symptoms.hall_type_pseudo));
    if (hasPsychotic && symptoms.mood === 'сниженное') return 'F32.3';
    if (coreMet >= 3 && additionalMet >= 4) return 'F32.2';
    if (coreMet >= 2 && additionalMet >= 3) return 'F32.1';
    return 'F32.0';
}

var NOSOLOGY_DB = [

    // ── F32 ДЕПРЕССИВНЫЙ ЭПИЗОД ──────────────────────────────
    {
        code: 'F32',
        name: 'Депрессивный эпизод',
        severityFn: computeDepressiveSeverity,
        criteria: [
            // Ядерные (core)
            {
                id: 'dep_mood',
                label: 'Сниженное настроение',
                weight: 'core', capturable: true,
                met: function(s) { return s.mood === 'сниженное'; }
            },
            {
                id: 'dep_anhedonia',
                label: 'Ангедония / утрата интересов',
                weight: 'core', capturable: false, met: null
            },
            {
                id: 'dep_energy',
                label: 'Снижение энергии / быстрая утомляемость',
                weight: 'core', capturable: false, met: null
            },
            // Дополнительные (additional)
            {
                id: 'dep_emotions_dep',
                label: 'Аффект с преобладанием депрессии',
                weight: 'additional', capturable: true,
                met: function(s) {
                    return s.emotions.indexOf('с преобладанием депрессии') !== -1 ||
                           s.emotions.indexOf('тусклые') !== -1 ||
                           s.emotions.indexOf('однообразные') !== -1 ||
                           s.emotions.indexOf('монотонные') !== -1;
                }
            },
            {
                id: 'dep_thinking_slow',
                label: 'Замедление мышления / снижение продуктивности',
                weight: 'additional', capturable: true,
                met: function(s) {
                    return s.thinking_tempo === 'замедлен' ||
                           s.thinking_productivity === 'снижена';
                }
            },
            {
                id: 'dep_sleep',
                label: 'Нарушения сна',
                weight: 'additional', capturable: true,
                met: function(s) { return s._sleepDisturbed; }
            },
            {
                id: 'dep_appetite',
                label: 'Снижение аппетита / анорексия',
                weight: 'additional', capturable: true,
                met: function(s) {
                    return s.appetite === 'снижен' || s.appetite === 'анорексия';
                }
            },
            {
                id: 'dep_suicidal',
                label: 'Суицидальные мысли или планы',
                weight: 'additional', capturable: true,
                met: function(s) {
                    return s.suicidal_thoughts === 'присутствуют' ||
                           s.suicidal_plans === 'присутствуют';
                }
            },
            {
                id: 'dep_attention',
                label: 'Снижение концентрации внимания',
                weight: 'additional', capturable: true,
                met: function(s) { return s._attentionImpaired; }
            },
            {
                id: 'dep_affective_ideas',
                label: 'Аффективно обусловленные идеи (вина, самообвинение)',
                weight: 'additional', capturable: true,
                met: function(s) { return s.idea_affective; }
            },
            {
                id: 'dep_selfesteem',
                label: 'Снижение самооценки, чувство вины, идеи малоценности',
                weight: 'additional', capturable: false, met: null
            },
            {
                id: 'dep_pessimism',
                label: 'Пессимистическая оценка будущего, безнадёжность',
                weight: 'additional', capturable: false, met: null
            },
            {
                id: 'dep_duration',
                label: 'Длительность симптомов ≥ 2 недель',
                weight: 'core', capturable: false, met: null
            },
        ]
    },

    // ── F30 МАНИАКАЛЬНЫЙ ЭПИЗОД ──────────────────────────────
    {
        code: 'F30',
        name: 'Маниакальный эпизод',
        criteria: [
            {
                id: 'man_mood',
                label: 'Повышенное настроение',
                weight: 'core', capturable: true,
                met: function(s) { return s.mood === 'повышенное'; }
            },
            {
                id: 'man_activity',
                label: 'Повышенная активность / возбуждение',
                weight: 'core', capturable: false, met: null
            },
            {
                id: 'man_duration',
                label: 'Длительность ≥ 7 дней',
                weight: 'core', capturable: false, met: null
            },
            {
                id: 'man_thinking_fast',
                label: 'Ускорение мышления',
                weight: 'additional', capturable: true,
                met: function(s) { return s.thinking_tempo === 'ускорен'; }
            },
            {
                id: 'man_productivity',
                label: 'Повышенная продуктивность мышления',
                weight: 'additional', capturable: true,
                met: function(s) { return s.thinking_productivity === 'повышена'; }
            },
            {
                id: 'man_sleep',
                label: 'Снижение потребности во сне',
                weight: 'additional', capturable: true,
                met: function(s) { return s.sleep.indexOf('отсутствует') !== -1; }
            },
            {
                id: 'man_overvalued',
                label: 'Сверхценные идеи / идеи грандиозности',
                weight: 'additional', capturable: true,
                met: function(s) { return s.idea_overvalued; }
            },
            {
                id: 'man_distance',
                label: 'Снижение или отсутствие чувства дистанции',
                weight: 'additional', capturable: true,
                met: function(s) {
                    return s.distance === 'снижено' || s.distance === 'отсутствует';
                }
            },
            {
                id: 'man_distractibility',
                label: 'Повышенная отвлекаемость',
                weight: 'additional', capturable: true,
                met: function(s) { return s._attentionImpaired; }
            },
            {
                id: 'man_instability',
                label: 'Неустойчивость эмоций',
                weight: 'additional', capturable: true,
                met: function(s) { return s.emotions_stability === 'неустойчивые'; }
            },
        ]
    },

    // ── F20.0 ПАРАНОИДНАЯ ШИЗОФРЕНИЯ ─────────────────────────
    {
        code: 'F20.0',
        name: 'Параноидная шизофрения',
        criteria: [
            // Симптомы 1-го ранга (Шнайдер) — core
            {
                id: 'sz_delusion',
                label: 'Бредовые идеи',
                weight: 'core', capturable: true,
                met: function(s) { return s.idea_delusional; }
            },
            {
                id: 'sz_pseudo',
                label: 'Псевдогаллюцинации (голоса в голове)',
                weight: 'core', capturable: true,
                met: function(s) { return s.hall_type_pseudo; }
            },
            {
                id: 'sz_auditory_true',
                label: 'Истинные слуховые галлюцинации',
                weight: 'core', capturable: true,
                met: function(s) {
                    return s.hall_type_true &&
                           s.hallucination_analyzer.indexOf('слуховые') !== -1;
                }
            },
            {
                id: 'sz_automatism',
                label: 'Психические автоматизмы',
                weight: 'core', capturable: true,
                met: function(s) { return s.psychic_automatism.length > 0; }
            },
            // Симптомы 2-го ранга / негативные — additional
            {
                id: 'sz_thinking_disorder',
                label: 'Формальные нарушения мышления (разорванное, паралогичное, бессвязное)',
                weight: 'additional', capturable: true,
                met: function(s) {
                    return s.thinking_disorders.indexOf('разорванное') !== -1 ||
                           s.thinking_disorders.indexOf('паралогичное') !== -1 ||
                           s.thinking_disorders.indexOf('соскальзывающее') !== -1 ||
                           s.thinking_disorders.indexOf('бессвязное') !== -1 ||
                           s.thinking_disorders.indexOf('аморфное') !== -1;
                }
            },
            {
                id: 'sz_flat_affect',
                label: 'Уплощение / выхолощенность аффекта',
                weight: 'additional', capturable: true,
                met: function(s) {
                    return s.emotions.indexOf('уплощенные') !== -1 ||
                           s.emotions.indexOf('выхолощенные') !== -1 ||
                           s.emotions.indexOf('тусклые') !== -1;
                }
            },
            {
                id: 'sz_inadequate_affect',
                label: 'Неадекватный аффект',
                weight: 'additional', capturable: true,
                met: function(s) {
                    return s.emotions.indexOf('неадекватные') !== -1;
                }
            },
            {
                id: 'sz_no_insight',
                label: 'Отсутствие критики к состоянию',
                weight: 'additional', capturable: true,
                met: function(s) { return s.insight === 'отсутствует'; }
            },
            {
                id: 'sz_duration',
                label: 'Длительность симптомов ≥ 1 месяца',
                weight: 'core', capturable: false, met: null
            },
            {
                id: 'sz_social',
                label: 'Снижение социального / профессионального функционирования',
                weight: 'additional', capturable: false, met: null
            },
        ]
    },

    // ── F23 ОСТРОЕ ПОЛИМОРФНОЕ ПСИХОТИЧЕСКОЕ РАССТРОЙСТВО ────
    {
        code: 'F23',
        name: 'Острое полиморфное психотическое расстройство',
        criteria: [
            {
                id: 'f23_delusion',
                label: 'Бредовые идеи',
                weight: 'core', capturable: true,
                met: function(s) { return s.idea_delusional; }
            },
            {
                id: 'f23_hallucinations',
                label: 'Галлюцинации любой модальности',
                weight: 'core', capturable: true,
                met: function(s) { return s._hasAnyHallucination; }
            },
            {
                id: 'f23_instability',
                label: 'Неустойчивость эмоций / быстрая смена симптомов',
                weight: 'additional', capturable: true,
                met: function(s) { return s.emotions_stability === 'неустойчивые'; }
            },
            {
                id: 'f23_thinking_seq',
                label: 'Нарушение последовательности мышления',
                weight: 'additional', capturable: true,
                met: function(s) { return s.thinking_sequence === 'нарушена'; }
            },
            {
                id: 'f23_onset',
                label: 'Острое начало симптомов (менее 2 недель)',
                weight: 'core', capturable: false, met: null
            },
            {
                id: 'f23_duration',
                label: 'Общая длительность эпизода < 3 месяцев',
                weight: 'core', capturable: false, met: null
            },
            {
                id: 'f23_polymorphic',
                label: 'Полиморфизм симптоматики, быстрая изменчивость',
                weight: 'core', capturable: false, met: null
            },
        ]
    },

    // ── F41.1 ГЕНЕРАЛИЗОВАННОЕ ТРЕВОЖНОЕ РАССТРОЙСТВО ────────
    {
        code: 'F41.1',
        name: 'Генерализованное тревожное расстройство',
        criteria: [
            {
                id: 'gad_anxiety',
                label: 'Преобладание тревожного аффекта',
                weight: 'core', capturable: true,
                met: function(s) {
                    return s.emotions.indexOf('с преобладанием тревоги') !== -1;
                }
            },
            {
                id: 'gad_instability',
                label: 'Неустойчивость эмоций',
                weight: 'additional', capturable: true,
                met: function(s) { return s.emotions_stability === 'неустойчивые'; }
            },
            {
                id: 'gad_sleep',
                label: 'Нарушения сна',
                weight: 'additional', capturable: true,
                met: function(s) { return s._sleepDisturbed; }
            },
            {
                id: 'gad_attention',
                label: 'Снижение концентрации',
                weight: 'additional', capturable: true,
                met: function(s) { return s._attentionImpaired; }
            },
            {
                id: 'gad_irritability',
                label: 'Преобладание раздражительности',
                weight: 'additional', capturable: true,
                met: function(s) {
                    return s.emotions.indexOf('с преобладанием раздражительности') !== -1;
                }
            },
            {
                id: 'gad_duration',
                label: 'Длительность ≥ 6 месяцев',
                weight: 'core', capturable: false, met: null
            },
            {
                id: 'gad_somatic',
                label: 'Вегетативные / соматические симптомы тревоги',
                weight: 'core', capturable: false, met: null
            },
            {
                id: 'gad_tension',
                label: 'Мышечное напряжение, невозможность расслабиться',
                weight: 'additional', capturable: false, met: null
            },
        ]
    },

    // ── F42 ОКР ──────────────────────────────────────────────
    {
        code: 'F42',
        name: 'Обсессивно-компульсивное расстройство',
        criteria: [
            {
                id: 'ocd_obsessions',
                label: 'Навязчивые идеи / обсессии',
                weight: 'core', capturable: true,
                met: function(s) { return s.idea_obsessive; }
            },
            {
                id: 'ocd_rigid',
                label: 'Ригидное или вязкое мышление',
                weight: 'additional', capturable: true,
                met: function(s) {
                    return s.thinking_mobility.indexOf('ригидное') !== -1 ||
                           s.thinking_mobility.indexOf('вязкое') !== -1 ||
                           s.thinking_mobility.indexOf('застревающее') !== -1;
                }
            },
            {
                id: 'ocd_attention',
                label: 'Снижение концентрации внимания',
                weight: 'additional', capturable: true,
                met: function(s) { return s._attentionImpaired; }
            },
            {
                id: 'ocd_sleep',
                label: 'Нарушения сна',
                weight: 'additional', capturable: true,
                met: function(s) { return s._sleepDisturbed; }
            },
            {
                id: 'ocd_compulsions',
                label: 'Компульсии (навязчивые действия, ритуалы)',
                weight: 'core', capturable: false, met: null
            },
            {
                id: 'ocd_resistance',
                label: 'Попытки сопротивляться навязчивостям',
                weight: 'additional', capturable: false, met: null
            },
            {
                id: 'ocd_distress',
                label: 'Значительный субъективный дистресс',
                weight: 'additional', capturable: false, met: null
            },
            {
                id: 'ocd_duration',
                label: 'Длительность ≥ 2 недель',
                weight: 'core', capturable: false, met: null
            },
        ]
    },

    // ── F43.1 ПТСР (частичная модель) ────────────────────────
    {
        code: 'F43.1',
        name: 'Посттравматическое стрессовое расстройство',
        criteria: [
            {
                id: 'ptsd_sleep',
                label: 'Нарушения сна (кошмары, прерывистый сон)',
                weight: 'additional', capturable: true,
                met: function(s) { return s._sleepDisturbed; }
            },
            {
                id: 'ptsd_attention',
                label: 'Снижение концентрации',
                weight: 'additional', capturable: true,
                met: function(s) { return s._attentionImpaired; }
            },
            {
                id: 'ptsd_anxiety',
                label: 'Тревожный аффект',
                weight: 'additional', capturable: true,
                met: function(s) {
                    return s.emotions.indexOf('с преобладанием тревоги') !== -1;
                }
            },
            {
                id: 'ptsd_suicidal',
                label: 'Суицидальные мысли',
                weight: 'additional', capturable: true,
                met: function(s) { return s.suicidal_thoughts === 'присутствуют'; }
            },
            {
                id: 'ptsd_trauma',
                label: 'Воздействие выраженной психической травмы',
                weight: 'core', capturable: false, met: null
            },
            {
                id: 'ptsd_flashbacks',
                label: 'Флэшбэки / навязчивые воспоминания о травме',
                weight: 'core', capturable: false, met: null
            },
            {
                id: 'ptsd_avoidance',
                label: 'Избегание напоминаний о травме',
                weight: 'core', capturable: false, met: null
            },
            {
                id: 'ptsd_hypervigilance',
                label: 'Гипербдительность / повышенная реакция испуга',
                weight: 'additional', capturable: false, met: null
            },
        ]
    },

    // ── F60.3 ЭМОЦИОНАЛЬНО НЕУСТОЙЧИВОЕ РЛ ──────────────────
    {
        code: 'F60.3',
        name: 'Эмоционально неустойчивое расстройство личности',
        criteria: [
            {
                id: 'eupd_instability',
                label: 'Выраженная неустойчивость эмоций',
                weight: 'core', capturable: true,
                met: function(s) { return s.emotions_stability === 'неустойчивые'; }
            },
            {
                id: 'eupd_irritability',
                label: 'Преобладание раздражительности',
                weight: 'additional', capturable: true,
                met: function(s) {
                    return s.emotions.indexOf('с преобладанием раздражительности') !== -1;
                }
            },
            {
                id: 'eupd_autoaggression',
                label: 'Аутоагрессия',
                weight: 'core', capturable: true,
                met: function(s) {
                    return s.aggression === 'в адрес себя (аутоагрессия)';
                }
            },
            {
                id: 'eupd_suicidal_thoughts',
                label: 'Суицидальные мысли',
                weight: 'additional', capturable: true,
                met: function(s) { return s.suicidal_thoughts === 'присутствуют'; }
            },
            {
                id: 'eupd_suicidal_plans',
                label: 'Суицидальные планы',
                weight: 'additional', capturable: true,
                met: function(s) { return s.suicidal_plans === 'присутствуют'; }
            },
            {
                id: 'eupd_history',
                label: 'Суицидальные попытки или самоповреждение в анамнезе',
                weight: 'core', capturable: true,
                met: function(s) {
                    return s.suicide_history_attempts || s.suicide_history_nssi;
                }
            },
            {
                id: 'eupd_sleep',
                label: 'Нарушения сна',
                weight: 'additional', capturable: true,
                met: function(s) { return s._sleepDisturbed; }
            },
            {
                id: 'eupd_impulsivity',
                label: 'Нарушения контроля импульсов (хронический паттерн)',
                weight: 'core', capturable: false, met: null
            },
            {
                id: 'eupd_emptiness',
                label: 'Хроническое чувство пустоты',
                weight: 'additional', capturable: false, met: null
            },
            {
                id: 'eupd_identity',
                label: 'Нарушения идентичности / образа «Я»',
                weight: 'additional', capturable: false, met: null
            },
            {
                id: 'eupd_onset',
                label: 'Начало расстройства в юношеском возрасте',
                weight: 'core', capturable: false, met: null
            },
        ]
    },

    // ── F31 БИПОЛЯРНОЕ АФФЕКТИВНОЕ РАССТРОЙСТВО ──────────────
    {
        code: 'F31',
        name: 'Биполярное аффективное расстройство',
        criteria: [
            {
                id: 'bar_current_mood',
                label: 'Выраженное изменение настроения (текущий эпизод)',
                weight: 'additional', capturable: true,
                met: function(s) {
                    return s.mood === 'повышенное' || s.mood === 'сниженное';
                }
            },
            {
                id: 'bar_thinking',
                label: 'Изменение темпа мышления',
                weight: 'additional', capturable: true,
                met: function(s) {
                    return s.thinking_tempo === 'ускорен' ||
                           s.thinking_tempo === 'замедлен';
                }
            },
            {
                id: 'bar_instability',
                label: 'Неустойчивость эмоций',
                weight: 'additional', capturable: true,
                met: function(s) { return s.emotions_stability === 'неустойчивые'; }
            },
            {
                id: 'bar_episodes',
                label: 'Два и более эпизодов в анамнезе (хотя бы один гипоманиакальный/маниакальный)',
                weight: 'core', capturable: false, met: null
            },
            {
                id: 'bar_polarity',
                label: 'Смена полюса настроения в анамнезе',
                weight: 'core', capturable: false, met: null
            },
        ]
    },

];


// ── C. Алгоритм сопоставления симптомов ─────────────────────

function matchNosologies(symptoms) {
    var results = [];

    for (var i = 0; i < NOSOLOGY_DB.length; i++) {
        var nosology = NOSOLOGY_DB[i];
        var criteria = nosology.criteria;

        var coreTotal = 0;
        var additionalTotal = 0;
        var coreMet = 0;
        var additionalMet = 0;
        var metList = [];
        var unmetList = [];
        var clarifyList = [];

        for (var j = 0; j < criteria.length; j++) {
            var c = criteria[j];

            // Все критерии (в т.ч. некаптируемые) учитываются в знаменателе
            if (c.weight === 'core') coreTotal++;
            else additionalTotal++;

            if (!c.capturable) {
                clarifyList.push(c);
                continue;
            }

            var isMet = c.met(symptoms);

            if (isMet) {
                if (c.weight === 'core') coreMet++;
                else additionalMet++;
                metList.push(c);
            } else {
                unmetList.push(c);
            }
        }

        var denominator = coreTotal + 0.5 * additionalTotal;
        var score = denominator > 0
            ? Math.round((coreMet + 0.5 * additionalMet) / denominator * 100)
            : 0;

        if (score >= 15 || coreMet >= 1) {
            var displayCode = nosology.code;
            if (nosology.severityFn) {
                displayCode = nosology.severityFn(symptoms, coreMet, additionalMet);
            }

            results.push({
                code: displayCode,
                name: nosology.name,
                score: score,
                coreMet: coreMet,
                coreTotal: coreTotal,
                additionalMet: additionalMet,
                additionalTotal: additionalTotal,
                metList: metList,
                unmetList: unmetList,
                clarifyList: clarifyList,
            });
        }
    }

    results.sort(function(a, b) {
        if (b.score !== a.score) return b.score - a.score;
        return b.coreMet - a.coreMet;
    });

    return results;
}


// ── D. Рендеринг ─────────────────────────────────────────────

function addDiagnosisCode(code, name, checked) {
    var field = document.getElementById('diagnosis');
    if (!field) return;

    var entry = code + ' ' + name;
    var current = field.value;
    var lines = current ? current.split('\n').map(function(l) { return l.trim(); }).filter(Boolean) : [];

    if (checked) {
        if (lines.indexOf(entry) === -1) {
            lines.push(entry);
            field.value = lines.join('\n');
        }
    } else {
        var idx = lines.indexOf(entry);
        if (idx !== -1) {
            lines.splice(idx, 1);
            field.value = lines.join('\n');
        }
    }
}

function buildNosologyCard(result) {
    var tier = result.score >= 60 ? 'high' : result.score >= 30 ? 'mid' : 'low';

    var card = document.createElement('div');
    card.className = 'nosology-card nosology-card--' + tier;

    // Заголовок (кликабельный для разворота)
    var header = document.createElement('div');
    header.className = 'nosology-card__header nosology-card__header--collapsed';

    // Чекбокс добавления в поле диагноза
    var cbLabel = document.createElement('label');
    cbLabel.className = 'nosology-card__select';
    cbLabel.title = 'Добавить в поле «Диагноз (шифры МКБ-10)»';

    var cb = document.createElement('input');
    cb.type = 'checkbox';
    cb.className = 'nosology-card__checkbox';
    cb.addEventListener('change', function(e) {
        e.stopPropagation();
        addDiagnosisCode(result.code, result.name, cb.checked);
    });

    cbLabel.appendChild(cb);
    header.appendChild(cbLabel);

    var codeSpan = document.createElement('span');
    codeSpan.className = 'nosology-card__code';
    codeSpan.textContent = result.code;
    header.appendChild(codeSpan);

    var nameSpan = document.createElement('span');
    nameSpan.className = 'nosology-card__name';
    nameSpan.textContent = result.name;
    header.appendChild(nameSpan);

    var scoreSpan = document.createElement('span');
    scoreSpan.className = 'nosology-card__score-label';
    scoreSpan.textContent = result.score + '%';
    header.appendChild(scoreSpan);

    var toggle = document.createElement('span');
    toggle.className = 'nosology-card__toggle';
    toggle.textContent = '▸';
    header.appendChild(toggle);

    card.appendChild(header);

    // Разворачиваемое тело карточки
    var body = document.createElement('div');
    body.className = 'nosology-card__body';

    // Прогресс-бар
    var bar = document.createElement('div');
    bar.className = 'nosology-card__score-bar';
    var fill = document.createElement('div');
    fill.className = 'nosology-card__score-fill';
    fill.style.width = result.score + '%';
    bar.appendChild(fill);
    body.appendChild(bar);

    // Критерии (met + unmet)
    var ul = document.createElement('ul');
    ul.className = 'nosology-card__criteria';

    result.metList.forEach(function(c) {
        var li = document.createElement('li');
        li.className = 'nosology-card__criterion nosology-card__criterion--met';
        li.textContent = c.label;
        ul.appendChild(li);
    });

    result.unmetList.forEach(function(c) {
        var li = document.createElement('li');
        li.className = 'nosology-card__criterion nosology-card__criterion--unmet';
        li.textContent = c.label;
        ul.appendChild(li);
    });

    body.appendChild(ul);

    // Блок "уточнить у пациента"
    if (result.clarifyList.length > 0) {
        var clarify = document.createElement('div');
        clarify.className = 'nosology-card__clarify';

        var title = document.createElement('div');
        title.className = 'nosology-card__clarify-title';
        title.textContent = 'Уточнить у пациента (не отражено в форме):';
        clarify.appendChild(title);

        var cul = document.createElement('ul');
        cul.className = 'nosology-card__clarify-list';

        result.clarifyList.forEach(function(c) {
            var li = document.createElement('li');
            li.className = 'nosology-card__clarify-item';
            li.textContent = c.label;
            cul.appendChild(li);
        });

        clarify.appendChild(cul);
        body.appendChild(clarify);
    }

    card.appendChild(body);

    // Клик по заголовку — разворачивает/сворачивает
    header.addEventListener('click', function(e) {
        if (e.target === cb || e.target === cbLabel) return;
        var collapsed = header.classList.toggle('nosology-card__header--collapsed');
        toggle.textContent = collapsed ? '▸' : '▾';
        body.style.display = collapsed ? 'none' : '';
    });

    // Начальное состояние — свёрнуто
    body.style.display = 'none';

    return card;
}

function renderNosologyResults(results) {
    var container = document.getElementById('nosology-results');
    if (!container) return;

    container.innerHTML = '';

    if (results.length === 0) {
        var msg = document.createElement('p');
        msg.className = 'nosology-empty';
        msg.textContent = 'Недостаточно заполненных данных для анализа. Заполните поля психического статуса.';
        container.appendChild(msg);
        return;
    }

    results.forEach(function(result) {
        container.appendChild(buildNosologyCard(result));
    });
}

function initNosologyAdvisor() {
    var btn = document.getElementById('nosology-run-btn');
    if (!btn) return;

    btn.addEventListener('click', function() {
        var symptoms = collectFormSymptoms();
        var results = matchNosologies(symptoms);
        renderNosologyResults(results);

        var hint = document.getElementById('nosology-last-run');
        if (hint) {
            var now = new Date();
            var hh = String(now.getHours()).padStart(2, '0');
            var mm = String(now.getMinutes()).padStart(2, '0');
            hint.textContent = 'Обновлено: ' + hh + ':' + mm;
        }
    });
}
