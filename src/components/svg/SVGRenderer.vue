<template>
  <svg
    ref="svgElement"
    class="preview-svg"
    :viewBox="viewBox"
    v-html="content"
    @click="handleClick"
    @mousedown="handleMouseDown"
  />
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

const handleMouseDown = (event) => {
  // Проверяем, кликнули ли на элемент или на его дочерний элемент
  let target = event.target
  if (!target.classList.contains('fixture-item')) {
    target = target.closest('.fixture-item')
  }
  
  if (!target || target.tagName !== 'g') return

  isDragging = true
  draggedElement = target
  const svg = svgElement.value
  const point = svg.createSVGPoint()
  point.x = event.clientX
  point.y = event.clientY
  const svgPoint = point.matrixTransform(svg.getScreenCTM().inverse())
  
  // Получаем текущую позицию из transform
  const transform = target.getAttribute('transform')
  const match = transform?.match(/translate\(([^,]+),\s*([^)]+)\)/)
  const currentX = match ? parseFloat(match[1]) : 0
  const currentY = match ? parseFloat(match[2]) : 0
  
  startX = svgPoint.x - currentX
  startY = svgPoint.y - currentY

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

// Обновить обработчики при изменении content
watch(() => props.content, () => {
  nextTick(() => {
    // Обработчики будут работать через делегирование событий
  })
})
</script>

<style scoped>
.preview-svg {
  width: 100%;
  height: 100%;
  overflow: visible;
}
</style>
