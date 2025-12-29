<template>
  <button
    class="btn primary"
    :disabled="disabled"
    @click="$emit('click')"
  >
    {{ label }}
    <div v-if="icon" v-html="icon" />
  </button>
</template>

<script setup>
defineProps({
  label: {
    type: String,
    required: true
  },
  icon: {
    type: String,
    default: ''
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
  border: none;
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

.btn::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  transform: translate(-50%, -50%);
  transition: all 0.3s;
}

.btn:active::before {
  width: 300px;
  height: 300px;
}

.btn.primary {
  background: linear-gradient(135deg, var(--primary), var(--primary-dark));
  color: white;
  box-shadow: var(--shadow-md);
}

.btn.primary:hover {
  transform: translateY(-1px);
  box-shadow: var(--shadow-lg);
}

.btn.primary:disabled {
  background: var(--border);
  color: var(--text-tertiary);
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.btn :deep(svg) {
  width: 16px;
  height: 16px;
}
</style>
