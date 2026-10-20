// Pure conversion of structured PsyDraft values. Free text is never interpreted as an adequate drug trial.
function mapPsyDraftSnapshot(raw) {
 const notes=[],unique=a=>[...new Set(a)];
 const codes=unique((String(raw.diagnosis||'').toUpperCase().match(/\bF\d{2}(?:\.\d{1,2})?\b/g)||[]));
 const route=code=>/^F3[01]/.test(code)?'bipolar':/^F3[23]/.test(code)?'mdd':code==='F41.1'?'gad':code==='F41.0'?'panic':/^F42/.test(code)?'ocd':/^F43\.1/.test(code)?'ptsd':null;
 const routes=unique(codes.map(route).filter(Boolean));
 let dx=codes.length?route(codes[0])||'':'';
 if(routes.includes('bipolar'))dx='bipolar';
 if(!dx)notes.push(codes.length?'Основной (первый) код в разделе «Диагноз» не поддерживается компасом. Проверьте диагноз и порядок кодов.':'В разделе «Диагноз» PsyDraft не указан поддерживаемый код МКБ-10.');
 const p={...raw.scalars,age:String(raw.age||''),dx,confirmed:raw.confirmed===true,symptomLevels:{},conditions:unique(raw.groups.conditions||[]),medications:unique(raw.groups.medications||[]),priorities:unique(raw.groups.priorities||[]),'red-flags':unique(raw.groups['red-flags']||[]),history:(raw.history||[]).map(c=>({...c}))};
 const symptomIds=['anxiety','insomnia','hypersomnia','lowappetite','fatigue','cognition','pain','anhedonia','diarrhea','constipation'];
 for(const id of symptomIds)p.symptomLevels[id]=p.confirmed?'0':'u';
 const set=id=>p.symptomLevels[id]='p';
 const sleep=raw.sleep||[],attention=raw.attention||[],memory=raw.memory||[],emotions=raw.emotions||[];
 if(sleep.some(v=>/поверхност|засыпани|пробуждени|^отсутствует$/.test(v)))set('insomnia');
 if(sleep.includes('удовлетворительный')&&!sleep.some(v=>/поверхност|засыпани|пробуждени|^отсутствует$/.test(v)))p.symptomLevels.insomnia='0';
 if(['снижен','анорексия'].includes(raw.appetite))set('lowappetite');else if(raw.appetite==='в норме'||raw.appetite==='повышен')p.symptomLevels.lowappetite='0';
 if(attention.some(v=>/снижение концентрации|истощаемость|замедленность|отвлекаемость|трудность|нарушение селективности/.test(v))||memory.some(v=>['снижена','гипомнезия'].includes(v)))set('cognition');
 if(memory.includes('в пределах возрастной нормы')&&!attention.length)p.symptomLevels.cognition=p.confirmed?'0':'u';
 if(emotions.includes('с преобладанием тревоги'))set('anxiety');
 for(const id of raw.statusSymptoms||[])if(symptomIds.includes(id))set(id);
 if(raw.scalars.suicide)p.suicide=raw.scalars.suicide;
 else if(raw.suicidalThoughts==='отсутствуют'&&raw.suicidalPlans==='отсутствуют'&&raw.suicideHistoryNone&&!raw.suicideHistoryRisk)p.suicide='no';
 else p.suicide='';
 if(raw.suicidalPlans==='присутствуют')p.suicide='active';
 if(raw.suicidalThoughts==='присутствуют'&&p.suicide==='no'){p.suicide='';notes.push('Мысли отмечены в статусе, но риск указан как отсутствующий: согласуйте оценку риска.');}
 if(raw.suicidalThoughts==='присутствуют'&&!p.suicide)notes.push('Наличие мыслей само по себе не определяет пассивный или активный риск: уточните оценку в блоке компаса PsyDraft.');
 if(dx==='bipolar'||routes.includes('bipolar'))p.bipolar='yes';
 if(raw.catatonia||raw.hallucinationsSelected||codes.some(c=>['F32.3','F33.3'].includes(c)))p.psychosis='yes';
 if(sleep.includes('снижение потребности во сне')&&p.bipolar==='no'){p.bipolar='';notes.push('Снижение потребности во сне требует отдельной проверки биполярности; отрицательный ответ не перенесён.');}
 if(codes.some(c=>['F50.0','F50.2'].includes(c)))p.conditions=unique([...p.conditions,'eating']);
 if((raw.illness||[]).includes('эпилепсия'))p.conditions=unique([...p.conditions,'seizure']);
 if(['злоупотребляет','зависимость (алкоголизм)'].includes(raw.alcohol))p.conditions=unique([...p.conditions,'alcohol']);
 if(raw.allergy==='есть')notes.push('В анамнезе указана аллергия: сверить виновное вещество и тяжесть реакции. Общая отметка не приравнивается автоматически к тяжёлой реакции на антидепрессант.');
 p.symptoms=symptomIds.filter(id=>p.symptomLevels[id]==='p');
 return {schema:'psydraft-compass-transfer',version:1,profile:p,diagnosisCodes:codes,notes,context:{treatment:String(raw.treatment||'').slice(0,4000),complaints:String(raw.complaints||'').slice(0,4000)},signature:JSON.stringify([p.age,codes]),source:'PsyDraft'};
}
