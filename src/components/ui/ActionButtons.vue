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
}

.action-buttons {
  display: flex;
  gap: 12px;
}
</style>
