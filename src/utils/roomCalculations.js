export function calculateBoundingBox(points, padding = 30) {
  if (points.length === 0) {
    return { minX: 0, minY: 0, maxX: 300, maxY: 200 }
  }

  let minX = Infinity
  let minY = Infinity
  let maxX = -Infinity
  let maxY = -Infinity

  points.forEach((point) => {
    if (!isNaN(point.x) && !isNaN(point.y)) {
      minX = Math.min(minX, point.x)
      minY = Math.min(minY, point.y)
      maxX = Math.max(maxX, point.x)
      maxY = Math.max(maxY, point.y)
    }
  })

  // Добавить padding
  minX -= padding
  minY -= padding
  maxX += padding
  maxY += padding

  return { minX, minY, maxX, maxY }
}

export function calculateRoomPointsForPreview(walls, corners) {
  if (walls.length === 0) return []

  const points = [{ x: 50, y: 100 }]
  let currentAngle = 0
  let currentX = 50
  let currentY = 100

  const maxWall = Math.max(...walls)
  const scale = Math.min(200 / maxWall, 0.8)

  for (let i = 0; i < walls.length; i++) {
    const wallLength = walls[i]

    if (!wallLength || wallLength <= 0 || isNaN(wallLength)) continue

    const scaledLength = wallLength * scale
    const deltaX = Math.cos(currentAngle) * scaledLength
    const deltaY = Math.sin(currentAngle) * scaledLength

    if (isNaN(deltaX) || isNaN(deltaY)) break

    currentX += deltaX
    currentY += deltaY

    if (isNaN(currentX) || isNaN(currentY)) break

    points.push({ x: currentX, y: currentY })

    if (i < corners.length) {
      // Человек ВНУТРИ комнаты движется по часовой стрелке (слева направо, угол 0°)
      // Внутренний угол (обычный угол комнаты) - поворот направо = вниз = +90° в SVG
      // Внешний угол (выступ/ниша) - поворот налево для обхода = вверх = -90° в SVG
      if (corners[i] === 'inner') {
        currentAngle += Math.PI / 2 // Поворот направо (вниз в SVG)
      } else if (corners[i] === 'outer') {
        currentAngle -= Math.PI / 2 // Поворот налево (вверх в SVG)
      }
      currentAngle = currentAngle % (2 * Math.PI)
    }
  }

  return points.filter((point) => {
    return !isNaN(point.x) && !isNaN(point.y) && isFinite(point.x) && isFinite(point.y)
  })
}

export function isRoomClosed(walls, corners, newWallLength = null, newCorner = null) {
  if (walls.length === 0) return false

  const testWalls = [...walls]
  const testCorners = [...corners]

  if (newWallLength !== null) {
    testWalls.push(newWallLength)
    if (newCorner !== null) {
      testCorners.push(newCorner)
    }
  }

  if (testWalls.length < 3) return false

  const points = calculateRoomPointsForPreview(testWalls, testCorners)

  if (points.length < 3) return false

  // Проверяем, замкнулась ли комната (последняя точка близка к первой)
  const firstPoint = points[0]
  const lastPoint = points[points.length - 1]

  const distance = Math.sqrt(
    Math.pow(lastPoint.x - firstPoint.x, 2) + Math.pow(lastPoint.y - firstPoint.y, 2)
  )

  // Комната считается замкнутой, если расстояние меньше 5 пикселей (с учетом масштаба)
  return distance < 5
}

export function calculateResults(walls) {
  const perimeter = walls.reduce((sum, wall) => sum + wall, 0)
  const perimeterMeters = (perimeter / 100).toFixed(2)

  let area
  if (walls.length === 3) {
    const [a, b, c] = walls
    const s = (a + b + c) / 2
    area = Math.sqrt(Math.max(0, s * (s - a) * (s - b) * (s - c)))
  } else if (walls.length === 4) {
    area = walls[0] * walls[1]
  } else {
    const avgWall = perimeter / walls.length
    area = (walls.length * avgWall * avgWall) / (4 * Math.tan(Math.PI / walls.length))
  }

  const areaMeters = (area / 10000).toFixed(2)

  return {
    perimeter: perimeterMeters,
    area: areaMeters
  }
}
