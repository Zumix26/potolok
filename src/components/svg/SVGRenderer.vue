<template>
  <svg
    class="preview-svg"
    :viewBox="viewBox"
    v-html="content"
    @click="handleClick"
  />
</template>

<script setup>
defineProps({
  content: {
    type: String,
    required: true
  },
  viewBox: {
    type: String,
    default: '0 0 300 200'
  }
})

const emit = defineEmits(['corner-click'])

const handleClick = (event) => {
  const target = event.target

  // Проверяем, кликнули ли на угол
  if (target.classList.contains('corner-point') && target.dataset.cornerIndex) {
    const cornerIndex = parseInt(target.dataset.cornerIndex, 10)
    emit('corner-click', cornerIndex)
  }
}
</script>

<style scoped>
.preview-svg {
  width: 100%;
  height: 200px;
  overflow: visible;
}
</style>
