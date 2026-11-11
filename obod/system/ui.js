/* ═══════════════════════════════════════════════════════════════
   OBOD · Дизайн-система — Интерактив
   Тема · оверлей сетки · вкладки · дерево · оглавление · копирование
   ручка-knob · метры с транспортом · тосты
   Обычный <script defer>, работает и по file://
   ═══════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var root = document.documentElement;
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ─────────────── Тема ─────────────── */
  function applyThemeMeta() {
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', root.dataset.theme === 'light' ? '#F2F5F0' : '#060A09');
  }

  function initTheme() {
    applyThemeMeta();
    document.querySelectorAll('[data-theme-toggle]').forEach(function (btn) {
      btn.setAttribute('aria-pressed', String(root.dataset.theme === 'light'));
      btn.addEventListener('click', function () {
        var next = root.dataset.theme === 'light' ? 'dark' : 'light';
        root.dataset.theme = next;
        try { localStorage.setItem('obod-theme', next); } catch (e) {}
        applyThemeMeta();
        document.querySelectorAll('[data-theme-toggle]').forEach(function (b) {
          b.setAttribute('aria-pressed', String(next === 'light'));
        });
        document.dispatchEvent(new CustomEvent('themechange', { detail: { theme: next } }));
      });
    });
  }

  /* ─────────────── Оверлей сетки ─────────────── */
  function buildOverlay() {
    if (document.querySelector('.grid-overlay')) return;
    var ov = document.createElement('div');
    ov.className = 'grid-overlay';
    ov.setAttribute('aria-hidden', 'true');
    var wrap = document.createElement('div');
    wrap.className = 'wrap';
    var grid = document.createElement('div');
    grid.className = 'grid';
    for (var i = 0; i < 12; i++) {
      var c = document.createElement('div');
      c.className = 'g-col col-1';
      grid.appendChild(c);
    }
    wrap.appendChild(grid);
    ov.appendChild(wrap);
    document.body.appendChild(ov);
    var badge = document.createElement('div');
    badge.className = 'grid-badge';
    badge.textContent = 'Сетка · G — скрыть';
    document.body.appendChild(badge);
  }

  function setGrid(on) {
    root.classList.toggle('show-grid', on);
    document.querySelectorAll('[data-grid-toggle]').forEach(function (b) {
      b.setAttribute('aria-pressed', String(on));
    });
  }

  function initGrid() {
    buildOverlay();
    document.querySelectorAll('[data-grid-toggle]').forEach(function (btn) {
      btn.setAttribute('aria-pressed', 'false');
      btn.addEventListener('click', function () {
        setGrid(!root.classList.contains('show-grid'));
      });
    });
    document.addEventListener('keydown', function (e) {
      if (e.key.toLowerCase() !== 'g' || e.metaKey || e.ctrlKey || e.altKey) return;
      var t = e.target;
      if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.tagName === 'SELECT' || t.isContentEditable)) return;
      setGrid(!root.classList.contains('show-grid'));
    });
  }

  /* ─────────────── Вкладки ─────────────── */
  function initTabs() {
    document.querySelectorAll('[data-tabs]').forEach(function (box) {
      var tabs = Array.prototype.slice.call(box.querySelectorAll('[role="tab"]'));
      if (!tabs.length) return;
      function activate(tab, focus) {
        tabs.forEach(function (t) {
          var on = t === tab;
          t.setAttribute('aria-selected', String(on));
          t.tabIndex = on ? 0 : -1;
          var panel = document.getElementById(t.getAttribute('aria-controls'));
          if (panel) panel.hidden = !on;
        });
        if (focus) tab.focus();
      }
      tabs.forEach(function (tab, i) {
        tab.addEventListener('click', function () { activate(tab, false); });
        tab.addEventListener('keydown', function (e) {
          var j = null;
          if (e.key === 'ArrowRight') j = (i + 1) % tabs.length;
          else if (e.key === 'ArrowLeft') j = (i - 1 + tabs.length) % tabs.length;
          else if (e.key === 'Home') j = 0;
          else if (e.key === 'End') j = tabs.length - 1;
          if (j !== null) { e.preventDefault(); activate(tabs[j], true); }
        });
      });
    });
  }

  /* ─────────────── Фильтр дерева ─────────────── */
  function initTreeFilter() {
    document.querySelectorAll('[data-tree-filter]').forEach(function (input) {
      var tree = document.querySelector(input.dataset.treeFilter || '.tree');
      if (!tree) return;
      var empty = tree.querySelector('.tree-empty');
      input.addEventListener('input', function () {
        var q = input.value.trim().toLowerCase();
        var any = false;
        tree.querySelectorAll('.tree-group').forEach(function (grp) {
          var visible = 0;
          grp.querySelectorAll('.tree-link').forEach(function (link) {
            var hit = !q || link.textContent.toLowerCase().indexOf(q) !== -1;
            link.style.display = hit ? '' : 'none';
            if (hit) visible++;
          });
          grp.style.display = visible ? '' : 'none';
          if (q && visible) grp.open = true;
          any = any || visible > 0;
        });
        if (empty) empty.style.display = any ? 'none' : 'block';
      });
    });
  }

  /* ─────────────── Оглавление: scrollspy ─────────────── */
  function initSpy() {
    var links = Array.prototype.slice.call(document.querySelectorAll('.toc-link[href^="#"]'));
    if (!links.length || !('IntersectionObserver' in window)) return;
    var map = {};
    var targets = [];
    links.forEach(function (l) {
      var el = document.getElementById(l.getAttribute('href').slice(1));
      if (el) { map[el.id] = l; targets.push(el); }
    });
    var current = null;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          if (current) current.classList.remove('active');
          current = map[en.target.id];
          if (current) current.classList.add('active');
        }
      });
    }, { rootMargin: '-30% 0px -60% 0px' });
    targets.forEach(function (t) { io.observe(t); });
  }

  /* ─────────────── Тосты ─────────────── */
  var toastRegion = null;
  function toast(msg) {
    if (!toastRegion) {
      toastRegion = document.createElement('div');
      toastRegion.className = 'toast-region';
      toastRegion.setAttribute('role', 'status');
      toastRegion.setAttribute('aria-live', 'polite');
      document.body.appendChild(toastRegion);
    }
    var el = document.createElement('div');
    el.className = 'toast';
    el.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg><span></span>';
    el.querySelector('span').textContent = msg;
    toastRegion.appendChild(el);
    setTimeout(function () { el.classList.add('out'); }, 2200);
    setTimeout(function () { el.remove(); }, 2600);
  }
  window.obodToast = toast;

  /* ─────────────── Копирование ─────────────── */
  function initCopy() {
    document.querySelectorAll('[data-copy]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var target = document.querySelector(btn.dataset.copy);
        if (!target) return;
        var text = target.innerText;
        function done() { toast('Скопировано в буфер'); }
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(text).then(done, function () { fallback(); });
        } else { fallback(); }
        function fallback() {
          var ta = document.createElement('textarea');
          ta.value = text;
          ta.style.position = 'fixed';
          ta.style.opacity = '0';
          document.body.appendChild(ta);
          ta.select();
          try { document.execCommand('copy'); done(); } catch (e) {}
          ta.remove();
        }
      });
    });
  }

  /* ─────────────── Ручка-knob ─────────────── */
  var SVG_NS = 'http://www.w3.org/2000/svg';
  function svgEl(name, attrs) {
    var el = document.createElementNS(SVG_NS, name);
    for (var k in attrs) el.setAttribute(k, attrs[k]);
    return el;
  }

  function initKnobs() {
    document.querySelectorAll('[data-knob]').forEach(function (el) {
      var min = parseFloat(el.dataset.min || '0');
      var max = parseFloat(el.dataset.max || '100');
      var step = parseFloat(el.dataset.step || '1');
      var dec = parseInt(el.dataset.decimals || '0', 10);
      var unit = el.dataset.unit || '';
      var bipolar = el.dataset.bipolar === 'true';
      var def = parseFloat(el.dataset.default || el.dataset.value || String(min));
      var value = parseFloat(el.dataset.value || String(def));
      var size = parseInt(el.dataset.size || '120', 10);
      var label = el.dataset.label || 'Knob';

      var svg = svgEl('svg', { viewBox: '0 0 120 120', width: size, height: size, 'aria-hidden': 'true' });
      svg.appendChild(svgEl('circle', { cx: 60, cy: 60, r: 56, fill: 'none', 'stroke-width': 5, 'stroke-dasharray': '1.2 7.6', class: 'knob-ticks' }));
      var track = svgEl('circle', { cx: 60, cy: 60, r: 46, fill: 'none', 'stroke-width': 6, 'stroke-linecap': 'round', pathLength: 100, 'stroke-dasharray': '75 25', transform: 'rotate(135 60 60)', class: 'knob-track' });
      svg.appendChild(track);
      var arc = svgEl('circle', { cx: 60, cy: 60, r: 46, fill: 'none', 'stroke-width': 6, 'stroke-linecap': 'round', pathLength: 100, transform: 'rotate(135 60 60)', class: 'knob-arc' });
      svg.appendChild(arc);
      svg.appendChild(svgEl('circle', { cx: 60, cy: 60, r: 32, 'stroke-width': 1.5, class: 'knob-cap' }));
      var pointer = svgEl('g', { class: 'knob-pointer' });
      pointer.appendChild(svgEl('line', { x1: 60, y1: 31, x2: 60, y2: 40, 'stroke-width': 3.5, 'stroke-linecap': 'round' }));
      svg.appendChild(pointer);

      var labelEl = el.querySelector('.knob-label');
      var valueEl = el.querySelector('.knob-value');
      if (!labelEl) {
        labelEl = document.createElement('span');
        labelEl.className = 'knob-label';
        labelEl.textContent = label;
        el.appendChild(labelEl);
      }
      if (!valueEl) {
        valueEl = document.createElement('span');
        valueEl.className = 'knob-value';
        el.appendChild(valueEl);
      }
      el.insertBefore(svg, el.firstChild);

      el.setAttribute('role', 'slider');
      el.setAttribute('tabindex', '0');
      el.setAttribute('aria-label', label);
      el.setAttribute('aria-valuemin', String(min));
      el.setAttribute('aria-valuemax', String(max));

      function clamp(v) { return Math.min(max, Math.max(min, v)); }
      function snap(v) { return clamp(Math.round(v / step) * step); }

      function render() {
        var f = (value - min) / (max - min);
        if (bipolar) {
          var len = Math.abs(f - 0.5) * 75;
          var off = -Math.min(f, 0.5) * 75;
          arc.setAttribute('stroke-dasharray', len + ' ' + (100 - len));
          arc.setAttribute('stroke-dashoffset', String(off));
        } else {
          arc.setAttribute('stroke-dasharray', (f * 75) + ' ' + (100 - f * 75));
          arc.setAttribute('stroke-dashoffset', '0');
        }
        pointer.setAttribute('transform', 'rotate(' + (225 + f * 270) + ' 60 60)');
        var text = value.toFixed(dec) + (unit ? ' ' + unit : '');
        valueEl.textContent = text;
        el.setAttribute('aria-valuenow', value.toFixed(dec));
        el.setAttribute('aria-valuetext', text);
      }

      function setValue(v, fire) {
        var nv = snap(v);
        if (nv === value) return;
        value = nv;
        render();
        if (fire !== false) el.dispatchEvent(new CustomEvent('input', { detail: { value: value }, bubbles: true }));
      }

      render();

      /* Перетаскивание по вертикали */
      var dragging = false, startY = 0, startVal = 0;
      el.addEventListener('pointerdown', function (e) {
        dragging = true;
        startY = e.clientY;
        startVal = value;
        el.setPointerCapture(e.pointerId);
        e.preventDefault();
      });
      el.addEventListener('pointermove', function (e) {
        if (!dragging) return;
        var sens = (max - min) / 220 * (e.shiftKey ? 0.15 : 1);
        setValue(startVal + (startY - e.clientY) * sens);
      });
      function endDrag() {
        if (!dragging) return;
        dragging = false;
        el.dispatchEvent(new CustomEvent('change', { detail: { value: value }, bubbles: true }));
      }
      el.addEventListener('pointerup', endDrag);
      el.addEventListener('pointercancel', endDrag);

      /* Колесо */
      el.addEventListener('wheel', function (e) {
        e.preventDefault();
        var d = (max - min) / 50;
        setValue(value + (e.deltaY < 0 ? d : -d));
      }, { passive: false });

      /* Клавиатура */
      el.addEventListener('keydown', function (e) {
        var big = step * 10;
        switch (e.key) {
          case 'ArrowUp': case 'ArrowRight': setValue(value + step); break;
          case 'ArrowDown': case 'ArrowLeft': setValue(value - step); break;
          case 'PageUp': setValue(value + big); break;
          case 'PageDown': setValue(value - big); break;
          case 'Home': setValue(min); break;
          case 'End': setValue(max); break;
          default: return;
        }
        e.preventDefault();
      });

      /* Двойной клик — заводское значение */
      el.addEventListener('dblclick', function () { setValue(def); });
    });
  }

  /* ─────────────── Ползунки: живой вывод значения ─────────────── */
  function initRanges() {
    document.querySelectorAll('input[type="range"][data-range-out]').forEach(function (input) {
      var out = document.querySelector(input.dataset.rangeOut);
      if (!out) return;
      function upd() { out.textContent = input.value + (input.dataset.unit || ''); }
      input.addEventListener('input', upd);
      upd();
    });
  }

  /* ─────────────── Метры + транспорт ─────────────── */
  function initMeters() {
    var banks = document.querySelectorAll('[data-meters]');
    if (!banks.length) return;
    var SEGS = 14;
    var meters = [];
    banks.forEach(function (bank) {
      bank.querySelectorAll('.meter').forEach(function (m) {
        var bars = m.querySelector('.bars');
        if (!bars) return;
        var segs = [];
        for (var i = 0; i < SEGS; i++) {
          var s = document.createElement('div');
          s.className = 'seg';
          bars.appendChild(s);
          segs.push(s);
        }
        meters.push({ segs: segs, level: 0, target: 0.3 + Math.random() * 0.5, lit: -1, base: 0.25 + Math.random() * 0.45 });
      });
    });

    var playing = !reduceMotion;
    var recording = false;

    function paint(m) {
      var lit = Math.round(m.level * SEGS);
      if (lit === m.lit) return;
      m.lit = lit;
      m.segs.forEach(function (s, i) {
        var cls = 'seg';
        if (i < lit) cls += i >= SEGS - 1 ? ' peak' : (i >= SEGS - 3 ? ' hot' : ' on');
        if (s.className !== cls) s.className = cls;
      });
    }

    document.querySelectorAll('[data-transport]').forEach(function (tr) {
      var play = tr.querySelector('.t-play');
      var stop = tr.querySelector('.t-stop');
      var rec = tr.querySelector('.t-rec');
      function sync() {
        if (play) play.setAttribute('aria-pressed', String(playing));
        if (stop) stop.setAttribute('aria-pressed', String(!playing));
        if (rec) rec.setAttribute('aria-pressed', String(recording));
      }
      if (play) play.addEventListener('click', function () { playing = true; sync(); });
      if (stop) stop.addEventListener('click', function () { playing = false; sync(); });
      if (rec) rec.addEventListener('click', function () { recording = !recording; sync(); });
      sync();
    });

    if (reduceMotion) {
      meters.forEach(function (m) { m.level = m.base; paint(m); });
      return;
    }

    var last = 0;
    function tick(ts) {
      if (ts - last > 50) {
        last = ts;
        meters.forEach(function (m) {
          if (playing) {
            m.target += (Math.random() - 0.5) * 0.34;
            m.target = Math.min(0.97, Math.max(m.base * 0.5, m.target));
          } else {
            m.target = 0;
          }
          m.level += (m.target - m.level) * (playing ? 0.4 : 0.18);
          paint(m);
        });
      }
      requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  /* ─────────────── Свотчи: живые значения токенов ─────────────── */
  function initSwatches() {
    var swatches = document.querySelectorAll('[data-token]');
    if (!swatches.length) return;
    function upd() {
      var cs = getComputedStyle(root);
      swatches.forEach(function (sw) {
        var val = cs.getPropertyValue(sw.dataset.token).trim();
        var out = sw.querySelector('.sw-val');
        if (out) out.textContent = val;
      });
    }
    upd();
    document.addEventListener('themechange', upd);
  }

  /* ─────────────── Запуск ─────────────── */
  function init() {
    initTheme();
    initGrid();
    initTabs();
    initTreeFilter();
    initSpy();
    initCopy();
    initKnobs();
    initRanges();
    initMeters();
    initSwatches();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();