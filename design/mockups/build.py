#!/usr/bin/env python3
"""Generates the static WellTrack direction mockups. Run: python3 build.py"""
from pathlib import Path

OUT = Path(__file__).parent

SPRITE = """<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs>
<symbol id="home" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="9" rx="1"/><rect x="14" y="3" width="7" height="5" rx="1"/><rect x="14" y="12" width="7" height="9" rx="1"/><rect x="3" y="16" width="7" height="5" rx="1"/></symbol>
<symbol id="habit" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></symbol>
<symbol id="activity" viewBox="0 0 24 24"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></symbol>
<symbol id="goal" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></symbol>
<symbol id="stats" viewBox="0 0 24 24"><path d="M3 3v18h18"/><path d="M18 17V9"/><path d="M13 17V5"/><path d="M8 17v-3"/></symbol>
<symbol id="learn" viewBox="0 0 24 24"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></symbol>
<symbol id="transfer" viewBox="0 0 24 24"><path d="m21 16-4 4-4-4"/><path d="M17 20V4"/><path d="m3 8 4-4 4 4"/><path d="M7 4v16"/></symbol>
<symbol id="flame" viewBox="0 0 24 24"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></symbol>
<symbol id="plus" viewBox="0 0 24 24"><path d="M5 12h14"/><path d="M12 5v14"/></symbol>
<symbol id="minus" viewBox="0 0 24 24"><path d="M5 12h14"/></symbol>
<symbol id="check" viewBox="0 0 24 24"><path d="M20 6 9 17l-5-5"/></symbol>
<symbol id="more" viewBox="0 0 24 24"><circle cx="5" cy="12" r="1.2"/><circle cx="12" cy="12" r="1.2"/><circle cx="19" cy="12" r="1.2"/></symbol>
<symbol id="user" viewBox="0 0 24 24"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></symbol>
<symbol id="search" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></symbol>
<symbol id="x" viewBox="0 0 24 24"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></symbol>
<symbol id="chev" viewBox="0 0 24 24"><path d="m9 18 6-6-6-6"/></symbol>
<symbol id="eye" viewBox="0 0 24 24"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></symbol>
<symbol id="alert" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M12 8v4"/><path d="M12 16h.01"/></symbol>
<symbol id="logout" viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="m16 17 5-5-5-5"/><path d="M21 12H9"/></symbol>
<symbol id="trophy" viewBox="0 0 24 24"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></symbol>
</defs></svg>"""

LOGO = ('<svg width="34" height="34" viewBox="0 0 32 32" aria-hidden="true"><rect width="32" height="32" rx="10" fill="#D8F45A"/>'
        '<path d="M9 24V11M23 24V11M7 12.5h18M7 18.5h18" stroke="#0F3D2E" stroke-width="3" stroke-linecap="round"/></svg>')


def ico(name, cls="i"):
    return f'<svg class="{cls}" aria-hidden="true"><use href="#{name}"/></svg>'


NAV = [("dashboard", "Dashboard", "home"), ("activities", "Activities", "activity"), ("habits", "Habits", "habit"),
       ("goals", "Goals", "goal"), ("statistics", "Statistics", "stats"), ("learn", "Learn", "learn"),
       ("import", "Import / Export", "transfer")]
MORE_GROUP = {"more", "activities", "statistics", "learn", "import"}


def shell(title, active, body, *, tabbar=True, head="", script="", lang_desc="WellTrack"):
    rail = "".join(
        f'<a class="nav" href="{k}.html"{" aria-current=\"page\"" if k == active else ""}>{ico(i)}{n}</a>'
        for k, n, i in NAV)
    def tab(href, key, label, icon):
        cur = ' aria-current="page"' if (active == key or (key == "more" and active in MORE_GROUP)) else ""
        return f'<a href="{href}"{cur}>{ico(icon)}<span>{label}</span></a>'
    tb = ""
    if tabbar:
        tb = ('<nav class="tabbar" aria-label="Main">' + tab("dashboard.html", "dashboard", "Home", "home")
              + tab("habits.html", "habits", "Habits", "habit")
              + f'<a class="fab" href="log.html" aria-label="Log activity">{ico("plus")}</a>'
              + tab("goals.html", "goals", "Goals", "goal") + tab("more.html", "more", "More", "more") + "</nav>")
    return f"""<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<meta name="theme-color" content="#0F3D2E"><title>{title} · WellTrack</title>
<link rel="stylesheet" href="globals.css">{head}</head><body>
{SPRITE}
<div class="app">
<aside class="rail" aria-label="Sidebar"><a class="brand" href="dashboard.html">{LOGO}WellTrack</a>{rail}
<a class="me" href="profile.html"><span class="avatar" aria-hidden="true">AP</span>Ana Popescu</a></aside>
<div class="main">
<header class="topbar"><a class="brand" href="dashboard.html">{LOGO}WellTrack</a><a class="avatar" href="more.html" aria-label="Ana Popescu, account">AP</a></header>
{body}
</div></div>{tb}
<script src="app.js"></script>{script}</body></html>"""


def tick(state, label, today=False):
    """state: x done, o pending, . missed, - not scheduled"""
    if state == "-":
        return f'<button class="tick off" disabled aria-label="{label}, not scheduled"></button>'
    pressed = "true" if state == "x" else "false"
    return f'<button class="tick" aria-pressed="{pressed}" aria-label="{label}">{ico("check")}</button>'


DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
D1 = ["M", "T", "W", "T", "F", "S", "S"]

HABITS = [
    ("Drink 8 glasses", "Every day", "xxxxxxx", 12),
    ("10-minute stretch", "Every day", "xxx.xxx", 9),
    ("Read 20 pages", "Every day", "xx.xx.x", 5),
    ("Walk to campus", "Mon to Fri", "xxxxx--", 21),
    ("Meal prep", "Sundays", "------o", 4),
    ("Sleep by 23:30", "Every day", "xx.xxxo", 3),
]


def hweek(states, name):
    cells = ""
    for i, s in enumerate(states):
        cls = ' class="today"' if i == 6 else ""
        cells += f'<div{cls}><span class="dlab{" today" if i == 6 else ""}">{D1[i]}</span>{tick(s, f"{name} on {DAYS[i]}")}</div>'
    return f'<div class="hweek">{cells}</div>'


def streak(n):
    return f'<span class="streak">{ico("flame")}{n}<span class="sr"> day streak</span></span>'


def lane(done, total, title, sub, pct, foot=True):
    hs = "".join(f'<div class="hurdle {"c" if i < done else "n"}"><i>{i + 1}</i></div>' for i in range(total))
    f = (f'<div class="lane-foot"><span><b class="num">214</b> active min</span><span><b class="num">18.4</b> km</span>'
         f'<span>{ico("flame")}<b class="num">12</b> day streak</span></div>') if foot else ""
    return (f'<section class="lane on-ink" aria-label="Weekly goal"><h2>{title}</h2><p>{sub}</p>'
            f'<div class="bib num" aria-label="{pct} percent">{pct}%</div>'
            f'<div class="track" style="--n:{total}">{hs}</div>{f}</section>')


def minutes_chart(prev=True):
    cur = [45, 30, 55, 0, 42, 42, 0]
    old = [30, 0, 40, 35, 0, 25, 38]
    cols = ""
    for i, (c, o) in enumerate(zip(cur, old)):
        now = " now" if i == 6 else ""
        pv = f'<i class="prev" style="height:{o / 60 * 100:.0f}%;position:absolute;bottom:0;left:50%;transform:translateX(-50%);width:100%;max-width:34px;z-index:0"></i>' if prev else ""
        main = f'<i class="{now.strip()}" style="height:{c / 60 * 100:.0f}%;position:relative;z-index:1;{"opacity:.96" if c else ""}"></i>' if c else ""
        cols += f"<div>{pv}{main}</div>"
    labs = "".join(f'<span{" class=today" if i == 6 else ""}>{d}</span>' for i, d in enumerate(DAYS))
    return f'<div class="bars" role="img" aria-label="Active minutes per day this week: 45, 30, 55, 0, 42, 42, 0">{cols}</div><div class="days">{labs}</div>'


def act_item(chip_cls, kind, when, meta):
    return (f'<div class="act"><div class="top"><span class="chip {chip_cls}">{kind}</span><span class="muted small">{when}</span></div>'
            f'<div class="meta num">{meta}</div></div>')


# ------------------------------------------------------------------ pages
def dashboard(comeback=False):
    habits_today = [("Drink 8 glasses", "x", 12), ("10-minute stretch", "x", 9), ("Read 20 pages", "x", 5),
                    ("Meal prep", "o", 4), ("Sleep by 23:30", "o", 3)]
    if comeback:
        habits_today = [("Drink 8 glasses", "o", 0), ("10-minute stretch", "o", 0), ("Sleep by 23:30", "o", 0)]
    hrows = "".join(
        f'<div>{tick(s, n)}<div class="grow"><div class="t">{n}</div></div>{streak(k) if k else ""}</div>'
        for n, s, k in habits_today)
    done = sum(1 for _, s, _ in habits_today if s == "x")
    if comeback:
        top = ('<section class="lane on-ink" aria-label="Comeback"><h2>A short one counts too</h2>'
               '<p>3 days since your last workout. Your week is still open.</p>'
               '<div class="track" style="--n:6">' + "".join('<div class="hurdle n"><i>' + str(i + 1) + '</i></div>' for i in range(6)) + '</div>'
               '<div class="pillrow" style="margin-top:1rem"><a class="btn sm" href="log.html">Log a short one</a>'
               '<button class="btn sm line" style="--fg:var(--foreground)">10-min walk</button><button class="btn sm line">5-min stretch</button></div></section>')
        sub = "Tuesday 2 December. No pressure."
    else:
        top = lane(5, 6, "5 of 6 workouts", "One more session finishes the week.", 83)
        sub = "Sunday 29 November. 3 of 5 habits done today."
    recent = (act_item("c-run", "Running", "Saturday", "42 min · 6.2 km") + act_item("c-swm", "Swimming", "Friday", "42 min")
              + act_item("c-cyc", "Cycling", "Wednesday", "55 min · 12.2 km"))
    body = f"""<main class="page" id="main">
<div class="pagehead"><div><h1>Good evening, Ana</h1><p>{sub}</p></div>
<a class="btn only-desk" href="log.html">{ico("plus")}Log activity</a></div>
{top}
<div class="cols two">
 <div style="display:grid;gap:1rem;align-content:start">
  <section class="card" aria-labelledby="th"><div class="hd"><h2 id="th">Today's habits</h2><span class="muted small num" data-count="{done}/{len(habits_today)}">{done} of {len(habits_today)} done</span></div>
   <div class="rows">{hrows}</div></section>
  <section class="card" aria-labelledby="ra"><div class="hd"><h2 id="ra">Recent</h2><a href="activities.html">See all</a></div>{recent}</section>
 </div>
 <div style="display:grid;gap:1rem;align-content:start">
  <section class="card" aria-labelledby="mm"><div class="hd"><h2 id="mm">Active minutes</h2><span class="small muted">vs last week</span></div>{minutes_chart()}</section>
  <section class="card" aria-labelledby="gg"><div class="hd"><h2 id="gg">Goals</h2><a href="goals.html">Manage</a></div>
   <div class="rows">
    <div style="display:grid;gap:.45rem;align-items:stretch"><div style="display:flex;justify-content:space-between;gap:.5rem"><span class="t">Run 30 km in November</span><span class="num muted small">15.1 / 30 km</span></div><div class="bar" role="progressbar" aria-valuenow="50" aria-valuemin="0" aria-valuemax="100"><i style="width:50%"></i></div></div>
    <div style="display:grid;gap:.45rem;align-items:stretch"><div style="display:flex;justify-content:space-between;gap:.5rem"><span class="t">Yoga 8 times</span><span class="num muted small">5 / 8</span></div><div class="bar"><i style="width:62%"></i></div></div>
    <div style="display:grid;gap:.45rem;align-items:stretch"><div style="display:flex;justify-content:space-between;gap:.5rem"><span class="t">Active 150 min a week</span><span class="chip" style="background:var(--sun);color:var(--sun-foreground)">Reached</span></div><div class="bar volt"><i style="width:100%"></i></div></div>
   </div></section>
 </div>
</div></main>"""
    return shell("Dashboard", "dashboard", body)


def habits():
    head_days = "".join(f"<span>{d}</span>" for d in DAYS)
    rows = ""
    for n, f, st, k in HABITS:
        done = st.count("x")
        sched = len(st) - st.count("-")
        rows += (f'<div class="habit"><div class="hh"><div class="grow"><div class="t">{n}</div>'
                 f'<div class="muted small">{f} · <span class="num">{done}/{sched}</span> this week</div></div>{streak(k)}</div>{hweek(st, n)}</div>')
    form = f"""<aside class="sheet" id="new" aria-labelledby="nh"><h2 id="nh">New habit</h2>
<div class="field"><label for="hn">Name</label><input class="input" id="hn" placeholder="e.g. Drink 8 glasses"></div>
<div class="field"><label id="fq">How often</label><div class="seg" role="group" aria-labelledby="fq"><button aria-pressed="false">Every day</button><button aria-pressed="true">Specific days</button></div></div>
<div class="field"><label id="wd">Days</label><div class="pillrow" role="group" aria-labelledby="wd">{"".join(f'<button class="pillbtn" aria-pressed="{"true" if i < 5 else "false"}">{d}</button>' for i, d in enumerate(DAYS))}</div></div>
<div style="display:flex;gap:.7rem;margin-top:1.2rem"><button class="btn go" style="flex:1">Create habit</button><button class="btn line">Cancel</button></div></aside>"""
    body = f"""<main class="page" id="main">
<div class="pagehead"><div><h1>Habits</h1><p>Tap a day to tick it off. 24 of 36 done this week.</p></div>
<div style="display:flex;gap:.6rem"><button class="btn line sm">Show archived</button><a class="btn sm" href="#new">{ico("plus")}New habit</a></div></div>
<div class="cols sidepanel"><section class="card" aria-label="Week grid">
<div class="hhead only-desk">{head_days}</div>{rows}</section>{form}</div></main>"""
    css = """<style>
.habit{padding:.9rem 0}
.hweek>div{display:grid;gap:.25rem;padding:4px 3px}
.hweek>div.today{background:rgba(216,244,90,.45);border-radius:14px}
.hweek .dlab{text-align:center;font-size:.75rem;font-weight:800;color:var(--muted-foreground)}
.hhead{display:none}
@media(min-width:1024px){
 .habit{grid-template-columns:260px 1fr;align-items:center;display:grid;gap:1rem}
 .hweek .dlab{display:none}
 .hhead{display:grid;grid-template-columns:260px 1fr;gap:1rem;margin-bottom:.2rem}
 .hhead{padding-left:0}
 .hhead::after{content:none}
 .hhead{grid-template-columns:260px repeat(7,1fr)}
 .hhead span{text-align:center;font-weight:800;font-size:.8125rem;color:var(--muted-foreground)}
 .hhead span:first-child{grid-column:2}
}
</style>"""
    return shell("Habits", "habits", body, head=css)


def activities(empty=False):
    chips = "".join(f'<button class="pillbtn" aria-pressed="{"true" if i == 0 else "false"}" style="flex:none">{t}</button>'
                    for i, t in enumerate(["All", "Running", "Cycling", "Swimming", "Yoga", "Gym"]))
    if empty:
        body = f"""<main class="page" id="main"><div class="pagehead"><div><h1>Activities</h1><p>Everything you log shows up here.</p></div></div>
<section class="card" style="text-align:center;padding:2rem 1.2rem">
<svg width="220" height="96" viewBox="0 0 220 96" role="img" aria-label="Six empty hurdles on a track" style="margin:0 auto 1rem;display:block"><path d="M4 80h212" stroke="#0F3D2E" stroke-width="4" stroke-linecap="round"/>
{"".join(f'<g transform="translate({14 + i * 34} 0)"><path d="M3 80V46M23 80V46M0 48h26" stroke="#97B424" stroke-width="5" stroke-linecap="round" fill="none"/></g>' for i in range(6))}</svg>
<h2>Your first hurdle is waiting</h2><p class="muted" style="max-width:34ch;margin:.5rem auto 1.4rem">Log a workout in under a minute, or bring your history in from a CSV file.</p>
<div style="display:grid;gap:.9rem;max-width:320px;margin:0 auto"><a class="btn" href="log.html">{ico("plus")}Log activity</a><a class="btn line" href="import.html">Import from CSV</a></div></section></main>"""
        return shell("Activities", "activities", body)
    rows_mob = (act_item("c-run", "Running", "Sat 28 Nov", "42 min · 6.2 km · Moderate") + act_item("c-swm", "Swimming", "Fri 27 Nov", "42 min · Hard")
                + act_item("c-cyc", "Cycling", "Wed 25 Nov", "55 min · 12.2 km · Moderate") + act_item("c-yog", "Yoga", "Tue 24 Nov", "30 min · Light")
                + act_item("c-gym", "Gym", "Mon 23 Nov", "45 min · Hard") + act_item("c-run", "Running", "Sat 21 Nov", "38 min · 5.4 km · Moderate"))
    def tr(chip, kind, d, dur, dist, inten, notes):
        return f'<tr><td class="num">{d}</td><td><span class="chip {chip}">{kind}</span></td><td class="num">{dur}</td><td class="num">{dist}</td><td>{inten}</td><td class="muted">{notes}</td><td><button class="btn ghost" aria-label="Edit {kind} on {d}">Edit</button></td></tr>'
    table = ('<table class="table"><thead><tr><th>Date</th><th>Type</th><th>Duration</th><th>Distance</th><th>Intensity</th><th>Notes</th><th></th></tr></thead><tbody>'
             + tr("c-run", "Running", "Sat 28 Nov", "42 min", "6.2 km", "Moderate", "Along the river") + tr("c-swm", "Swimming", "Fri 27 Nov", "42 min", "n/a", "Hard", "Intervals")
             + tr("c-cyc", "Cycling", "Wed 25 Nov", "55 min", "12.2 km", "Moderate", "") + tr("c-yog", "Yoga", "Tue 24 Nov", "30 min", "n/a", "Light", "Morning flow")
             + tr("c-gym", "Gym", "Mon 23 Nov", "45 min", "n/a", "Hard", "Legs") + tr("c-run", "Running", "Sat 21 Nov", "38 min", "5.4 km", "Moderate", "") + '</tbody></table>')
    body = f"""<main class="page" id="main">
<div class="pagehead"><div><h1>Activities</h1><p class="num">42 sessions logged</p></div>
<div style="display:flex;gap:.6rem" class="only-desk"><a class="btn line sm" href="import.html">Import / Export</a><a class="btn sm" href="log.html">{ico("plus")}Log activity</a></div></div>
<div class="cols sidepanel"><section class="card" aria-label="Activity list">
<div style="display:grid;gap:.7rem;margin-bottom:.8rem"><div style="position:relative"><input class="input" placeholder="Search notes" aria-label="Search notes" style="padding-left:2.8rem"><span style="position:absolute;left:.9rem;top:15px;color:var(--muted-foreground)">{ico("search")}</span></div>
<div class="pillrow" style="flex-wrap:nowrap;overflow-x:auto;padding-bottom:.4rem;margin:0 -.2rem" role="group" aria-label="Filter by type">{chips}</div></div>
<div class="only-mob">{rows_mob}</div><div class="only-desk">{table}</div>
<div style="display:flex;justify-content:space-between;align-items:center;margin-top:1rem"><button class="btn line sm" disabled>Previous</button><span class="muted small num">Page 1 of 5</span><button class="btn line sm">Next</button></div></section>
<aside class="sheet only-desk" aria-labelledby="eh"><h2 id="eh">Edit activity</h2>{log_form(compact=True)}</aside></div></main>"""
    return shell("Activities", "activities", body)


def log_form(error=False, compact=False):
    types = [("Running", "c-run"), ("Cycling", "c-cyc"), ("Swimming", "c-swm"), ("Yoga", "c-yog"), ("Gym", "c-gym"), ("Walking", "c-wlk")]
    tiles = "".join(
        f'<button class="pillbtn" aria-pressed="{"true" if i == 0 else "false"}" style="min-height:56px;display:grid;place-items:center">{t}</button>'
        for i, (t, _) in enumerate(types))
    dur_attr = ' aria-invalid="true" aria-describedby="de" value="900"' if error else ' value="42"'
    dur_err = f'<span class="err" id="de">{ico("alert")}Enter a duration between 1 and 600 minutes.</span>' if error else ""
    return f"""<form onsubmit="return false">
<div class="field"><label id="tl">Type</label><div class="pillrow" style="display:grid;grid-template-columns:repeat(3,1fr)" role="group" aria-labelledby="tl">{tiles}</div></div>
<div style="display:grid;grid-template-columns:1fr 1fr;gap:.8rem"><div class="field"><label for="dt">Date</label><input class="input" id="dt" type="date" value="2026-11-29"></div>
<div class="field"><label for="st">Start time <span class="muted small">optional</span></label><input class="input" id="st" type="time" value="18:30"></div></div>
<div style="display:grid;grid-template-columns:1fr 1fr;gap:.8rem"><div class="field"><label for="du">Duration (min)</label><input class="input num" id="du" inputmode="numeric"{dur_attr}>{dur_err}</div>
<div class="field"><label for="di">Distance (km) <span class="muted small">optional</span></label><input class="input num" id="di" inputmode="decimal" value="6.2"></div></div>
<div class="field"><label id="il">Intensity</label><div class="seg" role="group" aria-labelledby="il"><button type="button" aria-pressed="false">Light</button><button type="button" aria-pressed="true">Moderate</button><button type="button" aria-pressed="false">Hard</button></div></div>
<div class="field"><label for="nt">Notes</label><textarea class="input" id="nt" rows="2" placeholder="How did it feel?"></textarea></div>
<div style="display:grid;gap:.8rem"><button class="btn go block">Save activity</button>{'<button type="button" class="btn danger block">Delete activity</button>' if compact else ''}</div></form>"""


def log_page():
    body = f"""<main class="page" id="main" style="max-width:560px;margin:0 auto;padding-bottom:2rem">
<div style="display:flex;align-items:center;justify-content:space-between;padding:.3rem 0"><h1>Log activity</h1><a class="btn ghost" href="dashboard.html" aria-label="Close">{ico("x")}</a></div>
<div class="banner bad" role="alert">{ico("alert")}<div>One thing to fix before saving: the duration is too long.</div></div>
<div class="card">{log_form(error=True)}</div></main>"""
    return shell("Log activity", "log", body, tabbar=False)


def goals():
    def goal(title, a, b, unit, pct, status, reached=False):
        chip = (f'<span class="chip" style="background:var(--sun);color:var(--sun-foreground)">{ico("trophy").replace("class=\"i\"", "class=\"i\" style=\"width:15px;height:15px\"")}Reached</span>' if reached
                else f'<span class="chip c-wlk">{status}</span>')
        return (f'<article class="card" style="display:grid;gap:.7rem"><div style="display:flex;justify-content:space-between;gap:.6rem;align-items:start"><h3>{title}</h3>{chip}</div>'
                f'<div><span class="num" style="font:800 1.75rem var(--font-display)">{a}</span><span class="muted num"> / {b} {unit}</span></div>'
                f'<div class="bar {"volt" if reached else ""}" role="progressbar" aria-valuenow="{pct}" aria-valuemin="0" aria-valuemax="100"><i style="width:{pct}%"></i></div></article>')
    form = f"""<aside class="sheet" aria-labelledby="gh"><h2 id="gh">New goal</h2>
<div class="field"><label for="gn">Name</label><input class="input" id="gn" value="Swim 4 hours in December"></div>
<div class="field"><label for="ga">Counts</label><select class="input" id="ga"><option>Swimming</option><option>Running</option><option>Any activity</option></select></div>
<div style="display:grid;grid-template-columns:1fr 1fr;gap:.8rem"><div class="field"><label for="gt">Target</label><input class="input num" id="gt" value="4"></div><div class="field"><label for="gu">Unit</label><select class="input" id="gu"><option>hours</option><option>km</option><option>sessions</option></select></div></div>
<div class="field"><label id="gp">Period</label><div class="seg" role="group" aria-labelledby="gp"><button aria-pressed="false">Weekly</button><button aria-pressed="true">Monthly</button><button aria-pressed="false">Custom</button></div></div>
<button class="btn go block" style="margin-top:.4rem">Create goal</button></aside>"""
    body = f"""<main class="page" id="main">
<div class="pagehead"><div><h1>Goals</h1><p>1 reached this week. Two in progress.</p></div><a class="btn sm" href="#ng">{ico("plus")}New goal</a></div>
<div class="seg" role="tablist" aria-label="Filter goals" style="max-width:420px"><button role="tab" aria-selected="true">Active</button><button role="tab" aria-selected="false">Completed</button><button role="tab" aria-selected="false">All</button></div>
<div class="cols sidepanel"><div style="display:grid;gap:1rem">
{goal("Active 150 min a week", "214", "150", "min", 100, "", True)}{goal("Run 30 km in November", "15.1", "30", "km", 50, "Behind: 2 runs to catch up")}{goal("Yoga 8 times", "5", "8", "sessions", 62, "On pace")}
</div><div id="ng">{form}</div></div></main>"""
    return shell("Goals", "goals", body)


def statistics():
    kinds = [("Running", "c-run", 38, "3 h 20 min"), ("Cycling", "c-cyc", 26, "2 h 15 min"), ("Gym", "c-gym", 20, "1 h 45 min"), ("Swimming", "c-swm", 10, "50 min"), ("Yoga", "c-yog", 6, "30 min")]
    krows = "".join(f'<div style="display:grid;gap:.35rem"><div style="display:flex;justify-content:space-between"><span class="chip {c}">{k}</span><span class="num muted small">{t}</span></div><div class="bar"><i style="width:{p * 2}%"></i></div></div>' for k, c, p, t in kinds)
    def cmp(label, a, b, d):
        return f'<div style="display:flex;justify-content:space-between;align-items:baseline;gap:1rem"><span class="t">{label}</span><span class="num"><b>{a}</b> <span class="muted small">vs {b}</span> <span class="chip c-wlk">{d}</span></span></div>'
    goals8 = [1, 2, 1, 3, 2, 2, 3, 4]
    g8 = "".join(f'<div style="display:flex;flex-direction:column;justify-content:flex-end;align-items:center;height:100%"><i style="display:block;width:100%;max-width:30px;height:{v * 24}px;border-radius:8px 8px 0 0;background:{"var(--volt)" if i == 7 else "var(--go)"};{"box-shadow:inset 0 -4px 0 var(--volt-edge)" if i == 7 else ""}"></i></div>' for i, v in enumerate(goals8))
    lv = {1: 0, 2: 2, 3: 3, 4: 0, 5: 2, 6: 4, 7: 1, 8: 0, 9: 3, 10: 2, 11: 0, 12: 4, 13: 2, 14: 3, 15: 0, 16: 1, 17: 3, 18: 3, 19: 0, 20: 2, 21: 4, 22: 0, 23: 3, 24: 2, 25: 4, 26: 0, 27: 3, 28: 3, 29: 0}
    cells = '<i class="pad"></i>' * 6 + "".join(f'<i class="{"l" + str(lv[d]) if lv.get(d) else ""}">{d}</i>' for d in range(1, 30))
    body = f"""<main class="page" id="main">
<div class="pagehead"><div><h1>Statistics</h1><p>Your week against the one before.</p></div>
<div class="seg" role="tablist" aria-label="Period" style="min-width:220px"><button role="tab" aria-selected="true">Week</button><button role="tab" aria-selected="false">Month</button></div></div>
<div class="cols two"><div style="display:grid;gap:1rem;align-content:start">
<section class="card" aria-labelledby="s1"><div class="hd"><h2 id="s1">Active minutes</h2><span class="small muted"><span style="display:inline-block;width:10px;height:10px;border-radius:3px;background:var(--go)"></span> this week &nbsp;<span style="display:inline-block;width:10px;height:10px;border-radius:3px;background:var(--border)"></span> last week</span></div>{minutes_chart()}</section>
<section class="card" aria-labelledby="s2"><h2 id="s2" style="margin-bottom:.9rem">This week vs last</h2><div style="display:grid;gap:.9rem">{cmp("Active minutes", "214", "168", "+27%")}{cmp("Sessions", "5", "4", "+1")}{cmp("Distance", "18.4 km", "11.0 km", "+7.4 km")}</div></section>
<section class="card" aria-labelledby="s3"><h2 id="s3" style="margin-bottom:.9rem">Goals reached, last 8 weeks</h2><div style="display:grid;grid-template-columns:repeat(8,1fr);gap:.5rem;height:110px;border-bottom:3px solid var(--brand-ink)">{g8}</div></section>
</div><div style="display:grid;gap:1rem;align-content:start">
<section class="card" aria-labelledby="s4"><h2 id="s4" style="margin-bottom:.9rem">Time by activity</h2><div style="display:grid;gap:1rem">{krows}</div></section>
<section class="card" aria-labelledby="s5"><div class="hd"><h2 id="s5">November</h2><span class="small muted">Darker means more minutes</span></div>
<div class="heat" style="margin-bottom:.4rem">{"".join(f'<span class="small muted" style="text-align:center;font-weight:700">{d}</span>' for d in D1)}</div><div class="heat" role="img" aria-label="Calendar of active minutes in November">{cells}</div></section>
</div></div></main>"""
    return shell("Statistics", "statistics", body)


def more():
    def item(href, icon, label, sub=""):
        return f'<a class="row-link" href="{href}">{ico(icon)}<span class="grow"><b>{label}</b>{f"<br><span class=muted>{sub}</span>" if sub else ""}</span>{ico("chev")}</a>'
    body = f"""<main class="page" id="main"><div class="pagehead"><div><h1>More</h1></div></div>
<section class="card" style="padding:.4rem 1.1rem"><div class="rows">
{item("activities.html", "activity", "Activities", "42 sessions logged")}{item("statistics.html", "stats", "Statistics", "Week and month")}{item("learn.html", "learn", "Learn", "Articles picked for running and routines")}{item("import.html", "transfer", "Import / Export", "CSV")}{item("profile.html", "user", "Profile and settings")}
</div></section>
<a class="btn danger block" href="login.html" style="margin-top:.4rem">{ico("logout")}Log out</a></main>"""
    css = "<style>.row-link{text-decoration:none;min-height:72px}.row-link b{font-weight:800}</style>"
    return shell("More", "more", body, head=css)


def login():
    hs = "".join(f'<div class="hurdle {"c" if i < 4 else "n"}"><i>{i + 1}</i></div>' for i in range(6))
    body = f"""<main class="auth" id="main">
<section class="hero on-ink"><a class="brand" href="login.html" style="color:var(--on-brand)">{LOGO}WellTrack</a>
<h1>Clear the week.</h1><p>Log a workout in seconds, tick off today's habits, and watch your goals move.</p>
<div class="track" style="--n:6">{hs}</div></section>
<section class="formside"><div class="fcard"><h2>Welcome back</h2><p class="muted" style="margin-bottom:1.1rem">Log in to pick up where you left off.</p>
<form onsubmit="return false"><div class="field"><label for="em">Email</label><input class="input" id="em" type="email" autocomplete="email" value="ana.popescu@student.ro"></div>
<div class="field"><label for="pw">Password</label><div style="position:relative"><input class="input" id="pw" type="password" autocomplete="current-password" value="correcthorse" style="padding-right:5.2rem"><button type="button" class="btn ghost" style="position:absolute;right:.2rem;top:4px;min-height:44px;padding:0 .8rem" aria-label="Show password">{ico("eye")}</button></div></div>
<div style="display:flex;justify-content:space-between;align-items:center;margin:-.2rem 0 1.2rem;gap:1rem"><label style="display:flex;gap:.6rem;align-items:center;font-weight:600"><input type="checkbox" checked style="width:22px;height:22px"> Keep me logged in</label><a class="link small" href="#">Forgot password?</a></div>
<button class="btn block">Log in</button></form>
<div style="display:flex;align-items:center;gap:.8rem;margin:1.4rem 0;color:var(--muted-foreground);font-weight:600"><hr style="flex:1;border:0;border-top:2px solid var(--border)">or<hr style="flex:1;border:0;border-top:2px solid var(--border)"></div>
<button class="btn line block" type="button"><svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true"><path fill="#4285F4" d="M22.5 12.2c0-.8-.1-1.5-.2-2.2H12v4.2h5.9a5 5 0 0 1-2.2 3.3v2.7h3.5c2.1-1.9 3.3-4.7 3.3-8z"/><path fill="#34A853" d="M12 23c3 0 5.4-1 7.2-2.7l-3.5-2.7c-1 .7-2.2 1.1-3.7 1.1-2.9 0-5.3-1.9-6.2-4.5H2.2v2.8A11 11 0 0 0 12 23z"/><path fill="#FBBC05" d="M5.8 14.2a6.6 6.6 0 0 1 0-4.3V7.1H2.2a11 11 0 0 0 0 9.9z"/><path fill="#EA4335" d="M12 5.4c1.6 0 3.1.6 4.2 1.7l3.1-3.1A11 11 0 0 0 2.2 7.1l3.6 2.8C6.7 7.3 9.1 5.4 12 5.4z"/></svg>Continue with Google</button>
<p style="text-align:center;margin-top:1.4rem" class="muted">New to WellTrack? <a class="link" style="color:var(--foreground)" href="onboarding.html">Create an account</a></p></div></section></main>"""
    css = """<style>
.auth{min-height:100dvh;display:grid;grid-template-rows:auto 1fr}
.hero{background:var(--brand-ink);color:var(--on-brand);padding:1.2rem 1.2rem 5.2rem;border-radius:0 0 34px 34px;display:grid;gap:.9rem;align-content:start}
.hero h1{font-size:2.5rem;margin-top:1rem}.hero p{color:#C3D9CC;max-width:34ch}
.hero .track{margin-top:.8rem}.hero .hurdle{height:64px}.hero .hurdle i{width:38px;height:38px;font-size:.9rem}
.formside{padding:0 1rem 2rem;margin-top:-3.4rem}
.fcard{background:var(--card);border:2px solid var(--border);border-radius:var(--r-lg);padding:1.3rem 1.2rem;max-width:480px;margin:0 auto;box-shadow:0 18px 30px -18px rgba(15,61,46,.45)}
.rail,.topbar{display:none!important}.app{display:block!important;padding:0!important}
@media(min-width:900px){.auth{grid-template-columns:1.05fr 1fr;grid-template-rows:none}.hero{border-radius:0;padding:3rem 3.4rem;align-content:center}.hero h1{font-size:4rem}
.hero .hurdle{height:92px}.hero .hurdle i{width:54px;height:54px}.formside{margin:0;display:grid;place-items:center;padding:2rem}.fcard{box-shadow:none;padding:2rem}}
</style>"""
    return shell("Log in", "login", body, tabbar=False, head=css)


def onboarding():
    topics = ["Running", "Strength", "Habits", "Motivation", "Recovery", "Routines"]
    tp = "".join(f'<button class="pillbtn" aria-pressed="{"true" if t in ("Running", "Habits") else "false"}" style="min-height:56px">{t}</button>' for t in topics)
    hb = [("Drink 8 glasses", "Hydration", True), ("10-minute stretch", "Mobility", True), ("10-minute walk", "Move daily", False), ("Read 20 pages", "Unplug", False), ("Sleep by 23:30", "Recovery", False)]
    hrows = "".join(f'<label class="opt"><span class="grow"><b>{n}</b><br><span class="muted small">{s}</span></span><button type="button" class="tick" aria-pressed="{"true" if on else "false"}" aria-label="{n}">{ico("check")}</button></label>' for n, s, on in hb)
    body = f"""<main class="ob" id="main" data-step="1">
<header class="obtop"><div class="steps" aria-label="Progress"><i class="s on"></i><i class="s"></i><i class="s"></i><i class="s"></i><i class="s"></i></div><a class="btn ghost small" href="dashboard.html" id="skip">Skip</a></header>
<section class="step" data-n="1"><div class="art"><svg viewBox="0 0 300 150" width="100%" aria-hidden="true"><path d="M10 120h280" stroke="#0F3D2E" stroke-width="5" stroke-linecap="round"/>{"".join(f'<g transform="translate({22 + i * 46} 0)"><path d="M4 120V64M32 120V64M0 68h36" stroke="#0F3D2E" stroke-width="7" stroke-linecap="round" fill="none"/><rect x="4" y="76" width="28" height="9" rx="3" fill="{"#D8F45A" if i < 3 else "#fff"}" stroke="#0F3D2E" stroke-width="3"/></g>' for i in range(6))}</svg></div>
<h1>Welcome, Ana</h1><p class="lead">Three quick questions and your lane is ready. It takes about a minute.</p></section>
<section class="step" data-n="2" hidden><h1>What gets you moving?</h1><p class="lead">Pick a few. We'll line up Learn articles to match.</p><div class="pillrow" style="display:grid;grid-template-columns:1fr 1fr;gap:.7rem" id="topics">{tp}</div><p class="muted small" style="margin-top:.8rem">You can change this later in Profile.</p></section>
<section class="step" data-n="3" hidden><h1>Pick your starter habits</h1><p class="lead">Start small. Two is plenty.</p><div class="optlist" id="habs">{hrows}</div></section>
<section class="step" data-n="4" hidden><h1>How many workouts a week?</h1><p class="lead">Running, gym, yoga, anything you log counts.</p>
<div class="stepper"><button class="btn line" id="dec" aria-label="Fewer workouts">{ico("minus")}</button><div class="big num" id="cnt" aria-live="polite">3</div><button class="btn line" id="inc" aria-label="More workouts">{ico("plus")}</button></div>
<div class="lane on-ink" style="margin-top:1.4rem"><div class="track" id="prev" style="--n:3"></div></div></section>
<section class="step" data-n="5" hidden><div class="confetti" id="conf" aria-hidden="true"></div><h1>Your lane is ready</h1><p class="lead">Clear <b id="cn">3</b> hurdles a week and tick your habits each day.</p>
<div class="lane on-ink"><h2 style="margin-right:0;font-size:1.25rem">This week</h2><div class="track" id="fin" style="--n:3;margin-top:.8rem"></div><div class="lane-foot" id="fh"></div></div></section>
<footer class="obfoot"><button class="btn line" id="back" hidden>Back</button><button class="btn" id="next" style="flex:1">Let's go</button></footer></main>"""
    css = """<style>
.rail,.topbar{display:none!important}.app{display:block!important;padding:0!important}
.ob{max-width:560px;margin:0 auto;min-height:100dvh;display:flex;flex-direction:column;padding:1rem 1.2rem 1.4rem}
.obtop{display:flex;align-items:center;gap:1rem;padding:.4rem 0 1rem}.steps{flex:1;display:flex;gap:6px}
.steps .s{flex:1;height:10px;border-radius:9px;background:var(--border)}.steps .s.on{background:var(--brand-ink);box-shadow:0 3px 0 var(--brand-ink-edge)}
.step{flex:1;padding-top:1rem}.step h1{font-size:2rem;margin-bottom:.7rem}.lead{color:var(--muted-foreground);font-size:1.125rem;margin-bottom:1.4rem}
.art{margin:1.5rem 0 2rem}.obfoot{display:flex;gap:.8rem;padding-top:1rem;position:sticky;bottom:0;background:linear-gradient(transparent,var(--background) 28%);padding-bottom:.4rem}
.optlist{display:grid;gap:.8rem}.opt{display:flex;align-items:center;gap:1rem;background:var(--card);border:2px solid var(--border);border-radius:18px;padding:.8rem 1rem;cursor:pointer}
.stepper{display:flex;align-items:center;justify-content:center;gap:1.4rem}.stepper .btn{width:64px;padding:0}.big{font:800 4.5rem/1 var(--font-display);min-width:2ch;text-align:center}
.confetti{position:absolute;left:0;right:0;top:0;height:0;pointer-events:none}
.confetti i{position:fixed;top:-12px;width:10px;height:14px;border-radius:3px;animation:fall 1.8s var(--ease) forwards}
@keyframes fall{to{transform:translateY(105vh) rotate(540deg);opacity:.9}}
.step{position:relative}
@media(min-width:760px){.ob{padding-top:3rem}.step h1{font-size:2.6rem}}
</style>"""
    js = """<script>
(function(){
 var ob=document.querySelector('.ob'),n=1,steps=[].slice.call(document.querySelectorAll('.step')),dots=[].slice.call(document.querySelectorAll('.s')),
 next=document.getElementById('next'),back=document.getElementById('back'),cnt=3;
 function hur(el,k){el.style.setProperty('--n',k);el.innerHTML='';for(var i=0;i<k;i++){el.innerHTML+='<div class="hurdle n"><i>'+(i+1)+'</i></div>'}}
 function render(){steps.forEach(function(s){s.hidden=(+s.dataset.n!==n)});dots.forEach(function(d,i){d.classList.toggle('on',i<n)});
  back.hidden=n===1;next.textContent=n===1?"Let's go":n===5?'Go to dashboard':'Continue';
  if(n===4)hur(document.getElementById('prev'),cnt);
  if(n===5){hur(document.getElementById('fin'),cnt);document.getElementById('cn').textContent=cnt;
   var h=[].slice.call(document.querySelectorAll('#habs .tick[aria-pressed=true]')).map(function(b){return b.getAttribute('aria-label')});
   document.getElementById('fh').innerHTML=h.map(function(x){return '<span>'+x+'</span>'}).join('');
   if(!matchMedia('(prefers-reduced-motion:reduce)').matches){var c=document.getElementById('conf');c.innerHTML='';var cols=['#D8F45A','#15803D','#FFC23D','#0F3D2E','#9BD36A'];
    for(var i=0;i<46;i++){var e=document.createElement('i');e.style.left=Math.random()*100+'vw';e.style.background=cols[i%5];e.style.animationDelay=(Math.random()*.5)+'s';e.style.animationDuration=(1.4+Math.random()*1.2)+'s';c.appendChild(e)}}}}
 next.onclick=function(){if(n===5){location.href='dashboard.html';return}n++;render()};back.onclick=function(){n--;render()};
 document.getElementById('inc').onclick=function(){cnt=Math.min(7,cnt+1);document.getElementById('cnt').textContent=cnt;hur(document.getElementById('prev'),cnt)};
 document.getElementById('dec').onclick=function(){cnt=Math.max(1,cnt-1);document.getElementById('cnt').textContent=cnt;hur(document.getElementById('prev'),cnt)};
 var q=location.search.match(/step=(\\d)/);if(q){n=+q[1];render()}
})();
</script>"""
    return shell("Welcome", "onboarding", body, tabbar=False, head=css, script=js)


def simple_stub(title, active, h, p):
    body = f'<main class="page" id="main"><div class="pagehead"><div><h1>{h}</h1><p>{p}</p></div></div><section class="card"><p class="muted">Direction mockup not drawn yet.</p></section></main>'
    return shell(title, active, body)


def index():
    shots = [("landing", "Landing"), ("dashboard", "Dashboard"), ("habits", "Habits"), ("log", "Log activity"), ("goals", "Goals"), ("statistics", "Statistics"), ("activities", "Activities"),
             ("dashboard-comeback", "Comeback state"), ("activities-empty", "Empty state"), ("more", "More"), ("login", "Log in"), ("onboarding", "Onboarding")]
    ph = "".join(f'<figure><iframe src="{k}.html" title="{n} on phone" loading="lazy"></iframe><figcaption>{n}</figcaption></figure>' for k, n in shots)
    desk = "".join(f'<a class="btn line sm" href="{k}.html">{n}</a>' for k, n in shots)
    return f"""<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>WellTrack direction mockups</title>
<link rel="stylesheet" href="globals.css"><style>
body{{padding:2rem 1.2rem 4rem}}.w{{max-width:1500px;margin:0 auto}}
.phones{{display:flex;gap:28px;overflow-x:auto;padding:1.6rem 4px 2rem;scroll-snap-type:x proximity}}
figure{{flex:none;scroll-snap-align:start;display:grid;gap:.7rem;justify-items:center}}
iframe{{width:390px;height:800px;border:10px solid var(--brand-ink);border-radius:46px;background:var(--background);box-shadow:0 8px 0 #06241A,0 22px 30px -10px rgba(15,61,46,.5)}}
figcaption{{font-weight:800}}.links{{display:flex;gap:.8rem;flex-wrap:wrap;margin-top:1rem}}
</style></head><body><div class="w"><h1>WellTrack: Track and Field</h1>
<p class="muted" style="margin:.5rem 0 0;max-width:62ch">Direction mockups, mobile first. Plain HTML and CSS, throwaway; the real app is React, Tailwind and shadcn. Swipe the phones, or open any screen full size to see the desktop layout.</p>
<div class="phones">{ph}</div><h2>Open full size</h2><div class="links">{desk}</div></div></body></html>"""


PAGES = {
    "index": index(), "dashboard": dashboard(), "dashboard-comeback": dashboard(comeback=True), "habits": habits(), "activities": activities(),
    "activities-empty": activities(empty=True), "log": log_page(), "goals": goals(), "statistics": statistics(), "more": more(),
    "login": login(), "onboarding": onboarding(),
    "learn": simple_stub("Learn", "learn", "Learn", "Short articles matched to your interests."),
    "import": simple_stub("Import / Export", "import", "Import / Export", "Move your activities in and out as CSV."),
    "profile": simple_stub("Profile", "more", "Profile and settings", "Account, password and your data."),
}
for name, html in PAGES.items():
    html = html.replace('<link rel="stylesheet" href="globals.css">', '<script src="theme.js"></script><link rel="stylesheet" href="globals.css">', 1)
    (OUT / f"{name}.html").write_text(html, encoding="utf-8")
print("wrote", len(PAGES), "pages")
