# FSD Todo Notes

SPA-приложение на Nuxt 3 для заметок со списками задач. Реализация следует ТЗ: две страницы приложения, Feature-Sliced Design, ручная синхронизация Pinia-store с `localStorage`, черновики, undo/redo без сторонних библиотек и подтверждения через собственные модальные окна.

## Стек

- Nuxt 3, Vue 3 Composition API, TypeScript strict
- Pinia
- SCSS
- Vitest
- Docker + docker-compose

## Архитектура

Код разложен по FSD-слоям:

- `src/app` - глобальные стили и провайдеры
- `src/pages` - страницы `/` и `/notes/[id]`
- `src/widgets` - крупные сценарные блоки
- `src/features` - действия пользователя
- `src/entities` - модель и UI заметки
- `src/shared` - общие компоненты и утилиты

## Команды

Нужен Node.js 22 или новее.

Основной вариант:

```bash
pnpm install
pnpm dev
pnpm test
pnpm typecheck
pnpm build
```

Если `pnpm` не установлен, приложение можно запустить через `npm`:

```bash
npm install
npm run dev
npm run test
npm run typecheck
npm run build
```

## Docker

```bash
docker-compose up
```

Приложение будет доступно на `http://localhost:3000`.
