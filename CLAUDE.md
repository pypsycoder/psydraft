# PsyDraft — Справочник для Claude Code

## Что это

Офлайн-инструмент для психиатров: структурированный сбор данных осмотра → автогенерация текста консультации. Работает как один самодостаточный HTML-файл без сервера.

---

## Структура проекта

```
psydraft/
├── CLAUDE.md                        # этот файл
├── README.md                        # пользовательская документация
├── frontend/
│   └── psychstatus/
│       ├── build.py                 # сборщик (Python)
│       ├── dist/
│       │   └── psychstatus.html     # итоговый файл (результат сборки)
│       └── src/
│           ├── index.template.html  # главный шаблон с директивами INCLUDE
│           ├── css/                 # 15 CSS-файлов (стили, компоненты)
│           ├── js/                  # 14 JS-модулей (логика приложения)
│           ├── layout/              # 4 блока разметки (head, header, sidebar, footer)
│           ├── partials/            # 3 переиспользуемых HTML-фрагмента
│           ├── sections/            # 8 секций форм (жалобы, статус, диагноз, …)
│           └── icons/               # SVG-иконки
└── шаблон консультации психиатра.html  # исходный прототип (не в сборке)
```

---

## Ключевые файлы

### Сборка
| Файл | Роль |
|------|------|
| `build.py` | Читает `index.template.html`, раскрывает `<!-- INCLUDE ... -->`, пишет `dist/psychstatus.html` |
| `src/index.template.html` | Точка входа, содержит все директивы INCLUDE |
| `dist/psychstatus.html` | Единый HTML-файл (~7 500 строк), открывается прямо в браузере |

### JS-модули (`src/js/`)
| Файл | Роль |
|------|------|
| `main.js` | Инициализация при DOMContentLoaded |
| `state/schema.js` | Схема данных формы |
| `state/defaults.js` | Начальные значения полей |
| `state/storage.js` | Чтение/запись LocalStorage |
| `ui/sidebar.js` | Навигация по секциям |
| `ui/multicheck.js` | Мультивыбор чекбоксов |
| `ui/ideas.js` | Бред, навязчивости |
| `ui/perception.js` | Галлюцинации |
| `ui/life_history.js` | Анамнез жизни |
| `ui/nosology_advisor.js` | Нозологический советник |
| `ui/icd_search.js` | Поиск по МКБ-10 (46+ кодов) |
| `ui/recommendations.js` | Библиотека рекомендаций (30+ пунктов) |
| `ui/rx_drug_dict.js` | База препаратов |
| `ui/prescriptions.js` | Назначения: препарат, доза, режим |
| `report/builder.js` | Сборка итогового текста консультации |
| `report/prettifier.js` | Форматирование текста |

### CSS (`src/css/`)
- `base.css` — CSS-переменные, типографика, reset
- `layout.css` — двухколоночная раскладка (боковая панель + контент)
- `theme.apple.css` — Apple-стиль (скругления, тени, цвета)
- `components/` — стили отдельных компонентов (cards, checkboxes, nosology, prescriptions, recommendations, result, …)

### Секции форм (`src/sections/`)
`general.html`, `status/status.wrapper.html` (+ 10 подсекций психического статуса), `nosology.html`, `diagnosis.html`, `recommendations.html`, `prescriptions.html`, `result.html`

---

## Сборка

### Механизм
`build.py` — минималистичный шаблонизатор на Python. Находит директивы вида:
```html
<!-- INCLUDE css/base.css -->
```
и подставляет содержимое файла на место комментария. Поддерживает вложенные включения. Кодировка — UTF-8.

### Команда
```bash
python frontend/psychstatus/build.py
```

Результат: `frontend/psychstatus/dist/psychstatus.html`

### Нет Node.js / npm
Проект — чистый HTML/CSS/JS. Никаких `npm install`, webpack, gulp. Только Python 3 для сборки.

---

## Архитектура приложения

- **Данные** хранятся в `localStorage` браузера (офлайн, без сервера)
- **Рендер** — динамическая генерация текста на клиенте через `report/builder.js`
- **Стек** — Vanilla JS (без фреймворков), CSS3, HTML5
- **Цель** — работать как файл на рабочем столе врача, без интернета
