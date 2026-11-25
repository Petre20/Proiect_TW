// Mockup-only interactions: toggles for ticks, pills and segmented controls.
document.addEventListener('click', function (e) {
  var t = e.target.closest('.tick[aria-pressed]');
  if (t && !t.disabled) {
    var on = t.getAttribute('aria-pressed') === 'true';
    t.setAttribute('aria-pressed', on ? 'false' : 'true');
    if (!on) { t.classList.remove('today-pop'); void t.offsetWidth; t.classList.add('today-pop'); }
    return;
  }
  var p = e.target.closest('.pillbtn[aria-pressed]');
  if (p) { p.setAttribute('aria-pressed', p.getAttribute('aria-pressed') === 'true' ? 'false' : 'true'); return; }
  var s = e.target.closest('.seg > button');
  if (s) {
    var key = s.hasAttribute('aria-selected') ? 'aria-selected' : 'aria-pressed';
    [].forEach.call(s.parentNode.children, function (b) { b.setAttribute(key, b === s ? 'true' : 'false'); });
  }
});
