<template>
  <div class="input-section">
    <div class="input-wrapper">
      <input
        type="number"
        class="input-field"
        :class="{ error: hasError }"
        :value="modelValue"
        :placeholder="placeholder"
        :min="min"
        :max="max"
        @input="$emit('update:modelValue', $event.target.value)"
      />
      <div class="input-unit">{{ unit }}</div>
      <div class="input-hint">{{ hint }}</div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  modelValue: {
    type: [String, Number],
    default: ''
  },
  placeholder: {
    type: String,
    default: ''
  },
  min: {
    type: Number,
    default: 0
  },
  max: {
    type: Number,
    default: 10000
  },
  unit: {
    type: String,
    default: 'сантиметры'
  },
  hint: {
    type: String,
    default: 'Введите значение'
  },
  hasError: {
    type: Boolean,
    default: false
  }
})

defineEmits(['update:modelValue'])
</script>

<style scoped>
.input-section {
  margin: 24px 0;
}

.input-wrapper {
  position: relative;
  margin-bottom: 16px;
}

.input-field {
  width: 100%;
  height: 56px;
  border: 2px solid var(--border);
  border-radius: var(--radius-md);
  font-size: 24px;
  font-weight: 700;
  font-family: 'JetBrains Mono', monospace;
  text-align: center;
  outline: none;
  transition: all 0.2s;
  background: var(--surface);
}

.input-field:focus {
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(0, 102, 255, 0.1);
}

.input-field.error {
  border-color: var(--error);
  animation: shake 0.3s;
}

@keyframes shake {
  0%,
  100% {
    transform: translateX(0);
  }
  25% {
    transform: translateX(-4px);
  }
  75% {
    transform: translateX(4px);
  }
}

.input-unit {
  text-align: center;
  font-size: 13px;
  font-weight: 600;
  color: var(--text-secondary);
  margin-top: 8px;
  font-family: 'JetBrains Mono', monospace;
}

.input-hint {
  font-size: 13px;
  color: var(--text-tertiary);
  text-align: center;
  margin-top: 4px;
}

@media (max-width: 380px) {
  .input-field {
    font-size: 20px;
  }
}
</style>
