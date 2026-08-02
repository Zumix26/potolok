<template>
  <div class="next-wall-step">
    <div class="instruction-box">
      <div class="instruction-content">
        <p class="instruction-text">
          Подойдите ко
          {{ store.walls.length === 1 ? 'второй' : `стене ${store.walls.length + 1}` }} и встаньте
          лицом к ней
        </p>
        <p class="instruction-detail">
          Измерьте длину стены {{ String.fromCharCode(65 + store.walls.length) }} →
          {{ String.fromCharCode(66 + store.walls.length) }} от угла до угла
        </p>
      </div>
    </div>

    <div class="illustration">
      <PreviewArea :svg-content="svgContent" :viewBox="viewBox" />
    </div>

    <div class="picker-wrapper">
      <div class="segment-info">
        <span class="segment-label">Длина стены</span>
        <span class="segment-points"
          >{{ String.fromCharCode(65 + store.walls.length) }} →
          {{ String.fromCharCode(66 + store.walls.length) }}</span
        >
      </div>
      <div class="picker-container">
        <DigitPicker
          v-model="store.inputs.nextWall"
          :min="50"
          :max="2000"
          @update:model-value="store.handleNextWallInput"
          @user-interacted="userHasInteracted = true"
        />
        <span class="input-unit">см</span>
      </div>

      <div v-if="store.errors.nextWall" class="error-message">
        ⚠️ Введите значение от 50 до 2000 см
      </div>
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
      <button
        class="next-btn"
        :class="{ active: store.nextWallValid }"
        :disabled="!store.nextWallValid"
        @click="store.handleNextWallNext"
      >
        {{ store.isRoomClosedWithNewWall ? 'Завершить' : 'Далее' }}
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2.5"
          width="20"
          height="20"
        >
          <path d="M9 18l6-6-6-6" />
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

const svgContent = computed(() => svgStore.getSvgContent('next-wall'))
const viewBox = computed(() => svgStore.getViewBox('next-wall'))

// Обновляем SVG при изменении значения
watch(
  () => store.inputs.nextWall,
  (newValue) => {
    if (newValue && newValue !== '') {
      const value = parseFloat(newValue)
      svgStore.drawNextWallPreview(store.walls, store.corners, value)
    }
  }
)

// Инициализировать SVG при монтировании
onMounted(() => {
  // Устанавливаем дефолтное значение 250
  if (!store.inputs.nextWall) {
    store.inputs.nextWall = '250'
  }

  const nextWall = 250
  svgStore.drawNextWallPreview(store.walls, store.corners, nextWall)
})
</script>

<style scoped>
.next-wall-step {
  display: flex;
  flex-direction: column;
  flex: 1;
  padding: 12px 16px;
  padding-bottom: calc(12px + env(safe-area-inset-bottom));
  gap: 0;
  overflow: hidden;
  min-height: 0;
}

.step-badge {
  align-self: flex-start;
  background: #eff6ff;
  color: #2563eb;
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

.illustration {
  background: var(--surface);
  border-radius: 16px;
  padding: 12px;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  flex: 1;
  min-height: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.picker-wrapper {
  margin-top: auto;
  margin-bottom: 0;
  margin-left: auto;
  margin-right: auto;
  flex-shrink: 0;
  background: var(--surface);
  border-radius: 16px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
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

.error-message {
  font-size: 12px;
  color: #ef4444;
  text-align: center;
  padding: 10px;
  background: rgba(239, 68, 68, 0.1);
  border-radius: 10px;
  margin-top: 8px;
  font-weight: 600;
}

.tip {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  margin-top: 8px;
  padding: 8px 10px;
  background: #eff6ff;
  border-radius: 10px;
}

.tip-icon {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
  color: #2563eb;
}

.tip-text {
  font-size: 13px;
  color: #2563eb;
  line-height: 1.3;
  font-weight: 500;
}

.footer-actions {
  margin-top: 8px;
  padding-top: 16px;
  flex-shrink: 0;
  background: var(--bg);
  padding-bottom: max(12px, env(safe-area-inset-bottom));
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

@media (max-width: 768px) {
  .next-wall-step {
    padding: 8px 12px;
  }

  .instruction-box {
    padding: 10px;
    margin-bottom: 10px;
  }

  .instruction-text {
    font-size: 13px;
  }

  .instruction-detail {
    font-size: 11px;
  }

  .illustration {
    padding: 6px;
    margin-bottom: 10px;
  }

  .picker-wrapper {
    padding: 12px;
  }

  .footer-actions {
    padding-top: 8px;
    padding-bottom: calc(8px + env(safe-area-inset-bottom));
  }

  .next-btn,
  .back-btn {
    height: 48px;
    font-size: 15px;
  }

  .back-btn {
    width: 48px;
  }
}
</style>
