<template>
  <div class="corner-selection-step">
    <div class="step-badge">Шаг 2</div>

    <h1 class="title">Какой угол?</h1>
    <p class="subtitle">Выберите тип угла справа от первой стены</p>

    <div class="corner-options">
      <!-- Внутренний угол -->
      <div
        class="corner-card"
        :class="{ active: store.selectedCorner === 'inner' }"
        @click="store.handleCornerSelection('inner')"
      >
        <div class="corner-visual">
          <svg viewBox="0 0 120 120" width="120" height="120">
            <!-- Две стены образующие внутренний угол (90°) -->
            <line x1="20" y1="60" x2="60" y2="60" stroke="#2563EB" stroke-width="6" stroke-linecap="round"/>
            <line x1="60" y1="60" x2="60" y2="100" stroke="#2563EB" stroke-width="6" stroke-linecap="round"/>
            <!-- Угловая точка -->
            <circle cx="60" cy="60" r="8" fill="#2563EB"/>
            <!-- Дуга угла -->
            <path d="M 75 60 A 15 15 0 0 1 60 75" stroke="#10B981" stroke-width="3" fill="none"/>
            <!-- Текст 90° -->
            <text x="80" y="80" font-size="16" font-weight="700" fill="#10B981">90°</text>
          </svg>
        </div>
        <div class="corner-info">
          <div class="corner-title">Внутренний угол</div>
          <div class="corner-description">Обычный угол комнаты (как в углу между двумя стенами)</div>
        </div>
      </div>

      <!-- Внешний угол -->
      <div
        class="corner-card"
        :class="{ active: store.selectedCorner === 'outer' }"
        @click="store.handleCornerSelection('outer')"
      >
        <div class="corner-visual">
          <svg viewBox="0 0 120 120" width="120" height="120">
            <!-- Две стены образующие внешний угол (270°) -->
            <line x1="20" y1="60" x2="60" y2="60" stroke="#2563EB" stroke-width="6" stroke-linecap="round"/>
            <line x1="60" y1="60" x2="60" y2="20" stroke="#2563EB" stroke-width="6" stroke-linecap="round"/>
            <!-- Угловая точка -->
            <circle cx="60" cy="60" r="8" fill="#2563EB"/>
            <!-- Дуга угла (внешняя) -->
            <path d="M 60 75 A 15 15 0 0 0 75 60" stroke="#F59E0B" stroke-width="3" fill="none"/>
            <path d="M 75 60 A 15 15 0 0 0 60 45" stroke="#F59E0B" stroke-width="3" fill="none"/>
            <path d="M 60 45 A 15 15 0 0 0 45 60" stroke="#F59E0B" stroke-width="3" fill="none"/>
            <path d="M 45 60 A 15 15 0 0 0 60 75" stroke="#F59E0B" stroke-width="3" fill="none"/>
            <!-- Текст 270° -->
            <text x="35" y="95" font-size="16" font-weight="700" fill="#F59E0B">270°</text>
          </svg>
        </div>
        <div class="corner-info">
          <div class="corner-title">Внешний угол</div>
          <div class="corner-description">Выступающий угол (как угол колонны или выступа)</div>
        </div>
      </div>
    </div>

    <div class="footer-actions">
      <button
        v-if="store.canGoBack"
        class="back-btn"
        @click="store.handleBack"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="20" height="20">
          <path d="M15 18l-6-6 6-6"/>
        </svg>
      </button>
      <button
        class="next-btn"
        :class="{ active: store.selectedCorner }"
        :disabled="!store.selectedCorner"
        @click="handleNext"
      >
        Далее
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="20" height="20">
          <path d="M9 18l6-6-6-6"/>
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup>
import { useRoomMeasurementStore } from '../../stores'

const store = useRoomMeasurementStore()

const handleNext = () => {
  if (store.selectedCorner) {
    store.handleCornerNext()
  }
}
</script>

<style scoped>
.corner-selection-step {
  display: flex;
  flex-direction: column;
  flex: 1;
  padding: 12px 16px;
  gap: 0;
  overflow-y: auto;
  min-height: 0;
}

.step-badge {
  align-self: flex-start;
  background: #EFF6FF;
  color: #2563EB;
  padding: 4px 12px;
  border-radius: 100px;
  font-size: 12px;
  font-weight: 700;
  margin-bottom: 10px;
}

.title {
  font-size: 24px;
  font-weight: 800;
  line-height: 1.2;
  margin-bottom: 6px;
  color: var(--text);
}

.subtitle {
  font-size: 14px;
  color: var(--text-secondary);
  margin-bottom: 12px;
  line-height: 1.3;
}

.corner-options {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 12px;
}

.corner-card {
  background: var(--surface);
  border-radius: 16px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
  cursor: pointer;
  transition: all 0.2s;
  border: 3px solid transparent;
  display: flex;
  gap: 14px;
  align-items: center;
  flex-shrink: 0;
}

.corner-card:active {
  transform: scale(0.98);
}

.corner-card.active {
  border-color: #2563EB;
  background: #EFF6FF;
}

.corner-visual {
  flex-shrink: 0;
}

.corner-info {
  flex: 1;
}

.corner-title {
  font-size: 16px;
  font-weight: 800;
  margin-bottom: 4px;
  color: var(--text);
}

.corner-description {
  font-size: 13px;
  color: var(--text-secondary);
  line-height: 1.3;
}

.footer-actions {
  margin-top: auto;
  padding-top: 10px;
  flex-shrink: 0;
  position: sticky;
  bottom: 0;
  background: var(--bg);
  padding-bottom: 12px;
  display: flex;
  gap: 10px;
}

.back-btn {
  width: 56px;
  height: 56px;
  border: 2px solid var(--border-light);
  border-radius: 12px;
  background: var(--surface);
  color: var(--text);
  cursor: pointer;
  font-family: inherit;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  flex-shrink: 0;
}

.back-btn:active {
  transform: scale(0.95);
}

.next-btn {
  flex: 1;
  height: 56px;
  border: none;
  border-radius: 12px;
  background: var(--border-light);
  color: var(--text-secondary);
  font-size: 17px;
  font-weight: 800;
  cursor: not-allowed;
  font-family: inherit;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.2s;
}

.next-btn.active {
  background: var(--primary);
  color: white;
  cursor: pointer;
}

.next-btn.active:active {
  transform: scale(0.98);
}

@media (max-width: 380px) {
  .corner-selection-step {
    padding: 10px 14px;
  }

  .title {
    font-size: 22px;
  }

  .subtitle {
    font-size: 13px;
  }

  .corner-card {
    flex-direction: column;
    text-align: center;
  }

  .next-btn,
  .back-btn {
    height: 52px;
    font-size: 16px;
  }

  .back-btn {
    width: 52px;
  }
}
</style>
