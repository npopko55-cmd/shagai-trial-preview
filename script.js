/* Пробная тренировка + оплата клуба «Шагай Дома».
   Виджеты GetCourse — с официальных страниц чекаута (не Табата 3.0).
   Счётчик Метрики на этой превью-странице не устанавливается. */
(function () {
  'use strict';

  var KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'utm_referrer', 'gclid', 'yclid', 'fbclid', 'erid', 'from'];
  var DOMAIN = 'walk-walk.ru';
  var STORE = 'walkwalk_utm';
  var params = [];
  try {
    var q = new URLSearchParams(window.location.search);
    for (var i = 0; i < KEYS.length; i++) { var v = q.get(KEYS[i]); if (v) params.push([KEYS[i], v]); }
    if (params.length) sessionStorage.setItem(STORE, JSON.stringify(params));
    else params = JSON.parse(sessionStorage.getItem(STORE) || '[]');
  } catch (err) {}

  function withUtm(href) {
    if (!params.length || !href || href.indexOf(DOMAIN) === -1) return href;
    try {
      var u = new URL(href, window.location.href);
      for (var i = 0; i < params.length; i++) if (!u.searchParams.has(params[i][0])) u.searchParams.set(params[i][0], params[i][1]);
      return u.toString();
    } catch (err) { return href; }
  }
  document.addEventListener('click', function (e) {
    var a = e.target.closest ? e.target.closest('a[href*="' + DOMAIN + '"]') : null;
    if (a) a.setAttribute('href', withUtm(a.getAttribute('href')));
  }, true);
  if (params.length) {
    try {
      var pu = new URL(location.href);
      for (var k = 0; k < params.length; k++) if (!pu.searchParams.has(params[k][0])) pu.searchParams.set(params[k][0], params[k][1]);
      if (pu.href !== location.href) history.replaceState(null, '', pu.href);
    } catch (err) {}
  }

  /* ---------- Видео: YouTube embed Zevc2_CBDnk (oEmbed проверен) ---------- */
  var YT_EMBED = 'https://www.youtube-nocookie.com/embed/Zevc2_CBDnk';
  var video = document.getElementById('trialVideo');

  function playTrial(e) {
    if (e) e.preventDefault();
    var slot = document.getElementById('trial');
    if (slot && slot.scrollIntoView) slot.scrollIntoView({ behavior: 'smooth', block: 'center' });
    if (video && video.tagName === 'IFRAME') {
      try {
        if (video.src.indexOf('autoplay=1') === -1) {
          video.src = YT_EMBED + '?rel=0&playsinline=1&autoplay=1';
        }
      } catch (err) {}
    }
  }
  var trialCta = document.getElementById('trialCta');
  if (trialCta) trialCta.addEventListener('click', playTrial);
  document.addEventListener('click', function (e) {
    var a = e.target.closest ? e.target.closest('a[href="#trial"]') : null;
    if (a) playTrial(e);
  });

  /* ---------- Тарифы: переключатель + окно с виджетом GetCourse ----------
     Скрипт виджета создаётся так же, как на официальном чекауте:
     <script id="{sid}" src="https://my.walk-walk.ru/pl/lite/widget/script?id={widget}">
     и запускается событием StartWidget{sid}. */
  var terms = document.querySelectorAll('#termsBox .term');
  var pay = document.getElementById('payBox');
  var dlg = document.getElementById('payDlg');
  var win = dlg ? dlg.querySelector('.paydlg__win') : null;
  var dlgTitle = document.getElementById('payDlgTitle');
  var openBtn = document.getElementById('payOpen');
  var NB = '\u00a0';
  var chosen = null, lastFocus = null;

  function slotFor(btn) {
    var sid = btn.getAttribute('data-sid');
    var slot = document.getElementById('slot-' + sid);
    if (slot) return slot;
    slot = document.createElement('div');
    slot.className = 'pay__slot';
    slot.id = 'slot-' + sid;
    pay.appendChild(slot);
    var s = document.createElement('script');
    s.id = sid;
    s.src = 'https://my.walk-walk.ru/pl/lite/widget/script?id=' + btn.getAttribute('data-widget');
    s.onload = function () {
      var ev;
      try { ev = new Event('StartWidget' + sid); } catch (err) { ev = document.createEvent('Event'); ev.initEvent('StartWidget' + sid, true, true); }
      document.dispatchEvent(ev);
    };
    slot.appendChild(s);
    return slot;
  }
  function isOpen() { return dlg && !dlg.hidden; }
  function showSlot() {
    if (!pay || !chosen) return;
    var slot = slotFor(chosen);
    var slots = pay.querySelectorAll('.pay__slot');
    for (var j = 0; j < slots.length; j++) slots[j].hidden = slots[j] !== slot;
    if (dlgTitle) dlgTitle.textContent = 'Абонемент на' + NB + chosen.getAttribute('data-term').replace(' ', NB);
  }
  function select(btn) {
    chosen = btn;
    for (var i = 0; i < terms.length; i++) {
      var on = terms[i] === btn;
      terms[i].classList.toggle('is-on', on);
      terms[i].setAttribute('aria-checked', on ? 'true' : 'false');
      terms[i].setAttribute('tabindex', on ? '0' : '-1');
    }
    if (openBtn) openBtn.setAttribute('data-goal', 'pay-open-' + btn.getAttribute('data-goal').replace('buy-', ''));
    var sum = document.getElementById('paySum');
    if (sum && btn.getAttribute('data-price')) sum.textContent = btn.getAttribute('data-price').replace(/&nbsp;/g, NB);
    var termLabel = document.getElementById('payTerm');
    if (termLabel) termLabel.textContent = btn.getAttribute('data-term').replace(' ', NB);
    var inst = document.getElementById('payInst');
    if (inst && btn.getAttribute('data-inst')) {
      inst.innerHTML = 'Доступна рассрочка: 6' + NB + 'платежей по' + NB + btn.getAttribute('data-inst').replace(/\B(?=(\d{3})+$)/, NB) + NB + '₽';
    }
    if (isOpen()) showSlot();
  }
  for (var t = 0; t < terms.length; t++) {
    terms[t].addEventListener('click', function () { select(this); });
    terms[t].addEventListener('keydown', function (e) {
      var list = Array.prototype.slice.call(terms), idx = list.indexOf(this), to = -1;
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') to = (idx + 1) % list.length;
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') to = (idx - 1 + list.length) % list.length;
      if (to > -1) { e.preventDefault(); select(list[to]); list[to].focus(); }
    });
  }
  var current = document.querySelector('#termsBox .term.is-on') || terms[0];
  if (current) select(current);

  var FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), iframe, [tabindex]:not([tabindex="-1"])';
  function focusables() {
    return Array.prototype.filter.call(win.querySelectorAll(FOCUSABLE), function (el) {
      return el.offsetWidth || el.offsetHeight || el.getClientRects().length;
    });
  }
  function openDlg() {
    if (!dlg || !chosen) return;
    lastFocus = document.activeElement;
    showSlot();
    dlg.hidden = false;
    document.documentElement.classList.add('is-locked');
    win.focus();
  }
  function closeDlg() {
    if (!isOpen()) return;
    dlg.hidden = true;
    document.documentElement.classList.remove('is-locked');
    (lastFocus && lastFocus.focus ? lastFocus : openBtn).focus();
  }
  if (dlg && win && openBtn) {
    openBtn.addEventListener('click', openDlg);
    dlg.querySelector('.paydlg__x').addEventListener('click', closeDlg);
    dlg.addEventListener('mousedown', function (e) { dlg._downOnBackdrop = e.target === dlg; });
    dlg.addEventListener('click', function (e) { if (e.target === dlg && dlg._downOnBackdrop !== false) closeDlg(); });
    document.addEventListener('keydown', function (e) {
      if (!isOpen()) return;
      if (e.key === 'Escape' || e.key === 'Esc') { e.preventDefault(); closeDlg(); return; }
      if (e.key !== 'Tab') return;
      var f = focusables();
      if (!f.length) { e.preventDefault(); win.focus(); return; }
      var first = f[0], last = f[f.length - 1], a = document.activeElement;
      if (e.shiftKey && (a === first || a === win)) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && a === last) { e.preventDefault(); first.focus(); }
      else if (!win.contains(a)) { e.preventDefault(); first.focus(); }
    });
  }

  /* ---------- Липкая плашка на телефоне ---------- */
  var sticky = document.getElementById('sticky');
  var hero = document.getElementById('top');
  var tariffs = document.getElementById('tarify');
  var STICKY_GAP = 100;
  if (sticky && hero) {
    var ticking = false;
    var upd = function () {
      ticking = false;
      var vh = window.innerHeight || document.documentElement.clientHeight;
      var h = hero.getBoundingClientRect();
      var heroVisible = h.bottom > 0 && h.top < vh;
      var tariffsVisible = false;
      if (tariffs) {
        var r = tariffs.getBoundingClientRect();
        tariffsVisible = r.bottom > -STICKY_GAP && r.top < vh + STICKY_GAP;
      }
      sticky.classList.toggle('is-on', !heroVisible && !tariffsVisible);
    };
    var schedule = function () { if (!ticking) { ticking = true; (window.requestAnimationFrame || setTimeout)(upd); } };
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    window.addEventListener('load', schedule);
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(schedule).observe(hero);
      if (tariffs) new IntersectionObserver(schedule).observe(tariffs);
    }
    upd();
  }

  var y = document.getElementById('footerYear');
  if (y) y.textContent = String(new Date().getFullYear());
})();
