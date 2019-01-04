'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getPointAtLength = getPointAtLength;
exports.getTotalLength = getTotalLength;
exports.isPointInPath = isPointInPath;
exports.isPointInStroke = isPointInStroke;
function createSvgPath(d) {
  var path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  path.setAttribute('d', d);
  return path;
}

function getPointAtLength(d, len) {
  var path = createSvgPath(d);

  var _path$getPointAtLengt = path.getPointAtLength(len),
      x = _path$getPointAtLengt.x,
      y = _path$getPointAtLengt.y;

  return [x, y];
}

function getTotalLength(d, len) {
  var path = createSvgPath(d);
  return path.getTotalLength(len);
}

var context = null;
function isPointInPath(_ref, x, y) {
  var d = _ref.d;

  if (!context) context = document.createElement('canvas').getContext('2d');
  var path = new Path2D(d);
  return context.isPointInPath(path, x, y);
}

function isPointInStroke(_ref2, x, y, _ref3) {
  var d = _ref2.d;
  var _ref3$lineWidth = _ref3.lineWidth,
      lineWidth = _ref3$lineWidth === undefined ? 1 : _ref3$lineWidth,
      _ref3$lineCap = _ref3.lineCap,
      lineCap = _ref3$lineCap === undefined ? 'butt' : _ref3$lineCap,
      _ref3$lineJoin = _ref3.lineJoin,
      lineJoin = _ref3$lineJoin === undefined ? 'miter' : _ref3$lineJoin;

  if (!context) context = document.createElement('canvas').getContext('2d');
  context.save();
  context.lineWidth = lineWidth;
  context.lineCap = lineCap;
  context.lineJoin = lineJoin;
  var path = new Path2D(d);
  var ret = context.isPointInStroke(path, x, y);
  context.restore();
  return ret;
}