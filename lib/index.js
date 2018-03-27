'use strict';

var _toConsumableArray2 = require('babel-runtime/helpers/toConsumableArray');

var _toConsumableArray3 = _interopRequireDefault(_toConsumableArray2);

var _assign = require('babel-runtime/core-js/object/assign');

var _assign2 = _interopRequireDefault(_assign);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var arcToBezier = require('svg-arc-to-cubic-bezier');

var _require = require('svg-path-parser'),
    parseSVG = _require.parseSVG,
    makeAbsolute = _require.makeAbsolute;

module.exports = function (d) {
  var commands = makeAbsolute(parseSVG(d));
  var parsedCommands = [];
  commands.forEach(function (command) {
    if (command.code === 'A') {
      var x0 = command.x0,
          y0 = command.y0,
          x = command.x,
          y = command.y,
          rx = command.rx,
          ry = command.ry,
          xAxisRotation = command.xAxisRotation,
          largeArc = command.largeArc,
          sweep = command.sweep;

      var curves = arcToBezier({
        px: x0,
        py: y0,
        cx: x,
        cy: y,
        rx: rx,
        ry: ry,
        xAxisRotation: xAxisRotation,
        largeArcFlag: largeArc,
        sweepFlag: sweep
      }).map(function (curve) {
        var x1 = curve.x1,
            y1 = curve.y1,
            x2 = curve.x2,
            y2 = curve.y2,
            x = curve.x,
            y = curve.y;

        return (0, _assign2.default)({
          x1: Math.round(x1),
          y1: Math.round(y1),
          x2: Math.round(x2),
          y2: Math.round(y2),
          x: Math.round(x),
          y: Math.round(y) }, { code: 'c', command: 'curveto' });
      });
      parsedCommands.push.apply(parsedCommands, (0, _toConsumableArray3.default)(curves));
    } else {
      parsedCommands.push(command);
    }
  });
  var footprint = [0, 0];
  var prev = null;
  var canvasCommands = [];
  for (var i = 0; i < parsedCommands.length; i++) {
    var cmd = parsedCommands[i];
    if (cmd.code !== 'c') {
      var x0 = cmd.x0,
          y0 = cmd.y0;

      if (footprint[0] !== x0 || footprint[1] !== y0) {
        canvasCommands.push({ cmd: 'moveTo', args: [x0, y0] });
      }
    }
    if (cmd.code === 'M') {
      var x = cmd.x,
          y = cmd.y;

      footprint = [x, y];
      canvasCommands.push({ cmd: 'moveTo', args: [x, y] });
    } else if (cmd.code === 'L') {
      var _x = cmd.x,
          _y = cmd.y;

      footprint = [_x, _y];
      canvasCommands.push({ cmd: 'lineTo', args: [_x, _y] });
    } else if (cmd.code === 'V') {
      var _y2 = cmd.y;

      footprint = [footprint[0], _y2];
      canvasCommands.push({ cmd: 'lineTo', args: [].concat((0, _toConsumableArray3.default)(footprint)) });
    } else if (cmd.code === 'H') {
      var _x2 = cmd.x;

      footprint = [_x2, footprint[1]];
      canvasCommands.push({ cmd: 'lineTo', args: [].concat((0, _toConsumableArray3.default)(footprint)) });
    } else if (cmd.code === 'C' || cmd.code === 'c') {
      var x1 = cmd.x1,
          y1 = cmd.y1,
          x2 = cmd.x2,
          y2 = cmd.y2,
          _x3 = cmd.x,
          _y3 = cmd.y;

      footprint = [_x3, _y3];
      prev = [x1, y1];
      canvasCommands.push({ cmd: 'bezierCurveTo', args: [x1, y1, x2, y2, _x3, _y3] });
    } else if (cmd.code === 'S') {
      var _x4 = cmd.x2,
          _y4 = cmd.y2,
          _x5 = cmd.x,
          _y5 = cmd.y;

      footprint = [_x5, _y5];
      canvasCommands.push({ cmd: 'bezierCurveTo', args: [].concat((0, _toConsumableArray3.default)(prev), [_x4, _y4, _x5, _y5]) });
    } else if (cmd.code === 'Q') {
      var _x6 = cmd.x1,
          _y6 = cmd.y1,
          _x7 = cmd.x,
          _y7 = cmd.y;

      footprint = [_x7, _y7];
      prev = [_x6, _y6];
      canvasCommands.push({ cmd: 'quadraticCurveTo', args: [_x6, _y6, _x7, _y7] });
    } else if (cmd.code === 'T') {
      var _x8 = cmd.x,
          _y8 = cmd.y;

      footprint = [_x8, _y8];
      canvasCommands.push({ cmd: 'quadraticCurveTo', args: [].concat((0, _toConsumableArray3.default)(prev), [_x8, _y8]) });
    } else if (cmd.code === 'Z') {
      var _x9 = cmd.x,
          _y9 = cmd.y;

      canvasCommands.push({ cmd: 'lineTo', args: [_x9, _y9] });
    }
  }
  return canvasCommands;
};