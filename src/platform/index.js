import pointInPath from './point-in-path';

const getPoints = require('point-at-length');

const cacheMap = new Map();

function get(d) {
  if(cacheMap.has(d)) {
    return cacheMap.get(d);
  }
  const points = getPoints(d);
  cacheMap.set(d, points);
  return points;
}

export function getPointAtLength(d, len) {
  const points = get(d);
  return points.at(len);
}

export function getTotalLength(d) {
  const points = get(d);
  return points.length();
}

export function isPointInPath({path}, x, y) {
  return pointInPath(path, x, y);
}
