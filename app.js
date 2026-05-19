// =============================================
// KEIBELHEXEN — App Logic (v3, design-system aligned)
// =============================================

const GH_USER   = 'Keibelhexen';
const GH_REPO   = 'Keibelhexen-keibelhexen';
const GH_BRANCH = 'main';
const INSTA     = 'keibelhexen_huchenfeld';

const ZIRKEL = [
  {name:'Manuel', role:'Ober-Hexe'},
  {name:'Nicola', role:'Kassen-Hexe'},
  {name:'Uwe',    role:'Vernunft-Hexe'},
  {name:'Robin',  role:'Getränke-DJ-Hexe'},
  {name:'Petra',  role:'Kreativ-Hexe'},
  {name:'Frank',  role:'Ichbinauchdabei-Hexe'},
  {name:'Marcel', role:'Hands-on-Hexe'}
];
const MEDIENTEAM = [
  {name:'Vero', role:'Medien-Hexe'}
];

const RAW = `https://raw.githubusercontent.com/${GH_USER}/${GH_REPO}/${GH_BRANCH}`;
const API = `https://api.github.com/repos/${GH_USER}/${GH_REPO}/contents`;

// Static manifest — drawn first so the page paints with sensible defaults
// while the live GitHub loader catches up with any newly-added files.
// Paths point to raw.githubusercontent.com (LOCAL_FIRST=false).
const MANIFEST = {
  logo:     'images/logo/Logo.png',
  hero:     'images/logo/Logo.png',
  haes:     'images/ueber-uns/Keibelhexen_0456.jpg',
  larve:    'images/maske/Larve.png',
  gesch:    'images/geschichte/Hexenverbrennungen.JPG',
  zirkel: {
    Manuel: 'images/zirkel/manuel.jpeg',
    Nicola: 'images/zirkel/nicola.jpeg',
    Uwe:    'images/zirkel/Uwe.jpeg',
    Robin:  'images/zirkel/robin.jpeg',
    Petra:  'images/zirkel/petra.jpeg',
    Frank:  'images/zirkel/Frank.jpeg',
    Marcel: 'images/zirkel/marcel.jpeg',
    Vero:   'images/zirkel/Vero.jpeg'
  },
  gallery: [],     // filled dynamically by loadFromGitHub()
  flyers:  []      // filled dynamically by loadFromGitHub()
};

const dd = {gallery:[],flyers:[],zirkel:[],medienteam:[]};
let lbItems=[], lbIdx=0, lbTx=0;

// ─── SVG library ────────────────────────────────────
const SVG = {
  witch: '<svg viewBox="0 0 64 64" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M32 6c-3 0-5 2-5 5 0 1 0 2 1 3l-3 4c-1 1-2 3-2 5v6c0 2 1 3 2 4l-4 2c-2 1-4 3-4 6v4h30v-4c0-3-2-5-4-6l-4-2c1-1 2-2 2-4v-6c0-2-1-4-2-5l-3-4c1-1 1-2 1-3 0-3-2-5-5-5zm-8 28l-10-8 2-4 10 6-2 6zm16 0l-2-6 10-6 2 4-10 8zM18 50h28v6H18v-6z"/></svg>',
  user: '<svg viewBox="0 0 64 64" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><circle cx="32" cy="22" r="10"/><path d="M12 56c0-11 9-20 20-20s20 9 20 20"/></svg>',
  cam: '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.5" xmlns="http://www.w3.org/2000/svg"><path d="M8 20h10l4-6h20l4 6h10v30H8z"/><circle cx="32" cy="32" r="9"/></svg>',
  doc: '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.5" xmlns="http://www.w3.org/2000/svg"><path d="M14 8h26l10 10v38H14z"/><path d="M40 8v10h10"/><path d="M22 30h20M22 38h20M22 46h14"/></svg>',
  mail: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M2 7l10 7 10-7"/></svg>',
  insta: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor"/></svg>',
  pin: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg"><path d="M12 22s8-7 8-13a8 8 0 10-16 0c0 6 8 13 8 13z"/><circle cx="12" cy="9" r="3"/></svg>',
  pdf: '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.5" xmlns="http://www.w3.org/2000/svg"><path d="M14 6h28l10 10v42H14z"/><path d="M42 6v10h10"/></svg>'
};

// ─── INIT ────────────────────────────────────
window.addEventListener('DOMContentLoaded',()=>{
  injectSvgs();
  updateSeasonDates();
  initConfetti();
  initCursor();
  initScroll();
  initReveal();
  setInsta();
  renderZirkel();
  applyManifest();
  loadFromGitHub();
  initTweaks();
});

function injectSvgs(){
  document.querySelectorAll('[data-svg]').forEach(el=>{
    const key=el.getAttribute('data-svg');
    if(SVG[key]) el.innerHTML=SVG[key];
  });
}

// ─── Page-wide confetti (blau-schwarz, fallend, nur an den Rändern) ─────────
function initConfetti(){
  const wrap = document.getElementById('confetti');
  if(!wrap) return;
  const isMobile = innerWidth < 700 || matchMedia('(prefers-reduced-motion: reduce)').matches;
  // Roughly 1 piece per 4vh of scroll height so it covers the whole page
  const pageVh = Math.max(100, document.documentElement.scrollHeight / innerHeight * 100);
  const density = isMobile ? 0.18 : 0.36;          // pieces per vh
  const N = Math.min(140, Math.round(pageVh * density));
  const colors = ['#0E1230','#1B2247','#0A1466','#3C4F7C','#2C45A8','#0E1230','#1B2247','#F1ECDD'];
  // Only round + triangle (per request)
  const shapes = ['dot','tri','dot','tri','dot'];

  let html = '';
  for(let i=0;i<N;i++){
    // Left band: 0–14vw   |   Right band: 86–100vw
    const side = Math.random() < 0.5 ? 'L' : 'R';
    const left = side === 'L'
      ? Math.random() * 14            //  0–14vw
      : 86 + Math.random() * 14;      // 86–100vw
    const size = 6 + Math.random()*9;
    const dur  = 11 + Math.random()*10;       // 11–21s
    const delay= -Math.random()*22;
    const rot  = Math.random()*360;
    const drift= (Math.random()-.5)*60;        // gentle drift, stays near edge
    const shape= shapes[(Math.random()*shapes.length)|0];
    const color= colors[(Math.random()*colors.length)|0];
    html += `<span class="cf cf-${shape}" style="--l:${left}vw;--s:${size}px;--d:${dur}s;--dl:${delay}s;--rot:${rot}deg;--dx:${drift}px;--c:${color}"></span>`;
  }
  wrap.innerHTML = html;
}

// ─── AUTOMATIC SEASON DATES ────────────────────────────────────
// Fills every element with [data-date-target="…"] with the right value for the
// current Kampagne ("fünfte Jahreszeit"), recomputed on every page load.
//
// Definitions:
//   • Erwachen der Hugi  → 11. November (fixed)
//   • Aschermittwoch     → 46 Tage vor Ostersonntag
//   • Schmotziger Donn.  → Donnerstag vor Aschermittwoch (= Aschermittwoch − 6 Tage)
//
// A Kampagne starts on 11. Nov of year Y and runs until Aschermittwoch of Y+1.
// If today is past this year's Aschermittwoch, the current/upcoming campaign
// is the one that will start on 11. Nov of THIS year. Otherwise it's the one
// that started last 11. November.
function easterDate(year){
  const a=year%19,b=Math.floor(year/100),c=year%100;
  const d=Math.floor(b/4),e=b%4;
  const f=Math.floor((b+8)/25),g=Math.floor((b-f+1)/3);
  const h=(19*a+b-d-g+15)%30;
  const i=Math.floor(c/4),k=c%4;
  const l=(32+2*e+2*i-h-k)%7;
  const m=Math.floor((a+11*h+22*l)/451);
  const month=Math.floor((h+l-7*m+114)/31);
  const day=((h+l-7*m+114)%31)+1;
  return new Date(year,month-1,day);
}
function ashWednesday(year){const e=easterDate(year);const d=new Date(e);d.setDate(d.getDate()-46);return d}
function schmotzigerDonnerstag(year){const a=ashWednesday(year);const d=new Date(a);d.setDate(d.getDate()-6);return d}

function currentSeason(now=new Date()){
  const y=now.getFullYear();
  const ash=ashWednesday(y);
  // If we are past this year's Aschermittwoch → next campaign starts 11.Nov this year
  const campaignStartYear = now > ash ? y : y - 1;
  return {
    elf:      new Date(campaignStartYear, 10, 11),   // 11. November
    schmotz:  schmotzigerDonnerstag(campaignStartYear + 1),
    ash:      ashWednesday(campaignStartYear + 1),
    startY:   campaignStartYear,
    endY:     campaignStartYear + 1
  };
}

const MON_DE_SHORT = ['Jan','Feb','Mrz','Apr','Mai','Jun','Jul','Aug','Sep','Okt','Nov','Dez'];
function pad2(n){return n<10?'0'+n:''+n}

function formatDate(d, fmt){
  const dd=pad2(d.getDate()), mm=pad2(d.getMonth()+1), yyyy=d.getFullYear();
  switch(fmt){
    case 'full':     return `${dd}.${mm}.${yyyy}`;
    case 'day':      return dd;
    case 'month-yy': return `${MON_DE_SHORT[d.getMonth()]}<br>${yyyy}`;
    case 'yyyy':     return ''+yyyy;
    default:         return `${dd}.${mm}.${yyyy}`;
  }
}

function updateSeasonDates(){
  const s = currentSeason();
  const map = {
    'elf':     s.elf,
    'schmotz': s.schmotz,
    'ash':     s.ash
  };
  document.querySelectorAll('[data-date-target]').forEach(el=>{
    const target = el.getAttribute('data-date-target');           // e.g. "elf"
    const fmt    = el.getAttribute('data-date-fmt') || 'full';    // e.g. "day"
    const d = map[target];
    if(!d) return;
    if(fmt==='month-yy') el.innerHTML = formatDate(d, fmt);
    else                 el.textContent = formatDate(d, fmt);
  });
  // Kampagne label
  document.querySelectorAll('[data-campaign-label]').forEach(el=>{
    el.textContent = `Kampagne ${s.startY} / ${String(s.endY).slice(-2)}`;
  });
}

function setInsta(){
  const setIfExists=(id,url,text)=>{const el=document.getElementById(id);if(el){el.href=url;if(text&&el.textContent.trim()) el.textContent=text}};
  const url=`https://www.instagram.com/${INSTA}`;
  setIfExists('instaLink',url,`@${INSTA}`);
  setIfExists('instaFoot',url);
  setIfExists('instaSide',url);
  setIfExists('instaTop',url);
}

// ─── GitHub loader ────────────────────────────────────
const isImg=n=>/\.(jpg|jpeg|png|gif|webp|svg)$/i.test(n);
const isPdf=n=>/\.pdf$/i.test(n);
const isVid=n=>/\.(mp4|webm|mov|m4v|ogv)$/i.test(n);

async function ghList(path){
  try{
    const r=await fetch(`${API}/${path}`);
    if(!r.ok) return [];
    const d=await r.json();
    return Array.isArray(d)?d:[];
  }catch(e){return []}
}

function findPersonImage(files, firstName){
  const n=firstName.toLowerCase();
  return files.find(f=>{
    const base=f.name.toLowerCase().replace(/\.[^.]+$/,'');
    return base===n || base.startsWith(n+'-') || base.startsWith(n+'_') || base.startsWith(n+' ');
  });
}
function videoMime(name){
  const ext=name.split('.').pop().toLowerCase();
  if(ext==='webm') return 'video/webm';
  if(ext==='ogv')  return 'video/ogg';
  return 'video/mp4';
}

// Build a properly-encoded URL from a repo-relative path.
// When LOCAL_FIRST is true we serve from the page's own /images/ folder
// (optimized images shipped with the site). Otherwise we fall back to
// raw.githubusercontent.com — handy for live previews without uploading.
const LOCAL_FIRST = false;
function rawUrl(path){
  if(LOCAL_FIRST) return path.split('/').map(encodeURIComponent).join('/');
  return `${RAW}/${path.split('/').map(encodeURIComponent).join('/')}`;
}

function setHeroPhoto(src){
  const el=document.getElementById('heroPhoto');
  if(!el) return;
  el.style.backgroundImage=`url("${src}")`;
  document.querySelector('.hero').classList.add('has-photo');
}

function setLogo(src){
  const mark=document.getElementById('navMark');
  if(mark) mark.innerHTML=`<img src="${src}" alt="Keibelhexen">`;
}

function setImg(id, phId, src){
  const img=document.getElementById(id);
  if(!img) return;
  img.src=src;
  img.onload=()=>{img.style.display='block';const ph=phId?document.getElementById(phId):null;if(ph) ph.style.display='none'};
  img.onerror=()=>{img.style.display='none';const ph=phId?document.getElementById(phId):null;if(ph) ph.style.display='flex'};
}

function applyManifest(){
  if(MANIFEST.logo)  setLogo(rawUrl(MANIFEST.logo));
  if(MANIFEST.hero)  setHeroPhoto(rawUrl(MANIFEST.hero));
  if(MANIFEST.haes)  setImg('haesImg',  null,         rawUrl(MANIFEST.haes));
  if(MANIFEST.larve) setImg('larveImg', 'larveImgPh', rawUrl(MANIFEST.larve));
  if(MANIFEST.gesch) setImg('geschImg', 'geschImgPh', rawUrl(MANIFEST.gesch));

  dd.zirkel    =ZIRKEL.map(p=>MANIFEST.zirkel?.[p.name]?rawUrl(MANIFEST.zirkel[p.name]):null);
  dd.medienteam=MEDIENTEAM.map(p=>MANIFEST.zirkel?.[p.name]?rawUrl(MANIFEST.zirkel[p.name]):null);
  dd.gallery=(MANIFEST.gallery||[]).map(p=>rawUrl(p));
  dd.flyers=(MANIFEST.flyers||[]).map(f=>{
    const isP=isPdf(f.file);
    return {
      name:f.name,
      url: isP?`https://docs.google.com/viewer?url=${encodeURIComponent(rawUrl(f.file))}&embedded=true`:rawUrl(f.file),
      downloadUrl:rawUrl(f.file),
      type:isP?'pdf':'img'
    };
  });
  renderAll();
}

async function loadFromGitHub(){
  // Live dynamic loader: queries the GitHub Contents API for each images/
  // folder so newly-uploaded files appear automatically without code edits.
  // Disable by flipping LOCAL_FIRST to true at the top of this file.
  document.getElementById('loader').classList.add('on');
  try{
    const [logoFiles, introFiles, haesFiles, maskeFiles, geschFiles, zirkelFiles, gaFiles, flFiles] =
      await Promise.all([
        ghList('images/logo'), ghList('images/intro'), ghList('images/ueber-uns'),
        ghList('images/maske'), ghList('images/geschichte'), ghList('images/zirkel'),
        ghList('images/galerie'), ghList('images/flyer')
      ]);

    const logoFile=logoFiles.find(f=>isImg(f.name));
    if(logoFile) setLogo(rawUrl(`images/logo/${logoFile.name}`));

    // Hero uses the logo as faint silhouette — already set by manifest, leave alone.

    const videoFile=introFiles.find(f=>isVid(f.name));
    if(videoFile){
      const wrap=document.getElementById('introVideoWrap');
      if(wrap){
        wrap.dataset.state='loaded';
        wrap.innerHTML=`<video controls playsinline preload="metadata"><source src="${rawUrl(`images/intro/${videoFile.name}`)}" type="${videoMime(videoFile.name)}"></video>`;
      }
    }

    // Häs photo (top frame) — from images/ueber-uns/
    const haesFile=haesFiles.find(f=>isImg(f.name));
    if(haesFile) setImg('haesImg', null, rawUrl(`images/ueber-uns/${haesFile.name}`));

    // Larve / Maskenbild (bottom frame) — from images/maske/
    const larveFile=maskeFiles.find(f=>isImg(f.name));
    if(larveFile) setImg('larveImg', 'larveImgPh', rawUrl(`images/maske/${larveFile.name}`));

    const geschFile=geschFiles.find(f=>isImg(f.name));
    if(geschFile) setImg('geschImg', 'geschImgPh', rawUrl(`images/geschichte/${geschFile.name}`));

    const validZ=zirkelFiles.filter(f=>isImg(f.name));
    const zL=ZIRKEL.map(p=>{const f=findPersonImage(validZ,p.name);return f?rawUrl(`images/zirkel/${f.name}`):null});
    const mL=MEDIENTEAM.map(p=>{const f=findPersonImage(validZ,p.name);return f?rawUrl(`images/zirkel/${f.name}`):null});
    if(zL.some(Boolean)) dd.zirkel=zL;
    if(mL.some(Boolean)) dd.medienteam=mL;

    const liveGallery=gaFiles.filter(f=>isImg(f.name) && (!f.size || f.size>100)).map(f=>rawUrl(`images/galerie/${f.name}`));
    if(liveGallery.length) dd.gallery=liveGallery;

    const liveFlyers=flFiles.filter(f=>isImg(f.name)||isPdf(f.name)).map(f=>({
      name:f.name.replace(/\.[^.]+$/,''),
      url: isPdf(f.name)
        ? `https://docs.google.com/viewer?url=${encodeURIComponent(rawUrl(`images/flyer/${f.name}`))}&embedded=true`
        : rawUrl(`images/flyer/${f.name}`),
      downloadUrl:rawUrl(`images/flyer/${f.name}`),
      type:isPdf(f.name)?'pdf':'img'
    }));
    if(liveFlyers.length) dd.flyers=liveFlyers;

    renderAll();
  }catch(e){
    console.warn('GitHub Fehler:',e.message);
  }
  document.getElementById('loader').classList.remove('on');
}

function renderAll(){renderZirkel();renderGallery();renderFlyers()}

// ─── Zirkel ────────────────────────────────────
function renderPersonCard(p, src){
  const initial=p.name.charAt(0).toUpperCase();
  return `<div class="tile">
    <div class="img">
      ${src ? `<img src="${src}" alt="${p.name}" loading="lazy">` :
              `<div class="ph">${SVG.user}<span class="init">${initial}</span></div>`}
    </div>
    <div class="info">
      <div class="name">${p.name}</div>
      <div class="role">${p.role}</div>
    </div>
  </div>`;
}
function renderZirkel(){
  const grid=document.getElementById('zirkelGrid');
  if(grid) grid.innerHTML=ZIRKEL.map((p,i)=>renderPersonCard(p, dd.zirkel?.[i])).join('');
  const mgrid=document.getElementById('medienGrid');
  if(mgrid) mgrid.innerHTML=MEDIENTEAM.map((p,i)=>renderPersonCard(p, dd.medienteam?.[i])).join('');
}

// ─── Galerie ────────────────────────────────────
function renderGallery(){
  const s=document.getElementById('gastrip');
  if(!s) return;
  if(!dd.gallery.length){
    s.innerHTML=`<div class="gi"><div class="giph">${SVG.cam}</div></div>
                 <div class="gi"><div class="giph">${SVG.cam}</div></div>
                 <div class="gi"><div class="giph">${SVG.cam}</div></div>`;
    return;
  }
  s.innerHTML=dd.gallery.map((src,i)=>`
    <div class="gi" onclick="openLbSet(${i},'gallery')">
      <img src="${src}" alt="Galerie ${i+1}" loading="lazy">
    </div>`).join('');
}
function gaScroll(dir){
  const s=document.getElementById('gastrip');
  if(s) s.scrollBy({left:dir*(s.clientWidth*0.75),behavior:'smooth'});
}

// ─── Flyer ────────────────────────────────────
function renderFlyers(){
  const g=document.getElementById('flgrid'),e=document.getElementById('flempty');
  if(!g||!e) return;
  if(!dd.flyers.length){g.innerHTML='';e.style.display='block';return}
  e.style.display='none';
  g.innerHTML=dd.flyers.map((f,i)=>`
    <div class="fc" onclick="openLbSet(${i},'flyer')">
      <div class="fp">
        ${f.type==='pdf'
          ? `<div class="pdfph">${SVG.pdf}<span>PDF</span></div>`
          : `<img src="${f.url}" alt="${f.name}" loading="lazy">`}
        <div class="fov"><span>${f.type==='pdf'?'Öffnen':'Anzeigen'}</span><span style="opacity:.7;font-size:11px">↓ Download</span></div>
      </div>
      <div class="finfo"><h3>${f.name}</h3><span class="ftype">${f.type==='pdf'?'PDF':'Bild'} ↗</span></div>
    </div>`).join('');
}

// ─── Lightbox ────────────────────────────────────
function openLbSet(startIdx, type){
  if(type==='gallery') lbItems=dd.gallery.map(src=>({url:src,type:'img',downloadUrl:src}));
  else if(type==='flyer') lbItems=dd.flyers.map(f=>({url:f.url,type:f.type,name:f.name,downloadUrl:f.downloadUrl}));
  lbIdx=Math.max(0,Math.min(startIdx,lbItems.length-1));
  buildLb();
  document.getElementById('lb').classList.add('on');
  document.body.style.overflow='hidden';
}
function buildLb(){
  const slides=document.getElementById('lbslides'),dots=document.getElementById('lbdots');
  slides.style.transform='translateX(0)';
  slides.innerHTML=lbItems.map((it,i)=>`
    <div class="lbslide">
      ${it.type==='pdf' ? `<iframe src="${it.url}"></iframe>` : `<img src="${it.url}" alt="Bild ${i+1}">`}
      <a class="lbdl" href="${it.downloadUrl}" download="${it.name||'download'}" target="_blank">↓ Herunterladen</a>
    </div>`).join('');
  dots.innerHTML=lbItems.length>1?lbItems.map((_,i)=>`<div class="lbdot${i===lbIdx?' on':''}" onclick="lbGo(${i})"></div>`).join(''):'';
  document.getElementById('lbcnt').textContent=lbItems.length>1?`${lbIdx+1} / ${lbItems.length}`:'';
  requestAnimationFrame(()=>lbGo(lbIdx,false));
  const lb=document.getElementById('lb');
  lb.ontouchstart=e=>{lbTx=e.touches[0].clientX};
  lb.ontouchend  =e=>{const dx=e.changedTouches[0].clientX-lbTx;if(Math.abs(dx)>45)lbMove(dx<0?1:-1)};
}
function lbGo(i,anim=true){
  lbIdx=Math.max(0,Math.min(i,lbItems.length-1));
  const s=document.getElementById('lbslides');
  s.style.transition=anim?'transform .35s var(--ease-out)':'none';
  s.style.transform=`translateX(-${lbIdx*100}vw)`;
  document.querySelectorAll('.lbdot').forEach((d,di)=>d.classList.toggle('on',di===lbIdx));
  document.getElementById('lbcnt').textContent=lbItems.length>1?`${lbIdx+1} / ${lbItems.length}`:'';
}
function lbMove(d){lbGo(lbIdx+d)}
function closeLb(){
  document.getElementById('lb').classList.remove('on');
  document.body.style.overflow='';
  lbItems=[];lbIdx=0;
  document.getElementById('lbslides').innerHTML='';
  document.getElementById('lbdots').innerHTML='';
}
document.addEventListener('keydown',e=>{
  const lb=document.getElementById('lb');
  if(!lb||!lb.classList.contains('on')) return;
  if(e.key==='ArrowLeft') lbMove(-1);
  if(e.key==='ArrowRight') lbMove(1);
  if(e.key==='Escape') closeLb();
});

// ─── Broom cursor (cobalt) ────────────────────────────────────
function initCursor(){
  if(!matchMedia('(hover:hover)').matches || window.innerWidth<=900) return;
  const cur=document.getElementById('broom-cursor');
  if(!cur) return;
  cur.classList.add('on');
  document.body.classList.add('cursor-on');

  const POOL=22, pool=[];
  for(let i=0;i<POOL;i++){const el=document.createElement('span');el.className='whip-trail';document.body.appendChild(el);pool.push(el)}
  let poolIdx=0,lastEmit=0;
  function emitTrail(x,y){
    const now=performance.now();
    if(now-lastEmit<32) return;
    lastEmit=now;
    const el=pool[poolIdx]; poolIdx=(poolIdx+1)%POOL;
    if(el._anim) el._anim.cancel();
    const sx=x+50+(Math.random()-.5)*28;
    const sy=y+50+(Math.random()-.5)*28;
    el.style.left=sx+'px';el.style.top=sy+'px';
    const angle=Math.PI*.25+(Math.random()-.5)*Math.PI*.9;
    const dist=22+Math.random()*26;
    const dx=Math.cos(angle)*dist;
    const dy=Math.sin(angle)*dist-10;
    const rot=(Math.random()-.5)*360;
    const size=.55+Math.random()*.55;
    el._anim=el.animate([
      {opacity:.75,transform:`scale(${size*.35}) rotate(0deg)`},
      {opacity:0, transform:`translate(${dx}px,${dy}px) scale(${size*1.7}) rotate(${rot}deg)`}
    ],{duration:650+Math.random()*350,easing:'cubic-bezier(.22,.61,.36,1)',fill:'forwards'});
  }
  let mx=0,my=0,raf=null;
  document.addEventListener('mousemove',e=>{
    mx=e.clientX;my=e.clientY;
    if(getTweak('cursor')!=='off') emitTrail(mx,my);
    if(raf) return;
    raf=requestAnimationFrame(()=>{cur.style.transform=`translate(${mx-4}px,${my-4}px)`;raf=null});
  },{passive:true});
  document.addEventListener('mouseleave',()=>cur.style.opacity='0');
  document.addEventListener('mouseenter',()=>cur.style.opacity='1');
}

// ─── Scroll / Reveal ────────────────────────────────────
function initScroll(){
  window.addEventListener('scroll',()=>{
    const prog=document.getElementById('prog');
    if(prog) prog.style.width=(scrollY/(document.body.scrollHeight-innerHeight)*100)+'%';
  },{passive:true});
}
function initReveal(){
  const io=new IntersectionObserver(es=>es.forEach(e=>{
    if(e.isIntersecting){
      e.target.classList.add('on');
      if(e.target.id==='sageFinal') e.target.classList.add('on');
      io.unobserve(e.target);
    }
  }),{threshold:.08});
  document.querySelectorAll('.rv').forEach(el=>io.observe(el));
  // Failsafe: ensure everything is visible even if observer misses
  setTimeout(()=>document.querySelectorAll('.rv').forEach(el=>el.classList.add('on')),1500);
}

// ─── Kontakt ────────────────────────────────────
function sendMail(){
  const n=document.getElementById('fN').value.trim(),
        e=document.getElementById('fE').value.trim(),
        s=document.getElementById('fS').value.trim(),
        m=document.getElementById('fM').value.trim();
  if(!n||!e||!m){toast('Bitte Name, E-Mail & Nachricht ausfüllen');return}
  window.open(`mailto:keibelhexen@gmx.de?subject=${encodeURIComponent((s||'Kontakt')+' – '+n)}&body=${encodeURIComponent('Name: '+n+'\nE-Mail: '+e+'\n\n'+m)}`);
}
function toast(msg){
  const t=document.createElement('div');t.className='toast';t.textContent=msg;
  document.body.appendChild(t);setTimeout(()=>t.remove(),2800);
}

// ─── Menü ────────────────────────────────────
function tmenu(){
  document.getElementById('nav').classList.toggle('open');
  document.getElementById('hbg').classList.toggle('open');
}
document.addEventListener('click',e=>{
  if(e.target.closest('.main a')){
    document.getElementById('nav').classList.remove('open');
    document.getElementById('hbg').classList.remove('open');
  }
});

// ─── Tweaks (design-system safe) ────────────────────────────────────
const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "accent":"blue",
  "surface":"paper",
  "cursor":"on"
}/*EDITMODE-END*/;

let tweakState={...TWEAK_DEFAULTS};
function getTweak(k){return tweakState[k]}

function applyTweaks(){
  const root=document.documentElement;
  // Accent: blue (default cobalt+vibrant), cobalt-deep, slate
  if(tweakState.accent==='cobalt'){
    root.style.setProperty('--accent','var(--brand-cobalt)');
    root.style.setProperty('--accent-deep','var(--brand-night)');
  }else if(tweakState.accent==='slate'){
    root.style.setProperty('--accent','var(--haes-mid)');
    root.style.setProperty('--accent-deep','var(--haes-navy)');
  }else{
    root.style.removeProperty('--accent');
    root.style.removeProperty('--accent-deep');
  }
  // Surface mode (default vs warmer paper — we stick to paper since palette is cool)
  if(tweakState.surface==='sunken'){
    root.style.setProperty('--bg','var(--paper-2)');
  }else{
    root.style.removeProperty('--bg');
  }
  if(tweakState.cursor==='off'){
    document.getElementById('broom-cursor').style.display='none';
    document.body.classList.remove('cursor-on');
  }else if(matchMedia('(hover:hover)').matches && innerWidth>900){
    document.getElementById('broom-cursor').style.display='block';
    document.body.classList.add('cursor-on');
  }
}

function setTweak(k,v){
  tweakState[k]=v;
  applyTweaks();
  renderTweaks();
  try{window.parent.postMessage({type:'__edit_mode_set_keys',edits:{[k]:v}},'*')}catch(e){}
}

function renderTweaks(){
  const panel=document.getElementById('tweaks');
  if(!panel) return;
  panel.innerHTML=`
    <h4>Tweaks <button onclick="closeTweaks()" aria-label="Schließen">✕</button></h4>
    <div class="tw-row">
      <div class="tw-label">Akzent (Blau-Palette)</div>
      <div class="tw-opts">
        ${[['blue','#2C45A8','Vibrant'],['cobalt','#0A1466','Cobalt'],['slate','#3C4F7C','Slate']].map(([k,c,n])=>
          `<button class="tw-swatch ${tweakState.accent===k?'on':''}" style="background:${c}" onclick="setTweak('accent','${k}')" aria-label="${n}" title="${n}"></button>`).join('')}
      </div>
    </div>
    <div class="tw-row">
      <div class="tw-label">Hintergrund</div>
      <div class="tw-opts">
        ${[['paper','Paper'],['sunken','Gedämpft']].map(([k,n])=>
          `<button class="tw-opt ${tweakState.surface===k?'on':''}" onclick="setTweak('surface','${k}')">${n}</button>`).join('')}
      </div>
    </div>
    <div class="tw-row">
      <div class="tw-label">Hexenbesen-Cursor</div>
      <div class="tw-opts">
        ${[['on','An'],['off','Aus']].map(([k,n])=>
          `<button class="tw-opt ${tweakState.cursor===k?'on':''}" onclick="setTweak('cursor','${k}')">${n}</button>`).join('')}
      </div>
    </div>`;
}
function closeTweaks(){
  document.getElementById('tweaks').classList.remove('on');
  try{window.parent.postMessage({type:'__edit_mode_dismissed'},'*')}catch(e){}
}
function openTweaks(){
  document.getElementById('tweaks').classList.add('on');
  renderTweaks();
}

function initTweaks(){
  applyTweaks();
  window.addEventListener('message',e=>{
    const d=e.data||{};
    if(d.type==='__activate_edit_mode') openTweaks();
    else if(d.type==='__deactivate_edit_mode') closeTweaks();
  });
  try{window.parent.postMessage({type:'__edit_mode_available'},'*')}catch(e){}
}

// Expose for inline handlers
Object.assign(window,{tmenu,sendMail,openLbSet,closeLb,lbMove,lbGo,gaScroll,setTweak,closeTweaks,openTweaks});
