import { defineStore } from 'pinia'
import { STEPS, VALIDATION } from '../utils/constants'
import { calculateResults, isRoomClosed } from '../utils/roomCalculations'
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
    selectedCorner: 'inner',
    selectedDiagonalFrom: null,
    selectedDiagonalTo: null,
    inputs: {
      firstWall: '',
      nextWall: '',
      diagonal: '',
      fixtureCount: '0',
      pipeCount: '0',
      otherCount: '0'
    },

    // Ошибки
    errors: {
      firstWall: false,
      nextWall: false,
      diagonal: false
    },

    // Элементы
    fixtures: {
      lights: 0,
      pipes: 0,
      other: 0
    },
    // Позиции элементов на макете
    fixturePositions: {
      lights: [],
      pipes: [],
      other: []
    },

    // Результаты
    results: {
      perimeter: '0.00',
      area: '0.00'
    }
  }),

  getters: {
    // Навигация
    totalSteps: (state) => Math.max(5, state.walls.length + 3),
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
    
    // Проверка замкнутости комнаты
    isRoomClosedWithNewWall: (state) => {
      if (!state.nextWallValid) return false
      return isRoomClosed(state.walls, state.corners, parseFloat(state.inputs.nextWall), state.selectedCorner)
    },
    isRoomClosed: (state) => {
      return isRoomClosed(state.walls, state.corners)
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
      const stepOrder = [STEPS.FIRST_WALL, STEPS.CORNER_SELECTION, STEPS.NEXT_WALL, STEPS.DIAGONAL, STEPS.FIXTURES, STEPS.RESULT]
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
          svgStore.drawFirstWallPreview(parseFloat(this.inputs.firstWall) || 250, true)
          break
        case STEPS.CORNER_SELECTION:
          svgStore.drawCornerPreview(this.walls, this.corners, this.selectedCorner)
          break
        case STEPS.NEXT_WALL:
          svgStore.drawNextWallPreview(this.walls, this.corners, parseFloat(this.inputs.nextWall) || 250)
          break
        case STEPS.WALL_AND_CORNER:
          svgStore.drawWallAndCornerPreview(this.walls, this.corners, parseFloat(this.inputs.nextWall) || null, this.selectedCorner)
          break
        case STEPS.DIAGONAL:
          svgStore.drawDiagonalPreview(this.walls, this.corners, this.selectedDiagonalFrom, this.selectedDiagonalTo, parseFloat(this.inputs.diagonal) || null, this.diagonals)
          break
        case STEPS.FIXTURES:
          svgStore.drawFixturesPreview(this.walls, this.corners, this.fixturePositions)
          break
        case STEPS.RESULT:
          svgStore.drawResultPreview(this.walls, this.corners, this.fixturePositions)
          break
      }
    },

    handleBack() {
      if (this.stepIndex > 0) {
        this.stepIndex--

        if (this.currentStep === STEPS.CORNER_SELECTION) {
          // Вернуться к первой стене
          // Удаляем угол, если он был добавлен
          if (this.corners.length > 0 && this.corners.length === this.walls.length) {
            this.corners.pop()
          }
          this.selectedCorner = null
          this.goToStep(STEPS.FIRST_WALL)
        } else if (this.currentStep === STEPS.NEXT_WALL) {
          // Вернуться к выбору угла
          // Удаляем угол, если он был добавлен
          if (this.corners.length > 0 && this.corners.length === this.walls.length) {
            this.corners.pop()
          }
          this.selectedCorner = null
          this.goToStep(STEPS.CORNER_SELECTION)
        } else if (this.currentStep === STEPS.WALL_AND_CORNER) {
          // Вернуться назад в цепочке стен
          if (this.walls.length === 1) {
            // Вернуться к первой стене (удаляем первую стену)
            this.walls.pop()
            this.selectedCorner = null
            this.goToStep(STEPS.FIRST_WALL)
          } else if (this.walls.length === 2) {
            // Вернуться к выбору угла после первой стены
            // Удаляем последнюю стену и угол
            this.walls.pop()
            if (this.corners.length > 0) {
              this.corners.pop()
            }
            this.selectedCorner = null
            this.goToStep(STEPS.CORNER_SELECTION)
          } else {
            // Удалить последнюю стену и угол
            this.walls.pop()
            if (this.corners.length > 0 && this.corners.length >= this.walls.length) {
              this.selectedCorner = this.corners.pop()
            } else {
              this.selectedCorner = 'inner'
            }
            // Восстанавливаем значение следующей стены
            if (this.walls.length > 0) {
              this.inputs.nextWall = String(this.walls[this.walls.length - 1])
            }
            this.goToStep(STEPS.WALL_AND_CORNER)
          }
        } else if (this.currentStep === STEPS.DIAGONAL) {
          // Вернуться к последнему шагу добавления стены
          // Определяем, была ли комната замкнута
          if (this.walls.length >= 4) {
            // Комната была замкнута, возвращаемся к WALL_AND_CORNER
            // Но нужно восстановить состояние - удалить последнюю стену
            // Но это сложно, так как мы не знаем, была ли она добавлена
            // Просто возвращаемся к WALL_AND_CORNER
            this.goToStep(STEPS.WALL_AND_CORNER)
          } else {
            this.goToStep(STEPS.WALL_AND_CORNER)
          }
        } else if (this.currentStep === STEPS.FIXTURES) {
          // Вернуться к диагоналям
          this.goToStep(STEPS.DIAGONAL)
        } else if (this.currentStep === STEPS.RESULT) {
          // Вернуться к предыдущему шагу
          if (this.shouldAddDiagonal) {
            this.goToStep(STEPS.FIXTURES)
          } else {
            this.goToStep(STEPS.DIAGONAL)
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
          svgStore.drawFirstWallPreview(parseFloat(value))
        }
      }
    },

    handleFirstWallNext() {
      if (!this.firstWallValid) return

      // Сохраняем первую стену, но НЕ добавляем угол
      const value = parseFloat(this.inputs.firstWall)
      this.walls.push(value)

      // Сбрасываем выбор угла и переходим на выбор угла
      this.selectedCorner = null
      this.goToStep(STEPS.CORNER_SELECTION)
    },

    // Обработчик завершения выбора угла после первой стены
    handleCornerNext() {
      if (!this.selectedCorner) return

      // Если угол уже был добавлен (при возврате назад), заменяем его
      // Иначе просто добавляем новый
      if (this.corners.length > 0 && this.corners.length === this.walls.length) {
        // Заменяем последний угол
        this.corners[this.corners.length - 1] = this.selectedCorner
      } else if (this.corners.length < this.walls.length) {
        // Добавляем новый угол
        this.corners.push(this.selectedCorner)
      }

      // Увеличиваем stepIndex
      this.stepIndex = this.walls.length + 1

      // Сбросить ввод и выбор для следующего шага
      this.inputs.nextWall = '250'
      this.selectedCorner = null
      this.goToStep(STEPS.NEXT_WALL)
    },

    // Обработчики выбора угла
    handleCornerSelection(type) {
      this.selectedCorner = type
      const svgStore = useSvgRendererStore()

      // Для последующих шагов обновляем превью стены и угла
      // Если комната замкнется, не показывать угол в превью
      const nextWall = parseFloat(this.inputs.nextWall)
      if (nextWall) {
        const willBeClosed = isRoomClosed(this.walls, this.corners, nextWall, type)
        svgStore.drawWallAndCornerPreview(this.walls, this.corners, nextWall, willBeClosed ? null : type)
      } else {
        svgStore.drawCornerPreview(this.walls, this.corners, type)
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
          // Если комната замкнется с этой стеной, не показывать угол в превью
          const corner = this.selectedCorner || 'inner'
          const willBeClosed = isRoomClosed(this.walls, this.corners, parseFloat(value), corner)
          svgStore.drawWallAndCornerPreview(this.walls, this.corners, parseFloat(value), willBeClosed ? null : corner)
        }
      }
    },

    handleNextWallNext() {
      if (!this.nextWallValid) return

      const value = parseFloat(this.inputs.nextWall)

      // Проверяем, замкнется ли комната после добавления этой стены
      // Используем угол из corners, если он есть
      const corner = this.corners.length > 0 ? this.corners[this.corners.length - 1] : 'inner'
      const willBeClosed = isRoomClosed(this.walls, this.corners, value, corner)

      // Добавляем стену
      this.walls.push(value)

      // Увеличиваем stepIndex для прогресса
      this.stepIndex = this.walls.length

      // Сбрасываем для следующего цикла
      this.inputs.nextWall = '250'

      if (willBeClosed) {
        // Комната замкнулась - переходим к диагонали или результатам
        this.handleFinishRoom()
      } else {
        // Комната не замкнулась - переходим к выбору угла
        this.selectedCorner = null
        this.goToStep(STEPS.CORNER_SELECTION)
      }
    },

    handleWallAndCornerNext() {
      if (!this.nextWallValid) return

      const value = parseFloat(this.inputs.nextWall)

      // Если угол не выбран, используем внутренний по умолчанию
      const corner = this.selectedCorner || 'inner'

      // Проверяем, замкнется ли комната после добавления этой стены
      const willBeClosed = isRoomClosed(this.walls, this.corners, value, corner)

      // Если комната замкнется, угол не нужен
      if (willBeClosed) {
        // Добавить только стену (без угла, так как комната уже замкнута)
        this.walls.push(value)

        // Увеличить stepIndex для прогресса
        this.stepIndex = this.walls.length

        // Сбросить для следующего цикла (значения не нужны, так как переходим дальше)
        this.inputs.nextWall = '250'
        this.selectedCorner = 'inner'

        // Перейти к следующему шагу (диагонали или результатам)
        this.handleFinishRoom()
      } else {
        // Если комната не замкнется, нужен угол (используем дефолтный, если не выбран)
        // Добавить стену
        this.walls.push(value)
        
        // Если угол уже был добавлен (при возврате назад), заменяем его
        if (this.corners.length > 0 && this.corners.length === this.walls.length - 1) {
          this.corners[this.corners.length - 1] = corner
        } else if (this.corners.length < this.walls.length) {
          this.corners.push(corner)
        }

        // Увеличить stepIndex для прогресса
        this.stepIndex = this.walls.length

        // Сбросить для следующего цикла (с значениями по умолчанию)
        this.inputs.nextWall = '250'
        this.selectedCorner = 'inner'

        // Продолжить на том же шаге для следующей стены
        this.goToStep(STEPS.WALL_AND_CORNER)
      }
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
      
      // Проверка на дубликаты
      const isDuplicate = this.diagonals.some(d => 
        (d.from === this.selectedDiagonalFrom && d.to === this.selectedDiagonalTo) ||
        (d.from === this.selectedDiagonalTo && d.to === this.selectedDiagonalFrom)
      )
      
      if (isDuplicate) {
        alert('Эта диагональ уже добавлена!')
        return
      }
      
      this.diagonals.push({
        from: this.selectedDiagonalFrom,
        to: this.selectedDiagonalTo,
        length: value
      })

      // Сброс для следующей диагонали (но форма останется доступной)
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
      this.goToStep(STEPS.FIXTURES)
    },

    handleSkipDiagonal() {
      this.goToStep(STEPS.FIXTURES)
    },

    // Обработчики элементов
    // Сохранить текущие позиции из DOM перед перерисовкой
    saveCurrentFixturePositions() {
      const svgElement = document.querySelector('.preview-svg')
      if (!svgElement) return
      
      // Сохраняем позиции всех элементов из DOM
      const fixtureItems = svgElement.querySelectorAll('.fixture-item')
      fixtureItems.forEach((item) => {
        const type = item.dataset.type
        const id = parseFloat(item.dataset.id)
        const transform = item.getAttribute('transform')
        const match = transform?.match(/translate\(([^,]+),\s*([^)]+)\)/)
        if (match && type && !isNaN(id)) {
          const x = parseFloat(match[1])
          const y = parseFloat(match[2])
          if (!isNaN(x) && !isNaN(y)) {
            this.updateFixturePosition(type, id, x, y)
          }
        }
      })
    },

    handleFixtureCountInput(value) {
      // Сохраняем текущие позиции ПЕРЕД изменением
      this.saveCurrentFixturePositions()
      
      this.inputs.fixtureCount = value
      const count = parseInt(value) || 0
      const oldCount = this.fixtures.lights
      this.fixtures.lights = count
      
      // Обновить позиции: добавить новые или удалить лишние
      // ВАЖНО: сохраняем существующие позиции, только добавляем/удаляем
      if (count > oldCount) {
        // Добавить новые светильники со случайными позициями
        for (let i = oldCount; i < count; i++) {
          this.fixturePositions.lights.push({
            id: Date.now() + i + Math.random(),
            x: 50 + Math.random() * 200,
            y: 50 + Math.random() * 150
          })
        }
      } else if (count < oldCount) {
        // Удалить лишние (только последние)
        this.fixturePositions.lights = this.fixturePositions.lights.slice(0, count)
      }
      
      // Обновить SVG (позиции других элементов сохраняются, так как мы не трогаем их массивы)
      const svgStore = useSvgRendererStore()
      svgStore.drawFixturesPreview(this.walls, this.corners, this.fixturePositions)
    },

    handlePipeCountInput(value) {
      // Сохраняем текущие позиции ПЕРЕД изменением
      this.saveCurrentFixturePositions()
      
      this.inputs.pipeCount = value
      const count = parseInt(value) || 0
      const oldCount = this.fixtures.pipes
      this.fixtures.pipes = count
      
      // ВАЖНО: сохраняем существующие позиции других элементов
      // Мы изменяем только массив pipes, не трогая lights и other
      if (count > oldCount) {
        for (let i = oldCount; i < count; i++) {
          this.fixturePositions.pipes.push({
            id: Date.now() + i + Math.random(),
            x: 50 + Math.random() * 200,
            y: 50 + Math.random() * 150
          })
        }
      } else if (count < oldCount) {
        // Удалить лишние (только последние)
        this.fixturePositions.pipes = this.fixturePositions.pipes.slice(0, count)
      }
      
      // Обновить SVG (позиции других элементов сохраняются, так как мы не трогаем их массивы)
      const svgStore = useSvgRendererStore()
      svgStore.drawFixturesPreview(this.walls, this.corners, this.fixturePositions)
    },

    handleOtherCountInput(value) {
      // Сохраняем текущие позиции ПЕРЕД изменением
      this.saveCurrentFixturePositions()
      
      this.inputs.otherCount = value
      const count = parseInt(value) || 0
      const oldCount = this.fixtures.other
      this.fixtures.other = count
      
      // ВАЖНО: сохраняем существующие позиции других элементов
      // Мы изменяем только массив other, не трогая lights и pipes
      if (count > oldCount) {
        for (let i = oldCount; i < count; i++) {
          this.fixturePositions.other.push({
            id: Date.now() + i + Math.random(),
            x: 50 + Math.random() * 200,
            y: 50 + Math.random() * 150
          })
        }
      } else if (count < oldCount) {
        // Удалить лишние (только последние)
        this.fixturePositions.other = this.fixturePositions.other.slice(0, count)
      }
      
      // Обновить SVG (позиции других элементов сохраняются, так как мы не трогаем их массивы)
      const svgStore = useSvgRendererStore()
      svgStore.drawFixturesPreview(this.walls, this.corners, this.fixturePositions)
    },

    updateFixturePosition(type, id, x, y) {
      const positions = this.fixturePositions[type]
      if (!positions) return
      
      const index = positions.findIndex(p => p.id === id)
      if (index !== -1) {
        // Обновляем позицию напрямую в массиве (реактивно)
        positions[index] = {
          ...positions[index],
          x: x,
          y: y
        }
        // Не перерисовываем SVG здесь, чтобы избежать конфликтов
        // SVG обновится автоматически через watch в компоненте
      }
    },

    handleFinishFixtures() {
      this.calculateResultsAction()
      this.goToStep(STEPS.RESULT)
    },

    handleSkipFixtures() {
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
        this.selectedCorner = 'inner'
        this.selectedDiagonalFrom = null
        this.selectedDiagonalTo = null
        this.inputs.firstWall = '250'
        this.inputs.nextWall = '250'
        this.inputs.diagonal = ''
        this.inputs.fixtureCount = '0'
        this.inputs.pipeCount = '0'
        this.inputs.otherCount = '0'
        this.fixtures.lights = 0
        this.fixtures.pipes = 0
        this.fixtures.other = 0
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
