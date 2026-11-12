/*
 * Якорь открывает нужную вкладку и подсвечивает то, на что пришли.
 *
 * Дерево ведёт на экран: ref-bass.html#bsq. Кросс-ссылки ведут на конкретную ручку:
 * ref-store.html#set-weak-vel. Здесь оба случая: находим вкладку, в которой лежит цель,
 * нажимаем её, прокручиваем к цели и подсвечиваем её на полторы секунды.
 *
 * Подсветка живёт и без скрипта — :target в CSS. Скрипт нужен для двух вещей: открыть
 * скрытую вкладку и мигнуть строкой, когда переход случился внутри уже открытой страницы.
 */
(function () {
  'use strict';

  var FLASH_MS = 1600;

  function flash(node) {
    if (!node || !node.classList) { return; }
    node.classList.remove('is-flash');
    /* Перезапуск анимации: без чтения offsetWidth браузер склеит классы в одно состояние. */
    void node.offsetWidth;
    node.classList.add('is-flash');
    window.setTimeout(function () { node.classList.remove('is-flash'); }, FLASH_MS);
  }

  function activate() {
    var id = (window.location.hash || '').replace(/^#/, '');
    if (!id) { return; }
    try { id = decodeURIComponent(id); } catch (e) { /* якорь не в UTF-8 — оставляем как есть */ }

    var target = document.getElementById(id);
    var panel = null;

    if (target) {
      panel = target.closest ? target.closest('.tabpanel') : null;
    } else {
      /* Старый вид якоря: имя панели или код экрана без ручки. */
      panel = document.getElementById('panel-' + id.split('-')[0]);
      target = panel;
    }

    if (panel) {
      var tab = document.querySelector('.tab[aria-controls="' + panel.id + '"]');
      if (tab && tab.getAttribute('aria-selected') !== 'true') { tab.click(); }
    }

    if (!target) { return; }

    window.requestAnimationFrame(function () {
      target.scrollIntoView({ block: 'center', behavior: 'smooth' });
      flash(target);
    });
  }

  window.addEventListener('hashchange', activate);
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', activate);
  } else {
    activate();
  }
})();
