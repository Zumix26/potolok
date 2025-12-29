<template>
  <div class="step-content">
    <StepHeader
      :icon="stepIcon"
      title="Диагональ"
      subtitle="Для точности измерьте диагональ комнаты"
    />

    <HelperText
      icon="📐"
      :text="helperText"
    />

    <PreviewArea
      :svgContent="svgContent"
      :viewBox="viewBox"
      @corner-click="handleCornerClick"
    />

    <div v-if="store.diagonals.length > 0" class="diagonals-list">
      <div class="list-header">Добавленные диагонали:</div>
      <div
        v-for="(diagonal, index) in store.diagonals"
        :key="index"
        class="diagonal-item"
      >
        <span class="diagonal-label">
          {{ String.fromCharCode(65 + diagonal.from) }} → {{ String.fromCharCode(65 + diagonal.to) }}:
        </span>
        <span class="diagonal-value">{{ diagonal.length }} см</span>
        <button class="remove-btn" @click="store.removeDiagonal(index)" title="Удалить">
          ✕
        </button>
      </div>
    </div>

    <InputField
      v-model="store.inputs.diagonal"
      placeholder="400"
      :min="100"
      :max="3000"
      unit="сантиметры"
      hint="Измерьте расстояние между выбранными углами"
      :hasError="store.errors.diagonal"
      @update:modelValue="store.handleDiagonalInput"
    />
  </div>

  <ActionButtons>
    <SecondaryButton
      v-if="store.diagonals.length === 0"
      label="Пропустить"
      @click="store.handleSkipDiagonal"
    />
    <SecondaryButton
      v-if="canAddDiagonal"
      label="Добавить диагональ"
      @click="store.handleAddDiagonal"
    />
    <PrimaryButton
      label="Готово"
      :icon="checkIcon"
      :disabled="store.diagonals.length === 0"
      @click="store.handleFinishDiagonals"
    />
  </ActionButtons>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useRoomMeasurementStore, useSvgRendererStore } from '../../stores'
import StepHeader from '../ui/StepHeader.vue'
import PreviewArea from '../ui/PreviewArea.vue'
import InputField from '../ui/InputField.vue'
import PrimaryButton from '../ui/PrimaryButton.vue'
import SecondaryButton from '../ui/SecondaryButton.vue'
import ActionButtons from '../ui/ActionButtons.vue'
import HelperText from '../ui/HelperText.vue'

const store = useRoomMeasurementStore()
const svgStore = useSvgRendererStore()

const svgContent = computed(() => svgStore.getSvgContent('diagonal'))
const viewBox = computed(() => svgStore.getViewBox('diagonal'))

const canAddDiagonal = computed(() => {
  return store.selectedDiagonalFrom !== null &&
         store.selectedDiagonalTo !== null &&
         store.diagonalValid
})

const helperText = computed(() => {
  if (store.selectedDiagonalFrom === null) {
    return store.diagonals.length > 0
      ? 'Кликните на первый угол следующей диагонали (или нажмите "Готово")'
      : 'Кликните на первый угол диагонали'
  } else if (store.selectedDiagonalTo === null) {
    return `Угол ${String.fromCharCode(65 + store.selectedDiagonalFrom)} выбран. Кликните на второй угол`
  } else {
    return `Диагональ: ${String.fromCharCode(65 + store.selectedDiagonalFrom)} → ${String.fromCharCode(65 + store.selectedDiagonalTo)}. Введите длину`
  }
})

const handleCornerClick = (cornerIndex) => {
  if (store.selectedDiagonalFrom === null) {
    store.handleDiagonalFromSelect(cornerIndex)
  } else if (store.selectedDiagonalTo === null && cornerIndex !== store.selectedDiagonalFrom) {
    store.handleDiagonalToSelect(cornerIndex)
  } else if (cornerIndex === store.selectedDiagonalFrom || cornerIndex === store.selectedDiagonalTo) {
    // Сброс выбора при повторном клике
    store.selectedDiagonalFrom = null
    store.selectedDiagonalTo = null
    const svgStore = useSvgRendererStore()
    svgStore.drawDiagonalPreview(store.walls, store.corners, null, null, null, store.diagonals)
  }
}

// Инициализировать SVG при монтировании
onMounted(() => {
  svgStore.drawDiagonalPreview(
    store.walls,
    store.corners,
    store.selectedDiagonalFrom,
    store.selectedDiagonalTo,
    parseFloat(store.inputs.diagonal) || null,
    store.diagonals
  )
})

const stepIcon = `
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
    <path d="M21 3L3 21M8 3h13v13"/>
  </svg>
`

const checkIcon = `
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
    <path d="M20 6L9 17l-5-5"/>
  </svg>
`
</script>

<style scoped>
.step-content {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.diagonals-list {
  margin: 16px 0;
  background: var(--surface);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-md);
  padding: 12px;
}

.list-header {
  font-size: 14px;
  font-weight: 600;
  color: var(--text);
  margin-bottom: 8px;
}

.diagonal-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px;
  background: var(--bg);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-sm);
  margin-bottom: 6px;
}

.diagonal-item:last-child {
  margin-bottom: 0;
}

.diagonal-label {
  font-family: 'JetBrains Mono', monospace;
  font-size: 14px;
  font-weight: 600;
  color: var(--text);
  flex: 1;
}

.diagonal-value {
  font-family: 'JetBrains Mono', monospace;
  font-size: 14px;
  font-weight: 700;
  color: var(--primary);
}

.remove-btn {
  background: transparent;
  border: none;
  color: var(--error, #EF4444);
  font-size: 18px;
  font-weight: bold;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: var(--radius-sm);
  transition: all 0.2s ease;
}

.remove-btn:hover {
  background: var(--error, #EF4444);
  color: white;
}
</style>
