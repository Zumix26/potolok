<template>
  <div class="step-content">
    <StepHeader
      :icon="stepIcon"
      title="Замер завершён!"
      subtitle="Ваша комната успешно измерена и рассчитана"
    />

    <div class="preview-wrapper">
      <PreviewArea :svg-content="svgContent" :viewBox="viewBox" />
    </div>

    <div class="result-grid">
      <div class="result-card">
        <div class="result-icon">📏</div>
        <div class="result-value">{{ store.results.perimeter }}</div>
        <div class="result-label">Периметр</div>
        <div class="result-unit">метров</div>
      </div>
      <div class="result-card">
        <div class="result-icon">📐</div>
        <div class="result-value">{{ store.results.area }}</div>
        <div class="result-label">Площадь</div>
        <div class="result-unit">квадратных метров</div>
      </div>
    </div>

    <!-- Информация о диагоналях -->
    <div v-if="store.diagonals.length > 0" class="diagonals-info">
      <div class="info-title">
        <span class="info-icon">📐</span>
        <span>Добавленные диагонали ({{ store.diagonals.length }})</span>
      </div>
      <div class="diagonals-list">
        <div v-for="(diagonal, index) in store.diagonals" :key="index" class="diagonal-item">
          <span class="diagonal-label">
            {{ String.fromCharCode(65 + diagonal.from) }} →
            {{ String.fromCharCode(65 + diagonal.to) }}
          </span>
          <span class="diagonal-length">{{ diagonal.length }} см</span>
        </div>
      </div>
    </div>
  </div>

  <ActionButtons>
    <SecondaryButton label="Новый замер" @click="store.restartApp" />
    <PrimaryButton label="Поделиться" :icon="shareIcon" @click="store.shareResults" />
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
  svgStore.drawResultPreview(store.walls, store.corners, store.fixturePositions)
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
  min-height: 0;
  overflow-y: auto;
  padding: 16px;
  padding-bottom: calc(16px + env(safe-area-inset-bottom));
}

.preview-wrapper {
  flex-shrink: 0;
  margin-bottom: 16px;
  min-height: 200px;
  max-height: 300px;
}

.result-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin: 20px 0;
  flex-shrink: 0;
}

.result-card {
  background: linear-gradient(135deg, var(--surface), var(--primary-light));
  border: 2px solid var(--primary);
  border-radius: var(--radius-lg);
  padding: 24px 20px;
  text-align: center;
  box-shadow: var(--shadow-md);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.result-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, var(--primary), var(--primary-dark));
}

.result-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-lg);
}

.result-icon {
  font-size: 32px;
  margin-bottom: 12px;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
}

.result-value {
  font-size: 32px;
  font-weight: 800;
  color: var(--primary);
  margin-bottom: 6px;
  font-family: 'JetBrains Mono', monospace;
  line-height: 1.2;
}

.result-label {
  font-size: 13px;
  color: var(--text-secondary);
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 4px;
}

.result-unit {
  font-size: 11px;
  color: var(--text-tertiary);
  font-weight: 500;
}

.diagonals-info {
  margin-top: 16px;
  padding: 16px;
  background: var(--surface);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-sm);
  flex-shrink: 0;
}

.info-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 700;
  color: var(--text);
  margin-bottom: 12px;
}

.info-icon {
  font-size: 18px;
}

.diagonals-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.diagonal-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: var(--bg);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-sm);
  font-size: 13px;
}

.diagonal-label {
  font-weight: 600;
  color: var(--text);
  font-family: 'JetBrains Mono', monospace;
}

.diagonal-length {
  font-weight: 700;
  color: var(--primary);
  font-family: 'JetBrains Mono', monospace;
}

@media (max-width: 768px) {
  .step-content {
    padding: 12px;
    padding-bottom: calc(12px + env(safe-area-inset-bottom));
  }

  .preview-wrapper {
    margin-bottom: 12px;
    min-height: 150px;
    max-height: 200px;
  }

  .result-grid {
    gap: 10px;
    margin: 12px 0;
  }

  .result-card {
    padding: 14px 10px;
  }

  .result-icon {
    font-size: 20px;
    margin-bottom: 6px;
  }

  .result-value {
    font-size: 20px;
    margin-bottom: 4px;
  }

  .result-label {
    font-size: 10px;
    margin-bottom: 2px;
  }

  .result-unit {
    font-size: 9px;
  }

  .diagonals-info {
    margin-top: 10px;
    padding: 10px;
  }

  .info-title {
    font-size: 11px;
    margin-bottom: 8px;
  }

  .info-icon {
    font-size: 14px;
  }

  .diagonal-item {
    padding: 6px 8px;
    font-size: 10px;
  }
}
</style>
