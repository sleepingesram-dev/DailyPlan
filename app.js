'use strict';
/* ============================================================
   ESRAM_OS v1 — app engine
   Auto day-mode by weekday, auto daily reset, XP/levels/streaks,
   deadline countdowns, pay-yourself money math, 24h buy-later lock.
   All data lives in localStorage on this device.
   ============================================================ */

/* ---------- utils ---------- */
const $ = s => document.querySelector(s);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const pad = n => String(n).padStart(2, '0');
const keyOf = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const todayKey = () => keyOf(new Date());
const parseKey = k => { const [y, m, d] = k.split('-').map(Number); return new Date(y, m - 1, d); };
const addDays = (k, n) => { const d = parseKey(k); d.setDate(d.getDate() + n); return keyOf(d); };
const daysUntil = k => Math.round((parseKey(k) - parseKey(todayKey())) / 86400000);
const mondayOf = k => { const d = parseKey(k); const dow = (d.getDay() + 6) % 7; d.setDate(d.getDate() - dow); return keyOf(d); };
const fmt$ = n => '$' + (Number(n) || 0).toLocaleString(undefined, { maximumFractionDigits: 2 });
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
const WD = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MO = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const fmtDate = k => { const d = parseKey(k); return `${WD[d.getDay()]}, ${MO[d.getMonth()]} ${d.getDate()}`; };

/* XP registry: checkId -> xp (first definition wins; ref tasks reuse) */
const REG = {};
for (const [sid, sec] of Object.entries(D.sections))
  for (const t of sec.tasks) if (!t.ref) REG[`${sid}.${t.k}`] = t.xp || 0;
const cid = (sid, t) => t.ref || `${sid}.${t.k}`;

/* ---------- state ---------- */
const LS = 'esram_os_v1';
function seedState() {
  return {
    v: 1, created: todayKey(), xp: 0,
    days: {}, weeks: {}, sprint: {}, phases: {}, vocab: {}, friendSync: {},
    scoreboard: { japanFund: 650, japanGoal: 14000, emergencyFund: 0, emergencyGoal: 500, carLoan: 12000, monthlyExpenses: 500, monthlyIncome: 1500, lastUpdated: null },
    deadlines: D.deadlineSeed.map(d => ({ id: uid(), done: false, doneDate: null, ...d })),
    projects: D.projectSeed.map(p => ({ id: uid(), blocker: '', ...p })),
    ledger: [], buyLater: [], brainDump: [], blockers: [], trophies: [], conLog: [],
  };
}
let S = (() => {
  try { const s = JSON.parse(localStorage.getItem(LS)); if (s && s.v === 1) return s; } catch (e) { /* corrupted -> reseed */ }
  return seedState();
})();
function save() { localStorage.setItem(LS, JSON.stringify(S)); }

/* ---------- day engine ---------- */
function autoMode(k) { const dow = parseKey(k).getDay(); return dow === 0 ? 'sunday' : (dow <= 4 ? 'school' : 'build'); }
function day(k = todayKey()) {
  let d = S.days[k];
  if (!d) {
    d = S.days[k] = { mode: autoMode(k), bad: false, checks: {}, win: {}, blocked: '', tomorrow: '', review: {}, boss: false };
    if (k === todayKey()) { // opening the app IS the task
      d.checks['mvh.openos'] = true;
      S.xp += REG['mvh.openos'];
    }
    save();
  }
  return d;
}
const modeIdOf = d => d.bad ? 'bad' : d.mode;

function addXP(n, msg) {
  S.xp = Math.max(0, S.xp + n);
  if (msg && n > 0) toast(`${msg} +${n} XP`);
  save();
}

function toggleCheck(k, id) {
  const d = day(k);
  const on = !d.checks[id];
  d.checks[id] = on;
  S.xp = Math.max(0, S.xp + (on ? 1 : -1) * (REG[id] || 0));
  bossCheck(k);
  save();
}
function bossCheck(k) {
  if (parseKey(k).getDay() !== 5) return; // Friday only
  const d = S.days[k];
  const need = ['anki', 'newcards', 'bunpo', 'listen20', 'conwords', 'speak60'].map(t => 'jp_deep.' + t);
  const all = need.every(id => d.checks[id]);
  if (all && !d.boss) { d.boss = true; S.xp += D.eventXP.bossFight; toast(`⚔️ Friday Boss Fight cleared! +${D.eventXP.bossFight} XP`); }
  else if (!all && d.boss) { d.boss = false; S.xp = Math.max(0, S.xp - D.eventXP.bossFight); }
}

/* ---------- win conditions ---------- */
function evalRule(k, r) {
  const d = S.days[k] || { checks: {}, review: {} };
  const c = d.checks;
  switch (r.t) {
    case 'allCore': return D.sections[r.s].tasks.filter(t => t.core).every(t => c[cid(r.s, t)]);
    case 'any': return D.sections[r.s].tasks.some(t => c[cid(r.s, t)]);
    case 'task': return !!c[`${r.s}.${r.k}`];
    case 'manual': return false;
    case 'review': return !!d.review._done;
    case 'jpreview': {
      const jf = D.reviewForm.find(x => x.id === 'jp');
      return jf.fields.filter(f => d.review[f.k] !== undefined && d.review[f.k] !== '').length >= 4;
    }
    case 'moneyupd': return S.scoreboard.lastUpdated === k;
    case 'nextweek': {
      const wk = S.weeks[addDays(mondayOf(k), 7)] || {};
      return ['money', 'japanese', 'construction', 'project'].every(x => (wk[x] || '').trim());
    }
  }
  return false;
}
function effWin(k, w) {
  const d = S.days[k];
  if (d && d.win && d.win[w.id] !== undefined) return d.win[w.id];
  return evalRule(k, w.rule);
}
function dayWon(k) {
  const d = S.days[k];
  if (!d) return false;
  if (d.bad) return D.sections.badday.tasks.filter(t => t.core).every(t => d.checks[cid('badday', t)]);
  const wins = D.modes[d.mode].win;
  return wins.filter(w => effWin(k, w)).length >= 4;
}
function streak() {
  let n = 0, k = todayKey();
  if (!dayWon(k)) k = addDays(k, -1);
  while (S.days[k] && dayWon(k)) { n++; k = addDays(k, -1); }
  return n;
}
function levelInfo() {
  const L = D.levels;
  let i = 0;
  for (let j = 0; j < L.length; j++) if (S.xp >= L[j][0]) i = j;
  const next = L[i + 1];
  return {
    n: i + 1, name: L[i][1],
    pct: next ? Math.min(100, 100 * (S.xp - L[i][0]) / (next[0] - L[i][0])) : 100,
    next: next ? next[0] : null,
  };
}

/* ---------- next task ---------- */
function nextTask(k) {
  const d = day(k), m = D.modes[modeIdOf(d)];
  const find = pred => {
    for (const sid of m.sections) {
      const sec = D.sections[sid];
      if (sec.pick && sec.tasks.some(t => d.checks[cid(sid, t)])) continue; // "pick one" satisfied
      const t = sec.tasks.find(t => !d.checks[cid(sid, t)] && pred(t));
      if (t) return { sec, t, id: cid(sid, t) };
    }
    return null;
  };
  return find(t => t.core) || find(() => true);
}

/* ---------- rendering ---------- */
let activeTab = 'today';
let blockerFor = null; // project id with open blocker form

function toast(msg) {
  const el = $('#toast');
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(toast._t);
  toast._t = setTimeout(() => el.classList.remove('show'), 2600);
}

function renderHeader() {
  const li = levelInfo();
  $('#lvlBadge').innerHTML = `LV ${li.n} · ${esc(li.name)} <small>${S.xp}${li.next ? ' / ' + li.next : ''} XP</small>`;
  $('#xpFill').style.width = li.pct + '%';
  const st = streak();
  $('#streakBadge').textContent = st > 0 ? `🔥 ${st}-day streak` : '🔥 0';
  const dj = daysUntil(D.japanWindowStart);
  $('#japanCountdown').textContent = dj > 0 ? `🗾 ${dj} days to Japan window` : '🗾 Japan window is NOW';
}

function taskRow(k, sid, t) {
  const d = day(k), id = cid(sid, t), on = !!d.checks[id];
  return `<label class="task ${on ? 'on' : ''}">
    <input type="checkbox" data-check="${id}" ${on ? 'checked' : ''}>
    <span class="tl">${esc(t.label)}</span>${t.xp ? `<span class="xp">+${t.xp}</span>` : ''}
  </label>`;
}
function sectionCard(k, sid) {
  const sec = D.sections[sid], d = day(k);
  const done = sec.tasks.filter(t => d.checks[cid(sid, t)]).length;
  const full = sec.pick ? done > 0 : done === sec.tasks.length;
  return `<div class="card">
    <div class="cardhead"><h3>${esc(sec.title)}</h3>
      ${sec.pick ? '<span class="chip pick">pick one</span>' : ''}
      <span class="prog ${full ? 'full' : ''}">${done}/${sec.tasks.length}</span></div>
    ${sec.subtitle ? `<p class="sub">${esc(sec.subtitle)}</p>` : ''}
    <div class="tasks">${sec.tasks.map(t => taskRow(k, sid, t)).join('')}</div>
  </div>`;
}

function winCard(k) {
  const d = day(k);
  if (d.bad) {
    const core = D.sections.badday.tasks.filter(t => t.core);
    const done = core.filter(t => d.checks[cid('badday', t)]).length;
    const won = done === core.length;
    return `<div class="card">
      <div class="cardhead"><h3>Today's Win Condition</h3><span class="prog ${won ? 'full' : ''}">${done}/${core.length}</span></div>
      <p class="sub">Complete the Bad Day list and the day counts. That is the whole mission.</p>
      <div class="winstate ${won ? 'won' : ''}">${won ? '🏆 DAY SURVIVED — that counts as a win' : 'Damage control in progress'}</div>
    </div>`;
  }
  const wins = D.modes[d.mode].win;
  const nWon = wins.filter(w => effWin(k, w)).length;
  const won = nWon >= 4;
  const rows = wins.map(w => {
    const on = effWin(k, w);
    return `<div class="winrow ${on ? 'on' : ''}" data-win="${w.id}">
      <span class="wmark">${on ? '✓' : ''}</span>
      <span class="wl">${esc(w.label)}${w.hint ? `<span class="whint">${esc(w.hint)}</span>` : ''}</span>
    </div>`;
  }).join('');
  return `<div class="card">
    <div class="cardhead"><h3>Today's Win Conditions</h3><span class="prog ${won ? 'full' : ''}">${nWon}/${wins.length}</span></div>
    <p class="sub">Rule: 4 of ${wins.length} and the day counts. Most auto-check as you finish blocks below.</p>
    <div class="winlist">${rows}</div>
    <div class="winstate ${won ? 'won' : ''}">${won ? '🏆 DAY WON — free time is earned and open' : `${4 - nWon > 0 ? 4 - nWon : 0} more to win the day`}</div>
  </div>`;
}

function nextCard(k) {
  const nt = nextTask(k);
  const yd = S.days[addDays(k, -1)];
  const yNote = yd && yd.tomorrow ? `<div class="yesterday">📌 Yesterday-you said start with: <b>${esc(yd.tomorrow)}</b></div>` : '';
  if (!nt) {
    const p = S.projects.filter(p => p.status === 'Active' && p.nextAction)
      .sort((a, b) => D.projectPriorities.indexOf(a.priority) - D.projectPriorities.indexOf(b.priority))[0];
    return `<div class="card nextcard"><div class="nlabel">WHAT DO I DO NEXT?</div>
      <div class="ntask">All missions complete. Free time unlocked. 🎮</div>
      ${p ? `<div class="nsec">Bonus quest — ${esc(p.name)}: ${esc(p.nextAction)}</div>` : ''}</div>`;
  }
  return `<div class="card nextcard"><div class="nlabel">WHAT DO I DO NEXT?</div>
    <div class="ntask">${esc(nt.t.label)}</div>
    <div class="nsec">${esc(nt.sec.title)}</div>
    <div class="formrow"><button class="btn good small" data-checkbtn="${nt.id}">✓ Done${nt.t.xp ? ` (+${nt.t.xp} XP)` : ''}</button></div>
    ${yNote}</div>`;
}

function weeklyMissionBanner(k) {
  const wk = S.weeks[mondayOf(k)];
  if (!wk || !['money', 'japanese', 'construction', 'project'].some(x => (wk[x] || '').trim())) return '';
  const li = [['money', '💴'], ['japanese', '🈯'], ['construction', '🔨'], ['project', '🚀']]
    .filter(([x]) => (wk[x] || '').trim())
    .map(([x, ico]) => `<div>${ico} <b>${esc(wk[x])}</b></div>`).join('');
  return `<div class="card missionbanner"><div class="cardhead"><h3>This Week's Main Missions</h3><span class="chip mode">set on Sunday</span></div><div class="mt">${li}</div></div>`;
}

function endOfDayCard(k) {
  const d = day(k);
  const won = dayWon(k);
  return `<div class="card">
    <div class="cardhead"><h3>End of Day Check</h3><span class="chip ${won ? 'ok' : ''}">${won ? 'Day won ✓' : 'In progress'}</span></div>
    <label class="flabel">What got blocked today?</label>
    <textarea data-bind="blocked" placeholder="Blocker: what I tried / where I got stuck / what I need">${esc(d.blocked)}</textarea>
    <label class="flabel">Tomorrow's first task (shows on tomorrow's dashboard)</label>
    <input type="text" data-bind="tomorrow" value="${esc(d.tomorrow)}" placeholder="e.g. Book Meatball booster">
  </div>`;
}

/* ---------- Sunday review ---------- */
function jpScore(R) {
  const jf = D.reviewForm.find(x => x.id === 'jp');
  let n = 0;
  for (const f of jf.fields) {
    if (f.type === 'yn' && R[f.k] === 'Yes') n++;
    if (f.type === 'num' && Number(R[f.k]) > 0) n++;
  }
  const label = n === 7 ? 'Excellent' : n >= 5 ? 'On track' : n >= 3 ? 'Bare minimum — fix next week' : 'System failure — reduce tasks and restart';
  return { n, label };
}
function reviewField(R, f) {
  const v = R[f.k] ?? '';
  if (f.type === 'yn') return `<div class="sbrow"><span class="sblabel">${esc(f.label)}</span>
    <select data-rev="${f.k}"><option value=""></option><option ${v === 'Yes' ? 'selected' : ''}>Yes</option><option ${v === 'No' ? 'selected' : ''}>No</option></select></div>`;
  if (f.type === 'money' || f.type === 'num')
    return `<div class="sbrow"><span class="sblabel">${esc(f.label)}</span><input type="number" data-rev="${f.k}" value="${esc(v)}" placeholder="${f.type === 'money' ? '$' : '0'}"></div>`;
  return `<div class="sbrow"><span class="sblabel">${esc(f.label)}</span><input type="text" data-rev="${f.k}" value="${esc(v)}"></div>`;
}
function reviewCard(k) {
  const R = day(k).review;
  const secs = D.reviewForm.map(sec => {
    const score = sec.score ? (() => { const s = jpScore(R); return `<div class="notice gold mt">Japanese score: ${s.n}/7 — ${esc(s.label)}</div>`; })() : '';
    return `<details ${sec.id === 'money' ? 'open' : ''}><summary>${esc(sec.title)}</summary><div class="dbody">${sec.fields.map(f => reviewField(R, f)).join('')}${score}</div></details>`;
  }).join('');
  return `<div class="card">
    <div class="cardhead"><h3>Weekly Review</h3><span class="chip mode">Sunday ritual</span></div>
    <p class="sub">Auto-fill pulls what the app already tracked this week. Edit anything that looks wrong.</p>
    <div class="formrow">
      <button class="btn small" data-action="autofill">✨ Auto-fill from this week's data</button>
      <button class="btn small" data-action="apply-scoreboard">Apply fund numbers → Scoreboard</button>
    </div>
    ${secs}
    <label class="task mt"><input type="checkbox" data-rev-done ${R._done ? 'checked' : ''}><span class="tl"><b>Mark weekly review complete</b></span></label>
  </div>`;
}
function nextWeekCard(k) {
  const wkKey = addDays(mondayOf(k), 7);
  const wk = S.weeks[wkKey] || {};
  const f = (key, label, ph) => `<label class="flabel">${label}</label><input type="text" data-week="${key}" data-weekkey="${wkKey}" value="${esc(wk[key] || '')}" placeholder="${ph}">`;
  return `<div class="card">
    <div class="cardhead"><h3>Next Week Setup</h3><span class="chip mode">shows Mon–Sat</span></div>
    ${f('money', '💴 Main money mission', 'e.g. Cancel 2 subscriptions')}
    ${f('japanese', '🈯 Main Japanese mission', 'e.g. Finish katakana')}
    ${f('construction', '🔨 Main construction mission', 'e.g. Ask about helper jobs')}
    ${f('project', '🚀 Main project mission', 'e.g. TradePass: show to 10 people')}
    <div class="notice mt">Also: add any new deadlines to Google Calendar, then clean the dashboard so Monday is obvious.</div>
  </div>`;
}
function autoFillReview(k) {
  const R = day(k).review;
  const last7 = []; for (let i = 0; i < 7; i++) last7.push(addDays(k, -i));
  const daysWith = ids => last7.filter(dk => { const d = S.days[dk]; return d && ids.some(id => d.checks[id]); }).length;
  const yn = n => n ? 'Yes' : 'No';
  const set = (key, val) => { if (R[key] === undefined || R[key] === '') R[key] = val; };
  set('jp5days', yn(daysWith(['jp_school.anki', 'jp_deep.anki', 'jp_school.kana', 'badday.jp5']) >= 5));
  set('anki5', yn(daysWith(['jp_school.anki', 'jp_deep.anki']) >= 5));
  set('bunpo3', yn(daysWith(['jp_school.bunpo', 'jp_deep.bunpo']) >= 3));
  set('listen3', yn(daysWith(['jp_school.listening', 'jp_deep.listen20']) >= 3));
  set('speak1', yn(daysWith(['jp_school.speak', 'jp_deep.speak60']) >= 1));
  set('water', yn(daysWith(['mvh.water']) >= 4));
  set('teeth', yn(daysWith(['mvh.teeth']) >= 4));
  set('meals', yn(daysWith(['mvh.meal']) >= 4));
  set('shower2', yn(daysWith(['mvh.shower']) >= 2));
  set('attended', yn(daysWith(['school.attend']) >= 3));
  set('japanFund', S.scoreboard.japanFund);
  set('emergencyFund', S.scoreboard.emergencyFund);
  const wkAgo = addDays(k, -7);
  const sum = pred => S.ledger.filter(e => e.date >= wkAgo && pred(e)).reduce((a, e) => a + (Number(e.amount) || 0), 0);
  set('incomeWeek', sum(e => e.type === 'Income' || e.type === 'Sale') || '');
  set('impulseWeek', sum(e => e.type === 'Impulse') || '');
  save();
  toast('Review auto-filled from tracked data ✨');
}

/* ---------- TODAY view ---------- */
function renderToday() {
  const k = todayKey();
  const d = day(k);
  const m = D.modes[modeIdOf(d)];
  const modeSelect = `<select data-mode-select style="width:auto">${
    ['school', 'build', 'sunday'].map(x => `<option value="${x}" ${d.mode === x ? 'selected' : ''}>${D.modes[x].name}</option>`).join('')
  }</select>`;
  let html = `<div class="daterow">
    <span class="dt">${fmtDate(k)}</span>
    ${d.bad ? '<span class="chip bad">Bad Day Mode</span>' : `<span class="chip mode">${esc(m.chip)}</span>`}
    ${modeSelect}
    <button class="btn small ${d.bad ? 'good' : 'danger ghost'}" data-action="toggle-bad">${d.bad ? '↩ Back to normal day' : '🛟 Bad Day Mode'}</button>
  </div>`;
  html += weeklyMissionBanner(k);
  html += nextCard(k);
  html += winCard(k);
  if (m.lateNote && !d.bad) html += `<div class="notice" style="margin-bottom:14px">${esc(m.lateNote)}</div>`;
  html += m.sections.map(sid => sectionCard(k, sid)).join('');
  if (m.review) { html += reviewCard(k); html += nextWeekCard(k); }
  html += endOfDayCard(k);
  $('#view-today').innerHTML = html;
}

/* ---------- MONEY view ---------- */
function sbRow(key, label, opts = {}) {
  const v = S.scoreboard[key];
  return `<div class="sbrow"><span class="sblabel">${label}</span><input type="number" step="any" data-sb="${key}" value="${esc(v)}"></div>${opts.bar || ''}`;
}
function fundBar(v, goal, green) {
  const pct = Math.max(0, Math.min(100, 100 * v / goal));
  return `<div class="pbar ${green ? 'green' : ''}"><div style="width:${pct}%"></div></div>
    <div class="pmeta"><span>${fmt$(v)}</span><span>${Math.round(pct)}% of ${fmt$(goal)}</span></div>`;
}
function renderMoney() {
  const sb = S.scoreboard;
  const wkAgo = addDays(todayKey(), -7);
  const sum = pred => S.ledger.filter(e => e.date >= wkAgo && pred(e)).reduce((a, e) => a + (Number(e.amount) || 0), 0);
  const income = sum(e => e.type === 'Income' || e.type === 'Sale');
  const saved = sum(e => e.type === 'Transfer' || e.type === 'Savings');
  const impulse = sum(e => e.type === 'Impulse');

  let html = `<div class="card">
    <div class="cardhead"><h3>Money Scoreboard</h3><span class="chip ${sb.lastUpdated === todayKey() ? 'ok' : ''}">${sb.lastUpdated ? 'updated ' + sb.lastUpdated : 'never updated'}</span></div>
    ${sbRow('japanFund', '🗾 Japan Fund', { bar: fundBar(sb.japanFund, sb.japanGoal) })}
    ${sbRow('emergencyFund', '🚨 Emergency Fund (first target $500)', { bar: fundBar(sb.emergencyFund, sb.emergencyGoal, true) })}
    ${sbRow('carLoan', '🚗 Car loan remaining')}
    ${sbRow('monthlyExpenses', '📉 Monthly fixed expenses')}
    ${sbRow('monthlyIncome', '📈 Monthly income (estimate)')}
  </div>`;

  html += `<div class="card">
    <div class="cardhead"><h3>Pay-Yourself Rule</h3><span class="chip pick">run on every payday</span></div>
    <p class="sub">Money hits checking → 20% Japan, 5% Emergency. Tight month → 10% Japan, $5 Emergency. Saving never fully disappears.</p>
    <div class="formrow">
      <input type="number" id="payAmount" placeholder="Amount received ($)" step="any">
      <label class="task" style="flex:0 0 auto"><input type="checkbox" id="payTight"><span class="tl">Tight month</span></label>
    </div>
    <div class="paypreview" id="payPreview"></div>
    <div class="formrow"><button class="btn primary" data-action="payself">Log transfers → funds + ledger</button></div>
  </div>`;

  const bl = S.buyLater.filter(b => !b.decided);
  const blRows = bl.map(b => {
    const unlockAt = b.addedAt + 24 * 3600 * 1000;
    const locked = Date.now() < unlockAt;
    const mins = Math.max(0, Math.ceil((unlockAt - Date.now()) / 60000));
    const wait = mins >= 60 ? `${Math.floor(mins / 60)}h ${mins % 60}m` : `${mins}m`;
    return `<div class="rowitem"><div class="grow">
      <div class="title">${esc(b.item)} ${b.price ? `<span class="muted">· ${fmt$(b.price)}</span>` : ''}</div>
      <div class="meta">${locked ? `🔒 Locked — decision unlocks in ${wait}` : `🔓 Unlocked. Japan Fund is at <b>${fmt$(S.scoreboard.japanFund)}</b>. Still worth it?`}</div></div>
      ${locked ? '' : `<button class="btn small" data-buy="${b.id}">Buy</button><button class="btn small good" data-skipbuy="${b.id}">Skip (+${D.eventXP.impulseAvoided} XP)</button>`}
    </div>`;
  }).join('');
  html += `<div class="card">
    <div class="cardhead"><h3>Buy Later — 24h Impulse Lock</h3><span class="prog">${bl.length} waiting</span></div>
    <p class="sub">Anything non-essential over $20 goes here first. The app enforces the 24-hour wait, then shows the Japan Fund before you decide.</p>
    <div class="formrow">
      <input type="text" id="blItem" placeholder="Thing you want">
      <input type="number" id="blPrice" placeholder="$" step="any" style="max-width:100px">
      <button class="btn" data-action="addbuy">Lock it</button>
    </div>
    <div class="mt">${blRows || '<p class="sub">Nothing waiting. The Japan Fund thanks you.</p>'}</div>
  </div>`;

  const entries = S.ledger.slice(-8).reverse().map(e => `<div class="rowitem">
    <div class="grow"><div class="title">${esc(e.type)} · ${fmt$(e.amount)}</div><div class="meta">${esc(e.date)}${e.note ? ' — ' + esc(e.note) : ''}</div></div>
    <button class="btn small ghost danger" data-delledger="${e.id}">✕</button></div>`).join('');
  html += `<div class="card">
    <div class="cardhead"><h3>Money Ledger</h3><span class="chip">+${D.eventXP.ledgerLog} XP per log</span></div>
    <div class="statgrid">
      <div class="stat"><div class="sv">${fmt$(income)}</div><div class="sk">Income this week</div></div>
      <div class="stat"><div class="sv">${fmt$(saved)}</div><div class="sk">Saved/transferred this week</div></div>
      <div class="stat"><div class="sv" style="color:${impulse > 0 ? 'var(--danger)' : 'var(--green)'}">${fmt$(impulse)}</div><div class="sk">Impulse this week</div></div>
    </div>
    <div class="formrow">
      <select id="ldType">${D.ledgerTypes.map(t => `<option>${t}</option>`).join('')}</select>
      <input type="number" id="ldAmount" placeholder="$" step="any" style="max-width:110px">
      <input type="text" id="ldNote" placeholder="Note">
      <button class="btn" data-action="addledger">Log</button>
    </div>
    <div class="mt">${entries || '<p class="sub">No entries yet. Log the first one — visibility beats vibes.</p>'}</div>
  </div>`;

  const sprintSecs = D.sprint.map((w, wi) => {
    const done = w.items.filter((_, ii) => S.sprint[`${wi}.${ii}`]).length;
    const rows = w.items.map((it, ii) => {
      const on = !!S.sprint[`${wi}.${ii}`];
      return `<label class="task ${on ? 'on' : ''}"><input type="checkbox" data-sprint="${wi}.${ii}" ${on ? 'checked' : ''}><span class="tl">${esc(it)}</span></label>`;
    }).join('');
    return `<details><summary>${esc(w.title)}<span class="prog ${done === w.items.length ? 'full' : ''}">${done}/${w.items.length}</span></summary><div class="dbody tasks">${rows}</div></details>`;
  }).join('');
  html += `<div class="card"><div class="cardhead"><h3>30-Day Money Sprint</h3></div>${sprintSecs}</div>`;

  $('#view-money').innerHTML = html;
  updatePayPreview();
}
function updatePayPreview() {
  const el = $('#payPreview');
  if (!el) return;
  const amt = Number($('#payAmount')?.value) || 0;
  const tight = $('#payTight')?.checked;
  const j = tight ? amt * 0.10 : amt * 0.20;
  const e = tight ? Math.min(amt, 5) : amt * 0.05;
  el.innerHTML = amt > 0 ? `
    <div class="stat"><div class="sv">${fmt$(j)}</div><div class="sk">→ Japan Fund (${tight ? '10%' : '20%'})</div></div>
    <div class="stat"><div class="sv">${fmt$(e)}</div><div class="sk">→ Emergency (${tight ? '$5 flat' : '5%'})</div></div>
    <div class="stat"><div class="sv">${fmt$(amt - j - e)}</div><div class="sk">Stays in checking</div></div>` : '';
}

/* ---------- JAPAN view ---------- */
function countChip(dateStr) {
  if (!dateStr) return '<span class="countchip asap">ASAP</span>';
  const n = daysUntil(dateStr);
  if (n < 0) return `<span class="countchip crit">OVERDUE ${-n}d</span>`;
  if (n === 0) return '<span class="countchip crit">TODAY</span>';
  if (n <= 7) return `<span class="countchip crit">${n}d left</span>`;
  if (n <= 30) return `<span class="countchip warn">${n}d left</span>`;
  return `<span class="countchip ok">${n}d</span>`;
}
function renderJapan() {
  const dj = daysUntil(D.japanWindowStart);
  let html = `<div class="card center">
    <div style="font-size:34px">🗾</div>
    <div style="font-size:24px;font-weight:800">${dj} days</div>
    <div class="sub">until the target move window opens (${esc(D.japanWindowLabel)})<br>Route: SSW construction. Region: rural Japan / Hokkaido. Working target, not a blood oath.</div>
  </div>`;

  const open = S.deadlines.filter(x => !x.done).sort((a, b) => (a.date || '0') < (b.date || '0') ? -1 : 1);
  const closed = S.deadlines.filter(x => x.done);
  const dRow = x => `<div class="rowitem ${x.done ? 'done' : ''}"><div class="grow">
      <div class="title">${esc(x.name)}</div>
      <div class="meta"><span class="chip area">${esc(x.area)}</span> ${x.date ? esc(x.date) : ''} ${x.done ? '· done ' + esc(x.doneDate || '') : ''}</div></div>
    ${x.done ? `<button class="btn small ghost" data-undodeadline="${x.id}">undo</button>` : `${countChip(x.date)}<button class="btn small good" data-donedeadline="${x.id}">✓</button>`}
  </div>`;
  html += `<div class="card">
    <div class="cardhead"><h3>Critical Deadlines</h3><span class="prog">${open.length} open</span></div>
    <p class="sub">Hard dates cannot vanish. Countdown colors escalate on their own as dates approach.</p>
    ${open.map(dRow).join('') || '<p class="sub">Nothing open. Suspicious. Add the next one.</p>'}
    <div class="formrow">
      <input type="text" id="dlName" placeholder="New deadline">
      <input type="date" id="dlDate">
      <select id="dlArea" style="max-width:110px">${D.deadlineAreas.map(a => `<option>${a}</option>`).join('')}</select>
      <button class="btn" data-action="adddeadline">Add</button>
    </div>
    ${closed.length ? `<details class="mt"><summary>Completed (${closed.length})</summary><div class="dbody">${closed.map(dRow).join('')}</div></details>` : ''}
  </div>`;

  const catRows = D.cats.map(c => `<div class="rowitem"><div class="grow">
    <div class="title">🐱 ${esc(c.name)}</div>
    <div class="meta">Chip: ${esc(c.chip)} · ISO: ${esc(c.iso)} · ${esc(c.notes)}</div></div>
    ${countChip(c.boosterDue)}</div>`).join('');
  html += `<div class="card">
    <div class="cardhead"><h3>Cats — Import Pipeline</h3></div>
    ${catRows}
    <details class="mt"><summary>Japan cat import steps (plan backward from move date)</summary><div class="dbody">
      ${D.catImportSteps.map((s, i) => `<div class="rstep"><span class="rn">${i + 1}</span><span class="rt">${esc(s)}</span></div>`).join('')}
    </div></details>
  </div>`;

  const doneSteps = 1; // U.S. preparation is underway by definition of using this app
  html += `<div class="card"><div class="cardhead"><h3>The Route</h3><span class="chip mode">SSW construction</span></div>
    <div class="route">${D.route.map((s, i) => `<div class="rstep ${i <= doneSteps ? 'now' : ''}"><span class="rn">${i + 1}</span><span class="rt">${esc(s)}</span></div>`).join('')}</div>
    <details class="mt"><summary>Core visa facts</summary><div class="dbody">${D.routeFacts.map(f => `<p class="sub">• ${esc(f)}</p>`).join('')}</div></details>
  </div>`;

  const phaseSecs = D.phases.map((ph, pi) => {
    const done = ph.items.filter((_, ii) => S.phases[`${pi}.${ii}`]).length;
    const rows = ph.items.map((it, ii) => {
      const on = !!S.phases[`${pi}.${ii}`];
      return `<label class="task ${on ? 'on' : ''}"><input type="checkbox" data-phase="${pi}.${ii}" ${on ? 'checked' : ''}><span class="tl">${esc(it)}</span></label>`;
    }).join('');
    return `<details ${pi === 0 ? 'open' : ''}><summary>${esc(ph.title)} <span class="chip">${esc(ph.window)}</span><span class="prog ${done === ph.items.length ? 'full' : ''}">${done}/${ph.items.length}</span></summary><div class="dbody tasks">${rows}</div></details>`;
  }).join('');
  html += `<div class="card"><div class="cardhead"><h3>Japan Master Plan — Phases</h3></div>${phaseSecs}</div>`;

  const wk = mondayOf(todayKey());
  const fs = S.friendSync[wk] || (S.friendSync[wk] = { checks: {}, awarded: false });
  const fsDone = D.friendSyncItems.filter((_, i) => fs.checks[i]).length;
  const fsRows = D.friendSyncItems.map((it, i) => {
    const on = !!fs.checks[i];
    return `<label class="task ${on ? 'on' : ''}"><input type="checkbox" data-fs="${i}" ${on ? 'checked' : ''}><span class="tl">${esc(it)}</span></label>`;
  }).join('');
  html += `<div class="card">
    <div class="cardhead"><h3>Weekly Friend Sync</h3><span class="prog ${fsDone === D.friendSyncItems.length ? 'full' : ''}">${fsDone}/${D.friendSyncItems.length}</span><span class="chip">+${D.eventXP.friendSync} XP</span></div>
    <p class="sub">Resets every Monday. Rule: no guilt — just data and course correction.</p>
    <div class="tasks">${fsRows}</div>
  </div>`;

  $('#view-japan').innerHTML = html;
}

/* ---------- PROJECTS view ---------- */
function renderProjects() {
  let html = `<div class="card">
    <div class="cardhead"><h3>Operating Rules</h3></div>
    <p class="sub">1. Every project needs a written next action. &nbsp;2. Blocked 15 min → write a blocker. &nbsp;3. First dollar beats perfect product. &nbsp;4. One main project per block.</p>
  </div>`;

  const order = p => D.projectPriorities.indexOf(p.priority);
  const projs = [...S.projects].sort((a, b) => order(a) - order(b));
  html += projs.map(p => {
    const blocked = p.status === 'Blocked' || p.blocker;
    const form = blockerFor === p.id ? `<div class="blockerform">
      <label class="flabel">What did you try?</label><input type="text" id="bk-tried">
      <label class="flabel">Where did you get stuck?</label><input type="text" id="bk-stuck">
      <label class="flabel">What do you need next?</label><input type="text" id="bk-need">
      <div class="formrow"><button class="btn primary small" data-saveblocker="${p.id}">Save blocker</button>
      <button class="btn small ghost" data-action="cancelblocker">Cancel</button></div>
    </div>` : '';
    return `<div class="card">
      <div class="cardhead"><h3>${esc(p.name)}</h3>
        <span class="chip ${p.priority === 'Core' ? 'crit' : p.priority === 'High' ? 'warn' : ''}">${esc(p.priority)}</span>
        <select data-status="${p.id}" style="width:auto">${D.projectStatuses.map(s => `<option ${p.status === s ? 'selected' : ''}>${s}</option>`).join('')}</select>
      </div>
      <p class="sub">${esc(p.goal)}${p.metric ? ` · <b>Metric:</b> ${esc(p.metric)}` : ''}</p>
      <label class="flabel">Next action (never leave this empty)</label>
      <input type="text" data-nextaction="${p.id}" value="${esc(p.nextAction)}" placeholder="Specific, small, doable">
      ${blocked && p.blocker ? `<div class="notice red mt">⛔ ${esc(p.blocker)} <button class="btn small ghost good" data-clearblocker="${p.id}">Resolved (+${D.eventXP.blockerResolved} XP)</button></div>` : ''}
      ${blockerFor !== p.id ? `<div class="formrow"><button class="btn small ghost" data-blocker="${p.id}">⛔ I'm blocked</button></div>` : form}
    </div>`;
  }).join('');

  const dumps = S.brainDump.filter(b => !b.decision || b.decision === 'Later').slice().reverse().map(b => `<div class="rowitem">
    <div class="grow"><div class="title">${esc(b.idea)}</div><div class="meta">${esc(b.category)} · ${esc(b.date)}${b.decision ? ' · ' + esc(b.decision) : ''}</div></div>
    <button class="btn small ghost" data-dumpdec="Keep|${b.id}">Keep</button>
    <button class="btn small ghost" data-dumpdec="Convert|${b.id}">→Project</button>
    <button class="btn small ghost danger" data-dumpdec="Kill|${b.id}">Kill</button>
  </div>`).join('');
  html += `<div class="card">
    <div class="cardhead"><h3>Brain Dump</h3></div>
    <p class="sub">New ideas land here. Nothing becomes active until Sunday Review. You do not rebuild your life at 2:13 AM because an app idea winked at you.</p>
    <div class="formrow">
      <input type="text" id="bdIdea" placeholder="The shiny new idea">
      <select id="bdCat" style="max-width:120px">${D.dumpCategories.map(c => `<option>${c}</option>`).join('')}</select>
      <button class="btn" data-action="adddump">Catch it</button>
    </div>
    <div class="mt">${dumps || '<p class="sub">Empty. Either great focus or the goblin is asleep.</p>'}</div>
  </div>`;

  const bks = S.blockers.filter(b => !b.resolved).slice().reverse().map(b => `<div class="rowitem">
    <div class="grow"><div class="title">${esc(b.project)}</div>
    <div class="meta">Tried: ${esc(b.tried)} · Stuck: ${esc(b.stuck)} · Needs: ${esc(b.need)}</div></div>
    <button class="btn small good" data-resolveblocker="${b.id}">Resolved</button></div>`).join('');
  html += `<div class="card"><div class="cardhead"><h3>Open Blockers</h3><span class="prog">${S.blockers.filter(b => !b.resolved).length}</span></div>
    <p class="sub">Never let a project die because the next step is unclear.</p>
    ${bks || '<p class="sub">No open blockers. The main rule is being obeyed.</p>'}</div>`;

  $('#view-projects').innerHTML = html;
}

/* ---------- MORE view ---------- */
function renderMore() {
  let html = '';

  const wonThisWeek = (() => {
    const mon = mondayOf(todayKey());
    let n = 0;
    for (let i = 0; i < 7; i++) { const k = addDays(mon, i); if (k <= todayKey() && dayWon(k)) n++; }
    return n;
  })();
  html += `<div class="card"><div class="cardhead"><h3>Stats</h3></div>
    <div class="statgrid">
      <div class="stat"><div class="sv">${S.xp}</div><div class="sk">Total XP</div></div>
      <div class="stat"><div class="sv">${streak()}🔥</div><div class="sk">Current streak</div></div>
      <div class="stat"><div class="sv">${wonThisWeek}/7</div><div class="sk">Days won this week</div></div>
      <div class="stat"><div class="sv">${S.trophies.length}🏆</div><div class="sk">Trophies</div></div>
    </div></div>`;

  const trows = S.trophies.slice().reverse().map(t => `<div class="trophy"><span class="tico">🏆</span>
    <div class="grow"><div>${esc(t.name)}</div><div class="tmeta">${esc(t.date)}</div></div></div>`).join('');
  html += `<div class="card"><div class="cardhead"><h3>Trophy Room</h3></div>
    <p class="sub">Every finished thing goes here. A wall of "I made that."</p>
    <div class="formrow"><input type="text" id="trName" placeholder="e.g. Finished katakana"><button class="btn" data-action="addtrophy">Mount it</button></div>
    <div class="mt">${trows || '<p class="sub">Empty wall. It will not stay that way.</p>'}</div></div>`;

  const cls = S.conLog.slice().reverse().slice(0, 10).map(c => `<div class="rowitem"><div class="grow">
    <div class="title">${esc(c.skill)}</div>
    <div class="meta">${esc(c.date)} · ${esc(c.relevance)}${c.tools ? ' · Tools: ' + esc(c.tools) : ''}</div></div></div>`).join('');
  html += `<div class="card"><div class="cardhead"><h3>Construction Log</h3><span class="chip">+${D.eventXP.conLogEntry} XP / entry</span></div>
    <p class="sub">Turn school into proof of skill: resume, portfolio, and SSW relevance.</p>
    <div class="formrow"><input type="text" id="clSkill" placeholder="Skill learned (e.g. cut drywall panels)"></div>
    <div class="formrow"><input type="text" id="clTools" placeholder="Tools/materials used">
      <select id="clRel" style="max-width:140px">${D.conRelevance.map(r => `<option>${r}</option>`).join('')}</select>
      <button class="btn" data-action="addconlog">Log</button></div>
    <div class="mt">${cls || '<p class="sub">No entries yet. Log one thing per school day.</p>'}</div></div>`;

  const vocabSecs = D.vocab.map((st, si) => {
    const done = st.words.filter((_, wi) => S.vocab[`${si}.${wi}`]).length;
    const chips = st.words.map(([en, jp], wi) => {
      const on = !!S.vocab[`${si}.${wi}`];
      return `<button class="vchip ${on ? 'on' : ''}" data-vocab="${si}.${wi}">${on ? '✓ ' : ''}${esc(en)}<span class="jp">${esc(jp)}</span></button>`;
    }).join('');
    return `<details ${si === 0 ? 'open' : ''}><summary>${esc(st.title)}<span class="prog ${done === st.words.length ? 'full' : ''}">${done}/${st.words.length}</span></summary><div class="dbody vwrap">${chips}</div></details>`;
  }).join('');
  html += `<div class="card"><div class="cardhead"><h3>Construction Japanese — Vocab Track</h3><span class="chip">+${D.eventXP.vocabWord} XP / word</span></div>
    <p class="sub">Tap a word when you can recall it cold. Aim for 5 new ones a week.</p>${vocabSecs}</div>`;

  html += `<div class="card"><div class="cardhead"><h3>What do I do if…</h3></div>
    ${D.faq.map(f => `<details><summary>${esc(f.q)}</summary><div class="dbody"><p class="sub">${esc(f.a)}</p></div></details>`).join('')}</div>`;

  const cal = D.calendarRef;
  html += `<div class="card"><div class="cardhead"><h3>Google Calendar Setup (reference)</h3></div>
    <p class="sub">The calendar is the alarm system, not the brain. Set these on the phone once.</p>
    <details><summary>Daily</summary><div class="dbody">${cal.daily.map(x => `<p class="sub">• ${esc(x)}</p>`).join('')}</div></details>
    <details><summary>School days (Mon–Thu)</summary><div class="dbody">${cal.school.map(x => `<p class="sub">• ${esc(x)}</p>`).join('')}</div></details>
    <details><summary>Weekly</summary><div class="dbody">${cal.weekly.map(x => `<p class="sub">• ${esc(x)}</p>`).join('')}</div></details>
    <details><summary>Deadline alarms</summary><div class="dbody">${cal.deadlines.map(x => `<p class="sub">• ${esc(x)}</p>`).join('')}</div></details></div>`;

  html += `<div class="card"><div class="cardhead"><h3>Data</h3></div>
    <p class="sub">Everything is stored locally on this device (localStorage). Export a backup now and then — future-you says thanks.</p>
    <div class="formrow">
      <button class="btn" data-action="export">⬇ Export backup</button>
      <button class="btn" data-action="importbtn">⬆ Import backup</button>
      <button class="btn danger ghost" data-action="reset">Reset everything</button>
    </div>
    <input type="file" id="importFile" accept="application/json" style="display:none">
    <p class="sub mt">Esram_OS v1 · auto-updates: day mode by weekday, daily checklist reset at midnight, deadline countdowns, 24h buy-lock, Sunday review auto-fill.</p>
  </div>`;

  $('#view-more').innerHTML = html;
}

/* ---------- render dispatch ---------- */
const RENDER = { today: renderToday, money: renderMoney, japan: renderJapan, projects: renderProjects, more: renderMore };
function renderAll() { renderHeader(); RENDER[activeTab](); }
function switchTab(tab) {
  activeTab = tab;
  document.querySelectorAll('nav button').forEach(b => b.classList.toggle('active', b.dataset.tab === tab));
  document.querySelectorAll('.view').forEach(v => v.classList.toggle('active', v.id === 'view-' + tab));
  renderAll();
  window.scrollTo(0, 0);
}

/* ---------- events ---------- */
document.addEventListener('click', e => {
  const t = e.target.closest('[data-tab],[data-action],[data-win],[data-checkbtn],[data-buy],[data-skipbuy],[data-delledger],[data-donedeadline],[data-undodeadline],[data-blocker],[data-saveblocker],[data-clearblocker],[data-resolveblocker],[data-dumpdec],[data-vocab]');
  if (!t) return;
  const k = todayKey();
  const ds = t.dataset;

  if (ds.tab) return switchTab(ds.tab);

  if (ds.win !== undefined) {
    const d = day(k);
    const w = D.modes[d.mode].win.find(x => x.id === ds.win);
    d.win[ds.win] = !effWin(k, w);
    save(); return renderAll();
  }
  if (ds.checkbtn) { toggleCheck(k, ds.checkbtn); return renderAll(); }

  if (ds.vocab) {
    const on = !S.vocab[ds.vocab];
    S.vocab[ds.vocab] = on;
    addXP(on ? D.eventXP.vocabWord : -D.eventXP.vocabWord, on ? '語彙 word learned!' : null);
    return renderAll();
  }

  if (ds.donedeadline) {
    const x = S.deadlines.find(d => d.id === ds.donedeadline);
    x.done = true; x.doneDate = k;
    const xp = x.area === 'Cats' ? D.eventXP.deadlineCats : x.area === 'Japan' ? D.eventXP.deadlineJapan : D.eventXP.deadlineOther;
    S.trophies.push({ id: uid(), name: `Cleared: ${x.name}`, date: k });
    addXP(xp, '🏆 Deadline cleared!');
    return renderAll();
  }
  if (ds.undodeadline) {
    const x = S.deadlines.find(d => d.id === ds.undodeadline);
    x.done = false; x.doneDate = null;
    const xp = x.area === 'Cats' ? D.eventXP.deadlineCats : x.area === 'Japan' ? D.eventXP.deadlineJapan : D.eventXP.deadlineOther;
    const ti = S.trophies.findIndex(tr => tr.name === `Cleared: ${x.name}`);
    if (ti >= 0) S.trophies.splice(ti, 1);
    addXP(-xp); return renderAll();
  }

  if (ds.buy) {
    const b = S.buyLater.find(x => x.id === ds.buy);
    b.decided = 'bought';
    if (b.price) S.ledger.push({ id: uid(), date: k, type: 'Impulse', amount: b.price, note: b.item });
    save(); toast('Logged as spending. It was chosen, not fallen into.');
    return renderAll();
  }
  if (ds.skipbuy) {
    const b = S.buyLater.find(x => x.id === ds.skipbuy);
    b.decided = 'skipped';
    addXP(D.eventXP.impulseAvoided, '💪 Impulse avoided!');
    return renderAll();
  }
  if (ds.delledger) {
    const i = S.ledger.findIndex(x => x.id === ds.delledger);
    if (i >= 0) { S.ledger.splice(i, 1); addXP(-D.eventXP.ledgerLog); }
    return renderAll();
  }

  if (ds.blocker) { blockerFor = ds.blocker; return renderAll(); }
  if (ds.saveblocker) {
    const p = S.projects.find(x => x.id === ds.saveblocker);
    const tried = $('#bk-tried').value.trim(), stuck = $('#bk-stuck').value.trim(), need = $('#bk-need').value.trim();
    S.blockers.push({ id: uid(), project: p.name, task: p.nextAction, tried, stuck, need, resolved: false, date: k });
    p.blocker = stuck || need || 'blocked';
    p.status = 'Blocked';
    blockerFor = null;
    save(); toast('Blocker written. Project stays alive. Switch to the next unblocked task.');
    return renderAll();
  }
  if (ds.clearblocker) {
    const p = S.projects.find(x => x.id === ds.clearblocker);
    p.blocker = ''; if (p.status === 'Blocked') p.status = 'Active';
    S.blockers.forEach(b => { if (b.project === p.name && !b.resolved) b.resolved = true; });
    addXP(D.eventXP.blockerResolved, '🔓 Unblocked!');
    return renderAll();
  }
  if (ds.resolveblocker) {
    const b = S.blockers.find(x => x.id === ds.resolveblocker);
    b.resolved = true;
    const p = S.projects.find(x => x.name === b.project);
    if (p) { p.blocker = ''; if (p.status === 'Blocked') p.status = 'Active'; }
    addXP(D.eventXP.blockerResolved, '🔓 Unblocked!');
    return renderAll();
  }

  if (ds.dumpdec) {
    const [dec, id] = ds.dumpdec.split('|');
    const b = S.brainDump.find(x => x.id === id);
    if (dec === 'Convert') {
      S.projects.push({ id: uid(), name: b.idea, status: 'Paused', priority: 'Brain Dump', area: b.category, goal: 'Define the goal on Sunday.', nextAction: 'Write the first next action.', metric: '', blocker: '' });
      b.decision = 'Convert to Project';
      toast('Converted to a Paused project. Activate it on Sunday, not at 2 AM.');
    } else b.decision = dec;
    save(); return renderAll();
  }

  switch (ds.action) {
    case 'toggle-bad': { const d = day(k); d.bad = !d.bad; save(); return renderAll(); }
    case 'autofill': autoFillReview(k); return renderAll();
    case 'apply-scoreboard': {
      const R = day(k).review;
      if (R.japanFund !== undefined && R.japanFund !== '') S.scoreboard.japanFund = Number(R.japanFund);
      if (R.emergencyFund !== undefined && R.emergencyFund !== '') S.scoreboard.emergencyFund = Number(R.emergencyFund);
      S.scoreboard.lastUpdated = k;
      save(); toast('Scoreboard updated from review'); return renderAll();
    }
    case 'payself': {
      const amt = Number($('#payAmount').value) || 0;
      if (amt <= 0) return toast('Enter the amount that hit checking first.');
      const tight = $('#payTight').checked;
      const j = Math.round((tight ? amt * 0.10 : amt * 0.20) * 100) / 100;
      const em = Math.round((tight ? Math.min(amt, 5) : amt * 0.05) * 100) / 100;
      S.scoreboard.japanFund += j;
      S.scoreboard.emergencyFund += em;
      S.scoreboard.lastUpdated = k;
      S.ledger.push({ id: uid(), date: k, type: 'Income', amount: amt, note: 'Pay-yourself run' });
      S.ledger.push({ id: uid(), date: k, type: 'Transfer', amount: j, note: '→ Japan Fund' });
      S.ledger.push({ id: uid(), date: k, type: 'Transfer', amount: em, note: '→ Emergency Fund' });
      addXP(D.eventXP.transferJapan + D.eventXP.transferEmergency + D.eventXP.ledgerLog, '💴 Paid yourself first!');
      return renderAll();
    }
    case 'addbuy': {
      const item = $('#blItem').value.trim();
      if (!item) return toast('Name the thing first.');
      S.buyLater.push({ id: uid(), item, price: Number($('#blPrice').value) || 0, addedAt: Date.now(), decided: null });
      save(); toast('🔒 Locked for 24 hours. Future-you decides.');
      return renderAll();
    }
    case 'addledger': {
      const amount = Number($('#ldAmount').value) || 0;
      if (amount <= 0) return toast('Enter an amount.');
      S.ledger.push({ id: uid(), date: k, type: $('#ldType').value, amount, note: $('#ldNote').value.trim() });
      addXP(D.eventXP.ledgerLog, '📒 Logged');
      return renderAll();
    }
    case 'adddeadline': {
      const name = $('#dlName').value.trim();
      if (!name) return toast('Name the deadline.');
      S.deadlines.push({ id: uid(), name, date: $('#dlDate').value || '', area: $('#dlArea').value, urgency: 'High', done: false, doneDate: null });
      save(); toast('Deadline locked in. It cannot silently die now.');
      return renderAll();
    }
    case 'adddump': {
      const idea = $('#bdIdea').value.trim();
      if (!idea) return toast('Write the idea.');
      S.brainDump.push({ id: uid(), idea, category: $('#bdCat').value, decision: null, date: k });
      save(); toast('🧠 Caught. Back to the mission.');
      return renderAll();
    }
    case 'cancelblocker': blockerFor = null; return renderAll();
    case 'addtrophy': {
      const name = $('#trName').value.trim();
      if (!name) return toast('Name the trophy.');
      S.trophies.push({ id: uid(), name, date: k });
      save(); toast('🏆 Mounted on the wall.');
      return renderAll();
    }
    case 'addconlog': {
      const skill = $('#clSkill').value.trim();
      if (!skill) return toast('What skill did you practice?');
      S.conLog.push({ id: uid(), date: k, skill, tools: $('#clTools').value.trim(), relevance: $('#clRel').value });
      addXP(D.eventXP.conLogEntry, '🔨 Skill logged');
      return renderAll();
    }
    case 'export': {
      const blob = new Blob([JSON.stringify(S, null, 2)], { type: 'application/json' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `esram-os-backup-${k}.json`;
      a.click(); URL.revokeObjectURL(a.href);
      return;
    }
    case 'importbtn': return $('#importFile').click();
    case 'reset': {
      if (confirm('Reset EVERYTHING? All XP, checks, and history will be wiped. Export a backup first if in doubt.')) {
        S = seedState(); save(); renderAll(); toast('Fresh spawn. Level 1. Go.');
      }
      return;
    }
  }
});

document.addEventListener('change', e => {
  const t = e.target;
  const k = todayKey();
  if (t.dataset.check) { toggleCheck(k, t.dataset.check); return renderAll(); }
  if (t.dataset.bind) { day(k)[t.dataset.bind] = t.value; save(); return renderAll(); }
  if (t.dataset.sb) {
    S.scoreboard[t.dataset.sb] = Number(t.value) || 0;
    S.scoreboard.lastUpdated = k;
    save(); return renderAll();
  }
  if (t.dataset.rev) { day(k).review[t.dataset.rev] = t.value; save(); return renderAll(); }
  if (t.hasAttribute('data-rev-done')) { day(k).review._done = t.checked; save(); return renderAll(); }
  if (t.dataset.week) {
    const wk = S.weeks[t.dataset.weekkey] || (S.weeks[t.dataset.weekkey] = {});
    wk[t.dataset.week] = t.value;
    save(); return renderAll();
  }
  if (t.dataset.sprint) { S.sprint[t.dataset.sprint] = t.checked; save(); return renderAll(); }
  if (t.dataset.phase) { S.phases[t.dataset.phase] = t.checked; save(); return renderAll(); }
  if (t.dataset.fs !== undefined) {
    const wk = mondayOf(k);
    const fs = S.friendSync[wk] || (S.friendSync[wk] = { checks: {}, awarded: false });
    fs.checks[t.dataset.fs] = t.checked;
    if (!fs.awarded && D.friendSyncItems.every((_, i) => fs.checks[i])) {
      fs.awarded = true;
      addXP(D.eventXP.friendSync, '🤝 Friend sync complete!');
    }
    save(); return renderAll();
  }
  if (t.dataset.nextaction) { const p = S.projects.find(x => x.id === t.dataset.nextaction); p.nextAction = t.value; save(); return; }
  if (t.dataset.status) { const p = S.projects.find(x => x.id === t.dataset.status); p.status = t.value; save(); return renderAll(); }
  if (t.hasAttribute('data-mode-select')) { const d = day(k); d.mode = t.value; d.win = {}; save(); return renderAll(); }
  if (t.id === 'importFile') {
    const f = t.files[0];
    if (!f) return;
    const r = new FileReader();
    r.onload = () => {
      try {
        const data = JSON.parse(r.result);
        if (!data || data.v !== 1) throw new Error('bad');
        S = data; save(); renderAll(); toast('Backup restored ✓');
      } catch (err) { toast('That file is not a valid Esram_OS backup.'); }
    };
    r.readAsText(f);
    return;
  }
});

document.addEventListener('input', e => {
  if (e.target.id === 'payAmount' || e.target.id === 'payTight') updatePayPreview();
});

/* ---------- auto-rollover: new day = fresh mission, no manual reset ---------- */
let curDay = todayKey();
setInterval(() => {
  if (todayKey() !== curDay) {
    curDay = todayKey();
    day(curDay);
    renderAll();
    toast('🌅 New day loaded — fresh mission ready.');
  } else if (activeTab === 'money' && S.buyLater.some(b => !b.decided)) {
    renderMoney(); // tick the 24h lock countdowns
  }
}, 30000);
document.addEventListener('visibilitychange', () => {
  if (!document.hidden) {
    if (todayKey() !== curDay) { curDay = todayKey(); day(curDay); }
    renderAll();
  }
});

/* ---------- PWA: offline cache, network-first so deploys auto-update ---------- */
if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost')) {
  navigator.serviceWorker.register('sw.js').catch(() => { /* offline support is optional */ });
}

/* ---------- boot ---------- */
day(todayKey());
renderAll();
