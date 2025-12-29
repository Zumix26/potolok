<template>
  <div>
    <ProgressBar
      :progress="progress"
      :currentStep="stepIndex"
      :totalSteps="totalSteps"
    />

    <AppHeader
      :canGoBack="canGoBack"
      @back="handleBack"
      @close="closeApp"
    />

    <div class="main-container">
      <StepContainer :isActive="currentStep === 'first-wall'">
        <FirstWallStep />
      </StepContainer>

      <StepContainer :isActive="currentStep === 'wall-and-corner'">
        <WallAndCornerStep />
      </StepContainer>

      <StepContainer :isActive="currentStep === 'diagonal'">
        <DiagonalStep />
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
import AppHeader from './components/layout/AppHeader.vue'
import StepContainer from './components/layout/StepContainer.vue'

import FirstWallStep from './components/steps/FirstWallStep.vue'
import WallAndCornerStep from './components/steps/WallAndCornerStep.vue'
import DiagonalStep from './components/steps/DiagonalStep.vue'
import ResultStep from './components/steps/ResultStep.vue'

const store = useRoomMeasurementStore()
const { currentStep, stepIndex, totalSteps, progress, canGoBack } = storeToRefs(store)
const { handleBack, closeApp } = store

onMounted(() => {
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const activeButton = document.querySelector('.step-container.active .btn.primary:not(:disabled)')
      if (activeButton) activeButton.click()
    }
  })
})
</script>

<style scoped>
.main-container {
  min-height: calc(100vh - 120px);
  display: flex;
  flex-direction: column;
}
</style>
