<template>
  <div class="fixtures-layout">
    <!-- Блок с подсказками -->
    <div class="hints-block">
      <div class="hint-item">
        <span class="hint-icon">💡</span>
        <span class="hint-text">Укажите количество светильников, труб и других элементов</span>
      </div>
      <div class="hint-item">
        <span class="hint-icon">🖱️</span>
        <span class="hint-text">Перетаскивайте элементы на схеме для размещения</span>
      </div>
    </div>

    <!-- Canvas -->
    <div class="canvas-wrapper">
      <PreviewArea 
        :svgContent="svgContent" 
        :viewBox="viewBox"
        @fixture-drag="handleFixtureDrag"
      />
    </div>

    <!-- Форма добавления элементов -->
    <div class="input-form">
      <div class="form-section">
        <div class="section-title">
          <span class="section-icon">💡</span>
          <span>Светильники</span>
        </div>
        <div class="input-group">
          <input
            v-model="store.inputs.fixtureCount"
            type="number"
            :min="0"
            :max="100"
            placeholder="0"
            class="fixture-input"
            @input="store.handleFixtureCountInput($event.target.value)"
            title="Количество светильников"
          />
          <span class="input-label-small">шт.</span>
        </div>
      </div>

      <div class="form-section">
        <div class="section-title">
          <span class="section-icon">🔧</span>
          <span>Трубы и коммуникации</span>
        </div>
        <div class="input-group">
          <input
            v-model="store.inputs.pipeCount"
            type="number"
            :min="0"
            :max="50"
            placeholder="0"
            class="fixture-input"
            @input="store.handlePipeCountInput($event.target.value)"
            title="Количество труб/коммуникаций"
          />
          <span class="input-label-small">шт.</span>
        </div>
      </div>

      <div class="form-section">
        <div class="section-title">
          <span class="section-icon">📦</span>
          <span>Другие элементы</span>
        </div>
        <div class="input-group">
          <input
            v-model="store.inputs.otherCount"
            type="number"
            :min="0"
            :max="50"
            placeholder="0"
            class="fixture-input"
            @input="store.handleOtherCountInput($event.target.value)"
            title="Количество других элементов"
          />
          <span class="input-label-small">шт.</span>
        </div>
      </div>

      <!-- Кнопки действий -->
      <div class="action-buttons-row">
        <button
          class="action-btn back-btn-small"
          :disabled="!store.canGoBack"
          @click="store.handleBack"
          title="Назад"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
        </button>
        <button
          class="action-btn secondary"
          @click="store.handleSkipFixtures"
          title="Пропустить добавление элементов"
        >
          Пропустить
        </button>
        <button
          class="action-btn primary"
          @click="store.handleFinishFixtures"
          title="Завершить и перейти к результатам"
        >
          Завершить
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M5 12h14M12 5l7 7-7 7"/>
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, watch } from 'vue'
import { useRoomMeasurementStore, useSvgRendererStore } from '../../stores'
import PreviewArea from '../ui/PreviewArea.vue'

const store = useRoomMeasurementStore()
const svgStore = useSvgRendererStore()

const svgContent = computed(() => svgStore.getSvgContent('fixtures'))
const viewBox = computed(() => svgStore.getViewBox('fixtures'))

const handleFixtureDrag = (type, id, x, y) => {
  store.updateFixturePosition(type, id, x, y)
}

// Функция для сохранения текущих позиций из DOM перед перерисовкой
const saveCurrentPositions = () => {
  const svgElement = document.querySelector('.preview-svg')
  if (!svgElement) return
  
  // Сохраняем позиции всех элементов из DOM
  const fixtureItems = svgElement.querySelectorAll('.fixture-item')
  fixtureItems.forEach((item) => {
    const type = item.dataset.type
    const id = parseInt(item.dataset.id)
    const transform = item.getAttribute('transform')
    const match = transform?.match(/translate\(([^,]+),\s*([^)]+)\)/)
    if (match) {
      const x = parseFloat(match[1])
      const y = parseFloat(match[2])
      store.updateFixturePosition(type, id, x, y)
    }
  })
}

// Обновлять SVG при изменении количества элементов
watch(() => [
  store.fixtures.lights,
  store.fixtures.pipes,
  store.fixtures.other
], () => {
  // Сохраняем текущие позиции из DOM перед перерисовкой
  saveCurrentPositions()
  // Обновляем только при изменении количества элементов
  // Позиции сохраняются в store.fixturePositions и не теряются
  svgStore.drawFixturesPreview(store.walls, store.corners, store.fixturePositions)
}, { deep: false })

// Инициализировать SVG при монтировании
onMounted(() => {
  svgStore.drawFixturesPreview(store.walls, store.corners, store.fixturePositions)
})
</script>

<style scoped>
.fixtures-layout {
  display: flex;
  flex-direction: column;
  flex: 1;
  gap: 8px;
  padding: 8px;
}

.hints-block {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 10px 12px;
  background: var(--surface);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-sm);
  box-shadow: var(--shadow-sm);
  flex-shrink: 0;
}

.hint-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: var(--text-secondary);
  line-height: 1.4;
}

.hint-icon {
  font-size: 16px;
  flex-shrink: 0;
}

.hint-text {
  flex: 1;
}

.canvas-wrapper {
  position: relative;
  flex: 1;
  min-height: 0;
}

.input-form {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 12px;
  background: var(--surface);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-sm);
  flex-shrink: 0;
}

.form-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  font-weight: 700;
  color: var(--text);
}

.section-icon {
  font-size: 16px;
}

.input-group {
  display: flex;
  align-items: center;
  gap: 8px;
}

.fixture-input {
  flex: 1;
  padding: 8px 12px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 16px;
  font-weight: 700;
  border: 1px solid var(--border-light);
  border-radius: var(--radius-sm);
  background: var(--bg);
  color: var(--text);
  outline: none;
  transition: all 0.2s ease;
  text-align: center;
}

.fixture-input:focus {
  border-color: var(--primary);
  box-shadow: 0 0 0 2px rgba(0, 102, 255, 0.1);
  background: var(--surface);
}

.input-label-small {
  font-size: 11px;
  font-weight: 600;
  color: var(--text-tertiary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  min-width: 30px;
}

.action-buttons-row {
  display: flex;
  gap: 8px;
  align-items: center;
  margin-top: 4px;
}

.back-btn-small {
  width: 40px;
  height: 40px;
  padding: 0;
  background: var(--surface);
  border: 1px solid var(--border-light);
  color: var(--text-secondary);
  flex-shrink: 0;
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.back-btn-small:hover:not(:disabled) {
  border-color: var(--primary);
  color: var(--primary);
  background: rgba(0, 102, 255, 0.05);
}

.back-btn-small:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.back-btn-small svg {
  width: 16px;
  height: 16px;
}

.action-btn {
  flex: 1;
  padding: 10px 16px;
  border: none;
  border-radius: var(--radius-sm);
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
}

.action-btn.primary {
  background: linear-gradient(135deg, var(--primary), var(--primary-dark));
  color: white;
  box-shadow: var(--shadow-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.action-btn.primary:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
}

.action-btn.primary:active:not(:disabled) {
  transform: translateY(0);
}

.action-btn.primary svg {
  width: 14px;
  height: 14px;
}

.action-btn.secondary {
  background: var(--surface);
  color: var(--text);
  border: 1px solid var(--border-light);
}

.action-btn.secondary:hover {
  border-color: var(--primary);
  color: var(--primary);
  transform: translateY(-1px);
  box-shadow: var(--shadow-sm);
}

@media (max-width: 380px) {
  .fixtures-layout {
    padding: 6px;
    gap: 6px;
  }

  .input-form {
    padding: 10px;
    gap: 10px;
  }

  .fixture-input {
    font-size: 14px;
    padding: 6px 10px;
  }

  .action-btn {
    padding: 8px 12px;
    font-size: 12px;
  }
}
</style>

