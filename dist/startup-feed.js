const paths = {
  home:'<path d="m3 10 9-7 9 7v10H15v-7H9v7H3z"/>',
  program:'<path d="m12 2 4 4-4 4-4-4zm-6 6 4 4-4 4-4-4zm12 0 4 4-4 4-4-4zm-6 6 4 4-4 4-4-4z"/>',
  clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  people:'<circle cx="9" cy="7" r="3"/><path d="M3 21v-4a6 6 0 0 1 12 0v4M16 4a3 3 0 0 1 0 6m2 4a5 5 0 0 1 3 5v2"/>',
  pin:'<path d="M19 10c0 5-7 11-7 11S5 15 5 10a7 7 0 0 1 14 0z"/><circle cx="12" cy="10" r="2"/>',
  feed:'<rect x="5" y="2" width="14" height="20" rx="3"/><path d="m10 8 5 4-5 4z"/>',
  menu:'<path d="M4 6h16M4 12h16M4 18h16"/>',
  bell:'<path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4"/>',
  scan:'<path d="M8 3H3v5m13-5h5v5M3 16v5h5m13-5v5h-5M8 8h8v8H8z"/>',
  arrow:'<path d="m9 5 7 7-7 7"/>',close:'<path d="m6 6 12 12M6 18 18 6"/>',
  bookmark:'<path d="M6 3h12v19l-6-4-6 4z"/>',
  message:'<path d="M21 11a8 8 0 0 1-8 8H7l-5 3 1.5-6A8 8 0 1 1 21 11z"/><path d="M7 10h10M7 14h6"/>',
  share:'<path d="M12 16V3m-5 5 5-5 5 5M5 13v8h14v-8"/>',
  sound:'<path d="m11 4-6 5H2v6h3l6 5zM15 8a6 6 0 0 1 0 8m3-11a10 10 0 0 1 0 14"/>',
  mute:'<path d="m11 4-6 5H2v6h3l6 5zM16 9l6 6m0-6-6 6"/>',
  down:'<path d="m5 9 7 7 7-7"/>',play:'<path d="m8 4 12 8-12 8z"/>',
  pause:'<path d="M8 5v14M16 5v14"/>',check:'<path d="m5 12 4 4L20 5"/>',
  send:'<path d="m3 3 19 9-19 9 4-9zM7 12h15"/>'
};
const icon=name=>`<svg viewBox="0 0 24 24" aria-hidden="true">${paths[name]||paths.arrow}</svg>`;
const escapeHTML=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const tabs=[['home','Home','home'],['program','Program','program'],['agenda','My Agenda','clock'],['meetings','Meetings','people'],['map','Map','pin'],['feed','Feed','feed']];
// Fictional startup profiles with locally hosted demo footage. Replace video/poster
// with permission-cleared founder recordings to keep the same native feed experience.
const startups=[
  {id:'signal',video:'/media/4550.mp4',poster:'/media/4550.jpg',name:'Signal Studio',initial:'S',color:'#7e78bd',founder:'The Signal Studio team',role:'Founders',hasAudio:false,category:'Creator tools',title:'Every idea deserves an audience.',description:'A sample startup concept: simple tools that help creators turn their expertise into useful video content.',tags:['Creator economy','Video'],source:'https://mixkit.co/free-stock-video/vlogger-recording-in-sign-language-4550/'},
  {id:'relay',video:'/media/41289.mp4',poster:'/media/41289.jpg',name:'Relay',initial:'R',color:'#77a354',founder:'The Relay team',role:'Founders',hasAudio:false,category:'Workflow software',title:'Less busywork. More building.',description:'A sample startup concept: one workspace for small teams to automate their everyday operations.',tags:['B2B SaaS','Automation'],source:'https://mixkit.co/free-stock-video/youtuber-recording-himself-41289/'},
  {id:'loop',video:'/media/42323.mp4',poster:'/media/42323.jpg',name:'Loop',initial:'L',color:'#4b98a3',founder:'The Loop team',role:'Founders',hasAudio:false,category:'Customer experience',title:'Closer to every customer.',description:'A sample startup concept: bringing customer conversations together so teams can provide more personal support.',tags:['B2B','Customer support'],source:'https://mixkit.co/free-stock-video/portrait-of-an-influencer-talking-to-the-camera-42323/'}
];
const content=document.querySelector('#content'),modal=document.querySelector('#modal');
let currentTab=location.hash==='#home'?'home':'feed',activeId=startups[0].id,muted=true;
let observer,toastTimer,resumeAfterDialog=false,renderGeneration=0;
let players=new Map(),manualPauses=new Set();
const reducedMotion=matchMedia('(prefers-reduced-motion: reduce)').matches;
let saved=[];let conversations={};let drafts={};
try{const data=JSON.parse(localStorage.getItem('slush-startups-v1'));if(data){saved=Array.isArray(data.saved)?data.saved.filter(id=>startups.some(s=>s.id===id)):[];conversations=data.conversations&&typeof data.conversations==='object'?data.conversations:{};drafts=data.drafts&&typeof data.drafts==='object'?data.drafts:{}}}catch{}
function persist(){try{localStorage.setItem('slush-startups-v1',JSON.stringify({saved,conversations,drafts}));return true}catch{return false}}
function toast(message){const el=document.querySelector('#toast');el.textContent=message;el.classList.add('visible');clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove('visible'),2600)}
function startup(id){return startups.find(s=>s.id===id)}
function badge(s){return `<span class="startup-logo" style="--logo-color:${s.color}">${s.initial}</span>`}
function pauseAll(){players.forEach(video=>video.pause())}
function canPlay(id){return currentTab==='feed'&&id===activeId&&!document.hidden&&!modal.open&&!manualPauses.has(id)}
function play(id){const video=players.get(id);if(video&&canPlay(id)){video.muted=muted;video.play()?.catch(()=>updatePlayback(id))}}
function teardown(){observer?.disconnect();pauseAll();players.clear()}
function render(){
  teardown();renderGeneration++;document.body.classList.toggle('pitch-mode',currentTab==='feed');
  document.querySelector('.topbar').hidden=currentTab==='feed';
  document.querySelector('.bottom-nav').innerHTML=tabs.map(([id,label,symbol])=>`<button class="nav-item ${currentTab===id?'active':''}" data-tab="${id}" ${!['home','feed'].includes(id)?'aria-disabled="true" title="Coming soon"':''} ${currentTab===id?'aria-current="page"':''}>${icon(symbol)}<span>${label}</span></button>`).join('');
  content.className=currentTab==='feed'?'pitch-main':'';
  content.innerHTML=currentTab==='feed'?feed():home();
  document.querySelectorAll('[data-icon]').forEach(el=>el.innerHTML=icon(el.dataset.icon));
  if(currentTab==='feed')initFeed();
}
function home(){return `<section class="welcome"><div><p class="eyebrow">WELCOME TO SLUSH</p><h1>Hello, Slusher<span style="color:var(--green)">.</span></h1><p class="subtext">Meet the founders. Discover what’s next.</p></div><span class="avatar large">AK</span></section><section class="pitch-home"><span class="pill">FOUNDER PITCHES</span><h2>A minute to discover.<br>A conversation to connect.</h2><p>Hear what founders are building, save the startups that interest you, and start a conversation.</p><button class="primary-button" data-tab="feed">Discover startups ${icon('play')}</button><button class="outline-button" data-action="shortlist">${icon('bookmark')} Your shortlist (${saved.length})</button><button class="credits-link" data-action="credits">About the demo</button></section>`}
function feed(){return `<div class="pitch-layout"><section class="pitch-viewport" aria-label="Startup pitch feed" tabindex="0">${startups.map((s,i)=>`<article class="pitch-card" data-startup="${s.id}" aria-label="${s.name} founder pitch" style="--startup-accent:${s.color}"><div class="pitch-player-region"><video id="player-${s.id}" src="${s.video}" poster="${s.poster}" playsinline loop muted preload="${i===0?'auto':'metadata'}" aria-label="${s.name} demo video"></video><div class="player-loading" hidden><span>Loading video…</span></div><div class="player-error" hidden><p>This video couldn’t load.</p><button class="outline-button" data-action="retry">Try again</button></div></div><div class="pitch-shade"></div><button class="pitch-tap" data-action="play" aria-label="Play ${s.name} pitch"><span>${icon('play')}</span></button><div class="pitch-info"><button class="startup-identity" data-action="startup" aria-label="About ${s.name}"><span><strong>${s.name}</strong><span>${s.category} ${icon('arrow')}</span></span></button><h1>${s.title}</h1><div class="startup-tags">${s.tags.map(tag=>`<span>#${tag.replace(/\s/g,'')}</span>`).join('')}</div><span class="pitch-source">DEMO STARTUP · SAMPLE FOOTAGE</span></div><div class="pitch-actions"><button class="profile-action" data-action="startup" aria-label="View ${s.name} startup profile">${badge(s)}<span class="profile-plus" aria-hidden="true">+</span></button><button class="message-action" data-action="message" aria-label="Message ${s.name}"><span class="action-circle">${icon('message')}</span><span>Message</span></button><button data-action="save" aria-label="Save ${s.name}" aria-pressed="${saved.includes(s.id)}" class="${saved.includes(s.id)?'is-active':''}"><span class="action-circle">${icon('bookmark')}</span><span>${saved.includes(s.id)?'Saved':'Save'}</span></button><button data-action="share" aria-label="Share ${s.name}"><span class="action-circle">${icon('share')}</span><span>Share</span></button></div><div class="pitch-playback"><button data-action="play" aria-label="Play ${s.name} pitch">${icon('play')}</button><button class="sound-control" data-action="mute" aria-label="Unmute pitch">${icon('mute')}</button><span class="pitch-position">${String(i+1).padStart(2,'0')} / ${String(startups.length).padStart(2,'0')}</span></div><div class="pitch-progress"><span></span></div></article>`).join('')}</section><aside class="pitch-navigation"><button class="round-control" data-step="-1" aria-label="Previous startup">${icon('down')}</button><button class="round-control" data-step="1" aria-label="Next startup">${icon('down')}</button></aside></div>`}
function showPlayerError(id){const card=document.querySelector('[data-startup="'+id+'"]');if(!card)return;card.querySelector('.player-error').hidden=false;card.querySelector('.player-loading').hidden=true}
function updatePlayback(id){const video=players.get(id),s=startup(id);if(!video)return;const card=video.closest('.pitch-card');card.classList.toggle('is-paused',video.paused);card.querySelectorAll('[data-action="play"]').forEach(button=>{button.setAttribute('aria-label',(video.paused?'Play ':'Pause ')+s.name+' pitch');if(!button.classList.contains('pitch-tap'))button.innerHTML=icon(video.paused?'play':'pause')})}
function initFeed(){
  const viewport=document.querySelector('.pitch-viewport');
  const shared=location.hash.match(/^#feed\/([a-z]+)$/)?.[1];activeId=startup(shared)?shared:startups[0].id;
  const generation=renderGeneration;
  viewport.querySelectorAll('.pitch-card').forEach(card=>{
    const id=card.dataset.startup,video=card.querySelector('video');players.set(id,video);video.muted=muted;
    video.addEventListener('play',()=>{if(!canPlay(id)){video.pause();return}updatePlayback(id)});
    video.addEventListener('pause',()=>updatePlayback(id));
    video.addEventListener('canplay',()=>{card.querySelector('.player-loading').hidden=true;card.querySelector('.player-error').hidden=true;if(generation===renderGeneration&&!reducedMotion)play(id)});
    video.addEventListener('playing',()=>{card.querySelector('.player-loading').hidden=true});
    video.addEventListener('waiting',()=>{if(canPlay(id)&&!video.paused)card.querySelector('.player-loading').hidden=false});
    video.addEventListener('error',()=>showPlayerError(id));
    video.addEventListener('timeupdate',()=>{card.querySelector('.pitch-progress span').style.width=video.duration?(video.currentTime/video.duration*100)+'%':'0%'});
    updatePlayback(id);
  });
  observer=new IntersectionObserver(entries=>{for(const entry of entries){const id=entry.target.dataset.startup;if(entry.isIntersecting&&entry.intersectionRatio>.65){activeId=id;players.forEach((video,other)=>{if(other!==id)video.pause()});if(!reducedMotion)play(id);updateArrows()}else players.get(id)?.pause()}},{root:viewport,threshold:[0,.65]});
  viewport.querySelectorAll('.pitch-card').forEach(card=>observer.observe(card));
  if(shared)viewport.scrollTop=document.querySelector('[data-startup="'+activeId+'"]').offsetTop;
  updateSound();updateArrows();
}
function updateArrows(){const index=startups.findIndex(s=>s.id===activeId);const prev=document.querySelector('[data-step="-1"]'),next=document.querySelector('[data-step="1"]');if(prev)prev.disabled=index===0;if(next)next.disabled=index===startups.length-1}
function moveVideo(step){const next=startups[startups.findIndex(s=>s.id===activeId)+step];if(next){const viewport=document.querySelector('.pitch-viewport');viewport.focus({preventScroll:true});viewport.scrollTo({top:document.querySelector(`[data-startup="${next.id}"]`).offsetTop,behavior:reducedMotion?'instant':'smooth'})}}
function updateSound(){players.forEach(video=>video.muted=muted);document.querySelectorAll('.sound-control').forEach(b=>{const silent=startup(b.closest('[data-startup]').dataset.startup).hasAudio===false;b.disabled=silent;b.innerHTML=icon(silent||muted?'mute':'sound');b.setAttribute('aria-label',silent?'Silent demo clip':muted?'Unmute pitch':'Mute pitch');b.title=silent?'This sample clip has no audio':''})}
function navigate(tab){if(!['home','feed'].includes(tab)){toast('This tab is coming soon');return}currentTab=tab;history.replaceState(null,'',`#${tab}`);render();window.scrollTo(0,0)}
function showModal(title,body,kind=''){
  if(!modal.open){resumeAfterDialog=!!players.get(activeId)&&!players.get(activeId).paused;pauseAll()}
  modal.className=kind;document.querySelector('#modal-content').innerHTML=`<div class="modal-head"><h2>${escapeHTML(title)}</h2><button class="icon-button" data-action="close" aria-label="Close dialog">${icon('close')}</button></div><div class="modal-body">${body}</div>`;
  if(!modal.open)modal.showModal();
}
function showStartup(s){showModal(s.name,`<div class="startup-profile-head">${badge(s)}<div><strong>${s.category}</strong><p>Demo startup profile</p></div></div><h3>${s.title}</h3><p>${s.description}</p><div class="startup-tags">${s.tags.map(t=>`<span>${t}</span>`).join('')}</div><div class="profile-founder">${icon('people')}<div><strong>${s.founder}</strong><span>${s.role}</span></div></div><button class="primary-button full" data-action="message" data-id="${s.id}">${icon('message')} Message startup</button><a class="credit-row" href="${s.source}" target="_blank" rel="noopener noreferrer">Demo video credit ↗</a><p class="demo-note">Fictional startup concept with sample footage. The people in the demo clips are not representatives of this startup.</p>`,'startup-sheet')}
function messageItems(id){const items=Array.isArray(conversations[id])?conversations[id]:[];return items.filter(m=>typeof m.text==='string').map(m=>`<div class="chat-message"><p>${escapeHTML(m.text)}</p><span>Saved locally · Not delivered</span></div>`).join('')}
function showMessages(s){
  showModal(`Message ${s.name}`,`<div class="chat-recipient">${badge(s)}<div><strong>${s.founder}</strong><span>${s.name} · ${s.role}</span></div></div><p class="demo-banner">Demo conversation. Messages stay on this device and are not delivered.</p><div class="chat-history" aria-live="polite">${messageItems(s.id)||'<div class="chat-empty"><h3>Start with a hello.</h3><p>Ask about the product, the team, or what they’re building next.</p></div>'}</div><div class="message-prompts"><button type="button" data-prompt="product">Ask about the product</button><button type="button" data-prompt="meet">Suggest a meeting</button></div><form id="message-form" data-startup="${s.id}"><label class="sr-only" for="message-text">Your message to ${s.name}</label><textarea id="message-text" name="message" rows="3" maxlength="2000" placeholder="Hi ${s.name} team, I’d love to hear more…" required>${escapeHTML(drafts[s.id]||'')}</textarea><div class="composer-footer"><span id="message-count">${(drafts[s.id]||'').length} / 2000</span><button class="primary-button" type="submit">Send demo ${icon('send')}</button></div></form>`,'message-sheet');
  const history=document.querySelector('.chat-history');history.scrollTop=history.scrollHeight;
}
function showShortlist(){showModal('Your shortlist',saved.length?saved.map(id=>{const s=startup(id);return `<button class="shortlist-row" data-action="startup" data-id="${id}">${badge(s)}<span><strong>${s.name}</strong><span>${s.category}</span></span>${icon('arrow')}</button>`}).join(''):'<p>Save startups from the feed to find them here.</p><button class="primary-button full" data-tab="feed">Discover startups</button>')}
modal.addEventListener('close',()=>{if(resumeAfterDialog)play(activeId)});
document.addEventListener('click',async event=>{
  const el=event.target.closest('button,a');if(!el)return;
  if(el.matches('.wordmark')){event.preventDefault();navigate('home');return}
  if(el.dataset.tab){modal.close();navigate(el.dataset.tab);return}
  if(el.dataset.step){moveVideo(Number(el.dataset.step));return}
  if(el.dataset.prompt){const form=document.querySelector('#message-form'),s=startup(form.dataset.startup),field=form.querySelector('textarea');field.value=el.dataset.prompt==='meet'?`Hi ${s.name} team, I enjoyed your pitch. Would you be up for a quick chat?`:`Hi ${s.name} team, I’d love to learn more about your product. Could you share a quick demo?`;field.dispatchEvent(new Event('input',{bubbles:true}));field.focus();return}
  const action=el.dataset.action,id=el.dataset.id||el.closest('[data-startup]')?.dataset.startup||activeId,s=startup(id);
  if(action==='play'){const video=players.get(id);if(video&&!video.paused){manualPauses.add(id);video.pause()}else{manualPauses.delete(id);play(id)}}
  if(action==='mute'){muted=!muted;updateSound()}
  if(action==='startup')showStartup(s);
  if(action==='message')showMessages(s);
  if(action==='save'){const exists=saved.includes(id);saved=exists?saved.filter(x=>x!==id):[...saved,id];const stored=persist();el.classList.toggle('is-active',!exists);el.setAttribute('aria-pressed',String(!exists));el.lastElementChild.textContent=exists?'Save':'Saved';toast(stored?(exists?'Removed from shortlist':`${s.name} added to your shortlist`):'Saved for this session only')}
  if(action==='shortlist')showShortlist();
  if(action==='share'){const url=new URL(location.href);url.pathname='/';url.hash=`feed/${id}`;try{if(navigator.share)await navigator.share({title:`${s.name} — founder pitch`,url:url.href});else{await navigator.clipboard.writeText(url.href);toast('Pitch link copied')}}catch(error){if(error.name!=='AbortError')showModal('Share this startup',`<p>Copy the link to ${s.name}’s pitch:</p><input class="share-url" aria-label="Pitch link" readonly value="${escapeHTML(url.href)}">`)}}
  if(action==='retry'){const region=el.closest('.pitch-player-region');region.querySelector('.player-error').hidden=true;region.querySelector('.player-loading').hidden=false;manualPauses.delete(id);players.get(id)?.load();play(id)}
  if(action==='close')modal.close();
  if(action==='menu')showModal('Your Slush',`<button class="menu-row" data-tab="feed">${icon('feed')} Founder pitches ${icon('arrow')}</button><button class="menu-row" data-action="shortlist">${icon('bookmark')} Your shortlist (${saved.length}) ${icon('arrow')}</button><button class="menu-row" data-action="credits">About the demo ${icon('arrow')}</button>`);
  if(action==='notifications')showModal('You’re all caught up','<p>No new notifications.</p>');
  if(action==='profile'||action==='pass')showModal('Hello, Slusher.','<p>Explore founder pitches and keep a shortlist of startups that interest you.</p><button class="primary-button full" data-action="shortlist">Your shortlist</button>');
  if(action==='credits')showModal('About these pitches',`<p>Fictional startups with sample clips from Mixkit. Founder recordings can use the same native player. Messages are saved locally and never delivered.</p>${startups.map(s=>`<a class="credit-row" href="${s.source}" target="_blank" rel="noopener noreferrer">${s.name} · Demo footage source ↗</a>`).join('')}`);
});
document.addEventListener('input',event=>{if(event.target.id==='message-text'){const id=event.target.closest('form').dataset.startup;drafts[id]=event.target.value;persist();document.querySelector('#message-count').textContent=`${event.target.value.length} / 2000`}});
document.addEventListener('submit',event=>{
  if(event.target.id!=='message-form')return;event.preventDefault();
  const form=event.target,field=form.querySelector('textarea'),text=field.value.trim(),id=form.dataset.startup;
  if(!text){field.setCustomValidity('Write a message first.');field.reportValidity();field.addEventListener('input',()=>field.setCustomValidity(''),{once:true});return}
  if(!Array.isArray(conversations[id]))conversations[id]=[];conversations[id].push({text,createdAt:new Date().toISOString()});drafts[id]='';const stored=persist();
  document.querySelector('.chat-history').innerHTML=messageItems(id);field.value='';document.querySelector('#message-count').textContent='0 / 2000';const history=document.querySelector('.chat-history');history.scrollTop=history.scrollHeight;
  toast(stored?'Demo message saved · Not delivered':'Message kept for this session only');field.focus();
});
document.addEventListener('keydown',event=>{if(currentTab!=='feed'||modal.open||event.target.matches('input,textarea,button,a'))return;if(['ArrowDown','ArrowUp'].includes(event.key)){event.preventDefault();moveVideo(event.key==='ArrowDown'?1:-1)}if(event.code==='Space'){event.preventDefault();document.querySelector(`[data-startup="${activeId}"] [data-action="play"]`)?.click()}});
document.addEventListener('visibilitychange',()=>{if(document.hidden)pauseAll();else if(!reducedMotion)play(activeId)});
window.addEventListener('hashchange',()=>{currentTab=location.hash==='#home'?'home':'feed';render()});
if(document.modelContext?.registerTool){try{Promise.resolve(document.modelContext.registerTool({name:'navigate_slush',description:'Open Home or the startup pitch feed.',inputSchema:{type:'object',properties:{tab:{type:'string',enum:['home','feed']}},required:['tab'],additionalProperties:false},annotations:{readOnlyHint:false},execute(input){if(!input||!['home','feed'].includes(input.tab))throw Error('Choose home or feed');navigate(input.tab);return {tab:currentTab}}})).catch(()=>{})}catch{}}
render();
