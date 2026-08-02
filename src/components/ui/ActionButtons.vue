<template>
  <div class="action-section">
    <div class="action-buttons">
      <slot />
    </div>
  </div>
</template>

<style scoped>
.action-section {
  margin-top: auto;
  padding-top: 24px;
  padding-bottom: max(16px, env(safe-area-inset-bottom));
}

.action-buttons {
  display: flex;
  gap: 12px;
}

@media (max-width: 768px) {
  .action-section {
    padding-top: 16px;
    padding-bottom: max(12px, env(safe-area-inset-bottom));
  }

  .action-buttons {
    gap: 8px;
  }
}
</style>
