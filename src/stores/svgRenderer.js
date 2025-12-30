import { defineStore } from 'pinia'
import { calculateRoomPointsForPreview, calculateBoundingBox } from '../utils/roomCalculations'

export const useSvgRendererStore = defineStore('svgRenderer', {
  state: () => ({
    svgCache: {
      'first-wall': { content: '', viewBox: '0 0 300 200' },
      'wall-and-corner': { content: '', viewBox: '0 0 300 200' },
      'diagonal': { content: '', viewBox: '0 0 300 200' },
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

    drawFirstWallPreview(length = 250, selectedCorner = null) {
      const scale = Math.min(200 / Math.max(length, 250), 1)
      const wallLength = length * scale

      const startX = 50
      const startY = 100
      const endX = startX + wallLength
      const endY = startY

      let allPoints = [
        { x: startX, y: startY },
        { x: endX, y: endY }
      ]

      let svg = `
        <g>
          <line x1="${startX}" y1="${startY}" x2="${endX}" y2="${endY}"
                class="room-wall" stroke-width="6"/>
          <rect x="${startX + wallLength * 0.3}" y="94" width="${wallLength * 0.2}" height="12"
                fill="white" stroke="#0066FF" stroke-width="2" rx="2"/>
          <circle cx="${startX}" cy="${startY}" r="6" class="room-corner"/>
          <circle cx="${endX}" cy="${endY}" r="6" class="room-corner active"/>
          <text x="${startX}" y="125" class="room-label">A</text>
          <text x="${endX}" y="125" class="room-label">B</text>
          <text x="${startX + wallLength/2}" y="85" class="room-dimension">${length} см</text>
          <text x="${startX + wallLength * 0.4}" y="115" class="room-dimension">дверь</text>
      `

      // Показать предпросмотр выбранного угла
      if (selectedCorner) {
        const previewLength = 30
        let nextX, nextY

        if (selectedCorner === 'inner') {
          nextX = endX
          nextY = endY + previewLength  // Поворот направо (вниз)
        } else {
          nextX = endX
          nextY = endY - previewLength  // Поворот налево (вверх)
        }

        allPoints.push({ x: nextX, y: nextY })

        svg += `
          <line x1="${endX}" y1="${endY}" x2="${nextX}" y2="${nextY}"
                class="room-wall" stroke-width="6"/>
        `
      }

      svg += `</g>`

      const { minX, minY, maxX, maxY } = calculateBoundingBox(allPoints, 50)
      const width = maxX - minX
      const height = maxY - minY
      const viewBox = `${minX} ${minY} ${width} ${height}`

      this.svgCache['first-wall'] = { content: svg, viewBox }
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
            <rect x="${startX + scaledLength * 0.3}" y="${startY - 6}" width="${scaledLength * 0.2}" height="12"
                  fill="white" stroke="#0066FF" stroke-width="2" rx="2"/>
            <text x="${startX + scaledLength * 0.4}" y="${startY + 15}" class="room-dimension" font-size="8">дверь</text>
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

          if (i === 0 && p2.x > p1.x) {
            const doorStart = p1.x + (p2.x - p1.x) * 0.3
            const doorWidth = (p2.x - p1.x) * 0.2
            html += `
              <rect x="${doorStart}" y="${p1.y - 6}" width="${doorWidth}" height="12"
                    fill="white" stroke="#0066FF" stroke-width="2" rx="2"/>
              <text x="${doorStart + doorWidth/2}" y="${p1.y + 15}" class="room-dimension" font-size="8">дверь</text>
            `
          }

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
        const isNew = i === walls.length

        html += `
          <line x1="${p1.x}" y1="${p1.y}" x2="${p2.x}" y2="${p2.y}"
                stroke="${isNew ? '#FF8C00' : '#0066FF'}"
                stroke-width="${isNew ? '4' : '3'}"
                stroke-dasharray="${isNew ? '6,4' : 'none'}"/>
        `

        if (i === 0) {
          const doorStart = p1.x + (p2.x - p1.x) * 0.3
          const doorWidth = (p2.x - p1.x) * 0.2
          html += `
            <rect x="${doorStart}" y="${p1.y - 6}" width="${doorWidth}" height="12"
                  fill="white" stroke="#0066FF" stroke-width="2" rx="2"/>
          `
        }

        const midX = (p1.x + p2.x) / 2
        const midY = (p1.y + p2.y) / 2
        const length = i < walls.length ? walls[i] : newLength

        if (length) {
          html += `
            <circle cx="${midX}" cy="${midY}" r="12" fill="white" stroke="${isNew ? '#FF8C00' : '#0066FF'}" stroke-width="2"/>
            <text x="${midX}" y="${midY + 3}" class="room-dimension" fill="${isNew ? '#FF8C00' : '#0066FF'}">${length}</text>
          `
        }
      }

      points.forEach((point, i) => {
        const isActive = i === points.length - 1
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
                    class="room-wall" stroke-width="6"/>
            `
          }
        }
      }

      const { minX, minY, maxX, maxY } = calculateBoundingBox(allPoints, 50)
      const width = maxX - minX
      const height = maxY - minY
      const viewBox = `${minX} ${minY} ${width} ${height}`

      this.svgCache['wall-and-corner'] = { content: html, viewBox }
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
        const isNew = i === walls.length

        html += `
          <line x1="${p1.x}" y1="${p1.y}" x2="${p2.x}" y2="${p2.y}"
                stroke="${isNew ? '#FF8C00' : '#0066FF'}"
                stroke-width="${isNew ? '4' : '3'}"
                stroke-dasharray="${isNew ? '6,4' : 'none'}"/>
        `

        if (i === 0) {
          const doorStart = p1.x + (p2.x - p1.x) * 0.3
          const doorWidth = (p2.x - p1.x) * 0.2
          html += `
            <rect x="${doorStart}" y="${p1.y - 6}" width="${doorWidth}" height="12"
                  fill="white" stroke="#0066FF" stroke-width="2" rx="2"/>
          `
        }

        const midX = (p1.x + p2.x) / 2
        const midY = (p1.y + p2.y) / 2
        const length = i < walls.length ? walls[i] : newLength

        if (length) {
          html += `
            <circle cx="${midX}" cy="${midY}" r="12" fill="white" stroke="${isNew ? '#FF8C00' : '#0066FF'}" stroke-width="2"/>
            <text x="${midX}" y="${midY + 3}" class="room-dimension" fill="${isNew ? '#FF8C00' : '#0066FF'}">${length}</text>
          `
        }
      }

      points.forEach((point, i) => {
        const isActive = i === points.length - 1
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

        if (i === 0) {
          const doorStart = p1.x + (p2.x - p1.x) * 0.3
          const doorWidth = (p2.x - p1.x) * 0.2
          html += `
            <rect x="${doorStart}" y="${p1.y - 6}" width="${doorWidth}" height="12"
                  fill="white" stroke="#0066FF" stroke-width="2" rx="2"/>
          `
        }
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

      points.forEach((point, i) => {
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

    drawResultPreview(walls, corners) {
      const points = calculateRoomPointsForPreview(walls, corners)
      if (points.length < 3) {
        this.svgCache['result'] = { content: '', viewBox: '0 0 300 200' }
        return ''
      }

      let html = ''
      const pointsStr = points.map(p => `${p.x},${p.y}`).join(' ')
      html += `<polygon points="${pointsStr}" fill="rgba(0, 102, 255, 0.1)" stroke="#0066FF" stroke-width="3"/>`

      if (points.length >= 2) {
        const p1 = points[0]
        const p2 = points[1]
        const doorStart = p1.x + (p2.x - p1.x) * 0.3
        const doorWidth = (p2.x - p1.x) * 0.2
        html += `
          <rect x="${doorStart}" y="${p1.y - 6}" width="${doorWidth}" height="12"
                fill="white" stroke="#0066FF" stroke-width="2" rx="2"/>
        `
      }

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

      points.forEach((point, i) => {
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
    }
  }
})
