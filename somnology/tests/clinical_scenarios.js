/* Запуск в консоли открытого приложения: runSomnologyClinicalScenarios(). */
window.runSomnologyClinicalScenarios = function runSomnologyClinicalScenarios() {
  const base = {
    sleepSymptoms: [], dayImpairments: [], breathingSymptoms: [], movementSymptoms: [], rlsMimics: [],
    hypersomniaSymptoms: [], parasomniaSymptoms: [], safetyFlags: [], substances: '', stopbang: 0, isi: 0, ess: 0,
    complaintFrequency: '', complaintDuration: '', sleepOpportunity: false, sleepConditions: false,
    totalSleep: '', diarySummary: '', workSchedule: '', nightShifts: '', circadianPattern: '', preferredBedtime: '', preferredWaketime: '',
    age: '40', sex: 'female', neck: '35', bedPartnerReport: '', previousSleepCare: '', sleepNotes: ''
  };
  const scenarios = [
    ['хроническая инсомния', { sleepSymptoms: ['трудности засыпания'], dayImpairments: ['усталость или недомогание'], isi: 16, complaintFrequency: '4', complaintDuration: 'ge_3m', sleepOpportunity: true, sleepConditions: true }, 'insomnia'],
    ['COMISA', { sleepSymptoms: ['трудности засыпания'], breathingSymptoms: ['громкий храп'], stopbang: 4, isi: 12 }, 'osa'],
    ['OSA без сонливости', { breathingSymptoms: ['остановки дыхания во сне'], stopbang: 5 }, 'osa'],
    ['недостаточный сон', { ess: 15, sleepSymptoms: ['выраженная дневная сонливость'], totalSleep: '5,5' }, 'hypersomnia'],
    ['полный RLS', { movementSymptoms: ['императивное желание двигать ногами', 'начало или усиление в покое', 'облегчение при движении ногами', 'усиление вечером или ночью'] }, 'rls'],
    ['неполный RLS', { movementSymptoms: ['императивное желание двигать ногами'] }, 'rls'],
    ['нарколептический сигнал', { ess: 17, hypersomniaSymptoms: ['непреодолимые приступы сна', 'катаплексия'] }, 'hypersomnia'],
    ['нарколепсия типа 2', { ess: 17, hypersomniaSymptoms: ['непреодолимые приступы сна', 'сонный паралич'] }, 'hypersomnia'],
    ['идиопатическая гиперсомния', { ess: 17, hypersomniaSymptoms: ['тяжёлая инерция сна', 'сон более 10 часов'] }, 'hypersomnia'],
    ['задержка фазы', { circadianPattern: 'delayed', preferredBedtime: '02:00', preferredWaketime: '10:00' }, 'circadian'],
    ['сменная работа', { workSchedule: 'сменный с ночными сменами', nightShifts: '6', circadianPattern: 'shift' }, 'circadian'],
    ['NREM-парасомния', { parasomniaSymptoms: ['NREM-парасомния со спутанностью'], sleepNotes: 'первая треть ночи' }, 'parasomnia'],
    ['RBD', { parasomniaSymptoms: ['разыгрывание сновидений / подозрение на RBD'], sleepNotes: 'движения во второй половине ночи' }, 'parasomnia'],
    ['возможная эпилепсия', { parasomniaSymptoms: ['стереотипный короткий эпизод / подозрение на эпилепсию'], sleepNotes: 'стереотипные короткие эпизоды' }, 'parasomnia']
  ];
  scenarios.forEach(([name, patch, expected]) => {
    const ids = evaluateRouter({ ...base, ...patch }).map(item => item.id);
    console.assert(ids.includes(expected), `${name}: ожидался ${expected}, получено ${ids.join(', ')}`);
  });
  const before = collectState().diagnosis;
  runAdvisor();
  console.assert(collectState().diagnosis === before, 'Советник не должен менять диагноз');
  return `${scenarios.length} клинических сценариев выполнено`;
};
