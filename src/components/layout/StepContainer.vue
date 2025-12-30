<template>
  <div v-if="isActive" class="step-container active">
    <div class="step-content">
      <slot />
    </div>
  </div>
</template>

<script setup>
defineProps({
  isActive: {
    type: Boolean,
    required: true
  }
})
</script>

<style scoped>
.step-container {
  display: none;
  flex-direction: column;
  flex: 1;
  padding: 0 20px 20px;
}

.step-container.active {
  display: flex;
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.step-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  height: 100%;
}
</style>
