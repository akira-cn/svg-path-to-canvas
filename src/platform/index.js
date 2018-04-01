import pointInPath from './point-in-path'

const getPoints = require('point-at-length')

export function getPointAtLength(d, len) {
  const points = getPoints(d)
  return points.at(len)
}

export function getTotalLength(d) {
  const points = getPoints(d)
  return points.length()
}

export function isPointInPath({path}, x, y) {
  return pointInPath(path, x, y)
}
