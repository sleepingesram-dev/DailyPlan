# ⛩ Esram_OS — Japan Prep Arc

A self-updating daily command center, built from the **Esram OS v1** operating system doc.
Not a motivational journal. You open it, it tells you the next visible instruction, you do it,
free time unlocks. Japan (~2028, SSW construction route) keeps moving in the background.

**Zero build step, zero dependencies.** One HTML page + vanilla JS. Works offline, installs
to a phone home screen as an app, and stores everything locally on the device.

## What it does on its own (the "auto" part)

- **Auto day modes** — Mon–Thu loads *School Day*, Fri/Sat loads *Build Day*, Sunday loads
  *Sunday Reset*. One tap drops into *Bad Day Mode* (damage control, not failure).
- **Auto daily reset** — at midnight a fresh mission checklist is generated; yesterday is
  archived for streaks and the weekly review. No punishment arc for missed days.
- **Auto win detection** — the 6 win conditions check themselves as you finish blocks;
  4 of 6 = day won. Bad Day list complete = day survived (counts).
- **Auto XP / levels / streaks** — every task pays XP per the OS rules
  (Spawn Point → Move-Prep Mode at 10,000 XP). Clearing the full Japanese deep block on a
  Friday triggers the +50 XP Boss Fight automatically.
- **Auto deadline escalation** — countdown chips (Meatball booster, Tiki booster, passport…)
  recolor themselves as dates approach: green → amber → red → OVERDUE.
- **24-hour impulse lock** — "Buy Later" items stay locked for 24h, then unlock showing the
  current Japan Fund balance before you decide. Skipping pays XP.
- **Sunday review auto-fill** — the weekly review answers itself from what the app tracked
  (Japanese days, Anki days, MVH consistency, ledger income/impulse) — you just correct it.
- **Auto-deploy** — every push to `main` publishes the app to GitHub Pages via Actions;
  the service worker is network-first, so installed copies pick up new versions on next load.

## The tabs

| Tab | What lives there |
|---|---|
| ⚔️ **Today** | Win conditions, Minimum Viable Human, day-mode blocks, "What do I do next?", end-of-day check, Sunday review + next-week setup |
| 💴 **Money** | Scoreboard (Japan/Emergency funds, car loan), pay-yourself calculator (20%/5%), Buy Later lock, ledger with weekly summary, 30-day money sprint |
| ⛩️ **Japan** | Days-to-Japan countdown, critical deadlines, cat import pipeline, SSW route map, all 5 master-plan phases, weekly friend sync |
| 🛠️ **Projects** | TradePass / ProtonFix / Fine Print Lab with next actions, blocker capture ("never let a project die because the next step is unclear"), brain dump |
| 📦 **More** | Stats, Trophy Room, construction skill log, construction Japanese vocab (with 日本語), "What do I do if…", calendar setup reference, backup export/import |

## Run it

- **Local:** open `index.html` in a browser. That's it.
- **Hosted:** merge to `main` → GitHub Actions deploys to GitHub Pages automatically
  (first time: Settings → Pages → Source: *GitHub Actions*, if the workflow doesn't enable it itself).
- **Phone:** open the Pages URL in Chrome → menu → *Add to Home screen*. It runs standalone
  and offline.

## Data

All state lives in `localStorage` on the device — nothing leaves it. Use **More → Export
backup** for a JSON snapshot, and **Import backup** to restore or move devices.

> Build the page. Use it ugly. Improve it on Sundays. Do not polish it into oblivion.
