<template>
  <div class="progress-container">
    <div class="progress-bar">
      <div class="progress-fill" :style="{ width: progress + '%' }">
        <div class="progress-glow"></div>
      </div>
    </div>
    <div class="progress-steps">
      <div class="step-indicator">
        <span class="step-number">{{ currentStep + 1 }}</span>
        <span class="step-separator">/</span>
        <span class="step-total">{{ totalSteps }}</span>
        <span class="step-text">шаг</span>
      </div>
      <div class="progress-percent">{{ progressPercent }}%</div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  progress: {
    type: Number,
    required: true
  },
  currentStep: {
    type: Number,
    required: true
  },
  totalSteps: {
    type: Number,
    required: true
  }
})

const progressPercent = computed(() => Math.round(props.progress))
</script>

<style scoped>
.progress-container {
  position: sticky;
  top: 0;
  z-index: 100;
  background: var(--surface);
  border-bottom: 1px solid var(--border-light);
}

.progress-bar {
  height: 4px;
  background: var(--border-light);
  position: relative;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--primary), var(--primary-dark));
  transition: width 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  border-radius: 0 2px 2px 0;
  position: relative;
  overflow: hidden;
}

.progress-glow {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
  animation: shimmer 2s infinite;
}

@keyframes shimmer {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}

.progress-steps {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 20px;
}

.step-indicator {
  display: flex;
  align-items: baseline;
  gap: 4px;
  font-size: 14px;
  font-weight: 600;
  color: var(--text);
  font-family: 'JetBrains Mono', monospace;
}

.step-number {
  font-size: 18px;
  font-weight: 800;
  color: var(--primary);
}

.step-separator {
  color: var(--text-tertiary);
  font-weight: 400;
}

.step-total {
  color: var(--text-secondary);
  font-weight: 500;
}

.step-text {
  margin-left: 6px;
  font-size: 12px;
  color: var(--text-secondary);
  font-weight: 500;
  font-family: -apple-system, BlinkMacSystemFont, sans-serif;
}

.progress-percent {
  font-size: 12px;
  font-weight: 600;
  color: var(--text-tertiary);
  font-family: 'JetBrains Mono', monospace;
}
</style>
