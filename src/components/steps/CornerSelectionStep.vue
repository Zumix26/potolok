<template>
  <div class="corner-selection-step">
    <h1 class="title">Какой угол?</h1>

    <div class="instruction-box">
      <div class="instruction-content">
        <p class="instruction-text">Посмотрите на правый угол стены</p>
        <p class="instruction-detail">
          Определите, куда уходит следующая стена: <strong>на вас</strong> (внутрь комнаты —
          внутренний угол) или <strong>от вас</strong> (выступает наружу — внешний угол)
        </p>
      </div>
    </div>

    <div class="corner-options">
      <!-- Внутренний угол -->
      <button
        class="corner-card"
        :class="{ active: store.selectedCorner === 'inner' }"
        @click="handleCornerClick('inner')"
      >
        <div class="corner-visual">
          <svg viewBox="0 0 160 120" width="180" height="140">
            <defs>
              <marker
                id="arrow-inner"
                markerWidth="3"
                markerHeight="2.5"
                refX="1.5"
                refY="1.25"
                orient="auto"
              >
                <polygon points="0 0, 3 1.25, 0 2.5" fill="#2563EB" />
              </marker>
            </defs>
            <!-- Первая стена (горизонтальная) -->
            <line
              x1="20"
              y1="60"
              x2="60"
              y2="60"
              stroke="#2563EB"
              stroke-width="8"
              stroke-linecap="round"
            />
            <!-- Вторая стена (вертикальная, идет на человека вниз) со стрелкой на конце -->
            <line
              x1="60"
              y1="60"
              x2="60"
              y2="110"
              stroke="#2563EB"
              stroke-width="8"
              marker-end="url(#arrow-inner)"
              stroke-linecap="round"
            />
            <!-- Человечек стоит слева, смотрит направо на угол (как на других шагах) -->
            <circle cx="20" cy="95" r="12" fill="#2563EB" />
            <text x="20" y="101" text-anchor="middle" font-size="14" fill="white">👤</text>
          </svg>
        </div>
        <div class="corner-info">
          <div class="corner-title">Стена идет на меня</div>
        </div>
      </button>

      <!-- Внешний угол -->
      <button
        class="corner-card"
        :class="{ active: store.selectedCorner === 'outer' }"
        @click="handleCornerClick('outer')"
      >
        <div class="corner-visual">
          <svg viewBox="0 0 160 120" width="180" height="140">
            <defs>
              <marker
                id="arrow-outer"
                markerWidth="3"
                markerHeight="2.5"
                refX="1.5"
                refY="1.25"
                orient="auto"
              >
                <polygon points="0 0, 3 1.25, 0 2.5" fill="#2563EB" />
              </marker>
            </defs>
            <!-- Первая стена (горизонтальная) -->
            <line
              x1="20"
              y1="60"
              x2="60"
              y2="60"
              stroke="#2563EB"
              stroke-width="8"
              stroke-linecap="round"
            />
            <!-- Вторая стена (вертикальная, уходит от человека вверх) со стрелкой на конце -->
            <line
              x1="60"
              y1="60"
              x2="60"
              y2="10"
              stroke="#2563EB"
              stroke-width="8"
              marker-end="url(#arrow-outer)"
              stroke-linecap="round"
            />
            <!-- Человечек стоит слева, смотрит направо на угол (как на других шагах) -->
            <circle cx="20" cy="95" r="12" fill="#2563EB" />
            <text x="20" y="101" text-anchor="middle" font-size="14" fill="white">👤</text>
          </svg>
        </div>
        <div class="corner-info">
          <div class="corner-title">Стена уходит от меня</div>
        </div>
      </button>
    </div>

    <div class="footer-actions">
      <button v-if="store.canGoBack" class="back-btn" @click="store.handleBack">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2.5"
          width="20"
          height="20"
        >
          <path d="M15 18l-6-6 6-6" />
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup>
import { useRoomMeasurementStore } from '../../stores'

const store = useRoomMeasurementStore()

const handleCornerClick = (type) => {
  // Устанавливаем выбранный угол
  store.selectedCorner = type
  store.handleCornerSelection(type)
  // Автоматически переходим дальше после выбора угла
  store.handleCornerNext()
}
</script>

<style scoped>
.corner-selection-step {
  display: flex;
  flex-direction: column;
  flex: 1;
  padding: 16px;
  gap: 0;
  overflow: hidden;
  min-height: 0;
  padding-bottom: calc(16px + env(safe-area-inset-bottom));
}

.step-badge {
  align-self: flex-start;
  background: #eff6ff;
  color: #2563eb;
  padding: 4px 12px;
  border-radius: 100px;
  font-size: 12px;
  font-weight: 700;
  margin-bottom: 12px;
}

.title {
  font-size: 28px;
  font-weight: 800;
  line-height: 1.2;
  margin-bottom: 8px;
  color: var(--text);
  text-align: center;
}

.subtitle {
  font-size: 15px;
  color: var(--text-secondary);
  margin-bottom: 24px;
  line-height: 1.4;
  text-align: center;
}

.instruction-box {
  background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
  border: 2px solid #2563eb;
  border-radius: 16px;
  padding: 16px;
  margin-bottom: 20px;
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.1);
}

.instruction-content {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.instruction-text {
  font-size: 15px;
  font-weight: 700;
  color: #1e40af;
  line-height: 1.4;
  margin: 0;
}

.instruction-detail {
  font-size: 13px;
  color: #3b82f6;
  line-height: 1.4;
  margin: 0;
}

.corner-options {
  display: flex;
  flex-direction: column;
  gap: 16px;
  flex: 1;
  min-height: 0;
  justify-content: center;
  padding: 0 8px;
}

.corner-card {
  background: var(--surface);
  border-radius: 24px;
  padding: 32px 24px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: 4px solid transparent;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 20px;
  flex-shrink: 0;
  min-height: 200px;
  width: 100%;
  font-family: inherit;
  text-align: center;
  position: relative;
  overflow: hidden;
}

.corner-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(37, 99, 235, 0.05) 0%, rgba(37, 99, 235, 0.02) 100%);
  opacity: 0;
  transition: opacity 0.3s;
}

.corner-card.active::before {
  opacity: 1;
}

.corner-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.corner-card:active {
  transform: translateY(-2px) scale(0.98);
}

.corner-card.active {
  border-color: #2563eb;
  background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
  box-shadow: 0 8px 24px rgba(37, 99, 235, 0.2);
}

.corner-visual {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.corner-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}

.corner-title {
  font-size: 22px;
  font-weight: 800;
  color: var(--text);
  letter-spacing: -0.5px;
}

.footer-actions {
  margin-top: 8px;
  padding-top: 16px;
  flex-shrink: 0;
  background: var(--bg);
  padding-bottom: max(16px, env(safe-area-inset-bottom));
  display: flex;
  gap: 10px;
  position: relative;
  z-index: 10;
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

@media (max-width: 768px) {
  .corner-selection-step {
    padding: 8px 12px;
  }

  .title {
    font-size: 22px;
    margin-bottom: 6px;
  }

  .instruction-box {
    padding: 10px;
    margin-bottom: 12px;
  }

  .instruction-text {
    font-size: 13px;
  }

  .instruction-detail {
    font-size: 11px;
  }

  .corner-options {
    gap: 12px;
  }

  .corner-card {
    padding: 20px 16px;
    min-height: 160px;
    gap: 16px;
  }

  .corner-visual svg {
    width: 120px;
    height: 120px;
  }

  .corner-title {
    font-size: 18px;
  }

  .footer-actions {
    padding-top: 8px;
    padding-bottom: calc(8px + env(safe-area-inset-bottom));
  }

  .back-btn {
    width: 48px;
    height: 48px;
  }
}
</style>
