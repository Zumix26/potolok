<template>
  <div class="number-picker">
    <div class="picker-overlay top"></div>
    <div class="picker-overlay bottom"></div>
    <div class="picker-selection"></div>

    <div
      ref="scrollContainer"
      class="picker-scroll"
      @scroll="handleScroll"
      @touchstart="handleTouchStart"
      @touchend="handleTouchEnd"
    >
      <div class="picker-spacer"></div>
      <div
        v-for="value in values"
        :key="value"
        class="picker-item"
        :class="{ active: value === selectedValue }"
      >
        {{ value }}
      </div>
      <div class="picker-spacer"></div>
    </div>
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
  },
  step: {
    type: Number,
    default: 10
  }
})

const emit = defineEmits(['update:modelValue'])

const scrollContainer = ref(null)
const selectedValue = ref(props.modelValue ? parseInt(props.modelValue) : props.min + 100)
const isScrolling = ref(false)
const scrollTimeout = ref(null)

// Генерируем значения с шагом
const values = computed(() => {
  const result = []
  for (let i = props.min; i <= props.max; i += props.step) {
    result.push(i)
  }
  return result
})

const ITEM_HEIGHT = 48

const handleScroll = () => {
  if (!scrollContainer.value) return

  isScrolling.value = true
  clearTimeout(scrollTimeout.value)

  scrollTimeout.value = setTimeout(() => {
    snapToNearest()
    isScrolling.value = false
  }, 150)
}

const snapToNearest = () => {
  if (!scrollContainer.value) return

  const scrollTop = scrollContainer.value.scrollTop
  const index = Math.round(scrollTop / ITEM_HEIGHT)
  const targetValue = values.value[index]

  if (targetValue !== undefined && targetValue !== selectedValue.value) {
    selectedValue.value = targetValue
    emit('update:modelValue', targetValue.toString())
  }

  // Плавная прокрутка к ближайшему значению
  scrollContainer.value.scrollTo({
    top: index * ITEM_HEIGHT,
    behavior: 'smooth'
  })
}

const handleTouchStart = () => {
  clearTimeout(scrollTimeout.value)
}

const handleTouchEnd = () => {
  setTimeout(snapToNearest, 100)
}

const scrollToValue = (value) => {
  if (!scrollContainer.value) return

  const numValue = parseInt(value)
  const index = values.value.indexOf(numValue)

  if (index !== -1) {
    scrollContainer.value.scrollTop = index * ITEM_HEIGHT
    selectedValue.value = numValue
  }
}

// Следим за изменением modelValue извне
watch(
  () => props.modelValue,
  (newValue) => {
    if (newValue && parseInt(newValue) !== selectedValue.value) {
      scrollToValue(newValue)
    }
  }
)

onMounted(async () => {
  await nextTick()

  // Устанавливаем начальное значение
  const initialValue = props.modelValue ? parseInt(props.modelValue) : props.min + 100
  scrollToValue(initialValue)
  emit('update:modelValue', initialValue.toString())
})
</script>

<style scoped>
.number-picker {
  position: relative;
  height: 240px;
  width: 100%;
  overflow: hidden;
}

.picker-scroll {
  height: 100%;
  overflow-y: scroll;
  scroll-snap-type: y mandatory;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
}

.picker-scroll::-webkit-scrollbar {
  display: none;
}

.picker-spacer {
  height: 96px;
  flex-shrink: 0;
}

.picker-item {
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  font-weight: 700;
  color: #cbd5e1;
  transition: all 0.2s;
  scroll-snap-align: center;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  -webkit-user-select: none;
  user-select: none;
}

.picker-item.active {
  color: var(--text);
  font-size: 32px;
}

.picker-selection {
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 48px;
  transform: translateY(-50%);
  border-top: 2px solid var(--border-light);
  border-bottom: 2px solid var(--border-light);
  background: rgba(37, 99, 235, 0.05);
  pointer-events: none;
  z-index: 1;
}

.picker-overlay {
  position: absolute;
  left: 0;
  right: 0;
  height: 96px;
  pointer-events: none;
  z-index: 2;
}

.picker-overlay.top {
  top: 0;
  background: linear-gradient(to bottom, var(--surface), transparent);
}

.picker-overlay.bottom {
  bottom: 0;
  background: linear-gradient(to top, var(--surface), transparent);
}
</style>
