<template>
  <div class="digit-picker">
    <div class="digit-scroll" ref="hundreds" @scroll="handleScroll">
      <div class="digit-spacer"></div>
      <div
        v-for="digit in 10"
        :key="'h' + (digit - 1)"
        class="digit-item"
        :class="{ active: (digit - 1) === currentHundreds }"
      >
        {{ digit - 1 }}
      </div>
      <div class="digit-spacer"></div>
    </div>

    <div class="digit-scroll" ref="tens" @scroll="handleScroll">
      <div class="digit-spacer"></div>
      <div
        v-for="digit in 10"
        :key="'t' + (digit - 1)"
        class="digit-item"
        :class="{ active: (digit - 1) === currentTens }"
      >
        {{ digit - 1 }}
      </div>
      <div class="digit-spacer"></div>
    </div>

    <div class="digit-scroll" ref="ones" @scroll="handleScroll">
      <div class="digit-spacer"></div>
      <div
        v-for="digit in 10"
        :key="'o' + (digit - 1)"
        class="digit-item"
        :class="{ active: (digit - 1) === currentOnes }"
      >
        {{ digit - 1 }}
      </div>
      <div class="digit-spacer"></div>
    </div>

    <div class="picker-selection"></div>
    <div class="picker-overlay top"></div>
    <div class="picker-overlay bottom"></div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, nextTick } from 'vue'

const props = defineProps({
  modelValue: {
    type: [String, Number],
    default: ''
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

const emit = defineEmits(['update:modelValue', 'user-interacted'])

const hundreds = ref(null)
const tens = ref(null)
const ones = ref(null)

const currentHundreds = ref(0)
const currentTens = ref(0)
const currentOnes = ref(0)

const isScrolling = ref(false)
const scrollTimeout = ref(null)
const isInitialized = ref(false)
const hasUserInteracted = ref(false)

const ITEM_HEIGHT = 70

const currentValue = computed(() => {
  return currentHundreds.value * 100 +
         currentTens.value * 10 +
         currentOnes.value
})

const handleScroll = () => {
  if (!isInitialized.value) return

  // Mark as interacted on first scroll
  if (!hasUserInteracted.value) {
    hasUserInteracted.value = true
    emit('user-interacted')
  }

  if (isScrolling.value) {
    clearTimeout(scrollTimeout.value)
  }

  isScrolling.value = true

  scrollTimeout.value = setTimeout(() => {
    snapToNearest()
    isScrolling.value = false
  }, 150)
}

const snapToNearest = () => {
  if (hundreds.value) {
    const hIndex = Math.round(hundreds.value.scrollTop / ITEM_HEIGHT)
    currentHundreds.value = Math.min(9, Math.max(0, hIndex))
    hundreds.value.scrollTo({
      top: currentHundreds.value * ITEM_HEIGHT,
      behavior: 'smooth'
    })
  }

  if (tens.value) {
    const tIndex = Math.round(tens.value.scrollTop / ITEM_HEIGHT)
    currentTens.value = Math.min(9, Math.max(0, tIndex))
    tens.value.scrollTo({
      top: currentTens.value * ITEM_HEIGHT,
      behavior: 'smooth'
    })
  }

  if (ones.value) {
    const oIndex = Math.round(ones.value.scrollTop / ITEM_HEIGHT)
    currentOnes.value = Math.min(9, Math.max(0, oIndex))
    ones.value.scrollTo({
      top: currentOnes.value * ITEM_HEIGHT,
      behavior: 'smooth'
    })
  }

  // Emit value with interaction state
  const value = currentValue.value
  if (hasUserInteracted.value && value >= props.min && value <= props.max) {
    emit('update:modelValue', value.toString())
  }
}

const setValueFromProps = (value) => {
  if (!value || value === '') {
    currentHundreds.value = 0
    currentTens.value = 0
    currentOnes.value = 0
    return
  }

  const numValue = parseInt(value)
  if (isNaN(numValue)) return

  currentHundreds.value = Math.floor(numValue / 100) % 10
  currentTens.value = Math.floor(numValue / 10) % 10
  currentOnes.value = numValue % 10
}

watch(() => props.modelValue, (newValue) => {
  // Игнорируем обновления из props до взаимодействия пользователя
  if (!hasUserInteracted.value) return

  if (newValue && parseInt(newValue) !== currentValue.value) {
    setValueFromProps(newValue)
    nextTick(() => {
      if (hundreds.value) hundreds.value.scrollTop = currentHundreds.value * ITEM_HEIGHT
      if (tens.value) tens.value.scrollTop = currentTens.value * ITEM_HEIGHT
      if (ones.value) ones.value.scrollTop = currentOnes.value * ITEM_HEIGHT
    })
  }
})

onMounted(() => {
  nextTick(() => {
    // Если есть начальное значение - устанавливаем его без emit
    if (props.modelValue) {
      const numValue = parseInt(props.modelValue)
      currentHundreds.value = Math.floor(numValue / 100) % 10
      currentTens.value = Math.floor(numValue / 10) % 10
      currentOnes.value = numValue % 10

      if (hundreds.value) hundreds.value.scrollTop = currentHundreds.value * ITEM_HEIGHT
      if (tens.value) tens.value.scrollTop = currentTens.value * ITEM_HEIGHT
      if (ones.value) ones.value.scrollTop = currentOnes.value * ITEM_HEIGHT
    } else {
      // Иначе начинаем с 0
      if (hundreds.value) hundreds.value.scrollTop = 0
      if (tens.value) tens.value.scrollTop = 0
      if (ones.value) ones.value.scrollTop = 0
    }

    // Включаем обработку скролла только после инициализации
    setTimeout(() => {
      isInitialized.value = true
    }, 100)
  })
})
</script>

<style scoped>
.digit-picker {
  position: relative;
  height: 220px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
}

.digit-scroll {
  width: 80px;
  height: 100%;
  overflow-y: scroll;
  scroll-snap-type: y mandatory;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
  position: relative;
}

.digit-scroll::-webkit-scrollbar {
  display: none;
}

.digit-scroll:not(:last-of-type)::after {
  content: '';
  position: absolute;
  right: -6px;
  top: 50%;
  transform: translateY(-50%);
  width: 2px;
  height: 40px;
  background: var(--border-light);
  border-radius: 1px;
}

.digit-spacer {
  height: 105px;
  flex-shrink: 0;
}

.digit-item {
  height: 70px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 42px;
  font-weight: 800;
  color: #CBD5E1;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  scroll-snap-align: center;
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', sans-serif;
  -webkit-user-select: none;
  user-select: none;
}

.digit-item.active {
  color: var(--text);
  font-size: 58px;
  transform: scale(1.05);
}

.picker-selection {
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 70px;
  transform: translateY(-50%);
  border-top: 3px solid #2563EB;
  border-bottom: 3px solid #2563EB;
  background: linear-gradient(to bottom,
    rgba(37, 99, 235, 0.08),
    rgba(37, 99, 235, 0.12),
    rgba(37, 99, 235, 0.08)
  );
  border-radius: 12px;
  pointer-events: none;
  z-index: 1;
  box-shadow: 0 0 20px rgba(37, 99, 235, 0.15);
}

.picker-overlay {
  position: absolute;
  left: 0;
  right: 0;
  height: 105px;
  pointer-events: none;
  z-index: 2;
}

.picker-overlay.top {
  top: 0;
  background: linear-gradient(to bottom,
    var(--surface) 0%,
    var(--surface) 40%,
    transparent 100%
  );
}

.picker-overlay.bottom {
  bottom: 0;
  background: linear-gradient(to top,
    var(--surface) 0%,
    var(--surface) 40%,
    transparent 100%
  );
}
</style>
