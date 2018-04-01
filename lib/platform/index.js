'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getPointAtLength = getPointAtLength;
exports.getTotalLength = getTotalLength;
exports.isPointInPath = isPointInPath;

var _pointInPath = require('./point-in-path');

var _pointInPath2 = _interopRequireDefault(_pointInPath);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var getPoints = require('point-at-length');

function getPointAtLength(d, len) {
  var points = getPoints(d);
  return points.at(len);
}

function getTotalLength(d) {
  var points = getPoints(d);
  return points.length();
}

function isPointInPath(_ref, x, y) {
  var path = _ref.path;

  return (0, _pointInPath2.default)(path, x, y);
}