<template>
  <div class="compact-layout">
    <!-- Компактный header -->
    <div class="compact-header">
      <div class="header-title">
        <span class="icon">📏</span>
        <span>{{ store.nextWallTitle }}</span>
      </div>
      <div class="header-hint">Измерьте {{ store.walls.length + 1}}-ю стену по часовой стрелке</div>
    </div>

    <!-- Canvas с overlay элементами -->
    <div class="canvas-wrapper">
      <PreviewArea :svgContent="svgContent" :viewBox="viewBox" />

      <!-- Input overlay -->
      <div class="input-overlay">
        <input
          v-model="store.inputs.nextWall"
          type="number"
          :min="50"
          :max="2000"
          placeholder="Длина стены (см)"
          class="wall-input"
          :class="{ error: store.errors.nextWall }"
          @input="store.handleNextWallInput($event.target.value)"
          autofocus
        />

        <!-- Выбор угла -->
        <div class="corner-buttons">
          <button
            class="corner-btn"
            :class="{ active: store.selectedCorner === 'inner' }"
            @click="store.handleCornerSelection('inner')"
            title="Внутренний угол (90°)"
          >
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M4 12 L12 12 L12 20"/>
            </svg>
          </button>
          <button
            class="corner-btn"
            :class="{ active: store.selectedCorner === 'outer' }"
            @click="store.handleCornerSelection('outer')"
            title="Внешний угол (270°)"
          >
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M4 12 L12 12 L12 4"/>
            </svg>
          </button>
        </div>
      </div>

      <!-- Кнопка "Завершить" слева сверху -->
      <button
        v-if="store.walls.length >= 3"
        class="finish-btn"
        @click="store.handleFinishRoom"
      >
        ✓ Завершить ({{ store.walls.length }} стен)
      </button>
    </div>

    <!-- Кнопка действия -->
    <div class="compact-actions">
      <button
        class="action-btn primary"
        :disabled="!store.nextWallValid || !store.selectedCorner"
        @click="store.handleWallAndCornerNext"
      >
        Далее →
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoomMeasurementStore, useSvgRendererStore } from '../../stores'
import PreviewArea from '../ui/PreviewArea.vue'

const store = useRoomMeasurementStore()
const svgStore = useSvgRendererStore()

const svgContent = computed(() => svgStore.getSvgContent('wall-and-corner'))
const viewBox = computed(() => svgStore.getViewBox('wall-and-corner'))

const showCornerSelection = ref(false)

// Сбросить выбор угла при возврате к вводу длины
watch(showCornerSelection, (newVal) => {
  if (!newVal) {
    store.selectedCorner = null
  }
})

// Инициализировать SVG при монтировании
onMounted(() => {
  svgStore.drawWallAndCornerPreview(store.walls, store.corners, parseFloat(store.inputs.nextWall) || null, store.selectedCorner)
})
</script>

<style scoped>
.compact-layout {
  display: flex;
  flex-direction: column;
  flex: 1;
  gap: 12px;
  padding: 16px;
}

.compact-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 8px 12px;
  background: var(--surface);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-md);
}

.header-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 700;
  color: var(--text);
}

.icon {
  font-size: 20px;
}

.header-hint {
  font-size: 12px;
  color: var(--text-secondary);
  font-weight: 500;
}

.canvas-wrapper {
  position: relative;
  flex: 1;
  min-height: 0;
}

.input-overlay {
  position: absolute;
  bottom: 12px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 8px;
  align-items: center;
  padding: 10px 12px;
  background: rgba(255, 255, 255, 0.98);
  border: 2px solid var(--primary);
  border-radius: var(--radius-lg);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  z-index: 10;
  backdrop-filter: blur(8px);
}

.wall-input {
  width: 160px;
  padding: 8px 12px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 14px;
  font-weight: 600;
  border: 2px solid var(--border-light);
  border-radius: var(--radius-md);
  background: var(--bg);
  color: var(--text);
  outline: none;
  transition: all 0.2s ease;
}

.wall-input:focus {
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(0, 102, 255, 0.1);
}

.wall-input.error {
  border-color: #EF4444;
  animation: shake 0.3s;
}

.corner-buttons {
  display: flex;
  gap: 6px;
}

.corner-btn {
  width: 40px;
  height: 40px;
  padding: 8px;
  background: var(--surface);
  border: 2px solid var(--border-light);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.corner-btn svg {
  stroke: var(--text);
  transition: stroke 0.2s ease;
}

.corner-btn:hover {
  border-color: var(--primary);
  transform: scale(1.05);
}

.corner-btn.active {
  background: var(--primary);
  border-color: var(--primary);
}

.corner-btn.active svg {
  stroke: white;
}

.finish-btn {
  position: absolute;
  top: 12px;
  left: 12px;
  padding: 8px 14px;
  background: rgba(16, 185, 129, 0.95);
  color: white;
  border: none;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  backdrop-filter: blur(4px);
  z-index: 5;
  transition: all 0.2s ease;
}

.finish-btn:hover {
  background: rgba(5, 150, 105, 0.95);
  transform: scale(1.05);
}

.compact-actions {
  display: flex;
  gap: 12px;
}

.action-btn {
  flex: 1;
  padding: 14px 20px;
  border: none;
  border-radius: var(--radius-md);
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
}

.action-btn.primary {
  background: var(--primary);
  color: white;
  box-shadow: var(--shadow-sm);
}

.action-btn.primary:hover:not(:disabled) {
  background: var(--primary-dark, #0052CC);
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.action-btn.primary:disabled {
  background: var(--border-light);
  color: var(--text-secondary);
  cursor: not-allowed;
}

@keyframes shake {
  0%, 100% { transform: translateX(-50%); }
  25% { transform: translateX(calc(-50% - 5px)); }
  75% { transform: translateX(calc(-50% + 5px)); }
}

.mini-step-label {
  font-size: 13px;
  font-weight: 700;
  color: var(--text);
  white-space: nowrap;
}

.next-mini-btn,
.back-mini-btn {
  padding: 6px 12px;
  border: none;
  border-radius: var(--radius-md);
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.next-mini-btn {
  background: var(--primary);
  color: white;
}

.back-mini-btn {
  background: transparent;
  color: var(--text-secondary);
  padding: 4px 8px;
  font-size: 11px;
}

.next-mini-btn:hover {
  background: var(--primary-dark, #0052CC);
  transform: scale(1.05);
}

.back-mini-btn:hover {
  color: var(--primary);
  background: rgba(0, 102, 255, 0.05);
}

@media (max-width: 380px) {
  .header-hint {
    display: none;
  }

  .wall-input {
    width: 120px;
  }

  .finish-btn {
    font-size: 11px;
    padding: 6px 10px;
  }
}
</style>
