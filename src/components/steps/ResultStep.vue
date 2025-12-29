<template>
  <div class="step-content">
    <StepHeader
      :icon="stepIcon"
      title="Замер завершён!"
      subtitle="Ваша комната успешно измерена и рассчитана"
    />

    <PreviewArea :svgContent="svgContent" :viewBox="viewBox" />

    <div class="result-grid">
      <div class="result-card">
        <div class="result-value">{{ store.results.perimeter }}</div>
        <div class="result-label">Периметр (м)</div>
      </div>
      <div class="result-card">
        <div class="result-value">{{ store.results.area }}</div>
        <div class="result-label">Площадь (м²)</div>
      </div>
    </div>
  </div>

  <ActionButtons>
    <SecondaryButton
      label="Новый замер"
      @click="store.restartApp"
    />
    <PrimaryButton
      label="Поделиться"
      :icon="shareIcon"
      @click="store.shareResults"
    />
  </ActionButtons>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useRoomMeasurementStore, useSvgRendererStore } from '../../stores'
import StepHeader from '../ui/StepHeader.vue'
import PreviewArea from '../ui/PreviewArea.vue'
import PrimaryButton from '../ui/PrimaryButton.vue'
import SecondaryButton from '../ui/SecondaryButton.vue'
import ActionButtons from '../ui/ActionButtons.vue'

const store = useRoomMeasurementStore()
const svgStore = useSvgRendererStore()

const svgContent = computed(() => svgStore.getSvgContent('result'))
const viewBox = computed(() => svgStore.getViewBox('result'))

// Инициализировать SVG при монтировании
onMounted(() => {
  svgStore.drawResultPreview(store.walls, store.corners)
})

const stepIcon = `
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
    <path d="M9 12l2 2 4-4M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9z"/>
  </svg>
`

const shareIcon = `
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
    <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8M16 6l-4-4-4 4M12 2v13"/>
  </svg>
`
</script>

<style scoped>
.step-content {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.result-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin: 24px 0;
}

.result-card {
  background: var(--surface);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-md);
  padding: 20px;
  text-align: center;
  box-shadow: var(--shadow-sm);
}

.result-value {
  font-size: 28px;
  font-weight: 800;
  color: var(--primary);
  margin-bottom: 4px;
  font-family: 'JetBrains Mono', monospace;
}

.result-label {
  font-size: 12px;
  color: var(--text-secondary);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
</style>
