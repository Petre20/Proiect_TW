// Mockup-only theme switch. Follows the system setting, remembers the choice, ?theme=dark|light forces one.
(function () {
  var d = document, r = d.documentElement, t = null;
  try { t = localStorage.getItem('wt-theme'); } catch (e) {}
  var q = /[?&]theme=(dark|light)/.exec(location.search); if (q) t = q[1];
  function apply(v) { r.setAttribute('data-theme', v); }
  apply((t ? t === 'dark' : matchMedia('(prefers-color-scheme: dark)').matches) ? 'dark' : 'light');

  var MOON = '<svg class="i moon" aria-hidden="true" viewBox="0 0 24 24"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>';
  var SUN = '<svg class="i sun" aria-hidden="true" viewBox="0 0 24 24"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>';
  var btns = [];
  function label() {
    var dark = r.getAttribute('data-theme') === 'dark';
    btns.forEach(function (b) { b.setAttribute('aria-label', dark ? 'Switch to light mode' : 'Switch to dark mode'); });
  }
  function make(cls, text) {
    var b = d.createElement('button'); b.type = 'button'; b.className = 'themetog ' + cls;
    b.innerHTML = MOON + SUN + (text ? '<span class="tt-text"></span>' : '');
    b.addEventListener('click', function () {
      var v = r.getAttribute('data-theme') === 'dark' ? 'light' : 'dark'; apply(v);
      try { localStorage.setItem('wt-theme', v); } catch (e) {}
      label(); text && texts();
    });
    btns.push(b); return b;
  }
  function texts() {
    var dark = r.getAttribute('data-theme') === 'dark';
    [].forEach.call(d.querySelectorAll('.tt-text'), function (s) { s.textContent = dark ? 'Light mode' : 'Dark mode'; });
  }
  d.addEventListener('DOMContentLoaded', function () {
    if (d.getElementById('themeBtn')) return;
    var rail = d.querySelector('.rail'), bar = d.querySelector('.topbar'), solo = d.querySelector('main.auth,main.ob');
    if (rail && !solo) { var me = rail.querySelector('.me'); rail.insertBefore(make('in-rail', true), me); }
    if (bar && !solo) {
      var av = bar.querySelector('.avatar'), w = d.createElement('div'); w.className = 'tt-wrap';
      bar.insertBefore(w, av); w.appendChild(make('in-bar')); w.appendChild(av);
    }
    if (solo || (!rail && !bar)) d.body.appendChild(make('fixed'));
    label(); texts();
  });
  window.addEventListener('storage', function (e) { if (e.key === 'wt-theme' && e.newValue) { apply(e.newValue); label(); texts(); } });
})();
