<template>
  <div
    class="corner-option"
    :class="{ selected: isSelected }"
    @click="$emit('select')"
  >
    <div class="corner-visual">
      <div v-html="svgContent" />
    </div>
    <div class="corner-title">{{ title }}</div>
    <div class="corner-description">{{ description }}</div>
  </div>
</template>

<script setup>
defineProps({
  type: {
    type: String,
    required: true,
    validator: (value) => ['inner', 'outer'].includes(value)
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  svgContent: {
    type: String,
    required: true
  },
  isSelected: {
    type: Boolean,
    default: false
  }
})

defineEmits(['select'])
</script>

<style scoped>
.corner-option {
  border: 2px solid var(--border);
  border-radius: var(--radius-md);
  background: var(--surface);
  cursor: pointer;
  transition: all 0.2s;
  padding: 20px;
  text-align: center;
  position: relative;
  overflow: hidden;
}

.corner-option:hover {
  border-color: var(--primary);
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
}

.corner-option.selected {
  border-color: var(--primary);
  background: var(--primary-light);
}

.corner-option.selected::before {
  content: '';
  position: absolute;
  top: -2px;
  left: -2px;
  right: -2px;
  bottom: -2px;
  background: linear-gradient(45deg, var(--primary), var(--primary-dark));
  border-radius: var(--radius-md);
  z-index: -1;
}

.corner-visual {
  width: 60px;
  height: 60px;
  margin: 0 auto 12px;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.corner-visual :deep(svg) {
  width: 100%;
  height: 100%;
}

.corner-title {
  font-size: 14px;
  font-weight: 700;
  margin-bottom: 4px;
}

.corner-description {
  font-size: 11px;
  color: var(--text-secondary);
  line-height: 1.3;
}

.corner-option.selected .corner-title {
  color: var(--primary);
}

.corner-option.selected .corner-description {
  color: var(--primary);
}

@media (max-width: 380px) {
  .corner-option {
    padding: 16px;
  }
}
</style>
