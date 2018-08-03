function createSvgPath(d) {
  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  path.setAttribute('d', d);
  return path;
}

export function getPointAtLength(d, len) {
  const path = createSvgPath(d);
  const {x, y} = path.getPointAtLength(len);
  return [x, y];
}

export function getTotalLength(d, len) {
  const path = createSvgPath(d);
  return path.getTotalLength(len);
}

export function isPointInPath({d}, x, y) {
  const path = new Path2D(d);
  const context = document.createElement('canvas').getContext('2d');
  return context.isPointInPath(path, x, y);
}
