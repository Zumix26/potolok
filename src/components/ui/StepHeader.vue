<template>
  <div class="step-header">
    <div class="step-icon">
      <div v-html="icon" />
    </div>
    <h2 class="step-title">{{ title }}</h2>
    <p class="step-subtitle">{{ subtitle }}</p>
  </div>
</template>

<script setup>
defineProps({
  icon: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  subtitle: {
    type: String,
    required: true
  }
})
</script>

<style scoped>
.step-header {
  text-align: center;
  margin-bottom: 32px;
}

.step-icon {
  width: 64px;
  height: 64px;
  border-radius: var(--radius-lg);
  background: var(--primary-light);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 20px;
  box-shadow: var(--shadow-sm);
}

.step-icon :deep(svg) {
  width: 28px;
  height: 28px;
  color: var(--primary);
}

.step-title {
  font-size: 24px;
  font-weight: 800;
  margin-bottom: 8px;
  line-height: 1.2;
}

.step-subtitle {
  font-size: 15px;
  color: var(--text-secondary);
  line-height: 1.4;
  max-width: 320px;
  margin: 0 auto;
}

@media (max-width: 380px) {
  .step-title {
    font-size: 20px;
  }
}
</style>
