import arcToBezier from 'svg-arc-to-cubic-bezier'
import getBounds from './path-bounds'
const {parseSVG, makeAbsolute} = require('svg-path-parser')

export function pathToCanvas (d) {
  const commands = makeAbsolute(parseSVG(d))
  const parsedCommands = []
  commands.forEach((command) => {
    if (command.code === 'A') {
      const {x0, y0, x, y, rx, ry, xAxisRotation, largeArc, sweep} = command
      const curves = arcToBezier({
        px: x0,
        py: y0,
        cx: x,
        cy: y,
        rx,
        ry,
        xAxisRotation,
        largeArcFlag: largeArc,
        sweepFlag: sweep
      }).map(curve => {
        const {x1, y1, x2, y2, x, y} = curve
        return Object.assign({
          x1: Math.round(x1),
          y1: Math.round(y1),
          x2: Math.round(x2),
          y2: Math.round(y2),
          x: Math.round(x),
          y: Math.round(y)}, {code: 'c', command: 'curveto'})
      })
      parsedCommands.push(...curves)
    } else {
      parsedCommands.push(command)
    }
  })
  let footprint = [0, 0]
  let prev = null
  const canvasCommands = []
  for (let i = 0; i < parsedCommands.length; i++) {
    const cmd = parsedCommands[i]
    if (cmd.code !== 'c') {
      const {x0, y0} = cmd
      if (footprint[0] !== x0 || footprint[1] !== y0) {
        canvasCommands.push({cmd: 'moveTo', args: [x0, y0]})
      }
    }
    if (cmd.code === 'M') {
      const {x, y} = cmd
      footprint = [x, y]
      canvasCommands.push({cmd: 'moveTo', args: [x, y]})
    } else if (cmd.code === 'L') {
      const {x, y} = cmd
      footprint = [x, y]
      canvasCommands.push({cmd: 'lineTo', args: [x, y]})
    } else if (cmd.code === 'V') {
      const {y} = cmd
      footprint = [footprint[0], y]
      canvasCommands.push({cmd: 'lineTo', args: [...footprint]})
    } else if (cmd.code === 'H') {
      const {x} = cmd
      footprint = [x, footprint[1]]
      canvasCommands.push({cmd: 'lineTo', args: [...footprint]})
    } else if (cmd.code === 'C' || cmd.code === 'c') {
      const {x1, y1, x2, y2, x, y} = cmd
      footprint = [x, y]
      prev = [x1, y1]
      canvasCommands.push({cmd: 'bezierCurveTo', args: [x1, y1, x2, y2, x, y]})
    } else if (cmd.code === 'S') {
      const {x2, y2, x, y} = cmd
      footprint = [x, y]
      canvasCommands.push({cmd: 'bezierCurveTo', args: [...prev, x2, y2, x, y]})
    } else if (cmd.code === 'Q') {
      const {x1, y1, x, y} = cmd
      footprint = [x, y]
      prev = [x1, y1]
      canvasCommands.push({cmd: 'quadraticCurveTo', args: [x1, y1, x, y]})
    } else if (cmd.code === 'T') {
      const {x, y} = cmd
      footprint = [x, y]
      canvasCommands.push({cmd: 'quadraticCurveTo', args: [...prev, x, y]})
    } else if (cmd.code === 'Z') {
      canvasCommands.push({cmd: 'closePath', args: []})
    }
  }
  return {commands: canvasCommands, d: d}
}

export {getBounds}
