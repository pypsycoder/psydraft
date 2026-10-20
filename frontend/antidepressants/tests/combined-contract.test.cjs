const fs=require('fs'),vm=require('vm'),assert=require('assert'),path=require('path');
const html=fs.readFileSync(path.join(__dirname,'..','antidepressant-assistant.html'),'utf8');
const docs=JSON.parse(html.match(/<script type="application\/json" id="pd-embedded-documents">([\s\S]*?)<\/script>/)[1]);
let currentWindow=null,queue=[],timers=[],assertions=0,nonce=0;
const decode=s=>s.replace(/&quot;/g,'"').replace(/&#39;/g,"'").replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&amp;/g,'&');
const voidTags=new Set(['meta','link','input','br','hr','img']);
function createDocument(markup){
 const elements=new Map(),all=[];let doc;
 class El{
  constructor(tag='div',attrs={},parent=null){this.tagName=tag.toUpperCase();this.id=attrs.id||'';this.name=attrs.name||'';this.attrs=attrs;this.parentElement=parent;this.children=[];this.dataset={};this.listeners={};this.checked='checked'in attrs;this.defaultChecked=this.checked;this.value=attrs.value||'';this.defaultValue=this.value;this.options=[];this.hidden='hidden'in attrs;this.open='open'in attrs;this.textContent='';this.files=[];this.disabled='disabled'in attrs;this._html='';for(const[k,v]of Object.entries(attrs))if(k.startsWith('data-'))this.dataset[k.slice(5).replace(/-([a-z])/g,(_,c)=>c.toUpperCase())]=v;if(parent)parent.children.push(this);if(this.id)elements.set(this.id,this);all.push(this);}
  set innerHTML(s){this._html=s;const old=[];function visit(e){for(const c of e.children){old.push(c);visit(c);}}visit(this);for(const e of old){if(elements.get(e.id)===e)elements.delete(e.id);all.splice(all.indexOf(e),1);}this.children=[];parse(s,this);}
  get innerHTML(){return this._html;}
  get selectedOptions(){return this.options.filter(x=>x.value===this.value);}
  setAttribute(k,v){this.attrs[k]=v;}
  getAttribute(k){return this.attrs[k]??null;}
  hasAttribute(k){return k in this.attrs;}
  addEventListener(k,f){(this.listeners[k]??=[]).push(f);}
  insertAdjacentHTML(_,s){parse(s,this);}
  append(e){e.parentElement=this;this.children.push(e);}
  appendChild(e){this.append(e);return e;}
  dispatchEvent(event){event.target=this;for(let node=this;node;node=node.parentElement)for(const f of node.listeners[event.type]||[])f(event);if(event.bubbles)for(const f of doc.listeners[event.type]||[])f(event);return true;}
  focus(){doc.activeElement=this;}
  scrollIntoView(){this.scrolled=true;}
  closest(s){for(let e=this;e;e=e.parentElement){if(s==='a[href]'&&e.tagName==='A'&&'href'in e.attrs)return e;if(s==='details'&&e.tagName==='DETAILS')return e;if(s==='.field, .check'&&(e.attrs.class||'').split(' ').some(x=>['field','check'].includes(x)))return e;if(s.startsWith('.')&&(e.attrs.class||'').split(' ').includes(s.slice(1)))return e;let m=s.match(/^\[data-([\w-]+)\]$/);if(m&&('data-'+m[1])in e.attrs)return e;}return null;}
  querySelector(s){if(s.startsWith('#'))return elements.get(s.slice(1));return null;}
  reset(){for(const e of all){e.value=e.defaultValue;e.checked=e.defaultChecked;}}
  click(){if(this.onclick)this.onclick();for(const f of this.listeners.click||[])f({target:this,preventDefault(){}});}
 }
 function parse(s,parent){const stack=[parent],tokens=/<\/[^>]+>|<([a-z][\w-]*)\b((?:"[^"]*"|'[^']*'|[^>"'])*)>|([^<]+)/gi;let m;while((m=tokens.exec(s))){if(m[0].startsWith('</')){const t=m[0].slice(2,-1).trim().toUpperCase();while(stack.length>1){if(stack.pop().tagName===t)break;}continue;}if(m[1]){const attrs={},re=/([\w-]+)(?:\s*=\s*"([^"]*)")?/g;let a;while((a=re.exec(m[2])))attrs[a[1]]=decode(a[2]??'');const tag=m[1].toLowerCase(),e=new El(tag,attrs,stack.at(-1));if(tag==='option'){const select=[...stack].reverse().find(e=>e.tagName==='SELECT');select.options.push(e);if(select.options.length===1||'selected'in attrs)select.value=select.defaultValue=e.value;}if(!voidTags.has(tag))stack.push(e);}else if(m[3]){const e=stack.at(-1);e.textContent+=decode(m[3]);if(e.tagName==='TEXTAREA')e.value=e.defaultValue=e.textContent;}}}
 const root=new El('root');parse(markup.replace(/<script[^>]*>[\s\S]*?<\/script>/g,m=>m.includes('type="application/json"')?'<div id="pd-embedded-documents"></div>':'').replace(/<style>[\s\S]*?<\/style>/g,''),root);
 function matches(e,s){if(s.startsWith('#'))return e.id===s.slice(1);if(s.startsWith('.'))return(e.attrs.class||'').split(' ').includes(s.slice(1));const group=s.match(/\[data-group="([^"]+)"\]/),name=s.match(/\[name="([^"]+)"\]/);if(group&&e.dataset.group!==group[1])return false;if(name&&e.attrs.name!==name[1])return false;if(s.includes(':checked')&&!e.checked)return false;if(s==='[data-tab]')return!!e.dataset.tab;if(s.startsWith('input'))return e.tagName==='INPUT';return false;}
 doc={elements,all,activeElement:null,listeners:{},getElementById:id=>elements.get(id)||null,createElement:t=>new El(t),addEventListener(k,f){(this.listeners[k]??=[]).push(f);},querySelector:s=>all.find(e=>matches(e,s))||null,querySelectorAll:s=>s==='.drug details'?all.filter(e=>e.tagName==='DETAILS'&&e.parentElement?.attrs.class?.startsWith('drug')):all.filter(e=>matches(e,s))};return doc;
}
function makeWindow(doc,parent){const w={document:doc,parent:null,listeners:{},live:true,addEventListener(k,f){(this.listeners[k]??=[]).push(f);},matchMedia(){return {matches:true};},print(){},confirm(){return true;},postMessage(data){queue.push({dest:w,source:currentWindow,data});}};w.parent=parent||w;w.window=w;w.self=w;return w;}
function withWindow(w,fn){const old=currentWindow;currentWindow=w;try{return fn();}finally{currentWindow=old;}}
function context(w){const ctx={window:w,document:w.document,console,Blob,Event:class{constructor(type,options={}){this.type=type;this.bubbles=!!options.bubbles;}},URL:{createObjectURL(){return'blob:test';},revokeObjectURL(){}},crypto:{getRandomValues(a){for(let i=0;i<a.length;i++)a[i]=++nonce;return a;}},setTimeout(fn){timers.push({w,fn});return timers.length;},clearTimeout(){}};vm.createContext(ctx);w.ctx=ctx;return ctx;}
function run(w,code){withWindow(w,()=>vm.runInContext(code,w.ctx));}
const shellDoc=createDocument(html),shell=makeWindow(shellDoc);context(shell);shellDoc.getElementById('pd-embedded-documents').textContent=JSON.stringify(docs);
for(const[id,kind]of[['pd-draft-frame','draft'],['pd-compass-frame','compass']]){const el=shellDoc.getElementById(id);Object.defineProperty(el,'srcdoc',{set(source){if(el.contentWindow)el.contentWindow.live=false;const w=makeWindow(createDocument(source),shell);context(w);el.contentWindow=w;const scripts=[...source.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/g)].map(x=>x[1]);if(kind==='compass')for(const script of scripts)run(w,script);else for(const script of scripts.slice(-2))run(w,script);}});}
run(shell,[...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].at(-1)[1]);
function flush(){let count=0;while(queue.length||timers.length){if(++count>400)throw Error('Message loop');while(queue.length){const m=queue.shift();if(m.dest.live)withWindow(m.dest,()=>{for(const f of m.dest.listeners.message||[])f({source:m.source,data:m.data});});}const t=timers.splice(0);for(const x of t)if(x.w.live)withWindow(x.w,x.fn);}}
flush();const win=kind=>shellDoc.getElementById('pd-'+kind+'-frame').contentWindow;const el=(kind,id)=>win(kind).document.getElementById(id);const code=(kind,s)=>withWindow(win(kind),()=>vm.runInContext(s,win(kind).ctx));
function change(kind,id,v){const w=win(kind),e=el(kind,id);if(typeof v==='boolean')e.checked=v;else e.value=v;withWindow(w,()=>{for(let node=e;node;node=node.parentElement)for(const f of node.listeners.change||[])f({target:e});for(const f of w.document.listeners.change||[])f({target:e});});flush();}
const check=(name,value)=>{assert.ok(value,name);assertions++;};
check('Initial source transfer gated',code('compass','window.lastResult.drugs.length')===0);
for(const[id,v]of Object.entries({'diagnosis':'F32.1 Депрессивный эпизод','pd-shared-age':'38','pd-shared-preg':'no','pd-shared-bipolar':'no','pd-shared-suicide':'no','pd-shared-psychosis':'no','pd-shared-current':'none','pd-shared-historyStatus':'none','pd-shared-renal':'normal','pd-shared-liver':'normal','pd-shared-alt':'normal'}))change('draft',id,v);
const sleep=win('draft').document.all.find(e=>e.attrs.name==='sleep'&&e.value.startsWith('проблемы с засыпанием'));sleep.checked=true;
change('draft','pd-source-confirmed',true);withWindow(shell,()=>shellDoc.getElementById('pd-tab-compass').click());flush();
check('Age transferred',code('compass','state().age')==='38');check('Diagnosis transferred',code('compass','state().dx')==='mdd');check('Sleep transferred',code('compass',"state().symptoms.includes('insomnia')"));check('Only severity required',JSON.stringify(code('compass','window.lastResult.gate.missing'))===JSON.stringify(['Тяжесть']));
check('No separate diagnosis selector',el('draft','pd-shared-dx')===null);
check('No upper symptom list',el('draft','pd-source-extra-symptoms')===null);
check('Single shared disclaimer',!docs.draft.includes('Рабочая экспериментальная версия.')&&!docs.compass.includes('Рабочая экспериментальная версия.'));
for(const[key,section]of[['fatigue','status-mood'],['anhedonia','status-mood'],['pain','status-perception'],['hypersomnia','status-sleep-appetite'],['diarrhea','status-sleep-appetite'],['constipation','status-sleep-appetite']]){
 const field=el('draft','pd-status-'+key);let owner=field;while(owner&&owner.id!==section)owner=owner.parentElement;check(key+' belongs to its clinical section',!!owner);
 change('draft','pd-status-'+key,true);check(key+' transferred from status',code('compass',`state().symptoms.includes('${key}')`));
 change('draft','pd-status-'+key,false);check(key+' removed when unchecked',!code('compass',`state().symptoms.includes('${key}')`));
}
// Execute the actual generated diagnosis writers, rather than recreating their logic.
run(win('draft'),docs.draft.slice(docs.draft.indexOf('function addDiagnosisCode('),docs.draft.indexOf('function makeCriterionLabel(')));
run(win('draft'),"const icd10=[{code:'F41.1',name:'ГТР'}];\n"+docs.draft.slice(docs.draft.indexOf('function searchICD('),docs.draft.indexOf('const RECOMMENDATIONS_LIBRARY')));
change('draft','diagnosis','');change('draft','icd_search','F41');code('draft','searchICD()');withWindow(win('draft'),()=>el('draft','icd_results').children[0].click());flush();check('ICD search click updates compass',code('compass','state().dx')==='gad');
change('draft','diagnosis','');code('draft',"addDiagnosisCode('F42.2','ОКР',true)");flush();check('Advisor diagnosis addition updates compass',code('compass','state().dx')==='ocd');code('draft',"addDiagnosisCode('F42.2','ОКР',false)");flush();check('Advisor diagnosis removal clears compass',code('compass','state().dx')==='');
change('draft','diagnosis','F32.1 Депрессивный эпизод');change('draft','pd-source-confirmed',true);
// A click must scroll in place and prevent navigation, preserving both frames and source fields.
const originalDraft=win('draft');for(const link of originalDraft.document.all.filter(e=>e.tagName==='A'&&e.attrs.href?.startsWith('about:srcdoc#'))){let prevented=false;withWindow(originalDraft,()=>{for(const f of originalDraft.document.listeners.click||[])f({target:link,preventDefault(){prevented=true;}});});check('Fragment stays inside source: '+link.attrs.href,prevented&&originalDraft.document.getElementById(link.attrs.href.slice(13))?.scrolled);}
check('Navigation preserves source frame and entered values',win('draft')===originalDraft&&el('draft','pd-shared-age').value==='38');
change('compass','severity','moderate');change('compass','target-insomnia',true);check('Recommendations available',code('compass','window.lastResult.drugs.length')===14);
for(let i=0;i<3;i++){withWindow(shell,()=>shellDoc.getElementById('pd-tab-draft').click());withWindow(shell,()=>shellDoc.getElementById('pd-tab-compass').click());flush();}
check('Severity preserved on switching',code('compass','state().severity')==='moderate');check('Targets preserved on switching',code('compass',"state().targets.includes('insomnia')"));
change('draft','pd-shared-age','42');change('draft','pd-source-confirmed',true);check('Identity change clears severity',code('compass','state().severity')==='');check('Identity change clears target',code('compass','state().targets.length')===0);
const oldAge=code('compass','state().age');withWindow(shell,()=>win('compass').postMessage({channel:'psydraft-compass',token:'bad',type:'apply-source',snapshot:{profile:{age:'90'}}}));flush();check('Bad token ignored',code('compass','state().age')===oldAge);
change('draft','pd-shared-age','38.5');check('Invalid incoming data suspends old recommendations',code('compass','window.lastResult.drugs.length')===0&&code('compass','state().confirmed')===false);check('Invalid incoming data clears severity',code('compass','state().severity')==='');
const oldDraft=win('draft');withWindow(shell,()=>shellDoc.getElementById('pd-new-case').click());flush();check('New case reloads source',win('draft')!==oldDraft&&el('draft','pd-shared-age').value==='');check('New case clears compass',code('compass','state().age')===''&&code('compass','window.lastResult.drugs.length')===0);
console.log(JSON.stringify({integrationAssertions:assertions,passed:true,note:'DOM and asynchronous message simulation; not browser rendering'},null,2));
