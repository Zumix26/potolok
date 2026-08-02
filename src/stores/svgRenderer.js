import { defineStore } from 'pinia'
import { calculateRoomPointsForPreview, calculateBoundingBox } from '../utils/roomCalculations'

export const useSvgRendererStore = defineStore('svgRenderer', {
  state: () => ({
    svgCache: {
      'first-wall': { content: '', viewBox: '0 0 300 200' },
      'corner-selection': { content: '', viewBox: '0 0 300 200' },
      'next-wall': { content: '', viewBox: '0 0 300 200' },
      'diagonal': { content: '', viewBox: '0 0 300 200' },
      'fixtures': { content: '', viewBox: '0 0 300 200' },
      'result': { content: '', viewBox: '0 0 300 200' }
    }
  }),

  actions: {
    getSvgContent(stepName) {
      return this.svgCache[stepName]?.content || ''
    },

    getViewBox(stepName) {
      return this.svgCache[stepName]?.viewBox || '0 0 300 200'
    },

    drawFirstWallPreview(length = 250, showQuestionMark = false) {
      // Фиксированный размер канваса - увеличенная высота
      const canvasWidth = 300
      const canvasHeight = 280
      
      // Фиксированные координаты для размещения стены
      const startX = 30
      const startY = 50
      const availableWidth = 240 // Доступная ширина для стены
      
      // Вычисляем масштаб, чтобы стена поместилась в доступное пространство
      // Используем более крупный масштаб для лучшей видимости
      // Базовый масштаб: 1 см = 0.8 единицы SVG (для стены 250 см = 200 единиц)
      // Это даст хорошую видимость для типичных размеров стен
      const baseScale = 0.8 // 1 см = 0.8 единицы
      const minLength = 50
      const maxLength = 2000
      const normalizedLength = Math.max(minLength, Math.min(maxLength, length))
      
      // Масштабируем длину стены
      let wallLength = normalizedLength * baseScale
      
      // Если стена слишком длинная, уменьшаем масштаб чтобы поместилась
      if (wallLength > availableWidth) {
        const scale = availableWidth / normalizedLength
        wallLength = normalizedLength * scale
      }
      
      const endX = startX + wallLength
      const endY = startY

      const midX = (startX + endX) / 2

      let svg = `
        <svg viewBox="0 0 ${canvasWidth} ${canvasHeight}" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <marker id="arrow" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
              <polygon points="0 0, 8 3, 0 6" fill="#2563EB"/>
            </marker>
            <marker id="arrow-start" markerWidth="8" markerHeight="6" refX="1" refY="3" orient="auto">
              <polygon points="8 0, 0 3, 8 6" fill="#2563EB"/>
            </marker>
            <marker id="arrow-gray" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
              <polygon points="0 0, 8 3, 0 6" fill="#CBD5E1"/>
            </marker>
          </defs>

          <!-- Wall line with pulse animation -->
          <line x1="${startX}" y1="${startY}" x2="${endX}" y2="${endY}"
                stroke="#2563EB" stroke-width="6" stroke-linecap="round">
            <animate attributeName="opacity" values="1;0.5;1" dur="1.5s" repeatCount="indefinite"/>
          </line>

          <!-- Corner dots -->
          <circle cx="${startX}" cy="${startY}" r="8" fill="#2563EB"/>
          <circle cx="${endX}" cy="${endY}" r="8" fill="#2563EB"/>

          <!-- Corner labels -->
          <text x="${startX}" y="${startY - 15}" text-anchor="middle"
                font-size="16" font-weight="800" fill="#2563EB">A</text>
          <text x="${endX}" y="${endY - 15}" text-anchor="middle"
                font-size="16" font-weight="800" fill="#2563EB">B</text>

          <!-- Measurement arrows -->
          <line x1="${startX + 10}" y1="${startY + 15}" x2="${endX - 10}" y2="${endY + 15}"
                stroke="#2563EB" stroke-width="2"
                marker-end="url(#arrow)" marker-start="url(#arrow-start)"/>

          <!-- Dimension label -->
          <rect x="${midX - 35}" y="${startY + 3}" width="70" height="28"
                rx="6" fill="white"/>
          <text x="${midX}" y="${startY + 22}" text-anchor="middle"
                font-size="20" font-weight="800" fill="#2563EB">${showQuestionMark ? '?' : (length && length > 0 ? length + ' см' : '?')}</text>

          <!-- You are here - centered on the wall but at distance from it -->
          <!-- Wall is horizontal, so place circle below the wall -->
            <!-- Thick short arrow pointing to the wall (upward) -->
          <line x1="${midX}" y1="${startY + 31}" x2="${midX}" y2="${startY + 30}"
                stroke="#2563EB" stroke-width="3" marker-end="url(#arrow)"/>
          <circle cx="${midX}" cy="${startY + 55}" r="12" fill="#2563EB"/>
          <text x="${midX}" y="${startY + 59}" text-anchor="middle"
                font-size="14" fill="white">👤</text>
          <text x="${midX}" y="${startY + 75}" text-anchor="middle"
                font-size="12" font-weight="700" fill="#64748B">Вы здесь</text>
        

        
        </svg>
      `

      this.svgCache['first-wall'] = { content: svg, viewBox: `0 0 ${canvasWidth} ${canvasHeight}` }
      return svg
    },

    drawCornerPreview(walls, corners, cornerType = null) {
      if (walls.length === 0) {
        const svg = '<text x="150" y="100" text-anchor="middle" class="room-label">Сначала добавьте стену</text>'
        this.svgCache['corner-selection'] = { content: svg, viewBox: '0 0 300 200' }
        return svg
      }

      try {
        let html = ''
        let allPoints = []

        if (walls.length === 1) {
          const wallLength = walls[0]
          const scale = Math.min(200 / wallLength, 0.8)
          const scaledLength = wallLength * scale
          const startX = 50
          const startY = 100
          const endX = startX + scaledLength
          const endY = startY

          allPoints.push({ x: startX, y: startY }, { x: endX, y: endY })

          html += `
            <line x1="${startX}" y1="${startY}" x2="${endX}" y2="${endY}" class="room-wall"/>
            <circle cx="${startX}" cy="${startY}" r="6" class="room-corner"/>
            <circle cx="${endX}" cy="${endY}" r="6" class="room-corner active"/>
            <text x="${startX}" y="${startY + 20}" class="room-label">A</text>
            <text x="${endX}" y="${endY + 20}" class="room-label">B</text>
            <text x="${startX + scaledLength/2}" y="${startY - 15}" class="room-dimension">${wallLength} см</text>
          `

          if (cornerType) {
            let nextX, nextY
            const previewLength = 60

            // Человек ВНУТРИ комнаты движется слева направо (горизонтально)
            // Поворот направо = вниз (+Y), поворот налево = вверх (-Y)
            if (cornerType === 'inner') {
              nextX = endX
              nextY = endY + previewLength  // Поворот направо (вниз)
            } else {
              nextX = endX
              nextY = endY - previewLength  // Поворот налево (вверх)
            }

            allPoints.push({ x: nextX, y: nextY })

            html += `
              <line x1="${endX}" y1="${endY}" x2="${nextX}" y2="${nextY}"
                    stroke="#FF8C00" stroke-width="3" stroke-dasharray="5,3"/>
              <circle cx="${nextX}" cy="${nextY}" r="6" class="room-corner next"/>
              <text x="${nextX + 15}" y="${nextY + 5}" class="room-label" fill="#FF8C00">C?</text>
              <path d="M ${endX - 20} ${endY} A 20 20 0 0 ${cornerType === 'inner' ? '0' : '1'} ${endX} ${endY + (cornerType === 'inner' ? 20 : -20)}"
                    stroke="${cornerType === 'inner' ? '#10B981' : '#F59E0B'}"
                    stroke-width="3" fill="none" stroke-dasharray="3,2"/>
              <text x="${endX + 25}" y="${endY + (cornerType === 'inner' ? 15 : -5)}" class="room-dimension"
                    fill="${cornerType === 'inner' ? '#10B981' : '#F59E0B'}" font-weight="700">
                ${cornerType === 'inner' ? '90°' : '270°'}
              </text>
            `
          }

          const { minX, minY, maxX, maxY } = calculateBoundingBox(allPoints, 50)
          const width = maxX - minX
          const height = maxY - minY
          const viewBox = `${minX} ${minY} ${width} ${height}`

          this.svgCache['corner-selection'] = { content: html, viewBox }
          return html
        }

        const points = calculateRoomPointsForPreview(walls, corners)

        if (points.length === 0) {
          const svg = '<text x="150" y="100" text-anchor="middle" class="room-label">Ошибка расчета</text>'
          this.svgCache['corner-selection'] = { content: svg, viewBox: '0 0 300 200' }
          return svg
        }

        allPoints = [...points]

        for (let i = 0; i < points.length - 1; i++) {
          const p1 = points[i]
          const p2 = points[i + 1]

          if (isNaN(p1.x) || isNaN(p1.y) || isNaN(p2.x) || isNaN(p2.y)) continue

          html += `<line x1="${p1.x}" y1="${p1.y}" x2="${p2.x}" y2="${p2.y}" class="room-wall"/>`


          const midX = (p1.x + p2.x) / 2
          const midY = (p1.y + p2.y) / 2
          const offsetY = i % 2 === 0 ? -15 : 20

          if (!isNaN(midX) && !isNaN(midY)) {
            html += `<text x="${midX}" y="${midY + offsetY}" class="room-dimension">${walls[i]}</text>`
          }
        }

        points.forEach((point, i) => {
          if (isNaN(point.x) || isNaN(point.y)) return
          const isLast = i === points.length - 1
          html += `
            <circle cx="${point.x}" cy="${point.y}" r="6" class="room-corner ${isLast ? 'active' : ''}"/>
            <text x="${point.x}" y="${point.y + (i % 2 === 0 ? 20 : -10)}" class="room-label">
              ${String.fromCharCode(65 + i)}
            </text>
          `
        })

        if (cornerType && points.length >= 2) {
          const lastPoint = points[points.length - 1]
          const secondLastPoint = points[points.length - 2]

          if (!isNaN(lastPoint.x) && !isNaN(lastPoint.y) && !isNaN(secondLastPoint.x) && !isNaN(secondLastPoint.y)) {
            const dx = lastPoint.x - secondLastPoint.x
            const dy = lastPoint.y - secondLastPoint.y
            const currentAngle = Math.atan2(dy, dx)

            let nextAngle
            // Человек ВНУТРИ комнаты, поворот направо = +90° в SVG (вниз)
            if (cornerType === 'inner') {
              nextAngle = currentAngle + Math.PI / 2  // Поворот направо (вниз)
            } else {
              nextAngle = currentAngle - Math.PI / 2  // Поворот налево (вверх)
            }

            const previewLength = 60
            const nextX = lastPoint.x + Math.cos(nextAngle) * previewLength
            const nextY = lastPoint.y + Math.sin(nextAngle) * previewLength

            if (!isNaN(nextX) && !isNaN(nextY)) {
              allPoints.push({ x: nextX, y: nextY })

              html += `
                <line x1="${lastPoint.x}" y1="${lastPoint.y}" x2="${nextX}" y2="${nextY}"
                      class="room-wall" stroke-width="6"/>
              `
            }
          }
        }

        const { minX, minY, maxX, maxY } = calculateBoundingBox(allPoints, 50)
        const width = maxX - minX
        const height = maxY - minY
        const viewBox = `${minX} ${minY} ${width} ${height}`

        this.svgCache['corner-selection'] = { content: html, viewBox }
        return html
      } catch (error) {
        console.error('Error drawing corner preview:', error)
        const svg = '<text x="150" y="100" text-anchor="middle" class="room-label">Ошибка отображения</text>'
        this.svgCache['corner-selection'] = { content: svg, viewBox: '0 0 300 200' }
        return svg
      }
    },

    drawWallAndCornerPreview(walls, corners, newLength = null, selectedCorner = null) {
      const testWalls = [...walls]
      const testCorners = [...corners]
      if (newLength) testWalls.push(newLength)

      // Логика отображения предпросмотра угла:
      // - Если стена нарисована (newLength !== null) И угол НЕ выбран (selectedCorner === null) → НЕ показывать угол
      // - Если стена НЕ нарисована (newLength === null) И угол НЕ выбран → показать последний угол из массива
      // - Если угол выбран (selectedCorner !== null) → показать selectedCorner
      let displayCorner = null
      if (newLength && !selectedCorner) {
        // Стена нарисована, но угол не выбран → не показывать предпросмотр
        displayCorner = null
      } else if (!selectedCorner && corners.length > 0) {
        // Стена не нарисована, показать последний выбранный угол
        displayCorner = corners[corners.length - 1]
      } else {
        // Угол выбран
        displayCorner = selectedCorner
      }

      const points = calculateRoomPointsForPreview(testWalls, testCorners)
      let allPoints = [...points]
      let html = ''

      for (let i = 0; i < points.length - 1; i++) {
        const p1 = points[i]
        const p2 = points[i + 1]
        
        // Определяем, является ли эта стена редактируемой (последняя добавленная)
        const isEditing = i === walls.length && newLength !== null

        // Стена всегда синяя, не меняем её визуально
        html += `
          <line x1="${p1.x}" y1="${p1.y}" x2="${p2.x}" y2="${p2.y}"
                stroke="#0066FF"
                stroke-width="3"/>
        `


        const midX = (p1.x + p2.x) / 2
        const midY = (p1.y + p2.y) / 2
        const length = i < walls.length ? walls[i] : newLength

        if (length) {
          // Круг с размером - если редактируется, выделяем его
          const circleColor = isEditing ? '#10B981' : '#0066FF'
          const circleStrokeWidth = isEditing ? '3' : '2'
          html += `
            <circle cx="${midX}" cy="${midY}" r="12" fill="white" stroke="${circleColor}" stroke-width="${circleStrokeWidth}"/>
            <text x="${midX}" y="${midY + 3}" class="room-dimension" fill="${circleColor}">${length}</text>
          `
          
          // Добавляем индикатор редактирования рядом с размером
          if (isEditing) {
            const dx = p2.x - p1.x
            const dy = p2.y - p1.y
            const len = Math.sqrt(dx*dx + dy*dy) || 1
            const perpX = -dy / len
            const perpY = dx / len
            const indicatorX = midX + perpX * 25
            const indicatorY = midY + perpY * 25
            
            html += `
              <circle cx="${indicatorX}" cy="${indicatorY}" r="8" fill="#10B981" opacity="0.9">
                <animate attributeName="opacity" values="0.9;0.5;0.9" dur="1.5s" repeatCount="indefinite"/>
              </circle>
              <text x="${indicatorX}" y="${indicatorY + 3}" text-anchor="middle" font-size="10" fill="white" font-weight="700">✎</text>
            `
          }
        }
      }

      // Проверяем, замкнута ли комната (последняя точка близка к первой)
      const isClosed = points.length > 2 && 
        Math.sqrt(Math.pow(points[points.length - 1].x - points[0].x, 2) + 
                  Math.pow(points[points.length - 1].y - points[0].y, 2)) < 5
      
      // Показываем точки, но если комната замкнута, не показываем последнюю (она совпадает с первой)
      const pointsToShow = isClosed ? points.slice(0, -1) : points
      
      pointsToShow.forEach((point, i) => {
        const isActive = !isClosed && i === points.length - 1
        html += `
          <circle cx="${point.x}" cy="${point.y}" r="6"
                  class="room-corner ${isActive ? 'active' : ''}"/>
          <text x="${point.x + (i % 2 === 0 ? 10 : -10)}" y="${point.y + (i % 2 === 0 ? -10 : 20)}" class="room-label">
            ${String.fromCharCode(65 + i)}
          </text>
        `
      })

      // Показать предпросмотр выбранного угла
      if (displayCorner && points.length >= 2) {
        const lastPoint = points[points.length - 1]
        const secondLastPoint = points[points.length - 2]

        if (!isNaN(lastPoint.x) && !isNaN(lastPoint.y) && !isNaN(secondLastPoint.x) && !isNaN(secondLastPoint.y)) {
          const dx = lastPoint.x - secondLastPoint.x
          const dy = lastPoint.y - secondLastPoint.y
          const currentAngle = Math.atan2(dy, dx)

          let nextAngle
          if (displayCorner === 'inner') {
            nextAngle = currentAngle + Math.PI / 2  // Поворот направо
          } else {
            nextAngle = currentAngle - Math.PI / 2  // Поворот налево
          }

          const previewLength = 30
          const nextX = lastPoint.x + Math.cos(nextAngle) * previewLength
          const nextY = lastPoint.y + Math.sin(nextAngle) * previewLength

          if (!isNaN(nextX) && !isNaN(nextY)) {
            allPoints.push({ x: nextX, y: nextY })

            html += `
              <line x1="${lastPoint.x}" y1="${lastPoint.y}" x2="${nextX}" y2="${nextY}"
                    stroke="#0066FF"
                    stroke-width="3"/>
            `
          }
        }
      }

      // Добавляем "Вы здесь" по центру редактируемой стены, но на расстоянии от неё
      if (newLength && points.length >= 2) {
        const editingWallIndex = walls.length
        if (editingWallIndex < points.length - 1) {
          const p1 = points[editingWallIndex]
          const p2 = points[editingWallIndex + 1]
          const wallMidX = (p1.x + p2.x) / 2
          const wallMidY = (p1.y + p2.y) / 2
          
          // Вычисляем нормаль к стене (перпендикуляр) для размещения кружка
          const dx = p2.x - p1.x
          const dy = p2.y - p1.y
          const length = Math.sqrt(dx * dx + dy * dy) || 1
          const perpX = -dy / length  // Перпендикулярный вектор
          const perpY = dx / length
          
          // Размещаем кружок на расстоянии 50 единиц от стены по нормали
          const distance = 50
          const circleX = wallMidX + perpX * distance
          const circleY = wallMidY + perpY * distance
          
          // Короткая толстая стрелка от кружка к стене (в обратном направлении нормали)
          const arrowLength = 15  // Короткая стрелка
          const arrowStartX = circleX - perpX * 8
          const arrowStartY = circleY - perpY * 8
          const arrowEndX = circleX - perpX * (8 + arrowLength)
          const arrowEndY = circleY - perpY * (8 + arrowLength)
          
          html += `
            <defs>
              <marker id="arrow-you-here-wac" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
                <polygon points="0 0, 8 3, 0 6" fill="#2563EB" opacity="0.6"/>
              </marker>
            </defs>
            <circle cx="${circleX}" cy="${circleY}" r="12" fill="#2563EB"/>
            <text x="${circleX}" y="${circleY + 4}" text-anchor="middle"
                  font-size="14" fill="white">👤</text>
            <text x="${circleX}" y="${circleY + 25}" text-anchor="middle"
                  font-size="12" font-weight="700" fill="#64748B">Вы здесь</text>
            <line x1="${arrowStartX}" y1="${arrowStartY}" x2="${arrowEndX}" y2="${arrowEndY}"
                  stroke="#2563EB" stroke-width="3" marker-end="url(#arrow-you-here-wac)" opacity="0.6"/>
          `
        }
      }

      const { minX, minY, maxX, maxY } = calculateBoundingBox(allPoints, 50)
      const width = maxX - minX
      const height = maxY - minY
      const viewBox = `${minX} ${minY} ${width} ${height}`

      this.svgCache['wall-and-corner-old'] = { content: html, viewBox }
      return html
    },

    drawNextWallPreview(walls, corners, newLength = null, selectedCorner = null) {
      const testWalls = [...walls]
      const testCorners = [...corners]
      if (newLength) testWalls.push(newLength)

      const points = calculateRoomPointsForPreview(testWalls, testCorners)
      let allPoints = [...points]
      let html = ''

      for (let i = 0; i < points.length - 1; i++) {
        const p1 = points[i]
        const p2 = points[i + 1]
        const isLastWall = i === points.length - 2

        // Подсветка последней стены
        if (isLastWall && newLength) {
          html += `
            <line x1="${p1.x}" y1="${p1.y}" x2="${p2.x}" y2="${p2.y}"
                  stroke="#2563EB"
                  stroke-width="6" stroke-linecap="round">
              <animate attributeName="opacity" values="1;0.5;1" dur="1.5s" repeatCount="indefinite"/>
            </line>
          `
        } else {
          html += `
            <line x1="${p1.x}" y1="${p1.y}" x2="${p2.x}" y2="${p2.y}"
                  stroke="#94A3B8"
                  stroke-width="3"/>
          `
        }

        const midX = (p1.x + p2.x) / 2
        const midY = (p1.y + p2.y) / 2
        const length = i < walls.length ? walls[i] : newLength

        if (length) {
          const labelColor = isLastWall && newLength ? '#2563EB' : '#64748B'
          html += `
            <rect x="${midX - 20}" y="${midY - 12}" width="40" height="24"
                  rx="4" fill="white" stroke="${labelColor}" stroke-width="2"/>
            <text x="${midX}" y="${midY + 4}" text-anchor="middle"
                  font-size="14" font-weight="700" fill="${labelColor}">${length}</text>
          `
        }
      }

      // Проверяем, замкнута ли комната (последняя точка близка к первой)
      const isClosed = points.length > 2 && 
        Math.sqrt(Math.pow(points[points.length - 1].x - points[0].x, 2) + 
                  Math.pow(points[points.length - 1].y - points[0].y, 2)) < 5
      
      // Показываем точки, но если комната замкнута, не показываем последнюю (она совпадает с первой)
      const pointsToShow = isClosed ? points.slice(0, -1) : points
      
      pointsToShow.forEach((point, i) => {
        const isActive = !isClosed && i === points.length - 1
        html += `
          <circle cx="${point.x}" cy="${point.y}" r="6"
                  class="room-corner ${isActive ? 'active' : ''}"/>
          <text x="${point.x + (i % 2 === 0 ? 10 : -10)}" y="${point.y + (i % 2 === 0 ? -10 : 20)}" class="room-label">
            ${String.fromCharCode(65 + i)}
          </text>
        `
      })

      // Показать предпросмотр последнего выбранного угла
      if (selectedCorner && points.length >= 2) {
        const lastPoint = points[points.length - 1]
        const secondLastPoint = points[points.length - 2]

        if (!isNaN(lastPoint.x) && !isNaN(lastPoint.y) && !isNaN(secondLastPoint.x) && !isNaN(secondLastPoint.y)) {
          const dx = lastPoint.x - secondLastPoint.x
          const dy = lastPoint.y - secondLastPoint.y
          const currentAngle = Math.atan2(dy, dx)

          let nextAngle
          if (selectedCorner === 'inner') {
            nextAngle = currentAngle + Math.PI / 2  // Поворот направо
          } else {
            nextAngle = currentAngle - Math.PI / 2  // Поворот налево
          }

          const previewLength = 60
          const nextX = lastPoint.x + Math.cos(nextAngle) * previewLength
          const nextY = lastPoint.y + Math.sin(nextAngle) * previewLength

          if (!isNaN(nextX) && !isNaN(nextY)) {
            allPoints.push({ x: nextX, y: nextY })

            html += `
              <line x1="${lastPoint.x}" y1="${lastPoint.y}" x2="${nextX}" y2="${nextY}"
                    stroke="#10B981" stroke-width="3" stroke-dasharray="5,3" opacity="0.6"/>
              <circle cx="${nextX}" cy="${nextY}" r="6" fill="#10B981" opacity="0.6"/>
            `
          }
        }
      }

      // Добавляем "Вы здесь" по центру редактируемой стены, но на расстоянии от неё
      if (newLength && points.length >= 2) {
        const lastWallIndex = points.length - 2
        const p1 = points[lastWallIndex]
        const p2 = points[lastWallIndex + 1]
        const wallMidX = (p1.x + p2.x) / 2
        const wallMidY = (p1.y + p2.y) / 2
        
        // Вычисляем нормаль к стене (перпендикуляр) для размещения кружка
        const dx = p2.x - p1.x
        const dy = p2.y - p1.y
        const length = Math.sqrt(dx * dx + dy * dy) || 1
        const perpX = -dy / length  // Перпендикулярный вектор
        const perpY = dx / length
        
        // Размещаем кружок на расстоянии 50 единиц от стены по нормали
        const distance = 50
        const circleX = wallMidX + perpX * distance
        const circleY = wallMidY + perpY * distance
        
        // Короткая толстая стрелка от кружка к стене (в обратном направлении нормали)
        const arrowLength = 15  // Короткая стрелка
        const arrowStartX = circleX - perpX * 8
        const arrowStartY = circleY - perpY * 8
        const arrowEndX = circleX - perpX * (8 + arrowLength)
        const arrowEndY = circleY - perpY * (8 + arrowLength)
        
        html += `
        
         <line x1="${arrowStartX}" y1="${arrowStartY}" x2="${arrowEndX}" y2="${arrowEndY}"
                stroke="#2563EB" stroke-width="3" marker-end="url(#arrow-you-here)" />
          <defs>
            <marker id="arrow-you-here" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
              <polygon points="0 0, 8 3, 0 6" fill="#2563EB"/>
            </marker>
          </defs>
          <circle cx="${circleX}" cy="${circleY}" r="12" fill="#2563EB"/>
          <text x="${circleX}" y="${circleY + 4}" text-anchor="middle"
                font-size="14" fill="white">👤</text>
          <text x="${circleX}" y="${circleY + 25}" text-anchor="middle"
                font-size="12" font-weight="700" fill="#64748B">Вы здесь</text>
        
        `
      }

      const { minX, minY, maxX, maxY } = calculateBoundingBox(allPoints, 50)
      const width = maxX - minX
      const height = maxY - minY
      const viewBox = `${minX} ${minY} ${width} ${height}`

      this.svgCache['next-wall'] = { content: html, viewBox }
      return html
    },

    drawDiagonalPreview(walls, corners, fromIndex = null, toIndex = null, diagonalLength = null, existingDiagonals = []) {
      const points = calculateRoomPointsForPreview(walls, corners)
      let html = ''

      for (let i = 0; i < points.length; i++) {
        const p1 = points[i]
        const p2 = points[(i + 1) % points.length]
        html += `<line x1="${p1.x}" y1="${p1.y}" x2="${p2.x}" y2="${p2.y}" class="room-wall"/>`

      }

      // Рисуем все существующие диагонали
      existingDiagonals.forEach((diagonal) => {
        if (points.length > diagonal.from && points.length > diagonal.to) {
          const from = points[diagonal.from]
          const to = points[diagonal.to]

          html += `
            <line x1="${from.x}" y1="${from.y}" x2="${to.x}" y2="${to.y}"
                  stroke="#10B981" stroke-width="2" stroke-dasharray="6 4" fill="none"/>
          `

          const midX = (from.x + to.x) / 2
          const midY = (from.y + to.y) / 2
          html += `
            <rect x="${midX - 25}" y="${midY - 10}" width="50" height="20"
                  fill="white" stroke="#10B981" stroke-width="2" rx="6"/>
            <text x="${midX}" y="${midY + 4}" class="room-dimension" fill="#10B981" font-weight="700">${diagonal.length}</text>
          `
        }
      })

      // Рисуем текущую выбираемую диагональ (если выбраны оба угла)
      if (fromIndex !== null && toIndex !== null && points.length > fromIndex && points.length > toIndex) {
        const from = points[fromIndex]
        const to = points[toIndex]

        html += `
          <line x1="${from.x}" y1="${from.y}" x2="${to.x}" y2="${to.y}"
                class="diagonal-line"/>
          <circle cx="${from.x}" cy="${from.y}" r="8" fill="#FF8C00" stroke="white" stroke-width="2"/>
          <circle cx="${to.x}" cy="${to.y}" r="8" fill="#FF8C00" stroke="white" stroke-width="2"/>
        `

        if (diagonalLength) {
          const midX = (from.x + to.x) / 2
          const midY = (from.y + to.y) / 2
          html += `
            <rect x="${midX - 25}" y="${midY - 10}" width="50" height="20"
                  fill="white" stroke="#FF8C00" stroke-width="2" rx="6"/>
            <text x="${midX}" y="${midY + 4}" class="room-dimension" fill="#FF8C00" font-weight="700">${diagonalLength}</text>
          `
        }
      }

      // Проверяем, замкнута ли комната (последняя точка близка к первой)
      const isClosed = points.length > 2 && 
        Math.sqrt(Math.pow(points[points.length - 1].x - points[0].x, 2) + 
                  Math.pow(points[points.length - 1].y - points[0].y, 2)) < 5
      
      // Показываем точки, но если комната замкнута, не показываем последнюю (она совпадает с первой)
      const pointsToShow = isClosed ? points.slice(0, -1) : points
      
      pointsToShow.forEach((point, i) => {
        const isDiagonalPoint = i === fromIndex || i === toIndex
        html += `
          <circle cx="${point.x}" cy="${point.y}" r="8"
                  fill="${isDiagonalPoint ? '#FF8C00' : 'white'}"
                  stroke="${isDiagonalPoint ? 'white' : '#0066FF'}" stroke-width="3"
                  class="corner-point" data-corner-index="${i}"
                  style="cursor: pointer;"/>
          <text x="${point.x + 12}" y="${point.y - 12}" class="room-label" style="pointer-events: none;">
            ${String.fromCharCode(65 + i)}
          </text>
        `
      })

      const { minX, minY, maxX, maxY } = calculateBoundingBox(points, 50)
      const width = maxX - minX
      const height = maxY - minY
      const viewBox = `${minX} ${minY} ${width} ${height}`

      this.svgCache['diagonal'] = { content: html, viewBox }
      return html
    },

    drawResultPreview(walls, corners, fixturePositions = { lights: [], pipes: [], other: [] }) {
      const points = calculateRoomPointsForPreview(walls, corners)
      if (points.length < 3) {
        this.svgCache['result'] = { content: '', viewBox: '0 0 300 200' }
        return ''
      }

      let html = ''
      const pointsStr = points.map(p => `${p.x},${p.y}`).join(' ')
      html += `<polygon points="${pointsStr}" fill="rgba(0, 102, 255, 0.1)" stroke="#0066FF" stroke-width="3"/>`
      
      // Рисуем светильники
      fixturePositions.lights.forEach((light) => {
        html += `
          <g transform="translate(${light.x}, ${light.y})">
            <circle r="10" fill="#FFD700" stroke="white" stroke-width="2"/>
            <circle r="6" fill="none" stroke="white" stroke-width="1.5" opacity="0.8"/>
            <line x1="-4" y1="0" x2="4" y2="0" stroke="white" stroke-width="1.5"/>
            <line x1="0" y1="-4" x2="0" y2="4" stroke="white" stroke-width="1.5"/>
          </g>
        `
      })

      // Рисуем трубы
      fixturePositions.pipes.forEach((pipe) => {
        html += `
          <g transform="translate(${pipe.x}, ${pipe.y})">
            <rect x="-8" y="-8" width="16" height="16" fill="#8B4513" stroke="white" stroke-width="2" rx="2"/>
            <line x1="-5" y1="0" x2="5" y2="0" stroke="white" stroke-width="1.5"/>
            <line x1="0" y1="-5" x2="0" y2="5" stroke="white" stroke-width="1.5"/>
          </g>
        `
      })

      // Рисуем другие элементы
      fixturePositions.other.forEach((other) => {
        html += `
          <g transform="translate(${other.x}, ${other.y})">
            <rect x="-7" y="-7" width="14" height="14" fill="#808080" stroke="white" stroke-width="2" rx="2"/>
            <line x1="-4" y1="-4" x2="4" y2="4" stroke="white" stroke-width="1.5"/>
            <line x1="4" y1="-4" x2="-4" y2="4" stroke="white" stroke-width="1.5"/>
          </g>
        `
      })


      walls.forEach((length, i) => {
        if (i < points.length) {
          const p1 = points[i]
          const p2 = points[(i + 1) % points.length]
          const midX = (p1.x + p2.x) / 2
          const midY = (p1.y + p2.y) / 2
          const dx = p2.y - p1.y
          const dy = p1.x - p2.x
          const len = Math.sqrt(dx*dx + dy*dy) || 1
          const offsetX = (dx / len) * 15
          const offsetY = (dy / len) * 15

          html += `
            <rect x="${midX + offsetX - 20}" y="${midY + offsetY - 8}" width="40" height="16"
                  fill="white" stroke="#0066FF" stroke-width="1" rx="4"/>
            <text x="${midX + offsetX}" y="${midY + offsetY + 3}" class="room-dimension">${length}</text>
          `
        }
      })

      // Проверяем, замкнута ли комната (последняя точка близка к первой)
      const isClosed = points.length > 2 && 
        Math.sqrt(Math.pow(points[points.length - 1].x - points[0].x, 2) + 
                  Math.pow(points[points.length - 1].y - points[0].y, 2)) < 5
      
      // Показываем точки, но если комната замкнута, не показываем последнюю (она совпадает с первой)
      const pointsToShow = isClosed ? points.slice(0, -1) : points
      
      pointsToShow.forEach((point, i) => {
        html += `
          <circle cx="${point.x}" cy="${point.y}" r="4" fill="white" stroke="#0066FF" stroke-width="2"/>
          <text x="${point.x + 10}" y="${point.y - 10}" class="room-label">
            ${String.fromCharCode(65 + i)}
          </text>
        `
      })

      const { minX, minY, maxX, maxY } = calculateBoundingBox(points, 50)
      const width = maxX - minX
      const height = maxY - minY
      const viewBox = `${minX} ${minY} ${width} ${height}`

      this.svgCache['result'] = { content: html, viewBox }
      return html
    },

    drawFixturesPreview(walls, corners, fixturePositions = { lights: [], pipes: [], other: [] }) {
      const points = calculateRoomPointsForPreview(walls, corners)
      let html = ''

      // Рисуем стены комнаты
      for (let i = 0; i < points.length; i++) {
        const p1 = points[i]
        const p2 = points[(i + 1) % points.length]
        html += `<line x1="${p1.x}" y1="${p1.y}" x2="${p2.x}" y2="${p2.y}" class="room-wall"/>`

      }

      // Рисуем светильники (используем актуальные позиции из store)
      const lights = fixturePositions.lights || []
      lights.forEach((light) => {
        if (light && typeof light.x === 'number' && typeof light.y === 'number') {
          html += `
            <g class="fixture-item" data-type="lights" data-id="${light.id}" transform="translate(${light.x}, ${light.y})" style="cursor: move;">
              <circle r="10" fill="#FFD700" stroke="white" stroke-width="2"/>
              <circle r="6" fill="none" stroke="white" stroke-width="1.5" opacity="0.8"/>
              <line x1="-4" y1="0" x2="4" y2="0" stroke="white" stroke-width="1.5"/>
              <line x1="0" y1="-4" x2="0" y2="4" stroke="white" stroke-width="1.5"/>
            </g>
          `
        }
      })

      // Рисуем трубы (используем актуальные позиции из store)
      const pipes = fixturePositions.pipes || []
      pipes.forEach((pipe) => {
        if (pipe && typeof pipe.x === 'number' && typeof pipe.y === 'number') {
          html += `
            <g class="fixture-item" data-type="pipes" data-id="${pipe.id}" transform="translate(${pipe.x}, ${pipe.y})" style="cursor: move;">
              <rect x="-8" y="-8" width="16" height="16" fill="#8B4513" stroke="white" stroke-width="2" rx="2"/>
              <line x1="-5" y1="0" x2="5" y2="0" stroke="white" stroke-width="1.5"/>
              <line x1="0" y1="-5" x2="0" y2="5" stroke="white" stroke-width="1.5"/>
            </g>
          `
        }
      })

      // Рисуем другие элементы (используем актуальные позиции из store)
      const other = fixturePositions.other || []
      other.forEach((item) => {
        if (item && typeof item.x === 'number' && typeof item.y === 'number') {
          html += `
            <g class="fixture-item" data-type="other" data-id="${item.id}" transform="translate(${item.x}, ${item.y})" style="cursor: move;">
              <rect x="-7" y="-7" width="14" height="14" fill="#808080" stroke="white" stroke-width="2" rx="2"/>
              <line x1="-4" y1="-4" x2="4" y2="4" stroke="white" stroke-width="1.5"/>
              <line x1="4" y1="-4" x2="-4" y2="4" stroke="white" stroke-width="1.5"/>
            </g>
          `
        }
      })

      // Рисуем углы комнаты
      const isClosed = points.length > 2 && 
        Math.sqrt(Math.pow(points[points.length - 1].x - points[0].x, 2) + 
                  Math.pow(points[points.length - 1].y - points[0].y, 2)) < 5
      const pointsToShow = isClosed ? points.slice(0, -1) : points
      
      pointsToShow.forEach((point, i) => {
        html += `
          <circle cx="${point.x}" cy="${point.y}" r="4" fill="white" stroke="#0066FF" stroke-width="2"/>
          <text x="${point.x + 10}" y="${point.y - 10}" class="room-label">
            ${String.fromCharCode(65 + i)}
          </text>
        `
      })

      const { minX, minY, maxX, maxY } = calculateBoundingBox(points, 50)
      const width = maxX - minX
      const height = maxY - minY
      const viewBox = `${minX} ${minY} ${width} ${height}`

      this.svgCache['fixtures'] = { content: html, viewBox }
      return html
    }
  }
})
