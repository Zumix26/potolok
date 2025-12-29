import { defineStore } from 'pinia'
import { STEPS, VALIDATION } from '../utils/constants'
import { calculateResults } from '../utils/roomCalculations'
import { useSvgRendererStore } from './svgRenderer'

export const useRoomMeasurementStore = defineStore('roomMeasurement', {
  state: () => ({
    // Навигация
    currentStep: STEPS.FIRST_WALL,
    stepIndex: 0,

    // Данные комнаты
    walls: [],
    corners: [],
    diagonals: [],

    // Текущий ввод
    selectedCorner: null,
    selectedDiagonalFrom: null,
    selectedDiagonalTo: null,
    inputs: {
      firstWall: '',
      nextWall: '',
      diagonal: ''
    },

    // Ошибки
    errors: {
      firstWall: false,
      nextWall: false,
      diagonal: false
    },

    // Результаты
    results: {
      perimeter: '0.00',
      area: '0.00'
    }
  }),

  getters: {
    // Навигация
    totalSteps: (state) => Math.max(4, state.walls.length + 2),
    progress() {
      return (this.stepIndex / this.totalSteps) * 100
    },
    canGoBack: (state) => state.stepIndex > 0,

    // Валидация
    firstWallValid: (state) => {
      const value = parseFloat(state.inputs.firstWall)
      return value >= VALIDATION.WALL_MIN && value <= VALIDATION.WALL_MAX
    },
    nextWallValid: (state) => {
      const value = parseFloat(state.inputs.nextWall)
      return value >= VALIDATION.WALL_MIN && value <= VALIDATION.WALL_MAX
    },
    diagonalValid: (state) => {
      const value = parseFloat(state.inputs.diagonal)
      return value >= VALIDATION.DIAGONAL_MIN && value <= VALIDATION.DIAGONAL_MAX
    },

    // Динамические тексты
    cornerSubtitle: (state) => {
      const wallNum = state.walls.length
      if (wallNum === 1) {
        return `После стены с дверью (${state.walls[0]} см), какой угол образуется при повороте направо?`
      } else {
        return `После ${wallNum}-й стены (${state.walls[wallNum-1]} см), какой угол образуется при повороте направо?`
      }
    },
    nextWallTitle: (state) => `Стена №${state.walls.length + 1}`,
    nextWallSubtitle: (state) => `Измерьте ${state.walls.length + 1}-ю стену, продолжая движение по часовой стрелке`,
    showFinishFromCorner: (state) => state.walls.length >= 3,
    shouldAddDiagonal: (state) => state.walls.length >= 4
  },

  actions: {
    // Навигация
    goToStep(stepName) {
      const stepOrder = [STEPS.FIRST_WALL, STEPS.WALL_AND_CORNER, STEPS.DIAGONAL, STEPS.RESULT]
      const currentIndex = stepOrder.indexOf(this.currentStep)
      const targetIndex = stepOrder.indexOf(stepName)

      if (targetIndex > currentIndex || this.stepIndex === 0) {
        this.stepIndex = Math.max(this.stepIndex, targetIndex)
      }

      this.currentStep = stepName

      // Обновить SVG preview для нового шага
      const svgStore = useSvgRendererStore()
      switch(stepName) {
        case STEPS.FIRST_WALL:
          svgStore.drawFirstWallPreview(parseFloat(this.inputs.firstWall) || 250, this.selectedCorner)
          break
        case STEPS.WALL_AND_CORNER:
          svgStore.drawWallAndCornerPreview(this.walls, this.corners, parseFloat(this.inputs.nextWall) || null, this.selectedCorner)
          break
        case STEPS.DIAGONAL:
          svgStore.drawDiagonalPreview(this.walls, this.corners, this.selectedDiagonalFrom, this.selectedDiagonalTo, parseFloat(this.inputs.diagonal) || null, this.diagonals)
          break
        case STEPS.RESULT:
          svgStore.drawResultPreview(this.walls, this.corners)
          break
      }
    },

    handleBack() {
      if (this.stepIndex > 0) {
        this.stepIndex--

        if (this.currentStep === STEPS.WALL_AND_CORNER) {
          if (this.walls.length === 1) {
            // Вернуться к первой стене
            this.selectedCorner = null
            this.goToStep(STEPS.FIRST_WALL)
          } else {
            // Удалить последнюю стену и угол
            this.walls.pop()
            if (this.corners.length > 0) {
              this.selectedCorner = this.corners.pop()
            }
            this.goToStep(STEPS.WALL_AND_CORNER)
          }
        } else if (this.currentStep === STEPS.DIAGONAL) {
          this.goToStep(STEPS.WALL_AND_CORNER)
        } else if (this.currentStep === STEPS.RESULT) {
          if (this.shouldAddDiagonal) {
            this.goToStep(STEPS.DIAGONAL)
          } else {
            this.goToStep(STEPS.WALL_AND_CORNER)
          }
        }
      }
    },

    // Обработчики первой стены
    handleFirstWallInput(value) {
      this.inputs.firstWall = value
      if (value && !this.firstWallValid) {
        this.errors.firstWall = true
        setTimeout(() => { this.errors.firstWall = false }, 300)
      } else {
        this.errors.firstWall = false
        if (this.firstWallValid) {
          const svgStore = useSvgRendererStore()
          svgStore.drawFirstWallPreview(parseFloat(value), this.selectedCorner)
        }
      }
    },

    handleFirstWallNext() {
      if (!this.firstWallValid || !this.selectedCorner) return

      const value = parseFloat(this.inputs.firstWall)
      this.walls.push(value)
      this.corners.push(this.selectedCorner)

      // Сбросить ввод и выбор для следующего шага
      this.inputs.nextWall = ''
      this.selectedCorner = null
      this.goToStep(STEPS.WALL_AND_CORNER)
    },

    // Обработчики выбора угла
    handleCornerSelection(type) {
      this.selectedCorner = type
      const svgStore = useSvgRendererStore()

      // Для первого шага обновляем превью первой стены с углом
      if (this.currentStep === STEPS.FIRST_WALL) {
        svgStore.drawFirstWallPreview(parseFloat(this.inputs.firstWall) || 250, type)
      } else {
        // Для последующих шагов обновляем превью стены и угла
        svgStore.drawWallAndCornerPreview(this.walls, this.corners, parseFloat(this.inputs.nextWall) || null, type)
      }
    },

    // Обработчики объединённого шага (стена + угол)
    handleNextWallInput(value) {
      this.inputs.nextWall = value
      if (value && !this.nextWallValid) {
        this.errors.nextWall = true
        setTimeout(() => { this.errors.nextWall = false }, 300)
      } else {
        this.errors.nextWall = false
        if (this.nextWallValid) {
          const svgStore = useSvgRendererStore()
          svgStore.drawWallAndCornerPreview(this.walls, this.corners, parseFloat(value), this.selectedCorner)
        }
      }
    },

    handleWallAndCornerNext() {
      if (!this.nextWallValid || !this.selectedCorner) return

      // Добавить стену и угол
      const value = parseFloat(this.inputs.nextWall)
      this.walls.push(value)
      this.corners.push(this.selectedCorner)

      // Увеличить stepIndex для прогресса
      this.stepIndex++

      // Сбросить для следующего цикла
      this.inputs.nextWall = ''
      this.selectedCorner = null

      // Продолжить на том же шаге для следующей стены
      this.goToStep(STEPS.WALL_AND_CORNER)
    },

    handleFinishRoom() {
      if (this.shouldAddDiagonal) {
        this.goToStep(STEPS.DIAGONAL)
      } else {
        this.calculateResultsAction()
        this.goToStep(STEPS.RESULT)
      }
    },

    // Обработчики диагонали
    handleDiagonalFromSelect(index) {
      this.selectedDiagonalFrom = index
      const svgStore = useSvgRendererStore()
      svgStore.drawDiagonalPreview(
        this.walls,
        this.corners,
        index,
        this.selectedDiagonalTo,
        parseFloat(this.inputs.diagonal) || null,
        this.diagonals
      )
    },

    handleDiagonalToSelect(index) {
      this.selectedDiagonalTo = index
      const svgStore = useSvgRendererStore()
      svgStore.drawDiagonalPreview(
        this.walls,
        this.corners,
        this.selectedDiagonalFrom,
        index,
        parseFloat(this.inputs.diagonal) || null,
        this.diagonals
      )
    },

    handleDiagonalInput(value) {
      this.inputs.diagonal = value
      if (value && !this.diagonalValid) {
        this.errors.diagonal = true
        setTimeout(() => { this.errors.diagonal = false }, 300)
      } else {
        this.errors.diagonal = false
        if (this.diagonalValid) {
          const svgStore = useSvgRendererStore()
          svgStore.drawDiagonalPreview(
            this.walls,
            this.corners,
            this.selectedDiagonalFrom,
            this.selectedDiagonalTo,
            parseFloat(value),
            this.diagonals
          )
        }
      }
    },

    handleAddDiagonal() {
      if (!this.diagonalValid || this.selectedDiagonalFrom === null || this.selectedDiagonalTo === null) return
      const value = parseFloat(this.inputs.diagonal)
      this.diagonals.push({
        from: this.selectedDiagonalFrom,
        to: this.selectedDiagonalTo,
        length: value
      })

      // Сброс для следующей диагонали
      this.selectedDiagonalFrom = null
      this.selectedDiagonalTo = null
      this.inputs.diagonal = ''

      // Обновить превью
      const svgStore = useSvgRendererStore()
      svgStore.drawDiagonalPreview(this.walls, this.corners, null, null, null, this.diagonals)
    },

    removeDiagonal(index) {
      this.diagonals.splice(index, 1)
      // Обновить превью
      const svgStore = useSvgRendererStore()
      svgStore.drawDiagonalPreview(
        this.walls,
        this.corners,
        this.selectedDiagonalFrom,
        this.selectedDiagonalTo,
        parseFloat(this.inputs.diagonal) || null,
        this.diagonals
      )
    },

    handleFinishDiagonals() {
      this.calculateResultsAction()
      this.goToStep(STEPS.RESULT)
    },

    handleSkipDiagonal() {
      this.calculateResultsAction()
      this.goToStep(STEPS.RESULT)
    },

    // Утилиты
    calculateResultsAction() {
      const { perimeter, area } = calculateResults(this.walls)
      this.results.perimeter = perimeter
      this.results.area = area
    },

    closeApp() {
      if (confirm('Закрыть приложение? Все данные будут потеряны.')) {
        window.close()
      }
    },

    restartApp() {
      if (confirm('Начать новый замер? Текущие данные будут потеряны.')) {
        this.currentStep = STEPS.FIRST_WALL
        this.stepIndex = 0
        this.walls = []
        this.corners = []
        this.diagonals = []
        this.selectedCorner = null
        this.selectedDiagonalFrom = null
        this.selectedDiagonalTo = null
        this.inputs.firstWall = ''
        this.inputs.nextWall = ''
        this.inputs.diagonal = ''
        this.goToStep(STEPS.FIRST_WALL)
      }
    },

    shareResults() {
      const shareText = `Результат замера комнаты:\n📏 Периметр: ${this.results.perimeter} м\n📐 Площадь: ${this.results.area} м²\n\n#potolok_io #замер_комнаты`

      if (navigator.share) {
        navigator.share({
          title: 'Результат замера комнаты',
          text: shareText
        }).catch(console.log)
      } else {
        navigator.clipboard.writeText(shareText).then(() => {
          alert('✅ Результат скопирован в буфер обмена')
        }).catch(() => {
          alert('📋 Скопируйте результат:\n\n' + shareText)
        })
      }
    }
  }
})
