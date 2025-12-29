<template>
  <div class="step-content">
    <StepHeader
      :icon="stepIcon"
      title="Стена с дверью"
      subtitle="Начните замер со стены, в которой находится дверь в комнату"
    />

    <HelperText
      icon="💡"
      text="Встаньте лицом к стене с дверью и измерьте её длину рулеткой"
    />

    <PreviewArea :svgContent="svgContent" :viewBox="viewBox" />

    <InputField
      v-model="store.inputs.firstWall"
      placeholder="250"
      :min="50"
      :max="2000"
      unit="сантиметры"
      hint="Введите длину стены в сантиметрах"
      :hasError="store.errors.firstWall"
      @update:modelValue="store.handleFirstWallInput"
    />

    <div class="corner-selection">
      <CornerOption
        type="inner"
        title="Внутренний угол"
        description="Комната поворачивает внутрь (обычный угол)"
        :svgContent="innerCornerSvg"
        :isSelected="store.selectedCorner === 'inner'"
        @select="store.handleCornerSelection('inner')"
      />

      <CornerOption
        type="outer"
        title="Внешний угол"
        description="Выступ или ниша (L-образный поворот)"
        :svgContent="outerCornerSvg"
        :isSelected="store.selectedCorner === 'outer'"
        @select="store.handleCornerSelection('outer')"
      />
    </div>

    <HelperText
      icon="🧭"
      text="Внутренний угол - обычный угол комнаты. Внешний угол - выступ или ниша"
    />
  </div>

  <ActionButtons>
    <PrimaryButton
      label="Далее"
      :icon="nextIcon"
      :disabled="!store.firstWallValid || !store.selectedCorner"
      @click="store.handleFirstWallNext"
    />
  </ActionButtons>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useRoomMeasurementStore, useSvgRendererStore } from '../../stores'

import StepHeader from '../ui/StepHeader.vue'
import PreviewArea from '../ui/PreviewArea.vue'
import InputField from '../ui/InputField.vue'
import PrimaryButton from '../ui/PrimaryButton.vue'
import ActionButtons from '../ui/ActionButtons.vue'
import HelperText from '../ui/HelperText.vue'
import CornerOption from '../ui/CornerOption.vue'

const store = useRoomMeasurementStore()
const svgStore = useSvgRendererStore()

const svgContent = computed(() => svgStore.getSvgContent('first-wall'))
const viewBox = computed(() => svgStore.getViewBox('first-wall'))

// Инициализировать SVG при монтировании
onMounted(() => {
  svgStore.drawFirstWallPreview(parseFloat(store.inputs.firstWall) || 250, store.selectedCorner)
})

const stepIcon = `
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
    <rect x="3" y="4" width="18" height="2"/>
    <rect x="3" y="18" width="18" height="2"/>
    <rect x="11" y="6" width="2" height="12"/>
  </svg>
`

const nextIcon = `
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
    <path d="M5 12h14M12 5l7 7-7 7"/>
  </svg>
`

const innerCornerSvg = `
  <svg viewBox="0 0 60 60" fill="none">
    <path d="M10 30 L30 30 L30 50" stroke="#0066FF" stroke-width="4" stroke-linecap="round" fill="none"/>
    <path d="M25 30 A5 5 0 0 0 30 35" stroke="#10B981" stroke-width="2" fill="none"/>
    <circle cx="30" cy="30" r="3" fill="#0066FF"/>
    <text x="35" y="42" font-size="9" fill="#10B981" font-weight="700">90°</text>
    <path d="M15 25 L20 30 L15 35" stroke="#0066FF" stroke-width="2" fill="none" stroke-linecap="round"/>
    <path d="M25 45 L30 40 L35 45" stroke="#0066FF" stroke-width="2" fill="none" stroke-linecap="round"/>
  </svg>
`

const outerCornerSvg = `
  <svg viewBox="0 0 60 60" fill="none">
    <path d="M10 30 L30 30 L30 10" stroke="#0066FF" stroke-width="4" stroke-linecap="round" fill="none"/>
    <path d="M25 30 A10 10 0 1 1 30 20" stroke="#F59E0B" stroke-width="2" fill="none"/>
    <circle cx="30" cy="30" r="3" fill="#0066FF"/>
    <text x="12" y="20" font-size="8" fill="#F59E0B" font-weight="700">270°</text>
    <path d="M15 25 L20 30 L15 35" stroke="#0066FF" stroke-width="2" fill="none" stroke-linecap="round"/>
    <path d="M25 15 L30 20 L35 15" stroke="#0066FF" stroke-width="2" fill="none" stroke-linecap="round"/>
  </svg>
`
</script>

<style scoped>
.step-content {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.corner-selection {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin: 24px 0 16px;
}

@media (max-width: 380px) {
  .corner-selection {
    gap: 12px;
  }
}
</style>
