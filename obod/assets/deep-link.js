/*
 * Якорь открывает нужную вкладку.
 *
 * Дерево слева ведёт на экран по якорю: ref-bass.html#rhythm. Панель этого экрана лежит в
 * разметке, но у вкладок своё состояние, поэтому без этого файла ссылка приводила на
 * страницу с закрытой вкладкой — «ничего не открывается».
 *
 * Работает и при загрузке по ссылке, и при переходе внутри страницы. Если якорь не про
 * вкладку (например #notes), ничего не трогаем.
 */
(function () {
  'use strict';

  function activate() {
    var id = (window.location.hash || '').replace(/^#/, '');
    if (!id) { return; }

    var panel = document.getElementById('panel-' + id);
    if (!panel) { return; }

    var tab = document.querySelector('.tab[aria-controls="' + panel.id + '"]');
    if (tab && tab.getAttribute('aria-selected') !== 'true') { tab.click(); }

    window.requestAnimationFrame(function () {
      panel.scrollIntoView({ block: 'start', behavior: 'smooth' });
    });
  }

  window.addEventListener('hashchange', activate);
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', activate);
  } else {
    activate();
  }
})();
