/*
 * Замок выпуска: страница записи спрашивает код, выводит из него ключ и расшифровывает
 * образ здесь, в браузере.
 *
 * ПОЧЕМУ ТАК, А НЕ ССЫЛКОЙ НА ФАЙЛ. Образ лежит на публичном сайте, и до этого выпуска
 * рядом со страницей лежал открытый OBOD.bin: его забирала одна команда curl, а страница
 * была просто удобной кнопкой. Теперь на сайте лежит только замок — OBOD.bin.enc, — а
 * открытый образ существует в двух местах: в репозитории и в памяти этой страницы.
 * Код выпуска один на выпуск и живёт в посте Boosty, то есть у подписчика и у всех
 * остальных он одинаковый: это не именной ключ, а общий пароль выпуска.
 *
 * ЧТО ИМЕННО ПРОИСХОДИТ, ШАГ ЗА ШАГОМ.
 *
 *   1. lock.json называет замок: PBKDF2-SHA256, число итераций, соль, вектор AES-GCM,
 *      размер и хеш открытого образа, размер и хеш запечатанного файла.
 *   2. Код превращается в ключ: PBKDF2 из UTF-8 байтов кода и соли, триста десять тысяч
 *      итераций, тридцать два байта ключа. Число итераций берётся из замка, а не из этого
 *      файла: замок и его параметры — одно целое, и страница не должна спорить с файлом.
 *   3. AES-256-GCM расшифровывает файл. GCM проверяет тег: неверный код не даёт мусор,
 *      он не даёт ничего. Поэтому «код не подошёл» — это отказ, а не испорченный образ
 *      в приборе.
 *   4. SHA-256 расшифрованного сверяется с замком. Это вторая проверка, на случай
 *      ошибки в самом замке: даже если тег сошёлся, образ обязан быть тем, что записан.
 *   5. Манифест, который читает esp-web-tools, собирается здесь же: те же размеры,
 *      смещения и хеши, но путь к образу — blob: этого расшифрованного файла. Страница
 *      ничего не скачивает на диск и ничего не кладёт в хранилище браузера.
 *
 * ЧЕГО ЭТА СХЕМА НЕ ДЕЛАЕТ. Она не прячет код от того, кому он известен, и не мешает
 * поделиться им: код общий на выпуск, так и задумано. Она не работает без защищённого
 * адреса — Web Crypto в браузере есть только на https и на localhost, — и не работает
 * в браузерах без Web Serial: там кнопки записи не будет в любом случае.
 *
 * ФАЙЛ САМОДОСТАТОЧЕН: ни сборки, ни зависимостей, ни обращений к сети, кроме трёх
 * файлов рядом со страницей. Пути записаны так, как они лежат в репозитории, и
 * tools/make-site.ps1 переписывает их для сайта — там эти файлы лежат в корне страницы.
 */
(function () {
  'use strict';

  var form = document.getElementById('unlock');
  var input = document.getElementById('code');
  var statusLine = document.getElementById('flash-status');
  var meta = document.getElementById('flash-meta');
  var button = document.getElementById('installer');

  if (!form || !input || !statusLine || !button) {
    return;
  }

  /*
   * ПУТИ ЖИВУТ В РАЗМЕТКЕ, А НЕ ЗДЕСЬ. В репозитории эти три файла лежат в
   * tools/webflash, на сайте — рядом со страницей, и разницу знает только
   * tools/make-site.ps1: он переписывает пути в разметке. Путь, записанный в этом файле,
   * остался бы репозиторным на сайте — страница искала бы замок в ../tools/webflash,
   * которого там нет. Поэтому разметка называет файлы, а скрипт их только читает.
   */
  var LOCK = form.getAttribute('data-lock') || 'lock.json';
  var SEALED = form.getAttribute('data-sealed') || 'OBOD.bin.enc';
  var MANIFEST = form.getAttribute('data-manifest') || 'manifest.json';

  var lit = false;   /* ключ выведен и образ расшифрован: второй раз не работаем */

  function say(text, kind) {
    statusLine.textContent = text;
    statusLine.className = kind ? 'flash-status flash-status-' + kind : 'flash-status';
  }

  function bytesFromBase64(text) {
    var raw = atob(text);
    var out = new Uint8Array(raw.length);
    for (var i = 0; i < raw.length; i++) {
      out[i] = raw.charCodeAt(i);
    }
    return out;
  }

  function hexOf(buffer) {
    var bytes = new Uint8Array(buffer);
    var out = '';
    for (var i = 0; i < bytes.length; i++) {
      out += (bytes[i] < 16 ? '0' : '') + bytes[i].toString(16);
    }
    return out.toUpperCase();
  }

  function fail(text) {
    say(text, 'bad');
    form.classList.remove('busy');
    input.focus();
  }

  /* Строка под кнопкой: размер и хеш ОТКРЫТОГО образа, то есть того, что уйдёт в прибор.
     Числа берутся из манифеста, а не из заголовка ответа на HEAD: на GitHub Pages ответ
     сжатый, и Content-Length описывает поток, а не файл. */
  fetch(MANIFEST, { cache: 'no-store' })
    .then(function (response) {
      if (!response.ok) { throw new Error(String(response.status)); }
      return response.json();
    })
    .then(function (manifest) {
      var image = manifest.image || {};
      var line = 'Образ выпуска, версия ' + manifest.version;
      if (image.size) {
        line += ', ' + Number(image.size).toLocaleString('ru-RU') + ' байт';
      }
      if (image.sha256) {
        var hash = String(image.sha256);
        line += ', SHA-256 ' + hash.slice(0, 8) + '…' + hash.slice(-8);
        meta.setAttribute('title', 'SHA-256: ' + image.sha256);
      }
      meta.textContent = line + '. На сайте он лежит зашифрованным: страница откроет его после кода.';
    })
    .catch(function () {
      meta.textContent = 'Образ выпуска лежит на сайте зашифрованным.';
    });

  function reveal(manifestUrl, plainSize) {
    /* Манифест подставляется и свойством, и атрибутом: у компонента esp-web-tools
       атрибут — это то, что он читает при подключении, а свойство — то, что он слушает
       после. Ставим оба, чтобы порядок загрузки скриптов не решал, сработает ли запись. */
    function attach() {
      try { button.manifest = manifestUrl; } catch (error) { /* свойство есть не всегда */ }
      button.setAttribute('manifest', manifestUrl);
      button.hidden = false;
      lit = true;
      form.classList.remove('busy');
      form.classList.add('done');
      input.disabled = true;
      var codeButton = form.querySelector('button');
      if (codeButton) { codeButton.disabled = true; }
      say('Код подошёл, образ расшифрован: ' + Number(plainSize).toLocaleString('ru-RU') +
          ' байт. Кнопка записи ниже — образ уйдёт в прибор, на диск ничего не сохраняется.', 'ok');
    }

    /* Манифест ставится сразу, не дожидаясь, пока браузер поднимет компонент: если
       скрипт esp-web-tools не загрузился (нет сети до unpkg), ждать определения тега
       пришлось бы вечно, и человек после верного кода не увидел бы ничего. Повторная
       постановка после определения — для случая, когда компонент поднялся позже и
       прочитал атрибут только при подключении. */
    attach();
    if (window.customElements && window.customElements.whenDefined &&
        !window.customElements.get('esp-web-install-button')) {
      window.customElements.whenDefined('esp-web-install-button').then(attach, function () {});
    }
  }

  form.addEventListener('submit', function (event) {
    event.preventDefault();
    if (lit) { return; }

    var code = input.value.trim();
    if (!code) {
      fail('Нужен код выпуска: без него образ не откроется.');
      return;
    }

    if (!window.crypto || !window.crypto.subtle) {
      fail('Браузер не даёт Web Crypto: страница открыта не по защищённому адресу ' +
           '(нужен https или localhost). Откройте её с сайта.');
      return;
    }

    form.classList.add('busy');
    say('Читаю образ…', 'work');

    var lock = null;
    var sealed = null;

    fetch(LOCK, { cache: 'no-store' })
      .then(function (response) {
        if (!response.ok) { throw new Error('файл образа: ' + response.status); }
        return response.json();
      })
      .then(function (json) {
        lock = json;
        return fetch(SEALED, { cache: 'no-store' });
      })
      .then(function (response) {
        if (!response.ok) { throw new Error('образ: ' + response.status); }
        return response.arrayBuffer();
      })
      .then(function (buffer) {
        sealed = new Uint8Array(buffer);
        say('Вывожу ключ из кода…', 'work');

        var rounds = Number(lock.kdf.iterations);
        var salt = bytesFromBase64(lock.kdf.salt);
        return window.crypto.subtle.importKey(
          'raw', new TextEncoder().encode(code), 'PBKDF2', false, ['deriveKey']
        ).then(function (base) {
          return window.crypto.subtle.deriveKey(
            { name: 'PBKDF2', salt: salt, iterations: rounds, hash: 'SHA-256' },
            base, { name: 'AES-GCM', length: 256 }, false, ['decrypt']
          );
        });
      })
      .then(function (key) {
        var iv = bytesFromBase64(lock.cipher.iv);
        var tagLength = Number(lock.cipher.tag) * 8;
        return window.crypto.subtle.decrypt(
          { name: 'AES-GCM', iv: iv, tagLength: tagLength }, key, sealed
        );
      })
      .then(function (plain) {
        say('Проверяю образ по контрольной сумме…', 'work');
        return window.crypto.subtle.digest('SHA-256', plain).then(function (digest) {
          var want = String(lock.plain.sha256 || '').toUpperCase();
          var got = hexOf(digest);
          if (want && got !== want) {
            throw new Error('hash');
          }
          if (lock.plain.size && plain.byteLength !== Number(lock.plain.size)) {
            throw new Error('hash');
          }
          return plain;
        });
      })
      .then(function (plain) {
        var blob = new Blob([plain], { type: 'application/octet-stream' });
        var imageUrl = URL.createObjectURL(blob);

        return fetch(MANIFEST, { cache: 'no-store' })
          .then(function (response) {
            if (!response.ok) { throw new Error('список файлов: ' + response.status); }
            return response.json();
          })
          .then(function (manifest) {
            /* Тот же манифест, но путь к образу — на расшифрованный blob. Смещения и
               размеры не трогаем: образ тот же самый, изменился только адрес, по которому
               его можно взять. */
            if (manifest.image) {
              manifest.image.path = imageUrl;
            }
            if (manifest.builds) {
              manifest.builds.forEach(function (build) {
                (build.parts || []).forEach(function (part) {
                  if (/OBOD\.bin/.test(String(part.path || ''))) {
                    part.path = imageUrl;
                  }
                });
              });
            }

            var manifestBlob = new Blob([JSON.stringify(manifest)],
                                        { type: 'application/json' });
            reveal(URL.createObjectURL(manifestBlob), plain.byteLength);
          });
      })
      .catch(function (error) {
        var message = String((error && error.message) || error);
        if (message === 'hash') {
          fail('Файл расшифровался, но контрольная сумма не сошлась: образ на сайте не тот, ' +
               'что записан в выпуске. Сообщите об этом — это ошибка выпуска, а не ваш код.');
        } else if (/decrypt|operation|tag/i.test(message)) {
          fail('Код не подошёл: образ не расшифрован. Проверьте код выпуска целиком — ' +
               'он чувствителен к регистру и знакам.');
        } else {
          fail('Не удалось: ' + message + '. Проверьте связь и попробуйте ещё раз.');
        }
      });
  });
}());
