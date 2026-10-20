(() => {
 'use strict';
 const token='__PD_SESSION_TOKEN__';let lastFingerprint='',lastSignature='',applying=false;
 const note=document.getElementById('pd-bridge-note');
 // Standalone import/reset/examples must not replace the patient connected to PsyDraft.
 for(const id of ['import','reset','example'])document.getElementById(id).hidden=true;
 const exampleLabel=document.querySelector('label[for="example"]');if(exampleLabel)exampleLabel.hidden=true;
 document.getElementById('export').textContent='Сохранить профиль компаса JSON';
 note.hidden=false;
 note.innerHTML='<strong>Данные из PsyDraft</strong><p>Откройте PsyDraft и заполните исходные сведения. Здесь выбираются тяжесть и главные мишени.</p><button type="button" id="pd-refresh-source">Обновить из PsyDraft</button><button type="button" id="pd-open-source">Открыть исходные данные</button><div id="pd-source-context"></div>';
 document.getElementById('pd-refresh-source').onclick=()=>window.parent.postMessage({channel:'psydraft-compass',token,type:'refresh-source'},'*');
 document.getElementById('pd-open-source').onclick=()=>window.parent.postMessage({channel:'psydraft-compass',token,type:'open-source'},'*');
 function receive(snapshot,force){
  if(!snapshot||snapshot.schema!=='psydraft-compass-transfer'||snapshot.version!==1||!snapshot.profile||typeof snapshot.profile!=='object')return;
  const fingerprint=JSON.stringify(snapshot);if(fingerprint===lastFingerprint&&!force)return;
  const current=state(),newCase=lastSignature!==snapshot.signature;
  const p={...current,...snapshot.profile,policy:current.policy,mddGuide:current.mddGuide,severity:newCase?'':current.severity,targets:newCase?[]:current.targets.filter(id=>presentLevel(snapshot.profile.symptomLevels[id])),foreign:current.foreign,previous:'none',prevOutcome:'unknown'};
  p.trials='unknown';
  try{validateImport({schema:'antidepressant-profile',version:VERSION,profile:p});}catch(error){applying=true;applyProfile({...current,age:'',dx:'',severity:'',targets:[],confirmed:false});applying=false;note.querySelector('#pd-source-context').textContent='Перенос не выполнен: '+error.message+'. Исправьте исходные сведения в PsyDraft; прежний список опций приостановлен.';window.parent.postMessage({channel:'psydraft-compass',token,type:'compass-error'},'*');return;}
  applying=true;applyProfile(p);applying=false;lastFingerprint=fingerprint;lastSignature=snapshot.signature;
  const context=document.getElementById('pd-source-context');context.textContent='Перенесено: возраст '+(p.age||'не уточнён')+', диагноз '+(snapshot.diagnosisCodes.join(', ')||'выбран вручную')+', симптомы и клинические ограничения. '+(snapshot.notes||[]).join(' ');
  if(snapshot.context?.treatment){const paragraph=document.createElement('p');paragraph.textContent='Текст анамнеза лечения (справка): '+snapshot.context.treatment;context.append(paragraph);}
  window.parent.postMessage({channel:'psydraft-compass',token,type:'compass-imported',age:p.age,dx:p.dx,missing:clinicalGate(state()).missing.length},'*');
 }
 window.addEventListener('message',e=>{if(e.source!==window.parent||e.data?.channel!=='psydraft-compass'||e.data.token!==token||e.data.type!=='apply-source')return;receive(e.data.snapshot,e.data.force===true);});
 function reportState(){window.parent.postMessage({channel:'psydraft-compass',token,type:'compass-state',missing:clinicalGate(state()).missing.length,targets:state().targets.length},'*');}document.getElementById('profile').addEventListener('input',()=>{if(!applying)reportState();});document.getElementById('profile').addEventListener('change',e=>{if(!applying)reportState();if(!applying&&e.target.id!=='severity'&&!e.target.id.startsWith('target-')&&!e.target.id.startsWith('dim-'))document.getElementById('pd-source-context').textContent='Есть ручные изменения в компасе. Кнопка «Обновить из PsyDraft» повторно подставит исходные данные.';});
 window.parent.postMessage({channel:'psydraft-compass',token,type:'compass-ready'},'*');
})();
