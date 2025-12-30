<template>
  <div class="header">
    <button 
      class="back-btn" 
      :disabled="!canGoBack" 
      @click="$emit('back')"
      aria-label="Назад"
      title="Вернуться к предыдущему шагу"
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M19 12H5M12 19l-7-7 7-7"/>
      </svg>
    </button>
    <div class="header-title">
      <span class="title-icon">🏠</span>
      <span>{{ title }}</span>
    </div>
    <button 
      class="close-btn" 
      @click="$emit('close')"
      aria-label="Закрыть"
      title="Закрыть приложение"
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M18 6 6 18M6 6l12 12"/>
      </svg>
    </button>
  </div>
</template>

<script setup>
defineProps({
  canGoBack: {
    type: Boolean,
    required: true
  },
  title: {
    type: String,
    default: 'Замер комнаты'
  }
})

defineEmits(['back', 'close'])
</script>

<style scoped>
.header {
  padding: 16px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: var(--surface);
  border-bottom: 1px solid var(--border-light);
  box-shadow: var(--shadow-sm);
}

.back-btn, .close-btn {
  width: 44px;
  height: 44px;
  border-radius: var(--radius-md);
  border: 2px solid var(--border-light);
  background: var(--surface);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-secondary);
  transition: all 0.2s ease;
}

.back-btn:hover:not(:disabled), .close-btn:hover {
  border-color: var(--primary);
  color: var(--primary);
  background: var(--primary-light);
  transform: scale(1.05);
}

.back-btn:active:not(:disabled), .close-btn:active {
  transform: scale(0.95);
}

.back-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
  background: var(--border-light);
}

.back-btn svg, .close-btn svg {
  width: 20px;
  height: 20px;
}

.header-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 18px;
  font-weight: 700;
  color: var(--text);
}

.title-icon {
  font-size: 22px;
}
</style>
