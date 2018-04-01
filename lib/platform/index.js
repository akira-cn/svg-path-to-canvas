'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _map = require('babel-runtime/core-js/map');

var _map2 = _interopRequireDefault(_map);

exports.getPointAtLength = getPointAtLength;
exports.getTotalLength = getTotalLength;
exports.isPointInPath = isPointInPath;

var _pointInPath = require('./point-in-path');

var _pointInPath2 = _interopRequireDefault(_pointInPath);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var getPoints = require('point-at-length');

var cacheMap = new _map2.default();

function get(d) {
  if (cacheMap.has(d)) {
    return cacheMap.get(d);
  }
  var points = getPoints(d);
  cacheMap.set(d, points);
  return points;
}

function getPointAtLength(d, len) {
  var points = get(d);
  return points.at(len);
}

function getTotalLength(d) {
  var points = get(d);
  return points.length();
}

function isPointInPath(_ref, x, y) {
  var path = _ref.path;

  return (0, _pointInPath2.default)(path, x, y);
}