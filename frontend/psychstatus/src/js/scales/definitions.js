(function (S) {
    'use strict';
    const source = {
        sops: 'https://medicine.yale.edu/psychiatry/research/clinics-and-programs/prime-clinic/assessment-training/',
        bnss: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC3044634/',
        cdss: 'https://cumming.ucalgary.ca/research/calgary-depression-scale-schizophrenia',
        spia: 'https://www.fioritieditore.com/',
        cssrs: 'https://cssrs.columbia.edu/the-columbia-scale-c-ssrs/translations/'
    };
    function group(id, label, ids, max) { return { id, label, items: ids, max }; }
    function codes(prefix, count) { return Array.from({ length: count }, (_, i) => prefix + (i + 1)); }
    function numericItems(groups, max) {
        return groups.flatMap(g => g.items.map(id => ({ id, label: id, group: g.id, min: 0, max })));
    }
    const scoreNotice = 'Регистрация баллов по оригинальному бланку. Полное интервью, русские формулировки и оценочные якоря не встроены: разрешение на их цифровое воспроизведение не подтверждено. Используйте разрешённую версию методики; этот экран не заменяет интервью.';
    const sopsGroups = [
        group('positive', 'Позитивные симптомы', codes('P', 5), 30),
        group('negative', 'Негативные симптомы', codes('N', 6), 36),
        group('disorganization', 'Дезорганизация', codes('D', 4), 24),
        group('general', 'Общие симптомы', codes('G', 4), 24)
    ];
    S.registerDefinition({
        id: 'sops', name: 'SOPS', title: 'Продромальные симптомы', mode: 'scores',
        version: '19 пунктов · регистрация баллов 1.0', translationVersion: 'Текст перевода не встроен',
        source: source.sops, period: 'Последний месяц; уточнить по используемой версии',
        notice: scoreNotice + ' SOPS — компонент SIPS; по одним баллам нельзя устанавливать синдром высокого риска психоза.',
        groups: sopsGroups, items: numericItems(sopsGroups, 6), rights: { fullText: false, status: 'pending' }
    });
    const bnssGroups = [
        group('anhedonia', 'Ангедония', ['B1', 'B2', 'B3'], 18),
        group('distress', 'Отсутствие переживания дистресса', ['B4'], 6),
        group('asociality', 'Асоциальность', ['B5', 'B6'], 12),
        group('avolition', 'Абулия', ['B7', 'B8'], 12),
        group('affect', 'Уплощение аффекта', ['B9', 'B10', 'B11'], 18),
        group('alogia', 'Алогия', ['B12', 'B13'], 12)
    ];
    S.registerDefinition({
        id: 'bnss', name: 'BNSS', title: 'Негативная симптоматика', mode: 'scores',
        version: '13 пунктов · регистрация баллов 1.0', translationVersion: 'Текст перевода не встроен',
        source: source.bnss, period: 'Последняя неделя', notice: scoreNotice,
        groups: bnssGroups, items: numericItems(bnssGroups, 6),
        domainDefinitions: [
            group('motivation', 'Апато-мотивационный домен', ['B1', 'B2', 'B3', 'B5', 'B6', 'B7', 'B8'], 42),
            group('expression', 'Экспрессивный домен', ['B9', 'B10', 'B11', 'B12', 'B13'], 30)
        ], rights: { fullText: false, status: 'pending' }
    });
    const cdssGroups = [group('total', 'Регистрация баллов CDSS', codes('C', 9), 27)];
    S.registerDefinition({
        id: 'cdss', name: 'CDSS', title: 'Депрессивная симптоматика', mode: 'scores',
        version: '9 пунктов · регистрация баллов 1.0', translationVersion: 'Утверждённый перевод не встроен',
        source: source.cdss, period: 'Последние две недели', notice: scoreNotice + ' Для цифрового интервью требуется согласование с Mapi Research Trust.',
        groups: cdssGroups, items: numericItems(cdssGroups, 3), rights: { fullText: false, status: 'permission-required' }
    });
    S.registerDefinition({
        id: 'spi-a', name: 'SPI-A', title: 'Базисные симптомы', mode: 'preparation',
        version: 'Техническое пространство 1.0', translationVersion: 'Лицензированный русский текст не встроен',
        source: source.spia, period: 'Указать клинический период', groups: [], items: [],
        notice: 'Подготовительное пространство, не валидированное интервью SPI-A. Полный текст и алгоритмы COGDIS/COPER требуют разрешённых исходных материалов и клинической проверки. Результат всегда «Недостаточно данных»; автоматическое включение в заключение недоступно.',
        rights: { fullText: false, status: 'permission-required' }
    });
    S.registerDefinition({
        id: 'cssrs', name: 'C-SSRS', title: 'Скрининг суицидальных мыслей и поведения', mode: 'cssrs',
        version: 'Screen Version - Recent; официальный PDF без печатной даты ревизии',
        translationVersion: 'Официальный русский PDF Columbia; получен 20.10.2026',
        source: source.cssrs, period: 'Мысли — последний месяц; поведение — за жизнь / последние 3 месяца',
        defaultForm: 'recent', approvedForms: ['recent'],
        forms: [
            { id: 'recent', label: 'Screen Version — Recent (официальный русский скрининг)', enabled: true },
            { id: 'followup', label: 'После последнего визита — ожидается официальный русский бланк', enabled: false }
        ],
        groups: [{ id: 'screening', label: 'Официальные скрининговые вопросы', items: ['q1','q2','q3','q4','q5','q6','q6recent'] }],
        notice: 'C-SSRS Screen Version — Recent: официальный русский скрининг. Это не полное клиническое интервью. Вопросы 1–2 и 6 обязательны; при ответе «Да» на вопрос 2 задаются 3–5, при «Да» на 6 уточняются последние 3 месяца. Интенсивность мыслей и отдельные типы поведения этой формой не оцениваются. Категория риска автоматически не присваивается. Для формы «После последнего визита» ещё нужен официальный русский материал.',
        rights: { fullText: true, status: 'clinical-ehr-permitted', permissionSource: 'https://cssrs.columbia.edu/the-columbia-scale-c-ssrs/cssrs-for-communities-and-healthcare/', researchPermission: 'Проверить отдельно для клинических исследований и коммерческих продуктов' },
        items: [
  {
    "id": "q1",
    "label": "Последний месяц",
    "question": "Возникало ли у Вас желание умереть или заснуть и не просыпаться?",
    "instruction": "Задайте вопросы 1 и 2",
    "group": "screening",
    "options": [
      {
        "value": true,
        "label": "Да"
      },
      {
        "value": false,
        "label": "Нет"
      }
    ]
  },
  {
    "id": "q2",
    "label": "Последний месяц",
    "question": "Думали ли Вы в самом деле о том, чтобы убить себя?",
    "instruction": "ЕСЛИ ДА 2, Задайте вопросы 3, 4, 5 и 6. ЕСЛИ Нет, Задайте вопросы 6.",
    "group": "screening",
    "options": [
      {
        "value": true,
        "label": "Да"
      },
      {
        "value": false,
        "label": "Нет"
      }
    ]
  },
  {
    "id": "q3",
    "label": "Последний месяц",
    "question": "Думали ли Вы о том, как Вы могли бы это сделать?",
    "instruction": "Пациент подтверждает, что его посещают мысли о самоубийстве и что в течение периода наблюдения он/она думал(-а) хотя бы об одном способе самоубийства. Данная ситуация отлична от такой, когда пациент разработал конкретный план: время, место или детали метода самоубийства (например, пациент думал о способе самоубийства, но не о конкретном плане). Сюда относятся люди, которые скажут: “Я думал(-а) о передозировке таблеток, но так и не построил(-а) конкретного плана о том, когда, где и как осуществить это…..и я бы никогда не довёл(-а) дело до конца”.",
    "group": "screening",
    "options": [
      {
        "value": true,
        "label": "Да"
      },
      {
        "value": false,
        "label": "Нет"
      }
    ]
  },
  {
    "id": "q4",
    "label": "Последний месяц",
    "question": "Посещали ли Вас подобные мысли, и было ли у Вас какое-нибудь намерение действовать в соответствии с ними?",
    "instruction": "Активные мысли о самоубийстве при заявлении пациента о некотором намерении действовать в соответствии с этими мыслями, в отличие от подобного утверждения: “Такие мысли посещают меня, но я определенно не стану ничего предпринимать”.",
    "group": "screening",
    "options": [
      {
        "value": true,
        "label": "Да"
      },
      {
        "value": false,
        "label": "Нет"
      }
    ]
  },
  {
    "id": "q5",
    "label": "Последний месяц",
    "question": "Начали ли Вы разрабатывать или уже разработали детальный план самоубийства? Намереваетесь ли Вы осуществить этот план?",
    "instruction": null,
    "group": "screening",
    "options": [
      {
        "value": true,
        "label": "Да"
      },
      {
        "value": false,
        "label": "Нет"
      }
    ]
  },
  {
    "id": "q6",
    "label": "Когда-либо в течение жизни",
    "question": "Вы когда-нибудь что-нибудь делали, начинали что-то делать или готовились сделать что-нибудь, чтобы покончить с собой?",
    "instruction": "Примеры: запаслись таблетками, приобрели пистолет, раздали ценные вещи, написали завещание или предсмертную записку, запаслись таблетками, но не проглотили их, держали пистолет, но передумали стрелять или его кто-то выхватил из вашей руки, поднялись на крышу, но не прыгнули; или принимали таблетки, пытались застрелиться, порезались, пытался повеситься и т. д.",
    "group": "screening",
    "options": [
      {
        "value": true,
        "label": "Да"
      },
      {
        "value": false,
        "label": "Нет"
      }
    ]
  },
  {
    "id": "q6recent",
    "label": "Последние 3 месяца",
    "question": "ЕСЛИ ДА, то было ли это в последние 3 месяца?",
    "instruction": null,
    "group": "screening",
    "options": [
      {
        "value": true,
        "label": "Да"
      },
      {
        "value": false,
        "label": "Нет"
      }
    ]
  }
]
    });
})(globalThis.PsyScales);
