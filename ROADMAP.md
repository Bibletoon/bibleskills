# Roadmap

Планируемые доработки библиотеки скилов. Приоритеты: **P1** — устраняет противоречия или блокирует остальное, **P2** — унификация и чистка, **P3** — инфраструктура и удобство.

Статусы: `[ ]` не начато · `[~]` в работе · `[x]` сделано · `[?]` нужно решение

## Сводка

| # | Задача | Приоритет | Статус | Зависит от |
|---|---|---|---|---|
| 1 | Отказ от `setup-matt-pocock-skills`, локальные файлы по умолчанию | P1 | `[x]` | 2 |
| 2 | Судьба `triage`: удалить или переписать под файлы | P1 | `[x]` | — |
| 3 | Манифест плагина `.claude-plugin/plugin.json` | P1 | `[x]` | — |
| 4 | Переименовать `code-review` (конфликт со встроенным `/code-review`) | P1 | `[x]` | — |
| 5 | Объединить `get-task` и `create-task` | P2 | `[x]` | 1 |
| 6 | Свести проверку/воспроизведение к одной цепочке | P2 | `[x]` не делаем | 2 |
| 7 | Язык инструкций | P2 | `[x]` | — |
| 8 | Единый скелет `SKILL.md` и оформление шаблонов | P2 | `[x]` | — |
| 9 | Убрать дубли про GLOSSARY/ADR | P2 | `[x]` | 1 |
| 10 | Сократить description у model-invoked скилов | P2 | `[x]` не делаем | — |
| 11 | Переименовать и переписать роутер `ask-matt` | P2 | `[x]` | 5 |
| 12 | `UPSTREAM.md` — учёт расхождений с mattpocock/skills | P3 | `[ ]` | — |
| 13 | Скрипт-линтер библиотеки | P3 | `[ ]` | 1, 4 |
| 14 | README: каталог скилов и внешние зависимости | P3 | `[x]` | 11 |
| 15 | Тесты триггеров для похожих скилов | P3 | `[ ]` | — |
| 16 | Нужен ли `grill-me` | P3 | `[x]` удалён | — |
| 17 | Ревью чужой ветки (логика + стандарты + задача) | P2 | `[x]` | — |
| 18 | Проверить `review-branch` с GitLab MCP на рабочей машине | P2 | `[ ]` | 17 |
| 19 | Проверка задачи «свежим взглядом» в `create-task` / `get-task` / `to-spec` | P2 | `[x]` | — |
| 20 | Перенести `ai-slop-cleaner` из oh-my-claudecode | P2 | `[x]` | — |
| 21 | Порог качества для находок `retro` | P3 | `[x]` | — |

---

## P1

---

## P2

### 18. Проверить `review-branch` с GitLab MCP

- [ ] Прогнать на реальном MR: какие инструменты GitLab MCP находят MR по source branch и отдают target branch, описание, URL.
- [ ] При необходимости вписать точные имена инструментов в шаг 1 скила (как `jira_get_issue` у `jit` в `task-builder`).

---

## P3

### 12. `UPSTREAM.md`

- [ ] Записать коммит mattpocock/skills, от которого взята база.
- [ ] По каждому скилу — список собственных изменений, чтобы осознанно вливать новые версии апстрима.

### 13. Скрипт-линтер

- [ ] У каждого `SKILL.md` есть `name` и `description`, `name` совпадает с папкой.
- [ ] Все относительные ссылки существуют.
- [ ] Нет запрещённых строк (`setup-matt-pocock`, `docs/agents`, `issue tracker`, `triage`, `docs/grilling`, `.scratch`, `docs/adr`).
- [ ] Нет совпадений имён со встроенными командами Claude Code.
- [ ] Ссылки на общие файлы — только через `${CLAUDE_PLUGIN_ROOT}/`, вызовы скилов и агентов — только с префиксом `bibleskills:`.
- [ ] Скил с `disable-model-invocation: true` не вызывается через Skill tool из другого скила (модель не может его запустить).
- [ ] Запускать `claude plugin validate . --strict`.
- [ ] Проверки стандарта из `.claude/CLAUDE.md`: нет H1 в начале `SKILL.md`; шаблоны в `<name-template>`, а не в блоках кода; справочные файлы рядом со скилом — `UPPERCASE.md`.
- [ ] Подключить как pre-commit хук или CI.

### 15. Тесты триггеров

- [ ] Пары, которые легко спутать: `get-task`/`create-task`, `grilling`/`grill-with-docs`, `diagnosing-bugs`/`local-verifier`.
- [ ] Прогнать через `skill-creator` или `claude plugin eval`.

---

## Сделано

- [x] **Grilling — один формат везде.** Методика «по одному вопросу + варианты + `AskUserQuestion`» перенесена в `skills/grilling/SKILL.md`, `docs/grilling.md` удалён; `get-task`, `create-task`, `ask-matt` обновлены.
- [x] **AI-Ready task — единый формат задачи.** `docs/ai-ready-task.md` расширен на всю библиотеку (конкретика вместо «durability»); на него переведены `to-spec`, `to-tickets`; `implement` и `implement-spec` соблюдают его поля.
- [x] **Удалён `triage`.**
- [x] **Отказ от `setup-matt-pocock-skills`.** Конвенция локальных файлов — `docs/workspace.md`: всё в `.scratch/<id>/` (`task.md`, `spec.md`, `map.md`, `issues/NN-<slug>.md`, `research/`), статусы `ready → claimed → done | dropped`, строки `Blocked by`/`Type`. Коммитить ли `.scratch/` — решается в каждом репозитории, скилы от этого не зависят. Переведены `to-spec`, `to-tickets`, `implement-spec`, `code-review`, `wayfinder`, `prototype`, `get-task`, `create-task`, `task-builder`, `ask-matt`; папка сетапа удалена.
- [x] **Новый скил `to-jira`.** Долговечный тикет для ручной заливки в Jira (поведение и компоненты, без путей и строк) в `.scratch/<slug>/jira.md`; разделы совпадают с полями AI-Ready, `task-builder` переносит их в задачу при `get-task`. Добавлен в `ask-matt`, `workspace.md`, `ai-ready-task.md`.
- [x] **`code-review` → `review-diff`.** Убран конфликт со встроенным `/code-review`; ссылки в `implement`, `implement-spec`, `tdd`, `ask-matt` обновлены.
- [x] **Плагин Claude Code.** `.claude-plugin/plugin.json` и `marketplace.json` (репозиторий — сам себе маркетплейс), `claude plugin validate --strict` проходит. Ссылки `../../docs/` → `${CLAUDE_PLUGIN_ROOT}/docs/`, вызовы скилов и агентов — с префиксом `bibleskills:`. Проверено загрузкой через `--plugin-dir`: скилы и агенты видны, переменная подставляется.
- [x] **`get-task` и `create-task` — два тонких входа над общим флоу.** Общая часть (экономия контекста, воспроизведение, grilling, финализация, критерии качества) — в `docs/task-flow.md`; `docs/reproduction.md` влит туда шагом A и удалён. Во входах осталась только первичная сборка (сабагент `task-builder` / опрос + идентификатор) и свои критерии.
- [x] **Инструкции на английском.** Переведены `grilling`, `get-task`, `create-task`, `docs/ai-ready-task.md`, `docs/task-flow.md`, строки в `to-tickets` и `task-builder`. Русскими остались триггер-фразы в description и примеры запросов. Правило вывода: вопросы и содержимое артефактов — на языке пользователя; заголовки шаблонов, ключи и значения метаданных — на английском (`grilling`, `task-flow.md`, `ai-ready-task.md`, `workspace.md`). Заголовок задачи: `# Task <ID>`.
- [x] **Единый вид скилов.** Стандарт записан в `.claude/CLAUDE.md` (грузится автоматически при работе в репо, в плагин не входит): три формы скила (процессный / справочный / алиас), без H1, шаги с `**Done when:**`, шаблоны в `<name-template>`, справочные файлы `UPPERCASE.md` рядом или `docs/kebab-case.md` общие, формула description. У скилов Мэта поправлена только механика (H1 убраны в 12 скилах, `Steps` → `Process`, шаблоны в тегах, ссылки, `tdd/MOCKING.md` и `TESTS.md`); свои (`get-task`, `create-task`, `to-jira`, `to-spec`, `docs/task-flow.md`) приведены полностью.
- [x] **Одна папка `.agent-docs/` для всего, что пишут скилы.** Заменила `.scratch/`, корневые `GLOSSARY.md`/`GLOSSARY-MAP.md` и `docs/adr/`: `work/<id>/` (task, spec, jira, map, questionnaire, research, notes, issues), `GLOSSARY.md`, `adr/`, `contexts/<context>/`, `research/`. В рабочих репо — локальный игнор, в домашних — коммит. `docs/domain.md` влит в `docs/workspace.md` («Domain docs»); повторы про словарь/ADR заменены ссылкой на него. В `.agent-docs` переведены и выбивавшиеся `to-questionnaire`, `research`, заметки `implement-spec`. Правило записано в `.claude/CLAUDE.md`.
- [x] **Удалён `tdd`** (пользователем); ссылки из `implement`, `implement-spec`, `ask-matt` убраны.
- [x] **Новый скил `review-branch`** (ручной вызов). Чужая ветка или MR: MR и база — через GitLab MCP (целевая ветка MR), иначе ближайшая из `main`/`master`/`develop`/`release/*`; код читается прямо из git (`git show`/`git grep` по `origin/<branch>`), без checkout и worktree; задача — Jira-ключ из ветки/MR/коммитов через `jit`, запасной источник — описание MR; три параллельных сабагента (Логика / Стандарты / Задача) с серьёзностью, уверенностью и готовым комментарием автору; отчёт в `.agent-docs/work/<id>/review.md` с блоком «Since last review» при повторе, тесты не запускаются (это делает CI). Набор smells вынесен в `docs/code-smells.md` (общий с `review-diff`).
- [x] **Роутер `ask-matt` → `which-skill`.** Переписан под текущий набор: таблица «ситуация → скил», короткий маршрут для одной задачи (`get-task`/`create-task` → `implement`), основной флоу, другие входы (`wayfinder`, `to-jira`, `diagnosing-bugs`), раздел ревью (`review-diff` / `review-branch`), словари, границы фаз (`PHASE-BOUNDARIES.md` переехал), standalone. Указана папка `.agent-docs/`.
- [x] **README.** Установка из `bibletoon/bibleskills`, папка `.agent-docs/` и локальный игнор, каталог скилов по группам (кто вызывает, что делает), сабагенты, зависимости (`jit`, GitLab MCP, bash), структура репо, благодарности. Лицензия MIT Мэта сохранена в `THIRD_PARTY_LICENSES.md`; в `plugin.json` добавлены `homepage`/`repository`, из описания убран TDD.
- [x] **`ai-slop-cleaner` из oh-my-claudecode.** Перенесён в `skills/ai-slop-cleaner/` по стандарту `.claude/CLAUDE.md` (без OMC/Ralph, `## Process` с `Done when`, «When to use / Not here» с разграничением со встроенным `/simplify`); UI-чек-лист обобщён (читаемость для плотных письменностей вместо пункта про корейский). Вызывается моделью; `implement` гоняет его по изменённым файлам перед `review-diff`, `implement-spec` — один раз по интеграционной ветке. Лицензия MIT Yeachan Heo — в `THIRD_PARTY_LICENSES.md`, строка в Credits README, строки в `which-skill`.
- [x] **Тикеты-решения и рабочие тикеты в разных папках.** Тикеты `wayfinder` — в `work/<id>/decisions/`, тикеты `to-tickets` — в `work/<id>/issues/`; нумерация и `Blocked by` у каждой папки свои. Раньше после `wayfinder → to-spec → to-tickets` оба набора попадали в один `issues/` и `implement-spec` взял бы в работу вопросы карты. Правки: `wayfinder`, `docs/workspace.md`, README.
- [x] **Проверка задачи «свежим взглядом».** Новый агент `bibleskills:task-critic` (только чтение: `Read, Grep, Glob`): получает лишь пути к задаче, формату, репо и доменным докам, без разговора; прогоняет задачу «как исполнитель», сверяет ссылки с кодом и ADR, проверяет 9 полей (неоднозначно / не хватает / противоречит / для галочки / непроверяемо); возвращает вердикт и находки с правкой или вопросом пользователю. Встроен в шаг C `docs/task-flow.md` (`get-task`, `create-task`) и шаг 5 `to-spec`; решения по находкам — за пользователем, повтор — по запросу. README, `which-skill` обновлены.
- [x] **Порог качества в `retro`.** Новый шаг фильтра (не гуглится за 5 минут / специфично для проекта / далось реальными усилиями; не прошло — молча отбросить) и шаг выбора места: проверка, стандарты, указатель в `CLAUDE.md`, `.agent-docs/`, проектный скил. Каждое место помечается как командное или личное; если `.agent-docs` игнорируется (рабочий репо), командные правки подаются как предложения команде, предпочтение — личным местам.
- [x] **П. 6 закрыт как «не делаем».** Шаг A `task-flow` (`local-verifier`) и `diagnosing-bugs` остаются независимыми: первый — быстрая проверка понятного бага из задачи, второй — тяжёлая диагностика сложных случаев по ручному вызову. Добавлена одна связка: если воспроизведение нестабильно/частично или причина неясна, шаг A предлагает `/diagnosing-bugs` вместо записи догадки как причины.
- [x] **П. 10 закрыт как «не делаем».** Даже самые длинные описания (`create-task`, `wizard`) — около 110 токенов; подгонка старых скилов экономит копейки. Формула из `.claude/CLAUDE.md` остаётся ориентиром для новых.
- [x] **Удалён `grill-me`.** Алиас только вызывал `grilling`, а тот и так доступен как `/grilling`. Ссылки в `which-skill` и README заменены на `/grilling`.
