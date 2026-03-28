// Карта мониторинга психиатрических препаратов
// Ключ: МНН в нижнем регистре
// Значение: { items: [recId из RECOMMENDATIONS_LIBRARY], alert: string|null }
//
// 🔵 items — обязательные обследования (автоматически выбираются в разделе «Обследования»)
// alert  — клиническое предупреждение, отображается в уведомлении

const RX_MONITORING_MAP = {

    // ── АНТИДЕПРЕССАНТЫ — СИОЗС ──────────────────────────────────────────────

    'сертралин':    { items: ['exam_ecg'], alert: null },
    'флуоксетин':   { items: ['exam_ecg'], alert: null },
    'пароксетин':   { items: ['exam_ecg'], alert: null },
    'флувоксамин':  { items: ['exam_ecg'], alert: null },
    'циталопрам':   {
        items: ['exam_ecg'],
        alert: 'Наибольший риск удлинения QTc среди СИОЗС. Максимальная доза: 40 мг (20 мг у пожилых).'
    },
    'эсциталопрам': {
        items: ['exam_ecg'],
        alert: 'Наибольший риск удлинения QTc среди СИОЗС. Максимальная доза: 20 мг (10 мг у пожилых).'
    },

    // ── АНТИДЕПРЕССАНТЫ — СИОЗСН ─────────────────────────────────────────────

    'венлафаксин':  {
        items: ['exam_ecg', 'lab_biochem'],
        alert: 'Дозозависимое повышение АД. При дозе >225 мг контроль АД обязателен.'
    },
    'дулоксетин':   { items: ['exam_ecg', 'lab_biochem'], alert: null },
    'милнаципран':  { items: [], alert: null },

    // ── АНТИДЕПРЕССАНТЫ — НаССА ──────────────────────────────────────────────

    'миртазапин':   {
        items: ['lab_cbc'],
        alert: 'Агранулоцитоз редок, но описан. ОАК при любой лихорадке неясного генеза.'
    },

    // ── АНТИДЕПРЕССАНТЫ — другие ─────────────────────────────────────────────

    'вортиоксетин': { items: [], alert: null },
    'агомелатин':   {
        items: ['lab_biochem'],
        alert: '⚠ Гепатотоксичность — обязательный мониторинг АЛТ/АСТ по инструкции (Нед 3, 6, 12 — далее каждые 6 мес). При АЛТ/АСТ >3N — отмена.'
    },
    'тразодон':     {
        items: ['exam_ecg'],
        alert: 'Приапизм — редкий, но серьёзный побочный эффект; предупредить пациента до начала терапии.'
    },
    'бупропион':    {
        items: [],
        alert: 'Снижает порог судорожной готовности. Противопоказан при эпилепсии, булимии, анорексии. Не комбинировать с МАО-И.'
    },

    // Трициклические
    'амитриптилин': { items: ['exam_ecg', 'lab_biochem'], alert: null },
    'кломипрамин':  { items: ['exam_ecg', 'lab_biochem'], alert: null },
    'имипрамин':    { items: ['exam_ecg', 'lab_biochem'], alert: null },
    'нортриптилин': { items: ['exam_ecg', 'lab_biochem'], alert: null },

    // МАО-ингибиторы
    'пирлиндол':    { items: [], alert: null },
    'моклобемид':   {
        items: ['lab_biochem'],
        alert: 'При необратимых МАО-И — обязательная тираминовая диета.'
    },

    // ── АНТИПСИХОТИКИ — АТИПИЧНЫЕ ─────────────────────────────────────────────

    'клозапин':     {
        items: ['lab_cbc', 'lab_glucose', 'lab_biochem', 'exam_ecg', 'lab_lipids'],
        alert: '⚠ Агранулоцитоз — жизнеугрожающий побочный эффект. ОАК еженедельно первые 18 нед — условие выписки, не рекомендация. При нейтрофилах < 1.5×10⁹/л — немедленная отмена.'
    },
    'оланзапин':    { items: ['exam_ecg', 'lab_glucose', 'lab_lipids'], alert: null },
    'рисперидон':   { items: ['exam_ecg', 'lab_prolactin', 'lab_glucose', 'lab_lipids'], alert: null },
    'палиперидон':  { items: ['exam_ecg', 'lab_prolactin', 'lab_glucose', 'lab_lipids'], alert: null },
    'кветиапин':    { items: ['exam_ecg', 'lab_glucose', 'lab_lipids'], alert: null },
    'арипипразол':  {
        items: ['exam_ecg'],
        alert: 'Метаболический риск значительно ниже, чем у оланзапина/кветиапина, но не нулевой.'
    },
    'луразидон':    { items: ['exam_ecg'], alert: null },
    'карипразин':   { items: ['exam_ecg'], alert: null },
    'брекспипразол':{ items: ['exam_ecg'], alert: null },
    'амисульприд':  { items: ['exam_ecg', 'lab_prolactin'], alert: null },
    'зипрасидон':   { items: ['exam_ecg'], alert: null },
    'сертиндол':    { items: ['exam_ecg'], alert: null },
    'азенапин':     { items: ['exam_ecg'], alert: null },
    'иллоперидон':  { items: ['exam_ecg'], alert: null },

    // ── АНТИПСИХОТИКИ — ТИПИЧНЫЕ ─────────────────────────────────────────────

    'галоперидол':      { items: ['exam_ecg', 'lab_biochem'], alert: null },
    'хлорпромазин':     { items: ['exam_ecg', 'lab_cbc', 'lab_biochem'], alert: null },
    'трифлуоперазин':   { items: ['exam_ecg', 'lab_cbc', 'lab_biochem'], alert: null },
    'перфеназин':       { items: ['exam_ecg', 'lab_cbc', 'lab_biochem'], alert: null },
    'тиоридазин':       { items: ['exam_ecg', 'lab_cbc', 'lab_biochem'], alert: null },
    'флуфеназин':       { items: ['exam_ecg', 'lab_cbc', 'lab_biochem'], alert: null },
    'зуклопентиксол':   { items: ['exam_ecg', 'lab_cbc', 'lab_biochem'], alert: null },
    'флупентиксол':     { items: ['exam_ecg', 'lab_cbc', 'lab_biochem'], alert: null },
    'тиопроперазин':    { items: ['exam_ecg', 'lab_cbc', 'lab_biochem'], alert: null },
    'хлорпротиксен':    { items: ['exam_ecg', 'lab_cbc', 'lab_biochem'], alert: null },
    'левомепромазин':   { items: ['exam_ecg', 'lab_cbc', 'lab_biochem'], alert: null },
    'сульпирид':        { items: ['exam_ecg', 'lab_prolactin'], alert: null },

    // ── НОРМОТИМИКИ ──────────────────────────────────────────────────────────

    'лития карбонат':       {
        items: ['lab_lithium', 'lab_electrolytes', 'lab_thyroid', 'exam_ecg', 'exam_uzi_thyroid'],
        alert: 'Терапевтическое окно: 0.6–1.0 ммоль/л. Токсичность при >1.5 ммоль/л. Внеплановый контроль: при изменении дозы, диарее/рвоте, инфекции с гипертермией, добавлении НПВС или диуретиков.'
    },
    'вальпроевая кислота':  {
        items: ['lab_valproate', 'lab_biochem', 'lab_cbc', 'lab_coag'],
        alert: '⚠ Тератогенность — абсолютное противопоказание при беременности. Обязательная контрацепция у женщин репродуктивного возраста. Фиксировать информированное согласие.'
    },
    'вальпроат натрия':     {
        items: ['lab_valproate', 'lab_biochem', 'lab_cbc', 'lab_coag'],
        alert: '⚠ Тератогенность — абсолютное противопоказание при беременности. Обязательная контрацепция у женщин репродуктивного возраста. Фиксировать информированное согласие.'
    },
    'карбамазепин':         {
        items: ['lab_carbamazepine', 'lab_cbc', 'lab_electrolytes', 'lab_biochem', 'exam_ecg'],
        alert: 'Мощный индуктор CYP3A4: снижает концентрацию варфарина, оральных контрацептивов, ламотриджина, антипсихотиков. Гипонатриемия — частый ПЭ, особенно у пожилых.'
    },
    'ламотриджин':          {
        items: ['lab_biochem'],
        alert: 'Взаимодействия, критичные для дозирования: вальпроаты удваивают концентрацию (доза вдвое меньше); карбамазепин снижает вдвое (доза вдвое больше). Контролировать кожные реакции первые 8 нед.'
    },
    'окскарбазепин':        {
        items: ['lab_electrolytes', 'lab_biochem'],
        alert: 'Гипонатриемия развивается чаще и выраженнее, чем при карбамазепине.'
    },
    'топирамат':    { items: [], alert: null },
    'прегабалин':   { items: [], alert: null },
    'габапентин':   { items: [], alert: null },

    // ── АНКСИОЛИТИКИ ─────────────────────────────────────────────────────────

    'гидроксизин':  {
        items: ['exam_ecg'],
        alert: 'Удлиняет QTc. При комбинации с антипсихотиками или циталопрамом контроль ЭКГ обязателен.'
    },
    'буспирон':     { items: ['lab_biochem'], alert: null },
    'мелатонин':    { items: [], alert: null },

    // ── ПРЕПАРАТЫ ПРИ ДЕМЕНЦИИ ───────────────────────────────────────────────

    'донепезил':    { items: ['exam_ecg', 'lab_biochem'], alert: null },
    'ривастигмин':  { items: ['exam_ecg', 'lab_biochem'], alert: null },
    'галантамин':   { items: ['exam_ecg', 'lab_biochem'], alert: null },
    'мемантин':     {
        items: ['lab_biochem'],
        alert: 'Коррекция дозы при хронической болезни почек (ХБП).'
    },

    // ── СДВГ ─────────────────────────────────────────────────────────────────

    'атомоксетин':  { items: ['exam_ecg', 'lab_biochem'], alert: null },
};


// ── Применить мониторинг для назначенного препарата ────────────────────────
// drugName — строка из поля rx-name, например "Клозапин (Азалептин, Лепонекс)"
// Автоматически выбирает нужные пункты в selectedRecs и показывает уведомление.

function applyDrugMonitoring(drugName) {
    if (!drugName) return;

    var substanceRaw = drugName.split('(')[0].trim();
    var substanceKey = substanceRaw.toLowerCase();
    var monitoring = RX_MONITORING_MAP[substanceKey];

    // Препарат не в карте — не показываем ничего
    if (!monitoring) return;
    if (!monitoring.items.length && !monitoring.alert) return;

    var addedTitles = [];
    (monitoring.items || []).forEach(function (id) {
        if (typeof selectedRecs !== 'undefined' && !selectedRecs[id]) {
            selectedRecs[id] = 'short';
            if (typeof RECOMMENDATIONS_LIBRARY !== 'undefined') {
                var rec = RECOMMENDATIONS_LIBRARY.find(function (r) { return r.id === id; });
                if (rec) addedTitles.push(rec.title);
            }
        }
    });

    // Перерисовываем раздел рекомендаций с переключением на «Все»,
    // чтобы лабораторные и инструментальные позиции стали видны
    if (addedTitles.length > 0) {
        if (typeof activeGroup !== 'undefined') {
            activeGroup = 'all';
        }
        if (typeof renderGroupFilters === 'function') renderGroupFilters();
        if (typeof renderRecommendations === 'function') renderRecommendations();
    }

    _showMonitoringNotice(substanceRaw, addedTitles, monitoring.alert);
}


// ── Уведомление о мониторинге ─────────────────────────────────────────────

function _showMonitoringNotice(substanceName, addedItems, alertText) {
    var notice = document.getElementById('rx-monitoring-notice');
    if (!notice) return;

    if (!addedItems.length && !alertText) {
        notice.style.display = 'none';
        return;
    }

    var html = '<div class="rx-mn-body">';

    if (addedItems.length > 0) {
        html += '<div class="rx-mn-added">'
             + '⚕\u00a0<strong>' + substanceName + '</strong>: '
             + 'добавлено в «Обследования»: ' + addedItems.join(', ')
             + '\u00a0<button type="button" class="rx-mn-goto" onclick="_gotoMonitoringSection()">перейти →</button>'
             + '</div>';
    } else {
        html += '<div class="rx-mn-added"><strong>' + substanceName + '</strong></div>';
    }

    if (alertText) {
        html += '<div class="rx-mn-alert">' + alertText + '</div>';
    }

    html += '</div>';
    html += '<button type="button" class="rx-mn-close" '
          + 'onclick="document.getElementById(\'rx-monitoring-notice\').style.display=\'none\'">'
          + '✕</button>';

    notice.innerHTML = html;
    notice.style.display = 'flex';
}


// ── Переход к разделу Рекомендаций с группой «Все» ───────────────────────

function _gotoMonitoringSection() {
    if (typeof activeGroup !== 'undefined') activeGroup = 'all';
    if (typeof renderGroupFilters === 'function') renderGroupFilters();
    if (typeof renderRecommendations === 'function') renderRecommendations();

    var section = document.getElementById('section-recommendations');
    if (section) section.scrollIntoView({ behavior: 'smooth', block: 'start' });
}
