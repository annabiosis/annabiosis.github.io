/*
 * Список изменений: чтение и показ.
 *
 * Данные лежат в changelog.json — его собирает tools/make-changelog-json.ps1 из
 * CHANGELOG.md, и там же вся история, от новой версии к старой. Поэтому у страницы
 * прошивки и у страницы истории один источник: первая берёт первую запись, вторая
 * все. Второй копии данных нет ни в разметке, ни в скрипте.
 *
 * Файл подключается обычным <script src>: страницы открываются и по file://, где
 * модули из соседних файлов браузер не отдаёт.
 *
 * Записи в файле:
 *
 *   version   номер выпуска, он же якорь на странице истории: #v1.2.1;
 *   date      дата выпуска в виде 2026-10-26, если у версии есть тег; иначе поля нет;
 *   sections  разделы: title и items — те же подписи и пункты, что в CHANGELOG.md.
 */
var ObodChangelog = (function () {
  'use strict';

  /*
   * Чтение. Ответ без кэша: список меняется при выпуске, а страницу открывают
   * сразу после него. Ошибку не глотаем молча — отдаём null, и вызывающий решает,
   * что показать.
   */
  function load(src) {
    return fetch(src, { cache: 'no-store' }).then(function (reply) {
      if (!reply.ok) { return null; }
      return reply.json();
    }).then(function (data) {
      var versions = (data && data.versions) || [];
      return Array.isArray(versions) ? versions : [];
    }).catch(function () {
      return [];
    });
  }

  /*
   * Текст пункта. Обратные кавычки — врезка кода, как в документации; всё
   * остальное кладётся текстом, поэтому разметка из файла на страницу не попадает.
   */
  function fill(host, text) {
    var parts = String(text == null ? '' : text).split('`');
    for (var i = 0; i < parts.length; i++) {
      if (!parts[i]) { continue; }
      if (i % 2 === 1) {
        var code = document.createElement('code');
        code.textContent = parts[i];
        host.appendChild(code);
      } else {
        host.appendChild(document.createTextNode(parts[i]));
      }
    }
  }

  /* Разделы одной версии: подпись раздела и список пунктов. */
  function sections(host, list) {
    (list || []).forEach(function (section) {
      var head = document.createElement('p');
      head.className = 'cl-section';
      head.textContent = section.title || '';
      host.appendChild(head);

      var ul = document.createElement('ul');
      (section.items || []).forEach(function (item) {
        var li = document.createElement('li');
        fill(li, item);
        ul.appendChild(li);
      });
      host.appendChild(ul);
    });
  }

  /* Дата выпуска: в файле 2026-10-26, на странице 26.10.2026. */
  function date(iso) {
    var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(iso || ''));
    return m ? m[3] + '.' + m[2] + '.' + m[1] : '';
  }

  return { load: load, fill: fill, sections: sections, date: date };
})();
