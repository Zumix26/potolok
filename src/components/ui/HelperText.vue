<template>
  <div class="helper-text">
    <span class="icon">{{ icon }}</span>
    {{ text }}
  </div>
</template>

<script setup>
defineProps({
  icon: {
    type: String,
    required: true
  },
  text: {
    type: String,
    required: true
  }
})
</script>

<style scoped>
.helper-text {
  background: var(--primary-light);
  border: 1px solid rgba(0, 102, 255, 0.2);
  border-radius: var(--radius-md);
  padding: 16px;
  margin: 16px 0;
  font-size: 13px;
  color: var(--primary-dark);
  line-height: 1.4;
}

.helper-text .icon {
  display: inline-block;
  margin-right: 8px;
  vertical-align: middle;
}
</style>
