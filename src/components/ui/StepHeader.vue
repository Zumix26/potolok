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
  flex-shrink: 0;
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

@media (max-width: 768px) {
  .step-header {
    margin-bottom: 20px;
  }

  .step-icon {
    width: 48px;
    height: 48px;
    margin-bottom: 12px;
  }

  .step-icon :deep(svg) {
    width: 22px;
    height: 22px;
  }

  .step-title {
    font-size: 20px;
    margin-bottom: 6px;
  }

  .step-subtitle {
    font-size: 13px;
    max-width: 100%;
  }
}

@media (max-width: 380px) {
  .step-title {
    font-size: 18px;
  }

  .step-subtitle {
    font-size: 12px;
  }
}
</style>
