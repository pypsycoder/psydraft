'use strict';
function runBridgeScenarios(map,engine){
 const out=[],check=(name,value)=>out.push({name,passed:!!value});
 const scalars={preg:'no',bipolar:'no',suicide:'',psychosis:'no',current:'none',renal:'normal',liver:'normal',alt:'normal',historyStatus:'none',cardiacDetail:'unknown',glaucomaDetail:'unknown',urinaryDetail:'unknown'};
 const base={diagnosis:'F32.1 Депрессивный эпизод',dxOverride:'',age:'38',confirmed:true,scalars,groups:{conditions:[],medications:[],priorities:[],'red-flags':[]},sleep:[],attention:[],memory:[],emotions:[],extraSymptoms:[],history:[],suicidalThoughts:'отсутствуют',suicidalPlans:'отсутствуют',suicideHistoryNone:true,suicideHistoryRisk:false};
 const routeCodes={mdd:'F33.1',gad:'F41.1',panic:'F41.0',ocd:'F42.2',ptsd:'F43.1',bipolar:'F31.3'};
 for(const [dx,diagnosis]of Object.entries(routeCodes))check('Код '+diagnosis+' → '+dx,map({...base,diagnosis}).profile.dx===dx);
 check('Неподдерживаемый диагноз не становится депрессией',map({...base,diagnosis:'F20.0'}).profile.dx==='');
 check('Несколько маршрутов требуют явного выбора',map({...base,diagnosis:'F32.1; F41.1'}).profile.dx==='');
 check('Явный основной диагноз учитывается',map({...base,diagnosis:'F32.1; F41.1',dxOverride:'mdd'}).profile.dx==='mdd');
 check('БАР имеет приоритет над выбранной депрессией',map({...base,diagnosis:'F32.1; F31.3',dxOverride:'mdd'}).profile.bipolar==='yes');
 check('Возраст переносится без изменения',map(base).profile.age==='38');
 const symptoms=map({...base,sleep:['проблемы с засыпанием (>30 минут)'],appetite:'снижен',attention:['снижение концентрации (рассеянность)'],emotions:['с преобладанием тревоги'],extraSymptoms:['fatigue','pain','anhedonia']}).profile;
 for(const id of ['insomnia','lowappetite','cognition','anxiety','fatigue','pain','anhedonia'])check('Симптом '+id+' перенесён',symptoms.symptomLevels[id]==='p');
 check('Выраженность не выдумывается',symptoms.symptomLevels.cognition==='p');
 check('Неоценённые симптомы остаются неизвестными',map({...base,confirmed:false}).profile.symptomLevels.fatigue==='u');
 check('Суицидальные планы усиливают маршрут',map({...base,suicidalPlans:'присутствуют',scalars:{...scalars,suicide:'no'}}).profile.suicide==='active');
 check('Мысли не превращаются автоматически в пассивные',map({...base,suicidalThoughts:'присутствуют'}).profile.suicide==='');
 check('Суицидальный анамнез не исчезает за текущим отрицанием',map({...base,suicideHistoryRisk:true}).profile.suicide==='');
 check('Кататония переносится как стоп-сигнал',map({...base,catatonia:true}).profile.psychosis==='yes');
 check('Психотический эпизод по коду переносится',map({...base,diagnosis:'F32.3'}).profile.psychosis==='yes');
 check('Снижение потребности во сне требует проверки биполярности',map({...base,sleep:['снижение потребности во сне']}).profile.bipolar==='');
 check('Эпилепсия в анамнезе переносится',map({...base,illness:['эпилепсия']}).profile.conditions.includes('seizure'));
 check('Злоупотребление алкоголем переносится',map({...base,alcohol:'злоупотребляет'}).profile.conditions.includes('alcohol'));
 check('Снижение аппетита не становится нервной анорексией',!map({...base,appetite:'анорексия'}).profile.conditions.includes('eating'));
 check('Диагноз нервной анорексии учитывается',map({...base,diagnosis:'F32.1; F50.0'}).profile.conditions.includes('eating'));
 check('Общая аллергия не приравнивается к тяжёлой лекарственной',!map({...base,allergy:'есть'}).profile['red-flags'].includes('allergy'));
 check('Свободный текст не создаёт адекватные курсы',map({...base,treatment:'Сертралин 100 мг 8 недель, не помог'}).profile.history.length===0);
 check('Подтверждение не выставляется автоматически',map({...base,confirmed:false}).profile.confirmed===false);
 const p={...map(base).profile,policy:'union',mddGuide:'rf',severity:'',targets:[],foreign:false,trials:'0',previous:'none',prevOutcome:'unknown'};
 const missing=engine.calculate(p).gate.missing;check('При полном PsyDraft остаётся выбрать тяжесть',missing.length===1&&missing[0]==='Тяжесть');
 check('С тяжестью получен список опций',engine.calculate({...p,severity:'moderate'}).drugs.length>0);
 const c={drug:'vor',diagnosis:'mdd',episode:'past',dose:'10',duration:'8',adherence:'good',adequacy:'yes',response:'good',adverse:'sexual',adverseSeverity:'mild',reason:'other'};
 const orders=[[c,{...c,adverse:'weight'}],[{...c,adverse:'weight'},c]];
 const results=orders.map(history=>engine.calculate({...p,severity:'moderate',historyStatus:'recorded',history}));
 check('Перестановка побочных эффектов не меняет результат',JSON.stringify(results[0].drugs)===JSON.stringify(results[1].drugs));
 for(const [group,key,value,label]of [['cardiac','cardiacDetail','recentmi','сердечный'],['glaucoma','glaucomaDetail','confirmed','глаукома'],['urinary','urinaryDetail','retention','мочеиспускание']]){
  const contradiction=engine.calculate({...p,severity:'moderate',[key]:value,conditions:[]});check('Не скрывается положительное уточнение: '+label,contradiction.drugs.length===0&&contradiction.gate.missing.length>0);
 }
 return out;
}
