<template>
  <div class="diagonal-step">
    <div class="step-badge">Шаг {{ 3 + store.walls.length }}</div>

    <h1 class="title">Диагональ</h1>
    <p class="subtitle">Измерьте диагональ для точного расчета площади</p>

    <div class="illustration">
      <PreviewArea
        :svgContent="svgContent"
        :viewBox="viewBox"
        @corner-click="handleCornerClick"
      />
    </div>

    <!-- Инструкция по выбору углов -->
    <div v-if="store.selectedDiagonalFrom === null || store.selectedDiagonalTo === null" class="instruction-section">
      <div class="instruction-content">
        <svg class="instruction-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"/>
          <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
          <line x1="12" y1="17" x2="12.01" y2="17"/>
        </svg>
        <div class="instruction-text">
          <div v-if="store.selectedDiagonalFrom === null">
            Нажмите на первый угол диагонали на схеме
          </div>
          <div v-else>
            Нажмите на второй угол (противоположный)
          </div>
        </div>
      </div>
    </div>

    <!-- Ввод длины диагонали -->
    <div v-if="store.selectedDiagonalFrom !== null && store.selectedDiagonalTo !== null" class="input-section">
      <label class="input-label">
        Диагональ {{ String.fromCharCode(65 + store.selectedDiagonalFrom) }} → {{ String.fromCharCode(65 + store.selectedDiagonalTo) }}
      </label>
      <div class="picker-container">
        <DigitPicker
          v-model="store.inputs.diagonal"
          :min="100"
          :max="3000"
          @update:modelValue="store.handleDiagonalInput"
          @user-interacted="userHasInteracted = true"
        />
        <span class="input-unit">см</span>
      </div>

      <div class="tip">
        <svg class="tip-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
        </svg>
        <span class="tip-text">Измерьте расстояние между выбранными углами</span>
      </div>

      <button
        class="add-diagonal-btn"
        :class="{ active: store.diagonalValid }"
        :disabled="!store.diagonalValid"
        @click="store.handleAddDiagonal"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="20" height="20">
          <path d="M20 6L9 17l-5-5"/>
        </svg>
        Добавить диагональ
      </button>
    </div>

    <!-- Список добавленных диагоналей -->
    <div v-if="store.diagonals.length > 0" class="diagonals-section">
      <h2 class="diagonals-title">Добавленные диагонали</h2>
      <div class="diagonals-list">
        <div
          v-for="(diagonal, index) in store.diagonals"
          :key="index"
          class="diagonal-item"
        >
          <span class="diagonal-label">
            {{ String.fromCharCode(65 + diagonal.from) }} → {{ String.fromCharCode(65 + diagonal.to) }}: {{ diagonal.length }} см
          </span>
          <button class="remove-btn" @click="store.removeDiagonal(index)">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="16" height="16">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </button>
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
        v-if="store.diagonals.length === 0"
        class="skip-btn"
        @click="store.handleSkipDiagonal"
      >
        Пропустить
      </button>
      <button
        class="next-btn"
        :class="{ active: store.diagonals.length > 0 }"
        :disabled="store.diagonals.length === 0"
        @click="store.handleFinishDiagonals"
      >
        {{ store.diagonals.length > 0 ? `Завершить (${store.diagonals.length})` : 'Добавьте диагональ' }}
        <svg v-if="store.diagonals.length > 0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="20" height="20">
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

const svgContent = computed(() => svgStore.getSvgContent('diagonal'))
const viewBox = computed(() => svgStore.getViewBox('diagonal'))

const handleCornerClick = (cornerIndex) => {
  if (store.selectedDiagonalFrom === null) {
    store.handleDiagonalFromSelect(cornerIndex)
  } else if (store.selectedDiagonalTo === null && cornerIndex !== store.selectedDiagonalFrom) {
    store.handleDiagonalToSelect(cornerIndex)
  } else if (cornerIndex === store.selectedDiagonalFrom || cornerIndex === store.selectedDiagonalTo) {
    // Сброс выбора при повторном клике
    store.selectedDiagonalFrom = null
    store.selectedDiagonalTo = null
    svgStore.drawDiagonalPreview(store.walls, store.corners, null, null, null, store.diagonals)
  }
}

// Обновляем SVG при изменении
watch([
  () => store.inputs.diagonal,
  () => store.selectedDiagonalFrom,
  () => store.selectedDiagonalTo,
  () => store.diagonals.length
], () => {
  svgStore.drawDiagonalPreview(
    store.walls,
    store.corners,
    store.selectedDiagonalFrom,
    store.selectedDiagonalTo,
    parseFloat(store.inputs.diagonal) || 300,
    store.diagonals
  )
})

// Инициализировать SVG при монтировании
onMounted(() => {
  // Устанавливаем дефолтное значение 300
  if (!store.inputs.diagonal) {
    store.inputs.diagonal = '300'
  }

  svgStore.drawDiagonalPreview(
    store.walls,
    store.corners,
    store.selectedDiagonalFrom,
    store.selectedDiagonalTo,
    300,
    store.diagonals
  )
})
</script>

<style scoped>
.diagonal-step {
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
  margin-bottom: 10px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
  height: 180px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  overflow: hidden;
}

.instruction-section {
  background: #FEF3C7;
  border: 2px solid #F59E0B;
  border-radius: 14px;
  padding: 12px;
  margin-bottom: 10px;
  flex-shrink: 0;
}

.instruction-content {
  display: flex;
  align-items: center;
  gap: 12px;
}

.instruction-icon {
  width: 28px;
  height: 28px;
  flex-shrink: 0;
  color: #D97706;
}

.instruction-text {
  font-size: 15px;
  font-weight: 600;
  color: #92400E;
  line-height: 1.4;
}

.input-section {
  background: var(--surface);
  border-radius: 16px;
  padding: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
  margin-bottom: 10px;
  flex-shrink: 0;
}

.input-label {
  font-size: 13px;
  font-weight: 700;
  color: var(--text-secondary);
  margin-bottom: 8px;
  display: block;
}

.picker-container {
  display: flex;
  align-items: center;
  gap: 12px;
}

.input-unit {
  font-size: 18px;
  font-weight: 700;
  color: var(--text-secondary);
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

.add-diagonal-btn {
  width: 100%;
  height: 52px;
  margin-top: 16px;
  border: none;
  border-radius: 12px;
  background: var(--border-light);
  color: var(--text-secondary);
  font-size: 16px;
  font-weight: 700;
  cursor: not-allowed;
  font-family: inherit;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.2s;
}

.add-diagonal-btn.active {
  background: #10B981;
  color: white;
  cursor: pointer;
}

.add-diagonal-btn.active:active {
  transform: scale(0.98);
}

.diagonals-section {
  background: var(--surface);
  border-radius: 16px;
  padding: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
  margin-bottom: 10px;
  flex-shrink: 0;
}

.diagonals-title {
  font-size: 14px;
  font-weight: 800;
  color: var(--text-secondary);
  margin-bottom: 12px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.diagonals-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.diagonal-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #D1FAE5;
  border: 2px solid #10B981;
  border-radius: 12px;
  padding: 12px 16px;
}

.diagonal-label {
  font-size: 14px;
  font-weight: 700;
  color: #065F46;
  font-family: 'JetBrains Mono', monospace;
}

.remove-btn {
  background: transparent;
  border: none;
  color: #EF4444;
  cursor: pointer;
  padding: 4px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.remove-btn:hover {
  background: #EF4444;
  color: white;
}

.footer-actions {
  margin-top: auto;
  padding-top: 10px;
  display: flex;
  gap: 10px;
  flex-shrink: 0;
  position: sticky;
  bottom: 0;
  background: var(--bg);
  padding-bottom: 12px;
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

.skip-btn {
  flex: 1;
  height: 56px;
  border: 2px solid var(--border-light);
  border-radius: 12px;
  background: var(--surface);
  color: var(--text-secondary);
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.2s;
}

.skip-btn:active {
  transform: scale(0.98);
}

.next-btn {
  flex: 2;
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
  .diagonal-step {
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

  .next-btn,
  .skip-btn,
  .back-btn {
    height: 52px;
    font-size: 16px;
  }

  .back-btn {
    width: 52px;
  }
}
</style>
