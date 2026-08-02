<template>
  <!-- eslint-disable vue/no-v-html -- content is SVG markup built from numeric measurements in svgRenderer store, never user text -->
  <svg
    ref="svgElement"
    class="preview-svg"
    :viewBox="viewBox"
    @click="handleClick"
    @mousedown="handleMouseDown"
    @touchstart="handleTouchStart"
    v-html="content"
  />
  <!-- eslint-enable vue/no-v-html -->
</template>

<script setup>
import { ref, nextTick, watch } from 'vue'

const props = defineProps({
  content: {
    type: String,
    required: true
  },
  viewBox: {
    type: String,
    default: '0 0 300 200'
  }
})

const emit = defineEmits(['corner-click', 'fixture-drag'])

const svgElement = ref(null)
let isDragging = false
let draggedElement = null
let startX = 0
let startY = 0

const handleClick = (event) => {
  if (isDragging) {
    isDragging = false
    return
  }

  const target = event.target

  // Проверяем, кликнули ли на угол
  if (target.classList.contains('corner-point') && target.dataset.cornerIndex) {
    const cornerIndex = parseInt(target.dataset.cornerIndex, 10)
    emit('corner-click', cornerIndex)
  }
}

const startDrag = (clientX, clientY, target) => {
  if (!target || target.tagName !== 'g') return

  isDragging = true
  draggedElement = target
  const svg = svgElement.value
  const point = svg.createSVGPoint()
  point.x = clientX
  point.y = clientY
  const svgPoint = point.matrixTransform(svg.getScreenCTM().inverse())

  // Получаем текущую позицию из transform
  const transform = target.getAttribute('transform')
  const match = transform?.match(/translate\(([^,]+),\s*([^)]+)\)/)
  const currentX = match ? parseFloat(match[1]) : 0
  const currentY = match ? parseFloat(match[2]) : 0

  startX = svgPoint.x - currentX
  startY = svgPoint.y - currentY

  return { startX, startY }
}

const handleMouseDown = (event) => {
  // Проверяем, кликнули ли на элемент или на его дочерний элемент
  let target = event.target
  if (!target.classList.contains('fixture-item')) {
    target = target.closest('.fixture-item')
  }

  if (!target || target.tagName !== 'g') return

  startDrag(event.clientX, event.clientY, target)

  const handleMouseMove = (e) => {
    if (!isDragging || !draggedElement) return

    const svg = svgElement.value
    const point = svg.createSVGPoint()
    point.x = e.clientX
    point.y = e.clientY
    const svgPoint = point.matrixTransform(svg.getScreenCTM().inverse())

    const newX = svgPoint.x - startX
    const newY = svgPoint.y - startY

    // Обновляем transform группы
    draggedElement.setAttribute('transform', `translate(${newX}, ${newY})`)

    const type = draggedElement.dataset.type
    const id = parseInt(draggedElement.dataset.id)
    emit('fixture-drag', type, id, newX, newY)
  }

  const handleMouseUp = () => {
    isDragging = false
    draggedElement = null
    document.removeEventListener('mousemove', handleMouseMove)
    document.removeEventListener('mouseup', handleMouseUp)
  }

  document.addEventListener('mousemove', handleMouseMove)
  document.addEventListener('mouseup', handleMouseUp)
  event.preventDefault()
}

const handleTouchStart = (event) => {
  // Если два пальца - это pinch zoom, пропускаем
  if (event.touches.length > 1) return

  // Проверяем, кликнули ли на элемент или на его дочерний элемент
  let target = event.target
  if (!target.classList.contains('fixture-item')) {
    target = target.closest('.fixture-item')
  }

  if (!target || target.tagName !== 'g') return

  const touch = event.touches[0]
  startDrag(touch.clientX, touch.clientY, target)

  const handleTouchMove = (e) => {
    if (!isDragging || !draggedElement || e.touches.length !== 1) return

    const touch = e.touches[0]
    const svg = svgElement.value
    const point = svg.createSVGPoint()
    point.x = touch.clientX
    point.y = touch.clientY
    const svgPoint = point.matrixTransform(svg.getScreenCTM().inverse())

    const newX = svgPoint.x - startX
    const newY = svgPoint.y - startY

    // Обновляем transform группы
    draggedElement.setAttribute('transform', `translate(${newX}, ${newY})`)

    const type = draggedElement.dataset.type
    const id = parseInt(draggedElement.dataset.id)
    emit('fixture-drag', type, id, newX, newY)

    e.preventDefault()
  }

  const handleTouchEnd = () => {
    isDragging = false
    draggedElement = null
    document.removeEventListener('touchmove', handleTouchMove)
    document.removeEventListener('touchend', handleTouchEnd)
  }

  document.addEventListener('touchmove', handleTouchMove, { passive: false })
  document.addEventListener('touchend', handleTouchEnd)
  event.preventDefault()
}

// Обновить обработчики при изменении content
watch(
  () => props.content,
  () => {
    nextTick(() => {
      // Обработчики будут работать через делегирование событий
    })
  }
)
</script>

<style scoped>
.preview-svg {
  width: 100%;
  height: 100%;
  overflow: visible;
}
</style>
