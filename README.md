# Potolok Wizard - Замер комнаты

Vue 3 приложение для замера комнаты с пошаговым мастером.

## Установка

```bash
npm install
```

## Запуск в режиме разработки

```bash
npm run dev
```

Приложение будет доступно по адресу `http://localhost:3000`

## Сборка для production

```bash
npm run build
```

Собранные файлы будут в папке `dist/`

## Предпросмотр production сборки

```bash
npm run preview
```

## Структура проекта

```
potolok-wizard/
├── src/
│   ├── assets/
│   │   └── styles.css          # Глобальные стили
│   ├── composables/
│   │   └── useRoomMeasurement.js # Логика приложения
│   ├── utils/
│   │   └── roomCalculations.js  # Функции расчета
│   ├── App.vue                  # Главный компонент
│   └── main.js                  # Точка входа
├── index.html
├── package.json
├── vite.config.js
└── README.md
```

## Технологии

- Vue 3 (Composition API)
- Vite
- Vanilla JavaScript

## Функционал

- Пошаговый мастер замера комнаты
- Визуализация комнаты в реальном времени
- Расчет периметра и площади
- Поддержка внутренних и внешних углов
- Опциональный замер диагонали

