<template>
  <div class="diagonal-step">
    <h1 class="title">Диагональ</h1>
    <p class="subtitle">
      Для более точного расчета площади измерьте диагональ комнаты. Выберите два противоположных
      угла на схеме и укажите расстояние между ними.
    </p>

    <div class="illustration">
      <PreviewArea :svg-content="svgContent" :viewBox="viewBox" @corner-click="handleCornerClick" />
      <!-- Список добавленных диагоналей поверх канваса -->
      <div v-if="store.diagonals.length > 0" class="diagonals-section">
        <h2 class="diagonals-title">Добавленные диагонали</h2>
        <div class="diagonals-list">
          <div v-for="(diagonal, index) in store.diagonals" :key="index" class="diagonal-item">
            <span class="diagonal-label">
              {{ String.fromCharCode(65 + diagonal.from) }} →
              {{ String.fromCharCode(65 + diagonal.to) }}: {{ diagonal.length }} см
            </span>
            <button class="remove-btn" @click="store.removeDiagonal(index)">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2.5"
                width="16"
                height="16"
              >
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Инструкция по выбору углов -->
    <div
      v-if="store.selectedDiagonalFrom === null || store.selectedDiagonalTo === null"
      class="instruction-section"
    >
      <div class="instruction-content">
        <svg
          class="instruction-icon"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <circle cx="12" cy="12" r="10" />
          <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
        <div class="instruction-text">
          <div v-if="store.selectedDiagonalFrom === null">
            Нажмите на первый угол диагонали на схеме
          </div>
          <div v-else>Нажмите на второй угол (противоположный)</div>
        </div>
      </div>
    </div>

    <!-- Ввод длины диагонали -->
    <div
      v-if="store.selectedDiagonalFrom !== null && store.selectedDiagonalTo !== null"
      class="input-section"
    >
      <label class="input-label">
        Диагональ {{ String.fromCharCode(65 + store.selectedDiagonalFrom) }} →
        {{ String.fromCharCode(65 + store.selectedDiagonalTo) }}
      </label>
      <div class="picker-container">
        <DigitPicker
          v-model="store.inputs.diagonal"
          :min="100"
          :max="3000"
          @update:model-value="store.handleDiagonalInput"
          @user-interacted="userHasInteracted = true"
        />
        <span class="input-unit">см</span>
      </div>

      <div class="tip">
        <svg
          class="tip-icon"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <path
            d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"
          />
        </svg>
        <span class="tip-text">Измерьте расстояние между выбранными углами</span>
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

      <!-- Когда выбраны оба угла и диагональ валидна - показываем "Добавить диагональ" -->
      <button
        v-if="
          store.selectedDiagonalFrom !== null &&
          store.selectedDiagonalTo !== null &&
          store.diagonalValid
        "
        class="add-diagonal-btn active"
        @click="store.handleAddDiagonal"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2.5"
          width="20"
          height="20"
        >
          <path d="M20 6L9 17l-5-5" />
        </svg>
        Добавить диагональ
      </button>

      <!-- Когда выбраны оба угла, но диагональ не валидна - показываем "Пропустить" -->
      <button
        v-if="
          store.selectedDiagonalFrom !== null &&
          store.selectedDiagonalTo !== null &&
          !store.diagonalValid
        "
        class="skip-btn"
        @click="store.handleSkipDiagonal"
      >
        Пропустить
      </button>

      <!-- Когда НЕ выбраны оба угла и нет диагоналей - показываем "Пропустить" -->
      <button
        v-if="
          (store.selectedDiagonalFrom === null || store.selectedDiagonalTo === null) &&
          store.diagonals.length === 0
        "
        class="skip-btn"
        @click="store.handleSkipDiagonal"
      >
        Пропустить
      </button>

      <!-- Когда НЕ выбраны оба угла, но есть диагонали - показываем "Завершить" -->
      <button
        v-if="
          (store.selectedDiagonalFrom === null || store.selectedDiagonalTo === null) &&
          store.diagonals.length > 0
        "
        class="next-btn active"
        @click="store.handleFinishDiagonals"
      >
        Завершить ({{ store.diagonals.length }})
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

const svgContent = computed(() => svgStore.getSvgContent('diagonal'))
const viewBox = computed(() => svgStore.getViewBox('diagonal'))

const handleCornerClick = (cornerIndex) => {
  if (store.selectedDiagonalFrom === null) {
    store.handleDiagonalFromSelect(cornerIndex)
  } else if (store.selectedDiagonalTo === null && cornerIndex !== store.selectedDiagonalFrom) {
    store.handleDiagonalToSelect(cornerIndex)
  } else if (
    cornerIndex === store.selectedDiagonalFrom ||
    cornerIndex === store.selectedDiagonalTo
  ) {
    // Сброс выбора при повторном клике
    store.selectedDiagonalFrom = null
    store.selectedDiagonalTo = null
    svgStore.drawDiagonalPreview(store.walls, store.corners, null, null, null, store.diagonals)
  }
}

// Обновляем SVG при изменении
watch(
  [
    () => store.inputs.diagonal,
    () => store.selectedDiagonalFrom,
    () => store.selectedDiagonalTo,
    () => store.diagonals.length
  ],
  () => {
    svgStore.drawDiagonalPreview(
      store.walls,
      store.corners,
      store.selectedDiagonalFrom,
      store.selectedDiagonalTo,
      parseFloat(store.inputs.diagonal) || 300,
      store.diagonals
    )
  }
)

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
  padding: 16px;
  padding-bottom: calc(16px + env(safe-area-inset-bottom));
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
  margin-bottom: 20px;
  line-height: 1.4;
  text-align: center;
}

.illustration {
  background: var(--surface);
  border-radius: 20px;
  padding: 16px;
  margin-bottom: 16px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  flex: 1;
  min-height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 1;
  overflow: hidden;
  position: relative;
}

.instruction-section {
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
  border: 3px solid #f59e0b;
  border-radius: 18px;
  padding: 20px;
  margin-bottom: 16px;
  flex-shrink: 0;
  box-shadow: 0 4px 12px rgba(245, 158, 11, 0.2);
}

.instruction-content {
  display: flex;
  align-items: center;
  gap: 14px;
}

.instruction-icon {
  width: 32px;
  height: 32px;
  flex-shrink: 0;
  color: #d97706;
}

.instruction-text {
  font-size: 16px;
  font-weight: 700;
  color: #92400e;
  line-height: 1.5;
}

.input-section {
  background: var(--surface);
  border-radius: 20px;
  padding: 24px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  margin-bottom: 16px;
  flex-shrink: 0;
}

.input-label {
  font-size: 16px;
  font-weight: 800;
  color: var(--text);
  margin-bottom: 16px;
  display: block;
  text-align: center;
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
}

.tip {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  margin-top: 16px;
  padding: 12px 16px;
  background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
  border-radius: 14px;
  border: 2px solid #2563eb;
}

.tip-icon {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
  color: #2563eb;
}

.tip-text {
  font-size: 14px;
  color: #1e40af;
  line-height: 1.4;
  font-weight: 600;
}

.add-diagonal-btn {
  width: 100%;
  height: 64px;
  margin-top: 20px;
  border: none;
  border-radius: 18px;
  background: var(--border-light);
  color: var(--text-secondary);
  font-size: 18px;
  font-weight: 800;
  cursor: not-allowed;
  font-family: inherit;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.add-diagonal-btn.active {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  cursor: pointer;
  box-shadow: 0 8px 24px rgba(16, 185, 129, 0.3);
}

.add-diagonal-btn.active:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 32px rgba(16, 185, 129, 0.4);
}

.add-diagonal-btn.active:active {
  transform: translateY(0) scale(0.98);
}

.diagonals-section {
  position: absolute;
  top: 4px;
  right: 4px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 6px;
  padding: 4px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
  max-width: 120px;
  max-height: 100px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  z-index: 100;
  border: 1px solid rgba(16, 185, 129, 0.3);
  pointer-events: auto;
}

.diagonals-title {
  font-size: 7px;
  font-weight: 800;
  color: var(--text);
  margin-bottom: 2px;
  text-transform: uppercase;
  letter-spacing: 0.2px;
  text-align: center;
  flex-shrink: 0;
  line-height: 1.2;
}

.diagonals-list {
  display: flex;
  flex-direction: column;
  gap: 2px;
  overflow-y: auto;
  flex: 1;
  min-height: 0;
}

.diagonals-list::-webkit-scrollbar {
  width: 2px;
}

.diagonals-list::-webkit-scrollbar-thumb {
  background: rgba(16, 185, 129, 0.3);
  border-radius: 1px;
}

.diagonal-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);
  border: 1px solid #10b981;
  border-radius: 4px;
  padding: 2px 4px;
  box-shadow: 0 1px 2px rgba(16, 185, 129, 0.2);
  transition: all 0.2s;
  flex-shrink: 0;
}

.diagonal-label {
  font-size: 8px;
  font-weight: 700;
  color: #065f46;
  font-family: 'JetBrains Mono', monospace;
  line-height: 1.1;
}

.remove-btn {
  background: transparent;
  border: none;
  color: #ef4444;
  cursor: pointer;
  padding: 1px;
  border-radius: 3px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  width: 12px;
  height: 12px;
  flex-shrink: 0;
  margin-left: 3px;
}

.remove-btn svg {
  width: 10px;
  height: 10px;
}

.remove-btn:hover {
  background: #ef4444;
  color: white;
  transform: scale(1.1);
}

.footer-actions {
  margin-top: auto;
  padding-top: 16px;
  display: flex;
  gap: 12px;
  flex-shrink: 0;
  position: sticky;
  bottom: 0;
  background: var(--bg);
  padding-bottom: max(12px, env(safe-area-inset-bottom));
}

.back-btn {
  width: 64px;
  height: 64px;
  border: 3px solid var(--border-light);
  border-radius: 18px;
  background: var(--surface);
  color: var(--text);
  cursor: pointer;
  font-family: inherit;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  flex-shrink: 0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.back-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
  border-color: var(--primary);
}

.back-btn:active {
  transform: translateY(0) scale(0.95);
}

.skip-btn {
  flex: 1;
  height: 64px;
  border: 3px solid var(--border-light);
  border-radius: 18px;
  background: var(--surface);
  color: var(--text-secondary);
  font-size: 16px;
  font-weight: 800;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.skip-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
  border-color: var(--primary);
  color: var(--primary);
}

.skip-btn:active {
  transform: translateY(0) scale(0.98);
}

.next-btn {
  flex: 2;
  height: 64px;
  border: none;
  border-radius: 18px;
  background: var(--border-light);
  color: var(--text-secondary);
  font-size: 18px;
  font-weight: 800;
  cursor: not-allowed;
  font-family: inherit;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.next-btn.active {
  background: linear-gradient(135deg, var(--primary) 0%, #1d4ed8 100%);
  color: white;
  cursor: pointer;
  box-shadow: 0 8px 24px rgba(37, 99, 235, 0.3);
}

.next-btn.active:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 32px rgba(37, 99, 235, 0.4);
}

.next-btn.active:active {
  transform: translateY(0) scale(0.98);
}

@media (max-width: 768px) {
  .diagonal-step {
    padding: 8px 12px;
  }

  .title {
    font-size: 22px;
    margin-bottom: 6px;
  }

  .subtitle {
    font-size: 13px;
    margin-bottom: 12px;
  }

  .instruction-section {
    padding: 10px;
    margin-bottom: 10px;
  }

  .instruction-text {
    font-size: 12px;
  }

  .illustration {
    padding: 6px;
    margin-bottom: 10px;
  }

  .input-section {
    padding: 10px;
    margin-bottom: 10px;
  }

  .footer-actions {
    padding-top: 8px;
    padding-bottom: calc(8px + env(safe-area-inset-bottom));
  }

  .add-diagonal-btn,
  .skip-btn,
  .next-btn {
    height: 48px;
    font-size: 15px;
  }

  .back-btn {
    width: 48px;
    height: 48px;
  }
}
</style>
