/*
 * Список страниц документации OBOD.
 *
 * Единственное место, где перечислены страницы, их порядок, заголовки и вкладки. Из него
 * собирается всё навигационное: дерево слева, хлебные крошки, переходы «Назад / Далее» и
 * оглавление «На этой странице». Поэтому разойтись между собой они не могут — достаточно
 * поправить этот файл. Подробнее — web/README.md.
 *
 * Поля записи:
 *
 *   file    имя файла страницы: он же адрес, он же ключ записи;
 *   title   заголовок в дереве, крошках и переходах;
 *   parent  file родительской страницы: так семейства справочника попадают под «Справочник»;
 *   family  имя семейства из REF (web/assets/ref.js): по нему страница семейства находит
 *           свои данные и раскладывает их по вкладкам экранов;
 *   tabs    вкладки страницы: id — то, что попадает в адрес после #, title — подпись.
 *
 * Порядок записей — порядок чтения: он же порядок переходов «Назад / Далее».
 * Файл подключается обычным <script src>: страницы открываются по file://, а модули
 * браузер из соседних файлов в этом режиме не отдаёт.
 */
var DOCS_PAGES = [
  { file: 'index.html', title: 'Что это' },

  { file: 'sound.html', title: 'Звук', tabs: [
    { id: 'drone', title: 'Дрон' },
    { id: 'lead',  title: 'Лид' },
    { id: 'perc',  title: 'Перкуссия' },
    { id: 'fx',    title: 'Эффекты' }
  ] },

  { file: 'ui.html', title: 'Управление' },

  { file: 'ref.html', title: 'Справочник' },

  { file: 'ref-drone.html', title: 'Тело', parent: 'ref.html', family: 'Тело', tabs: [
    { id: 'DRONE', title: 'DRONE' },
    { id: 'FLTR',  title: 'DRONE FLTR' },
    { id: 'MOD',   title: 'DRONE MOD' }
  ] },

  { file: 'ref-lead.html', title: 'Голос', parent: 'ref.html', family: 'Голос', tabs: [
    { id: 'LEAD', title: 'LEAD' },
    { id: 'TONE', title: 'LEAD TONE' },
    { id: 'ENV',  title: 'LEAD ENV' }
  ] },

  { file: 'ref-time.html', title: 'Время', parent: 'ref.html', family: 'Время', tabs: [
    { id: 'GEN',  title: 'LEAD GEN' },
    { id: 'EUCL', title: 'LEAD EUCLID' },
    { id: 'ARP',  title: 'LEAD ARP' }
  ] },

  { file: 'ref-perc.html', title: 'Перкуссия', parent: 'ref.html', family: 'Перкуссия', tabs: [
    { id: 'PERC', title: 'PERC' },
    { id: 'PSEQ', title: 'PERC SEQ' }
  ] },

  { file: 'ref-fx.html', title: 'Рэк', parent: 'ref.html', family: 'Рэк', tabs: [
    { id: 'CHOR', title: 'CHORUS' },
    { id: 'DLY',  title: 'DELAY' },
    { id: 'VERB', title: 'VERB' }
  ] },

  { file: 'ref-mix.html', title: 'Микшеры', parent: 'ref.html', family: 'Микшеры', tabs: [
    { id: 'MSTR', title: 'MASTER' },
    { id: 'LVLS', title: 'LEVELS' },
    { id: 'SNDS', title: 'SENDS' },
    { id: 'DRMX', title: 'DRONE SENDS' }
  ] },

  { file: 'ref-preset.html', title: 'Пресеты', parent: 'ref.html', family: 'Пресеты', tabs: [
    { id: 'PRST', title: 'PRESET' },
    { id: 'STAT', title: 'STATUS' }
  ] },

  { file: 'ref-system.html', title: 'Настройки', parent: 'ref.html', family: 'Настройки', tabs: [
    { id: 'SYS', title: 'SYSTEM' },
    { id: 'OPT', title: 'OPTIONS' }
  ] },

  { file: 'presets.html', title: 'Пресеты', tabs: [] },
  { file: 'flash.html', title: 'Прошивка', tabs: [
    { id: 'browser', title: 'Из браузера' },
    { id: 'command', title: 'Командой' },
    { id: 'lost',    title: 'Что теряется' }
  ] },
  { file: 'hw.html', title: 'Железо' },
  { file: 'under.html', title: 'Под капотом' }
];
