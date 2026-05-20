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

const RECOMMENDATION_OPTIONS = [
  {
    id: 'sleep_diary',
    label: 'Вести дневник сна 2 недели с фиксацией времени отхода ко сну, подъема, пробуждений, дневного сна, кофеина/алкоголя и самочувствия днем.',
    tags: ['G47.0', 'G47.2', 'F51.0', 'F51.2']
  },
  {
    id: 'regular_schedule',
    label: 'Стабилизировать время подъема, включая выходные; избегать длительного дневного сна и позднего пребывания в постели без сна.',
    tags: ['G47.0', 'G47.2', 'F51.0', 'F51.2']
  },
  {
    id: 'stimulus_control',
    label: 'Соблюдать контроль стимулов: использовать кровать преимущественно для сна, вставать при длительном бодрствовании, возвращаться при сонливости.',
    tags: ['G47.0', 'F51.0']
  },
  {
    id: 'sleep_hygiene',
    label: 'Оптимизировать гигиену сна: затемнение, тишина, прохладная комната, отказ от кофеина во второй половине дня и алкоголя как средства для сна.',
    tags: ['G47.0', 'G47.2', 'F51.0', 'F51.2', 'G47.9']
  },
  {
    id: 'cbti',
    label: 'Рассмотреть CBT-I как метод первой линии при хронической инсомнии; медикаментозную терапию использовать ограниченно и с учетом рисков.',
    tags: ['G47.0', 'F51.0']
  },
  {
    id: 'osa_weight',
    label: 'При подозрении на ОАС рекомендовать снижение массы тела при избытке веса, отказ от алкоголя и седативных препаратов перед сном.',
    tags: ['G47.3']
  },
  {
    id: 'osa_position',
    label: 'До уточнения диагноза ОАС избегать сна на спине при позиционном ухудшении храпа/апноэ; оценить безопасность вождения при сонливости.',
    tags: ['G47.3']
  },
  {
    id: 'cpap_route',
    label: 'При подтверждении клинически значимого ОАС обсудить CPAP/APAP-терапию и подбор маски; контроль приверженности и эффективности.',
    tags: ['G47.3']
  },
  {
    id: 'rls_iron',
    label: 'При признаках синдрома беспокойных ног проверить дефицит железа; коррекция ферритина и пересмотр препаратов, усиливающих симптомы.',
    tags: ['G25.8']
  },
  {
    id: 'rls_behavior',
    label: 'При RLS ограничить кофеин/алкоголь вечером, избегать недосыпания, использовать умеренную вечернюю активность и растяжку по переносимости.',
    tags: ['G25.8']
  },
  {
    id: 'hypersomnia_safety',
    label: 'При выраженной дневной сонливости рекомендовать избегать вождения и опасных работ до уточнения причины и стабилизации состояния.',
    tags: ['G47.1', 'G47.4']
  },
  {
    id: 'hypersomnia_schedule',
    label: 'Оценить достаточность ночного сна и регулярность графика; исключить депривацию сна, ОАС и лекарственные причины сонливости.',
    tags: ['G47.1', 'G47.4', 'R53']
  },
  {
    id: 'circadian_light',
    label: 'При циркадном нарушении настроить световой режим: яркий свет в целевое утреннее время и ограничение яркого/синего света вечером.',
    tags: ['G47.2', 'F51.2']
  },
  {
    id: 'circadian_shift',
    label: 'Сдвиг графика сна проводить постепенно, небольшими шагами; фиксировать эффект по дневнику сна.',
    tags: ['G47.2', 'F51.2']
  },
  {
    id: 'parasomnia_safety',
    label: 'При парасомниях обеспечить безопасность спальни: убрать травмоопасные предметы, закрывать окна/двери, предупредить партнера по сну.',
    tags: ['G47.5', 'F51.3', 'F51.4', 'F51.5']
  },
  {
    id: 'parasomnia_triggers',
    label: 'При ночных эпизодах исключить провокаторы: недосыпание, алкоголь, стресс, седативные препараты; собрать видео эпизодов при возможности.',
    tags: ['G47.5', 'F51.3', 'F51.4', 'F51.5']
  },
  {
    id: 'nightmares',
    label: 'При кошмарах оценить связь с травматическим стрессом, тревогой, депрессией и лекарствами; рассмотреть психотерапевтические подходы.',
    tags: ['F51.5', 'G47.5']
  }
];

const ADVISOR_RULES = [
  {
    code: 'G47.0',
    name: 'Инсомния',
    checks: [
      ['Инсомнические жалобы', s => hasAny(s.sleepSymptoms, ['трудности засыпания', 'частые ночные пробуждения', 'ранние утренние пробуждения'])],
      ['ISI >= 8', s => s.isi >= 8],
      ['Дневное нарушение / неосвежающий сон', s => s.sleepSymptoms.includes('неосвежающий сон') || s.ess >= 10]
    ],
    clarify: ['частота >= 3 ночей в неделю', 'длительность >= 3 месяцев', 'условия сна достаточны', 'исключить вторичную инсомнию']
  },
  {
    code: 'G47.3',
    name: 'Подозрение на обструктивное апноэ сна',
    checks: [
      ['Храп / остановки дыхания', s => hasAny(s.breathingSymptoms, ['храп', 'остановки дыхания во сне'])],
      ['STOP-Bang >= 3', s => s.stopbang >= 3],
      ['Дневная сонливость или утренние симптомы', s => s.sleepSymptoms.includes('выраженная дневная сонливость') || s.breathingSymptoms.includes('утренние головные боли')]
    ],
    clarify: ['показан КРМ или полисомнография', 'оценить ИМТ, окружность шеи, АГ', 'уточнить безопасность вождения']
  },
  {
    code: 'G25.8',
    name: 'Синдром беспокойных ног',
    checks: [
      ['Неприятные ощущения в ногах вечером', s => s.movementSymptoms.includes('неприятные ощущения в ногах вечером')],
      ['Облегчение при движении', s => s.movementSymptoms.includes('облегчение при движении ногами')],
      ['Нарушение сна', s => s.isi >= 8 || s.sleepSymptoms.length > 0]
    ],
    clarify: ['ухудшение в покое и вечером/ночью', 'ферритин, железо, ОЖСС', 'лекарственные и неврологические причины']
  },
  {
    code: 'G47.1',
    name: 'Гиперсомния / нарколептический спектр',
    checks: [
      ['ESS >= 11', s => s.ess >= 11],
      ['Дневная сонливость', s => s.sleepSymptoms.includes('выраженная дневная сонливость')],
      ['REM-феномены', s => hasAny(s.hypersomniaSymptoms, ['катаплексия', 'сонный паралич', 'гипнагогические феномены'])]
    ],
    clarify: ['достаточность ночного сна', 'исключить ОАС и депривацию сна', 'при показаниях ПСГ + MSLT']
  },
  {
    code: 'G47.2',
    name: 'Нарушение циркадного ритма сна',
    checks: [
      ['Нерегулярный график', s => s.sleepSymptoms.includes('нерегулярный график сна')],
      ['Смещение времени сна', s => !!s.bedtime && !!s.waketime],
      ['Дневное нарушение', s => s.ess >= 10 || s.isi >= 8]
    ],
    clarify: ['дневник сна 2 недели', 'актиграфия при возможности', 'световой режим и график работы']
  },
  {
    code: 'G47.5',
    name: 'Парасомния',
    checks: [
      ['Ночные эпизоды поведения', s => s.parasomniaSymptoms.length > 0],
      ['Двигательная активность / снохождение / кошмары', s => hasAny(s.parasomniaSymptoms, ['двигательная активность во сне', 'снохождение или ночные эпизоды поведения', 'кошмары'])],
      ['Клиническое описание эпизодов', s => s.sleepNotes.length > 0]
    ],
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

function createScaleItems() {
  const isi = el('isi-items');
  const ess = el('ess-items');
  const stopbang = el('stopbang-items');

  ISI_ITEMS.forEach((label, index) => {
    const row = document.createElement('div');
    row.className = 'scale-row';
    row.innerHTML = `<div>${index + 1}. ${label}</div><select data-scale="isi"><option value="0">0 - нет</option><option value="1">1 - слабо</option><option value="2">2 - умеренно</option><option value="3">3 - значительно</option><option value="4">4 - выражено</option></select>`;
    isi.appendChild(row);
  });

  ESS_ITEMS.forEach((label, index) => {
    const row = document.createElement('div');
    row.className = 'scale-row';
    row.innerHTML = `<div>${index + 1}. ${label}</div><select data-scale="ess"><option value="0">0 - не заснул бы</option><option value="1">1 - малая вероятность</option><option value="2">2 - умеренная вероятность</option><option value="3">3 - высокая вероятность</option></select>`;
    ess.appendChild(row);
  });

  STOPBANG_ITEMS.forEach(([code, label]) => {
    const row = document.createElement('div');
    row.className = 'stopbang-row';
    row.innerHTML = `<label><input type="checkbox" data-scale="stopbang" data-stopbang-code="${code}"> <strong>${code}</strong> ${label}</label>`;
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

  RECOMMENDATION_OPTIONS.forEach(option => {
    const label = document.createElement('label');
    label.innerHTML = `<input type="checkbox" name="recommendation_option" value="${escapeHtml(option.label)}" data-rec-id="${escapeHtml(option.id)}"> <span>${escapeHtml(option.label)}</span>`;
    container.appendChild(label);
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
}

function collectTestsText() {
  const selected = Array.from(document.querySelectorAll('input[name="test_option"]:checked'))
    .map(checkbox => checkbox.value);
  const extra = value('tests_extra');
  if (extra) selected.push(extra);
  return selected.join('; ');
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
      if (time) details.push(`за ${time} до сна`);
      return details.length ? `${checkbox.value} (${details.join(', ')})` : checkbox.value;
    });
  const extra = value('substances_extra');
  if (extra) parts.push(extra);
  return parts.join('; ');
}

function collectRecommendationsText() {
  const selected = Array.from(document.querySelectorAll('input[name="recommendation_option"]:checked'))
    .map(checkbox => checkbox.value);
  const extra = value('recommendations_extra');
  if (extra) selected.push(extra);
  return selected.join('; ');
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
  updateTotalSleep();
  el('isi-score').textContent = String(sumScale('isi'));
  el('ess-score').textContent = String(sumScale('ess'));
  el('stopbang-score').textContent = String(sumScale('stopbang'));
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
  if (!totalField) return null;

  const bedtime = timeToMinutes(value('bedtime'));
  const waketime = timeToMinutes(value('waketime'));

  if (bedtime === null || waketime === null) {
    totalField.value = '';
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

  totalField.value = String(sleepHours).replace('.', ',');
  return sleepHours;
}

function collectState() {
  return {
    complaints: value('complaints'),
    history: value('history'),
    comorbidity: collectComorbidityText(),
    substances: collectSubstancesText(),
    heightCm: value('height_cm'),
    weightKg: value('weight_kg'),
    bmi: value('bmi'),
    neck: value('neck'),
    bedtime: value('bedtime'),
    waketime: value('waketime'),
    latency: value('latency'),
    awakenings: value('awakenings'),
    awakeningDuration: value('awakening_duration'),
    totalSleep: value('total_sleep'),
    napMinutes: value('nap_minutes'),
    sleepSymptoms: checkedValues('sleep_symptom'),
    breathingSymptoms: checkedValues('breathing_symptom'),
    movementSymptoms: checkedValues('movement_symptom'),
    parasomniaSymptoms: checkedValues('parasomnia_symptom'),
    hypersomniaSymptoms: checkedValues('hypersomnia_symptom'),
    sleepNotes: value('sleep_notes'),
    isi: sumScale('isi'),
    ess: sumScale('ess'),
    stopbang: sumScale('stopbang'),
    diagnosis: value('diagnosis'),
    advisorClarifications: collectAdvisorClarificationsText(),
    recommendations: collectRecommendationsText(),
    tests: collectTestsText(),
    treatment: value('treatment')
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
  if (score >= 5) return 'высокий риск ОАС';
  if (score >= 3) return 'промежуточный риск ОАС';
  return 'низкий риск ОАС';
}

function runAdvisor() {
  const state = collectState();
  const results = ADVISOR_RULES.map(rule => {
    const met = rule.checks.filter(([, fn]) => fn(state)).map(([label]) => label);
    const score = Math.round((met.length / rule.checks.length) * 100);
    return { ...rule, met, score };
  }).filter(result => result.score >= 34).sort((a, b) => b.score - a.score);

  renderAdvisor(results);
  results.slice(0, 2).forEach(result => {
    applyTestsForDiagnosis(result.code);
    applyRecommendationsForDiagnosis(result.code);
  });
  const hint = el('advisor-hint');
  const now = new Date();
  hint.textContent = `Обновлено ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  return results;
}

function renderAdvisor(results) {
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
    card.className = `advisor-card ${result.score >= 67 ? 'high' : 'mid'}`;
    card.dataset.code = result.code;
    card.dataset.name = result.name;
    const metItems = result.met.map(item => `<li>${escapeHtml(item)}</li>`).join('');
    const clarifyItems = result.clarify.map((item, index) => `
      <label class="advisor-clarify-item">
        <input type="checkbox" class="advisor-clarify-check">
        <span class="advisor-clarify-text">${escapeHtml(item)}</span>
        <input type="text" class="advisor-clarify-note" placeholder="уточнение" data-clarify-index="${index}">
      </label>
    `).join('');
    card.innerHTML = `
      <div class="advisor-title"><span>${result.code} ${escapeHtml(result.name)}</span><span class="advisor-score">${result.score}%</span></div>
      <strong>Совпало:</strong><ul>${metItems}</ul>
      <strong>Уточнить:</strong><div class="advisor-clarify-list">${clarifyItems}</div>
      <div class="advisor-actions"><button type="button" class="advisor-add-diagnosis">Добавить диагноз</button></div>
    `;
    card.querySelector('.advisor-add-diagnosis').addEventListener('click', () => addAdvisorDiagnosis(card));
    container.appendChild(card);
  });
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

function generateReport() {
  const s = collectState();
  const sleepProfile = [
    s.bedtime ? `отход ко сну ${s.bedtime}` : '',
    s.waketime ? `подъем ${s.waketime}` : '',
    s.latency ? `латентность сна ${s.latency} мин` : '',
    s.awakenings ? `пробуждений за ночь: ${s.awakenings}` : '',
    s.awakeningDuration ? `длительность пробуждений ${s.awakeningDuration} мин` : '',
    s.totalSleep ? `общее время сна ${s.totalSleep} ч` : '',
    s.napMinutes ? `дневной сон ${s.napMinutes} мин` : ''
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
  html += line('Обследования', s.tests);
  html += line('Рекомендации', s.recommendations);
  html += line('Лечение / маршрутизация', s.treatment);

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
  createTestsChecklist();
  createRecommendationsChecklist();
  updateScores();
  initNav();
  initDiagnosisSearch();
  initTimePicker();
  document.addEventListener('change', updateScores);
  document.addEventListener('input', updateScores);
  el('run-advisor').addEventListener('click', runAdvisor);
  el('generate-report').addEventListener('click', generateReport);
  el('copy-report').addEventListener('click', copyReport);
  el('print-report').addEventListener('click', () => window.print());
});
