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

let context = null;
export function isPointInPath({d}, x, y) {
  if(!context) context = document.createElement('canvas').getContext('2d');
  const path = new Path2D(d);
  return context.isPointInPath(path, x, y);
}

export function isPointInStroke({d}, x, y, {lineWidth = 1, lineCap = 'butt', lineJoin = 'miter'}) {
  if(!context) context = document.createElement('canvas').getContext('2d');
  if(context.isPointInStroke) {
    context.save();
    context.lineWidth = lineWidth;
    context.lineCap = lineCap;
    context.lineJoin = lineJoin;
    const path = new Path2D(d);
    const ret = context.isPointInStroke(path, x, y);
    context.restore();
    return ret;
  }
}
