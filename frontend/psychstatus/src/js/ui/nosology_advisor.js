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

function computeBARManicSeverity(symptoms, _coreMet, _additionalMet) {
    var hasPsychotic = symptoms.idea_delusional ||
        (symptoms._hasAnyHallucination &&
         (symptoms.hall_type_true || symptoms.hall_type_pseudo));
    if (hasPsychotic) return 'F31.2';
    return 'F31.1';
}

function computeBARDepressiveSeverity(symptoms, coreMet, additionalMet) {
    var hasPsychotic = symptoms.idea_delusional ||
        (symptoms._hasAnyHallucination &&
         (symptoms.hall_type_true || symptoms.hall_type_pseudo));
    if (hasPsychotic && symptoms.mood === 'сниженное') return 'F31.5';
    if (coreMet >= 3 && additionalMet >= 4) return 'F31.4';
    return 'F31.3';
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
                label: 'Повышенное или гневливое (раздражительное) настроение',
                weight: 'core', capturable: true,
                met: function(s) { return s.mood === 'повышенное' || s.mood === 'гневливое'; }
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
                met: function(s) {
                    return s.sleep.indexOf('отсутствует') !== -1 ||
                           s.sleep.indexOf('снижение потребности во сне') !== -1;
                }
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
                id: 'man_aggression',
                label: 'Агрессия / раздражительность (при гневливой мании)',
                weight: 'additional', capturable: true,
                met: function(s) { return s.aggression === 'в адрес окружающих'; }
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

    // ── F31.0  БАР — ГИПОМАНИАКАЛЬНЫЙ ЭПИЗОД ─────────────────
    {
        code: 'F31.0',
        name: 'Биполярное расстройство, гипоманиакальный эпизод',
        severityFn: function(_s, _c, _a) { return 'F31.0'; },
        criteria: [
            {
                id: 'bar_hypo_mood',
                label: 'Повышенное или гневливое настроение',
                weight: 'core', capturable: true,
                met: function(s) { return s.mood === 'повышенное' || s.mood === 'гневливое'; }
            },
            {
                id: 'bar_hypo_activity',
                label: 'Повышенная активность / энергичность',
                weight: 'core', capturable: false, met: null
            },
            {
                id: 'bar_hypo_duration',
                label: 'Длительность ≥ 4 дней без выраженного нарушения функционирования',
                weight: 'core', capturable: false, met: null
            },
            {
                id: 'bar_episodes',
                label: '≥ 2 эпизодов в анамнезе',
                weight: 'core', capturable: false, met: null
            },
            {
                id: 'bar_polarity',
                label: 'Смена полюса настроения в анамнезе',
                weight: 'core', capturable: false, met: null
            },
            {
                id: 'bar_hypo_thinking',
                label: 'Ускорение мышления',
                weight: 'additional', capturable: true,
                met: function(s) { return s.thinking_tempo === 'ускорен'; }
            },
            {
                id: 'bar_hypo_sleep',
                label: 'Снижение потребности во сне',
                weight: 'additional', capturable: true,
                met: function(s) {
                    return s.sleep.indexOf('снижение потребности во сне') !== -1 ||
                           s.sleep.indexOf('отсутствует') !== -1;
                }
            },
            {
                id: 'bar_hypo_overvalued',
                label: 'Сверхценные идеи',
                weight: 'additional', capturable: true,
                met: function(s) { return s.idea_overvalued; }
            },
            {
                id: 'bar_hypo_distance',
                label: 'Снижение или отсутствие чувства дистанции',
                weight: 'additional', capturable: true,
                met: function(s) { return s.distance === 'снижено' || s.distance === 'отсутствует'; }
            },
            {
                id: 'bar_hypo_distractibility',
                label: 'Повышенная отвлекаемость',
                weight: 'additional', capturable: true,
                met: function(s) { return s._attentionImpaired; }
            },
            {
                id: 'bar_hypo_no_psychosis',
                label: 'Отсутствие психотических симптомов',
                weight: 'additional', capturable: false, met: null
            },
        ]
    },

    // ── F31.1/F31.2  БАР — МАНИАКАЛЬНЫЙ ЭПИЗОД ───────────────
    {
        code: 'F31.1',
        name: 'Биполярное расстройство, маниакальный эпизод',
        severityFn: computeBARManicSeverity,
        criteria: [
            {
                id: 'bar_man_mood',
                label: 'Повышенное или гневливое (раздражительное) настроение',
                weight: 'core', capturable: true,
                met: function(s) { return s.mood === 'повышенное' || s.mood === 'гневливое'; }
            },
            {
                id: 'bar_man_activity',
                label: 'Повышенная активность / возбуждение',
                weight: 'core', capturable: false, met: null
            },
            {
                id: 'bar_man_duration',
                label: 'Длительность ≥ 7 дней',
                weight: 'core', capturable: false, met: null
            },
            {
                id: 'bar_episodes',
                label: '≥ 2 эпизодов в анамнезе',
                weight: 'core', capturable: false, met: null
            },
            {
                id: 'bar_polarity',
                label: 'Смена полюса настроения в анамнезе',
                weight: 'core', capturable: false, met: null
            },
            {
                id: 'bar_man_thinking',
                label: 'Ускорение мышления',
                weight: 'additional', capturable: true,
                met: function(s) { return s.thinking_tempo === 'ускорен'; }
            },
            {
                id: 'bar_man_productivity',
                label: 'Повышенная продуктивность мышления',
                weight: 'additional', capturable: true,
                met: function(s) { return s.thinking_productivity === 'повышена'; }
            },
            {
                id: 'bar_man_sleep',
                label: 'Снижение потребности во сне',
                weight: 'additional', capturable: true,
                met: function(s) {
                    return s.sleep.indexOf('снижение потребности во сне') !== -1 ||
                           s.sleep.indexOf('отсутствует') !== -1;
                }
            },
            {
                id: 'bar_man_overvalued',
                label: 'Сверхценные идеи / идеи грандиозности',
                weight: 'additional', capturable: true,
                met: function(s) { return s.idea_overvalued; }
            },
            {
                id: 'bar_man_distance',
                label: 'Снижение или отсутствие чувства дистанции',
                weight: 'additional', capturable: true,
                met: function(s) { return s.distance === 'снижено' || s.distance === 'отсутствует'; }
            },
            {
                id: 'bar_man_distractibility',
                label: 'Повышенная отвлекаемость',
                weight: 'additional', capturable: true,
                met: function(s) { return s._attentionImpaired; }
            },
            {
                id: 'bar_man_aggression',
                label: 'Агрессия / раздражительность (при гневливой мании)',
                weight: 'additional', capturable: true,
                met: function(s) { return s.aggression === 'в адрес окружающих'; }
            },
        ]
    },

    // ── F31.3–F31.5  БАР — ДЕПРЕССИВНЫЙ ЭПИЗОД ───────────────
    {
        code: 'F31.3',
        name: 'Биполярное расстройство, депрессивный эпизод',
        severityFn: computeBARDepressiveSeverity,
        criteria: [
            {
                id: 'bar_dep_mood',
                label: 'Сниженное настроение',
                weight: 'core', capturable: true,
                met: function(s) { return s.mood === 'сниженное'; }
            },
            {
                id: 'bar_dep_anhedonia',
                label: 'Ангедония / утрата интересов',
                weight: 'core', capturable: false, met: null
            },
            {
                id: 'bar_dep_energy',
                label: 'Снижение энергии',
                weight: 'core', capturable: false, met: null
            },
            {
                id: 'bar_dep_duration',
                label: 'Длительность ≥ 2 недель',
                weight: 'core', capturable: false, met: null
            },
            {
                id: 'bar_episodes',
                label: '≥ 2 эпизодов в анамнезе',
                weight: 'core', capturable: false, met: null
            },
            {
                id: 'bar_polarity',
                label: 'Смена полюса настроения в анамнезе',
                weight: 'core', capturable: false, met: null
            },
            {
                id: 'bar_dep_emotions',
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
                id: 'bar_dep_thinking',
                label: 'Замедление мышления / снижение продуктивности',
                weight: 'additional', capturable: true,
                met: function(s) {
                    return s.thinking_tempo === 'замедлен' ||
                           s.thinking_productivity === 'снижена';
                }
            },
            {
                id: 'bar_dep_sleep',
                label: 'Нарушения сна',
                weight: 'additional', capturable: true,
                met: function(s) { return s._sleepDisturbed; }
            },
            {
                id: 'bar_dep_appetite',
                label: 'Снижение аппетита / анорексия',
                weight: 'additional', capturable: true,
                met: function(s) { return s.appetite === 'снижен' || s.appetite === 'анорексия'; }
            },
            {
                id: 'bar_dep_suicidal',
                label: 'Суицидальные мысли или планы',
                weight: 'additional', capturable: true,
                met: function(s) {
                    return s.suicidal_thoughts === 'присутствуют' ||
                           s.suicidal_plans === 'присутствуют';
                }
            },
            {
                id: 'bar_dep_attention',
                label: 'Снижение концентрации внимания',
                weight: 'additional', capturable: true,
                met: function(s) { return s._attentionImpaired; }
            },
            {
                id: 'bar_dep_affective_ideas',
                label: 'Аффективно обусловленные идеи (вина, самообвинение)',
                weight: 'additional', capturable: true,
                met: function(s) { return s.idea_affective; }
            },
            {
                id: 'bar_dep_selfesteem',
                label: 'Снижение самооценки, идеи малоценности',
                weight: 'additional', capturable: false, met: null
            },
            {
                id: 'bar_dep_pessimism',
                label: 'Безнадёжность, пессимизм',
                weight: 'additional', capturable: false, met: null
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

// Карта: id критерия → { scrollTo: id-элемента, expand: [id-multicheck-body, ...] }
var CRITERION_ANCHOR = {
    dep_mood:               { scrollTo: 'status-mood' },
    dep_emotions_dep:       { scrollTo: 'status-mood',            expand: ['emotions_body'] },
    dep_thinking_slow:      { scrollTo: 'status-thinking' },
    dep_sleep:              { scrollTo: 'status-sleep-appetite',  expand: ['sleep_body'] },
    dep_appetite:           { scrollTo: 'status-sleep-appetite' },
    dep_suicidal:           { scrollTo: 'status-mood' },
    dep_attention:          { scrollTo: 'status-attention',       expand: ['attention_body'] },
    dep_affective_ideas:    { scrollTo: 'ideas-block' },

    man_mood:               { scrollTo: 'status-mood' },
    man_thinking_fast:      { scrollTo: 'status-thinking' },
    man_productivity:       { scrollTo: 'status-thinking' },
    man_sleep:              { scrollTo: 'status-sleep-appetite',  expand: ['sleep_body'] },
    man_overvalued:         { scrollTo: 'ideas-block' },
    man_distance:           { scrollTo: 'status-insight' },
    man_distractibility:    { scrollTo: 'status-attention',       expand: ['attention_body'] },
    man_aggression:         { scrollTo: 'status-mood' },

    sz_delusion:            { scrollTo: 'ideas-block' },
    sz_pseudo:              { scrollTo: 'hallucinations_group' },
    sz_auditory_true:       { scrollTo: 'hallucinations_group' },
    sz_automatism:          { scrollTo: 'psychic_automatism_group' },
    sz_thinking_disorder:   { scrollTo: 'status-thinking',        expand: ['thinking_disorders_body'] },
    sz_flat_affect:         { scrollTo: 'status-mood',            expand: ['emotions_body'] },
    sz_inadequate_affect:   { scrollTo: 'status-mood',            expand: ['emotions_body'] },
    sz_no_insight:          { scrollTo: 'status-insight' },

    f23_delusion:           { scrollTo: 'ideas-block' },
    f23_hallucinations:     { scrollTo: 'hallucinations_group' },
    f23_instability:        { scrollTo: 'status-mood' },
    f23_thinking_seq:       { scrollTo: 'status-thinking' },

    gad_anxiety:            { scrollTo: 'status-mood',            expand: ['emotions_body'] },
    gad_instability:        { scrollTo: 'status-mood' },
    gad_sleep:              { scrollTo: 'status-sleep-appetite',  expand: ['sleep_body'] },
    gad_attention:          { scrollTo: 'status-attention',       expand: ['attention_body'] },
    gad_irritability:       { scrollTo: 'status-mood',            expand: ['emotions_body'] },

    ocd_obsessions:         { scrollTo: 'ideas-block' },
    ocd_rigid:              { scrollTo: 'status-thinking',        expand: ['thinking_mobility_body'] },
    ocd_attention:          { scrollTo: 'status-attention',       expand: ['attention_body'] },
    ocd_sleep:              { scrollTo: 'status-sleep-appetite',  expand: ['sleep_body'] },

    ptsd_sleep:             { scrollTo: 'status-sleep-appetite',  expand: ['sleep_body'] },
    ptsd_attention:         { scrollTo: 'status-attention',       expand: ['attention_body'] },
    ptsd_anxiety:           { scrollTo: 'status-mood',            expand: ['emotions_body'] },
    ptsd_suicidal:          { scrollTo: 'status-mood' },

    eupd_instability:       { scrollTo: 'status-mood' },
    eupd_irritability:      { scrollTo: 'status-mood',            expand: ['emotions_body'] },
    eupd_autoaggression:    { scrollTo: 'status-mood' },
    eupd_suicidal_thoughts: { scrollTo: 'status-mood' },
    eupd_suicidal_plans:    { scrollTo: 'status-mood' },
    eupd_history:           { scrollTo: 'status-mood',            expand: ['suicide_history_body'] },
    eupd_sleep:             { scrollTo: 'status-sleep-appetite',  expand: ['sleep_body'] },

    // BAR — гипоманиакальный эпизод
    bar_hypo_mood:              { scrollTo: 'status-mood' },
    bar_hypo_thinking:          { scrollTo: 'status-thinking' },
    bar_hypo_sleep:             { scrollTo: 'status-sleep-appetite',  expand: ['sleep_body'] },
    bar_hypo_overvalued:        { scrollTo: 'ideas-block' },
    bar_hypo_distance:          { scrollTo: 'status-insight' },
    bar_hypo_distractibility:   { scrollTo: 'status-attention',       expand: ['attention_body'] },

    // BAR — маниакальный эпизод
    bar_man_mood:               { scrollTo: 'status-mood' },
    bar_man_thinking:           { scrollTo: 'status-thinking' },
    bar_man_productivity:       { scrollTo: 'status-thinking' },
    bar_man_sleep:              { scrollTo: 'status-sleep-appetite',  expand: ['sleep_body'] },
    bar_man_overvalued:         { scrollTo: 'ideas-block' },
    bar_man_distance:           { scrollTo: 'status-insight' },
    bar_man_distractibility:    { scrollTo: 'status-attention',       expand: ['attention_body'] },
    bar_man_aggression:         { scrollTo: 'status-mood' },

    // BAR — депрессивный эпизод
    bar_dep_mood:               { scrollTo: 'status-mood' },
    bar_dep_emotions:           { scrollTo: 'status-mood',            expand: ['emotions_body'] },
    bar_dep_thinking:           { scrollTo: 'status-thinking' },
    bar_dep_sleep:              { scrollTo: 'status-sleep-appetite',  expand: ['sleep_body'] },
    bar_dep_appetite:           { scrollTo: 'status-sleep-appetite' },
    bar_dep_suicidal:           { scrollTo: 'status-mood' },
    bar_dep_attention:          { scrollTo: 'status-attention',       expand: ['attention_body'] },
    bar_dep_affective_ideas:    { scrollTo: 'ideas-block' },
};

function scrollToFormSection(criterionId) {
    var anchor = CRITERION_ANCHOR[criterionId];
    if (!anchor) return;

    // Раскрыть multicheck-группы
    if (anchor.expand) {
        anchor.expand.forEach(function(bodyId) {
            var body = document.getElementById(bodyId);
            if (body && !body.classList.contains('open')) {
                body.classList.add('open');
            }
        });
    }

    var target = document.getElementById(anchor.scrollTo);
    if (!target) return;

    // Если цель — <details>, раскрыть её и всех предков
    var el = target;
    while (el) {
        if (el.tagName === 'DETAILS') el.open = true;
        el = el.parentElement;
    }

    target.scrollIntoView({ behavior: 'smooth', block: 'start' });

    target.classList.add('nosology-anchor-highlight');
    setTimeout(function() { target.classList.remove('nosology-anchor-highlight'); }, 2000);
}

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

function makeCriterionLabel(c) {
    if (!CRITERION_ANCHOR[c.id]) {
        var span = document.createElement('span');
        span.textContent = c.label;
        return span;
    }
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'nosology-criterion-link';
    btn.title = 'Перейти к полю в форме';
    btn.innerHTML = c.label + '<span class="nosology-criterion-link__icon">↗</span>';
    btn.addEventListener('click', function(e) {
        e.stopPropagation();
        scrollToFormSection(c.id);
    });
    return btn;
}

// Хранилище отмеченных чекбоксов "Уточнить у пациента"
var _checkedClarifyLabels = {};

// Публичная функция — вызывается из generateText() в builder.js
function getCheckedClarifyTexts() {
    return Object.keys(_checkedClarifyLabels).map(function(k) {
        return _checkedClarifyLabels[k];
    });
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
        li.appendChild(makeCriterionLabel(c));
        ul.appendChild(li);
    });

    result.unmetList.forEach(function(c) {
        var li = document.createElement('li');
        li.className = 'nosology-card__criterion nosology-card__criterion--unmet';
        li.appendChild(makeCriterionLabel(c));
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

        var grid = document.createElement('div');
        grid.className = 'nosology-card__clarify-grid';

        result.clarifyList.forEach(function(c) {
            var lbl = document.createElement('label');
            lbl.className = 'nosology-card__clarify-item';

            var cbItem = document.createElement('input');
            cbItem.type = 'checkbox';
            cbItem.className = 'nosology-card__clarify-checkbox';

            (function(criterion) {
                var key = result.code + '__' + criterion.id;
                cbItem.addEventListener('change', function() {
                    if (cbItem.checked) {
                        _checkedClarifyLabels[key] = criterion.label;
                    } else {
                        delete _checkedClarifyLabels[key];
                    }
                });
            }(c));

            var txt = document.createElement('span');
            txt.textContent = c.label;
            lbl.appendChild(cbItem);
            lbl.appendChild(txt);
            grid.appendChild(lbl);
        });

        clarify.appendChild(grid);
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
