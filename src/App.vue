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
})
</script>

<style scoped>
.main-container {
  height: calc(100vh - 50px);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
</style>
