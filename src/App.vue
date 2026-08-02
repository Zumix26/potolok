<template>
  <div>
    <ProgressBar
      :progress="progress"
      :currentStep="stepIndex"
      :totalSteps="totalSteps"
    />

    <div class="main-container">
      <StepContainer :isActive="currentStep === 'first-wall'">
        <FirstWallStep />
      </StepContainer>

      <StepContainer :isActive="currentStep === 'corner-selection'">
        <CornerSelectionStep />
      </StepContainer>

      <StepContainer :isActive="currentStep === 'next-wall'">
        <NextWallStep />
      </StepContainer>

      <StepContainer :isActive="currentStep === 'diagonal'">
        <DiagonalStep />
      </StepContainer>

      <StepContainer :isActive="currentStep === 'fixtures'">
        <FixturesStep />
      </StepContainer>

      <StepContainer :isActive="currentStep === 'result'">
        <ResultStep />
      </StepContainer>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useRoomMeasurementStore } from './stores'

import ProgressBar from './components/layout/ProgressBar.vue'
import StepContainer from './components/layout/StepContainer.vue'

import FirstWallStep from './components/steps/FirstWallStep.vue'
import CornerSelectionStep from './components/steps/CornerSelectionStep.vue'
import NextWallStep from './components/steps/NextWallStep.vue'
import DiagonalStep from './components/steps/DiagonalStep.vue'
import FixturesStep from './components/steps/FixturesStep.vue'
import ResultStep from './components/steps/ResultStep.vue'

const store = useRoomMeasurementStore()
const { currentStep, stepIndex, totalSteps, progress } = storeToRefs(store)

onMounted(() => {
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const activeButton = document.querySelector('.step-container.active .btn.primary:not(:disabled)')
      if (activeButton) activeButton.click()
    }
  })

  // Исправление высоты для мобильных устройств (особенно iOS Safari)
  const setViewportHeight = () => {
    const vh = window.innerHeight * 0.01
    document.documentElement.style.setProperty('--vh', `${vh}px`)
  }
  
  setViewportHeight()
  window.addEventListener('resize', setViewportHeight)
  window.addEventListener('orientationchange', setViewportHeight)
  
  // Для iOS Safari - обновляем при скролле (когда адресная строка скрывается/появляется)
  let lastHeight = window.innerHeight
  const checkHeight = () => {
    const currentHeight = window.innerHeight
    if (Math.abs(currentHeight - lastHeight) > 50) {
      setViewportHeight()
      lastHeight = currentHeight
    }
  }
  
  window.addEventListener('scroll', checkHeight)
  window.addEventListener('resize', checkHeight)
})
</script>

<style scoped>
.main-container {
  height: calc(var(--vh, 1vh) * 100 - 50px);
  min-height: calc(100svh - 50px);
  max-height: calc(100vh - 50px);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
</style>
