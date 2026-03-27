// Словарь психиатрических препаратов
// Структура: { substance, brand, analogs[] }
// Аналоги ранжированы по соотношению эффективность / переносимость
// МНН → оригинал → дженерики (от лучших к менее предпочтительным)

const RX_DRUG_DICT = [

    // ──────────────────── АНТИДЕПРЕССАНТЫ ────────────────────

    // СИОЗС
    { substance: 'Сертралин',       brand: 'Золофт',        analogs: ['Асентра', 'Серлифт', 'Торин', 'Стимулотон'] },
    { substance: 'Эсциталопрам',    brand: 'Ципралекс',     analogs: ['Элицея', 'Ленуксин', 'Эйсипи', 'Экохел'] },
    { substance: 'Флуоксетин',      brand: 'Прозак',        analogs: ['Профлузак', 'Флуоксетин Канон', 'Депрекс', 'Портал'] },
    { substance: 'Пароксетин',      brand: 'Паксил',        analogs: ['Рексетин', 'Адепресс', 'Сирестил', 'Плизил'] },
    { substance: 'Циталопрам',      brand: 'Ципрамил',      analogs: ['Прам', 'Опра', 'Цитол'] },
    { substance: 'Флувоксамин',     brand: 'Феварин',       analogs: ['Флоксифрал', 'Флувоксамин Канон'] },

    // СИОЗСН
    { substance: 'Венлафаксин',     brand: 'Велаксин',      analogs: ['Эфевелон', 'Велафакс', 'Алвента', 'Эффексор'] },
    { substance: 'Дулоксетин',      brand: 'Симбалта',      analogs: ['Дулоксент', 'Дузела', 'Дулоксетин Канон'] },
    { substance: 'Милнаципран',     brand: 'Иксел',         analogs: [] },

    // НаССА
    { substance: 'Миртазапин',      brand: 'Ремерон',       analogs: ['Каликста', 'Миртазон', 'Мирзатен'] },

    // НССИ
    { substance: 'Вортиоксетин',    brand: 'Бринтелликс',   analogs: ['Тринтелликс'] },

    // Мелатонинергические
    { substance: 'Агомелатин',      brand: 'Вальдоксан',    analogs: ['Тайминал', 'Агомелатин Канон'] },

    // СДЗС
    { substance: 'Тразодон',        brand: 'Триттико',      analogs: ['Олептро'] },

    // СИОЗН
    { substance: 'Бупропион',       brand: 'Велбутрин',     analogs: ['Зибан'] },

    // Трициклические
    { substance: 'Амитриптилин',    brand: 'Триптизол',     analogs: ['Амитриптилин Никомед', 'Саротен'] },
    { substance: 'Кломипрамин',     brand: 'Анафранил',     analogs: ['Хлорипрамин'] },
    { substance: 'Имипрамин',       brand: 'Мелипрамин',    analogs: ['Тофранил', 'Имипрамин Никомед'] },
    { substance: 'Нортриптилин',    brand: 'Авентил',       analogs: ['Памелор'] },

    // Обратимые ИМАО
    { substance: 'Пирлиндол',       brand: 'Пиразидол',     analogs: [] },
    { substance: 'Моклобемид',      brand: 'Аурорикс',      analogs: [] },

    // ──────────────────── АНТИПСИХОТИКИ (АТИПИЧНЫЕ) ────────────────────

    { substance: 'Клозапин',        brand: 'Азалептин',     analogs: ['Лепонекс', 'Клозастен'] },
    { substance: 'Рисперидон',      brand: 'Рисполепт',     analogs: ['Нейрипти', 'Сперидан', 'Риспаксол', 'Риссет'] },
    { substance: 'Оланзапин',       brand: 'Зипрекса',      analogs: ['Нормитон', 'Заласта', 'Парнасан'] },
    { substance: 'Кветиапин',       brand: 'Сероквель',     analogs: ['Кветирон', 'Лаквель', 'Кетилепт'] },
    { substance: 'Арипипразол',     brand: 'Абилифай',      analogs: ['Арип МТ', 'Арипипразол Алмус', 'Зилоксера'] },
    { substance: 'Амисульприд',     brand: 'Солиан',        analogs: [] },
    { substance: 'Зипрасидон',      brand: 'Зелдокс',       analogs: ['Гедеон'] },
    { substance: 'Сертиндол',       brand: 'Сердолект',     analogs: [] },
    { substance: 'Палиперидон',     brand: 'Инвега',        analogs: [] },
    { substance: 'Луразидон',       brand: 'Латуда',        analogs: [] },
    { substance: 'Карипразин',      brand: 'Реагила',       analogs: [] },
    { substance: 'Брекспипразол',   brand: 'Рексулти',      analogs: [] },
    { substance: 'Азенапин',        brand: 'Сапфрис',       analogs: [] },
    { substance: 'Иллоперидон',     brand: 'Фанапт',        analogs: [] },

    // ──────────────────── АНТИПСИХОТИКИ (ТИПИЧНЫЕ) ────────────────────

    { substance: 'Галоперидол',     brand: 'Галоперидол деканоат', analogs: ['Сенорм', 'Галоперидол Никомед'] },
    { substance: 'Хлорпромазин',    brand: 'Аминазин',      analogs: [] },
    { substance: 'Трифлуоперазин',  brand: 'Трифтазин',     analogs: ['Трифлуоперазин Никомед'] },
    { substance: 'Перфеназин',      brand: 'Этаперазин',    analogs: [] },
    { substance: 'Тиоридазин',      brand: 'Сонапакс',      analogs: ['Меллерил'] },
    { substance: 'Флуфеназин',      brand: 'Модитен',       analogs: ['Флупентиксол пролонг'] },
    { substance: 'Зуклопентиксол',  brand: 'Клопиксол',     analogs: [] },
    { substance: 'Флупентиксол',    brand: 'Флюанксол',     analogs: [] },
    { substance: 'Тиопроперазин',   brand: 'Мажептил',      analogs: [] },
    { substance: 'Хлорпротиксен',   brand: 'Труксал',       analogs: [] },
    { substance: 'Левомепромазин',  brand: 'Тизерцин',      analogs: [] },
    { substance: 'Сульпирид',       brand: 'Эглонил',       analogs: ['Просульпин', 'Сульпирид Никомед'] },

    // ──────────────────── НОРМОТИМИКИ ────────────────────

    { substance: 'Лития карбонат',  brand: 'Контемнол',     analogs: ['Микалит', 'Квилонорм', 'Манталит'] },
    { substance: 'Вальпроевая кислота', brand: 'Депакин',   analogs: ['Конвулекс', 'Вальпарин', 'Орфирил', 'Депакин Хроно'] },
    { substance: 'Карбамазепин',    brand: 'Тегретол',      analogs: ['Финлепсин', 'Тимонил', 'Карбалекс'] },
    { substance: 'Ламотриджин',     brand: 'Ламиктал',      analogs: ['Ламитор', 'Ламолеп', 'Сейзар', 'Конвульсан'] },
    { substance: 'Окскарбазепин',   brand: 'Трилептал',     analogs: ['Апилепсин'] },
    { substance: 'Топирамат',       brand: 'Топамакс',      analogs: ['Макситопир', 'Тореал', 'Топсавер'] },
    { substance: 'Прегабалин',      brand: 'Лирика',        analogs: ['Альгерика', 'Прегабалин Канон'] },
    { substance: 'Габапентин',      brand: 'Нейронтин',     analogs: ['Катэна', 'Гарбапентин Тева'] },

    // ──────────────────── АНКСИОЛИТИКИ ────────────────────

    // Бензодиазепины
    { substance: 'Диазепам',        brand: 'Реланиум',      analogs: ['Седуксен', 'Сибазон', 'Апаурин', 'Валиум'] },
    { substance: 'Алпразолам',      brand: 'Ксанакс',       analogs: ['Алзолам', 'Кассадан', 'Хелекс'] },
    { substance: 'Клоназепам',      brand: 'Ривотрил',      analogs: ['Антелепсин', 'Клоназепам Тева'] },
    { substance: 'Лоразепам',       brand: 'Лорафен',       analogs: ['Мерлит', 'Ативан'] },
    { substance: 'Феназепам',       brand: 'Феназепам',     analogs: ['Транквезипам', 'Фензитат'] },
    { substance: 'Оксазепам',       brand: 'Нозепам',       analogs: ['Тазепам', 'Серакс'] },
    { substance: 'Медазепам',       brand: 'Рудотель',      analogs: ['Мезапам'] },
    { substance: 'Бромазепам',      brand: 'Лексотан',      analogs: [] },
    { substance: 'Хлордиазепоксид', brand: 'Либриум',       analogs: ['Элениум'] },

    // Небензодиазепиновые
    { substance: 'Гидроксизин',     brand: 'Атаракс',       analogs: ['Вистарил'] },
    { substance: 'Буспирон',        brand: 'Спитомин',      analogs: ['Буспирон Никомед'] },
    { substance: 'Тофизопам',       brand: 'Грандаксин',    analogs: [] },
    { substance: 'Фабомотизол',     brand: 'Афобазол',      analogs: [] },
    { substance: 'Мепробамат',      brand: 'Мепробамат',    analogs: [] },

    // ──────────────────── СНОТВОРНЫЕ ────────────────────

    { substance: 'Зопиклон',        brand: 'Имован',        analogs: ['Пиклодорм', 'Релаксон', 'Сомнол'] },
    { substance: 'Золпидем',        brand: 'Санвал',        analogs: ['Нитрест', 'Ивадал', 'Гипноген'] },
    { substance: 'Залеплон',        brand: 'Соната',        analogs: [] },
    { substance: 'Мелатонин',       brand: 'Мелаксен',      analogs: ['Мелатонин Эвалар', 'Циркадин'] },
    { substance: 'Доксиламин',      brand: 'Донормил',      analogs: ['Реслип', 'Сонмил'] },
    { substance: 'Нитразепам',      brand: 'Радедорм',      analogs: ['Эуноктин'] },

    // ──────────────────── КОРРЕКТОРЫ ЭПС ────────────────────

    { substance: 'Бипериден',       brand: 'Акинетон',      analogs: [] },
    { substance: 'Тригексифенидил', brand: 'Циклодол',      analogs: ['Паркопан', 'Артан'] },

    // ──────────────────── НООТРОПЫ ────────────────────

    { substance: 'Пирацетам',       brand: 'Ноотропил',     analogs: ['Луцетам', 'Пирацетам Канон'] },
    { substance: 'Фенибут',         brand: 'Ноофен',        analogs: ['Анвифен', 'Бифрен', 'Фенибут Экстра'] },
    { substance: 'Этилметилгидроксипиридина сукцинат', brand: 'Мексидол', analogs: ['Мексиприм', 'Нейрокс'] },
    { substance: 'Глицин',          brand: 'Глицин',        analogs: ['Биотредин', 'Глицин Форте Эвалар'] },
    { substance: 'Цитиколин',       brand: 'Цераксон',      analogs: ['Сомазина', 'Нейроцитин', 'Нейрохолин'] },
    { substance: 'Холина альфосцерат', brand: 'Глиатилин',  analogs: ['Церетон', 'Делецит', 'Холитилин'] },
    { substance: 'Ницерголин',      brand: 'Сермион',       analogs: [] },
    { substance: 'Винпоцетин',      brand: 'Кавинтон',      analogs: ['Бравинтон', 'Телектол'] },

    // ──────────────────── ПРЕПАРАТЫ ПРИ ДЕМЕНЦИИ ────────────────────

    { substance: 'Донепезил',       brand: 'Арисепт',       analogs: ['Алзепил', 'Яснал', 'Донепезил Канон'] },
    { substance: 'Ривастигмин',     brand: 'Экселон',       analogs: ['Ривастигмин Тева'] },
    { substance: 'Галантамин',      brand: 'Реминил',       analogs: ['Нивалин', 'Галантамин Канон'] },
    { substance: 'Мемантин',        brand: 'Акатинол',      analogs: ['Мемантал', 'Нооджерон', 'Меморель', 'Мемантин Эвалар'] },

    // ──────────────────── ПРЕПАРАТЫ ПРИ СДВГ ────────────────────

    { substance: 'Атомоксетин',     brand: 'Страттера',     analogs: ['Атомоксетин Алмус'] },

    // ──────────────────── РАЗНОЕ ────────────────────

    { substance: 'Вальпроат натрия', brand: 'Депакин Хроно', analogs: ['Депакин Хроносфера'] },
    { substance: 'Тиоктовая кислота', brand: 'Берлитион',   analogs: ['Тиоктацид', 'Октолипен'] },
    { substance: 'Этанол',          brand: 'Дисульфирам',   analogs: ['Эспераль', 'Тетурам', 'Лидевин'] },
    { substance: 'Налтрексон',      brand: 'Вивитрол',      analogs: ['Налтрексон Авексима'] },
    { substance: 'Акампросат',      brand: 'Акампросат',    analogs: ['Кампрал'] },

];

// ── Вычисляем все варианты поиска для каждой записи один раз ──
const RX_DICT_INDEX = RX_DRUG_DICT.map(function (item) {
    var displayLabel = item.substance;
    var parts = [item.brand].concat(item.analogs).filter(Boolean);
    if (parts.length > 0) {
        displayLabel += ' (' + parts.join(', ') + ')';
    }
    // Все строки по которым ищем, в нижнем регистре
    var searchKeys = [item.substance, item.brand].concat(item.analogs)
        .filter(Boolean)
        .map(function (s) { return s.toLowerCase(); });
    return { label: displayLabel, keys: searchKeys };
});

// ── Текущий индекс выделенного элемента ──
var _rxHighlightIdx = -1;

function searchRxDrug() {
    var input = document.getElementById('rx-name');
    var resultsDiv = document.getElementById('rx-drug-results');
    if (!input || !resultsDiv) return;

    var query = input.value.trim().toLowerCase();
    resultsDiv.innerHTML = '';
    _rxHighlightIdx = -1;

    if (query.length < 2) {
        resultsDiv.classList.remove('open');
        return;
    }

    var matches = RX_DICT_INDEX.filter(function (item) {
        return item.keys.some(function (k) { return k.includes(query); });
    }).slice(0, 25);

    if (matches.length === 0) {
        resultsDiv.classList.remove('open');
        return;
    }

    matches.forEach(function (item, idx) {
        var div = document.createElement('div');
        div.className = 'rx-drug-item';
        div.textContent = item.label;
        div.addEventListener('mousedown', function (e) {
            // mousedown до blur, предотвращаем потерю фокуса
            e.preventDefault();
            input.value = item.label;
            closeRxDrugResults();
        });
        resultsDiv.appendChild(div);
    });

    resultsDiv.classList.add('open');
}

function handleRxDrugKey(event) {
    var resultsDiv = document.getElementById('rx-drug-results');
    if (!resultsDiv || !resultsDiv.classList.contains('open')) return;

    var items = resultsDiv.querySelectorAll('.rx-drug-item');
    if (items.length === 0) return;

    if (event.key === 'ArrowDown') {
        event.preventDefault();
        _rxHighlightIdx = Math.min(_rxHighlightIdx + 1, items.length - 1);
        rxHighlightItem(items);
    } else if (event.key === 'ArrowUp') {
        event.preventDefault();
        _rxHighlightIdx = Math.max(_rxHighlightIdx - 1, 0);
        rxHighlightItem(items);
    } else if (event.key === 'Enter') {
        if (_rxHighlightIdx >= 0 && _rxHighlightIdx < items.length) {
            event.preventDefault();
            var input = document.getElementById('rx-name');
            if (input) input.value = items[_rxHighlightIdx].textContent;
            closeRxDrugResults();
        }
    } else if (event.key === 'Escape') {
        closeRxDrugResults();
    }
}

function rxHighlightItem(items) {
    items.forEach(function (el, i) {
        el.classList.toggle('highlighted', i === _rxHighlightIdx);
    });
    if (_rxHighlightIdx >= 0) {
        items[_rxHighlightIdx].scrollIntoView({ block: 'nearest' });
    }
}

function closeRxDrugResults() {
    var resultsDiv = document.getElementById('rx-drug-results');
    if (resultsDiv) {
        resultsDiv.classList.remove('open');
        resultsDiv.innerHTML = '';
    }
    _rxHighlightIdx = -1;
}

// Закрывать список при клике вне поля
document.addEventListener('click', function (e) {
    var wrap = document.querySelector('.rx-drug-wrap');
    if (wrap && !wrap.contains(e.target)) {
        closeRxDrugResults();
    }
});
