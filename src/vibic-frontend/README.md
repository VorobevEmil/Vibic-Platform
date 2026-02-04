# Vibic Frontend

Фронтенд-приложение для платформы Vibic — чат, серверы, голосовые каналы и видеозвонки.

## Возможности

- Личные сообщения (direct messages) с поддержкой реального времени
- Серверы с текстовыми и голосовыми каналами
- Голосовые каналы через WebRTC (peer-to-peer аудио)
- Видеозвонки 1-на-1 с управлением камерой и микрофоном
- Входящий вызов с модальным окном и звуком звонка
- Система друзей: добавление, входящие/исходящие заявки
- Приглашения на сервер по ссылке
- Аутентификация через OAuth 2.0 (OpenIddict)
- Поиск пользователей
- Курсорная пагинация сообщений с подгрузкой истории

## Стек технологий

| Технология | Назначение |
|---|---|
| React 19 | UI-библиотека |
| TypeScript 5.7 | Типизация |
| Vite 6 | Сборка и dev-сервер |
| Tailwind CSS 3 | Стилизация |
| React Router DOM 7 | Маршрутизация |
| SignalR | WebSocket-подключение к бэкенду (чат, звонки) |
| WebRTC | Peer-to-peer аудио и видео |
| Axios | HTTP-клиент |
| Lucide React | Иконки |

## Структура проекта

```
src/
├── api/              # HTTP-клиенты для бэкенд-сервисов
├── assets/           # Статические ресурсы
├── components/
│   ├── Call/         # Компоненты звонков (CallListener, IncomingCallModal, медиа-контроли)
│   ├── Chat/         # Чат (DirectChat, FriendChat, ChatCenterPanel, ChatInput)
│   ├── Footer/       # Футер с профилем пользователя
│   ├── Layout/       # Макет приложения (ServerSidebar, AppShell)
│   ├── SearchUserOverlay/  # Поиск пользователей
│   └── Server/       # Серверы (каналы, голосовые каналы, приглашения)
├── context/          # React-контексты (Auth, Media, Voice)
├── hooks/            # Кастомные хуки (чат, звонки, поиск)
├── layout/           # Общий макет страниц
├── pages/            # Страницы приложения
├── services/         # SignalR-клиенты
├── types/            # TypeScript-типы
└── utils/            # Утилиты (WebRTC конфигурация)
```

## Запуск

### Docker

Запускается автоматически через `docker-compose up --build` из корня проекта. Доступен на http://localhost:3000.

Сборка использует multi-stage: `node:22-alpine` для билда, `nginx:alpine` для раздачи статики. `VITE_API_BASE_URL` передается как build arg (по умолчанию `http://localhost:7157`).

### Переменные окружения

Создайте `.env.local` в корне `src/vibic-frontend`:

```bash
VITE_API_BASE_URL=http://localhost:7157
```

`VITE_API_BASE_URL` указывает на ApiGateway.

### Локально

```bash
npm install
npm run dev
```

### Сборка

```bash
npm run build
npm run preview
```

### Линтер

```bash
npm run lint
```
