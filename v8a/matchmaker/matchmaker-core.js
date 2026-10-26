/* SoulKnot matchmaker pages: shared logic.
   Page must define window.MATCHMAKER = { id:'M001', name:'Meera Sharma', dataUrl:'../data/profiles.json' }
   and contain: #top (hero + card, hidden outside the listing view), #view (mount point),
   #mmCount, #badge, #badgeM, and nav links with data-nav="list" | "short". */
(function () {
'use strict';
const M = window.MATCHMAKER, $ = id => document.getElementById(id), KEY = 'shortlisted';
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const inch = s => { const m = String(s).match(/(\d+)'(\d+)/); return m ? +m[1] * 12 + +m[2] : 0; };
const disp = n => `${Math.floor(n / 12)}'${n % 12}"`;
const FILTERS = [['city','City'],['edu','Education'],['income','Annual Income'],['diet','Diet'],['status','Marital Status'],['manglik','Manglik'],['religion','Religion'],['caste','Caste']];
const HP = 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z';

let mine = [], liked = readLiked(), gender = 'Female', layout = store('layoutPref') || 'grid';
let view = 'list', q = '', aMin = 0, aMax = 99, hMin = 0, hMax = 999, aLo = 0, aHi = 99, hts = [], gi = 0;
const sel = {};

function readLiked() { try { return (JSON.parse(localStorage.getItem(KEY)) || []).map(String); } catch (e) { return []; } }
function store(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
function saveLiked() { try { localStorage.setItem(KEY, JSON.stringify(liked)); } catch (e) {} }
const pic = p => p.image || (p.images && p.images[0]) || '';
const mineLiked = () => mine.filter(p => liked.includes(String(p.id)));

function heart(on, cls) {
  return `<svg class="${cls || 'w-4 h-4'} ${on ? 'fill-rose-500 text-rose-500' : 'text-gray-400'}" fill="${on ? 'currentColor' : 'none'}" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="${HP}"/></svg>`;
}

/* ---------- chrome: nav state, badge, top section ---------- */
function chrome() {
  $('top').hidden = view !== 'list';
  document.querySelectorAll('[data-nav]').forEach(a => {
    const on = a.dataset.nav === (view === 'short' ? 'short' : 'list');
    a.classList.toggle('text-black', on); a.classList.toggle('text-gray-400', !on);
  });
  const n = mineLiked().length;
  ['badge', 'badgeM'].forEach(id => { const b = $(id); if (b) { b.textContent = n; b.style.display = n ? '' : 'none'; } });
}

/* ---------- cards ---------- */
function gridCard(p) {
  const id = esc(p.id), on = liked.includes(String(p.id)), bio = (p.bio || '').length > 62 ? p.bio.slice(0, 62).trimEnd() + '…' : (p.bio || '');
  return `<div class="pcard" onclick="SK.open('${id}')">
    <div style="position:relative;aspect-ratio:3/4;overflow:hidden">
      <img src="${esc(pic(p))}" alt="${esc(p.name)}" loading="lazy" style="width:100%;height:100%;object-fit:cover;object-position:top;display:block">
      <div style="position:absolute;top:12px;left:12px;right:12px;display:flex;justify-content:space-between;align-items:center">
        <span style="background:rgba(255,255,255,.92);font-size:10px;font-weight:600;letter-spacing:.06em;padding:4px 12px;border-radius:99px;color:#444;border:.5px solid rgba(0,0,0,.08);text-transform:uppercase">Verified</span>
        <button onclick="SK.like('${id}',event)" aria-label="Shortlist ${esc(p.name)}" style="width:34px;height:34px;border-radius:50%;background:rgba(255,255,255,.92);border:.5px solid rgba(0,0,0,.08);display:flex;align-items:center;justify-content:center;cursor:pointer">${heart(on)}</button>
      </div></div>
    <div style="padding:14px 16px 16px">
      <div style="display:flex;justify-content:space-between;align-items:baseline"><h3 style="margin:0;font-size:17px;font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(p.name)}, ${esc(p.age)}</h3><span style="font-size:13px;font-weight:600;color:#6b7280;margin-left:8px">${esc(p.height)}</span></div>
      <p style="margin:3px 0 6px;font-size:13px;font-weight:600;color:#b05070">${esc(p.job)}</p>
      <p style="margin:0 0 12px;font-size:12px;color:#9ca3af;line-height:1.5">${esc(bio)}</p>
      <p style="margin:0;padding-top:10px;border-top:.5px solid #f3f4f6;font-size:11px;font-weight:600;color:#9ca3af;text-transform:uppercase;letter-spacing:.05em">${esc(p.edu)} &middot; ${esc(p.city)}</p>
    </div></div>`;
}
function listCard(p) {
  const id = esc(p.id), on = liked.includes(String(p.id));
  const meta = [p.city, p.height, p.income, p.status].filter(Boolean).map(v => `<span class="text-[11px] font-bold text-gray-400 uppercase tracking-widest">${esc(v)}</span>`).join('');
  return `<div class="pcard flex items-stretch" style="border-radius:1.5rem" onclick="SK.open('${id}')">
    <div class="w-20 sm:w-28 shrink-0 overflow-hidden"><img src="${esc(pic(p))}" alt="${esc(p.name)}" loading="lazy" class="w-full h-full object-cover object-top"></div>
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 flex-1 px-4 py-4 sm:px-6 sm:py-5 min-w-0">
      <div class="min-w-0"><h3 class="text-base sm:text-lg font-bold tracking-tight truncate">${esc(p.name)}, ${esc(p.age)}</h3>
        <p class="text-rose-500 font-bold text-sm mt-0.5 mb-3">${esc(p.job)}</p><div class="flex flex-wrap gap-x-5 gap-y-1">${meta}</div></div>
      <button onclick="SK.like('${id}',event)" aria-label="Shortlist ${esc(p.name)}" class="w-10 h-10 shrink-0 bg-gray-50 rounded-xl flex items-center justify-center border border-gray-100">${heart(on, 'w-5 h-5')}</button>
    </div></div>`;
}
function fillGrid(el, data) {
  if (!data.length) { el.style.cssText = ''; el.innerHTML = '<div class="py-20 text-center text-gray-300 italic">No matches found for the selected criteria.</div>'; return; }
  el.style.cssText = layout === 'grid' ? 'display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:1.5rem' : 'display:flex;flex-direction:column;gap:1rem';
  el.innerHTML = data.map(layout === 'grid' ? gridCard : listCard).join('');
}

/* ---------- listing view ---------- */
const opts = f => [...new Set(mine.map(p => p[f]).filter(Boolean))].sort();
function dd([f, label]) {
  const o = opts(f); if (o.length < 2) return '';
  const s = sel[f] || [];
  return `<details class="dd" ${s.length ? 'open' : ''}><summary>${label}${s.length ? ` <i>${s.length}</i>` : ''}</summary>${o.map(v => `<label><input type="checkbox" value="${esc(v)}" ${s.includes(v) ? 'checked' : ''} onchange="SK.tog('${f}',this.value,this.checked)"><span>${esc(v)}</span></label>`).join('')}</details>`;
}
const numSel = (id, vals, cur, fmt) => `<select id="${id}" onchange="SK.range()" class="sel flex-1 rounded-xl px-3 py-2 text-xs font-bold">${vals.map(v => `<option value="${v}" ${v === cur ? 'selected' : ''}>${fmt ? fmt(v) : v}</option>`).join('')}</select>`;

function showList(push) {
  view = 'list'; if (push) history.pushState({ v: 'list' }, '');
  const ageVals = []; for (let a = aLo; a <= aHi; a++) ageVals.push(a);
  const tgl = (g, t) => `<button onclick="SK.gender('${g}')" class="flex-1 py-2 text-xs font-bold rounded-xl ${gender === g ? 'bg-white shadow-sm text-black' : 'text-gray-400'}">${t}</button>`;
  const lay = (m, path) => `<button onclick="SK.layout('${m}')" title="${m} view" class="w-9 h-9 flex items-center justify-center rounded-xl ${layout === m ? 'bg-white shadow-sm text-black' : 'text-gray-400'}"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="${path}"/></svg></button>`;
  $('view').innerHTML = `<div class="flex flex-col lg:flex-row gap-10 lg:gap-16">
    <aside id="filters" class="hidden lg:block w-full lg:w-72 shrink-0 no-print"><div class="space-y-8 lg:sticky lg:top-32">
      <div class="flex justify-between items-end border-b border-gray-100 pb-4"><h3 class="font-bold text-xl">Filters</h3><button onclick="SK.reset()" class="text-[10px] font-bold text-gray-400 uppercase tracking-widest hover:text-rose-500">Reset</button></div>
      <div><h4 class="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3">Search</h4><input id="q" value="${esc(q)}" oninput="SK.search(this.value)" type="text" placeholder="Name or profession..." class="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:border-black"></div>
      <div><h4 class="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-4">Looking For</h4><div class="flex p-1 bg-gray-100 rounded-2xl">${tgl('Female', 'Brides')}${tgl('Male', 'Grooms')}</div></div>
      <div><h4 class="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-4">Age Range</h4><div class="flex items-center gap-2">${numSel('aMin', ageVals, aMin)}<span class="text-gray-300 text-xs">to</span>${numSel('aMax', ageVals, aMax)}</div></div>
      ${hts.length > 1 ? `<div><h4 class="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-4">Height Range</h4><div class="flex items-center gap-2">${numSel('hMin', hts, hMin, disp)}<span class="text-gray-300 text-xs">to</span>${numSel('hMax', hts, hMax, disp)}</div></div>` : ''}
      <div class="space-y-1 pt-4 border-t border-gray-50">${FILTERS.map(dd).join('')}</div>
      <button onclick="SK.sheet()" class="lg:hidden w-full bg-black text-white rounded-2xl py-3.5 text-xs font-bold uppercase tracking-widest">Show results</button>
    </div></aside>
    <div class="flex-1 pb-24 lg:pb-0">
      <div class="flex justify-between items-center mb-8"><p id="results" class="text-sm font-bold text-gray-400 uppercase tracking-widest"></p>
        <div class="flex p-1 bg-gray-100 rounded-2xl gap-1">${lay('grid', 'M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z')}${lay('list', 'M4 6h16M4 12h16M4 18h16')}</div></div>
      <div id="grid"></div></div></div>
    <div class="lg:hidden fixed bottom-0 inset-x-0 z-30 bg-white/95 backdrop-blur border-t border-gray-100 px-5 py-3 no-print"><button onclick="SK.sheet()" class="w-full bg-black text-white rounded-2xl py-3.5 text-xs font-bold uppercase tracking-widest">Filters</button></div>`;
  chrome(); applyFilters();
}
function applyFilters() {
  const s = q.trim().toLowerCase();
  const data = mine.filter(p => p.gender === gender && p.age >= aMin && p.age <= aMax && (!hts.length || (inch(p.height) >= hMin && inch(p.height) <= hMax)) &&
    FILTERS.every(([f]) => !(sel[f] || []).length || sel[f].includes(p[f])) && (!s || `${p.name} ${p.job}`.toLowerCase().includes(s)));
  if ($('grid')) fillGrid($('grid'), data);
  if ($('results')) $('results').textContent = `${data.length} Match${data.length !== 1 ? 'es' : ''} Found`;
}

/* ---------- shortlist view ---------- */
function showShort(push) {
  view = 'short'; if (push) history.pushState({ v: 'short' }, '');
  const d = mineLiked();
  $('view').innerHTML = `<div class="mb-10 flex flex-col sm:flex-row sm:items-end justify-between gap-4"><div>
    <h2 class="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-3">Your <span class="text-gray-300">Shortlist.</span></h2>
    <p class="text-gray-500 text-base sm:text-lg">Profiles from ${esc(M.name)} you've saved to review later.</p></div>
    ${d.length ? '<button onclick="SK.clear()" class="text-xs font-bold uppercase tracking-widest text-gray-400 hover:text-rose-500 mb-1">Clear all</button>' : ''}</div>
    ${d.length ? '<div id="grid"></div>' : `<div class="text-center py-32 border-2 border-dashed border-gray-100 rounded-[3rem]"><p class="text-gray-400 font-medium mb-6">You haven't shortlisted any profiles yet.</p><button onclick="SK.nav('list')" class="bg-black text-white px-8 py-3 rounded-2xl text-xs font-bold">Browse profiles</button></div>`}`;
  chrome(); if (d.length) fillGrid($('grid'), d);
}

/* ---------- detail view ---------- */
const row = (l, v) => v && v !== '—' ? `<div class="flex justify-between items-baseline gap-3 py-2 border-b border-gray-50"><span class="text-[11px] font-semibold text-gray-400 uppercase tracking-wide shrink-0">${l}</span><b class="text-[13px] font-medium text-right">${esc(v)}</b></div>` : '';
const box = (t, i, b) => `<div class="bg-white rounded-2xl border border-gray-200 p-5 mb-4"><h2 class="flex items-center gap-2.5 text-sm font-bold uppercase tracking-wider pb-2.5 mb-4 border-b border-gray-100"><span>${i}</span>${t}</h2>${b}</div>`;
const SECTIONS = [
  ['Education & Career', '💼', [['Institution','eduInstitution'],['Degree','eduDegree'],['Graduation Year','eduYear'],['Company','jobCompany'],['Role','jobRole'],['Experience','jobYears'],['Annual Income','income']]],
  ['Religion & Caste', '🕌', [['Religion','religion'],['Caste','caste'],['Sub-caste','subcaste'],['Gotra','gotra']]],
  ['Family Details', '🏠', [['Family Type','familyType'],['Family Values','familyValues'],['Grandfather','grandfatherName'],['Grandmother','grandmotherName'],['Father','fatherName'],["Father's Occupation",'fatherOccupation'],['Mother','motherName'],["Mother's Occupation",'motherOccupation'],['Siblings','siblings'],["Siblings' Occupation",'siblingsOccupation']]],
  ['Astro Details', '⭐', [['Date of Birth','dob'],['Time of Birth','tob'],['Place of Birth','pob'],['Rashi','rashi'],['Nakshatra','nakshatra'],['Manglik','manglikDetail']]]
];
function showDetail(id, push) {
  const p = mine.find(x => String(x.id) === String(id)); if (!p) return showList(push);
  view = 'detail'; gi = 0; if (push) history.pushState({ v: 'detail', id: String(id) }, '');
  const on = liked.includes(String(p.id)), imgs = p.images && p.images.length ? p.images : [pic(p)];
  const pref = [['Age Range', p.prefAgeMin && p.prefAgeMax ? `${p.prefAgeMin} – ${p.prefAgeMax} years` : ''], ['Height Range', p.prefHeightMin && p.prefHeightMax ? `${p.prefHeightMin} – ${p.prefHeightMax}` : ''], ['Location', p.prefLocation], ['Education', p.prefEdu], ['Income', p.prefIncome], ['Caste', p.prefCaste], ['Diet', p.prefDiet]];
  const arrow = (d, path) => `<button onclick="SK.img(${d})" aria-label="${d < 0 ? 'Previous' : 'Next'} photo" class="absolute top-1/2 -translate-y-1/2 ${d < 0 ? 'left-2' : 'right-2'} w-8 h-8 rounded-full bg-white/85 flex items-center justify-center no-print"><svg class="w-4 h-4" fill="none" stroke="#111" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="${path}"/></svg></button>`;
  $('view').innerHTML = `<div class="profile-detail-view">
    <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8 no-print">
      <button onclick="history.back()" class="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gray-400 hover:text-black"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>Back</button>
      <div class="flex gap-3"><button onclick="SK.share('${esc(p.id)}')" class="px-4 py-2.5 bg-green-50 text-green-600 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-green-100">Share</button>
      <button onclick="window.print()" class="px-4 py-2.5 bg-zinc-100 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-zinc-200">PDF</button></div></div>
    <div class="grid gap-7 lg:grid-cols-[340px_1fr] items-start">
      <div class="lg:sticky lg:top-24">
        <div class="relative overflow-hidden mb-4" style="border-radius:24px;aspect-ratio:3/4;box-shadow:0 20px 50px rgba(0,0,0,.1)">
          <img id="gimg" src="${esc(imgs[0])}" alt="${esc(p.name)}" class="w-full h-full object-cover">
          ${imgs.length > 1 ? arrow(-1, 'M15 19l-7-7 7-7') + arrow(1, 'M9 5l7 7-7 7') : ''}
          <span class="absolute top-3.5 left-3.5 bg-white/90 text-[10px] font-semibold tracking-wider px-3 py-1 rounded-full text-gray-600 uppercase">Verified</span>
          <button onclick="SK.like('${esc(p.id)}',event)" aria-label="Shortlist" class="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/90 flex items-center justify-center no-print">${heart(on)}</button></div>
        <div class="bg-white rounded-2xl border border-gray-200 p-5">
          <h1 class="text-[22px] font-bold">${esc(p.name)}</h1><p class="text-[13px] text-gray-400 mb-4">${esc(p.age)} yrs • ${esc(p.height)} • ${esc(p.city)}, ${esc(p.state)}</p>
          ${row('Occupation', p.job)}${row('Education', p.edu)}${row('Income', p.income && p.income + ' per annum')}${row('Diet', p.diet)}${row('Marital Status', p.status)}${row('Children', p.children)}${row('Manglik', p.manglik)}
          <button class="no-print w-full mt-4 bg-[#111] text-white rounded-xl py-3 text-xs font-semibold">Connect with ${esc((p.name || '').split(' ')[0])}</button></div></div>
      <div>${box('About', '👤', `<p class="text-sm text-gray-500 leading-7 mb-3">${esc(p.bio)}</p>${row('Hobbies & Interests', p.hobbies)}`)}
        ${SECTIONS.map(([t, i, f]) => box(t, i, f.map(([l, k]) => row(l, p[k])).join(''))).join('')}
        ${box('Partner Preferences', '💫', pref.map(([l, v]) => row(l, v)).join(''))}</div></div>
    <p class="hidden print-only mt-10 pt-10 border-t text-center text-xs text-gray-400">Generated by SoulKnot Premium Matrimony</p></div>`;
  chrome(); window.scrollTo(0, 0);
  window._imgs = imgs;
}

/* ---------- public API (called from inline handlers) ---------- */
function rerender() { view === 'detail' ? showDetail(history.state && history.state.id, false) : view === 'short' ? showShort(false) : applyFilters(); chrome(); }
window.SK = {
  open: id => showDetail(id, true),
  nav(v) { const m = $('mobileMenu'); if (m) m.classList.add('hidden'); window.scrollTo(0, 0); v === 'short' ? showShort(true) : showList(true); return false; },
  like(id, e) { if (e) e.stopPropagation(); id = String(id); const i = liked.indexOf(id); i > -1 ? liked.splice(i, 1) : liked.push(id); saveLiked(); rerender(); },
  clear() { if (!confirm('Remove all shortlisted profiles from this page? This cannot be undone.')) return; const ids = mine.map(p => String(p.id)); liked = liked.filter(i => !ids.includes(i)); saveLiked(); showShort(false); },
  gender(g) { gender = g; showList(false); },
  layout(m) { layout = m; try { localStorage.setItem('layoutPref', m); } catch (e) {} showList(false); },
  search(v) { q = v; applyFilters(); },
  range() { aMin = +$('aMin').value; aMax = +$('aMax').value; if ($('hMin')) { hMin = +$('hMin').value; hMax = +$('hMax').value; } applyFilters(); },
  tog(f, v, on) { const a = sel[f] = sel[f] || []; const i = a.indexOf(v); if (on && i < 0) a.push(v); if (!on && i > -1) a.splice(i, 1); applyFilters(); },
  reset() { Object.keys(sel).forEach(k => sel[k] = []); q = ''; aMin = aLo; aMax = aHi; hMin = hts[0] || 0; hMax = hts[hts.length - 1] || 999; showList(false); },
  sheet() { $('filters').classList.toggle('hidden'); window.scrollTo(0, 0); },
  img(d) { const n = window._imgs.length; gi = (gi + d + n) % n; $('gimg').src = window._imgs[gi]; },
  share(id) {
    const p = mine.find(x => String(x.id) === String(id)); if (!p) return;
    const t = ['✨ *SoulKnot — New Match* ✨', '──────────────────', `*Name:* ${p.name}`, `*Age:* ${p.age} years`, `*Height:* ${p.height}`, `*Location:* ${p.city}, ${p.state}`, `*Profession:* ${p.job}`, `*Education:* ${p.edu}`, `*Annual Income:* ${p.income}`, `*Marital Status:* ${p.status}`, '──────────────────', `🔗 *Listed by ${M.name}:* ${location.href.split('#')[0]}`].join('\n');
    window.open('https://wa.me/?text=' + encodeURIComponent(t), '_blank');
  }
};

window.addEventListener('popstate', e => {
  const s = e.state || { v: 'list' };
  s.v === 'detail' ? showDetail(s.id, false) : s.v === 'short' ? showShort(false) : showList(false);
});

/* ---------- boot ---------- */
(async function () {
  try {
    const res = await fetch(M.dataUrl || '../data/profiles.json');
    if (!res.ok) throw new Error(res.status);
    const all = await res.json();
    mine = all.filter(p => String(p.matchmakerId || '').trim().toUpperCase() === M.id.toUpperCase()).map(p => ({ ...p, age: Number(p.age) }));
  } catch (err) {
    console.error('Could not load profiles', err);
    $('view').innerHTML = '<p class="text-center text-gray-400 text-sm py-20">Profiles could not be loaded right now. Please try again shortly.</p>';
    return;
  }
  if ($('mmCount')) $('mmCount').textContent = `${mine.length} listed`;
  if (!mine.length) { $('view').innerHTML = '<p class="text-center text-gray-400 text-sm py-20">No profiles are listed here yet. Please check back soon.</p>'; chrome(); return; }
  const ages = mine.map(p => p.age).filter(Boolean);
  aLo = aMin = Math.min(...ages); aHi = aMax = Math.max(...ages);
  hts = [...new Set(mine.map(p => inch(p.height)).filter(Boolean))].sort((a, b) => a - b);
  hMin = hts[0] || 0; hMax = hts[hts.length - 1] || 999;
  if (!mine.some(p => p.gender === 'Female') && mine.some(p => p.gender === 'Male')) gender = 'Male';
  history.replaceState({ v: 'list' }, '');
  showList(false);
})();
})();
