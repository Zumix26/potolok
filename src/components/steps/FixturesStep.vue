<template>
  <div class="fixtures-layout">
    <!-- Блок с подсказками -->
    <div class="hints-block">
      <div class="hint-item">
        <span class="hint-text">Укажите количество светильников, труб и других элементов, которые нужно учесть при расчете потолка</span>
      </div>
      <div class="hint-item">
        <span class="hint-text">После указания количества, перетаскивайте элементы на схеме для точного размещения</span>
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
          <span>Светильники</span>
        </div>
        <div class="input-group">
          <button class="counter-btn" @click="decrementFixture" :disabled="(parseInt(store.inputs.fixtureCount) || 0) <= 0">-</button>
          <span class="counter-value">{{ store.inputs.fixtureCount }}</span>
          <button class="counter-btn" @click="incrementFixture" :disabled="(parseInt(store.inputs.fixtureCount) || 0) >= 100">+</button>
          <span class="input-label-small">шт.</span>
        </div>
      </div>

      <div class="form-section">
        <div class="section-title">
          <span>Трубы и коммуникации</span>
        </div>
        <div class="input-group">
          <button class="counter-btn" @click="decrementPipe" :disabled="(parseInt(store.inputs.pipeCount) || 0) <= 0">-</button>
          <span class="counter-value">{{ store.inputs.pipeCount }}</span>
          <button class="counter-btn" @click="incrementPipe" :disabled="(parseInt(store.inputs.pipeCount) || 0) >= 50">+</button>
          <span class="input-label-small">шт.</span>
        </div>
      </div>

      <div class="form-section">
        <div class="section-title">
          <span>Другие элементы</span>
        </div>
        <div class="input-group">
          <button class="counter-btn" @click="decrementOther" :disabled="(parseInt(store.inputs.otherCount) || 0) <= 0">-</button>
          <span class="counter-value">{{ store.inputs.otherCount }}</span>
          <button class="counter-btn" @click="incrementOther" :disabled="(parseInt(store.inputs.otherCount) || 0) >= 50">+</button>
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

const incrementFixture = () => {
  const current = parseInt(store.inputs.fixtureCount) || 0
  if (current < 100) {
    store.handleFixtureCountInput(String(current + 1))
  }
}

const decrementFixture = () => {
  const current = parseInt(store.inputs.fixtureCount) || 0
  if (current > 0) {
    store.handleFixtureCountInput(String(current - 1))
  }
}

const incrementPipe = () => {
  const current = parseInt(store.inputs.pipeCount) || 0
  if (current < 50) {
    store.handlePipeCountInput(String(current + 1))
  }
}

const decrementPipe = () => {
  const current = parseInt(store.inputs.pipeCount) || 0
  if (current > 0) {
    store.handlePipeCountInput(String(current - 1))
  }
}

const incrementOther = () => {
  const current = parseInt(store.inputs.otherCount) || 0
  if (current < 50) {
    store.handleOtherCountInput(String(current + 1))
  }
}

const decrementOther = () => {
  const current = parseInt(store.inputs.otherCount) || 0
  if (current > 0) {
    store.handleOtherCountInput(String(current - 1))
  }
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

// Watch больше не нужен, так как сохранение позиций происходит в store методах

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
  padding-bottom: calc(8px + env(safe-area-inset-bottom));
  min-height: 0;
  overflow: hidden;
}

.hints-block {
  display: flex;
  flex-direction: row;
  gap: 8px;
  padding: 10px 12px;
  background: linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%);
  border: 2px solid #2563EB;
  border-radius: 14px;
  box-shadow: 0 2px 8px rgba(37, 99, 235, 0.15);
  flex-shrink: 0;
}

.hint-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #1E40AF;
  line-height: 1.3;
  font-weight: 600;
  flex: 1;
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
  min-height: 300px;
  background: var(--surface);
  border-radius: 14px;
  padding: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  flex-shrink: 1;
  overflow: hidden;
}

.input-form {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px;
  background: var(--surface);
  border: 2px solid var(--border-light);
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  flex-shrink: 0;
}

.form-section {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 10px 12px;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.5) 0%, rgba(255, 255, 255, 0.3) 100%);
  border-radius: 12px;
  border: 2px solid var(--border-light);
  transition: all 0.3s;
}

.form-section:hover {
  border-color: var(--primary);
  box-shadow: 0 2px 8px rgba(37, 99, 235, 0.1);
}

.section-title {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  font-weight: 800;
  color: var(--text);
  flex: 1;
}

.section-icon {
  font-size: 18px;
}

.input-group {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.counter-btn {
  width: 36px;
  height: 36px;
  border: 2px solid var(--border-light);
  border-radius: 8px;
  background: var(--surface);
  color: var(--text);
  font-size: 20px;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  flex-shrink: 0;
}

.counter-btn:hover:not(:disabled) {
  background: var(--primary);
  color: white;
  border-color: var(--primary);
}

.counter-btn:active:not(:disabled) {
  transform: scale(0.95);
}

.counter-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.counter-value {
  min-width: 40px;
  text-align: center;
  font-size: 18px;
  font-weight: 700;
  color: var(--text);
  font-family: 'JetBrains Mono', monospace;
}

.fixture-input {
  width: 80px;
  padding: 8px 12px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 18px;
  font-weight: 800;
  border: 2px solid var(--border-light);
  border-radius: 12px;
  background: var(--bg);
  color: var(--text);
  outline: none;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  text-align: center;
  box-shadow: 0 2px 6px rgba(0,0,0,0.05);
}

.fixture-input:focus {
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.15), 0 2px 8px rgba(37, 99, 235, 0.2);
  background: var(--surface);
}

.input-label-small {
  font-size: 12px;
  font-weight: 800;
  color: var(--primary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  min-width: 30px;
}

.action-buttons-row {
  display: flex;
  gap: 8px;
  align-items: center;
  margin-top: 4px;
  flex-shrink: 0;
}

.back-btn-small {
  width: 44px;
  height: 44px;
  padding: 0;
  background: var(--surface);
  border: 2px solid var(--border-light);
  color: var(--text-secondary);
  flex-shrink: 0;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 6px rgba(0,0,0,0.08);
}

.back-btn-small:hover:not(:disabled) {
  border-color: var(--primary);
  color: var(--primary);
  background: rgba(37, 99, 235, 0.05);
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0,0,0,0.12);
}

.back-btn-small:active:not(:disabled) {
  transform: translateY(0) scale(0.95);
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
  padding: 12px 14px;
  border: none;
  border-radius: 14px;
  font-size: 14px;
  font-weight: 800;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  min-height: 44px;
}

.action-btn.primary {
  background: linear-gradient(135deg, var(--primary) 0%, #1D4ED8 100%);
  color: white;
  box-shadow: 0 8px 24px rgba(37, 99, 235, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.action-btn.primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 12px 32px rgba(37, 99, 235, 0.4);
}

.action-btn.primary:active:not(:disabled) {
  transform: translateY(0) scale(0.98);
}

.action-btn.primary svg {
  width: 18px;
  height: 18px;
}

.action-btn.secondary {
  background: var(--surface);
  color: var(--text);
  border: 3px solid var(--border-light);
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
}

.action-btn.secondary:hover {
  border-color: var(--primary);
  color: var(--primary);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.12);
}

.action-btn.secondary:active {
  transform: translateY(0) scale(0.98);
}

@media (max-width: 768px) {
  .fixtures-layout {
    padding: 6px;
    gap: 6px;
  }

  .hints-block {
    padding: 8px;
    margin-bottom: 8px;
  }

  .hint-text {
    font-size: 11px;
  }

  .canvas-wrapper {
    min-height: 200px;
  }

  .input-form {
    padding: 8px;
    gap: 8px;
  }

  .form-section {
    padding: 6px 8px;
    gap: 8px;
  }

  .section-title {
    font-size: 12px;
  }

  .counter-btn {
    width: 32px;
    height: 32px;
    font-size: 18px;
  }

  .counter-value {
    min-width: 35px;
    font-size: 16px;
  }

  .fixture-input {
    font-size: 14px;
    padding: 6px 10px;
    max-width: 70px;
  }

  .action-buttons-row {
    gap: 6px;
  }

  .action-btn,
  .back-btn-small {
    min-height: 40px;
    font-size: 13px;
    padding: 8px 12px;
  }

  .back-btn-small {
    width: 40px;
    height: 40px;
  }

  .action-btn {
    padding: 8px 12px;
    font-size: 12px;
  }
}
</style>

