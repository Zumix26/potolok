<template>
  <button
    class="btn secondary"
    :disabled="disabled"
    @click="$emit('click')"
  >
    {{ label }}
  </button>
</template>

<script setup>
defineProps({
  label: {
    type: String,
    required: true
  },
  disabled: {
    type: Boolean,
    default: false
  }
})

defineEmits(['click'])
</script>

<style scoped>
.btn {
  flex: 1;
  height: 52px;
  border-radius: var(--radius-md);
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  position: relative;
  overflow: hidden;
}

.btn.secondary {
  background: var(--surface);
  color: var(--text);
  border: 2px solid var(--border);
}

.btn.secondary:hover {
  border-color: var(--primary);
  color: var(--primary);
}
</style>
