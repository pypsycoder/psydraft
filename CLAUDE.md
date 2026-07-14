# PsyDraft — Справочник для Claude Code

## Что это

Офлайн-инструменты для врачей: структурированный сбор данных осмотра → автогенерация текста консультации. Каждый модуль работает как один самодостаточный HTML-файл без сервера.

- **psychstatus** — приём психиатра (жалобы, психический статус, нозология, диагноз, рекомендации, назначения)
- **somnology** — сомнологический приём (сон, шкалы ISI/ESS/STOP-Bang, диагностика, план лечения)

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
├── somnology/
│   ├── build.py                     # сборщик (Python, тот же механизм INCLUDE)
│   ├── dist/
│   │   └── somnology.html           # итоговый файл (результат сборки)
│   └── src/
│       ├── index.template.html      # главный шаблон с директивами INCLUDE
│       ├── css/
│       │   └── app.css              # все стили модуля одним файлом
│       ├── js/
│       │   └── app.js               # вся логика модуля одним файлом
│       └── sections/                # 9 секций формы (sidebar, general, sleep, scales, advisor, diagnosis, plan, result, time_picker)
└── шаблон консультации психиатра.html  # исходный прототип (не в сборке)
```

---

## Ключевые файлы

## psychstatus

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

## somnology

### Сборка
| Файл | Роль |
|------|------|
| `build.py` | Читает `index.template.html`, раскрывает `<!-- INCLUDE ... -->`, пишет `dist/somnology.html` |
| `src/index.template.html` | Точка входа: `<head>` со стилями, sidebar, секции формы, футер, time_picker, `<script>` с логикой |
| `dist/somnology.html` | Единый HTML-файл, открывается прямо в браузере |

### CSS/JS
В отличие от `psychstatus`, стили и логика не дробятся на модули — по одному файлу на всё:
- `src/css/app.css` — все стили
- `src/js/app.js` — вся логика (расчёт шкал ISI/ESS/STOP-Bang, советник, сборка текста консультации)

### Секции форм (`src/sections/`)
| Файл | Роль |
|------|------|
| `sidebar.html` | Навигация по секциям |
| `general.html` | Общие данные приёма |
| `sleep.html` | Анамнез сна |
| `scales.html` | Опросники ISI, ESS, STOP-Bang |
| `advisor.html` | Диагностический советник |
| `diagnosis.html` | Диагноз |
| `plan.html` | План лечения |
| `result.html` | Итоговый текст консультации |
| `time_picker.html` | Виджет выбора времени |

---

## Сборка

### Механизм
`build.py` (свой у каждого модуля, идентичный по логике) — минималистичный шаблонизатор на Python. Находит директивы вида:
```html
<!-- INCLUDE css/base.css -->
```
и подставляет содержимое файла на место комментария. Поддерживает вложенные включения. Кодировка — UTF-8.

### Команды
```bash
python frontend/psychstatus/build.py   # → frontend/psychstatus/dist/psychstatus.html
python somnology/build.py              # → somnology/dist/somnology.html
```

### Нет Node.js / npm
Проект — чистый HTML/CSS/JS. Никаких `npm install`, webpack, gulp. Только Python 3 для сборки.

---

## Архитектура приложения

- **Данные** хранятся в `localStorage` браузера (офлайн, без сервера)
- **Рендер** — динамическая генерация текста на клиенте (`report/builder.js` в psychstatus, `app.js` в somnology)
- **Стек** — Vanilla JS (без фреймворков), CSS3, HTML5
- **Цель** — работать как файл на рабочем столе врача, без интернета
- Оба модуля независимы: свой `build.py`, свой `src/`, свой `dist/*.html`; общего кода между ними нет
