/*
 * Строка об исходниках выпуска: версия, размер и SHA-256.
 *
 * Числа берутся из sources.json, а не из текста страницы. Причина та же, по которой размер
 * образа берётся из замка: число, вписанное в разметку, устаревает на следующем выпуске
 * молча, а число из файла рядом с архивом либо совпадает с архивом, либо проверка об этом
 * скажет. Путь к sources.json стоит в разметке — у сайта он короткий, в репозитории длиннее.
 *
 * Если файла нет или он не читается, страница остаётся с тем, что написано в разметке, —
 * осмысленной фразой, а не пустым местом.
 */
(function () {
  'use strict';

  var nodes = document.querySelectorAll('[data-sources]');
  if (!nodes.length) { return; }

  /* Пробелы между разрядами и неразрывный пробел внутри числа: «2 876 828» не должно
     разорваться по строкам посреди числа. */
  function group(value) {
    var text = String(value);
    var out = '';
    for (var i = 0; i < text.length; i++) {
      if (i > 0 && (text.length - i) % 3 === 0) { out += '\u00a0'; }
      out += text.charAt(i);
    }
    return out;
  }

  /* Хеш — отдельной строкой: шестьдесят четыре знака, начатые с середины строки, ломаются
     где попало и читаются плохо. Своя строка даёт ему всю ширину меры. */
  function fill(node, data) {
    var doc = node.ownerDocument;
    var size = doc.createElement('span');
    size.className = 'sources-size';
    size.textContent = group(data.size) + ' байт, файлов: ' + String(data.files || '?');

    var hashLine = doc.createElement('span');
    hashLine.className = 'sources-hash';
    hashLine.appendChild(doc.createTextNode('SHA-256 '));

    var code = doc.createElement('code');
    code.textContent = String(data.sha256 || '');
    hashLine.appendChild(code);

    node.textContent = '';
    node.appendChild(size);
    node.appendChild(hashLine);
    node.removeAttribute('title');
    node.setAttribute('title', 'SHA-256: ' + String(data.sha256 || ''));
  }

  function load() {
    var path = nodes[0].getAttribute('data-sources');
    if (!path || !window.fetch) { return; }
    fetch(path, { cache: 'no-cache' })
      .then(function (response) {
        if (!response.ok) { throw new Error('sources.json: ' + response.status); }
        return response.json();
      })
      .then(function (data) {
        if (!data || !data.size || !data.sha256) { return; }
        Array.prototype.forEach.call(nodes, function (node) { fill(node, data); });
      })
      .catch(function () {
        /* Нет файла — остаётся фраза из разметки. Молча: страница от этого не ломается. */
      });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', load, { once: true });
  } else {
    load();
  }
})();
