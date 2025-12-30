<template>
  <div class="number-counter">
    <div class="counter-group">
      <button 
        class="counter-btn up" 
        @click="increment(0)"
        :disabled="digits[0] >= 9"
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M18 15l-6-6-6 6"/>
        </svg>
      </button>
      <div class="counter-display">{{ digits[0] }}</div>
      <button 
        class="counter-btn down" 
        @click="decrement(0)"
        :disabled="digits[0] <= 0"
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M6 9l6 6 6-6"/>
        </svg>
      </button>
    </div>
    <div class="counter-group">
      <button 
        class="counter-btn up" 
        @click="increment(1)"
        :disabled="digits[1] >= 9"
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M18 15l-6-6-6 6"/>
        </svg>
      </button>
      <div class="counter-display">{{ digits[1] }}</div>
      <button 
        class="counter-btn down" 
        @click="decrement(1)"
        :disabled="digits[1] <= 0"
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M6 9l6 6 6-6"/>
        </svg>
      </button>
    </div>
    <div class="counter-group">
      <button 
        class="counter-btn up" 
        @click="increment(2)"
        :disabled="digits[2] >= 9"
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M18 15l-6-6-6 6"/>
        </svg>
      </button>
      <div class="counter-display">{{ digits[2] }}</div>
      <button 
        class="counter-btn down" 
        @click="decrement(2)"
        :disabled="digits[2] <= 0"
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M6 9l6 6 6-6"/>
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue'

const props = defineProps({
  modelValue: {
    type: [String, Number],
    default: '250'
  },
  min: {
    type: Number,
    default: 50
  },
  max: {
    type: Number,
    default: 2000
  }
})

const emit = defineEmits(['update:modelValue'])

const getValue = () => {
  const num = parseInt(props.modelValue) || 250
  return Math.max(props.min, Math.min(props.max, num))
}

const digits = ref([2, 5, 0])

// Инициализация из modelValue
const initDigits = () => {
  const num = getValue()
  const str = num.toString().padStart(3, '0')
  digits.value = [
    parseInt(str[0]) || 0,
    parseInt(str[1]) || 0,
    parseInt(str[2]) || 0
  ]
}

watch(() => props.modelValue, () => {
  initDigits()
}, { immediate: true })

// Обновление значения при изменении цифр
const updateValue = () => {
  const newValue = digits.value[0] * 100 + digits.value[1] * 10 + digits.value[2]
  const clamped = Math.max(props.min, Math.min(props.max, newValue))
  emit('update:modelValue', clamped.toString())
  
  // Если значение было скорректировано, обновить цифры
  if (clamped !== newValue) {
    const str = clamped.toString().padStart(3, '0')
    digits.value = [
      parseInt(str[0]) || 0,
      parseInt(str[1]) || 0,
      parseInt(str[2]) || 0
    ]
  }
}

const increment = (index) => {
  if (digits.value[index] < 9) {
    digits.value[index]++
    updateValue()
  }
}

const decrement = (index) => {
  if (digits.value[index] > 0) {
    digits.value[index]--
    updateValue()
  }
}
</script>

<style scoped>
.number-counter {
  display: flex;
  gap: 8px;
  align-items: center;
  justify-content: center;
}

.counter-group {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.counter-btn {
  width: 32px;
  height: 24px;
  padding: 0;
  background: var(--surface);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-sm);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-secondary);
  transition: all 0.2s ease;
}

.counter-btn:hover:not(:disabled) {
  background: var(--primary);
  color: white;
  border-color: var(--primary);
}

.counter-btn:active:not(:disabled) {
  transform: scale(0.95);
}

.counter-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.counter-display {
  width: 40px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'JetBrains Mono', monospace;
  font-size: 24px;
  font-weight: 700;
  color: var(--text);
  background: var(--bg);
  border: 2px solid var(--border-light);
  border-radius: var(--radius-sm);
  user-select: none;
}

.counter-group:first-child .counter-display {
  border-color: var(--primary);
  background: var(--primary-light);
}
</style>

