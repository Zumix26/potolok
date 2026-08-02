<template>
  <div
    class="preview-area"
    ref="previewContainer"
    @wheel.prevent="handleWheel"
    @mousedown="handleMouseDown"
    @mousemove="handleMouseMove"
    @mouseup="handleMouseUp"
    @mouseleave="handleMouseUp"
    @touchstart="handleTouchStart"
    @touchmove="handleTouchMove"
    @touchend="handleTouchEnd"
  >
    <div class="zoom-controls">
      <button class="zoom-btn" @click="zoomIn" title="Увеличить">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="11" cy="11" r="8"/>
          <path d="M21 21l-4.35-4.35"/>
          <line x1="11" y1="8" x2="11" y2="14"/>
          <line x1="8" y1="11" x2="14" y2="11"/>
        </svg>
      </button>
      <span class="zoom-level">{{ Math.round(scale * 100) }}%</span>
      <button class="zoom-btn" @click="zoomOut" title="Уменьшить">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="11" cy="11" r="8"/>
          <path d="M21 21l-4.35-4.35"/>
          <line x1="8" y1="11" x2="14" y2="11"/>
        </svg>
      </button>
      <button class="zoom-btn" @click="resetZoom" title="Сбросить зум">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M1 4v6h6"/>
          <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/>
        </svg>
      </button>
    </div>
    <div
      class="svg-container"
      :class="{ 'dragging': isDragging, 'grabbable': scale > 1 }"
      :style="containerStyle"
    >
      <SVGRenderer
        :content="svgContent"
        :viewBox="viewBox"
        @corner-click="$emit('corner-click', $event)"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import SVGRenderer from '../svg/SVGRenderer.vue'

defineProps({
  svgContent: {
    type: String,
    required: true
  },
  viewBox: {
    type: String,
    default: '0 0 300 200'
  }
})

defineEmits(['corner-click'])

const scale = ref(1)
const previewContainer = ref(null)

// Pan/Drag state
const offsetX = ref(0)
const offsetY = ref(0)
const isDragging = ref(false)
const startX = ref(0)
const startY = ref(0)

// Touch state
const initialDistance = ref(0)
const initialScale = ref(1)

// Computed style with both scale and translate
const containerStyle = computed(() => ({
  transform: `translate(${offsetX.value}px, ${offsetY.value}px) scale(${scale.value})`,
  transition: isDragging.value ? 'none' : 'transform 0.2s ease'
}))

const zoomIn = () => {
  if (scale.value < 3) {
    scale.value = Math.min(scale.value + 0.2, 3)
  }
}

const zoomOut = () => {
  if (scale.value > 0.5) {
    scale.value = Math.max(scale.value - 0.2, 0.5)
    // Reset offset if zoomed out to 1x or less
    if (scale.value <= 1) {
      offsetX.value = 0
      offsetY.value = 0
    }
  }
}

const resetZoom = () => {
  scale.value = 1
  offsetX.value = 0
  offsetY.value = 0
}

const handleWheel = (event) => {
  if (event.ctrlKey || event.metaKey) {
    const delta = event.deltaY > 0 ? -0.1 : 0.1
    const newScale = Math.max(0.5, Math.min(3, scale.value + delta))

    // Reset offset if zooming back to 1x or less
    if (newScale <= 1) {
      offsetX.value = 0
      offsetY.value = 0
    }

    scale.value = newScale
  }
}

// Mouse drag handlers
const handleMouseDown = (event) => {
  // Не запускать drag если кликнули на угол или на кнопки зума
  if (scale.value > 1 &&
      !event.target.closest('.zoom-controls') &&
      !event.target.classList.contains('corner-point')) {
    isDragging.value = true
    startX.value = event.clientX - offsetX.value
    startY.value = event.clientY - offsetY.value
    event.preventDefault()
  }
}

const handleMouseMove = (event) => {
  if (isDragging.value) {
    offsetX.value = event.clientX - startX.value
    offsetY.value = event.clientY - startY.value
  }
}

const handleMouseUp = () => {
  isDragging.value = false
}

// Touch gesture handlers
let lastTouchTime = 0
let lastTouchPoint = null
let touchStartTime = 0
let touchStartPoint = null

const handleTouchStart = (event) => {
  touchStartTime = Date.now()
  const touch = event.touches[0]
  touchStartPoint = { x: touch.clientX, y: touch.clientY }
  // Предотвращаем автоматический зум браузера при двойном тапе
  if (event.touches.length === 1) {
    const touch = event.touches[0]
    const now = Date.now()
    const timeSinceLastTouch = now - lastTouchTime
    const distance = lastTouchPoint 
      ? Math.sqrt(
          Math.pow(touch.clientX - lastTouchPoint.x, 2) + 
          Math.pow(touch.clientY - lastTouchPoint.y, 2)
        )
      : 0
    
    // Если двойной тап в том же месте - предотвращаем зум
    if (timeSinceLastTouch < 300 && distance < 10) {
      event.preventDefault()
    }
    
    lastTouchTime = now
    lastTouchPoint = { x: touch.clientX, y: touch.clientY }
  }
  
  if (event.touches.length === 2) {
    // Pinch-to-zoom gesture
    const touch1 = event.touches[0]
    const touch2 = event.touches[1]
    initialDistance.value = getDistance(touch1, touch2)
    initialScale.value = scale.value
    event.preventDefault()
  } else if (event.touches.length === 1 && scale.value > 1) {
    // Single finger pan when zoomed in
    isDragging.value = true
    startX.value = event.touches[0].clientX - offsetX.value
    startY.value = event.touches[0].clientY - offsetY.value
  }
}

const handleTouchMove = (event) => {
  if (event.touches.length === 2) {
    // Pinch-to-zoom
    const touch1 = event.touches[0]
    const touch2 = event.touches[1]
    const currentDistance = getDistance(touch1, touch2)
    const scaleChange = currentDistance / initialDistance.value
    const newScale = Math.max(0.5, Math.min(3, initialScale.value * scaleChange))

    // Reset offset if zooming back to 1x or less
    if (newScale <= 1) {
      offsetX.value = 0
      offsetY.value = 0
    }

    scale.value = newScale
    event.preventDefault()
  } else if (event.touches.length === 1 && isDragging.value) {
    // Single finger pan
    offsetX.value = event.touches[0].clientX - startX.value
    offsetY.value = event.touches[0].clientY - startY.value
    event.preventDefault()
  }
}

const handleTouchEnd = (event) => {
  // Если это был короткий тап (не drag), проверяем клик на угол
  if (event.changedTouches && event.changedTouches.length > 0 && !isDragging.value) {
    const touchDuration = Date.now() - touchStartTime
    const touch = event.changedTouches[0]
    const distance = touchStartPoint 
      ? Math.sqrt(
          Math.pow(touch.clientX - touchStartPoint.x, 2) + 
          Math.pow(touch.clientY - touchStartPoint.y, 2)
        )
      : 0
    
    // Если короткий тап без движения - это клик (только если не был зум)
    if (touchDuration < 300 && distance < 10 && scale.value <= 1) {
      setTimeout(() => {
        const target = document.elementFromPoint(touch.clientX, touch.clientY)
        if (target) {
          const cornerPoint = target.closest('.corner-point')
          if (cornerPoint && cornerPoint.dataset.cornerIndex) {
            const cornerIndex = parseInt(cornerPoint.dataset.cornerIndex, 10)
            emit('corner-click', cornerIndex)
          }
        }
      }, 10)
    }
  }
  
  isDragging.value = false
  initialDistance.value = 0
}

// Helper function to calculate distance between two touch points
const getDistance = (touch1, touch2) => {
  const dx = touch2.clientX - touch1.clientX
  const dy = touch2.clientY - touch1.clientY
  return Math.sqrt(dx * dx + dy * dy)
}
</script>

<style scoped>
.preview-area {
  background: var(--surface);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-lg);
  padding: 24px;
  box-shadow: var(--shadow-sm);
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  touch-action: pan-x pan-y pinch-zoom;
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  user-select: none;
}

.zoom-controls {
  position: absolute;
  top: 12px;
  right: 12px;
  display: flex;
  align-items: center;
  gap: 8px;
  background: var(--surface);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-md);
  padding: 6px 8px;
  box-shadow: var(--shadow-sm);
  z-index: 10;
}

@media (max-width: 768px) {
  .zoom-controls {
    display: none;
  }
}

.zoom-btn {
  background: transparent;
  border: none;
  color: var(--text);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4px;
  border-radius: var(--radius-sm);
  transition: all 0.2s ease;
}

.zoom-btn:hover {
  background: var(--primary);
  color: white;
}

.zoom-btn:active {
  transform: scale(0.95);
}

.zoom-level {
  font-family: 'JetBrains Mono', monospace;
  font-size: 12px;
  font-weight: 600;
  color: var(--text-secondary);
  min-width: 45px;
  text-align: center;
}

.svg-container {
  transition: transform 0.2s ease;
  transform-origin: center center;
}

.svg-container.grabbable {
  cursor: grab;
}

.svg-container.dragging {
  cursor: grabbing;
}

:deep(.room-wall) {
  stroke: var(--primary);
  stroke-width: 4;
  stroke-linecap: round;
  fill: none;
}

:deep(.room-corner) {
  fill: var(--surface);
  stroke: var(--primary);
  stroke-width: 3;
}

:deep(.room-corner.active) {
  fill: var(--primary);
  stroke: var(--primary-dark);
}

:deep(.room-corner.next) {
  fill: var(--warning);
  stroke: var(--warning);
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.6; }
}

:deep(.room-label) {
  fill: var(--text);
  font-family: 'JetBrains Mono', monospace;
  font-size: 12px;
  font-weight: 600;
  text-anchor: middle;
}

:deep(.room-dimension) {
  fill: var(--text-secondary);
  font-family: 'JetBrains Mono', monospace;
  font-size: 10px;
  font-weight: 500;
  text-anchor: middle;
}

:deep(.diagonal-line) {
  stroke: var(--warning);
  stroke-width: 2;
  stroke-dasharray: 6 4;
  fill: none;
}

:deep(.corner-point) {
  cursor: pointer;
  transition: all 0.2s ease;
}

:deep(.corner-point:hover) {
  r: 10;
  stroke-width: 4;
  filter: drop-shadow(0 0 6px currentColor);
}
</style>
