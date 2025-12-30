<template>
  <div class="wall-and-corner-step">
    <div class="step-badge">Шаг {{ store.walls.length + 1 }}</div>

    <h1 class="title">{{ store.walls.length === 1 ? 'Следующая стена' : `Стена ${store.walls.length + 1}` }}</h1>
    <p class="subtitle">Продолжайте измерять по часовой стрелке</p>

    <div class="illustration">
      <PreviewArea :svgContent="svgContent" :viewBox="viewBox" />
    </div>

    <div class="picker-wrapper">
      <div class="segment-info">
        <span class="segment-label">Длина стены</span>
        <span class="segment-points">{{ String.fromCharCode(65 + store.walls.length) }} → {{ String.fromCharCode(66 + store.walls.length) }}</span>
      </div>
      <div class="picker-container">
        <DigitPicker
          v-model="store.inputs.nextWall"
          :min="50"
          :max="2000"
          @update:modelValue="store.handleNextWallInput"
          @user-interacted="userHasInteracted = true"
        />
        <span class="input-unit">см</span>
      </div>
    </div>

    <!-- Выбор угла - показывается только если комната не замкнется -->
    <div v-if="!store.isRoomClosedWithNewWall" class="corner-section">
      <h2 class="corner-title">Какой угол справа?</h2>

      <div class="corner-options">
        <!-- Внутренний угол -->
        <div
          class="corner-card"
          :class="{ active: (store.selectedCorner || 'inner') === 'inner' }"
          @click="store.handleCornerSelection('inner')"
        >
          <div class="corner-visual">
            <svg viewBox="0 0 80 80" width="80" height="80">
              <line x1="10" y1="40" x2="40" y2="40" stroke="#2563EB" stroke-width="5" stroke-linecap="round"/>
              <line x1="40" y1="40" x2="40" y2="70" stroke="#2563EB" stroke-width="5" stroke-linecap="round"/>
              <circle cx="40" cy="40" r="6" fill="#2563EB"/>
              <path d="M 50 40 A 10 10 0 0 1 40 50" stroke="#10B981" stroke-width="2.5" fill="none"/>
              <text x="55" y="55" font-size="12" font-weight="700" fill="#10B981">90°</text>
            </svg>
          </div>
          <div class="corner-info">
            <div class="corner-label">Внутренний</div>
          </div>
        </div>

        <!-- Внешний угол -->
        <div
          class="corner-card"
          :class="{ active: (store.selectedCorner || 'inner') === 'outer' }"
          @click="store.handleCornerSelection('outer')"
        >
          <div class="corner-visual">
            <svg viewBox="0 0 80 80" width="80" height="80">
              <line x1="10" y1="40" x2="40" y2="40" stroke="#2563EB" stroke-width="5" stroke-linecap="round"/>
              <line x1="40" y1="40" x2="40" y2="10" stroke="#2563EB" stroke-width="5" stroke-linecap="round"/>
              <circle cx="40" cy="40" r="6" fill="#2563EB"/>
              <path d="M 40 50 A 10 10 0 0 0 50 40" stroke="#F59E0B" stroke-width="2.5" fill="none"/>
              <path d="M 50 40 A 10 10 0 0 0 40 30" stroke="#F59E0B" stroke-width="2.5" fill="none"/>
              <path d="M 40 30 A 10 10 0 0 0 30 40" stroke="#F59E0B" stroke-width="2.5" fill="none"/>
              <path d="M 30 40 A 10 10 0 0 0 40 50" stroke="#F59E0B" stroke-width="2.5" fill="none"/>
              <text x="20" y="65" font-size="11" font-weight="700" fill="#F59E0B">270°</text>
            </svg>
          </div>
          <div class="corner-info">
            <div class="corner-label">Внешний</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Сообщение о замкнутой комнате -->
    <div v-else class="room-closed-alert">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="24" height="24">
        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
      </svg>
      <span>Комната замкнется после добавления этой стены!</span>
    </div>

    <div class="footer-actions">
      <button
        class="next-btn"
        :class="{ active: store.nextWallValid }"
        :disabled="!store.nextWallValid"
        @click="store.handleWallAndCornerNext"
      >
        {{ store.isRoomClosedWithNewWall ? 'Завершить комнату' : 'Добавить стену' }}
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="24" height="24">
          <path d="M9 18l6-6-6-6"/>
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, watch, ref } from 'vue'
import { useRoomMeasurementStore, useSvgRendererStore } from '../../stores'
import PreviewArea from '../ui/PreviewArea.vue'
import DigitPicker from '../ui/DigitPicker.vue'

const store = useRoomMeasurementStore()
const svgStore = useSvgRendererStore()

const userHasInteracted = ref(false)

const svgContent = computed(() => svgStore.getSvgContent('wall-and-corner'))
const viewBox = computed(() => svgStore.getViewBox('wall-and-corner'))

// Обновляем SVG при изменении значений
watch([
  () => store.inputs.nextWall,
  () => store.selectedCorner
], () => {
  const nextWall = parseFloat(store.inputs.nextWall) || 250
  svgStore.drawWallAndCornerPreview(store.walls, store.corners, nextWall, store.selectedCorner || 'inner')
})

// Инициализировать SVG при монтировании
onMounted(() => {
  // Устанавливаем дефолтное значение 250
  if (!store.inputs.nextWall) {
    store.inputs.nextWall = '250'
  }

  const nextWall = 250
  svgStore.drawWallAndCornerPreview(store.walls, store.corners, nextWall, store.selectedCorner || 'inner')
})
</script>

<style scoped>
.wall-and-corner-step {
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
  margin-bottom: 10px;
  line-height: 1.3;
}

.illustration {
  background: var(--surface);
  border-radius: 16px;
  padding: 12px;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
  height: 450px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  overflow: hidden;
}

.picker-wrapper {
  margin-top: auto;
  margin-bottom: 10px;
  margin-left: auto;
  margin-right: auto;
  flex-shrink: 0;
  background: var(--surface);
  border-radius: 16px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
  width: 100%;
  max-width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.segment-info {
  text-align: center;
  margin-bottom: 12px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  align-items: center;
}

.segment-label {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-secondary);
}

.segment-points {
  font-size: 16px;
  font-weight: 800;
  color: var(--primary);
  letter-spacing: 1px;
}

.picker-container {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
}

.input-unit {
  font-size: 20px;
  font-weight: 800;
  color: var(--primary);
  margin-left: 4px;
}

.tip {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  margin-top: 8px;
  padding: 8px 10px;
  background: #EFF6FF;
  border-radius: 10px;
}

.tip-icon {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
  color: #2563EB;
}

.tip-text {
  font-size: 13px;
  color: #2563EB;
  line-height: 1.3;
  font-weight: 500;
}

.corner-section {
  background: var(--surface);
  border-radius: 16px;
  padding: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
  margin-bottom: 10px;
  flex-shrink: 0;
}

.corner-title {
  font-size: 15px;
  font-weight: 800;
  color: var(--text);
  margin-bottom: 12px;
}

.corner-options {
  display: flex;
  gap: 12px;
}

.corner-card {
  flex: 1;
  background: var(--bg);
  border-radius: 16px;
  padding: 16px;
  cursor: pointer;
  transition: all 0.2s;
  border: 3px solid transparent;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
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
  text-align: center;
}

.corner-label {
  font-size: 14px;
  font-weight: 700;
  color: var(--text);
}

.room-closed-alert {
  display: flex;
  align-items: center;
  gap: 12px;
  background: #D1FAE5;
  border: 2px solid #10B981;
  border-radius: 16px;
  padding: 16px;
  margin-bottom: 16px;
  color: #065F46;
  font-size: 15px;
  font-weight: 600;
}

.room-closed-alert svg {
  flex-shrink: 0;
  color: #10B981;
}

.footer-actions {
  margin-top: auto;
  padding-top: 10px;
  flex-shrink: 0;
  position: sticky;
  bottom: 0;
  background: var(--bg);
  padding-bottom: 12px;
}

.next-btn {
  width: 100%;
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
  .wall-and-corner-step {
    padding: 10px 14px;
  }

  .title {
    font-size: 22px;
  }

  .subtitle {
    font-size: 13px;
  }

  .illustration {
    padding: 10px;
    height: 150px;
  }

  .corner-options {
    flex-direction: column;
  }

  .next-btn {
    height: 52px;
    font-size: 16px;
  }
}
</style>
