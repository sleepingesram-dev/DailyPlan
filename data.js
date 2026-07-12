'use strict';
/* ============================================================
   ESRAM_OS v1 — static data (templates, XP rules, seeds)
   Source: Gio OS v1 — Japan Prep Arc
   ============================================================ */
const D = {

  japanWindowStart: '2028-07-01',
  japanWindowLabel: 'July–December 2028',

  levels: [
    [0, 'Spawn Point'],
    [250, 'Awake, Barely'],
    [500, 'Routine Goblin'],
    [1000, 'Apprentice Human'],
    [1750, 'Japan Prep Recruit'],
    [2750, 'Construction Candidate'],
    [4000, 'N5 Climber'],
    [5500, 'Money Stabilizer'],
    [7500, 'SSW Candidate'],
    [10000, 'Move-Prep Mode'],
  ],

  /* ---------- daily mission sections ---------- */
  sections: {
    mvh: {
      title: 'Minimum Viable Human',
      subtitle: 'The floor. Maintenance costs for the meat vehicle.',
      tasks: [
        { k: 'water',   label: 'Drink water', xp: 5, core: 1 },
        { k: 'meal',    label: 'Eat at least one real meal', xp: 10, core: 1 },
        { k: 'teeth',   label: 'Brush teeth once', xp: 10, core: 1 },
        { k: 'cats',    label: 'Check cats: water, feeder, litter, behavior', xp: 10, core: 1 },
        { k: 'openos',  label: 'Open Esram_OS', xp: 5, core: 1 },
        { k: 'shower',  label: 'Bonus: shower', xp: 10 },
        { k: 'roomreset', label: 'Bonus: 5-minute room reset', xp: 10 },
        { k: 'stretch', label: 'Bonus: stretch or walk 5 minutes', xp: 5 },
      ],
    },

    jp_school: {
      title: 'Japanese Block — 30–45 min',
      subtitle: 'Before school. Tiny missions, not a "study Japanese" blob.',
      tasks: [
        { k: 'kana',      label: 'Kana Pro — 5 min', xp: 5, core: 1 },
        { k: 'anki',      label: 'Anki reviews — 10–15 min', xp: 15, core: 1 },
        { k: 'newcards',  label: 'Kaishi new cards — 5–10 cards', xp: 10 },
        { k: 'bunpo',     label: 'Bunpo — 1 lesson/review', xp: 15, core: 1 },
        { k: 'listening', label: 'Listening — 5 min', xp: 10 },
        { k: 'speak',     label: 'Say 3 sentences out loud', xp: 15 },
        { k: 'conword',   label: 'Bonus: learn 1 construction word', xp: 10 },
      ],
    },

    moneyproj: {
      title: 'Money / Project Block — 30–60 min',
      subtitle: 'Choose ONE. Stop when complete or blocked. If blocked, write the blocker.',
      pick: true,
      tasks: [
        { k: 'subaudit',   label: 'Subscription audit', xp: 50 },
        { k: 'tradepass',  label: 'TradePass launch task', xp: 25 },
        { k: 'protonfix',  label: 'ProtonFix reviewer workflow task', xp: 25 },
        { k: 'fineprint',  label: 'Fine Print Lab script task', xp: 25 },
        { k: 'sellitem',   label: 'Sell/list one unused item', xp: 50 },
        { k: 'techhelp',   label: 'Tech-help outreach', xp: 25 },
        { k: 'jobresearch', label: 'Construction job research', xp: 25 },
      ],
    },

    preschool: {
      title: 'Pre-School Block',
      subtitle: 'Target: out the door by 3:15–3:30 PM.',
      tasks: [
        { k: 'eatbefore', label: 'Eat something', xp: 5, core: 1 },
        { k: 'pack',      label: 'Pack school items', xp: 5 },
        { k: 'snack',     label: 'Bring snack/water if possible', xp: 5 },
        { k: 'leave',     label: 'Leave by 3:15–3:30 PM', xp: 10, core: 1 },
      ],
    },

    school: {
      title: 'School Block',
      subtitle: 'Turn class time into proof of skill.',
      tasks: [
        { k: 'attend',   label: 'Attend class', xp: 25, core: 1 },
        { k: 'learned',  label: 'Write down one thing learned', xp: 10 },
        { k: 'toolused', label: 'Write down one tool/material used', xp: 5 },
        { k: 'askq',     label: 'Ask one question if confused', xp: 10 },
      ],
    },

    afterschool: {
      title: 'After-School Block',
      tasks: [
        { k: 'eat2',      label: 'Eat', xp: 5 },
        { k: 'logskill',  label: 'Log construction skill (Construction Log → More tab)', xp: 10 },
        { k: 'teethnight', label: 'Brush teeth before sleep', xp: 10, core: 1 },
        { k: 'freetime',  label: 'Gaming/free time — no guilt tab running', xp: 0 },
      ],
    },

    jp_deep: {
      title: 'Japanese Deep Block — 60–120 min',
      subtitle: 'Friday = Boss Fight. Clear the whole block for +50 XP.',
      tasks: [
        { k: 'anki',      label: 'Anki reviews', xp: 15, core: 1 },
        { k: 'newcards',  label: '10–15 new Kaishi cards', xp: 10, core: 1 },
        { k: 'bunpo',     label: 'Bunpo lesson + review', xp: 15, core: 1 },
        { k: 'listen20',  label: '20 min listening', xp: 10 },
        { k: 'conwords',  label: '5–10 construction words', xp: 10 },
        { k: 'speak60',   label: 'Speak for 60 seconds', xp: 15 },
        { k: 'checkpoint', label: 'Weekly checkpoint (Friday/Sunday)', xp: 10 },
      ],
    },

    moneyattack: {
      title: 'Money Attack Block',
      subtitle: 'Pick the highest priority that applies.',
      pick: true,
      tasks: [
        { k: 'tpoutreach', label: 'TradePass user outreach', xp: 25 },
        { k: 'pipeline',   label: 'Construction income / job pipeline', xp: 25 },
        { k: 'techoffer',  label: 'Tech-help offer', xp: 25 },
        { k: 'sellstuff',  label: 'Sell unused stuff', xp: 50 },
        { k: 'subaudit',   label: 'Subscription audit', xp: 50 },
      ],
    },

    projbuild: {
      title: 'Project Build Block',
      subtitle: 'ONE main project per block. No app-hopping like a caffeinated squirrel.',
      pick: true,
      tasks: [
        { k: 'tp',  label: 'TradePass content/distribution', xp: 25 },
        { k: 'pf',  label: 'ProtonFix reviewer workflow / search / filtering', xp: 25 },
        { k: 'fpl', label: 'Fine Print Lab script/video', xp: 25 },
      ],
    },

    envreset: {
      title: 'Environment Reset',
      tasks: [
        { k: 'reset',  label: '5–15 minute room reset', xp: 10, core: 1 },
        { k: 'trash',  label: 'Trash out', xp: 5 },
        { k: 'dishes', label: 'Dishes/cups out', xp: 5 },
        { k: 'desk',   label: 'Desk clear enough to work', xp: 5 },
      ],
    },

    sun_family: {
      title: 'Family & Reset',
      subtitle: 'Sunday is for family, review, and setup — not a life overhaul.',
      tasks: [
        { k: 'family', label: 'Family obligations', xp: 10, core: 1 },
      ],
    },

    badday: {
      title: 'Bad Day Mode — complete these only',
      subtitle: 'This is not failure. This is damage control. A bad day is allowed; a vanished day is what we prevent.',
      tasks: [
        { k: 'water',   ref: 'mvh.water',  label: 'Drink water', xp: 5, core: 1 },
        { k: 'eat',     ref: 'mvh.meal',   label: 'Eat anything', xp: 10, core: 1 },
        { k: 'teeth',   ref: 'mvh.teeth',  label: 'Brush teeth once', xp: 10, core: 1 },
        { k: 'cats',    ref: 'mvh.cats',   label: 'Check cats', xp: 10, core: 1 },
        { k: 'openos',  ref: 'mvh.openos', label: 'Open Esram_OS', xp: 5, core: 1 },
        { k: 'jp5',     label: '5 minutes of Japanese OR mark Japanese as skipped', xp: 5, core: 1 },
        { k: 'tomorrow', label: "Set tomorrow's first task (End of Day box below)", xp: 5, core: 1 },
      ],
    },
  },

  /* ---------- day modes ---------- */
  modes: {
    school: {
      name: 'School Day', chip: 'Mon–Thu',
      sections: ['mvh', 'jp_school', 'moneyproj', 'preschool', 'school', 'afterschool'],
      win: [
        { id: 'mvh',    label: 'Minimum Viable Human',        rule: { t: 'allCore', s: 'mvh' } },
        { id: 'jp',     label: 'Japanese before school',      rule: { t: 'allCore', s: 'jp_school' } },
        { id: 'money',  label: 'One money or project task',   rule: { t: 'any', s: 'moneyproj' } },
        { id: 'eat',    label: 'Eat before leaving',          rule: { t: 'task', s: 'preschool', k: 'eatbefore' } },
        { id: 'attend', label: 'Attend school',               rule: { t: 'task', s: 'school', k: 'attend' } },
        { id: 'teeth',  label: 'Teeth before sleep',          rule: { t: 'task', s: 'afterschool', k: 'teethnight' } },
      ],
      lateNote: 'Woke up late? Switch to Bad Day Mode + school prep. No heroic catch-up nonsense.',
    },
    build: {
      name: 'Build Day', chip: 'Fri/Sat',
      sections: ['mvh', 'jp_deep', 'moneyattack', 'projbuild', 'envreset'],
      win: [
        { id: 'mvh',     label: 'Minimum Viable Human',      rule: { t: 'allCore', s: 'mvh' } },
        { id: 'jpdeep',  label: 'Japanese deep block',       rule: { t: 'allCore', s: 'jp_deep' } },
        { id: 'money',   label: 'Money task',                rule: { t: 'any', s: 'moneyattack' } },
        { id: 'project', label: 'Project task',              rule: { t: 'any', s: 'projbuild' } },
        { id: 'reset',   label: 'Room reset / errand',       rule: { t: 'task', s: 'envreset', k: 'reset' } },
        { id: 'free',    label: 'Free time without guilt',   rule: { t: 'manual' }, hint: 'Missions done? Games open. Check this when you actually enjoyed it.' },
      ],
    },
    sunday: {
      name: 'Sunday Reset', chip: 'Review + setup',
      sections: ['mvh', 'sun_family'],
      review: true,
      win: [
        { id: 'mvh',     label: 'Minimum Viable Human', rule: { t: 'allCore', s: 'mvh' } },
        { id: 'family',  label: 'Family obligations',   rule: { t: 'task', s: 'sun_family', k: 'family' } },
        { id: 'review',  label: 'Weekly Review',        rule: { t: 'review' } },
        { id: 'money',   label: 'Money update',         rule: { t: 'moneyupd' }, hint: 'Auto-checks when you update the scoreboard today.' },
        { id: 'jpcheck', label: 'Japanese checkpoint',  rule: { t: 'jpreview' }, hint: 'Auto-checks when the Japanese review section is filled.' },
        { id: 'monprep', label: 'Monday prep',          rule: { t: 'nextweek' }, hint: 'Auto-checks when all 4 next-week missions are set.' },
      ],
    },
    bad: {
      name: 'Bad Day Mode', chip: 'Damage control',
      sections: ['badday'],
      allRequired: true,
      win: [],
    },
  },

  /* ---------- weekly review form (Sunday) ---------- */
  reviewForm: [
    { id: 'money', title: 'Money', fields: [
      { k: 'checking',      label: 'Current checking balance', type: 'money' },
      { k: 'japanFund',     label: 'Japan Fund', type: 'money' },
      { k: 'emergencyFund', label: 'Emergency Fund', type: 'money' },
      { k: 'incomeWeek',    label: 'Income this week', type: 'money' },
      { k: 'impulseWeek',   label: 'Impulse spending this week', type: 'money' },
      { k: 'subsSaved',     label: 'Subscriptions canceled/saved', type: 'money' },
    ]},
    { id: 'jp', title: 'Japanese', score: true, fields: [
      { k: 'jp5days',  label: 'Studied at least 5 days?', type: 'yn' },
      { k: 'anki5',    label: 'Anki reviews at least 5 days?', type: 'yn' },
      { k: 'cards30',  label: 'Added 30+ new cards?', type: 'yn' },
      { k: 'bunpo3',   label: 'Bunpo 3+ times?', type: 'yn' },
      { k: 'listen3',  label: 'Listening 3+ times?', type: 'yn' },
      { k: 'speak1',   label: 'Speaking at least once?', type: 'yn' },
      { k: 'conwords', label: 'Construction words learned', type: 'num' },
    ]},
    { id: 'con', title: 'Construction', fields: [
      { k: 'attended',  label: 'Attended required school days?', type: 'yn' },
      { k: 'skill',     label: 'Skill learned this week', type: 'text' },
      { k: 'tools',     label: 'Tools/materials used', type: 'text' },
      { k: 'careerq',   label: 'Career question asked?', type: 'yn' },
      { k: 'japanstep', label: 'Japan construction step completed?', type: 'yn' },
    ]},
    { id: 'proj', title: 'Projects', fields: [
      { k: 'tpUsers',    label: 'TradePass users this week', type: 'num' },
      { k: 'tpSales',    label: 'TradePass sales this week', type: 'num' },
      { k: 'pfLogs',     label: 'ProtonFix logs/users this week', type: 'num' },
      { k: 'fplPub',     label: 'Fine Print Lab content published?', type: 'text' },
      { k: 'deserves',   label: 'Which project deserves next week?', type: 'text' },
      { k: 'pretending', label: 'Which project is pretending to matter?', type: 'text' },
    ]},
    { id: 'body', title: 'Body / Routine', fields: [
      { k: 'water',   label: 'Water most days?', type: 'yn' },
      { k: 'teeth',   label: 'Teeth most days?', type: 'yn' },
      { k: 'meals',   label: 'Ate at least one real meal most days?', type: 'yn' },
      { k: 'shower2', label: 'Showered at least 2x?', type: 'yn' },
      { k: 'sleep',   label: 'Sleep improved, same, or worse?', type: 'text' },
    ]},
  ],

  /* ---------- seeds ---------- */
  deadlineSeed: [
    { name: 'Meatball rabies booster', date: '2026-07-29', area: 'Cats', urgency: 'Critical' },
    { name: "Scan Meatball's microchip at same vet visit", date: '2026-07-29', area: 'Cats', urgency: 'Critical' },
    { name: 'Tiki rabies booster', date: '2026-10-14', area: 'Cats', urgency: 'Critical' },
    { name: 'Confirm vet name, phone, and address', date: '', area: 'Cats', urgency: 'High' },
    { name: 'Confirm passport status', date: '', area: 'Japan', urgency: 'High' },
    { name: 'Save all cat vaccine records to Google Drive', date: '', area: 'Cats', urgency: 'High' },
    { name: 'Subscription audit', date: '', area: 'Money', urgency: 'High' },
  ],

  projectSeed: [
    { name: 'Japan Move', status: 'Active', priority: 'Core', area: 'Japan',
      goal: 'Move to Japan around mid-to-late 2028 through SSW construction.',
      nextAction: 'Confirm passport status and book Meatball booster.', metric: '' },
    { name: 'Japanese Learning', status: 'Active', priority: 'Core', area: 'Japanese',
      goal: 'Reach N4/JFT-Basic level for SSW eligibility.',
      nextAction: 'Finish katakana and start Kaishi 1.5k daily.', metric: '' },
    { name: 'Construction Career', status: 'Active', priority: 'Core', area: 'Construction',
      goal: 'Finish Tidewater Tech, get U.S. construction experience, pursue SSW construction.',
      nextAction: 'Ask instructor what paid helper jobs students usually get.', metric: '' },
    { name: 'Money Stabilization', status: 'Active', priority: 'Core', area: 'Money',
      goal: 'Build emergency fund, grow Japan fund, stop leaks, increase income.',
      nextAction: 'Subscription audit.', metric: '' },
    { name: 'TradePass', status: 'Active', priority: 'High', area: 'Money',
      goal: 'Get first 5 paid users. $24 one-time unlock, school/instructor seat packs.',
      nextAction: 'Self-test purchase flow and show it to 10 real people.',
      metric: '50 free users and 5 paid users within launch test period.' },
    { name: 'ProtonFix', status: 'Active', priority: 'Medium', area: 'Money',
      goal: 'Public beta-ready deterministic Proton log analysis tool.',
      nextAction: 'Finish reviewer workflow.',
      metric: '10 beta users, 25 real logs, 20 verified knowledge-base entries.' },
    { name: 'Fine Print Lab', status: 'Active', priority: 'Low', area: 'Creative',
      goal: 'Publish first long video and 3 Shorts. Publish ugly, improve after.',
      nextAction: 'Write ugly first script.', metric: '' },
  ],

  projectStatuses: ['Active', 'Paused', 'Blocked', 'Testing', 'Killed', 'Done'],
  projectPriorities: ['Core', 'High', 'Medium', 'Low', 'Brain Dump'],
  ledgerTypes: ['Income', 'Expense', 'Transfer', 'Debt Payment', 'Savings', 'Impulse', 'Subscription', 'Sale'],
  deadlineAreas: ['Cats', 'Japan', 'School', 'Money', 'Health', 'Admin'],
  dumpCategories: ['Money', 'Japan', 'Project', 'Creative', 'Random', 'Purchase'],
  conRelevance: ['Carpentry', 'Plumbing', 'General Labor', 'Roofing', 'Drywall', 'Tiling', 'Other'],

  /* XP for non-checklist events */
  eventXP: {
    deadlineCats: 75, deadlineJapan: 50, deadlineOther: 25,
    ledgerLog: 10, transferJapan: 25, transferEmergency: 15,
    impulseAvoided: 15, blockerResolved: 15, conLogEntry: 10,
    vocabWord: 5, friendSync: 25, bossFight: 50,
  },

  /* ---------- Japan route ---------- */
  route: [
    'U.S. preparation',
    'Construction school',
    'Paid U.S. construction experience',
    'Japanese to N4 / JFT-Basic',
    'Construction SSW skills test',
    'Find employer',
    'Employment contract',
    'Certificate of Eligibility (1–3 months)',
    'Visa application via embassy/consulate',
    'Move to Japan under SSW Type 1',
    'Build Japanese work experience',
    'SSW Type 2 construction if eligible',
    'Permanent Residency later if eligible',
  ],

  routeFacts: [
    'SSW Type 1: work in covered fields, limited to 5 years total.',
    'SSW Type 2: no upper stay limit (renewable); construction is a key long-term path.',
    'SSW Type 1 needs a skills test + JFT-Basic or JLPT N4+.',
    'Certificate of Eligibility takes about 1–3 months after the contract.',
    'No Working Holiday Visa for U.S. citizens (per MOFA list, Apr 2026) — the plan does not rely on it.',
  ],

  phases: [
    { title: 'Phase 1 — Stabilize the foundation', window: 'July–October 2026', items: [
      'Book Meatball rabies booster before July 29, 2026',
      'Scan Meatball chip and confirm ISO compliance',
      'Find/save vet name, phone, address',
      'Confirm passport status',
      'Finish katakana',
      'Start Kaishi 1.5k Anki deck',
      'Continue Bunpo',
      'Attend construction school consistently',
      'Start subscription audit',
      'Build emergency fund from $0 to $500',
      'Keep Japan fund growing from $650',
    ]},
    { title: 'Phase 2 — Finish school, convert training into income', window: 'Late 2026–Early 2027', items: [
      'Finish Tidewater Tech construction program',
      'Get construction helper/laborer/apprentice work if possible',
      'Create basic construction resume',
      'Build construction skill log',
      'Reach real N5 foundation',
      'Continue toward N4/JFT-Basic',
      'Research SSW construction requirements',
      'Save official SSW pages to Google Drive',
      "Confirm both cats' rabies/microchip timelines",
    ]},
    { title: 'Phase 3 — Become a serious SSW candidate', window: 'Mid-2027', items: [
      'Work construction regularly',
      'Build savings aggressively',
      'Study Japanese 5–6 days/week',
      'Start construction Japanese vocabulary track seriously',
      'Research Hokkaido construction opportunities',
      'Research backup regions: Tohoku, Nagano, Niigata, rural Gifu, rural Toyama/Ishikawa',
      'Begin friend weekly Japan sync',
      'Passport secured',
    ]},
    { title: 'Phase 4 — Test reality before committing', window: 'Late 2027–Early 2028', items: [
      'Take N5 practice test or JLPT if ready',
      'Push hard toward N4/JFT-Basic',
      'Consider scouting trip planning',
      'Research SSW construction employers/job fairs',
      'Contact immigration lawyer for route verification',
      'Review cat import timing based on real move target',
      'Decide construction vs agriculture backup',
    ]},
    { title: 'Phase 5 — Convert preparation into an actual move', window: '2028 Move Prep', items: [
      'Pass or be ready for JFT-Basic / JLPT N4',
      'Pass or prepare for construction SSW exam',
      'Apply to Japanese employers',
      'Get employment contract if possible',
      'Employer/representative starts COE process',
      'Begin/finish cat import process 10–12 months before move',
      'Reach recommended savings target',
      'Build arrival plan',
    ]},
  ],

  cats: [
    { name: 'Tiki', chip: 'Known compliant', iso: 'Yes', boosterDue: '2026-10-14', notes: 'Save vaccine logs' },
    { name: 'Meatball', chip: 'Unknown compliance', iso: 'Needs scan', boosterDue: '2026-07-29', notes: 'Scan chip at booster visit' },
  ],

  catImportSteps: [
    'Microchip identification (ISO)',
    'Rabies vaccination at least twice after microchip',
    'Rabies antibody (titer) test through an approved lab',
    '180-day wait from blood draw date',
    'Advance notification to Japan Animal Quarantine Service ≥40 days before arrival',
    'Health certificate close to departure',
    'USDA APHIS endorsement',
  ],

  friendSyncItems: [
    'Compare current savings (you / friend)',
    'Compare Japanese progress',
    'Visa/path research update',
    'Region/job research update',
    'One shared task this week',
    'Any concerns raised?',
    'Is one person falling behind silently?',
  ],

  sprint: [
    { title: 'Week 1', items: [
      'Open Navy Federal', 'Write down checking balance', 'Write down Japan Fund balance',
      'Find car loan monthly payment and interest rate', 'Review last 60 days of subscriptions',
      'Cancel at least 2 unused subscriptions', 'Test TradePass purchase flow',
      'Show TradePass to 10 real people', 'List 5 unused items for sale',
    ]},
    { title: 'Week 2', items: [
      'Get 25 TradePass free users', 'Ask 5 users for feedback', 'Offer tech help to 5 people',
      'Ask instructor about paid helper jobs', 'Contact 3 local construction companies',
    ]},
    { title: 'Week 3', items: [
      'Push TradePass toward 50 free users', 'Ask directly for $24 purchase feedback',
      'Contact 2 HVAC instructors/programs', 'Continue construction outreach', 'Sell/list more unused stuff',
    ]},
    { title: 'Week 4', items: [
      'Count TradePass users', 'Count TradePass sales', 'Count money saved/canceled',
      'Decide: push, fix, or pause TradePass', 'Update next month money mission',
    ]},
  ],

  vocab: [
    { title: 'Stage 1 — Tools & materials (learn 5/week)', words: [
      ['hammer', 'ハンマー'], ['saw', 'のこぎり'], ['drill', 'ドリル'], ['screwdriver', 'ドライバー'],
      ['nail', '釘（くぎ）'], ['screw', 'ネジ'], ['wood', '木材（もくざい）'], ['pipe', 'パイプ'],
      ['wall', '壁（かべ）'], ['floor', '床（ゆか）'], ['roof', '屋根（やね）'], ['tile', 'タイル'],
      ['cement', 'セメント'], ['drywall', '石膏ボード'], ['paint', 'ペンキ'], ['measure', '測る（はかる）'],
      ['cut', '切る（きる）'], ['carry', '運ぶ（はこぶ）'], ['install', '取り付ける'], ['repair', '直す（なおす）'],
    ]},
    { title: 'Stage 2 — Safety words', words: [
      ['danger', '危ない（あぶない）'], ['stop', '止まれ（とまれ）'], ['careful', '気をつけて'],
      ['helmet', 'ヘルメット'], ['gloves', '手袋（てぶくろ）'], ['mask', 'マスク'],
      ['fall', '落ちる（おちる）'], ['electricity', '電気（でんき）'], ['fire', '火（ひ）'],
      ['heavy', '重い（おもい）'], ['hot', '熱い（あつい）'], ['sharp', '鋭い（するどい）'],
      ['broken', '壊れた（こわれた）'], ['emergency', '緊急（きんきゅう）'],
    ]},
    { title: 'Stage 3 — Work commands', words: [
      ['bring this', 'これを持ってきて'], ['hold this', 'これを持ってて'], ['cut here', 'ここを切って'],
      ['measure this', 'これを測って'], ['wait', '待って'], ['come here', 'こっちに来て'],
      ['go there', 'あそこに行って'], ['clean this', 'これをきれいにして'], ['throw this away', 'これを捨てて'],
      ['finish this', 'これを終わらせて'], ['check this', 'これを確認して'],
    ]},
    { title: 'Stage 4 — Interview phrases', words: [
      ['I studied construction.', '建設を勉強しました。'], ['I can do drywall.', '石膏ボードの作業ができます。'],
      ['I have experience with tools.', '工具の経験があります。'], ['I want to work in construction.', '建設の仕事がしたいです。'],
      ['I am studying Japanese.', '日本語を勉強しています。'], ['I can learn quickly.', '早く覚えられます。'],
      ['I want to work long term.', '長く働きたいです。'],
    ]},
  ],

  faq: [
    { q: 'I missed yesterday', a: "Do today's mission. Ignore yesterday. Do not invent a punishment arc." },
    { q: 'I skipped a week', a: 'Open Bad Day Mode. Complete it. Then do Sunday Reset. Resume.' },
    { q: 'I am stuck on a project', a: 'Write a blocker (Projects tab → "I\'m blocked"): what you tried, where you got stuck, what you need. Then ask for help or search. Do not abandon the project silently.' },
    { q: 'I have no motivation', a: 'Do Minimum Viable Human + 5 minutes Japanese. Motivation is not required for water and flashcards, tragically.' },
    { q: 'I want to start a new project', a: 'Put it in Brain Dump. It cannot become active until Sunday Review.' },
    { q: 'I want to buy something', a: 'Add it to Buy Later (Money tab). It locks for 24 hours, then shows you the Japan Fund before you decide.' },
    { q: 'Sleep is destroyed', a: 'Use Bad Day Mode. Do not schedule a heroic 12-hour productivity redemption ritual. Those are fake and stupid.' },
    { q: 'I finished everything', a: 'Open Projects. Do the next unblocked action from the highest-priority Core or High project.' },
    { q: 'I feel behind', a: 'Priority stack: 1. Money → 2. Construction school → 3. Japanese → 4. Cats/passport → 5. Body maintenance → 6. Projects. Do the first incomplete thing from the highest area.' },
  ],

  /* ============================================================
     GAME LAYER (Pixelio-style): gold, gear, shop, expeditions,
     achievements, weekly boss. All fueled by real task completions.
     ============================================================ */

  /* gear catalog — slot: weapon | shield | helmet | armor | accessory | pet */
  gear: [
    { id: 'hammer',    name: 'Trusty Hammer',      emoji: '🔨', slot: 'weapon',    rarity: 'common',    price: 50,  px: '#b0793a' },
    { id: 'saw',       name: 'Ripsaw',             emoji: '🪚', slot: 'weapon',    rarity: 'common',    price: 60,  px: '#9aa7b3' },
    { id: 'wrench',    name: 'Pipe Wrench',        emoji: '🔧', slot: 'weapon',    rarity: 'rare',      price: 140, px: '#d6663c' },
    { id: 'drill',     name: 'Power Drill',        emoji: '🛠️', slot: 'weapon',    rarity: 'rare',      price: 180, px: '#f5b301' },
    { id: 'katana',    name: 'Carpenter Katana',   emoji: '🗡️', slot: 'weapon',    rarity: 'epic',      price: 320, px: '#cfd8e3' },
    { id: 'kanabo',    name: 'Oni Kanabō',         emoji: '⚔️', slot: 'weapon',    rarity: 'legendary', price: 650, px: '#e5484d' },
    { id: 'plywood',   name: 'Plywood Sheet',      emoji: '🪵', slot: 'shield',    rarity: 'common',    price: 45,  px: '#b0793a' },
    { id: 'toolbox',   name: 'Toolbox Lid',        emoji: '🧰', slot: 'shield',    rarity: 'common',    price: 55,  px: '#d6663c' },
    { id: 'roadsign',  name: 'Road Sign Aegis',    emoji: '🚧', slot: 'shield',    rarity: 'rare',      price: 160, px: '#f5b301' },
    { id: 'onishield', name: 'Oni-Face Shield',    emoji: '👹', slot: 'shield',    rarity: 'epic',      price: 300, px: '#e5484d' },
    { id: 'hardhat',   name: 'Hard Hat',           emoji: '👷', slot: 'helmet',    rarity: 'common',    price: 40,  px: '#f5b301' },
    { id: 'bandana',   name: 'Crew Bandana',       emoji: '🧢', slot: 'helmet',    rarity: 'common',    price: 45,  px: '#4ea1ff' },
    { id: 'foxmask',   name: 'Kitsune Mask',       emoji: '🦊', slot: 'helmet',    rarity: 'rare',      price: 170, px: '#ff9d5c' },
    { id: 'kabuto',    name: 'Kabuto Helm',        emoji: '🪖', slot: 'helmet',    rarity: 'epic',      price: 340, px: '#8b5cf6' },
    { id: 'vest',      name: 'Hi-Vis Vest',        emoji: '🦺', slot: 'armor',     rarity: 'common',    price: 50,  px: '#f5a524' },
    { id: 'flannel',   name: 'Lucky Flannel',      emoji: '👕', slot: 'armor',     rarity: 'common',    price: 55,  px: '#e5484d' },
    { id: 'apron',     name: "Carpenter's Apron",  emoji: '🥋', slot: 'armor',     rarity: 'rare',      price: 150, px: '#8a6642' },
    { id: 'happi',     name: 'Happi Coat',         emoji: '🎽', slot: 'armor',     rarity: 'rare',      price: 190, px: '#3b82f6' },
    { id: 'samuraido', name: 'Samurai Dō',         emoji: '🛡️', slot: 'armor',     rarity: 'epic',      price: 380, px: '#374151' },
    { id: 'tape',      name: 'Tape Measure',       emoji: '📏', slot: 'accessory', rarity: 'common',    price: 40,  px: '#f5b301' },
    { id: 'omamori',   name: 'Omamori Charm',      emoji: '🧧', slot: 'accessory', rarity: 'rare',      price: 130, px: '#e5484d' },
    { id: 'daruma',    name: 'Daruma Buddy',       emoji: '🎎', slot: 'accessory', rarity: 'rare',      price: 150, px: '#e5484d' },
    { id: 'sensu',     name: 'Sensu Fan',          emoji: '🪭', slot: 'accessory', rarity: 'epic',      price: 280, px: '#f5f5f4' },
    { id: 'torii',     name: 'Torii Pendant',      emoji: '⛩️', slot: 'accessory', rarity: 'legendary', price: 550, px: '#e5484d' },
    { id: 'tiki',      name: 'Tiki the Cat',       emoji: '🐈', slot: 'pet',       rarity: 'rare',      price: 200, px: '#d6a35c' },
    { id: 'meatball',  name: 'Meatball the Cat',   emoji: '🐈‍⬛', slot: 'pet',      rarity: 'rare',      price: 200, px: '#374151' },
    { id: 'shiba',     name: 'Shiba Pup',          emoji: '🐕', slot: 'pet',       rarity: 'epic',      price: 350, px: '#f5a524' },
    { id: 'tanuki',    name: 'Tanuki Trickster',   emoji: '🦝', slot: 'pet',       rarity: 'epic',      price: 380, px: '#8a6642' },
    { id: 'crane',     name: 'Red-Crowned Crane',  emoji: '🕊️', slot: 'pet',       rarity: 'legendary', price: 600, px: '#f5f5f4' },
  ],

  raritiesOrder: ['common', 'rare', 'epic', 'legendary'],

  /* expedition regions — steps come from completed tasks (1/task, 2 if core) */
  regions: [
    { name: 'Hometown Streets',    emoji: '🏘️', steps: 25,  reward: 60,
      treasures: [{ at: 10, gold: 15 }, { at: 20, gold: 25 }] },
    { name: 'Tidewater Yards',     emoji: '🏗️', steps: 40,  reward: 90,
      treasures: [{ at: 15, gold: 20 }, { at: 30, gold: 35 }] },
    { name: 'Savings Vault Depths', emoji: '🏦', steps: 60,  reward: 130,
      treasures: [{ at: 20, gold: 25 }, { at: 40, gold: 30 }, { at: 55, gold: 40 }] },
    { name: 'Kana Forest',         emoji: '🎋', steps: 80,  reward: 180,
      treasures: [{ at: 25, gold: 30 }, { at: 50, gold: 40 }, { at: 70, gold: 50 }] },
    { name: 'Misty Pacific Crossing', emoji: '🌊', steps: 110, reward: 250,
      treasures: [{ at: 30, gold: 35 }, { at: 60, gold: 45 }, { at: 95, gold: 65 }] },
    { name: 'Hokkaido Snowfields', emoji: '🏔️', steps: 150, reward: 400,
      treasures: [{ at: 40, gold: 50 }, { at: 80, gold: 60 }, { at: 120, gold: 80 }, { at: 145, gold: 100 }] },
  ],

  /* weekly bosses — one spawns every Monday; first task-check each day = hits */
  bossNames: [
    ['Procrastination Oni', '👹'], ['Doomscroll Yōkai', '📱'], ['Subscription Slime', '🟢'],
    ['Sleep-Debt Dragon', '🐉'], ['Impulse Kappa', '🥒'], ['Distraction Tengu', '🪶'],
    ['The Guilt Tab', '🌫️'], ['Sunrise Sleep Thief', '🌅'],
  ],
  bossHp: 45,
  bossReward: 150,

  achievements: [
    { id: 'first_task',  name: 'Press Start',        desc: 'Complete your first task', gold: 10,  icon: '🕹️' },
    { id: 'day_won',     name: 'Day One Victory',    desc: 'Win your first day', gold: 25, icon: '🌅' },
    { id: 'streak7',     name: 'One Week Deep',      desc: 'Hold a 7-day streak', gold: 60, icon: '🔥' },
    { id: 'streak30',    name: 'Routine Goblin King', desc: 'Hold a 30-day streak', gold: 200, icon: '👑' },
    { id: 'level5',      name: 'Japan Prep Recruit', desc: 'Reach level 5', gold: 75, icon: '⭐' },
    { id: 'level10',     name: 'Move-Prep Mode',     desc: 'Reach level 10', gold: 250, icon: '🌟' },
    { id: 'tasks100',    name: 'Century of Checks',  desc: 'Complete 100 tasks', gold: 50, icon: '💯' },
    { id: 'tasks500',    name: 'Half-Thousand Grind', desc: 'Complete 500 tasks', gold: 150, icon: '🏗️' },
    { id: 'first_deadline', name: 'Deadline Slayer', desc: 'Clear your first hard deadline', gold: 40, icon: '📅' },
    { id: 'japan1k',     name: 'First Stack',        desc: 'Japan Fund reaches $1,000', gold: 50, icon: '💴' },
    { id: 'japan5k',     name: 'Serious Money',      desc: 'Japan Fund reaches $5,000', gold: 150, icon: '💰' },
    { id: 'japan14k',    name: 'Fully Funded',       desc: 'Japan Fund reaches $14,000', gold: 500, icon: '🗾' },
    { id: 'vocab20',     name: 'Tool Talk',          desc: 'Learn all Stage 1 construction words', gold: 60, icon: '🈯' },
    { id: 'first_buy',   name: 'Window Shopper No More', desc: 'Buy your first shop item', gold: 15, icon: '🛒' },
    { id: 'full_set',    name: 'Dressed for the Job', desc: 'Equip weapon, shield, helmet, armor, and accessory at once', gold: 100, icon: '🥷' },
    { id: 'first_pet',   name: 'Party of Two',       desc: 'Equip a pet companion', gold: 30, icon: '🐾' },
    { id: 'region1',     name: 'Out the Front Door', desc: 'Complete your first expedition region', gold: 40, icon: '🚪' },
    { id: 'region_all',  name: 'The Long Road North', desc: 'Complete all 6 expedition regions', gold: 400, icon: '🗺️' },
    { id: 'boss_first',  name: 'Boss Down',          desc: 'Defeat your first weekly boss', gold: 50, icon: '⚔️' },
    { id: 'boss5',       name: 'Monster Hunter',     desc: 'Defeat 5 weekly bosses', gold: 150, icon: '🏆' },
  ],

  calendarRef: {
    daily: [
      'Wake-up + Dashboard — set based on current sleep, adjust weekly',
      'Drink water / brush teeth — 30 minutes after wake',
      'Japanese Start — 90 minutes after wake or before school',
      'Teeth before sleep — nightly reminder, even if sleep is weird',
    ],
    school: [
      '2:30 PM — Start pre-school shutdown', '3:00 PM — Eat / pack / water',
      '3:20 PM — Leave for school soon', '3:30 PM — Leave now',
      '9:45 PM — Eat / decompress / log skill',
    ],
    weekly: [
      'Sunday 2:00 PM — Weekly Review', 'Sunday 3:00 PM — Update money numbers',
      'Sunday 3:30 PM — Plan next week', 'Friday 12:00 PM — Japanese Boss Fight',
      'Friday 2:00 PM — TradePass / money sprint',
    ],
    deadlines: [
      'July 15, 2026 — Meatball booster warning', 'July 22, 2026 — Meatball booster urgent warning',
      'July 28, 2026 — Meatball booster final warning', 'July 29, 2026 — Meatball booster DEADLINE',
      'September 15, 2026 — Tiki booster planning warning', 'October 1, 2026 — Tiki booster urgent warning',
      'October 13, 2026 — Tiki booster final warning', 'October 14, 2026 — Tiki booster DEADLINE',
    ],
  },
};
