// The sandboxed document never receives same-origin access to the parent.
(() => {
 'use strict';
 const token='__PD_SESSION_TOKEN__';
 const seed=__PD_CASE_SEED__;
 let currentRaw=typeof seed.raw==='string'?seed.raw:null;
 let nextId=0;
 const pending=new Map();
 window.addEventListener('message',event=>{
  const message=event.data;
  if(event.source!==window.parent||!message||message.channel!=='psydraft-compass'||message.token!==token||message.type!=='case-storage-ack')return;
  const request=pending.get(message.requestId);
  if(!request)return;
  pending.delete(message.requestId);clearTimeout(request.timer);
  if(message.ok===true)currentRaw=request.text;
  request.resolve({ok:message.ok===true,code:message.code||null});
 });
 window.PsyCaseStorageProvider={
  read(){if(seed.error)throw new Error(seed.error);return currentRaw;},
  write(text,expected){return new Promise(resolve=>{
   const requestId=++nextId;
   const timer=setTimeout(()=>{if(pending.delete(requestId))resolve({ok:false,code:'timeout'});},10000);
   pending.set(requestId,{resolve,timer,text});
   window.parent.postMessage({channel:'psydraft-compass',token,type:'case-storage-write',requestId,text,expected},'*');
  });},
  requestReset(){window.parent.postMessage({channel:'psydraft-compass',token,type:'case-reset-request'},'*');}
 };
})();
