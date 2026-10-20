// srcdoc inherits the outer document's base URL. Fragment links must stay in this document.
function installEmbeddedNavigation(doc) {
 doc.addEventListener('click',event=>{
  const link=event.target.closest?.('a[href]');
  if(!link)return;
  const href=link.getAttribute('href')||'';
  const fragment=href.startsWith('#')?href.slice(1):href.startsWith('about:srcdoc#')?href.slice(13):null;
  if(fragment===null)return;
  event.preventDefault();
  let id;try{id=decodeURIComponent(fragment);}catch{return;}
  const target=doc.getElementById(id);if(!target)return;
  for(let node=target.parentElement;node;node=node.parentElement)if(node.tagName==='DETAILS')node.open=true;
  target.scrollIntoView({block:'start',behavior:'smooth'});
  if(!target.hasAttribute('tabindex'))target.setAttribute('tabindex','-1');
  target.focus({preventScroll:true});
 },true);
}
installEmbeddedNavigation(document);
