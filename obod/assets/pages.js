/*
 * Список страниц документации OBOD.
 *
 * Единственное место, где перечислены страницы, их порядок, заголовки и вкладки. Из него
 * собирается всё навигационное: дерево слева, хлебные крошки, переходы «Назад / Далее» и
 * оглавление «На этой странице». Поэтому разойтись между собой они не могут — достаточно
 * поправить этот файл.
 *
 * САЙТ — ЭТО РУКОВОДСТВО, А НЕ ОПИСАНИЕ РАЗРАБОТКИ. Девять разделов прибора и две страницы
 * вокруг них; всё, что не помогает играть, живёт в репозитории и в CHANGELOG.md. Снимков
 * экранов здесь нет: цвет в тексте и таблицы ручек говорят то же самое и не устаревают.
 *
 * Заголовки разделов — те же слова, что на карте прибора: рядом с названием стоит код
 * сектора (DRN, LD, LFO, SCL, PRC, BAS, FX, LVL, PRS), чтобы страницу можно было найти и
 * по экрану. Порядок — порядок карты: от тела к хранилищу.
 *
 * Поля записи:
 *
 *   file    имя файла страницы: он же адрес, он же ключ записи;
 *   title   заголовок в дереве, крошках и переходах;
 *   family  имя раздела из REF (web/assets/ref.js): по нему страница раздела находит
 *           свои данные и раскладывает их по вкладкам экранов;
 *   tabs    вкладки страницы: id — то, что попадает в адрес после #, title — подпись;
 *   tag     код сектора прибора, если он есть у вкладки: показывается в дереве.
 *
 * Файл подключается обычным <script src>: страницы открываются по file://, а модули
 * браузер из соседних файлов в этом режиме не отдаёт.
 */
var DOCS_PAGES = [
  {
    file: 'index.html',
    title: 'Обзор',
    lead: 'Круглый синтезатор-контроллер: что он делает и из чего состоит.'
  },

  {
    file: 'start.html',
    title: 'Первый запуск',
    lead: 'Включить, услышать звук, понять обод и жесты, сохранить пресет.'
  },

  {
    file: 'ref-drone.html',
    title: 'Дрон',
    family: 'Дрон',
    tabs: [
      { id: 'DRONE', title: 'DRONE', tag: 'DRN' },
      { id: 'FLTR', title: 'DRONE FLTR', tag: 'DFL' }
    ]
  },

  {
    file: 'ref-lfo.html',
    title: 'Модуляция',
    family: 'Модуляция',
    tabs: [
      { id: 'LFO1', title: 'LFO 1', tag: 'LF1' },
      { id: 'LFO2', title: 'LFO 2', tag: 'LF2' }
    ]
  },

  {
    file: 'ref-lead.html',
    title: 'Лид',
    family: 'Лид',
    tabs: [
      { id: 'LEAD', title: 'LEAD', tag: 'LD' },
      { id: 'TONE', title: 'LEAD TONE', tag: 'LTN' },
      { id: 'ENV', title: 'LEAD ENV', tag: 'ENV' }
    ]
  },

  {
    file: 'ref-time.html',
    title: 'Время',
    family: 'Время',
    tabs: [
      { id: 'SCL', title: 'SCALE', tag: 'SCL' },
      { id: 'EUCL', title: 'LEAD EUCLID', tag: 'EQL' },
      { id: 'ARP', title: 'LEAD ARP', tag: 'ARP' }
    ]
  },

  {
    file: 'ref-perc.html',
    title: 'Перкуссия',
    family: 'Перкуссия',
    tabs: [
      { id: 'PERC', title: 'PERC', tag: 'PRC' },
      { id: 'PSEQ', title: 'PERC SEQ', tag: 'PSQ' },
      { id: 'PMX', title: 'PERC MIX', tag: 'PMX' }
    ]
  },

  {
    file: 'ref-bass.html',
    title: 'Бас',
    family: 'Бас',
    tabs: [
      { id: 'BASS', title: 'BASS', tag: 'BAS' },
      { id: 'RHYTHM', title: 'RHYTHM', tag: 'BSQ' }
    ]
  },

  {
    file: 'ref-fx.html',
    title: 'Эффекты',
    family: 'Эффекты',
    tabs: [
      { id: 'FX', title: 'FX', tag: 'FX' },
      { id: 'DLY', title: 'DELAY', tag: 'DEL' },
      { id: 'REV', title: 'REVERB', tag: 'REV' }
    ]
  },

  {
    file: 'ref-mix.html',
    title: 'Микшер',
    family: 'Микшер',
    tabs: [
      { id: 'MSTR', title: 'MASTER', tag: 'MST' },
      { id: 'LVLS', title: 'LEVELS', tag: 'LVL' },
      { id: 'REVS', title: 'REV SENDS', tag: 'RVS' },
      { id: 'FXS', title: 'FX SENDS', tag: 'FXS' },
      { id: 'DELS', title: 'DEL SENDS', tag: 'DLS' }
    ]
  },

  {
    file: 'ref-store.html',
    title: 'Пресеты и настройки',
    family: 'Пресеты и настройки',
    tabs: [
      { id: 'PRST', title: 'PRESET', tag: 'PRS' },
      { id: 'SETUP', title: 'SETUP', tag: 'SET' }
    ]
  },

  {
    file: 'flash.html',
    title: 'Прошивка',
    lead: 'Записать новый выпуск из браузера и что при этом теряется.',
    tabs: [
      { id: 'browser', title: 'Из браузера' },
      { id: 'lost', title: 'Что теряется' }
    ]
  },

  {
    file: 'hw.html',
    title: 'Железо',
    lead: 'Что внутри корпуса, разъёмы, питание и чем прибор дышит.'
  },

  {
    file: 'changelog.html',
    title: 'История изменений',
    lead: 'Что менялось от выпуска к выпуску — коротко и по делу.'
  }
];
