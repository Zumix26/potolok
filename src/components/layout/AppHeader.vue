<template>
  <div class="header">
    <button class="back-btn" :disabled="!canGoBack" @click="$emit('back')">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M19 12H5M12 19l-7-7 7-7"/>
      </svg>
    </button>
    <div class="header-title">{{ title }}</div>
    <button class="close-btn" @click="$emit('close')">
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
}

.back-btn, .close-btn {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 1px solid var(--border);
  background: var(--surface);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-secondary);
  transition: all 0.2s;
}

.back-btn:hover, .close-btn:hover {
  border-color: var(--primary);
  color: var(--primary);
}

.back-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.header-title {
  font-size: 16px;
  font-weight: 700;
  color: var(--text);
}
</style>
